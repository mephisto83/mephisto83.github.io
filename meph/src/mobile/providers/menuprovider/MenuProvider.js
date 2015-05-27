/**
 * @class MEPH.mobile.providers.menuprovider.MenuProvider
 * Providers menu information.
 */
MEPH.define('MEPH.mobile.providers.menuprovider.MenuProvider', {
    properties: {
        configuration: null,
        menuLibrary: null
    },
    initialize: function (config) {
        var me = this;
        me.configuration = config;
    },
    /**
     * Gets the view.
     * @param {Object} view
     * @returns {Promise}
     */
    getMenu: function (view) {
        var me = this,
            promise;
        if (me.menuLibrary) {
            promise = Promise.resolve();
        }
        else {
            promise = me.load();
        }
        return promise.then(function () {
            return (me.menuLibrary[me.libraryRoot] || me.menuLibrary.menu);
        });
    },
    /**
     * Loads the view configuration from the server.
     **/
    load: function (configuration) {
        var me = this,
            resource;

        configuration = configuration || me.configuration;

        if (configuration) {
            resource = configuration.viewsResource;
            return Promise.resolve().then(function () {
                var path = MEPH.getPath(resource.path);
                path = path[path.length - 1] === MEPH.folderPathSeparator ?
                path + resource.uri :
                path + MEPH.folderPathSeparator + resource.uri;

                return MEPH.ajaxJSON(path, {
                    requestHeaders: [{
                        header: 'Accept',
                        value: 'application/json'
                    }]
                }).then(function (response) {
                    var json = response.responseJSON;
                    me.menuLibrary = json;
                    me.libraryRoot = configuration.root;
                    return response;
                });
            });
        }
        else {
            return Promise.resolve().then(function () {
                throw 'no configuration in MenuProvider';
            });
        }
    }
});