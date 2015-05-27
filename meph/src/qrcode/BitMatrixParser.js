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


MEPH.define('MEPH.qrcode.BitMatrixParser', {
    requires: ['MEPH.qrcode.FormatInformation',
                'MEPH.qrcode.DataMask',
                'MEPH.qrcode.version.Version'],
    alternateNames: ['BitMatrixParser'],
    copyBit: function (i, j, versionBits) {
        var me = this;
        return me.bitMatrix.get_Renamed(i, j) ? (versionBits << 1) | 0x1 : versionBits << 1;
    },

    readFormatInformation: function () {
        var me = this;
        if (me.parsedFormatInfo != null) {
            return me.parsedFormatInfo;
        }

        // Read top-left format info bits
        var formatInfoBits = 0;
        for (var i = 0; i < 6; i++) {
            formatInfoBits = me.copyBit(i, 8, formatInfoBits);
        }
        // .. and skip a bit in the timing pattern ...
        formatInfoBits = me.copyBit(7, 8, formatInfoBits);
        formatInfoBits = me.copyBit(8, 8, formatInfoBits);
        formatInfoBits = me.copyBit(8, 7, formatInfoBits);
        // .. and skip a bit in the timing pattern ...
        for (var j = 5; j >= 0; j--) {
            formatInfoBits = me.copyBit(8, j, formatInfoBits);
        }

        me.parsedFormatInfo = MEPH.qrcode.FormatInformation.decodeFormatInformation(formatInfoBits);
        if (me.parsedFormatInfo != null) {
            return me.parsedFormatInfo;
        }

        // Hmm, failed. Try the top-right/bottom-left pattern
        var dimension = me.bitMatrix.Dimension;
        formatInfoBits = 0;
        var iMin = dimension - 8;
        for (var i = dimension - 1; i >= iMin; i--) {
            formatInfoBits = me.copyBit(i, 8, formatInfoBits);
        }
        for (var j = dimension - 7; j < dimension; j++) {
            formatInfoBits = me.copyBit(8, j, formatInfoBits);
        }

        me.parsedFormatInfo = MEPH.qrcode.FormatInformation.decodeFormatInformation(formatInfoBits);
        if (me.parsedFormatInfo != null) {
            return me.parsedFormatInfo;
        }
        throw "Error readFormatInformation";
    },
    readVersion: function () {
        var me = this;
        if (me.parsedVersion != null) {
            return me.parsedVersion;
        }

        var dimension = me.bitMatrix.Dimension;

        var provisionalVersion = (dimension - 17) >> 2;
        if (provisionalVersion <= 6) {
            return MEPH.qrcode.version.Version.getVersionForNumber(provisionalVersion);
        }

        // Read top-right version info: 3 wide by 6 tall
        var versionBits = 0;
        var ijMin = dimension - 11;
        for (var j = 5; j >= 0; j--) {
            for (var i = dimension - 9; i >= ijMin; i--) {
                versionBits = me.copyBit(i, j, versionBits);
            }
        }

        me.parsedVersion = MEPH.qrcode.version.Version.decodeVersionInformation(versionBits);
        if (me.parsedVersion != null && me.parsedVersion.DimensionForVersion == dimension) {
            return me.parsedVersion;
        }

        // Hmm, failed. Try bottom left: 6 wide by 3 tall
        versionBits = 0;
        for (var i = 5; i >= 0; i--) {
            for (var j = dimension - 9; j >= ijMin; j--) {
                versionBits = me.copyBit(i, j, versionBits);
            }
        }

        me.parsedVersion = MEPH.qrcode.version.Version.decodeVersionInformation(versionBits);
        if (me.parsedVersion != null && me.parsedVersion.DimensionForVersion == dimension) {
            return me.parsedVersion;
        }
        throw "Error readVersion";
    },
    initialize: function (bitMatrix) {
        var me = this;
        var dimension = bitMatrix.Dimension;
        if (dimension < 21 || (dimension & 0x03) != 1) {
            throw "Error BitMatrixParser";
        }
        me.bitMatrix = bitMatrix;
        me.parsedVersion = null;
        me.parsedFormatInfo = null;


    },
    readCodewords: function () {
        var me = this;
        var formatInfo = me.readFormatInformation();
        var version = me.readVersion();

        // Get the data mask for the format used in this QR Code. This will exclude
        // some bits from reading as we wind through the bit matrix.
        var dataMask = MEPH.qrcode.DataMask.forReference(formatInfo.DataMask);
        var dimension = me.bitMatrix.Dimension;
        dataMask.unmaskBitMatrix(me.bitMatrix, dimension);

        var functionPattern = version.buildFunctionPattern();

        var readingUp = true;
        var result = new Array(version.TotalCodewords);
        var resultOffset = 0;
        var currentByte = 0;
        var bitsRead = 0;
        // Read columns in pairs, from right to left
        for (var j = dimension - 1; j > 0; j -= 2) {
            if (j == 6) {
                // Skip whole column with vertical alignment pattern;
                // saves time and makes the other code proceed more cleanly
                j--;
            }
            // Read alternatingly from bottom to top then top to bottom
            for (var count = 0; count < dimension; count++) {
                var i = readingUp ? dimension - 1 - count : count;
                for (var col = 0; col < 2; col++) {
                    // Ignore bits covered by the function pattern
                    if (!functionPattern.get_Renamed(j - col, i)) {
                        // Read a bit
                        bitsRead++;
                        currentByte <<= 1;
                        if (me.bitMatrix.get_Renamed(j - col, i)) {
                            currentByte |= 1;
                        }
                        // If we've made a whole byte, save it off
                        if (bitsRead == 8) {
                            result[resultOffset++] = currentByte;
                            bitsRead = 0;
                            currentByte = 0;
                        }
                    }
                }
            }
            readingUp ^= true; // readingUp = !readingUp; // switch directions
        }
        if (resultOffset != version.TotalCodewords) {
            throw "Error readCodewords";
        }
        return result;
    }
});