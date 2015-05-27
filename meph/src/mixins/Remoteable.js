/**
 * @class
 * The class instance will listen on the channel for synchronization messages.
 **/
MEPH.define('MEPH.mixins.Remoteable', {
    requires: ['MEPH.mobile.services.MobileServices'],
    init: function (path, modeldescription) {
        var me = this;
        me.on('reference view', function (type, args) {
            var view = args.value
            view.on('activity arguments set', function () {
                var remoteInstanceId = view.getActivityArguments().remoteInstanceId,
                    slave = view.getActivityArguments().slave;
                MEPH.MobileServices.get('signalService').then(function (signalService) {
                    me.syncMembrane = new MEPH.synchronization.SyncMembrane();

                    var jobject = me.syncMembrane.createSyncObject();
                    if (!slave) {
                        var result = jobject.createObj({ properties: modeldescription });
                        MEPH.setPathValue(me, path, result);
                    }
                    else {
                        me.syncMembrane.on('object-created', function () {

                        });
                    }
                    me.syncMembrane.channel = function (message) {

                        signalService.sendMessage(message, '', remoteInstanceId);
                    }
                    signalService.channel(remoteInstanceId, function (channelmessage) {

                        if (!MEPH.getPathValue(path, me) && me.syncMembrane.monitoredObject && me.syncMembrane.monitoredObject.length) {
                            MEPH.setPathValue(me, path, me.syncMembrane.monitoredObject[0]);
                        }
                        me.syncMembrane.receive(channelmessage.message);
                    });
                });
            });
        });
    }
});