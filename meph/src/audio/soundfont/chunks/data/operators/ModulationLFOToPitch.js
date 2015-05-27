/* This is the degree, in cents, to which a full scale excursion of the Modulation LFO will influence pitch. A positive
 * value indicates a positive LFO excursion increases pitch; a negative value indicates a positive excursion decreases
 * pitch. Pitch is always modified logarithmically, that is the deviation is in cents, semitones, and octaves rather
 * than in Hz. For example, a value of 100 indicates that the pitch will first rise 1 semitone, then fall one semitone.
 */


MEPH.define("MEPH.audio.soundfont.chunks.data.operators.ModulationLFOToPitch", {
    requires: ['MEPH.audio.soundfont.chunks.data.GeneratorsSubchunk'],
    extend: "MEPH.audio.soundfont.chunks.data.operators.ValueOperator",
    statics: {
    },
    initialize: function (amount)//:int = 0
    {
        this.callParent(Operator.MOD_LFO_TO_PITCH, amount || 0);
    }
});
