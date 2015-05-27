/**
 * NoteSample represents a sample waveform and a series of properties that modify it. These properties are generated
 * by the getNoteSample() function of the SoundFont class. It should provide all the ingredients necessary to
 * produce a musical note for a given keyNum/velocity pair.
 */


MEPH.define("MEPH.audio.soundfont.NoteSample", {
    requires: ['MEPH.audio.soundfont.chunks.data.SampleRecord',
                //"MEPH.audio.soundfont.NoteSample",
                'MEPH.audio.soundfont.utils.SFByteArray'],
    extend: 'MEPH.audio.soundfont.SoundPropertyObject',
    statics: {
        PROPERTY_NAMES: [],//:Array = 
        DEFAULTS: {},//:Object = ;
    },
    properties: {
        // Tuning
        overridingRootKey: -1,//:int = ;
        velocity: -1,//:int = ;
        keyNum: -1,//:int = ;
        // Sample offsets
        startAddrsOffset: 0,///:int = ;
        endAddrsOffset: 0,//:int = ;
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
        exclusiveClass: 0,//

        sample: null,//:SampleRecord;

        _sampleData: null,//:ByteArray;

    },
    initialize: function (sample, keyNum, velocity)//:SampleRecord  //:int //:int
    {
        this.callParent("NoteSample");
        this.sample = sample;
        if (NoteSample.PROPERTY_NAMES.length == 0) {
            this.initStaticConstants(NoteSample.PROPERTY_NAMES, NoteSample.DEFAULTS);
        }
        this.generateSampleData(sample);
        this.keyNum = keyNum;
        this.velocity = velocity;
    },
    // Fill the _sampleData ByteArray with values from the sample waveform.
    generateSampleData: function (sample)//:SampleRecord //:void
    {
        var arraybuffer = new ArrayBuffer(this.getEnd() - this.getStart());
        this._sampleData = new SFByteArray(arraybuffer);
        //this._sampleData.endian = Endian.LITTLE_ENDIAN;
        this._sampleData.copy(sample.bytes, this.getStart(), this.getEnd() - this.getStart());
        this._sampleData.position = 0;
    },

    getSampleData: function ()//:ByteArray
    {
        return this._sampleData;
    },

    isDefault: function (prop)//:String //function :Boolean
    {
        return NoteSample.PROPERTY_NAMES.indexOf(prop) != -1 && NoteSample.DEFAULTS[prop] == this[prop];
    },
    // The multiplier to apply to the sample to produce the desired note for the given MIDI keyNum.
    getTransposition: function (keyNum)//:int //:Number
    {
        return this.noteToFrequency(keyNum) / this.rootFrequency;
    },
    /**
     * Note: note can contain a fractional portion. That way any cents-based adjustments can be added to the base midi
     * note int value
     */
    noteToFrequency: function (note)//:Number = 60:Number
    {
        if (note == null || note == undefined) {
            note = 60;
        }
        return 440 * Math.pow(2.0, (note - 69) / 12);
    },

    // The keyNum that represents the note for the original recorded sample.
    getRootKey: function ()//:int
    {
        return (this.isDefault("overridingRootKey")) ? this.sample.originalPitch : this.overridingRootKey;
    },

    // The rootKey modified by any coarse and fine correction values.
    getRootFrequency: function ()//:Number
    {
        return this.noteToFrequency(this.rootKey + this.sample.pitchCorrection * 0.1 + this.coarseTune + this.fineTune * 0.01);
    },

    getLength: function ()//:uint
    {
        return this.end - this.start;
    },

    getStart: function ()//:uint
    {
        return this.sample.start + this.startAddrsCoarseOffset * 32768 + this.startAddrsOffset;
    },

    getEnd: function ()//:uint
    {
        return this.sample.end + this.endAddrsCoarseOffset * 32768 + this.endAddrsOffset;
    },

    getNumChannels: function ()//:int
    {
        return this.sample.numChannels;
    },

    getLinkedSampleIndex: function ()//:int
    {
        return (this.numChannels == 2) ? this.sample.sampleLink : -1;
    },

    getLoopStart: function ()//:uint
    {
        return this.sample.loopStart + this.startLoopAddrsCoarseOffset * 32768 + this.startLoopAddrsOffset;
    },

    getLoopEnd: function ()//:uint
    {
        return this.sample.loopEnd + this.endLoopAddrsCoarseOffset * 32768 + this.endLoopAddrsOffset;
    }
});
