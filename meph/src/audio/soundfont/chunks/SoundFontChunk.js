/*
    A SoundFont 2 compatible RIFF file comprises three chunks: an INFO-list chunk containing a number of required and
    optional sub-chunks describing the file, its history, and its intended use, an sdta-list chunk comprising a single
    sub-chunk containing any referenced digital audio samples, and a pdta-list chunk containing nine sub-chunks which
    define the articulation of the digital audio data.
*/

MEPH.define("MEPH.audio.soundfont.chunks.SoundFontChunk", {
    requires: ['MEPH.audio.soundfont.utils.SFByteArray',
    'MEPH.audio.soundfont.chunks.data.DataChunk',
    'MEPH.audio.soundfont.chunks.info.InfoChunk',
    'MEPH.audio.soundfont.chunks.samples.SamplesChunk',
    'MEPH.audio.soundfont.chunks.data.SampleRecord'],
    extend: 'MEPH.audio.soundfont.chunks.Chunk',
    statics: {
        SOUND_FONT_BANK_TAG: "sfbk",//:String =  ;
    },
    properties: {
        infoChunk: null,//:InfoChunk;
        samplesChunk: null,//:SamplesChunk;
        dataChunk: null,//:DataChunk;
    },
    initialize: function (source)//:SFByteArray = null
    {
        this.callParent("SoundFontChunk", source);
    },

    getPresetRecords: function ()//:Array
    {
        return this.dataChunk.getPresetRecords();
    },
    getInstrumentRecords: function ()//:Array
    {
        return this.dataChunk.getInstrumentRecords();
    },

    getSampleRecords: function ()//:Array
    {
        return this.dataChunk.getSampleRecords();
    },

    getNumSamples: function ()//:Number
    {
        return this.dataChunk.getNumSamples();
    },

    getSampleRecord: function (index)// :int //:SampleRecord
    {
        return this.dataChunk.getSampleRecord(index);
    },

    parse: function (bytes)//:SFByteArray //:void
    {
        var format = bytes.readString(4);//:String 
        var chunkSize = bytes.readDWord();//:uint 
        if (format != Chunk.RIFF_TAG) {
            throw new Error("SoundFontParser::Incorrect format: " + format);
        }
        var type = bytes.readString(4);//:String 
        if (type != SoundFontChunk.SOUND_FONT_BANK_TAG) {
            throw new Error("SoundFontParser::Incorrect type: " + type);
        }
        while (bytes.bytesAvailable() > 7) {
            format = bytes.readString(4);
            chunkSize = bytes.readDWord();
            if (format == Chunk.LIST_TAG) {
                type = bytes.readString(4);
                switch (type) {
                    case InfoChunk.INFO_TAG:
                        {
                            this.infoChunk = new InfoChunk(bytes);
                            break;
                        }
                    case SamplesChunk.SAMPLE_DATA_TAG:
                        {
                            this.samplesChunk = new SamplesChunk(bytes);
                            break;
                        }
                    case DataChunk.DATA_TAG:
                        {
                            this.dataChunk = new DataChunk(bytes);
                            break;
                        }
                }
            }
        }
        this.dataChunk.setSampleBytes(this.samplesChunk);
    }
});