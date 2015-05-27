/**
 * @class MEPH.table.SpreadSheet
 * @extends MEPH.control.Control
 * A infinitely scrolling SpreadSheet.
 **/
MEPH.define('MEPH.tween.Calculator', {
    requires: ['MEPH.math.Util', 'MEPH.math.Vector'],
    statics: {
        /**
         * Bezier Curve
         *
         **/
        BezierCubic: function (P1, P2, P3, P4, t) {
            var t0 = Math.pow(1 - t, 3);
            var t1 = 3 * Math.pow(1 - t, 2) * t;
            var t2 = 3 * Math.pow(1 - t, 2) * Math.pow(t, 2);
            var t3 = Math.pow(t, 3);

            var res = new MEPH.math.Vector([t0 * P1.x + t1 * P2.x + t2 * P3.x + t3 * P4.x,
                t0 * P1.y + t1 * P2.y + t2 * P3.y + t3 * P4.y]);
            return res;
        },
        Linear: function (p1, p2, t) {
            var vect = MEPH.math.Vector.Lerp2D(p1, p2, t);
            return vect;
        }
    },
    properties: {
        tweendata: null
    },
    setData: function (data) {
        var me = this;
        me.tweendata = data;
    },
    /**
     * Gets the tween value from the first path in the tween data.
     * @param {Number } t A value from 0 to 1
     **/
    get: function (t) {
        var me = this;
        var path = me.tweendata.first(function (x) { return x; });

        var index = path.x.firstIndex(function (x) { return x > t; });
        if (index === -1) {
            if (t === path.x.last()) {
                index = path.x.length - 1;
            }
            else
                throw new Error('not in defined range: Calculator.js')
        }
        index--;
        var segment = path.segments ? path.segments.first(function (x) {
            return x.segment === index;
        }) : null;
        var p1 = new Vector([path.x.nth(index + 1), path.y.nth(index + 1)]);
        var p2 = new Vector([path.x.nth(index + 2), path.y.nth(index + 2)]);
        var t0 = t < path.x.nth(index + 1) ? t - path.x.nth(index + 1) : t;
        var tn = path.x.nth(index + 2);
        if (tn)
            t0 = t0 / tn;
        if (segment) {
            //If cubic
            var p3 = new Vector([segment.startpos.x, segment.startpos.y]);
            var p4 = new Vector([segment.startpos.x, segment.startpos.y]);
            var res = MEPH.tween.Calculator.BezierCubic(p1, p3, p4, p2, t0)
            return res.y;
        }
        else {
            var res = MEPH.tween.Calculator.Linear(p1, p2, t0);

            return res.y;
        }
    }
});