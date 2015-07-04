MEPH.define('Connection.messaging.view.editconversationgroupview.EditConversationGroupView', {
    alias: 'ediconversationgroupview',
    templates: true,
    requires: ['MEPH.button.IconButton'],
    extend: 'MEPH.mobile.activity.view.ActivityView',
    injections: [
        'relationshipService',
        'overlayService',
        'stateService'],
    properties: {
    },
    onLoaded: function () {
        var me = this;
        me.great()
        me.hideCloseBtn()
        me.hideFooter();
        me.hideHeaderName();
    },
    showTypeahead: function () {
        var me = this;
    },
    focus: function () {
        var me = this;
    },
    focusTypeahead: function () {
        var me = this;
    },
    getSearchValue: function () {
        var me = this;
        return me.typeahead.getRawValue();
    }
});