MEPH.define('Connection.session.Handler', {
    extend: 'MEPH.mobile.providers.identity.view.Handler',

    injections: ['identityProviderService', 'notificationService', 'relationshipService'],
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