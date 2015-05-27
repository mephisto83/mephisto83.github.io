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


MEPH.define('MEPH.qrcode.ReedSolomonDecoder', {
    decode: function (received, twoS, qrcode) {
        var me = this,
            poly = new GF256Poly(me.field, received);
        var syndromeCoefficients = new Array(twoS);
        for (var i = 0; i < syndromeCoefficients.length; i++) syndromeCoefficients[i] = 0;
        var dataMatrix = false;//me.field.Equals(GF256.DATA_MATRIX_FIELD);
        var noError = true;
        for (var i = 0; i < twoS; i++) {
            // Thanks to sanfordsquires for this fix:
            var eval = poly.evaluateAt(me.field.exp(dataMatrix ? i + 1 : i));
            syndromeCoefficients[syndromeCoefficients.length - 1 - i] = eval;
            if (eval != 0) {
                noError = false;
            }
        }
        if (noError) {
            return;
        }
        var syndrome = new GF256Poly(me.field, syndromeCoefficients);
        var sigmaOmega = me.runEuclideanAlgorithm(me.field.buildMonomial(twoS, 1), syndrome, twoS);
        var sigma = sigmaOmega[0];
        var omega = sigmaOmega[1];
        var errorLocations = me.findErrorLocations(sigma);
        var errorMagnitudes = me.findErrorMagnitudes(omega, errorLocations, dataMatrix);
        for (var i = 0; i < errorLocations.length; i++) {
            var position = received.length - 1 - me.field.log(errorLocations[i]);
            if (position < 0) {
                throw "ReedSolomonException Bad error location";
            }
            received[position] = GF256.addOrSubtract(received[position], errorMagnitudes[i]);
        }
    },
    setCode: function (code) {

    },
    runEuclideanAlgorithm: function (a, b, R) {
        // Assume a's degree is >= b's
        var me = this;
        if (a.Degree < b.Degree) {
            var temp = a;
            a = b;
            b = temp;
        }

        var rLast = a;
        var r = b;
        var sLast = me.field.One;
        var s = me.field.Zero;
        var tLast = me.field.Zero;
        var t = me.field.One;

        // Run Euclidean algorithm until r's degree is less than R/2
        while (r.Degree >= Math.floor(R / 2)) {
            var rLastLast = rLast;
            var sLastLast = sLast;
            var tLastLast = tLast;
            rLast = r;
            sLast = s;
            tLast = t;

            // Divide rLastLast by rLast, with quotient in q and remainder in r
            if (rLast.Zero) {
                // Oops, Euclidean algorithm already terminated?
                throw "r_{i-1} was zero";
            }
            r = rLastLast;
            var q = me.field.Zero;
            var denominatorLeadingTerm = rLast.getCoefficient(rLast.Degree);
            var dltInverse = me.field.inverse(denominatorLeadingTerm);
            while (r.Degree >= rLast.Degree && !r.Zero) {
                var degreeDiff = r.Degree - rLast.Degree;
                var scale = me.field.multiply(r.getCoefficient(r.Degree), dltInverse);
                q = q.addOrSubtract(me.field.buildMonomial(degreeDiff, scale));
                r = r.addOrSubtract(rLast.multiplyByMonomial(degreeDiff, scale));
                //r.EXE();
            }

            s = q.multiply1(sLast).addOrSubtract(sLastLast);
            t = q.multiply1(tLast).addOrSubtract(tLastLast);
        }

        var sigmaTildeAtZero = t.getCoefficient(0);
        if (sigmaTildeAtZero == 0) {
            throw "ReedSolomonException sigmaTilde(0) was zero";
        }

        var inverse = me.field.inverse(sigmaTildeAtZero);
        var sigma = t.multiply2(inverse);
        var omega = r.multiply2(inverse);
        return new Array(sigma, omega);
    },
    findErrorLocations: function (errorLocator) {
        // This is a direct application of Chien's search
        var numErrors = errorLocator.Degree;
        if (numErrors == 1) {
            // shortcut
            return new Array(errorLocator.getCoefficient(1));
        }
        var me = this;
        var result = new Array(numErrors);
        var e = 0;
        for (var i = 1; i < 256 && e < numErrors; i++) {
            if (errorLocator.evaluateAt(i) == 0) {
                result[e] = me.field.inverse(i);
                e++;
            }
        }
        if (e != numErrors) {
            throw "Error locator degree does not match number of roots";
        }
        return result;
    },
    findErrorMagnitudes: function (errorEvaluator, errorLocations, dataMatrix) {
        // This is directly applying Forney's Formula
        var s = errorLocations.length;
        var result = new Array(s);
        var me = this;
        for (var i = 0; i < s; i++) {
            var xiInverse = me.field.inverse(errorLocations[i]);
            var denominator = 1;
            for (var j = 0; j < s; j++) {
                if (i != j) {
                    denominator = me.field.multiply(denominator, GF256.addOrSubtract(1, me.field.multiply(errorLocations[j], xiInverse)));
                }
            }
            result[i] = me.field.multiply(errorEvaluator.evaluateAt(xiInverse), me.field.inverse(denominator));
            // Thanks to sanfordsquires for this fix:
            if (dataMatrix) {
                result[i] = me.field.multiply(result[i], xiInverse);
            }
        }
        return result;
    },
    initialize: function (field) {
        var me = this;
        me.field = field;
    }
});