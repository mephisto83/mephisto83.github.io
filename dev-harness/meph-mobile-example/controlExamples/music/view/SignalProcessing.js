MEPH.define('MEPHControls.music.view.SignalProcessing', {
    alias: 'mephcontrols_signalprocessings',
    templates: true,
    extend: 'MEPH.mobile.activity.container.Container',
    mixins: ['MEPH.mobile.mixins.Activity'],
    requires: [
        'MEPH.signalprocessing.SignalProcessor',
        'MEPH.file.Dropbox',
        'MEPH.audio.processor.SoundProcessor',
        'MEPH.audio.Audio',
        'MEPH.util.FileReader',
        'MEPH.audio.view.Visualizer',
        'MEPH.audio.view.VisualSelector'],
    properties: {
        fileResources: null,
        name: null,
        data: null,
        verticalScroll: 0,
        N: 4096,
        Ns: 4096,
        M: 2048,
        H: 1024,
        T: 45,
        state: '',
        startTime: null,
        fs: 44100,
        freqdata: null,
        magdata: null,
        samples: 512,
        phasedata: null
    },
    initialize: function () {
        var me = this;

        me.fileResources = [];
        me.callParent.apply(me, arguments);
        me.on('load', me.onLoaded.bind(me));
    },
    onLoaded: function () {
        var me = this;
        me.name = 'Signal processing';
        var sp = new SignalProcessor();
        me.sp = sp;
    },
    loadFiles: function () {
        var me = this;
        var args = MEPH.util.Array.convert(arguments);
        var evntArgs = args.last();

        var files = args.last();
        me.state = 'Loading files';
        return FileReader.readFileList(files.domEvent.files, { readas: 'ArrayBuffer' }).then(function (res) {
            res.foreach(function (t) {
                me.fileResources.push(t);
            })
            me.state = 'Loaded file(s)';
        }).then(function () {
            var audio = new MEPH.audio.Audio();
            var resource = me.fileResources.last();

            return audio.loadByteArray(resource.res, null, resource.file.name, resource.file.type).then(function (result) {
                resource.buffer = result;
                return resource;
            }).then(function (resource) {

                me.state = 'Processing file';
                me.processAFrame(resource.buffer.buffer.buffer.getChannelData(0));
            })
        }).then(null, function (e) {
            console.log(e);
        }).then(function () {

            me.state = 'Processing file complete';
        })
    },
    loadFilesAnal: function () {
        var me = this;
        var args = MEPH.util.Array.convert(arguments);
        var evntArgs = args.last();

        var files = args.last();
        me.state = 'Loading files';
        return FileReader.readFileList(files.domEvent.files, { readas: 'ArrayBuffer' }).then(function (res) {
            res.foreach(function (t) {
                me.fileResources.push(t);
            })
            me.state = 'Loaded file(s)';
        }).then(function () {
            var audio = new MEPH.audio.Audio();
            var resource = me.fileResources.last();

            return audio.loadByteArray(resource.res, null, resource.file.name, resource.file.type).then(function (result) {
                resource.buffer = result;
                return resource;
            }).then(function (resource) {

                me.state = 'Processing file';
                me.processSound(resource.buffer.buffer.buffer.getChannelData(0));
            })
        }).then(null, function (e) {
            console.log(e);
        }).then(function () {

            me.state = 'Processing file complete';
        })
    },
    processSound: function (signal) {
        var me = this;
        var sampleRate = 44100;
        var startTime = me.startTime || 0;;
        var offset = (startTime * sampleRate);
        var t10 = 44100 * 10 + offset;
        var t12 = 44100 * 14 + offset;
        me.magdata = signal.subset(t10, t12);
        var res = MEPH.audio.processor.SoundProcessor.Process(signal.subset(t10, t12));
        me.freqdata = res;
    },
    play: function (sig) {
        var sampleRate = 44100;

        var len = sig.length;
        var resource = {
            buffer: {
                buffer: {
                    getChannelData: function () {
                        return sig;
                    },
                    sampleRate: sampleRate
                },
                channelCount: 1
            }
        };
        var audio = new MEPH.audio.Audio();

        var audioresult = audio.copyToBuffer(resource, 0, len / sampleRate);

        audio.buffer(audioresult.buffer).complete();

        audio.get({ name: 'buffer' }).first().buffer.start();
        // start the source playing
        audio.playbuffer();
        setTimeout(function () {
            audio.disconnect();
        }, 5000)
    },
    processAFrame: function (signal) {
        var me = this;
        var sampleRate = 44100;
        var len = sampleRate * 2;
        var N = parseFloat(me.N);
        var Ns = parseFloat(me.Ns);
        var M = parseFloat(me.M);
        var H = Math.floor(Ns / 4);
        var startTime = me.startTime || 0;;
        var t = -parseFloat(me.T);
        var fs = sampleRate;
        var w = [].interpolate(0, M, function (x) {
            return MEPH.math.Util.window.Hamming(x, M);
        });
        var offset = (startTime * sampleRate);
        signal = signal ? signal.subset(0 + offset, len + offset) : (new Float32Array(len)).select(function (i, x) {
            return .5 * Math.sin((x / fs) * 2 * 490 * Math.PI) + .5 * Math.sin((x / fs) * 2 * 440 * Math.PI);
        });

        var sp = me.sp;

        var res = sp.dftAnal(signal, w, N);
        me.magdata = res.mX.select(function (x) {
            return Math.abs(x);
        }).subset(0, me.samples);
        me.phasedata = res.pX.select(function (x) { return Math.abs(x); })
            .select(function (x) {
                if (x === 0) {
                    return 2.2204460492503130808472633361816E-16;
                }
                return x;
            })
        .select(function (x) {
            return sp.toDb(x);
        }).select(function (x) {
            return Math.abs(x);
        }).subset(0, me.samples);
        me.freqdata = signal.subset(0, 4000);
    },
    processA: function (signal) {
        var me = this;
        var sampleRate = 44100;
        var len = sampleRate * 2;
        var N = me.N;
        var Ns = me.Ns;
        var M = me.M;
        var H = Math.floor(Ns / 4);
        var t = -me.T;
        var fs = sampleRate;
        var w = [].interpolate(0, M, function (x) {
            return MEPH.math.Util.window.Blackman(x, M);
        });
        var startTime = me.startTime || 0;;
        var offset = (startTime * sampleRate);
        signal = signal ? signal.subset(0 + offset, len + offset) : (new Float32Array(len)).select(function (i, x) {
            return .5 * Math.sin((x / fs) * 2 * 490 * Math.PI) + .5 * Math.sin((x / fs) * 2 * 440 * Math.PI);
        });

        var sp = me.sp;

        var res = sp.sineModelAnal(signal, fs, w, N, H, t);

        var freq = res.tfreq.select(function (x) {
            return x.first() || 0;
        });

        var mag = res.tmag.select(function (x) {
            return x.first() || 0;
        });
        var phase = res.tphase.select(function (x) {
            return x.first() || 0;
        });
        me.freqdata = freq;
        me.magdata = mag;
        me.phasedata = phase;
    }
});