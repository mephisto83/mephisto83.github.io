
/*global MEPH,U4,window*/
describe('MEPH/mobile/activity/container/Container.spec.js', function () {
    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });

    it('can create a activity container.', function (done) {
        MEPH.create('MEPH.mobile.activity.container.Container').then(function ($class) {
            var container = new $class();
            expect(container).theTruth('The container was not created');
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });

    it('a container is a control', function (done) {
        MEPH.create('MEPH.mobile.activity.container.Container').then(function ($class) {
            var container = new $class();

            expect(container instanceof MEPH.control.Control).theTruth('the container is not an instance of Control');
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });
});