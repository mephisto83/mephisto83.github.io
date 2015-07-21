MEPH.define('Connection.fakelogin.view.FakeLogin', {
    alias: 'fakelogin_connection_view',
    templates: true,
    requires: ['Connection.constant.Constants'],
    extend: 'MEPH.mobile.activity.container.Container',
    mixins: ['MEPH.mobile.mixins.Activity'],
    properties: {
        name: null
    },
    initialize: function () {
        var me = this;
        me.callParent.apply(me, arguments);
        me.on('load', me.onLoaded.bind(me));
    },
    onLoaded: function () {
        var me = this;
        me.name = 'Fake login';
    },
    continueTo: function () {
        MEPH.publish(MEPH.Constants.OPEN_ACTIVITY, { viewId: 'SyncPage', path: 'sync/contacts' });
        MEPH.publish(Connection.constant.Constants.LoggedIn, {})
    }
});