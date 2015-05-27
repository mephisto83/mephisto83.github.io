//MEPH.audio.soundfont.SFObject
describe("MEPH/audio/soundfont/chunks/data/operators/StartAddressOffset.spec.js", 'MEPH.audio.soundfont.chunks.data.operators.StartAddressOffset', function () {
    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });

    it('can create an startaddressoffset', function () {
        var startaddressoffset= new MEPH.audio.soundfont.chunks.data.operators.StartAddressOffset();

        expect(startaddressoffset).toBeTruthy();
    });

});