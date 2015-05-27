/**
 * An InstrumentZone contains a Sample property plus any generated properties that modify that Sample.
 */

MEPH.define("MEPH.audio.soundfont.InstrumentZone", {
    requires: ['MEPH.audio.soundfont.chunks.data.SampleRecord'],
    extend: "MEPH.audio.soundfont.Zone",
    statics: {
        PROPERTY_NAMES: [],//:Array = ;
        DEFAULTS: {}//:Object = ;
    },
    properties: {
        sampleID: -1,//:int = ;
        sample: null,//:SampleRecord;
        // Tuning
        overridingRootKey: -1,//:int = ;
        velocity: -1,//:int = ;
        keyNum: -1,//:int = ;
        // Sample offsets
        startAddrsOffset: 0,//:int = ;
        endAddrsOffset: 0,//;
        startLoopAddrsOffset: 0,//:int = ;
        endLoopAddrsOffset: 0,//:int = ;
        startAddrsCoarseOffset: 0,//:int = ;
        endAddrsCoarseOffset: 0,//:int = ;
        startLoopAddrsCoarseOffset: 0,//:int = ;
        endLoopAddrsCoarseOffset: 0,//:int = ;
        // Sample mode & link
        sampleMode: 0,//:int = ;
        sampleLink: 0,//:int = ;
        // In a category by inself
        exclusiveClass: 0,//:int = 
    },
    initialize: function () {
        this.callParent("InstrumentZone");
        if (InstrumentZone.PROPERTY_NAMES.length == 0) {
            this.initStaticConstants(InstrumentZone.PROPERTY_NAMES, InstrumentZone.DEFAULTS);
        }
    },

    getPropertyNames: function ()///:Array
    {
        return InstrumentZone.PROPERTY_NAMES.slice();
    },

    isDefault: function (prop)//:String  //:Boolean
    {
        return this.callParent((prop)) || (InstrumentZone.PROPERTY_NAMES.indexOf(prop) != -1 && InstrumentZone.DEFAULTS[prop] == this[prop]);
    }
});
