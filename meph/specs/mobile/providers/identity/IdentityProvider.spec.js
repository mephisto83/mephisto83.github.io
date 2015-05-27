describe("MEPH/mobile/providers/identity/IdentityProvider.spec.js", function () {
    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });

    it('can create an identity provider.', function (done) {
        //Arrange
        MEPH.create('MEPH.mobile.providers.identity.IdentityProvider').then(function ($class) {
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

   
});