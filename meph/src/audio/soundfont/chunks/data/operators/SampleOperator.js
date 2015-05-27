/* Sample Generators are generators which directly affect a sample’s properties. These generators are undefined at the
 * preset level. The currently defined Sample Generators are the eight address offset generators, the sampleModes
 * generator, the Overriding Root Key generator and the Exclusive Class generator. */





MEPH.define("MEPH.audio.soundfont.chunks.data.operators.SampleOperator", {
    requires: [],
    extend: "MEPH.audio.soundfont.chunks.data.operators.Operator",
    statics: {
    },
    initialize: function (type, amount)//:int  //:int = 0
    {
        this.callParent(type, amount || 0);
    }
});
