/**
 * @class MEPH.audio.processor.SoundProcessor 
 **/
MEPH.define('MEPH.audio.processor.FIFOProcessor', {
    extend: 'MEPH.audio.processor.FIFOSamplePipe',
    statics: {
    },
    properties: {
        output: null
    },
    initialize: function (pOutput) {
        var me = this;
        me.output = pOutput || null;
    },
    //This is a guess.
    setOutPipe: function (poutput) {
        var me = this;
        me.assert(me.output === null);
        me.assert(poutput !== null);
        me.output = poutput;
    },
    ptrBegin: function () {
        var me = this;
        return me.output.ptrBegin();
    },

    // Moves samples from the 'other' pipe instance to this instance.
    moveSamples: function (other  ///< Other pipe instance where from the receive the data.
         ) {
        var me = this,
            oNumSamples = other.numSamples();

        me.putSamples(other, oNumSamples, other.ptrBegin());
        other.receiveSamples(oNumSamples);
    },
    /// Output samples from beginning of the sample buffer. Copies requested samples to 
    /// output buffer and removes them from the sample buffer. If there are less than 
    /// 'numsample' samples in the buffer, returns all that available.
    ///
    /// \return Number of samples returned.
    receiveSamples: function (outBuffer, ///< Buffer where to copy output samples.
                                maxSamples                    ///< How many samples to receive at max.
                                ) {
        var me = this;
        if (typeof outBuffer === 'number') {
            return me.$receiveSamples(outBuffer);
        }
        return me.output.receiveSamples(outBuffer, maxSamples);
    },


    /// Adjusts book-keeping so that given number of samples are removed from beginning of the 
    /// sample buffer without copying them anywhere. 
    ///
    /// Used to reduce the number of samples in the buffer when accessing the sample buffer directly
    /// with 'ptrBegin' function.
    $receiveSamples: function (maxSamples   ///< Remove this many samples from the beginning of pipe.
                                ) {
        var me = this;
        return me.output.receiveSamples(maxSamples);
    },

    /// Returns number of samples currently available.
    numSamples: function () {
        var me = this;
        return me.output.numSamples();
    },
    /// Returns nonzero if there aren't any samples available for outputting.
    isEmpty: function () {
        var me = this;
        return me.output.isEmpty();
    },

    /// allow trimming (downwards) amount of samples in pipeline.
    /// Returns adjusted amount of samples
    adjustAmountOfSamples: function (numSamples) {
        var me = this;
        return me.output.adjustAmountOfSamples(numSamples);
    }

});