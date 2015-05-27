/**
 * @class MEPH.audio.processor.SoundProcessor 
 **/
MEPH.define('MEPH.audio.processor.SoundProcessor', {
    extend: 'MEPH.audio.processor.FIFOProcessor',
    requires: ['MEPH.audio.processor.RateTransposer', 'MEPH.audio.processor.TDStretch'],
    statics: {
        Process: function (signal) {
            var res;
            var processor = new MEPH.audio.processor.SoundProcessor();
            processor.setup();
            processor.setTempo(1.4);
            var buff_size = processor.standardsize;
            var c = 0;
            var oc = 0;
            var channels = 1;
            var buffSizeSamples = buff_size / channels;
            var outputbuff = new Float32Array(buff_size);
            var output = new Float32Array(signal.length);
            while (c < signal.length) {
                var sampleBuffer = signal.subset(c, c + buff_size);

                var numsamples = sampleBuffer.length / channels;
                processor.putSamples(sampleBuffer, numsamples);

                do {
                    nSamples = processor.receiveSamples(outputbuff, buffSizeSamples);
                    [].interpolate(0, nSamples, function (t) {
                        output[t + oc] = outputbuff[t];

                    });
                    oc += nSamples;
                } while (nSamples != 0);

                c += buff_size;
            }
            return output;
        }
    },
    properties: {
        pRateTransposer: null,
        pTDStretch: null,
        tempo: 0,
        standardsize: 2048
    },
    initialize: function (outputBuffer) {
        var me = this;
        var output = new MEPH.audio.processor.FIFOSampleBuffer(1);


        me.pRateTransposer = new MEPH.audio.processor.RateTransposer(output);
        var samplebuff = new MEPH.audio.processor.FIFOSampleBuffer(1);
        var inputbuffer = new MEPH.audio.processor.FIFOSampleBuffer(1);
        me.pTDStretch = new MEPH.audio.processor.TDStretch(samplebuff, inputbuffer);
        me.setOutPipe(me.pTDStretch);
        me.rate = 0;
        me.tempo = 0;
        me.virtualPitch = 1;
        me.virtualRate = 1;
        me.virtualTempo = 1;
        me.calcEffectiveRateAndTempo();

        me.channels = 0;
        me.bSrateSet = false;

    },
    setup: function () {
        var me = this;
        var sampleRate = 44100;
        var channels = 1;
        me.setSampleRate(sampleRate);
        me.setChannels(channels);

        me.setTempoChange(0);
        me.setPitchSemiTones(0);
        me.setRateChange(0);

        //me.setSetting('SETTING_USE_QUICKSEEK', params->quick);
        // me.setSetting('SETTING_USE_AA_FILTER', 128);

    },
    // Sets the number of channels, 1 = mono, 2 = stereo
    setChannels: function (numChannels) {
        var me = this;
        if (numChannels != 1 && numChannels != 2) {
            throw new Error("Illegal number of channels");
        }
        me.channels = numChannels;
        me.pRateTransposer.setChannels(numChannels);
        me.pTDStretch.setChannels(numChannels);
    },

    // Sets new rate control value. Normal rate = 1.0, smaller values
    // represent slower rate, larger faster rates.
    setRate: function (newRate) {
        var me = this;
        me.virtualRate = newRate;
        me.calcEffectiveRateAndTempo();
    },

    // Sets new rate control value as a difference in percents compared
    // to the original rate (-50 .. +100 %)
    setRateChange: function (newRate) {
        var me = this;
        me.virtualRate = 1.0 + 0.01 * newRate;
        me.calcEffectiveRateAndTempo();
    },


    // Sets new tempo control value. Normal tempo = 1.0, smaller values
    // represent slower tempo, larger faster tempo.
    setTempo: function (newTempo) {
        var me = this;
        me.virtualTempo = newTempo;
        me.calcEffectiveRateAndTempo();
    },




    // Sets new tempo control value as a difference in percents compared
    // to the original tempo (-50 .. +100 %)
    setTempoChange: function (newTempo) {
        var me = this;
        me.virtualTempo = 1.0 + 0.01 * newTempo;
        me.calcEffectiveRateAndTempo();
    },

    // Sets new pitch control value. Original pitch = 1.0, smaller values
    // represent lower pitches, larger values higher pitch.
    setPitch: function (newPitch) {
        var me = this;
        me.virtualPitch = newPitch;
        me.calcEffectiveRateAndTempo();
    },


    // Sets pitch change in octaves compared to the original pitch
    // (-1.00 .. +1.00)
    setPitchOctaves: function (newPitch) {
        var me = this;
        me.virtualPitch = Math.exp(0.69314718056 * newPitch);
        me.calcEffectiveRateAndTempo();
    },

    // Sets pitch change in semi-tones compared to the original pitch
    // (-12 .. +12)
    setPitchSemiTones: function (newPitch) {
        var me = this;
        me.setPitchOctaves(newPitch / 12.0);
    },




    setPitchSemiTones: function (newPitch) {
        var me = this;
        me.setPitchOctaves(newPitch / 12.0);
    },



    // Calculates 'effective' rate and tempo values from the
    // nominal control values.
    calcEffectiveRateAndTempo: function () {
        var me = this;
        var oldTempo = me.tempo;
        var oldRate = me.rate;

        me.tempo = me.virtualTempo / me.virtualPitch;
        me.rate = me.virtualPitch * me.virtualRate;
        var TEST_FLOAT_EQUAL = function (a, b) {
            return (Math.abs(a - b) < 1e-10);
        }
        if (!TEST_FLOAT_EQUAL(me.rate, oldRate)) me.pRateTransposer.setRate(me.rate);
        if (!TEST_FLOAT_EQUAL(me.tempo, oldTempo)) me.pTDStretch.setTempo(me.tempo);

        //#ifndef SOUNDTOUCH_PREVENT_CLICK_AT_RATE_CROSSOVER
        if (me.rate <= 1.0) {
            if (me.output != me.pTDStretch) {
                var tempoOut;

                me.assert(me.output === me.pRateTransposer);
                // move samples in the current output buffer to the output of pTDStretch
                tempoOut = me.pTDStretch.getOutput();
                tempoOut.moveSamples(me.output);
                // move samples in pitch transposer's store buffer to tempo changer's input
                me.pTDStretch.moveSamples(me.pRateTransposer.getStore());

                me.output = me.pTDStretch;
            }
        }//#endif
        else {
            if (me.output != me.pRateTransposer) {
                var transOut;

                me.assert(me.output === me.pTDStretch);
                // move samples in the current output buffer to the output of pRateTransposer
                transOut = me.pRateTransposer.getOutput();
                transOut.moveSamples(me.output);
                // move samples in tempo changer's input to pitch transposer's input
                me.pRateTransposer.moveSamples(me.pTDStretch.getInput());

                me.output = me.pRateTransposer;
            }
        }
    },

    // Sets sample rate.
    setSampleRate: function (srate) {
        var me = this;
        me.bSrateSet = true;
        // set sample rate, leave other tempo changer parameters as they are.
        me.pTDStretch.setParameters(srate);
    },
    // Adds 'numSamples' pcs of samples from the 'samples' memory position into
    // the input of the object.
    putSamples: function (samples, nSamples) {
        var me = this;
        if (me.bSrateSet == false) {
            throw new Error("SoundTouch : Sample rate not defined");
        }
        else if (me.channels == 0) {
            throw new Error("SoundTouch : Number of channels not defined");
        }

        // Transpose the rate of the new samples if necessary
        /* Bypass the nominal setting - can introduce a click in sound when tempo/pitch control crosses the nominal value...
        */ if (me.rate === 1.0) {
            // The rate value is same as the original, simply evaluate the tempo changer. 
            me.assert(me.output === me.pTDStretch);
            if (me.pRateTransposer.isEmpty() == 0) {
                // yet flush the last samples in the pitch transposer buffer
                // (may happen if 'rate' changes from a non-zero value to zero)
                me.pTDStretch.moveSamples(me.pRateTransposer);
            }
            me.pTDStretch.putSamples(samples, nSamples);
        }

            // #ifndef SOUNDTOUCH_PREVENT_CLICK_AT_RATE_CROSSOVER
        else
            if (me.rate <= 1.0) {
                // transpose the rate down, output the transposed sound to tempo changer buffer
                me.assert(me.output == me.pTDStretch);
                me.pRateTransposer.putSamples(samples, nSamples);
                me.pTDStretch.moveSamples(me.pRateTransposer);
            }//#endif
            else {
                // evaluate the tempo changer, then transpose the rate up, 
                me.assert(me.output == me.pRateTransposer);
                me.pTDStretch.putSamples(samples, nSamples);
                me.pRateTransposer.moveSamples(me.pTDStretch);
            }
    },

    // Flushes the last samples from the processing pipeline to the output.
    // Clears also the internal processing buffers.
    //
    // Note: This function is meant for extracting the last samples of a sound
    // stream. This function may introduce additional blank samples in the end
    // of the sound stream, and thus it's not recommended to call this function
    // in the middle of a sound stream.
    flush: function () {
        var me = this;
        var i;
        var nUnprocessed;
        var nOut;
        var buff = new Float32Array(64 * 2);   // note: allocate 2*64 to cater 64 sample frames of stereo sound

        // check how many samples still await processing, and scale
        // that by tempo & rate to get expected output sample count
        nUnprocessed = me.numUnprocessedSamples();
        nUnprocessed = Math.floor(nUnprocessed / (tempo * rate) + 0.5);

        nOut = me.numSamples();        // ready samples currently in buffer ...
        nOut += nUnprocessed;       // ... and how many we expect there to be in the end

        // memset(buff, 0, 64 * channels * sizeof(SAMPLETYPE));
        // "Push" the last active samples out from the processing pipeline by
        // feeding blank samples into the processing pipeline until new, 
        // processed samples appear in the output (not however, more than 
        // 8ksamples in any case)
        for (i = 0; i < 128; i++) {
            me.putSamples(buff, 64);
            if (me.numSamples() >= nOut) {
                // Enough new samples have appeared into the output!
                // As samples come from processing with bigger chunks, now truncate it
                // back to maximum "nOut" samples to improve duration accuracy 
                me.adjustAmountOfSamples(nOut);

                // finish
                break;
            }
        }

        // Clear working buffers
        me.pRateTransposer.clear();
        me.pTDStretch.clearInput();
        // yet leave the 'tempoChanger' output intouched as that's where the
        // flushed samples are!
    },
    // Changes a setting controlling the processing system behaviour. See the
    // 'SETTING_...' defines for available setting ID's.
    setSetting: function (settingId, value) {
        var sampleRate, sequenceMs, seekWindowMs, overlapMs;
        var me = this;
        // read current tdstretch routine parameters
        var parameters = {
            sampleRate: null,
            sequenceMs: null,
            seekWindowMs: null,
            overlapMs: null
        };
        me.pTDStretch.getParameters(parameters);


        switch (settingId) {
            case 'SETTING_USE_AA_FILTER':
                // enables / disabless anti-alias filter
                me.pRateTransposer.enableAAFilter((value != 0) ? true : false);
                return true;

            case 'SETTING_AA_FILTER_LENGTH':
                // sets anti-alias filter length
                me.pRateTransposer.getAAFilter().setLength(value);
                return true;

            case 'SETTING_USE_QUICKSEEK':
                // enables / disables tempo routine quick seeking algorithm
                me.pTDStretch.enableQuickSeek((value != 0) ? true : false);
                return true;

            case 'SETTING_SEQUENCE_MS':
                // change time-stretch sequence duration parameter
                me.pTDStretch.setParameters(sampleRate, value, seekWindowMs, overlapMs);
                return true;

            case 'SETTING_SEEKWINDOW_MS':
                // change time-stretch seek window length parameter
                me.pTDStretch.setParameters(sampleRate, sequenceMs, value, overlapMs);
                return true;

            case 'SETTING_OVERLAP_MS':
                // change time-stretch overlap length parameter
                me.pTDStretch.setParameters(sampleRate, sequenceMs, seekWindowMs, value);
                return true;

            default:
                return false;
        }
    },

    // Reads a setting controlling the processing system behaviour. See the
    // 'SETTING_...' defines for available setting ID's.
    //
    // Returns the setting value.
    getSetting: function (settingId) {
        var parameters = {
            sampleRate: null,
            sequenceMs: null,
            seekWindowMs: null,
            overlapMs: null
        };
        var temp;
        var me = this;
        switch (settingId) {
            case 'SETTING_USE_AA_FILTER':
                return me.pRateTransposer.isAAFilterEnabled();

            case 'SETTING_AA_FILTER_LENGTH':
                return me.pRateTransposer.getAAFilter().getLength();

            case 'SETTING_USE_QUICKSEEK':
                return me.pTDStretch.isQuickSeekEnabled();

            case 'SETTING_SEQUENCE_MS':
                me.pTDStretch.getParameters(parameters);
                return parameters.sequenceMs;

            case 'SETTING_SEEKWINDOW_MS':
                me.pTDStretch.getParameters(parameters);
                return parameters.seekWindowMs;

            case 'SETTING_OVERLAP_MS':
                me.pTDStretch.getParameters(parameters);
                return parameters.overlapMs;

            case 'SETTING_NOMINAL_INPUT_SEQUENCE':
                return me.pTDStretch.getInputSampleReq();

            case 'SETTING_NOMINAL_OUTPUT_SEQUENCE':
                return me.pTDStretch.getOutputBatchSize();

            default:
                return 0;
        }
    },

    // Clears all the samples in the object's output and internal processing
    // buffers.
    clear: function () {
        var me = this;
        if (me.pRateTransposer)
            me.pRateTransposer.clear();
        if (me.pTDStretch) me.pTDStretch.clear();
    },


    /// Returns number of samples currently unprocessed.
    numUnprocessedSamples: function () {
        var me = this;
        var psp;
        if (me.pTDStretch) {
            psp = me.pTDStretch.getInput();
            if (psp) {
                return psp.numSamples();
            }
        }
        return 0;
    }

});