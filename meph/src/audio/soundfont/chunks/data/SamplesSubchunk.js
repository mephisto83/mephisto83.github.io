/*The SHDR chunk is a required sub-chunk listing all samples within the smpl sub-chunk and any referenced ROM samples. 
It is always a multiple of forty-six bytes in length, and contains one record for each sample plus a terminal record 
according to the structure:
    struct sfSample 
    {
        CHAR achSampleName[20]; 
        DWORD dwStart; 
        DWORD dwEnd; 
        DWORD dwStartloop; 
        DWORD dwEndloop; 
        DWORD dwSampleRate; 
        BYTE byOriginalPitch; 
        CHAR chPitchCorrection; 
        WORD wSampleLink; 
        SFSampleLink sfSampleType;
    };
*/


MEPH.define("MEPH.audio.soundfont.chunks.data.SamplesSubchunk", {
    requires: ['MEPH.audio.soundfont.utils.SFByteArray'],
    extend: 'MEPH.audio.soundfont.chunks.Subchunk',
    statics: {
        RECORD_SIZE: 46//:int = ;
    },

    initialize: function (source, chunkSize)//:SFByteArray //  :uint
    {
        this.callParent("SamplesSubchunk", source, chunkSize, SamplesSubchunk.RECORD_SIZE);
    },

    getSampleRecord: function (index)//:int  //:SampleRecord
    {
        return this.getRecord(index)// as SampleRecord;
    },

    setBytes: function (value)//:SFByteArray //:void
    {
        for (var i = 0 ; i < this.records.length ; i++)//:SampleRecord
        {
            var record = this.records[i];
            record.bytes = value;
        }
    },

    createRecord: function (bytes)//:SFByteArray // :Object
    {
        var record = new SampleRecord();//:SampleRecord 

        record.id = this.getNumRecords();
        record.name = bytes.readString(20);
        record.start = bytes.readDWord() * 2;
        record.end = bytes.readDWord() * 2;
        record.loopStart = bytes.readDWord() * 2;
        record.loopEnd = bytes.readDWord() * 2;
        record.sampleRate = bytes.readDWord();
        record.originalPitch = bytes.readUnsignedByte();
        record.pitchCorrection = bytes.readByte();
        record.sampleLink = bytes.readWord();
        record.sampleType = bytes.readWord();
        return record;
    }
});
