
/**
 * @class MEPH.audio.sbsms.GrainaAllocator
 **/
MEPH.define('MEPH.audio.sbsms.GrainaAllocator', {
    statics: {
    },
    properties: {
        //int N;
        N: 0,
        //int N2;
        N2: 0,
        //int type;
        type: 0,
        //float *w;
        w: null,
        //audio *W;
        W: null,
        //fftplan fftPlan;
        fftPlan: null,
        //fftplan ifftPlan;
        ifftPlan: null
    },
}).then(function () {
    window.windowType = {
        hann: 'hann',
        hannpoisson: 'hannpoisson'
    };
})