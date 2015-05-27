describe("MEPH/audio/Audio.spec.js", 'MEPH.audio.Audio', function () {
    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });

    it('can create an audio', function () {
        var audio = new MEPH.audio.Audio();

        expect(audio).toBeTruthy();
    });

    it('an audio object has an id', function () {
        var audio = new MEPH.audio.Audio({ id: MEPH.GUID() });

        expect(audio.id).toBeTruthy();
    })

    it('can create an audio context', function () {
        var audio = new MEPH.audio.Audio();

        var context = audio.createContext();

        expect(context).toBeTruthy();
    });

    it('can create an audio context, and returns the same context the second time unless otherwise specified.', function () {
        var audio = new MEPH.audio.Audio();

        var context = audio.createContext();

        expect(context === audio.createContext()).toBeTruthy();
    })
    it('it can create oscillator node and a gainnode, and link to the context fluently', function () {
        var audio = new MEPH.audio.Audio();

        var result = audio.oscillator().gain().complete();
    });

    it('can name nodes', function () {
        var audio = new MEPH.audio.Audio();

        var result = audio.oscillator({ name: 'oc' }).gain().complete();

        var oscillatornode = audio.get({ name: 'oc' }).first();

        expect(oscillatornode).toBeTruthy();
    });

    it('can set the oscillator node to on ', function (done) {
        var audio = new MEPH.audio.Audio();

        var result = audio.oscillator({ name: 'oc' }).gain({ name: 'gain' }).complete();

        var gainnode = audio.get({ name: 'gain' }).first();

        var gainNode = gainnode.node;
        gainNode.gain.value = .01;

        var oscillatornode = audio.get({ name: 'oc' }).first();
        var oscillator = oscillatornode.node;
        var initialFreq = 3000;
        oscillator.type = 0; // sine wave
        oscillator.frequency.value = initialFreq; // value in hertz
        oscillator.start();
        expect(oscillatornode).toBeTruthy();
        setTimeout(function () {
            audio.disconnect();
            done();
        }, 10);
    });

    it('it can create biquad filter', function () {
        var audio = new MEPH.audio.Audio();

        var result = audio.biquadFilter();
        expect(result).toBeTruthy();
    });

    it('it can create convolverfilter', function () {
        var audio = new MEPH.audio.Audio();

        var result = audio.convolver();
        expect(result).toBeTruthy();
    });

    it('it can create delay', function () {
        var audio = new MEPH.audio.Audio();

        var result = audio.delay();
        expect(result).toBeTruthy();
    });

    it('it can create dynamicscompressornode', function () {
        var audio = new MEPH.audio.Audio();

        var result = audio.dynamicsCompressor();
        expect(result).toBeTruthy();
    });
    it('it can create wave shaper', function () {
        var audio = new MEPH.audio.Audio();

        var result = audio.waveShaper();
        expect(result).toBeTruthy();
    });
    it('it can create analyser', function () {
        var audio = new MEPH.audio.Audio();

        var result = audio.analyser();
        expect(result).toBeTruthy();
    });
    it('it can create periodic  Wave', function () {
        var audio = new MEPH.audio.Audio();
        var real = new Float32Array(2);
        var imag = new Float32Array(2);
        var result = audio.periodicWave({ name: 'period', real: real, imaginary: imag });
        expect(result).toBeTruthy();
    });

    it('channel splitter node', function () {
        var audio = new MEPH.audio.Audio();
        var result = audio.splitter({ name: 'channelsplitter' });
        expect(result).toBeTruthy();

    })
    it('channel splitter node', function () {
        var audio = new MEPH.audio.Audio();
        var result = audio.merger();
        expect(result).toBeTruthy();

    })
    it('channel panner node', function () {
        var audio = new MEPH.audio.Audio();
        var result = audio.panner();
        expect(result).toBeTruthy();

    })

    it('can load an mp3 resource ', function (done) {
        var audio = new MEPH.audio.Audio();

        audio.load('../specs/data/The_Creek.mp3', 'mp3').then(function (resource) {

            expect(resource.buffer).toBeTruthy();
            done();
        });
    });

    it('loaded resources are cached globally.', function (done) {
        var audio = new MEPH.audio.Audio();

        audio.load('../specs/data/The_Creek.mp3', 'mp3').then(function (resource) {
            expect(resource.buffer).toBeTruthy();

        }).then(function () {
            expect((new MEPH.audio.Audio()).getBufferSources().length).toBeTruthy();
            done();
        });
    });
    var audiofile = '../specs/data/The_Creek.mp3', audiofiletyp = 'mp3';

    it('can play a buffer source ', function (done) {
        var audio = new MEPH.audio.Audio();
        audio.load(audiofile, audiofiletyp).then(function (resource) {
            audio.buffer(resource.buffer).complete();

            // start the source playing
            //resource.buffer.start();
            setTimeout(function () {
                audio.disconnect();
                done();

            }, 2000)
        });
    });

    it('can detect pitch', function () {
        var frameCount = 44100;
        var audio = new MEPH.audio.Audio();
        var audioCtx = audio.createContext();
        var myArrayBuffer = audioCtx.createBuffer(2, frameCount / 2, frameCount);
        for (var channel = 0 ; channel < 2 ; channel++) {
            var buf = myArrayBuffer.getChannelData(channel);
            for (var i = 0; i < frameCount / 2; i++) {
                buf[i] = Math.sin(i / frameCount * 420);
            }
        }


        var res = MEPH.audio.Audio.updatePitch(myArrayBuffer.getChannelData(0), frameCount);

        expect(res).toBeTruthy();
    });

    it('can detect pitches ', function () {
        var frameCount = 44100;
        var audio = new MEPH.audio.Audio();
        var audioCtx = audio.createContext();
        var myArrayBuffer = audioCtx.createBuffer(2, frameCount, frameCount);
        for (var channel = 0 ; channel < 2 ; channel++) {
            var buf = myArrayBuffer.getChannelData(channel);
            for (var i = 0; i < frameCount  ; i++) {
                if (i > frameCount / 2)
                    buf[i] = Math.sin(i / frameCount * 440 * Math.PI);
                else
                    buf[i] = Math.sin(i / frameCount * 1320 * Math.PI);
            }
        }


        var res = MEPH.audio.Audio.detectPitches(myArrayBuffer.getChannelData(0), frameCount, 1000);

        expect(res).toBeTruthy();
    })

    it('can detect silence', function () {
        var frameCount = 44100;
        var audio = new MEPH.audio.Audio();
        var audioCtx = audio.createContext();
        var myArrayBuffer = audioCtx.createBuffer(2, frameCount, frameCount);
        for (var channel = 0 ; channel < 2 ; channel++) {
            var buf = myArrayBuffer.getChannelData(channel);
            for (var i = 0; i < frameCount ; i++) {
                if (i > frameCount / 2 && i < (frameCount / 2 + (frameCount / 8)))
                    buf[i] = Math.sin(i / frameCount * 420);
            }
        }


        var buff = myArrayBuffer.getChannelData(0);
        var res = MEPH.audio.Audio.detectSilence(buff);

        expect(res).toBeTruthy();
        expect(res.length).toBe(2);
    })

    it('can detect silence (with level considered silent)', function () {
        var frameCount = 44100;
        var audio = new MEPH.audio.Audio();
        var audioCtx = audio.createContext();
        var myArrayBuffer = audioCtx.createBuffer(2, frameCount, frameCount);
        for (var channel = 0 ; channel < 2 ; channel++) {
            var buf = myArrayBuffer.getChannelData(channel);
            for (var i = 0; i < frameCount ; i++) {
                if (i > frameCount / 2 && i < (frameCount / 2 + (frameCount / 8)))
                    buf[i] = Math.sin(i / frameCount * 420);
            }
        }


        var buff = myArrayBuffer.getChannelData(0);
        var res = MEPH.audio.Audio.detectSilence(buff, .001, 1000);

        expect(res).toBeTruthy();
        expect(res.length).toBeTruthy();
    });



    it('can detect pitch', function (done) {
        var audio = new MEPH.audio.Audio();

        audio.load('../specs/data/C4.mp3', 'mp3').then(function (resource) {
            expect(resource.buffer.buffer).toBeTruthy();

            var res = MEPH.audio.Audio.updatePitch(resource.buffer.buffer.getChannelData(0), resource.buffer.buffer.sampleRate);

            expect(res).toBeTruthy();

        }).then(function () {
            expect((new MEPH.audio.Audio()).getBufferSources().length).toBeTruthy();
            done();
        });
    })

    it('can detect the bpm ', function (done) {
        var audio = new MEPH.audio.Audio();

        audio.load(audiofile, audiofiletyp).then(function (resource) {
            return MEPH.audio.Audio.bpm(resource.buffer).then(function (res) {

                expect(res).toBeTruthy();

            })
        }).catch(function (e) {
            expect(e).caught();
        }).then(done);
    });

    it('can serialize a audiobuffer object to a string', function () {
        var audio = new MEPH.audio.Audio(), channels = 1, frameCount = 1000;

        var source = audio.createContext().createBuffer(channels, frameCount, 44000);
        var nowBuffering = source.getChannelData(0);
        for (var i = 0; i < frameCount; i++) {
            nowBuffering[i] = Math.sin(i / 100);
        }
        var res = audio.serializeBuffer({ name: MEPH.GUID(), buffer: source, type: '' });

        expect(res).toBeTruthy();
    });

    it('can deserialize a audiobufferstring to a working audiobuffer', function () {
        var audio = new MEPH.audio.Audio(), channels = 1, frameCount = 1000;

        var source = audio.createContext().createBuffer(channels, frameCount, 44000);
        var nowBuffering = source.getChannelData(0);
        for (var i = 0; i < frameCount; i++) {
            nowBuffering[i] = Math.sin(i / 100);
        }
        var guid = MEPH.GUID();
        var res = audio.serializeBuffer({ name: guid, buffer: source, type: 'type', id: 'id' });

        var result = audio.deserializeBuffer(res);
        expect(res).toBeTruthy();
        expect(result.type === 'type').toBeTruthy();
        expect(result.name === guid).toBeTruthy();
        expect(result.buffer.numberOfChannels === 1).toBeTruthy();
        expect(result.id === 'id').toBeTruthy();
    })

    it('can copy a clip of sound ', function (done) {
        var audio = new MEPH.audio.Audio();

        audio.load(audiofile, audiofiletyp).then(function (resource) {

            var result = audio.copyToBuffer(resource, 50, 52);

            audio.buffer(result.buffer).complete();

            // start the source playing
            // result.buffer.start();
            setTimeout(function () {
                audio.disconnect();
                done();
            }, 2000)

        })

    });

    it('can extract a part of a sound  ', function (done) {
        var audio = new MEPH.audio.Audio();

        audio.load(audiofile, audiofiletyp).then(function (resource) {

            var result = MEPH.audio.Audio.clip(resource, 40, 41);
            expect(result).toBeTruthy();

        }).catch(function (e) {
            expect(e).caught();
        }).then(done);
    });

    it('adding buffer source to audio will publish a CHANGED_BUFFER_SOURCE event', function () {
        var audio = new MEPH.audio.Audio(),
            called, buffersource;
        MEPH.subscribe(MEPH.audio.Audio.CHANGED_BUFFER_SOURCE, function (type, added, buffer) {
            called = true;
        })

        buffersource = audio.addBufferSource({});

        expect(called).toBeTruthy();
        audio.removeBufferSource(buffersource.id);
    })

    it('can render offline', function (done) {
        var audio = new MEPH.audio.Audio();

        audio.load(audiofile, audiofiletyp, {}).then(function (resource) {

            var result = audio.copyToBuffer(resource, 50, 50.1, {});
            MEPH.audio.Audio.OfflineMode = true;
            MEPH.audio.Audio.OfflineAudioContext = new (window.OfflineAudioContext)(32, 10000, 44100)
            audio.buffer(result.buffer).clearContext().complete({
                length: 2,
                numOfChannels: resource.buffer.channelCount,
                sampleRate: resource.buffer.buffer.sampleRate,
                oncomplete: function (res) {
                    audio.disconnect();
                    done();
                },
                start: true
            });

            // start the source playing
            result.buffer.start();
            MEPH.audio.Audio.OfflineAudioContext.startRendering();
            MEPH.audio.Audio.OfflineMode = false;
        });
    });

    it('can create an audio tag based on type', function () {
        var audio = new Audio();

        expect(audio.createAudioNode(Audio.nodeTypes.oscillator)).toBeTruthy();
        expect(audio.createAudioNode(Audio.nodeTypes.gain)).toBeTruthy();
        expect(audio.createAudioNode(Audio.nodeTypes.convolver)).toBeTruthy();
        expect(audio.createAudioNode(Audio.nodeTypes.delay)).toBeTruthy();
        expect(audio.createAudioNode(Audio.nodeTypes.dynamicsCompressor)).toBeTruthy();
        expect(audio.createAudioNode(Audio.nodeTypes.waveShaper)).toBeTruthy();
        expect(audio.createAudioNode(Audio.nodeTypes.analyser)).toBeTruthy();
        expect(audio.createAudioNode(Audio.nodeTypes.splitter)).toBeTruthy();
        expect(audio.createAudioNode(Audio.nodeTypes.merger)).toBeTruthy();
        expect(audio.createAudioNode(Audio.nodeTypes.periodicWave)).toBeTruthy();
        expect(audio.createAudioNode(Audio.nodeTypes.panner)).toBeTruthy();
        expect(audio.createAudioNode(Audio.nodeTypes.biquadFilter)).toBeTruthy();
    })

    var Audio = MEPH.audio.Audio;
    it('can analyse the volume of sounds ', function (done) {
        var audio = new Audio();

        audio.load(audiofile, audiofiletyp).then(function (resource) {

            var result = audio.copyToBuffer(resource, 40, 40.3);

            audio.buffer(result.buffer).volume({ name: 'volume' }).gain({ name: 'gain', volume: 0 }).complete();
            result.buffer.start();
            return new Promise(function (r) {
                setTimeout(function () {
                    var volume = audio.get({ name: 'volume' }).first();
                    expect(volume.data).toBeTruthy();
                    audio.disconnect();
                    r();
                }, 1000)
            })
        }).catch(function (e) {
            expect(e).caught();
        }).then(function () {
            done();
        });
    });

    it('can do a quick analysis from the raw data ', function (done) {
        var audio = new Audio();

        audio.load(audiofile, audiofiletyp).then(function (resource) {

            var result = audio.copyToBuffer(resource, 40, 40.3);

            var res = Audio.quickAnalysis(result);
            expect(res).toBeTruthy();
        }).catch(function (e) {
            expect(e).caught();
        }).then(function () {
            done();
        });
    });

    //it('can analyse the volume of sounds silently', function (done) {
    //    Audio.analyze(audiofile, audiofiletyp).then(function (res) {
    //        expect(res).toBeTruthy();
    //    }).catch(function (e) {
    //        expect(e).caught();
    //    }).then(done);
    //});

    it('can analyze the volume of sounds from a buffer ', function (done) {
        var audio = new Audio();

        audio.load(audiofile, audiofiletyp).then(function (resource) {

            var result = audio.copyToBuffer(resource, 40, 40.2);

            var res = Audio.quickAnalysis(result);
            expect(res).toBeTruthy();

        }).catch(function (e) {
            expect(e).caught();
        }).then(function () {
            done();
        });
    });

    it('can connect an audio to another audio instance ', function () {
        var audio = new Audio();
        var another = new Audio();

        audio.gain({ name: 1 }).biquadFilter({ node: 2 });
        another.gain({ name: 3 }).panner({ node: 4 });
        audio.connect(another);

        expect(audio.getNodes().length).toBe(4);


    })



    it('cant connect an audio to another audio instance if it will make a circular looop', function () {
        var audio = new Audio();
        var another = new Audio();
        var third = new Audio();
        var thrown;

        audio.gain({ name: 1 }).biquadFilter({ node: 2 });
        another.gain({ name: 3 }).panner({ node: 4 });
        third.gain({ name: 3 }).panner({ node: 4 });
        audio.connect(another);
        another.connect(third);

        try {
            third.connect(audio);
        }
        catch (e) {
            thrown = true
        }
        expect(thrown).toBeTruthy();
    });

    it('can not connect to itself', function () {
        var audio = new Audio();
        var thrown;
        try {
            audio.connect(audio);
        }
        catch (e) {
            thrown = true;
        }
        expect(thrown).toBeTruthy();
    })

    it('an audio node will have a defined listi of parameters which i can use for connecting and etc.', function () {
        var audio = new Audio();

        audio.biquadFilter({ node: 'node' });
        var params = audio.get({ node: 'node' }).first().params;
        expect(params).toBeTruthy();
        var krateParam = params.first(function (x) { return x.type === 'k' });
        expect(krateParam).toBeTruthy();
    })


    it('an oscillator node will have a defined listi of parameters which i can use for connecting and etc.', function () {
        var audio = new Audio();

        audio.oscillator({ node: 'node' });
        var params = audio.get({ node: 'node' }).first().params;
        expect(params).toBeTruthy();
        var krateParam = params.first(function (x) { return x.type === 'a' });
        expect(krateParam).toBeTruthy();
    });


    it('an convolver node will have a defined listi of parameters which i can use for connecting and etc.', function () {
        var audio = new Audio();

        audio.convolver({ node: 'node' });
        var params = audio.get({ node: 'node' }).first().params;
        expect(params).toBeTruthy();
        var krateParam = params.first(function (x) { return x.type === 'boolean' });
        expect(krateParam).toBeTruthy();
    });

    it('an delay node will have a defined listi of parameters which i can use for connecting and etc.', function () {
        var audio = new Audio();

        audio.delay({ node: 'node' });
        var params = audio.get({ node: 'node' }).first().params;
        expect(params).toBeTruthy();
        var krateParam = params.first(function (x) { return x.type === 'a' });
        expect(krateParam).toBeTruthy();
    });


    it('an dynamicsCompressor node will have a defined listi of parameters which i can use for connecting and etc.', function () {
        var audio = new Audio();

        audio.dynamicsCompressor({ node: 'node' });
        var params = audio.get({ node: 'node' }).first().params;
        expect(params).toBeTruthy();
        var krateParam = params.first(function (x) { return x.type === 'k' });
        expect(krateParam).toBeTruthy();
    });

    it('an gain node will have a defined listi of parameters which i can use for connecting and etc.', function () {
        var audio = new Audio();

        audio.gain({ node: 'node' });
        var params = audio.get({ node: 'node' }).first().params;
        expect(params).toBeTruthy();
        var krateParam = params.first(function (x) { return x.type === 'a' });
        expect(krateParam).toBeTruthy();
    });

    it('an waveShaper node will have a defined listi of parameters which i can use for connecting and etc.', function () {
        var audio = new Audio();

        audio.waveShaper({ node: 'node' });
        var params = audio.get({ node: 'node' }).first().params;
        expect(params).toBeTruthy();
        var krateParam = params.first(function (x) { return x.type === 'float32array' });
        expect(krateParam).toBeTruthy();
    });

    it('an analyser node will have a defined listi of parameters which i can use for connecting and etc.', function () {
        var audio = new Audio();

        audio.analyser({ node: 'node' });
        var params = audio.get({ node: 'node' }).first().params;
        expect(params).toBeTruthy();
        var krateParam = params.first(function (x) { return x.type === 'plainNumber' });
        expect(krateParam).toBeTruthy();
    });

    xit('can create a mediastream node', function (done) {
        var audio = new Audio();

        audio.mediastream({
            callback: function () {
                done();
            }
        });
    });

    xit('can create a mediastream node', function (done) {
        var audio = new Audio();
        MEPH.audio.Audio.OfflineMode = true;
        MEPH.audio.Audio.OfflineAudioContext = new (window.OfflineAudioContext)(32, 5 * 44100, 44100)

        audio.mediastream({
            callback: function (stream) {
                var video = document.createElement('video');
                document.body.appendChild(video);
                video.src = (window.URL && window.URL.createObjectURL(stream)) || stream;;
                video.autoPlay = true;
                video.onloadedmetadata = function (e) {
                    video.play();
                    video.muted = 'true';
                    MEPH.audio.Audio.OfflineAudioContext.startRendering();

                };
                audio.complete({
                    oncomplete: function (res) {


                        audio.disconnect();
                        done();
                    },
                });

            }
        })

    })
});