describe("MEPH/audio/Sequence.spec.js", 'MEPH.audio.Sequence', 'MEPH.audio.Audio', function () {
    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });

    it('can create a sequence', function () {
        var sequence = new MEPH.audio.Sequence();

        expect(sequence).toBeTruthy();
    });

    it('a sequence can reference either an audio object or sequences but not both.', function () {
        var sequence = new MEPH.audio.Sequence();
        var audio = new MEPH.audio.Audio();

        sequence.add(audio);
        expect(sequence.get().first()).toBeTruthy();
        expect(sequence.get().first().source).toBe(audio);
    })

    it('a sequence can remove an audio that has been added', function () {
        var sequence = new MEPH.audio.Sequence();
        var audio = new MEPH.audio.Audio();

        sequence.add(audio);
        expect(sequence.get().first()).toBeTruthy();
        expect(sequence.get().first().source).toBe(audio);
        sequence.remove(sequence.get().first());

        expect(sequence.get().first()).toBe(null);

    });

    it('a sequence can reference either a sequence.', function () {
        var sequence = new MEPH.audio.Sequence();
        var audio = new MEPH.audio.Sequence();

        sequence.add(audio);
        expect(sequence.get().first()).toBeTruthy();
        expect(sequence.get().first().source).toBe(audio);
    })

    it('a sequence can not have any circular references ', function () {
        var sequence = new MEPH.audio.Sequence();
        var sequence2 = new MEPH.audio.Sequence();
        var sequence3 = new MEPH.audio.Sequence();
        var caught;
        sequence.add(sequence2, 0);
        sequence2.add(sequence3, 0);

        var res = sequence3.add(sequence, 0);
        expect(res).toBe(false);
    })

    it('a sequence can reference either an audio object or sequences but not both.', function () {
        var sequence = new MEPH.audio.Sequence();
        var audio = new MEPH.audio.Audio();
        var s2 = new MEPH.audio.Sequence();

        sequence.add(audio);
        sequence.add(sequence);
        expect(sequence.get().length).toBe(1);
    })

    it('a sequence has a length associated with it .', function () {
        var sequence = new MEPH.audio.Sequence();
        var audio = new MEPH.audio.Audio();
        audio.duration(1);
        sequence.add(audio);
        expect(sequence.duration()).toBe(1);
    });


    it('a sequence can set a relative time offset on a sequence', function () {
        var sequence = new MEPH.audio.Sequence();;
        var audio = new MEPH.audio.Audio();
        audio.duration(1);

        sequence.add(audio, 12);

        expect(sequence.get().first().relativeTimeOffset).toBe(12);
    })


    it('a sequence can set a relative time offset on a sequence', function () {
        var sequence = new MEPH.audio.Sequence();;
        var audio = new MEPH.audio.Audio();
        audio.duration(1);
        sequence.add(audio, 12);

        expect(sequence.get().first().relativeTimeOffset).toBe(12);
        expect(sequence.duration()).toBe(13);
    });

    it('a sequence can calculate the duration based on relativetimes and durations of its components.', function () {
        var sequence = new MEPH.audio.Sequence();;
        var audio = new MEPH.audio.Audio();
        audio.duration(1);
        var audio2 = new MEPH.audio.Audio();
        audio2.duration(1);
        sequence.add(audio, 12);
        sequence.add(audio2, 14);

        expect(sequence.get().first().relativeTimeOffset).toBe(12);
        expect(sequence.duration()).toBe(15);
    });

    it('a sequence can return the audio parts which will begin with an certain range. ', function () {
        var sequence = new MEPH.audio.Sequence();
        var audio = new MEPH.audio.Audio();
        audio.duration(1);
        sequence.add(audio, 3);
        var result = sequence.getScheduledAudio(2.3, 1);

        expect(result.length).toBe(1);
    });


    it('a sequence can serialize to json', function () {
        var sequence = new MEPH.audio.Sequence();
        var sequence2 = new MEPH.audio.Sequence();
        sequence.add(sequence2, 1);

        var res = sequence.toJSON();
        expect(res).toBeTruthy();
    });

    it('a sequence can deserialize from a json object', function () {
        var sequence = new MEPH.audio.Sequence();
        var sequence2 = new MEPH.audio.Sequence();
        sequence.add(sequence2, 1);

        var res = JSON.stringify(sequence.toJSON());
        var deserialized = MEPH.audio.Sequence.deserialize(res, { get: function () { return new MEPH.audio.Audio(); } });
        expect(deserialized).toBeTruthy();
    });

    it('items returns the list of parts ', function () {
        var sequence = new MEPH.audio.Sequence();
        var res = sequence.items();
        expect(res).toBeTruthy();
    })

    it('can set the default item to add on a sequence', function () {

        var sequence = new MEPH.audio.Sequence();
        sequence.setDefault('graph', 'id');

        expect(sequence.$defaultType).toBe('graph');
        expect(sequence.$defaultRefId).toBe('id');
    });

    it('a sequence has a midi  note ', function () {
        var sequence = new MEPH.audio.Sequence();
        sequence.midiNote(12);
        expect(sequence.midiNote()).toBe(12);
    })

    it('can get a sequences graph', function () {
        var sequence = new MEPH.audio.Sequence();

        expect(sequence.getGraph()).toBeTruthy();
    })
});