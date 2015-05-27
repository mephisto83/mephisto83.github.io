

/**
 * @class MEPH.audio.sbsms.SBSMSQuality
 **/
MEPH.define('MEPH.audio.sbsms.SBSMSQuality', {
    statics: {
    },
    properties: {
        params: null,
    },
    intialize: function (params) {
        this.params = params;
    },
    getFrameSize: function () {
        return (1 << (this.params.bands - 1)) * this.params.H;
    },

    //long SBSMSQuality ::
    getMaxPresamples: function () {
        var prepad = 0;
        for (var i = 0; i < this.params.bands; i++) {
            prepad = max(prepad, Math.floor((1 << i) * (this.params.N2[i] >> 1)));
        }
        prepad += ((1 << (this.params.bands - 1)) - 1) * (NDownSample >> 1);
        var framesize = Math.floor((1 << (params.bands - 1)) * params.H);
        var frames = Math.floor(prepad / framesize);
        if (prepad % framesize) frames++;
        frames++;
        prepad = frames * framesize;
        return prepad;
    }
}).then(function () {
    //const SBSMSQualityParams SBSMSQualityStandard = {
    window.SBSMSQualityStandard = [8, 3,
       [512, 512, 384, 384, 384, 384, 384, 384, 0, 0],
         [168, 144, 128, 96, 64, 36, 24, 14, 0, 0],
         [384, 288, 256, 168, 128, 84, 52, 28, 0, 0],
         [512, 448, 360, 288, 192, 128, 84, 44, 0, 0],
         [1, 1, 2, 1, 1, 2, 1, 1, 0, 0]
    ];
});