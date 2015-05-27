/* The offset, in 32768 sample data point increments beyond the Start sample header parameter and the first sample data
 * point to be played in this instrument. This parameter is added to the startAddrsOffset parameter. For example, if
 * Start were 5, startAddrsOffset were 3 and startAddrsCoarseOffset were 2, the first sample data point played would be
 * sample data point 65544. */


MEPH.define("MEPH.audio.soundfont.chunks.data.operators.StartAddressCoarseOffset", {
    requires: ['MEPH.audio.soundfont.chunks.data.GeneratorsSubchunk'],
    extend: 'MEPH.audio.soundfont.chunks.data.operators.SampleOperator',
    statics: {},

    initialize: function (amount)//:int = 0
    {
        this.callParent(Operator.START_ADDRS_COARSE_OFFSET, amount || 0);
    }
});
