MEPH.define('MEPHControls.remoteview.model.RemoteViewModel', {
    requires: ['MEPH.mixins.Referrerable',
                'MEPH.util.DataModel',
                'MEPH.synchronization.SyncMembrane',
                'MEPH.mixins.Remoteable',
                'MEPH.mixins.Observable'],
    mixins: {
        remoteable: 'MEPH.mixins.Remoteable',
        observable: 'MEPH.mixins.Observable',
        referrerable: 'MEPH.mixins.Referrerable'
    },
    properties: {
        data: null
    },
    initialize: function () {
        var me = this;
        me.mixins.referrerable.init.apply(me);
        me.mixins.observable.init.apply(me);
        me.$referenceConnections = MEPH.Array([{
            type: MEPH.control.Control.connectables.control, obj: me
        }]);

        me.mixins.remoteable.init.apply(me, ['data', {
            userName: '',
            moreInfo: ''
        }]);
    }
});