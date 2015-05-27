/**
 * @class MEPH.audio.processor.RateTransposer 
 **/
MEPH.define('MEPH.audio.processor.RateTransposer', {
    extend: 'MEPH.audio.processor.FIFOProcessor',
    requires: ['MEPH.audio.effects.AAFilter', 'MEPH.audio.processor.FIFOSampleBuffer'],
    statics: {
    },
    properties: {
        numChannels: 1,
        bUseAAFilter: true,
        fSlopeCount: 0,
        tempBuffer: null,
        fRate: 0,
        sPrevSampleR: 0,
        sPrevSampleL: 0,
        storeBuffer: null,//dont know if this should be here
        pAAFilter: null
    },
    initialize: function (outputBuffer) {
        var me = this;
        me.storeBuffer = new MEPH.audio.processor.FIFOSampleBuffer(1);
        me.tempBuffer = new MEPH.audio.processor.FIFOSampleBuffer(1);
        me.pAAFilter = new MEPH.audio.effects.AAFilter(32);
        me.great();
    },
    getOutput: function () {
        var me = this;
        return me.outputBuffer || me.output;
    },
    getStore: function () {
        var me = this;
        return me.storeBuffer;
    },
    enableAAFilter: function (newMode) {
        var me = this;
        me.bUseAAFilter = newMode;
    },
    isAAFilterEnabled: function () {
        return this.bUseAAFilter;
    },
    getAAFilter: function () {
        var me = this;
        return me.pAAFilter;
    },
    setRate: function (newRate) {
        var fCutoff, me = this;
        me.fRate = newRate;
        if (newRate > 1) {
            fCutoff = .5 / newRate;
        }
        else {
            fCutoff = .5 * newRate;
        }
        var filter = me.getAAFilter();
        filter.setCutoffFreq(fCutoff);
    },
    putSamples: function (samples, nSamples, samplesIndex) {
        var me = this;
        me.processSamples(samples, nSamples, samplesIndex);
    },
    upsample: function (src, nSamples, srcIndex) {
        var count, sizeTemp, num;
        var storeBuffer = me.storeBuffer;
        var outputBuffer = me.outputBuffer;
        // If the parameter 'uRate' value is smaller than 'SCALE', first transpose
        // the samples and then apply the anti-alias filter to remove aliasing.

        // First check that there's enough room in 'storeBuffer' 
        // (+16 is to reserve some slack in the destination buffer)
        sizeTemp = Math.floor(nSamples / fRate + 16.0);

        // Transpose the samples, store the result into the end of "storeBuffer"
        count = me.transpose(storeBuffer, src, nSamples, storeBuffer.ptrEnd(sizeTemp), srcIndex);
        storeBuffer.putSamples(count);

        // Apply the anti-alias filter to samples in "store output", output the
        // result to "dest"
        num = storeBuffer.numSamples();
        count = me.pAAFilter.evaluate(outputBuffer, storeBuffer, num, me.numChannels, outputBuffer.ptrEnd(num), storeBuffer.ptrBegin());
        outputBuffer.putSamples(count);

        // Remove the processed samples from "storeBuffer"
        storeBuffer.receiveSamples(count);
    },
    downsample: function (src, nSamples, srcIndex) {

        // Transposes down the sample rate, causing the observed playback 'rate' of the
        // sound to increase

        var count, sizeTemp;
        var me = this,
            numChannels = me.numChannels,
            outputBuffer = me.getOutput(),
            tempBuffer = me.tempBuffer,
            storeBuffer = me.storeBuffer;

        // If the parameter 'uRate' value is larger than 'SCALE', first apply the
        // anti-alias filter to remove high frequencies (prevent them from folding
        // over the lover frequencies), then transpose.

        // Add the new samples to the end of the storeBuffer
        storeBuffer.putSamples(src, nSamples, srcIndex);

        // Anti-alias filter the samples to prevent folding and output the filtered 
        // data to tempBuffer. Note : because of the FIR filter length, the
        // filtering routine takes in 'filter_length' more samples than it outputs.
        me.assert(tempBuffer.isEmpty());
        sizeTemp = storeBuffer.numSamples();

        count = me.pAAFilter.evaluate(tempBuffer, storeBuffer, sizeTemp, numChannels, me.tempBuffer.ptrEnd(sizeTemp), storeBuffer.ptrBegin());

        if (count == 0) return;

        // Remove the filtered samples from 'storeBuffer'
        storeBuffer.receiveSamples(count);

        // Transpose the samples (+16 is to reserve some slack in the destination buffer)
        sizeTemp = Math.floor(nSamples / me.fRate + 16.0);
        count = me.transpose(outputBuffer, tempBuffer, count, outputBuffer.ptrEnd(sizeTemp), tempBuffer.ptrBegin());
        outputBuffer.putSamples(count);
    },
    // Transposes sample rate by applying anti-alias filter to prevent folding. 
    // Returns amount of samples returned in the "dest" buffer.
    // The maximum amount of samples that can be returned at a time is set by
    // the 'set_returnBuffer_size' function.
    processSamples: function (src, nSamples, srcIndex) {
        var count;
        var sizeReq;
        var me = this;
        if (nSamples == 0) return;
        me.assert(me.pAAFilter);

        // If anti-alias filter is turned off, simply transpose without applying
        // the filter
        if (me.bUseAAFilter == false) {
            sizeReq = Math.floor(nSamples / me.fRate + 1.0);
            count = me.transpose(me.outputBuffer, src, nSamples, me.outputBuffer.ptrEnd(sizeReq), srcIndex);
            outputBuffer.putSamples(count);
            return;
        }

        // Transpose with anti-alias filter
        if (me.fRate < 1.0) {
            me.upsample(src, nSamples, srcIndex);
        }
        else {
            me.downsample(src, nSamples, srcIndex);
        }
    },
    // Transposes the sample rate of the given samples using linear interpolation. 
    // Returns the number of samples returned in the "dest" buffer
    transpose: function (dest, src, nSamples, destOffset, srcOffset) {
        var me = this;
        if (me.numChannels == 2) {
            throw new Error('Does not support stereo');
        }
        else {
            return me.transposeMono(dest, src, nSamples, destOffset, srcOffset);
        }
    },
    assert: function (val) {
        if (!val) {
            throw new Error('not true')
        }
    },
    // Sets the number of channels, 1 = mono, 2 = stereo
    setChannels: function (nChannels) {
        var me = this;
        me.assert(nChannels > 0);
        if (me.numChannels == nChannels) return;

        me.assert(nChannels == 1 || nChannels == 2);
        me.numChannels = nChannels;

        me.storeBuffer.setChannels(numChannels);
        me.tempBuffer.setChannels(numChannels);
        me.outputBuffer.setChannels(numChannels);

        // Inits the linear interpolation registers
        me.resetRegisters();
    },

    // Clears all the samples in the object
    clear: function () {
        var me = this;
        me.outputBuffer.clear();
        me.storeBuffer.clear();
    },
    isEmpty: function () {
        var res, me = this;;

        //res = FIFOProcessor::isEmpty();
        //if (res == 0) return 0;
        return me.storeBuffer.isEmpty();
    },
    resetRegisters: function () {
        var me = this;
        me.fSlopeCount = 0;
        me.sPrevSampleL = me.sPrevSampleR = 0;
    },

    // Transposes the sample rate of the given samples using linear interpolation. 
    // 'Mono' version of the routine. Returns the number of samples returned in 
    // the "dest" buffer
    transposeMono: function (dest, src, nSamples, destOffset, srcOffset) {
        var i, used;
        var me = this;
        used = 0;
        i = 0;

        // Process the last sample saved from the previous call first...
        while (me.fSlopeCount <= 1.0) {
            dest.set(destOffset + i, ((1.0 - me.fSlopeCount) * me.sPrevSampleL + me.fSlopeCount * src.get(srcOffset + 0)));
            i++;
            me.fSlopeCount += me.fRate;
        }
        me.fSlopeCount -= 1.0;
        var nottrue = false;
        if (nSamples > 1) {
            while (!nottrue) {
                while (me.fSlopeCount > 1.0) {
                    me.fSlopeCount -= 1.0;
                    used++;
                    if (used >= nSamples - 1) {
                        nottrue = true;
                    }
                }
                if (!nottrue) {
                    dest.set(destOffset + i, ((1.0 - me.fSlopeCount) * src.get(srcOffset + used) + me.fSlopeCount * src.get(srcOffset + used + 1)));
                    i++;
                    me.fSlopeCount += me.fRate;
                }
            }
        }
        // Store the last sample for the next round
        me.sPrevSampleL = src.get(srcOffset + nSamples - 1);

        return i;
    }
})