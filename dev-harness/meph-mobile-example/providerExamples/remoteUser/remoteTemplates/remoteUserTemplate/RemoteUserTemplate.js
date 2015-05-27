MEPH.define('Providers.remoteUser.remoteTemplates.remoteUserTemplate.RemoteUserTemplate', {
    templates: true,
    alias: 'providers_remoteuser_template_remoteuser',
    extend: 'MEPH.control.Control',
    requires: ['MEPH.input.Camera', 'MEPH.util.Dom'],
    statics: {
    },
    properties: {
        connectionInfo: null,
        data: null,
        $streamAdded: false,
        calling: false,
    },
    initialize: function () {
        var me = this,
            connection;
        me.callParent.apply(me, arguments);
        MEPH.MobileServices.get('remotingController').then(function (remotingController) {
            me.remotingController = remotingController;
        })['catch'](function (error) {
            MEPH.Log(error);
        });
        me.on('change_data', me.handleConnection.bind(me));
        // me.handleConnection();
    },
    handleConnection: function () {
        var me = this;
        if (!me.$streamAdded) {
            try {
                if (!me.connectionInfo && me.data && me.data.remoteUser && me.remotingController) {
                    me.connectionInfo = me.remotingController.getRTCConnection(me.data.remoteUser, 'video');
                }
                if (me.connectionInfo && !me.$streamAdded) {
                    me.handleStreamAdded(me.connectionInfo.connection);
                    me.$streamAdded = true;
                }
            } catch (err) {
                MEPH.Log(err);
            }
        }
    },
    onLoaded: function () {
        var me = this;
        me.callParent.apply(me, arguments);

    },
    handleStreamAdded: function (connectionInfo) {
        var me = this;
        if (!me.$streamAdded) {
            try {
                me.stream = true;
                me.cameraStream.src = window.URL.createObjectURL(connectionInfo.stream);
            }
            catch (error) {

                MEPH.Log(error);
            }
        }
    },
    toggleCallingUser: function () {
        var me = this;
        if (!me.calling) {
            if (!me.connectionInfo) {

                MEPH.util.Dom.getUserMedia({ video: true, audio: true }).then(function (localMediaStream) {
                    me.remotingController.requestRTCConnection(me.data.remoteUser, 'video', {
                        stream: localMediaStream
                    }).then(function (connectionInfo) {
                        connectionInfo.on(MEPH.service.rtc.Connection.Events.StreamAdded,
                        function () {
                            if (!me.$streamAdded) {
                                try {
                                    me.$streamAdded = true;
                                    me.cameraStream.src = window.URL.createObjectURL(connectionInfo.stream);
                                }
                                catch (error) {

                                    MEPH.Log(error);
                                }
                            }
                        });
                    });
                });
            }
        }
    },
    convertToColor: function (value) {
        return !value ? 'Red' : 'Blue';
    }
});