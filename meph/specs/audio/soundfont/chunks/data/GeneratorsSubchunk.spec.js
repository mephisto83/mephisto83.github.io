
describe("MEPH/audio/soundfont/chunks/data/GeneratorsSubchunk.spec.js", 'MEPH.audio.soundfont.chunks.data.GeneratorsSubchunk', function () {
    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });

    it('can create an zonerecord', function () {
        var generatorsSubchunk = new MEPH.audio.soundfont.chunks.data.GeneratorsSubchunk();

        expect(generatorsSubchunk).toBeTruthy();
    });

}); 