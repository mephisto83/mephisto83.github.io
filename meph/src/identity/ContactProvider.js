/**
 * @class MEPH.identity.ContactProvider
 **/
MEPH.define('MEPH.identity.ContactProvider', {
    requires: [],
    mixins: {
        injectable: 'MEPH.mixins.Injections'
    },
    properties: {
        promise: null,
        $registeredProviders: null,
        options: null,
        providers: null
    },
    injections: ['identityProvider'],
    initialize: function () {
        var me = this;
        MEPH.Events(me);
        me.mixins.injectable.init.apply(me);
        me.promise = Promise.resolve();
    },
    onInjectionsComplete: function () {
        var me = this;
        if (me.$inj && me.$inj.identityProvider) {
            me.$inj.identityProvider.on('isready', function () {

            });
        }
    },
    contacts: function () {
        var me = this;
        if (me.$inj && me.$inj.identityProvider && me.$inj.identityProvider.isReady) {
            var providers = me.$inj.identityProvider.getProviders();
            return Promise.all(providers.select(function (provider) {
                return provider.p.contacts();
            }));
        }
        else if (me.$inj && me.$inj.identityProvider) {
            return new Promise(function (r) {
                me.$inj.identityProvider.on('isready', function () {
                    var providers = me.$inj.identityProvider.getProviders();
                    return Promise.all(providers.select(function (provider) {
                        return provider.p.contacts();
                    })).then(function () {
                        r();
                    });
                });
            })
        }
        return null;
    }
});