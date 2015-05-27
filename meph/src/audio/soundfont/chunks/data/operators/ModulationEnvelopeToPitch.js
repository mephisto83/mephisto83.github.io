/* This is the degree, in cents, to which a full scale excursion of the Modulation Envelope will influence pitch. A
 * positive value indicates an increase in pitch; a negative value indicates a decrease in pitch. Pitch is always
 * modified logarithmically, that is the deviation is in cents, semitones, and octaves rather than in Hz. For example,
 * a value of 100 indicates that the pitch will rise 1 semitone at the envelope peak. */


MEPH.define("MEPH.audio.soundfont.chunks.data.operators.ModulationEnvelopeToPitch", {
    requires: ['MEPH.audio.soundfont.chunks.data.GeneratorsSubchunk'],
    extend: "MEPH.audio.soundfont.chunks.data.operators.ValueOperator",
    statics: {
    },
    initialize: function (amount)//:int = 0
    {
        this.callParent(Operator.MOD_ENV_TO_PITCH, amount || 0);
    }
});
