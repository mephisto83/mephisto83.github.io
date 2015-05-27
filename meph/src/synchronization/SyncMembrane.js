MEPH.define('MEPH.synchronization.SyncMembrane', {
    requires: ['MEPH.synchronization.SyncObject',
            'MEPH.util.Observable',
            'MEPH.synchronization.SyncConflictNegotiator',
            'MEPH.synchronization.util.InstanceObject'],
    'extends': [],
    properties: {
        monitoredObject: null,
        renewalInterval: 10000,
        negotiator: null,
        lastEvents: null
    },
    initialize: function (options) {
        var me = this;
        MEPH.Events(me);
        MEPH.synchronization.util.InstanceObject.instify(me);
        me.instanceObj();
        Object.defineProperty(me, 'Id', {
            get: function () {
                return me.jsyncId();
            }
        })
        me.lastEvents = [];

        me.eventManagers = MEPH.util.Observable.observable([]);
        me.eventManagers.on('onpush', me.onAddEventManagers.bind(me))
        me.eventManagers.on('changed', me.onEventManagerChange.bind(me));
        me.monitoredObject = MEPH.util.Observable.observable([]).on('onpush', me.onAddMonitoredObject.bind(me));
        me.deletedEvents = MEPH.util.Observable.observable([]);
        me.monitoredEvents = MEPH.util.Observable.observable([]);
        me.monitoredEvents.on('onpush', me.onLastEventChanged.bind(me))
        me.monitoredEvents.on('onpush', me.onEventAdded.bind(me))
        me.monitoredEvents.on('onpush', me.evaluateEvents.bind(me))
        me.monitoredEvents.on('onpush', me.checkForConflicts.bind(me));
        me.jsyncObjects = MEPH.util.Observable.observable([]);
        me.on('manager-death', me.onManagerDeath.bind(me));
        me.on('missing-event', me.onMissingEvent.bind(me));
    },
    checkForConflicts: function () {
        var me = this;
        var conflict = me.causesConflict();
        if (conflict) {
            me.fire('conflict-detected', { conflictingEvents: conflict });
        }
    },
    hasEvent: function (id) {
        var me = this;
        return me.monitoredEvents.some(function (x) { return x.id === id; })
        || me.deletedEvents.some(function (x) { return x.id === id; });
    },
    setNegotiator: function (negotiator) {
        var me = this;
        me.negotiator = negotiator;
        me.negotiator.setManager(me);
        me.negotiator.on('conflict-resolved', me.checkForConflicts.bind(me));
    },
    createSyncObject: function () {
        var me = this;
        var jsyncobject = new SyncObject();
        jsyncobject.on('created-object', me.onObjectCreation.bind(me));
        jsyncobject.on('pause', function () {
            me._pause(MEPH.synchronization.SyncObject.context);
        });
        jsyncobject.on('start', function () {
            me._start(MEPH.synchronization.SyncObject.context);
        });
        me.jsyncObjects.push(jsyncobject);
        return jsyncobject;
    },
    createMonitoredObject: function (obj) {
        var me = this,
            jsyncobject = me.getJSyncObject();
        jsyncobject.applyRemotedObj(obj);
        me.monitoredObject.push(obj)
    },
    getEventManagers: function () {
        var me = this;
        return me.eventManagers;
    },
    getJSyncObject: function () {
        var me = this;
        var jsyncobject = me.jsyncObjects.first() || me.createSyncObject();
        return jsyncobject;
    },
    onObjectCreation: function (type, options) {
        var me = this;
        me.addEvent(options, options.value);
        me.monitor(options.value);
        me.fire('object-created', options);
    },
    monitor: function (obj) {
        var me = this;
        me.monitoredObject.push(obj);
    },
    onManagerDeath: function (type, options) {
        var me = this;
        me.eventManagers.removeWhere(function (x) {
            return x.Id === options.id;
        });
    },
    onMissingEvent: function (type, options) {
        var me = this;
        me.sendMessage({
            id: MEPH.GUID(),
            EventManagerId: me.Id,
            type: 'missing-event',
            information: options
        });
    },
    onAddEventManagers: function (type, reference) {
        var me = this;
        me.heartBeat();
    },
    onEventManagerChange: function (type, args) {
        var me = this;
        me.fire('roll-call-change', args);
    },
    onAddMonitoredObject: function (type, args) {
        var me = this, objects = args.added;

        (objects).foreach(function (obj) {
            obj.on('created', function (type, options) {
                options.type = 'created-object';
                me.addEvent(options, obj);
            }, me, MEPH.synchronization.SyncObject.context);
            obj.on('altered', function (type, options) {
                options.type = 'altered';
                if (Array.isArray(options.value)) {
                    options.arrayid = options.value.jsyncId();
                }
                me.addEvent(options, obj);
            }, me, MEPH.synchronization.SyncObject.context);
            obj.on('array_altered', function (type, options) {
                options.type = 'array_altered';
                me.addEvent(options, obj);
            }, me, MEPH.synchronization.SyncObject.context);
        });
    },
    receive: function (message) {
        var me = this;
        switch (message.type) {
            case 'heartbeat':
                me.manageHeartBeats(message);
                break;
            case 'events':
                me.handleReceivedEvents(message);
                break;
            case 'conflict':
                me.negotiator.receive(message);
                break;
            case 'missing-event':
                me.handleEventRequest(message);
                break;
        }
    },
    handleEventRequest: function (message) {
        var me = this,
            evnt;
        evnt = me.getEvent(message.information.evnt);

        if (evnt) {
            me.sendMessage({
                id: MEPH.GUID(),
                EventManagerId: me.Id,
                type: 'events',
                events: [evnt]
            });
        }
    },
    manageHeartBeats: function (message) {
        var me = this;

        var eventmanager = me.eventManagers.first(function (x) { return x.Id === message.EventManagerId });
        if (eventmanager) {
            me.renew(eventmanager);
        }
        else {
            var reference = me.createManagerReference(message);
            me.eventManagers.push(reference);
        }
    },
    createManagerReference: function (message) {
        var me = this;
        var reference = {
            Id: message.EventManagerId,
            death: me.getManagerDeathTimeout(message.EventManagerId)
        };

        return reference;
    },
    getManagerDeathTimeout: function (id) {
        var me = this;
        return setTimeout(function (id) {
            me.fire('manager-death', { id: id });
        }.bind(me, id), me.renewalInterval)
    },
    renew: function (eventmanager) {
        var me = this;
        clearTimeout(eventmanager.death);
        eventmanager.death = me.getManagerDeathTimeout(eventmanager.Id);
    },
    sendMessage: function (message) {
        var me = this;
        if (me.channel) {
            me.channel(message);
        }
    },
    heartBeat: function () {
        var me = this;
        me.sendMessage({
            id: MEPH.GUID(),
            EventManagerId: me.Id,
            type: 'heartbeat'
        })
    },
    getEvents: function () {
        var me = this;
        return me.monitoredEvents;
    },
    getEvent: function (id) {
        var me = this;
        return me.getEvents().first(function (x) { return x.id === id; });
    },
    getLastEvent: function (objId, property) {
        var me = this;
        var result = me.lastEvents.last(function (x) {
            if (property) {
                return x.objId === objId && x.evnt.property === property;
            }
            return x.objId === objId;
        }) || me.lastEvents.last(function (x) {
            return x.objId === objId;
        });;

        return result;
    },
    removeEvents: function (evnts) {
        var me = this;
        evnts.chain.foreach(function (x) { me.removeEvent(x); });
    },
    removeEvent: function (evnt) {
        var me = this;
        me.monitoredEvents.removeWhere(function (x) { return x.id === evnt.id; })
                    .foreach(function (evnt) {
                        me.deletedEvents.push(evnt);
                    });
        me.monitoredEvents.foreach(function (x) {
            if (x.childEvents) {
                x.childEvents.removeWhere(function (y) { return y === evnt.id; });
            }
        });
    },
    addEvent: function (options, obj, args) {
        var me = this;
        args = args || { local: true, executed: true };
        var lastevnt;
        if (args.parentEventId) {
            var evt = me.getEvent(args.parentEventId);
            lastevnt = evt || { id: args.parentEventId };
            if (!evt) {
                me.fire('missing-event', { evnt: args.parentEventId });
            }
        }
        else {
            lastevnt = me.getLastEvent(obj.jsyncId(), options.property);
            if (lastevnt && !lastevnt.executed) {
                lastevnt = null;
            }
        }
        var id = args.id || MEPH.GUID();
        if (lastevnt) {
            lastevnt.childEvents = lastevnt.childEvents || [];
            lastevnt.childEvents.push(id);
        }

        me.monitoredEvents.push({
            evnt: options,
            local: args.local,
            executed: args.executed,
            objId: obj ? obj.jsyncId() : args.objId,
            id: id,
            parentEventId: lastevnt ? lastevnt.id : (args.parentEventId || null)
        });
    },
    getEventChain: function (id) {
        var me = this,
            evnts = me.getEvent(id),
            toexplore = [],
            result = [];

        toexplore.push(evnts);
        do {
            evnts = toexplore.shift()
            result.push(evnts);
            if (evnts.childEvents) {
                evnts.childEvents.foreach(function (x) {
                    var temp = me.getEvent(x);
                    if (temp && !toexplore.contains(function (y) { return y === temp; })) {
                        toexplore.push(temp);
                    }
                    //else if (!temp) {
                    //}
                });
            }
        } while (toexplore.length > 0);
        //while (evnts.childEvents && evnts.childEvents.length === 1);
        return result;
    },
    evaluateEvents: function () {
        var me = this,
            unexecutedEvents,
            executedsomething = false;
        do {
            executedsomething = false;
            unexecutedEvents = me.monitoredEvents.where(function (evnt) {
                return !evnt.executed;
            });
            var eventToExecute = unexecutedEvents.first(function (x) {
                return me.canExecute(x);
            });
            executedsomething = me.evaluateEvent(eventToExecute);
        }
        while (executedsomething);
    },
    evaluateEvent: function (eventToExecute) {
        var me = this,
            executedsomething = false,
            jsyncobject = me.getJSyncObject();
        if (eventToExecute) {
            switch (eventToExecute.evnt.type) {
                case 'created-object':
                    eventToExecute.executed = true;
                    executedsomething = true;
                    break;
                default:
                    var object = me.getMonitoredObject(eventToExecute.objId);
                    var value = eventToExecute.evnt.value;
                    if (me.isObject(value)) {
                        MEPH.synchronization.util.InstanceObject.instify(value);
                    }
                    if (eventToExecute.evnt.added) {
                        eventToExecute.evnt.addedValues = eventToExecute.evnt.added
                                                            .where(function (x) {
                                                                return !x.isObject;
                                                            })
                                                            .select(function (x) {
                                                                return x;
                                                            });
                        eventToExecute.evnt.addedObjects = eventToExecute.evnt.added
                                .where(function (x) {
                                    return x.isObject;
                                })
                                .select(function (x) {
                                    return me.getMonitoredObject(x.added);
                                });
                    }
                    else {
                        eventToExecute.evnt.addedValues = [];
                        eventToExecute.evnt.addedObjects = [];
                    }
                    if (eventToExecute.evnt.removed && eventToExecute.evnt.removed.removed) {
                        eventToExecute.evnt.removedValues = eventToExecute.evnt.removed.removedValues;
                        eventToExecute.evnt.removedObjects = eventToExecute.evnt.removed.removed
                            .where(function (x) {
                                return x.isObject;
                            }).select(function (x) {
                                return me.getMonitoredObject(x.removed)
                            });
                        eventToExecute.evnt.removed.removedObjects = eventToExecute.evnt.removedObjects;
                    }
                    else {
                        eventToExecute.evnt.removedValues = [];
                        eventToExecute.evnt.removedObjects = [];
                    }
                    if (Array.isArray(value)) {

                        value.instanceObj(null, eventToExecute.evnt.arrayid);
                        value = me.getMonitoredObject(value.instanceObj())
                    }
                    if (value && value.jsyncId && value.jsyncId()) {
                        var id = value.jsyncId();
                        eventToExecute.evnt.value = me.getMonitoredObject(id);
                    }
                    eventToExecute.executed = jsyncobject.applyEvent(object, eventToExecute.evnt);
                    if (eventToExecute.executed) {
                        executedsomething = true;
                    }
                    break;
            }
        }
        return executedsomething;
    },
    canExecute: function (evnt) {
        var me = this;
        if (evnt.parentEventId) {
            var parentevent = me.monitoredEvents.first(function (x) {
                return x.id === (evnt.parentEventId);
            });
            return parentevent ? parentevent.executed : false;
        }
        else {
            return true;
        }
    },
    causesConflict: function () {
        var me = this,
            results = [],
            conflictingitems = me.monitoredEvents.groupBy(function (x) {
                return x.parentEventId;
            });
        for (var i in conflictingitems) {
            if (conflictingitems[i].length > 1) {
                var potentialItems = conflictingitems[i].where(function (x) {
                    return !Array.isArray(me.getMonitoredObject(x.objId));
                });
                if (potentialItems.length > 1 && potentialItems.unique(function (x) {
                    return x.objId;
                }).length === 1) {
                    results.push({
                        evntId: i,
                        events: conflictingitems[i]
                    });
                }
            }
        }
        return results.length === 0 ? false : results;
    },
    sendConflictMessage: function (args, to) {
        var me = this;
        me.sendMessage({
            id: MEPH.GUID(),
            to: to,
            EventManagerId: me.Id,
            type: 'conflict',
            message: args
        });
    },
    onLastEventChanged: function (type, args) {
        var me = this;
        args.added.foreach(function (arg) {
            var property = arg.evnt.property;
            var objId = arg.objId;
            me.lastEvents.removeWhere(function (x) {
                if (property) {
                    return x.objId === objId && x.evnt.property === property;
                }
                return false;
            });
            me.lastEvents.push(arg);
        });
    },
    onEventAdded: function (type, args) {
        var me = this;
        if (!me.stopped) {
            me.sendMessage({
                id: MEPH.GUID(),
                EventManagerId: me.Id,
                type: 'events',
                events: MEPHArray.convert(args.added)
            });
        }
    },
    stop: function () {
        var me = this;
        me.stopped = true;
    },
    start: function () {
        var me = this;
        me.stopped = false;
    },
    getMonitoredObject: function (id) {
        var me = this;
        return me.monitoredObject.first(function (x) { return x.jsyncId() === id });
    },
    isObject: function (obj) {
        if (typeof (obj) === 'object') {
            if (!(obj instanceof Date)) {
                return true;
            }
        }
        return false;
    },
    handleReceivedEvents: function (options) {
        var me = this,
            obj,
            unexecutedevents,
            objId = options.objId,
            events = options.events;
        me.stop();
        unexecutedevents = events.where(function (x) {
            return !me.monitoredEvents.contains(function (y) { return y.id == x.id; })
        });
        unexecutedevents.foreach(function (_event) {
            switch (_event.evnt.type) {
                case 'created-object':
                    MEPH.synchronization.util.InstanceObject.instify(_event.evnt.value);
                    var id = _event.evnt.value.instanceObj(null, _event.evnt.arrayid);
                    var monobj = me.getMonitoredObject(id);
                    if (monobj) {
                        me.fire('monitored-object-exists', {
                            value: monobj
                        });
                        obj = monobj;
                    }
                    else {

                        if (Array.isArray(_event.evnt.value)) {
                            _event.evnt.value.foreach(function (x, index) {
                                if (me.isObject(x) || Array.isArray(x)) {
                                    MEPH.synchronization.util.InstanceObject.instify(x);
                                    _event.evnt.value[index] = me.getMonitoredObject(x.instanceObj());
                                }
                            });
                        }
                        if (_event.evnt.array_properties) {
                            _event.evnt.array_properties.foreach(function (x) {
                                _event.evnt.value[x.prop] = me.getMonitoredObject(x.objId);
                            });
                        }
                        me.createMonitoredObject(_event.evnt.value, _event);
                        obj = _event.evnt.value;
                    }
                    break;
                default:
                    obj = me.getMonitoredObject(_event.objId);
                    break;
            }

            if (!obj) {
                me.fire('missing-event', { evnt: _event.parentEventId });
            }

            me.addEvent(_event.evnt, obj, {
                id: _event.id,
                objId: _event.objId,
                parentEventId: _event.parentEventId,
                local: false,
                executed: false
            })
        });
        me.start();
    }
});