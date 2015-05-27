/**
 * @class MEPH.session.SessionManager
 * String
 */
MEPH.define('MEPH.session.SessionManager', {

    properties: {
        $loggedIn: false,
        $accessToken: null,
        $userData: null
    },
    mixins: {
        injectable: 'MEPH.mixins.Injections'
    },
    initialize: function (args) {
        var me = this;
        me.$userData = {};
        MEPH.apply(args, me);
        me.mixins.injectable.init.apply(me);
    },

    /**
     * Returns true if logged in.
     * @returns {Boolean}
     **/
    isLoggedIn: function () {
        var me = this;
        return me.$loggedIn;
    },
    requiresLogin: function () {
        var me = this;
        return me.loginRequired;
    },
    /**
     * Starts the login process
     * @returns {Promise}
     */
    beginLogin: function () {
        var me = this;
        return MEPH.requestAuthentication(me.getAuthorizationPath(),
            me.getClientId(),
            me.getReturnUri(),
            me.getScope(),
            me.getToken(),
            me.getState(),
            me.getClientSecret()).then(function (results) {
                me.loginResults = results;
                MEPH.setAuthorizationToken(me.loginResults.access_token);
                return results;
            });;
    },
    setOnlineName: function (name) {
        var me = this;
        me.$userData.onlineName = name;
    },
    setUserDataProperty: function (name, value) {
        var me = this;
        me.$userData[name] = value;
    },
    getUserData: function () {
        var me = this;
        return me.$userData;
    },
    /**
     * Gets the authorization path.
     * @returns {String}
     **/
    getAuthorizationPath: function () {
        var me = this;
        return me.authorizationPath;
    },
    /**
     * Gets the clientId.
     * @returns {String}
     **/
    getClientId: function () {
        var me = this;
        return me.clientId;
    },
    /**
     * Gets the return URI.
     * @returns {String}
     **/
    getReturnUri: function () {
        var me = this;
        return me.returnUri;
    },
    /**
     * Gets the scope.
     * @returns {String}
     **/
    getScope: function () {
        var me = this;
        return me.scope;
    },
    /**
     * Gets the token.
     * @returns {String}
     **/
    getToken: function () {
        var me = this;
        return me.token;
    },
    /**
     * Gets the state.
     * @returns {String}
     **/
    getState: function () {
        var me = this;
        return me.state;
    },
    /**
     * Gets the client secret.
     * @returns {String}
     **/
    getClientSecret: function () {
        var me = this;
        return me.client_secret;
    }
});