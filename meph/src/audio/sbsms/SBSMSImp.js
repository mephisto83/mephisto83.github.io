

/**
 * @class MEPH.audio.sbsms.SBSMSImp
 **/
MEPH.define('MEPH.audio.sbsms.SBSMSImp', {
    statics: {
    },
    requires: ['MEPH.audio.sbsms.Subband',
                'MEPH.audio.sbsms.SBSMSQuality'],
    properties: {
        //FILE *fpIn;  
        fpIn: null,
        //FILE *fpOut;
        fpOut: null,
        //SBSMSError error;
        error: null,
        //long nPrepad;
        nPrepad: 0,
        //long nPrepadDone;
        nPrepadDone: 0,
        //long nPresamplesDone;
        nPresamplesDone: 0,
        //SampleCountType nSamplesInputed;
        nSamplesInputed: null,
        //SampleCountType nSamplesOutputed;
        nSamplesOutputed: null,
        //int channels;
        channels: 0,
        //SBSMSQuality *quality;
        quality: null,
        //audio *ina;
        ina: null
    },
    //int channels, SBSMSQuality *quality, bool bSynthesize
    initialize: function (channels, quality, bSynthesize) {
        this.channels = channels;
        this.quality = new MEPH.audio.sbsms.SBSMSQuality(quality.params);
        this.error = SBSMSErrorNone;
        this.top = new MEPH.audio.sbsms.Subband(null, 0, channels, quality, bSynthesize);
        this.ina = [].zeros(quality.getFrameSize());//(audio*)malloc(quality.getFrameSize()*sizeof(audio));
        this.nPrepad = quality.getMaxPresamples();
        this.reset();
    },
    ///SBSMSRenderer *renderer
    addRenderer: function (renderer) {
        this.top.addRenderer(renderer);
    },
    //void SBSMSImp :: SBSMSRenderer *renderer
    removeRenderer: function (renderer) {
        this.top.removeRenderer(renderer);
    },
    reset: function () {
        this.nSamplesInputed = 0;
        this.nSamplesOutputed = 0;
        this.nPrepadDone = 0;
        this.nPresamplesDone = 0;
    },
    //SBSMSInterface *iface
    getInputTime: function (iface) {
        return this.nSamplesInputed / this.iface.getSamplesToInput();
    },
    //long SBSMSImp :: SBSMSInterface *iface
    write: function (iface) {
        var nWrite = 0;

        var t = this.getInputTime(iface);
        var stretch = iface.getStretch(t);
        var pitch = iface.getPitch(t);

        var nPresamples = iface.getPresamples();
        if (this.nPrepadDone < this.nPrepad - nPresamples) {
            stretch = 1.0;
            nWrite = Math.min(this.quality.getFrameSize(), this.nPrepad - nPresamples - this.nPrepadDone);
            [].interpolate(0, nWrite, function (t) {
                this.ina[t] = 0;
            })
            //memset(ina,0,nWrite*sizeof(audio));
            this.nPrepadDone += nWrite;
        } else if (this.nPresamplesDone < nPresamples) {
            stretch = 1.0;
            nWrite = Math.min(this.quality.getFrameSize(), nPresamples - this.nPresamplesDone);
            nWrite = iface.samples(this.ina, nWrite);
            if (nWrite == 0) {
                nWrite = this.quality.getFrameSize();

                [].interpolate(0, nWrite, function (t) {
                    this.ina[t] = 0;
                })
                ///memset(ina, 0, nWrite * sizeof(audio));
            } else {
                this.nPresamplesDone += nWrite;
            }
        } else {
            nWrite = iface.samples(this.ina, this.quality.getFrameSize());
            nSamplesInputed += nWrite;
            if (nWrite == 0) {
                nWrite = this.quality.getFrameSize();
                //memset(this.ina, 0, nWrite * sizeof(audio));

                [].interpolate(0, nWrite, function (t) {
                    this.ina[t] = 0;
                })
            }
        }
        nWrite = this.top.write(this.ina, nWrite, stretch, pitch);
        return nWrite;
    },
    //long SBSMSImp ::SBSMSInterface *iface, audio *buf, long n
    read: function (iface, buf, n) {
        var nReadTotal = 0;
        while (nReadTotal < n) {
            var nRead;
            nRead = n - nReadTotal;
            nRead = this.top.read(buf + nReadTotal, nRead);
            nReadTotal += nRead;
            if (nRead) {
                //#ifdef MULTITHREADED
                //        if(threadInterface.bRenderThread) {
                //            for(int c=0; c<channels; c++) {
                //                threadInterface.signalRender(c);
                //            }
                //        }
                //#endif
            } else {
                //#ifdef MULTITHREADED
                //        threadInterface.waitReadWrite();
                //#endif
                if (this.top.writeInit()) {
                    this.write(iface);
                    //#ifdef MULTITHREADED
                    //    threadInterface.signalAnalyze();
                    //#endif
                }
            }
            //#ifdef MULTITHREADED
            //    if(!threadInterface.bRenderThread) {
            //        for(int c=0; c<channels; c++) {     
            //            threadInterface.signalRender(c);
            //        }
            //    }
            //    #else
            //        top.process(true);
            //#endif
            this.nSamplesOutputed += nRead;
        }
        return nReadTotal;
    },
    //SBSMSInterface *iface
    renderFrame: function (iface) {
        var nRendered = 0;
        while (!nRendered) {
            var bReady = true;
            for (var c = 0; c < this.channels; c++) {
                if (!this.top.renderInit(c, false)) {
                    bReady = false;
                    break;
                }
            }
            if (bReady) {
                nRendered = this.top.renderSynchronous();
            }
            if (nRendered) {
                //#ifdef MULTITHREADED
                //    threadInterface.signalAdjust1();
                //#endif
            } else {
                //#ifdef MULTITHREADED
                //    threadInterface.waitReadWrite();  
                //#endif      
                if (top.writeInit()) {
                    write(iface);
                }

                //#ifdef MULTITHREADED
                //    threadInterface.signalAnalyze();
                //#endif
            }
            //#ifdef MULTITHREADED
            //#else
            top.process(false);
            //#endif
            if (this.nSamplesOutputed >= iface.getSamplesToOutput()) {
                this.top.renderComplete(iface.getSamplesToOutput());
            }
            this.nSamplesOutputed += nRendered;
        }
        return nRendered;
    }
});