/**
 * @class MEPH.audio.sbsms.Track
 **/
var PhShift = 5;
var WShift = 21;
var Ph1 = 65535;
var WPI = 536870912;
var W2PI = 1073741824;
var W2PIMask = 1073741823;
var WScale = 1.708913188941079e8;
var MScale = 4.656683928435187e-10;
window.SynthMode = {
    synthModeOutput: 0,
    synthModeTrial2: 1,
    synthModeTrial1: 2
};
MEPH.define('MEPH.audio.sbsms.Track', {
    statics: {
    },
    properties: {
        //vector<TrackPoint*> point;
        point: null,
        //float h;
        h: 0,
        //float jumpThresh;
        jumpThresh: 0,
        //TrackIndexType index;
        index: null,
        //TimeType start;
        start: null,
        //TimeType first;
        first: null,
        //TimeType end;
        end: null,
        //TimeType last;
        last: null,
        //bool bEnd;
        bEnd: null,
        ///bool bEnded;
        bEnded: null,
        //bool bRender;
        bRender: null,
        //bool bStitch;
        bStitch: null,
        //bool bSplit;
        bSplit: null,
        //bool bMerge;
        bMerge: null
    },
    //float h, TrackIndexType index, TrackPoint *p, const TimeType &time, bool bStitch
    initialize: function (h, index, p, time, bStitch) {
        var me = this;
        me.h = h;
        me.jumpThresh = 1.0e-5 * h;
        me.index = index;
        me.bEnd = false;
        me.bEnded = false;
        me.bRender = false;
        me.bSplit = false;
        me.bMerge = false;
        me.first = time;
        me.start = time;
        if (me.bStitch) {
            me.bStitch = true;
        } else {
            me.bStitch = false;
            if (me.start > 0) {
                me.start--;
            }
        }
        me.point = me.point || [];
        if (p)//this is added
            me.point.push(p);
        p.owner = this;
        p.refCount++;
        me.end = time;
        me.last = time;
    },
    //TrackIndexType Track :: 
    getIndex: function () {
        var me = this;
        return me.index;
    },
    //bool Track :: //const TimeType &time
    isFirst: function (time) {
        var me = this;
        return (time == me.first);
    },
    //bool Track :: //const TimeType &
    isLast: function (time) {
        var me = this;
        return (time == me.last);
    },
    ///TimeType Track :: 
    size: function () {
        var me = this;
        return me.point.length;
    },
    //TrackPoint *Track :: 
    back: function () {
        var me = this;
        return me.point.last();
    },
    //TrackPoint *Track :: //const TimeType &
    getTrackPoint: function (time) {
        var me = this;
        return me.point[time - me.first];
    },
    //SBSMSTrackPoint *Track :: //const TimeType &time
    getSBSMSTrackPoint: function (time) {
        var me = this;

        return me.getTrackPoint(time);
    },
    //bool Track :: //TrackPoint *tp0, TrackPoint *tp1
    jump: function (tp0, tp1) {
        var me = this;
        if (me.tp1.m > me.tp0.m) {
            var cost = 1.0e-4 * dBApprox(tp0.m, tp1.m);
            return (cost > me.jumpThresh);
        } else {
            return false;
        }
    },
    //TrackPoint *Track ::            
    //const TimeType &time, int mode, int n, float f0, float f1
    updateFPH: function (time, mode, n, f0, f1) {
        var U = MEPH.audio.sbsms.Util;
        var me = this;
        if (time === me.start && time < me.first) {
            var tp1 = me.getTrackPoint(time + 1);
            tp1.fSynth1 = Math.max(0.0, Math.min(6.0, f1 * tp1.f));
            tp1.fSynth0 = tp1.fSynth1;
            tp1.phSynth = tp1.ph;
            if (mode == SynthMode.synthModeOutput && me.tp1.dupStereo) {
                return tp1;
            }
        } else if (time == me.last) {
            if (me.last < me.end) {
                var tp0 = me.getTrackPoint(time);
                tp0.fSynth0 = tp0.fSynth1;
            }
        } else {
            var tp0 = me.getTrackPoint(time);
            var tp1 = me.getTrackPoint(time + 1);

            if (mode == SynthMode.synthModeOutput) {
                if (tp0.dupStereo && tp1.dupStereo && tp0.dupStereo.owner == tp1.dupStereo.owner) {
                    var dp = tp1.ph - tp0.ph;
                    var dp0 = 0.5 * h * (tp0.f + tp1.f);
                    var dw = U.canonPI(dp - dp0) / h;
                    var dpStereo = tp1.dupStereo.ph - tp0.dupStereo.ph;
                    var dp0Stereo = 0.5 * h * (tp0.dupStereo.f + tp1.dupStereo.f);
                    var dwStereo = U.canonPI(dpStereo - dp0Stereo) / h;
                    if (dw > .0013 * (tp0.f + tp1.f)) {
                        dw = 0;
                        dwStereo = 0;
                    } else if (dwStereo > .0013 * (tp0.dupStereo.f + tp1.dupStereo.f)) {
                        dwStereo = 0;
                    }
                    var w0 = 0.5 * (tp0.f + tp0.dupStereo.f + dw + dwStereo);
                    var w1 = 0.5 * (tp1.f + tp1.dupStereo.f + dw + dwStereo);
                    var dwSynth = 0.5 * U.canonPI(dp - dpStereo) / n;
                    if (!(bSplit && time == first)) {
                        tp0.fSynth0 = Math.max(0.0, Math.min(6.0, f0 * (w0 + dwSynth)));
                    }
                    if (!(bMerge && time + 1 == last)) {
                        tp1.fSynth1 = Math.max(0.0, Math.min(6.0, f1 * (w1 + dwSynth)));
                    }
                } else {
                    var dp = tp1.ph - tp0.ph;
                    var dp0 = 0.5 * h * (tp0.f + tp1.f);
                    var dw = U.canonPI(dp - dp0) / h;
                    if (dw > .0013 * (tp0.f + tp1.f)) {
                        dw = 0;
                    }
                    if (!(bSplit && time == first)) {
                        tp0.fSynth0 = Math.max(0.0, Math.min(6.0, f0 * (tp0.f + dw)));
                    }
                    if (!(bMerge && time + 1 == last)) {
                        tp1.fSynth1 = Math.max(0.0, Math.min(6.0, f1 * (tp1.f + dw)));
                    }
                }

                if (!(tp0.bSplit || tp0.bMerge || tp1.bSplit || tp1.bMerge) && me.jump(tp0, tp1)) {
                    tp1.bJump = true;
                    if (tp0.dupStereo && tp1.dupStereo) {
                        if (tp0.dupStereo.owner == tp1.dupStereo.owner) {
                            tp1.bSyncStereo = !me.jump(tp0.dupStereo, tp1.dupStereo);
                        }
                    }
                }

                if (!tp0.bSplit) {
                    if (tp0.bJump) {
                        if (tp0.bSyncStereo) {
                            tp0.phSynth = U.canon2PI(tp0.dupStereo.phSynth + tp0.ph - tp0.dupStereo.ph);
                        } else {
                            tp0.phSynth = tp0.ph;
                        }
                    }
                }

                if (!(me.bMerge && time + 1 == me.last)) {
                    var dw = (tp1.fSynth1 - tp0.fSynth0) / n;
                    var w = tp0.fSynth0 + 0.5 * dw;
                    var iw = lrintf(w * WScale) / WScale;
                    var idw = lrintf(dw * WScale) / WScale;
                    tp1.phSynth = U.canon2PI(tp0.phSynth + n * iw + ((n * (n - 1)) >> 1) * idw);
                }
            } else {
                var dp = tp1.ph - tp0.ph;
                var dp0 = 0.5 * h * (tp0.f + tp1.f);
                var dw = U.canonPI(dp - dp0) / h;
                if (dw > .0013 * (tp0.f + tp1.f)) {
                    dw = 0;
                }
                if (!(me.bSplit && time == me.first)) {
                    tp0.fSynth0 = Math.max(0.0, Math.min(6.0, f0 * (tp0.f + dw)));
                    tp0.phSynth = tp0.ph;
                }
                if (!(me.bMerge && time + 1 == me.last)) {
                    tp1.fSynth1 = Math.max(0.0, Math.min(6.0, f1 * (tp1.f + dw)));
                    tp1.phSynth = tp1.ph;
                }
            }
        }
        return null;
    },
    //void Track :: //const TimeType &time, int mode
    updateM: function (time, mode) {
        var me = this;
        if (mode == synthModeTrial2) {
            if (time == me.first && time == me.start) {
                var tp0 = me.getTrackPoint(time);
                tp0.m = (tp0.m2 > 0.0 ? Math.sqrt(tp0.m2) : 0.0);
            }
            if (time < me.last) {
                var tp1 = me.getTrackPoint(time + 1);
                tp1.m = (tp1.m2 > 0.0 ? Math.sqrt(tp1.m2) : 0.0);
            }
        }
    },
    //void Track :: //const TimeType &time
    step: function (time) {
        var me = this;
        if (time > me.first && time < me.last) {
            var tp = me.point[time - first];
            tp.destroy();
            me.point[time - me.first] = null;
        }
    },
    //void Track :: //TrackPoint *
    push_back: function (p) {
        var me = this;

        me.point.push(p);
        p.owner = this;
        p.refCount++;
        me.last++;
        me.end++;
    },
    //void Track :: //bool bStitch
    endTrack: function (bStitch) {
        if (bStitch) {
            this.bStitch = true;
        } else {
            me.end++;
        }
        me.bEnded = true;
    },

    //void Track :: ////var *out, const TimeType &time,    int n,    int mode,    int c
    synth: function (out, time, n, mode, c) {
        //Probably need to change the out parameter to something i can send data out through.
        var me = this;
        var m0, m1;
        var w0, w1;
        // unused   var dw;
        var ph0, ph1;
        var bTailStart;
        var bTailEnd;
        if (time >= me.end) return;
        if (time < me.last) {
            var tp1 = me.getTrackPoint(time + 1);
            w1 = tp1.fSynth1;
            m1 = tp1.m;
            ph1 = tp1.phSynth;
            if (me.bMerge && time + 1 == me.last) {
                m1 = 0.0;
            }
            bTailStart = tp1.bJump;
            bTailEnd = tp1.bJump;
        } else {
            bTailStart = false;
            bTailEnd = (me.last != me.end);
        }
        if (time >= me.first) {
            var tp0 = me.getTrackPoint(time);
            w0 = tp0.fSynth0;
            m0 = tp0.m;
            ph0 = tp0.phSynth;
            if (me.bSplit && time == me.first) {
                m0 = 0.0;
            }
        } else {
            bTailStart = true;
        }

        if (bTailEnd) {
            var fall = Math.min(n, w0 == 0.0 ? 384 : Math.min(384, lrintf(Math.PI * 4.0 / w0)));
            var dm = m0 / fall;
            var w = w0;
            var out2 = out;
            var end = out + fall;
            var iph = lrintf(ph0 * WScale);
            if (iph >= W2PI) iph -= W2PI;
            var iw = lrintf(w * WScale);
            while (out2 != end) {
                if (iw < WPI) {
                    var f = (iph >> PhShift) & Ph1;
                    var i = iph >> WShift;
                    out2 += m0 * (synthTable1[i] + f * synthTable2[i]);
                }
                out2++;
                m0 -= dm;
                iph += iw;
                iph &= W2PIMask;
            }
        }

        if (bTailStart) {
            var rise = Math.min(n, w1 == 0.0 ? 384 : Math.min(384, lrintf(Math.PI * 3.0 / w1)));
            var dm = m1 / rise;
            var w = w1;
            out += n;
            var end = out - rise;
            var iph = lrintf(ph1 * WScale);
            iph &= W2PIMask;
            var iw = lrintf(w * WScale);
            while (out != end) {
                out--;
                m1 -= dm;
                iph -= iw;
                if (iph < 0) iph += W2PI;
                if (iw < WPI) {
                    var f = (iph >> PhShift) & Ph1;
                    var i = iph >> WShift;
                    out += m1 * (synthTable1[i] + f * synthTable2[i]);
                }
            }
        }

        if (!(bTailStart || bTailEnd)) {
            var dw = (w1 - w0) / n;
            var w = w0 + 0.5 * dw;
            var dm = (m1 - m0) / n;
            var iph = lrintf(ph0 * WScale);
            if (iph >= W2PI) iph -= W2PI;
            var iw = lrintf(w * WScale);
            var idw = lrintf(dw * WScale);

            var end = out + n;
            while (out != end) {
                if (iw < WPI) {
                    var f = (iph >> PhShift) & Ph1;
                    var i = iph >> WShift;
                    out += m0 * (synthTable1[i] + f * synthTable2[i]);
                }
                iph += iw;
                iw += idw;
                iph &= W2PIMask;
                m0 += dm;
                out++;
            }
        }
    },
    //void Track :: 
    absorb: function () {
        //for(vector<TrackPoint*>::iterator i = point.begin();
        //    i != point.end();
        //++i) {
        //    TrackPoint *tp = (*i);
        //    tp.absorb();
        //}
        var me = this;
        me.point.foreach(function (tp) {
            tp.absorb();
        })
    }


}).then(function () {
    window.synthTable1 = [2147450880, 2147319810, 2146795530, 2146009110, 2144895015, 2143387710, 2141618265, 2139521145, 2137096350, 2134343880, 2131329270, 2127921450,
        2124185955, 2120188320, 2115863010, 2111144490, 2106163830, 2100921030, 2095285020, 2089321335, 2083095510, 2076542010, 2069660835, 2062451985, 2054980995, 2047182330,
        2039055990, 2030667510, 2021951355, 2012907525, 2003536020, 1993902375, 1984006590, 1973783130, 1963231995, 1952418720, 1941277770, 1929874680, 1918143915, 1906151010,
        1893895965, 1881313245, 1868468385, 1855361385, 1841926710, 1828229895, 1814270940, 1800049845, 1785566610, 1770755700, 1755748185, 1740412995, 1724881200, 1709021730,
        1692965655, 1676581905, 1660001550, 1643159055, 1626054420, 1608753180, 1591124265, 1573364280, 1555276620, 1536992355, 1518445950, 1499702940, 1480763325, 1461561570,
        1442163210, 1422502710, 1402645605, 1382591895, 1362341580, 1341829125, 1321185600, 1300279935, 1279243200, 1257944325, 1236514380, 1214887830, 1193064675, 1171044915,
        1148894085, 1126546650, 1104002610, 1081327500, 1058455785, 1035453000, 1012319145, 988988685, 965527155, 941934555, 918145350, 894290610, 870239265, 846056850,
        821808900, 797364345, 772854255, 748213095, 723440865, 698603100, 673634265, 648534360, 623368920, 598137945, 572775900, 547282785, 521789670, 496165485, 470541300,
        444786045, 418965255, 393078930, 367127070, 341109675, 315092280, 289009350, 262860885, 236712420, 210498420, 184218885, 158004885, 131659815, 105380280, 79035210,
        52690140, 26345070, 0, -26345070, -52690140, -79035210, -105380280, -131659815, -158004885, -184218885, -210498420, -236712420, -262860885, -289009350, -315092280,
        -341109675, -367127070, -393078930, -418965255, -444786045, -470541300, -496165485, -521789670, -547282785, -572775900, -598137945, -623368920, -648534360, -673634265,
        -698603100, -723440865, -748213095, -772854255, -797364345, -821808900, -846056850, -870239265, -894290610, -918145350, -941934555, -965527155, -988988685, -1012319145,
        -1035453000, -1058455785, -1081327500, -1104002610, -1126546650, -1148894085, -1171044915, -1193064675, -1214887830, -1236514380, -1257944325, -1279243200, -1300279935,
        -1321185600, -1341829125, -1362341580, -1382591895, -1402645605, -1422502710, -1442163210, -1461561570, -1480763325, -1499702940, -1518445950, -1536992355, -1555276620,
        -1573364280, -1591124265, -1608753180, -1626054420, -1643159055, -1660001550, -1676581905, -1692965655, -1709021730, -1724881200, -1740412995, -1755748185, -1770755700,
        -1785566610, -1800049845, -1814270940, -1828229895, -1841926710, -1855361385, -1868468385, -1881313245, -1893895965, -1906151010, -1918143915, -1929874680, -1941277770,
        -1952418720, -1963231995, -1973783130, -1984006590, -1993902375, -2003536020, -2012907525, -2021951355, -2030667510, -2039055990, -2047182330, -2054980995, -2062451985,
        -2069660835, -2076542010, -2083095510, -2089321335, -2095285020, -2100921030, -2106163830, -2111144490, -2115863010, -2120188320, -2124185955, -2127921450, -2131329270,
        -2134343880, -2137096350, -2139521145, -2141618265, -2143387710, -2144895015, -2146009110, -2146795530, -2147319810, -2147450880, -2147319810, -2146795530, -2146009110,
        -2144895015, -2143387710, -2141618265, -2139521145, -2137096350, -2134343880, -2131329270, -2127921450, -2124185955, -2120188320, -2115863010, -2111144490, -2106163830,
        -2100921030, -2095285020, -2089321335, -2083095510, -2076542010, -2069660835, -2062451985, -2054980995, -2047182330, -2039055990, -2030667510, -2021951355, -2012907525,
        -2003536020, -1993902375, -1984006590, -1973783130, -1963231995, -1952418720, -1941277770, -1929874680, -1918143915, -1906151010, -1893895965, -1881313245, -1868468385,
        -1855361385, -1841926710, -1828229895, -1814270940, -1800049845, -1785566610, -1770755700, -1755748185, -1740412995, -1724881200, -1709021730, -1692965655, -1676581905,
        -1660001550, -1643159055, -1626054420, -1608753180, -1591124265, -1573364280, -1555276620, -1536992355, -1518445950, -1499702940, -1480763325, -1461561570, -1442163210,
        -1422502710, -1402645605, -1382591895, -1362341580, -1341829125, -1321185600, -1300279935, -1279243200, -1257944325, -1236514380, -1214887830, -1193064675, -1171044915,
        -1148894085, -1126546650, -1104002610, -1081327500, -1058455785, -1035453000, -1012319145, -988988685, -965527155, -941934555, -918145350, -894290610, -870239265,
        -846056850, -821808900, -797364345, -772854255, -748213095, -723440865, -698603100, -673634265, -648534360, -623368920, -598137945, -572775900, -547282785, -521789670,
        -496165485, -470541300, -444786045, -418965255, -393078930, -367127070, -341109675, -315092280, -289009350, -262860885, -236712420, -210498420, -184218885, -158004885,
        -131659815, -105380280, -79035210, -52690140, -26345070, 0, 26345070, 52690140, 79035210, 105380280, 131659815, 158004885, 184218885, 210498420, 236712420, 262860885,
        289009350, 315092280, 341109675, 367127070, 393078930, 418965255, 444786045, 470541300, 496165485, 521789670, 547282785, 572775900, 598137945, 623368920, 648534360,
        673634265, 698603100, 723440865, 748213095, 772854255, 797364345, 821808900, 846056850, 870239265, 894290610, 918145350, 941934555, 965527155, 988988685, 1012319145,
        1035453000, 1058455785, 1081327500, 1104002610, 1126546650, 1148894085, 1171044915, 1193064675, 1214887830, 1236514380, 1257944325, 1279243200, 1300279935, 1321185600,
        1341829125, 1362341580, 1382591895, 1402645605, 1422502710, 1442163210, 1461561570, 1480763325, 1499702940, 1518445950, 1536992355, 1555276620, 1573364280, 1591124265,
        1608753180, 1626054420, 1643159055, 1660001550, 1676581905, 1692965655, 1709021730, 1724881200, 1740412995, 1755748185, 1770755700, 1785566610, 1800049845, 1814270940,
        1828229895, 1841926710, 1855361385, 1868468385, 1881313245, 1893895965, 1906151010, 1918143915, 1929874680, 1941277770, 1952418720, 1963231995, 1973783130, 1984006590,
        1993902375, 2003536020, 2012907525, 2021951355, 2030667510, 2039055990, 2047182330, 2054980995, 2062451985, 2069660835, 2076542010, 2083095510, 2089321335, 2095285020,
        2100921030, 2106163830, 2111144490, 2115863010, 2120188320, 2124185955, 2127921450, 2131329270, 2134343880, 2137096350, 2139521145, 2141618265, 2143387710, 2144895015,
        2146009110, 2146795530, 2147319810];
    window.synthTable2 = [-2, -8, -12, -17, -23, -27, -32, -37, -42, -46, -52, -57, -61, -66, -72, -76, -80, -86, -91, -95, -100, -105, -110, -114, -119, -124, -128, -133, -138,
        -143, -147, -151, -156, -161, -165, -170, -174, -179, -183, -187, -192, -196, -200, -205, -209, -213, -217, -221, -226, -229, -234, -237, -242, -245, -250, -253, -257,
        -261, -264, -269, -271, -276, -279, -283, -286, -289, -293, -296, -300, -303, -306, -309, -313, -315, -319, -321, -325, -327, -330, -333, -336, -338, -341, -344, -346,
        -349, -351, -353, -356, -358, -360, -363, -364, -367, -369, -370, -373, -374, -376, -378, -379, -381, -383, -384, -385, -387, -389, -389, -391, -391, -393, -394, -395,
        -396, -397, -397, -398, -399, -399, -400, -401, -400, -402, -401, -402, -402, -402, -402, -402, -402, -402, -402, -401, -402, -400, -401, -400, -399, -399, -398, -397,
        -397, -396, -395, -394, -393, -391, -391, -389, -389, -387, -385, -384, -383, -381, -379, -378, -376, -374, -373, -370, -369, -367, -364, -363, -360, -358, -356, -353,
        -351, -349, -346, -344, -341, -338, -336, -333, -330, -327, -325, -321, -319, -315, -313, -309, -306, -303, -300, -296, -293, -289, -286, -283, -279, -276, -271, -269,
        -264, -261, -257, -253, -250, -245, -242, -237, -234, -229, -226, -221, -217, -213, -209, -205, -200, -196, -192, -187, -183, -179, -174, -170, -165, -161, -156, -151,
        -147, -143, -138, -133, -128, -124, -119, -114, -110, -105, -100, -95, -91, -86, -80, -76, -72, -66, -61, -57, -52, -46, -42, -37, -32, -27, -23, -17, -12, -8, -2, 2,
        8, 12, 17, 23, 27, 32, 37, 42, 46, 52, 57, 61, 66, 72, 76, 80, 86, 91, 95, 100, 105, 110, 114, 119, 124, 128, 133, 138, 143, 147, 151, 156, 161, 165, 170, 174, 179, 183,
        187, 192, 196, 200, 205, 209, 213, 217, 221, 226, 229, 234, 237, 242, 245, 250, 253, 257, 261, 264, 269, 271, 276, 279, 283, 286, 289, 293, 296, 300, 303, 306, 309, 313,
        315, 319, 321, 325, 327, 330, 333, 336, 338, 341, 344, 346, 349, 351, 353, 356, 358, 360, 363, 364, 367, 369, 370, 373, 374, 376, 378, 379, 381, 383, 384, 385, 387, 389,
        389, 391, 391, 393, 394, 395, 396, 397, 397, 398, 399, 399, 400, 401, 400, 402, 401, 402, 402, 402, 402, 402, 402, 402, 402, 401, 402, 400, 401, 400, 399, 399, 398, 397,
        397, 396, 395, 394, 393, 391, 391, 389, 389, 387, 385, 384, 383, 381, 379, 378, 376, 374, 373, 370, 369, 367, 364, 363, 360, 358, 356, 353, 351, 349, 346, 344, 341, 338,
        336, 333, 330, 327, 325, 321, 319, 315, 313, 309, 306, 303, 300, 296, 293, 289, 286, 283, 279, 276, 271, 269, 264, 261, 257, 253, 250, 245, 242, 237, 234, 229, 226, 221,
        217, 213, 209, 205, 200, 196, 192, 187, 183, 179, 174, 170, 165, 161, 156, 151, 147, 143, 138, 133, 128, 124, 119, 114, 110, 105, 100, 95, 91, 86, 80, 76, 72, 66, 61, 57
        , 52, 46, 42, 37, 32, 27, 23, 17, 12, 8, 2];

    window.synthModeOutput = 0;
    window.synthModeTrial2 = 1;
    window.synthModeTrial1 = 2;
});