/*
 struct sfModList
 {
     SFModulator sfModSrcOper;
     SFGenerator sfModDestOper;
     SHORT modAmount;
     SFModulator sfModAmtSrcOper;
     SFTransform sfModTransOper;
 };*/

MEPH.define("MEPH.audio.soundfont.chunks.data.ModulatorRecord", {
    requires: [],
    extend: "MEPH.audio.soundfont.SFObject",
    statics: {
    },
    properties: {
        sourceOperator: 0,//:int;
        destinationOperator: 0,//:int;
        amountOperator: 0,//:int;
        amountSourceOperator: 0,//:int;
        transformOperator: 0,//:int;
    },
    initialize: function () {
        this.callParent("Modulator");
    }
});
