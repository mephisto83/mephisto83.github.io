/* This is the frequency, in absolute cents, of the Vibrato LFO’s triangular period. A value of zero indicates
* a frequency of 8.176 Hz. A negative value indicates a frequency less than 8.176 Hz; a positive value a
* frequency greater than 8.176 Hz. For example, a frequency of 10 mHz would be 1200log2(.01/8.176) = -11610. */


MEPH.define("MEPH.audio.soundfont.chunks.data.operators.FrequencyVibratoLFO", {
    requires: [ 'MEPH.audio.soundfont.chunks.data.GeneratorsSubchunk',
                'MEPH.audio.soundfont.chunks.data.operators.Operator'],
    extend: "MEPH.audio.soundfont.chunks.data.operators.ValueOperator",
    statics: {
    },
    initialize: function (amount)//:int = 0
    {
        this.callParent(Operator.FREQ_VIB_LFO, amount || 0);
    }
});
