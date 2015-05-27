/**
 * @class MEPH.audio.soundfont.Instrument
 * @extend MEPH.audio.soundfont.ZoneContainer
 * Instrument represents the parsed and compiled contents of a SoundFont instrument element. It contains "zone"
 * definitions for determining which sample waveforms and dsp properties to use to create a specified keyNum abd
 * velocity. The data property contains the InstrumentRecord which represents the lower-level data for the
 * instrument (without any generators and modulators.)
 */
MEPH.define("MEPH.audio.soundfont.Instrument", {
    requires: ["MEPH.audio.soundfont.chunks.data.InstrumentRecord",
                "MEPH.audio.soundfont.chunks.data.GeneratorRecord",
                "MEPH.audio.soundfont.chunks.data.operators.RangeOperator",
                "MEPH.audio.soundfont.InstrumentZone",
                "MEPH.audio.soundfont.chunks.data.operators.Operator"],
    extend: "MEPH.audio.soundfont.ZoneContainer",
    statics: {
    },
    initialize: function (record)//:InstrumentRecord
    {
        this.callParent("Instrument", record, InstrumentZone);
    },

    /**
     * Finds a zone that can play the specifies key and velocity. If it can't find an exact match, it chooses the
     * closest non-match. KeyNum is the main determiner and velocity is the tie-breaker.
     */
    getInstrumentZone: function (keyNum, velocity)//:int  //:int  //:InstrumentZone
    {
        return this.getZone(keyNum, velocity)// as InstrumentZone;
    },

    buildZone: function (generator, records)//:GeneratorRecord //:Array //:Zone
    {
        var zone = this.callParent(generator, records);//:Zone 
        var sampleID = generator.getSampleID();//:int 
        if (sampleID == -1) {
            this._globalZone = zone;
        }
        else {
            zone.sample = records[sampleID];
            this._zones.push(zone);
        }
        return zone;
    }
});
