describe("MEPH/mobile/application/controller/MobileApplicationController.spec.js", function () {

    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });

    it('can create a mobile application controller.', function (done) {
        MEPH.create('MEPH.mobile.application.controller.MobileApplicationController').then(function ($class) {
            var mac = new $class();

            expect(mac).theTruth('The mobile application class did not start');

        }).catch(function (error) {
            expect(error).caught();
        }).then(function (x) {
            done();
        });
    });

})