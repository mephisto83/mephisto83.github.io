
MEPH.define("MEPH.audio.soundfont.chunks.data.ModulatorsSubchunk", {
    requires: ['MEPH.audio.soundfont.utils.SFByteArray',
                'MEPH.audio.soundfont.chunks.data.ModulatorRecord'],
    extend: 'MEPH.audio.soundfont.chunks.Subchunk',
    statics: {
        RECORD_SIZE: 10
    },

    initialize: function (source, chunkSize)//:SFByteArray   /:uint
    {
        this.callParent("ModulatorsSubchunk", source, chunkSize, ModulatorsSubchunk.RECORD_SIZE);
    },
    createRecord: function (bytes)//:SFByteArray //:Object
    {
        var record = new ModulatorRecord();//:ModulatorRecord 
        record.sourceOperator = bytes.readWord();
        record.destinationOperator = bytes.readWord();
        record.amountOperator = bytes.readShort();
        record.amountSourceOperator = bytes.readWord();
        record.transformOperator = bytes.readWord();
        return record;
    }
});
