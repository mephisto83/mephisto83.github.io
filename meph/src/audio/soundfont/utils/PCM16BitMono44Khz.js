/**
     * @author Andre Michelle
     * @transformed by Andrew Porter
     */
MEPH.define("MEPH.audio.soundfont.utils.PCM16BitMono44Khz", {
    requires: ['MEPH.audio.soundfont.NoteSample'],
    extend: "MEPH.audio.soundfont.utils.PCMStrategy",
    properties: {
    },
    statics: {},
    initialize: function (compressionType, samplerate)//: Object = null 
    {
        if (!compressionType) {
            compressionType = null;
        }
        this.callParent(compressionType, samplerate || 44100.0, 1, 16);
    },
    read32BitStereo44KHz: function (data, dataOffset, target, length, startPosition) //: ByteArray //: Number //: ByteArray //: Number //: Number //: void
    {
        data.position = dataOffset + (startPosition << 1);

        for (var i = 0 ; i < length ; ++i) {
            var amplitude = data.readShort() * 3.051850947600e-05; // DIV 0x7FFF
            target.writeFloat(amplitude);
            target.writeFloat(amplitude);
        }
    },
    stream32BitStereo44KHz: function (data, dataOffset, target, sample, startPosition) //: ByteArray //: Number //: Array[Float32Array] //: Number //: Number //: void
    {
        // data.position = dataOffset + (startPosition << 1);
        // var amplitude = data.readShort() * 3.051850947600e-05; // DIV 0x7FFF
        // target[sample] = Math.random() - .5;
        // target[sample] = amplitude;
    },
    write32BitStereo44KHz: function (data, target, numSamples)//: ByteArray  //: ByteArray  //: uint   : void
    {
        for (var i = 0 ; i < numSamples ; ++i) {
            var amplitude = (data.readFloat() + data.readFloat()) * 0.5;

            if (amplitude > 1.0) {
                target.writeShort(0x7FFF);
            }
            else {
                if (amplitude < -1.0) {
                    target.writeShort(-0x7FFF);
                }
                else {
                    target.writeShort(amplitude * 0x7FFF);
                }
            }
        }
    }
});