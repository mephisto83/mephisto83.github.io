//MEPH.audio.soundfont.SFObject
describe("MEPH/audio/soundfont/chunks/Subchunk.spec.js", 'MEPH.audio.soundfont.chunks.Subchunk', function () {
    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });

    it('can create an subchunk', function () {
        var subchunk = new MEPH.audio.soundfont.chunks.Subchunk();

        expect(subchunk).toBeTruthy();
    });

});