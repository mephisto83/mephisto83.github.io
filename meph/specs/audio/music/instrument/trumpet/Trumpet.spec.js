describe("MEPH/audio/music/instrument/trumpet/Trumpet.spec.js", 'MEPH.audio.music.instrument.trumpet.Trumpet', function () {
    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });

    it('can create a trumpet ', function () {
        var audio = new MEPH.audio.music.instrument.trumpet.Trumpet();

        expect(audio).toBeTruthy();
    });
});