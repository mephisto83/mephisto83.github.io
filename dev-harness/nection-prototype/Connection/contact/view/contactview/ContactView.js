MEPH.define('Connection.contact.view.contactview.ContactView', {
    alias: 'meview',
    templates: true,
    requires: ['MEPH.button.IconButton',
                'Connection.template.Card',
                'MEPH.input.Typeahead'],
    extend: 'MEPH.mobile.activity.view.ActivityView',
    onLoaded: function () {
        var me = this;
        me.great()
        me.hideCloseBtn()
    }
});