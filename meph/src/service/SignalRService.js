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
    start: function () {
        var me = this,
            toresolve,
            tofail,
            promise = new Promise(function (resolve, failed) {
                toresolve = resolve;
                tofail = failed;
            });
        if (me.hub) {
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
    started: function () {
        var me = this;
        me.state = 'started';
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