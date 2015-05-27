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


MEPH.define('MEPH.qrcode.GF256', {
    alternateNames: ['GF256'],
    requires: ['MEPH.qrcode.GF256Poly'],
    buildMonomial: function (degree, coefficient) {
        var me = this;
        if (degree < 0) {
            throw "System.ArgumentException";
        }
        if (coefficient == 0) {
            return zero;
        }
        var coefficients = new Array(degree + 1);
        for (var i = 0; i < coefficients.length; i++) coefficients[i] = 0;
        coefficients[0] = coefficient;
        return new GF256Poly(me, coefficients);
    },
    initialize: function (primitive) {
        var me = this;
        me.expTable = new Array(256);
        me.logTable = new Array(256);
        var x = 1;
        for (var i = 0; i < 256; i++) {
            me.expTable[i] = x;
            x <<= 1; // x = x * 2; we're assuming the generator alpha is 2
            if (x >= 0x100) {
                x ^= primitive;
            }
        }
        for (var i = 0; i < 255; i++) {
            me.logTable[me.expTable[i]] = i;
        }
        // logTable[0] == 0 but this should never be used
        var at0 = new Array(1); at0[0] = 0;
        me.zero = new GF256Poly(this, new Array(at0));
        var at1 = new Array(1); at1[0] = 1;
        me.one = new GF256Poly(this, new Array(at1));
        Object.defineProperty(me, 'Zero', {
            get: function () {
                return me.zero;
            }
        });

        Object.defineProperty(me, 'One', {
            get: function () {
                return me.one;
            }
        });


    },
    exp: function (a) {
        var me = this;
        return me.expTable[a];
    },
    log: function (a) {
        var me = this;
        if (a == 0) {
            throw "System.ArgumentException";
        }
        return me.logTable[a];
    },
    inverse: function (a) {
        if (a == 0) {
            throw "System.ArithmeticException";
        }
        var me = this;
        return me.expTable[255 - me.logTable[a]];
    },
    multiply: function (a, b) {
        if (a == 0 || b == 0) {
            return 0;
        }
        if (a == 1) {
            return b;
        }
        if (b == 1) {
            return a;
        }
        var me = this;
        return me.expTable[(me.logTable[a] + me.logTable[b]) % 255];
    }
}).then(function () {
    var GF256 = MEPH.qrcode.GF256;
    GF256.QR_CODE_FIELD = new GF256(0x011D);
    GF256.DATA_MATRIX_FIELD = new GF256(0x012D);

    GF256.addOrSubtract = function (a, b) {
        return a ^ b;
    }
});