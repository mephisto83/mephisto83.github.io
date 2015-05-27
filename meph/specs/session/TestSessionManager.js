MEPH.define('MEPHTests.session.TestSessionManager', {
    extend: 'MEPH.session.SessionManager',
    /**
     * Starts the login process
     * @returns {Promise}
     */
    beginLogin: function () {
        var me = this;

        if (me.automaticLogin) {
            return Promise.resolve().then(function () {
                MEPHTests.session.TestSessionManager.loggedin = true;
                return { access_token: 'fake' };
            });
        }
    }
});