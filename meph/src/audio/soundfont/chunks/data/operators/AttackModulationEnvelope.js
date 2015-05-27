/* This is the time, in absolute timecents, from the end of the Modulation Envelope Delay Time until the point at which
 * the Modulation Envelope value reaches its peak. Note that the attack is “convex”; the curve is nominally such that
 * when applied to a decibel or semitone parameter, the result is linear in amplitude or Hz respectively. A value of 0
 * indicates a 1 second attack time. A negative value indicates a time less than one second; a positive value a time
 * longer than one second. The most negative number (-32768) conventionally indicates instantaneous attack. For
 * example, an attack time of 10 msec would be 1200log2(.01) = -7973. */



MEPH.define("MEPH.audio.soundfont.chunks.data.operators.AttackModulationEnvelope", {
    requires: ['MEPH.audio.soundfont.chunks.data.GeneratorsSubchunk'],
    extend: 'MEPH.audio.soundfont.chunks.data.operators.ValueOperator',
    statics: {
    },
    initialize: function (amount)//:int = -12000
    {
        if (amount == undefined) {
            amount = -12000;
        }
        this.callParent(Operator.ATTACK_MOD_ENV, amount);
    }
});
