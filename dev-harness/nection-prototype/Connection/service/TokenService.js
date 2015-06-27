MEPH.define('Connection.service.TokenService', {
    properties: {
        $maxNumberOfRefreshAttempts: 10,
        state: null,
        refreshTokenKey: 'connectino-service-refresh-token',
        userIdKey: 'connection-serivce-userid-key',
        tokenKey: 'connection-service-token'
    },
    mixins: {
        injectable: 'MEPH.mixins.Injections'
    },
    injections: ['rest',
        'storage',
        'stateService'
    ],
    initialize: function () {
        var me = this;

        MEPH.Events(me);
        me.mixins.injectable.init.apply(me);
        me.state = {};

        MEPH.Events(me);
    },

    setHeaders: function (result) {
        var me = this;
        me.$inj.rest.setHeader('mvc-connection.ticket', result.token);
        me.$inj.rest.setHeader('contactId', result.contactId);
        me.$inj.stateService.set('Messaging Token', result.token);
        me.setUserId(result.contactId);
        me.$unsuccessfulRefresh = 0;
    },
    scheduleTokenRefresh: function (response) {
        var me = this;
        if (me.$tokenResfresh) {
            return;
        }
        me.$tokenResfresh = setTimeout(function () {
            me.$inj.rest.nocache().addPath('refresh/token').get()
                .then(function (result) {
                    me.$tokenResfresh = null;
                    if (result.success && result.authorized) {
                        me.setHeaders(result);
                        me.scheduleTokenRefresh(result);
                    }
                    else {
                        me.$unsuccessfulRefresh = me.$unsuccessfulRefresh || 0;
                        me.$unsuccessfulRefresh++;
                        if (me.$unsuccessfulRefresh < me.$maxNumberOfRefreshAttempts) {
                            me.scheduleTokenRefresh(response);
                        }
                        else {
                            me.refreshToken();
                        }
                    }
                })
        }, 10000)//(response.expiration * .7) ||
    },
    refreshToken: function () {
        var me = this;
        return me.getUserId().then(function (userid) {
            return me.getRefreshToken().then(function (refreshtoken) {
                return me.$inj.rest.nocache().addPath('refresh/token').post({
                    id: userid,
                    refreshtoken: refreshtoken
                }).then(function (result) {
                    if (result.success && result.authorized) {
                        me.setHeaders(result);
                        me.scheduleTokenRefresh(result);
                        MEPH.publish(Connection.constant.Constants.RefreshedToken, {});
                    }
                    else {
                        MEPH.publish(Connection.constant.Constants.ConnectionLost, {});
                    }
                }).catch(function () {
                    MEPH.publish(Connection.constant.Constants.ConnectionLost, {});
                });
            });
        });
    },
    setRefreshToken: function (token) {
        var me = this;
        me.$refreshToken = token;
        me.when.injected.then(function () {
            me.$inj.storage.set(me.refreshTokenKey, token);
        })
    },
    getRefreshToken: function () {
        var me = this;
        if (me.$refreshToken) {
            return Promise.resolve(me.$refreshToken);
        }
        return me.when.injected.then(function () {
            return me.$inj.storage.get(me.refreshTokenKey);
        })
    },
    setToken: function (token) {
        var me = this;
        me.$token = token;
        return me.when.injected.then(function () {
            return me.$inj.storage.set(me.tokenKey, token);
        });
    },
    getToken: function (token) {
        var me = this;
        if (me.$token) {
            return Promise.resolve(me.$token);
        }
        return me.when.injected.then(function () {
            return me.$inj.storage.get(me.tokenKey);
        });
    },
    setUserId: function (val) {
        var me = this;
        me.$userId = val;
        return me.when.injected.then(function () {
            return me.$inj.storage.set(me.userIdKey, val);
        })
    },
    getUserId: function () {
        var me = this;
        return me.when.injected.then(function () {
            return me.$inj.storage.get(me.userIdKey);
        })
    },
    start: function (res) {
        var me = this;
        me.setUserId(res.contactId);
        me.setToken(res.token);
        me.$inj.stateService.set('Messaging Token', res.token);
        me.setRefreshToken(res.refreshToken);
        me.scheduleTokenRefresh(res);
    },
    ensureToken: function () {
        var me = this;
        return me.when.injected.then(function () {
            //Assuming usiing tokens for login.
            return me.getToken();
        })
    }
});