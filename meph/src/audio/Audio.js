/**
 * @class MEPH.audio.Audio
 * Defines a base class for Audio.
 **/
MEPH.define('MEPH.audio.Audio', {
    requires: ['MEPH.util.Dom', 'MEPH.util.Observable'],
    statics: {
        /**
         * Audio context.
         */
        audioCtx: null,
        OfflineMode: false,
        sourcebuffer: null,
        CHANGED_BUFFER_SOURCE: 'CHANGED_BUFFER_SOURCE',
        nodeTypes: {
            oscillator: 'oscillator',
            gain: 'gain',
            convolver: 'convolver',
            delay: 'delay',
            audioElement: 'audioElement',
            dynamicsCompressor: 'dynamicsCompressor',
            mediastream: 'mediastream',
            waveShaper: 'waveShaper',
            analyser: 'analyser',
            splitter: 'splitter',
            processor: 'processor',
            merger: 'merger',
            periodicWave: 'periodicWave',
            panner: 'panner',
            buffer: 'buffer ',
            biquadFilter: 'biquadFilter'
        },
        GetSourceBuffer: function () {
            MEPH.audio.Audio.$sourcebuffer = MEPH.audio.Audio.$sourcebuffer || [];
            return MEPH.audio.Audio.$sourcebuffer;
        },
        GetContext: function (options) {
            var audio = new MEPH.audio.Audio();
            return audio.createContext(options);
        },
        /**
         * Does a quick analysis of resource.
         **/
        quickAnalysis: function (resource, start, end, frames) {
            var result = [];

            start = start || 0;
            end = end || resource.buffer.buffer.duration;

            var sampleRate = resource.buffer.buffer.sampleRate;
            var startframe = sampleRate * start;
            var endFrame = sampleRate * end;
            var frameCount = endFrame - startframe;
            frames = frames || 2000;
            frames = Math.min(frames, 2000);
            frames = Math.round(Math.max(1, frameCount / frames));
            for (var i = 0 ; i < resource.buffer.channelCount; i++) {
                var channeldata = resource.buffer.buffer.getChannelData(i);
                var subres = channeldata.skipEveryFromTo(Math.round(frames), Math.round(startframe), Math.round(endFrame), function (x) {
                    return x;
                });
                result.push({ channel: i, data: subres });
            }
            return result;
        },

        copy: function (resource, options) {
            var audio = new MEPH.audio.Audio();
            return audio.copyToBuffer(resource, 0, resource.buffer.buffer.duration, options);

        },

        noteFromPitch: function (frequency) {
            var noteNum = 12 * (Math.log(frequency / 440) / Math.log(2));
            return Math.round(noteNum) + 69;
        },

        frequencyFromNoteNumber: function (note) {
            return 440 * Math.pow(2, (note - 69) / 12);
        },

        centsOffFromPitch: function (frequency, note) {
            var AAudio = MEPH.audio.Audio;
            return Math.floor(1200 * Math.log(frequency / AAudio.frequencyFromNoteNumber(note)) / Math.log(2));
        },
        autoCorrelate: function (buf, sampleRate) {

            var SIZE = buf.length;
            var MIN_SAMPLES = 0;  // will be initialized when AudioContext is created.
            var MAX_SAMPLES = Math.floor(SIZE / 2);
            var best_offset = -1;
            var best_correlation = 0;
            var rms = 0;
            var foundGoodCorrelation = false;
            var correlations = new Array(MAX_SAMPLES);

            var rafID = null;
            var tracks = null;
            //var buflen = 1024;
            //var buf = new Float32Array(buflen);


            for (var i = 0; i < SIZE; i++) {
                var val = buf[i];
                rms += val * val;
            }
            rms = Math.sqrt(rms / SIZE);
            if (rms < 0.01) // not enough signal
                return -1;

            var lastCorrelation = 1;
            for (var offset = MIN_SAMPLES; offset < MAX_SAMPLES; offset++) {
                var correlation = 0;

                for (var i = 0; i < MAX_SAMPLES; i++) {
                    correlation += Math.abs((buf[i]) - (buf[i + offset]));
                }
                correlation = 1 - (correlation / MAX_SAMPLES);
                correlations[offset] = correlation; // store it, for the tweaking we need to do below.
                if ((correlation > 0.9) && (correlation > lastCorrelation)) {
                    foundGoodCorrelation = true;
                    if (correlation > best_correlation) {
                        best_correlation = correlation;
                        best_offset = offset;
                    }
                } else if (foundGoodCorrelation) {
                    // short-circuit - we found a good correlation, then a bad one, so we'd just be seeing copies from here.
                    // Now we need to tweak the offset - by interpolating between the values to the left and right of the
                    // best offset, and shifting it a bit.  This is complex, and HACKY in this code (happy to take PRs!) -
                    // we need to do a curve fit on correlations[] around best_offset in order to better determine precise
                    // (anti-aliased) offset.

                    // we know best_offset >=1, 
                    // since foundGoodCorrelation cannot go to true until the second pass (offset=1), and 
                    // we can't drop into this clause until the following pass (else if).
                    var shift = (correlations[best_offset + 1] - correlations[best_offset - 1]) / correlations[best_offset];
                    return sampleRate / (best_offset + (8 * shift));
                }
                lastCorrelation = correlation;
            }
            if (best_correlation > 0.01) {
                // console.log("f = " + sampleRate/best_offset + "Hz (rms: " + rms + " confidence: " + best_correlation + ")")
                return sampleRate / best_offset;
            }
            return -1;
            //	var best_frequency = sampleRate/best_offset;
        },
        bpm: function (buffer) {
            return new Promise(function (r) {
                var audio = new MEPH.audio.Audio();
                var context = MEPH.audio.Audio.OfflineAudioContext = new OfflineAudioContext(1, buffer.buffer.length, buffer.buffer.sampleRate);;
                audio.buffer(buffer.buffer, { name: 'buffer' }).biquadFilter({ type: 'lowpass' }).complete({
                    channels: 1,
                    length: buffer.buffer.length,
                    sampleRate: buffer.buffer.sampleRate
                });
                var oncompleted = function (e) {

                    // Filtered buffer!
                    var filteredBuffer = e.renderedBuffer;

                    var peaks,
                        initialThresold = 0.9,
                        thresold = initialThresold,
                        minThresold = 0.1,
                        minPeaks = 30;

                    do {
                        peaks = MEPH.audio.Audio.getPeaksAtThreshold(e.renderedBuffer.getChannelData(0), thresold);
                        thresold -= 0.05;
                    } while (peaks.length < minPeaks && thresold >= minThresold);


                    var intervals = MEPH.audio.Audio.countIntervalsBetweenNearbyPeaks(peaks);

                    var groups = MEPH.audio.Audio.groupNeighborsByTempo(intervals, filteredBuffer.sampleRate);

                    context.removeEventListener(oncompleted);
                    r(groups.where(function (x) {
                        return !isNaN(x.tempo);
                    }).orderBy(function (x, y) {
                        return y.count - x.count;
                    }));
                }

                var node = audio.get({ name: 'buffer' }).first();
                node.node.start(context.currentTime);

                context.startRendering();
                context.addEventListener('complete', oncompleted);
            });

        },
        /**
         * Detects silence in a ArrayBuffer
         * @param {Number} silenceLevel
         * @param {Number} fuzzyarea
         * @param {Number} jump
         * @return {Array}
         ***/
        detectSilence: function (buf, silenceLevel, fuzzyarea, jump) {
            var result = [];
            jump = jump || 1;
            fuzzyarea = fuzzyarea || 10;
            silenceLevel = silenceLevel || 0;

            var sections = Math.ceil(buf.length / fuzzyarea);
            [].interpolate(0, sections, function (sectionIndex) {

                var subset = buf.subset(sectionIndex * fuzzyarea, (sectionIndex + 1) * fuzzyarea);
                var m = subset.maximum(function (x) { return Math.abs(x); });
                var last = result.last();
                if (silenceLevel >= (m)) {

                    if (!last) {
                        result.push({
                            section: sectionIndex,
                            start: sectionIndex
                        });
                    }
                    else {
                        if (last.section >= sectionIndex - jump && last.end === undefined) { // If its the next section 
                            //combine them in to a single.
                            last.section = sectionIndex;

                        }
                        else {
                            result.push({
                                section: sectionIndex,
                                start: sectionIndex
                            });
                        }
                    }
                }
                else {
                    if (last && last.end === undefined) {
                        last.end = sectionIndex - 1;
                    }
                }
            })
            return result.select(function (x) {
                return {
                    start: x.start * fuzzyarea,
                    end: (x.end + 1) * fuzzyarea
                }
            });
        },

        /**
         * Detects pitches in a ArrayBuffer
         * @param {Number} sampleRate
         * @param {Number} fuzzyarea
         * @param {Number} jump
         * @return {Array}
         ***/
        detectPitches: function (buf, sampleRate, fuzzyarea, jump) {
            var AAudio = MEPH.audio.Audio,
                result = [];
            jump = jump || 1;
            fuzzyarea = fuzzyarea || buf.length / 2;

            var sections = Math.ceil(buf.length / fuzzyarea);
            [].interpolate(0, sections, function (sectionIndex) {

                var subset = buf.subset(sectionIndex * fuzzyarea, (sectionIndex + 1) * fuzzyarea);
                var m = AAudio.updatePitch(subset, sampleRate);
                //subset.maximum(function (x) { return Math.abs(x); });
                var last = result.last();
                if (m) {

                    if (!last) {
                        result.push({
                            section: sectionIndex,
                            start: sectionIndex,
                            key: m
                        });
                    }
                    else {
                        if (last.key.note === m.note && last.section >= sectionIndex - jump && last.end === undefined) { // If its the next section 
                            //combine them in to a single.
                            last.section = sectionIndex;

                        }
                        else {
                            if (last.key.note !== m.note && last.end === undefined) {
                                last.end = sectionIndex - 1;
                            }
                            result.push({
                                section: sectionIndex,
                                start: sectionIndex,
                                key: m
                            });
                        }
                    }
                }
                else {
                    if (last && last.end === undefined) {
                        last.end = sectionIndex - 1;
                    }
                }
            })
            return result.select(function (x) {
                return {
                    start: x.start * fuzzyarea,
                    end: (x.end + 1) * fuzzyarea,
                    key: x.key
                }
            });
        },
        updatePitch: function (buf, sampleRate) {
            var AAudio = MEPH.audio.Audio,
                pitch;

            var ac = AAudio.autoCorrelate(buf, sampleRate);
            var result = {};
            var noteStrings = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
            if (ac == -1) {
                result = null;
            } else {
                pitch = ac;
                var note = AAudio.noteFromPitch(pitch);
                var notestr = noteStrings[note % 12];
                var detune = AAudio.centsOffFromPitch(pitch, note);

                result.pitch = Math.round(pitch * 100) / 100;
                result.note = notestr;

                if (detune == 0) {
                } else {
                    if (detune < 0)
                        result.detune = "flat";
                    else
                        result.detune = "sharp";
                }
            }
            return result;

        },
        // https://github.com/JMPerez/beats-audio-api/blob/gh-pages/script.js
        // Function used to return a histogram of peak intervals
        countIntervalsBetweenNearbyPeaks: function (peaks) {
            var intervalCounts = [];
            peaks.foreach(function (peak, index) {
                for (var i = 0; i < 10; i++) {
                    var interval = peaks[index + i] - peak;
                    var foundInterval = intervalCounts.some(function (intervalCount) {
                        if (intervalCount.interval === interval)
                            return intervalCount.count++;
                    });
                    if (!foundInterval) {
                        intervalCounts.push({
                            interval: interval,
                            count: 1
                        });
                    }
                }
            });
            return intervalCounts;
        },
        // https://github.com/JMPerez/beats-audio-api/blob/gh-pages/script.js
        // Function used to return a histogram of tempo candidates.
        groupNeighborsByTempo: function (intervalCounts, sampleRate) {
            var tempoCounts = [];
            intervalCounts.foreach(function (intervalCount, i) {
                if (intervalCount.interval !== 0) {
                    // Convert an interval to tempo
                    var theoreticalTempo = 60 / (intervalCount.interval / sampleRate);

                    // Adjust the tempo to fit within the 90-180 BPM range
                    while (theoreticalTempo < 90) theoreticalTempo *= 2;
                    while (theoreticalTempo > 180) theoreticalTempo /= 2;

                    theoreticalTempo = Math.round(theoreticalTempo);
                    var foundTempo = tempoCounts.some(function (tempoCount) {
                        if (tempoCount.tempo === theoreticalTempo)
                            return tempoCount.count += intervalCount.count;
                    });
                    if (!foundTempo) {
                        tempoCounts.push({
                            tempo: theoreticalTempo,
                            count: intervalCount.count
                        });
                    }
                }
            });
            return tempoCounts;
        },
        // https://github.com/JMPerez/beats-audio-api/blob/gh-pages/script.js
        // Function to identify peaks
        getPeaksAtThreshold: function (data, threshold) {
            var peaksArray = [];
            var length = data.length;
            for (var i = 0; i < length;) {
                if (data[i] > threshold) {
                    peaksArray.push(i);
                    // Skip forward ~ 1/4s to get past this peak.
                    i += 10000;
                }
                i++;
            }
            return peaksArray;
        },
        analyze: function (audiofile, audiofiletyp, resolution) {
            var audio = new MEPH.audio.Audio(),
                func = function (result) {
                    if (resolution === undefined) {
                        resolution = Math.max(1, Math.round((result.buffer.buffer.duration * result.buffer.buffer.sampleRate) / 5760));
                    }
                    audio.buffer(result.buffer).volume({ name: 'volume', resolution: resolution }).gain({ name: 'gain', volume: 0 }).complete();
                    return new Promise(function (r) {

                        result.buffer.onended = function () {
                            var volume = audio.get({ name: 'volume' }).first();
                            audio.disconnect();
                            result.buffer.stop();
                            r(volume);
                        }
                        result.buffer.start();

                    });
                };
            if (arguments.length === 2) {
                return audio.load(audiofile, audiofiletyp).then(function (resource) {

                    var result = audio.copyToBuffer(resource, 0, resource.buffer.buffer.duration);
                    return func(result)
                })
            }
            else if (arguments.length === 1) {
                return func({ buffer: audiofile });
            }
        },
        /**
         * Extracts a clip from a resoure
         * @param {Object} resource
         * @param {Number} from
         * @param {Number} to
         ***/
        clip: function (resource, from, to, options) {

            var audio = new MEPH.audio.Audio();


            return audio.copyToBuffer(resource, from, to, options);
        },

        /**
         * Extracts a clip from a resoure
         * @param {Object} resource
         * @param {Number} from, frame index
         * @param {Number} to, frame index
         ***/
        clipBuffer: function (resource, from, to, options, windowing) {
            var audio = new MEPH.audio.Audio();

            return audio.copyBuffer(resource, from, to, options, null, windowing);
        },
        stretch: function (resource, by) {
            var audio = new MEPH.audio.Audio();
            var stretch = Math.round(resource.buffer.buffer.sampleRate * by);
            var intermediate = audio.copyBuffer(resource, 0, 0, null, stretch);
            return audio.copyBuffer(intermediate, 0, 0, null, resource.buffer.buffer.sampleRate);
        },
        /**
         * Creates a new resource with a section gone from a resource.
         * @param {Object} resource
         * @param {Number} from
         * @param {Number} to
         * @param {Object} options
         * @param {Object}
         ***/
        cutOutSection: function (resource, from, to, options) {
            var audio = new MEPH.audio.Audio();

            return audio.cutOutSection(resource, from, to, options);
        }
    },
    properties: {
        /**
         * Audio context.
         */
        audioCtx: null,
        nodes: null,
        sourcebuffer: null,
        $destination: null,
        title: 'Untitled',
        id: null,
        offlineContext: false
    },
    initialize: function (injections) {
        var me = this;
        MEPH.applyIf(injections, me);
        me.nodes = [];
        me.id = MEPH.GUID();
        me.sourcebuffer = [];
    },
    /**
     * Loads a resouce.
     **/
    load: function (file, type, options) {
        var me = this,
            result = me.getBufferSources().first(function (x) {
                return x.file === file && x.type === type;
            });
        if (result) {
            return Promise.resolve().then(function () {
                return result;
            });
        }
        return MEPH.loadJSCssFile(file, type).then(function (result) {
            return me.loadByteArray(result.response, options, file, type);
        })
    },
    /**
     * Loads a byte array.
     * @param {ByteArray} bytearray
     * @return {Promise}
     ***/
    loadByteArray: function (bytearray, options, file, type) {
        var me = this, toresolve, tofail,
            result = me.getBufferSources().first(function (x) {
                return x.file === file && x.type === type;
            });
        var promise = new Promise(function (r, s) {
            toresolve = r;
            tofail = s;
        });
        if (result) {

            toresolve(result);
            return promise;
        }
        var context = me.createContext(options);

        context.decodeAudioData(
          bytearray,
          function (buffer) {
              var sbuffer = me.buffersource();
              sbuffer.buffer = buffer;

              me.addBufferSource({
                  buffer: sbuffer,
                  file: file,
                  type: type
              });

              toresolve(me.getBufferSources().last());
          },
          function (e) {
              tofail(e);
          });
        return promise;
    },
    /**
     * Copies a section of a buffer to a new buffer,
     * @param {Object} resource
     * @param {Number} start
     * @param {Number} end
     **/
    copyToBuffer: function (resource, start, end, options) {
        var me = this;
        var buffer = resource.buffer;
        var rate = buffer.buffer.sampleRate;
        var channels = buffer.channelCount;
        var duration = (end - start);
        var rate = buffer.buffer.sampleRate;
        var frame_start = Math.round(start * rate);
        var frame_end = Math.round(end * rate);
        var frameCount = frame_end - frame_start;
        frameCount = Math.round(frameCount);
        return me.copyBuffer(resource, frame_start, frame_end, options);
    },
    copyBuffer: function (resource, frame_start, frame_end, options, sampleRate, windowing) {
        var me = this;
        frame_end = Math.round(frame_end) || resource.buffer.buffer.length;
        frame_start = Math.round(frame_start) || 0;
        var buffer = resource.buffer;
        var rate = buffer.buffer.sampleRate;
        var channels = buffer.channelCount;
        var frameCount = frame_end - frame_start;
        frameCount = Math.round(frameCount);
        var audioCtx = me.createContext(options);
        var myArrayBuffer = audioCtx.createBuffer(channels, frameCount, Math.min(192000, Math.max(3000, sampleRate || audioCtx.sampleRate)));

        // Fill the buffer with white noise;
        // just random values between -1.0 and 1.0
        for (var channel = 0; channel < channels; channel++) {
            // This gives us the actual array that contains the data
            var nowBuffering = myArrayBuffer.getChannelData(channel);
            var bufferdata = buffer.buffer.getChannelData(Math.min(buffer.buffer.numberOfChannels - 1, channel));
            for (var i = 0; i < frameCount; i++) {
                // Math.random() is in [0; 1.0]
                // audio needs to be in [-1.0; 1.0]
                if (windowing) {
                    nowBuffering[i] = bufferdata[i + frame_start] * (windowing[i] !== undefined ? windowing[i] : 1);
                }
                else
                    nowBuffering[i] = bufferdata[i + frame_start];
            }
        }
        var source = audioCtx.createBufferSource();

        // set the buffer in the AudioBufferSourceNode
        source.buffer = myArrayBuffer;
        return { name: MEPH.GUID(), buffer: source, type: '' };

    },
    /**
     * @private
     **/
    cutOutSection: function (resource, frame_start, frame_end, options) {
        var me = this;
        frame_end = Math.round(frame_end);
        frame_start = Math.round(frame_start);
        var buffer = resource.buffer;
        var rate = buffer.buffer.sampleRate;
        var channels = buffer.channelCount;
        var frameCount = frame_end - frame_start;
        var bufferCount = buffer.buffer.duration * rate;
        frameCount = Math.round(frameCount);
        bufferCount -= frameCount;
        frameCount = bufferCount
        var audioCtx = me.createContext(options);
        var myArrayBuffer = audioCtx.createBuffer(channels, frameCount, audioCtx.sampleRate);

        // Fill the buffer with white noise;
        // just random values between -1.0 and 1.0
        for (var channel = 0; channel < channels; channel++) {
            // This gives us the actual array that contains the data
            var nowBuffering = myArrayBuffer.getChannelData(channel);
            var bufferdata = buffer.buffer.getChannelData(channel);
            for (var i = 0; i < frameCount; i++) {
                // Math.random() is in [0; 1.0]
                // audio needs to be in [-1.0; 1.0]
                if (i < frame_start) {
                    nowBuffering[i] = bufferdata[i];
                }
                else {

                    nowBuffering[i] = bufferdata[i + frame_end];
                }
            }
        }
        var source = audioCtx.createBufferSource();

        // set the buffer in the AudioBufferSourceNode
        source.buffer = myArrayBuffer;
        return { name: MEPH.GUID(), buffer: source, type: '' };
    },
    createBuffer: function (channels, frameCount, sampleRate, options) {//2, frameCount, audioCtx.sampleRate
        var me = this;
        var audioCtx = me.createContext(options);
        return audioCtx.createBuffer(channels, frameCount, sampleRate);
    },
    /**
     * Serializes a buffer object in to a string.
     * @param {Object} bufferObject
     **/
    serializeBuffer: function (bufferObject) {
        var me = this, res = {};
        res.name = bufferObject.name;
        res.type = bufferObject.type;
        var bufer = [].interpolate(0, bufferObject.buffer.numberOfChannels, function (channel) {
            var data = bufferObject.buffer.getChannelData(channel);
            return {
                channel: channel,
                data: [].interpolate(0, data.length, function (x) { return data[x]; })
            }
        });
        res.sampleRate = bufferObject.buffer.sampleRate;
        res.buffer = bufer;
        res.id = bufferObject.id;
        return btoa(JSON.stringify(res));
    },
    /**
     * Deserializes a string in to a buffer.
     **/
    deserializeBuffer: function (bufferString) {
        var me = this;
        var jsonstring = atob(bufferString);
        var obj = JSON.parse(jsonstring);
        var channels = obj.buffer.length;
        var frameCount = obj.buffer.first().data.length;
        var source = me.createContext().createBuffer(channels, frameCount, obj.sampleRate);
        obj.buffer.foreach(function (channelData, i) {
            var data = source.getChannelData(channelData.channel);
            channelData.data.foreach(function (t, y) {
                data[y] = t;
            });
        });
        return {
            name: obj.name,
            type: obj.type,
            buffer: source,
            id: obj.id
        }
    },
    /**
     * Sets the duration to be played.
     **/
    duration: function (time) {
        var me = this;
        if (time !== undefined) {
            this.$duration = time;
        }
        return this.$duration;
    },
    getSourceDuration: function () {
        var me = this;
        var duration = me.nodes.where(function (x) {
            return x.type === MEPH.audio.Audio.nodeTypes.buffer;
        }).maximum(function (node) {
            return node.buffer.duration;
        })
        return duration || 0;
    },
    getBufferSources: function () {
        var me = this, Audio = MEPH.audio.Audio;
        Audio.$sourcebuffer = Audio.$sourcebuffer || [];
        return MEPH.audio.Audio.$sourcebuffer.select();
    },

    /**
     * Gets the array buffer by id.
     * @param {String} id
     * @return {ArrayBuffer}
     **/
    getBuffer: function (id) {
        var me = this;
        var buffer = me.getBufferSources().first(function (x) { return x.id === id; });
        if (buffer && buffer.buffer && buffer.buffer.buffer) {
            return buffer.buffer.buffer;
        }
        else if (buffer && buffer.buffer) {
            return buffer.buffer;
        }
    },
    /**
     * Adds a buffer source.
     * @param {Object} options
     * @return {Array}
     ***/
    addBufferSource: function (options) {
        var me = this, Audio = MEPH.audio.Audio;

        Audio.$sourcebuffer = Audio.$sourcebuffer || ([]);//MEPH.util.Observable.observable
        options.id = options.id || MEPH.GUID();
        Audio.$sourcebuffer.push(options);
        MEPH.publish(MEPH.audio.Audio.CHANGED_BUFFER_SOURCE, options, Audio.$sourcebuffer);
        return options;
    },
    /**
     * Remove buffer source by id.
     * @param {String} id
     * @return {Array}
     ***/
    removeBufferSource: function (id) {
        var Audio = MEPH.audio.Audio;
        if (Audio.$sourcebuffer) {
            MEPH.publish(MEPH.audio.Audio.CHANGED_BUFFER_SOURCE, Audio.$sourcebuffer);
            return Audio.$sourcebuffer.removeWhere(function (t) { return t.id === id; });
        }
        return null;
    },
    clearContext: function () {
        var me = this;
        me.audioCtx = null;
        me.offlineAudioCtx = null;
        //MEPH.audio.Audio.OfflineAudioContext = null;
        //MEPH.audio.Audio.AudioContext = null;
        return me;
    },
    createContext: function (options) {
        var me = this;
        if (options || me.offlineMode || MEPH.audio.Audio.OfflineMode) {
            me.offlineMode = true;
            options = options || {};
            var audioCtx = MEPH.audio.Audio.OfflineAudioContext || me.offlineAudioCtx ||
                new (window.OfflineAudioContext)(options.channels || 32, options.length || 10000, options.sampleRate || 44100);
            if (options) {
                audioCtx.addEventListener('complete', options.oncomplete);
            }
            MEPH.audio.Audio.OfflineAudioContext = audioCtx;
            //MEPH.audio.Audio.AudioContext = me.audioCtx;
            me.currentContext = audioCtx;
            return audioCtx;
        }
        else {
            me.audioCtx = MEPH.audio.Audio.AudioContext || me.audioCtx || new (window.AudioContext || window.webkitAudioContext)();
            MEPH.audio.Audio.AudioContext = me.audioCtx;

            me.currentContext = audioCtx;
            return me.audioCtx;
        }
    },
    getContext: function () {
        var me = this;
        return me.currentContext;
    },
    getAudioContext: function () {
        var me = this;
        return me.audioCtx;
    },
    buffersource: function (options) {
        var me = this;
        var context = me.createContext(options);
        return context.createBufferSource();
    },
    buffer: function (buffer, options) {
        var me = this;
        options = options || { name: 'buffer' };

        if (!buffer && options.source) {
            var res = MEPH.audio.Audio.$sourcebuffer.first(function (x) { return x.id === options.source; })
            if (res) {
                buffer = res.buffer.buffer;
            }
        }
        if (!buffer && MEPH.audio.Audio.$sourcebuffer) {
            var res = MEPH.audio.Audio.$sourcebuffer.first(function (x) { return x; })
            if (res) {
                buffer = res.buffer.buffer;
            }
        }
        options.buffer = buffer instanceof AudioBufferSourceNode ? buffer.buffer : buffer;
        options.noinputs = true;
        me.nodes.push({ options: options, buffer: buffer, type: MEPH.audio.Audio.nodeTypes.buffer })
        return me;
    },
    /**
     * Analyses the volume. This doesnt really work at all.
     * @param {Object} options
     * @param {Number} options.resolution
     **/
    volume: function (options) {
        var me = this;
        var context = me.createContext();

        // Create a ScriptProcessorNode with a bufferSize of 4096 and a single input and output channel
        var scriptNode = context.createScriptProcessor(4096, 1, 1);

        var nodecontext = { options: options || null, node: scriptNode };
        me.nodes.push(nodecontext);
        nodecontext.data = [];
        // Give the node a function to process audio events
        scriptNode.onaudioprocess = function (nodecontext, audioProcessingEvent) {
            // The input buffer is the song we loaded earlier
            var inputBuffer = audioProcessingEvent.inputBuffer;

            // The output buffer contains the samples that will be modified and played
            var outputBuffer = audioProcessingEvent.outputBuffer;
            // Loop through the output channels (in this case there is only one)
            for (var channel = 0; channel < outputBuffer.numberOfChannels; channel++) {
                var inputData = inputBuffer.getChannelData(channel);
                var outputData = outputBuffer.getChannelData(channel);

                // Loop through the 4096 samples
                for (var sample = 0; sample < inputBuffer.length; sample++) {
                    // make output equal to the same as the input
                    outputData[sample] = inputData[sample];
                    var data = {};
                    if (sample % (options.resolution || 32) === 0) {
                        data[channel] = { amplitude: 0, num: 0 };
                        data[channel].amplitude += Math.pow((inputData[sample]), 2);
                        data[channel].num++;
                        nodecontext.data.push({ channels: data });
                    }
                }
            }
        }.bind(me, nodecontext);
        return me;
    },
    /**
     * Processor node.
     * @param {Object} options
     * @param {Number} options.resolution
     **/
    processor: function (options) {
        var me = this;
        var context = me.createContext();
        if (!options || !options.process) {
            throw new Error('Processor requires a process function.')
        }
        // Create a ScriptProcessorNode with a bufferSize of 4096 and a single input and output channel
        //        var scriptNode = context.createScriptProcessor(options.size || 1024, 1, 1);

        var nodecontext = {
            options: options || null,
            //   node: scriptNode,
            processor: options.process,
            type: MEPH.audio.Audio.nodeTypes.processor
        };
        me.nodes.push(nodecontext);
        nodecontext.data = [];
        // Give the node a function to process audio events
        //    scriptNode.onaudioprocess = options.process;

        return me;
    },
    /**
     * Creates an oscillator node
     **/
    oscillator: function (options) {
        var me = this,
            params = me.createK().concat(me.createA('frequency', 'detune')).concat(me.createS('type'));
        options = options || {};
        options.noinputs = true;
        me.createNode(options, function () {
            return MEPH.audio.Audio.nodeTypes.oscillator;
        }, params)
        return me;
    },
    mediastream: function (options) {
        var me = this,
            params = [];

        options = options || {};
        if (!options.stream) {
            MEPH.util.Dom.getUserMedia({
                audio: true
            }).then(function (stream) {
                options.stream = stream;
            }).then(function () {
                if (options.callback)
                    options.callback(options.stream);
            })
        }

        me.createNode(options, function () {
            return MEPH.audio.Audio.nodeTypes.mediastream;
        }, params)
        return me;
    },
    /**
     * The ConvolverNode interface is an AudioNode that performs a Linear Convolution on a given AudioBuffer, often used to achieve a reverb effect. A ConvolverNode always has exactly one input and one output.
     * @param {Object} options
     * @return {MEPH.audio.Audio}
     **/
    convolver: function (options) {
        var me = this, params = me.createK().concat(me.createA()).concat(me.createParams('boolean', 'normalize'));
        var convobuffer = me.createParams('buffer', 'convobuffer').first();
        convobuffer.alias = 'buffer';
        params.push(convobuffer);

        me.createNode(options, function () { return MEPH.audio.Audio.nodeTypes.convolver }, params)
        return me;
    },
    delay: function (options) {
        var me = this, params = me.createK().concat(me.createA('delayTime'));

        me.createNode(options, function () { return MEPH.audio.Audio.nodeTypes.delay }, params)
        return me;
    },
    dynamicsCompressor: function (options) {
        var me = this, params = me.createK('attack', 'knee', 'ratio', 'reduction', 'release', 'threshold').concat(me.createA());

        me.createNode(options, function () {
            return MEPH.audio.Audio.nodeTypes.dynamicsCompressor
        }, params)
        return me;

    },
    waveShaper: function (options) {
        var me = this, params = me.createS('oversample').concat(me.createParams('float32array', 'curve'));

        me.createNode(options || null, function () { return MEPH.audio.Audio.nodeTypes.waveShaper; }, params)
        return me;

    },
    audioelement: function (node, options) {
        var me = this;
        options = options || {};
        options.node = node;

        me.createNode(options || null, function () {
            return MEPH.audio.Audio.nodeTypes.audioElement;
        });

        return me;
    },
    analyser: function (options) {
        var me = this, params = me.createS().concat(me.createParams('plainNumber', 'fftSize', 'frequencyBinCount', 'maxDecibels', 'minDecibels', 'smoothingTimeConstant'));

        me.createNode(options || null, function () { return MEPH.audio.Audio.nodeTypes.analyser; }, params)
        return me;
    },
    splitter: function (options) {
        var me = this;
        options = options || {};
        options.splitIndex = 0;
        me.setChannels(options);
        me.createNode(options || null, function () { return MEPH.audio.Audio.nodeTypes.splitter; })
        return me;
    },
    merger: function (options) {
        var me = this;
        options = options || {};
        options.mergeIndex = 0;
        me.setChannels(options);
        me.createNode(options, function () { return MEPH.audio.Audio.nodeTypes.merger; })
        return me;
    },
    setChannels: function (options) {
        var me = this;
        if (options && options.buffer && options.buffer.id) {

            var count = me.nodes.count(function (node) {
                if (node && node.options && node.options.node && node.options.node.data && node.options.node.data.nodeOutputs)
                    return node.options.node.data.nodeOutputs.some(function (y) {
                        return y.id === options.buffer.id;
                    });
                return false;
            });
            if (count > 2) {
                options.channels = count;
            }
        }
    },
    periodicWave: function (options) {
        var me = this;

        me.createNode(options, function () { return MEPH.audio.Audio.nodeTypes.periodicWave; })
        return me;

    },
    panner: function (options) {
        var me = this;
        var context = me.createContext(),
            params = me.createParams('valueType', 'coneOuterAngle', 'coneInnerAngle', 'coneOuterGain', 'refDistance', 'maxDistance', 'rolloffFactor', 'panningModel');

        me.createNode(options, function () {
            return MEPH.audio.Audio.nodeTypes.panner
        }, params);
        return me;

    },
    createNode: function (options, func, params) {
        var me = this;
        var context = me.createContext();

        var node = func();

        me.nodes.push({ params: params, options: options || null, type: node });

        return me;
    },
    createK: function () {
        var me = this, args = MEPH.Array(arguments);
        return me.createParams.apply(me, ['k'].concat(args.select()))
    },
    createA: function () {
        var me = this, args = MEPH.Array(arguments);
        return me.createParams.apply(me, ['a'].concat(args.select()));
    },
    createS: function () {
        var me = this, args = MEPH.Array(arguments);
        return me.createParams.apply(me, (['S'].concat(args.select())));
    },
    createParams: function () {
        var me = this, args = MEPH.Array(arguments);
        var type = args.first();
        return args.subset(1).select(function (name) {
            return {
                type: type,
                name: name
            }
        });
    },
    biquadFilter: function (options) {
        var me = this, params = me.createK('Q', 'frequency', 'gain').concat(me.createA('detune')).concat(me.createS('type'));

        me.nodes.push({ params: params, options: options || null, type: MEPH.audio.Audio.nodeTypes.biquadFilter });

        return me;

    },
    play: function (delay) {
        var me = this;
        delay = delay || 0;
        me.nodes.where(function (x) {
            return x.type === MEPH.audio.Audio.nodeTypes.oscillator || x.type === MEPH.audio.Audio.nodeTypes.buffer
            || x.type === MEPH.audio.Audio.nodeTypes.processor;
        }).foreach(function (node) {
            //if (node.node.played) {

            //}
            if (node.type === MEPH.audio.Audio.nodeTypes.processor) {
                if (node.processor.context)
                    node.processor.context(me.createContext(), MEPH.audio.Audio.OfflineMode);

                if (node.processor.start)
                    node.processor.start(delay);
            }
            if (node.node) {
                if (node.node.start)
                    node.node.start(delay);
                node.node.played = true;
            }
        })
    },
    playProcessor: function (delay, explode) {
        var me = this;
        delay = delay || 0;
        me.completePlaying = false;

        me.nodes.where(function (x) {
            return x.type === MEPH.audio.Audio.nodeTypes.processor;
        }).foreach(function (node) {
            //if (node.node.played) {

            //}
            if (node.type === MEPH.audio.Audio.nodeTypes.processor) {
                if (node.processor.context && !node.processor.contextadded) {
                    node.processor.context(me.createContext(), MEPH.audio.Audio.OfflineMode);
                    node.processor.contextadded = true;

                }
                if (node.processor.start)
                    node.processor.start(delay, explode ? function () {
                        me.disconnect();
                        console.log('completed play')
                        me.completedPlaying = true;
                    } : null);
            }
        })
    },
    isReady: function () {
        var me = this;
        return me.completedPlaying;
    },
    stopProcessor: function (delay) {
        var me = this;
        delay = delay || 0;
        me.nodes.where(function (x) {
            return x.type === MEPH.audio.Audio.nodeTypes.processor;
        }).foreach(function (node) {
            if (node && node.processor && node.processor.stop)
                node.processor.stop(delay, function () {
                    me.disconnect();
                });
        });
    },
    stop: function (delay) {
        var me = this;
        delay = delay || 0;
        me.nodes.where(function (x) {
            return x.type === MEPH.audio.Audio.nodeTypes.oscillator || x.type === MEPH.audio.Audio.nodeTypes.buffer
            || x.type === MEPH.audio.Audio.nodeTypes.processor;
        }).foreach(function (node) {
            if (node && node.processor && node.processor.stop)
                node.processor.stop(delay, function () {
                    me.disconnect();
                });

            if (node.node && node.node.stop)
                node.node.stop(delay);

        });
    },
    disconnect: function () {
        var me = this,
            last,
            context = me.createContext();
        if (!me.completed) {
            return;
        }
        me.nodes.foreach(function (x, i) {
            if (x.node)
                x.node.disconnect();
            x.node = null;
        });
        //last.disconnect(context.destination);
        me.completed = false;
    },
    gain: function (options) {
        var me = this, params = me.createK().concat(me.createA('gain')).concat(me.createS());

        me.nodes.push({ params: params, options: options || null, type: MEPH.audio.Audio.nodeTypes.gain });

        return me;
    },
    /**
     * Creates an audio node based on the type.
     * @param {String} type
     * @return {Audio}
     */
    createAudioNode: function (type, options, nodeoptions) {
        var A = MEPH.audio.Audio;
        nodeoptions = nodeoptions || {};
        var me = this;
        var real = new Float32Array(2);
        var imag = new Float32Array(2);

        real[0] = 0;
        imag[0] = 0;
        real[1] = 1;
        imag[1] = 0;
        var nodel
        switch (type) {
            case A.nodeTypes.oscillator:
                return me.createContext(options).createOscillator();
            case A.nodeTypes.gain:
                node = me.createContext(options).createGain();
                node.gain.value = nodeoptions.volume === undefined || nodeoptions.volume === null ? 1 : nodeoptions.volume;
                return node;
            case A.nodeTypes.panner:
                return me.createContext(options).createPanner();

            case A.nodeTypes.convolver:
                return me.createContext(options).createConvolver();

            case A.nodeTypes.delay:
                return me.createContext(options).createDelay();
            case A.nodeTypes.dynamicsCompressor:
                return me.createContext(options).createDynamicsCompressor();
            case MEPH.audio.Audio.nodeTypes.audioElement:
                return me.createContext(options).createMediaElementSource(nodeoptions.node);
            case A.nodeTypes.waveShaper:
                return me.createContext(options).createWaveShaper();
            case A.nodeTypes.analyser:
                return me.createContext(options).createAnalyser();
            case A.nodeTypes.splitter:
                return me.createContext(options).createChannelSplitter(nodeoptions.channels || 2);
            case A.nodeTypes.merger:
                return me.createContext(options).createChannelMerger(nodeoptions.channels || 2);
            case A.nodeTypes.periodicWave:
                return me.createContext(options).createPeriodicWave(nodeoptions.real || real, nodeoptions.imaginary || imag);
            case A.nodeTypes.biquadFilter:
                return me.createContext(options).createBiquadFilter();
            case A.nodeTypes.buffer:
                var bs = me.createContext(options).createBufferSource();
                bs.buffer = nodeoptions.buffer;
                return bs;
            case A.nodeTypes.bufferSource:
                return me.createContext(options).createBufferSource();
            case A.nodeTypes.mediastream:
                var node = me.createContext(options).createMediaStreamSource(nodeoptions.stream);
                return node;
            case A.nodeTypes.processor:
                var context = me.createContext(options)
                var res = context.createScriptProcessor(nodeoptions.size || 1024, 1, 1);
                res.onaudioprocess = nodeoptions.process;
                return res;
            default:
                throw new Error('unhandled case: createAudioNode. : ' + type)

        }
    },
    get: function (query) {
        var me = this;

        return me.nodes.where(function (x) {
            for (var i in query) {
                return (x.options && x.options[i] === query[i]);
            }
            return false;
        });
    },
    /**
     * Connects a audio to the end of this audio.
     **/
    connect: function (audio) {
        var me = this;
        if (me !== audio && !me.contains(audio) &&
            !audio.contains(me)) {
            me.nodes.push({ type: 'Audio', options: { audio: audio } });
            return me;
        }
        throw new Error('adding node will create a circular loop.')
    },
    /**
     * Returns true if node is found in descendants.
     **/
    contains: function (audioNode) {
        var me = this;
        return !!me.getAudioNodes().first(function (x) { return x.options.audio === audioNode })
    },

    getAudioNodes: function () {
        var me = this;
        var nodes = me.nodes.where(function (x) {
            return x.type === 'Audio';
        }).concatFluent(function (x) {
            return [x].concat(x.options.audio.getAudioNodes());
        });
        return nodes;
    },
    /**
     * Gets all the descendant nodes connected to it.
     * @return {Array}
     **/
    getNodes: function () {
        var me = this;
        var nodes = me.nodes.concatFluent(function (x) {
            if (x.type === 'Audio') {
                return x.options.audio.getNodes();
            }
            else {
                return [x];
            }
        });
        return nodes;
    },
    playbuffer: function () {
        var audio = this, node;
        node = audio.get({ name: 'buffer' }).first()
        if (node)
            node.node.start();
    },
    complete: function (options) {
        var me = this, last, targetnode,
            nodes = me.getNodes();
        if (me.completed) {
            me.disconnect();
        }
        me.completed = true;
        nodes.foreach(function (x, index) {
            if (!x.node) {
                x.node = me.createAudioNode(x.type, options, x.options);
            }
            if (index) {
                if (x.options && x.options.buffer && x.options.buffer.id) {//If point to a specific node, find it in the previous partss.
                    me.completeTargetNodes(nodes, x);
                }
                else if (x.options && x.options.noinputs) {
                    //do nothin.
                }
                else {
                    last.connect(x.node);
                }


            }
            if (x.params) {
                x.params.foreach(function (param) {
                    if (x.options && x.options[param.name] && typeof x.options[param.name] === 'object') {
                        me.connectTargetToNode(nodes, x, param);
                    }
                    else if (x.node[param.name] !== undefined && x.options && x.options[param.name] !== null && x.options[param.name] !== undefined) {
                        if (typeof x.node[param.name] === 'object' && x.node[param.name]) {
                            x.node[param.name].value = x.options[param.name];
                        }
                        else {
                            x.node[param.name] = x.options[param.name];
                        }
                    }
                    else if (param.alias) {
                        switch (param.type) {
                            case 'buffer':
                                x.node[param.alias] = me.getBuffer(x.options[param.name]);
                                break;
                        }
                    }
                })
            }
            last = x.node;
        });

        me.connectToDestination(last, options);
        // last.connect(me.createContext(options).destination);
        return me;
    },
    connectToDestination: function (lastnode, options) {
        var me = this, destinationNode = me.getDestination();
        if (destinationNode) {
            var dNode = destinationNode.getNodeToConnectTo();
            if (!dNode) {
                MEPH.Log('Audio.js : No node to connect to.')
            }
            lastnode.connect(dNode);
        }
        else {
            var context = me.createContext(options);
            var dest = context.destination;
            lastnode.connect(dest);
        }
    },
    getNodeToConnectTo: function () {
        var me = this;
        var node = me.nodes.first();

        if (node) {
            if (!me.completed) {
                me.complete();
            }
            return node.node;
        }
        return null;
    },
    getDestination: function () {
        var me = this;
        return me.$destination || null;
    },
    /**
     * Sets the destination the Audio object will attach.
     * @param {MEPH.audio.Audio} destination
     **/
    setDestination: function (destination) {
        var me = this;
        me.$destination = destination;
    },
    getBufferIndex: function (x) {
        if (x.type === MEPH.audio.Audio.nodeTypes.merger)
            switch (x.options.buffer.name) {
                case 'buffer':
                    return 0;
                case 'buffer2':
                    return 1;
                case 'buffer3':
                    return 2;
                case 'buffer4':
                    return 3;
            }
    },
    connectTargetToNode: function (nodes, x, param) {
        var targetnode,
            me = this;

        targetnode = nodes.first(function (node) {
            return node.options.node.data.nodeOutputs.some(function (y) {
                return y.id === x.options[param.name].id;
            });
        });

        switch (targetnode.type) {
            case 'splitter':
                x.options.splitIndex = x.options.splitIndex || -1;
                x.options.splitIndex++;

                targetnode.node.connect(x.node[param.name], 0, x.options.splitIndex);

                break;
            default:
                if (x.type === MEPH.audio.Audio.nodeTypes.merger) {
                    x.options.mergedIndex = x.options.mergedIndex || -1;
                    x.options.mergedIndex++;
                    targetnode = nodes.first(function (node) {
                        return node.options.node.data.nodeOutputs.some(function (y) { return y.id === x.options.buffer.id; });
                    });

                    targetnode.node.connect(x.node[param.name], 0, x.options.mergedIndex);

                }
                else
                    targetnode.node.connect(x.node[param.name]);
                break;
        }
    },
    completeTargetNodes: function (nodes, x) {
        var targetnode,
            me = this;

        targetnode = nodes.first(function (node) {
            return node.options.node.data.nodeOutputs.some(function (y) { return y.id === x.options.buffer.id; });
        });

        switch (targetnode.type) {
            case 'splitter':
                x.options.splitIndex = x.options.splitIndex || -1;
                x.options.splitIndex++;

                targetnode.node.connect(x.node, 0, x.options.splitIndex);

                break;
            default:
                if (x.type === MEPH.audio.Audio.nodeTypes.merger) {
                    x.options.mergedIndex = x.options.mergedIndex || -1;
                    x.options.mergedIndex++;

                    var options = [].interpolate(0, 4, function (i) {
                        if (i) {
                            return 'buffer' + (i + 1)
                        }
                        return 'buffer';
                    });

                    options.where(function (t) {
                        return x.options[t];
                    }).foreach(function (op) {
                        targetnode = nodes.first(function (node) {
                            return node.options.node.data.nodeOutputs.some(function (y) {
                                return y.id === x.options[op].id;
                            });
                        });
                        if (targetnode)
                            targetnode.node.connect(x.node, 0, x.options.mergedIndex);
                    })
                }
                else
                    targetnode.node.connect(x.node);
                break;
        }

    }
});