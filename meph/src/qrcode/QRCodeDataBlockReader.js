﻿/*
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


MEPH.define('MEPH.qrcode.QRCodeDataBlockReader', {
    initialize: function (blocks, version, numErrorCorrectionCode, qrcode) {
        var me = this;
        me.qrcode = qrcode;
        me.blockPointer = 0;
        me.bitPointer = 7;
        me.dataLength = 0;
        me.blocks = blocks;
        me.numErrorCorrectionCode = numErrorCorrectionCode;
        if (version <= 9)
            me.dataLengthMode = 0;
        else if (version >= 10 && version <= 26)
            me.dataLengthMode = 1;
        else if (version >= 27 && version <= 40)
            me.dataLengthMode = 2;

        Object.defineProperty(me, 'DataByte', {
            get: function () {
                var output = new Array();
                var MODE_NUMBER = 1;
                var MODE_ROMAN_AND_NUMBER = 2;
                var MODE_8BIT_BYTE = 4;
                var MODE_KANJI = 8;
                do {
                    var mode = me.NextMode();
                    //canvas.println("mode: " + mode);
                    if (mode == 0) {
                        if (output.length > 0)
                            break;
                        else
                            throw "Empty data block";
                    }
                    //if (mode != 1 && mode != 2 && mode != 4 && mode != 8)
                    //	break;
                    //}
                    if (mode != MODE_NUMBER && mode != MODE_ROMAN_AND_NUMBER && mode != MODE_8BIT_BYTE && mode != MODE_KANJI) {
                        /*					canvas.println("Invalid mode: " + mode);
                        mode = guessMode(mode);
                        canvas.println("Guessed mode: " + mode); */
                        throw "Invalid mode: " + mode + " in (block:" + me.blockPointer + " bit:" + me.bitPointer + ")";
                    }
                    dataLength = me.getDataLength(mode);
                    if (dataLength < 1)
                        throw "Invalid data length: " + dataLength;
                    //canvas.println("length: " + dataLength);
                    switch (mode) {

                        case MODE_NUMBER:
                            //canvas.println("Mode: Figure");
                            var temp_str = me.getFigureString(dataLength);
                            var ta = new Array(temp_str.length);
                            for (var j = 0; j < temp_str.length; j++)
                                ta[j] = temp_str.charCodeAt(j);
                            output.push(ta);
                            break;

                        case MODE_ROMAN_AND_NUMBER:
                            //canvas.println("Mode: Roman&Figure");
                            var temp_str = me.getRomanAndFigureString(dataLength);
                            var ta = new Array(temp_str.length);
                            for (var j = 0; j < temp_str.length; j++)
                                ta[j] = temp_str.charCodeAt(j);
                            output.push(ta);
                            //output.Write(SystemUtils.ToByteArray(temp_sbyteArray2), 0, temp_sbyteArray2.Length);
                            break;

                        case MODE_8BIT_BYTE:
                            //canvas.println("Mode: 8bit Byte");
                            //sbyte[] temp_sbyteArray3;
                            var temp_sbyteArray3 = me.get8bitByteArray(dataLength);
                            output.push(temp_sbyteArray3);
                            //output.Write(SystemUtils.ToByteArray(temp_sbyteArray3), 0, temp_sbyteArray3.Length);
                            break;

                        case MODE_KANJI:
                            //canvas.println("Mode: Kanji");
                            //sbyte[] temp_sbyteArray4;
                            //temp_sbyteArray4 = SystemUtils.ToSByteArray(SystemUtils.ToByteArray(getKanjiString(dataLength)));
                            //output.Write(SystemUtils.ToByteArray(temp_sbyteArray4), 0, temp_sbyteArray4.Length);
                            var temp_str = me.getKanjiString(dataLength);
                            output.push(temp_str);
                            break;
                    }
                    //			
                    //canvas.println("DataLength: " + dataLength);
                    //Console.out.println(dataString);
                }
                while (true);
                return output;
            }
        });
    },
    getKanjiString: function (dataLength) {
        var length = dataLength;
        var intData = 0;
        var unicodeString = "";
        do {
            intData = getNextBits(13);
            var lowerByte = intData % 0xC0;
            var higherByte = intData / 0xC0;

            var tempWord = (higherByte << 8) + lowerByte;
            var shiftjisWord = 0;
            if (tempWord + 0x8140 <= 0x9FFC) {
                // between 8140 - 9FFC on Shift_JIS character set
                shiftjisWord = tempWord + 0x8140;
            }
            else {
                // between E040 - EBBF on Shift_JIS character set
                shiftjisWord = tempWord + 0xC140;
            }

            //var tempByte = new Array(0,0);
            //tempByte[0] = (sbyte) (shiftjisWord >> 8);
            //tempByte[1] = (sbyte) (shiftjisWord & 0xFF);
            //unicodeString += new String(SystemUtils.ToCharArray(SystemUtils.ToByteArray(tempByte)));
            unicodeString += String.fromCharCode(shiftjisWord);
            length--;
        }
        while (length > 0);


        return unicodeString;
    },
    get8bitByteArray: function (dataLength) {
        var length = dataLength;
        var me = this;
        var intData = 0;
        var output = new Array();

        do {
            intData = me.getNextBits(8);
            output.push(intData);
            length--;
        }
        while (length > 0);
        return output;
    },
    getFigureString: function (dataLength) {
        var length = dataLength;
        var me = this;
        var intData = 0;
        var strData = "";
        do {
            if (length >= 3) {
                intData = me.getNextBits(10);
                if (intData < 100)
                    strData += "0";
                if (intData < 10)
                    strData += "0";
                length -= 3;
            }
            else if (length == 2) {
                intData = me.getNextBits(7);
                if (intData < 10)
                    strData += "0";
                length -= 2;
            }
            else if (length == 1) {
                intData = me.getNextBits(4);
                length -= 1;
            }
            strData += intData;
        }
        while (length > 0);

        return strData;
    },
    getRomanAndFigureString: function (dataLength) {
        var length = dataLength;
        var me = this;
        var intData = 0;
        var strData = "";
        var tableRomanAndFigure = new Array('0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E',
            'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', ' ',
            '$', '%', '*', '+', '-', '.', '/', ':');
        do {
            if (length > 1) {
                intData = me.getNextBits(11);
                var firstLetter = Math.floor(intData / 45);
                var secondLetter = intData % 45;
                strData += tableRomanAndFigure[firstLetter];
                strData += tableRomanAndFigure[secondLetter];
                length -= 2;
            }
            else if (length == 1) {
                intData = me.getNextBits(6);
                strData += tableRomanAndFigure[intData];
                length -= 1;
            }
        }
        while (length > 0);

        return strData;
    },
    getDataLength: function (modeIndicator) {
        var me = this,
            index = 0,
            qrcode = me.qrcode;
        while (true) {
            if ((modeIndicator >> index) == 1)
                break;
            index++;
        }

        return me.getNextBits(qrcode.sizeOfDataLengthInfo[me.dataLengthMode][index]);
    },
    NextMode: function () {
        var me = this;
        if ((me.blockPointer > me.blocks.length - me.numErrorCorrectionCode - 2))
            return 0;
        else
            return me.getNextBits(4);
    },
    getNextBits: function (numBits) {
        var bits = 0;
        var me = this;
        if (numBits < me.bitPointer + 1) {
            // next word fits into current data block
            var mask = 0;
            for (var i = 0; i < numBits; i++) {
                mask += (1 << i);
            }
            mask <<= (me.bitPointer - numBits + 1);

            bits = (me.blocks[me.blockPointer] & mask) >> (me.bitPointer - numBits + 1);
            me.bitPointer -= numBits;
            return bits;
        }
        else if (numBits < me.bitPointer + 1 + 8) {
            // next word crosses 2 data blocks
            var mask1 = 0;
            for (var i = 0; i < me.bitPointer + 1; i++) {
                mask1 += (1 << i);
            }
            bits = (me.blocks[me.blockPointer] & mask1) << (numBits - (me.bitPointer + 1));
            me.blockPointer++;
            bits += ((me.blocks[me.blockPointer]) >> (8 - (numBits - (me.bitPointer + 1))));

            me.bitPointer = me.bitPointer - numBits % 8;
            if (me.bitPointer < 0) {
                me.bitPointer = 8 + me.bitPointer;
            }
            return bits;
        }
        else if (numBits < me.bitPointer + 1 + 16) {
            // next word crosses 3 data blocks
            var mask1 = 0; // mask of first block
            var mask3 = 0; // mask of 3rd block
            //bitPointer + 1 : number of bits of the 1st block
            //8 : number of the 2nd block (note that use already 8bits because next word uses 3 data blocks)
            //numBits - (bitPointer + 1 + 8) : number of bits of the 3rd block 
            for (var i = 0; i < me.bitPointer + 1; i++) {
                mask1 += (1 << i);
            }
            var bitsFirstBlock = (me.blocks[me.blockPointer] & mask1) << (numBits - (me.bitPointer + 1));
            me.blockPointer++;

            var bitsSecondBlock = me.blocks[me.blockPointer] << (numBits - (me.bitPointer + 1 + 8));
            me.blockPointer++;

            for (var i = 0; i < numBits - (me.bitPointer + 1 + 8) ; i++) {
                mask3 += (1 << i);
            }
            mask3 <<= 8 - (numBits - (me.bitPointer + 1 + 8));
            var bitsThirdBlock = (me.blocks[me.blockPointer] & mask3) >> (8 - (numBits - (me.bitPointer + 1 + 8)));

            bits = bitsFirstBlock + bitsSecondBlock + bitsThirdBlock;
            me.bitPointer = me.bitPointer - (numBits - 8) % 8;
            if (me.bitPointer < 0) {
                me.bitPointer = 8 + me.bitPointer;
            }
            return bits;
        }
        else {
            return 0;
        }
    }
});