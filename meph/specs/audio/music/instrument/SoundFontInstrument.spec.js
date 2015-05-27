describe("MEPH/audio/music/instrument/SoundFontInstrument.spec.js", 'MEPH.audio.music.instrument.SoundFontInstrument',
    'MEPH.audio.Audio', function () {
        beforeEach(function () {
            jasmine.addMatchers(MEPH.customMatchers);
        });

        it('can create an audio sound font instrument', function () {

            var audio = new MEPH.audio.music.instrument.SoundFontInstrument();

            expect(audio).toBeTruthy();
        });

        it('can set a font file , and load it.', function (done) {
            var audio = new MEPH.audio.music.instrument.SoundFontInstrument();
            audio.setFontFile('MEPH.audio.music.instrument.trumpet.Trumpet');
            audio.ready().then(function () {
                expect(audio.getFontResource()).toBeTruthy();
            }).catch(function (e) {
                expect(e).caught();
            }).then(done);
        });

        it('can parse a font file.', function (done) {
            var audio = new MEPH.audio.music.instrument.SoundFontInstrument();
            audio.setFontFile('MEPH.audio.music.instrument.trumpet.Trumpet');
            audio.ready().then(function () {
                return audio.parse()
            }).then(function (x) {

            }).catch(function (e) {
                expect(e).caught();
            }).then(done);
        });

        it('can get the presets from the soundfontinstrument', function (done) {
            var audio = new MEPH.audio.music.instrument.SoundFontInstrument();
            audio.setFontFile('MEPH.audio.music.instrument.trumpet.Trumpet');
            audio.ready().then(function () {
                return audio.prepare()
            }).then(function (x) {
                var presets = audio.presets();
                expect(presets).toBeTruthy();
                expect(presets.length).toBe(1);
            }).catch(function (e) {
                expect(e).caught();
            }).then(done);
        });

        it('can set the sample rate of the sound font', function () {
            var soundfont = new MEPH.audio.music.instrument.SoundFontInstrument();
            var rate = soundfont.samplerate(2000);
            expect(rate).toBe(2000);
        })
        it('can convert a midi note into  a frequency', function () {
            var soundfont = new MEPH.audio.music.instrument.SoundFontInstrument();
            var frequency = soundfont.noteToFrequency(60);
            expect(frequency).toBeTruthy();

        });

        it('can get _noteSampleDecoder', function (done) {
            var audio = new MEPH.audio.music.instrument.SoundFontInstrument();
            audio.setFontFile('MEPH.audio.music.instrument.trumpet.Trumpet');
            audio.ready().then(function () {
                return audio.prepare()
            }).then(function (x) {
                var notesample = audio.notesample();
                var decoder = audio.decoder(notesample);
                expect(decoder).toBeTruthy();
            }).catch(function (e) {
                expect(e).caught();
            }).then(done);
        });

        it('can extract an arraybuffer', function (done) {
            var audio = new MEPH.audio.music.instrument.SoundFontInstrument();
            audio.setFontFile('MEPH.audio.music.instrument.trumpet.Trumpet');
            audio.ready().then(function () {
                return audio.prepare()
            }).then(function (x) {
                audio.samplerate(4000);
                var bytearray = audio.note(60, 100);

                expect(bytearray).toBeTruthy();

            }).catch(function (e) {
                expect(e).caught();
            }).then(done);
        });

        it('can extract an arraybuffer and play it in the audio ', function (done) {
            var soundfont = new MEPH.audio.music.instrument.SoundFontInstrument();
            var audio = new MEPH.audio.Audio();
            soundfont.setFontFile('MEPH.audio.music.instrument.trumpet.Trumpet');
            soundfont.ready().then(function () {
                return soundfont.prepare()
            }).then(function (x) {

                soundfont.samplerate(44100);

                var bytearray = soundfont.note(54, 100);

                expect(bytearray).toBeTruthy();

                return bytearray;
            }).then(function (resource) {
                var source = audio.createContext().createBufferSource();
                source.buffer = resource;
                var promise = new Promise(function (r) {
                    setTimeout(function () {
                        r();
                    }, 50)
                })
                return promise;
            }).catch(function (e) {
                expect(e).caught();
            }).then(done);
        });


        it('can get the presets from the soundfontinstrument', function (done) {
            var soundfont = new MEPH.audio.music.instrument.SoundFontInstrument();
            var audio = new MEPH.audio.Audio();
            soundfont.setFontFile('MEPH.audio.music.instrument.trumpet.ReedOrgan');
            soundfont.ready().then(function () {
                return soundfont.prepare()
            }).then(function (x) {

                soundfont.samplerate(44100);

                var bytearray = soundfont.note(60, 100, 3);

                expect(bytearray).toBeTruthy();

                return bytearray;
            }).then(function (resource) {
                var source = audio.createContext().createBufferSource();
                source.buffer = resource;
                audio.buffer(source).complete();

                audio.getNodes().first().node.start();
                var promise = new Promise(function (r) {
                    setTimeout(function () {
                        r();
                    }, 5000)
                })
                return promise;
            }).catch(function (e) {
                expect(e).caught();
            }).then(done);
        });

        it('can get the presets from the soundfontinstrument', function (done) {
            var soundfont = new MEPH.audio.music.instrument.SoundFontInstrument();
            var audio = new MEPH.audio.Audio();
            soundfont.setFontFile('MEPH.audio.music.instrument.percussion.TR808');
            soundfont.ready().then(function () {
                return soundfont.prepare()
            }).then(function (x) {

                soundfont.samplerate(44100);

                var bytearray = soundfont.note(60, 100);

                expect(bytearray).toBeTruthy();

                return bytearray;
            }).then(function (resource) {
                var source = audio.createContext().createBufferSource();
                source.buffer = resource;
                audio.buffer(source).complete();

                audio.getNodes().first().node.start();
                var promise = new Promise(function (r) {
                    setTimeout(function () {
                        r();
                    }, 1000)
                })
                return promise;
            }).catch(function (e) {
                expect(e).caught();
            }).then(done);
        });

        it('can get name of notes', function (done) {
            var soundfont = new MEPH.audio.music.instrument.SoundFontInstrument();
            var audio = new MEPH.audio.Audio();
            soundfont.setFontFile('MEPH.audio.music.instrument.percussion.TR808');
            soundfont.ready().then(function () {
                return soundfont.prepare()
            }).then(function (x) {

                soundfont.samplerate(44100);
                var chunks = soundfont.sampleChunks();


                expect(chunks.length).toBeTruthy(135);
            }).catch(function (e) {
                expect(e).caught();
            }).then(done);
        });

        it('can create sound processor node ', function (done) {
            var soundfont = new MEPH.audio.music.instrument.SoundFontInstrument();
            var audio = new MEPH.audio.Audio();
            soundfont.setFontFile('MEPH.audio.music.instrument.trumpet.EnglishHorn');
            soundfont.ready().then(function () {
                return soundfont.prepare()
            }).then(function (x) {

                soundfont.samplerate(44100);

                var process = soundfont.nodeprocessor(63, 100);
                audio.processor({
                    size: 1024,
                    process: process
                }).complete();
                return new Promise(function (r) {
                    setTimeout(function () {
                        audio.disconnect();
                        r();
                    }, 10000);
                });
            }).catch(function (e) {
                expect(e).caught();
            }).then(done);
        });
        it('can create sound processor node with no loop ', function (done) {
            var soundfont = new MEPH.audio.music.instrument.SoundFontInstrument();
            var audio = new MEPH.audio.Audio();
            soundfont.setFontFile('MEPH.audio.music.instrument.trumpet.EnglishHorn');
            soundfont.ready().then(function () {
                return soundfont.prepare()
            }).then(function (x) {

                soundfont.samplerate(44100);

                var process = soundfont.nodeprocessor(63, 100, true);
                audio.processor({
                    size: 1024,
                    process: process
                }).complete();
                return new Promise(function (r) {
                    setTimeout(function () {
                        audio.disconnect();
                        r();
                    }, 2000);
                });
            }).catch(function (e) {
                expect(e).caught();
            }).then(done);
        });
    });