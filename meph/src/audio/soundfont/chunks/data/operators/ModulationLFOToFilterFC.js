/* This is the degree, in cents, to which a full scale excursion of the Modulation LFO will influence filter
* cutoff frequency. A positive number indicates a positive LFO excursion increases cutoff frequency; a
* negative number indicates a positive excursion decreases cutoff frequency. Filter cutoff frequency is always
* modified logarithmically, that is the deviation is in cents, semitones, and octaves rather than in Hz. For
* example, a value of 1200 indicates that the cutoff frequency will first rise 1 octave, then fall one octave.
*/


MEPH.define("MEPH.audio.soundfont.chunks.data.operators.ModulationLFOToFilterFC", {
    requires: ['MEPH.audio.soundfont.chunks.data.GeneratorsSubchunk'],
    extend: "MEPH.audio.soundfont.chunks.data.operators.ValueOperator",
    statics: {
    },
    initialize: function (amount)//:int = 0
    {
        this.callParent(Operator.MOD_LFO_TO_FILTER_FC, amount || 0);
    }
});
