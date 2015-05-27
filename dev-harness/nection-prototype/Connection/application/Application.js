/**
* @class Connection.application.Application
* Represents functionality for a mobile application.
*/
MEPH.define('Connection.application.Application', {
    extend: 'MEPH.mobile.Application',
    requires: ['Connection.application.container.ApplicationContainer'],
    statics: {
        mobileApplication: function (config) {
            var application = new Connection.application.Application(config);
            return application;
        }
    },
    properties: {
        applicationLogoCls: 'connection-application-logo',
        mobileApplicationContainer: 'connectionapplication',
    },
    //createMobileAppContainerDom: function () {
    //    var dom = document.createElement('mobileApplicationContainer'),
    //        me = this;;
    //    dom.setAttribute(MEPH.dataObjectReferenceAttribute, '"ct$": "' + me.controllerType + '"');
    //    return dom;
    //}
}).then(function () {
    MEPH.App = Connection.application.Application;
})