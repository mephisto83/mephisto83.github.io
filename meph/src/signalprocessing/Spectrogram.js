/**
 * @class MEPH.signalprocessing.Spectrogram
 * @extends MEPH.control.Control
 * A spectrogram is a visual representation of the spectrum of frequencies in a sound or other signal as 
 * they vary with time or some other variable. Spectrograms are sometimes called spectral waterfalls, voiceprints, or voicegrams.
 * Spectrograms can be used to identify spoken words phonetically, and to analyse the various calls of animals. 
 * They are used extensively in the development of the fields of music, sonar, radar, and speech processing,[1] seismology, etc.
 **/
MEPH.define('MEPH.signalprocessing.Spectrogram', {
    alias: 'spectrogram',
    templates: true,
    requires: ['MEPH.signalprocessing.SignalProcessor',
        'MEPH.math.FFT',
        'MEPH.util.Style',
        'MEPH.math.Util',
        'MEPH.util.Vector',
        'MEPH.util.Renderer'],
    extend: 'MEPH.control.Control',
    statics: {
    },
    properties: {
        window: null,
        source: null,
        step: 256,
        autoprocess: false,
        data: null,
        processor: null
    },
    initialize: function () {
        var me = this;
        me.callParent.apply(me, arguments);
        me.renderer = new MEPH.util.Renderer();
        me.on('altered', function (type, args) {
            var rowheaders = parseFloat(me.rowheaders);
            var cols = parseFloat(me.columns);
            var rows = parseFloat(me.rows);
            var colheaders = parseFloat(me.columnheaders);
            if (args.property === "data") {
                if (me.autoprocess) {
                    var source = me.process(me.data);
                }
                if (me.loaded)
                    me.render(source);
            }
        })
    },

    getprocessor: function () {
        var me = this;
        me.processor = me.processor || new MEPH.signalprocessing.SignalProcessor(true);
        return me.processor;
    },
    /**
     * Process the signal into a spectrum.
     * @param {Array} signal
     **/
    process: function (signal) {
        var me = this;

        var c = [].interpolate(0, Math.floor(signal.length / me.step), function (t) {
            return me.getprocessor().fft(signal.subset(t * me.step, (t + 1) * me.step))
        }).select(function (x) {
            return x.skipEvery(2, function (t) { return t; })
        });
        var res = new Float32Array(signal.length);
        c.foreach(function (t, i) {
            t.foreach(function (x, j) {
                res[i * me.step + j] = x;
            });
        })
        var max = res.max(function (x) {
            return x;
        });
        var min = res.min(function (x) {
            return x;
        });

        return {
            res: res,
            max: max,
            min: min
        };
    },
    positionCanvas: function (canvas, width, height) {
        Style.width(canvas, width);
        Style.height(canvas, height);
    },
    convertSourceToRGB: function (source) {
        var me = this,
            source = source.res;
        source = source.select(function (t) { return Math.pow(t, 1); });
        var max = source.max(function (x) {
            return x;
        });
        var min = source.min(function (x) {
            return x;
        });
        return source.select(function (t) {
            return ((t - min) / max) * 255;
        });
    },
    /**
     * Renders a spectrogram
     * @param {Array} source 
     **/
    render: function (source) {
        var me = this;

        if (me.animFrame !== null) {
            cancelAnimationFrame(me.animFrame);
        }
        me.animFrame = requestAnimationFrame(function () {
            var rows,
                columns,
                headers;

            me.animFrame = null;

            if (!me.rendered) {
                me.renderer.setCanvas(me.canvas);
            }

            me.renderer.clear();
            var res = me.convertSourceToRGB(source);
            var ctx = me.renderer.getContext();
            var imgData = ctx.createImageData(Math.floor(res.length / me.step), me.step);
            var i;

            for (i = 0; i < imgData.data.length; i = i + 4) {
                //     var val = parseFloat((res[i] || 0).toString());
                imgData.data[i] = res[i];
                imgData.data[i + 1] = res[i + 1];
                imgData.data[i + 2] = 155;
                imgData.data[i + 3] = 255;

            }

            //for (var i = 0; i < imgData.data.length; i++) {
            //    //   imgData.data[i] = Math.round(255 * Math.random());
            //}

            var canvasheight = me.body.clientHeight;
            var canvaswidth = me.body.clientWidth;

            me.positionCanvas(me.canvas, canvaswidth, canvasheight);
            me.renderer.draw({
                simple: true,
                shape: MEPH.util.Renderer.shapes.canvas,
                canvas: imgData
            })
        });
    }
})