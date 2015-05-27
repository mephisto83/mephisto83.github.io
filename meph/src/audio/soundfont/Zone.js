/**
 * A zone is a portion of either an instrument or a preset that corresponds to a given keyRange/velocityRange pair.
 * Presets contain PresetZones and Instruments contain InstrumentZones.
 *
 * PresetZones contain an Instrument property plus any generated properties that modify that Instrument.
 * InstrumentZones contain a Sample property plus any generated properties that modify that Sample.
 */

MEPH.define("MEPH.audio.soundfont.Zone", {
    requires: ['MEPH.audio.soundfont.chunks.data.Range'],
    extend: 'MEPH.audio.soundfont.SoundPropertyObject',
    statics: {

        PROPERTY_NAMES: [],//:Array = 

        DEFAULTS: {},//:Object =  ;
    },
    properties: {
        // Ranges
        keyRange: null,///:Range = 

        velRange: null//:Range = ;
    },
    initialize: function (type)//:String
    {
        this.keyRange = new MEPH.audio.soundfont.chunks.data.Range("keyRange", 0, 127);
        this.velRange = new MEPH.audio.soundfont.chunks.data.Range("velocityRange", 0, 127);
        this.callParent(type);
        if (Zone.PROPERTY_NAMES.length == 0) {
            this.initStaticConstants(Zone.PROPERTY_NAMES, Zone.DEFAULTS);
        }
    },
    fits: function (keyNum, velocity)//:int //:int  //:Boolean
    {
        return keyNum >= this.keyRange.low && keyNum <= this.keyRange.high &&
            velocity >= this.velRange.low && velocity <= this.velRange.high;
    },
    getPropertyNames: function ()//:Array
    {
        return Zone.PROPERTY_NAMES.slice();
    },
    isDefault: function (prop)//:String //:Boolean
    {
        if (prop == "keyRange" || prop == "velRange") {
            debugger;
            return Zone.DEFAULTS[prop].low == this[prop].low && Zone.DEFAULTS[prop].high == this[prop].high;
        }
        return this.callParent((prop)) || (Zone.PROPERTY_NAMES.indexOf(prop) != -1 && Zone.DEFAULTS[prop] == this[prop]);
    }
});