MEPH.define('Connection.messaging.view.chatview.ChatView', {
    alias: 'chatview',
    templates: true,
    requires: ['MEPH.button.IconButton',
        'MEPH.util.Binder',
                'Connection.template.ContactListItem',
                'MEPH.input.Typeahead'],
    extend: 'MEPH.mobile.activity.view.ActivityView',
    properties: {
        showEverything: false
    },
    onLoaded: function () {
        var me = this;
        me.great()
        me.showEverything = true;
        me.hideFooter();
        me.hideCloseBtn()
    },
    showTypeahead: function () {
        var me = this;
        MEPH.util.Style.show(me.typeaheadHolder);
    },
    focusTypeahead: function () {
        var me = this;
        if (me.typeahead)
            me.typeahead.focus();
    },
    getSearchValue: function () {
        var me = this;
        return me.typeahead.getRawValue();
    }
});