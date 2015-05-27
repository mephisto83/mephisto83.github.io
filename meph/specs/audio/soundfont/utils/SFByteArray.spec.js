//MEPH.audio.soundfont.SFObject
describe("MEPH/audio/soundfont/utils/SFByteArray.spec.js", 'MEPH.audio.soundfont.utils.SFByteArray', function () {
    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });

    it('can create an sfarray', function () {
        var sfarray = new MEPH.audio.soundfont.utils.SFByteArray();

        expect(sfarray).toBeTruthy();
    });

});