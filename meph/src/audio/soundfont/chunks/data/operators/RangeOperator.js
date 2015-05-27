/* A Range Generator defines a range of note-on parameters outside of which the zone is undefined. Two Range Generators
 * are currently defined, keyRange and velRange. */


MEPH.define("MEPH.audio.soundfont.chunks.data.operators.RangeOperator", {
    requires: ['MEPH.audio.soundfont.chunks.data.Range'],
    extend: "MEPH.audio.soundfont.chunks.data.operators.Operator",
    statics: {
    },
    properties: {
        high: 0//:int;

    },
    initialize: function (type, values)//:int    //:Array
    {
        this.callParent(type, values[0]);
        this.high = values[1];
    },
    getLow: function ()//:int
    {
        return this.amount;
    },

    getValues: function ()//:Range
    {
        return new MEPH.audio.soundfont.chunks.data.Range(this.type, this.getLow(), this.high);
    }
});
