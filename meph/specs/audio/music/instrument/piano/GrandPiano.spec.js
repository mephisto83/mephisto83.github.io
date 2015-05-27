describe("MEPH/audio/music/instrument/piano/GrandPiano.spec.js", 'MEPH.audio.music.instrument.piano.GrandPiano', function () {
    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });

    it('can create an audio instrument', function () {
        var audio = new MEPH.audio.music.instrument.piano.GrandPiano();

        expect(audio).toBeTruthy();
    });

    it('an instrument is ready after it is loaded all the resources', function (done) {
        var audio = new MEPH.audio.music.instrument.piano.GrandPiano();
        audio.ready().then(function (ready) {
            expect(ready).toBeTruthy();
            expect(audio.$audios.length).toBeTruthy();
        }).catch(function (e) {
            expect(e).caught();
        }).then(function () {
            done();
        });
    });

    it('can create a sequence', function (done) {
        var audio = new MEPH.audio.music.instrument.piano.GrandPiano();
        audio.ready().then(function (ready) {
            var sequence = audio.createSequence();
            expect(sequence.items()).toBeTruthy();
            expect(sequence.items().length).toBeTruthy();
            expect(sequence.title === 'Grand Piano').toBeTruthy();
        }).catch(function (e) {
            expect(e).caught();
        }).then(function () {
            done();
        });
    });

});