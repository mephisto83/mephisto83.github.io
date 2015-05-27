describe("MEPH/audio/processor/SoundProcessor.spec.js", 'MEPH.audio.processor.SoundProcessor', 'MEPH.audio.Audio', function () {
    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });

    it('can create an SoundProcessor', function () {
        var filter = new MEPH.audio.processor.SoundProcessor();

        expect(filter).toBeTruthy();
    });

    it('can process sound ', function () {
        var len = 44100 * 2
        var fs = 44100;

        var signal = (new Float32Array(len)).select(function (i, x) {
            return .9 * Math.cos((x / fs) * 2 * 440 * Math.PI);
        });

        var output = MEPH.audio.processor.SoundProcessor.Process(signal);
        expect(output).toBeTruthy();
    });

    it('can propcess and sound can be played', function () {
        var len = 44100 * 2
        var fs = 44100;
        var sampleRate = fs;
        var signal = (new Float32Array(len)).select(function (i, x) {
            return .9 * Math.cos((x / fs) * 2 * 440 * Math.PI);
        });
        
        var output = MEPH.audio.processor.SoundProcessor.Process(signal);
        var resource = {
            buffer: {
                buffer: {
                    getChannelData: function () {
                        return output;
                    },
                    sampleRate: sampleRate
                },
                channelCount: 1
            }
        };

        var audio = new MEPH.audio.Audio();

        var audioresult = audio.copyToBuffer(resource, 0, len / sampleRate);

        audio.buffer(audioresult.buffer).complete();

        audio.get({ name: 'buffer' }).first().buffer.start();
        // start the source playing
        audio.playbuffer();
        setTimeout(function () {
            audio.disconnect();
        }, 5000)
    })
});