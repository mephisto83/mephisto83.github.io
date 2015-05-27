describe("MEPH/audio/soundfont/chunks/data/operators/RangeOperator.spec.js", 'MEPH.audio.soundfont.chunks.data.operators.RangeOperator', function () {
    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });

    it('can create an rangeoperator', function () {
        var rangeoperator = new MEPH.audio.soundfont.chunks.data.operators.RangeOperator(Operator.KEY_RANGE, [0]);

        expect(rangeoperator).toBeTruthy();
    });

});