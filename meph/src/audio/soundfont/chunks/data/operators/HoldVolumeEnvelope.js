/* This is the time, in absolute timecents, from the end of the attack phase to the entry into decay phase, during
 * which the Volume envelope value is held at its peak. A value of 0 indicates a 1 second hold time. A negative value
 * indicates a time less than one second; a positive value a time longer than one second. The most negative number
 * (-32768) conventionally indicates no hold phase. For example, a hold time of 10 msec would be 1200log2(.01) = -7973.
 */

MEPH.define("MEPH.audio.soundfont.chunks.data.operators.HoldVolumeEnvelope", {
    requires: ['MEPH.audio.soundfont.chunks.data.GeneratorsSubchunk'],
    extend: "MEPH.audio.soundfont.chunks.data.operators.ValueOperator",
    statics: {
    },
    initialize: function (amount)//:int = -12000
    {
        if (amount == undefined || amount == null) {
            amount = -12000;
        }
        this.callParent(Operator.HOLD_RecordL_ENV, amount);
    }
});
