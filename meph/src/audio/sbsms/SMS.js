/**
 * @class MEPH.audio.sbsms.SMS
 **/
MEPH.define('MEPH.audio.sbsms.SMS', {
    statics: {
    },
    requires: ['MEPH.audio.sbsms.Util'],
    properties: {
        //        list<TrackPoint*> ended[2];
        ended: null,
        //list<TrackPoint*> started[2];
        started: null,
        //int minTrackSize;
        minTrackSize: 0,
        //int peakWidth0;
        peakWidth0: 0,
        //int peakWidth1;
        peakWidth1: 0,
        //int peakWidth2;
        peakWidth2: 0,
        //int minCutSep1;
        minCutSep1: 0,
        //int minCutSep2;
        minCutSep2: 0,
        //int minK;
        minK: 0,
        //int maxK;
        maxK: 0,
        //float peakThresh;
        peakThresh: 0,
        //float maxCost2;
        maxCost2: 0,
        //float maxDF;
        maxDF: 0,
        //float dMCoeff2;
        dMCoeff2: 0,
        //float dNCoeff2;
        dNCoeff2: 0,
        //float maxDFSplitMerge;
        maxDFSplitMerge: 0,
        //float maxCost2SplitMerge;
        maxCost2SplitMerge: 0,
        //float dMCoeff2SplitMerge;
        dMCoeff2SplitMerge: 0,
        //float maxCost2Match;
        maxCost2Match: 0,
        //float maxDFMatch;
        maxDFMatch: 0,
        //float dMCoeff2Match;
        dMCoeff2Match: 0,
        //float maxCost2Stereo;
        maxCost2Stereo: 0,
        //float maxDFStereo;
        maxDFStereo: 0,
        //float dMCoeff2Stereo;
        dMCoeff2Stereo: 0,
        //float maxFMatchM;
        maxFMatchM: 0,
        //float minFMatchL;
        minFMatchL: 0,
        //float minFLo;
        minFLo: 0,
        //float maxFHi;
        maxFHi: 0,
        //float minFMid;
        minFMid: 0,
        //float maxFMid;
        maxFMid: 0,
        //int kStart;
        kStart: 0,
        //int kEnd;
        kEnd: 0,
        //int kLo;
        kLo: 0,
        //int kHi;
        kHi: 0,
        //float mNorm;
        mNorm: 0,
        //float localFavorRatio;
        localFavorRatio: 0,
        //queue<Slice*> adjust2SliceQueue[2];
        adjust2SliceQueue: null,
        //queue<Slice*> adjust1SliceQueue[2];
        adjust1SliceQueue: null,
        //RingBuffer<Slice*> sliceBuffer[2];
        sliceBuffer: null,
        //Slice* sliceM0[2];
        sliceM0: null,
        //Slice* sliceL0[2];
        sliceL0: null,
        //Slice* sliceH0[2];
        sliceH0: null,
        //Slice* sliceM1[2];
        sliceM1: null,
        //Slice* sliceL1[2];
        sliceL1: null,
        //Slice* sliceM2[2];
        sliceM2: null,
        //Slice* sliceH1[2];
        sliceH1: null,
        //audio* x10[2];
        x10: null,
        //audio* x11[2];
        x11: null,
        //float* dmag1[2];
        dmag1: null,
        //float* mag11[2];
        mag11: null,
        //audio* x00[2];
        x00: null,
        //audio* x01[2];
        x01: null,
        //float* dmag0[2];
        dmag0: null,
        //float* mag01[2];
        mag01: null,
        //float *mag2[2];
        mag2: null,
        //audio* x2[2];
        x2: null,
        //float* dec2[2];
        dec2: null,
        //float *peak20;
        peak20: null,
        //float *peak2N;
        peak2N: null,
        //int N;
        N: 0,
        //int Nover2;
        Nover2: 0,
        //SMS *lo;
        lo: null,
        //SMS *hi;
        hi: null,
        //queue<TrackIndexType> trackIndex[2];
        trackIndex: null,
        //queue<float*> mag1Queue[2];
        mag1Queue: null,
        //queue<float*> mag0Queue[2];
        mag0Queue: null,
        //float *trial2Buf[2];
        trial2Buf: null,
        //ArrayRingBuffer<float> *trial2RingBuf[2];
        trial2RingBuf: null,
        //GrainBuf *trial2GrainBuf;
        trial2GrainBuf: null,
        //float *trial1Buf[2];
        trial1Buf: null,
        //ArrayRingBuffer<float> *trial1RingBuf[2];
        trial1RingBuf: null,
        //GrainBuf *trial1GrainBuf;
        trial1GrainBuf: null,
        //list<Track*> assignTracks[2];
        assignTracks: null,
        //list<Track*> renderTracks[2];
        renderTracks: null,
        //TimeType addtime[2];
        addtime: null,
        //TimeType assigntime[2];
        assigntime: null,
        //TimeType trial2time[2];
        trial2time: null,
        //TimeType adjust2time;
        adjust2time: null,
        //TimeType trial1time[2];
        trial1time: null,
        //TimeType adjust1time;
        adjust1time: null,
        //TimeType synthtime[2];
        synthtime: null,
        //queue<int> nRender[2];
        nRender: null,
        //double h2cum;
        h2cum: 0,
        //int channels;
        channels: 0,
        //long res;
        res: null,
        //long resMask;
        resMask: 0,
        //int h;
        h: 0,
        //float M;
        M: 0,
        //double h1;
        h1: 0,
        //int band;  
        band: 0,
        //#ifdef MULTITHREADED
        //pthread_mutex_t sliceMutex[2];
        //pthread_mutex_t magMutex[2];
        //pthread_mutex_t renderMutex[2];
        //pthread_mutex_t trial2Mutex[2];
        //pthread_mutex_t trial1Mutex[2];
        //pthread_mutex_t trackMutex[2];
        //#endif
        //bool bAssignDone[2];
        bAssignDone: null
    },
    //SMS *lo, int N, int band, int bandMax, int h, int res, int N0, int N1, int N2, int channels, audio *peak2
    initialize: function (lo, N, band, bandMax, h, res, N0, N1, N2, channels, peak2) {
        var me = this;
        var U = MEPH.audio.sbsms.Util;
        this.lo = lo;
        if (lo) lo.hi = this;
        this.hi = null;
        this.band = band;
        this.h = h;
        this.h1 = (h << band);
        this.res = res;
        this.resMask = res - 1;
        this.channels = channels;
        this.N = N;
        this.Nover2 = N / 2;
        var pad2 = N / N2;
        var pad1 = N / N1;
        var pad0 = N / N0;
        me.M = (1 << band);
        var M = me.M;
        me.peakThresh = 1e-8;

        var maxDF2 = U.square(0.005 * h) / M;
        me.maxDF = Math.sqrt(maxDF2);
        var maxDF = me.maxDF;
        me.maxCost2 = 0.5 * maxDF2;
        me.dMCoeff2 = 0.002 * maxDF2;

        var maxDF2SplitMerge = Math.square(0.001 * h) / M;
        me.maxDFSplitMerge = Math.sqrt(maxDF2SplitMerge);
        me.maxCost2SplitMerge = 1.0 * maxDF2SplitMerge;
        me.dMCoeff2SplitMerge = 0.006 * maxDF2SplitMerge;

        me.maxDFMatch = .06 / M;
        var maxDFMatch = me.maxDFMatch;
        var maxDF2Match = Math.square(me.maxDFMatch);
        me.dMCoeff2Match = 0.0075 * maxDF2Match;
        me.maxCost2Match = 0.8 * maxDF2Match;

        me.maxDFStereo = .04 / M;
        var maxDF2Stereo = Math.square(me.maxDFStereo);
        me.dMCoeff2Stereo = 0.005 * maxDF2Stereo;
        me.maxCost2Stereo = 1.0 * maxDF2Stereo;

        me.peakWidth0 = lrintf(pad0 * N * 0.0055) + 1;
        var peakWidth0 = me.peakWidth0;
        me.peakWidth1 = lrintf(pad1 * N * 0.0055) + 1;
        me.peakWidth2 = lrintf(pad2 * N * 0.0055) + 1;
        me.minTrackSize = Math.Math.max(384 / (h << band), N2 / h / 2);
        me.minCutSep2 = Math.max(lrintf(0.008 * N), me.peakWidth1);
        me.minCutSep1 = Math.max(lrintf(0.011 * N), me.peakWidth0);
        if (band == bandMax) {
            me.kLo = 1;
        }
        else {
            me.kLo = Math.max(1, lrintf(floor(0.5 * N / lo.N * lo.kHi - maxDFMatch * M / U.TWOPI * N)));
        }
        var kLo = me.kLo;
        if (band == 0) {
            me.kHi = Nover2;
        }
        else {
            me.kHi = Math.max(1, lrintf(0.4785 * N) - peakWidth0 * 2);
        }
        var kHi = me.kHi;
        me.kStart = Math.max(1, kLo - peakWidth0);
        me.kEnd = min(Nover2 - 1, kHi + peakWidth0 * 2);
        var kEnd = me.kEnd;
        var kNorm = U.TWOPI / (M * N);
        me.maxFHi = kHi * kNorm + maxDF;
        me.minFLo = kLo * kNorm - maxDF;
        if (lo) {
            me.maxFMatchM = lo.kHi * U.TWOPI / (lo.N * M * 2) + maxDFMatch;
        }
        else {
            me.maxFMatchM = 0.0;
        }
        var maxFMatchM = me.maxFMatchM;
        me.minFMatchL = kLo * kNorm - maxDFMatch;
        var minFMatchL = me.minFMatchL;
        if (lo) {
            me.maxFMid = lo.kHi * U.TWOPI / (lo.N * M * 2) + maxDF;
        }
        else {
            me.maxFMid = 0.0;
        }
        var maxFMid = me.maxFMid;
        if (lo) {
            lo.minFMid = kLo * kNorm - lo.maxDF;
        }
        if (lo && lo.lo) {
            me.minK = Math.max(1, (lrintf(0.25 * N / lo.lo.N * lo.lo.kHi + peakWidth0)));
        } else {
            me.minK = 1;
        }
        var minK = me.minK;
        me.maxK = Math.min(kEnd, kHi + peakWidth0);
        me.localFavorRatio = 1.1;
        me.mNorm = MScale * MScale * 16.061113032124002 * pad2 / U.square(N);
        //    for(var c=0; c<me.channels; c++) {
        me.bAssignDone = [].interpolate(0, me.channels, function () { return false; });
        me.addtime = [].interpolate(0, me.channels, function () { return 0; });
        me.assigntime = [].interpolate(0, me.channels, function () { return 0; });
        me.trial2time = [].interpolate(0, me.channels, function () { return 0; });
        me.trial1time = [].interpolate(0, me.channels, function () { return 0; });
        me.synthtime = [].interpolate(0, me.channels, function () { return 0; });
        //for(int k=1; k<256; k++) {
        //    trackIndex[c].push(k);
        //}
        me.trackIndex = [].interpolate(0, me.channels, function () {
            return [].interpolate(0, 256);
        });
        me.trial2Buf = [].interpolate(0, me.channels, function () {
            return [].interpolate(0, h * res, function () { return 0; });
        });//[c] = (float*)malloc(h*res*sizeof);
        me.trial2RingBuf = [].interpolate(0, me.channels, function () {
            return [];
        });//[c] = new ArrayRingBuffer<float>(0);
        me.dmag1 = [].interpolate(0, me.channels, function () {
            return [].zeroes(N);
        });// = (float*)malloc(N*sizeof);
        me.mag11 = [].interpolate(0, me.channels, function () {
            return [].zeroes(Nover2 + 1);
        });///[c] = (float*)malloc((Nover2+1)*sizeof);
        me.x10 = [].interpolate(0, me.channels, function () {
            return [].zeroes(N);
        });//[c] = (audio*)malloc(N*sizeof(audio));
        me.x11 = [].interpolate(0, me.channels, function () {
            return [].zeroes(N);
        });//[c] = (audio*)malloc(N*sizeof(audio));
        me.trial1Buf = [].interpolate(0, me.channels, function () {
            return [].zeroes(h * res);
        });//[c] = (float*)malloc(h*res*sizeof);
        me.trial1RingBuf = [].interpolate(0, me.channels, function () {
            return [];
        });//[c] = new ArrayRingBuffer<float>(0);
        me.dmag0 = [].interpolate(0, me.channels, function () {
            return [].zeroes(N);
        });//[c] = (float*)malloc(N*sizeof);
        me.mag01 = [].interpolate(0, me.channels, function () {
            return [].zeroes(Nover2 + 1);
        });//[c] = (float*)malloc((Nover2+1)*sizeof);
        me.x00 = [].interpolate(0, me.channels, function () {
            return [].zeroes(N);
        });//[c] = (audio*)malloc(N*sizeof(audio));
        me.x01 = [].interpolate(0, me.channels, function () {
            return [].zeroes(N);
        });//[c] = (audio*)malloc(N*sizeof(audio));
        me.mag2 = [].interpolate(0, me.channels, function () {
            return [].zeroes(Nover2 + 1);
        });//[c] = (float*)malloc((Nover2+1)*sizeof);
        me.dec2 = [].interpolate(0, me.channels, function () {
            return [].zeroes(N);
        });//[c] = (float*)malloc(N*sizeof);
        me.x2 = [].interpolate(0, me.channels, function () {
            return [].zeroes(N);
        });//[c] = (audio*)malloc(N*sizeof(audio));
        //#ifdef MULTITHREADED
        //      pthread_mutex_init(&renderMutex[c],null);
        //      pthread_mutex_init(&trackMutex[c],null);
        //      pthread_mutex_init(&sliceMutex[c],null);
        //      pthread_mutex_init(&trial2Mutex[c],null);
        //      pthread_mutex_init(&trial1Mutex[c],null);
        //      pthread_mutex_init(&magMutex[c],null);
        //#endif
        //  }
        me.h2cum = 0.0;
        me.adjust2time = 0;
        me.adjust1time = 0;
        me.trial2GrainBuf = new GrainBuf(N, h, N1, hannpoisson);
        me.trial1GrainBuf = new GrainBuf(N, h, N0, hannpoisson);
        me.peak20 = [].interpolate(0, me.channels, function () {
            return [].zeroes(2 * N);
        });// = (float*)calloc(2*N,sizeof);
        me.peak2N = [].zeros(2 * N);
        for (var k = -Nover2; k <= Nover2; k++) {
            peak2N[k + Nover2] = U.norm2(peak2[(k + N) % N]);
        }
    },

    destroy: function () {
    },

    //int c
    trial2Start: function (c) {
        var me = this;
        if (me.band >= minTrial2Band) {
            memset(trial2Buf[c], 0, me.h * me.res);
        }
    },
    //void SMS :: //int c
    trial2End: function (c) {
        var me = this;
        if (me.band < minTrial2Band) return;
        //#ifdef MULTITHREADED
        //        pthread_mutex_lock(&trial2Mutex[c]);
        //#endif
        me.trial2RingBuf[c].write(trial2Buf[c], me.h * me.res);
        //#ifdef MULTITHREADED
        //        pthread_mutex_unlock(&trial2Mutex[c]);
        //#endif
    },
    //void SMS :: //int c
    trial2: function (c) {
        //#ifdef MULTITHREADED
        //    pthread_mutex_lock(&trackMutex[c]);
        //#endif
        //for(list<Track*>::iterator tt = renderTracks[c].begin(); 
        //    tt != renderTracks[c].end();
        //++tt) {
        var stop = false;
        var trial2time = me.trial2time;
        var renderTracks = me.renderTracks;
        [].interpolate(renderTracks[c].begin(), renderTracks[c].end(), function (tt) {
            if (!stop) {
                var t = (tt);
                if (trial2time[c] >= t.start) {
                    if (trial2time[c] > t.last) {
                    }
                    else {
                        t.updateM(trial2time[c], synthModeTrial2);
                        if (hi && hi.band >= minTrial2Band) {
                            var f = 0.5 * M;
                            t.updateFPH(trial2time[c], synthModeTrial2, h << 1, f, f);
                            t.synth(hi.trial2Buf[c], trial2time[c], h << 1, synthModeTrial2, c);
                        }
                        if (lo && lo.band >= minTrial2Band) {
                            var f = 2.0 * M;
                            t.updateFPH(trial2time[c], synthModeTrial2, h >> 1, f, f);
                            t.synth(lo.trial2Buf[c] + (trial2time[c] & (res * lo.res - 1)) * (h >> 1), trial2time[c], h >> 1, synthModeTrial2, c);
                        }
                        if (band >= minTrial2Band) {
                            var f = M;
                            t.updateFPH(trial2time[c], synthModeTrial2, h, f, f);
                        }
                    }
                } else {
                    stop = true;
                }
            }
        });
        //#ifdef MULTITHREADED
        //        pthread_mutex_unlock(&trackMutex[c]);
        //#endif
        trial2time[c]++;
    },

    //void SMS :: //int c
    trial1Start: function (c) {
        var me = this;
        if (me.band >= minTrial1Band) {
            memset(me.trial1Buf[c], 0, me.h * me.res);
        }
    },
    //int c
    trial1End: function (c) {
        var me = this;
        if (me.band < minTrial1Band) return;
        //#ifdef MULTITHREADED
        //    pthread_mutex_lock(&trial1Mutex[c]);
        //#endif
        me.trial1RingBuf[c].write(trial1Buf[c], me.h * me.res);
        //#ifdef MULTITHREADED
        //    pthread_mutex_unlock(&trial1Mutex[c]);
        //#endif
    },
    //    void SMS ::     int c
    trial1: function (c) {
        //#ifdef MULTITHREADED
        //    pthread_mutex_lock(&trackMutex[c]);
        //#endif
        //for(list<Track*>::iterator tt = renderTracks[c].begin(); 
        //    tt != renderTracks[c].end();
        //++tt) {
        var me = this;
        var trial1time = me.trial1time;
        var M = me.M
        var stop = false;
        var h = me.h;
        var hi = me.hi;
        var lo = me.lo;
        var renderTracks = me.renderTracks;
        var resMask = me.resMask;
        var res = me.res;
        [].interpolate(renderTracks[c].begin(), renderTracks[c].end(), function (tt) {
            var t = (tt);//Track *
            if (stop) return;
            if (trial1time[c] >= t.start) {
                if (trial1time[c] > t.last) {
                }
                else {
                    t.updateM(trial1time[c], synthModeTrial1);
                    if (hi && hi.band >= minTrial1Band) {
                        var f = 0.5 * M;
                        t.updateFPH(trial1time[c], synthModeTrial1, h << 1, f, f);
                        t.synth(hi.trial1Buf[c], trial1time[c], h << 1, synthModeTrial1, c);
                    }
                    if (lo && lo.band >= minTrial1Band) {
                        var f = 2.0 * M;
                        t.updateFPH(trial1time[c], synthModeTrial1, h >> 1, f, f);
                        t.synth(lo.trial1Buf[c] + (trial1time[c] & (res * lo.res - 1)) * (h >> 1), trial1time[c], h >> 1, synthModeTrial1, c);
                    }
                    if (band >= minTrial1Band) {
                        var f = M;
                        t.updateFPH(trial1time[c], synthModeTrial1, h, f, f);
                        t.synth(trial1Buf[c] + (trial1time[c] & resMask) * h, trial1time[c], h, synthModeTrial1, c);
                    }
                }
            } else {
                stop = true;
            }
        });
        //#ifdef MULTITHREADED
        //    pthread_mutex_unlock(&trackMutex[c]);
        //#endif
        trial1time[c]++;
    },
    //void SMS :: 
    adjust2: function () {
        var me = this;
        var slice = [].zeros(2);//Slice* 
        for (var c = 0; c < me.channels; c++) {
            //#ifdef MULTITHREADED
            //      pthread_mutex_lock(&sliceMutex[c]);
            //#endif
            slice[c] = adjust2SliceQueue[c].front(); adjust2SliceQueue[c].pop();
            //#ifdef MULTITHREADED
            //      pthread_mutex_unlock(&sliceMutex[c]);
            //#endif
        }
        if (band >= minTrial2Band) {
            //#ifdef MULTITHREADED
            //    for(int c=0; c<channels; c++) {
            //        pthread_mutex_lock(&trial2Mutex[c]);
            //    }
            //#endif
            me.adjustInit(me.trial2RingBuf, me.trial2GrainBuf);
            //#ifdef MULTITHREADED
            //    for(int c=channels-1; c>=0; c--) {
            //        pthread_mutex_unlock(&trial2Mutex[c]);
            //    }
            //#endif
            me.adjust(me.trial2GrainBuf, me.mag1Queue, me.minCutSep1, me.mag11, me.dmag1,
                me.x11, me.adjust2time, slice);
        }
        if (me.channels == 2) {
            for (var c = 0; c < 2; c++) {
                //for(TrackPoint *pc = slice[c].bottom;
                //    pc;
                //    pc = pc.pn) {
                //    pc.bOwned = false;
                //    pc.cont = null;
                //}
                var pc = slice[c].bottom;
                while (pc) {
                    pc.bOwned = false;
                    pc.cont = null;
                    pc = pc.pn;
                }

            }
            for (var c = 0; c < 2; c++) {
                var c2 = (c == 0 ? 1 : 0);
                var begin = slice[c2].bottom;
                var pc = slice[c].bottom;
                while (pc) {
                    var F;
                    pc.cont = me.nearestForward(begin, pc, F, me.maxCost2Stereo, me.maxDFStereo, me.dMCoeff2Stereo);
                    pc = pc.pn
                }
            }
            //TrackPoint *p0 = slice[0].bottom;
            var p0 = slice[0].bottom;
            while (p0) {
                var p1 = p0.cont;//TrackPoint *
                if (p1 && p1.cont === p0) {
                    p0.dupStereo = p1;
                    p1.dupStereo = p0;
                }
                p0 = p0.pn
            }
        }
        me.adjust2time++;
    },
    //void SMS :: //float stretch, float pitch0, float pitch1
    adjust1: function (stretch, pitch0, pitch1) {
        var me = this;
        var U = MEPH.audio.sbsms.Util;
        var slice = [].zeros(2);// Slice* [2];
        for (var c = 0; c < me.channels; c++) {
            //#ifdef MULTITHREADED
            //    pthread_mutex_lock(&sliceMutex[c]);
            //#endif
            slice[c] = me.adjust1SliceQueue[c].front();
            me.adjust1SliceQueue[c].pop();
            //#ifdef MULTITHREADED
            //    pthread_mutex_unlock(&sliceMutex[c]);
            //#endif
        }
        if (me.band >= minTrial1Band) {
            //#ifdef MULTITHREADED
            //    for(int c=0; c<channels; c++) {
            //        pthread_mutex_lock(&trial1Mutex[c]);
            //    }
            //#endif
            me.adjustInit(me.trial1RingBuf, me.trial1GrainBuf);
            //#ifdef MULTITHREADED
            //    for(int c=channels-1; c>=0; c--) {
            //        pthread_mutex_unlock(&trial1Mutex[c]);
            //    }
            //#endif
            me.adjust(me.trial1GrainBuf, me.mag0Queue, me.minCutSep1,
                me.mag01, me.dmag0, me.x01, me.adjust1time, slice);
        }
        for (var c = 0; c < me.channels; c++) {
            delete slice[c];
        }

        var h2 = stretch * h1;
        me.h2cum += h2;
        var h2i = lrint(me.h2cum);
        me.h2cum -= h2i;
        for (var c = 0; c < me.channels; c++) {
            //#ifdef MULTITHREADED
            //    pthread_mutex_lock(&renderMutex[c]);
            //#endif
            me.nRender[c].push(h2i);
            //#ifdef MULTITHREADED
            //    pthread_mutex_unlock(&renderMutex[c]);
            //#endif
        }
        var dupStereoPostponed = [];//list<TrackPoint*> 
        for (var c = 0; c < me.channels; c++) {
            //#ifdef MULTITHREADED
            //    pthread_mutex_lock(&trackMutex[c]);
            //#endif
            //for(list<Track*>::iterator tt = renderTracks[c].begin(); 
            //    tt != renderTracks[c].end();
            //++tt) {
            var stop = false;
            var renderTracks = me.renderTracks;
            [].interpolate(renderTracks[c].begin(), renderTracks[c].end(), function (tt) {
                if (stop) return;
                var t = (tt);//Track *
                if (me.adjust1time >= t.start) {
                    if (me.adjust1time <= t.last) {
                        var tp = t.updateFPH(me.adjust1time, synthModeOutput, me.h2i,
                            me.pitch0, me.pitch1);//TrackPoint *
                        if (tp) {
                            dupStereoPostponed.push(tp);
                        }
                    }
                } else {
                    stop = true;
                }
            });
            //#ifdef MULTITHREADED
            //    pthread_mutex_unlock(&trackMutex[c]);
            //#endif  
        }
        //for(list<TrackPoint*>::iterator tpi = dupStereoPostponed.begin();
        //    tpi != dupStereoPostponed.end();
        //tpi++) {
        for (var tpi in dupStereoPostponed) {
            var tp = (tpi);//TrackPoint *
            tp.phSynth = U.canon2PI(tp.dupStereo.phSynth + tp.ph - tp.dupStereo.ph);
        }
        me.adjust1time++;
    },
    //int SMS :: //float *dmag, int k0, int maxK
    findCut: function (dmag, k0, maxK) {
        var me = this;
        var U = MEPH.audio.sbsms.Util;
        var k;
        for (k = Math.max(1, k0) ; k <= maxK; k++) {
            var dd0 = dmag[k + 1] - dmag[k];
            if (dd0 > 0.0) {
                var d02 = U.square(dmag[k + 1] + dmag[k]);
                if (dd0 * U.square(dmag[k] + dmag[k - 1]) > (dmag[k] - dmag[k - 1]) * d02
                   &&
                   dd0 * U.square(dmag[k + 2] + dmag[k + 1]) > (dmag[k + 2] - dmag[k + 1]) * d02) {
                    break;
                }
            }
        }
        return k;
    },

    //    void SMS :: //ArrayRingBuffer<float> **trialRingBuf,    GrainBuf *trialGrainBuf
    adjustInit: function (trialRingBuf, trialGrainBuf) {
        var me = this;
        var n = me.trialRingBuf[0].nReadable();
        for (var c = 1; c < me.channels; c++) {
            n = min(n, me.trialRingBuf[c].nReadable());
        }
        var ndone = 0;
        while (n) {
            var abuf = [].zeros(512);//audio[512]
            var ntodo = Math.min(512, n);
            for (var c = 0; c < me.channels; c++) {
                var fbuf = me.trialRingBuf[c].getReadBuf();
                for (var k = 0; k < ntodo; k++) {
                    abuf[k][c] = fbuf[ndone + k];
                }
            }
            for (var c = me.channels; c < 2; c++) {
                for (var k = 0; k < ntodo; k++) {
                    abuf[k][c] = 0.0;
                }
            }
            me.trialGrainBuf.write(abuf, ntodo);
            ndone += ntodo;
            n -= ntodo;
        }
        for (var c = 0; c < me.channels; c++) {
            me.trialRingBuf[c].advance(ndone);
        }
    },
    //    void SMS ::     
    //GrainBuf *trialGrainBuf,
    //queue<float*> *magQueue,
    //int minCutSep,
    //var **_mag1,
    //var **_dmag1,
    //audio **x1,
    //const TimeType &time,
    //Slice **slices
    adjust: function (trialGrainBuf,
                       magQueue,
                       minCutSep,
                       _mag1,
                       _dmag1,
                       x1,
                       time,
                       slices) {
        var me = this;
        var g = trialGrainBuf.read(trialGrainBuf.readPos);//grain *
        g.analyze();
        for (var c = 0; c < me.channels; c++) {
            var slice = slices[c];//Slice *
            var p = slice.bottom;//TrackPoint *
            if (c === 0) {
                c2even(g.x, x1[0], N);
            } else {
                c2odd(g.x, x1[1], N);
            }
            var mag1 = _mag1[c]///float */missing most float *;
            me.calcmags(mag1, x1[c]);
            //#ifdef MULTITHREADED
            //        pthread_mutex_lock(&magMutex[c]);
            //#endif
            var mag0 = magQueue[c].front();
            magQueue[c].pop();
            //#ifdef MULTITHREADED
            //        pthread_mutex_unlock(&magMutex[c]);
            //#endif
            if (p) {
                var dmag = _dmag1[c];
                var cuts = [];//list<int>
                var k3 = Math.min(me.Nover2, me.maxK + 2);

                dmag[0] = mag1[0];
                for (var k = Math.max(1, minK - 2) ; k < k3; k++) {
                    dmag[k] = mag1[k] - mag1[k - 1];
                }
                var k = minK;
                while (true) {
                    k = me.findCut(dmag, k + 1, me.maxK);
                    if (k >= me.maxK) {
                        break;
                    } else {
                        cuts.push(k);
                    }
                }
                var bDone = false;
                while (!bDone) {
                    bDone = true;
                    //for(list<int>::iterator i = cuts.begin();
                    //    i != cuts.end();
                    //++i) {
                    for (var i in cuts) {
                        var k0 = i;
                        var ibad = cuts.last();//list<int>::iterator 
                        var i2 = i;//list<int>::iterator 
                        ++i2;
                        var maxY = 0.0;
                        for (; i2 != cuts.last() ; ++i2) {
                            var k2 = cuts[i2];//dont know
                            if (k2 - k0 >= minCutSep) break;
                            var y = mag0[k2] * mag1[k2];
                            if (y >= maxY) {
                                maxY = y;
                                ibad = i2;
                            }
                            k0 = k2;
                        }
                        if (ibad != cuts.last()) {
                            if (mag0[cuts[i]] * mag1[cuts[i]] > maxY) {
                                ibad = i;
                            }
                            cuts.splice(ibad, 1);
                            bDone = false;
                            break;
                        }
                    }
                }
                cuts.unshift(minK);
                cuts.push(maxK);
                //list<int>::iterator i = cuts.first();
                var i = 0;
                while (p) {
                    var k0 = i;
                    ++i;
                    if (i == cuts.length) break;
                    var k2 = i;
                    if (p.x > k2) continue;
                    var m0 = 0.0;
                    var m1 = 0.0;
                    for (var k = k0; k <= k2; k++) {
                        m0 += mag0[k];
                        m1 += mag1[k];
                    }
                    var s = (m1 > m0 ? Math.sqrt(m0 / m1) : 1.0);
                    while (p && p.x <= k2) {
                        p.m *= s;
                        p = p.pn;
                    }
                }
            }
            //free(mag0);
        }
        me.trialGrainBuf.advance(1);
    },
    //void SMS :: //int c, list<SBSMSRenderer*> &renderers
    render: function (c, renderers) {
        //#ifdef MULTITHREADED
        //        pthread_mutex_lock(&renderMutex[c]);
        //#endif
        var me = this;
        var n = me.nRender[c].front();
        me.nRender[c].pop();
        //#ifdef MULTITHREADED
        //        pthread_mutex_unlock(&renderMutex[c]);
        //#endif
        var time = me.synthtime[c];
        //(list<SBSMSRenderer*>::iterator i = renderers.begin(); i != renderers.end(); ++i) {
        [].interpolate(renderers.begin(), renderers.end(), function (i) {
            var renderer = renderers[i];//SBSMSRenderer *
            renderer.startTime(c, time, n);
        });
        //#ifdef MULTITHREADED
        //        pthread_mutex_lock(&trackMutex[c]);
        //#endif
        //for(list<Track*>::iterator tt = renderTracks[c].begin(); 
        //tt != renderTracks[c].end();) {
        //   var toremove = 
        MEPH.Log('There are probably problems here')
        var stop = false;
        var renderTracks = me.renderTracks;
        var toremove = [];
        [].interpolate(renderTracks[c].begin(), renderTracks[c].end(), function (tt) {
            if (stop) return;
            var t = renderTracks[c][tt];//Track *

            if (t.bEnded && time > t.last) {
                var eraseMe = tt;//list<Track*>::iterator
                ++tt;
                toremove.push(eraseMe);
                //renderTracks[c].splice(eraseMe,1);
                //delete t;
            } else if (time >= t.start) {
                if (time <= t.last) {
                    t.updateM(time, synthModeOutput);
                    //for(list<SBSMSRenderer*>::iterator i = renderers.begin(); i != renderers.end(); ++i) {

                    [].interpolate(renderers.begin(), renderers.end(), function (i) {
                        var renderer = renderers[i];//SBSMSRenderer *
                        renderer.render(c, t);
                    });
                    t.step(time);
                }
                ++tt;
            } else {
                stop = true;
            }
        });
        renderTracks.removeIndices(toremove);
        //#ifdef MULTITHREADED
        //        pthread_mutex_unlock(&trackMutex[c]);
        //#endif  
        //  for(list<SBSMSRenderer*>::iterator i = renderers.begin(); i != renderers.end(); ++i) {
        //for(list<SBSMSRenderer*>::iterator i = renderers.begin(); i != renderers.end(); ++i) {
        [].interpolate(renderers.begin(), renderers.end(), function (i) {
            var renderer = renderers[i];//SBSMSRenderer *  
            renderer.endTime(c);
        });
        synthtime[c]++;
    },
    //    TrackPoint *SMS ::    
    //TrackPoint **begin, TrackPoint *tp0, float *minCost2, float maxCost2, float maxDF, float dMCoeff2, float dNCoeff2
    nearestForward: function (begin, tp0, minCost2, maxCost2, maxDF, dMCoeff2, dNCoeff2) {
        var me = this;
        var U = MEPH.audio.sbsms.Util;
        var minCost2 = TrackPointNoCont;
        var minF = tp0.f - maxDF;
        var maxF = tp0.f + maxDF;
        var maxDF2 = U.square(maxDF);
        while ((begin) && (begin).f < minF) {
            (begin) = (begin).pn;
        }
        var mintp1 = null;//TrackPoint *
        var tp1 = (begin);//TrackPoint *
        while (tp1) {
            if (tp1.bOwned) {
                continue;
            }
            else {
                var df2 = square(tp1.f - tp0.f);
                if (df2 > maxDF2) break;
                var dM2 = dBApprox(tp1.m2, tp0.m2);
                var cost2 = (df2 + dMCoeff2 * dM2);
                if (cost2 > maxCost2) continue;
                if (cost2 < (minCost2)) {
                    (minCost2) = cost2;
                    mintp1 = tp1;
                }
            }
            tp1 = tp1.pn
        }
        return mintp1;
    },
    //TrackPoint *SMS :: 
    //TrackPoint **begin, TrackPoint *tp0, float *minCost2, float maxCost2, float maxDF, float dMCoeff2, float dNCoeff2
    nearestReverse: function (begin, tp0, minCost2, maxCost2, maxDF, dMCoeff2, dNCoeff2) {
        var me = this;
        var U = MEPH.audio.sbsms.Util;
        var minCost2 = TrackPointNoCont;
        var minF = tp0.f - maxDF;
        var maxF = tp0.f + maxDF;
        var maxDF2 = U.square(maxDF);
        while ((begin) && (begin).f > maxF) {
            (begin) = (begin).pp;
        }
        var mintp1 = null;
        var tp1 = (begin);
        while (tp1) {
            if (tp1.bOwned) {
                continue;
            }
            else {
                var df2 = U.square(tp1.f - tp0.f);
                if (df2 > maxDF2) break;
                var dM2 = dBApprox(tp1.m2, tp0.m2);
                var cost2 = (df2 + dMCoeff2 * dM2);
                if (cost2 > maxCost2) continue;
                if (cost2 < (minCost2)) {
                    (minCost2) = cost2;
                    mintp1 = tp1;
                }
            }
            tp1 = tp1.pp;
        }
        return mintp1;
    },
    //TrackPoint *SMS :: 
    //TrackPoint **begin, TrackPoint *tp0, float *minCost2, float maxCost2, float maxDF, float dMCoeff2, float dNCoeff2
    nearestForward2: function (begin, tp0, minCost2, maxCost2, maxDF, dMCoeff2, dNCoeff2) {
        var me = this;
        var U = MEPH.audio.sbsms.Util;
        minCost2 = TrackPointNoCont;//References something outsidefunction,need to adjust

        var minF = tp0.f - maxDF;
        var maxF = tp0.f + maxDF;
        var maxDF2 = U.square(maxDF);
        while ((begin) && (begin).f < minF) {
            (begin) = (begin).pn;
        }
        var mintp1 = null;//TrackPoint *
        var tp1 = (begin);//TrackPoint *
        while (tp1) {
            if (!tp1.owner) continue;
            var df2 = U.square(tp1.f - tp0.f);
            if (df2 > maxDF2) break;
            var dM2 = dBApprox(0.25 * tp1.m2, tp0.m2);
            var cost2 = (df2 + dMCoeff2 * dM2);
            if (cost2 > maxCost2) continue;
            if (cost2 < (minCost2)) {
                (minCost2) = cost2;
                mintp1 = tp1;
            }
            tp1 = tp1.pn
        }
        return mintp1;
    },
    //TrackPoint *SMS :: 
    //TrackPoint **begin, TrackPoint *tp0, float *minCost2, float maxCost2, float maxDF, float dMCoeff2, float dNCoeff2
    nearestReverse2: function (begin, tp0, minCost2, maxCost2, maxDF, dMCoeff2, dNCoeff2) {
        var me = this;
        var U = MEPH.audio.sbsms.Util;
        var minCost2 = TrackPointNoCont;
        var minF = tp0.f - maxDF;
        var maxF = tp0.f + maxDF;
        var maxDF2 = U.square(maxDF);
        while ((begin) && (begin).f > maxF) {
            (begin) = (begin).pp;
        }
        var mintp1 = null;//TrackPoint *
        var tp1 = (begin);//TrackPoint *
        while (tp1) {
            if (!tp1.owner) continue;
            var df2 = U.square(tp1.f - tp0.f);
            if (df2 > maxDF2) break;
            var dM2 = dBApprox(tp1.m2, tp0.m2);
            var cost2 = (df2 + dMCoeff2 * dM2);
            if (cost2 > maxCost2) continue;
            if (cost2 < (minCost2)) {
                (minCost2) = cost2;
                mintp1 = tp1;
            }
            tp1 = tp1.pp
        }
        return mintp1;
    },

    //void SMS :: 
    //TrackPoint *tp0, TrackPoint *tp1, int ilo, int c
    connect: function (tp0, tp1, ilo, c) {
        var me = this;
        var time = me.assigntime[c];//TimeType 
        if (tp0.slice.band == tp1.slice.band) {
            //#ifdef MULTITHREADED
            //    pthread_mutex_lock(&trackMutex[c]);
            //#endif    
            tp0.owner.push(tp1);
            //#ifdef MULTITHREADED
            //    pthread_mutex_unlock(&trackMutex[c]);
            //#endif
        }
        else if (tp0.slice.band < tp1.slice.band) {
            var precursor = tp0.owner;//Track *
            if (ilo === 1) {
                //#ifdef MULTITHREADED
                //        pthread_mutex_lock(&trackMutex[c]);
                //#endif
                precursor.push(tp1);
                precursor.endTrack(true);
                var time = precursor.end / res;//TimeType 
                //#ifdef MULTITHREADED
                //        pthread_mutex_unlock(&trackMutex[c]);
                //#endif
                //#ifdef MULTITHREADED
                //        pthread_mutex_lock(&lo.trackMutex[c]);
                //#endif
                me.lo.createTrack(c, tp1, time, true);
                //#ifdef MULTITHREADED
                //        pthread_mutex_unlock(&lo.trackMutex[c]);
                //#endif
            } else {
                //#ifdef MULTITHREADED
                //        pthread_mutex_lock(&trackMutex[c]);
                //#endif
                var time = precursor.end / res;//TimeType
                precursor.endTrack(true);
                last = precursor.back();//TrackPoint *
                //#ifdef MULTITHREADED
                //        pthread_mutex_unlock(&trackMutex[c]);
                //#endif
                //#ifdef MULTITHREADED
                //        pthread_mutex_lock(&lo.trackMutex[c]);
                //#endif
                var t = lo.createTrack(c, last, time, true);//Track *
                t.push(tp1);
                //#ifdef MULTITHREADED
                //        pthread_mutex_unlock(&lo.trackMutex[c]);
                //#endif
                last.owner = precursor;
            }
        } else {
            var precursor = tp0.owner;//Track *
            //#ifdef MULTITHREADED
            //    pthread_mutex_lock(&trackMutex[c]);
            //#endif
            precursor.push(tp1);
            precursor.endTrack(true);
            time = precursor.end * me.hi.res;//TimeType 
            //#ifdef MULTITHREADED
            //    pthread_mutex_unlock(&trackMutex[c]);
            //#endif
            //#ifdef MULTITHREADED
            //    pthread_mutex_lock(&hi.trackMutex[c]);
            //#endif
            me.hi.createTrack(c, tp1, time, true);
            //#ifdef MULTITHREADED
            //    pthread_mutex_unlock(&hi.trackMutex[c]);
            //#endif
        }
        tp0.bConnected = true;
        tp1.bConnected = true;
        tp0.bOwned = true;
        tp1.bOwned = true;
        if (tp0.dupcont) {
            dup = tp0.dupcont;//TrackPoint *
            if (!dup.owner) {
                dup.bOwned = true;
                dup.bDelete = true;
            }
        }
        dup2 = tp0.dup[2];//TrackPoint *
        if (dup2 && dup2 != tp1 && !dup2.owner) {
            dup2.bOwned = true;
            dup2.bDelete = true;
        }
        for (var d = 0; d < 3; d++) {
            var dup = tp1.dup[d];//TrackPoint *
            if (dup && !dup.owner && (d < 2 || dup.slice.band < tp1.slice.band)) {
                dup.bOwned = true;
                dup.bDelete = true;
            }
        }
    },
    //void SMS :: long offset, int c
    mark: function (offset, c) {
        var me = this;
        me.$mark(offset, 0, c);
        if (offset & me.resMask) {
            me.$mark(offset, 1, c);
        }
    },

    //void SMS :: long offset, long offsetlo, int c
    $mark: function (offset, offsetlo, c) {
        var me = this;
        var lo = me.lo;
        var res = me.res;

        if (!lo) return;
        //#ifdef MULTITHREADED
        //        pthread_mutex_lock(&lo.sliceMutex[c]);
        //#endif
        var sliceL1 = lo.sliceBuffer[c].read(lo.sliceBuffer[c].readPos +
            offset / res +
            offsetlo);//Slice *
        //#ifdef MULTITHREADED
        //        pthread_mutex_unlock(&lo.sliceMutex[c]);
        //#endif
        //#ifdef MULTITHREADED
        //        pthread_mutex_lock(&sliceMutex[c]);
        //#endif
        var sliceM1 = me.sliceBuffer[c].read(me.sliceBuffer[c].readPos + offset);//Slice *
        //#ifdef MULTITHREADED
        //        pthread_mutex_unlock(&sliceMutex[c]);
        //#endif
        var b0 = !(offset & resMask);
        var bDone = false;
        var bLastDitch = false;
        while (!bDone) {
            var nToCont = 0;
            var nCont = 0;
            var rbegin = null;//
            var begin = sliceL1.bottom;//TrackPoint *
            var tp = sliceM1.bottom;//TrackPoint *tp = sliceM1.bottom;
            while (tp) {
                if (tp.bMarked) continue;
                if (tp.f > me.maxFMatchM) {
                    break;
                } else {
                    rbegin = tp;
                }
                var F;

                //refactor
                tp.cont = me.nearestForward(begin, tp, F, me.maxCost2Match, me.maxDFMatch, me.dMCoeff2Match);
                if (tp.cont) nToCont++;
                tp = tp.pn
            }
            if (sliceL1) {
                var tp = sliceL1.top;//TrackPoint *
                while (tp) {
                    if (tp.f < minFLo) break;
                    var F;
                    tp.cont = me.nearestReverse(rbegin, tp, F, maxCost2Match, maxDFMatch, dMCoeff2Match);
                    tp = tp.pp;
                }

            }
            //TrackPoint *tp0 = sliceM1.bottom;
            var tp0 = sliceM1.bottom;
            while (tp0) {
                if (tp0.bMarked) continue;
                if (tp0.f > maxFMatchM) {
                    break;
                }
                //TrackPoint *
                var tp1 = tp0.cont;
                if (tp1) {
                    if (bLastDitch || tp1.cont == tp0) {
                        nCont++;
                        var bAlreadyMarked = false;
                        if (b0) {
                            if (tp1.dup[1] || tp0.dup[1]) {
                                bAlreadyMarked = true;
                            }
                        } else {
                            if (tp1.dup[2 - 2 * offsetlo] || tp0.dup[2 * offsetlo]) {
                                bAlreadyMarked = true;
                            }
                        }
                        if (!bAlreadyMarked) {
                            if (b0) {
                                tp1.dup[1] = tp0;
                                tp0.dup[1] = tp1;
                            } else {
                                tp1.dup[2 - 2 * offsetlo] = tp0;
                                tp0.dup[2 * offsetlo] = tp1;
                            }
                        }
                        tp0.bMarked = true;
                    }
                }
                tp0 = tp0.pn
            }
            bDone = (nToCont == nCont);
            bLastDitch = (!bDone && nCont == 0);
        }
    },
    //void SMS :: long offset, int c
    assignStart: function (offset, c) {
        var me = this;
        me.bAssignDone[c] = false;
        //#ifdef MULTITHREADED
        //pthread_mutex_lock(&sliceMutex[c]);
        //#endif
        me.sliceM0[c] = me.sliceBuffer[c].read(me.sliceBuffer[c].readPos + offset);
        me.sliceM1[c] = me.sliceBuffer[c].read(me.sliceBuffer[c].readPos + offset + 1);
        if (me.res == 2) {
            me.sliceM2[c] = me.sliceBuffer[c].read(me.sliceBuffer[c].readPos + offset + 2);
        } else {
            me.sliceM2[c] = null;
        }
        //#ifdef MULTITHREADED
        //pthread_mutex_unlock(&sliceMutex[c]); 
        //#endif
        //TrackPoint *tp = sliceM0[c].bottom;
        var tp = sliceM0[c].bottom;
        while (tp) {
            if (!tp.owner.bEnded) {
                tp.owner.bEnd = true;
                tp.bConnected = false;
                tp.bOwned = false;
            } else {
                tp.bConnected = true;
                tp.bOwned = true;
            }
            tp = tp.pn;
        }
        //#ifdef MULTITHREADED
        //if(hi) pthread_mutex_lock(&hi.sliceMutex[c]);
        //#endif
        me.sliceH0[c] = me.hi ? me.hi.sliceBuffer[c].read(me.hi.sliceBuffer[c].readPos + (offset + 1) * me.hi.res) : null;
        me.sliceH0[c] = null;
        me.sliceH1[c] = me.hi ? me.hi.sliceBuffer[c].read(me.hi.sliceBuffer[c].readPos + (offset + 1) * me.hi.res) : null;
        //#ifdef MULTITHREADED 
        //if(hi) pthread_mutex_unlock(&hi.sliceMutex[c]);
        //#endif
        //#ifdef MULTITHREADED
        //if(lo) pthread_mutex_lock(&lo.sliceMutex[c]);
        //#endif
        me.sliceL0[c] = me.lo ? me.lo.sliceBuffer[c].read(me.lo.sliceBuffer[c].readPos + offset / me.res + 1) : null;
        me.sliceL0[c] = null;
        me.sliceL1[c] = me.lo ? me.lo.sliceBuffer[c].read(lo.sliceBuffer[c].readPos + offset / me.res + 1) : null;
        //#ifdef MULTITHREADED
        //if(lo) pthread_mutex_unlock(&lo.sliceMutex[c]);
        //#endif
    },
    //void SMS :: long offset, int c
    assignInit: function (offset, c) {
        var me = this;
        //TrackPoint *tp = sliceM1[c].bottom;
        var tp = me.sliceM1[c].bottom;
        while (tp
      ) {
            tp.cont = null;
            tp.contF = TrackPointNoCont;
            tp = tp.pn;
        }
        if (me.sliceM2[c]) {
            //TrackPoint *tp = sliceM2[c].bottom;
            var tp = me.sliceM2[c].bottom;
            while (tp) {
                tp.cont = null;
                tp.contF = TrackPointNoCont;
                tp = tp.pn;
            }
        }
    },
    //void SMS :: //long offset, int c
    assignFind: function (offset, c) {
        var me = this;
        if (me.bAssignDone[c]) return;
        var sliceM0 = this.sliceM0[c];
        //        Slice *
        var sliceM1 = this.sliceM1[c];
        var sliceM2 = this.sliceM2[c];
        var sliceL1 = this.sliceL1[c];
        var sliceH1 = this.sliceH1[c];
        var begin;
        begin = sliceM0.bottom;
        //TrackPoint *tp = sliceM1.bottom;
        var tp = sliceM1.bottom;
        while (tp) {
            if (tp.bOwned) continue;
            var F;
            tp.bConnect = false;
            var minM = nearestForward(begin, tp, F, me.maxCost2, me.maxDF, me.dMCoeff2, me.dNCoeff2);//TrackPoint *
            if (minM && F < tp.contF) {
                tp.cont = minM;
                tp.contF = F;
            }
            tp = tp.pn;
        }
        if (sliceL1) {
            var rbegin = sliceM0.top;//TrackPoint *
            //TrackPoint *tp = sliceL1.top;
            var tp = sliceL1.top;
            while (tp) {
                if (tp.bOwned) continue;
                if (tp.f < me.minFLo) break;
                var F;
                var minL = me.nearestReverse(rbegin, tp, F, me.maxCost2, me.maxDF, me.dMCoeff2, me.dNCoeff2);
                if (minL) {
                    F *= me.localFavorRatio;
                    if (F < tp.contF) {
                        tp.cont = minL;
                        tp.contF = F;
                    }
                }
                tp = tp.pp;
            }
        }
        begin = sliceM0.bottom;
        if (sliceH1) {
            //TrackPoint *tp = sliceH1.bottom;
            var tp = sliceH1.bottom;
            while (tp) {
                if (tp.bOwned) continue;
                if (tp.f > me.maxFHi) break;
                var F;
                //TrackPoint *
                var minH = me.nearestForward(begin, tp, F, me.maxCost2, me.maxDF, me.dMCoeff2, me.dNCoeff2);
                if (minH) {
                    F *= me.localFavorRatio;
                    if (F < tp.contF) {
                        tp.cont = minH;
                        tp.contF = F;
                    }
                }
                tp = tp.pn;
            }
        }
        if (sliceM2 && !(offset & me.resMask)) {
            begin = sliceM1.bottom;
            var tp = sliceM2.bottom;
            while (tp) {
                if (tp.bOwned) continue;
                var F;
                tp.bConnect = false;
                var minM = me.nearestForward(begin, tp, F, me.maxCost2, me.maxDF, me.dMCoeff2);
                if (minM) {
                    tp.cont = minM;
                    tp.contF = F;
                }
                tp = tp.pn;
            }
            if (sliceL1) {
                //TrackPoint *tp = sliceM2.bottom;
                var tp = sliceM2.bottom;
                while (tp) {
                    if (tp.bOwned) continue;
                    if (tp.f > me.maxFMid) break;
                    var F;
                    var rbegin = sliceL1.top;//TrackPoint *
                    var minL = nearestReverse(rbegin, tp, F, me.maxCost2, me.maxDF, me.dMCoeff2);//TrackPoint *
                    if (minL) {
                        F *= me.localFavorRatio;
                        if (F < tp.contF) {
                            tp.cont = minL;
                            tp.contF = F;
                        }
                    }
                    tp = tp.pn;
                }
            }
        }
    },
    //bool SMS :: //long offset, int c, bool bLastDitch
    assignConnect: function (offset, c, bLastDitch) {
        var me = this;
        if (me.bAssignDone[c]) return false;
        var sliceM0 = this.sliceM0[c];
        var sliceM1 = this.sliceM1[c];
        var sliceL1 = this.sliceL1[c];
        var sliceH1 = this.sliceH1[c];
        var nToCont = 0;
        var nCont = 0;
        var b0 = !(offset & me.resMask);
        var ilo;
        if (me.res == 2 && b0) {
            ilo = 0;
        } else {
            ilo = 1;
        }
        //TrackPoint *
        var beginM1 = sliceM1.bottom;
        var beginH1;//TrackPoint *
        if (sliceH1) beginH1 = sliceH1.bottom;
        //TrackPoint *tp = sliceM0.bottom;
        var tp = sliceM0.bottom;
        while (tp) {
            if (tp.bOwned) continue;
            var FM1 = TrackPointNoCont;
            var FL1 = TrackPointNoCont;
            var FH1 = TrackPointNoCont;
            var minM1 = me.nearestForward(beginM1, tp, FM1, me.maxCost2, me.maxDF, me.dMCoeff2, me.dNCoeff2);
            var minL1 = null;
            if (sliceL1 && tp.f < me.maxFMid) {
                var rbeginL1 = sliceL1.top;
                minL1 = me.nearestReverse(rbeginL1, tp, FL1, me.maxCost2, me.maxDF, me.dMCoeff2, me.dNCoeff2);
                FL1 *= me.localFavorRatio;
            }
            var minH1 = null;
            if (sliceH1 && tp.f > me.minFMid) {
                minH1 = me.nearestForward(beginH1, tp, FH1, me.maxCost2, me.maxDF, me.dMCoeff2, me.dNCoeff2);
                FH1 *= localFavorRatio;
            }
            if (minM1 &&
               ((FM1 <= FH1 && FM1 <= FL1)
                || (minL1 && FL1 <= FH1 && FL1 <= FM1 && minL1.dup[ilo] == minM1)
                || (minH1 && FH1 <= FL1 && FH1 <= FM1 && minH1.dup[1] == minM1))) {
                if (ilo == 1 && minL1 && minL1.dup[1] == minM1) {
                    tp.dupcont = minL1;
                } else if (minH1 && minH1.dup[1] == minM1) {
                    tp.dupcont = minH1;
                } else {
                    tp.dupcont = null;
                }
                tp.contF = FM1;
                tp.cont = minM1;
                nToCont++;
            } else if (minL1 && FL1 <= FM1 && FL1 <= FH1) {
                if (minM1 && minL1.dup[ilo] == minM1) {
                    tp.dupcont = minM1;
                } else {
                    tp.dupcont = null;
                }
                tp.contF = FL1;
                tp.cont = minL1;
                nToCont++;
            } else if (minH1 && FH1 <= FM1 && FH1 <= FL1) {
                if (minM1 && minH1.dup[1] == minM1) {
                    tp.dupcont = minM1;
                } else {
                    tp.dupcont = null;
                }
                tp.contF = FH1;
                tp.cont = minH1;
                nToCont++;
            } else {
                tp.cont = null;
            }
            tp = tp.pn;
        }

        //TrackPoint *tp0 = sliceM0.bottom;
        var tp0 = sliceM0.bottom;
        while (tp0) {
            if (tp0.bOwned) continue;
            tp0.bConnect = false;
            var tp1 = tp0.cont;//TrackPoint *
            var time = me.assigntime[c];//TimeType 
            if (tp1 && !tp1.bOwned &&
               (bLastDitch ||
                (tp1.cont == tp0) ||
                ((tp1.cont && tp0.contF <= tp1.cont.contF) &&
                 ((tp1.cont.dup[0] == tp0) ||
                  (tp1.cont.dup[1] == tp0))))) {
                tp1.cont = tp0;
                tp0.bConnect = true;
                tp1.bConnect = true;
            }
            tp0 = tp0.pn
        }
        //TrackPoint *tp0 = sliceM0.bottom;
        var tp0 = sliceM0.bottom;
        while (
            tp0) {
            if (tp0.bOwned) continue;
            var tp1 = tp0.cont;//TrackPoint *
            if (tp0.bConnect && tp1 && !tp1.bOwned && tp1.bConnect && tp1.cont == tp0) {
                var dupcont = tp0.dupcont;//TrackPoint *
                if (dupcont && dupcont.bConnect) {
                    if (!tp1.bConnected && !dupcont.bConnected) {
                        if (!tp0.bConnected && (dupcont.cont == null || tp0.contF <= dupcont.cont.contF)) {
                            nCont++;
                            me.connect(tp0, tp1, ilo, c);
                            tp0.owner.bEnd = false;
                            dupcont.bConnect = false;
                        } else if (dupcont.cont && !dupcont.cont.bConnected) {
                            nCont++;
                            me.connect(dupcont.cont, dupcont, ilo, c);
                            dupcont.cont.owner.bEnd = false;
                            tp1.bConnect = false;
                        }
                    }
                } else if (!tp0.bConnected && !tp1.bConnected) {
                    nCont++;
                    me.connect(tp0, tp1, ilo, c);
                    tp0.owner.bEnd = false;
                }
            }
            tp0 = tp0.pn;
        }
        me.bAssignDone[c] = (nToCont == nCont || bLastDitch);
        return !(me.bAssignDone[c] || nCont == 0);
    },
    //void SMS :: //long offset, int c
    start: function (offset, c) {
        var me = this;
        var renderTracks = me.renderTracks;
        me.started[c].clear();
        me.ended[c].clear();
        //#ifdef MULTITHREADED
        //        pthread_mutex_lock(&trackMutex[c]);
        //#endif
        //for(list<Track*>::iterator tt = assignTracks[c].begin(); 
        //    tt != assignTracks[c].end(); ) {
        var toremove = [];
        [].interpolate(me.assignTracks[c].begin(), me.assignTracks[c].end(), function (tt) {
            var t = me.assignTracks[c][(tt)];//Track *
            var bKeep;
            var jump = false;
            if (t.bEnded) {
                bKeep = ((!t.bRender) && (t.bStitch || t.size() >= me.minTrackSize));
                if (me.assigntime[c] > t.last) {
                    me.returnTrackIndex(c, t);
                    var eraseMe = tt;
                    toremove.push(eraseMe);
                    // moved: me.assignTracks[c].erase(eraseMe);
                } else {
                    ++tt;
                }
            } else if (t.bEnd) {
                bKeep = (t.bStitch || t.size() >= me.minTrackSize);
                if (bKeep) {
                    bKeep = !t.bRender;
                    t.endTrack(false);
                    ended[c].push_back(t.back());
                    ++tt;
                } else {
                    //list<Track*>::iterator eraseMe = tt;
                    //++tt;
                    toremove.push(eraseMe);
                    //assignTracks[c].erase(eraseMe);
                    me.returnTrackIndex(c, t);
                    t.absorb();
                    delete t;
                    jump = true;
                }
            } else {
                bKeep = ((!t.bRender) && (t.bStitch || t.size() >= me.minTrackSize));
                ++tt;
            }
            if (!jump)
                if (bKeep) {
                    var tt0 = renderTracks[c].rbegin();
                    while (tt0 != renderTracks[c].rend()) {
                        var t0 = renderTracks[c][tt0];
                        if (t.start >= t0.start) {
                            break;
                        }
                        tt0++;
                    }
                    renderTracks[c].insert(tt0.base(), t);
                    t.bRender = true;
                }
        });

        me.assignTracks[c].removeIndices(toremove);
        //#ifdef MULTITHREADED
        //        pthread_mutex_unlock(&trackMutex[c]);
        //#endif
        //#ifdef MULTITHREADED
        //        pthread_mutex_lock(&sliceMutex[c]);
        //#endif
        var sliceM0 = sliceBuffer[c].read(sliceBuffer[c].readPos + offset);//Slice *
        me.adjust2SliceQueue[c].push(sliceM0);
        me.adjust1SliceQueue[c].push(sliceM0);
        //#ifdef MULTITHREADED
        //        pthread_mutex_unlock(&sliceMutex[c]); 
        //#endif
        //TrackPoint *tp = sliceM0.bottom;
        var tp = sliceM0.bottom;
        while (tp) {
            var tpn = tp.pn;
            if (tp.bOwned) {
                if (tp.bDelete) {
                    tp.destroy();
                }
            } else {
                var t = me.createTrack(c, tp, me.assigntime[c], false);
                me.started[c].push(tp);
                for (var d = 0; d < 2; d++) {
                    var dup = tp.dup[d];//TrackPoint  *
                    if (dup && !dup.owner) {
                        dup.destroy();
                    }
                }
            }
            tp = tpn;
        }
        me.assigntime[c]++;
    },
    //void SMS :: //int c
    splitMerge: function (c) {
        var me = this;
        var time = me.assigntime[c] - 1;
        //#ifdef MULTITHREADED
        //        pthread_mutex_lock(&trackMutex[c]);
        //#endif
        var sliceM0 = this.sliceM0[c];
        var sliceL0 = this.sliceL0[c];
        var sliceH0 = this.sliceH0[c];
        var sliceM1 = this.sliceM1[c];
        var sliceL1 = this.sliceL1[c];
        var sliceH1 = this.sliceH1[c];
        var rbeginL0 = sliceL0 ? sliceL0.top : null;
        var beginM0 = sliceM0.bottom;
        var beginH0 = sliceH0 ? sliceH0.bottom : null;
        //for(list<TrackPoint*>::iterator i = started[c].begin();
        //    i != started[c].end();
        //++i) {
        [].interpolate(started[c].begin(), started[c].end(), function (i) {
            var tp = started[c][i];
            var F, FL, FH;
            tp.cont = me.nearestForward2(beginM0, tp, F, me.maxCost2SplitMerge,
                me.maxDFSplitMerge, me.dMCoeff2SplitMerge);
            var minL = me.nearestReverse2(rbeginL0, tp, FL, me.maxCost2SplitMerge, me.maxDFSplitMerge, me.dMCoeff2SplitMerge);
            if (minL) {
                FL *= me.localFavorRatio;
                if (FL < F) {
                    tp.cont = minL;
                    F = FL;
                }
            }
            var minH = me.nearestForward2(beginH0, tp, FH, me.maxCost2SplitMerge, me.maxDFSplitMerge, me.dMCoeff2SplitMerge);
            if (minH) {
                FH *= me.localFavorRatio;
                if (FH < F) {
                    tp.cont = minH;
                }
            }
            if (tp.cont) {
                tp.owner.point.insert(tp.owner.point.begin(), tp.cont);
                tp.owner.first--;
                tp.owner.bStitch = true;
                tp.bSplit = true;
                tp.cont.bSplit = true;
                tp.owner.bSplit = true;
                tp.cont.refCount++;
                tp.cont.owner.bStitch = true;
            }
        });

        var rbeginL1 = sliceL1 ? sliceL1.top : null;
        var beginM1 = sliceM1.bottom;
        var beginH1 = sliceH1 ? sliceH1.bottom : null;
        //for(list<TrackPoint*>::iterator i = ended[c].begin();
        //    i != ended[c].end();
        //++i) {
        [].interpolate(me.ended[c].begin(), me.ended[c].end(), function (i) {
            var tp = me.ended[c][i];
            var F, FL, FH;
            tp.cont = me.nearestForward2(beginM1, tp, F, me.maxCost2SplitMerge, me.maxDFSplitMerge, me.dMCoeff2SplitMerge);
            var minL = me.nearestReverse2(rbeginL1, tp, FL, me.maxCost2SplitMerge, me.maxDFSplitMerge, me.dMCoeff2SplitMerge);
            if (minL) {
                FL *= me.localFavorRatio;
                if (FL < F) {
                    tp.cont = minL;
                    F = FL;
                }
            }
            var minH = me.nearestForward2(beginH1, tp, FH, me.maxCost2SplitMerge, me.maxDFSplitMerge, me.dMCoeff2SplitMerge);
            if (minH) {
                FH *= me.localFavorRatio;
                if (FH < F) {
                    tp.cont = minH;
                }
            }
            if (tp.cont) {
                tp.owner.point.insert(tp.owner.point.end(), tp.cont);
                tp.owner.last++;
                tp.owner.bStitch = true;
                tp.bMerge = true;
                tp.cont.bMerge = true;
                tp.owner.bMerge = true;
                tp.cont.refCount++;
                tp.cont.owner.bStitch = true;
            }
        });
        //#ifdef MULTITHREADED
        //        pthread_mutex_unlock(&trackMutex[c]);
        //#endif
    },
    //void SMS :: int c
    advance: function (c) {
        var me = this;
        //#ifdef MULTITHREADED
        //    pthread_mutex_lock(&sliceMutex[c]);
        //#endif
        me.sliceBuffer[c].advance(1);
        //#ifdef MULTITHREADED
        //    pthread_mutex_unlock(&sliceMutex[c]);
        //#endif
    },
    //void SMS :: //grain *g0, grain *g1, grain *g2, int c
    add: function (g0, g1, g2, c) {
        var me = this;
        if (c == 0) {
            if (me.band >= minTrial1Band) {
                c2even(g0.x, me.x00[0], me.N);
            }
            if (me.band >= minTrial2Band) {
                c2even(g1.x, me.x10[0], me.N);
            }
            c2even(g2.x, me.x2[0], me.N);
        } else {
            if (me.band >= minTrial1Band) {
                c2odd(g0.x, me.x00[1], me.N);
            }
            if (me.band >= minTrial2Band) {
                c2odd(g1.x, me.x10[1], me.N);
            }
            c2odd(g2.x, me.x2[1], me.N);
        }

        var mag0;
        if (me.band >= minTrial1Band) {
            mag0 = [].zeros(me.Nover2 + 1);//(float*)malloc((Nover2+1)*sizeof(float));
            me.calcmags(mag0, x00[c]);
        }
        var mag1;
        if (me.band >= minTrial2Band) {
            mag1 = [].zeros(me.Nover2 + 1);//(float*)malloc((Nover2+1)*sizeof(float));
            me.calcmags(mag1, x10[c]);
        }
        var mag2sum = [].zeroes(1024);
        //memset(mag2sum,0,1024*sizeof(float));

        var mag2 = this.mag2[c];
        me.calcmags(mag2sum, g2.x);
        me.calcmags(mag2sum, me.x2[c]);
        me.calcmags(mag2, me.x2[c]);
        //#ifdef MULTITHREADED
        //        pthread_mutex_lock(&magMutex[c]);
        //#endif
        if (me.band >= minTrial1Band) me.mag0Queue[c].push(mag0);
        if (me.band >= minTrial2Band) me.mag1Queue[c].push(mag1);
        //#ifdef MULTITHREADED
        //        pthread_mutex_unlock(&magMutex[c]);
        //#endif
        var magmax = mag2[0];
        for (var k = 1; k <= me.kEnd; k++) {
            if (magmax < mag2[k]) magmax = mag2[k];
        }
        var peakmin = magmax * me.peakThresh;

        var xt2 = 1.0;
        var bTroughN1 = false;
        var bTroughN2 = false;
        var x0 = 1.0;
        var y0 = mag2[1];
        var x1 = 0.0;
        var y1 = 0.0;
        var kEnd = me.kEnd;
        var bX0 = !me.lo;
        var bX1 = false;
        var prev = null;//TrackPoint *

        var slice = new Slice(me.band, me.addtime[c]);//Slice *

        for (var k = 1; k <= me.kEnd; k++) {
            if (mag2[k] > peakmin && mag2[k] > mag2[k - 1] && mag2[k] >= mag2[k + 1]) {
                if (k < me.kLo) {
                    x0 = me.findExtremum(mag2, mag2, k, y0);
                    bX0 = true;
                } else if (k > kHi) {
                    if (!bX1) {
                        x1 = me.findExtremum(mag2, mag2, k, y1);
                        if (prev) {
                            prev.x01 = x1;
                            prev.y01 = y1;
                        }
                        bX1 = true;
                    }
                } else {
                    var p = new TrackPoint(slice, me.peak2N, me.x2[c], mag2, mag2, k, me.N, me.band);//TrackPoint *

                    if (prev) {
                        prev.pn = p;
                        p.pp = prev;
                    } else {
                        slice.bottom = p;
                    }
                    slice.top = p;
                    prev = p;
                    p.xtn2 = me.maxK;
                    bTroughN1 = true;
                    bTroughN2 = true;
                    p.xtp2 = xt2;
                    p.x01 = x0;
                    p.y01 = y0;
                }
            } else if (mag2[k] <= mag2[k - 1] && mag2[k] <= mag2[k + 1]) {
                xt2 = me.findExtremum(mag2, mag2, k, NULL);
                xt2 = Math.max(1.0, xt2);
                xt2 = Math.min(kEnd, xt2);
                if (bTroughN2) {
                    prev.xtn2 = xt2;
                    bTroughN2 = false;
                }
            }
        }
        if (bTroughN2) {
            prev.xtn2 = kEnd;
        }
        if (!bX1 && !hi) {
            x1 = kEnd;
            y1 = mag2[kEnd];
            bX1 = true;
        }
        var dec2 = this.dec2[c];//float *
        // memset(dec2,0,(Nover2+1)*sizeof);
        if (bX0 && prev) {
            var k1 = lrintf(x0);
            var ko1 = k1 > x0 ? -1 : 1;
            var kf1 = k1 > x0 ? k1 - x0 : x0 - k1;
            var k3 = Math.min(kEnd, k1 + me.peakWidth2);
            for (var k = lrintf(slice.bottom.xtp2) ; k <= k3; k++) {
                var m = me.interp2(k - k1, ko1, kf1);
                dec2[k] += m * y0;
            }
        }
        if (bX1 && prev) {
            var k1 = lrintf(x1);
            var ko1 = k1 > x1 ? -1 : 1;
            var kf1 = k1 > x1 ? k1 - x1 : x1 - k1;
            var k3 = lrintf(slice.top.xtn2);
            for (var k = Math.max(0, k1 - me.peakWidth2) ; k <= k3; k++) {
                var m = me.interp2(k - k1, ko1, kf1);
                dec2[k] += m * y1;
            }
        }
        //TrackPoint *p = slice.bottom;
        var p = slice.bottom;
        while (p) {
            var k1 = lrintf(p.x);
            var ko1 = k1 > p.x ? -1 : 1;
            var kf1 = k1 > p.x ? k1 - p.x : p.x - k1;
            var k0 = lrintf(p.xtp2);
            var kf0 = (k0 > p.xtp2 ? k0 - p.xtp2 : p.xtp2 - k0);
            var k2 = lrintf(p.xtn2);
            var kf2 = (k2 > p.xtn2 ? k2 - p.xtn2 : p.xtn2 - k2);
            var m2 = 0.0;
            if (k0 < p.xtp2) {
                m2 += (mag2[k0] + mag2[k0 + 1]) * 0.5 * (1.0 - kf0) + 0.5 * mag2[k0 + 1];
                var i = Math.floor(k0 - k1);
                var m = me.interp2(i, ko1, kf1) * p.y;
                m = Math.min(m, mag2[k0]) * 0.5 * (1.0 + kf0);
                m2 += m;
                dec2[k0] += m;
                m = me.interp2(i + 1, ko1, kf1) * p.y;
                m = Math.min(m, mag2[k0 + 1]) * 0.5 * kf0;
                m2 += m;
                dec2[k0 + 1] += m;
                m = me.interp2(i - 1, ko1, kf1) * p.y;
                m = Math.min(m, mag2[k0 - 1]);
                m2 += m;
                dec2[k0 - 1] += m;
            } else {
                m2 += (mag2[k0] + mag2[k0 - 1]) * 0.5 * kf0 + 0.5 * mag2[k0] + mag2[k0 + 1];
                var i = Math.floor(k0 - k1);
                var m = me.interp2(i, ko1, kf1) * p.y;
                m = Math.min(m, mag2[k0]) * 0.5 * (1.0 - kf0);
                m2 += m;
                dec2[k0] += m;
                m = me.interp2(i - 1, ko1, kf1) * p.y;
                m = Math.min(m, mag2[k0 - 1]) * 0.5 * (2.0 - kf0);
                m2 += m;
                dec2[k0 - 1] += m;
            }
            if (k2 < p.xtn2) {
                m2 += mag2[k2 - 1] + 0.5 * mag2[k2] + 0.5 * kf2 * (mag2[k2] + mag2[k2 + 1]);
                var i = Math.floor(k2 - k1);
                var m = me.interp2(i, ko1, kf1) * p.y;
                m = Math.min(m, mag2[k2]) * 0.5 * (1.0 - kf2);
                m2 += m;
                dec2[k2] += m;
                m = me.interp2(i + 1, ko1, kf1) * p.y;
                m = Math.min(m, mag2[k2 + 1]) * 0.5 * (2.0 - kf2);
                m2 += m;
                dec2[k2 + 1] += m;
            } else {
                m2 += (mag2[k2 - 1] + mag2[k2]) * (1.0 - kf2) * 0.5 + 0.5 * mag2[k2 - 1];
                var i = Math.floor(k2 - k1);
                var m = me.interp2(i, ko1, kf1) * p.y;
                m = Math.min(m, mag2[k2]) * 0.5 * (1.0 + kf2);
                m2 += m;
                dec2[k2] += m;
                m = me.interp2(i - 1, ko1, kf1) * p.y;
                m = Math.min(m, mag2[k2 - 1]) * 0.5 * kf2;
                m2 += m;
                dec2[k2 - 1] += m;
                m = me.interp2(i + 1, ko1, kf1) * p.y;
                m = Math.min(m, mag2[k2 + 1]);
                m2 += m;
                dec2[k2 + 1] += m;
            }
            for (var k = k0 + 2; k < k2 - 1; k++) {
                m2 += mag2[k];
            }
            if (k0 + 1 == k2 - 1) {
                m2 -= mag2[k0 + 1];
            }
            for (var k = max(0, k1 - me.peakWidth2) ; k < k0 - 1; k++) {
                var m = me.interp2(k - k1, ko1, kf1) * p.y;
                m = Math.min(m, mag2[k]);
                m2 += m;
                dec2[k] += m;
            }
            var k3 = Math.floor(min(kEnd, k1 + me.peakWidth2));
            for (var k = k2 + 2; k <= k3; k++) {
                var m = me.interp2(k - k1, ko1, kf1) * p.y;
                m = min(m, mag2[k]);
                m2 += m;
                dec2[k] += m;
            }

            p.m2 = m2;
            p = p.pn
        }
        var m2max = 0.0;
        //TrackPoint *p = slice.bottom;
        var p = slice.bottom;
        while (p) {
            var k1 = lrintf(p.x);
            var ko1 = Math.floor(k1 > p.x ? -1 : 1);
            var kf1 = k1 > p.x ? k1 - p.x : p.x - k1;
            var k0 = lrintf(p.xtp2);
            var kf0 = (k0 > p.xtp2 ? k0 - p.xtp2 : p.xtp2 - k0);
            var k2 = lrintf(p.xtn2);
            var kf2 = (k2 > p.xtn2 ? k2 - p.xtn2 : p.xtn2 - k2);
            var mdec = 0.0;
            if (k0 < p.xtp2) {
                mdec += (dec2[k0] + dec2[k0 + 1]) * 0.5 * (1.0 - kf0) + 0.5 * dec2[k0 + 1];
            } else {
                mdec += (dec2[k0] + dec2[k0 - 1]) * 0.5 * kf0 + 0.5 * dec2[k0] + dec2[k0 + 1];
            }
            if (k2 < p.xtn2) {
                mdec += dec2[k2 - 1] + 0.5 * dec2[k2] + 0.5 * kf2 * (dec2[k2] + dec2[k2 + 1]);
            } else {
                mdec += (dec2[k2 - 1] + dec2[k2]) * (1.0 - kf2) * 0.5 + 0.5 * dec2[k2 - 1];
            }
            for (var k = k0 + 2; k < k2 - 1; k++) {
                mdec += dec2[k];
            }
            if (k0 + 1 == k2 - 1) {
                mdec -= dec2[k0 + 1];
            }

            p.m2 -= mdec;
            p.m2 *= mNorm;
            if (p.m2 > m2max) {
                m2max = p.m2;
            }
            p = p.pn;
        }

        var m2min = m2max * peakThresh;
        //TrackPoint *p = slice.bottom;
        var p = slice.bottom;
        while (p) {
            var pn = p.pn;//TrackPoint *
            if (p.m2 < m2min) {
                if (p.m2 < 0) { p.m2 = 0; }
                p.absorb();
                delete p;
            }
            p = pn;
        }

        //#ifdef MULTITHREADED
        //        pthread_mutex_lock(&sliceMutex[c]);
        //#endif
        me.sliceBuffer[c].write(slice);
        //#ifdef MULTITHREADED
        //        pthread_mutex_unlock(&sliceMutex[c]);
        //#endif
        me.addtime[c]++;
    },
    //    void SMS ::     //audio *buf, long n
    prepad1: function (buf, n) {
        var me = this;
        if (me.band >= minTrial2Band) {
            me.trial2GrainBuf.write(buf, n);
        }
    },
    ///audio *buf, long n
    prepad0: function (buf, n) {
        var me = this;
        if (me.band >= minTrial1Band) {
            me.trial1GrainBuf.write(buf, n);
        }
    },

    getTrial2Latency: function () {
        var me = this;
        return me.minTrackSize;
    },

    //Track *SMS :: 
    //int c, TrackPoint *tp, const TimeType &time, bool bStitch
    createTrack: function (c, tp, time, bStitch) {
        var index;//TrackIndexType
        if (me.trackIndex[c].empty()) {
            index = trackIndexNone;
        } else {
            index = me.trackIndex[c].front();
            me.trackIndex[c].pop();
        }
        var t = new Track(me.h1, index, tp, time, bStitch);//Track *t 
        me.assignTracks[c].push_back(t);
        return t;
    },
    //void SMS :: //int c, Track *t
    returnTrackIndex: function (c, t) {
        var me = this;
        if (t.index != trackIndexNone) {
            me.trackIndex[c].push(t.index);
            t.index = trackIndexNone;
        }
    },
    //float SMS :: //int k, int ko, float kf
    interp2: function (k, ko, kf) {
        var me = this;
        return (1.0 - kf) * me.peak2N[k] + kf * me.peak2N[k + ko];
    },
    //float SMS :: /float *mag, float *mag2, int k, float *y
    findExtremum: function (mag, mag2, k, y) {
        var y0 = mag[k - 1];
        var y1 = mag[k];
        var y2 = mag[k + 1];
        var d = (y0 + y2 - y1 - y1);
        var x = (d == 0.0 ? k : k + 0.5 * (y0 - y2) / d);
        if (y) {
            var ki = lrintf(x);
            var kf = ki < x ? x - ki : ki - x;
            var ki1 = Math.floor(ki < k ? ki + 1 : ki - 1);
            y = ((1.0 - kf) * mag2[ki] + kf * mag2[ki1]);//output:
        }
        return x;
    },
    //void SMS :: float *mag, audio *x
    calcmags: function (mag, x) {
        var me = this;
        var U = MEPH.audio.sbsms.Util;
        for (var k = 0; k <= me.Nover2; k++) {
            mag[k] = U.norm2(x[k]);
        }
    }

}).then(function () {
    window.minTrial2Band = 1;
    window.minTrial1Band = 2;

    window.resampleSincSize = 5286;
    window.resampleSincRes = 128;
    window.resampleSincSamples = 41;
    window.sincTable= [
 0.920381425342433, 0.920302993473145, 0.920067721990721, 0.919675683262634, 0.919126997871811, 0.918421834572361, 0.91756041022763, 0.916542989730571, 0.915369885906517,
 0.914041459398341, 0.912558118534085, 0.910920319177104, 0.909128564558774, 0.907183405093832, 0.905085438178449, 0.902835307971073, 0.900433705156165, 0.897881366690907, 
 0.895179075534992, 0.892327660363588, 0.889327995263616, 0.886180999413434, 0.882887636746086, 0.879448915596223, 0.87586588833086, 0.8721396509641, 0.868271342755988, 
 0.864262145795659, 0.860113284568922, 0.855826025510501, 0.851401676541053, 0.846841586589208, 0.842147145098761, 0.837319781521271, 0.832360964794223, 0.827272202804995, 0.822055041840814,
 0.816711066024967, 0.811241896739414, 0.805649192034132, 0.799934646023336, 0.794099988268876, 0.788146983151029, 0.782077429226949, 0.775893158577015, 0.769596036139359, 0.763187959032823,
 0.756670855868614, 0.750046686050943, 0.74331743906691, 0.736485133765944, 0.729551817629037, 0.722519566028119, 0.715390481475825, 0.708166692865973, 0.700850354705043, 0.693443646334978, 
 0.685948771147588, 0.678367955790895, 0.670703449367724, 0.662957522626847, 0.655132467147014, 0.647230594514183, 0.639254235492289, 0.631205739187853, 0.623087472208794, 0.614901817817741,
 0.606651175080214, 0.598337958007979, 0.589964594697926, 0.581533526466823, 0.573047206982255, 0.56450810139012, 0.555918685439004, 0.54728144460179, 0.538598873194839, 0.529873473495092,
 0.521107754855427, 0.512304232818645, 0.503465428230394, 0.494593866351407, 0.48569207596938, 0.476762588510854, 0.467807937153435, 0.458830655938691, 0.449833278886095, 0.440818339108329,
 0.431788367928309, 0.422745893998278, 0.413693442421282, 0.404633533875401, 0.395568683741051, 0.386501401231699, 0.377434188528327, 0.368369539917981, 0.359309940936732, 0.350257867517365,
 0.341215785142159, 0.332186148001037, 0.323171398155437, 0.314173964708215, 0.305196262979899, 0.296240693691588, 0.287309642154844, 0.278405477468841, 0.269530551725108, 0.260687199220141,
 0.251877735676207, 0.243104457470604, 0.234369640873684, 0.225675541295929, 0.217024392544336, 0.208418406088417, 0.199859770336071, 0.191350649919593, 0.182893184992099, 0.17448949053461,
 0.166141655674063, 0.157851743012483, 0.149621787967589, 0.141453798125034, 0.133349752602549, 0.125311601426209, 0.117341264919035, 0.109440633102171, 0.101611565108827, 0.0938558886112235,
 0.0861753992607111, 0.0785718601412871, 0.0710470012366835, 0.0636025189112218, 0.0562400754046094, 0.0489612983408536, 0.0417677802514581, 0.0346610781130688, 0.027642712899719, 
 0.0207141691498255, 0.0138768945480801, 0.00713229952237053, 0.000481756855863834, -0.00607339868562557,-0.0125318707108654,-0.0188924015449201,-0.0251537725552469,-0.0313148044620756,
 -0.03737435763298,-0.0433313323615559,-0.0491846691301276,-0.054933348856413,-0.0605763931240776,-0.0661128643971269,-0.0715418662180771,-0.0768625433898662,-0.0820740821414636,
 -0.0871757102771481,-0.0921666973094308,-0.0970463545756019,-0.101814035337896,-0.106469134867263,-0.111011090510758,-0.115439381742549,-0.119753530198566,-0.123953099694804,-0.128037696229328,
 -0.132006967967991,-0.135860605213926,-0.13959834036086,-0.143219947830288,-0.146725243992596,-0.150114087072177,-0.153386377036634,-0.156542055470134,-0.159581105431021,-0.162503551293762,-0.165309458575341,-0.167998933746201,-0.170572124025849,-0.173029217163239,-0.175370441202068,-0.177596064231103,-0.179706394119684,-0.181701778238549,-0.183582603166115,-0.185349294380385,-0.187002315936636,-0.188542170131047,-0.189969397150449,-0.191284574708361,-0.192488317667501,-0.193581277648966,-0.194564142628253,-0.195437636518337,-0.19620251874,-0.196859583779615,-0.197409660734602,-0.197853612846779,-0.1981923370238,-0.198426763348949,-0.19855785457948,-0.198586605633759,-0.198514043067442,-0.198341224538922,-0.198069238264313,-0.197699202462185,-0.197232264788348,-0.1966696017609,-0.196012418175829,-0.195261946513421,-0.19441944633574,-0.193486203675456,-0.192463530416289,-0.191352763665353,-0.190155265117665,-0.188872420413117,-0.187505638486185,-0.186056350908662,-0.18452601122571,-0.182916094285512,-0.181228095562824,-0.179463530476727,
 -0.177623933702856,-0.17571085848043,-0.173725875914356,-0.171670574272733,-0.169546558280039,-0.167355448406313,-0.165098880152636,-0.162778503333212,-0.160395981354361,-0.15795299049072,-0.155451219158975,-0.15289236718941,-0.150278145095599,-0.147610273342536,-0.144890481613517,-0.142120508076075,-0.139302098647282,-0.136437006258713,-0.133526990121391,-0.130573814991001,-0.127579250433698,-0.12454507009279,-0.121473050956606,-0.118364972627861,-0.115222616594795,-0.112047765504399,-0.108842202438022,-0.105607710189641,-0.102346070547107,-0.0990590635766376,-0.0957484669108493,-0.0924160550406252,-0.0890635986110882,
 -0.0856928637219669,-0.082305611232631,-0.0789035960720733,-0.0754885665541077,-0.072062263698056,-0.0686264205551892,-0.0651827615411846,-0.0617330017748624,-0.058278846423457,-0.0548219900546751,-0.0513641159957935,-0.0479068957000384,-0.044451988120494,-0.0410010390917734,-0.0375556807196898,-0.0341175307791583,-0.0306881921205521,-0.0272692520847378,-0.0238622819270072,-0.0204688362501168,-0.017090452446647,-0.0137286501508832,-0.0103849307004177,-0.00706077660767134,-0.00375765104151933,-0.000476997319211795,0.00277976159123424,0.00601122355799482,0.00921600776157955,0.0123927551599898,0.0155401289427332,0.0186568149735395,0.0217415222216296,0.0247929831813924,0.0278099542803314,0.0307912162751492,0.0337355746358384,0.0366418599176616,0.0395089281209001,0.0423356610382613,0.0451209665898422,
 0.0478637791455434,0.0505630598348475,0.0532177968438653,0.0558270056995736,0.0583897295411674,0.0609050393784495,0.0633720343372027,0.0657898418914747,0.0681576180827297,0.070474547725818,0.0727398446017178,0.0749527516370186,0.0771125410701129,0.0792185146040738,0.0812700035461998,0.0832663689342141,0.0852070016491116,0.0870913225146552,0.0889187823835221,0.0906888622101165,0.0924010731100602,0.0940549564063881,0.0956500836624715,0.0971860567017111,
 0.0986625076140278,0.10007909874921,0.101435522697154,0.102731502255068,0.103966790381692,0.1051411701386,0.106254454618665,0.107306486861763,0.108297139757793,0.109226315937109,0.110093947648454,0.110899996624499,0.11164445393509,0.112327339828307,0.112948703559463,0.113508623208143,0.11400720548343,0.114444585517426,0.114820926647216,0.11513642018541,0.115391285179402,0.115585768159498,0.115720142876066,0.11579471002586,0.115809796967682,0.11576575742755,0.115662971193528,0.115501843800413,0.115282806204435,0.115006314448161,0.114672849315792,0.114282915979024,
 0.113837043633693,0.113335785127364,0.1127797165781,0.112169436984582,0.111505567827804,0.110788752664544,0.110019656712823,0.109198966429571,0.108327389080707,0.107405652303865,0.106434503663974,0.105414710201933,0.104347057976597,0.103232351600301,0.102071413768163,0.100865084781398,0.0996142220648654,0.0983196996791074,0.0969824078270986,0.0956032523559593,
 0.0941831542538693,0.0927230491424269,0.0912238867646962,0.089686630469191,0.0881122566900392,0.0865017544235756,0.0848561247016157,0.0831763800616523,0.0814635440142294,0.079718650507745,0.0779427433909264,0.076136875873236,0.0743021099834537,0.0724395160266886,0.070550172040069,0.0686351632473628,0.0666955815127786,0.0647325247941936,0.062747096596062,0.0607404054222478,0.0587135642290348,
 0.056667689878554,0.0546039025928779,0.0525233254090291,0.0504270836351378,0.048316304307999,0.0461921156522659,0.044055646541517,0.0419080259614387,0.0397503824753537,0.037583843692335,0.0354095357381317,0.0332285827291375,0.0310421062496354,0.028851224832534,0.0266570534438273,0.024460702970993,0.0222632797155505,0.0200658848899929,0.0178696141193048,0.0156755569472778,0.0134847963478306,
 0.0112984082415343,0.00911746101754993,0.00694301506117043,0.00477612228716621,0.00261782567912161,0.000469158834953931,-0.00166885448120184,-0.00379520078056329,-0.0059088772845451,-0.00800889235270582,-0.0100942659036281,-0.0121640298285632,-0.0142172283976796,-0.0162529186587561,-0.0182701708281668,-0.0202680686740045,-0.0222457098911985,-0.0242022064684846,-0.0261366850470883,-0.0280482872709882,-0.0299361701286295,-0.0317995062859638,
 -0.0336374844106956,-0.0354493094876133,-0.0372342031249026,-0.0389914038513265,-0.0407201674041749,-0.0424197670078825,-0.0440894936432238,-0.0457286563069959,-0.0473365822621031,-0.0489126172779674,-0.0504561258611889,-0.0519664914763842,-0.053443116757141,-0.0548854237070259,-0.0562928538905927,-0.0576648686143374,-0.0590009490975559,-0.0603005966330639,-0.0615633327377405,-0.062788699292866,-0.0639762586742272,-0.065125593871967,-0.0662363086001637,-0.0673080273961252,-0.0683403957093937,-0.0693330799804545,-0.0702857677091563,-0.071198167512846,-0.0720700091742301,-0.0729010436789824,
 -0.0736910432431144,-0.07443980133014,-0.0751471326580581,-0.0758128731961966,-0.0764368801519492,-0.0770190319474562,-0.0775592281862733,-0.0780573896100858,-0.078513458045522,-0.0789273963411314,-0.0792991882945931,-0.0796288385702248,-0.0799163726068679,-0.08016183651623,-0.0803652969717649,-0.0805268410881817,-0.0806465762916719,-0.0807246301809524,-0.0807611503792238,-0.080756304377146,-0.0807102793669423,-0.0806232820677406,-0.0804955385422674,-0.0803272940050135,-0.0801188126219959,-0.0798703773022373,-0.0795822894810978,-0.0792548688955872,-0.0788884533517974,-0.0784833984845914,-0.0780400775096938,-0.0775588809683272,-0.0770402164645425,-0.0764845083953963,
 -0.0758921976741284,-0.0752637414464976,-0.0745996128004336,-0.0739003004691713,-0.0731663085280283,-0.0723981560849959,-0.0715963769653113,-0.0707615193901859,-0.0698941456498595,-0.0689948317711623,-0.0680641671797574,-0.0671027543572484,-0.0661112084933319,-0.065090157133178,-0.0640402398202279,-0.0629621077345898,-0.0618564233272276,-0.0607238599501279,-0.0595651014826367,-0.058380841954162,-0.0571717851634285,-0.0559386442944869,-0.0546821415296655,-0.053403007659665,-0.0521019816909916,-0.0507798104509244,-0.0494372481902171,-0.0480750561837305,-0.046694002329195,-0.045294860744302,-0.0438784113623226,-0.0424454395264524,-0.040996735583082,-0.0395330944741913,-0.038055315329066,-0.0365642010555345,-0.0350605579309239,-0.0335451951929297,-0.032018924630599,-0.030482560175621,-0.0289369174941192,-0.0273828135791425,-0.0258210663440446,-0.0242524942169475,-0.0226779157364766,-0.0210981491489598,-0.0195140120072785,-0.0179263207715556,-0.016335890411869,-0.0147435340131726,-0.0131500623826067,-0.0115562836593809,-0.00996300292740479,-0.00837102183084636,-0.00678113819279113,-0.00519414563717416,-0.00361083321415952,-0.00203198502912983,-0.000458379875457017,0.00110920912878408,0.00267001489999789,0.00422327674398739,0.00576824070645193,0.00730415991891263,0.00883029493991307,0.0103459140913472,0.0118502937897689,0.0133427188725395,0.0148224829186761,0.016288888564263,0.0177412478122899,0.0191788823367922,0.0206011237811589,0.0220073140504912,0.0233968055978847,0.024768961704522,0.02612315675346,0.0274587764969989,0.0287752183175303,0.0300718914817559,0.0313482173881796,0.0326036298077742,0.0338375751177299,0.0350495125281968,0.0362389143019323,0.0374052659667743,0.0385480665208594,0.0396668286305131,0.0407610788207385,0.0418303576582401,0.0428742199269153,0.0438922347957571,0.0448839859791099,0.0458490718892285,0.0467871057810913,0.0476977158894239,0.0485805455578928,0.0494352533604325,0.0502615132146747,0.0510590144874505,0.0518274620923405,0.0525665765792537,0.0532760942160162,0.05395576706196,0.0546053630334999,0.0552246659616955,0.0558134756417962,0.0563716078747733,0.0568988945008436,0.0573951834249974,0.0578603386345438,0.0582942402086914,0.0586967843201877,0.0590678832290408,0.0594074652683551,0.0597154748223121,0.0599918722963358,0.0602366340794796,0.0604497524990823,0.0606312357677403,0.0607811079226447,0.0608994087573431,0.0609861937459786,0.0610415339600736,0.06106551597792,0.0610582417866455,0.0610198286770287,0.0609504091311374,0.0608501307028684,0.0607191558914731,0.0605576620081493,0.060365841035792,0.0601438994819913,0.0598920582253713,0.0596105523553696,0.0592996310055547,0.0589595571805846,0.0585906075769136,0.058193072397353,0.0577672551595986,0.0573134724988378,0.0568320539645518,0.0563233418116318,0.0557876907859302,0.0552254679043692,0.0546370522297332,0.0540228346402718,0.0533832175942438,0.052718614889534,0.0520294514184752,0.0513161629180134,0.0505791957153526,0.0498190064692186,0.0490360619068818,0.0482308385570846,0.0474038224790149,0.0465555089874726,0.0456864023743757,0.0447970156267561,0.0438878701413918,0.0429594954362301,0.0420124288587509,0.0410472152914242,0.0400644068544164,0.0390645626056997,0.0380482482387189,0.0370160357777762,0.0359685032712855,0.0349062344830575,0.0338298185817733,0.0327398498288029,0.0316369272645303,0.0305216543933421,0.0293946388674391,0.0282564921696315,0.0271078292952748,0.025949268433509,0.0247814306479556,0.0236049395570361,0.0224204210140672,0.0212285027872916,0.0200298142400041,0.0188249860109281,0.0176146496949992,0.0163994375247132,0.0151799820521929,0.0139569158321289,0.0127308711057459,0.0115024794859494,0.0102723716438035,0.00904117699648874,0.00780952339689282,0.0065780368249771,0.00534734108107065,0.00411805748123312,0.00289080455483251,0.00166619774448026,0.000444849108462394,-0.000772632974192619,-0.00198564409587129,-0.00319358410962516,-0.00439585741537519,-0.00559187324294384,-0.00678104593178024,-0.00796279520725374,-0.00913654645338902,-0.0103017309819179,-0.0114577862975281,-0.0126041563591889,-0.0137402918374363,-0.0148656503675044,-0.0159796967981879,-0.0170819034363292,-0.0181717502868205,-0.0192487252880176,-0.0203123245424604,-0.021362052542804,-0.0223974223928606,-0.0234179560236593,-0.024423184404432,-0.0254126477484354,-0.0263858957135253,-0.0273424875973972,-0.0282819925274153,-0.0292039896449517,-0.0301080682841611,-0.0309938281451183,-0.0318608794612527,-0.0327088431610127,-0.0335373510236956,-0.0343460458293886,-0.0351345815029585,-0.0359026232520415,-0.0366498476989807,-0.0373759430066653,-0.0380806089982259,-0.0387635572705482,-0.0394245113015638,-0.0400632065512871,-0.040679390556566,-0.0412728230195162,-0.0418432758896181,-0.0423905334394522,-0.042914392334055,-0.043414661693881,-0.0438911631513571,-0.0443437309010235,-0.044772211743252,-0.0451764651215424,-0.0455563631533958,-0.0459117906547692,-0.0462426451581186,-0.046548836924042,-0.0468302889465326,-0.0470869369518625,-0.0473187293911136,-0.0475256274263798,-0.0477076049106652,-0.0478646483615089,-0.0479967569283661,-0.0481039423537814,-0.0481862289283918,-0.048243653439801,-0.0482762651153661,-0.048284125558947,-0.0482673086816636,-0.0482259006267172,-0.0481599996883274,-0.0480697162248445,-0.0479551725660973,-0.0478165029150386,-0.0476538532437558,-0.047467381183913,-0.0472572559116971,-0.0470236580273408,-0.0467667794292976,-0.0464868231831489,-0.0461840033853221,-0.0458585450217043,-0.0455106838212355,-0.0451406661045703,-0.0447487486278968,-0.0443351984220054,-0.0439002926267012,-0.0434443183206557,-0.0429675723467969,-0.0424703611333365,-0.0419530005105377,-0.0414158155233246,-0.0408591402398425,-0.0402833175560728,-0.0396886989966126,-0.0390756445117305,-0.0384445222708086,-0.0377957084522857,-0.0371295870302152,-0.036446549557556,-0.0357469949463107,-0.0350313292446328,-0.0342999654110218,-0.0335533230857263,-0.0327918283594782,-0.0320159135396809,-0.0312260169141752,-0.0304225825127069,-0.0296060598662241,-0.028776903764128,-0.0279355740096047,-0.0270825351731674,-0.026218256344534,-0.0253432108829717,-0.024457876166236,-0.0235627333382326,-0.0226582670555347,-0.0217449652328814,-0.0208233187877915,-0.0198938213844194,-0.0189569691767836,-0.0180132605515006,-0.0170631958701489,-0.016107277211399,-0.015146008113033,-0.0141798933139869,-0.0132094384965427,-0.0122351500287978,-0.0112575347075429,-0.0102770995016708,-0.00929435129624721,-0.00830979663736668,-0.00732394147791956,-0.00633729092439598,-0.00535034898484767,-0.0043636183181326,-0.00337759998456234,-0.00239279319807447,-0.00140969508004874,-0.000428800414884482,0.000549398592542026,0.00152441255742493,0.00249575515346705,0.00346294334909421,0.00442549764133481,0.00538294228725485,0.00633480553283812,0.00728061983920615,0.00821992210606954,0.00915225389230991,0.0100771616335885,0.0109941968568804,0.011902916391837,0.0128028825788794,0.0136936634739278,
 0.0145748330496735,0.0154459713933036,0.0163066649005877,0.0171565064662419,0.0179950956704824,0.0188220389616894,0.019636949835098,0.0204394490074385,0.0212291645874509,0.0220057322421994,0.0227687953591133,0.0235180052036899,0.0242530210727861,0.0249735104434401,0.0256791491171583,0.0263696213596067,0.0270446200356535,0.0277038467397033,0.0283470119212749,0.0289738350057704,0.02958404451039,0.030177378155147,0.0307535829689406,0.0313124153906489,0.0318536413652032,0.0323770364346098,0.0328823858238901,0.0333694845219051,0.0338381373570427,0.0342881590677419,0.0347193743678329,0.0351316180066747,0.0355247348240743,0.0358985797999757,0.0362530180989058,0.0365879251091717,0.0369031864768027,0.0371986981342348,0.0374743663237385,0.0377301076155912,0.0379658489210016,0.038181527499791,0.0383770909628458,0.0385524972693506,0.0387077147188212,0.0388427219379517,0.038957507862301,0.0390520717128379,0.0391264229673738,0.0391805813269093,0.0392145766769267,0.0392284490436607,0.0392222485453834,0.0391960353387427,0.0391498795601926,0.0390838612625587,0.0389980703467861,0.0388926064889138,0.0387675790623279,0.0386231070553441,
 0.0384593189841745,0.038276352801333,0.038074355799542,0.0378534845111942,0.0376139046034402,0.0373557907689584,0.0370793266124798,0.0367847045331337,0.0364721256026844,0.0361417994397319,0.0357939440799517,0.0354287858424473,0.0350465591922946,0.0346475065993586,0.0342318783934602,0.0337999326159794,0.033351934867976,0.0328881581549164,0.0324088827280907,0.0319143959228117,0.0314049919934835,0.030880971945632,0.0303426433649903,0.029790320243732,0.0292243228039485,0.0286449773184645,0.0280526159290918,0.0274475764624172,0.0268302022432251,0.0262008419056547,0.0255598492021924,0.0249075828106016,0.0242444061388932,0.0235706871284385,0.022886798055331,0.0221931153300989,0.021490019295875,0.0207778940251304,0.0200571271150767,0.0193281094818434,0.0185912351535375,0.017846901062294,0.0170955068354215,0.0163374545857532,0.0155731487013096,0.0148029956343802,0.0140274036901342,0.0132467828148645,0.0124615443839753,0.0116721009898197,0.010878866229494,0.0100822544926968,0.00928268074975849,0.00848056033994836,0.00767630876016376,0.00687034145410842,0.00606307360206417,0.00525491991135925,0.00444629440763855,0.00363761022703795,0.00282927940936458,0.00202171269238638,0.00121531930732854,0.000410506775680379,-0.000392319292591773,-0.00119275539932617,-0.0019904003568439,-0.0027848554849301,-0.00357572480602225,-0.00436261523851059,-0.0051451367880615,-0.0059229027368688,-0.00669552983074627,-0.00746263846397085,-0.00822385286178995,-0.00897880126050736,-0.00972711608506233,-0.0104684341240196,-0.0112023967018897,-0.0119286498486974,-0.0126468444667235,-0.0133566364943391,-0.0140576870668615,-0.0147496626743549,-0.0154322353163073,-0.0161050826531121,-0.0167678881542856,-0.0174203412433572,-0.0180621374393646,-0.0186929784948938,-0.0193125725306023,-0.0199206341661661,-0.0205168846475966,-0.0211010519708691,-0.0216728710018125,-0.0222320835922094,-0.0227784386920557,-0.0233116924579366,-0.0238316083574713,-0.0243379572697852,-0.0248305175819706,-0.0253090752814939,-0.0257734240445179,-0.0262233653201023,-0.0266587084102499,-0.0270792705457726,-0.0274848769579454,-0.0278753609459267,-0.0282505639399193,-0.0286103355600531,-0.02895453367097,-0.029283024432094,-0.0295956823435738,-0.029892390287885,-0.0301730395670819,-0.0304375299356923,-0.0306857696292481,-0.0309176753884519,-0.0311331724789745,-0.0313321947068879,-0.0315146844297365,-0.0316805925632501,-0.03182987858371,-0.0319625105259754,-0.0320784649771836,-0.0321777270661381,-0.0322602904484012,-0.0323261572871093,-0.0323753382295314,-0.0324078523793953,-0.0324237272650037,-0.0324229988031694,-0.0324057112589975,-0.0323719172015455,-0.0323216774553951,-0.0322550610481696,-0.0321721451540349,-0.0320730150332222,-0.0319577639676131,-0.0318264931924307,-0.0316793118240799,-0.0315163367841841,-0.0313376927198668,-0.0311435119203262,-0.0309339342297567,-0.0307091069566693,-0.0304691847796661,-0.0302143296497258,-0.0299447106890591,-0.0296605040865921,-0.029361892990141,-0.0290490673953409,-0.0287222240313915,-0.028381566243687,-0.0280273038733983,-0.0276596531340729,-0.0272788364853266,-0.0268850825036951,-0.0264786257507203,-0.0260597066383421,-0.0256285712916748,-0.0251854714092403,-0.0247306641207374,-0.0242644118424243,-0.0237869821301947,-0.0232986475304263,-0.0227996854286841,-0.0222903778963592,-0.021771011535327,-0.0212418773207075,-0.0207032704418132,-0.0201554901413684,-0.019598839553086,-0.0190336255376889,-0.0184601585174618,-0.0178787523094215,-0.017289723957194,-0.0166933935616847,-0.0160900841106333,-0.0154801213071404,-0.0148638333972561,-0.0142415509967193,-0.0136136069169392,-0.0129803359903073,-0.0123420748949298,-0.0116991619788734,-0.011051937084011,-0.0104007413695593,-0.00974591713539885,-0.00908780764526554,-0.00842675694990374,-0.00776310971027038,-0.00709721102088,-0.0064294062333792,-0.00576004078043931,-0.00508946000005613,-0.0044180089603443,-0.00374603228491339,-0.00307387397891339,-0.00240187725583507,-0.00173038436515273,-0.00105973642089168,-0.000390273231208218,0.000277666870936983,0.000943747195927376,0.00160763286437935,0.00226899097268967,0.00292749075716241,0.00358280375663249,0.00423460397351205,0.00488256803317746,0.00552637534162358,0.00616570824130806,0.00680025216511183,0.00742969578834302,0.00805373117871052,0.0086720539441988,0.00928436337877218,0.00989036260584077,0.010489758719422,0.0110822629229305,0.0116675906655331,0.0122454617760051,0.0128156005940267,0.0133777360988594,0.0139316020353439,0.0144769370371622,0.015013484747307,0.0155409939357074,0.0160592186139548,0.0165679181470811,0.0170668573623377,0.0175558066549289,0.0180345420906533,0.0185028455054086,0.0189605046015186,0.0194073130408385,0.0198430705346032,0.0202675829299774,0.0206806622932754,0.0210821269898129,0.0214718017603625,0.0218495177941796,0.0222151127985721,0.0225684310649855,0.022909323531581,0.023237647842281,0.0235532684022619,0.0238560564298757,0.0241458900049818,0.0244226541136733,0.0246862406893854,0.0249365486503725,0.0251734839335446,0.0253969595246556,0.0256068954848355,0.0258032189734641,0.0259858642673823,0.0261547727764399,0.0263098930553838,0.0264511808120857,0.0265785989121173,0.0266921173796785,0.0267917133948868,0.0268773712874393,0.0269490825266584,0.0270068457079359,0.0270506665355912,0.0270805578021602,0.0270965393641366,0.0270986381141831,0.0270868879498387,0.027061329738745,0.0270220112804172,0.0269689872645892,0.0269023192261613,0.0268220754967821,0.0267283311530974,0.0266211679617004,0.02650067432082,0.0263669451987833,0.0262200820692939,0.0260601928435634,0.0258873917993413,0.0257017995068857,0.0255035427519194,0.0252927544556185,0.0250695735916822,0.0248341451005308,0.0245866198006853,0.0243271542973778,0.0240559108884488,0.0237730574675825,0.0234787674249386,0.0231732195452361,0.0228565979033475,0.0225290917574612,0.0221908954398751,0.0218422082454798,0.0214832343179955,0.0211141825340239,0.0207352663849829,0.0203467038569849,0.0199487173087275,0.0195415333474633,0.0191253827031149,0.0187005001006056,0.018267124130473,0.0178254971178374,0.0173758649897937,0.0169184771412997,0.0164535862996304,0.0159814483874738,0.0155023223847373,0.0150164701891418,0.0145241564756738,0.0140256485549719,0.0135212162307227,0.0130111316561379,0.0124956691895912,0.0119751052494879,0.0114497181684446,0.0109197880468538,0.0103855966059087,0.00984742704016562,0.00930556386971926,0.00876029279206605,0.00821190053373426,0.00766067470175299,0.00710690363503945,0.00655087625577791,0.00599288192086684,0.0054332102735096,0.00487215109502279,0.00430999415693893,0.00374702907347535,0.00318354515444554,0.00261983125868588,0.00205617564807024,0.00149286584218636,0.000930188473745678,0.000368429144797911,-0.000192127716177123,-0.00075119899623179,-0.00130850303889563,-0.00186375978403549,-0.00241669090655966,-0.00296701995390177,-0.00351447248221492,-0.00405877619121137,
 -0.00459966105758125,-0.00513685946692752,-0.00567010634415242,-0.00619913928223348,-0.00672369866932763,
 -0.00724352781414226,-0.00775837306951439,-0.00826798395413882,-0.0087721132723888,-0.00927051723217174,-0.00976295556076585,-0.0102491916185829,-0.010728992510805,-0.0112021291968433,-0.011668376597568,-0.012127513700262,-0.0125793236612476,-0.0130235939061431,-0.0134601162277011,-0.0138886868811863,-0.01430910667725,-0.0147211810722588,-0.0151247202560408,-0.0155195392370066,-0.0159054579246124,-0.016282301209127,-0.0166498990386691,-0.0170080864934834,-0.0173567038574233,-0.0176955966866107,-0.0180246158752456,-0.0183436177185377,-0.0186524639727363,-0.0189510219122339,-0.0192391643837213,-0.0195167698573758,-0.0197837224750605,-0.0200399120955206,-0.020285234336558,-0.0205195906141727,-0.0207428881786562,-0.0209550401476275,-0.0211559655360013,-0.0213455892828807,-0.0215238422753687,-0.021690661369293,-0.0218459894068419,-0.0219897752311082,-0.0221219736975437,-0.0222425456823232,-0.022351458087623,-0.0224486838438175,-0.0225342019086017,-0.0226079972630452,-0.0226700609045897,-0.0227203898369986,-0.0227589870572723,-0.0227858615395437,-0.022801028215968,-0.022804507954624,-0.0227963275344473,-0.0227765196172116,-0.0227451227165837,-0.0227021811642712,-0.0226477450732896,-0.0225818702983737,-0.0225046183935598,-0.0224160565669675,-0.022316257632811,-0.0222052999606713,-0.0220832674220598,-0.02195024933431,-0.02180634040183,-0.021651640654752,-0.0214862553850185,-0.0213102950799412,-0.0211238753532741,-0.0209271168738413,-0.0207201452917622,-0.0205030911623162,-0.0202760898674933,-0.0200392815352739,-0.0197928109566856,-0.0195368275006853,-0.0192714850269128,-0.0189969417963675,-0.0187133603800582,-0.0184209075656767,-0.018119754262348,-0.0178100754035098,-0.0174920498479764,-0.0171658602792401,-0.016831693103066,-0.0164897383434382,-0.0161401895369109,-0.0157832436254263,-0.0154191008476533,-0.0150479646289088,-0.01467004146972,-0.0142855408330878,-0.0138946750305117,-0.0134976591068377,-0.0130947107239892,-0.0126860500436456,-0.0122718996089275,-0.0118524842251538,-0.0114280308397327,-0.0109987684212487,-0.0105649278378112,-0.0101267417347275,-0.0096844444115627,-0.0092382716986541,-0.00878846083313997,-0.0083352503345707,-0.00787887988016375,-0.00741959017977004,-0.00695762285061262,-0.00649322029186454,-0.00602662555912889,-0.00555808223888623,-0.00508783432297227,-0.00461612608315054,-0.0041432019458434,-0.00366930636708469,-0.00319468370775774,-0.00271957810918098,-0.00224423336910424,-0.00176889281817742,-0.00129379919695379,-0.000819194533489142,-0.000345320021597831,0.000127584100174339,0.000599278668799195,0.00106952571617924,0.00153808858766556,0.00200473205962055,0.00246922245597072,0.00293132776369035,0.00339081774716058,0.00384746406134855,0.00430104036375061,0.00475132242504707,0.00519808823841396,0.00564111812743961,0.00608019485259522,0.00651510371620631,0.00694563266587838,0.00737157239632471,0.00779271644955021,0.00820886131334328,0.00861980651802962,0.00902535473144288,0.00942531185206835,0.00981948710031542,0.0102076931078787,0.0105897460051442,0.0109654655066033,0.0113346749942337,0.0116972015988115,0.012052876279115,0.0124015338989891,0.0127430133022313,0.013077157385271,0.0134038131676064,0.0137228318599706,0.014034068930197,0.0143373841667557,0.014632641739935,0.01491971026064,0.0151984628367875,0.0154687771272713,0.0157305353934762,0.0159836245483238,0.0162279362028256,0.01646336671013,0.0166898172070445,0.0169071936530183,0.0171154068665722,0.0173143725591621,0.0175040113664656,0.0176842488770823,0.0178550156586383,0.0180162472812887,0.018167884338611,0.018309872465887,0.0184421623557679,0.0185647097713225,0.0186774755564665,0.0187804256437758,0.0188735310596837,0.0189567679270676,0.019030117465229,0.0190935659872729,0.0191471048948949,0.0191907306705839,0.0192244448672514,0.0192482540952976,0.0192621700071291,0.0192662092791391,0.0192603935911679,0.0192447496034598,0.0192193089311318,0.0191841081161767,0.0191391885970174,0.0190845966756357,0.0190203834822978,0.0189466049378991,0.0188633217139549,0.0187705991902617,0.0186685074102565,0.0185571210341025,0.0184365192895309,0.0183067859204682,0.0181680091334815,0.0180202815420732,0.0178637001088602,0.0176983660856705,0.0175243849515933,0.0173418663490196,0.01715092401771,0.016951675726928,0.016744243205679,0.0165287520710933,0.016305331754996,0.0160741154287042,0.0158352399260948,0.0155888456649855,0.0153350765668743,0.0150740799750811,0.0148060065713377,0.0145310102908722,0.0142492482360351,0.0139608805885139,0.0136660705201842,0.0133649841026483,0.0130577902155067,0.0127446604534163,0.0124257690319824,0.0121012926925373,0.0117714106058561,0.0114363042748611,0.0110961574363676,0.010751155961922,0.0104014877577871,0.0100473426641261,0.00968891235343915,0.00932639022830554,0.00895997131848668,0.00858985217744296,0.00821623077831776,0.00783930640944577,0.00745927956943648,0.00707635186189118,0.00669072588980389,0.00630260514970595,0.00591219392560345,0.00551969718276637,0.00512532046142244,0.00472926977040892,0.00433175148083997,0.0039329722198398,0.00353313876439927,0.00313245793540826,0.00273113649191582,0.00232938102567641,0.00192739785602901,0.00152539292516795,0.00112357169385325,0.000722139037616026,0.000321299143509566,-7.87445925439102e-05,-0.000477789667756481,-0.000875634573781077,-0.00127207889726798,-0.00166692341962379,-0.00205997021592246,-0.0024510227529216,-0.00283988598613406,-0.00322636645590846,-0.00361027238247303,-0.00399141375989388,-0.00436960244890573,-0.00474465226856735,-0.00511637908669945,-0.00548460090906132,-0.00584913796722293,-0.00620981280509261,-0.00656645036405622,-0.00691887806669127,-0.00726692589901343,-0.0076104264912184,-0.0079492151968822,-0.00828313017058056,-0.00861201244389523,-0.00893570599976737,-0.00925405784516927,-0.00956691808205708,-0.00987413997657404,-0.0101755800264738,-0.0104710980267317,-0.0107605571333162,-0.011043823925092,-0.0113207684638271,-0.0115912643522783,-0.0118551887903295,-0.012112422629159,-0.0123628504234125,-0.0126063604813613,-0.0128428449130214,-0.0130721996762183,-0.0132943246205751,-0.0135091235294078,-0.0137165041595128,-0.013916378278827,-0.0141086617019519,-0.014293274323524,-0.0144701401494217,-0.014639187325798,-0.0148003481659278,-0.0149535591748634,-0.0150987610718883,-0.0152358988107658,-0.0153649215977745,-0.015485782907529,-0.0155984404965815,-0.0157028564148031,-0.0157989970145448,-0.0158868329575775,-0.0159663392198137,-0.0160374950938136,-0.016100284189079,-0.0161546944301414,-0.0162007180524483,-0.0162383515960573,-0.0162675958971449,-0.0162884560773407,-0.0163009415308957,-0.0163050659096987,-0.0163008471061524,-0.0162883072339218,-0.016267472606573,-0.0162383737141145,-0.0162010451974609,-0.0161555258208357,-0.0161018584421317,-0.0160400899812505,-0.0159702713864408,-0.0158924575986573,-0.0158067075139647,-0.0157130839440085,-0.0156116535745792,-0.0155024869222945,-0.015385658289426,-0.0152612457168996,-0.015129330935495,-0.0149899993152762,-0.0148433398132821,
 -0.0146894449195071,-0.0145284106012046,-0.0143603362455461,-0.0141853246006673,-0.014003481715137,-0.0138149168758828,-0.0136197425446085,-0.0134180742927402,-0.013210030734937,-0.0129957334612042,-0.0127753069676474,-0.0125488785859041,-0.0123165784112954,-0.0120785392297338,-0.0118348964434313,-0.0115857879954438,-0.0113313542930995,-0.0110717381303458,-0.0108070846090634,-0.0105375410593866,-0.0102632569590728,-0.009984383851968,-0.00970107526560753,-0.00941348662799972,-0.00912177518363594,-0.00882609990877025,-0.00852662142601712,-0.0082235019183083,-0.00791690504225832,-0.00760699584098105,-0.00729394065640554,-0.00697790704113637,-0.00665906366990342,-0.00633758025065011,-0.00601362743530315,-0.00568737673027296,-0.0053590004067294,-0.0050286714107004,-0.00469656327303836,-0.00436285001930248,-0.0040277060796026,-0.00369130619844927,-0.0033538253446594,-0.00301543862135968,-0.00267632117613655,-0.00233664811137679,-0.00199659439484433,-0.00165633477053924,-0.00131604366988201,-0.000975895123270568,-0.000636062672051198,-0.000296719280950014,4.19627489923029e-05,0.000379811866940294,0.000716657358192284,0.00105232942947911,0.00138665929358587,0.00171947925326048,0.00205062278436349,0.00237992461822022,0.00270722082313579,0.00303234888503091,0.0033551477871623,0.00367545808888596,0.00399312200342837,0.00430798347462561,0.00461988825259516,0.00492868396830372,0.00523422020699499,0.00553634858044424,0.00583492279800283,0.00612979873640211,0.00642083450828168,0.00670789052941064,0.00699082958457223,0.00726951689207744,0.00754382016688266,0.00781360968227803,0.0080787583301217,0.00833914167959037,0.00859463803442024,0.00884512848861381,0.0090904969805854,0.00933063034572383,0.00956541836734724,0.00979475382602877,0.0100185325472712,0.0102366534475113,0.010449018578432,0.0106555331695659,0.0108561056691723,0.0110506477833682,0.0112390745135014,0.0114213041917481,0.0115972585149209,0.0117668625764763,0.0119300448967067,0.012086737451109,0.0122368756969161,0.0123803985977855,0.0125172486466337,0.0126473718866118,0.0127707179302138,0.0128872399765134,0.0129968948265257,0.0130996428966874,0.0131954482304574,0.0132842785080317,0.0133661050541769,0.0134409028441778,0.013508650507905,0.0135693303320019,0.0136229282601955,0.0136694338917359,0.0137088404779684,0.0137411449170453,0.0137663477467848,0.013784453135684,0.013795468872096,0.0137994063515803,0.0137962805624378,0.0137861100694423,0.0137689169957797,0.0137447270032108,0.0137135692704695,0.0136754764699141,0.0136304847424457,0.0135786336707118,0.013519966250613,0.0134545288611308,0.0133823712324961,0.0133035464127194,0.0132181107325022,0.0131261237685533,0.0130276483053306,0.0129227502952339,0.0128114988172705,0.01269396603422,0.0125702271483237,
 0.0124403603555234,0.0123044467982785,0.0121625705169872,0.0120148184000414,0.0118612801325425,0.0117020481437095,0.0115372175530078,0.0113668861150299,0.01119115416316,0.0110101245520525,0.0108239025989582,0.0106325960239306,0.0104363148889449,0.0102351715359648,0.0100292805239893,0.0098187585651169,0.00960372445965929,0.00938429903034274,0.00916060505563078,0.00893276720220603,0.00870091195664717,0.00846516755633744,0.00822566391964303,0.00798253257539762,0.00773590659173174,0.0074859205042846,0.0072327102438365,0.00697641306340084,0.00671716746481301,0.00645511312485713,0.00619039082096706,0.00592314235654277,0.00565351048592053,0.00538163883903519,0.00510767184581618,0.00483175466035329,0.0045540330848758,0.00427465349357983,0.0039937627563468,0.00371150816239089,0.00342803734387407,0.00314349819952992,0.00285803881833284,0.00257180740325433,0.00228495219514193,0.00199762139676367,0.00170996309705199,0.00142212519558895,0.00113425532736956,0.000846500787880119,0.000559008458531536,0.000271924732482214,-1.46045591101362e-05,-0.000300434220371862,-0.000585419763496916,-0.00086941748099089,-0.00115228451734445,-0.00143387894009652,-0.00171405981025575,-0.00199268725204318,-0.00226962252192313,-0.0025447280768894,-0.0028178676419714,-0.00308890627693019,-0.00335771044210987,-0.00362414806341412,-0.00388808859637569,-0.00414940308928949,-0.00440796424537761,-0.0046636464839576,-0.00491632600058568,-0.00516588082614467,-0.00541219088485123,-0.00565513805115323,-0.00589460620549209,-0.00613048128890367,-0.00636265135643233,-0.00659100662933489,-0.00681543954604841,-0.00703584481190112,-0.00725211944754226,-0.00746416283606952,-0.00767187676883409,-0.00787516548990105,-0.00807393573914805,-0.00826809679398036,-0.00845756050964779,-0.0086422413581431,-0.00882205646566693,-0.00899692564864383,-0.00916677144827267,-0.00933151916359955,-0.00949109688309758,-0.00964543551474288,-0.00979446881457346,-0.00993813341372092,-0.0100763688439045,-0.010209117561378,-0.0103363249693214,-0.0104579394386686,-0.0105739123273658,-0.0106841979980529,-0.0107887538341635,-0.0108875402544387,-0.0109805207258519,-0.0110676617749403,-0.0111489329975425,-0.0112243070669403,-0.0112937597404047,-0.0113572698641464,-0.0114148193766721,-0.0114663933105489,-0.0115119797925796,-0.0115515700423923,-0.0115851583694502,-0.0116127421684842,-0.011634321913358,-0.0116499011493693,-0.0116594864839974,-0.0116630875761036,-0.0116607171235953,-0.0116523908495633,-0.0116381274869016,-0.0116179487614245,-0.01159187937349,-0.011559946978144,-0.0115221821637997,-0.0114786184294646,-0.0114292921605328,-0.0113742426031564,-0.0113135118372135,-0.0112471447478901,-0.0111751889958936,-0.0110976949863162,-0.0110147158361677,-0.010926307340598,-0.0108325279378291,-0.0107334386728173,-0.010629103159669,-0.0105195875428304,-0.010404960457075,-0.0102852929863125,-0.0101606586212424,-0.0100311332158768,-0.00989679494295863,-0.0097577242482986,-0.00961400380405963,-0.00946571846101251,-0.00931295519979207,-0.00915580308117954,-0.00899435319544003,-0.00882869861074312,-0.00865893432069448,-0.00848515719100898,-0.00830746590535331,-0.00812596091038898,-0.00794074436004472,-0.00775192005904976,-0.00755959340575842,-0.00736387133429605,-0.00716486225605968,-0.00696267600060248,-0.00675742375593618,-0.00654921800828116,-0.00633817248129907,-0.00612440207483747,-0.00590802280322156,-0.00568915173312446,-0.00546790692104879,-0.00524440735045367,-0.00501877286855874,-0.00479112412285956,-0.00456158249738753,-0.00433027004874617,-0.00409730944195998,-0.00386282388616572,-0.00362693707018273,-0.00338977309799299,-0.003151456424166,-0.0029121117892613,-0.00267186415524059,-0.00243083864092491,-0.00218916045752725,-0.00194695484429555,-0.00170434700429766,-0.00146146204038147,-0.0012184248913417,-0.000975360268326886,-0.000732392591517812,-0.000489645927108687,-0.000247243924624318,-5.30975460243513e-06,0.000236033953325795,0.000476665171927516,0.000716462537401301,0.000955305409921098,0.00119307393366231,0.00142964909627861,0.00166491278780243,0.00189874785893866,0.00213103817872366,0.00236166869152247,0.00259052547333456,0.00281749578738374,0.00304246813896196,0.00326533232950441,0.00348597950986719,0.00370430223278326,0.00392019450447253,0.00413355183537976,0.00434427129001857,0.00455225153589615,0.00475739289149763,0.00495959737330628,0.00515876874183869,0.00535481254667346,0.00554763617045255,0.00573714887183583,0.00592326182738836,0.00610588817238264,0.0062849430404968,0.00646034360239086,0.0066320091031453,0.00679986089854376,0.00696382249018553,0.00712381955941148,0.00727978000003043,0.00743163394983033,0.00757931382086227,0.00772275432848474,0.00786189251915527,0.00799666779695974,0.00812702194886731,0.00825289916870263,0.00837424607982448,0.00849101175650416,0.0086031477439945,0.00871060807728278,0.00881334929852171,0.00891133047313174,0.00900451320457065,0.00909286164776552,0.00917634252120344,0.00925492511767886,0.00932858131369381,0.00939728557751129,0.00946101497585938,0.00951974917928708,0.00957347046617182,0.00962216372537994,0.00966581645758253,0.00970441877522852,0.009737963401179,0.00976644566600632,0.0097898635039628,0.00980821744762438,0.00982151062121513,0.00982974873261936,0.00983294006408858,0.00983109546165142,0.00982422832323481,0.00981235458550606,0.00979549270944552,0.00977366366466025,0.00974689091245019,0.00971520038763806,0.00967862047917592,0.00963718200954081,0.00959091821293355,0.00953986471229418,0.00948405949514948,0.00942354288830723,0.00935835753141334,0.00928854834938809,0.00921416252375845,0.0091352494629039,0.0090518607712336,0.00896405021731353,0.00887187370096227,0.0087753892193352,0.00867465683201655,0.00856973862514042,0.0084606986745602,0.00834760300808965,0.00823051956683513,0.00810951816564266,0.00798467045268168,0.00785604986818808,0.00772373160239066,0.00758779255264339,0.00744831127978855,0.00730536796377458,0.00715904435855267,0.00700942374627865,0.00685659089084313,0.00670063199075772,0.00654163463142106,0.00637968773679228,0.00621488152049734,0.00604730743639451,0.00587705812862679,0.00570422738118674,0.00552891006702204,0.00535120209670837,0.00517120036671732,0.00498900270730639,0.00480470783005945,0.00461841527510535,0.00443022535804147,0.00424023911659229,0.00404855825702851,0.00385528510037713,0.00366052252844892,0.00346437392971236,0.0032669431450421,0.00306833441336933,0.00286865231726372,0.00266800172847322,0.00246648775345124,0.00226421567889881,0.00206129091734865,0.001857818952821,0.00165390528657631,0.00144965538299551,0.00124517461561208,0.00104056821332573,0.000835941206823879,0.000631398375237409,0.000427044193058939,0.000222982777348388,1.93178352541884e-05,-0.000183847388125652,-0.000386410161515063,-0.000588268318839344,-0.000789320310186792,-0.000989465252327088,-0.00118860297876263,-0.00138663408928657,-0.00158345999902536,-0.00177898298694016,-0.00197310624376432,-0.00216573391935424,-0.00235677116942952,-0.00254612420168104,-0.00273370032122396,-0.00291940797537506,-0.00310315679773186,-0.00328485765153321,-0.00346442267228144,-0.00364176530960462,-0.00381680036834099,-0.00398944404882473,-0.00415961398635617,-0.00432722928983605,-0.00449221057954843,-0.00465448002407309,-0.0048139613763114,-0.00497058000860979,-0.00512426294696376,-0.0052749389042889,-0.00542253831274242,-0.00556699335508204,-0.00570823799504863,-0.00584620800675817,-0.00598084100309234,-0.00611207646307367,-0.00623985575821544,-0.00636412217783413,-0.00648482095331432,-0.00660189928131711,-0.00671530634592089,-0.00682499333968802,-0.00693091348364723,-0.00703302204618568,-0.00713127636084265,-0.00722563584299943,-0.00731606200545875,-0.00740251847290887,-0.007484970995268,-0.00756338745990427,-0.00763773790272864,-0.00770799451815706,-0.00777413166794024,-0.00783612588885893,-0.00789395589928373,-0.00794760260459901,-0.00799704910149072,-0.00804228068109908,-0.00808328483103711,-0.00812005123627679,-0.00815257177890557,-0.00818084053675577,
 -0.00820485378091061,-0.00822460997209095,-0.0082401097559274,-0.008251355957123,-0.00825835357251226,-0.00826110976302289,-0.00825963384454712,-0.00825393727773002,-0.00824403365668277,-0.00822993869662941,-0.0082116702204961,-0.00818924814445231,-0.00816269446241429,-0.00813203322952095,-0.00809729054459371,-0.00805849453159143,-0.0080156753200729,-0.00796886502467894,-0.0079180977236477,-0.00786340943637592,-0.00780483810004095,-0.00774242354529683,-0.0076762074710605,-0.00760623341840202,-0.00753254674355573,-0.00745519459006761,-0.00737422586009549,-0.00728969118487935,-0.00720164289439836,-0.00711013498623295,-0.00701522309364934,-0.00691696445292533,-0.00681541786993564,-0.0067106436860163,-0.00660270374312707,-0.00649166134833156,-0.00637758123761547,-0.0062605295390625,-0.00614057373540916,-0.00601778262599883,-0.0058922262881563,-0.00576397603800424,-0.00563310439074258,-0.00549968502041355,-0.00536379271917322,-0.00522550335609256,-0.00508489383551021,-0.00494204205495889,-0.00479702686268925,-0.00464992801481257,-0.00450082613208717,-0.00434980265636944,-0.00419693980675458,-0.00404232053542953,-0.00388602848326118,-0.00372814793514442,-0.00356876377513224,-0.00340796144137294,-0.00324582688087654,-0.00308244650413554,-0.00291790713962266,-0.00275229598818971,-0.00258570057739144,-0.00241820871575722,-0.00224990844703554,-0.00208088800443331,-0.00191123576487488,-0.00174104020330362,-0.00157038984704899,-0.00139937323028345,-0.0012280788485914,-0.00105659511367404,-0.000885010308212022,-0.000713412540909905,-0.000541889701744389,-0.000370529417438411,-0.000199419007184688,-2.86454386391724e-05,0.000141704715791932,0.000311545322351528,0.000480790728994517,0.000649355808093498,0.000817155998766742,0.000984107348806231,0.00115012655618751,0.00131513101013779,0.00147903883174615,0.00164176891409281,0.00180324096188044,0.00196337553054684,0.00212209406484084,0.00227931893684354,0.00243497348341522,0.00258898204305202,0.00274126999213338,0.00289176378054382,0.00304039096665289,0.00318708025163551,0.00333176151311843,0.00347436583813595,0.00361482555538014,0.00375307426673132,0.00388904687805323,0.00402267962924054,0.00415391012350339,0.00428267735587738,0.00440892174094537,0.00453258513975951,0.00465361088595093,0.00477194381101678,0.0048875302687727,0.00500031815896078,0.00511025695000341,0.00521729770089245,0.005321393082206,0.00542249739624305,0.00552056659626851,0.00561555830486112,0.00570743183135652,0.00579614818837955,0.00588167010745905,0.00596396205371965,0.00604299023964567,0.006118722637912,0.0061911289932778,0.00626018083353982,0.00632585147954145,0.00638811605423505,0.00644695149079577,0.0065023365397841,0.00655425177535714,0.00660267960052678,0.00664760425146518,0.00668901180085765,0.00672689016030345,0.00676122908176597,0.00679202015807388,0.0068192568224754,0.00684293434724847,0.00686304984136987,0.00687960224724698,0.00689259233651608,0.00690202270491214,0.00690789776621478,0.00691022374527592,0.00690900867013539,0.00690426236323048,0.00689599643170657,0.00688422425683606,0.00686896098255334,0.00685022350311395,0.00682803044988654,0.00680240217728674,0.00677336074786232,0.00674092991653943,0.00670513511404041,0.00666600342948348,0.00662356359217583,0.00657784595261114,0.00652888246268357,0.00647670665513047,0.00642135362221613,0.00636285999366974,0.00630126391389078,0.00623660501843537,0.00616892440979761,0.00609826463250009,0.00602466964750847,0.0059481848059844,0.00586885682239295,0.00578673374697901,0.00570186493762922,0.00561430103113523,0.00552409391387439,0.00543129669192503,0.0053359636606324,0.00523815027364322,0.00513791311142525,0.00503530984929013,0.00493039922493699,0.00482324100553433,0.00471389595435921,0.00460242579701116,0.00448889318721966,0.0043733616722642,0.00425589565802507,0.004136560373684,0.00401542183609403,0.00389254681383765,0.00376800279099204,0.00364185793062176,0.00351418103801726,0.00338504152369975,0.00325450936621163,0.00312265507471182,0.00298954965139679,0.00285526455376563,0.00271987165675057,0.00258344321473122,0.00244605182345363,0.00230777038187339,0.0021686720539424,0.00202883023036007,0.00188831849030696,0.00174721056318321,0.00160558029036844,0.00146350158702526,0.00132104840396418,0.00117829468959045,0.0010353143519519,0.000892181220906407,0.000748969010429438,0.000605751281079199,0.000462601402639519,0.000319592516958703,0.000176797501002549,3.42889301410701e-05,-0.000107860958314117,-0.000249580301302546,-0.000390797645920318,-0.000531441985020898,-0.000671442792492635,-0.000810730058197295,-0.000949234322550692,-0.00108688671073022,-0.00122361896649147,-0.00135936348557853,-0.00149405334871076,-0.00162762235413137,-0.00176000504970118,-0.00189113676452272,-0.00202095364007996,-0.00214939266087792,-0.00227639168456902,-0.0024018894715508,-0.00252582571402182,-0.00264814106448246,-0.0027687771636664,-0.00288767666789124,-0.00300478327581456,-0.00312004175458374,-0.00323339796536792,-0.00334479888826015,-0.00345419264653828,-0.00356152853027509,-0.00366675701928568,-0.00376982980540297,-0.00387069981407155,-0.00396932122525004,-0.00406564949361391,-0.00415964136804923,-0.0042512549104298,-0.00434044951367,-0.00442718591904523,-0.00451142623277396,-0.00459313394185402,-0.00467227392914711,-0.00474881248770633,-0.00482271733434035,-0.0048939576224102,-0.00496250395385362,-0.00502832839043273,-0.00509140446420189,-0.00515170718719161,-0.00520921306030623,-0.0052639000814326,-0.00531574775275781,-0.00536473708729396,-0.00541085061460937,-0.00545407238576448,-0.00549438797745298,-0.00553178449534731,-0.00556625057664943,-0.00559777639184753,
 -0.00562635364567969,-0.00565197557730641,-0.00567463695969378,-0.00569433409820979,-0.00571106482843655,-0.00572482851320177,-0.00573562603883286,-0.00574345981063785,-0.00574833374761739,-0.00575025327641265,-0.00574922532449426,-0.00574525831259774,-0.00573836214641151,-0.00572854820752344,-0.00571582934363289,-0.00570021985803501,-0.00568173549838472,-0.00566039344474815,-0.00563621229694942,-0.00560921206122126,-0.00557941413616825,-0.00554684129805166,-0.00551151768540502,-0.00547346878299081,-0.00543272140510751,-0.00538930367825778,-0.00534324502318837,-0.00529457613631248,-0.00524332897052591,-0.00518953671542864,-0.00513323377696331,-0.00507445575648276,-0.00501323942925908,-0.00494962272244652,-0.0048836446925111,-0.00481534550214016,-0.00474476639664476,-0.00467194967986881,-0.00459693868961849,-0.00451977777262569,-0.00444051225906017,-0.00435918843660394,-0.00427585352410332,-0.0041905556448125,-0.00410334379924412,-0.00401426783764162,-0.00392337843208837,-0.00383072704826952,-0.00373636591690094,-0.0036403480048426,-0.00354272698590992,-0.00344355721140095,-0.00334289368035381,-0.00324079200955149,-0.00313730840328953,-0.00303249962292274,-0.00292642295620788,-0.0028191361864577,-0.00271069756152356,-0.00260116576262272,-0.00249059987302637,-0.00237905934662593,-0.00226660397639285,-0.00215329386274949,-0.00203918938186721,-0.00192435115390781,-0.00180884001122575,-0.00169271696654636,-0.00157604318113799,-0.00145887993299307,-0.00134128858503559,-0.00122333055337023,-0.00110506727559064,-0.000986560179161664,-0.000867870649892684,-0.000749060000517654,-0.000630189439397319,-0.000511320039360377,-0.000392512706698102,-0.000273828150328942,-0.000155326851148112,-3.70690315771188e-05,8.08853746707291e-05,0.000198476752594946,0.000315645835666874,0.000432333735328773,0.000548481970218808,0.000664032495107181,0.000778927729529055,0.000893110586101436,0.00100652449850903,0.0011191134491462,0.00123082199640187,0.00134159530157362,0.001451379155399,0.00156012000419063,0.00166776497556304,0.00177426190373947,0.00187955935442585,0.00198360664924134,0.00208635388969324,0.00218775198068548,0.00228775265355017,0.00238630848859078,0.00248337293712777,0.00257890034303573,0.00267284596376264,0.0027651659908224,0.00285581756975022,0.00294475881951347,0.00303194885136837,0.00311734778715523,0.00320091677702331,0.00328261801657889,0.00336241476344813,0.00344027135324884,0.00351615321496371,0.00359002688570914,0.00366186002489375,0.00373162142776056,0.00379928103830807,0.00386480996158482,0.00392818047535296,0.00398936604111683,0.00404834131451196,0.00410508215505164,0.00415956563522717,0.00421177004895933,0.00426167491939793,0.00430926100606804,0.00435451031136012,0.00439740608636304,0.00443793283603874,0.00447607632373735,0.00451182357505271,0.00454516288101758,0.00457608380063932,0.00460457716277593,0.00463063506735364,0.00465425088592729,0.00467541926158465,0.00469413610819695,0.00471039860901749,0.00472420521463094,0.00473555564025633,0.00474445086240651,0.00475089311490802,0.00475488588428478,0.00475643390451008,0.00475554315113093,0.00475222083476989,0.00474647539400919,0.0047383164876626,0.0047277549864407,0.00471480296401554,0.00469947368749088,0.00468178160728458,0.00466174234643012,0.00463937268930397,0.00461469056978683,0.00458771505886558,0.00455846635168474,0.0045269657540549,0.00449323566842705,0.00445729957934127,0.00441918203835878,0.00437890864848652,0.00433650604810388,0.00429200189440092,0.00424542484633809,0.00419680454713777,0.00414617160631751,0.00409355758127593,0.0040389949584418,0.0039825171339971,0.00392415839418544,0.00386395389521697,0.00380193964278122,0.00373815247117977,0.00367263002209005,0.00360541072297291,0.00353653376513537,0.00346603908146142,0.00339396732382295,0.00332035984018316,0.00324525865140576,0.00316870642778174,0.00309074646528777,0.00301142266158806,0.00293077949179369,0.00284886198399182,0.00276571569455874,0.0026813866832694,0.0025959214882174,0.00250936710055862,0.00242177093909173,0.00233318082468987,0.00224364495459622,0.00215321187659778,0.00206193046309074,0.00196984988505084,0.00187701958592308,0.00178348925544365,0.00168930880340844,0.00159452833340149,0.00149919811649696,0.00140336856494826,0.0013070902058786,0.00121041365498514,0.00111338959027166,0.00101606872582252,0.000918501785631088,0.000820739477496859,0.000722832467003396,0.00062483135159124,0.000526786634738467,0.000428748700261665,0.000330767786750949,0.000232893962150942,0.000135177098501165,3.76668468481058e-05,-5.95873876588744e-05,-0.00015653647047473,-0.000253131562157722,-0.00034932414264742,-0.000445066035310076,-0.000540309430740104,-0.000635006910305014,-0.000729111469423506,-0.000822576540564631,-0.000915356015957641,-0.00100740427000084,-0.00109867618135962,-0.00118912715474223,-0.00127871314234389,-0.00136739066494837,-0.00145511683267735,-0.00154184936537829,-0.00162754661264048,-0.00171216757343079,-0.00179567191533962,-0.00187801999342816,-0.00195917286866889,-0.0020390923259702,-0.00211774089177778,-0.00219508185124424,-0.00227107926495982,-0.00234569798523625,-0.00241890367193749,-0.00249066280784943,-0.00256094271358263,-0.00262971156200169,-0.00269693839217459,-0.00276259312283698,-0.00282664656536508,-0.00288907043625251,-0.00294983736908551,-0.00300892092601204,-0.00306629560870053,-0.00312193686878331,-0.00317582111778178,-0.00322792573650879,-0.00327822908394536,-0.00332671050558862,-0.00337335034126783,-0.00341812993242641,-0.00346103162886747,-0.00350203879496073,-0.00354113581530953,-0.00357830809987641,-0.00361354208856589,-0.00364682525526395,-0.00367814611133359,-0.00370749420856603,-0.00373486014158784,-0.0037602355497241,-0.00378361311831824,-0.00380498657950949,-0.00382435071246891,-0.00384170134309564,-0.00385703534317483,-0.00387035062899941,-0.00388164615945781,-0.00389092193359018,-0.00389817898761587,-0.00390341939143523,-0.00390664624460901,-0.00390786367181894,-0.00390707681781324,-0.00390429184184127,-0.00389951591158146,-0.00389275719656734,-0.0038840248611162,-0.00387332905676573,-0.00386068091422367,-0.00384609253483634,
 -0.0038295769815814,-0.00381114826959134,-0.00379082135621343,-0.00376861213061302,-0.00374453740292646,-0.00371861489297091,-0.00369086321851783,-0.00366130188313755,-0.00362995126362248,-0.00359683259699653,-0.00356196796711878,-0.00352538029088928,-0.00348709330406542,-0.00344713154669716,-0.00340552034818985,-0.00336228581200324,-0.00331745479999584,-0.0032710549164236,-0.00322311449160199,-0.00317366256524133,-0.00312272886946436,-0.00307034381151609,-0.00301653845617577,-0.00296134450788043,-0.00290479429257074,-0.00284692073926871,-0.00278775736139795,-0.00272733823785673,-0.0026656979938541,-0.00260287178151994,-0.00253889526029965,-0.00247380457714373,-0.00240763634650355,-0.00234042763014414,-0.00227221591678448,-0.00220303910157702,-0.00213293546543682,-0.00206194365423175,-0.00199010265784497,-0.00191745178912041,-0.00184403066270314,-0.00176987917378505,-0.0016950374767678,-0.00161954596385396,-0.00154344524357734,-0.0014667761192845,-0.00138957956757772,-0.00131189671673157,-0.00123376882509378,-0.00115523725948149,-0.00107634347358468,-0.000997128986387144,-0.000917635360616649,-0.000837904181234896,-0.000757977033978788,-0.000677895483963236,-0.000597701054357152,-0.00051743520514265,-0.000437139311968778,-0.00035685464511021,-0.000276622348541154,-0.000196483419135613,-0.00011647868600357,-3.66487899740423e-05,4.29658367651342e-05,0.000122324990860947,0.000201388717811738,0.000280117331797545,0.000358471435313893,0.000436411938600041,0.000513900078851591,0.000590897439209056,0.000667365967512407,0.000743267994812951,0.000818566253633951,0.000893223895970637,0.000967204511021862,0.00104047214264425,0.0011129913065214,0.00118472700703947,0.00125564475386154,0.00132571057819342,0.00139489104873263,0.00146315328729405,0.00153046498410463,0.00159679441276025,0.00166211044483839,0.00172638256415947,0.00178958088069117,0.00185167614408906,0.00191263975686786,0.00197244378719761,0.00203106098131931,0.00208846477557452,0.00214462930804392,0.00219952942979019,0.0022531407157002,0.00230543947492238,0.00235640276089498,0.00240600838096101,0.0024542349055667,0.00250106167703914,0.00254646881794065,0.00259043723899602,0.00263294864659046,0.00267398554983521,0.00271353126719851,0.00275156993270003,0.00278808650166653,0.00282306675604716,0.00285649730928709,0.00288836561075817,0.00291865994974546,0.00294736945898929,0.0029744841177818,0.00299999475461814,0.00302389304940205,0.00304617153520602,0.00306682359958636,0.00308584348545405,0.00310322629150201,0.00311896797218987,0.00313306533728775,0.00314551605098039,0.00315631863053355,0.00316547244452441,0.00317297771063858,0.00317883549303572,0.00318304769928661,0.00318561707688457,0.00318654720933417,0.00318584251182051,0.00318350822646264,0.00317955041715474,0.00317397596399889,0.00316679255733362,0.00315800869136253,0.00314763365738724,0.00313567753664972,0.00312215119278839,0.00310706626391349,0.00309043515430657,0.00307227102574976,0.00305258778849026,0.00303140009184578,0.00300872331445699,0.00298457355419297,0.00295896761771582,0.002931923009711,0.00290345792178987,0.00287359122107116,0.00284234243844816,0.00280973175654866,0.0027757799973949,0.00274050860977058,0.00270393965630239,0.00266609580026379,0.00262700029210838,0.00258667695574077,0.00254515017453283,0.00250244487709332,0.00245858652279897,0.00241360108709495,0.00236751504657361,0.00232035536383918,0.00227214947216735,0.00222292525996793,0.00217271105505976,0.00212153560876561,0.00206942807983706,0.0020164180182168,0.00196253534864859,0.00190781035414268,0.0018522736593062,0.00179595621354771,0.0017388892741645,0.00168110438932177,0.00162263338093348,0.00156350832745304,0.00150376154658367,0.00144342557791727,0.00138253316551136,0.00132111724041281,0.00125921090313771,0.00119684740611688,0.00113406013611575,0.00107088259663795,0.00100734839032173,0.000943491201338451,0.000879344777802133,0.000814942914198998,0.000750319433846045,0.000685508171388118,0.000620542955341617,0.000555457590694125,0.000490285841569116,0.000425061413963795,0.000359817938569106,0.000294588953680933,0.000229407888210246,0.000164308044801349,9.93225830661221e-05,3.4484502943216e-05,-3.01733718103323e-05,-9.46184099865878e-05,-0.000158818189144902,-0.000222740511673599,-0.000286353420686934,-0.000349625215749474,-0.000412524468420491,-0.000475020037611034,-0.000537081084745967,-0.000598677088724102,-0.00065977786066875,-0.000720353558462379,-0.000780374701058222,-0.000839812182561742,-0.000898637286076073,-0.000956821697304657,-0.00101433751790445,-0.00107115727858425,-0.00112725395194157,-0.00118260096503266,-0.00123717221166939,-0.00129094206443821,-0.00134388538643542,-0.00139597754271322,-0.00144719441143245,-0.00149751239471598,-0.00154690842919921,-0.00159535999627204,-0.00164284513200889,-0.001689342436782,-0.00173483108455442,-0.00177929083184826,-0.0018227020263853,-0.00186504561539609,-0.00190630315359405,-0.00194645681081197,-0.0019854893792978,-0.00202338428066662,-0.00206012557250691,-0.00209569795463822,-0.00213008677501847,-0.00216327803529848,-0.00219525839602226,-0.00222601518147149,-0.00225553638415245,-0.0022838106689244,-0.00231082737676847,-0.00233657652819601,-0.00236104882629575,-0.00238423565941947,-0.00240612910350581,-0.00242672192404204,-0.00244600757766397,-0.00246398021339438,-0.00248063467352028,-0.00249596649410965,-0.00250997190516865,-0.00252264783044025,-0.00253399188684541,-0.00254400238356826,-0.00255267832078691,-0.0025600193880516,-0.00256602596231194,-0.00257069910559561,-0.0025740405623407,-0.002576052756384,-0.00257673878760806,-0.00257610242824963,-0.00257414811887259,-0.00257088096400837,-0.00256630672746716,-0.00256043182732342,-0.00255326333057917,-0.00254480894750898,-0.00253507702569033,-0.00252407654372366,-0.00251181710464613,-0.00249830892904353,-0.00248356284786476,-0.0024675902949436,-0.00245040329923257,-0.00243201447675358,-0.00241243702227061,-0.00239168470068965,-0.00236977183819085,-0.00234671331309871,-0.00232252454649548,-0.00229722149258377,-0.00227082062880381,-0.00224333894571131,-0.00221479393662224,-0.00218520358703004,-0.00215458636380176,-0.00212296120415961,-0.0020903475044537,-0.00205676510873304,-0.00202223429712087,-0.00198677577400133,-0.0019504106560238,-0.00191316045993189,-0.00187504709022398,-0.00183609282665203,-0.00179632031156572,-0.00175575253710895,-0.00171441283227574,-0.00167232484983292,-0.00162951255311623,-0.00158600020270753,-0.00154181234300042,-0.00149697378866115,-0.00145150961099237,-0.00140544512420743,-0.00135880587162187,-0.00131161761177007,-0.00126390630445442,-0.00121569809673419,-0.00116701930886167,-0.001117896420173,-0.00106835605494138,-0.00101842496819956,-0.000968130031539443,-0.000917498218896291,-0.000866556592324564,-0.000815332287772979,-0.000763852500866257,-0.00071214447270082,
 -0.000660235475661517,-0.000608152799267011,-0.00055592373605068,-0.000503575567484774,-0.000451135549954316,-0.000398630900788171,-0.000346088784354618,-0.000293536298227805,-0.000241000459432348,-0.000188508190773214,-0.000136086307257084,-8.37615026124415e-05,-3.15603359146759e-05,2.04907816767024e-05,7.23656000628413e-05,0.0001240380432256,0.000175482222116205,0.000226672447407072,0.000277583242099614,0.000328189353983021,0.000378465767937006,0.000428387718073508,0.000477930699711027,0.000527070481176294,0.00057578311542722,0.000624044951492278,0.000671832645720684,0.000719123172837889,0.000765893836801815,0.000812122281454607,0.000857786500964707,0.000902864850055145,0.000947336054012924,0.000991179218475345,0.00103437383898851,0.00107689981033425,0.00111873743562118,0.00115986743513579,0.00120027095494985,0.00123992957528063,0.00127882531860024,0.00131694065749045,0.00135425852224024,0.00139076230818267,0.00142643588276789,0.00146126359237004,0.00149523026882479,0.00152832123569548,0.00156052231426489,0.00159181982925111,0.001622200614245,0.00165165201686719,0.00168016190364333,0.00170771866459553,0.00173431121754877,0.00175992901215077,0.0017845620336043,0.00180820080611095,0.0018308363960253,0.00185246041471891,0.00187306502115368,0.00189264292416398,0.00191118738444733,0.00192869221626373,0.00194515178884347,0.00196056102750367,0.00197491541447399,0.00198821098943196,0.00200044434974861,0.0020116126504451,0.00202171360386142,0.0020307454790383,0.00203870710081329,0.0020455978486328,0.00205141765508121,0.00205616700412915,0.00205984692910231,0.0020624590103731,0.00206400537277705,0.00206448868275625,0.00206391214523208,0.00206227950020991,0.00205959501911819,0.00205586350088484,0.00205109026775366,0.00204528116084394,0.00203844253545627,0.00203058125612779,0.00202170469144041,0.00201182070858521,0.00200093766768696,0.00198906441589211,0.00197621028122439,0.00196238506621177,0.00194759904128888,0.00193186293797901,0.00191518794185986,0.0018975856853177,0.00187906824009385,0.00185964810962852,0.00183933822120627,0.00181815191790804,0.00179610295037442,0.00177320546838494,0.00174947401225873,0.00172492350408103,0.00169956923876105,0.00167342687492633,0.00164651242565861,0.00161884224907681,0.00159043303877221,0.00156130181410158,0.00153146591034349,0.00150094296872334,0.00146975092631301,0.00143790800581039,0.00140543270520465,0.00137234378733302,0.00133866026933477,0.00130440141200819,0.00126958670907637,0.00123423587636768,0.00119836884091695,0.00116200572999299,0.00112516686005846,0.00108787272566835,0.00105014398831246,0.00101200146520825,0.000973466118049983,0.000934559041719948,0.000895301452967916,0.000855714679064593,0.000815820146435422,0.000775639369280204,0.000735193938184692,0.000694505508730361,0.000653595790107611,0.000612486533739071,0.000571199521918073,0.000529756556468897,0.000488179447433948,0.000446490001794051,0.000404710012227306,0.00036286124591261,0.000320965433382993,0.00027904425743464,0.000237119342097373,0.000195212241671637,0.000153344429837704,0.000111537288842719,6.98120987704314e-05,2.81900268993453e-05,-1.3307882845838e-05,-5.46607203438826e-05,-9.58477196232063e-05,-0.000136848269099311,-0.00017764192169843,-0.00021820840486263,-0.000258527630431677,-0.000298579704396867,-0.000338344936521953,-0.000377803849827059,-0.000416937189930904,-0.00045572593424674,-0.000494151301028183,-0.000532194758260365,-0.000569838032392598,-0.000607063116908157,-0.000643852280727742,-0.000680188076442613,-0.00071605334837345,-0.000751431240451819,-0.000786305203920364,-0.000820659004848588,-0.000854476731460626,-0.000887742801272211,-0.00092044196803358,-0.000952559328475277,-0.00098408032885413,-0.00101499077129672,-0.00104527681993767,-0.00107492500685012,-0.00110392223776623,-0.00113225579758539,-0.00115991335566776,-0.00118688297091152,-0.00121315309661151,-0.00123871258509779,-0.00126355069215219,-0.00128765708120147,-0.00131102182728573,-0.00133363542080036,-0.00135548877101096,-0.00137657320933959,-0.00139688049242181,-0.0014164028049334,-0.00143513276218638,-0.00145306341249335,-0.00147018823930013,-0.00148650116308605,-0.00150199654303181,-0.00151666917845485,-0.00153051431001216,-0.00154352762067078,-0.00155570523644628,-0.00156704372690944,-0.00157754010546189,-0.00158719182938116,-0.00159599679963599,-0.00160395336047267,-0.00161106029877347,-0.00161731684318833,-0.00162272266304074,-0.0016272778670095,-0.00163098300158753,-0.00163383904931939,-0.00163584742681915,-0.00163700998257036,-0.00163732899451001,-0.00163680716739847,-0.00163544762997745,-0.00163325393191825,-0.00163023004056244,-0.00162638033745758,-0.00162170961469021,-0.00161622307101895,-0.00160992630781018,-0.00160282532477919,-0.00159492651553961,-0.00158623666296417,-0.00157676293435966,-0.00156651287645942,-0.00155549441023638,-0.00154371582554014,-0.00153118577556128,-0.00151791327112649,-0.00150390767482801,-0.00148917869499094,-0.00147373637948218,-0.00145759110936466,-0.00144075359240074,-0.00142323485640868,-0.00140504624247599,-0.00138619939803382,-0.00136670626979641,-0.00134657909656967,-0.00132583040193301,-0.00130447298679897,-0.00128251992185438,-0.00125998453988796,-0.00123688042800817,-0.00121322141975631,-0.00118902158711868,-0.0011642952324428,-0.00113905688026205,-0.00111332126903301,-0.00108710334279067,-0.00106041824272541,-0.00103328129868705,-0.00100570802062011,-0.000977714089935322,-0.00094931535082176,-0.000920527801504691,-0.000891367585453493,-0.000861850982544499,-0.000831994400183724,-0.000801814364393843,-0.000771327510870363,-0.000740550576011879,-0.000709500387928816,-0.000678193857435693,-0.000646647969031396,-0.000614879771872516,-0.000582906370744061,-0.000550744917032462,-0.000518412599705564,-0.00048592663630423,-0.000453304263950078,-0.000420562730374023,-0.000387719284970424,-0.00035479116988102,-0.000321795611113349,-0.000288749809698345,-0.000255670932891157,-0.000222576105419947,-0.000189482400786798,-0.000156406832625385,-0.000123366346119315,-9.03778094855688e-05,-5.74580055274083e-05,-2.46236232605249e-05,8.10875038316639e-06,4.07226387702898e-05,7.32016836950175e-05,0.000105529653418793,0.000137690450616703,0.000169668120226624,0.000201446857197505,0.000233011014133184,0.000264345108828066,0.000295433831690941,0.000326262053053822,0.000356814830362236,0.000387077415243467,0.000417035260449873,0.00044667402667381,0.000475979589231275,0.000504938044610982,0.000533535716886269,0.000561759163986836,0.000589595183827354,0.000617030820290652,0.00064405336906253,0.000670650383315963,0.000696809679241917,0.000722519341424928,0.000747767728060642,0.000772543476013703,0.000796835505713404,0.000820633025885535,0.000843925538118381,0.000866702841260925,0.000888955035651854,0.000910672527177615,0.000931846031157871,0.00095246657605724,0.000972525507021732,0.000992014489238878,0.00101092551112014,0.0010292508873049,0.00104698326148488,0.00106411560904814,0.00108064123954212,0.00109655379895475,0.0011118472718135,0.00112651598310146,0.00114055459999043,0.00115395813339071,0.00116672193931726,0.00117884172007231,0.00119031352524443,0.00120113375252423,0.00121129914833667,0.00122080680829065,
 0.00122965417744607,0.00123783905039883,0.00124535957118451,0.00125221423300136,0.00125840187775329,0.00126392169541391,0.00126877322321233,0.00127295634464211,0.00127647128829414,0.00127931862651491,0.00128149927389139,0.001283014485564,0.00128386585536898,0.00128405531381196,0.00128358512587417,0.00128245788865312,0.00128067652883962,0.00127824430003285,0.00127516477989559,0.00127144186715168,0.00126707977842767,0.00126208304494094,0.00125645650903667,0.00125020532057575,0.00124333493317623,0.00123585110031071,0.0012277598712622,0.00121906758694106,0.0012097808755657,0.00119990664820978,0.00118945209421861,0.00117842467649774,0.0011668321266765,0.0011546824401495,0.00114198387099919,0.00112874492680237,0.00111497436332383,0.00110068117910045,0.0010858746099186,0.00107056412318845,0.00105475941221828,0.00103847039039214,0.0010217071852543,0.00100448013250386,0.000986799769902909,0.000968676831101775,0.000950122239384843,0.000931147101340517,0.0009117627004588,0.000891980490660107,0.000871812089758989,0.000851269272866356,0.00083036396573377,0.00080910823804354,0.000787514296648406,0.000765594478764287,0.00074336124511991,0.000720827173067144,0.000698004949655534,0.000674907364674944,0.000651547303669901,0.000627937740929579,0.000604091732456894,0.000580022408920566,0.000555742968593997,0.000531266670284408,0.000506606826256191,0.000481776795151971,0.000456789974915333,0.000431659795718582,0.000406399712899355,0.000381023199909761,0.000355543741281616,0.000329974825611307,0.000304329938567905,0.000278622555928233,0.000252866136642139,0.000227074115931597,0.000201259898427255,0.000175436851345555,0.000149618297710086,0.000123817509620333,9.80477015714137e-05,7.23220238277868e-05,4.665355585432e-05,2.10552998080745e-05,-4.45982590633637e-06,-2.98789930144383e-05,-5.51894696797388e-05,-8.03786267385361e-05,-0.000105433943858797,-0.00013034301562024,-0.000155093557512704,-0.000179673411849814,-0.00020407055359547,-0.000228273096100299,-0.000252269296745275,-0.000276047562490194,-0.00029959645532431,-0.000322904697616544,-0.000345961177363105,-0.00036875495332996,-0.000391275260088007,-0.00041351151293851,-0.000435453312726917,-0.000457090450542803,-0.000478412912303817,-0.000499410883221916,-0.000520074752149767,-0.000540395115805737,-0.000560362782875298,-0.000579968777987699,-0.000599204345565892,-0.000618060953548384,-0.000636530296981365,-0.000654604301479925,-0.000672275126556943,-0.000689535168818291,-0.000706377065023391,-0.000722793695009926,-0.000738778184481572,-0.00075432390765802,-0.000769424489786242,-0.000784073809512325,-0.000798266001112986,-0.000811995456586321,-0.000825256827601124,-0.000838045027304191,-0.000850355231985366,-0.000862182882599891,-0.000873523686147765,-0.00088437361690996,-0.000894728917541413,-0.00090458610002068,-0.000913941946456356,-0.000922793509750267,-0.000931138114117751,-0.000938973355465201,-0.000946297101625169,-0.000953107492449535,-0.00095940293976115,-0.000965182127164484,-0.000970444009715949,-0.000975187813454563,-0.000979413034793724,-0.000983119439774883,-0.000986307063184082,-0.000988976207532292,-0.000991127441900545,-0.000992761600651051,-0.000993879782005379,-0.000994483346490993,-0.000994573915257406,-0.000994153368263331,-0.000993223842336247,-0.00099178772910585,-0.000989847672812951,-0.000987406567995412,-0.000984467557052783,-0.000981034027691368,-0.000977109610251478,-0.000972698174918704,-0.000967803828821116,-0.000962430913014279,-0.000956583999356123,-0.00095026788727365,-0.000943487600423628,-0.000936248383249343,-0.000928555697435623,-0.000920415218264346,-0.000911832830872734,-0.000902814626416679,-0.000893366898141494,-0.000883496137362504,-0.000873209029357859,-0.000862512449176021,-0.00085141345736053,-0.000839919295594453,-0.000828037382267177,-0.000815775307966064,-0.000803140830895734,-0.000790141872227454,-0.000776786511381427,-0.00076308298124471,-0.000749039663327391,-0.000734665082859875,-0.000719967903833962,-0.000704956923990644,-0.000689641069757283,-0.000674029391137055,-0.000658131056553546,-0.000641955347653323,-0.000625511654069285,-0.000608809468147721,-0.000591858379642031,-0.00057466807037584,-0.000557248308878483,-0.000539608944995842,-0.000521759904479256,-0.000503711183555555,-0.000485472843480995,-0.000467055005082172,-0.000448467843286586,-0.000429721581645849,-0.000410826486854523,-0.000391792863267231,-0.000372631047417096,-0.000353351402538234,-0.000333964313095239,-0.000314480179322442,-0.000294909411775696,-0.000275262425899514,-0.000255549636612444,-0.00023578145291323,-0.00021596827251059,-0.000196120476479426,-0.000176248423945934,-0.000156362446804383,-0.000136472844468305,-0.000116589878658459,-9.67237682303544e-05,-7.68846840437216e-05,-5.70827438766377e-05,-3.73280073865604e-05,-1.76304711208226e-05,1.99993642088864e-06,2.15533596699293e-05,4.10200208154243e-05,6.03902245722434e-05,7.96543628875891e-05,9.88029195844659e-05,0.000117826474939476,0.000136715710193024,0.000155461411989631,0.000174054476746553,0.00019248591494857,0.000210746855366906,0.000228828549200576,0.000246722374138184,0.000264419838338276,0.00028191258432668,0.00029919239280896,0.000316251186396444,0.00033308103324404,0.000349674150598494,0.000366022908255491,0.000382119831924034,0.000397957606496918,0.000413529079225828,0.000428827262799762,0.000443845338325565,0.00045857665820947,0.000473014748938413,0.000487153313760161,0.000500986235261103,0.000514507577840938,0.000527711590083255,0.000540592707021129,0.000553145552297088,0.000565364940216666,0.000577245877694798,0.000588783566094627,0.00059997340295804,0.000610810983627539,0.000621292102758917,0.000631412755724494,0.000641169139906554,0.000650557655880657,0.000659574908488804,0.000668217707802125,0.000676483069973211,0.000684368217977891,0.00069187058224664,0.000698987801185635,0.000705717721587661,0.000712058398933015,0.000718008097580768,0.000723565290850654,0.000728728660995955,0.000733497099067867,0.000737869704671835,0.000741845785616332,0.000745424857454791,0.000748606642921268,0.000751391071260577,0.000753778277453638,0.000755768601338869,0.000757362586630487,0.000758560979834606,0.000759364729064122,0.000759774982753388,0.000759793088273753,0.000759420590451042,0.000758659229986178,0.000757510941780111,0.000755977853164323,0.000754062282038195,0.000751766734914573,0.000749093904874909,0.000746046669435407,0.00074262808832562,0.000738841401181018,0.000734690025151058,0.000730177552424333,0.000725307747672431,0.000720084545414129,0.000714512047301645,0.000708594519330652,0.000702336388975791,0.000695742242253508,0.000688816820714019,0.000681565018364236,0.000673991878523528,0.000666102590614281,0.00065790248688911,0.000649397039096707,0.000640591855088355,0.000631492675367041,0.00062210536958124,0.000612435932965378,0.000602490482729133,0.000592275254397531,0.00058179659810402,0.00057106097483868,0.000560074952653592,0.000548845202827616,0.000537378495992672,0.000525681698223757,0.000513761767094866,0.000501625747702958,0.000489280768662212,0.00047673403807084,0.000463992839452548,0.000451064527674926,0.000437956524847057,0.000424676316198432,0.000411231445941475,0.000397629513119953,0.000383878167445365,0.000369985105123653,0.000355958064674343,0.000341804822744478,0.000327533189919382,0.00031315100653253,0.000298666138476795,0.000284086473019086,0.000269419914620704,0.000254674380765407,0.000239857797797613,0.000224978096772517,0.000210043209320516,0.000195061063527882,0.000180039579835931,0.000164986666960563,0.000149910217834334,0.00013481810557314,0.000119718179469377,0.000104618261013641,8.95261399470058e-05,7.4449570345654e-05,5.93962667399167e-05,4.43739002695007e-05,2.93900948769175e-05,1.44524235407681e-05,-4.31595449223616e-07,-1.52545021735662e-05,-3.00088987191677e-05,-4.46874527685018e-05,-5.92829011400602e-05,-7.3788053278475e-05,-8.81957946927382e-05,-0.000102499090340838,-0.00011669098795936,-0.000130764621336393,-0.000144713213526427,-0.000158530080005721,-0.000172208631766647,-0.000185742378349807,-0.000199124930812505,-0.000212350004632196,-0.00022541142254385,-0.000238303117309837,-0.000251019134421297,-0.000263553634729709,-0.000275900897007726,-0.000288055320438154,-0.000300011427029989,-0.000311763863960726,-0.000323307405843803,-0.000334636956920518,-0.000345747553175349,-0.000356634364374106,-0.000367292696023986,-0.000377717991254969,-0.000387905832621729,-0.000397851943825609,-0.000407552191355999,-0.000417002586050548,-0.000426199284573831,-0.000435138590813965,-0.000443816957196748,-0.000452230985917062,-0.000460377430087148,-0.000468253194801565,-0.000475855338118517,-0.000483181071957495,-0.000490227762913035,-0.000496992932984516,-0.000503474260221955,-0.000509669579287852,-0.000515576881935093,-0.000521194317400983,-0.000526520192717614,-0.000531552972938706,-0.000536291281283125,-0.0005407338991954,-0.000544879766323497,-0.000548727980414254,-0.000552277797126791,-0.000555528629764419,-0.000558480048925469,-0.000561131782073551,-0.000563483713027852,-0.000565535881373998,-0.000567288481796188,-0.000568741863331196,-0.000569896528545036,-0.000570753132632961,-0.000571312482443646,-0.000571575535428335,-0.000571543398515829,-0.000571217326914227,-0.000570598722840296,-0.000569689134177504,-0.000568490253063648,-0.000567003914409159,-0.000565232094347103,-0.000563176908616006,-0.000560840610876602,-0.000558225590963676,-0.000555334373074176,-0.000552169613892796,-0.000548734100656311,-0.000545030749157866,-0.000541062601692577,-0.000536832824945712,-0.000532344707824832,-0.000527601659237243,-0.000522607205814143,-0.000517364989582876,-0.000511878765588764,-0.000506152399467916,-0.000500189864972511,-0.000493995241450079,-0.00048757271127824,-0.000480926557256444,-0.000474061159956302,-0.000466980995031985,-0.000459690630492344,-0.000452194723936275,-0.000444498019752994,-0.000436605346288768,-0.000428521612981758,-0.000420251807466637,-0.000411800992650551,-0.000403174303762153,-0.000394376945375264,-0.000385414188409004,-0.000376291367105835,-0.000367013875989376,-0.000357587166803538,-0.000348016745434793,-0.000338308168819116,-0.000328467041835364,-0.000318499014186804,-0.000308409777272385,-0.000298205061049476,-0.00028789063088981,-0.000277472284430191,-0.000266955848419733,-0.000256347175565217,-0.000245652141376339,-0.000234876641012366,-0.000224026586131915,-0.000213107901747537,-0.000202126523086631,-0.000191088392460357,-0.000179999456142179,-0.000168865661257607,-0.000157692952686687,-0.000146487269980865,-0.000135254544295716,-0.000124000695341185,-0.000112731628350718,-0.000101453231070878,-9.01713707729725e-05,-7.88918912880573e-05,-6.76206100668248e-05,-5.63633152658753e-05,-4.51257628616543e-05,-3.39136737935609e-05,-2.2732731137515e-05,-1.1588577311449e-05,-4.86811313915871e-07,1.05670140028143e-05,2.15673946238211e-05,3.25088780256781e-05,4.33860657922279e-05,5.41936161910016e-05,6.49262467088871e-05,7.55787365460706e-05,8.6145929067006e-05,9.6622734207392e-05,0.000107004130835977,0.000117285169070277,0.000127460972545122,0.000137526740632994,0.000147477750615314,0.000157309359803685,0.000167017007610151,0.000176596217565704,0.00018604259928613,0.000195351850384441,0.000204519758329025,0.000213542202246907,0.000222415154671328,0.000231134683232959,0.000239696952294124,0.000248098224525462,0.000256334862424394,0.000264403329774837,0.000272300193047718,0.000280022122741781,0.000287565894664179,0.000294928391150552,0.000302106602224122,0.000309097626693513,0.000315898673188933,0.000322507061136496,0.00032892022167043,0.000335135698482898,0.000341151148611358,0.000346964343163231,0.000352573167977838,0.000357975624225448,0.000363169828943501,0.000368154015509882,0.00037292653405339,0.000377485851801332,0.000381830553364452,0.000385959340959241,0.000389871034567797,0.000393564572035445,0.000397039009106331,0.0004002935193972,0.000403327394309709,0.000406140042881527,0.000408730991576614,
 0.00041109988401501,0.00041324648064257,0.000415170658341089,0.000416872409979226,0.000418351843904798,0.000419609183378899,0.000420644765952442,0.000421459042785672,0.000422052577911267,0.000422426047441668,0.000422580238721292,0.000422516049424304,0.000422234486598678,0.000421736665657269,0.000421023809316662,0.000420097246484597,0.00041895841109675,0.000417608840903734,0.000416050176209156,0.000414284158559614,0.000412312629387525,0.000410137528607722,0.00040776089316874,0.000405184855559753,0.000402411642274163,0.000399443572230807,0.000396283055153818,0.00039293258991216,0.000389394762819914,0.000385672245898332,0.000381767795100793,0.000377684248501704,0.00037342452445052,0.000368991619691937,0.00036438860745344,0.000359618635501352,0.00035468492416652,0.000349590764340821,0.000344339515445694,0.000338934603373839,0.00033337951840533,0.000327677813099311,0.000321833100162537,0.000315849050295926,0.00030972939002039,0.000303477899483179,0.000297098410245953,0.000290594803055835,0.000283971005600701,0.000277230990249963,0.000270378771782053,0.00026341840509992,0.000256353982935729,0.000249189633546102,0.000241929518399064,0.000234577829853977,0.000227138788835771,0.000219616642504624,0.00021201566192238,0.000204340139716987,0.00019659438774611,0.00018878273476121,0.000180909524073276,0.000172979111221486,0.000164995861645939,0.000156964148365684,0.000148888349663314,0.000140772846777168,0.000132622021602488,0.000124440254402532,0.000116231921530969,0.000108001393166544,9.97530310612701e-05,9.14911863031805e-05,8.32201970948495e-05,7.49443865486734e-05,6.66680605000458e-05,5.83955053395394e-05,5.01309858650572e-05,4.18787431550387e-05,3.36429924637897e-05,2.5427921139845e-05,1.72376865684373e-05,9.07641413898225e-06,9.48195238618906e-07,-7.14291472735571e-06,-1.51928982871869e-05,-2.3197777825582e-05,-3.11536174769895e-05,-3.9056524988396e-05,-4.69026535507839e-05,-5.46882035983796e-05,-6.24094245749816e-05,-7.00626166665431e-05,-7.76441324992083e-05,-8.51503788021583e-05,-9.25778180344744e-05,-9.99229699753843e-05,-0.000107182413277144,-0.000114352786980001,-0.000121430791988571,-0.000128413192508979,-0.000135296817446292,-0.000142078561761593,-0.000148755387788244,-0.000155324326506732,-0.000161782478777755,-0.000168127016532938,-0.000174355183922887,-0.000180464298422044,-0.000186451751890066,-0.000192315011589317,-0.00019805162115811,-0.000203659201539462,-0.000209135451865035,-0.000214478150293975,-0.000219685154806484,-0.000224754403951855,-0.000229683917550825,-0.000234471797352043,-0.000239116227642562,-0.00024361547581224,-0.000247967892871911,-0.000252171913925349,-0.000256226058594915,-0.000260128931400936,-0.000263879222094778,-0.000267475705945676,-0.000270917243981399,-0.000274202783182808,-0.00027733135663242,-0.00028030208361713,-0.000283114169685247,-0.000285766906657991,-0.000288259672595703,-0.000290591931718978,-0.000292763234284939,-0.000294773216418979,-0.00029662159990223,-0.000298308191915087,-0.000299832884737118,-0.000301195655403732,-0.000302396565319991,-0.000303435759831934,-0.000304313467755884,-0.000305030000866148,-0.000305585753341585,-0.00030598120117152,-0.000306216901521509,-0.000306293492059488,-0.000306211690242816,-0.000305972292566803,-0.00030557617377527,-0.000305024286033762,-0.000304317658065994,-0.000303457394254184,-0.000302444673703895,-0.000301280749274063,-0.000299966946572862,-0.000298504662920124,-0.000296895366276984,-0.000295140594143504,-0.000293241952424973,-0.000291201114267648,-0.000289019818864695,-0.000286699870233075,-0.000284243135962188,-0.000281651545935046,-0.000278927091022785,-0.000276071821753329,-0.000273087846955029,-0.000269977332376106,-0.000266742499280753,-0.000263385623022736,-0.000259909031597333,-0.000256315104172533,-0.0002526062696003,-0.000248785004908818,-0.000244853833776615,-0.000240815324989414,-0.000236672090880646,-0.00023242678575649,-0.000228082104306389,-0.000223640779999902,-0.00021910558347082,-0.00021447932088949,-0.000209764832324188,-0.000204964990092552,-0.000200082697103894,-0.000195120885193399,-0.00019008251344906,-0.000184970566532297,-0.000179788052993172,-0.000174538003581127,-0.000169223469552129,-0.000163847520973146,-0.000158413245024881,-0.000152923744303642,-0.000147382135123237,-0.000141791545817854,-0.000136155115046731,-0.000130475990101566,-0.000124757325217511,-0.000119002279888661,-0.000113214017188868,-0.000107395702098747,-0.000101550499839755,-9.56815742161737e-05,-8.9792085965815e-05,-8.38851911202859e-05,-7.79640393756771e-05,-7.20317724744153e-05,-6.60915225991129e-05,-6.01464107792395e-05,-5.41995453113257e-05,-4.8254020193526e-05,-4.23129135752554e-05,-3.6379286222704e-05,-3.04561800008946e-05,-2.45466163730381e-05,-1.86535949179281e-05,-1.27800918660038e-05,-6.9290586548193e-06,-1.10342050454853e-06,4.69392498575835e-06,1.04601092206202e-05,1.6192293968531e-05,2.1887672699831e-05,2.75434719013334e-05,3.31569523672129e-05,3.87254104655552e-05,4.4246179379982e-05,4.97166303258814e-05,5.51341737406908e-05,6.04962604476993e-05,6.58003827929482e-05,7.10440757547034e-05,7.62249180250887e-05,8.13405330633889e-05,8.63885901206669e-05,9.13668052352641e-05,9.6272942198768e-05,0.000101104813492143,0.000105860281191626,0.00011053725784408,0.000115133707311479,0.00011964764558422,0.000124077141563023,0.000128420317809118,0.000132675351262483,0.000136840473927933,0.000140913973528842,0.000144894194128284,0.000148779536717474,0.000152568459771325,0.000156259479770981,0.00015985117169324,0.000163342169466755,0.000166731166394932,0.000170016915545461,0.000173198230106457,0.000176273983709174,0.000179243110717271,0.000182104606482673,0.000184857527568029,0.000187500991935842,0.000190034179104279,0.000192456330269823,0.000194766748396795,0.000196964798273909,0.000199049906537954,0.000201021561664791,0.000202879313927801,0.000204622775323984,0.000206251619467897,0.000207765581453664,0.000209164457685255,0.000210448105675328,0.000211616443812851,0.000212669451099813,0.000213607166857295,0.000214429690401231,0.000215137180688158,0.000215729855931309,0.000216207993187386,0.000216571927914394,0.000216822053500895,0.00021695882076709,0.000216982737438119,0.000216894367590012,0.000216694331068704,0.000216383302882574,0.000215962012568937,0.000215431243534989,0.000214791832373643,0.000214044668154779,0.000213190691692376,0.000212230894788063,0.000211166319451582,0.000209998057098713,0.000208727247727179,0.000207355079071099,0.000205882785734526,0.000204311648304645,0.0002026429924452,0.000200878187970726,0.000199018647902181,0.000197065827504565,0.000195021223307131,0.000192886372106789,0.000190662849955323,0.000188352271131036,0.000185956287095444,0.000183476585435659,0.000180914888793067,0.00017827295377898,0.000175552569877859,0.000172755558338776,0.000169883771055775,0.000166939089437739,0.000163923423268465,0.000160838709557554,0.000157686911382826,0.00015447001672486,0.00015119003729435,0.000147849007352939,0.000144448982528169,0.000140992038623225,0.000137480270422103,0.000133915790490909,0.000130300727975883,0.000126637227398849,0.000122927447450727,0.000119173559783752,0.000115377747803056,0.000111542205458249,0.000107669136035655,0.000103760750951826,9.98192685489614e-05,9.58469128929004e-05,9.18459125742598e-05,8.7818499513379e-05,8.3766907769656e-05,7.96933723559266e-05,7.5600128058426e-05,7.14894082630084e-05,6.7363443788134e-05,6.32244617252883e-05,5.90746842873462e-05,5.49163276654788e-05,5.07516008951872e-05,4.65827047319742e-05,4.24118305372229e-05,3.82411591748463e-05,3.40728599191875e-05,2.99090893747362e-05,2.5751990408141e-05,2.16036910930649e-05,1.7466303668328e-05,1.33419235098453e-05,9.23262811685928e-06,5.1404761128809e-06,1.06750626183723e-06,-2.98426350016023e-06,-7.01283701696615e-06,-1.10162408480615e-05,-1.49925251873214e-05,-1.89397647644821e-05,-2.28560597288928e-05,-2.67395365152196e-05,-3.0588348690713e-05,-3.44006777836603e-05,-3.81747340927275e-05,-4.19087574768357e-05,-4.56010181252311e-05,-4.92498173074901e-05,-5.28534881031252e-05,-5.64103961105393e-05,-5.99189401350207e-05,-6.33775528555675e-05,-6.67847014702765e-05,-7.01388883200426e-05,-7.34386514903965e-05,-7.66825653912348e-05,-7.98692413142891e-05,-8.29973279680875e-05,-8.60655119903289e-05,-8.90725184374467e-05,-9.2017111251262e-05,-9.48980937025603e-05,-9.77143088115188e-05,-0.000100464639744859,-0.000103148010189625,-0.000105763384703537,-0.000108309769041847,-0.000110786210460631,-0.000113191797996502,-0.000115525662722708,-0.000117786977981613,-0.000119974959593534,-0.000122088866041986,-0.000124127998635343,-0.000126091701644931,-0.000127979362419654,-0.000129790411477168,-0.000131524322571709,-0.000133180612738637,-0.000134758842315834,-0.000136258614942016,-0.000137679577532133,-0.000139021420229953,-0.000140283876337993,-0.000141466722224963,-0.000142569777210869,-0.000143592903429972,-0.000144536005671797,-0.000145399031200369,-0.000146181969551922,-0.000146884852311273,-0.000147507752867119,-0.000148050786146473,-0.000148514108328524,-0.000148897916538149,-0.000149202448519377,-0.000149427982289073,-0.000149574835771129,-0.000149643366411474,-0.000149633970774194,-0.000149547084119101,-0.000149383179961048,-0.000149142769611348,-0.000148826401701622,-0.000148434661690426,-0.000147968171353023,-0.000147427588254649,-0.00014681360520765,-0.000146126949712865,-0.000145368383385639,-0.000144538701366849,-0.000143638731719352,-0.00014266933481023,-0.000141631402679272,-0.000140525858394076,-0.000139353655392192,-0.000138115776810751,-0.000136813234803966,-0.000135447069848973,-0.000134018350040413,-0.000132528170374222,-0.000130977652021046,-0.000129367941589733,-0.000127700210381361,-0.000125975653634229,-0.000124195489760284,-0.000122360959573422,-0.000120473325510131,-0.000118533870842929,-0.000116543898887054,-0.000114504732200872,-0.000112417711780454,-0.000110284196248804,-0.00010810556104017,-0.000105883197579935,-0.000103618512460518,-0.000101312926613771,-9.89678744803232e-05,-9.65848031763287e-05,-9.41651716580905e-05,-9.17104498849976e-05,-8.92221179812628e-05,-8.67016653968825e-05,-8.41505900682881e-05,-8.15703975791493e-05,-7.89626003217505e-05,-7.63287166594104e-05,-7.36702700903664e-05,-7.09887884135878e-05,-6.82858028969257e-05,-6.55628474480433e-05,-6.2821457788569e-05,-6.00631706318681e-05,-5.72895228648757e-05,-5.45020507343893e-05,-5.17022890382489e-05,-4.88917703218012e-05,-4.60720240800406e-05,-4.32445759658306e-05,-4.04109470046086e-05,-3.75726528159311e-05,-3.47312028422512e-05,-3.18880995853173e-05,-2.90448378505281e-05,-2.62029039996194e-05,-2.33637752120534e-05,-2.05289187554216e-05,-1.76997912652335e-05,-1.48778380343994e-05,-1.20644923127653e-05,-9.26117461698226e-06,-6.46929205104167e-06,-3.69023763779291e-06,-9.25389661709246e-07,1.82388897678174e-06,4.55625139514286e-06,7.27036735044587e-06,9.96492384873171e-06,1.26386257417392e-05,1.52901963107384e-05,1.79183778372582e-05,2.05219321604611e-05,2.30996412209252e-05,2.56503075906517e-05,2.81727549890619e-05,3.06658287848129e-05,3.3128396483204e-05,3.55593481990333e-05,3.7957597114714e-05,4.03220799234942e-05,4.26517572576078e-05,4.49456141012435e-05,4.72026601881683e-05,4.94219303839002e-05,5.16024850522866e-05,5.37434104064079e-05,5.58438188436954e-05,5.79028492651571e-05,5.991966737866e-05,6.18934659861721e-05,6.38234652549182e-05,6.57089129723729e-05,6.75490847850721e-05,6.93432844211934e-05,7.10908438968675e-05,7.27911237062256e-05,7.4443512995159e-05,7.60474297187844e-05,7.76023207826403e-05,7.91076621676173e-05,8.05629590386577e-05,8.19677458372436e-05,8.33215863577353e-05,8.46240738076028e-05,8.58748308515986e-05,8.70735096399619e-05,8.82197918207153e-05,8.93133885361372e-05,9.03540404035137e-05,9.13415174802592e-05,9.2275619213524e-05,9.31561743743901e-05,9.39830409767967e-05,9.47561061813166e-05,9.54752861839191e-05,9.61405260898756e-05,9.67517997729505e-05,9.73091097200466e-05,9.78124868614686e-05,9.82619903869737e-05,9.86577075477993e-05,9.89997534448506e-05,9.92882708032378e-05,9.95234297333714e-05,9.9705427478815e-05,9.98344881511113e-05,9.9910862451795e-05,9.99348273818228e-05,9.99066859386447e-05,9.98267668011501e-05,9.96954240027345e-05,9.95130365927253e-05,9.92800082864198e-05,9.89967671039888e-05,9.86637649985054e-05,9.82814774733607e-05,9.78504031893375e-05,9.73710635616094e-05,9.68440023469432e-05,9.62697852213859e-05,9.56489993487134e-05,9.49822529399338e-05,9.42701748041286e-05,
 9.35134138909306e-05,9.27126388249273e-05,9.18685374322918e-05,9.09818162599413e-05,9.00532000875255e-05,8.90834314325463e-05,8.80732700489246e-05,8.70234924193122e-05,8.59348912414666e-05,8.4808274908995e-05,8.36444669867889e-05,8.24443056814471e-05,8.12086433070261e-05,7.99383457464085e-05,7.86342919086182e-05,7.72973731824044e-05,7.59284928863964e-05,7.45285657161543e-05,7.30985171884367e-05,7.16392830829907e-05,7.01518088821841e-05,6.86370492088033e-05,6.70959672623157e-05,6.55295342539231e-05,6.39387288407062e-05,6.23245365591873e-05,6.06879492586023e-05,5.90299645341967e-05,5.73515851608611e-05,5.56538185273923e-05,5.39376760716902e-05,5.22041727171986e-05,5.04543263108675e-05,4.8689157062949e-05,4.6909686988904e-05,4.51169393537251e-05,4.33119381189442e-05,4.14957073926132e-05,3.96692708825497e-05,3.78336513531005e-05,3.59898700857156e-05,3.41389463435848e-05,3.22818968406223e-05,3.04197352150379e-05,2.8553471507761e-05,2.66841116459819e-05,2.48126569320371e-05,2.2940103537894e-05,2.10674420054833e-05,1.91956567530948e-05,1.73257255880833e-05,1.54586192260934e-05,1.35953008170508e-05,1.17367254781075e-05,9.88383983376397e-06,8.03758156337068e-06,6.19887895622112e-06,4.36865047440966e-06,2.5478043236621e-06,7.37238032308926e-07,-1.06216196140182e-06,-2.8495207135011e-06,-4.6239751698272e-06,-6.38467455271441e-06,-8.1307807387077e-06,-9.86146862713565e-06,-1.15759264994109e-05,-1.32733563689023e-05,-1.49529743212685e-05,-1.66140108451148e-05,-1.82557111528465e-05,-1.98773354916211e-05,-2.14781594442845e-05,-2.30574742201769e-05,-2.46145869357363e-05,-2.61488208847895e-05,-2.76595157984633e-05,-2.91460280946187e-05,-3.06077311167596e-05,-3.20440153623401e-05,-3.34542887004033e-05,-3.48379765785163e-05,-3.61945222189482e-05,-3.75233868040389e-05,-3.8824049650746e-05,-4.00960083743248e-05,-4.13387790411312e-05,-4.25518963105175e-05,-4.37349135658282e-05,-4.48874030344821e-05,-4.60089558971416e-05,-4.70991823859845e-05,-4.81577118720844e-05,-4.91841929419275e-05,-5.01782934630889e-05,-5.11397006390925e-05,-5.20681210535035e-05,-5.29632807032924e-05,-5.38249250215107e-05,-5.46528188893462e-05,-5.5446746637607e-05,-5.62065120377057e-05,-5.69319382822058e-05,-5.76228679550161e-05,-5.82791629913088e-05,-5.89007046272429e-05,-5.94873933395923e-05,
 -6.00391487753712e-05,-6.05559096715516e-05,-6.10376337649892e-05,-6.14842976926593e-05,-6.18958968823238e-05,-6.22724454337409e-05,-6.26139759905511e-05,-6.29205396029613e-05,-6.31922055813587e-05,-6.34290613409974e-05,-6.36312122378911e-05,-6.37987813960626e-05,-6.39319095262928e-05,-6.40307547365266e-05,-6.4095492334089e-05,-6.41263146198697e-05,-6.41234306746412e-05,-6.40870661376763e-05,-6.40174629778309e-05,-6.391487925727e-05,-6.37795888880065e-05,-6.36118813814352e-05,-6.34120615910403e-05,-6.31804494484614e-05,-6.29173796931019e-05,-6.26232015954722e-05,-6.22982786744525e-05,-6.19429884086736e-05,-6.15577219422071e-05,-6.11428837847619e-05,-6.06988915065879e-05,-6.02261754282833e-05,-5.97251783057106e-05,-5.91963550102224e-05,-5.86401722044023e-05,-5.80571080135255e-05,-5.74476516929464e-05,-5.68123032916221e-05,-5.61515733119774e-05,-5.54659823663212e-05,-5.47560608300273e-05,-5.40223484916847e-05,-5.32653942004291e-05,-5.24857555106721e-05,-5.16839983244288e-05,-5.08606965314632e-05,-5.00164316474562e-05,-4.91517924504131e-05,-4.8267374615513e-05,-4.73637803486132e-05,-4.64416180186218e-05,-4.5501501788938e-05,-4.45440512481755e-05,-4.35698910403686e-05,-4.25796504948758e-05,-4.15739632561745e-05,-4.05534669137558e-05,-3.95188026323246e-05,-3.84706147824963e-05,-3.74095505721944e-05,-3.63362596789495e-05,-3.52513938832866e-05,-3.41556067034013e-05,-3.30495530313092e-05,-3.19338887706706e-05,-3.08092704764648e-05,-2.96763549967043e-05,-2.85357991163705e-05,-2.73882592037593e-05,-2.62343908594003e-05,-2.50748485677371e-05,-2.39102853517339e-05,-2.27413524305865e-05,-2.15686988806958e-05,-2.0392971300071e-05,-1.92148134763324e-05,-1.80348660584579e-05,-1.68537662324395e-05,-1.56721474009943e-05,-1.44906388674902e-05,-1.33098655242169e-05,-1.21304475451533e-05,-1.09530000833746e-05,-9.77813297322283e-06,-8.60645043737829e-06,-7.43855079896758e-06,-6.27502619881872e-06,-5.11646231799598e-06,-3.96343810572349e-06,-2.81652551282231e-06,-1.67628923075757e-06,-5.43286436407872e-07,5.81933457334323e-07,1.69882904504592e-06,2.80686716623921e-06,3.90552313671397e-06,4.99428097372264e-06,6.07263361485467e-06,7.14008313057028e-06,8.19614093029787e-06,9.24032796203801e-06,1.02721749054007e-05,1.12912223580112e-05,1.22970210152324e-05,1.32891318431441e-05,1.42671262447348e-05,1.52305862192578e-05,1.61791045147037e-05,1.71122847733627e-05,1.80297416704377e-05,1.89311010456724e-05,1.98160000279816e-05,2.06840871530522e-05,2.15350224739038e-05,2.23684776643877e-05,2.31841361156243e-05,2.39816930253701e-05,2.47608554803058e-05,2.55213425312607e-05,2.62628852613713e-05,2.69852268471836e-05,2.76881226127196e-05,2.83713400765207e-05,2.90346589916937e-05,2.9677871378978e-05,3.03007815528719e-05,3.0903206140848e-05,3.1484974095687e-05,3.20459267009823e-05,3.25859175698492e-05,3.31048126368919e-05,3.36024901434722e-05,3.40788406163417e-05,3.45337668396904e-05,3.49671838206697e-05,3.53790187484599e-05,3.57692109469452e-05,3.61377118210647e-05,3.64844847969168e-05,3.68095052556901e-05,3.71127604615012e-05,3.73942494832179e-05,3.76539831103606e-05,3.78919837631567e-05,3.81082853968512e-05,3.83029334003579e-05,3.84759844893474e-05,3.86275065938727e-05,3.87575787406302e-05,3.8866290929957e-05,3.89537440076728e-05,3.90200495318706e-05,3.90653296347648e-05,3.90897168797088e-05,3.9093354113495e-05,3.90763943140511e-05,3.90390004336481e-05,3.89813452377419e-05,3.89036111395636e-05,3.88059900305833e-05,3.86886831069695e-05,3.85519006921668e-05,3.83958620557194e-05,3.82207952284668e-05,3.80269368142382e-05,3.78145317981768e-05,3.75838333518232e-05,3.73351026350876e-05,3.70686085952445e-05,3.67846277630824e-05,3.64834440463399e-05,3.61653485205641e-05,3.58306392175243e-05,3.54796209113175e-05,3.51126049022989e-05,3.47299087989734e-05,3.43318562979864e-05,3.39187769623452e-05,3.34910059980102e-05,3.30488840289915e-05,3.25927568710847e-05,3.21229753043848e-05,3.16398948447076e-05,3.11438755140624e-05,3.06352816103032e-05,3.01144814760946e-05,2.95818472673267e-05,2.90377547211135e-05,2.84825829235032e-05,2.79167140770348e-05,2.73405332682702e-05,2.67544282354346e-05,2.61587891362892e-05,2.55540083163661e-05,2.49404800776967e-05,2.43186004481496e-05,2.36887669515123e-05,2.30513783784305e-05,2.24068345583368e-05,2.17555361324792e-05,2.10978843281734e-05,2.04342807343983e-05,1.97651270788444e-05,1.9090825006532e-05,1.84117758601162e-05,1.77283804619801e-05,1.70410388982337e-05,1.63501503047186e-05,1.56561126551312e-05,1.495932255136e-05,1.42601750161419e-05,1.35590632881393e-05,1.28563786195292e-05,1.21525100762026e-05,1.14478443406704e-05,1.07427655177589e-05,1.00376549431904e-05,9.33289099512935e-06,8.62884890878591e-06,7.92590059414905e-06,7.22441445693406e-06,6.52475522282227e-06,5.82728376506355e-06,5.13235693551779e-06,4.44032739920081e-06,3.75154347240349e-06,3.06634896445296e-06,2.38508302317038e-06,1.70807998408878e-06,1.03566922349158e-06,3.68175015318385e-07,-2.94083608003316e-07,-9.50792990756429e-07,-1.60164498510903e-06,-2.24633707822957e-06,-2.88457251529726e-06,-3.51606041836508e-06,-4.1405159010472e-06,-4.75766017899044e-06,-5.3672206761039e-06,-5.96893112651197e-06,-6.56253167221256e-06,-7.14776895641407e-06,-7.72439621252695e-06,-8.29217334879925e-06,-8.85086702857723e-06,-9.40025074617521e-06,-9.94010489835156e-06,-1.04702168513777e-05,-1.09903810036992e-05,-1.15003988441811e-05,-1.20000790059446e-05,-1.24892373157939e-05,-1.29676968392356e-05,-1.34352879211057e-05,-1.38918482218078e-05,-1.43372227491768e-05,-1.47712638859842e-05,-1.51938314131016e-05,-1.56047925283423e-05,-1.60040218609995e-05,-1.63914014821138e-05,-1.67668209104844e-05,-1.71301771144641e-05,-1.74813745095637e-05,-1.78203249518961e-05,-1.81469477275018e-05,-1.84611695375892e-05,-1.87629244797279e-05,-1.90521540250401e-05,-1.93288069914307e-05,-1.95928395129016e-05,-1.98442150049985e-05,-2.00829041264386e-05,-2.03088847369704e-05,-2.05221418515167e-05,-2.07226675906579e-05,-2.09104611275098e-05,-2.10855286310533e-05,-2.12478832059766e-05,-2.13975448290908e-05,-2.15345402823792e-05,-2.16589030827471e-05,-2.17706734085351e-05,-2.18698980228636e-05,-2.19566301938759e-05,-2.20309296119499e-05,-2.20928623039478e-05,-2.21425005445764e-05,-2.21799227649299e-05,-2.22052134582896e-05,-2.22184630832555e-05,-2.22197679642845e-05,-2.2209230189713e-05,-2.21869575073415e-05,-2.21530632176586e-05,-2.21076660647849e-05,-2.20508901252157e-05,-2.19828646944433e-05,-2.19037241715403e-05,-2.1813607941786e-05,-2.17126602574166e-05,-2.16010301165839e-05,-2.14788711406045e-05,-2.13463414495824e-05,-2.1203603536491e-05,-2.10508241397953e-05,-2.08881741147018e-05,-2.07158283031179e-05,-2.05339654024071e-05,-2.03427678330235e-05,-2.01424216051101e-05,-1.99331161841466e-05,-1.97150443557299e-05,-1.94884020895713e-05,-1.92533884027966e-05,-1.90102052226299e-05,-1.87590572485474e-05,-1.85001518139831e-05,-1.82336987476685e-05,-1.79599102346913e-05,-1.76790006773523e-05,-1.73911865559027e-05,-1.7096686289245e-05,-1.67957200956739e-05,-1.64885098537403e-05,-1.61752789633143e-05,-1.58562522069298e-05,-1.55316556114829e-05,-1.52017163103648e-05,-1.48666624061034e-05,-1.45267228335893e-05,-1.41821272239585e-05,-1.38331057692082e-05,-1.34798890876143e-05,-1.31227080900243e-05,-1.27617938470932e-05,-1.23973774575348e-05,-1.20296899174529e-05,-1.16589619908198e-05,-1.12854240811699e-05,-1.09093061045694e-05,-1.05308373639279e-05,-1.01502464247116e-05,-9.76776099211927e-06,-9.38360778978138e-06,
 -8.99801244003842e-06,-8.61119934585469e-06,-8.22339157442569e-06,-7.83481074252834e-06,-7.44567690366961e-06,-7.05620843708182e-06,-6.66662193861727e-06,-6.27713211358587e-06,-5.88795167158395e-06,
 -5.49929122336098e-06,-5.11135917976332e-06,-4.72436165279992e-06,-4.33850235886763e-06,-3.95398252417812e-06,-3.57100079241897e-06,-3.18975313468634e-06,-2.81043276172504e-06,-2.43323003850373e-06,-2.05833240115816e-06,-1.685924276333e-06,-1.31618700294526e-06,
 -9.49298756398598e-07,-5.85434475269598e-07,-2.24765790491996e-07,1.32539042944795e-07,4.86315211761806e-07,8.36401407601896e-07,1.18263988767471e-06,1.52487653281903e-06,
 1.86296090296814e-06,2.1967462900115e-06,2.52608976803993e-06,2.85085224096945e-06,3.17089848753367e-06,3.48609720364737e-06,3.79632104212865e-06,4.10144664978819e-06,4.40135470188026e-06,
 4.69592993391713e-06,4.98506117085352e-06,5.26864135364426e-06,5.54656756317972e-06,5.81874104161062e-06,6.08506721106972e-06,6.34545568979961e-06,6.59982030570251e-06,6.84807910732276e-06,
 7.09015437227939e-06,7.32597261316241e-06,7.55546458091406e-06,7.77856526571272e-06,7.99521389537843e-06,8.205353931325e-06,8.40893306208027e-06,8.60590319439753e-06,8.79622044198664e-06,
 8.97984511188938e-06,9.15674168852855e-06,9.32687881545793e-06,9.49022927484591e-06,9.64676996472302e-06,9.79648187402453e-06,9.9393500554642e-06,1.00753635962716e-05,1.02045155868301e-05,1.03268030872496e-05,1.04422270919149e-05,
 1.0550792492045e-05,1.06525080363035e-05,1.07473862895008e-05,1.08354435894281e-05,1.0916700001865e-05,1.09911792738028e-05,1.10589087849281e-05,1.11199194974072e-05,1.11742459040199e-05,1.12219259746839e-05,1.12630011014179e-05,
 1.12975160417894e-05,1.13255188608912e-05,1.13470608718987e-05,1.13621965752502e-05,1.13709835965034e-05,1.13734826229118e-05,1.13697573387741e-05,1.13598743596031e-05,1.13439031651642e-05,1.13219160314341e-05,1.12939879615282e-05,1.12601966156489e-05,1.12206222401028e-05,1.11753475954396e-05,1.11244578837615e-05,
 1.10680406752548e-05,1.10061858339947e-05,1.09389854430728e-05,1.08665337290994e-05,1.07889269861305e-05,1.07062634990703e-05,1.06186434666002e-05,1.05261689236834e-05,1.04289436636974e-05,1.03270731602418e-05,1.02206644886739e-05,1.01098262474198e-05,9.9946684791103e-06,9.87530259159214e-06,9.75184127886139e-06,
 9.62439844196833e-06,9.49308910994118e-06,9.35802936077671e-06,9.21933624254407e-06,9.07712769464879e-06,8.93152246930308e-06,8.78264005324777e-06,8.6306005897712e-06,8.47552480106908e-06,8.31753391098936e-06,8.15674956820604e-06,7.9932937698635e-06,7.82728878573374e-06,7.65885708292867e-06,7.48812125120668e-06,
 7.31520392891465e-06,7.14022772960352e-06,6.96331516935742e-06,6.78458859487235e-06,6.60417011232209e-06,6.42218151704837e-06,6.23874422410882e-06,6.05397919971873e-06,5.86800689361913e-06,
 5.68094717240549e-06,5.49291925384727e-06,5.30404164223008e-06,5.11443206475166e-06,4.9242074089991e-06,4.73348366153649e-06,4.54237584763148e-06,4.35099797214519e-06,4.15946296161273e-06,3.96788260753768e-06,
 3.7763675109258e-06,3.58502702807881e-06,3.39396921767065e-06,3.20330078912824e-06,3.01312705233424e-06,2.82355186867183e-06,2.63467760343009e-06,2.44660507958479e-06,
 2.25943353297212e-06,2.0732605688689e-06,1.88818211999487e-06,1.70429240594667e-06,1.52168389407997e-06,1.3404472618458e-06,1.16067136059361e-06,9.82443180850183e-07,8.05847819080474e-07,
 6.30968445938114e-07,4.57886276012498e-07,2.86680539075395e-07,1.17428452831953e-07,-4.97948028199512e-08,-2.14916110022078e-07,-3.77864435677152e-07,-5.38570852660314e-07,-6.96968559519905e-07,-8.5299289867131e-07,-1.00658137308564e-06,
 -1.15767366147596e-06,-1.30621163198739e-06,-1.45213935439567e-06,-1.59540311081939e-06,-1.73595140495523e-06,-1.87373496984243e-06,-2.00870677416658e-06,-2.14082202711105e-06,-2.27003818176826e-06,-2.39631493712127e-06,-2.51961423860721e-06,-2.63990027727693e-06,-2.75713948756333e-06,
 -2.87130054367384e-06,-2.98235435462072e-06,-3.0902740579069e-06,-3.19503501188303e-06,-3.29661478679242e-06,-3.39499315452328e-06,-3.4901520770861e-06,-3.58207569383478e-06,-3.67075030745277e-06,
 -3.75616436872432e-06,-3.83830846011025e-06,-3.91717527815299e-06,-3.99275961473001e-06,-4.06505833718047e-06,-4.13407036732752e-06,-4.19979665941946e-06,-4.2622401770152e-06,
 -4.32140586883761e-06,-4.37730064362061e-06,-4.42993334397458e-06,-4.47931471929708e-06,-4.52545739775463e-06,-4.56837585736177e-06,-4.60808639618528e-06,-4.6446071017002e-06,
 -4.67795781932549e-06,-4.708160120167e-06,-4.73523726799615e-06,-4.75921418549266e-06,-4.78011741977943e-06,-4.79797510727911e-06,-4.81281693792078e-06,-4.82467411872586e-06,-4.83357933680285e-06,-4.83956672177993e-06,-4.84267180770512e-06,
 -4.84293149444328e-06,-4.84038400859978e-06,-4.8350688640006e-06,-4.82702682175797e-06,-4.81629984995191e-06,-4.80293108295687e-06,-4.7869647804432e-06,-4.76844628608298e-06,
 -4.74742198598981e-06,-4.72393926692185e-06,-4.69804647427729e-06,-4.66979286991169e-06,-4.63922858980587e-06,-4.60640460161349e-06,-4.57137266211669e-06,-4.53418527461856e-06,
 -4.49489564630047e-06,-4.45355764557233e-06,-4.41022575944365e-06,-4.36495505094286e-06,-4.317801116612e-06,-4.26882004410401e-06,-4.21806836990897e-06,-4.16560303723581e-06,
 -4.11148135407526e-06,-4.05576095146995e-06,-3.99849974201672e-06,-3.9397558786259e-06,-3.87958771356254e-06,-3.81805375779311e-06,-3.75521264066175e-06,-3.691123069919e-06,
 -3.6258437921263e-06,-3.55943355345803e-06,-3.49195106092336e-06,-3.42345494402937e-06,-3.35400371690615e-06,-3.28365574091442e-06,-3.21246918775589e-06,-3.14050200310536e-06,
 -3.06781187078387e-06,-2.99445617749092e-06,-2.9204919781143e-06,-2.84597596163407e-06,-2.77096441763785e-06,-2.69551320346391e-06,-2.61967771198731e-06,-2.54351284006418e-06,
 -2.46707295764928e-06,-2.39041187760002e-06,-2.31358282618093e-06,-2.23663841428083e-06,-2.15963060935584e-06,-2.08261070810835e-06,-2.00562930991492e-06,-1.92873629101175e-06,-1.85198077944851e-06,-1.77541113081986e-06,-1.69907490478283e-06,
 -1.62301884236816e-06,-1.54728884409369e-06,-1.47192994888574e-06,-1.39698631381516e-06,-1.32250119465413e-06,-1.24851692725776e-06,-1.17507490977595e-06,
 -1.10221558569852e-06,-1.02997842773779e-06,-9.58401922550402e-07,-8.87523556300847e-07,-8.17379801068637e-07,-7.48006102099267e-07,-6.79436865899722e-07,-6.1170544917867e-07,-5.44844148629826e-07,-4.78884191557767e-07,
 -4.13855727343869e-07,-3.49787819750523e-07,-2.8670844005994e-07,-2.24644461044386e-07,-1.63621651764123e-07,-1.03664673187799e-07,-4.4797074630806e-08,0.0
];

})