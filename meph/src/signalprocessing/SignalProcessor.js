/**
 * @class MEPH.signalprocessing.SignalProcessor
 * @extends MEPH.control.Control
 * Signal processing library.
 **/
MEPH.define('MEPH.signalprocessing.SignalProcessor', {
    requires: ['MEPH.math.FFT',
        'MEPH.math.Util',
        'MEPH.util.Vector',
        'MEPH.math.Vector',
        'MEPH.tween.Calculator'],
    statics: {
        MAX_FRAME_LENGTH: 16000,//        private static int 
        maximumWindow: 1024,

    },
    properties: {
        windowingFunc: null,
        sampleRate: 44100,
        joiningFunc: null,
        framesize: 2048,
        lastphase: null,
        gInFIFO: null,//private static float[]  new float[MAX_FRAME_LENGTH];
        gOutFIFO: null,//new float[MAX_FRAME_LENGTH];
        gFFTworksp: null,//new float[2 * MAX_FRAME_LENGTH];
        gLastPhase: null,//new float[MAX_FRAME_LENGTH / 2 + 1];
        gSumPhase: null,//new float[MAX_FRAME_LENGTH / 2 + 1];
        gOutputAccum: null,//new float[2 * MAX_FRAME_LENGTH];
        gAnaFreq: null,//new float[MAX_FRAME_LENGTH];
        gAnaMagn: null,//new float[MAX_FRAME_LENGTH];
        gSynFreq: null,//new float[MAX_FRAME_LENGTH];
        gSynMagn: null,//new float[MAX_FRAME_LENGTH];
        gRover: null,//
        gInit: null

    },
    initialize: function (skip) {
        var me = this;
        if (!skip) {
            me.clear();
        }
    },
    clear: function () {
        var me = this;
        me.gInFIFO = new Float32Array(MEPH.signalprocessing.SignalProcessor.MAX_FRAME_LENGTH);
        me.gOutFIFO = new Float32Array(MEPH.signalprocessing.SignalProcessor.MAX_FRAME_LENGTH);
        me.gFFTworksp = new Float32Array(2 * MEPH.signalprocessing.SignalProcessor.MAX_FRAME_LENGTH);
        me.gLastPhase = new Float32Array(MEPH.signalprocessing.SignalProcessor.MAX_FRAME_LENGTH);
        me.gSumPhase = new Float32Array(MEPH.signalprocessing.SignalProcessor.MAX_FRAME_LENGTH);
        me.gOutputAccum = new Float32Array(MEPH.signalprocessing.SignalProcessor.MAX_FRAME_LENGTH);
        me.gAnaFreq = new Float32Array(MEPH.signalprocessing.SignalProcessor.MAX_FRAME_LENGTH);
        me.gAnaMagn = new Float32Array(MEPH.signalprocessing.SignalProcessor.MAX_FRAME_LENGTH);
        me.gSynFreq = new Float32Array(MEPH.signalprocessing.SignalProcessor.MAX_FRAME_LENGTH);
        me.gSynMagn = new Float32Array(MEPH.signalprocessing.SignalProcessor.MAX_FRAME_LENGTH);

    },
    pitchShift: function (pitchShift, numSampsToProcess, fftFrameSize, osamp, sampleRate, indata, outdata) {
        var magn, phase, tmp, window, real, imag;
        var freqPerBin, expct;
        var i, k, qpd, index, inFifoLatency, stepSize, fftFrameSize2;
        var me = this;

        outdata = outdata || indata;
        var hasoutput = false;

        /* set up some handy variables */
        fftFrameSize2 = fftFrameSize / 2;
        stepSize = fftFrameSize / osamp;
        freqPerBin = sampleRate / fftFrameSize;
        expct = 2.0 * Math.PI * stepSize / fftFrameSize;
        inFifoLatency = fftFrameSize - stepSize;
        if (!me.gRover) me.gRover = inFifoLatency;


        /* main processing loop */
        for (i = 0; i < numSampsToProcess; i++) {

            /* As long as we have not yet collected enough data just read in */
            me.gInFIFO[me.gRover] = indata[i];
            outdata[i] = me.gOutFIFO[me.gRover - inFifoLatency];

            me.gRover++;

            /* now we have enough data for processing */
            if (me.gRover >= fftFrameSize) {
                me.gRover = inFifoLatency;

                /* do windowing and re,im interleave */
                for (k = 0; k < fftFrameSize; k++) {
                    window = -.5 * Math.cos(2.0 * Math.PI * k / fftFrameSize) + .5;
                    me.gFFTworksp[2 * k] = (me.gInFIFO[k] * window);
                    me.gFFTworksp[2 * k + 1] = 0.0;
                }


                /* ***************** ANALYSIS ******************* */
                /* do transform */
                me.ShortTimeFourierTransform(me.gFFTworksp, fftFrameSize, -1);

                /* this is the analysis step */
                for (k = 0; k <= fftFrameSize2; k++) {

                    /* de-interlace FFT buffer */
                    real = me.gFFTworksp[2 * k];
                    imag = me.gFFTworksp[2 * k + 1];

                    /* compute magnitude and phase */
                    magn = 2.0 * Math.sqrt(real * real + imag * imag);
                    phase = Math.atan2(imag, real);

                    /* compute phase difference */
                    tmp = phase - me.gLastPhase[k];
                    me.gLastPhase[k] = phase;

                    /* subtract expected phase difference */
                    tmp -= k * expct;

                    /* map delta phase into +/- Pi interval */
                    qpd = Math.floor(tmp / Math.PI);
                    if (qpd >= 0) qpd += qpd & 1;
                    else qpd -= qpd & 1;
                    tmp -= Math.PI * qpd;

                    /* get deviation from bin frequency from the +/- Pi interval */
                    tmp = osamp * tmp / (2.0 * Math.PI);

                    /* compute the k-th partials' true frequency */
                    tmp = k * freqPerBin + tmp * freqPerBin;

                    /* store magnitude and true frequency in analysis arrays */
                    me.gAnaMagn[k] = magn;
                    me.gAnaFreq[k] = tmp;

                }

                /* ***************** PROCESSING ******************* */
                /* this does the actual pitch shifting */
                for (var zero = 0; zero < fftFrameSize; zero++) {
                    me.gSynMagn[zero] = 0;
                    me.gSynFreq[zero] = 0;
                }

                for (k = 0; k <= fftFrameSize2; k++) {
                    index = Math.floor(k * pitchShift);
                    if (index <= fftFrameSize2) {
                        me.gSynMagn[index] += me.gAnaMagn[k];
                        me.gSynFreq[index] = me.gAnaFreq[k] * pitchShift;
                    }
                }

                /* ***************** SYNTHESIS ******************* */
                /* this is the synthesis step */
                for (k = 0; k <= fftFrameSize2; k++) {

                    /* get magnitude and true frequency from synthesis arrays */
                    magn = me.gSynMagn[k];
                    tmp = me.gSynFreq[k];

                    /* subtract bin mid frequency */
                    tmp -= k * freqPerBin;

                    /* get bin deviation from freq deviation */
                    tmp /= freqPerBin;

                    /* take osamp into account */
                    tmp = 2.0 * Math.PI * tmp / osamp;

                    /* add the overlap phase advance back in */
                    tmp += k * expct;

                    /* accumulate delta phase to get bin phase */
                    me.gSumPhase[k] += tmp;
                    phase = me.gSumPhase[k];

                    /* get real and imag part and re-interleave */
                    me.gFFTworksp[2 * k] = (magn * Math.cos(phase));
                    me.gFFTworksp[2 * k + 1] = (magn * Math.sin(phase));
                }

                /* zero negative frequencies */
                for (k = fftFrameSize + 2; k < 2 * fftFrameSize; k++) {
                    me.gFFTworksp[k] = 0.0;//
                }

                /* do inverse transform */
                me.ShortTimeFourierTransform(me.gFFTworksp, fftFrameSize, 1);

                /* do windowing and add to output accumulator */
                for (k = 0; k < fftFrameSize; k++) {
                    window = -.5 * Math.cos(2.0 * Math.PI * k / fftFrameSize) + .5;
                    me.gOutputAccum[k] += (2.0 * window * me.gFFTworksp[2 * k] / (fftFrameSize2 * osamp));
                    if (isNaN(me.gOutputAccum[k])) {

                    }
                }
                for (k = 0; k < stepSize; k++) me.gOutFIFO[k] = me.gOutputAccum[k];
                hasoutput = true;
                /* shift accumulator */
                //memmove(gOutputAccum, gOutputAccum + stepSize, fftFrameSize * sizeof(float));
                for (k = 0; k < fftFrameSize; k++) {
                    me.gOutputAccum[k] = me.gOutputAccum[k + stepSize];
                }

                /* move input FIFO */
                for (k = 0; k < inFifoLatency; k++) me.gInFIFO[k] = me.gInFIFO[k + stepSize];
            }
        }
        return hasoutput;
    },
    signalPitchShift: function (frames, pitchShift, fftFrameSize, osamp, sampleRate) {
        var k, index, fftFrameSize2;

        /* set up some handy variables */
        fftFrameSize2 = fftFrameSize / 2;

        var gSynMagn, gAnaMagn;
        var gSynFreq, gAnaFreq;

        /* ***************** PROCESSING ******************* */
        /* this does the actual pitch shifting */
        var res = frames.select(function (frame) {
            gAnaMagn = frame.mag;
            gAnaFreq = frame.freq;
            gSynMagn = new Float32Array(fftFrameSize);
            gSynFreq = new Float32Array(fftFrameSize);

            for (k = 0; k <= fftFrameSize2; k++) {
                index = Math.floor(k * pitchShift);
                if (index <= fftFrameSize2) {
                    gSynMagn[index] += gAnaMagn[k];
                    gSynFreq[index] = gAnaFreq[k] * pitchShift;
                }
            }
            return {
                mag: gSynMagn,
                freq: gSynFreq
            }
        });
        return res;
    },
    timeStretch: function (pitchShift, timeStretch, numSampsToProcess, fftFrameSize, osamp, sampleRate, indata, outdata) {
        var magn, phase, tmp, window, real, imag;
        var freqPerBin, expct;
        var i, k, qpd, index, inFifoLatency, stepSize, fftFrameSize2;
        var me = this;
        timeStretch = timeStretch || 1;

        outdata = outdata || indata;
        var hasoutput = false;

        /* set up some handy variables */
        fftFrameSize2 = fftFrameSize / 2;
        stepSize = fftFrameSize / osamp;
        freqPerBin = sampleRate / fftFrameSize;
        expct = 2.0 * Math.PI * stepSize / fftFrameSize;
        inFifoLatency = fftFrameSize - stepSize;
        if (!me.gRover) me.gRover = inFifoLatency;


        /* main processing loop */
        for (i = 0; i < numSampsToProcess; i++) {

            /* As long as we have not yet collected enough data just read in */
            me.gInFIFO[me.gRover] = indata[i];
            outdata[i] = me.gOutFIFO[me.gRover - inFifoLatency];

            me.gRover++;

            /* now we have enough data for processing */
            if (me.gRover >= fftFrameSize) {
                me.gRover = inFifoLatency;

                /* do windowing and re,im interleave */
                for (k = 0; k < fftFrameSize; k++) {
                    window = -.5 * Math.cos(2.0 * Math.PI * k / fftFrameSize) + .5;
                    me.gFFTworksp[2 * k] = (me.gInFIFO[k] * window);
                    me.gFFTworksp[2 * k + 1] = 0.0;
                }


                /* ***************** ANALYSIS ******************* */
                /* do transform */
                me.ShortTimeFourierTransform(me.gFFTworksp, fftFrameSize, -1);

                /* this is the analysis step */
                for (k = 0; k <= fftFrameSize2; k++) {

                    /* de-interlace FFT buffer */
                    real = me.gFFTworksp[2 * k];
                    imag = me.gFFTworksp[2 * k + 1];

                    /* compute magnitude and phase */
                    magn = 2.0 * Math.sqrt(real * real + imag * imag);
                    phase = Math.atan2(imag, real);

                    /* compute phase difference */
                    tmp = phase - me.gLastPhase[k];
                    me.gLastPhase[k] = phase;

                    /* subtract expected phase difference */
                    tmp -= k * expct;

                    /* map delta phase into +/- Pi interval */
                    qpd = Math.floor(tmp / Math.PI);
                    if (qpd >= 0) qpd += qpd & 1;
                    else qpd -= qpd & 1;
                    tmp -= Math.PI * qpd;

                    /* get deviation from bin frequency from the +/- Pi interval */
                    tmp = osamp * tmp / (2.0 * Math.PI);

                    /* compute the k-th partials' true frequency */
                    tmp = k * freqPerBin + tmp * freqPerBin;

                    /* store magnitude and true frequency in analysis arrays */
                    me.gAnaMagn[k] = magn;
                    me.gAnaFreq[k] = tmp;

                }

                /* ***************** PROCESSING ******************* */
                /* this does the actual pitch shifting */
                for (var zero = 0; zero < fftFrameSize; zero++) {
                    me.gSynMagn[zero] = 0;
                    me.gSynFreq[zero] = 0;
                }

                for (k = 0; k <= fftFrameSize2; k++) {
                    index = Math.floor(k * pitchShift);
                    if (index <= fftFrameSize2) {
                        me.gSynMagn[index] += me.gAnaMagn[k];
                        me.gSynFreq[index] = me.gAnaFreq[k] * pitchShift;
                    }
                }

                /* ***************** SYNTHESIS ******************* */
                /* this is the synthesis step */
                for (k = 0; k <= fftFrameSize2; k++) {

                    /* get magnitude and true frequency from synthesis arrays */
                    magn = me.gSynMagn[k];
                    tmp = me.gSynFreq[k];

                    /* subtract bin mid frequency */
                    tmp -= k * freqPerBin;

                    /* get bin deviation from freq deviation */
                    tmp /= freqPerBin;

                    /* take osamp into account */
                    tmp = 2.0 * Math.PI * tmp / osamp;

                    /* add the overlap phase advance back in */
                    tmp += k * expct;

                    /* accumulate delta phase to get bin phase */
                    me.gSumPhase[k] += tmp;
                    phase = me.gSumPhase[k];

                    /* get real and imag part and re-interleave */
                    me.gFFTworksp[2 * k] = (magn * Math.cos(phase));
                    me.gFFTworksp[2 * k + 1] = (magn * Math.sin(phase));
                }

                /* zero negative frequencies */
                for (k = fftFrameSize + 2; k < 2 * fftFrameSize; k++) {
                    me.gFFTworksp[k] = 0.0;//
                }

                /* do inverse transform */
                me.ShortTimeFourierTransform(me.gFFTworksp, fftFrameSize, 1);

                /* do windowing and add to output accumulator */
                for (k = 0; k < fftFrameSize; k++) {
                    window = -.5 * Math.cos(2.0 * Math.PI * k / fftFrameSize) + .5;
                    me.gOutputAccum[k] += (2.0 * window * me.gFFTworksp[2 * k] / (fftFrameSize2 * osamp));
                    if (isNaN(me.gOutputAccum[k])) {

                    }
                }
                for (k = 0; k < stepSize; k++) me.gOutFIFO[k] = me.gOutputAccum[k];
                hasoutput = true;
                /* shift accumulator */
                //memmove(gOutputAccum, gOutputAccum + stepSize, fftFrameSize * sizeof(float));
                for (k = 0; k < fftFrameSize; k++) {
                    me.gOutputAccum[k] = me.gOutputAccum[k + stepSize];
                }

                /* move input FIFO */
                for (k = 0; k < inFifoLatency; k++) me.gInFIFO[k] = me.gInFIFO[k + stepSize];
            }
        }
        return hasoutput;
    },
    signalAnalysis: function (fftFrameSize, osamp, sampleRate, indata) {
        var me = this;

        var fftFrameSize2 = fftFrameSize / 2;
        var stepSize = fftFrameSize / osamp;
        var freqPerBin = sampleRate / fftFrameSize;
        var k;
        var expct = 2.0 * Math.PI * stepSize / fftFrameSize;
        var inFifoLatency = fftFrameSize - stepSize;
        var res = [];
        var magn, phase, tmp, window, real, imag;
        var freqPerBin, expct;
        var i, k, qpd, index, inFifoLatency, stepSize, fftFrameSize2;
        var me = this;
        var gInFIFO;
        var gAnaFreq;
        var gAnaMagn;
        var gFFTworksp;
        var gLastPhase;
        gFFTworksp = new Float32Array(2 * fftFrameSize);
        var steps = Math.ceil(indata.length / stepSize);
        gLastPhase = new Float32Array(fftFrameSize);
        var res = [].interpolate(0, steps, function (step) {
            gInFIFO = indata.subset(step * stepSize, (step * stepSize) + fftFrameSize);
            gAnaFreq = new Float32Array(fftFrameSize);
            gAnaMagn = new Float32Array(fftFrameSize);

            /* do windowing and re,im interleave */
            for (k = 0; k < fftFrameSize; k++) {
                window = -.5 * Math.cos(2.0 * Math.PI * k / fftFrameSize) + .5;
                gFFTworksp[2 * k] = (gInFIFO[k] * window);
                gFFTworksp[2 * k + 1] = 0.0;
            }


            /* ***************** ANALYSIS ******************* */
            /* do transform */
            me.ShortTimeFourierTransform(gFFTworksp, fftFrameSize, -1);

            /* this is the analysis step */
            for (k = 0; k <= fftFrameSize2; k++) {

                /* de-interlace FFT buffer */
                real = gFFTworksp[2 * k];
                imag = gFFTworksp[2 * k + 1];

                /* compute magnitude and phase */
                magn = 2.0 * Math.sqrt(real * real + imag * imag);
                phase = Math.atan2(imag, real);

                /* compute phase difference */
                tmp = phase - gLastPhase[k];
                gLastPhase[k] = phase;

                /* subtract expected phase difference */
                tmp -= k * expct;

                /* map delta phase into +/- Pi interval */
                qpd = Math.floor(tmp / Math.PI);
                if (qpd >= 0) qpd += qpd & 1;
                else qpd -= qpd & 1;
                tmp -= Math.PI * qpd;

                /* get deviation from bin frequency from the +/- Pi interval */
                tmp = osamp * tmp / (2.0 * Math.PI);

                /* compute the k-th partials' true frequency */
                tmp = k * freqPerBin + tmp * freqPerBin;

                /* store magnitude and true frequency in analysis arrays */
                gAnaMagn[k] = magn;
                gAnaFreq[k] = tmp;
            }
            return {
                mag: gAnaMagn,
                freq: gAnaFreq
            }
        });
        return res;
    },
    signalSynthesis: function (frames, fftFrameSize, osamp, sampleRate) {
        var magn, phase, tmp, window, real, imag;
        var freqPerBin, expct;
        var i, k, qpd, index, inFifoLatency, stepSize, fftFrameSize2;
        var me = this;

        var hasoutput = false;

        /* set up some handy variables */
        fftFrameSize2 = fftFrameSize / 2;
        stepSize = fftFrameSize / osamp;
        freqPerBin = sampleRate / fftFrameSize;
        expct = 2.0 * Math.PI * stepSize / fftFrameSize;
        var gSumPhase = new Float32Array(fftFrameSize);
        var gFFTworksp = new Float32Array(2 * fftFrameSize);
        var gOutputAccum = new Float32Array(fftFrameSize + stepSize);
        var currentstep = 0;
        var gOutFIFO = new Float32Array(stepSize * frames.length);
        frames.foreach(function (frame) {
            var gSynMagn = frame.mag;
            var gSynFreq = frame.freq;
            /* ***************** SYNTHESIS ******************* */
            /* this is the synthesis step */
            for (k = 0; k <= fftFrameSize2; k++) {

                /* get magnitude and true frequency from synthesis arrays */
                magn = gSynMagn[k];
                tmp = gSynFreq[k];

                /* subtract bin mid frequency */
                tmp -= k * freqPerBin;

                /* get bin deviation from freq deviation */
                tmp /= freqPerBin;

                /* take osamp into account */
                tmp = 2.0 * Math.PI * tmp / osamp;

                /* add the overlap phase advance back in */
                tmp += k * expct;

                /* accumulate delta phase to get bin phase */
                gSumPhase[k] += tmp;
                phase = gSumPhase[k];

                /* get real and imag part and re-interleave */
                gFFTworksp[2 * k] = (magn * Math.cos(phase));
                gFFTworksp[2 * k + 1] = (magn * Math.sin(phase));
            }

            /* zero negative frequencies */
            for (k = fftFrameSize + 2; k < 2 * fftFrameSize; k++) {
                gFFTworksp[k] = 0.0;//
            }

            /* do inverse transform */
            me.ShortTimeFourierTransform(gFFTworksp, fftFrameSize, 1);

            /* do windowing and add to output accumulator */
            for (k = 0; k < fftFrameSize; k++) {
                window = -.5 * Math.cos(2.0 * Math.PI * k / fftFrameSize) + .5;
                gOutputAccum[k] += (2.0 * window * gFFTworksp[2 * k] / (fftFrameSize2 * osamp));
            }
            for (k = 0; k < stepSize; k++) {
                gOutFIFO[k + currentstep] = gOutputAccum[k];
            }
            hasoutput = true;
            currentstep = stepSize + currentstep;
            /* shift accumulator */
            //memmove(gOutputAccum, gOutputAccum + stepSize, fftFrameSize * sizeof(float));
            for (k = 0; k < fftFrameSize; k++) {
                if (k + stepSize >= gOutputAccum.length) {
                    MEPH.Log('outside of bounds');
                }
                gOutputAccum[k] = gOutputAccum[k + stepSize];
            }

            /* move input FIFO */
            //for (k = 0; k < inFifoLatency; k++) me.gInFIFO[k] = me.gInFIFO[k + stepSize];
        });
        return gOutFIFO;
    },
    modifySignal: function (pitchShift, timeStretch, fftFrameSize, osamp, sampleRate, buffer) {
        var res;
        var tres;
        var sp = this;
        pitchShift = pitchShift || 1;
        res = sp.signalAnalysis(fftFrameSize, osamp, sampleRate, buffer);
        if (timeStretch && timeStretch.length) {
            tres = sp.timeScaling(res, timeStretch);
            res = tres;
        }
        if (pitchShift !== 1) {
            tres = sp.signalPitchShift(res, pitchShift, fftFrameSize, osamp, sampleRate);
            res = tres;
        }
        var sres = sp.signalSynthesis(res, fftFrameSize, osamp, sampleRate);

        return sres;
    },
    /**
     * Time scaling of sinusoidal tracks
     * @param {Array} sfreq
     * @param {Array} smag
     * @param {Array} timeScaling
     * @return {Object} 
     *          {
     *            tfreq: [],
     *            tmag: []
     *          }
     ***/
    timeScaling: function (frames, timeScaling) {
        if (!timeScaling.length) {
            throw new Error('Time scaling array does any elements.');
        }
        var L = frames.length; //frames
        var maxInTime = timeScaling.maximum(function (x) { return x.start; });
        var maxOutTime = timeScaling.maximum(function (x) { return x.scale; });
        var outL = (L) * maxOutTime / maxInTime;
        var inFrames = timeScaling.select(function (x) { return x.start * (L - 1) / maxInTime; });
        var outFrames = timeScaling.select(function (x) { return x.scale * (L - 1) / maxOutTime; });
        var timeScalingEnv = function (frames) {
            var tweendata = [{
                x: inFrames.select(function (x) { return x / (L - 1); }),
                y: outFrames.select(function (x) { return x / (L - 1); })
            }]
            var calculator = new MEPH.tween.Calculator();
            calculator.setData(tweendata);
            return frames.select(function (x) {
                var result = calculator.get(x / (outL - 1));
                return result * (L - 1);
            });
        };
        var indexes = timeScalingEnv([].interpolate(0, Math.floor(outL)));
        var ysfreq = [frames[Math.round(indexes[0])]];

        indexes.subset(1).foreach(function (ii) {
            ysfreq.push(frames[Math.round(ii)]);
        })

        return ysfreq;
    },
    guessfrequencies: function (input, sampleRate, windowsize, binsize, step) {
        var me = this;
        var steps = Math.ceil(input.length / windowsize);
        var frequencies = [].interpolate(0, steps, function (t) {

            var _input = input.subset(windowsize * t, (windowsize * (t + 1)));

            var freq = me.guessfrequency(_input, sampleRate, binsize, step);
            return freq
        });

        return frequencies;
    },
    getNotes: function (input, sampleRate, windowsize, binsize, step) {
        var me = this, frequencies = me.guessfrequencies(input, sampleRate, windowsize, binsize, step);

        return frequencies.select(function (x) {
            return me.noteFromFrequency(x);
        })
    },
    noteFromPitch: function (frequency) {
        var noteNum = 12 * (Math.log(frequency / 440) / Math.log(2));
        return Math.round(noteNum) + 69;
    },
    noteFromFrequency: function (frequency) {
        var me = this, note = me.noteFromPitch(frequency);
        var noteStrings = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

        return noteStrings[note % 12];
    },
    guessfrequency: function (input, sampleRate, binsize, windowStep) {
        var me = this;
        var res = me.frequency(input, sampleRate, binsize, windowStep);
        if (res.length > 2) {
            // remove maximum
            var max = res.maximum(function (x) {
                return Math.abs(x);
            });
            var bbin = res.indexWhere(function (x) {
                return Math.abs(x) === max;
            }).first();
            res.splice(bbin, 1);

            // remove minimum
            var max = res.maximum(function (x) {
                return -Math.abs(x);
            });
            var bbin = res.indexWhere(function (x) {
                return -Math.abs(x) === max;
            }).first();
            res.splice(bbin, 1);
        }
        var averagefreque = res.summation(function (x, r) { return x + r }) / res.length;

        return averagefreque;
    },
    frequency: function (input, sampleRate, binsize, windowStep) {
        var me = this;
        var length = input.length;
        var fftsize = length / 2;
        binsize = binsize || 1024;
        windowStep = windowStep || (binsize / 2);

        var steps = input.length / windowStep;
        var frequencies = [].interpolate(0, steps, function (t) {
            var _input = input.subset(windowStep * t, (windowStep * (t)) + binsize);
            if (_input.length < binsize) {
                _input = [].interpolate(0, binsize, function (x) {
                    return _input[x] || 0;
                })
            }
            var frequency = me._frequency(_input, sampleRate);
            return frequency;
        });


        return frequencies;
    },
    _frequency: function (input, sampleRate) {
        var me = this;
        var res = me.fft(input);
        //res = res.skipEvery(2);
        var max = res.maximum(function (x) {
            return Math.abs(x);
        });
        var bbin = res.indexWhere(function (x) {
            return Math.abs(x) === max;
        }).first();
        var fs = sampleRate / input.length * bbin;
        return fs;
    },
    ShortTimeFourierTransform: function (fftBuffer, fftFrameSize, sign) {
        var wr, wi, arg, temp;
        var tr, ti, ur, ui;
        var i, bitm, j, le, le2, k;

        for (i = 2; i < 2 * fftFrameSize - 2; i += 2) {
            for (bitm = 2, j = 0; bitm < 2 * fftFrameSize; bitm <<= 1) {
                if ((i & bitm) != 0) j++;
                j <<= 1;
            }
            if (i < j) {
                temp = fftBuffer[i];
                fftBuffer[i] = fftBuffer[j];
                fftBuffer[j] = temp;
                temp = fftBuffer[i + 1];
                fftBuffer[i + 1] = fftBuffer[j + 1];
                fftBuffer[j + 1] = temp;
            }
        }
        var max = Math.floor(Math.log(fftFrameSize) / Math.log(2.0) + .5);
        for (k = 0, le = 2; k < max; k++) {
            le <<= 1;
            le2 = le >> 1;
            ur = 1.0;
            ui = 0.0;
            arg = Math.PI / (le2 >> 1);
            wr = Math.cos(arg);
            wi = (sign * Math.sin(arg));
            for (j = 0; j < le2; j += 2) {

                for (i = j; i < 2 * fftFrameSize; i += le) {
                    tr = fftBuffer[i + le2] * ur - fftBuffer[i + le2 + 1] * ui;
                    ti = fftBuffer[i + le2] * ui + fftBuffer[i + le2 + 1] * ur;
                    fftBuffer[i + le2] = fftBuffer[i] - tr;
                    fftBuffer[i + le2 + 1] = fftBuffer[i + 1] - ti;
                    fftBuffer[i] += tr;
                    fftBuffer[i + 1] += ti;

                }
                tr = ur * wr - ui * wi;
                ui = ur * wi + ui * wr;
                ur = tr;
            }
        }
    },
    /**
     * Performs a sfft.
     * @param {Array} array
     * @param {Array} $window
     * @param {Number} N
     * FFT Size
     * @param {Number} H
     * hop size returns
     * @return {Array}
     **/
    sfft: function (array, $window, N, H) {
        H = Math.ceil(H || 0);
        var me = this;
        if (H <= 0) {
            throw new Error('Hop size is smaller than or equal to 0.');
        }
        var M = $window.length;
        var hM1 = Math.floor((M + 1) / 2);
        var hM2 = Math.floor(M / 2);
        var pin = 0;
        var pend = array.length - M;
        var total = $window.summation(function (x, r) { return x + r });
        $window = $window.select(function (x) { return x / total; });
        var result = [];

        while (pin <= pend) {
            //analysis
            var x1 = array.subset(pin, pin + M);
            var resX1 = me.dfft(x1, $window);

            result.push(resX1);
            pin += H;
        }

        return result;
    },
    /**
     * Performs  the inverse sfft
     * @param {Array} frames
     * @param {Number} M
     * The window size.
     * @param {Number} H
     * The Hop size
     **/
    isfft: function (frames, M, H) {
        var me = this;
        var pin = 0;
        var result = new Float32Array(frames.length * H);
        frames.foreach(function (frame, i) {
            var y1 = me.idfft(frame, M).skipEvery(2);
            y1.foreach(function (y, i) {
                result[pin + i] += y * H;
            });
            pin += H;
        });
        return result;
    },
    idfft: function (array, M) {
        var me = this;

        return me.ifft(array);
    },
    dfft: function (array, $window) {
        var me = this, warray;

        warray = array.select(function (x, i) {
            return x * $window[i];
        });

        return me.fft(warray);
    },
    /**
     * Performs a fast fourier transform(FFT).
     * @param {Array} array
     * @param {Number} outputOffset
     * @param {Number} outputStride
     * @param {Number} inputOffset
     * @param {Number} inputStide
     * @param {Array} output
     ***/
    fft: function (array, type, outputOffset, outputStride, inputOffset, inputStride) {
        type = type !== undefined ? type : 'real';
        var size = type === 'real' ? array.length * 2 : array.length;
        var output = new Float32Array(size);
        outputOffset = outputOffset !== undefined ? outputOffset : 0;
        outputStride = outputStride !== undefined ? outputStride : 1;

        inputOffset = inputOffset !== undefined ? inputOffset : 0;
        inputStride = inputStride !== undefined ? inputStride : 1;
        var fft = new FFT();

        fft.complex(type === 'complex' ? array.length / 2 : array.length, false);
        fft.process(output, outputOffset, outputStride, array, inputOffset, inputStride, type)
        return output;
    },
    /**
     * Performs an inverse fast fourier transform(FFT).
     * @param {Array} array
     * @param {Number} outputOffset
     * @param {Number} outputStride
     * @param {Number} inputOffset
     * @param {Number} inputStide
     * @param {Array} output
     ***/
    ifft: function (array, outputOffset, outputStride, inputOffset, inputStride, type) {
        type = type !== undefined ? type : 'complex';
        var size = array.length;
        var output = new Float32Array(type === 'complex' ? size : size * 2);
        outputOffset = outputOffset !== undefined ? outputOffset : 0;
        outputStride = outputStride !== undefined ? outputStride : 1;

        inputOffset = inputOffset !== undefined ? inputOffset : 0;
        inputStride = inputStride !== undefined ? inputStride : 1;
        var fft = new FFT();

        fft.complex(output.length / 2, true);
        fft.process(output, outputOffset, outputStride, array, inputOffset, inputStride, false);

        output.foreach(function (t, i) {
            output[i] = output[i] / (size / 2);
        })
        return output;
    },
    /**
     *
     * Calculates the amplitude for each imaginary real pair of the fft result.
     * @param {Array} fftarray
     * [r,i,r,i,r,i,r,i,r,i]
     ***/
    amplitude: function (fftarray) {
        var res = new Float32Array(fftarray.length / 2);
        [].interpolate(0, fftarray.length / 2, function (x) {
            var index = x * 2;
            res[x] = MEPH.math.Util.polar(fftarray[index], fftarray[index + 1]).radius;
        });
        return res;
    },
    /**
     *
     * Calculates the phases for each imaginary real pair of the fft result.
     * @param {Array} fftarray
     * [r,i,r,i,r,i,r,i,r,i]
     ***/
    phase: function (fftarray) {
        var res = new Float32Array(fftarray.length / 2);
        [].interpolate(0, fftarray.length / 2, function (x) {
            var index = x * 2;
            res[x] = MEPH.math.Util.polar(fftarray[index], fftarray[index + 1]).theta;
        });
        return res;
    },
    /**
     *
     * Detects maxima in an array of values;
     * @param {Array} array
     * @param {Number} distance
     **/
    detectMaxima: function (array, distance) {
        var res = [];
        var i = 0;
        distance = distance || 1
        var maxima = null;
        var x;

        for (var index = 0 ; index < array.length ; index++) {
            x = array[index];
            maxima = x;
            var forwardMin = array.subset(index + 1, index + distance + 1).where(function (y) {
                if (y >= maxima) {
                    maxima = y;
                }
                return y >= maxima;
            });

            maxima = x;
            var backwardMin = array.subset(index - distance, index).where(function (y) {
                if (y >= maxima) {
                    maxima = y;
                }
                return y >= maxima;
            });

            if (forwardMin.length === 0 && backwardMin.length === 0) {
                res.push(index);
                index += distance - 1;
            }
        }
        return res;
    },
    /**
     *
     * Detects minima in an array of values;
     * @param {Array} array
     **/
    detectMinima: function (array, distance) {
        var res = [];
        var i = 0;
        distance = distance || 1
        var minima = null;
        var x;

        for (var index = 0 ; index < array.length ; index++) {
            x = array[index];
            minima = x;
            var forwardMin = array.subset(index + 1, index + distance + 1).where(function (y) {
                if (y <= minima) {
                    minima = y;
                }
                return y <= minima;
            });

            minima = x;
            var backwardMin = array.subset(index - distance, index).where(function (y) {
                if (y <= minima) {
                    minima = y;
                }
                return y <= minima;
            });

            if (forwardMin.length === 0 && backwardMin.length === 0) {
                res.push(index);
                index += distance - 1;
            }
        }
        return res;
    },
    /**
     * Gets/Sets the frame size.
     **/
    frameSize: function (size) {
        var me = this;
        if (size) {
            me.framesize = size;
            me.framesize2 = size / 2;
        }
        return me.framesize;
    },
    oversampling: function (os) {
        var me = this;
        if (os) {
            me.oversample = os;
        }
        return me.oversample;
    },
    samplingRate: function (sr) {
        var me = this;
        if (sr) {
            me.samplingrate = sr;
        }
        return me.samplingrate;
    },
    /**
     *
     * Analysis of the input.
     **/
    analysis: function (input) {
        var me = this,
            magn, phase,
            real, expct,
            stepSize, tmp, freqPerBin,
            sampleRate = me.samplingRate(),
            qpd, osamp = me.oversampling(),
            imag;
        me.lastphase = me.lastphase || new Float32Array(me.framesize2);
        if (me.lastphase.length !== me.framesize2) {
            me.lastphase = new Float32Array(me.framesize2)
        }
        stepSize = me.frameSize() / osamp;
        expct = 2 * Math.PI * stepSize / me.frameSize();
        freqPerBin = sampleRate / me.frameSize();
        var res = {
            mag: new Float32Array(me.framesize2),
            freq: new Float32Array(me.framesize2)
        }
        for (var k = 0 ; k < me.framesize2; k++) {
            /* de-interlace FFT buffer */
            real = input[2 * k];
            imag = input[2 * k + 1];

            /* compute magnitude and phase */
            magn = 2. * Math.sqrt(real * real + imag * imag);
            phase = Math.atan2(imag, real);

            /* compute phase difference */
            tmp = phase - me.lastphase[k];
            me.lastphase[k] = phase;

            /* subtract expected phase difference */
            tmp -= k * expct;

            /* map delta phase into +/- Pi interval */
            qpd = tmp / Math.PI;
            if (qpd >= 0) {
                qpd += (qpd & 1);
            }
            else {
                qpd -= (qpd & 1);
            }
            tmp -= Math.PI * qpd;

            /* get deviation from bin frequency from the +/- Pi interval */
            tmp = osamp * tmp / (2.0 * Math.PI);

            /* compute the k-th partials' true frequency */
            tmp = k * freqPerBin + tmp * freqPerBin;

            res.mag[k] = magn;
            res.freq[k] = tmp;
        }
        return res;
    },
    /**
     * Pitch shifts input.
     ***/
    pitch: function (analysisframe, pitchShift) {
        var me = this, k,
            synthesisMag = new Float32Array(me.frameSize()),
            synthesisFreq = new Float32Array(me.frameSize()),
            index;
        for (k = 0; k < me.framesize2; k++) {
            index = Math.floor(k * pitchShift);
            if (index < me.framesize2) {
                synthesisMag[index] += analysisframe.mag[k];
                synthesisFreq[index] = analysisframe.freq[k] * pitchShift;
            }
        }
        return {
            mag: synthesisMag,
            freq: synthesisFreq
        }
    },
    synthesis: function (frame) {
        var me = this,
            k, osamp, stepSize,
            expct,
            sampleRate = me.samplingRate(),
            freqPerBin;

        osamp = me.oversampling();
        stepSize = me.frameSize() / osamp;
        expct = 2 * Math.PI * stepSize / me.frameSize();
        freqPerBin = sampleRate / me.frameSize();
        me.sumPhase = me.sumPhase || new Float32Array(me.framesize2);
        if (me.sumPhase.length !== me.framesize2) {
            me.sumPhase = new Float32Array(me.framesize2);
        }
        var result = new Float32Array(me.frameSize());
        for (k = 0; k < me.framesize2; k++) {

            /* get magnitude and true frequency from synthesis arrays */
            magn = frame.mag[k];
            tmp = frame.freq[k];

            /* subtract bin mid frequency */
            tmp -= k * freqPerBin;

            /* get bin deviation from freq deviation */
            tmp /= freqPerBin;

            /* take osamp into account */
            tmp = 2.0 * Math.PI * tmp / osamp;

            /* add the overlap phase advance back in */
            tmp += k * expct;

            /* accumulate delta phase to get bin phase */
            me.sumPhase[k] += tmp;
            phase = me.sumPhase[k];

            /* get real and imag part and re-interleave */
            result[2 * k] = magn * Math.cos(phase);
            result[2 * k + 1] = magn * Math.sin(phase);
        }
        return result;
    },
    /*
     *
     * do windowing and add to output accumulator 
     * @param {Array} frame
     * @param {Array} output
     */
    unwindow: function (frame, output) {
        var me = this,
            window,
            osamp,
            k;
        osamp = me.oversampling();

        for (k = 0; k < me.frameSize() ; k++) {
            window = -.5 * Math.cos(2.0 * Math.PI * k / me.frameSize()) + .5;
            output[k] += 2. * window * (frame[2 * k] || 0) / (me.framesize2 * osamp);
        };
        return output;
    },
    /**
     * https://github.com/numpy/numpy/blob/v1.8.1/numpy/lib/function_base.py#L1122
     * Unwrap by changing deltas between values to 2*pi complement.
     * Unwrap radian phase `p` by changing absolute jumps greater than 
     * `discont` to their 2*pi complement along the given axis.
    *
    *    Parameters
    *    ----------
    *    p : array_like
    *        Input array.
    *    discont : float, optional
    *        Maximum discontinuity between values, default is ``pi``.
    *    axis : int, optional
    *        Axis along which unwrap will operate, default is the last axis.
    *
    *    Returns
    *    -------
    *    out : ndarray
    *        Output array.
    *
    *    See Also
    *    --------
    *    rad2deg, deg2rad
    *
    *    Notes
    *    -----
    *    If the discontinuity in `p` is smaller than ``pi``, but larger than
    *    `discont`, no unwrapping is done because taking the 2*pi complement
    *    would only make the discontinuity larger.
    
    *    Examples
    *    --------
    *    >>> phase = np.linspace(0, np.pi, num=5)
    *    >>> phase[3:] += np.pi
    *    >>> phase
    *    array([ 0.        ,  0.78539816,  1.57079633,  5.49778714,  6.28318531])
    *    >>> np.unwrap(phase)
    *    array([ 0.        ,  0.78539816,  1.57079633, -0.78539816,  0.        ])
    *
    */
    unwrap: function (p, discont, axis) {
        discont = discont || Math.PI;
        axis = axis || -1;
        var me = this;
        var nd = p.length;
        var dd = me.diff(p);
        //slice1 = [slice(None, None)] * nd
        // slice1[axis] = slice(1, None)
        // ddmod = mod(dd + pi, 2 * pi) - pi
        var ddmod = dd.select(function (x) {
            return (x + Math.PI) % (2 * Math.PI) - Math.PI;
        })
        // _nx.copyto(ddmod, pi, where = (ddmod == -pi) & (dd > 0))
        ddmod = ddmod.select(function (x, index) {
            return x === -Math.PI && dd[index] > 0 ? Math.PI : x;
        });
        // ph_correct = ddmod - dd;
        var ph_correct = ddmod.select(function (x, index) {
            return x - dd[index];
        });

        // _nx.copyto(ph_correct, 0, where = abs(dd) < discont)
        ph_correct = ph_correct.select(function (x, index) {
            return Math.abs(dd[index]) < discont ? 0 : x;
        })
        // up = array(p, copy = True, dtype = 'd')
        // up[slice1] = p[slice1] + ph_correct.cumsum(axis)
        var correct = ph_correct.cumsum();
        return p.select(function (x, index) {
            return x + (correct[index - 1] || 0);
        });

    },
    phaseunwrap: function ($data) {
        var me = this;
        var data = $data.select();
        return me.unwrapImplGetter(data, 0, 1, 1);
    },
    unwrapImplGetter: function (data, ptr, stride, n) {
        var pi = Math.PI;
        var me = this;
        var pphase = me.modf(data, ptr),
            shift = 0;
        ptr += stride;
        for (var i = 1; i < n ; ++i, ptr += stride) {
            var cphase = me.modf(data, ptr);
            var d = cphase - pphase;
            if (d < -pi) {
                shift += tau;
            }
            else if (d > pi) {
                shift -= tau;
            }
            data[ptr] = cphase + shift;
            pphase = cphase;
        }
        return data;
    },
    modf: function (data, ptr) {
        var tau = Math.PI * 2;
        var me = this;
        var x = data[ptr];
        if (data[ptr] < 0) {
            return tau + (x % tau);
        }
        else if (x > tau) {
            return x % tau;
        }
        return x;
    },
    /**
    *
    *  Calculate the n-th order discrete difference along given axis.
    *  The first order difference is given by ``out[n] = a[n+1] - a[n]`` along
    *  the given axis, higher order differences are calculated by using `diff`
    *  recursively.
    
    *  Parameters
    *  ----------
    *  a : array_like
    *      Input array
    *  n : int, optional
    *      The number of times values are differenced.
    *  axis : int, optional
    *      The axis along which the difference is taken, default is the last axis.
    *
    *  Returns
    *  -------
    *  diff : ndarray
    *      The `n` order differences. The shape of the output is the same as `a`
    *      except along `axis` where the dimension is smaller by `n`.
    *
    *
    */
    diff: function (array, n) {
        n = n || 1;

        var res = array.subset(1).select(function (x, index) {
            return x - array[index];
        });
        if (n > 1) {
            n--;
            return me.diff(res, n);
        }
        return res;
    },
    /**
     *
     * Stretches a signal by the stretch factor, resulting in a signal * stretch long.
     * @param {Array} signal
     * @param {Number} stretch how much to stretch the windows.
     * @param {Number} overlap the overlap factor of the windowing function.
     * @param {Number} width overrides the calculated width.
     * @param {String} type , complex or real
     **/
    stretch: function (signal, stretch, overlap, width, type) {
        var len = signal.length,
            me = this;
        overlap = overlap === null ? .5 : overlap;
        var windowWidth = width || me.windowWidth(signal.length);

        stretch = type === 'complex' ? stretch : stretch * 2;
        var windows = me.fftwindows(signal, windowWidth);
        var frames = windows.select(function (x, index) {
            return {
                a: x,
                b: windows[index + 1] || null
            }
        });

        var interpolatedWindows = me.interpolateFrames(windowWidth * 2, windows, type === 'complex' ? stretch : stretch / 2, overlap);

        var ifftwindows = me.ifftwindows(interpolatedWindows);
        var res = me.joinWindows(ifftwindows, me.joining(), overlap, stretch * len);

        return res//.subset(0, Math.ceil(stretch * signal.length * (1 / (overlap || 1))));
    },
    /**
     * @private
     **/
    interpolateFrames: function (windowWidth, windows, stretch, overlap) {
        var me = this, unwrappedPhase, phase, amplitude, rectangular,
            a, b, halfIndex,
            unwrappedA, unwrappedB,
            lerp, frame, gth,
            fth, interpolateVal, inverseoverlap = (1 / (overlap || 1)),
        generatedWindowFrames;
        generatedWindowFrames = me.generateWindows(windowWidth, Math.ceil(windows.length * stretch * inverseoverlap));
        lerp = MEPH.util.Vector.Lerp;

        var unwrappedPhase = windows.first().phase.select();
        var wwindow = windowWidth / 2;

        var unwrappedPhase = [].interpolate(0, windows.first().phase.length, function (x) {
            return windows.select(function (t) {
                return t.phase[x];
            })
        }).select(function (x) {
            return me.unwrap(x);
        });

        var lastXsk = null, hop = windowWidth * overlap;
        generatedWindowFrames.foreach(function (Xsk, i) {
            fth = Math.floor(i / (stretch * inverseoverlap));
            gth = Math.ceil(i / (stretch * inverseoverlap));
            interpolateVal = (i / (stretch)) - fth;
            a = windows[fth];
            b = windows[gth];
            b = b || a;
            if (fth > gth) {
                throw new Error('Frames are out of sequence.')
            }
            Xsk.step(2, function (xsk, index) {
                halfIndex = index / 2;
                //unwrappedPhase = unwrappedB ? lerp(unwrappedA[halfIndex], unwrappedB[halfIndex], interpolateVal) : unwrappedA[halfIndex];
                //phase = unwrappedPhase //% Math.PI;
                //amplitude = unwrappedB ? lerp(a.amplitude[halfIndex], b.amplitude[halfIndex], interpolateVal) : a.amplitude[halfIndex];
                //rectangular = MEPH.math.Util.rectangular(phase, amplitude);
                var phasea = unwrappedPhase[halfIndex][fth];
                var phaseb = unwrappedPhase[halfIndex][gth];
                if (lastXsk) {
                    var dpkm = (phaseb - phasea) / (hop);
                    //var dpckm = (hop * (Math.PI * 2)) / (wwindow / (wwindow / 2));
                    var polar = MEPH.math.Util.polar(lastXsk[index], lastXsk[index + 1]);
                    var pa = polar.theta + dpkm * stretch * overlap;
                    //var pa = dpckm + (halfIndex / hop) * (1 / wwindow);
                    phasea = pa;/// me.unwrap([phasea, pa]).last();
                }
                // var phasea = unwrappedPhase[halfIndex];
                //var phasea = a.phase[halfIndex]
                //var phaseb;
                //phaseb = b.phase[halfIndex];

                //var dp = phaseb - phasea - (2 * Math.PI * (wwindow / 2)) / (wwindow / index);
                //dp = dp - 2 * Math.PI * Math.round(dp / (2 * Math.PI));
                //phaseb = dp;

                // b.phase[halfIndex] = phaseb;
                //var x = b && b.raw ? lerp(a.raw[index], b.raw[index], interpolateVal) : a.raw[index];
                //var y = b && b.raw ? lerp(a.raw[index + 1], b.raw[index + 1], interpolateVal) : a.raw[index + 1];
                var x = phasea;
                // var x = lerp(phasea, phaseb, interpolateVal);
                var y = lerp(a.amplitude[halfIndex], b.amplitude[halfIndex], interpolateVal);
                var rect = MEPH.math.Util.rectangular(x, y)
                //var x = a.raw[index];
                //var y = a.raw[index + 1];
                //Xsk[index] = x;
                //Xsk[index + 1] = y;
                Xsk[index] = rect.x;
                Xsk[index + 1] = rect.y;
            });
            lastXsk = Xsk;
        });

        return generatedWindowFrames;
    },
    joinWindows: function (windows, joinfunc, stepratio, length) {
        var windowWidth = windows.first().length;
        stepratio = stepratio || 1;
        var resultSignalLength = length;
        var res = new Float32Array(resultSignalLength);


        res.step(2, function (x, rindex) {
            //var percentage = index / res;
            var indexesOfContributingWindows = windows.indexWhere(function (w, index) {
                var start = index * stepratio * windowWidth;
                var end = start + windowWidth - 1;
                return start <= rindex && rindex < end;
            });

            var contributionsWindow = indexesOfContributingWindows.select(function (w, index) {
                var t = windows[w];
                var start = Math.floor(w * stepratio * windowWidth);
                var contribution = joinfunc(rindex - start, windowWidth);
                return {
                    window: windows[w],
                    start: start,
                    contribution: contribution < 0 ? 0 : contribution
                }
            });

            var total = contributionsWindow.addition(function (t) {
                return t.contribution;
            });
            var r = contributionsWindow.addition(function (t, index) {
                var w = t.window;
                return total === 0 ? w[rindex - t.start] : (t.contribution / total) * w[rindex - t.start];
            });
            res[rindex] = r;

            r = contributionsWindow.addition(function (t, index) {
                var w = t.window;
                return (t.contribution / total) * w[(rindex + 1) - t.start];
            });
            res[rindex + 1] = r;

            //var r = indexesOfContributingWindows.addition(function (w, index) {
            //    var t = windows[w];
            //    var start = w * stepratio * windowWidth;
            //    var contribution = joinfunc(rindex - start, windowWidth);
            //    return contribution < 0 ? 0 : contribution * t[rindex - start];
            //});
            //res[rindex] = r;

            //r = indexesOfContributingWindows.addition(function (w, index) {
            //    var t = windows[w];
            //    var start = w * stepratio * windowWidth;
            //    var contribution = joinfunc((rindex) - (start), windowWidth);
            //    return contribution < 0 ? 0 : contribution * t[(rindex + 1) - (start)];
            //});
            //res[rindex + 1] = r;
        });
        return res;
    },
    /**
     * Splits real signal arrays into fft chunks.
     * @param {Array} signal
     * @param {Number} step
     **/
    fftwindows: function (signal, step) {
        var me = this;
        var windowing = me.windowing();
        if (!windowing) {
            throw new Error('Set a windowing function.');
        }
        var steps = Math.ceil(signal.length / step);
        var result = [].interpolate(0, steps, function (t) {
            var windowStartIndex = t * step;
            var windowEndIndex = (t + 1) * step;
            var windowSlice = signal.subset(windowStartIndex, windowEndIndex);//, windowing, t === 0, t === (steps - 1)
            var windowFFT = me.fft(windowSlice);
            return {
                raw: windowFFT,
                phase: me.phase(windowFFT),
                amplitude: me.amplitude(windowFFT)
            };
        });

        return result;
    },
    ifftwindows: function (windows) {
        var me = this;
        var res = windows.select(function (w) {
            return me.ifft(w);
        });
        return res;
    },
    /**
     * Generates a count of series of arrays of size long
     **/
    generateWindows: function (size, count) {
        return [].interpolate(0, count, function (x) {
            return new Float32Array(size);
        })
    },
    /**
     * Selects a windows width based on the signal length.
     * @param {Number} len
     **/
    windowWidth: function (len) {
        var length = Math.log(len) / Math.log(2);

        return Math.pow(2, Math.min(MEPH.signalprocessing.SignalProcessor.maximumWindow, Math.max(2, (length / 2))));
    },
    /**
     * Gets/Sets the function to use for windowing.
     */
    windowing: function (w) {
        var me = this;
        if (w !== undefined) {
            me.windowingFunc = w;
        }
        return me.windowingFunc;
    },
    joining: function (w) {
        var me = this;
        if (w !== undefined) {
            me.windowingFunc = w;
        }
        return me.windowingFunc;
    },
    /**
     *  Do windowing and re,im interleave
     ***/
    interleaveInput: function (input) {
        var me = this, window, framesize = me.frameSize(),
            gFFTworksp = me.getArray(input, framesize * 2);
        for (k = 0; k < me.frameSize() ; k++) {
            window = -.5 * Math.cos(2. * Math.PI * k / framesize) + .5;
            gFFTworksp[2 * k] = input[k] * window;
            gFFTworksp[2 * k + 1] = 0.;
        }
        return gFFTworksp;
    },
    getArray: function (array, length) {
        if (array instanceof Float32Array) {
            return new Float32Array(length);
        }
        else if (array instanceof Float64Array) {
            return new Float64Array(length);
        }
        return [].interpolate(0, length, function () { return 0; });
    },
    /**
     * Detects spectral peak locations.
     * @param {Array} mX
     * Magnitude spectrum
     * @param {Number} threshold
     **/
    peakDetection: function (_mX, _t) {
        var me = this;
        var t = (_t);
        var mX = _mX.select(function (x) {
            return (x);
        })
        var thresh = mX.subset(1, mX.length - 1).indexWhere(function (x) {
            return (x) > (t);
        });
        var next_minor = mX.subset(1, mX.length - 1).indexWhere(function (x, i) {
            return (x) > (mX[i]) && (x) > (mX[i + 2]);
        }).select(function (x) { return x + 1 });
        var ploc = next_minor.where(function (t) {
            return thresh.some(function (x) { return x === t; })
        });
        return ploc;
    },
    toDb: function (val) {
        return 20 * Math.log(Math.abs(val)) / Math.log(10);
    },
    fromDb: function (val) {
        return Math.pow(10, val / 20);
    },
    /**
     * Interpolate peak values using parabolic interpolation,
     * @param {Array} mX
     * Magnitude 
     * @param {Array} pX
     * Phase
     * @param {Array} pLoc
     * @return {Object}
     ***/
    peakInterp: function (mX, pX, ploc) {
        var me = this;
        var iplocs = ploc.select(function (loc, index) {
            var val = (mX[loc]);
            var lval = (mX[loc - 1]);
            var rval = (mX[loc + 1]);
            var iploc = loc + 0.5 * (lval - rval) / (lval - (2 * val) + rval);
            return iploc;
        });
        var ipmags = ploc.select(function (loc, index) {
            var val = (mX[loc]);
            var lval = (mX[loc - 1]);
            var rval = (mX[loc + 1]);
            var ipmag = val - 0.25 * (lval - rval) * (iplocs[index] - loc);
            return ipmag;
        });

        var ipphases = ploc.select(function (loc, index) {
            return MEPH.math.Vector.lerp(pX[loc], pX[loc + 1], .5);
        });

        return {
            locations: iplocs,
            magnitudes: ipmags,
            phases: ipphases
        }
    },
    /**
     * Analysis of a sound using the sinusoidal model with sine tracking.
     * @param {Array} x
     * @param {Array} w
     * @param {Number} N
     * Size of complex spectrum
     * @param {Number} H
     * Hop size
     * @param {Number} t
     * threshold in negative dbs.
     * @param {Number} maxnSines
     * Maximum number of sines per frame.
     * @param {Number} minSineDur
     * Minimum duration of sines in seconds
     * @param {Number} freqDevOffset
     * Minimum frequency deviation at 0Hz
     * @param {Number} freqDevSlope
     * Slop increase of minimum frequency deviation.
     ****/
    sineModelAnal: function (x, fs, w, N, H, threshold, maxnSines, minSineDur, freqDevOffset, freqDevSlope) {
        maxnSines = maxnSines || 811;
        minSineDur = minSineDur || .001;
        freqDevOffset = freqDevOffset || 20;
        freqDevSlope = freqDevSlope || 0.3;
        var me = this;
        if (minSineDur < 0)
            throw new Error('Minimum duration of sine tracks smaller than 0');
        var hM1 = Math.floor((w.length + 1) / 2);
        var hM2 = Math.floor((w.length / 2));

        var newx = new Float32Array(x.length + hM2 + hM1);
        x.foreach(function (t, i) {
            newx[i + hM2] = t;
        });

        x = newx;

        var pin = hM1;
        var pend = x.length - hM1;
        w = w.normalize();
        var tfreq = [];


        var xtfreq, xtmag, xtphase;
        while (pin < pend) {
            var x1 = x.subset(pin - hM1, pin + hM2, function (t) { return t; });
            var mpRex = me.dftAnal(x1, w, N);
            var ploc = me.peakDetection(mpRex.mX, threshold);
            var pmag = ploc.select(function (x) { return mpRex.mX[x]; });
            var ips = me.peakInterp(mpRex.mX, mpRex.pX, ploc);
            var iploc = ips.locations;
            var ipmags = ips.magnitudes;
            var ipphases = ips.phases;;

            var ipfreq = iploc.select(function (x) {
                return (fs * x / N);
            });

            var tres = me.sineTracking(ipfreq, ipmags, ipphases, tfreq, freqDevOffset, freqDevSlope);
            tfreq = tres.tfreq;
            var tmag = tres.tmag;
            var tphase = tres.tphase;

            tfreq = tfreq.subset(0, maxnSines);
            tmag = tmag.subset(0, maxnSines);
            tphase = tphase.subset(0, maxnSines);
            var jtfreq = [].zeroes(maxnSines);
            var jtmag = [].zeroes(maxnSines);
            var jtphase = [].zeroes(maxnSines);

            tfreq.foreach(function (x, i) {
                jtfreq[i] = x;
            });

            tmag.foreach(function (x, i) {
                jtmag[i] = x;
            });

            tphase.foreach(function (x, i) {
                jtphase[i] = x;
            });

            if (pin === hM1) {
                xtfreq = [jtfreq.select()];
                xtmag = [jtmag.select()];
                xtphase = [jtphase.select()];
            }
            else {
                xtfreq.push(jtfreq.select());
                xtmag.push(jtmag.select());
                xtphase.push(jtphase.select());
            }
            pin += H;
        }
        xtfreq = me.cleaningSineTracks(xtfreq, Math.round(fs * minSineDur / H));

        return {
            tfreq: xtfreq,
            tmag: xtmag,
            tphase: xtphase
        }
    },
    /**
     * Synthesis of a sound using the sinusoidal model
     * @param {Array} tfreq
     * Frequencies
     * @param {Array} tmag
     * Magnitudes
     * @param {Array} tphase
     * Phases of sinusoids
     * @param {Number} N
     * synthesis FFT size
     * @param {Number} H
     * Hope size
     * @param {Number} sampling rate
     * @param {Nubmer} w
     * @return {Float32Array}
     **/
    sineModelSynth: function (tfreq, tmag, tphase, N, H, fs) {
        var me = this;
        var hN = N / 2;
        var L = tfreq.length;
        var pout = 0;
        var ysize = H * (L + 3);
        var y = new Float32Array(ysize);
        var sw = [].zeroes(N);
        var ow = MEPH.math.Util.window.Triang(null, H * 2);

        ow.foreach(function (t, i) {
            sw[hN - H + i] = t;
        });

        var bh = [].interpolate(0, N, function (n) {
            return MEPH.math.Util.window.BlackmanHarris(n, N);
        });
        bh = bh.normalize();

        [].interpolate(hN - H, hN + H, function (t) {
            sw[t] = sw[t] / bh[t];
        });

        var lastytfreq = tfreq[0].select();

        var ytphase = [].interpolate(0, lastytfreq.length, function (t) {
            return 2 * Math.PI * Math.random();
        });

        [].interpolate(0, L, function (l) {
            if (tphase[l]) {
                ytphase = tphase[l].select();
            }
            else {
                ytphase = ytphase.select(function (c, i) {
                    return ytphase[i] + (Math.PI * (lastytfreq[i] + tfreq[l][i]) / fs) * H;
                });
            }

            var Y = me.genSpecSines(tfreq[l], tmag[l], ytphase, N, fs);

            lastytfreq = tfreq[l].select();

            ytphase = ytphase.select(function (x) { return x % (2 * Math.PI); });
            tphase.push(ytphase);
            var yw = me.ifft(Y.Y).skipEvery(2).fftshift();;
            //var yw = [].zeroes(N);

            //[].interpolate(0, hN - 1, function (t) {
            //    yw[t] = yi[hN + 1 + t];
            //    yw[hN - 1 + t] = yi[t + 0];
            //});
            //            yw = yw.fftshift();

            [].interpolate(pout, pout + N, function (x, i) {
                y[x] += sw[i] * yw[i];
            });

            pout += H;
        });

        y = y.subset(hN, y.length - hN);
        return y;
    },
    /**
     * Time scaling of sinusoidal tracks
     * @param {Array} sfreq
     * @param {Array} smag
     * @param {Array} timeScaling
     * @return {Object} 
     *          {
     *            tfreq: [],
     *            tmag: []
     *          }
     ***/
    sineTimeScaling: function (sfreq, smag, timeScaling) {
        if (!timeScaling.length) {
            throw new Error('Time scaling array does any elements.');
        }
        var L = sfreq.length; //frames
        var maxInTime = timeScaling.maximum(function (x) { return x.start; });
        var maxOutTime = timeScaling.maximum(function (x) { return x.scale; });
        var outL = (L) * maxOutTime / maxInTime;
        var inFrames = timeScaling.select(function (x) { return x.start * (L - 1) / maxInTime; });
        var outFrames = timeScaling.select(function (x) { return x.scale * (L - 1) / maxOutTime; });
        var timeScalingEnv = function (frames) {
            var tweendata = [{
                x: inFrames.select(function (x) { return x / (L - 1); }),
                y: outFrames.select(function (x) { return x / (L - 1); })
            }]
            var calculator = new MEPH.tween.Calculator();
            calculator.setData(tweendata);
            return frames.select(function (x) {
                var result = calculator.get(x / (outL - 1));
                return result * (L - 1);
            });
        };
        var indexes = timeScalingEnv([].interpolate(0, outL));
        var ysfreq = [sfreq[Math.round(indexes[0])]];
        var ysmag = [smag[Math.round(indexes[0])]];

        indexes.subset(1).foreach(function (ii) {
            ysfreq.push(sfreq[Math.round(ii)]);
            ysmag.push(smag[Math.round(ii)]);
        })

        return {
            tfreq: ysfreq,
            tmag: ysmag
        }
    },
    /**
     * Frequency scaling of sinusoidal tracks.
     * @param {Array} sfreq
     * @param {Array} freqScaling
     * @return {Array}
     ***/
    sineFreqScaling: function (sfreq, freqScaling) {
        var me = this;
        if (!freqScaling.length) {
            throw new Error('Frequency scaling array does any elements.');
        }
        var L = sfreq.length; //frames
        var maxInTime = freqScaling.maximum(function (x) { return x.start; });
        var maxOutTime = freqScaling.maximum(function (x) { return x.scale; });
        var outL = (L) * maxOutTime / maxInTime;
        var inFrames = freqScaling.select(function (x) { return x.start * (L - 1) / maxInTime; });
        var outFrames = freqScaling.select(function (x) { return x.scale * (L - 1) / maxOutTime; });
        var freqScalingEnv = function (frames) {
            var tweendata = [{
                x: inFrames.select(function (x) { return x / (L - 1); }),
                y: outFrames.select(function (x) { return x / (L - 1); })
            }]
            var calculator = new MEPH.tween.Calculator();
            calculator.setData(tweendata);
            return frames.select(function (x) {
                var result = calculator.get(x / (outL - 1));
                return result;
            });
        };
        var freqScaling = freqScalingEnv([].interpolate(0, outL));
        var ysfreq = [];

        freqScaling.foreach(function (ii, index) {
            var res = sfreq[index].select(function (x) {
                return x + x * ii;
            });
            ysfreq.push(res);
        });

        return ysfreq;
    },
    sineModel: function (x, fs, w, N, t, fftsize) {
        var me = this;
        var hM1 = Math.floor((w.length + 1) / 2);
        var hM2 = Math.floor(w.length / 2);
        var Ns = fftsize || 512;
        var H = Ns / 4;
        var hNs = Ns / 2;
        var pin = Math.max(hNs, hM1);
        var pend = x.length - pin;
        var fftbuffer = new Float32Array(N);
        var yw = new Float32Array(Ns);
        var y = new Float32Array(x.length);
        var wsum = w.summation(function (r, t) { return r + t; });
        w = w.select(function (t) { return t / wsum; });
        var sw = new Float32Array(Ns);
        var ow = MEPH.math.Util.window.Triang(null, H * 2);
        ow.foreach(function (t, i) {
            sw[hNs - H + i] = t;
        });
        var bh = [].interpolate(0, N, function (n) {
            return MEPH.math.Util.window.BlackmanHarris(n, N);
        });

        bh.normalize();

        [].interpolate(hN - H, hN + H, function (t) {
            sw[t] = sw[t] / bh[t];
        });

        while (pin < pend) {
            var xl = x.subset(pin - hM1, pin + hM2, function (t) { return t; });
            var mxPx = me.dftAnal(x1, w, N);
            var ploc = me.peakDetection(mxPx.mX, t);
            var pmag = ploc.select(function (t) { return mxPx.mX[t]; });
            var res = me.peakInterp(mxPx.mX, mxPx.pX, ploc);

            var ipfreq = res.iploc.select(function (t) { return fs * t / N; });

            var Y = me.genSpecSines(ipfreq, res.ipmag, res.ipphase, Ns, fs);

            var yw = me.dftSynth(Y, w);

            [].interpolate(pin - hNs, pin + hNs, function (t, i) {
                y[t] += sw[i] * yw[i];
            })
            pin += H;
        }
        return y;
    },
    /**
     * Delete short fragments of a collection of sinusoidal tracks
     * @param {Array} tfreq
     * Frequency of tracks
     * @param {Number} minTrackLength
     * Minimum duration of tracks in number of frames
     * @returns {Array} 
     * Ouputs frequency of tracks.
     ****/
    cleaningSineTracks: function (tfreq, minTrackLength) {
        minTrackLength = minTrackLength || 3;
        if (tfreq.length === 0) {
            return tfreq;
        }
        var nFrames = tfreq.length;
        var nTracks = tfreq[0].length;
        var beginnings = [].interpolate(0, nTracks, function (t) {
            return [].interpolate(0, nFrames, function (j) {
                if (tfreq[j][t]) {
                    if (j === 0) {
                        return {
                            track: t,
                            frame: j
                        }
                    }
                    else if (j > 0 && tfreq[j - 1][t] === 0) {
                        return {
                            track: t,
                            frame: j
                        }
                    }
                }
            }).where();
        }).concatFluent(function (x) {
            return x;
        });

        var ends = [].interpolate(0, nTracks, function (t) {
            return [].interpolate(0, nFrames, function (j) {
                if (tfreq[j][t]) {
                    if (j === nFrames - 1) {
                        return {
                            track: t,
                            frame: j
                        }
                    }
                    else if (tfreq[j + 1][t] === 0) {
                        return {
                            track: t,
                            frame: j
                        }
                    }
                }
            }).where();
        }).concatFluent(function (x) {
            return x;
        });

        beginnings.foreach(function (x) {
            var end = ends.first(function (t) {
                return t.track === x.track && t.frame > x.frame;
            });
            if (end) {
                x.end = end.frame;
                x.length = end.frame - x.frame;
            }
        });

        var toremove = beginnings.where(function (x) { return x.length < minTrackLength; });

        toremove.foreach(function (x) {
            [].interpolate(x.frame, x.end + 1, function (t) {
                tfreq[t][x.track] = 0;
            })
        })
        return tfreq;
    },
    /**
     * Tracking sinusoids from one frame to the next
     * @param {Array} pfreq
     * Frequencies and magnitude of current frame.
     * @param {Array} pmag
     * Frequencies and magnitude of current frame.
     * @param {Array} pphase
     * Frequencies and magnitude of current frame.
     * @param {Array} tfreq
     * Frequencies of incoming tracks from previous frame.
     * @param {Number} freqDevOffset
     * Minimum frequency deviation of 0hz
     * @pafam {Number} freqDevSlope
     * Slope increase of minimum frequency deviation
     * @returns {Object}
     *              {
     *                  tfreqn : [],
     *                  tmagn: [],
     *                  tphasen: [],
     *                  frequency: null,
     *                  magnitude: null,
     *                  phase: null
     *              }
     ****/
    sineTracking: function (pfreq, pmag, pphase, tfreq, freqDevOffset, freqDevSlope) {
        freqDevOffset = freqDevOffset || 20;
        freqDevSlope = freqDevSlope || 0.01;
        var me = this,
            tfreqn = [].zeroes(tfreq.length),
            tmagn = [].zeroes(tfreq.length),
            tphasen = [].zeroes(tfreq.length),
            pindexes = pfreq.indexWhere(function (x) {
                return x //&& x.length;
            }),
            incomingTracks = [].interpolate(0, tfreq.length, function (x) {
                return x;
            }),
            newTracks = [].interpolate(0, tfreq.length, function () {
                return -1;
            }),
            magOrder = pindexes.argsort(function (x, y) {
                return Math.abs(pmag[y]) - Math.abs(pmag[x]);
            }),
            pfreqt = pfreq.select(),
            pmagt = pmag.select(),
            pphaset = pphase.select();

        if (incomingTracks.length > 0) {
            magOrder.foreach(function (i) {
                if (incomingTracks.length) {
                    var track = incomingTracks.closestAbs(pfreqt[i], function (index) {
                        var tf = tfreq[incomingTracks[index]]
                        return tf;
                    });

                    var freqDistance = Math.abs(Math.abs(pfreq[i]) - Math.abs(tfreq[incomingTracks[track]]));
                    if (freqDistance < (freqDevOffset + freqDevSlope * pfreq[i])) {
                        newTracks[incomingTracks[track]] = i;
                        incomingTracks.splice(track, 1);
                    }
                }
            })
        }

        var indext = newTracks.indexWhere(function (x) { return x !== -1; });

        if (indext.length > 0) {
            var indexp = indext.select(function (x) {
                return newTracks[x];
            });

            indexp.foreach(function (i, index) {
                tfreqn[indext[index]] = pfreqt[i];
                tmagn[indext[index]] = pmagt[i];
                tphasen[indext[index]] = pphaset[i];
            });
            pfreqt.removeIndices(indexp);
            pmagt.removeIndices(indexp);
            pphaset.removeIndices(indexp);
        }
        // create new tracks from non used peaks
        var emptyt = tfreq.indexWhere(function (x) { return x === 0; });
        var peaksleft = pmagt.argsort(function (x, y) {
            return Math.abs(y) - Math.abs(x);
        });
        if (peaksleft.length > 0 && emptyt.length >= peaksleft.length) {
            peaksleft.foreach(function (pl, index) {
                tfreqn[emptyt[index]] = pfreqt[pl];
                tmagn[emptyt[index]] = pmagt[pl];
                tphasen[emptyt[index]] = pphaset[pl];
            })
        }
        else if (peaksleft.length > 0 && emptyt.length < peaksleft.length) {
            emptyt.foreach(function (ei, index) {
                tfreqn[ei] = pfreqt[peaksleft[index]];
                tmagn[ei] = pmagt[peaksleft[index]];
                tphasen[ei] = pphaset[peaksleft[index]];
            });

            [].interpolate(emptyt.length, peaksleft.length, function (t) {
                tfreqn.push(pfreqt[peaksleft[t]]);
                tmagn.push(pmagt[peaksleft[t]]);
                tphasen.push(pphaset[peaksleft[t]]);
            });
        }

        return {
            tfreq: tfreqn,
            tmag: tmagn,
            tphase: tphasen
        }
    },
    /**
     * Analysis of a signal using the discrete Fourier transform
     * @param {Array} x
     * Input signal.
     * @param {Array} w
     * Analysis window
     * @param {Number} N
     * FFT Size
     * @return {Object}
     *          {
     *              mX: [],
     *              pX: [] 
     *          }
     **/
    dftAnal: function (x, w, N) {

        if (w.length > N) {
            throw new Error('Window size (M) is bigger than FFT size');
        }
        var me = this;
        var hN = (N / 2) + 1;
        var hM1 = Math.floor((w.length + 1) / 2);
        var hM2 = Math.floor(w.length / 2);
        var fftbuffer = [].zeroes(N);
        w = w.normalize();

        var xw = x.select(function (t, i) { return t * w[i]; });

        [].interpolate(0, hM1, function (x) {
            fftbuffer[x] = xw[hM2 + x];
        });

        [].interpolate(0, hM2, function (x) {
            fftbuffer[fftbuffer.length - hM2 + x - 1] = xw[x];
        });

        var X = me.fft(fftbuffer);
        var mX = X.skipEvery(2).select(function (x, index) {
            var amp = MEPH.math.Util.polar(X[index * 2], X[index * 2 + 1]).radius
            return me.toDb(amp);
        }).subset(0, hN);
        var pX = me.unwrap(X.subset(1).skipEvery(2).select(function (x, index) {
            return MEPH.math.Util.polar(X[index * 2], x).theta;
        })).subset(0, hN);

        return {
            mX: mX,
            pX: pX
        }
    },
    /**
     * Synthesis of a signal using the discrete Fourier transform
     * @param {Object} mXpX
     * @param {Array} mXpX.mX
     * Magnitude spectrum
     * @param {Array} mXpX.pX
     * Phase spectrum
     * @param {Number} M 
     * window size
     **/
    dftSynth: function (mXpX, M) {
        var mX = mXpX.mX;
        var pX = mXpX.pX;
        var hN = mX.length;
        var me = this;


        var Y = new Float32Array(hN * 2);
        mX.foreach(function (x, i) {
            Y[i * 2] = x;
            Y[i * 2 + 1] = pX[i];
        })
        var result = me.ifft(Y).skipEvery(2);

        return result;
    },
    //*iploc, *ipmag, *ipphase, int n_peaks, double *real, double*imag, int size_spec
    genSpecSines2: function (ipfreq, ipmag, ipphase, N, fs) {
        var me = this;

        var Yreal = [].zeroes(N);
        var Yimg = [].zeroes(N);
        var hN = N / 2;

        [].interpolate(0, ipfreq.length, function (i) {
            var loc = N * ipfreq[i] / fs;
            if (loc !== 0 && loc <= hN - 1) {
                var binremainder = Math.round(loc) - loc;
                var lb = [].interpolate(binremainder - 4, binremainder + 5, function (x) { return x; });
                var lmag = me.genBhLobe(lb).select(function (res) { return res * ipmag[i]; });
                var b = [].interpolate(Math.round(loc) - 4, Math.round(loc) + 5);
                [].interpolate(0, 9, function (m) {
                    if (b[m] < 0) {
                        Yreal[-b[m]] += lmag[m]
                    }
                })
            }
        });
    },
    genBhLobe: function (array, N) {
        return MEPH.math.Util.getBhLobe(array, N);
    },
    /**
     * Generates a spectrum from a series of sine values.
     * @param {Array} ipfreq
     * Sine peaks frequences
     * @param {Array} ipmag
     * Magnitudes
     * @param {Array} ipphase
     * Phases
     * @param {Number} N 
     * Size of complex spectrum to generate
     * @param {Number} fs
     * Frequency sampling.
     * @return {Object}
     **/
    genSpecSines: function (ipfreq, ipmag, ipphase, N, fs) {
        var me = this;
        var Yreal = new Float32Array(N);
        var Yimg = new Float32Array(N);
        var hN = N / 2;
        var iploc = ipfreq.select(function (x) {
            var loc = N * x / fs;
            return loc;
        }).where().where(function (x) {
            return x <= hN - 1
        });



        me.$getSpecSines(iploc, ipmag, ipphase, iploc.length, Yreal, Yimg, N);

        var Y = new Float32Array(Yimg.length * 2);
        var temp = [].interpolate(0, Yimg.length, function (t, i) {
            return [Yreal[i], Yimg[i]];
        }).concatFluent(function (x) { return x; });

        temp.foreach(function (t, i) {
            Y[i] = t;
        })
        return {
            mX: Yreal,
            pX: Yimg,
            Y: Y
        };
    },
    $$getSpecSines: function (iploc, ipmag, ipphase, n_peaks, real, imag, N) {
        var me = this,
            ploc_int;
        var hN = N / 2;
        var cos = Math.cos;
        var sin = Math.sin;
        for (var ii = 0 ; ii < n_peaks; ii++) {
            var loc = iploc[ii];
            var bin_remainder = Math.floor(loc + .5) - loc;
            var lb = [].interpolate(bin_remainder - 4, bin_remainder + 5);
            var bhlobes = me.genBhLobe(lb, N);
            var b = [].interpolate(Math.round(loc) - 4, Math.round(loc) + 5, function (x) { return x; });

            var mag = ipmag[ii];

            for (var m = 0 ; m < 9; m++) {
                if (b[m] < 0) {
                    real[-b[m]] += mag * bhlobes[m] * cos(ipphase[ii]);
                    imag[-b[m]] += -1 * mag * bhlobes[m] * sin(ipphase[ii]);
                }
                else if (b[m] > hN) {
                    real[b[m]] += mag * bhlobes[m] * cos(ipphase[ii]);
                    imag[b[m]] += -1 * mag * bhlobes[m] * sin(ipphase[ii]);
                }
                else if (b[m] === 0 || b[m] === hN) {
                    if (b[m] === 0) {
                        real[b[m]] += 2 * mag * bhlobes[m] * cos(ipphase[ii]);
                    }
                    else {
                        real[b[m]] += 2 * mag * bhlobes[m] * cos(ipphase[ii]);
                    }
                }
                else {
                    real[b[m]] += mag * bhlobes[m] * cos(ipphase[ii]);
                    imag[b[m]] += mag * bhlobes[m] * sin(ipphase[ii]);
                }
            }
        }

        for (ii = 1; ii < hN; ii++) {
            real[hN + ii] = real[hN - ii];
            imag[hN + ii] = -1 * imag[hN - ii];
        }
    },
    $getSpecSines: function (iploc, ipmag, ipphase, n_peaks, real, imag, size_spec) {
        var ii = 0,
            jj = 0,
            bh_92_1001 = MEPH.signalprocessing.SignalProcessor.bh_92_1001,
            BH_SIZE_BY2 = MEPH.signalprocessing.SignalProcessor.BH_SIZE_BY2,
            ploc_int;
        var me = this;
        var size_spec_half = Math.floor(size_spec / 2);
        var bin_remainder,
            cos = Math.cos,
            sin = Math.sin,
            pow = Math.pow,
            loc,
            mag;

        for (ii = 0; ii < n_peaks; ii++) {
            loc = iploc[ii];
            bin_remainder = Math.floor(loc + 0.5) - loc;
            ploc_int = Math.floor(loc + 0.5);

            if ((loc >= 5) && (loc < size_spec_half - 4)) {
                mag = me.fromDb(ipmag[ii]);

                for (jj = -4; jj < 5; jj++) {
                    real[ploc_int + jj] += mag * bh_92_1001[Math.floor((bin_remainder + jj) * 100) + BH_SIZE_BY2] * cos(ipphase[ii]);
                    imag[ploc_int + jj] += mag * bh_92_1001[Math.floor((bin_remainder + jj) * 100) + BH_SIZE_BY2] * sin(ipphase[ii]);
                }
            }
            else if ((loc > 0) && (loc < 5)) {
                mag = me.fromDb(ipmag[ii]);

                for (jj = -4; jj < 5; jj++) {
                    if (ploc_int + jj < 0) {
                        real[-1 * (ploc_int + jj)] += mag * bh_92_1001[Math.floor((bin_remainder + jj) * 100) + BH_SIZE_BY2] * cos(ipphase[ii]);
                        imag[-1 * (ploc_int + jj)] += -1 * mag * bh_92_1001[Math.floor((bin_remainder + jj) * 100) + BH_SIZE_BY2] * sin(ipphase[ii]);

                    }
                    else if (ploc_int + jj == 0) {
                        real[(ploc_int + jj)] += 2 * mag * bh_92_1001[Math.floor((bin_remainder + jj) * 100) + BH_SIZE_BY2] * cos(ipphase[ii]);
                    }
                    else {
                        real[(ploc_int + jj)] += mag * bh_92_1001[Math.floor((bin_remainder + jj) * 100) + BH_SIZE_BY2] * cos(ipphase[ii]);
                        imag[ploc_int + jj] += mag * bh_92_1001[Math.floor((bin_remainder + jj) * 100) + BH_SIZE_BY2] * sin(ipphase[ii]);
                    }
                }
            }
            else if ((loc >= size_spec_half - 4) && (loc < size_spec_half - 1)) {
                mag = me.fromDb(ipmag[ii]);

                for (jj = -4; jj < 5; jj++) {
                    if (ploc_int + jj > size_spec_half) {
                        real[size_spec - (ploc_int + jj)] += mag * bh_92_1001[Math.floor((bin_remainder + jj) * 100) + BH_SIZE_BY2] * cos(ipphase[ii]);
                        imag[size_spec - (ploc_int + jj)] += -1 * mag * bh_92_1001[Math.floor((bin_remainder + jj) * 100) + BH_SIZE_BY2] * sin(ipphase[ii]);

                    }
                    else if (ploc_int + jj == size_spec_half) {
                        real[(ploc_int + jj)] += 2 * mag * bh_92_1001[Math.floor((bin_remainder + jj) * 100) + BH_SIZE_BY2] * cos(ipphase[ii]);

                    }
                    else {
                        real[(ploc_int + jj)] += mag * bh_92_1001[Math.floor((bin_remainder + jj) * 100) + BH_SIZE_BY2] * cos(ipphase[ii]);
                        imag[ploc_int + jj] += mag * bh_92_1001[Math.floor((bin_remainder + jj) * 100) + BH_SIZE_BY2] * sin(ipphase[ii]);
                    }
                }
            }

        }

        for (ii = 1; ii < size_spec_half; ii++) {
            real[size_spec_half + ii] = real[size_spec_half - ii];
            imag[size_spec_half + ii] = -1 * imag[size_spec_half - ii];
        }

    }
}).then(function () {
    MEPH.signalprocessing.SignalProcessor.bh_92_1001 = [8.876e-06, 9.5606e-06, 1.0255e-05, 1.0956e-05, 1.1664e-05, 1.2376e-05, 1.309e-05, 1.3804e-05, 1.4516e-05, 1.5224e-05, 1.5927e-05, 1.662e-05, 1.7303e-05, 1.7973e-05, 1.8628e-05, 1.9265e-05, 1.9881e-05, 2.0475e-05, 2.1045e-05, 2.1586e-05, 2.2098e-05, 2.2578e-05, 2.3022e-05, 2.343e-05, 2.3798e-05, 2.4124e-05, 2.4406e-05, 2.4642e-05, 2.4829e-05, 2.4966e-05, 2.5051e-05, 2.5081e-05, 2.5055e-05, 2.4971e-05, 2.4828e-05, 2.4625e-05, 2.436e-05, 2.4032e-05, 2.3642e-05, 2.3187e-05, 2.2668e-05, 2.2085e-05, 2.1437e-05, 2.0726e-05, 1.9952e-05, 1.9116e-05, 1.822e-05, 1.7264e-05, 1.6253e-05, 1.5186e-05, 1.4069e-05, 1.2904e-05, 1.1694e-05, 1.0445e-05, 9.1607e-06, 7.8463e-06, 6.5078e-06, 5.1516e-06, 3.7846e-06, 2.4143e-06, 1.0491e-06, 3.0242e-07, 1.6305e-06, 2.925e-06, 4.1749e-06, 5.3683e-06, 6.4929e-06, 7.5353e-06, 8.481e-06, 9.3154e-06, 1.0022e-05, 1.0584e-05, 1.0984e-05, 1.1202e-05, 1.1219e-05, 1.1013e-05, 1.0564e-05, 9.8468e-06, 8.8379e-06, 7.5115e-06, 5.8412e-06, 3.7985e-06, 1.3548e-06, 1.5209e-06, 4.8605e-06, 8.6968e-06, 1.3065e-05, 1.8002e-05, 2.3544e-05, 2.973e-05, 3.6602e-05, 4.4202e-05, 5.2573e-05, 6.1761e-05, 7.1816e-05, 8.2779e-05, 9.471e-05, 0.00010766, 0.00012167, 0.00013682, 0.00015315, 0.00017072, 0.0001896, 0.00020986, 0.00023155, 0.00025474, 0.00027951, 0.00030592, 0.00033406, 0.00036401, 0.00039582, 0.00042959, 0.0004654, 0.00050335, 0.0005435, 0.00058595, 0.00063081, 0.00067816, 0.00072811, 0.00078076, 0.0008362, 0.00089452, 0.00095588, 0.0010203, 0.001088, 0.0011591, 0.0012336, 0.0013117, 0.0013935, 0.0014791, 0.0015687, 0.0016625, 0.0017604, 0.0018628, 0.0019696, 0.0020811, 0.0021974, 0.0023187, 0.0024451, 0.0025767, 0.0027137, 0.0028564, 0.0030048, 0.0031592, 0.0033195, 0.003486, 0.0036593, 0.0038388, 0.0040255, 0.004219, 0.0044196, 0.0046273, 0.0048431, 0.0050664, 0.0052977, 0.005537, 0.0057848, 0.0060412, 0.0063063, 0.0065804, 0.0068638, 0.0071565, 0.0074591, 0.0077713, 0.0080938, 0.0084265, 0.00877, 0.0091241, 0.0094893, 0.0098661, 0.010254, 0.010654, 0.011066, 0.01149, 0.011927, 0.012377, 0.01284, 0.013315, 0.013805, 0.014309, 0.014827, 0.015359, 0.015906, 0.016468, 0.017045, 0.017637, 0.018246, 0.01887, 0.019511, 0.020169, 0.020844, 0.021536, 0.022245, 0.022973, 0.023718, 0.024482, 0.025264, 0.026066, 0.026887, 0.027728, 0.028589, 0.02947, 0.030371, 0.031294, 0.032237, 0.033201, 0.03419, 0.035198, 0.03623, 0.037285, 0.03836, 0.039461, 0.040587, 0.041734, 0.042906, 0.044103, 0.045324, 0.046571, 0.047845, 0.049141, 0.050468, 0.051817, 0.053194, 0.054598, 0.056031, 0.057491, 0.058976, 0.060492, 0.062036, 0.063608, 0.065211, 0.066842, 0.068501, 0.070191, 0.071912, 0.073664, 0.075443, 0.077257, 0.079099, 0.080975, 0.082882, 0.08482, 0.086792, 0.088794, 0.090832, 0.0929, 0.095002, 0.097135, 0.099305, 0.10151, 0.10375, 0.10602, 0.10832, 0.11066, 0.11304, 0.11545, 0.11789, 0.12037, 0.12289, 0.12544, 0.12803, 0.13065, 0.13331, 0.13601, 0.13874, 0.14151, 0.14431, 0.14715, 0.15003, 0.15295, 0.1559, 0.15889, 0.16192, 0.16498, 0.16808, 0.17122, 0.1744, 0.17761, 0.18086, 0.18415, 0.18747, 0.19083, 0.19424, 0.19767, 0.20115, 0.20466, 0.20821, 0.21179, 0.21542, 0.21907, 0.22277, 0.22651, 0.23028, 0.23408, 0.23793, 0.24181, 0.24572, 0.24967, 0.25366, 0.25769, 0.26175, 0.26584, 0.26996, 0.27413, 0.27833, 0.28256, 0.28683, 0.29113, 0.29546, 0.29983, 0.30423, 0.30866, 0.31313, 0.31762, 0.32215, 0.32671, 0.3313, 0.33592, 0.34057, 0.34525, 0.34996, 0.35471, 0.35948, 0.36426, 0.36909, 0.37393, 0.37883, 0.38373, 0.38866, 0.39362, 0.39858, 0.4036, 0.40863, 0.41368, 0.41873, 0.42385, 0.42897, 0.43411, 0.43926, 0.44444, 0.44962, 0.45486, 0.46006, 0.46534, 0.47061, 0.47588, 0.48118, 0.48648, 0.49181, 0.49715, 0.50251, 0.50788, 0.51324, 0.51863, 0.52403, 0.52942, 0.53485, 0.54028, 0.5457, 0.55113, 0.55655, 0.56201, 0.56744, 0.57289, 0.57835, 0.58381, 0.58923, 0.59469, 0.60015, 0.60557, 0.61103, 0.61646, 0.62191, 0.62734, 0.63277, 0.63816, 0.64359, 0.64898, 0.65438, 0.65974, 0.66511, 0.67047, 0.6758, 0.68114, 0.68644, 0.69174, 0.69701, 0.70225, 0.70749, 0.71273, 0.71794, 0.72312, 0.72826, 0.73338, 0.7385, 0.74358, 0.74864, 0.75366, 0.75868, 0.76364, 0.7686, 0.7735, 0.7784, 0.78324, 0.78804, 0.79285, 0.79759, 0.80231, 0.80696, 0.81161, 0.8162, 0.82076, 0.82528, 0.82978, 0.83421, 0.83861, 0.84296, 0.84727, 0.85151, 0.85573, 0.85992, 0.86404, 0.8681, 0.87213, 0.8761, 0.88004, 0.88391, 0.88773, 0.89148, 0.8952, 0.89886, 0.90246, 0.90602, 0.90952, 0.91294, 0.91632, 0.91963, 0.92289, 0.92611, 0.92924, 0.93231, 0.93532, 0.9383, 0.94118, 0.944, 0.94676, 0.94946, 0.9521, 0.95467, 0.95718, 0.9596, 0.96199, 0.96428, 0.96651, 0.96868, 0.97076, 0.97278, 0.97473, 0.97662, 0.97845, 0.98019, 0.98186, 0.98344, 0.98499, 0.98642, 0.98781, 0.98912, 0.99036, 0.99154, 0.99262, 0.99361, 0.99457, 0.99541, 0.99622, 0.99693, 0.99758, 0.99814, 0.99864, 0.99904, 0.99938, 0.99966, 0.99984, 0.99994, 1, 0.99994, 0.99984, 0.99966, 0.99938, 0.99904, 0.99864, 0.99814, 0.99758, 0.99693, 0.99622, 0.99541, 0.99457, 0.99361, 0.99262, 0.99154, 0.99036, 0.98912, 0.98781, 0.98642, 0.98499, 0.98344, 0.98186, 0.98019, 0.97845, 0.97662, 0.97473, 0.97278, 0.97076, 0.96868, 0.96651, 0.96428, 0.96199, 0.9596, 0.95718, 0.95467, 0.9521, 0.94946, 0.94676, 0.944, 0.94118, 0.9383, 0.93532, 0.93231, 0.92924, 0.92611, 0.92289, 0.91963, 0.91632, 0.91294, 0.90952, 0.90602, 0.90246, 0.89886, 0.8952, 0.89148, 0.88773, 0.88391, 0.88004, 0.8761, 0.87213, 0.8681, 0.86404, 0.85992, 0.85573, 0.85151, 0.84727, 0.84296, 0.83861, 0.83421, 0.82978, 0.82528, 0.82076, 0.8162, 0.81161, 0.80696, 0.80231, 0.79759, 0.79285, 0.78804, 0.78324, 0.7784, 0.7735, 0.7686, 0.76364, 0.75868, 0.75366, 0.74864, 0.74358, 0.7385, 0.73338, 0.72826, 0.72312, 0.71794, 0.71273, 0.70749, 0.70225, 0.69701, 0.69174, 0.68644, 0.68114, 0.6758, 0.67047, 0.66511, 0.65974, 0.65438, 0.64898, 0.64359, 0.63816, 0.63277, 0.62734, 0.62191, 0.61646, 0.61103, 0.60557, 0.60015, 0.59469, 0.58923, 0.58381, 0.57835, 0.57289, 0.56744, 0.56201, 0.55655, 0.55113, 0.5457, 0.54028, 0.53485, 0.52942, 0.52403, 0.51863, 0.51324, 0.50788, 0.50251, 0.49715, 0.49181, 0.48648, 0.48118, 0.47588, 0.47061, 0.46534, 0.46006, 0.45486, 0.44962, 0.44444, 0.43926, 0.43411, 0.42897, 0.42385, 0.41873, 0.41368, 0.40863, 0.4036, 0.39858, 0.39362, 0.38866, 0.38373, 0.37883, 0.37393, 0.36909, 0.36426, 0.35948, 0.35471, 0.34996, 0.34525, 0.34057, 0.33592, 0.3313, 0.32671, 0.32215, 0.31762, 0.31313, 0.30866, 0.30423, 0.29983, 0.29546, 0.29113, 0.28683, 0.28256, 0.27833, 0.27413, 0.26996, 0.26584, 0.26175, 0.25769, 0.25366, 0.24967, 0.24572, 0.24181, 0.23793, 0.23408, 0.23028, 0.22651, 0.22277, 0.21907, 0.21542, 0.21179, 0.20821, 0.20466, 0.20115, 0.19767, 0.19424, 0.19083, 0.18747, 0.18415, 0.18086, 0.17761, 0.1744, 0.17122, 0.16808, 0.16498, 0.16192, 0.15889, 0.1559, 0.15295, 0.15003, 0.14715, 0.14431, 0.14151, 0.13874, 0.13601, 0.13331, 0.13065, 0.12803, 0.12544, 0.12289, 0.12037, 0.11789, 0.11545, 0.11304, 0.11066, 0.10832, 0.10602, 0.10375, 0.10151, 0.099305, 0.097135, 0.095002, 0.0929, 0.090832, 0.088794, 0.086792, 0.08482, 0.082882, 0.080975, 0.079099, 0.077257, 0.075443, 0.073664, 0.071912, 0.070191, 0.068501, 0.066842, 0.065211, 0.063608, 0.062036, 0.060492, 0.058976, 0.057491, 0.056031, 0.054598, 0.053194, 0.051817, 0.050468, 0.049141, 0.047845, 0.046571, 0.045324, 0.044103, 0.042906, 0.041734, 0.040587, 0.039461, 0.03836, 0.037285, 0.03623, 0.035198, 0.03419, 0.033201, 0.032237, 0.031294, 0.030371, 0.02947, 0.028589, 0.027728, 0.026887, 0.026066, 0.025264, 0.024482, 0.023718, 0.022973, 0.022245, 0.021536, 0.020844, 0.020169, 0.019511, 0.01887, 0.018246, 0.017637, 0.017045, 0.016468, 0.015906, 0.015359, 0.014827, 0.014309, 0.013805, 0.013315, 0.01284, 0.012377, 0.011927, 0.01149, 0.011066, 0.010654, 0.010254, 0.0098661, 0.0094893, 0.0091241, 0.00877, 0.0084265, 0.0080938, 0.0077713, 0.0074591, 0.0071565, 0.0068638, 0.0065804, 0.0063063, 0.0060412, 0.0057848, 0.005537, 0.0052977, 0.0050664, 0.0048431, 0.0046273, 0.0044196, 0.004219, 0.0040255, 0.0038388, 0.0036593, 0.003486, 0.0033195, 0.0031592, 0.0030048, 0.0028564, 0.0027137, 0.0025767, 0.0024451, 0.0023187, 0.0021974, 0.0020811, 0.0019696, 0.0018628, 0.0017604, 0.0016625, 0.0015687, 0.0014791, 0.0013935, 0.0013117, 0.0012336, 0.0011591, 0.001088, 0.0010203, 0.00095588, 0.00089452, 0.0008362, 0.00078076, 0.00072811, 0.00067816, 0.00063081, 0.00058595, 0.0005435, 0.00050335, 0.0004654, 0.00042959, 0.00039582, 0.00036401, 0.00033406, 0.00030592, 0.00027951, 0.00025474, 0.00023155, 0.00020986, 0.0001896, 0.00017072, 0.00015315, 0.00013682, 0.00012167, 0.00010766, 9.471e-05, 8.2779e-05, 7.1816e-05, 6.1761e-05, 5.2573e-05, 4.4202e-05, 3.6602e-05, 2.973e-05, 2.3544e-05, 1.8002e-05, 1.3065e-05, 8.6968e-06, 4.8605e-06, 1.5209e-06, 1.3548e-06, 3.7985e-06, 5.8412e-06, 7.5115e-06, 8.8379e-06, 9.8468e-06, 1.0564e-05, 1.1013e-05, 1.1219e-05, 1.1202e-05, 1.0984e-05, 1.0584e-05, 1.0022e-05, 9.3154e-06, 8.481e-06, 7.5353e-06, 6.4929e-06, 5.3683e-06, 4.1749e-06, 2.925e-06, 1.6305e-06, 3.0242e-07, 1.0491e-06, 2.4143e-06, 3.7846e-06, 5.1516e-06, 6.5078e-06, 7.8463e-06, 9.1607e-06, 1.0445e-05, 1.1694e-05, 1.2904e-05, 1.4069e-05, 1.5186e-05, 1.6253e-05, 1.7264e-05, 1.822e-05, 1.9116e-05, 1.9952e-05, 2.0726e-05, 2.1437e-05, 2.2085e-05, 2.2668e-05, 2.3187e-05, 2.3642e-05, 2.4032e-05, 2.436e-05, 2.4625e-05, 2.4828e-05, 2.4971e-05, 2.5055e-05, 2.5081e-05, 2.5051e-05, 2.4966e-05, 2.4829e-05, 2.4642e-05, 2.4406e-05, 2.4124e-05, 2.3798e-05, 2.343e-05, 2.3022e-05, 2.2578e-05, 2.2098e-05, 2.1586e-05, 2.1045e-05, 2.0475e-05, 1.9881e-05, 1.9265e-05, 1.8628e-05, 1.7973e-05, 1.7303e-05, 1.662e-05, 1.5927e-05, 1.5224e-05, 1.4516e-05, 1.3804e-05, 1.309e-05, 1.2376e-05, 1.1664e-05, 1.0956e-05, 1.0255e-05, 9.5606e-06, 8.876e-06, 8.2026e-06, 7.5422e-06, 6.8957e-06, 6.265e-06, 5.6514e-06, 5.0561e-06, 4.48e-06, 3.9244e-06, 3.3905e-06, 2.8791e-06, 2.3909e-06, 1.9268e-06, 1.4875e-06, 1.0735e-06, 6.8548e-07, 3.2373e-07];


    MEPH.signalprocessing.SignalProcessor.BH_SIZE = 1001;
    MEPH.signalprocessing.SignalProcessor.BH_SIZE_BY2 = 501;
    MEPH.signalprocessing.SignalProcessor.MFACTOR = 100;
});