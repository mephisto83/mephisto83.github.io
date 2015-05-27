/* The offset, in 32768 sample data point increments beyond the Startloop sample header parameter and the first sample
 * data point to be repeated in this instrument’s loop. This parameter is added to the startloopAddrsOffset parameter.
 * For example, if Startloop were 5, startloopAddrsOffset were 3 and startAddrsCoarseOffset were 2, the first sample
 * data point in the loop would be sample data point 65544. */


MEPH.define("MEPH.audio.soundfont.chunks.data.operators.StartLoopAddressCoarseOffset", {
    extend: 'MEPH.audio.soundfont.chunks.data.operators.SampleOperator',
    requires: ['MEPH.audio.soundfont.chunks.data.GeneratorsSubchunk'],
    statics: {
    },
    initialize: function (amount)//:int = 0
    {
        this.callParent(Operator.START_LOOP_ADDRS_COARSE_OFFSET, amount || 0);
    }
});
