/*
    The sdta-list chunk in a SoundFont 2 compatible file contains a single optional smpl sub-chunk which contains
    all the RAM based sound data associated with the SoundFont compatible bank. The smpl sub- chunk is of arbitrary
    length, and contains an even number of bytes.

    The smpl sub-chunk, if present, contains one or more “samples” of digital audio information in the form of linearly
    coded sixteen bit, signed, little endian (least significant byte first) words. Each sample is followed by a minimum
    of forty-six zero valued sample data points. These zero valued data points are necessary to guarantee that any
    reasonable upward pitch shift using any reasonable interpolator can loop on zero data at the end of the sound.
*/

MEPH.define("MEPH.audio.soundfont.chunks.samples.SamplesChunk", {
    requires: [ 'MEPH.audio.soundfont.utils.SFByteArray',
                'MEPH.audio.soundfont.chunks.data.operators.Operator'],
    extend: 'MEPH.audio.soundfont.chunks.Chunk',
    statics: {
        SAMPLE_TAG: "smpl",//:String = ;
        SAMPLE_DATA_TAG: "sdta",//:String = ;
        SAMPLE_24_TAG: "sm24",//:String = ;
    },
    properties: {
        _offset: 0,//:uint = ;
        _bytes: null,//:SFByteArray
        _sample24Bytes: null,//:SFByteArray;
    },
    initialize: function (source)//:SFByteArray = null
    {
        this.callParent("SamplesChunk", source);
        this.nonSerializedProperties.push("length");
    },

    getOffset: function ()//:uint
    {
        return this._offset;
    },

    getBytes: function ()//:SFByteArray
    {
        return this._bytes;
    },

    getLength: function ()//:uint
    {
        return this._bytes.length;
    },

    parse: function (value)//:SFByteArray //:void
    {
        this._format = value.readString(4);
        this._chunkSize = value.readDWord();
        if (this._format == SamplesChunk.SAMPLE_TAG) {
            this._offset = value.position;
            this._bytes = new SFByteArray();
            value.readBytes(this._bytes, 0, this._chunkSize);
        }
        else {
            this.trace("ERROR! Samples::set bytes: unrecognized type:", _format);
        }
    }
});