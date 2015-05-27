

/**
 * @class MEPH.audio.sbsms.Resampler
 **/
MEPH.define('MEPH.audio.sbsms.Resampler', {
    statics: {
    },
    requires: ['MEPH.audio.sbsms.ResamplerImp'],
    properties: {
        imp: null
    },
    //SBSMSResampleCB cb, void *data, SlideType slideType
    initialize: function (cb, data, slideType) {

        this.imp = new MEPH.audio.sbsms.ResamplerImp(cb, data, slideType);
    },
    //void Resampler :: 
    reset: function () { this.imp.reset(); },
    //long Resampler :: //audio *audioOut, long samples
    read: function (audioOut, samples) {
        return this.imp.read(audioOut, samples);
    },
    //long Resampler :: 
    samplesInOutput: function () {
        return this.imp.samplesInOutput();
    }

});