
/*global MEPH,U4,window*/
describe("MEPH/controller/Controller.spec.js", function () {

    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });

    it("Control class is defined.", function (done) {
        //Arrange
        MEPH.create('MEPH.controller.Controller').then(function ($class) {
            var controller = new $class();
            expect(controller).theTruth('No controller was created');
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });

    it('controller is referrable', function (done) {
        MEPH.create('MEPH.controller.Controller').then(function ($class) {
            var controller = new $class();
            expect(controller.isReferrerable()).theTruth('the controller is not referrable');
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });

    it('controller is observable', function (done) {
        MEPH.create('MEPH.controller.Controller').then(function ($class) {
            var controller = new $class();
            expect(MEPH.util.Observable.isObservable(controller)).theTruth('The controller is not observable');
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });;
    });
})