/**
* @class Connection.application.container.ApplicationContainer
* Connection application container.
*/
MEPH.define('Connection.application.container.ApplicationContainer', {
    extend: 'MEPH.mobile.application.container.MobileApplicationContainer',
    templates: true,
    alias: 'connectionapplication',
    requires: ['Connection.application.header.ApplicationHeader']

});