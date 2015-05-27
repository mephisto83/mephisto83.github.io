/**
 * @class MEPH.audio.sbsms.Util
 **/
MEPH.define('MEPH.audio.sbsms.TrackPoint', {
    requires: ['MEPH.audio.sbsms.Util'],
    statics: {
        TrackPointNoCont: 65535
    },
    properties: {
        //      TrackPoint *pp;
        pp: null,
        //TrackPoint *pn;
        pn: null,
        //TrackPoint *dupcont;
        dupcont: null,
        //TrackPoint *dupStereo;
        dupStereo: null,
        //TrackPoint *cont;
        cont: null,
        //TrackPoint *dup[3];
        dup: null,
        //Track *owner;
        owner: null,
        //Slice *slice;
        slice: null,
        //float *peak;
        peak: 0,
        //float x01;
        x01: 0,
        //float y01;
        y01: 0,
        //float phSynth;
        phSynth: 0,
        //union {
        // float fSynth0;
        fSynth0: 0,
        //  float xtp2;
        xtp2: 0,
        //};
        //union {
        //  float fSynth1;
        fSynth1: 0,
        //float xtn2;
        xtn2: 0,
        //};
        //int refCount;
        refCount: 0,
        //float f;
        f: 0,
        //float x;
        x: 0,
        //float y;
        y: 0,
        //float ph;
        ph: 0,
        //float contF;
        contF: 0,
        //float m;
        m: 0,
        //float m2;
        m2: 0,//
        //bool bJump;
        bJump: false,
        //bool bSyncStereo;
        bSyncStereo: false,
        //bool bConnected;
        bConnected: false,
        //bool bConnect;
        bConnect: false,
        //bool bDelete;
        bDelete: false,
        //bool bOwned;
        bOwned: false,
        //bool bMarked;
        bMarked: false,
        //bool bSplit;
        bSplit: false,
        //bool bMerge;
        bMerge: false

    },
    //Slice *slice, float *peak, audio *gx, float *mag, float *mag2, int k, int N, int band
    initialize: function (slice, peak, gx, mag, mag2, k, N, band) {
        var me = this;
        var U = MEPH.audio.sbsms.Util;
        me.refCount = 0;
        me.dup = [];
        for (var d = 0; d < 3; d++) {
            me.dup[d] = null;
        }
        me.dupStereo = null;
        me.bJump = false;
        me.y01 = 0.0;
        me.pp = null;
        me.pn = null;
        me.bSyncStereo = false;
        me.bConnect = false;
        me.bConnected = false;
        me.bDelete = false;
        me.bOwned = false;
        me.bMarked = false;
        me.bSplit = false;
        me.bMerge = false;
        me.owner = null;
        me.slice = slice;
        me.peak = peak;
        var y0 = mag[k - 1];
        var y1 = mag[k];
        var y2 = mag[k + 1];
        var d = (y0 + y2 - y1 - y1);
        me.x = (d == 0.0 ? k : k + 0.5 * (y0 - y2) / d);
        var ki = me.x;//lrintf(x);
        var ki1;
        var kf;
        if (ki < me.x) {
            ki1 = ki + 1;
            kf = me.x - ki;
        } else {
            ki1 = ki - 1;
            kf = ki - me.x;
        }
        y = ((1.0 - kf) * mag2[ki] + kf * mag2[ki1]);
        f = U.TWOPI * me.x / (N * (1 << band));
        var norm0 = U.square(gx[ki][0]) + U.square(gx[ki][1]);
        var ph0;
        if (norm0 > 0.0) {
            ph0 = Math.atan2(gx[ki][1], gx[ki][0]);
        } else {
            ph0 = 0.0;
        }
        var ph1;
        var norm1 = U.square(gx[ki1][0]) + U.square(gx[ki1][1]);
        if (norm1 > 0.0) {
            ph1 = Math.atan2(gx[ki1][1], gx[ki1][0]);
        } else {
            ph1 = 0.0;
        }
        ph0 += (ki & 1) * U.PI;
        ph1 += (ki1 & 1) * U.PI;
        if (kf < 0.5) {
            ph1 = ph0 + U.canonPI(ph1 - ph0);
        } else {
            ph0 = ph1 + U.canonPI(ph0 - ph1);
        }
        ph = U.canon2PI((1.0 - kf) * ph0 + kf * ph1);
        phSynth = ph;
    },
    absorb: function () {
        var me = this;
        if (me.pp && me.pn) {
            if (me.pp.y * me.peak[(me.pp.x - me.x)] > me.pn.y * me.peak[lrintf(me.pn.x - me.x)]) {
                me.pp.m2 += me.m2;
            } else {
                me.pn.m2 += me.m2;
            }
        } else if (me.pp) {
            if (me.y01 == 0.0 || y01 * me.peak[lrintf(me.x01 - me.x)] < me.pp.y * me.peak[lrintf(me.pp.x - me.x)]) {
                me.pp.m2 += me.m2;
            }
        } else if (me.pn) {
            if (me.y01 == 0.0 || me.y01 * me.peak[lrintf(me.x01 - me.x)] < me.pn.y * me.peak[lrintf(me.pn.x - me.x)]) {
                me.pn.m2 += me.m2;
            }
        }
    },

    destroy:function(){
    },
    //float TrackPoint :: 
    getF: function () {
        var me = this;
        return me.f;
    },
    //float TrackPoint :: 
    getM: function () {
        var me = this;
        return me.y;
    },
    //float TrackPoint :: 
    getPhase: function () {
        var me = this;
        return ph;
    }
})