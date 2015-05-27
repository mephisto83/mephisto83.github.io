describe("MEPH/mobile/providers/identity/FacebookProvider.spec.js", 'MEPH.mobile.providers.identity.FacebookProvider', function () {
    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });

    it('can create an identity provider.', function (done) {
        //Arrange
        MEPH.create('MEPH.mobile.providers.identity.FacebookProvider').then(function ($class) {
            //Act
            var instance = new $class();

            //Assert
            expect(instance).theTruth('an identity provider could not be created.');
        }).catch(function (error) {
            expect(error).caught();
        }).then(function (x) {
            done();
        });
    });

    it('can load the facebook functionality ', function (done) {
        var args = {
            appId: '414388695382971'
        };
        window.FB = {
            init: function () {
            },
            getLoginStatus: function (callback) {
                callback({ status: 'connected' });
            }
        }
        MEPH.mobile.providers.identity.FacebookProvider.libraryLoaded = true;
        var facebookprovider = new FacebookProvider(args);

        facebookprovider.ready().then(function (t) {

        }).catch(function (e) {
            expect(e).caught();
        }).then(function () {
            done();
        });
    });

});