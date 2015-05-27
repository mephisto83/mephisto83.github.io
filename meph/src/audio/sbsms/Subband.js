/**
 * @class MEPH.audio.sbsms.Subband
 **/

var NDownSample = 256,
    SDownSample = 4,
    subBufSize = 512,
    hSub = NDownSample / (2 * SDownSample);

MEPH.define('MEPH.audio.sbsms.Subband', {
    statics: {
    },
    properties: {
        nMarkLatency: 0,
        nAssignLatency: 0,
        nTrial2Latency: 0,
        nAdjust2Latency: 0,
        nTrial1Latency: 0,
        nAdjust1Latency: 0,
        nRenderLatency: 0,
        nWriteSlack: 0,
        nExtractSlack: 0,
        nAnalyzeSlack: 0,
        nMarkSlack: 0,
        nAssignSlack: 0,
        nTrial2Slack: 0,
        nAdjust2Slack: 0,
        nTrial1Slack: 0,
        nAdjust1Slack: 0,
        nRenderSlack: 0,
        //list<SBSMSRenderer*> renderers;
        renderers: null,
        //RingBuffer<float> stretchRender;
        stretchRender: null,
        //RingBuffer<float> pitchRender;
        pitchRender: null,
        //int inputFrameSize;
        inputFrameSize: 0,
        // RingBuffer<int> outputFrameSize;
        outputFrameSize: null,
        //float totalSizef;
        totalSizef: null,
        //SBSMSQuality *quality;
        quality: null,
        //int channels;
        channels: 0,
        N: 0,
        h: 0,
        band: 0,
        nReadFromOutputFrame: 0,
        nToWriteForGrain: 0,
        res: 0,
        resMask: 0,
        nGrainsPerFrame: 0,
        nToDrop0: 0,
        nToDrop1: 0,
        nToDrop2: 0,
        nToPrepad1: 0,
        nToPrepad0: 0,
        bSynthesize: false,

        nGrainsToAnalyze: null,
        nGrainsToExtract: null,
        nGrainsToMark: null,
        nGrainsToAssign: null,
        nGrainsToAdvance: null,
        nGrainsToTrial2: null,
        nGrainsToAdjust2: null,
        nGrainsToTrial1: null,
        nGrainsToAdjust1: null,
        nGrainsToRender: null,
        nGrainsWritten: null,
        nGrainsMarked: null,
        nGrainsAssigned: null,
        nGrainsTrialed2: null,
        nGrainsAdjusted2: null,
        nGrainsTrialed1: null,
        nGrainsAdjusted1: null,
        nGrainsAdvanced: null,
        nGrainsRendered: null,
        nGrainsRead: null,

        nFramesAnalyzed: null,
        nFramesExtracted: null,
        nFramesMarked: null,
        nFramesAssigned: null,
        nFramesTrialed2: null,
        nFramesAdjusted2: null,
        nFramesTrialed1: null,
        nFramesAdjusted1: null,
        nFramesRendered: null,
        nFramesRead: null,

        //SubBand *parent;
        parent: null,
        //        SubBand *sub;
        sub: null,
        //SampleBufBase *outMixer;
        outMixer: null,
        //SynthRenderer *synthRenderer;
        synthRenderer: null,
        //SMS *sms;
        sms: null,
        //SampleBuf *samplesSubIn;
        samplesSubIn: null,
        //SampleBuf *samplesSubOut;
        samplesSubOut: null,
        //GrainBuf *grains[3];
        grains: null,
        //GrainBuf *analyzedGrains[3][2];
        analyzedGrains: null,
        //GrainBuf *grainsIn;
        grainsIn: null,
        //GrainAllocator *downSampledGrainAllocator;
        downSampledGrainAllocator: null
    },
    //SubBand *parent, int band, int channels, SBSMSQuality *quality, bool bSynthesize
    initialize: function (parent, band, channels, quality, bSynthesize) {
        var me = this;
        if (band < quality.params.bands - 1) {
            me.sub = new SubBand(this, band + 1, channels, quality, bSynthesize);
        } else {
            me.sub = null;
        }
        this.quality = quality;
        this.channels = channels;
        this.parent = parent;
        this.band = band;
        var M = (1 << band);
        var M_MAX = 1 << (quality.params.bands - 1);
        this.N = quality.params.N[band];
        var N0 = quality.params.N0[band];
        var N1 = quality.params.N1[band];
        var N2 = quality.params.N2[band];
        this.res = quality.params.res[band];
        this.resMask = this.res - 1;
        this.bSynthesize = bSynthesize;
        me.nGrainsPerFrame = this.res;
        if (me.sub) me.nGrainsPerFrame *= me.sub.nGrainsPerFrame;
        me.inputFrameSize = M_MAX * quality.params.H;
        h = me.inputFrameSize / (M * me.nGrainsPerFrame);
        me.nToDrop0 = (quality.getMaxPresamples() / M - N0 / 2);
        me.nToDrop1 = (quality.getMaxPresamples() / M - N1 / 2);
        me.nToDrop2 = (quality.getMaxPresamples() / M - N2 / 2);
        me.nToWriteForGrain = (quality.getMaxPresamples() / M + N2 / 2);
        me.nToPrepad1 = N1 / 2;
        me.nToPrepad0 = N0 / 2;
        me.nReadFromOutputFrame = 0;
        me.nFramesAnalyzed = me.nFramesAnalyzed || []
        for (var i = 0; i < 3; i++) {
            me.nFramesAnalyzed.push(0);
        }
        for (var c = 0; c < me.channels; c++) {
            //me.nFramesExtracted[c] = 0;
            me.nFramesExtracted = [].interpolate(0, me.channels, function () { return 0; });
            //me.nFramesMarked[c] = 0;
            me.nFramesMarked = [].interpolate(0, me.channels, function () { return 0; });
            //me.nFramesAssigned[c] = 0;
            me.nFramesAssigned = [].interpolate(0, me.channels, function () { return 0; });
            //me.nFramesTrialed2[c] = 0;
            me.nFramesTrialed2 = [].interpolate(0, me.channels, function () { return 0; });
            //me.nFramesTrialed1[c] = 0;
            me.nFramesTrialed1 = [].interpolate(0, me.channels, function () { return 0; });
            //me.nFramesRendered[c] = 0;
            me.nFramesRendered = [].interpolate(0, me.channels, function () { return 0; });
            //me.nGrainsMarked[c] = 0;
            me.nGrainsMarked = [].interpolate(0, me.channels, function () { return 0; });
            //me.nGrainsAssigned[c] = 0;
            me.nGrainsAssigned = [].interpolate(0, me.channels, function () { return 0; });
            //me.nGrainsTrialed2[c] = 0;
            me.nGrainsTrialed2 = [].interpolate(0, me.channels, function () { return 0; });
            //me.nGrainsTrialed1[c] = 0;
            me.nGrainsTrialed1 = [].interpolate(0, me.channels, function () { return 0; });
            //me.nGrainsAdvanced[c] = 0;
            me.nGrainsAdvanced = [].interpolate(0, me.channels, function () { return 0; });
        }
        me.nGrainsWritten = 0;
        me.nFramesAdjusted2 = 0;
        me.nGrainsAdjusted2 = 0;
        me.nFramesAdjusted1 = 0;
        me.nGrainsAdjusted1 = 0;
        me.nFramesRead = 0;
        me.totalSizef = 0.0;
        me.grains = [].interpolate(0, 3, function () { return 0; });
        if (me.sub) {
            me.samplesSubIn = new SampleBuf(NDownSample / 2);
            me.grainsIn = new GrainBuf(NDownSample, NDownSample / SDownSample, NDownSample, hann);
            me.downSampledGrainAllocator = new GrainAllocator(NDownSample / 2, NDownSample / 2, hann);
        }
        if (band >= minTrial1Band) {
            me.grains[0] = new GrainBuf(N, h, N0, hannpoisson);
        } else {
            me.grains[0] = null;
        }
        if (band >= minTrial2Band) {
            me.grains[1] = new GrainBuf(N, h, N1, hannpoisson);
        } else {
            me.grains[1] = null;
        }
        me.grains[2] = new GrainBuf(N, h, N2, hannpoisson);
        for (var c = 0; c < me.channels; c++) {
            if (band >= minTrial1Band) {
                me.analyzedGrains[0][c] = new GrainBuf(N, h, N0, hannpoisson);
            } else {
                me.analyzedGrains[0][c] = null;
            }
            if (band >= minTrial2Band) {
                me.analyzedGrains[1][c] = new GrainBuf(N, h, N1, hannpoisson);
            } else {
                me.analyzedGrains[1][c] = null;
            }
            me.analyzedGrains[2][c] = new GrainBuf(N, h, N2, hannpoisson);
        }
        //#ifdef MULTITHREADED
        //        pthread_mutex_init(&dataMutex, null);
        //        for(var i=0; i<3; i++) {
        //            pthread_mutex_init(&grainMutex[i], null);
        //        }
        //#endif
        me.sms = new SMS(me.sub ? me.sub.sms : null, N, band, quality.params.bands - 1, h, this.res, N0, N1, N2, channels, me.analyzedGrains[2][0].getWindowFFT());
        var sms = me.sms;
        me.nTrial2Latency = me.sms.getTrial2Latency() / me.nGrainsPerFrame + 1;
        if (sms.getTrial2Latency() % me.nGrainsPerFrame) me.nTrial2Latency++;
        var nAdjust2LatencyGrains = N1 / (2 * h);
        me.nAdjust2Latency = nAdjust2LatencyGrains / me.nGrainsPerFrame + 1;
        if (nAdjust2LatencyGrains % me.nGrainsPerFrame) me.nAdjust2Latency++;
        var nAdjust1LatencyGrains = N0 / (2 * h);
        me.nAdjust1Latency = nAdjust1LatencyGrains / me.nGrainsPerFrame + 1;
        if (nAdjust1LatencyGrains % me.nGrainsPerFrame) me.nAdjust1Latency++;
        if (me.sub) me.nTrial2Latency = Math.max(me.nTrial2Latency, me.sub.nTrial2Latency);
        if (me.sub) me.nAdjust2Latency = Math.max(me.nAdjust2Latency, me.sub.nAdjust2Latency);
        if (me.sub) me.nAdjust1Latency = Math.max(me.nAdjust1Latency, me.sub.nAdjust1Latency);
        me.nMarkLatency = 1;
        me.nAssignLatency = 1;
        me.nTrial1Latency = 1;
        me.nRenderLatency = 1;
        if (band == 0) {
            var s = me.sub;
            while (s) {
                s.nTrial2Latency = me.nTrial2Latency;
                s.nAdjust2Latency = me.nAdjust2Latency;
                s.nAdjust1Latency = me.nAdjust1Latency;
                s = s.me.sub;
            }
        }
        //#ifdef MULTITHREADED
        //nWriteSlack = 6;
        //nAnalyzeSlack = 6;
        //nExtractSlack = 6;
        //nMarkSlack = 6;
        //nAssignSlack = 6;
        //nTrial2Slack = 6;
        //nAdjust2Slack = 6;
        //nTrial1Slack = 6;
        //nAdjust1Slack = 6;
        //nRenderSlack = 6;
        //#else
        me.nWriteSlack = 2;
        me.nAnalyzeSlack = 2;
        me.nExtractSlack = 2;
        me.nMarkSlack = 2;
        me.nAssignSlack = 2;
        me.nTrial2Slack = 2;
        me.nAdjust2Slack = 2;
        me.nTrial1Slack = 2;
        me.nAdjust1Slack = 2;
        me.nRenderSlack = 2;
        //#endif
        me.synthRenderer = null;
        me.outMixer = null;
        me.renderers = [];
        if (me.bSynthesize) {
            me.synthRenderer = new SynthRenderer(channels, M * h);
            me.renderers.push(me.synthRenderer);
            if (me.sub) {
                me.samplesSubOut = new SampleBuf(0);
                me.outMixer = new Mixer(me.synthRenderer, me.samplesSubOut);
            } else {
                me.outMixer = me.synthRenderer;
            }
        }
    },

    //SubBand :: ~SubBand
    destroy: function () {
        var me = this;
        for (var i = 0; i < 3; i++) {
            if (me.grains[i]) {
                delete grains[i];
            }
            for (var c = 0; c < me.channels; c++) {
                if (me.analyzedGrains[i][c]) {
                    delete me.analyzedGrains[i][c];
                }
            }
        }
        delete sms;
        if (me.sub) {
            delete me.sub;
            delete me.grainsIn;
            delete me.samplesSubIn;
            delete me.downSampledGrainAllocator;
            if (me.bSynthesize) {
                delete me.samplesSubOut;
                delete me.outMixer;
            }
        }
        if (me.bSynthesize) delete me.synthRenderer;
    },
    //void SubBand :: //SBSMSRenderer *renderer
    addRenderer: function (renderer) {
        var me = this;
        if (me.sub) me.sub.addRenderer(renderer);
        me.renderers.push(renderer);
    },
    //void SubBand :: //SBSMSRenderer *renderer
    removeRenderer: function (renderer) {
        var me = this;
        if (me.sub) me.sub.removeRenderer(renderer);
        me.renderers.removeWhere(function (x) { return x === renderer; });
    },
    //void SubBand :: 
    setStretch: function (stretch) {
        //#ifdef MULTITHREADED
        //    pthread_mutex_lock(&dataMutex);
        //#endif
        var me = this;
        if (!me.parent) {
            var oFrameSizef = (stretch == 0.0 ? 1.0 : stretch) * inputFrameSize;
            me.totalSizef += oFrameSizef;
            var oFrameSizei = lrintf(me.totalSizef);
            me.totalSizef -= oFrameSizei;
            me.outputFrameSize.write(oFrameSizei);
        }
        me.stretchRender.write(stretch);
        //#ifdef MULTITHREADED
        //        pthread_mutex_unlock(&dataMutex);
        //#endif
        if (me.sub) me.sub.setStretch(stretch);
    },
    //void SubBand :: :float f
    setPitch: function (f) {

        var me = this;
        if (me.sub) me.sub.setPitch(f);
        //#ifdef MULTITHREADED
        //    pthread_mutex_lock(&dataMutex);
        //#endif
        me.pitchRender.write(f);
        //#ifdef MULTITHREADED
        //    pthread_mutex_unlock(&dataMutex);
        //#endif    
    },
    //void SubBand :: int i
    stepAnalyzeFrame: function (i) {
        var me = this;
        if (me.sub) me.sub.stepAnalyzeFrame(i);
        me.nFramesAnalyzed[i]++;
    },
    //void SubBand :: //int c
    stepExtractFrame: function (c) {
        var me = this;
        if (me.sub) me.sub.stepExtractFrame(c);
        me.nFramesExtracted[c]++;
    },
    //void SubBand :: int c
    stepMarkFrame: function (c) {
        var me = this;
        if (me.sub) me.sub.stepMarkFrame(c);
        me.nFramesMarked[c]++;
    },
    //void SubBand :: //int c
    stepAssignFrame: function (c) {
        var me = this;
        if (me.sub) me.sub.stepAssignFrame(c);
        me.nFramesAssigned[c]++;
    },
    //int c
    stepTrial2Frame: function (c) {
        var me = this;
        if (me.sub) me.sub.stepTrial2Frame(c);
        me.nFramesTrialed2[c]++;
    },
    //    void SubBand :: 
    stepAdjust2Frame: function () {
        var me = this;
        if (me.sub) me.sub.stepAdjust2Frame();
        me.nFramesAdjusted2++;
    },
    stepTrial1Frame: function (c) {
        var me = this;
        if (me.sub) me.sub.stepTrial1Frame(c);
        me.nFramesTrialed1[c]++;
    },

    stepAdjust1Frame: function () {
        var me = this;
        if (me.sub) me.sub.stepAdjust1Frame();
        //#ifdef MULTITHREADED
        //    pthread_mutex_lock(&dataMutex);
        //#endif
        me.stretchRender.advance(1);
        me.pitchRender.advance(1);
        //#ifdef MULTITHREADED
        //    pthread_mutex_unlock(&dataMutex);
        //#endif
        me.nFramesAdjusted1++;
    },

    stepRenderFrame: function (c) {
        var me = this;
        if (me.sub) me.sub.stepRenderFrame(c);
        me.nFramesRendered[c]++;
    },

    stepReadFrame: function () {
        var me = this;
        if (me.sub) me.sub.stepReadFrame();
        me.nFramesRead++;
    },

    writeInit: function () {
        var me = this;
        var n = me.getFramesAtFront(0);
        n = Math.min(n, me.getFramesAtFront(1));
        n = Math.min(n, me.getFramesAtFront(2));
        return (n <= me.nWriteSlack);
    },
    //long SubBand :: 
    readInit: function () {
        var me = this;
        var n = me.nFramesRendered[0];
        for (var c = 1; c < me.channels; c++) {
            n = Math.max(0, Math.min(1, Math.min(n, me.nFramesRendered[c] - me.nFramesRead)));
        }
        if (me.sub) n = Math.min(n, me.sub.readInit());
        return n;
    },
    //long SubBand :: //int i, bool bSet, long n
    analyzeInit: function (i, bSet, n) {
        var me = this;
        if (!me.parent) {
            n = me.getFramesAtFront(i);
            for (var c = 0; c < me.channels; c++) {
                n = Math.max(0, Math.min(1, Math.min(n, Math.nAnalyzeSlack - Math.round(me.nFramesAnalyzed[i] - me.nFramesExtracted[c]))));
            }
        }
        if (bSet) {
            me.nGrainsToAnalyze[i] = n * me.nGrainsPerFrame;
            if (me.sub) {
                me.sub.analyzeInit(i, bSet, n);
            }
        }
        return n;
    },
    //long SubBand :: //int c, bool bSet
    extractInit: function (c, bSet) {
        var me = this;
        var n;
        if (me.sub) n = me.res * me.sub.extractInit(c, bSet);
        if (!sub) {
            n = Math.max(0, Math.min(1, me.nExtractSlack + me.nMarkLatency - Math.floor(me.nFramesExtracted[c] - me.nFramesMarked[c])));
            for (var i = 0; i < 3; i++) {
                n = Math.max(0, Math.min(1, Math.min(n, Math.floor(me.nFramesAnalyzed[i] - me.nFramesExtracted[c]))));
            }
        }
        if (bSet) {
            me.nGrainsToExtract[c] = n;
        }
        return n;
    },
    //int c, bool bSet
    markInit: function (c, bSet) {
        var me = this;
        var n;
        if (me.sub) n = me.res * me.sub.markInit(c, bSet);
        if (!sub) n = Math.max(0, Math.min(1, Math.min(Math.floor(me.nFramesExtracted[c] - me.nFramesMarked[c]) - me.nMarkLatency,
                                     me.nMarkSlack + me.nAssignLatency - Math.floor(me.nFramesMarked[c] - me.nFramesAssigned[c]))));
        if (bSet) {
            me.nGrainsToMark[c] = n;
        }
        return n;
    },
    //int c, bool bSet
    assignInit: function (c, bSet) {
        var me = this;
        var n;
        if (me.sub) {
            n = me.res * me.sub.assignInit(c, bSet);
        } else {
            n = Math.max(0, Math.min(1, Math.min(Math.floor(me.nFramesMarked[c] - me.nFramesAssigned[c]) - me.nAssignLatency,
                                  me.nAssignSlack + me.nTrial2Latency - Math.floor(me.nFramesAssigned[c] - me.nFramesTrialed2[c]))));
        }
        if (bSet) {
            me.nGrainsToAdvance[c] = n;
            me.nGrainsToAssign[c] = n;
            if (n) {
                if (me.nFramesAssigned[c] == 0) {
                    me.sms.start(0, c);
                }
            }
        }
        return n;
    },
    //long SubBand :: //int c, bool bSet
    trial2Init: function (c, bSet) {
        var me = this;
        var n;

        if (me.sub) {
            n = me.res * me.sub.trial2Init(c, bSet);
        } else {
            n = Math.max(0, Math.min(1, Math.min(Math.floor(me.nFramesAssigned[c] - me.nFramesTrialed2[c]) - me.nTrial2Latency,
                                  me.nTrial2Slack + me.nAdjust2Latency - Math.floor(me.nFramesTrialed2[c] - me.nFramesAdjusted2))));
        }
        if (bSet) {
            me.nGrainsToTrial2[c] = n;
            me.nGrainsTrialed2[c] = 0;
        }
        return n;
    },
    //long SubBand ::bool bSet 
    adjust2Init: function (bSet) {
        var me = this;
        var n;
        if (me.sub) {
            n = me.res * me.sub.adjust2Init(bSet);
        } else {
            n = 1;
            for (var c = 0; c < me.channels; c++) {
                n = Math.min(n, Math.floor(me.nFramesTrialed2[c] - me.nFramesAdjusted2 - me.nAdjust2Latency));
                n = Math.min(n, me.nAdjust2Slack + me.nTrial1Latency - Math.floor(me.nFramesAdjusted2 - me.nFramesTrialed1[c]));
            }
            n = Math.max(0, n);
        }
        if (bSet) {
            me.nGrainsToAdjust2 = n;
            me.nGrainsAdjusted2 = 0;
        }
        return n;
    },
    //    long SubBand :: //int c, bool bSet
    trial1Init: function (c, bSet) {
        var me = this;
        var n;
        if (me.sub) {
            n = me.res * me.sub.trial1Init(c, bSet);
        } else {
            n = Math.max(0, Math.min(1, Math.min(Math.floor(me.nFramesAdjusted2 - me.nFramesTrialed1[c]) - me.nTrial1Latency,
                                  me.nTrial1Slack + me.nAdjust1Latency - Math.floor(me.nFramesTrialed1[c] - me.nFramesAdjusted1))));
        }
        if (bSet) {
            me.nGrainsToTrial1[c] = n;
            me.nGrainsTrialed1[c] = 0;
        }
        return n;
    },
    //long SubBand :: //
    adjust1Init: function (bSet) {
        var me = this;
        var n;
        if (me.sub) {
            n = me.res * me.sub.adjust1Init(bSet);
        } else {
            n = 1;
            for (var c = 0; c < me.channels; c++) {
                n = Math.min(n, Math.floor(me.nFramesTrialed1[c] - me.nFramesAdjusted1 - me.nAdjust1Latency));
                n = Math.min(n, me.nAdjust1Slack + me.nRenderLatency - Math.floor(me.nFramesAdjusted1 - me.nFramesRendered[c]));
            }
            n = Math.max(0, n);
        }
        if (bSet) {
            me.nGrainsToAdjust1 = n;
            me.nGrainsAdjusted1 = 0;
        }
        return n;
    },
    //long SubBand :: //int c, bool bSet
    renderInit: function (c, bSet) {
        var me = this;
        var n;
        if (me.sub) {
            n = me.res * me.sub.renderInit(c, bSet);
        } else {
            n = Math.max(0, Math.min(1, Math.min(Math.floor(me.nFramesAdjusted1 - me.nFramesRendered[c]) - me.nRenderLatency,
                                  me.nRenderSlack - Math.floor(me.nFramesRendered[c] - me.nFramesRead))));
        }
        if (bSet) {
            me.nGrainsRendered[c] = 0;
            me.nGrainsToRender[c] = n;
        }
        return n;
    },

    analyze: function (i) {
        var me = this;
        if (me.sub) me.sub.analyze(i);
        if (me.grains[i]) {
            var gV = [];
            //#ifdef MULTITHREADED
            //    pthread_mutex_lock(&grainMutex[i]);
            //#endif
            for (var k = me.grains[i].readPos; k < me.grains[i].readPos + me.nGrainsToAnalyze[i]; k++) {
                var g = me.grains[i].read(k);
                gV.push_back(g);
            }
            //#ifdef MULTITHREADED
            //        pthread_mutex_unlock(&grainMutex[i]);
            //#endif

            for (var k = 0; k < me.nGrainsToAnalyze[i]; k++) {
                gV[k].analyze();
            }

            //#ifdef MULTITHREADED
            //        pthread_mutex_lock(&grainMutex[i]);
            //#endif
            for (var k = 0; k < me.nGrainsToAnalyze[i]; k++) {
                for (var c = 0; c < me.channels; c++) {
                    me.analyzedGrains[i][c].write(gV[k]);
                }
            }
            me.grains[i].advance(me.nGrainsToAnalyze[i]);
            //#ifdef MULTITHREADED
            //        pthread_mutex_unlock(&grainMutex[i]);
            //#endif
        }
    },
    //int c
    extract: function (c) {
        var me = this;
        if (me.sub) me.sub.extract(c);
        // vector<grain*> gV[3];
        var gV = [].interpolate(0, 3, function () { return 0; });

        for (var i = 0; i < 3; i++) {
            if (me.grains[i]) {
                //#ifdef MULTITHREADED
                //    pthread_mutex_lock(&grainMutex[i]);
                //#endif    
                for (var k = me.analyzedGrains[i][c].readPos;
                    k < me.analyzedGrains[i][c].readPos + me.nGrainsToExtract[c];
                k++) {
                    var g = me.analyzedGrains[i][c].read(k);
                    gV[i].push_back(g);
                }
                //#ifdef MULTITHREADED
                //        pthread_mutex_unlock(&grainMutex[i]);
                //#endif
            }
        }

        for (var k = 0; k < me.nGrainsToExtract[c]; k++) {
            var g0 = (me.grains[0] ? gV[0][k] : null);
            var g1 = (me.grains[1] ? gV[1][k] : null);
            var g2 = gV[2][k];
            me.sms.add(g0, g1, g2, c);
        }

        for (var i = 0; i < 3; i++) {
            if (me.grains[i]) {
                //#ifdef MULTITHREADED
                //    pthread_mutex_lock(&grainMutex[i]);
                //#endif
                me.analyzedGrains[i][c].advance(me.nGrainsToExtract[c]);
                //#ifdef MULTITHREADED
                //    pthread_mutex_unlock(&grainMutex[i]);
                //#endif
            }
        }
    },
    //int c
    mark: function (c) {
        var me = this;
        var ntodo = me.parent ? 1 : me.nGrainsToMark[c];
        var ndone = 0;
        while (ndone < ntodo) {
            me.sms.mark(nGrainsMarked[c], c);
            if (me.nGrainsMarked[c] & me.resMask || me.res === 1) {
                if (me.sub) me.sub.mark(c);
            }
            ndone++;
            me.nGrainsMarked[c]++;
        }
    },
    //int c
    assign: function (c) {
        var me = this;
        for (var ndone = 0; ndone < me.nGrainsToAssign[c]; ndone++) {
            me.assignStart(c);
            var bCont = true;
            while (bCont) {
                me.assignInit(c);
                me.assignFind(c);
                bCont = me.assignConnect(c);
            }
            me.assignStep(c);
            me.splitMerge(c);
        }
    },

    assignStart: function (c) {
        var me = this;
        if (me.sub && !(me.nGrainsAssigned[c] & me.resMask)) me.sub.assignStart(c);
        me.sms.assignStart(me.nGrainsAssigned[c], c);
    },
    //int c
    assignInit: function (c) {
        var me = this;
        if (me.sub) me.sub.assignInit(c);
        me.sms.assignInit(me.nGrainsAssigned[c], c);
    },
    //int c
    assignFind: function (c) {
        var me = this;
        if (me.sub) me.sub.assignFind(c);
        me.sms.assignFind(me.nGrainsAssigned[c], c);
    },
    //bool SubBand :: //int c
    assignConnect: function (c) {
        var me = this;
        var bCont = false;
        if (me.sub) {
            if (me.sub.assignConnect(c)) {
                bCont = true;
            }
        }
        if (me.sms.assignConnect(me.nGrainsAssigned[c], c, false)) {
            bCont = true;
        }
        return bCont;
    },
    //int c
    assignStep: function (c) {
        var me = this;
        me.sms.assignConnect(me.nGrainsAssigned[c], c, true);
        if (me.sub && !((me.nGrainsAssigned[c] + 1) & me.resMask)) {
            me.sub.assignStep(c);
        }
        me.sms.start(me.nGrainsAssigned[c] + 1, c);
    },
    //int c
    splitMerge: function (c) {
        var me = this;
        me.nGrainsAssigned[c]++;
        if (me.sub && !(me.nGrainsAssigned[c] & me.resMask)) {
            me.sub.splitMerge(c);
        }
        me.sms.splitMerge(c);
    },
    //int c
    advance: function (c) {
        var me = this;
        var ntodo = me.parent ? 1 : me.nGrainsToAdvance[c];
        var ndone = 0;
        while (ndone < ntodo) {
            if (me.sub && !(me.nGrainsAdvanced[c] & resMask)) {
                me.sub.advance(c);
            }
            me.sms.advance(c);
            me.nGrainsMarked[c]--;
            me.nGrainsAssigned[c]--;
            me.nGrainsAdvanced[c]++;
            ndone++;
        }
    },
    //int c
    trial2: function (c) {
        var me = this;
        for (var i = 0; i < me.nGrainsToTrial2[c]; i++) {
            me.trial2Start(c);
            me.trial2Trial(c);
            me.trial2End(c);
        }
    },
    //int c
    trial2Start: function (c) {
        var me = this;
        if (!(me.nGrainsTrialed2[c] & me.resMask)) {
            if (me.sub) me.sub.trial2Start(c);
            me.sms.trial2Start(c);
        }
    },
    // int c 
    trial2Trial: function (c) {
        var me = this;
        if (me.sub && !(me.nGrainsTrialed2[c] & me.resMask)) {
            me.sub.trial2Trial(c);
        }
        me.sms.trial2(c);
    },
    //int c
    trial2End: function (c) {
        var me = this;
        me.nGrainsTrialed2[c]++;
        if (!(me.nGrainsTrialed2[c] & me.resMask)) {
            if (me.sub) me.sub.trial2End(c);
            me.sms.trial2End(c);
        }
    },

    adjust2: function () {
        var me = this;
        var ntodo = me.parent ? 1 : me.nGrainsToAdjust2;
        var ndone = 0;
        while (ndone < ntodo) {
            if (!(me.nGrainsAdjusted2 & me.resMask)) {
                if (me.sub) me.sub.adjust2();
            }
            me.sms.adjust2();
            ndone++;
            me.nGrainsAdjusted2++;
        }
    },
    //int c
    trial1: function (c) {
        var me = this;
        for (var i = 0; i < me.nGrainsToTrial1[c]; i++) {
            me.trial1Start(c);
            me.trial1Trial(c);
            me.trial1End(c);
        }
    },
    //int c 
    trial1Start: function (c) {
        var me = this;
        if (!(me.nGrainsTrialed1[c] & me.resMask)) {
            if (me.sub) me.sub.trial1Start(c);
            me.sms.trial1Start(c);
        }
    },
    //int c
    trial1Trial: function (c) {
        var me = this;
        if (me.sub && !(me.nGrainsTrialed1[c] & me.resMask)) {
            me.sub.trial1Trial(c);
        }
        me.sms.trial1(c);
    },
    //int c 
    trial1End: function (c) {
        var me = this;
        me.nGrainsTrialed1[c]++;
        if (!(me.nGrainsTrialed1[c] & me.resMask)) {
            if (me.sub) me.sub.trial1End(c);
            me.sms.trial1End(c);
        }
    },

    adjust1: function () {
        var me = this;
        //#ifdef MULTITHREADED
        //    pthread_mutex_lock(&dataMutex);
        //#endif
        var stretch = me.stretchRender.read();
        var f0 = me.pitchRender.read(me.pitchRender.readPos);
        var f1;
        if (me.pitchRender.nReadable() >= 2) {
            f1 = me.pitchRender.read(me.pitchRender.readPos + 1);
        } else {
            f1 = f0;
        }
        //#ifdef MULTITHREADED
        //pthread_mutex_unlock(&dataMutex);
        //#endif
        var ntodo = me.parent ? 1 : me.nGrainsToAdjust1;
        var ndone = 0;
        var df = (f1 - f0) / me.nGrainsToAdjust1;
        while (ndone < ntodo) {
            if (!(me.nGrainsAdjusted1 & me.resMask)) {
                if (me.sub) me.sub.adjust1();
            }
            me.sms.adjust1(stretch, f0 + me.nGrainsAdjusted1 * df, f0 + (me.nGrainsAdjusted1 + 1) * df);
            ndone++;
            me.nGrainsAdjusted1++;
        }
    },

    readSubSamples: function () {
        var me = this;
        if (me.sub) me.sub.readSubSamples();
        if (me.sub) {
            //audio fromSub[subBufSize];
            var fromSub = [].interpolate(0, me.subBufSize, function () { return 0; })
            var nFromSub = 0;
            do {
                nFromSub = me.sub.outMixer.read(fromSub, me.subBufSize);
                me.samplesSubOut.write(fromSub, nFromSub);
            } while (nFromSub > 0);
        }
    },
    //long SubBand :: //audio *buf, long n
    read: function (buf, n) {
        var me = this;
        var nRead = 0;
        var nToRead = n;
        me.readSubSamples();
        while (nToRead && nRead < n && me.outputFrameSize.nReadable()) {
            var nToReadFromOutputFrame = me.outputFrameSize.read();
            nToRead = Math.min(n - nRead, nToReadFromOutputFrame - me.nReadFromOutputFrame);
            nToRead = me.outMixer.read(buf + nRead, nToRead);
            me.nReadFromOutputFrame += nToRead;
            nRead += nToRead;
            if (me.nReadFromOutputFrame == nToReadFromOutputFrame) {
                me.nReadFromOutputFrame = 0;
                me.outputFrameSize.advance(1);
                me.stepReadFrame();
            }
        }
        return nRead;
    },
    //long SubBand :: 
    renderSynchronous: function () {
        var me = this;
        //for(list<SBSMSRenderer*>::iterator i = renderers.begin(); i != renderers.end(); ++i) {
        //    SBSMSRenderer *renderer = *i;
        //    renderer.startFrame();
        //}
        [].interpolate(me.renderers.begin(), me.renderers.end(), function (i) {
            renderers[i].startFrame();
        });
        for (var c = 0; c < me.channels; c++) {
            me.renderInit(c, true);
            me.render(c);
            me.stepRenderFrame(c);
        }
        //for(list<SBSMSRenderer*>::iterator i = renderers.begin(); i != renderers.end(); ++i) {
        //    SBSMSRenderer *renderer = *i;
        //    renderer.endFrame();
        //}
        [].interpolate(me.renderers.begin(), me.renderers.end(), function (i) {
            renderers[i].endFrame();
        });
        var samples = me.outputFrameSize.read();
        me.outputFrameSize.advance(1);
        me.stepReadFrame();
        return samples;
    },
    //int c
    render: function (c) {
        var me = this;
        var ntodo = me.parent ? 1 : me.nGrainsToRender[c];
        var ndone = 0;
        var nRenderedTotal = 0;

        while (ndone < ntodo) {
            if (me.sub && !(me.nGrainsRendered[c] & me.resMask)) {
                me.sub.render(c);
            }
            me.sms.render(c, me.renderers);
            me.nGrainsRendered[c]++;
            ndone++;
        }
    },
    //const SampleCountType &samples
    renderComplete: function (samples) {
        var me = this;
        //for(list<SBSMSRenderer*>::iterator i = renderers.begin(); i != renderers.end(); ++i) {
        //    SBSMSRenderer *renderer = *i;
        //    renderer.end(samples);
        //}
        [].interpolate(me.renderers.begin(), renderers.end(), function (i) {
            me.renderers[i].end();
        })
    },
    //long SubBand :: //audio *inBuf, long n, float stretch, float pitch
    write: function (inBuf, n, stretch, pitch) {
        var me = this;
        var nWritten = 0;

        while (nWritten < n) {
            var nToWrite = Math.min(me.nToWriteForGrain, n - nWritten);
            if (me.nToDrop2) {
                nToWrite = Math.min(me.nToDrop2, nToWrite);
                me.nToDrop2 -= nToWrite;
                me.nToDrop1 -= nToWrite;
                me.nToDrop0 -= nToWrite;
            } else {
                if (me.nToDrop1) {
                    nToWrite = Math.min(me.nToDrop1, nToWrite);
                    me.nToDrop1 -= nToWrite;
                    me.nToDrop0 -= nToWrite;
                } else {
                    if (me.nToDrop0) {
                        nToWrite = Math.min(me.nToDrop0, nToWrite);
                    } else if (me.nToPrepad0) {
                        nToWrite = Math.min(me.nToPrepad0, nToWrite);
                    }
                    if (me.nToPrepad1) {
                        nToWrite = Math.min(me.nToPrepad1, nToWrite);
                        me.sms.prepad1(inBuf + nWritten, nToWrite);
                        me.nToPrepad1 -= nToWrite;
                    }
                    if (me.nToDrop0) {
                        me.nToDrop0 -= nToWrite;
                    } else {
                        if (me.nToPrepad0) {
                            me.sms.prepad0(inBuf + nWritten, nToWrite);
                            me.nToPrepad0 -= nToWrite;
                        }
                        //#ifdef MULTITHREADED
                        //        pthread_mutex_lock(&grainMutex[0]);
                        //#endif      
                        if (me.grains[0]) {
                            me.grains[0].write(inBuf + nWritten, nToWrite);
                        }
                        //#ifdef MULTITHREADED
                        //        pthread_mutex_unlock(&grainMutex[0]);
                        //#endif
                    }
                    //#ifdef MULTITHREADED
                    //      pthread_mutex_lock(&grainMutex[1]);
                    //#endif      
                    if (me.grains[1]) {
                        me.grains[1].write(inBuf + nWritten, nToWrite);
                    }
                    //#ifdef MULTITHREADED
                    //      pthread_mutex_unlock(&grainMutex[1]);
                    //#endif
                }
                //#ifdef MULTITHREADED
                //    pthread_mutex_lock(&grainMutex[2]);
                //#endif      
                me.grains[2].write(inBuf + nWritten, nToWrite);
                //#ifdef MULTITHREADED
                //    pthread_mutex_unlock(&grainMutex[2]);
                //#endif
            }
            nWritten += nToWrite;
            me.nToWriteForGrain -= nToWrite;
            if (me.nToWriteForGrain == 0) {
                me.nToWriteForGrain = h;
                if (!me.parent) {
                    if (me.nGrainsWritten == 0) {
                        me.setStretch(stretch);
                        me.setPitch(pitch);
                    }
                    me.nGrainsWritten++;
                    if (me.nGrainsWritten == me.nGrainsPerFrame) {
                        me.nGrainsWritten = 0;
                    }
                }
            }
        }

        if (me.sub) {
            me.grainsIn.write(inBuf, n);
            var nGrainsRead = 0;
            for (var k = me.grainsIn.readPos; k < me.grainsIn.writePos; k++) {
                var g = me.grainsIn.read(k);
                g.analyze();
                var gdown = me.downSampledGrainAllocator.create();
                g.downsample(gdown);
                me.samplesSubIn.write(gdown, hSub);
                me.downSampledGrainAllocator.forget(gdown);
                nGrainsRead++;
            }
            me.grainsIn.advance(nGrainsRead);
            var nWriteToSub = me.samplesSubIn.nReadable();
            var subBuf = me.samplesSubIn.getReadBuf();
            me.nWriteToSub = me.sub.write(subBuf, me.nWriteToSub, stretch, pitch);
            me.samplesSubIn.advance(nWriteToSub);
        }
        return n;
    },
    //bool bRender
    process: function (bRender) {
        var me = this;
        for (var i = 0; i < 3; i++) {
            if (me.analyzeInit(i, true)) {
                me.analyze(i);
                me.stepAnalyzeFrame(i);
            }
        }

        for (var c = 0; c < me.channels; c++) {
            if (me.extractInit(c, true)) {
                me.extract(c);
                me.stepExtractFrame(c);
            }

            if (me.markInit(c, true)) {
                me.mark(c);
                me.stepMarkFrame(c);
            }

            if (me.assignInit(c, true)) {
                me.assign(c);
                me.advance(c);
                me.stepAssignFrame(c);
            }

            if (me.trial2Init(c, true)) {
                me.trial2(c);
                me.stepTrial2Frame(c);
            }

            if (me.adjust2Init(true)) {
                me.adjust2();
                me.stepAdjust2Frame();
            }

            if (me.trial1Init(c, true)) {
                me.trial1(c);
                me.stepTrial1Frame(c);
            }

            if (me.adjust1Init(true)) {
                me.adjust1();
                me.stepAdjust1Frame();
            }

            if (bRender) {
                if (me.renderInit(c, true)) {
                    me.render(c);
                    me.stepRenderFrame(c);
                }
            }
        }
    },
    //long SubBand :: //int i
    getFramesAtFront: function (i) {
        var me = this;
        var n = 65536;
        //#ifdef MULTITHREADED
        //    pthread_mutex_lock(&grainMutex[i]);
        //#endif
        if (me.grains[i]) {
            n = me.grains[i].nReadable() / me.nGrainsPerFrame;
        }
        //#ifdef MULTITHREADED
        //    pthread_mutex_unlock(&grainMutex[i]);
        //#endif
        if (me.sub) n = Math.min(n, me.sub.getFramesAtFront(i));
        return n;
    },
    //long SubBand :: 
    getInputFrameSize: function () {
        var me = this;
        return me.inputFrameSize;
    }

})