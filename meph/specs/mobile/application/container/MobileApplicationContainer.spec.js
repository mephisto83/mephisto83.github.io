describe("MEPH/mobile/application/container/MobileApplicationContainer.spec.js", function () {

    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });

    it('can create a mobile application.', function (done) {
        //Arrange
        MEPH.create('MEPH.mobile.application.container.MobileApplicationContainer').then(function ($class) {
            var mobileapplication = new $class();

            expect(mobileapplication).theTruth('The mobile application was not created.');
            mobileapplication.destroy();

        }).catch(function (error) {
            expect(error).caught();
        }).then(function (x) {
            done();
        });;
    });

});