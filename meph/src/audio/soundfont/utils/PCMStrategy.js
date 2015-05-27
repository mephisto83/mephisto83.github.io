/**
         * @author Andre Michelle
         * @transformed by Andrew Porter
         */
MEPH.define("MEPH.audio.soundfont.utils.PCMStrategy", {
    requires: [],
    
    properties: {

        _compressionType: null,//Object; 
        _samplingRate: 0,//Number;
        _numChannels: 0,//uint;
        _bits: 0// uint;
    },
    initialize: function (compressionType, samplingRate, numChannels, bits)//: Object  //: Number //: uint //: uint 
    {
        this._compressionType = compressionType;
        this._samplingRate = samplingRate;
        this._numChannels = numChannels;
        this._bits = bits;
    },

    supports: function (info)//: FormatInfo  //: Boolean
    {
        return this._compressionType == info.compressionType &&
                this._samplingRate == info.samplingRate &&
                this._numChannels == info.numChannels &&
                this._bits == info.bits;
    },

    getCompressionType: function ()//: Object
    {
        return this._compressionType;
    },

    getSamplingRate: function ()//: Number
    {
        return this._samplingRate;
    },

    getNumChannels: function ()//: uint
    {
        return this._numChannels;
    },
    getBits: function ()//: uint
    {
        return this._bits;
    },
    getBlockAlign: function ()//: uint
    {
        return (this._numChannels * this._bits) >> 3;
    }
});