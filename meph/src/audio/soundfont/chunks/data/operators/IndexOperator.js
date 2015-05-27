/* An Index Generator’s amount is an index into another data structure. The only two Index Generators are Instrument
 * and sampleID. */



MEPH.define("MEPH.audio.soundfont.chunks.data.operators.IndexOperator", {
    extend: "MEPH.audio.soundfont.chunks.data.operators.Operator",
    requires: [],
    statics: {
    },
    initialize: function (type, amount)//:int  //:int = 0
    {
        this.callParent(type, amount || 0);
    }
});
