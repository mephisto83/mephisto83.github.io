describe("MEPH/session/SessionManager.spec.js", function () {

    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });

    it('can create a SessionManager.', function (done) {
        MEPH.create('MEPH.session.SessionManager').then(function ($class) {
            var sessionmanager = new $class();
            expect(sessionmanager).theTruth('a session manager was not created');
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });

    it('can detect if the client is logged in', function (done) {
        MEPH.create('MEPH.session.SessionManager').then(function ($class) {
            var sessionmanager = new $class();
            expect(sessionmanager.isLoggedIn() === false).theTruth('the session manager should return false, cause it shouldnt be logged in');
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });

    it('authorization path is passed in the constructor.', function (done) {
        MEPH.create('MEPH.session.SessionManager').then(function ($class) {
            var sessionmanager = new $class({ authorizationPath: 'path' });
            expect(sessionmanager.getAuthorizationPath() === 'path').theTruth('the authorization path wasnt as expected');
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });

    it('clientId path is passed in the constructor.', function (done) {
        MEPH.create('MEPH.session.SessionManager').then(function ($class) {
            var sessionmanager = new $class({ clientId: 'clientId' });
            expect(sessionmanager.getClientId() === 'clientId').theTruth('the clientId wasnt as expected');
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });


    it('returnUri path is passed in the constructor.', function (done) {
        MEPH.create('MEPH.session.SessionManager').then(function ($class) {
            var sessionmanager = new $class({ returnUri: 'returnUri' });
            expect(sessionmanager.getReturnUri() === 'returnUri').theTruth('the returnUri wasnt as expected');
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });


    it('scope is passed in the constructor.', function (done) {
        MEPH.create('MEPH.session.SessionManager').then(function ($class) {
            var sessionmanager = new $class({ scope: 'scope' });
            expect(sessionmanager.getScope() === 'scope').theTruth('the scope wasnt as expected');
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });

    it('token path is passed in the constructor.', function (done) {
        MEPH.create('MEPH.session.SessionManager').then(function ($class) {
            var sessionmanager = new $class({ token: 'token' });
            expect(sessionmanager.getToken() === 'token').theTruth('the token wasnt as expected');
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });

    it('state is passed in the constructor.', function (done) {
        MEPH.create('MEPH.session.SessionManager').then(function ($class) {
            var sessionmanager = new $class({ state: 'state' });
            expect(sessionmanager.getState() === 'state').theTruth('the state wasnt as expected');
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });

    it('state is passed in the constructor.', function (done) {
        MEPH.create('MEPH.session.SessionManager').then(function ($class) {
            var sessionmanager = new $class({ client_secret: 'client_secret' });
            expect(sessionmanager.getClientSecret() === 'client_secret').theTruth('the client_secret wasnt as expected');
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });


    it('state is passed in the constructor.', function (done) {
        MEPH.create('MEPH.session.SessionManager').then(function ($class) {
            var sessionmanager = new $class({ loginRequired: true });
            expect(sessionmanager.requiresLogin()).theTruth('the session manager should rquire a login.');
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });

    //clientId, returnUri, scope, token, state, client_secret
    it('a client can log in when the access_token becomes available.', function (done) {

        MEPH.create('MEPH.session.SessionManager').then(function ($class) {
            var sessionmanager = new $class({
                'authorizationPath': MEPH.getPath('dataviews') + '/blank.html?#access_token=token',
                'clientId': null,
                'returnUri': null,
                'state': null,
                'scope': null,
                'client_secret': null,
                'response_type': null
            });
            return sessionmanager.beginLogin().then(function (result) {
                expect(result.access_token === 'token');
            });

        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });

    it(' can set user online name ', function (done) {
        MEPH.create('MEPH.session.SessionManager').then(function ($class) {
            var sessionmanager = new $class();
            sessionmanager.setOnlineName('ASDFA');
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });

    it(' can get user data', function (done) {
        MEPH.create('MEPH.session.SessionManager').then(function ($class) {
            var sessionmanager = new $class();
            expect(sessionmanager.getUserData('ASDFA')).toBeTruthy();
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });

    //clientId, returnUri, scope, token, state, client_secret
    it('will set the authorization token when received.', function (done) {

        MEPH.create('MEPH.session.SessionManager').then(function ($class) {
            var sessionmanager = new $class({
                'authorizationPath': MEPH.getPath('dataviews') + '/blank.html?#access_token=atoken',
                'clientId': null,
                'returnUri': null,
                'state': null,
                'scope': null,
                'client_secret': null,
                'response_type': null
            });
            return sessionmanager.beginLogin().then(function (result) {
                expect(MEPH.getAuthorizationToken() === 'atoken').theTruth('The authorization was not the one which was expected');
            });

        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });
});