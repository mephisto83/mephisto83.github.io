/*
    A RIFF file is constructed from a basic building block called a “chunk.”
    Two types of chunks, the “RIFF” and “LIST” chunks, may contain nested chunks called sub-chunks as their data.
*/

MEPH.define("MEPH.audio.soundfont.chunks.Subchunk", {
    requires: ['MEPH.audio.soundfont.utils.SFByteArray'],
    extend: 'MEPH.audio.soundfont.chunks.Chunk',
    statics: {
    },
    properties: {
        records: null,//:Array = ;

        _recordSize: 1,//:int = ;
    },
    initialize: function (type, source, chunkSize, recordSize)//:String //:SFByteArray //:uint  //:int
    {
        this.records = [];
        this._chunkSize = chunkSize;
        this._recordSize = recordSize;
        this.callParent(type, source);
        this.nonSerializedProperties.push("records", "numRecords");
    },
    getNumRecords: function ()//:int
    {
        return this.records.length;
    },
    getRecord: function (index)//:int //:Object
    {
        return (index > -1 && index < this.records.length) ? this.records[index] : null;
    },
    parse: function (value)/// :SFByteArray ///:void
    {
        var numOfRecords = this._chunkSize / this._recordSize - 1;//:int 
        for (var i = 0; i < numOfRecords; ++i)//:int 
        {
            var record = this.createRecord(value);//:Object 
            this.records.push(record);
        }
        // One "terminal" record needs to be read from the ByteArray. By calling createRecord() and ignoring
        // the returned object, we skip over the terminal record.
        this.createRecord(value);
    },
    createRecord: function (bytes)//:SFByteArray //:Object
    {
        // Abstract;
        return null;
    }
});
