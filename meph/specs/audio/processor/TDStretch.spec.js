describe("MEPH/audio/processor/TDStretch.spec.js", 'MEPH.audio.processor.TDStretch', function () {
    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });

    it('can create an TDStretch', function () {
        var samplebuff = new MEPH.audio.processor.FIFOSampleBuffer(32);
        var inputbuffer = new MEPH.audio.processor.FIFOSampleBuffer(32);
        var filter = new MEPH.audio.processor.TDStretch(samplebuff, inputbuffer);

        expect(filter).toBeTruthy();
    });
});