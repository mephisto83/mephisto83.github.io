describe("MEPH/audio/music/instrument/Instrument.spec.js", 'MEPH.audio.music.instrument.Instrument', function () {
    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });

    it('can create an audio instrument', function () {
        
        var audio = new MEPH.audio.music.instrument.Instrument();

        expect(audio).toBeTruthy();
    });

    it('an instrument is ready after it is loaded all the resources', function (done) {
        var audio = new MEPH.audio.music.instrument.Instrument();
        expect(audio.$audios).toBeTruthy();
        audio.ready().then(function (ready) {
            expect(ready).toBeTruthy();
        }).catch(function (e) {
            expect(e).caught();
        }).then(function () {
            done();
        })
    })
});