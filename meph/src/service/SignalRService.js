MEPH.define('MEPH.service.SignalRService', {
    requires: ['MEPH.util.Observable'],
    statics: {
        state: {
            started: 'started'
        }
    },
    properties: {
        defaultResourceEndpoint: null,
        apiPath: null,
        hubPath: '$.connection.webRTCHub',
        hubHead: '$.connection.hub',
        messages: null,
        channels: null,
        state: null,
        id: null,
        serviceRPromise: null
    },

    initialize: function (args) {
        var me = this, i;
        me.id = MEPH.GUID();
        me.messages = MEPH.util.Observable.observable([]);
        MEPH.Events(me);
        me.channels = [];
        me.$signalRServicePromises = [];
        MEPH.apply(args, me);
        me.serviceRPromise = Promise.resolve();
        me.hub = MEPH.getPathValue(me.hubPath);
        me.head = MEPH.getPathValue(me.hubHead);

        me.setupListeners();
    },
    setupListeners: function () {
        var me = this;
        me.messages.on('changed', function (type, args) {
            args.added.foreach(function (x) {
                me.processMessage(x);
            });
        });
        ;
        if (me.head && typeof me.head.stateChanged === 'function') {
            me.head.stateChanged(me.connectionStateChanged.bind(me));
            me.head.reconnecting(function () {
                me.tryingToReconnect = true;
            });

            me.head.reconnected(function () {
                me.tryingToReconnect = false;

                me.resolvePending(true);
            });
            me.head.error(function (error) {
                MEPH.Error(error);

                me.resolvePending(false, error);
            });

            me.head.disconnected(function () {
                if (me.tryingToReconnect) {
                    me.notifyUserOfDisconnect(); // Your function to notify user.
                }
                else {
                    me.resolvePending(false, null);
                }
            });
        }
    },
    resolvePending: function (res, error) {
        var me = this;

        me.$signalRServicePromises.foreach(function (x) {
            if (error) {
                x.tofail(error);
            }
            else {
                x.toresolve(res);
            }
        });
        me.$signalRServicePromises.clear();
    },
    connectionStateChanged: function (state) {

        var me = this,
            stateConversion = {
                0: 'connecting',
                1: 'connected',
                2: 'reconnecting',
                4: 'disconnected'
            };
        me.state = stateConversion[state.newState];
        me.fire('state-changed', {
            state: state,
            value: me.state
        });
        if (me.state === 'connected') {
            me.resolvePending(true);
        }
    },

    processMessage: function (x) {
        var me = this;
        if (me.state === MEPH.service.SignalRService.state.started) {
            me.hub.server.sendAll(encodeURIComponent(JSON.stringify(x)));
            me.serviceRPromise = me.serviceRPromise.then(function () {
                me.messages.removeWhere(function (y) { return x === y; });
            });
        }
    },
    setCallbackFunction: function (name, func) {
        var me = this;
        if (me.hub) {
            me.hub.client[name] = func;
        }
    },
    addCallbackFunction: function (name, func) {
        var me = this;
        me.methodsToAdd = me.methodsToAdd || [];
        me.methodsToAdd.push({ name: name, func: func });
    },
    send: function (method, args) {
        var me = this;
        if (me.hub && me.hub.server && me.hub.server[method]) {
            me.hub.server[method].apply(me, MEPH.util.Array.create(arguments).subset(1));
        }
    },
    start: function () {
        var me = this,
            toresolve,
            tofail,
            promise = new Promise(function (resolve, failed) {
                toresolve = resolve;
                tofail = failed;
            });
        if (me.hub) {
            me.methodsToAdd.foreach(function (x) {
                me.hub.client[x.name] = x.func;
            });
            me.hub.client.broadcastMessage = function (message) {
                var message = JSON.parse(decodeURIComponent(message)), errors = [];
                if (message.channelId && message.source !== me.id) {
                    var channel = me.getChannel(message.channelId);
                    if (channel) {
                        channel.callbacks.foreach(function (x) {
                            try {
                                x(message);
                            }
                            catch (error) {
                                errors.push(error);
                            }
                        });
                        errors.foreach(function (x) {
                            MEPH.Log(x);
                        });
                    }
                }
                else {
                    MEPH.publish('SIGNALRMESSAGE', { message: message });
                }
            };
            if (me.head) {
                me.head.start().done(function () {
                    me.started();
                    toresolve();
                }).fail(function () {
                    me.failed();
                    tofail();
                });
            }
        }
        else {
            if (tofail)
                tofail();
            else
                MEPH.Log('SignalR service')
        }
        return promise;
    },
    restart: function () {
        var me = this;
        return new Promise(function (toresolve, tofail) {
            if (me.head) {
                me.head.start().done(function () {
                    me.started();
                    toresolve();
                }).fail(function () {
                    me.failed();
                    tofail();
                });
            }
            else {
                tofail();
            }
        });
    },
    getChannel: function (channelId) {
        var me = this;
        return me.channels.first(function (x) {
            return x.channelId === channelId;
        });
    },
    whenStarted: function () {
        var me = this;
        if (me.isStarted()) {
            return Promise.resolve(true);
        }
        var obj = {

        };
        var unresolved = new Promise(function (resolve, fail) {
            obj.toresolve = resolve;
            obj.tofail = fail;
        });
        me.$signalRServicePromises.push(obj);
        if (me.state === null) { me.start(); }
        else if (me.isDisconnected()) {
            me.restart();
        }
        return unresolved;
    },
    isStarted: function () {
        var me = this;
        return me.state === 'connected';
    },
    isDisconnected: function () {
        var me = this;
        return me.state === 'disconnected';
    },
    notifyUserOfDisconnect: function () {
        var me = this;
        MEPH.publish('SIGNALR_DISCONNECTED', {});
        me.state = 'disconnected';
    },
    started: function () {
        var me = this;
        me.messages.select(function (x) {
            return x;
        }).foreach(function (x) {
            me.processMessage(x);
        });
    },
    failed: function () {
        var me = this;
        me.state = 'failed';
    },
    call: function (path) {
        var me = this;
        return MEPH.ajax(me.getDefaultResourceEndpoint() + me.getApiPath() + path);
    },
    sendMessage: function (message, to, channelId) {
        var me = this;
        me.messages.push({
            message: message,
            channelId: channelId,
            source: me.id,
            to: to
        });
        return me.serviceRPromise;
    },
    channel: function (channelId, callback) {
        var me = this,
            channel = me.getChannel(channelId);

        if (!channel) {
            channel = {
                channelId: channelId,
                callbacks: []
            }
            me.channels.push(channel);
        }
        channel.callbacks.push(callback);
    }
});