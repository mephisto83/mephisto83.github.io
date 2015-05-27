/**
 * @class MEPH.audio.processor.TDStretch
 **/
MEPH.define('MEPH.audio.processor.TDStretch', {
    requires: ['MEPH.audio.processor.FIFOSampleBuffer'],
    extend: 'MEPH.audio.processor.FIFOProcessor',
    statics: {
    },
    properties: {
        bQuickSeek: false,
        channels: 1,

        pMidBuffer: null,
        pMidBufferUnaligned: null,
        overlapLength: 0,

        bAutoSeqSetting: true,
        bAutoSeekSetting: true,
        //    outDebt = 0;
        skipFract: 0,

        tempo: 1.0,

        sampleReq: 0,

        seekLength: 0,
        seekWindowLength: 0,
        overlapDividerBits: 0,
        slopingDivider: 0,
        nominalSkip: 0,
        skipFract: 0,
        outputBuffer: null,
        inputBuffer: null,

        sampleRate: 0,
        sequenceMs: 0,
        seekWindowMs: 0,
        overlapMs: 0,
    },
    initialize: function (outputBuffer, inputBuffer) {
        var me = this;
        var DEFAULT_SEQUENCE_MS = 0;
        var DEFAULT_SEEKWINDOW_MS = 0;
        var DEFAULT_OVERLAP_MS = 8;
        me.inputBuffer = inputBuffer;
        me.output = outputBuffer;
        me.setParameters(44100, DEFAULT_SEQUENCE_MS, DEFAULT_SEEKWINDOW_MS, DEFAULT_OVERLAP_MS);
        me.setTempo(1.0);
        me.clear();

    },
    getOutput: function () {
        var me = this;
        return me.output;
    },
    getInput: function () {
        var me = this;
        return me.inputBuffer;

    },
    // Sets routine control parameters. These control are certain time constants
    // defining how the sound is stretched to the desired duration.
    //
    // 'sampleRate' = sample rate of the sound
    // 'sequenceMS' = one processing sequence length in milliseconds (default = 82 ms)
    // 'seekwindowMS' = seeking window length for scanning the best overlapping 
    //      position (default = 28 ms)
    // 'overlapMS' = overlapping length (default = 12 ms)

    setParameters: function (aSampleRate, aSequenceMS,
                              aSeekWindowMS, aOverlapMS) {
        var me = this;
        // accept only positive parameter values - if zero or negative, use old values instead
        if (aSampleRate > 0) this.sampleRate = Math.floor(aSampleRate);
        if (aOverlapMS > 0) this.overlapMs = Math.floor(aOverlapMS);

        if (aSequenceMS > 0) {
            this.sequenceMs = aSequenceMS;
            me.bAutoSeqSetting = false;
        }
        else if (aSequenceMS == 0) {
            // if zero, use automatic setting
            me.bAutoSeqSetting = true;
        }

        if (aSeekWindowMS > 0) {
            me.seekWindowMs = aSeekWindowMS;
            me.bAutoSeekSetting = false;
        }
        else if (aSeekWindowMS == 0) {
            // if zero, use automatic setting
            me.bAutoSeekSetting = true;
        }

        me.calcSeqParameters();

        me.calculateOverlapLength(me.overlapMs);

        // set tempo to recalculate 'sampleReq'
        me.setTempo(me.tempo);

    },
    assert: function (val) {
        if (!val) {
            throw new Error('not true')
        }
    },

    /// Calculates overlapInMsec period length in samples.
    calculateOverlapLength: function (overlapInMsec) {
        var newOvl;
        var me = this;
        me.assert(overlapInMsec >= 0);
        newOvl = (me.sampleRate * overlapInMsec) / 1000;
        if (newOvl < 16) newOvl = 16;

        // must be divisible by 8
        newOvl -= newOvl % 8;

        me.acceptNewOverlapLength(newOvl);
    },

    /// Get routine control parameters, see setParameters() function.
    /// Any of the parameters to this function can be NULL, in such case corresponding parameter
    /// value isn't returned.
    getParameters: function (obj) {
        var USE_AUTO_SEQUENCE_LEN = 0;
        var USE_AUTO_SEEKWINDOW_LEN = 0;
        var me = this;
        //pSampleRate, pSequenceMs, pSeekWindowMs, pOverlapMs
        if (obj.hasOwnProperty('pSampleRate')) {
            obj.pSampleRate = Math.floor(me.sampleRate);
        }

        if (obj.hasOwnProperty('pSequenceMs')) {
            obj.pSequenceMs = (me.bAutoSeqSetting) ? (USE_AUTO_SEQUENCE_LEN) : Math.floor(me.sequenceMs);
        }

        if (obj.hasOwnProperty('pSeekWindowMs')) {
            obj.pSeekWindowMs = (me.bAutoSeekSetting) ? (USE_AUTO_SEEKWINDOW_LEN) : Math.floor(me.seekWindowMs);
        }

        if (obj.hasOwnProperty('pOverlapMs')) {
            me.pOverlapMs = Math.floor(me.overlapMs);
        }
    },

    // Overlaps samples in 'midBuffer' with the samples in 'pInput'
    overlapMono: function (pOutput, pInput, ovlPos, ooffset, ioffset) {
        var i;
        var m1, m2;
        var me = this;

        m1 = 0;
        m2 = me.overlapLength;

        for (i = 0; i < me.overlapLength ; i++) {
            pOutput.set(i + ooffset, (pInput.get(i + ioffset + ovlPos) * m1 + me.pMidBuffer[i] * m2) / me.overlapLength);
            m1 += 1;
            m2 -= 1;
        }
    },

    clearMidBuffer: function () {
        var me = this;
        me.pMidBuffer = new Float32Array(me.overlapLength * 2 + 16)
    },


    clearInput: function () {
        var me = this;
        me.inputBuffer.clear();
        me.clearMidBuffer();
    },


    // Clears the sample buffers
    clear: function () {
        var me = this;
        me.output.clear();
        me.clearInput();
    },

    // Enables/disables the quick position seeking algorithm. Zero to disable, nonzero
    // to enable
    enableQuickSeek: function (enable) {
        var me = this;
        me.bQuickSeek = enable;
    },

    // Returns nonzero if the quick seeking algorithm is enabled.
    isQuickSeekEnabled: function () {
        var me = this;
        return me.bQuickSeek;
    },


    // Seeks for the optimal overlap-mixing position.
    seekBestOverlapPosition: function (ref, refPos) {
        var me = this;
        if (me.bQuickSeek) {
            return me.seekBestOverlapPositionQuick(ref, refPos);
        }
        else {
            return me.seekBestOverlapPositionFull(ref, refPos);
        }
    },
    /// return nominal input sample requirement for triggering a processing batch
    getInputSampleReq: function () {
        var me = this;
        return Math.floor(me.nominalSkip + 0.5);
    },

    /// return nominal output sample amount when running a processing batch
    getOutputBatchSize: function () {
        var me = this;
        return me.seekWindowLength - me.overlapLength;
    },

    // Overlaps samples in 'midBuffer' with the samples in 'pInputBuffer' at position
    // of 'ovlPos'.
    overlap: function (pOutput, pInput, ovlPos, ooffset, ioffset) {
        var me = this;
        if (me.channels == 2) {
            // stereo sound
            throw new Error('no support for stereo.');
        } else {
            // mono sound.
            me.overlapMono(pOutput, pInput, ovlPos, ooffset, ioffset);
        }
    },

    // Seeks for the optimal overlap-mixing position. The 'stereo' version of the
    // routine
    //
    // The best position is determined as the position where the two overlapped
    // sample sequences are 'most alike', in terms of the highest cross-correlation
    // value over the overlapping period
    seekBestOverlapPositionFull: function (ref, refPos) {
        var bestOffs;
        var bestCorr, corr;
        var i;
        var FLT_MIN = 2.2204460492503130808472633361816E-16;
        var me = this;
        bestCorr = FLT_MIN;
        bestOffs = 0;

        // Scans for the best correlation value by testing each possible position
        // over the permitted range.
        for (i = 0; i < me.seekLength; i++) {
            // Calculates correlation value for the mixing position corresponding
            // to 'i'
            corr = me.calcCrossCorr(ref, refPos + me.channels * i, me.pMidBuffer);
            // heuristic rule to slightly favour values close to mid of the range
            var tmp = (2 * i - me.seekLength) / me.seekLength;
            corr = ((corr + 0.1) * (1.0 - 0.25 * tmp * tmp));

            // Checks for the highest correlation value
            if (corr > bestCorr) {
                bestCorr = corr;
                bestOffs = i;
            }
        }
        // clear cross correlation routine state if necessary (is so e.g. in MMX routines).
        me.clearCrossCorrState();

        return bestOffs;
    },

    // Seeks for the optimal overlap-mixing position. The 'stereo' version of the
    // routine
    //
    // The best position is determined as the position where the two overlapped
    // sample sequences are 'most alike', in terms of the highest cross-correlation
    // value over the overlapping period
    seekBestOverlapPositionQuick: function (ref, refPos) {
        var me = this;
        var j;
        var bestOffs;
        var bestCorr, corr;
        var scanCount, corrOffset, tempOffset;
        var _scanOffsets = me.$scanOffsets();
        bestCorr = FLT_MIN;
        bestOffs = Math.floo(_scanOffsets[0][0]);
        corrOffset = 0;
        tempOffset = 0;

        // Scans for the best correlation value using four-pass hierarchical search.
        //
        // The look-up table 'scans' has hierarchical position adjusting steps.
        // In first pass the routine searhes for the highest correlation with 
        // relatively coarse steps, then rescans the neighbourhood of the highest
        // correlation with better resolution and so on.
        for (scanCount = 0; scanCount < 4; scanCount++) {
            j = 0;
            while (_scanOffsets[scanCount][j]) {
                tempOffset = corrOffset + _scanOffsets[scanCount][j];
                if (tempOffset >= seekLength) break;

                // Calculates correlation value for the mixing position corresponding
                // to 'tempOffset'
                corr = me.calcCrossCorr(ref, refPos + me.channels * tempOffset, me.pMidBuffer);
                // heuristic rule to slightly favour values close to mid of the range
                var tmp = Math.floor((2 * tempOffset - me.seekLength) / me.seekLength);
                corr = ((corr + 0.1) * (1.0 - 0.25 * tmp * tmp));

                // Checks for the highest correlation value
                if (corr > bestCorr) {
                    bestCorr = corr;
                    bestOffs = tempOffset;
                }
                j++;
            }
            corrOffset = Math.floor(bestOffs);
        }
        // clear cross correlation routine state if necessary (is so e.g. in MMX routines).
        me.clearCrossCorrState();

        return bestOffs;
    },
    clearCrossCorrState: function () {
    },

    /// Calculates processing sequence length according to tempo setting
    calcSeqParameters: function () {
        var me = this;
        // Adjust tempo param according to tempo, so that variating processing sequence length is used
        // at varius tempo settings, between the given low...top limits
        var AUTOSEQ_TEMPO_LOW = 0.5     // auto setting low tempo range (-50%)
        var AUTOSEQ_TEMPO_TOP = 2.0     // auto setting top tempo range (+100%)

        // sequence-ms setting values at above low & top tempo
        var AUTOSEQ_AT_MIN = 125.0
        var AUTOSEQ_AT_MAX = 50.0
        var AUTOSEQ_K = ((AUTOSEQ_AT_MAX - AUTOSEQ_AT_MIN) / (AUTOSEQ_TEMPO_TOP - AUTOSEQ_TEMPO_LOW))
        var AUTOSEQ_C = (AUTOSEQ_AT_MIN - (AUTOSEQ_K) * (AUTOSEQ_TEMPO_LOW))

        // seek-window-ms setting values at above low & top tempo
        var AUTOSEEK_AT_MIN = 25.0
        var AUTOSEEK_AT_MAX = 15.0
        var AUTOSEEK_K = ((AUTOSEEK_AT_MAX - AUTOSEEK_AT_MIN) / (AUTOSEQ_TEMPO_TOP - AUTOSEQ_TEMPO_LOW))
        var AUTOSEEK_C = (AUTOSEEK_AT_MIN - (AUTOSEEK_K) * (AUTOSEQ_TEMPO_LOW))

        var CHECK_LIMITS = function (x, mi, ma) {
            return (((x) < (mi)) ? (mi) : (((x) > (ma)) ? (ma) : (x)));
        }
        var seq, seek;

        if (me.bAutoSeqSetting) {
            seq = AUTOSEQ_C + AUTOSEQ_K * me.tempo;
            seq = CHECK_LIMITS(seq, AUTOSEQ_AT_MAX, AUTOSEQ_AT_MIN);
            me.sequenceMs = Math.floor(seq + 0.5);
        }

        if (me.bAutoSeekSetting) {
            seek = AUTOSEEK_C + AUTOSEEK_K * me.tempo;
            seek = CHECK_LIMITS(seek, AUTOSEEK_AT_MAX, AUTOSEEK_AT_MIN);
            me.seekWindowMs = Math.floor(seek + 0.5);
        }

        // Update seek window lengths
        me.seekWindowLength = Math.floor((me.sampleRate * me.sequenceMs) / 1000);
        if (me.seekWindowLength < 2 * me.overlapLength) {
            me.seekWindowLength = Math.floor(2 * me.overlapLength);
        }
        me.seekLength = Math.floor((me.sampleRate * me.seekWindowMs) / 1000);
    },

    // Sets new target tempo. Normal tempo = 'SCALE', smaller values represent slower 
    // tempo, larger faster tempo.
    setTempo: function (newTempo) {
        var intskip;
        var me = this;
        me.tempo = newTempo;

        // Calculate new sequence duration
        me.calcSeqParameters();

        // Calculate ideal skip length (according to tempo value) 
        me.nominalSkip = (me.tempo * (me.seekWindowLength - me.overlapLength));
        intskip = Math.floor(me.nominalSkip + 0.5);

        // Calculate how many samples are needed in the 'inputBuffer' to 
        // process another batch of samples
        //sampleReq = max(intskip + overlapLength, seekWindowLength) + seekLength / 2;
        me.sampleReq = Math.max(intskip + me.overlapLength, me.seekWindowLength)
            + me.seekLength;
    },


    // Sets the number of channels, 1 = mono, 2 = stereo
    setChannels: function (numChannels) {
        var me = this;
        me.assert(numChannels > 0);
        if (me.channels == numChannels) return;
        me.assert(numChannels == 1 || numChannels == 2);

        me.channels = numChannels;
        me.inputBuffer.setChannels(channels);
        me.output.setChannels(channels);
    },

    // Processes as many processing frames of the samples 'inputBuffer', store
    // the result into 'outputBuffer'
    processSamples: function () {
        var ovlSkip, offset;
        var temp;
        var me = this,
            channels = me.channels,
        overlapLength = me.overlapLength;
        /* Removed this small optimization - can introduce a click to sound when tempo setting
           crosses the nominal value
        if (tempo == 1.0f) 
        {
            // tempo not changed from the original, so bypass the processing
            processNominalTempo();
            return;
        }
        */

        // Process samples as long as there are enough samples in 'inputBuffer'
        // to form a processing frame.
        while (me.inputBuffer.numSamples() >= me.sampleReq) {
            // If tempo differs from the normal ('SCALE'), scan for the best overlapping
            // position
            offset = me.seekBestOverlapPosition(me.inputBuffer, me.inputBuffer.ptrBegin());

            // Mix the samples in the 'inputBuffer' at position of 'offset' with the 
            // samples in 'midBuffer' using sliding overlapping
            // ... first partially overlap with the end of the previous sequence
            // (that's in 'midBuffer')
            me.overlap(me.output, me.inputBuffer, Math.floor(offset), me.output.ptrEnd(Math.floor(overlapLength)), me.inputBuffer.ptrBegin());

            me.output.putSamples(Math.floor(overlapLength));

            // ... then copy sequence samples from 'inputBuffer' to output:

            // length of sequence
            temp = (me.seekWindowLength - 2 * me.overlapLength);

            // crosscheck that we don't have buffer overflow...
            if (me.inputBuffer.numSamples() < (offset + temp + me.overlapLength * 2)) {
                continue;    // just in case, shouldn't really happen
            }

            me.output.putSamples(me.inputBuffer, Math.floor(temp), me.inputBuffer.ptrBegin() + channels * (offset + overlapLength));

            // Copies the end of the current sequence from 'inputBuffer' to 
            // 'midBuffer' for being mixed with the beginning of the next 
            // processing sequence and so on
            me.assert((offset + temp + overlapLength * 2) <= me.inputBuffer.numSamples());
            me.memcpy(me.pMidBuffer,
                me.inputBuffer.ptrBegin() + channels * (offset + temp + overlapLength),
                me.inputBuffer,
                channels * overlapLength, 0);

            // Remove the processed samples from the input buffer. Update
            // the difference between integer & nominal skip step to 'skipFract'
            // in order to prevent the error from accumulating over time.
            me.skipFract += me.nominalSkip;   // real skip size
            me.ovlSkip = Math.floor(me.skipFract);   // rounded to integer skip
            me.skipFract -= me.ovlSkip;       // maintain the fraction part, i.e. real vs. integer skip
            me.inputBuffer.receiveSamples(Math.floor(me.ovlSkip));
        }
    },

    memcpy: function (buffer, endIndx, samples, count, offset) {
        var me = this;
        offset = offset || 0;
        [].interpolate(endIndx, endIndx + count, function (t, i) {
            buffer[i] = samples.get(t);
        });
    },

    // Adds 'numsamples' pcs of samples from the 'samples' memory position into
    // the input of the object.
    putSamples: function (samples, nSamples) {
        var me = this;
        // Add the samples into the input buffer
        me.inputBuffer.putSamples(samples, nSamples);
        // Process the samples in input buffer
        me.processSamples();
    },


    /// Set new overlap length parameter & reallocate RefMidBuffer if necessary.
    acceptNewOverlapLength: function (newOverlapLength) {
        var me = this;
        var pMidBufferUnaligned;
        var prevOvl;

        me.assert(newOverlapLength >= 0);
        prevOvl = me.overlapLength;
        me.overlapLength = newOverlapLength;

        if (me.overlapLength > prevOvl) {

            pMidBufferUnaligned = new Float32Array(me.overlapLength * 2 + 16);
            // ensure that 'pMidBuffer' is aligned to 16 byte boundary for efficiency
            //( (ulong_ptr)(x) + 15 ) & ~(ulong_ptr)15
            me.pMidBuffer = (pMidBufferUnaligned);

            me.clearMidBuffer();
        }
    },

    calcCrossCorr: function (ref, mixingPos, compare) {
        var corr;
        var norm;
        var i;
        var me = this;
        corr = norm = 0;
        // Same routine for stereo and mono. For Stereo, unroll by factor of 2.
        // For mono it's same routine yet unrollsd by factor of 4.
        for (i = 0; i < me.channels * me.overlapLength; i += 4) {
            corr += ref.get(mixingPos + i) * compare[i] +
                    ref.get(mixingPos + i + 1) * compare[i + 1];

            norm += ref.get(mixingPos + i) * ref.get(mixingPos + i) +
                    ref.get(mixingPos + 1 + 1) * ref.get(mixingPos + 1);

            // unroll the loop for better CPU efficiency:
            corr += ref.get(mixingPos + i + 2) * compare[i + 2] +
                    ref.get(mixingPos + i + 3) * compare[i + 3];

            norm += ref.get(mixingPos + i + 2) * ref.get(mixingPos + i + 2) +
                    ref.get(mixingPos + i + 3) * ref.get(mixingPos + i + 3);
        }

        if (norm < 1e-9) norm = 1.0;    // to avoid div by zero
        return corr / Math.sqrt(norm);
    },
    $scanOffsets: function () {
        return MEPH.audio.processor.TDStretch._scanOffsets;
    }
}).then(function () {
    MEPH.audio.processor.TDStretch._scanOffsets = [
       [124, 186, 248, 310, 372, 434, 496, 558, 620, 682, 744, 806,
           868, 930, 992, 1054, 1116, 1178, 1240, 1302, 1364, 1426, 1488, 0],
       [-100, -75, -50, -25, 25, 50, 75, 100, 0, 0, 0, 0,
           0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
       [-20, -15, -10, -5, 5, 10, 15, 20, 0, 0, 0, 0,
           0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
       [-4, -3, -2, -1, 1, 2, 3, 4, 0, 0, 0, 0,
           0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
       [121, 114, 97, 114, 98, 105, 108, 32, 104, 99, 117, 111,
           116, 100, 110, 117, 111, 115, 0, 0, 0, 0, 0, 0]
    ];
})