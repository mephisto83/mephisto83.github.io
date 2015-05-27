//MEPH.mobile.activity.container.Container
MEPH.define('MEPH.mobile.providers.identity.view.Handler', {
    alias: 'meph_mobile_handler',
    templates: true,
    extend: 'MEPH.mobile.activity.container.Container',
    mixins: ['MEPH.mobile.mixins.Activity'],
    injections: ['identityProvider'],
    requires: [],
    properties: {
    },
    initialize: function () {
        var me = this;
        me.great();
    },
    onLoaded: function () {
        var me = this;
    },
    handleResults: function (res) {
    },
    afterShow: function () {
        var me = this;

        me.when.injected.then(function () {
            var pathname = location.pathname;
            return me.$inj.identityProvider.ready().then(function (x) {
                var provider = x.first(function (x) {
                    return pathname === '/login/' + x.key;
                });
                if (provider) {
                    return provider.p.handleRedirection().then(function (res) {
                        return me.handleResults(res)
                    });
                }
                else {
                    //probably should just go to the home page.
                }
            });
        })

        return me.great();
    }
});