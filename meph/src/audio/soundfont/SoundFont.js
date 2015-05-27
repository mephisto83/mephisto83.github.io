/**
 * SoundFont represents the parsed and compiled contents of a SoundFont (sf2) file. It abstracts the SoundFont
 * structure to make it easier to access the elements you will usually want: the presets and instruments. You can
 * also use the getNoteSample function to access the sample data for a specified keyNum and velocity. The data
 * property contains the SoundFontChunk which provides access to the lower-level data of the file.
 */

MEPH.define("MEPH.audio.soundfont.SoundFont", {
    requires: ['MEPH.audio.soundfont.chunks.data.DataChunk',
               'MEPH.audio.soundfont.chunks.data.PresetRecord',
                'MEPH.audio.soundfont.Preset',
                'MEPH.audio.soundfont.NoteSample',
                'MEPH.audio.soundfont.chunks.SoundFontChunk',
                'MEPH.audio.soundfont.chunks.data.InstrumentRecord',
                'MEPH.audio.soundfont.Instrument',
                'MEPH.audio.soundfont.chunks.data.SampleRecord'],
    extend: 'MEPH.audio.soundfont.SFObject',
    properties: {
        _instruments: null,//:Array = 8
        _presets: null,//:Array = 
        _selectedPreset: undefined,//Preset;
        _data: undefined, // SoundFontChunk;
    },
    initialize: function (data) //:SoundFontChunk
    {
        this._instruments = [];
        this._presets = [];
        this.callParent("SoundFont");
        this.nonSerializedProperties.push("data");
        this.setData(data);
    },
    getSelectedPreset: function ()//:Preset
    {
        return this._selectedPreset;
    },

    getPresets: function ()//:Array
    {
        return this._presets.slice();
    },

    getInstruments: function ()//:Array
    {
        return this._instruments.slice();
    },

    getData: function ()//:SoundFontChunk
    {
        return this._data;
    },

    setData: function (value)//:SoundFontChunk // :void
    {
        this._data = value;
        this.buildInstruments(this._data.dataChunk);
        this.buildPresets(this._data.dataChunk);
    },

    // Construct a NoteSample object for the given keyNum/velocity pair.
    getNoteSample: function (keyNum, velocity)// :int// :int// :NoteSample
    {
        var presetZone = this.getPresetZone(keyNum, velocity);//:PresetZone 
        if (presetZone != null) {
            var instrumentZone = presetZone.getInstrumentZone(keyNum, velocity);//:InstrumentZone 
            if (instrumentZone != null) {
                var sample = this._data.getSampleRecord(instrumentZone.sampleID);//:SampleRecord 
                var noteSample = new NoteSample(sample, keyNum, velocity); //:NoteSample 
                for (var prop in NoteSample.PROPERTY_NAMES) //:String 
                {
                    // Instrument generators replace the corresponding properties of the sample
                    noteSample[prop] = instrumentZone[prop];
                    // Preset generators are added to the corresponding properties of the sample + Instrument generator
                    if (presetZone.hasOwnProperty(prop)) {
                        noteSample[prop] += presetZone[prop];
                    }
                }
                return noteSample;
            }
        }
        return null;
    },

    getInstrumentZone: function (keyNum, velocity)//:int //:int //:InstrumentZone
    {
        var presetZone = this.getPresetZone(keyNum, velocity);//:PresetZone 
        return (presetZone != null) ? presetZone.getInstrumentZone(keyNum, velocity) : null;
    },

    getPresetZone: function (keyNum, velocity)//:int ///:int //:PresetZone
    {
        return (this.getSelectedPreset() != null) ? this.getSelectedPreset().getPresetZone(keyNum, velocity) : null;
    },

    selectPreset: function (presetID)//:int // :void
    {
        this._selectedPreset = this.getPreset(presetID);
    },

    getPreset: function (presetID)//:int //:Preset
    {
        for (var i = 0; i < this._presets.length ; i++)//:Preset
        {
            var preset = this._presets[i];
            if (preset.getPresetID() == presetID) {
                return preset;
            }
        }
        return null;
    },
    getPresetIds: function () {
        var me = this;
        return me._presets.select(function (x) {
            return x.getPresetID();
        })
    },
    buildInstruments: function (dataChunk) //:DataChunk //:void
    {
        for (var i = 0  ; i < dataChunk.getInstrumentRecords().length ; i++)//:InstrumentRecord
        {
            var record = dataChunk.getInstrumentRecords()[i];
            var instrument = new Instrument(record);//Instrument 
            instrument.buildZones(dataChunk.getSampleRecords());
            this._instruments.push(instrument);
        }
    },

    buildPresets: function (dataChunk)//:DataChunk //:void
    {
        for (var i = 0 ; i < dataChunk.getPresetRecords().length ; i++)//:PresetRecord
        {
            var record = dataChunk.getPresetRecords()[i];
            var preset = new Preset(record);//:Preset 
            preset.buildZones(this.getInstruments());
            this._presets.push(preset);
        }
    }
});
