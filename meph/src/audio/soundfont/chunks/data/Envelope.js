/*
    Envelope is a data structure for the six properties that define a SoundFont envelope.
*/


MEPH.define("MEPH.audio.soundfont.chunks.data.Envelope", {
    requires: [],
    
    statics: {
    },
    properties: {
        delay: -12000,//:int = ;
        attack: -12000,//:int = ;
        hold: -12000,//:int = ;
        decay: -12000,//:int = ;
        sustain: 0,//:int = ;
        release: -12000,//:int = ;
    },
    constructor: function Envelope() {
        this.callParent("Envelope");
    }
});