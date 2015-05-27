/**
* @class MEPH.mobile.Application
* Represents functionality for a mobile application.
*/
MEPH.define('MEPH.mobile.Application', {
    extend: 'MEPH.application.Application',
    requires: ['MEPH.mobile.application.container.MobileApplicationContainer',
               'MEPH.mobile.application.controller.MobileApplicationController'],
    statics: {
        mobileApplication: function (config) {
            var application = new MEPH.mobile.Application(config);
            return application;
        }
    },
    properties: {
        applicationLogoCls: 'meph-application-logo',
        mobileApplicationContainer: 'mobileapplicationcontainer',
        controllerType: 'MEPH.mobile.application.controller.MobileApplicationController',
        applicationName: null
    },
    initialize: function (config) {
        var me = this;
        me.callParent.apply(me, arguments);
    },
    getApplicationCls: function () {
        var me = this;
        return me.applicationLogoCls;
    },
    getProduct: function () {
        var me = this;
        return me.product;
    },
    getApplicationName: function () {
        var me = this;
        return me.applicationName;
    },
    getActivityDom: function () {
        var me = this;
        return document.querySelector('.meph-mobile-application-container');
    },
    /**
     * Before loading of the application dom objects.
     **/
    beforeLoad: function () {
        var me = this;
        me.injectMobileApp();
    },
    injectMobileApp: function () {
        var me = this,
            dom,
            generatedDom;
        dom = me.getAppDom();
        generatedDom = me.createMobileAppContainerDom();
        dom.appendChild(generatedDom);
    },
    createMobileAppContainerDom: function () {
        var me = this, dom = document.createElement(me.mobileApplicationContainer);

        dom.setAttribute(MEPH.dataObjectReferenceAttribute, '"ct$": "' + me.controllerType + '"');
        return dom;
    }
}).then(function () {
    MEPH.App = MEPH.mobile.Application;
});