MEPH.define('Connection.main.view.editrelationship.relationshipview.RelationshipView', {
    alias: 'relationshipview',
    templates: true,
    requires: ['MEPH.button.IconButton'],
    extend: 'MEPH.mobile.activity.view.ActivityView',
    onLoaded: function () {
        var me = this;
        me.great()
        me.hideHeader();
        me.hideCloseBtn()
        me.hideFooter();
    }
});