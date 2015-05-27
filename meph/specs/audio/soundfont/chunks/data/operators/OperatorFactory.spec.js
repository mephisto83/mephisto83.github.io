describe("MEPH/audio/soundfont/chunks/data/operators/OperatorFactory.spec.js", 'MEPH.audio.soundfont.chunks.data.operators.OperatorFactory', function () {
    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });

    it('can create an operator factory', function () {
        var operatorFactory = new MEPH.audio.soundfont.chunks.data.operators.OperatorFactory();

        expect(operatorFactory).toBeTruthy();
    });

});