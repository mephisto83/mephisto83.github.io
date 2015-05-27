
/* Substitution Generators are generators which substitute a value for a note-on parameter. Two Substitution Generators
 * are currently defined, overridingKeyNumber and overridingVelocity. */

MEPH.define("MEPH.audio.soundfont.chunks.data.operators.SubstitutionOperator", {
    requires: [],
    extend: 'MEPH.audio.soundfont.chunks.data.operators.Operator',
    statics: {
    },
    initialize: function (type, amount)//:int  //:int = 0
    {
        this.callParent(type, amount || 0);
    }
});
