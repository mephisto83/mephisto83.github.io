

MEPH.define("MEPH.audio.soundfont.app", {
    requires: ['MEPH.audio.soundfont.chunks.SoundFontChunk',
                'MEPH.audio.soundfont.SoundFontParser',
                'MEPH.audio.soundfont.utils.NoteSampleDecoder',
                'MEPH.audio.soundfont.SoundFont',
                'MEPH.audio.soundfont.utils.SFByteArray',
                'script.alchemy.master.Wave'],
    extend: "MEPH.audio.soundfont.SFObject",
    statics: {
    },
    properties: {
        soundFonts: null//:Array = 
    },
    initialize: function () {
        this.soundFonts = [];
    },
    parse: function (data)//:ByteArray //:SoundFont
    {
        var bytes = new SFByteArray(data);//:SFByteArray 
        var soundFontChunk = new SoundFontChunk(bytes);//:SoundFontChunk 
        var soundFont = new SoundFont(soundFontChunk);//:SoundFont 
        this.soundFonts.push(soundFont);
        return soundFont;
    },
    getNoteSample: function (data, _keyNum, _velocity, indx) {
        var soundfont = data.file;
        var presets = soundfont.getPresets();
        indx = indx || 0;
        var presetid = presets[indx];
        soundfont.selectPreset(parseInt(presetid.getPresetID()))
        var notesample = soundfont.getNoteSample(_keyNum, _velocity);
        data.notesample = notesample;
        return notesample;
    },
    getSoundFont: function (info) {
        var length = info.target.result.byteLength;
        var parser = new MEPH.audio.soundfont.SoundFontParser();
        var soundfont = parser.parse(info.target.result);
        return soundfont;
    },
    noteToFrequency: function (note)//: int = 60.0  //: Number
    {
        note = note || 60;
        return 440.0 * Math.pow(2.0, (note + 3.0) / 12.0 - 6.0);
    },
    getWave: function (notesample, _keyNum) {
        var _noteSampleDecoder = new MEPH.audio.soundfont.utils.NoteSampleDecoder(notesample);
        _position = notesample.getStart() / 2;
        _end = notesample.getLoopEnd() / 2;
        var sampleFrequency = this.noteToFrequency(notesample.getRootKey());//:Number 
        var noteFrequency = this.noteToFrequency(_keyNum);//:Number 
        _rate = noteFrequency / sampleFrequency;
        var startPos = notesample.getStart();
        var endPos = notesample.getEnd();
        var startloop = notesample.getLoopStart();
        var endloop = notesample.getLoopEnd();
        var intarget = new ArrayBuffer((endPos - startPos) * 8);
        var target = new MEPH.audio.soundfont.utils.SFByteArray(intarget);
        var reduce = 1;
        var sampleraite = 44000 / reduce;
        _noteSampleDecoder.extract(target, ((endPos - startPos)) / 2, 0, sampleraite);
        var bufferposition = startPos;
        var idView = new Float32Array(target._dataview.buffer);
        var wave = new RIFFWAVE();
        wave.header.sampleRate = sampleraite;
        wave.header.numChannels = 2;
        function convert255(data) {
            var data_0_255 = [];
            //for (var j = 0 ; j < 2 ; j++)
            for (var i = 0; i < data.byteLength / 4; i++) {
                var flo = data.getFloat32(i * 4, true)
                if (i % reduce == 0) {
                    data_0_255.push(128 + Math.round(127 * flo));
                    //data_0_255[i + (j * data.length)] = Math.max(.01 * data_0_255[i], ((data.length - i) / data.length) * data_0_255[i]);
                }
            }
            return data_0_255;
        }
        var samples2 = convert255(target._dataview);
        wave.Make(samples2);
        return wave;
    }
});
