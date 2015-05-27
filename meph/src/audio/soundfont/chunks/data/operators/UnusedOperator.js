/* Unused, reserved. Should be ignored if encountered. */

MEPH.define("MEPH.audio.soundfont.chunks.data.operators.UnusedOperator", {
    requires: [],
    extend: 'MEPH.audio.soundfont.chunks.data.operators.Operator',
    statics: {
    },
    properties: {
    },
    initialize: function (type, amount) {//type:int, amount:int = 0
        this.callParent(type, amount);
    },
    getIsUnusedType: function ()//:Boolean
    {
        return true;
    }
});
