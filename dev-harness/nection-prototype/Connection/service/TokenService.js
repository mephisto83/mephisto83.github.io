MEPH.define('Connection.service.TokenService', {
    properties: {
        state: null
    },
    mixins: {
        injectable: 'MEPH.mixins.Injections'
    },
    injections: ['rest', 'stateService'],
    initialize: function () {
        var me = this;

        MEPH.Events(me);
        me.mixins.injectable.init.apply(me);
        me.state = {};

        MEPH.Events(me);
        me.ensureToken();

    },
    getToken: function () {
        var me = this;
        return me.getMessageToken();
    },
    getMessageToken: function () {
        var me = this;
        return me.when.injected.then(function () {
            return me.$inj.stateService.get('Messaging Token');
        }).then(function (token) {
            if (!token) {
                return me.ensureToken();
            }
            return token;
        });
    },
    scheduleTokenRefresh: function (token) {
        var me = this,
            d = new Date(token.expirationDate);
        if (me.$scheduledTimeout) {
            clearTimeout(me.$scheduledTimeout);
            me.$scheduledTimeout = null;
        }
        me.$scheduledTimeout = setTimeout(function () {
            me.retrieveToken().then(function (res) {
                if (res && res.success && res.authorized) {
                    me.$inj.stateService.set('Messaging Token', token);
                    me.scheduleTokenRefresh(res.token);
                }
                else {
                    MEPH.publish(Connection.constant.Constants.FAILED_TO_GET_TOKEN_REFRESH, {});
                    MEPH.Log(Connection.constant.Constants.FAILED_TO_GET_TOKEN_REFRESH);
                }
            });
        }, (d.getTime() - Date.now()) * .23);
    },
    retrieveToken: function () {
        var me = this;
        return me.$inj.rest
                    .nocache()
                    .addPath('account/token')
                    .get();
    },
    ensureToken: function () {
        var me = this;
        return me.when.injected.then(function () {
            var header = me.$inj.rest._header.first(function (x) {
                return x.header === 'mvc-connection.ticket';
            });
            if (header) {
                return header.value;
            }
            else {
                //Assuming usiing tokens for login.
                return me.retrieveToken()
                    .then(function (res) {
                        if (res && res.success && res.authorized) {
                            //   me.scheduleTokenRefresh(res.token);
                            return res.token.value;
                        }
                        return null;
                    });
            }

        }).then(function (token) {
            me.$inj.stateService.set('Messaging Token', token);
            return token;
        });
    }
});