describe("MEPH/audio/soundfont/chunks/data/operators/SampleOperator.spec.js", 'MEPH.audio.soundfont.chunks.data.operators.SampleOperator', function () {
    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });

    it('can create an sampleoperator', function () {
        var sampleoperator = new MEPH.audio.soundfont.chunks.data.operators.SampleOperator();

        expect(sampleoperator).toBeTruthy();
    });

});