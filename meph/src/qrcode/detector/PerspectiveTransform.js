/*
  Ported to JavaScript by Lazar Laszlo 2011 
  
  lazarsoft@gmail.com, www.lazarsoft.info
  
*/

/*
*
* Copyright 2007 ZXing authors
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*      http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

MEPH.define('MEPH.qrcode.detector.PerspectiveTransform', {
    initialize: function (a11, a21, a31, a12, a22, a32, a13, a23, a33) {
        var me = this;
        me.a11 = a11;
        me.a12 = a12;
        me.a13 = a13;
        me.a21 = a21;
        me.a22 = a22;
        me.a23 = a23;
        me.a31 = a31;
        me.a32 = a32;
        me.a33 = a33;


        me.times = function (other) {
            return new PerspectiveTransform(me.a11 * other.a11 + me.a21 * other.a12 + me.a31 * other.a13, me.a11 * other.a21 + me.a21 * other.a22 + me.a31 * other.a23, me.a11 * other.a31 + me.a21 * other.a32 + me.a31 * other.a33, me.a12 * other.a11 + me.a22 * other.a12 + me.a32 * other.a13, me.a12 * other.a21 + me.a22 * other.a22 + me.a32 * other.a23, me.a12 * other.a31 + me.a22 * other.a32 + me.a32 * other.a33, me.a13 * other.a11 + me.a23 * other.a12 + me.a33 * other.a13, me.a13 * other.a21 + me.a23 * other.a22 + me.a33 * other.a23, me.a13 * other.a31 + me.a23 * other.a32 + me.a33 * other.a33);
        }

    },
    transformPoints1: function (points) {
        var me = this;
        var max = points.length;
        var a11 = me.a11;
        var a12 = me.a12;
        var a13 = me.a13;
        var a21 = me.a21;
        var a22 = me.a22;
        var a23 = me.a23;
        var a31 = me.a31;
        var a32 = me.a32;
        var a33 = me.a33;
        for (var i = 0; i < max; i += 2) {
            var x = points[i];
            var y = points[i + 1];
            var denominator = a13 * x + a23 * y + a33;
            points[i] = (a11 * x + a21 * y + a31) / denominator;
            points[i + 1] = (a12 * x + a22 * y + a32) / denominator;
        }
    },
    transformPoints2: function (xValues, yValues) {
        var n = xValues.length;
        for (var i = 0; i < n; i++) {
            var x = xValues[i];
            var y = yValues[i];
            var denominator = me.a13 * x + me.a23 * y + me.a33;
            xValues[i] = (me.a11 * x + me.a21 * y + me.a31) / denominator;
            yValues[i] = (me.a12 * x + me.a22 * y + me.a32) / denominator;
        }
    },
    buildAdjoint: function () {
        // Adjoint is the transpose of the cofactor matrix:
        var me = this;
        return new PerspectiveTransform(me.a22 * me.a33 - me.a23 * me.a32, me.a23 * me.a31 - me.a21 * me.a33, me.a21 * me.a32 - me.a22 * me.a31, me.a13 * me.a32 - me.a12 * me.a33, me.a11 * me.a33 - me.a13 * me.a31, me.a12 * me.a31 - me.a11 * me.a32, me.a12 * me.a23 - me.a13 * me.a22, me.a13 * me.a21 - me.a11 * me.a23, me.a11 * me.a22 - me.a12 * me.a21);
    },
    statics: {
        quadrilateralToQuadrilateral: function (x0, y0, x1, y1, x2, y2, x3, y3, x0p, y0p, x1p, y1p, x2p, y2p, x3p, y3p) {
            var me = this;
            var qToS = MEPH.qrcode.detector.PerspectiveTransform.quadrilateralToSquare(x0, y0, x1, y1, x2, y2, x3, y3);
            var sToQ = MEPH.qrcode.detector.PerspectiveTransform.squareToQuadrilateral(x0p, y0p, x1p, y1p, x2p, y2p, x3p, y3p);
            return sToQ.times(qToS);
        },
        squareToQuadrilateral: function (x0, y0, x1, y1, x2, y2, x3, y3) {
            dy2 = y3 - y2;
            dy3 = y0 - y1 + y2 - y3;
            if (dy2 == 0.0 && dy3 == 0.0) {
                return new PerspectiveTransform(x1 - x0, x2 - x1, x0, y1 - y0, y2 - y1, y0, 0.0, 0.0, 1.0);
            }
            else {
                dx1 = x1 - x2;
                dx2 = x3 - x2;
                dx3 = x0 - x1 + x2 - x3;
                dy1 = y1 - y2;
                denominator = dx1 * dy2 - dx2 * dy1;
                a13 = (dx3 * dy2 - dx2 * dy3) / denominator;
                a23 = (dx1 * dy3 - dx3 * dy1) / denominator;
                return new PerspectiveTransform(x1 - x0 + a13 * x1, x3 - x0 + a23 * x3, x0, y1 - y0 + a13 * y1, y3 - y0 + a23 * y3, y0, a13, a23, 1.0);
            }
        },
        quadrilateralToSquare: function (x0, y0, x1, y1, x2, y2, x3, y3) {
            // Here, the adjoint serves as the inverse:
            return MEPH.qrcode.detector.PerspectiveTransform.squareToQuadrilateral(x0, y0, x1, y1, x2, y2, x3, y3).buildAdjoint();
        }
    }
});