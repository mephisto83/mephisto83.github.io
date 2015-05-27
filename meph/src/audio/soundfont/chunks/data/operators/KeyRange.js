/* This is the minimum and maximum MIDI key number values for which this preset zone or instrument zone is active. The
 * LS byte indicates the highest and the MS byte the lowest valid key. The keyRange enumerator is optional, but when it
 * does appear, it must be the first generator in the zone generator list. */


MEPH.define("MEPH.audio.soundfont.chunks.data.operators.KeyRange", {
    requires: ['MEPH.audio.soundfont.chunks.data.GeneratorsSubchunk'],
    extend: 'MEPH.audio.soundfont.chunks.data.operators.RangeOperator',
    statics: {
    },
    initialize: function (values)//:Array
    {
        this.callParent(Operator.KEY_RANGE, values);
    }
});
