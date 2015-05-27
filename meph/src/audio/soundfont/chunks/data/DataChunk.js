/*
    The articulation data within a SoundFont 2 compatible file is contained in nine mandatory sub-chunks. This data
    is named “hydra” after the mythical nine-headed beast. The structure has been designed for interchange purposes;
    it is not optimized for either run-time synthesis or for on-the-fly editing. It is reasonable and proper for
    SoundFont compatible client programs to translate to and from the hydra structure as they read and write SoundFont
    compatible files.
*/

MEPH.define("MEPH.audio.soundfont.chunks.data.DataChunk", {
    requires: ['MEPH.audio.soundfont.chunks.samples.SamplesChunk',
        'MEPH.audio.soundfont.chunks.data.PresetsSubchunk',
        'MEPH.audio.soundfont.chunks.data.GeneratorsSubchunk',
        'MEPH.audio.soundfont.chunks.data.BagsSubchunk',
        'MEPH.audio.soundfont.chunks.data.InstrumentsSubchunk',
        'MEPH.audio.soundfont.chunks.data.ModulatorsSubchunk',
        'MEPH.audio.soundfont.chunks.data.SamplesSubchunk',
                'MEPH.audio.soundfont.utils.SFByteArray'],
    extend: 'MEPH.audio.soundfont.chunks.Chunk',
    statics: {
        DATA_TAG: "pdta",//:String = 
        PRESET_TAG: "phdr",//:String = ;
        PRESET_BAG_TAG: "pbag",//:String = ;
        PRESET_MODULATOR_TAG: "pmod",//:String = ;
        PRESET_GENERATOR_TAG: "pgen",//:String = ;
        INSTRUMENT_TAG: "inst",//:String = ;
        INSTRUMENT_BAG_TAG: "ibag",//:String = ;
        INSTRUMENT_MODULATOR_TAG: "imod",//:String = ;
        INSTRUMENT_GENERATOR_TAG: "igen",//:String = ;
        SAMPLE_HEADER_TAG: "shdr",//:String = ;
        END_OF_SAMPLES_TAG: "EOS",//:String = ;
    },
    properties: {
        presetsSubchunk: undefined,//:PresetsSubchunk;
        presetBags: undefined,//BagsSubchunk;
        presetModulators: undefined,//:ModulatorsSubchunk;
        presetGenerators: undefined,//:GeneratorsSubchunk;
        instrumentsSubchunk: undefined,//:InstrumentsSubchunk;
        instrumentBags: undefined,//:BagsSubchunk;
        instrumentModulators: undefined,//:ModulatorsSubchunk;
        instrumentGenerators: undefined,//:GeneratorsSubchunk;
        samplesSubchunk: undefined,//:SamplesSubchunk;
    },
    initialize: function (source)//:SFByteArray = null
    {
        this.callParent("DataChunk", source);
        this.nonSerializedProperties.push("numSamples");
    },
    getNumSamples: function ()//:Number
    {
        return this.getSampleRecords().numRecords;
    },
    getPresetRecords: function ()//:Array
    {
        return this.presetsSubchunk.records;
    },
    getInstrumentRecords: function ()//:Array
    {
        return this.instrumentsSubchunk.records;
    },
    getSampleRecords: function () {
        return this.samplesSubchunk.records;
    },
    setSampleBytes: function (value)//:SamplesChunk:void
    {
        this.samplesSubchunk.setBytes(value.getBytes());
    },
    getSampleRecord: function (index)//:int :SampleRecord
    {
        return this.samplesSubchunk.getSampleRecord(index);
    },
    parse: function (bytes)//:SFByteArray :void
    {
        while (bytes.bytesAvailable() > 7) {
            this._format = bytes.readString(4);
            this._chunkSize = bytes.readDWord();
            var _chunkSize = this._chunkSize;
            var _format = this._format;
            switch (_format) {
                case DataChunk.PRESET_TAG:
                    {
                        this.presetsSubchunk = new PresetsSubchunk(bytes, _chunkSize);
                        break;
                    }
                case DataChunk.PRESET_BAG_TAG:
                    {
                        this.presetBags = new BagsSubchunk(bytes, _chunkSize);
                        break;
                    }
                case DataChunk.PRESET_MODULATOR_TAG:
                    {
                        this.presetModulators = new ModulatorsSubchunk(bytes, _chunkSize);
                        break;
                    }
                case DataChunk.PRESET_GENERATOR_TAG:
                    {
                        this.presetGenerators = new GeneratorsSubchunk(bytes, _chunkSize);
                        break;
                    }
                case DataChunk.INSTRUMENT_TAG:
                    {
                        this.instrumentsSubchunk = new InstrumentsSubchunk(bytes, _chunkSize);
                        break;
                    }
                case DataChunk.INSTRUMENT_BAG_TAG:
                    {
                        this.instrumentBags = new BagsSubchunk(bytes, _chunkSize);
                        break;
                    }
                case DataChunk.INSTRUMENT_MODULATOR_TAG:
                    {
                        this.instrumentModulators = new ModulatorsSubchunk(bytes, _chunkSize);
                        break;
                    }
                case DataChunk.INSTRUMENT_GENERATOR_TAG:
                    {
                        this.instrumentGenerators = new GeneratorsSubchunk(bytes, _chunkSize);
                        break;
                    }
                case DataChunk.SAMPLE_HEADER_TAG:
                    {
                        this.samplesSubchunk = new SamplesSubchunk(bytes, _chunkSize);
                        break;
                    }
                case DataChunk.END_OF_SAMPLES_TAG:
                default:
                    {
                        break;
                    }
            }
        }
        this.updateSamplesAndPresets();
    },
    updateSamplesAndPresets: function ()//:void
    {
        this.instrumentsSubchunk.processGenerators(this.instrumentGenerators, this.instrumentBags);
        this.presetsSubchunk.processGenerators(this.presetGenerators, this.presetBags);
    }
});
