/* The offset, in 32768 sample data point increments beyond the End sample header parameter and the last sample
* data point to be played in this instrument. This parameter is added to the endAddrsOffset parameter. For
* example, if End were 65536, startAddrsOffset were -3 and startAddrsCoarseOffset were -1, the last sample
* data point played would be sample data point 32765. */


MEPH.define("MEPH.audio.soundfont.chunks.data.operators.EndAddressCoarseOffset", {
    requires: ['MEPH.audio.soundfont.chunks.data.GeneratorsSubchunk'],
    extend: "MEPH.audio.soundfont.chunks.data.operators.SampleOperator",
    statics: {
    },
    initialize: function (amount)//:int = 0 
    {
        this.callParent(Operator.END_ADDRS_COARSE_OFFSET, amount || 0);
    }
});
