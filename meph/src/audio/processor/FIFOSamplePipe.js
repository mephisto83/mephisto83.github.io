/**
 * @class MEPH.audio.processor.SoundProcessor 
 **/
MEPH.define('MEPH.audio.processor.FIFOSamplePipe', {
    statics: {
    },
    properties: {
        pRateTransposer: null,
        pTDStretch: null,
        tempo: 0
    },
    assert: function (val) {
        if (!val) {
            throw new Error('not true')
        }
    },
    get: function (i) {
        var me = this;
        if (me.buffer)
            return me.buffer[i];
        return me.output.get(i);
    },
    set: function (i, v) {
        var me = this;
        if (me.buffer)
            me.buffer[i] = v;
        if (me.output)
            me.ouput.set(i, v);
    },

    // Moves samples from the 'other' pipe instance to this instance.
    moveSamples: function (other) {
        var me = this;
        var oNumSamples = other.numSamples();

        me.putSamples(other, oNumSamples, other.ptrBegin());
        other.receiveSamples(oNumSamples);
    }
});