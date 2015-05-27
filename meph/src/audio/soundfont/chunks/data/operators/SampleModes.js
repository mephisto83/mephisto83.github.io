/* This enumerator indicates a value which gives a variety of Boolean flags describing the sample for the current
 * instrument zone. The sampleModes should only appear in the IGEN sub-chunk, and should not appear in the global zone.
 * The two LS bits of the value indicate the type of loop in the sample: 0 indicates a sound reproduced with no loop, 1
 * indicates a sound which loops continuously, 2 is unused but should be interpreted as indicating no loop, and 3
 * indicates a sound which loops for the duration of key depression then proceeds to play the remainder of the sample.
 */


MEPH.define("MEPH.audio.soundfont.chunks.data.operators.SampleModes", {
    requires: ['MEPH.audio.soundfont.chunks.data.GeneratorsSubchunk'],
    extend: 'MEPH.audio.soundfont.chunks.data.operators.SampleOperator',
    statics: {
    },
    initialize: function (amount)//:int = 0
    {
        this.callParent(Operator.SAMPLE_MODES, amount || 0);
    }
});
