/* This is the minimum and maximum MIDI velocity values for which this preset zone or instrument zone is active. The LS
 * byte indicates the highest and the MS byte the lowest valid velocity. The velRange enumerator is optional, but when
 * it does appear, it must be preceded only by keyRange in the zone generator list. */


MEPH.define("MEPH.audio.soundfont.chunks.data.operators.VelocityRange", {
    requires: ['MEPH.audio.soundfont.chunks.data.GeneratorsSubchunk'],
    extend: 'MEPH.audio.soundfont.chunks.data.operators.RangeOperator',
    statics: {
    },
    initialize: function (values)//:Array
    {
        this.callParent(Operator.VEL_RANGE, values);
    }
});
