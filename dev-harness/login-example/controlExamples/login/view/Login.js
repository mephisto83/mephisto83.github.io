MEPH.define('Login.login.view.Login', {
    alias: 'login_view',
    templates: true,
    extend: 'MEPH.mobile.activity.container.Container',
    mixins: ['MEPH.mobile.mixins.Activity'],
    injections: ['identityProvider'],
    requires: ['MEPH.util.Observable',
        'MEPH.input.Dropdown',
        'MEPH.util.Style',
        'MEPH.button.Button'],
    properties: {
        name: null
    },
    onLoaded: function () {
        var me = this;
        me.name = 'Login(s)';
    },
    logInWithGoogle: function () {
        var me = this;
        if (me.$inj && me.$inj.identityProvider) {
            return me.$inj.identityProvider.ready().then(function (res) {

                var googleprovider = res.first(function (t) {
                    return t.key === 'google'
                });
                if (googleprovider) {
                    {
                        googleprovider = googleprovider.p;
                        return googleprovider.login();
                    }
                }
            });
        }
    },
    getMeWithGoogle: function () {
        var me = this;
        if (me.$inj && me.$inj.identityProvider) {
            return me.$inj.identityProvider.ready().then(function (res) {

                var googleprovider = res.first(function (t) {
                    return t.key === 'google'
                });
                if (googleprovider) {
                    {
                        googleprovider = googleprovider.p;
                        return googleprovider.contact();
                    }
                }
            });
        }
    }
});