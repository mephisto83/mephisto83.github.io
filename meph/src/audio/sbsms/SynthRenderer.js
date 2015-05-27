/**
 * @class MEPH.audio.sbsms.SMS
 **/
MEPH.define('MEPH.audio.sbsms.SynthRenderer', {
    statics: {
    },
    alternateNames: ['SBSMSRenderer', 'SampleBufBase'],
    properties: {
        //        int channels;
        channels: 0,
        //float *synthBuf[2];
        synthBuf: null,
        //int synthBufLength[2];
        synthBufLength: null,
        //ArrayRingBuffer<float> *sines[2];
        sines: null,
        time: null,
        //TimeType time[2];
        n: null,
        //int n[2];

    },
    //int channels, int h
    initialize: function (channels, h) {
        var me = this;
        me.synthBuf = [].interpolate(0, 2, function () { return 0; });
        me.synthBufLength = [].interpolate(0, 2, function () { return 0; });
        me.sines = [].interpolate(0, 2, function () { return 0; });
        me.time = [].interpolate(0, 2, function () { return 0; });;
        me.n = [].interpolate(0, 2, function () { return 0; });;
        var me = this;
        this.channels = channels;
        for (var c = 0; c < channels; c++) {
            me.sines[c] = [];//new ArrayRingBuffer<float>(0);
            me.synthBufLength[c] = h << 4;
            me.synthBuf[c] = [].zeroes(me.synthBufLength[c]);// (float*)malloc(synthBufLength[c]*sizeof(float));
        }
        //#ifdef MULTITHREADED
        //pthread_mutex_init(&bufferMutex,NULL);
        //#endif
    },

    destroy: function () {
        var me = this;
        var channels = me.channels;

        for (var c = 0; c < channels; c++) {
            delete me.sines[c];
            //free(synthBuf[c]);
        }
    },
    //int c, const TimeType &time, int n
    startTime: function (c, time, n) {
        var me = this;
        if (n > me.synthBufLength[c]) {
            //free(me.synthBuf[c]);
            me.synthBufLength[c] = n << 1;
            me.synthBuf[c] = [].zeros(synthBufLength[c]);// (float*)malloc(synthBufLength[c]*sizeof(float));
        }
        this.n[c] = n;
        this.time[c] = time;
        me.synthBuf[c] = [].zeroes(n);//memset(synthBuf[c],0,n*sizeof(float));
    },
    //void SynthRenderer :: //int c, SBSMSTrack *t
    render: function (c, t) {
        var me = this;
        t.synth(me.synthBuf[c], me.time[c], me.n[c], synthModeOutput, c);
    },
    //void SynthRenderer :: 
    //int c
    endTime: function (c) {
        var me = this;
        //#ifdef MULTITHREADED
        //    pthread_mutex_lock(&bufferMutex);
        //#endif
        var n = Math.floor(this.n[c]);
        me.sines[c].grow(n);
        var j = Math.floor(me.sines[c].writePos);
        var dest = me.sines[c].buf;
        var src = me.synthBuf[c];
        for (var k = 0; k < n; k++) {
            dest[j++] += me.src[k];
        }
        me.sines[c].writePos += n;
        //#ifdef MULTITHREADED
        //    pthread_mutex_unlock(&bufferMutex);
        //#endif
    },
    //long SynthRenderer :: //audio *out, long n
    read: function (out, n) {
        //        #ifdef MULTITHREADED
        //    pthread_mutex_lock(&bufferMutex);
        //#endif
        var me = this;
        n = Math.min(n, me.sines[0].nReadable());
        for (var c = 1; c < me.channels; c++) {
            n = Math.min(n, me.sines[c].nReadable());
        }
        for (var c = 0; c < me.channels; c++) {
            var buf = me.sines[c].getReadBuf();
            for (var k = 0; k < n; k++) {
                out[k][c] = buf[k];
            }
            me.sines[c].advance(n);
        }
        //#ifdef MULTITHREADED
        //pthread_mutex_unlock(&bufferMutex);
        //#endif
        return n;
    }


})