/**
 * @class MEPH.identity.IdentityProvider
 **/
MEPH.define('MEPH.identity.IdentityProvider', {
    requires: [],
    injections: ['overlayService'],
    mixins: {
        injectable: 'MEPH.mixins.Injections'
    },
    properties: {
        promise: null,
        $registeredProviders: null,
        options: null,
        providers: null,
        isReady: false
    },
    initialize: function (options) {
        var me = this;
        MEPH.Events(me);
        me.mixins.injectable.init.apply(me);
        me.providers = options.providers;
        me.promise = Promise.resolve();
    },
    getProviders: function () {
        var me = this;
        return me.$registeredProviders;
    },
    getNameSources: function (observableArray) {
        var me = this;
        return me.get('name', observableArray);
    },
    /**
     * Manages the soures
     * @param {Array} array
     * @return {Promise}
     **/
    source: function (array) {
        var me = this;
        me.ready().then(function (registeredProviders) {
            registeredProviders.select(function (obj) {
                obj.p.source(array);
            });
        });
    },
    get: function (property, observableArray, options) {
        var me = this;
        options = options || {};

        //me.promise = me.promise.then(function () {
        return me.ready().then(function (registeredProviders) {
            me.$inj.overlayService.open('identity-provider');
            return registeredProviders.select(function (obj) {
                return obj.p.property(property);
            });
        }).then(function (promises) {
            promises.foreach(function (promise) {
                promise.then(function (obj) {
                    if (obj === undefined) {
                        throw new Error('no property was retrieved.(' + property + ')');
                    }
                    var objs = !Array.isArray(obj) ? [obj] : obj;
                    objs.foreach(function (obj) {
                        observableArray.removeWhere(function (x) {
                            return x.provider === obj.provider;
                        });
                    })
                    objs.foreach(function (obj) {
                        if (obj.value !== null && obj.value !== undefined) {
                            obj.label = obj.value + ' (' + obj.type + ')';
                            observableArray.push({
                                label: obj.label,
                                provider: options.provider && options.provider == 'name' ? obj.type : obj.provider,
                                type: obj.type,
                                value: obj.value
                            });
                        }
                    });
                }).catch(function (e) {
                    MEPH.Log(e);
                });
            });
            return Promise.all(promises).then(function (res) {
                me.$inj.overlayService.close('identity-provider');
                return res;
            });
        });
        //});

        //return me.promise;
    },
    ready: function () {
        var me = this;
        if (me.readypromise) {
            return me.readypromise;
        }
        me.readypromise = (Promise.resolve().then(function (t) {
            MEPH.Log('Identity provider ready');
            if (me.$registeredProviders && me.$registeredProviders.length) {
                return me.$registeredProviders;
            }
            return Promise.all(me.providers.select(function (provider) {
                MEPH.Log('Create ' + provider.type);
                return MEPH.create(provider.type).then(function ($class) {
                    MEPH.Log('Creating ' + provider.type);
                    var p = new $class(provider.args);
                    MEPH.Log('Created ' + provider.type);
                    return p.ready().then(function (key) {
                        return {
                            p: p,
                            type: provider.type,
                            key: key
                        };
                    });
                })
            }));
        }).then(function (providers) {
            MEPH.Log('Loaded providers');
            me.$registeredProviders = providers;
            me.fire('isready', { isready: true })
            return me.$registeredProviders;
        }));
        return me.readypromise;
    }
})