
//import flash.utils.ByteArray;
//import flash.utils.Endian;

MEPH.define("MEPH.audio.soundfont.utils.SFByteArray", {
    requires: ['MEPH.audio.external.stringencoding.encoding-indexes',
                'MEPH.audio.external.stringencoding.encoding'],
    extend: "MEPH.audio.soundfont.SFObject",
    properties: {
        automove: true
    },
    statics: {
        uint16size: 2,
        Int32Size: 4,
        UFloat32Size: 4,
        CharSize: 1,
        UInt32Size: 4,
        UInt8Size: 1,
        Int8Size: 1,
        Int16Size: 2,
        UInt16Size: 2
    },
    initialize: function (source) /// source should be an arraybuffer , i think 
    {

        this.endian = true; //false == BIG_ENDIAN //Endian.LITTLE_ENDIAN;
        //super();
        this.encoding = "utf-8";
        if (source != null) {
            this.writeBytes(source);
            this.position = 0;
        }
    },
    setSource: function (source) {
        this.writeBytes(source);
    },
    writeBytes: function (source) {

        this._source = source;
        this._dataview = new DataView(source);
    },
    copy: function (src, srcOffset, length) {
        this.memcpy(this._source, this.position, src, srcOffset, length);
    },
    memcpy: function (dst, dstOffset, src, srcOffset, length) {
        var dstU8 = new Uint8Array(dst, dstOffset, length);
        var srcU8 = new Uint8Array(src, srcOffset, length);
        dstU8.set(srcU8);
    },
    readWord: function ()//:uint
    {

        //return super.readUnsignedShort(); 
        var result = this._dataview.getUint16(this.position, this.endian);
        if (this.automove) {
            this.position += SFByteArray.UInt16Size;
        }
        return result;
    },
    hasSource: function () {
        return this._source;
    },
    readBytes: function (destination, offset, chunksize) {
        if (!destination.hasSource()) {
            destination.setSource(new ArrayBuffer(chunksize));
        }
        this.memcpy(destination._source, offset, this._source, this.position, chunksize);
        this.position += chunksize;
    },
    readUnsignedByte: function () {
        var result = this._dataview.getUint8(this.position, this.endian);
        if (this.automove) {
            this.position += SFByteArray.UInt8Size;
        }
        return result;
    },
    readByte: function () {
        var result = this._dataview.getInt8(this.position, this.endian);
        if (this.automove) {
            this.position += SFByteArray.Int8Size;
        }
        return result;
    },
    readShort: function () {
        var result = this._dataview.getInt16(this.position, this.endian);
        if (this.automove) {
            this.position += SFByteArray.Int16Size;
        }
        return result;
    },
    readUnsignedShort: function () {
        var result = this._dataview.getUint16(this.position, this.endian);
        if (this.automove) {
            this.position += SFByteArray.UInt16Size;
        }
        return result;
    },
    readDWord: function ()//:uint
    {
        //return super.readUnsignedInt();
        var result = this._dataview.getInt32(this.position, this.endian);
        if (this.automove) {
            this.position += SFByteArray.Int32Size;
        }
        return result;
    },
    readFloat: function () {
        var result = this._dataview.getFloat32(this.position, this.endian);
        if (this.automove) {
            this.position += SFByteArray.UFloat32Size;
        }
        return result;
    },
    writeFloat: function (val) {
        var result = this._dataview.setFloat32(this.position, val, this.endian);
        if (this.automove) {
            this.position += SFByteArray.UFloat32Size;
        }
        return result;
    },
    readString: function (length)//:int = -1:String
    {
        ;
        var decoder = TextDecoder(this.encoding);
        length = (length == -1) ? this.bytesAvailable() : length;
        ///return super.readUTFBytes(length);
        var tempview = new DataView(this._source, this.position, length);
        var result = decoder.decode(tempview, 0, length);
        if (this.automove) {
            this.position += (SFByteArray.CharSize * length);
        }
        return result;
    },
    bytesAvailable: function () {
        return this._dataview.byteLength - this.position;
    },
    writeWord: function (word)//:int //:void
    {
        //this.writeByte(word % 256);
        //word /= 256;
        //this.writeByte(word % 256);
        this._dataview.setInt32(word, this.position, this.endian);
        if (this.automove) {
            this.position += (SFByteArray.Int32Size * length);
        }
    },
    writeByte: function (word) {
        debugger;
    },
    writeDWord: function (dWord)//:uint //:void
    {
        debugger;
        //super.writeUnsignedInt(dWord);
        this._dataview.setUInt32(dWord, this.position, this.endian);

        if (this.automove) {
            this.position += (SFByteArray.UInt32Size * length);
        }
    },
    writeString: function (string)//:String //:void
    {
        //super.writeUTFBytes(string);
        debugger;
        var uint8array = new TextEncoder(this.encoding).encode(string);
        //var string = new TextDecoder(encoding).decode(uint8array);
        //memcpy: function (dst, dstOffset, src, srcOffset, length)
        var offset = this.position;
        //for (var i = 0 ; i < uint8array.length; i++) {
        //    this._dataview.setUInt8(offset + i, uint8array[i]);
        //}
        this.memcpy(this._dataview, this.position, uint8array, 0, uint8array.buffer.length);

        if (this.automove) {
            this.position += (uint8array.buffer.length);
        }
    },
    skip: function (numBytes)//:uint //:void
    {
        this.position += numBytes;
    }
});