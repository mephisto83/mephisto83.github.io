/////
describe("MEPH/audio/soundfont/chunks/data/operators/Operator.spec.js", 'MEPH.audio.soundfont.chunks.data.operators.Operator', function () {
    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });

    it('can create an operator ', function () {
        var operator = new MEPH.audio.soundfont.chunks.data.operators.Operator();

        expect(operator).toBeTruthy();
    });

});