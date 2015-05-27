

/**
 * @class MEPH.audio.sbsms.Slide
 **/
MEPH.define('MEPH.audio.sbsms.Slide', {
    requrires: ['MEPH.audio.sbsms.SlideImp',
                'MEPH.audio.sbsms.SlideType'],
    statics: {
    },
    properties: {
        imp: null
    },
    //SlideType slideType, float rate0, float rate1, const SampleCountType &n
    intialize: function (slideType, rate0, rate1, n) {
        var SlideType = MEPH.audio.sbsms.SlideType;
        var imp;
        if (slideType == SlideType.SlideIdentity) {
            imp = new IdentitySlide();
        } else if (slideType == SlideType.SlideConstant || rate0 == rate1) {
            imp = new MEPH.audio.sbsms.ConstantSlide(rate0);
        } else if (slideType == SlideType.SlideLinearInputRate) {
            imp = new MEPH.audio.sbsms.LinearInputRateSlide(rate0, rate1, n);
        } else if (slideType == SlideType.SlideLinearOutputRate) {
            imp = new MEPH.audio.sbsms.LinearOutputRateSlide(rate0, rate1, n);
        } else if (slideType == SlideType.SlideLinearInputStretch) {
            imp = new MEPH.audio.sbsms.LinearInputStretchSlide(rate0, rate1, n);
        } else if (slideType == SlideType.SlideLinearOutputStretch) {
            imp = new MEPH.audio.sbsms.LinearOutputStretchSlide(rate0, rate1, n);
        } else if (slideType == SlideType.SlideGeometricInput) {
            imp = new MEPH.audio.sbsms.GeometricInputSlide(rate0, rate1, n);
        } else if (slideType == SlideType.SlideGeometricOutput) {
            imp = new MEPH.audio.sbsms.GeometricOutputSlide(rate0, rate1, n);
        }
        this.imp = imp;
    },
    destroy: function () {
        this.imp = null;
    },
    getTotalStretch: function () {
        return this.imp.getTotalStretch();
    },
    getStretchedTime: function (t) {
        if (t > 1.0) t = 1.0;
        return this.imp.getStretchedTime(t);
    },
    getRate: function (t) {

        if (t > 1.0) t = 1.0;
        return this.imp.getRate(t);
    },
    getStretch: function (t) {

        if (t > 1) t = 1.0;
        return this.imp.getStretch(t);
    },
    step: function () {
        this.imp.step();
    }
});

