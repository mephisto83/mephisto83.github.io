/**
 * @class MEPH.util.Manifest
 * Will build the list of resources necessary to run the site.
 *
 **/
MEPH.define('MEPH.util.Manifest', {
    requires: ['MEPH.mobile.services.MobileServices',
        'MEPH.util.Dom',
        'MEPH.util.String',
        'MEPH.util.Template',
        'MEPH.mobile.Application',
        'MEPH.application.Application',
        'MEPH.util.Array',
        'MEPH.bind.Binder',
        'MEPH.dom.ControlLoader',
        'MEPH.util.Observable'],
    /**
     * Gets all the views in the application.
     **/
    getViews: function () {
        var me = this;
        return MEPH.MobileServices.get('viewProvider').then(function (viewProvider) {
            return viewProvider.getViews();
        });
    },
    /**
     * Loads all the view and dependencies.
     **/
    loadViews: function () {
        var me = this;
        return me.getViews().then(function (viewConfigs) {
            var promise = Promise.resolve();
            viewConfigs.foreach(function (x) {
                promise = promise.then(function () {
                    return MEPH.create(x.view);
                }).then(null, function (error) {
                    MEPH.Log(error);
                }).then(function () {
                    if (x.controller)
                        return MEPH.create(x.controller);
                }).then(null, function (error) {
                    MEPH.Log(error);
                }).then(function () {
                    if (x.presenter)
                        return MEPH.create(x.presenter);
                }).then(null, function (error) {
                    MEPH.Log(error);
                });
            })
            return promise;
        }).then(function(){
            return MEPH.MobileServices.loadAll();
        }).then(function (x) {
            var classes = MEPH.getDefinedClasses(),
                templates = MEPH.getTemplates();
            return {
                classes: classes,
                templates: templates
            };
        });;
    }
});