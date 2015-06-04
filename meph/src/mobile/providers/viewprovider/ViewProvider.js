/**
 * @class MEPH.mobile.providers.viewprovider.ViewProvider
 * Provides view definitions.
 **/
MEPH.define('MEPH.mobile.providers.viewprovider.ViewProvider', {
    injections: ['storage'],
    properties: {
        configuration: null,
        viewlibrary: null
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
    getView: function (view) {
        var me = this,
            promise;
        MEPH.Log('Getting view');
        if (me.viewlibrary) {
            MEPH.Log('view library loaded already');
            promise = Promise.resolve();
        }
        else {
            MEPH.Log('view library loading');
            promise = me.load();
        }
        return promise.then(function () {
            MEPH.Log('searching library for view.');
            return MEPH.Array(me.viewlibrary[me.libraryRoot] || me.viewlibrary.views).first(function (x) {
                return x.viewId === view.viewId;
            });
        });
    },
    /**
     * Gets all the view information.
     **/
    getViews: function () {
        var me = this,
           promise;
        if (me.viewlibrary) {
            promise = Promise.resolve();
        }
        else {
            promise = me.load();
        }
        return promise.then(function () {
            return MEPH.Array(me.viewlibrary[me.libraryRoot] || me.viewlibrary.views)
        })['catch'](function (e) {
            MEPH.Log(e);
        });
    },
    /**
     * Loads the view configuration from the server.
     **/
    load: function (configuration) {
        var me = this,
            resource;

        configuration = configuration || me.configuration;
        MEPH.Log('Load configuration');
        if (configuration) {
            resource = configuration.viewsResource;
            return Promise.resolve().then(function () {
                var path = MEPH.getPath(resource.path);
                path = path[path.length - 1] === MEPH.folderPathSeparator ?
                path + resource.uri :
                path + MEPH.folderPathSeparator + resource.uri;

                MEPH.Log('Load path: ' + path);
                return MEPH.ajaxJSON(path, {
                    requestHeaders: [{
                        header: 'Accept',
                        value: 'application/json'
                    }]
                }).then(function (response) {
                    MEPH.Log('Loaded ' + response.responseJSON);
                    var json = response.responseJSON;
                    me.viewlibrary = json;
                    me.libraryRoot = configuration.root;
                    return response;
                })['catch'](function (e) {
                    MEPH.Log('There was a problem loading the configuration');
                    for (var i in e) {
                        MEPH.Log('i ' + i);
                        MEPH.Log('e ' + e[i]);
                    }
                    return Promise.reject(e);
                });
            });
        }
        else {
            return Promise.resolve().then(function () {
                throw 'no configuration in ViewProvider';
            });
        }
    }
});