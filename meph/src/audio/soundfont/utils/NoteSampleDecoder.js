
MEPH.define("MEPH.audio.soundfont.utils.NoteSampleDecoder", {
    requires: ['MEPH.audio.soundfont.NoteSample',
                "MEPH.audio.soundfont.utils.PCMDecoder",
                "MEPH.audio.soundfont.utils.PCM16BitMono44Khz",
                "MEPH.audio.soundfont.utils.PCM8BitMono44Khz"],
    extend: "MEPH.audio.soundfont.SFObject",
    properties: {
        noteSample: null,//NoteSample
        _decoder: null,//PCMDecoder
        _buffer: null, //= new ByteArray();
    },
    initialize: function (noteSample)//:NoteSample
    {
        this.noteSample = noteSample;
    },
    setup: function (samplerate, decoder) {
        if (this._decoder == null) {
            if (decoder) {
                var pcmStrategy = new PCM8BitMono44Khz(null, samplerate);//:IPCMIOStrategy 
            } else
                var pcmStrategy = new MEPH.audio.soundfont.utils.PCM8BitMono44Khz(null, samplerate);//:IPCMIOStrategy 
            this._decoder = new MEPH.audio.soundfont.utils.PCMDecoder(this.noteSample.sample.bytes, pcmStrategy);
        }
    },
    extract: function (target, length, startPosition, samplerate, decoder)//:ByteArray  //:Number  //:Number  //:Number
    {
        if (!this._buffer) {
            this._buffer = new ArrayBuffer(length);
        }
        this._buffer.position = 0;
        if (this._decoder == null) {
            if (decoder) {
                var pcmStrategy = new PCM8BitMono44Khz(null, samplerate);//:IPCMIOStrategy 
            } else
                var pcmStrategy = new MEPH.audio.soundfont.utils.PCM8BitMono44Khz(null, samplerate);//:IPCMIOStrategy 
            this._decoder = new MEPH.audio.soundfont.utils.PCMDecoder(this.noteSample.sample.bytes, pcmStrategy);
        }
        // Tonfall's PCM16BitMono44Khz strategy deals in samples of 16 bits. 
        // NoteSample's start, loopStart, end &
        // loopEnd are byte offsets (of 8 bits) so we need to divide 
        // them by 2 to arrive at the correct values here
        var tStart = this.noteSample.getStart() / 2;//:uint 
        var tLoopStart = this.noteSample.getLoopStart() / 2;//:uint 
        var tLoopEnd = this.noteSample.getLoopEnd() / 2;//:uint 
        var tLoopOffset = tLoopStart - tStart;//:uint 
        var tLoopLength = tLoopEnd - tLoopStart;//:uint 
        var numSamplesRead = 0;//:int 
        var position = tStart + startPosition;//:Number 
        // MORE SAMPLES NEEDED?
        var tNumSamplesRead = 0;//:int 
        while (numSamplesRead < length) {
            if (position >= tLoopEnd) {
                position = tLoopStart + (position - tLoopStart) % tLoopLength;
            }
            tNumSamplesRead = this._decoder.extract(target, length, position);
            numSamplesRead += tNumSamplesRead;
            position += tNumSamplesRead;
        }
        return numSamplesRead;
    },
    stream: function (target, sample, position)//:ByteArray  //:Number  //:Number  //:Number
    {
        //if (!this._buffer) {
        //    this._buffer = new ArrayBuffer(length);
        //}
        //this._buffer.position = 0;
        //if (this._decoder == null) {
        //    if (decoder) {
        //        var pcmStrategy = new PCM8BitMono44Khz(null, samplerate);//:IPCMIOStrategy 
        //    } else
        //        var pcmStrategy = new PCM16BitMono44Khz(null, samplerate);//:IPCMIOStrategy 
        //    this._decoder = new PCMDecoder(this.noteSample.sample.bytes, pcmStrategy);
        //}
        // Tonfall's PCM16BitMono44Khz strategy deals in samples of 16 bits. 
        // NoteSample's start, loopStart, end &
        // loopEnd are byte offsets (of 8 bits) so we need to divide 
        // them by 2 to arrive at the correct values here
        //var tStart = this.noteSample.getStart() / 2;//:uint 
        //var tLoopStart = this.noteSample.getLoopStart() / 2;//:uint 
        //var tLoopEnd = this.noteSample.getLoopEnd() / 2;//:uint 
        //var tLoopOffset = tLoopStart - tStart;//:uint 
        //var tLoopLength = tLoopEnd - tLoopStart;//:uint 
        //var numSamplesRead = 0;//:int 
        //var position = tStart + startPosition;//:Number 
        // MORE SAMPLES NEEDED?
        //var tNumSamplesRead = 0;//:int 
        //while (numSamplesRead < length) {
        //    if (position >= tLoopEnd) {
        //        position = tLoopStart + (position - tLoopStart) % tLoopLength;
        //    }
        // this._decoder.stream(target, sample, position);
        //    numSamplesRead += tNumSamplesRead;
        //    position += tNumSamplesRead;
        //}
        //return numSamplesRead;
    }
});