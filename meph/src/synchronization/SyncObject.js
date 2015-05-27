MEPH.define('MEPH.synchronization.SyncObject', {
    requires: ['MEPH.synchronization.util.InstanceObject',
                'MEPH.util.Observable'],
    properties: {
        Id: null
    },
    initialize: function () {
        var me = this;
        me.Id = MEPH.GUID();
        MEPH.Events(me);
    },
    createObj: function (options) {
        options = options || {};
        var me = this;
        var result = {};
        MEPH.util.Observable.observable(result);
        me.defineJProperties(result, options);
        var array_properties = [];
        for (var prop in result) {
            if (Array.isArray(result[prop])) {

                array_properties.push({
                    prop: prop,
                    objId: result[prop].instanceObj()
                });
            }
        }

        me.fire('created-object', {
            value: result,
            array_properties: array_properties,
            type: 'created-object'
        });
        return result;
    },
    applyRemotedObj: function (obj) {
        var me = this,
            props = {};
        MEPH.util.Observable.propKeyToArray(obj).foreach(function (x, index) {
            if (Array.isArray(obj) && index != x) {
                props[x] = obj[x];
            }
            else if (!Array.isArray(obj)) {
                props[x] = obj[x];
            }
        });;
        me.defineJProperties(obj, { properties: props });
        obj[MEPH.jsync].sweep();
    },
    applyEvents: function (obj, events) {
        var me = this;
        events.foreach(function (evt) {
            me.applyEvent(obj, evt);
        });
    },
    applyEvent: function (obj, evnt) {

        try {
            var me = this,
            path = evnt.path;
            var sub_obj = obj;
            if (path) {
                var path_array = path.split('.');
                path_array.subset(0, path_array.length - 1).foreach(function (x) {
                    sub_obj = sub_obj[x];
                });
            }
            if (sub_obj && sub_obj._pause) {
                sub_obj._pause(MEPH.synchronization.SyncObject.context);
            }
            //me._pause();
            me.fire('pause', {});
            var lastobj;
            if (path_array && path_array.last()) {
                lastobj = sub_obj[path_array.last()]
            }
            else {
                lastobj = sub_obj;
            }
            var valuesObj = evnt.addedObjects;
            var values = evnt.addedValues;

            switch (evnt.operation) {
                case 'shift':
                case 'pop':
                case 'unshift':
                case 'push':
                case 'splice':
                    lastobj._pause(MEPH.synchronization.SyncObject.context);
                    me.modifyArrayHandler.bind({ array: lastobj, me: me }, {
                        addedValues: evnt.addedValues,
                        addedObjects: (evnt.addedObjects),
                        removedValues: evnt.removedValues,
                        removedObjects: evnt.removedObjects
                    })();
                    lastobj._start(MEPH.synchronization.SyncObject.context);
                    break;
                default:
                    sub_obj[path_array.last()] = (evnt.value);
                    break;
            }
            if (sub_obj && sub_obj._start) {
                sub_obj[MEPH.jsync].sweep();
                sub_obj._start(MEPH.synchronization.SyncObject.context);
            }
            //me._start();
            me.fire('start', {});
        }
        catch (error) {
            throw error;
            return false;
        }
        return true;
    },
    isObject: function (obj) {
        if (typeof (obj) === 'object') {
            if (!(obj instanceof Date)) {
                return true;
            }
        }
        return false;
    },
    beforeArrayPushHandler: function (type, arguments, instanceIds) {
        var array = this.array;
        var me = this.me;
        array[MEPH.jsync].addedRefs = [];
        arguments.added.foreach(function (x, index) {
            if (!me.isObject(x) && !Array.isArray(x)) {
                array[MEPH.jsync].addedRefs.push({
                    index: array.length + index,
                    argumentIndex: index,
                    instanceId: instanceIds && Array.isArray(instanceIds) ? instanceIds[index] : MEPH.GUID()
                });
            }
        });
        array[MEPH.jsync].addedRefs.foreach(function (x) {
            array[MEPH.jsync].valueRefArray.push(x);
        });


    },
    beforeArrayUnshiftHandler: function (type, arguments, instanceIds) {
        var array = this.array;
        var me = this.me,
            convertedargs = arguments.added;
        array[MEPH.jsync].addedRefs = [];
        convertedargs.foreach(function (x, index) {
            if (!me.isObject(x) && !Array.isArray(x)) {
                array[MEPH.jsync].valueRefArray.foreach(function (x) { x.index = x.index + convertedargs.length; });
                array[MEPH.jsync].addedRefs.push({
                    index: index,
                    argumentIndex: index,
                    instanceId: instanceIds && Array.isArray(instanceIds) ? instanceIds[index] : MEPH.GUID()
                });
            }
        });
        array[MEPH.jsync].addedRefs.foreach(function (x) {
            array[MEPH.jsync].valueRefArray.push(x);
        });
    },
    beforeArrayShiftHandler: function () {
        var array = this.array, index = 0;
        var ref = array[MEPH.jsync].valueRefArray.first(function (x) {
            return x.index === index;
        });
        if (ref) {
            array[MEPH.jsync].removedValArray = array[MEPH.jsync].valueRefArray.removeWhere(function (x) {
                return x === ref;
            });
            array[MEPH.jsync].valueRefArray.foreach(function (x) { return x.index--; });
        }
        else {
            array[MEPH.jsync].removedValArray = [];
        }
    },
    afterArraySpliceHandler: function (type, args) {
        var me = this.me,
            array = this.array,
            removed = args.removed,
            added = args.added,
            arguments = args.arguments;
        var start = arguments[0];
        var count = arguments[1];
        array[MEPH.jsync].removedValArray = [];
        if (removed) {
            valueIndicesRemoved = [].interpolate(start, start + count, function (x) { return x; });
            array[MEPH.jsync].valueRefArray.removeWhere(function (y) {
                if (y.index >= start + count) {
                    y.index = y.index - count;
                    return false
                }
                else if (y.index >= start && y.index < start + count) {
                    array[MEPH.jsync].removedValArray.push(y);
                    return true;
                }
                return false;
            });
        }
        array[MEPH.jsync].addedRefs = [];
        if (added) {
            addedCount = added.length;
            added.foreach(function (x, index) {
                if (!me.isObject(x)) {
                    array[MEPH.jsync].addedRefs.push({
                        index: start + index,
                        instanceId: MEPH.GUID()
                    });
                }
            });
            array[MEPH.jsync].valueRefArray.foreach(function (x, index) {
                if (x.index >= start) {
                    x.index = x.index + addedCount;
                }
            });
            array[MEPH.jsync].addedRefs.foreach(function (x, index) {
                array[MEPH.jsync].valueRefArray.splice(start + x.index, 0, x);
            });
        }
    },
    modifyArrayHandler: function (options) {
        var removedFunc, array = this.array,
          lastindex = array.length - 1,
          me = this.me;

        if (options) {
            var removedValuesFunc = function (y) {
                var indices = array[MEPH.jsync].valueRefArray.indexWhere(function (x) {
                    return x.instanceId === y.instanceId;
                });

                for (var i = indices[0]; i < array[MEPH.jsync].valueRefArray; i++) {
                    array[MEPH.jsync].valueRefArray[i].index--;
                }

                array[MEPH.jsync].valueRefArray.removeWhere(function (x) {
                    return x.instanceId === y.instanceId;
                });

                var reversed = indices.orderBy(function (x, y) { return y - x; });
                reversed.foreach(function (t) {
                    array.splice(t, 1);
                });
            };
            var removedObjFunc = function (y) {
                var indices;
                if (me.isObject(y)) {
                    indices = array.indexOf(y) === -1 ? [] : [array.indexOf(y)];
                }
                for (var i = indices[0]; i < array[MEPH.jsync].valueRefArray; i++) {
                    array[MEPH.jsync].valueRefArray[i].index--;
                }

                var reversed = indices.orderBy(function (x, y) { return y - x; });
                reversed.foreach(function (t) {
                    array.splice(t, 1);
                });
            };
            var addValueFunc = function (x, index) {
                array[MEPH.jsync].valueRefArray.push({
                    index: array.length + index,
                    argumentIndex: index,
                    instanceId: x.valueRef && x.valueRef.instanceId ? x.valueRef.instanceId : MEPH.GUID()
                });
                array.push(x.added);
            };
            options.addedValues.foreach(addValueFunc);
            options.addedObjects.foreach(function (t) {
                if (array.indexOf(t) === -1) {
                    array.push(t);
                }
            });
            options.removedValues.foreach(removedValuesFunc);
            options.removedObjects.foreach(removedObjFunc);

            //options.removed.foreach();
        }
    },
    afterArrayPopHandler: function (options) {
        var array = this.array,
            lastindex = array.length - 1,
            me = this.me;
        array[MEPH.jsync].removedValArray = [];
        if (lastindex !== -1) {
            var lastobject = array.last();
            if (!me.isObject(lastobject)) {
                var ref = array[MEPH.jsync].valueRefArray.first(function (x) {
                    return x.index === lastindex;
                });
                if (ref) {
                    array[MEPH.jsync].removedValArray = array[MEPH.jsync].valueRefArray.removeWhere(function (x) { return x === ref; });
                }
            }
        }
    },
    defineJProperties: function (obj, options) {
        var result = [],
            me = this;
        options = options || {};
        if (!obj) {
            return;
        }
        if (me.isObject(obj)) {
            if (!obj[MEPH.jsync]) {
                Object.defineProperty(obj, MEPH.jsync, {
                    configurable: false,
                    writeable: false,
                    enumerable: false,
                    value: {
                        undo: function ($obj, move) {
                            var old = move.old,
                                value = move.value;

                            if ($obj[move.property] === value ||
                                (me.isObject($obj[move.property]) &&
                                me.isObject(value)
                                && value != null
                                && $obj[move.property] !== null
                                && value.jsyncId() === $obj[move.property].jsyncId())) {
                                $obj[move.property] = old;
                                return true;
                            }
                            else {
                                return false;
                            }
                        }.bind(obj, obj),
                        existingProperties: [],
                        initProps: function ($obj) {
                            MEPH.util.Observable.propKeyToArray($obj).where(function (x) {
                                return !$obj[MEPH.jsync].existingProperties.contains(function (y) { return y === x; });
                            }).foreach(function (x) {
                                $obj[MEPH.jsync].existingProperties.push(x);
                            });
                        }.bind(obj, obj),
                        sweep: (function ($obj) {
                            var props = {},
                                hasNewProp = false;
                            MEPH.util.Observable.propKeyToArray($obj)
                                .where(function (x) {
                                    return !$obj[MEPH.jsync].existingProperties.some(function (y) { return y === x; });
                                })
                                .foreach(function (x) {
                                    props[x] = $obj[x];
                                    $obj[MEPH.jsync].existingProperties.push(x);
                                    hasNewProp = true;
                                });
                            if (hasNewProp) {
                                me.defineJProperties($obj, {
                                    properties: props
                                });
                            }
                        }).bind(obj, obj),
                        valueObjs: (function ($obj) {
                            return $obj[MEPH.jsync].valueRefArray;
                        }).bind(obj, obj),
                        valueRefArray: []
                    }
                });
                if (Array.isArray(obj)) {
                    obj.on('beforepush', me.beforeArrayPushHandler.bind({ me: me, array: obj }), null, MEPH.synchronization.SyncObject.context);
                    obj.on('beforepop', me.afterArrayPopHandler.bind({ me: me, array: obj }), null, MEPH.synchronization.SyncObject.context);
                    obj.on('beforeunshift', me.beforeArrayUnshiftHandler.bind({ me: me, array: obj }), null, MEPH.synchronization.SyncObject.context);
                    obj.on('beforeshift', me.beforeArrayShiftHandler.bind({ me: me, array: obj }), null, MEPH.synchronization.SyncObject.context);
                    obj.on('aftersplice', me.afterArraySpliceHandler.bind({ me: me, array: obj }), null, MEPH.synchronization.SyncObject.context);
                }
            }

            MEPH.synchronization.util.InstanceObject.instify(obj);

            if (options.synctarget) {
                obj.instanceObj(null, options.synctarget);
            }
            else
                obj.instanceObj();
        }

        if (options.properties) {
            for (var i in options.properties) {
                result.push(i);
            }
            MEPH.util.Observable.observable(obj, result, true);
            for (var i in options.properties) {
                //obj._pause();
                obj[i] = options.properties[i];
                //obj._start();
                if (!obj.hasOn('change_' + i, obj.instanceObj())) {
                    obj.on('change_' + i, function (obj, property, type, options) {
                        if (me.isObject(obj[property]) || Array.isArray(obj[property])) {
                            if (Array.isArray(obj[property])) {
                                obj[property].foreach(function (x, index) {
                                    if (me.isObject(x) || Array.isArray(x)) {
                                        me.applyListeners(x, obj.instanceObj(), null, obj);
                                        var props = {};
                                        MEPH.util.Observable.propKeyToArray(x).where(function (t) {
                                            return !x[MEPH.jsync].existingProperties.some(function (y) {
                                                return y === t;
                                            });
                                        }).foreach(function (prop, index) {
                                            if (Array.isArray(x) && index != prop) {
                                                props[prop] = x[prop];
                                            }
                                            else if (!Array.isArray(x)) {
                                                props[prop] = x[prop];
                                            }
                                        });
                                        me.defineJProperties(x, { properties: props });
                                    }
                                });
                            }
                            me.applyListeners(obj[property], obj.instanceObj(), property, obj);

                        };
                        if (Array.isArray(options.value)) {
                            options.value = options.value.select(function (x) {
                                return {
                                    index: options.value.indexOf(x),
                                    'isObject': me.isObject(x),
                                    'added': me.isObject(x) && x.jsyncId ? x.jsyncId() : x
                                }
                            });
                        }
                        //var path = options.path || "";
                        //path = path ? path + "." + (options.property || i) : (options.property || i);
                        //var ops = MEPH.clone(options, ['references']);
                        //if (Array.isArray(obj[property])) {
                        //    ops.arrayid = obj[property].jsyncId();
                        //}
                        //ops.path = path;
                        //ops.references = options.references || [];
                        //ops.value = options.value;
                        //  obj.fire('altered', ops);
                    }.bind(obj, obj, i), obj.instanceObj());
                }
                if (obj[i] && me.isObject(obj[i])) {
                    me.applyListeners(obj[i], obj.instanceObj(), i, obj);
                }
            }
        }
        if (me.isObject(obj)) {
            if (obj.j) {
                obj[MEPH.jsync].initProps();
            }
        }
    },
    applyListeners: function (obj, _instanceObj, property, parentobj) {
        var props = {},
            me = this;
        MEPH.Events(obj);
        obj.onIf('created', function (type, options) {
            if (me.isObject(options.value)) {
                MEPH.synchronization.util.InstanceObject.instify(options.value);
            }
            if (Array.isArray(options.value)) {
                options.arrayid = options.value.jsyncId();
            }
            var array_properties = [];
            for (var prop in obj) {
                if (Array.isArray(obj[prop])) {
                    array_properties.push({
                        prop: prop,
                        objId: obj[prop].instanceObj()
                    });
                }
            }
            if (parentobj) {
                parentobj.fire('created', options);
            }
            me.fire('created-object', {
                value: obj,
                array_properties: array_properties,
                arrayid: options.value.jsyncId(),
                type: 'created-object'
            });
        }, obj);
        //if (parentobj) {
        //    obj.onIf('altered', function (type, options) {
        //        //var path = options.path || options.property || "";

        //        //if (path !== '') {
        //        //    path = this.property + "." + path;
        //        //}
        //        //else {
        //        //    path = this.property;
        //        //}

        //        //var ops = MEPH.clone(options);
        //        //ops.path = path;
        //        //ops.old = options.old;
        //        //ops.value = options.value;
        //        //this.obj.fire('change', ops);
        //        //  this.obj.fire('altered', ops);
        //    }.bind({ obj: parentobj, property: property }), obj);
        //}
        if (Array.isArray(obj)) {
            obj.foreach(function (x) {
                var tempprops = {};
                MEPH.util.Observable.propKeyToArray(obj).foreach(function (x, index) {
                    if (index != x) {
                        tempprops[x] = obj[x];
                    }
                });
            });

            if (!obj.hasOn('pushed', obj)) {
                var arrayAlteration = function (options, type, args) {
                    var array = obj;
                    var removed = null;
                    var added = null;

                    addedargs = args.added ? args.added : args;

                    //if (options.func === 'concat') {
                    //    me.defineJProperties(addedargs, {});
                    //}

                    if (options.func === 'concat' ||
                        options.func === 'splice' || options.func === 'push' || options.func === 'unshift') {
                        var addedrefs = array[MEPH.jsync].addedRefs;
                        addedargs.foreach(function (x) {
                            if (x && me.isObject(x)) {
                                var instanceobjid = options.obj.instanceObj();
                                me.applyListeners(x, instanceobjid, null, null);// options.obj);
                            }
                        });

                        added = addedargs.select(function (x, index) {
                            return {
                                index: me.isObject(x) ? array.indexOf(x) : addedrefs.first(function (t) {
                                    return t.argumentIndex === index;
                                }),
                                valueRef: me.isObject(x) ? null : array[MEPH.jsync].valueRefArray.first(function (t) {
                                    return t.index === array.indexOf(x);
                                }),
                                'isObject': me.isObject(x),
                                'added': me.isObject(x) ? x.instanceObj() : x
                            }
                        });

                    }
                    if (options.func === 'splice' || options.func === 'pop' || options.func === 'shift') {
                        removalarg = args.removed ? args.removed : args;
                        removed = {
                            removed: removalarg.select(function (x) {
                                return {
                                    index: array.indexOf(x),
                                    'isObject': me.isObject(x),
                                    'removed': me.isObject(x) ? x.jsyncId() : x
                                }
                            }),
                            removedValues: array[MEPH.jsync].removedValArray
                        }

                    }

                    var path = null;
                    var array_path = [];
                    var ops = {};
                    ops.path = path;
                    ops.operation = options.func;
                    ops.added = added;
                    ops.removed = removed;
                    ops.value = options.value;
                    //obj.fire('change', ops);
                    if (options.func !== 'concat') {
                        obj.fire('array_altered', ops);
                    }
                };
                obj.on('pushed', arrayAlteration.bind(obj, { obj: obj, property: property, func: 'push' }), obj, MEPH.synchronization.SyncObject.context);
                obj.on('popped', arrayAlteration.bind(obj, { obj: obj, property: property, func: 'pop' }), obj, MEPH.synchronization.SyncObject.context);
                obj.on('shifted', arrayAlteration.bind(obj, { obj: obj, property: property, func: 'shift' }), obj, MEPH.synchronization.SyncObject.context);
                obj.on('spliced', arrayAlteration.bind(obj, { obj: obj, property: property, func: 'splice' }), obj, MEPH.synchronization.SyncObject.context);
                obj.on('unshifted', arrayAlteration.bind(obj, { obj: obj, property: property, func: 'unshift' }), obj, MEPH.synchronization.SyncObject.context);
                obj.on('concatted', arrayAlteration.bind(obj, { obj: obj, property: property, func: 'concat' }), obj, MEPH.synchronization.SyncObject.context);
            }
        }

        MEPH.util.Observable.propKeyToArray(obj).foreach(function (x, index) {
            if (Array.isArray(obj) && index != x) {
                props[x] = obj[x];
            }
            else if (!Array.isArray(obj)) {
                props[x] = obj[x];
            }
        });
        me.defineJProperties(obj, { properties: props });
        MEPH.util.Observable.observable(obj, null, true);
    },
    statics: {
        context: 'syncobject - contexts'
    }
});