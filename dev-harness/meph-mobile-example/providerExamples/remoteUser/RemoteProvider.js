MEPH.define('Providers.remoteUser.RemoteProvider', {
    requires: ['MEPH.util.Observable',
                'MEPH.Constants',
                'Providers.remoteUser.remoteTemplates.remoteUserTemplate.RemoteUserTemplate',
                'MEPH.mobile.services.MobileServices',
                'MEPH.remoting.RemotingController'],
    properties: {
    },
    initialize: function () {
        var me = this;
        MEPH.MobileServices.get('remotingController').then(function (remotingController) {
            me.source = remotingController.getRemotes();
            me.source.foreach(function (x) {
                if (!x.remoteImage) {
                    x.remoteImage = MEPH.getPath('Providers') + '/babyheadshot.png';
                }
            });
            me.source.on('changed', me.remotesChanged.bind(me));
        });
    },
    remotesChanged: function () {
        var me = this;
        me.source.foreach(function (x) {
            if (!x.remoteImage) {
                x.remoteImage = MEPH.getPath('Providers') + '/babyheadshot.png';
            }
        });
        if (me.updateCallback) {
            me.updateCallback();
        }
    },
    getTemplate: function (data) {
        var me = this;
        if (me.ownsData(data)) {
            return 'Providers.remoteUser.remoteTemplates.remoteUserTemplate.RemoteUserTemplate';
        }
    },
    getItems: function (data, toplevel) {
        var me = this;
        if (data === null) {
            return [{
                topmenu: true,
                name: 'Remote User(s)'
            }]
        }
        return me.source;
    },
    ownsData: function (data) {
        var me = this;
        if (me.source)
            return me.source.contains(function (x) { return x === data; });
        return false;
    },
    /**
     * Handles an item clicked event.
     * @param {Object} data
     * @param {Boolean} getparentdata, If true, the parents data should be retrieve. If no data exists,
     * then return false;
     */
    itemClicked: function (data, getparentdata) {
        var me = this;
        if (getparentdata) {
            return false;
        }
        if (data.topmenu) {
            return me.source;
        }
        return true;
    }
});