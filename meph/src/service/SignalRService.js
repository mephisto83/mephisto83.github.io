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
        me.channels = [];
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

        me.head.stateChanged(me.connectionStateChanged.bind(me));
        me.head.reconnecting(function () {
            me.tryingToReconnect = true;
        });

        me.head.reconnected(function () {
            me.tryingToReconnect = false;
        });
        me.head.error(function (error) {
            MEPH.Error(error);
        });

        me.head.disconnected(function () {
            if (me.tryingToReconnect) {
                me.notifyUserOfDisconnect(); // Your function to notify user.
            }
        });

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

            me.head.start().done(function () {
                me.started();
                toresolve();
            }).fail(function () {
                me.failed();
                tofail();
            });
        }
        else {
            if (tofail)
                tofail();
            else
                MEPH.Log('SignalR service')
        }
        return promise;
    },
    getChannel: function (channelId) {
        var me = this;
        return me.channels.first(function (x) {
            return x.channelId === channelId;
        });
    },
    isStarted: function () {
        var me = this;
        return me.state === 'connected';
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