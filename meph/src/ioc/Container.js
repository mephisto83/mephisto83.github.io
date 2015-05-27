/**
* @class MEPH.ioc.Container
* IOC container.
*/
MEPH.define('MEPH.ioc.Container', {
    alternateNames: 'MEPH.IOC',
    statics: {
        /**
         * @private
         * Service definitions.
         **/
        serviceDefinitions: [],
        /**
         * Registers a service.
         * @param {Object} config
         * @param {String} config.name
         * @param {String} config.type
         * @param {Object} config.config
         */
        register: function (config) {
            MEPH.Array(MEPH.IOC.serviceDefinitions);
            return Promise.resolve().then(function () {
                return MEPH.IOC.hasService(config.name);
            }).then(function (hasService) {
                changed = hasService;
                MEPH.IOC.serviceDefinitions.removeWhere(function (x) {
                    return x.name === config.name;
                });
            }).then(function () {
                MEPH.IOC.serviceDefinitions.push(config);
            }).then(function () {
                if (changed) {
                    MEPH.publish(MEPH.Constants.serviceTypeChanged, config.name, config.type);
                }
            });

        },
        clearServices: function () {
            MEPH.IOC.serviceDefinitions.removeWhere(function (x) {
                return true;
            });
        },
        /**
         * Unregisters a service.
         * @param {String} serviceName
         **/
        unregister: function (serviceName) {
            MEPH.IOC.serviceDefinitions.removeWhere(function (x) {
                return x.name === serviceName; s
            });
        },
        getServices: function () {
            return MEPH.Array(MEPH.IOC.serviceDefinitions);
        },
        /**
         * Returns if there is a registered service will that name.
         * @param {String} name
         * @returns {Boolean}
         */
        hasService: function (name) {
            MEPH.Array(MEPH.IOC.serviceDefinitions);
            return MEPH.IOC.serviceDefinitions.some(function (x) {
                return x.name === name;
            });
        }
    }
});