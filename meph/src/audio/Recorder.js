// Base on
//https://raw.githubusercontent.com/mattdiamond/Recorderjs/master/recorderWorker.js

MEPH.define('MEPH.audio.Recorder', {
    requires: ['MEPH.query.QueryableWorker', 'MEPH.audio.Constants'],
    properties: {
        recBuffersL: null,
        recBuffersR: null,
        sampleRate: null
    },
    initialize: function () {
        var me = this;
        MEPH.subscribe(MEPH.audio.Constants.REQUEST_RECORDING, function (type, resource) {
            me.requestRecording(resource);
        });

    },
    setup: function (config) {
        var me = this;
        me.sampleRate = config.sampleRate;
        return me;
    },
    requestRecording: function (resource) {
        //var recorder = new MEPH.audio.Recorder();
        //recorder.setup({
        //    sampleRate: resource.buffer.buffer.sampleRate
        //}).clear();

        //var res = recorder.record([resource.buffer.buffer.getChannelData(0), resource.buffer.buffer.getChannelData(1)])
        //.exportWAV('audio/wav');
        if (!resource || !resource.buffer || !resource.buffer.buffer)
            return;
        var audio = new MEPH.audio.Audio();
        var newSource = audio.createContext().createBufferSource();
        newSource.buffer = resource.buffer.buffer;
        
        var path = MEPH.getClassPath('MEPH.audio.RecorderWorker') + '.js';
        var recorder = new _Recorder(newSource, { workerPath: path });
        recorder.recordBuffer([resource.buffer.buffer.getChannelData(0), resource.buffer.buffer.getChannelData(1)]);
        recorder.exportWAV(function (res) {
            MEPH.publish(MEPH.audio.Constants.RECORDING_COMPLETE, res);
        });

    },
    record: function (inputBuffer) {
        var me = this;

        me.recBuffersL.push(inputBuffer[0]);
        me.recBuffersR.push(inputBuffer[1]);
        me.recLength += inputBuffer[0].length;
        return me;
    },

    exportWAV: function (type) {
        var me = this;
        var bufferL = me.mergeBuffers(me.recBuffersL, me.recLength);
        var bufferR = me.mergeBuffers(me.recBuffersR, me.recLength);
        var interleaved = me.interleave(bufferL, bufferR);
        var dataview = me.encodeWAV(interleaved);
        var audioBlob = new Blob([dataview], { type: type });

        return (audioBlob);

    },

    getBuffer: function () {
        var buffers = [];
        var me = this;
        buffers.push(me.mergeBuffers(me.recBuffersL, me.recLength));
        buffers.push(me.mergeBuffers(me.recBuffersR, me.recLength));
    },

    clear: function () {
        var me = this;
        me.recLength = 0;
        me.recBuffersL = [];
        me.recBuffersR = [];
        return me;
    },

    mergeBuffers: function (recBuffers, recLength) {
        var result = new Float32Array(recLength);
        var offset = 0;
        for (var i = 0; i < recBuffers.length; i++) {
            result.set(recBuffers[i], offset);
            offset += recBuffers[i].length;
        }
        return result;
    },

    interleave: function (inputL, inputR) {
        var length = inputL.length + inputR.length;
        var result = new Float32Array(length);

        var index = 0,
          inputIndex = 0;

        while (index < length) {
            result[index++] = inputL[inputIndex];
            result[index++] = inputR[inputIndex];
            inputIndex++;
        }
        return result;
    },

    floatTo16BitPCM: function (output, offset, input) {
        for (var i = 0; i < input.length; i++, offset += 2) {
            var s = Math.max(-1, Math.min(1, input[i]));
            output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
        }
    },

    writeString: function (view, offset, string) {
        for (var i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    },

    encodeWAV: function (samples) {
        var buffer = new ArrayBuffer(44 + samples.length * 2);
        var view = new DataView(buffer);
        var me = this;
        /* RIFF identifier */
        me.writeString(view, 0, 'RIFF');
        /* RIFF chunk length */
        view.setUint32(4, 36 + samples.length * 2, true);
        /* RIFF type */
        me.writeString(view, 8, 'WAVE');
        /* format chunk identifier */
        me.writeString(view, 12, 'fmt ');
        /* format chunk length */
        view.setUint32(16, 16, true);
        /* sample format (raw) */
        view.setUint16(20, 1, true);
        /* channel count */
        view.setUint16(22, 2, true);
        /* sample rate */
        view.setUint32(24, me.sampleRate, true);
        /* byte rate (sample rate * block align) */
        view.setUint32(28, me.sampleRate * 4, true);
        /* block align (channel count * bytes per sample) */
        view.setUint16(32, 4, true);
        /* bits per sample */
        view.setUint16(34, 16, true);
        /* data chunk identifier */
        me.writeString(view, 36, 'data');
        /* data chunk length */
        view.setUint32(40, samples.length * 2, true);

        me.floatTo16BitPCM(view, 44, samples);

        return view;
    }
}).then(function () {
    (function (window) {

        var WORKER_PATH = 'recorderWorker.js';

        var Recorder = function (source, cfg) {
            var config = cfg || {};
            var bufferLen = config.bufferLen || 4096;
            this.context = source.context;
            this.node = (this.context.createScriptProcessor ||
                         this.context.createJavaScriptNode).call(this.context,
                                                                 bufferLen, 2, 2);
            var worker = new Worker(config.workerPath || WORKER_PATH);
            worker.postMessage({
                command: 'init',
                config: {
                    sampleRate: this.context.sampleRate
                }
            });
            var recording = false,
              currCallback;

            this.node.onaudioprocess = function (e) {
                if (!recording) return;
                worker.postMessage({
                    command: 'record',
                    buffer: [
                      e.inputBuffer.getChannelData(0),
                      e.inputBuffer.getChannelData(1)
                    ]
                });
            }
            this.recordBuffer = function (e) {
                worker.postMessage({
                    command: 'record',
                    buffer: [
                      e[0],
                      e[1]
                    ]
                });
            }
            this.configure = function (cfg) {
                for (var prop in cfg) {
                    if (cfg.hasOwnProperty(prop)) {
                        config[prop] = cfg[prop];
                    }
                }
            }

            this.record = function () {
                recording = true;
            }

            this.stop = function () {
                recording = false;
            }

            this.clear = function () {
                worker.postMessage({ command: 'clear' });
            }

            this.getBuffer = function (cb) {
                currCallback = cb || config.callback;
                worker.postMessage({ command: 'getBuffer' })
            }

            this.exportWAV = function (cb, type) {
                currCallback = cb || config.callback;
                type = type || config.type || 'audio/wav';
                if (!currCallback) throw new Error('Callback not set');
                worker.postMessage({
                    command: 'exportWAV',
                    type: type
                });
            }

            worker.onmessage = function (e) {
                var blob = e.data;
                currCallback(blob);
            }

            source.connect(this.node);
            this.node.connect(this.context.destination);    //this should not be necessary
        };

        Recorder.forceDownload = function (blob, filename) {
            var url = (window.URL || window.webkitURL).createObjectURL(blob);
            var link = window.document.createElement('a');
            link.href = url;
            link.download = filename || 'output.wav';
            var click = document.createEvent("Event");
            click.initEvent("click", true, true);
            link.dispatchEvent(click);
        }

        window._Recorder = Recorder;

    })(window);
})