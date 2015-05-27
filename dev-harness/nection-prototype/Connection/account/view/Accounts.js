MEPH.define('Connection.account.view.Accounts', {
    alias: 'account_view_connection',
    templates: true,
    extend: 'Connection.control.accountbase.AccountBase',
    mixins: ['MEPH.mobile.mixins.Activity'],
    requires: ['MEPH.util.Observable', 'MEPH.list.List', 'MEPH.button.Button'],
    injections: ['identityProviderService', 'userService'],
    properties: {
        name: null,
        accounts: null,
        $promise: null
    },
    onLoaded: function () {
        var me = this;
        me.great();
        me.activityview.hideFooter();
        me.activityview.hideHeader();
    }
});