/*
    A data structure representing the low and high byte values of a ValueGenerator
*/

MEPH.define("MEPH.audio.soundfont.chunks.data.Range", {
    requires: [],
    extend: 'MEPH.audio.soundfont.SFObject',
    statics: {
    },
    properties: {
        low: 0,//:int;
        high: 0//:int;
    },
    initialize: function (type, low, high)//:String //:int  //:int
    {
        this.callParent(type);

        this.low = low;
        this.high = high;
    }
});