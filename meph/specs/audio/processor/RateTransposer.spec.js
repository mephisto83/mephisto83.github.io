describe("MEPH/audio/processor/RateTransposer.spec.js", 'MEPH.audio.processor.RateTransposer', function () {
    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });

    it('can create an RateTransposer', function () {
        var filter = new MEPH.audio.processor.RateTransposer();

        expect(filter).toBeTruthy();
    });
});