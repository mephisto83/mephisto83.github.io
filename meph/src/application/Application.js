/**
 * @class MEPH.application.Application
 * Defines an application
 **/
MEPH.define('MEPH.application.Application', {
    requires: ['MEPH.dom.ControlReader',
                'MEPH.Constants',
                'MEPH.ioc.Container',
                'MEPH.mobile.services.MobileServices',
                'MEPH.mixins.Observable',
                'MEPH.mobile.activity.ActivityController',
                'MEPH.util.Style',
                'MEPH.util.Dom', 'MEPH.mixins.Injections',
                'MEPH.bind.Binder',
                'MEPH.dom.ControlLoader'],
    injections: ['notificationService'],
    mixins: {
        observable: 'MEPH.mixins.Observable',
        injections: 'MEPH.mixins.Injections'
    },
    properties: {
        /**
         * IOC service name for the session manager.
         **/
        sessionManager: 'sessionManager',
        /**
         * @property {String} applicationSelector
         * Css selector to find the application dom.
         **/
        applicationSelector: 'body',
        /**
         * @property {MEPH.dom.ControlReader} controlReader
         */
        controlReader: null,
        /**
         * @property {MEPH.dom.ControlLoader} controlLoader
         */
        controlLoader: null,
        /**
         * Initial setup of the app dom.
         */
        $initialSetupHTML: null,

        /**
         * An array of all the instances with in the system.
         **/
        classInstances: null,
        /**
         * An array of all the control within the system.
         **/
        controlInstances: null,
        /**
         * @property {MEPH.mobile.activity.ActivityController} activityController
         * An activity controller
         **/
        activityController: null
    },
    getAppDom: function () {
        var me = this;
        return document.querySelector(me.applicationSelector);
    },
    /**
     * Returns a promise which be the best place for starting an application
     **/
    ready: function () {
        var me = this;
        return me.start();
    },
    /**
     * @private
     * @returns {Promise}
     **/
    start: function () {
        var me = this;
        window.MEPH.App = me;
        return Promise.resolve()
            .then(function () {
                return new Promise(function (r, f) {
                    var tid = setInterval(function () {
                        if (document.readyState !== 'complete') return;
                        clearInterval(tid);
                        // do your work
                        r();
                    }, 100);
                })
            })
            .then(me.storeIntialSetup.bind(me))
            .then(me.applyIOC.bind(me))
            .then(me.checkSession.bind(me))
            .then(me.beforeLoad.bind(me))
            .then(function () {
                var dom = me.getAppDom(),
                    viewobjects;

                viewobjects = me.getAppViewObjects();
                return viewobjects
            })
            .then(me.loadViewObject.bind(me))
            .then(me.applicationReady.bind(me))
            .then(me.setupActivityController.bind(me))
            .then(me.setupRemoting.bind(me))
            .then(me.startHomePage.bind(me))
            .then(function () {
                return me;
            });

    },
    /**
     * Checks whether or not it is required to log in or not. If so, then will start the login process.
     */
    checkSession: function () {
        var me = this;
        return MEPH.MobileServices.get(me.sessionManager).then(function (sessionmanager) {
            if (sessionmanager) {
                if (sessionmanager.requiresLogin() && !sessionmanager.isLoggedIn()) {
                    return sessionmanager.beginLogin();
                }
            }
        });
    },
    /**
     * Gets the activity dom.
     * @returns {Object}
     **/
    getActivityDom: function () {
        return null;
    },
    setupRemoting: function () {
        return MEPH.MobileServices.get('remotingController').then(function (remotingController) {
            if (remotingController) {
                remotingController.remoting(true);
            }
        });
    },
    /**
     * @private
     * Setups activity controller
     **/
    setupActivityController: function () {
        var me = this,
            activityController = me.getActivityController();
        if (activityController) {
            activityController.setAppPath(me.appPath);
            activityController.setApplication(me);
            activityController.setActivityHolder(me.getActivityDom());
            //activityController.remoting(true);
        }
    },
    /**
     * Starts the homepage if available.
     * @returns {Promise}
     */
    startHomePage: function () {
        var me = this,
            activityController = me.getActivityController(),
            promise = Promise.resolve();
        if (me.homeView && activityController) {

            promise = promise.then(function () {
                return activityController.startHome(me.homeView);
            });

        }
        return promise;
    },
    /**
     * Creates the config.
     **/
    create: function (classifiedName, dom, injections) {
        return Promise.resolve().then(function () {
            return MEPH.requires(classifiedName);
        }).then(function () {
            var information = MEPH.getDefinedClassInformation(classifiedName),
                node;
            node = dom || document.createElement(information.alias);
            return {
                alias: information.alias,
                node: node,
                injections: injections
            }
        })
    },
    /**
     * Creates and loads.
     */
    createAndLoad: function (dom, placeToLoad, parent) {
        var me = this, alias, templateInfo;
        templateInfo = MEPH.getTemplate(dom.nodeName.toLowerCase());
        return me.create(templateInfo.classifiedName, dom).then(function (results) {
            return me.loadViewObject([results], placeToLoad, parent);
        });
    },
    applyIOC: function () {
        var me = this,
            config,
            promises = [],
            i;
        for (i in me.ioc) {
            if (me.ioc.hasOwnProperty(i)) {
                config = me.ioc[i];
                config.name = i;
                promises.push(MEPH.IOC.register(config));
            }
        }
        return Promise.all(promises);
    },
    beforeLoad: function () {
    },
    applicationReady: function () {
        var me = this,
            promise = Promise.resolve();
        return promise.then(function () {
            me.fire(MEPH.Constants.applicationReady, { application: me });
        });
    },
    /**
     * @private
     * Stores the intial setup of the page.
     */
    storeIntialSetup: function () {
        var me = this;
        me.$initialSetupHTML = me.getAppDom().innerHTML;

    },
    /**
     * Loads and initializes the view objects.
     * @param {Array} viewObjectNodes An array of html nodes.
     * @param {Object} dom
     * @param {Object} parent
     * @returns {Promise}
     */
    loadViewObject: function (viewObjectNodes, dom, parent) {
        var me = this;
        return Promise.resolve().then(function () { return me.controlLoader.loadControls(viewObjectNodes, parent, me) })
        .then(function (results) {
            return me.controlLoader.generateBoundControls(results);
        })
        .then(function (results) {
            return me.controlLoader.loadSubControls(results, me);
        }).then(function (results) {
            results.foreach(function (result) {
                result.templateNode.foreach(function (templateNode) {
                    (dom || me.getAppDom()).appendChild(templateNode);
                });
            });
            results.foreach(function (result) {
                me.fireLoad(result.classInstance);
            });
            results.foreach(function (result) {
                me.fireAfterLoad(result.classInstance);
            });
            return results;
        });
    },
    /**
     * @param {Array} controlObjects
     * @returns {Promise}
     */
    loadSubControls: function (controlObjects) {
        var me = this, results;
        results = me.controlLoader.loadSubControls(Array.isArray(controlObjects) ? controlObjects : [controlObjects], me);//.then(function (results) {
        results.foreach(function (result) {
            me.fireLoad(result.classInstance);
        });
        results.foreach(function (result) {
            me.fireAfterLoad(result.classInstance);
        });
        return results;
    },
    /**
     * Fire the load event.
     * @param {MEPH.control.Control} control
     **/
    fireLoad: function (control) {
        var me = this;
        control.getSubControls().foreach(function (subcontrol) {
            me.fireLoad(subcontrol);
        });
        if (!control.loaded) {
            control.fire('load');
        }

    },
    fireAfterLoad: function (control) {
        var me = this;
        if (!control.afterloaded) {
            control.fire('afterload');
        }
        control.getSubControls().foreach(function (subcontrol) {
            me.fireAfterLoad(subcontrol);
        });
    },
    /**
     * Gets the app view objects. 
     * Objects which will be used to start the view initialization process.
     **/
    getAppViewObjects: function () {
        var me = this,
            dom;
        dom = me.getAppDom();
        return me.controlReader.getChildViewObjects(dom);
    },
    /**
     * Gets view objects from the dom.
     **/
    getViewObjects: function (dom) {
        var me = this;
        return me.controlReader.getChildViewObjects(dom);
    },
    /**
     * Finds view objects within the app dom
     */
    findViewObjects: function () {
        var me = this,
            dom;
        dom = me.getAppDom();
        return me.controlReader.getViewObjects(dom);
    },
    /**
     * @private
     * Adds an instance of an object to the application
     * @param {Object} instance
     */
    addInstance: function (instance) {
        var me = this;
        if (instance && !me.classInstances.some(function (x) { return x === instance; })) {
            me.classInstances.push(instance);
            me.fire('instanceadded', instance);
        }
    },
    /**
     * Adds an instance of  a control to the application
     * @param {MEPH.control.Control} control
     **/
    addControl: function (control) {
        var me = this;
        if (control && !me.controlInstances.some(function (x) { return x === control; })) {
            me.controlInstances.push(control);
            me.fire('controladded', control);
        }
    },
    /**
     * Gets the activity controller.
     **/
    getActivityController: function () {
        var me = this;
        return me.activityController;
    },
    initialize: function (config) {
        var me = this;
        me.mixins.observable.init.apply(me);
        me.classInstances = [];
        me.controlInstances = [];
        me.controlReader = new ControlReader();
        me.controlLoader = new ControlLoader();
        me.activityController = new ActivityController();


        MEPH.MobileServices.add(me.activityController, {
            'static': true,
            name: 'activitycontroller',
            config: null,
            type: 'MEPH.mobile.activity.ActivityController'
        })
        MEPH.ActivityController = me.activityController;
        if (config) {
            MEPH.apply(config, me);
        }
        if (me.activityController && config)
            me.activityController.nostate = config.nostate;
    }
});