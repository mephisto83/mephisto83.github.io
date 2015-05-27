/* This parameter provides the capability for a key depression in a given instrument to terminate the playback of other
 * instruments. This is particularly useful for percussive instruments such as a hi-hat cymbal. An exclusive class
 * value of zero indicates no exclusive class; no special action is taken. Any other value indicates that when this
 * note is initiated, any other sounding note with the same exclusive class value should be rapidly terminated. The
 * exclusive class generator can only appear at the instrument level. The scope of the exclusive class is the entire
 * preset. In other words, any other instrument zone within the same preset holding a corresponding exclusive class
 * will be terminated. */


MEPH.define("MEPH.audio.soundfont.chunks.data.operators.ExclusiveClass", {
    requires: ['MEPH.audio.soundfont.chunks.data.GeneratorsSubchunk'],
    extend: "MEPH.audio.soundfont.chunks.data.operators.ValueOperator",
    statics: {
    },
    initialize: function (amount)//:int = 0 
    {
        this.callParent(Operator.EXCLUSIVE_CLASS, amount || 0);
    }
});
