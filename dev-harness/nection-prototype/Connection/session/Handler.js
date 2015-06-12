MEPH.define('Connection.session.Handler', {
    extend: 'MEPH.mobile.providers.identity.view.Handler',

    injections: ['identityProviderService',
        'system',
        'notificationService', 'relationshipService'],
    afterShow: function () {
        var me = this,
            location = window.location.href;
        me.location = location;
        return me.when.injected.then(function () {
            return me.$inj.system.getViewCurrentLocationDefinition().then(function (view) {
                if (view && view.viewId && view.viewId === 'LogOutHandler') {
                    MEPH.publish(MEPH.Constants.LOGOUT, {});
                    me.handleResults(true);
                }
                else {
                    return me.great();
                }
            });
        }).catch(function () {
            debugger
        })
    },
    handleResults: function (res) {
        var me = this;
        if (res) {
            me.when.injected.then(function () {
                me.$inj.identityProviderService.updateProviders().then(function (res) {
                    MEPH.publish(MEPH.Constants.OPEN_ACTIVITY, { viewId: 'main', path: '/main' });
                })
            });

        }
    }
})