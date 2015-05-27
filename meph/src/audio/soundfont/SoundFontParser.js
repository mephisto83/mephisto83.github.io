

MEPH.define("MEPH.audio.soundfont.SoundFontParser", {
    requires: ['MEPH.audio.soundfont.chunks.SoundFontChunk',
                'MEPH.audio.soundfont.SoundFont',
                'MEPH.audio.soundfont.utils.SFByteArray'],
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
        var bytes = new MEPH.audio.soundfont.utils.SFByteArray(data);//:SFByteArray 
        var soundFontChunk = new MEPH.audio.soundfont.chunks.SoundFontChunk(bytes);//:SoundFontChunk 
        var soundFont = new MEPH.audio.soundfont.SoundFont(soundFontChunk);//:SoundFont 
        this.soundFonts.push(soundFont);
        return soundFont;
    }
});
