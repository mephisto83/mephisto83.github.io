describe("MEPH/identity/IdentityProvider.spec.js", 'MEPH.identity.IdentityProvider', function () {
    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });

    it('can create an identity provider.', function (done) {
        //Arrange
        MEPH.create('MEPH.identity.IdentityProvider').then(function ($class) {
            //Act
            var instance = new $class({ providers: [] });

            //Assert
            expect(instance).theTruth('an identity provider could not be created.');
        }).catch(function (error) {
            expect(error).caught();
        }).then(function (x) {
            done();
        });
    });

    it('can load providers ', function (done) {
        var ip = new MEPH.identity.IdentityProvider({
            providers: [{
                type: 'MEPH.mobile.providers.identity.FacebookProvider',
                args: {
                    appId: '414388695382971'//,
                    //loginbtn: '#facebooklogin'
                }
            }]
        });
        window.FB = {
            init: function () {
            },
            getLoginStatus: function (callback) {
                callback({ status: 'connected' });
            }
        }
        MEPH.mobile.providers.identity.FacebookProvider.libraryLoaded = true;
        ip.ready().then(function (t) {
            expect(ip.providers.length === 1).toBeTruthy();
        }).catch(function (e) {
            expect(e).caught();
        }).then(done);
    })
});