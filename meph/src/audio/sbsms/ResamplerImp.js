

/**
 * @class MEPH.audio.sbsms.ResamplerImp
 **/
MEPH.define('MEPH.audio.sbsms.ResamplerImp', {
    statics: {
    },
    requires:['MEPH.audio.sbsms.SlideType'],
    properties: {
        //SBSMSFrame frame;
        frame: null,
        //SampleCountType startAbs;
        startAbs: null,
        //SampleCountType midAbs;
        midAbs: null,
        //float midAbsf;
        midAbsf: null,
        //SampleCountType endAbs;
        endAbs: null,
        //SampleCountType writePosAbs;
        writePosAbs: null,
        //bool bInput;
        bInput: null,
        //SampleBuf *out;
        out: null,
        //SBSMSResampleCB cb;
        cb: null,
        //void *data;
        data: null,
        //long inOffset;
        inOffset: 0,
        //SlideType slideType;
        slideType: null,
        //Slide *slide;
        slide: null,
        //bool bWritingComplete;
        bWritingComplete: false
    },
    //SBSMSResampleCB cb, void *data, SlideType slideType
    initialize: function (cb, data, slideType) {
        this.init();
        this.cb = cb;
        this.data = data;
        this.bInput = true;
        this.slideType = slideType;
        this.frame.size = 0;
    },
    //void ResamplerImp :: 
    init: function () {
        this.inOffset = 0;
        this.startAbs = 0;
        this.midAbs = 0;
        this.endAbs = 0;
        this.writePosAbs = 0;
        this.midAbsf = 0.0;
        this.out = new SampleBuf(0);
        this.slide = null;
        this.bWritingComplete = false;
    },
    ///void ResamplerImp :: 
    reset: function () {
        if (this.slide) delete this.slide;
        delete this.out;
        this.init();
        this.frame.size = 0;
        this.bInput = true;
    },
    //Slide *slide, float *f, float *scale, int *maxDist, float *ratio
    updateSlide: function (slide, f, scale, maxDist, ratio) {
        // refactor :output parameters
        var stretch = slide.getStretch();
        slide.step();
        if (stretch <= 1.0) {
            f = resampleSincRes;
            scale = stretch;
            maxDist = lrintf(resampleSincSamples);
        } else {
            f = resampleSincRes / stretch;
            scale = 1.0;
            maxDist = lrintf(resampleSincSamples * stretch);
        }
        ratio = stretch;
    },
    //long ResamplerImp :: 
    read:function(audioOut, samples)
    {  
        var SL =MEPH.audio.sbsms.SlideType;
        var nRead = this.out.nReadable();
        while(nRead < samples && this.bInput) {
            if(this.bInput && this.inOffset == this.frame.size) {
                this.cb(this.data,this.frame);
                if(this.frame.size) {
                    if(this.slide) delete this.slide;
                    this.slide = new Slide(this.slideType,1.0 /this.frame.ratio0,1.0 /this.frame.ratio1,this.frame.size);
                } else {
                    this.bWritingComplete = true;
                }
                if(this.bWritingComplete) {
                    this.bInput = false;
                    var n = Math.floor(this.midAbs - this.writePosAbs);
                    this.out.grow(n);
                    this.out.writePos += n;
                }
                this.inOffset = 0;
            }
            if(this.frame.size) {
                if(this.slideType == SL.SlideIdentity) {
                    this. out.write(this.frame.buf,this.frame.size);
                    this.inOffset = this.frame.size;
                } else {
                    var bNoSinc = false;
                    if(Math.abs(this.frame.ratio0-1.00) < 1e-60&&  //fabs ?= Math.abs
                       Math.abs((frame.ratio1 - frame.ratio0)/this.frame.size) < 1e-9) {
                        bNoSinc = true;
                    }
                    var f;
                    var scale;
                    var maxDist;//int
                    var ratio;
                    this.updateSlide(slide,f,scale,maxDist,ratio);//refactor :output
                    var fi = lrintf(f);//int
                    var ff = f - fi;
                    if(ff<0.0) {
                        ff += 1.0;
                        fi--;
                    }
                    this.startAbs = Math.max(0,this.midAbs-maxDist);
                    var advance =Math.floor( Math.max(0,(this.startAbs - maxDist - this.writePosAbs));
                    this.writePosAbs += advance;
                    this.endAbs = this.midAbs + maxDist;
                    var start =Math.floor(this.startAbs - this.writePosAbs);
                    var mid = Math.floor(this.midAbs - this.writePosAbs);
                    var end = Math.floor(this.endAbs - this.writePosAbs);
                    this.out.writePos += advance;
                    if(bNoSinc) {
                        var nAhead = mid+this.frame.size;
                        this.out.N = nAhead;
                        this.out.grow(nAhead);
                        var nWrite = Math.min(Math.floor(resampleChunkSize),this.frame.size-this.inOffset);
                        for(var j=0;j<nWrite;j++) {
                            this.out.buf[this.out.writePos+mid+j][0] += this.frame.buf[j+this.inOffset][0];
                            this.out.buf[this.out.writePos+mid+j][1] += this.frame.buf[j+this.inOffset][1];
                        }
                        this.inOffset += nWrite;
                        this.midAbsf += nWrite;
                        var nWritten = lrintf(this.midAbsf);
                        this.midAbsf -= nWritten;
                        this.midAbs += nWritten;
                    } else {
                        var nWrite = Math.min(Math.floor(resampleChunkSize),this.frame.size-this.inOffset);
                        var i =  (this.frame.buf[inOffset]);//audio;
                        for(var j=0;j<nWrite;j++) {
                            var nAhead = end;
                            this.out.N = nAhead;
                            this.out.grow(nAhead);
                            var o =  (this.out.buf[this.out.writePos+start]);//audio
                            var d = (start-mid-this.midAbsf)*f;
                            var di = lrintf(d);
                            var df = d-di;
                            if(df<0.0) {
                                df += 1.0;
                                di--;
                            }
                            var i0 = (i)[0];
                            var i1 = (i)[1];
                            for(var k=start;k<end;k++) {
                                var k0 = (di<0)?-di:di; 
                                var k1 = (di<0)?k0-1:k0+1;
                                var sinc;
                                if(k1>=resampleSincSize) {
                                    if(k0>=resampleSincSize) {
                                        sinc = 0.0;
                                    } else {
                                        sinc = scale*sincTable[k0];
                                    }
                                } else if(k0>=resampleSincSize) {
                                    sinc = scale*sincTable[k1];
                                } else {
                                    sinc = scale*((1.0-df)*sincTable[k0] + df*sincTable[k1]);
                                }
                                (o)[0] += i0 * sinc;
                                (o)[1] += i1 * sinc;
                                di += fi;
                                df += ff;
                                if(!(df<1.0)) {
                                    df -= 1.0;
                                    di++;
                                }
                                o++;
                            }
                            i++;
                            me.updateSlide(slide,f,scale,maxDist,ratio);//refactor :output
                            fi = lrintf(f);
                            ff = f - fi;
                            if(ff<0.0) {
                                ff += 1.0;
                                fi--;
                            }
                            this.midAbsf += ratio;          
                            var nWritten = lrintf(this.midAbsf);
                            this.midAbsf -= nWritten;
                            this.midAbs += nWritten;
                            this.startAbs = Math.max(0,midAbs-maxDist);
                            this.endAbs = this.midAbs + maxDist;
                            start = Math.floor(this.startAbs - this.writePosAbs);
                            mid = Math.floor(this.midAbs - this.writePosAbs);
                            end = Math.floor(this.endAbs - this.writePosAbs);
                        }
                        this.inOffset += nWrite;
                    }
                }
                nRead = this.out.nReadable();
            }
        }
        this.out.read(audioOut,samples);
        return samples;
    },
    //long ResamplerImp :: 
    samplesInOutput:function()
    {
        var samplesFromBuffer = lrintf(0.5*(this.frame.ratio0+this.frame.ratio1)*(this.frame.size-this.inOffset));
        return Math.floor(this.out.writePos + (this.midAbs - this.writePosAbs) - this.out.readPos + samplesFromBuffer);
    },

    //void ResamplerImp ::     
    writingComplete:function()
    {
        this.   bWritingComplete = true;
    }
})