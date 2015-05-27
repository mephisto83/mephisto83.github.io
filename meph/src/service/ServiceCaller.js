MEPH.define('MEPH.service.ServiceCaller', {
    properties: {
        defaultResourceEndpoint: null,
        apiPath: null
    },

    initialize: function (args) {
        var me = this, i;
        MEPH.apply(args, me);
    },
    setDefaultResourceEndpoint: function (endpoint) {
        var me = this;
        me.defaultResourceEndpoint = endpoint || '';
    },
    getDefaultResourceEndpoint: function () {
        var me = this;
        return me.defaultResourceEndpoint;
    },
    setApiPath: function (value) {
        var me = this;
        me.apiPath = value;
    },
    getApiPath: function () {
        var me = this;
        return me.apiPath || '';
    },
    call: function (path) {
        var me = this;
        return MEPH.ajax(me.getDefaultResourceEndpoint() + me.getApiPath() + path);
    }

});