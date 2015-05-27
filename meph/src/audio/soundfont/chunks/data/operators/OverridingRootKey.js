/* This parameter represents the MIDI key number at which the sample is to be played back at its original
* sample rate. If not present, or if present with a value of -1, then the sample header parameter Original Key
* is used in its place. If it is present in the range 0-127, then the indicated key number will cause the
* sample to be played back at its sample header Sample Rate. For example, if the sample were a recording of a
* piano middle C (Original Key = 60) at a sample rate of 22.050 kHz, and Root Key were set to 69, then playing
* MIDI key number 69 (A above middle C) would cause a piano note of pitch middle C to be heard. */

MEPH.define("MEPH.audio.soundfont.chunks.data.operators.OverridingRootKey", {
    requires: ['MEPH.audio.soundfont.chunks.data.GeneratorsSubchunk'],
    extend: "MEPH.audio.soundfont.chunks.data.operators.SampleOperator",
    statics: {
    },
    initialize: function (amount)//:int = -1
    {
        if (amount == null || amount == undefined) {
            amount = -1;
        }
        this.callParent(Operator.OVERRIDING_ROOT_KEY, amount);
    }
});
