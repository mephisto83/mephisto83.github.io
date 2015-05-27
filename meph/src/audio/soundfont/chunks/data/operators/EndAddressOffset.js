/* The offset, in sample sample data points, beyond the End sample header parameter to the last sample data point to be
 * played for this instrument. For example, if End were 17 and endAddrOffset were -2, the last sample data point played
 * would be sample data point 15.
 *
 * Unit: samples
 * Abs Zero: 0
 * Min: Depends on values of start, loop, & end points in sample header
 * Min Useful: Depends on values of start, loop, & end points in sample header
 * Max: 0
 * Max Useful: None
 * Default: 0 (None)
 */


MEPH.define("MEPH.audio.soundfont.chunks.data.operators.EndAddressOffset", {
    requires: ['MEPH.audio.soundfont.chunks.data.GeneratorsSubchunk'],
    extend: "MEPH.audio.soundfont.chunks.data.operators.SampleOperator",
    statics: {
    },
    initialize: function (amount)//:int = 0 
    {
        this.callParent(Operator.END_ADDRS_OFFSET, amount || 0);
    }
});
