/*
    The inst sub-chunk is a required sub-chunk listing all instruments within the SoundFont compatible file. It is
    always a multiple of twenty-two bytes in length, and contains a minimum of two records, one record for each
    instrument and one for a terminal record according to the structure:
        struct sfInst
        {
            CHAR achInstName[20];
            WORD wInstBagNdx;
        };
    The ASCII character field achInstName contains the name of the instrument expressed in ASCII, with unused
    terminal characters filled with zero valued bytes. Instrument names are case-sensitive. A unique name should
    always be assigned to each instrument in the SoundFont compatible bank to enable identification. However, if
    a bank is read containing the erroneous state of instruments with identical names, the instruments should not
    be discarded. They should either be preserved as read or preferably uniquely renamed.
*/



MEPH.define("MEPH.audio.soundfont.chunks.data.InstrumentsSubchunk", {
    requires: ['MEPH.audio.soundfont.utils.SFByteArray',
                'MEPH.audio.soundfont.chunks.data.InstrumentRecord'],
    extend: 'MEPH.audio.soundfont.chunks.data.ZonesSubchunk',
    statics: {
        END_OF_INSTRUMENTS_TAG: "EOI",//:String = ;
        RECORD_SIZE: 22//:int = ;
    },
    initialize: function (source, chunkSize)//:SFByteArray    //:uint
    {
        this.callParent("InstrumentsSubchunk", source, chunkSize, InstrumentsSubchunk.RECORD_SIZE);
    },

    createRecord: function (bytes)//:SFByteArray //:Object
    {
        var record = new InstrumentRecord();//:InstrumentRecord 
        record.id = this.records.length;
        record.name = bytes.readString(20);
        record.index = bytes.readWord();
        return record;
    }
});
