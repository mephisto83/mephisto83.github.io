describe("MEPH/audio/processor/FIFOSampleBuffer.spec.js", 'MEPH.audio.processor.FIFOSampleBuffer', function () {
    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });

    it('can create an FIFOSampleBuffer', function () {
        var filter = new MEPH.audio.processor.FIFOSampleBuffer(1);

        expect(filter).toBeTruthy();
    });
});