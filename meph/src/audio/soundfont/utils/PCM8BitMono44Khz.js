/**
     * @author Andre Michelle
     * @transformed by Andrew Porter
     */
MEPH.define("MEPH.audio.soundfont.utils.PCM8BitMono44Khz", {
    requires: ['MEPH.audio.soundfont.NoteSample'],
    extend: "MEPH.audio.soundfont.utils.PCMStrategy",

    statics: {},
    properties: {

        //import tonfall.core.Signal;
        _signed: false,// Boolean;

    },
    initialize: function (signed, compressionType)//: Boolean //: Object = null 
    {
        compressionType = compressionType || null;
        this.callParent(compressionType, 44100.0, 1, 8);
        this._signed = signed || false;
    },

    readFrameInSignal: function (data, dataOffset, signal, position) //: ByteArray : Number //: Signal //: Number  //: void
    {
        data.position = dataOffset + position;
        signal.l =
        signal.r = data.readByte() / 0x7F;
    },

    read32BitStereo44KHz: function (data, dataOffset, target, length, startPosition)//: ByteArray   //: Number //: ByteArray   //: Number  //: Number : void
    {
        data.position = dataOffset + startPosition;

        var amplitude;//: Number;

        var i; //int;

        if (this._signed) {
            for (i = 0 ; i < length ; ++i) {
                amplitude = data.readByte() / 0x7F;

                target.writeFloat(amplitude);
                target.writeFloat(amplitude);
            }
        }
        else {
            for (i = 0 ; i < length ; ++i) {
                amplitude = (data.readUnsignedByte() - 0x7F) / 0x7F;

                target.writeFloat(amplitude);
                target.writeFloat(amplitude);
            }
        }
    },

    write32BitStereo44KHz: function (data, target, numSamples) //: ByteArray  //: ByteArray  //: uint : void
    {
        var amplitude;//: Number;

        var i;//: int;

        if (this._signed) {
            for (i = 0 ; i < numSamples ; ++i) {
                amplitude = (data.readFloat() + data.readFloat()) * 0.5;

                if (amplitude > 1.0)
                    target.writeByte(0x7F);
                else
                    if (amplitude < -1.0)
                        target.writeByte(-0x7F);
                    else
                        target.writeByte(amplitude * 0x7F);
            }
        }
        else {
            for (i = 0 ; i < numSamples ; ++i) {
                amplitude = (data.readFloat() + data.readFloat()) * 0.5;

                if (amplitude > 1.0)
                    target.writeByte(0xFF);
                else
                    if (amplitude < -1.0)
                        target.writeByte(0x00);
                    else
                        target.writeByte(amplitude * 0x7F + 0x7F);
            }
        }
    }
});