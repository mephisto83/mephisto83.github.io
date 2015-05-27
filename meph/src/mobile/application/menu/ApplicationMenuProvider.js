/**
 * @class MEPH.mobile.application.menu.ApplicationMenuProvider
 * An application menu provider.
 */
MEPH.define('MEPH.mobile.application.menu.ApplicationMenuProvider', {
    initialize: function (config) {
        var me = this;
        me.config = config;
        me.providers = [];

    },
    /**
     * Gets the menu providers
     * @returns {Promise}
     */
    getMenuItemProviders: function () {
        var me = this;
        if (me.providers.length > 0) {
            return Promise.resolve().then(function () { return me.providers; });
        }

        return Promise.all(me.config.providers.select(function (provider) {
            return MEPH.MobileServices.get(provider).then(function (instance) {
                me.providers.push(instance);
            });
        })).then(function () {
            return me.providers;
        });;
    }
});