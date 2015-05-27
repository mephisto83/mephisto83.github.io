/**
 * Preset represents the parsed and compiled contents of a SoundFont preset element. It contains "zone" definitions
 * for determining which instrument element to use to create a specified keyNum abd velocity. The record property
 * contains the PresetRecord which represents the lower-level data for the instrument (without any generators and
 * modulators.)
 */



MEPH.define("MEPH.audio.soundfont.Preset", {
    requires: ['MEPH.audio.soundfont.chunks.data.PresetRecord',
                'MEPH.audio.soundfont.chunks.data.GeneratorRecord',
                'MEPH.audio.soundfont.PresetZone',
                'MEPH.audio.soundfont.chunks.data.operators.Operator',
                'MEPH.audio.soundfont.chunks.data.InstrumentsSubchunk',
                'MEPH.audio.soundfont.chunks.data.GeneratorsSubchunk',
                'MEPH.audio.soundfont.chunks.data.operators.RangeOperator'],
    extend: 'MEPH.audio.soundfont.ZoneContainer',
    statics: {
    },
    initialize: function (record)//:PresetRecord
    {
        this.callParent("Preset", record, PresetZone);
    },
    getBank: function ()//:int
    {//new PresetRecord
        return (this.record).bank;
    },

    getPresetID: function ()//:int
    {//new PresetRecord
        return (this.record).preset;
    },


    /**
     * Finds an instrument zone that matches the specifies key and velocity. If it can't find an exact match, it
     * chooses the closest non-match. KeyNum is the first priority and velocity is the tie-breaker. (This is
     * basically a convenience method to provide access to Instrument::getInstrumentZone without the hassle of
     * locating the proper preset zone first.)
     */
    getInstrumentZone: function (keyNum, velocity)//:int //:int  //:InstrumentZone
    {
        var presetZone = this.getPresetZone(keyNum, velocity);//:PresetZone 
        return presetZone.getInstrumentZone(keyNum, velocity);
    },

    /**
     * Finds a preset zone that matches the specifies key and velocity. If it can't find an exact match, it chooses
     * the closest non-match. KeyNum is the first priority and velocity is the tie-breaker.
     */
    getPresetZone: function (keyNum, velocity)//:int  //:int  //:PresetZone
    {
        return this.getZone(keyNum, velocity);// as PresetZone;
    },
    toXML: function ()//:XML
    {
        return "preset override";
    },
    buildZone: function (generator, records)//:GeneratorRecord  //:Array //:Zone
    {
        var zone = this.callParent(generator, records);//:Zone 
        var instrumentID = generator.getInstrumentID();//:int 
        if (instrumentID == -1) {
            this._globalZone = zone;
        }
        else {
            zone.instrument = records[instrumentID];
            this._zones.push(zone);
        }
        return zone;
    }
});
