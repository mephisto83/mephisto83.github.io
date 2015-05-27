/* This is the degree, in timecents per KeyNumber units, to which the hold time of the Volume Envelope is decreased by
 * increasing MIDI key number. The hold time at key number 60 is always unchanged. The unit scaling is such that a
 * value of 100 provides a hold time that tracks the keyboard; that is, an upward octave causes the hold time to halve.
 * For example, if the Volume Envelope Hold Time were -7973 = 10 msec and the Key Number to Vol Env Hold were 50 when
 * key number 36 was played, the hold time would be 20 msec. */


MEPH.define("MEPH.audio.soundfont.chunks.data.operators.KeyNumToVolumeEnvelopeDecay", {
    requires: ['MEPH.audio.soundfont.chunks.data.GeneratorsSubchunk'],
    extend: "MEPH.audio.soundfont.chunks.data.operators.ValueOperator",
    statics: {
    },
    initialize: function (amount)//:int = 0
    {
        this.callParent(Operator.KEYNUM_TO_RecordL_ENV_DECAY, amount || 0);
    }
});
