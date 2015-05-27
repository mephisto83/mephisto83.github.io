/* This is a pitch offset, in semitones, which should be applied to the note. A positive value indicates the sound is
 * reproduced at a higher pitch; a negative value indicates a lower pitch. For example, a Coarse Tune value of -4 would
 * cause the sound to be reproduced four semitones flat. */


MEPH.define("MEPH.audio.soundfont.chunks.data.operators.CoarseTune", {
    requires: ['MEPH.audio.soundfont.chunks.data.GeneratorsSubchunk'],
    extend: "MEPH.audio.soundfont.chunks.data.operators.ValueOperator",
    statics: {
    },
    initialize: function (amount)//:int = 0
    {
        this.callParent(Operator.COARSE_TUNE, amount || 0);
    }
});
