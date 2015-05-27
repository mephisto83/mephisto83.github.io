

/**
 * @class MEPH.audio.sbsms.SBSMSInterfaceSlidingImp
 **/
MEPH.define('MEPH.audio.sbsms.SBSMSInterfaceSlidingImp', {
    requrires: ['MEPH.audio.sbsms.SlideImp',
                'MEPH.audio.sbsms.SlideType'],
    statics: {
    },
    properties: {
        //Slide *stretchSlide;
        stretchSlide: null,
        //Slide *pitchSlide;
        pitchSlide: null,
        //bool bPitchReferenceInput;
        bPitchReferenceInput: null,
        //float totalStretch;
        totalStretch: null,
        //float stretchScale;
        stretchScale: null,
        //long preSamples;
        preSamples: null,
        //SampleCountType samplesToInput;
        samplesToInput: null,
        //SampleCountType samplesToOutput;
        samplesToOutput: null
    },
    ///Slide *stretchSlide,    Slide *pitchSlide,     bool bPitchReferenceInput,    const SampleCountType &samplesToInput,    long preSamples,    SBSMSQuality *quality
    initialize: function (stretchSlide, pitchSlide, bPitchReferenceInput, samplesToInput, preSamples, quality) {
        var me = this;
        this.stretchSlide = stretchSlide;
        this.pitchSlide = pitchSlide;
        this.bPitchReferenceInput = bPitchReferenceInput;
        this.samplesToInput = samplesToInput;
        this.preSamples = preSamples;
        this.totalStretch = stretchSlide.getTotalStretch();
        this.samplesToOutput = (samplesToInput * totalStretch);//(SampleCountType)
        this.stretchScale = 1.0;

        if (quality) {
            var samplesIn = 0;//SampleCountType 
            var samplesOut = 0;//SampleCountType 
            var outFrameSizefloat = 0.0;//float 
            var stretch = 1.0;//float 
            var inFrameSize = Math.floor(quality.getFrameSize())//int 
            while (samplesIn < samplesToInput) {
                var t = samplesIn / samplesToInput;
                stretch = stretchSlide.getStretch(t);
                outFrameSizefloat += stretch * inFrameSize;
                var outFrameSize = Math.floor(outFrameSizefloat);
                outFrameSizefloat -= outFrameSize;
                samplesIn += inFrameSize;
                samplesOut += outFrameSize;
            }
            var samplesOutputed = samplesOut - lrintf(stretch * (samplesIn - samplesToInput));//SampleCountType 
            this.stretchScale = samplesToOutput / samplesOutputed;
        }
    },
    //SampleCountType SBSMSInterfaceSlidingImp :: 
    getSamplesToOutput: function () {
        return this.samplesToOutput;
    },
    //float SBSMSInterfaceSlidingImp :: 
    getStretch: function (t) {
        return this.stretchScale * this.stretchSlide.getStretch(t);
    },
    //SampleCountType SBSMSInterfaceSlidingImp :: 
    getSamplesToInput: function () {
        return this.samplesToInput;
    },
    //long SBSMSInterfaceSlidingImp :: 
    getPresamples: function () {
        return this.preSamples;
    },
    ////float SBSMSInterfaceSlidingImp :: 
    getPitch: function (t) {
        if (this.bPitchReferenceInput) return this.pitchSlide.getRate(t);
        else
            return this.pitchSlide.getRate(Math.min(1.0, this.stretchSlide.getStretchedTime(t) / this.totalStretch));
    },
});