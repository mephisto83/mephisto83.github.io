MEPH.define('Connection.account.view.AccountResolution', {
    alias: 'account_resolution_view',
    templates: true,
    extend: 'MEPH.mobile.activity.container.Container',
    requires: ['MEPH.util.Observable', 'MEPH.list.List', 'MEPH.button.Button'],
    injections: ['identityProviderService', 'userService'],
    properties: {
        name: null,
        accounts: null,
        $promise: null,
        accountgroups: null
    },
    onLoaded: function () {
        var me = this;
        me.great();
        me.activityview.hideFooter();
        me.activityview.hideHeader();
    },
    afterShow: function () {
        var me = this;
        var args = me.activityArguments;
        me.accountgroups = me.accountgroups || MEPH.util.Observable.observable([]);
        if (args.situation && args.situation.attachedProvider) {
            for (var contactid in args.situation.attachedProvider) {
                var contactaccounts = me.accountgroups.first(function (x) { return x.contactid === contactid; });
                var source = args.situation.attachedProvider[contactid].select(function (x) {
                    if (x === 'google') {
                        return 'google-plus'
                    }
                    return x;
                });
                if (!contactaccounts) {
                    me.accountgroups.push({
                        contactid: contactid,
                        source: source
                    });
                }
                else {
                    contactaccounts.source = source;
                }
            }
        }
    },
    mergeAccounts: function () {
        var me = this;
        me.when.injected.then(function () {
            return me.$inj.userService.mergeAccounts();
        })
    },
    toBtnCls: function (t) {
        var me = this;
        return 'btn btn-block btn-social btn-' + t;
    },
    toIconCls: function (t) {
        var me = this;

        return 'fa fa-' + t;
    }
});