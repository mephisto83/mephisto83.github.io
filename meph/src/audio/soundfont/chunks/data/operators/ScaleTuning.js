/* This parameter represents the degree to which MIDI key number influences pitch. A value of zero indicates
* that MIDI key number has no effect on pitch; a value of 100 represents the usual tempered semitone scale. */

MEPH.define("MEPH.audio.soundfont.chunks.data.operators.ScaleTuning", {
    requires: ['MEPH.audio.soundfont.chunks.data.GeneratorsSubchunk'],
    extend: 'MEPH.audio.soundfont.chunks.data.operators.ValueOperator',
    statics: {
    },
    initialize: function (amount)//:int = 100
    {
        if (amount == null || amount == undefined) {
            amount = 100;
        }
        this.callParent(Operator.SCALE_TUNING, amount);
    }
});
