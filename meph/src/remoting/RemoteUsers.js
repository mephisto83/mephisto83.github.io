MEPH.define('MEPH.remoting.RemoteUsers', {
    requires: ['MEPH.Constants',
               'MEPH.mobile.services.MobileServices'],
    statics: {
    },
    properties: {
        remotes: null,
        tokens: null,
        $id: null,
        openActivityOnStop: true,
        $userName: 'Anonymous',
        maxTimeBetweenHeartBeat: 10000
    },
    initialize: function () {
        var me = this;

    }
});