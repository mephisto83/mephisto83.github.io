/* This is the delay time, in absolute timecents, between key on and the start of the attack phase of the Modulation
 * envelope. A value of 0 indicates a 1 second delay. A negative value indicates a delay less than one second; a
 * positive value a delay longer than one second. The most negative number (-32768) conventionally indicates no delay.
 * For example, a delay of 10 msec would be 1200log2(.01) = -7973. */


MEPH.define("MEPH.audio.soundfont.chunks.data.operators.DelayModulationEnvelope", {
    requires: ['MEPH.audio.soundfont.chunks.data.GeneratorsSubchunk'],
    extend: "MEPH.audio.soundfont.chunks.data.operators.ValueOperator",
    statics: {
    },
    initialize: function (amount)//:int = -12000
    {
        if (amount == undefined || amount == null) {
            amount = -12000;
        }
        this.callParent(Operator.DELAY_MOD_ENV, amount);
    }
});
