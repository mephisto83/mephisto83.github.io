/**
 * @class MEPH.audio.AudioResources
 * Audio resources are tracked from this service.
 **/
MEPH.define('MEPH.audio.effects.AAFilter', {
    requires: ['MEPH.audio.effects.FIRFilter'],
    statics: {
        TWOPI: Math.PI * 2,
        PI: Math.PI
    },
    properties: {
        pFIR: null,
        cutoffFreq: .5
    },
    initialize: function (len) {
        var me = this;
        me.pFIR = new MEPH.audio.effects.FIRFilter();
        me.setLength(len);
    },
    setCutoffFreq: function (newCutoffFreq) {
        var me = this;
        me.cutoffFreq = newCutoffFreq;
        me.calculateCoeffs();
    },
    getLength: function () {
        var me = this;
        return me.pFIR.getLength();
    },
    setLength: function (len) {
        var me = this;
        me.length = len;
        me.calculateCoeffs();
    },
    assert: function (val) {
        if (!val) {
            throw new Error('not true')
        }
    },
    calculateCoeffs: function () {
        var i;
        var me = this;
        var cntTemp, temp, tempCoeff, h, w;
        var fc2, wc;
        var scaleCoeff, sum;
        var work;
        var coeffs;
        var cutoffFreq = me.cutoffFreq;
        var length = me.length;
        me.assert(length >= 2);
        me.assert(length % 4 == 0);
        me.assert(cutoffFreq >= 0);
        me.assert(cutoffFreq <= 0.5);

        work = new Float32Array(length);
        coeffs = new Float32Array(length);

        fc2 = 2.0 * cutoffFreq;
        wc = Math.PI * fc2;
        tempCoeff = Math.PI * 2 / length;

        sum = 0;
        for (i = 0; i < length; i++) {
            cntTemp = i - (length / 2);

            temp = cntTemp * wc;
            if (temp != 0) {
                h = fc2 * Math.sin(temp) / temp;                     // sinc function
            }
            else {
                h = 1.0;
            }
            w = 0.54 + 0.46 * Math.cos(tempCoeff * cntTemp);       // hamming window

            temp = w * h;
            work[i] = temp;

            // calc net sum of coefficients 
            sum += temp;
        }

        // ensure the sum of coefficients is larger than zero
        me.assert(sum > 0);

        // ensure we've really designed a lowpass filter...
        me.assert(work[length / 2] > 0);
        me.assert(work[length / 2 + 1] > -1e-6);
        me.assert(work[length / 2 - 1] > -1e-6);

        // Calculate a scaling coefficient in such a way that the result can be
        // divided by 16384
        scaleCoeff = 16384.0 / sum;

        for (i = 0; i < length; i++) {
            // scale & round to nearest integer
            temp = work[i] * scaleCoeff;
            temp += (temp >= 0) ? 0.5 : -0.5;
            // ensure no overfloods
            me.assert(temp >= -32768 && temp <= 32767);
            coeffs[i] = temp;
        }

        // Set coefficients. Use divide factor 14 => divide result by 2^14 = 16384
        me.pFIR.setCoefficients(coeffs, length, 14);
    },
    evaluate: function (dest, src, numSamples, numChannels, destIndx, srcIndx) {
        var me = this;
        return me.pFIR.evaluate(dest, src, numSamples, numChannels, destIndx, srcIndx);
    }
});