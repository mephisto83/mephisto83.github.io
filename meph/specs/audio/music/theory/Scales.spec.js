describe("MEPH/audio/music/theory/Scales.spec.js", 'MEPH.audio.music.theory.Scales', function () {
    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });

    it('can create an scales', function () {
        var audio = new MEPH.audio.music.theory.Scales();

        expect(audio).toBeTruthy();
    });

    it('has majorscale static property', function () {
        var audio = MEPH.audio.music.theory.Scales.scales.majorscale;

        expect(audio).toBeTruthy();
    });

    it('can get the chorddata', function () {
        var data = MEPH.audio.music.theory.Scales.getChordData();
        expect(data).toBeTruthy();
    })

    it('can get the voices', function () {
        var data = MEPH.audio.music.theory.Scales.getVoices();
        expect(data).toBeTruthy();
    })

    it('can create a bosslist', function () {
        var data = MEPH.audio.music.theory.Scales.bossList();

        expect(data).toBeTruthy();
    })

    it('can init scales', function () {
        var data = MEPH.audio.music.theory.Scales.init();

        expect(data).toBeTruthy();
    })

    it('can get scale by id ', function () {
        var data = MEPH.audio.music.theory.Scales.init();
        var scale = MEPH.audio.music.theory.Scales.getScaleById(384);
        expect(scale.name).toBe("augmented 0");
    });

    it('can get a list of scales ', function () {
        var scales = TheoryScales.getScales();

        expect(scales).toBeTruthy();
        expect(scales.length > 10).toBeTruthy();
    });

    it('can get a scale ', function () {
        var scale = TheoryScales.getScales();

        var foundscale = TheoryScales.getScale(scale.first().id);
        expect(foundscale).toBeTruthy();
    });

    it('get notes for scale in range', function () {
        var scale = TheoryScales.getScales();

        var foundscale = TheoryScales.getNotesInScale(scale.first().id, 30, 42);

        expect(foundscale).toBeTruthy();
        expect(foundscale.length).toBe(7);
    })
});