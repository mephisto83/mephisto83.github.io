/* This enumerator forces the MIDI key number to effectively be interpreted as the value given. This generator can only
 * appear at the instrument level. Valid values are from 0 to 127. */



MEPH.define("MEPH.audio.soundfont.chunks.data.operators.KeyNumOverride", {
    requires: ['MEPH.audio.soundfont.chunks.data.GeneratorsSubchunk'],
    extend: "MEPH.audio.soundfont.chunks.data.operators.SubstitutionOperator",
    statics: {
    },
    initialize: function (amount)//:int = -1)
    {
        if (amount == undefined || amount == null) {
            amount = -1;
        }
        this.callParent(Operator.KEY_NUM, amount);
    }
});
