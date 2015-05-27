/**
 * @class MEPH.mobile.services.MobileServices
 * A class for requesting object resources.
 */
MEPH.define('MEPH.mobile.services.MobileServices', {
    alternateNames: 'MEPH.MobileServices',
    requires: ['MEPH.ioc.Container'],
    statics: {
        cache: [],
        /**
         * Gets an instance of the requested service.
         * @param {String} serviceName
         */
        get: function (serviceName) {

            var result,
                cache = MEPH.Array(MEPH.MobileServices.cache),
                serviceConfig = MEPH.IOC.getServices().first(function (x) {
                    return x.name === serviceName;
                });
            MEPH.MobileServices.promise = MEPH.MobileServices.promise || Promise.resolve();
            return MEPH.MobileServices.promise = MEPH.MobileServices.promise.then(function () {
                if (!serviceConfig) {
                    return Promise.resolve().then(function () { return null; });
                }
                if (serviceConfig['static']) {
                    result = cache.first(function (x) { return x.name === serviceName; });
                    if (result) {
                        return Promise.resolve().then(function () { return result.instance; });
                    }
                }
                return MEPH.MobileServices.createInstance(serviceConfig).then(function (instance) {
                    if (serviceConfig['static']) {
                        cache.push({
                            name: serviceConfig.name,
                            config: serviceConfig.config,
                            type: serviceConfig.type,
                            instance: instance
                        });
                    }
                    return instance;
                });
            });
        },
        loadAll: function () {
            var result,
               cache = MEPH.Array(MEPH.MobileServices.cache),
               serviceConfigs = MEPH.IOC.getServices();
            if (!serviceConfigs) {
                return Promise.resolve().then(function () { return null; });
            }
            return Promise.all(serviceConfigs.foreach(function (serviceConfig) {
                if (serviceConfig['static']) {
                    result = cache.first(function (x) { return x.name === serviceConfig.name; });
                    if (result) {
                        return Promise.resolve().then(function () { return result.instance; });
                    }
                }
                return MEPH.MobileServices.createInstance(serviceConfig).then(function (instance) {
                    if (serviceConfig['static']) {
                        cache.push({
                            name: serviceConfig.name,
                            config: serviceConfig.config,
                            type: serviceConfig.type,
                            instance: instance
                        });
                    }
                    return instance;
                });
            }));
        },
        add: function (instance, serviceConfig) {
            var cache = MEPH.Array(MEPH.MobileServices.cache);
            MEPH.IOC.register(serviceConfig);
            cache.push({
                name: serviceConfig.name,
                config: serviceConfig.config,
                type: serviceConfig.type,
                instance: instance
            });
        },
        /**
         * Creates an instance based on the config.
         **/
        createInstance: function (config) {
            return Promise.resolve().then(function () {
                return MEPH.create(config.type).then(function ($class) {
                    var instance = new $class(config.config);
                    return instance;
                })
            });
        }
    }
});