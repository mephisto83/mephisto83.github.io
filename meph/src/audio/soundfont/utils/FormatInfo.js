
/**
 * @author Andre Michelle
 * @transformed by Andrew Porter
 */
MEPH.define("MEPH.audio.soundfont.utils.FormatInfo", {
    requires: [],
    
    properties: {
        _compressionType: null,//: Object;
        _samplingRate: 0,// Number;
        _numChannels: 0,// uint;
        _bits: 0,// uint;
        _numSamples: 0,//Number;
        _dataOffset: 0,// Number;
        _blockAlign: 0//uint;
    },
    initialize: function (compressionType, samplingRate, numChannels, bits, numSamples, dataOffset)//: Object  //: Number    ///: uint   //: uint     //: Number   //: Number = 0.0 
    {
        this._compressionType = compressionType;
        this._samplingRate = samplingRate;
        this._numChannels = numChannels;
        this._bits = bits;
        this._numSamples = numSamples;
        this._dataOffset = dataOffset || 0.0;
        this._blockAlign = (bits * numChannels) >> 3;
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

    getNumSamples: function ()//: Number
    {
        return this._numSamples;
    },

    getDataOffset: function ()//: Number
    {
        return this._dataOffset;
    },

    getDataLength: function ()//: Number
    {
        return this._numSamples * this._blockAlign;
    },

    getBlockAlign: function ()//: uint
    {
        return this._blockAlign;
    },

    toString: function ()//: String
    {
        return '[AudioFormatHeader compressionType: ' + this._compressionType +
                                                                ', samplingRate: ' + this._samplingRate +
                                                                ', numChannels: ' + this._numChannels +
                                                                ', bits: ' + this._bits +
                                                                ', blockAlign: ' + this._blockAlign +
                                                                ', numSamples: ' + this._numSamples +
                                                                ', dataOffset: ' + this._dataOffset + ']';
    }
});