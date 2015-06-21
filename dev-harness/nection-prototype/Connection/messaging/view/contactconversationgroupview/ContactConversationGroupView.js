MEPH.define('Connection.messaging.view.contactconversationgroupview.ContactConversationGroupView', {
    alias: 'contactconversationgroupview',
    templates: true,
    requires: ['MEPH.button.IconButton'],
    extend: 'MEPH.mobile.activity.view.ActivityView',
    injections: [],
    properties: {
    },
    onLoaded: function () {
        var me = this;
        me.great()
        me.hideCloseBtn()
        me.hideFooter();
        me.hideHeaderName();
    },
    goBack: function () {
        var me = this;
        history.back();
    }
});