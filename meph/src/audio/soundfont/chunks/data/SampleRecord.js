
/*
struct sfSample
{
    CHAR achSampleName[20];
    DWORD dwStart;
    DWORD dwEnd;
    DWORD dwStartloop;
    DWORD dwEndloop;
    DWORD dwSampleRate;
    BYTE byOriginalKey;
    CHAR chPitchCorrection;
    WORD wSampleLink;
    SFSampleLink sfSampleType;
};
*/
MEPH.define("MEPH.audio.soundfont.chunks.data.SampleRecord", {
    requires: ['MEPH.audio.soundfont.utils.SFByteArray'],
    extend: 'MEPH.audio.soundfont.SFObject',
    statics: {


        MONO: 0x1,//:int = ;
        RIGHT: 0x2,//:int = ;
        LEFT: 0x4,//:int = ;
        ROM_MONO: 0x8001,//:int = ;
        ROM_RIGHT: 0x8002,//:int = ;
        ROM_LEFT: 0x8004,//:int = ;
        // Unsupported types:
        LINKED: 0x8,//:int = ;
        ROM_LINKED: 0x8008,//:int = ;
    },
    properties: {
        id: 0,//:int;
        name: "",//String;
        start: 0,//uint;
        end: 0,//uint;
        loopStart: 0,//uint;
        loopEnd: 0,//uint;
        sampleRate: 0,//uint;
        originalPitch: 0,//int;
        pitchCorrection: 0,//int;
        sampleLink: 0,//int;
        bytes: null,//SFByteArray;

        _sampleType: 0,//int;
    },
    initialize: function () {
        this.callParent("SampleRecord");
        this.nonSerializedProperties.push("sampleData", "bytes");
    },
    getSampleType: function ()//:int
    {
        return this._sampleType;
    },
    setSampleType: function (value)//:void
    {
        if (value == SampleRecord.LINKED || value == SampleRecord.ROM_LINKED) {
            this.raiseError("Unsupported SampleType: " + value);
        }
        this._sampleType = value;
    },
    getNumChannels: function ()//:int
    {
        return (this.sampleType == SampleRecord.MONO || this.sampleType == SampleRecord.ROM_MONO) ? 1 : 2;
    },
    getSampleData: function ()//:ByteArray
    {
        var data = new ByteArray(this.end - this.start);//:ByteArray 
        data.endian = Endian.LITTLE_ENDIAN;
        data.writeBytes(this.bytes, this.start, this.end - this.start);
        data.position = 0;
        return data;
    }
});
