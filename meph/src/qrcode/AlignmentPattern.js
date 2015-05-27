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

MEPH.define('MEPH.qrcode.AlignmentPattern', {
    defineGetters: function () {
        var me = this;
        Object.defineProperty(me, 'EstimatedModuleSize', function () {
            return me.estimatedModuleSize;
        });
        Object.defineProperty(me, 'Count', {
            get: function () {
                return me.count;
            }
        });
        Object.defineProperty(me, 'X', {
            get: function () {
                return Math.floor(me.x);
            }
        });
        Object.defineProperty(me, 'Y', {
            get: function () {
                return Math.floor(me.y);
            }
        });
    },
    incrementCount: function () {
        var me = this;
        me.count++;
    },
    aboutEquals: function (moduleSize, i, j) {
        var me = this;
        if (Math.abs(i - me.y) <= moduleSize && Math.abs(j - me.x) <= moduleSize) {
            var moduleSizeDiff = Math.abs(moduleSize - me.estimatedModuleSize);
            return moduleSizeDiff <= 1.0 || moduleSizeDiff / me.estimatedModuleSize <= 1.0;
        }
        return false;
    },
    initialize: function (posX, posY, estimatedModuleSize) {
        var me = this;
        me.x = posX;
        me.y = posY;
        me.count = 1;
        me.estimatedModuleSize = estimatedModuleSize;
        me.defineGetters();
    }

})