/*
   Copyright 2011 Lazar Laszlo (lazarsoft@gmail.com, www.lazarsoft.info)
   
   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/

var MIN_SKIP = 3;
var MAX_MODULES = 57;
var INTEGER_MATH_SHIFT = 8;
var CENTER_QUORUM = 2;
MEPH.define('MEPH.qrcode.Qrcode', {
    requires: ['MEPH.qrcode.detector.Detector'],
    properties: {
        imagedata: null,
        width: 0,
        height: 0,
        qrCodeSymbol: null,
        debug: false,
        maxImgSize: 1024 * 1024,
        callback: null,
        sizeOfDataLengthInfo: null
    },
    initialize: function () {
        var me = this
        me.sizeOfDataLengthInfo = [[10, 9, 8, 8], [12, 11, 16, 10], [14, 13, 16, 12]];
    },
    orderBestPatterns: function (patterns) {

        function distance(pattern1, pattern2) {
            xDiff = pattern1.X - pattern2.X;
            yDiff = pattern1.Y - pattern2.Y;
            return Math.sqrt((xDiff * xDiff + yDiff * yDiff));
        }

        /// <summary> Returns the z component of the cross product between vectors BC and BA.</summary>
        function crossProductZ(pointA, pointB, pointC) {
            var bX = pointB.x;
            var bY = pointB.y;
            return ((pointC.x - bX) * (pointA.y - bY)) - ((pointC.y - bY) * (pointA.x - bX));
        }


        // Find distances between pattern centers
        var zeroOneDistance = distance(patterns[0], patterns[1]);
        var oneTwoDistance = distance(patterns[1], patterns[2]);
        var zeroTwoDistance = distance(patterns[0], patterns[2]);

        var pointA, pointB, pointC;
        // Assume one closest to other two is B; A and C will just be guesses at first
        if (oneTwoDistance >= zeroOneDistance && oneTwoDistance >= zeroTwoDistance) {
            pointB = patterns[0];
            pointA = patterns[1];
            pointC = patterns[2];
        }
        else if (zeroTwoDistance >= oneTwoDistance && zeroTwoDistance >= zeroOneDistance) {
            pointB = patterns[1];
            pointA = patterns[0];
            pointC = patterns[2];
        }
        else {
            pointB = patterns[2];
            pointA = patterns[0];
            pointC = patterns[1];
        }

        // Use cross product to figure out whether A and C are correct or flipped.
        // This asks whether BC x BA has a positive z component, which is the arrangement
        // we want for A, B, C. If it's negative, then we've got it flipped around and
        // should swap A and C.
        if (crossProductZ(pointA, pointB, pointC) < 0.0) {
            var temp = pointA;
            pointA = pointC;
            pointC = temp;
        }

        patterns[0] = pointA;
        patterns[1] = pointB;
        patterns[2] = pointC;
    },
    decode: function (src) {
        var me = this;
        if (src && MEPH.util.Dom.isElement(src)) {
            var canvas_qr = src;
            var context = canvas_qr.getContext('2d');
            me.width = canvas_qr.width;
            me.height = canvas_qr.height;
            me.imagedata = context.getImageData(0, 0, me.width, me.height);

            try {
                me.result = me.process(context);
            }
            catch (e) {
                MEPH.Log(e);
                me.result = "error decoding QR Code";
            }

            if (me.callback != null)
                me.callback(me.result);
            return me.result;
        }
        else {
            var image = new Image();
            image.onload = function () {
                //var canvas_qr = document.getElementById("qr-canvas");
                var canvas_qr = document.createElement('canvas');
                var context = canvas_qr.getContext('2d');
                var nheight = image.height;
                var nwidth = image.width;
                if (image.width * image.height > me.maxImgSize) {
                    var ir = image.width / image.height;
                    nheight = Math.sqrt(me.maxImgSize / ir);
                    nwidth = ir * nheight;
                }

                canvas_qr.width = nwidth;
                canvas_qr.height = nheight;

                context.drawImage(image, 0, 0, canvas_qr.width, canvas_qr.height);
                me.width = canvas_qr.width;
                me.height = canvas_qr.height;
                try {
                    me.imagedata = context.getImageData(0, 0, canvas_qr.width, canvas_qr.height);
                } catch (e) {
                    me.result = "Cross domain image reading not supported in your browser! Save it to your computer then drag and drop the file!";
                    if (me.callback != null)
                        me.callback(me.result);
                    return;
                }

                try {
                    me.result = me.process(context);
                }
                catch (e) {
                    MEPH.Log(e);
                    me.result = "error decoding QR Code";
                }
                if (me.callback != null)
                    me.callback(me.result);
            }
            image.src = src;
        }
    },
    isUrl: function (s) {
        var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
        return regexp.test(s);
    },
    decode_url: function (s) {
        var escaped = "";
        try {
            escaped = escape(s);
        }
        catch (e) {
            MEPH.Log(e);
            escaped = s;
        }
        var ret = "";
        try {
            ret = decodeURIComponent(escaped);
        }
        catch (e) {
            MEPH.Log(e);
            ret = escaped;
        }
        return ret;
    },
    decode_utf8: function (s) {
        var me = this;
        if (me.isUrl(s))
            return me.decode_url(s);
        else
            return s;
    },
    process: function (ctx) {
        var me = this;
        var start = new Date().getTime();

        var image = me.grayScaleToBitmap(me.grayscale());
        //var image = me.binarize(128);

        if (me.debug) {
            for (var y = 0; y < me.height; y++) {
                for (var x = 0; x < me.width; x++) {
                    var point = (x * 4) + (y * me.width * 4);
                    me.imagedata.data[point] = image[x + y * me.width] ? 0 : 0;
                    me.imagedata.data[point + 1] = image[x + y * me.width] ? 0 : 0;
                    me.imagedata.data[point + 2] = image[x + y * me.width] ? 255 : 0;
                }
            }
            ctx.putImageData(me.imagedata, 0, 0);
        }

        //var finderPatternInfo = new FinderPatternFinder().findFinderPattern(image);

        var detector = new MEPH.qrcode.detector.Detector(image, me);

        var qRCodeMatrix = detector.detect();

        /*for (var y = 0; y < qRCodeMatrix.bits.Height; y++)
        {
            for (var x = 0; x < qRCodeMatrix.bits.Width; x++)
            {
                var point = (x * 4*2) + (y*2 * me.width * 4);
                me.imagedata.data[point] = qRCodeMatrix.bits.get_Renamed(x,y)?0:0;
                me.imagedata.data[point+1] = qRCodeMatrix.bits.get_Renamed(x,y)?0:0;
                me.imagedata.data[point+2] = qRCodeMatrix.bits.get_Renamed(x,y)?255:0;
            }
        }*/
        if (me.debug)
            ctx.putImageData(me.imagedata, 0, 0);

        var reader = Decoder.decode(qRCodeMatrix.bits, me);
        var data = reader.DataByte;
        var str = "";
        for (var i = 0; i < data.length; i++) {
            for (var j = 0; j < data[i].length; j++)
                str += String.fromCharCode(data[i][j]);
        }

        var end = new Date().getTime();
        var time = end - start;
        MEPH.Log(time);

        return me.decode_utf8(str);
        //alert("Time:" + time + " Code: "+str);
    },
    getPixel: function (x, y) {
        var me = this;
        if (me.width < x) {
            throw "point error";
        }
        if (me.height < y) {
            throw "point error";
        }
        point = (x * 4) + (y * me.width * 4);
        p = (me.imagedata.data[point] * 33 + me.imagedata.data[point + 1] * 34 + me.imagedata.data[point + 2] * 33) / 100;
        return p;
    },
    binarize: function (th) {
        var me = this;
        var ret = new Array(me.width * me.height);
        for (var y = 0; y < me.height; y++) {
            for (var x = 0; x < me.width; x++) {
                var gray = me.getPixel(x, y);

                ret[x + y * me.width] = gray <= th ? true : false;
            }
        }
        return ret;
    },
    getMiddleBrightnessPerArea: function (image) {
        var me = this;
        var numSqrtArea = 4;
        //obtain middle brightness((min + max) / 2) per area
        var areaWidth = Math.floor(me.width / numSqrtArea);
        var areaHeight = Math.floor(me.height / numSqrtArea);
        var minmax = new Array(numSqrtArea);
        for (var i = 0; i < numSqrtArea; i++) {
            minmax[i] = new Array(numSqrtArea);
            for (var i2 = 0; i2 < numSqrtArea; i2++) {
                minmax[i][i2] = new Array(0, 0);
            }
        }
        for (var ay = 0; ay < numSqrtArea; ay++) {
            for (var ax = 0; ax < numSqrtArea; ax++) {
                minmax[ax][ay][0] = 0xFF;
                for (var dy = 0; dy < areaHeight; dy++) {
                    for (var dx = 0; dx < areaWidth; dx++) {
                        var target = image[areaWidth * ax + dx + (areaHeight * ay + dy) * me.width];
                        if (target < minmax[ax][ay][0])
                            minmax[ax][ay][0] = target;
                        if (target > minmax[ax][ay][1])
                            minmax[ax][ay][1] = target;
                    }
                }
                //minmax[ax][ay][0] = (minmax[ax][ay][0] + minmax[ax][ay][1]) / 2;
            }
        }
        var middle = new Array(numSqrtArea);
        for (var i3 = 0; i3 < numSqrtArea; i3++) {
            middle[i3] = new Array(numSqrtArea);
        }
        for (var ay = 0; ay < numSqrtArea; ay++) {
            for (var ax = 0; ax < numSqrtArea; ax++) {
                middle[ax][ay] = Math.floor((minmax[ax][ay][0] + minmax[ax][ay][1]) / 2);
                //Console.out.print(middle[ax][ay] + ",");
            }
            //Console.out.println("");
        }
        //Console.out.println("");

        return middle;
    },
    grayScaleToBitmap: function (grayScale) {
        var me = this;
        var middle = me.getMiddleBrightnessPerArea(grayScale);
        var sqrtNumArea = middle.length;
        var areaWidth = Math.floor(me.width / sqrtNumArea);
        var areaHeight = Math.floor(me.height / sqrtNumArea);
        var bitmap = new Array(me.height * me.width);

        for (var ay = 0; ay < sqrtNumArea; ay++) {
            for (var ax = 0; ax < sqrtNumArea; ax++) {
                for (var dy = 0; dy < areaHeight; dy++) {
                    for (var dx = 0; dx < areaWidth; dx++) {
                        bitmap[areaWidth * ax + dx + (areaHeight * ay + dy) * me.width] = (grayScale[areaWidth * ax + dx + (areaHeight * ay + dy) * me.width] < middle[ax][ay]) ? true : false;
                    }
                }
            }
        }
        return bitmap;
    },
    grayscale: function () {
        var me = this;
        var ret = new Array(me.width * me.height);
        for (var y = 0; y < me.height; y++) {
            for (var x = 0; x < me.width; x++) {
                var gray = me.getPixel(x, y);

                ret[x + y * me.width] = gray;
            }
        }
        return ret;
    }
});