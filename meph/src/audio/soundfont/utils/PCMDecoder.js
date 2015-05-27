
/**
 * @author Andre Michelle
 */
MEPH.define("MEPH.audio.soundfont.utils.PCMDecoder", {
    requires: ['MEPH.audio.soundfont.NoteSample',
                'MEPH.audio.soundfont.utils.SFByteArray',
                //"MEPH.audio.soundfont.utils.PCMDecoder",
                "MEPH.audio.soundfont.utils.PCM16BitMono44Khz"],
    extend: "MEPH.audio.soundfont.SFObject",
    properties: {
        _bytes: null,//ByteArray;
        _strategy: null, //IPCMIOStrategy;
    },
    initialize: function (bytes, strategy)//: ByteArray  //: IPCMIOStrategy 
    {
        if (null == bytes)
            throw new Error('bytes must not be null');
        this._bytes = bytes;
        this._strategy = strategy;
    },

    getSeconds: function () {
        return this.getNumSamples() / this._strategy.samplingRate;
    },

    /**
     * @return number of samples converted to target samplingRate (In Flash only 44100Hz)
     */
    getNumSamples: function (targetRate)//: Number = 44100.0  // : Number
    {
        targetRate = targetRate || 44100.0;

        if (this._strategy.samplingRate == targetRate) {
            return this.getNumSamples();
        }
        else {
            return Math.floor(this.getNumSamples() * targetRate / this._strategy.samplingRate);
        }
    },

    /**
     * Decodes audio from format into Flashplayer sound properties (stereo,float,44100Hz)
     * 
     * @return The number of samples has been read
     */
    extract: function (target, length, startPosition)//:ByteArray  //:Number  //:Number = -1.0  //: Number
    {
        if (startPosition >= this.getNumSamples())
            return 0.0;
        if (startPosition + length > this.getNumSamples()) {
            length = this.getNumSamples() - startPosition;
        }

        this._strategy.read32BitStereo44KHz(this._bytes, this.getDataOffset(), target, length, startPosition);

        return length;
    },

    /**
     * Decodes audio from format into Float32Array sound properties (stereo,float,44100Hz)
     * 
     * @return The number of samples has been read
     */
    stream: function (target, pos, startPosition)//:Array[Float32Array]  //:Number  //:Number = -1.0  //: Number
    {
        //var length;
        //if (startPosition >= this.getNumSamples())
        //    return 0.0;
        //if (startPosition  > this.getNumSamples()) {
        //    length = this.getNumSamples() - startPosition;
        //}

        //this._strategy.stream32BitStereo44KHz(this._bytes, this.getDataOffset(), target, pos, startPosition);

        //return length;
    },

    getSupported: function ()//: Boolean
    {
        return null != this._strategy;
    },

    getCompressionType: function ()//: *
    {
        return this._strategy.getCompressionType();
    },

    getNumSamples: function ()//: Number
    {
        if (this._bytes instanceof SFByteArray) {
            return this._bytes._source.byteLength / this._strategy.getBlockAlign();
        }
        return this._bytes.length / this._strategy.getBlockAlign();
    },

    getSamplingRate: function ()//: Number
    {
        return this._strategy.getSamplingRate();
    },

    getNumChannels: function ()//: int
    {
        return this._strategy.getNumChannels();
    },

    getBits: function ()//: int
    {
        return this._strategy.getBits();
    },

    getBlockAlign: function ()//: int
    {
        return this._strategy.getBlockAlign();
    },

    getDataOffset: function ()// : Number
    {
        return 0;
    },

    getBytes: function () //: ByteArray
    {
        return this._bytes;
    },
    dispose: function () //: void
    {
        this._bytes = null;
    },

    toString: function ()//: String
    {
        return '[Decoder strategy: ' + this._strategy + ', numSamples: ' + this.getNumSamples() + ']';
    }
});