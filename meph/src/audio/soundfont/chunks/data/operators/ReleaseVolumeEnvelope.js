/* This is the time, in absolute timecents, for a 100% change in the Volume Envelope value during release phase. For
 * the Volume Envelope, the release phase linearly ramps toward zero from the current level, causing a constant dB
 * change for each time unit. If the current level were full scale, the Volume Envelope Release Time would be the time
 * spent in release phase until 100dB attenuation were reached. A value of 0 indicates a 1-second decay time for a
 * release from full level. A negative value indicates a time less than one second; a positive value a time longer than
 * one second. For example, a release time of 10 msec would be 1200log2(.01) = -7973. */

MEPH.define("MEPH.audio.soundfont.chunks.data.operators.ReleaseVolumeEnvelope", {
    requires: ["MEPH.audio.soundfont.chunks.data.GeneratorsSubchunk"],
    extend: "MEPH.audio.soundfont.chunks.data.operators.ValueOperator",
    statics: {
    },
    initialize: function (amount)//:int = -12000
    {
        if (amount == null || amount == undefined) {
            amount = -12000;
        }
        this.callParent(Operator.RELEASE_RecordL_ENV, amount);
    }
});
