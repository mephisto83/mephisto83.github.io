/* This is a pitch offset, in cents, which should be applied to the note. It is additive with coarseTune. A
* positive value indicates the sound is reproduced at a higher pitch; a negative value indicates a lower
* pitch. For example, a Fine Tuning value of -5 would cause the sound to be reproduced five cents flat. */


MEPH.define("MEPH.audio.soundfont.chunks.data.operators.FineTune", {
    requires: ['MEPH.audio.soundfont.chunks.data.GeneratorsSubchunk'],
    extend: "MEPH.audio.soundfont.chunks.data.operators.ValueOperator",
    statics: {
    },
    initialize: function (amount)//:int = 0 
    {
        this.callParent(Operator.FINE_TUNE, amount || 0);
    }
});
