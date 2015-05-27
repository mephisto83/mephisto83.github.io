/**
 * @class MEPH.remoting.RemotingController
 * Remoting controller.
 */
MEPH.define('MEPH.remoting.RemotingController', {
    requires: ['MEPH.Constants',
                'MEPH.service.rtc.Connection',
                'MEPH.mobile.services.MobileServices'],
    statics: {
        sentRequest: 'sentRequest',
        RTCConnectionsChanged: 'RTCConnectionsChanged',
        rejectedRequest: 'rejectedRequest',
        acceptRequest: 'acceptRequest',
        REQUEST_TO_CALL: 'REQUEST_TO_CALL',
        engaged: 'engaged',
        waiting: 'waiting'
    },
    properties: {
        remotes: null,
        tokens: null,
        $id: null,
        $rtcConnections: null,
        $maxWaitTime: 10000,
        dataConnection: true,
        $sessionManager: null,
        openActivityOnStop: true,
        $userName: 'Anonymous',
        maxTimeBetweenHeartBeat: 10000
    },
    initialize: function (config) {
        var me = this;
        MEPH.Events(me);
        config = config || {};
        me.$id = MEPH.GUID();
        me.$rtcConnections = MEPH.util.Observable.observable([]).on('changed', me.handleRTCConnections.bind(me));
        MEPH.applyIf(config, me);
        me.remotes = MEPH.util.Observable.observable([]).on('changed', me.handleRemotesChanged.bind(me));

    },
    /**
     * Handles new RTC connections.
     */
    handleRTCConnections: function (type, options) {
        var me = this;
        me.fire(MEPH.remoting.RemotingController.RTCConnectionsChanged, options);
    },
    getRemotes: function () {
        var me = this;
        return me.remotes;
    },
    handleIncomingCall: function (channelmessage) {
        var me = this,
            connectionInfo;
        if (!me.autoRtc) {
            return;
        }

        switch (channelmessage.message.message) {
            case MEPH.remoting.RemotingController.REQUEST_TO_CALL:
                if (me.getRTCConnection(channelmessage.message.from, channelmessage.message.connectionType)) {
                    connectionInfo = me.getRTCConnection(channelmessage.message.from, channelmessage.message.connectionType);
                    switch (connectionInfo.state) {
                        case MEPH.remoting.RemotingController.sentRequest:
                            me.signalService.sendMessage({
                                type: MEPH.Constants.MAKE_RTC_CALL,
                                from: me.getId(),
                                connectionType: channelmessage.message.connectionType,
                                message: MEPH.remoting.RemotingController.rejectedRequest,
                                fromName: me.getUserName()
                            },
                            channelmessage.message.from,
                            MEPH.Constants.ACTIVITY_CONTROLLER_CHANNEL);
                            break;
                        case MEPH.remoting.RemotingController.waiting:
                            connectionInfo.state = MEPH.remoting.RemotingController.engaged;
                            me.signalService.sendMessage({
                                type: MEPH.Constants.MAKE_RTC_CALL,
                                from: me.getId(),
                                connectionType: channelmessage.message.connectionType,
                                message: MEPH.remoting.RemotingController.acceptRequest,
                                fromName: me.getUserName()
                            },
                           channelmessage.message.from,
                           MEPH.Constants.ACTIVITY_CONTROLLER_CHANNEL);
                            break;
                    }
                }
                else {
                    me.$rtcConnections.push({
                        remoteUser: channelmessage.message.from,
                        connectionType: channelmessage.message.connectionType,
                        state: MEPH.remoting.RemotingController.engaged
                    });
                    me.signalService.sendMessage({
                        type: MEPH.Constants.MAKE_RTC_CALL,
                        from: me.getId(),
                        connectionType: channelmessage.message.connectionType,
                        message: MEPH.remoting.RemotingController.acceptRequest,
                        fromName: me.getUserName()
                    },
                    channelmessage.message.from,
                    MEPH.Constants.ACTIVITY_CONTROLLER_CHANNEL);
                }
                break;
            case MEPH.remoting.RemotingController.acceptRequest:
                connectionInfo = me.getRTCConnection(channelmessage.message.from, channelmessage.message.connectionType);
                if (connectionInfo) {
                    connectionInfo.id = MEPH.GUID();
                    var connection = new MEPH.service.rtc.Connection({
                        id: connectionInfo.id,
                        to: connectionInfo.remoteUser,
                        connectionType: channelmessage.message.connectionType,
                        partyId: me.getId(),
                        data: me.dataConnection,
                        dataConnectionId: 'dataid',
                        options: connectionInfo.options,
                        signalProvider: me.signalService,
                        peerConnectionConfiguration: me.peerConnectionConfiguration,
                        peerConnectionConstraints: me.peerConnectionConstraints
                    });
                    connectionInfo.connection = connection;
                    connection.createPeerConnection();
                    if (connectionInfo.promise) {
                        connectionInfo.promise.resolve(connection);
                    }
                }
                break;
            case MEPH.remoting.RemotingController.rejectedRequest:
                connectionInfo = me.getRTCConnection(channelmessage.message.from, channelmessage.message.connectionType);
                //    me.$rtcConnections.first(function (x) {
                //    return x.remoteUser === channelmessage.message.from;
                //});
                connectionInfo.state = MEPH.remoting.RemotingController.waiting;
                setTimeout(function () {
                    if (connectionInfo.state === MEPH.remoting.RemotingController.waiting) {
                        connectionInfo.state = MEPH.remoting.RemotingController.sentRequest;
                        me.signalService.sendMessage({
                            type: MEPH.Constants.MAKE_RTC_CALL,
                            from: me.getId(),
                            connectionType: channelmessage.message.connectionType,
                            message: MEPH.remoting.RemotingController.REQUEST_TO_CALL,
                            fromName: me.getUserName()
                        }, connectionInfo.remoteUser, MEPH.Constants.ACTIVITY_CONTROLLER_CHANNEL);
                    }
                }, Math.random() * me.$maxWaitTime);
                break
        }
    },
    getRTCConnection: function (id, connectionType) {
        var me = this;
        return me.$rtcConnections.first(function (x) { return x.remoteUser === id && x.connectionType === connectionType; });
    },
    getRTCConnections: function (id) {
        var me = this;
        return me.$rtcConnections.first(function (x) { return x.remoteUser === id; });
    },
    handleRemotesChanged: function (type, options) {
        var me = this,
            added = options.added,
            removed = options.removed;
        if (!me.autoRtc) {
            return;
        }
        added.foreach(function (remote) {
            if (!me.$rtcConnections.some(function (x) { return x.remoteUser === remote.remoteUser; })) {
                me.sendRequest(remote.remoteUser);
                //me.$rtcConnections.push({
                //    connectionType: MEPH.service.rtc.Connection.ConnectionType['default'],
                //    remoteUser: remote.remoteUser,
                //    state: MEPH.remoting.RemotingController.sentRequest
                //});
                //me.signalService.sendMessage({
                //    type: MEPH.Constants.MAKE_RTC_CALL,
                //    from: me.getId(),
                //    connectionType: MEPH.service.rtc.Connection.ConnectionType['default'],
                //    message: MEPH.remoting.RemotingController.REQUEST_TO_CALL,
                //    fromName: me.getUserName()
                //}, remote.remoteUser, MEPH.Constants.ACTIVITY_CONTROLLER_CHANNEL);

            }
        });
    },
    sendRequest: function (remoteUser, type) {
        var me = this;
        me.$rtcConnections.push({
            connectionType: type || MEPH.service.rtc.Connection.ConnectionType['default'],
            remoteUser: remoteUser,
            state: MEPH.remoting.RemotingController.sentRequest
        });
        me.signalService.sendMessage({
            type: MEPH.Constants.MAKE_RTC_CALL,
            from: me.getId(),
            connectionType: type || MEPH.service.rtc.Connection.ConnectionType['default'],
            message: MEPH.remoting.RemotingController.REQUEST_TO_CALL,
            fromName: me.getUserName()
        }, remoteUser, MEPH.Constants.ACTIVITY_CONTROLLER_CHANNEL);
        return me.$rtcConnections.last();
    },
    requestRTCConnection: function (remoteUser, type, options) {
        var me = this,
            tofail,
            toresolve,
            connection,
            promise;

        connection = me.getRTCConnection(remoteUser, type);
        if (!connection) {
            connection = me.sendRequest(remoteUser, type);

            promise = new Promise(function (r, f) {
                toresolve = r;
                tofail = f;
            });
            connection.options = options;
            connection.promise = {
                resolve: toresolve,
                fail: tofail
            };
            return promise;
        }
        else return Promise.resolve().then(function () { return connection; });
    },
    remoting: function (remote) {
        var me = this;
        if (remote) {
            if (me.addedSignalServiceChannel) {
                return Promise.resolve();
            }
            MEPH.MobileServices.get('sessionManager').then(function (sessionManager) {
                if (sessionManager) {
                    me.$sessionManager = sessionManager;
                }
            });
            return MEPH.MobileServices.get('signalService').then(function (signalService) {
                if (signalService && signalService.start) {
                    return signalService.start().then(function () {
                        signalService.channel(MEPH.Constants.ACTIVITY_CONTROLLER_CHANNEL, me.handleChannelRequest.bind(me));
                        me.addedSignalServiceChannel = true;
                        return signalService;
                    })
                }
            }).then(function (signalService) {
                if (signalService) {
                    me.signalService = signalService;
                    MEPH.service.rtc.Connection.ConnectionSecretary(me.signalService, {
                        partyId: me.getId(),
                        peerConnectionConfiguration: me.peerConnectionConfiguration,
                        peerConnectionConstraints: me.peerConnectionConstraints
                    }, function (connection) {
                        var remote,
                            connectionInfo = me.getRTCConnection(connection.to, connection.connectionType);

                        connectionInfo.connection = connection;
                        if (connectionInfo.promise) {
                            connectionInfo.promise.resolve(connection);
                        }
                        if (connection.stream) {
                            remote = me.getRemotes().first(function (remote) {
                                return remote.remoteUser === connectionInfo.remoteUser;
                            });
                            remote.stream = connection.stream;
                        }
                        else {
                            connection.on(MEPH.service.rtc.Connection.Events.StreamAdded, function () {
                                var remote = me.getRemotes().first(function (remote) {
                                    return remote.remoteUser === connectionInfo.remoteUser;
                                });
                                remote.stream = remote.stream || null;
                                MEPH.util.Observable.sweep(remote);
                                remote.stream = connection.stream;
                            });
                        }
                    });
                    MEPH.setInterval(function () {
                        signalService.sendMessage(me.getUserInfo(), '', MEPH.Constants.ACTIVITY_CONTROLLER_CHANNEL);
                    }, 1500);
                    MEPH.setInterval(function () {
                        me.remotes.removeWhere(function (x) {
                            return me.maxTimeBetweenHeartBeat < Date.now() - x.timestamp;
                        });
                    }, 5000);
                }
            });;
        }
    },
    getUserInfo: function () {
        var me = this, info = {};
        MEPH.apply(me.attachedInfo || {}, info);
        if (me.$sessionManager) {
            MEPH.apply(me.$sessionManager.getUserData(), info);
        }
        MEPH.apply({
            type: MEPH.Constants.ACTIVITY_HEART_BEAT,
            userName: me.$userName,
            remoteUser: me.$id,
            stream: null
        }, info);
        return info;
    },
    setUserName: function (name) {
        var me = this;
        me.$userName = name;
    },
    getUserName: function () {
        var me = this;
        return me.$userName;
    },
    getId: function () {
        var me = this;
        return me.$id;
    },
    handleChannelRequest: function (channelmessage) {
        var message = channelmessage.message, me = this;
        if (channelmessage.message.from !== me.$id) {
            switch (message.type) {
                case MEPH.Constants.RequestControllAccess:
                    return me.requestControlHandler(channelmessage);
                case MEPH.Constants.RemoteControlRequest:
                    me.remoteControlRequestHandler(channelmessage);
                    break;
                case MEPH.Constants.RemoteControlRequestComplete:
                    MEPH.publish(MEPH.Constants.RemoteControlRequestComplete, channelmessage);
                    break;
                case MEPH.Constants.MAKE_RTC_CALL:
                    me.handleIncomingCall(channelmessage);
                    break;
                case MEPH.Constants.ACTIVITY_HEART_BEAT:
                    me.handleHeartBeat(channelmessage);
                    break;
                default:
                    MEPH.Log('ActivityController : unknow request type');
                    break;
            }
        }
    },
    handleHeartBeat: function (channelmessage) {
        var me = this, remoteUserReference = me.remotes.first(function (x) {
            return x.remoteUser === channelmessage.message.remoteUser;
        });
        if (!remoteUserReference) {
            remoteUserReference = channelmessage.message;
            remoteUserReference.selected = false;
            MEPH.util.Observable.observable(remoteUserReference);
            me.remotes.push(remoteUserReference)
        }
        else {
            MEPH.apply(channelmessage.message, remoteUserReference);
            MEPH.util.Observable.sweep(remoteUserReference);
        }

        remoteUserReference.timestamp = Date.now();

    },
    requestControlHandler: function (channelmessage) {
        var me = this;
        return me.getControlAcknowledgement(channelmessage).then(function (result) {
            if (result) {
                me.remotes.push({ remoteUser: channelmessage.message.from });
            }
        })['catch'](function () {
        });
    },
    getControlAcknowledgement: function (channelmessage) {
        var me = this;
        return Promise.resolve().then(function () {
            return confirm(channelmessage.message.fromName + ' would like to interface with you, is that ok ');
        });
    },
    remoteControlRequestHandler: function (channelmessage) {
        var me = this, result;
        if (me.remotes.some(function (x) {return x.remoteUser === channelmessage.message.from; })) {
            result = MEPH.ActivityController.startActivity(channelmessage.message)
            if (result) {
                result.then(function () {
                    return MEPH.MobileServices.get('signalService').then(function (signalService) {

                        signalService.sendMessage({
                            type: MEPH.Constants.RemoteControlRequestComplete,
                            viewId: channelmessage.message.viewId,
                            remoteInstanceId: channelmessage.message.remoteInstanceId,
                            from: me.getId(),
                            fromName: me.getUserName()
                        }, channelmessage.message.from, MEPH.Constants.ACTIVITY_CONTROLLER_CHANNEL)
                    })
                });
            }
        }
    }
});