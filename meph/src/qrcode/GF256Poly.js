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



MEPH.define('MEPH.qrcode.GF256Poly', {
    alternateNames: ['GF256Poly'],

    getCoefficient: function (degree) {
        var me = this;
        return me.coefficients[me.coefficients.length - 1 - degree];
    },
    evaluateAt: function (a) {
        var me = this,
            GF256 = MEPH.qrcode.GF256;
        if (a == 0) {
            // Just return the x^0 coefficient
            return me.getCoefficient(0);
        }
        var size = me.coefficients.length;
        if (a == 1) {
            // Just the sum of the coefficients
            var result = 0;
            for (var i = 0; i < size; i++) {
                result = GF256.addOrSubtract(result, me.coefficients[i]);
            }
            return result;
        }
        var result2 = me.coefficients[0];
        for (var i = 1; i < size; i++) {
            result2 = GF256.addOrSubtract(me.field.multiply(a, result2), me.coefficients[i]);
        }
        return result2;
    },
    addOrSubtract: function (other) {
        var me = this,
           GF256 = MEPH.qrcode.GF256;
        if (me.field != other.field) {
            throw "GF256Polys do not have same GF256 field";
        }
        if (me.Zero) {
            return other;
        }
        if (other.Zero) {
            return this;
        }

        var smallerCoefficients = me.coefficients;
        var largerCoefficients = other.coefficients;
        if (smallerCoefficients.length > largerCoefficients.length) {
            var temp = smallerCoefficients;
            smallerCoefficients = largerCoefficients;
            largerCoefficients = temp;
        }
        var sumDiff = new Array(largerCoefficients.length);
        var lengthDiff = largerCoefficients.length - smallerCoefficients.length;
        // Copy high-order terms only found in higher-degree polynomial's coefficients
        //Array.Copy(largerCoefficients, 0, sumDiff, 0, lengthDiff);
        for (var ci = 0; ci < lengthDiff; ci++) sumDiff[ci] = largerCoefficients[ci];

        for (var i = lengthDiff; i < largerCoefficients.length; i++) {
            sumDiff[i] = GF256.addOrSubtract(smallerCoefficients[i - lengthDiff], largerCoefficients[i]);
        }

        return new GF256Poly(me.field, sumDiff);
    },
    multiply1: function (other) {
        var me = this,
           GF256 = MEPH.qrcode.GF256;
        if (me.field != other.field) {
            throw "GF256Polys do not have same GF256 field";
        }
        if (me.Zero || other.Zero) {
            return me.field.Zero;
        }
        var aCoefficients = me.coefficients;
        var aLength = aCoefficients.length;
        var bCoefficients = other.coefficients;
        var bLength = bCoefficients.length;
        var product = new Array(aLength + bLength - 1);
        for (var i = 0; i < aLength; i++) {
            var aCoeff = aCoefficients[i];
            for (var j = 0; j < bLength; j++) {
                product[i + j] = GF256.addOrSubtract(product[i + j], me.field.multiply(aCoeff, bCoefficients[j]));
            }
        }
        return new GF256Poly(me.field, product);
    },
    multiply2: function (scalar) {
        var me = this,
           GF256 = MEPH.qrcode.GF256;
        if (scalar == 0) {
            return me.field.Zero;
        }
        if (scalar == 1) {
            return this;
        }
        var size = me.coefficients.length;
        var product = new Array(size);
        for (var i = 0; i < size; i++) {
            product[i] = me.field.multiply(me.coefficients[i], scalar);
        }
        return new GF256Poly(me.field, product);
    },
    multiplyByMonomial: function (degree, coefficient) {
        var me = this,
           GF256 = MEPH.qrcode.GF256;
        if (degree < 0) {
            throw "System.ArgumentException";
        }
        if (coefficient == 0) {
            return me.field.Zero;
        }
        var size = me.coefficients.length;
        var product = new Array(size + degree);
        for (var i = 0; i < product.length; i++) product[i] = 0;
        for (var i = 0; i < size; i++) {
            product[i] = me.field.multiply(me.coefficients[i], coefficient);
        }
        return new GF256Poly(me.field, product);
    },
    divide: function (other) {
        if (me.field != other.field) {
            throw "GF256Polys do not have same GF256 field";
        }
        if (other.Zero) {
            throw "Divide by 0";
        }

        var quotient = me.field.Zero;
        var remainder = this;

        var denominatorLeadingTerm = other.getCoefficient(other.Degree);
        var inverseDenominatorLeadingTerm = me.field.inverse(denominatorLeadingTerm);

        while (remainder.Degree >= other.Degree && !remainder.Zero) {
            var degreeDifference = remainder.Degree - other.Degree;
            var scale = me.field.multiply(remainder.getCoefficient(remainder.Degree), inverseDenominatorLeadingTerm);
            var term = other.multiplyByMonomial(degreeDifference, scale);
            var iterationQuotient = me.field.buildMonomial(degreeDifference, scale);
            quotient = quotient.addOrSubtract(iterationQuotient);
            remainder = remainder.addOrSubtract(term);
        }

        return new Array(quotient, remainder);
    },
    initialize: function (field, coefficients) {
        var me = this;
        if (coefficients == null || coefficients.length == 0) {
            throw "System.ArgumentException";
        }
        me.field = field;
        var coefficientsLength = coefficients.length;
        if (coefficientsLength > 1 && coefficients[0] == 0) {
            // Leading term must be non-zero for anything except the constant polynomial "0"
            var firstNonZero = 1;
            while (firstNonZero < coefficientsLength && coefficients[firstNonZero] == 0) {
                firstNonZero++;
            }
            if (firstNonZero == coefficientsLength) {
                me.coefficients = field.Zero.coefficients;
            }
            else {
                me.coefficients = new Array(coefficientsLength - firstNonZero);
                for (var i = 0; i < me.coefficients.length; i++) me.coefficients[i] = 0;
                //Array.Copy(coefficients, firstNonZero, me.coefficients, 0, me.coefficients.length);
                for (var ci = 0; ci < me.coefficients.length; ci++) me.coefficients[ci] = coefficients[firstNonZero + ci];
            }
        }
        else {
            me.coefficients = coefficients;
        }
        Object.defineProperty(me, 'Zero', {
            get: function () {
                return me.coefficients[0] == 0;
            }
        });

        Object.defineProperty(me, 'Degree', {
            get: function () {
                return me.coefficients.length - 1;
            }
        });
        Object.defineProperty(me, 'Coefficients', {
            get: function () {
                return me.coefficients;
            }
        });
    }
});