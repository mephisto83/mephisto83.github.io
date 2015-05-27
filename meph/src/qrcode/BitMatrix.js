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


MEPH.define('MEPH.qrcode.BitMatrix', {
    requires: ['MEPH.qrcode.Util'],
    defineGetters: function () {
        var me = this;
        Object.defineProperty(me, 'Width', {
            get: function () {
                return me.width;
            }
        });
        Object.defineProperty(me, 'Height', {
            get: function () {
                return me.height;
            }
        });

        Object.defineProperty(me, 'Dimension', {
            get: function () {
                if (me.width != me.height) {
                    throw "Can't call getDimension() on a non-square matrix";
                }
                return me.width;
            }
        });
    },
    get_Renamed: function (x, y) {
        var me = this, offset;
        offset = y * me.rowSize + (x >> 5);
        return ((MEPH.qrcode.Util.URShift(me.bits[offset], (x & 0x1f))) & 1) != 0;
    },
    set_Renamed: function (x, y) {
        var me = this,
            offset = y * me.rowSize + (x >> 5);
        me.bits[offset] |= 1 << (x & 0x1f);
    },
    flip: function (x, y) {
        var me = this,
            offset = y * me.rowSize + (x >> 5);
        me.bits[offset] ^= 1 << (x & 0x1f);
    },
    clear: function () {
        var me = this,
            max = me.bits.length;
        for (var i = 0; i < max; i++) {
            me.bits[i] = 0;
        }
    },
    setRegion: function (left, top, width, height) {
        if (top < 0 || left < 0) {
            throw "Left and top must be nonnegative";
        }
        if (height < 1 || width < 1) {
            throw "Height and width must be at least 1";
        }
        var me = this,
            right = left + width,
            bottom = top + height;
        if (bottom > me.height || right > me.width) {
            throw "The region must fit inside the matrix";
        }
        for (var y = top; y < bottom; y++) {
            var offset = y * me.rowSize;
            for (var x = left; x < right; x++) {
                me.bits[offset + (x >> 5)] |= 1 << (x & 0x1f);
            }
        }
    },
    initialize: function (width, height) {
        var me = this;
        if (!height)
            height = width;
        if (width < 1 || height < 1) {
            throw "Both dimensions must be greater than 0";
        }
        me.width = width;
        me.height = height;
        var rowSize = width >> 5;
        if ((width & 0x1f) != 0) {
            rowSize++;
        }
        me.rowSize = rowSize;
        me.bits = new Array(rowSize * height);
        for (var i = 0; i < me.bits.length; i++)
            me.bits[i] = 0;

        me.defineGetters();
    }
});