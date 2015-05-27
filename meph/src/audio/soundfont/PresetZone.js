/**
 * An PresetZone contains an Instrument property plus any generated properties that modify that Instrument.
 */


MEPH.define("MEPH.audio.soundfont.PresetZone", {
    requires: [],
    extend: 'MEPH.audio.soundfont.Zone',
    statics: {
        PROPERTY_NAMES: [],//:Array = ;
        DEFAULTS: {},//:Object = ;
    },
    properties: {
        // The SoundFont specifications define the property name for the index of the instrument as "instrument."
        // To prevent confusion, we change that to "instrumentID" and let "instrument" refer to the instrument
        // object corresponding to that index.
        instrumentID: -1,//:int =  ;
        instrument: null//:Instrument;
    },
    initialize: function () {
        this.callParent("PresetZone");
        if (PresetZone.PROPERTY_NAMES.length == 0) {
            this.initStaticConstants(PresetZone.PROPERTY_NAMES, PresetZone.DEFAULTS);
        }
    },

    /**
     * Finds a zone that can play the specified key and velocity. If it can't find an exact match, it chooses the
     * closest non-match. KeyNum is the main determiner and velocity is the tie-breaker.
     */
    getInstrumentZone: function (keyNum, velocity)//:int //:int //:InstrumentZone
    {
        return this.instrument.getInstrumentZone(keyNum, velocity);
    },

    getPropertyNames: function ()//:Array
    {
        return PresetZone.PROPERTY_NAMES.slice();
    },

    toXML: function ()//:XML
    {
        //    var xml:XML = super.toXML();
        //    if (instrument != null)
        //    {
        //        xml.appendChild(instrument.toXML());
        //    }
        //    return xml;
        return "preset zone";
    },
    isDefault: function (prop)//:String //:Boolean
    {
        return this.callParent((prop)) || (PresetZone.PROPERTY_NAMES.indexOf(prop) != -1 && PresetZone.DEFAULTS[prop] == this[prop]);
    }
});
