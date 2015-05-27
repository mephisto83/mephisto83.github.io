describe("MEPH/remoting/RemotingController.spec.js", function () {

    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });

    it('can create a Remoting COntroller.', function (done) {
        MEPH.define('MEPH.remoting.RemotingController').then(function ($class) {
            var remotingcontroller = new $class();
            expect(remotingcontroller).theTruth('no remoting controller was created');
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });


});