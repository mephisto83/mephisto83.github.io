/* The offset, in sample data points, beyond the Start sample header parameter to the first sample data point to be
 * played for this instrument. For example, if Start were 7 and startAddrOffset were 2, the first sample data point
 * played would be sample data point 9.
 *
 * Unit: samples
 * Abs Zero: 0
 * Min: 0
 * Min Useful: None
 * Max: Depends on values of start, loop, & end points in sample header
 * Max Useful: Depends on values of start, loop, & end points in sample header
 * Default: 0 (None)
 */

MEPH.define("MEPH.audio.soundfont.chunks.data.operators.StartAddressOffset", {
    requires: ['MEPH.audio.soundfont.chunks.data.GeneratorsSubchunk'],
    extend: 'MEPH.audio.soundfont.chunks.data.operators.SampleOperator',
    statics: {
    },
    initialize: function (amount)//:int = 0
    {
        this.callParent(Operator.START_ADDRS_OFFSET, amount || 0);
    }
});
