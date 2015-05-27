/**
 * @class MEPH.audio.sbsms.SlideImp
 **/
MEPH.define('MEPH.audio.sbsms.SlideImp', {
    statics: {
    },
    properties: {
    }
});

/**
 * @class MEPH.audio.sbsms.IdentitySlide
 * @extend MEPH.audio.sbsms.SlideImp
 **/
MEPH.define('MEPH.audio.sbsms.IdentitySlide', {
    extend: 'MEPH.audio.sbsms.SlideImp',
    statics: {
    },
    properties: {
    },
    getTotalStretch: function () {
        return 1;
    },
    getStretchedTime: function (t) {
        return t;
    },
    getRate: function (t) {
        return 1;
    },
    getStretch: function (t) {
        return 1.0;
    }, 
    step: function () {
    }
});

/**
 * @class MEPH.audio.sbsms.ConstantSlide 
 * @extend MEPH.audio.sbsms.SlideImp
 **/
MEPH.define('MEPH.audio.sbsms.ConstantSlide', {
    extend: 'MEPH.audio.sbsms.SlideImp',
    statics: {
    },
    properties: {
    },
    intialize: function (rate) {
        this.rate = rate;
    },
    getTotalStretch: function () {
        return 1 / this.rate;
    },
    getStretchedTime: function (t) {
        return t / this.rate;
    },
    getRate: function (t) {
        return this.rate;
    },
    getStretch: function (t) {
        return 1.0 / this.rate;
    },
    step: function () {
    }
});

/**
 * @class MEPH.audio.sbsms.LinearInputRateSlide 
 * @extend MEPH.audio.sbsms.SlideImp
 **/
MEPH.define('MEPH.audio.sbsms.LinearInputRateSlide', {
    extend: 'MEPH.audio.sbsms.SlideImp',
    statics: {
    },
    properties: {
        rate0: 0,
        rate1: 0,
        val: 0,
        inc: 0
    },
    //float rate0, float rate1, const SampleCountType &n
    intialize: function (rate0, rate1, n) {
        var me = this;
        me.rate0 = rate0;
        me.rate1 = rate1;
        if (n) {
            me.val = rate0;
            me.inc = (rate1 - rate0) / n;
        }
    },
    getTotalStretch: function () {
        var me = this;
        return Math.log(this.rate1 / this.rate0) / (this.rate1 - this.rate0);
    },
    getStretchedTime: function (t) {
        var me = this;
        var ratet = this.getRate(t);
        return Math.log(ratet / this.rate0) / (this.rate1 - this.rate0);
    },
    getRate: function (t) {
        if (t === undefined)
            return this.val;
        return this.rate0 + (this.rate1 - this.rate0) * t;
    },
    getStretch: function (t) {
        if (t === undefined) {
            return (1.0 / this.val);
        }
        return 1.0 / this.getRate(t);
    },
    step: function () {
        this.val += this.inc;
    }
});



/**
 * @class MEPH.audio.sbsms.LinearOutputRateSlide  
 * @extend MEPH.audio.sbsms.SlideImp
 **/
MEPH.define('MEPH.audio.sbsms.LinearOutputRateSlide', {
    extend: 'MEPH.audio.sbsms.SlideImp',
    statics: {
    },
    properties: {
        rate0: 0,
        rate1: 0,
        val: 0,
        inc: 0
    },
    //float rate0, float rate1, const SampleCountType &n
    intialize: function (rate0, rate1, n) {
        var me = this;
        me.rate0 = rate0;
        me.rate1 = rate1;
        if (n) {
            me.val = rate0;
            me.inc = (rate1 - rate0) / n;
        }
    },
    getTotalStretch: function () {
        var me = this;
        return 2 / (this.rate1 + this.rate0);
    },
    getStretchedTime: function (t) {
        var me = this;
        var ratet = this.getRate(t);
        var rate0 = this.rate0;
        var rate1 = this.rate1;
        return (Math.sqrt(rate0 * rate0 + (rate1 * rate1 - rate0 * rate0) * t) - rate0) * 2.0 / (rate1 * rate1 - rate0 * rate0);

    },
    getRate: function (t) {
        if (t === undefined)
            t = this.val;
        var rate0 = this.rate0;
        var rate1 = this.rate1;
        return rate0 + (Math.sqrt(rate0 * rate0 + (rate1 * rate1 - rate0 * rate0) * t) - rate0);
    },
    getStretch: function (t) {
        if (t === undefined) {
            t = this.val;
        }
        return this.getRate(t);
    },
    step: function () {
        this.val += this.inc;
    }
});





/**
 * @class MEPH.audio.sbsms.LinearOutputRateSlide  
 * @extend MEPH.audio.sbsms.SlideImp
 **/
MEPH.define('MEPH.audio.sbsms.LinearInputStretchSlide', {
    extend: 'MEPH.audio.sbsms.SlideImp',
    statics: {
    },
    properties: {
        rate0: 0,
        rate1: 0,
        val: 0,
        inc: 0
    },
    //float rate0, float rate1, const SampleCountType &n
    intialize: function (rate0, rate1, n) {
        var me = this;
        me.rate0 = rate0;
        me.rate1 = rate1;
        if (n) {
            me.val = 1.0 / me.rate0;
            me.inc = (1.0 / me.rate1 - 1.0 / me.rate0) / n;
        }
    },
    getTotalStretch: function () {
        var me = this;
        var rate0 = this.rate0;
        var rate1 = this.rate1;
        return 0.5 / rate0 + 0.5 / rate1;
    },
    getStretchedTime: function (t) {
        var me = this;
        var ratet = this.getRate(t);
        var rate0 = this.rate0;
        var rate1 = this.rate1;

        return t / rate0 * (1.0 + 0.5 * t * (rate0 / rate1 - 1.0));
    },
    getRate: function (t) {
        if (t === undefined)
            return (1.0 / this.val);
        var rate0 = this.rate0;
        var rate1 = this.rate1;

        return 1.0 / this.getStretch(t);
    },
    getStretch: function (t) {
        if (t === undefined) {
            return this.val;
        }
        var rate0 = this.rate0;
        var rate1 = this.rate1;
        return (1.0 / rate0 + (1.0 / rate1 - 1.0 / rate0) * t);
    },
    step: function () {
        this.val += this.inc;
    }
});


/**
 * @class MEPH.audio.sbsms.LinearOutputRateSlide  
 * @extend MEPH.audio.sbsms.SlideImp
 **/
MEPH.define('MEPH.audio.sbsms.LinearOutputStretchSlide', {
    extend: 'MEPH.audio.sbsms.SlideImp',
    statics: {
    },
    properties: {
        rate0: 0,
        rate1: 0,
        val: 0,
        c0: 0,
        c1: 0,
        inc: 0
    },
    //float rate0, float rate1, const SampleCountType &n
    intialize: function (rate0, rate1, n) {
        var me = this;
        me.rate0 = rate0;
        me.rate1 = rate1;
        this.c0 = rate0 / rate1;
        this.c1 = 1.0 / (rate0 * Math.log(c0));
        if (n) {
            me.val = 0;
            me.inc = 1 / n;
        }
    },
    getTotalStretch: function () {
        var me = this;
        var c0 = this.c0;
        var c1 = this.c1;
        return c1 * (c0 - 1.0);
    },
    getStretchedTime: function (t) {
        var me = this;
        var ratet = this.getRate(t);
        var c1 = this.c1;
        var c0 = this.c0;

        return c1 * (Math.pow(c0, t) - 1.0);
    },
    getRate: function (t) {
        if (t === undefined)
            t = (this.val);
        var rate0 = this.rate0;
        var rate1 = this.rate1;
        var c0 = this.c0;

        return rate0 * Math.pow(c0, -t);
    },
    getStretch: function (t) {
        if (t === undefined)
            t = val;
        var rate0 = this.rate0;
        var rate1 = this.rate1;
        var c0 = this.c0;

        return Math.pow(c0, t) / rate0;
    },
    step: function () {
        this.val += this.inc;
    }
});



/**
 * @class MEPH.audio.sbsms.GeometricInputSlide   
 * @extend MEPH.audio.sbsms.SlideImp
 **/
MEPH.define('MEPH.audio.sbsms.GeometricInputSlide', {
    extend: 'MEPH.audio.sbsms.SlideImp',
    statics: {
    },
    properties: {
        rate0: 0,
        rate1: 0,
        val: 0,
        inc: 0
    },
    //float rate0, float rate1, const SampleCountType &n
    intialize: function (rate0, rate1, n) {
        var me = this;
        me.rate0 = rate0;
        me.rate1 = rate1;
        if (n) {
            this.val = rate0;
            this.inc = Math.pow(rate1 / rate0, 1.0 / n);
        }
    },
    getTotalStretch: function () {
        var me = this;
        var rate1 = this.rate1;
        var rate0 = this.rate0;
        return (rate1 - rate0) / (Math.log(rate1 / rate0) * (rate0 * rate1));
    },
    getStretchedTime: function (t) {
        var me = this;
        var rate0 = this.rate0;
        var rate1 = this.rate1;

        return (Math.pow(rate0 / rate1, t) - 1.0) / (rate0 * Math.log(rate0 / rate1));
    },
    getRate: function (t) {
        if (t === undefined)
            t = (this.val);
        var rate0 = this.rate0;
        var rate1 = this.rate1;
        var c0 = this.c0;

        return rate0 * Math.pow(rate1 / rate0, t);
    },
    getStretch: function (t) {
        if (t === undefined)
            return 1.0 / this.val
        var rate0 = this.rate0;
        var rate1 = this.rate1;
        var c0 = this.c0;

        return 1.0 / this.getRate(t);
    },
    step: function () {
        this.val *= this.inc;
    }
});


/**
 * @class MEPH.audio.sbsms.GeometricInputSlide   
 * @extend MEPH.audio.sbsms.SlideImp
 **/
MEPH.define('MEPH.audio.sbsms.GeometricOutputSlide', {
    extend: 'MEPH.audio.sbsms.SlideImp',
    statics: {
    },
    properties: {
        rate0: 0,
        rate1: 0,
        val: 0,
        inc: 0,
        log10: 0,
        r10: 0,
        totalStretch: 0
    },
    //float rate0, float rate1, const SampleCountType &n
    intialize: function (rate0, rate1, n) {
        var me = this;
        me.rate0 = rate0;
        me.rate1 = rate1;
        me.log10 = Math.log(rate1, rate0);
        me.r10 = rate1 - rate0;
        me.totalStretch = me.getTotalStretch();

        if (n) {
            this.val = 0;
            this.inc = 1.0 / n;
        }
    },
    getTotalStretch: function () {
        var me = this;
        var rate1 = this.rate1;
        var rate0 = this.rate0;
        return Math.log(rate1 / rate0) / (rate1 - rate0);
    },
    getStretchedTime: function (t) {
        var me = this;
        var rate0 = this.rate0;
        var rate1 = this.rate1;
        var r10 = me.r10;
        return Math.log(r10 / rate0 * t + 1.0) / r10;
    },
    getRate: function (t) {
        if (t === undefined)
            t = (this.val);
        var rate0 = this.rate0;
        var rate1 = this.rate1;

        var t1 = this.getStretchedTime(t) / this.totalStretch;
        return rate0 * pow(rate1 / rate0, t1);
    },
    getStretch: function (t) {
        if (t === undefined)
            t = this.val;
        var rate0 = this.rate0;
        var rate1 = this.rate1;
        var c0 = this.c0;

        return 1.0 / this.getRate(t);
    },
    step: function () {
        this.val += this.inc;
    }
});

