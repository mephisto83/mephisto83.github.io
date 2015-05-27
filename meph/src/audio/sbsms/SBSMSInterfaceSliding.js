

/**
 * @class MEPH.audio.sbsms.Slide
 **/
MEPH.define('MEPH.audio.sbsms.SBSMSInterfaceSliding', {
    requrires: ['MEPH.audio.sbsms.SBSMSInterfaceSlidingImp'],
    statics: {
    },
    properties: {
        imp: null
    },
    //Slide *stretchSlide,    Slide *pitchSlide,     bool bPitchReferenceInput,    const SampleCountType &samplesToInput,    long preSamples,    SBSMSQuality *quality
    initialize: function (stretchSlide, pitchSlide, bPitchReferenceInput, samplesToInput, preSamples, quality) {
        this.imp = new MEPH.audio.sbsms.SBSMSInterfaceSlidingImp(stretchSlide, pitchSlide, bPitchReferenceInput,
                                        samplesToInput, preSamples, quality);
    },
    //float SBSMSInterfaceSliding :: //float 
    getStretch: function (t) {
        return this.imp.getStretch(t);
    },
    //float SBSMSInterfaceSliding :: 
    getPitch: function (t) {
        return this.imp.getPitch(t);
    },
    //long SBSMSInterfaceSliding :: 
    getPresamples: function () {
        return this.imp.getPresamples();
    },
    //SampleCountType SBSMSInterfaceSliding :: 
    getSamplesToInput: function () {
        return this.imp.getSamplesToInput();
    },
    //SampleCountType SBSMSInterfaceSliding :: 
    getSamplesToOutput: function () {
        return this.imp.getSamplesToOutput();
    }
});