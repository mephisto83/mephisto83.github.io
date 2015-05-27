/**
 * @class
 * Defines an example activity.
 **/
MEPH.define('MEPHTests.helper.activity.HelperActivity', {
    extend: 'MEPH.control.Control',
    alias: 'helperactivityview',
    mixins: ['MEPH.mobile.mixins.Activity'],
    templates: true,
    requires: ['MEPH.mobile.mixins.Activity'],
    initialize: function () {
        var me = this;
        me.callParent.apply(me, arguments);
    },

    close: function () { return Promise.resolve().then(function () { return true; }); },
    hide: function () { return Promise.resolve().then(function () { return true; }); },
    show: function () { return Promise.resolve().then(function () { return true; }); },
    open: function () { return Promise.resolve().then(function () { return true; }); }
});