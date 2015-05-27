/* The offset, in sample data points, beyond the Startloop sample header parameter to the first sample data point to be
 * repeated in the loop for this instrument. For example, if Startloop were 10 and startloopAddrsOffset were -1, the
 * first repeated loop sample data point would be sample data point 9. */

MEPH.define("MEPH.audio.soundfont.chunks.data.operators.StartLoopAddressOffset", {
    requires: ['MEPH.audio.soundfont.chunks.data.GeneratorsSubchunk'],
    extend: 'MEPH.audio.soundfont.chunks.data.operators.SampleOperator',
    statics: {
    },
    initialize: function (amount)//:int = 0
    {
        this.callParent(Operator.START_LOOP_ADDRS_OFFSET, amount || 0);
    }
});
