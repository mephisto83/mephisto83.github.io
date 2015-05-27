/* Value Generators are generators whose value directly affects a signal processing parameter. Most generators are
 * value generators. */


MEPH.define("MEPH.audio.soundfont.chunks.data.operators.ValueOperator", {
    requires: [],
    extend: 'MEPH.audio.soundfont.chunks.data.operators.Operator',
    statics: {
    },
    properties: {},
    initialize: function (type, amount)//:int     //:int = 0
    {
        this.callParent(type, amount);
    }
});
