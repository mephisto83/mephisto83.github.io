/**
 * @class MEPH.audio.AudioResources
 * Audio resources are tracked from this service.
 **/
MEPH.define('MEPH.audio.effects.FIRFilter', {
    requires: [],
    statics: {
    },
    properties: {
        resultDivFactor: 0,
        resultDivider: 0,
        length: 0,
        lengthDiv8: 0,
        filterCoeffs: null
    },
    initialize: function () {
    },
    assert: function (val) {
        if (!val) {
            throw new Error('not true')
        }
    },
    getLength: function () {
        var me = this;
        return me.length;
    },
    evaluate: function (dest, src, numSamples, numChannels, destIndx, srcIndx) {
        var me = this;
        me.assert(numChannels == 1 || numChannels == 2);
        var length = me.length;

        me.assert(me.length > 0);
        me.assert(me.lengthDiv8 * 8 === length);
        if (numSamples < length) return 0;
        if (numChannels == 2) {
            throw new Error('NOt handling stereo');
        } else {
            return me.evaluateFilterMono(dest, src, numSamples, destIndx, srcIndx);
        }
    },
    evaluateFilterMono: function (dest, src, numSamples, destIndx, srcIndx) {
        var i, j, end;
        var sum;
        var me = this;
        // when using floating point samples, use a scaler instead of a divider
        // because division is much slower operation than multiplying.
        var dScaler = 1.0 / me.resultDivider;

        var length = me.length;
        var filterCoeffs = me.filterCoeffs;
        me.assert(length != 0);

        end = numSamples - length;
        for (j = 0; j < end; j++) {
            sum = 0;
            for (i = 0; i < length; i += 4) {
                // loop is unrolled by factor of 4 here for efficiency
                sum += src.get(i + 0 + srcIndx) * filterCoeffs[i + 0] +
                       src.get(i + 1 + srcIndx) * filterCoeffs[i + 1] +
                       src.get(i + 2 + srcIndx) * filterCoeffs[i + 2] +
                       src.get(i + 3 + srcIndx) * filterCoeffs[i + 3];
            }
            sum *= dScaler;
            dest.set(j + destIndx, sum);
            srcIndx++;
        }
        return end;
    },
    setCoefficients: function (coeffs, newLength, uResultDivFactor) {
        var me = this;

        me.assert(newLength > 0);
        if (newLength % 8) throw new Error("FIR filter length not divisible by 8");
        me.lengthDiv8 = newLength / 8;
        me.length = me.lengthDiv8 * 8;
        me.assert(me.length === newLength);

        var length = me.length;

        me.resultDivFactor = uResultDivFactor;
        me.resultDivider = Math.pow(2.0, Math.floor(me.resultDivFactor));

        me.filterCoeffs = null;
        me.filterCoeffs = new Float32Array(length);
        coeffs.foreach(function (i, index) {
            me.filterCoeffs[index] = i;
        })
    }
});