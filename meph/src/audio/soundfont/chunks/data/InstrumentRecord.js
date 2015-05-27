
/*
    struct sfInst
    {
        CHAR achInstName[20];
        WORD wInstBagNdx;
    };
    */

MEPH.define("MEPH.audio.soundfont.chunks.data.InstrumentRecord", {
    requires: [],
    extend: 'MEPH.audio.soundfont.chunks.data.ZoneRecord',
    statics: {
    },
    initialize: function () {
        this.callParent("InstrumentRecord");
    }
});
