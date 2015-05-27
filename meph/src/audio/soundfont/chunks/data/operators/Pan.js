/* This is the degree, in 0.1% units, to which the “dry” audio output of the note is positioned to the left or
* right output. A value of -50% or less indicates the signal is sent entirely to the left output and not sent
* to the right output; a value of +50% or more indicates the note is sent entirely to the right and not sent
* to the left. A value of zero places the signal centered between left and right. For example, a value of -250
* indicates that the signal is sent at 75% of full level to the left output and 25% of full level to the right
* output. */


MEPH.define("MEPH.audio.soundfont.chunks.data.operators.Pan", {
    requires: ['MEPH.audio.soundfont.chunks.data.GeneratorsSubchunk'],
    extend: "MEPH.audio.soundfont.chunks.data.operators.ValueOperator",
    statics: {
    },
    initialize: function (amount)//:int = 0
    {
        this.callParent(Operator.PAN, amount || 0);
    }
});
