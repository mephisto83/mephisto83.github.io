/* The offset, in sample data points, beyond the Endloop sample header parameter to the sample data point
* considered equivalent to the Startloop sample data point for the loop for this instrument. For example, if
* Endloop were 15 and endloopAddrsOffset were 2, sample data point 17 would be considered equivalent to the
* Startloop sample data point, and hence sample data point 16 would effectively precede Startloop during
* looping. */



MEPH.define("MEPH.audio.soundfont.chunks.data.operators.EndLoopAddressOffset", {
    requires: ['MEPH.audio.soundfont.chunks.data.GeneratorsSubchunk'],
    extend: "MEPH.audio.soundfont.chunks.data.operators.ValueOperator",
    statics: {
    },
    initialize: function (amount)//:int = 0
    {
        this.callParent(Operator.END_LOOP_ADDRS_OFFSET, amount || 0);
    }
});
