MEPH.define('MEPH.mobile.application.logo.MobileApplicationLogo', {
    extend: 'MEPH.control.Control',
    templates: true,
    alias: 'applicationlogo',
    properties: {
        logoCls: null
    },
    getLogoCls: function (value) {
        var me = this,
            application;
        application = me.getApplication();
        return application.getApplicationCls();
        return value;
    },
    setApplication: function () {
        var me = this;
        
        me.callParent.apply(me, arguments);
    }
});