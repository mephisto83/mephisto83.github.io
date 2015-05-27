/* This is the height above DC gain in centibels which the filter resonance exhibits at the cutoff frequency. A
* value of zero or less indicates the filter is not resonant; the gain at the cutoff frequency (pole angle)
* may be less than zero when zero is specified. The filter gain at DC is also affected by this parameter such
* that the gain at DC is reduced by half the specified gain. For example, for a value of 100, the filter gain
* at DC would be 5 dB below unity gain, and the height of the resonant peak would be 10 dB above the DC gain,
* or 5 dB above unity gain. Note also that if initialFilterQ is set to zero or less and the cutoff frequency
* exceeds 20 kHz, then the filter response is flat and unity gain. */


MEPH.define("MEPH.audio.soundfont.chunks.data.operators.InitialFilterQ", {
    requires: ['MEPH.audio.soundfont.chunks.data.GeneratorsSubchunk'],
    extend: "MEPH.audio.soundfont.chunks.data.operators.ValueOperator",
    statics: {
    },
    initialize: function (amount)//:int = 0
    {
        this.callParent(Operator.INITIAL_FILTER_Q, amount || 0);
    }
});
