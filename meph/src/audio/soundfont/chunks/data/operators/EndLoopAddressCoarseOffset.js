/* The offset, in 32768 sample data point increments beyond the Endloop sample header parameter to the sample data
 * point considered equivalent to the Startloop sample data point for the loop for this instrument. This parameter is
 * added to the endloopAddrsOffset parameter. For example, if Endloop were 5, endloopAddrsOffset were 3 and
 * endAddrsCoarseOffset were 2, sample data point 65544 would be considered equivalent to the Startloop sample data
 * point, and hence sample data point 65543 would effectively precede Startloop during looping. */


MEPH.define("MEPH.audio.soundfont.chunks.data.operators.EndLoopAddressCoarseOffset", {
    requires: ['MEPH.audio.soundfont.chunks.data.GeneratorsSubchunk',
                'MEPH.audio.soundfont.chunks.data.operators.Operator'],
    extend: 'MEPH.audio.soundfont.chunks.data.operators.SampleOperator',
    statics: {
    },
    properties: {},
    constructor: function (amount)//:int = 0
    {
        this.callParent(Operator.END_LOOP_ADDRS_COARSE_OFFSET, amount);
    }
});
