MEPH.define('Connection.sync.view.syncactivity.SyncView', {
    alias: 'syncview',
    templates: true,
    requires: ['MEPH.button.IconButton'],
    extend: 'MEPH.mobile.activity.view.ActivityView',
    onLoaded: function () {
        var me = this;
        me.great()
        me.hideCloseBtn()
    }
});