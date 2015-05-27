/* This is the attenuation, in centibels, by which a note is attenuated below full scale. A value of zero indicates no
 * attenuation; the note will be played at full scale. For example, a value of 60 indicates the note will be played at
 * 6 dB below full scale for the note. */



MEPH.define("MEPH.audio.soundfont.chunks.data.operators.InitialAttenuation", {
    requires: ['MEPH.audio.soundfont.chunks.data.GeneratorsSubchunk'],
    extend: "MEPH.audio.soundfont.chunks.data.operators.ValueOperator",
    statics: {
    },
    initialize: function (amount)//:int = 0
    {
        this.callParent(Operator.INITIAL_ATTENUATION, amount || 0);
    }
});
