/* This is the cutoff and resonant frequency of the lowpass filter in absolute cent units. The lowpass filter
* is defined as a second order resonant pole pair whose pole frequency in Hz is defined by the Initial Filter
* Cutoff parameter. When the cutoff frequency exceeds 20kHz and the Q (resonance) of the filter is zero, the
* filter does not affect the signal. */

MEPH.define("MEPH.audio.soundfont.chunks.data.operators.InitialFilterFC", {
    requires: ['MEPH.audio.soundfont.chunks.data.GeneratorsSubchunk'],
    extend: "MEPH.audio.soundfont.chunks.data.operators.ValueOperator",
    statics: {
    },
    initialize: function (amount)//:int = 13500
    {
        if (amount == undefined || amount == null) {
            amount = 13500;
        }
        this.callParent(Operator.INITIAL_FILTER_FC, amount);
    }
});
