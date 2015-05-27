/*
    The RIFF (Resource Interchange File Format) is a tagged file structure developed for multimedia resource files,
    and is described in some detail in the Microsoft Windows SDK Multimedia Programmer’s Reference. The tagged-file
    structure is useful because it helps prevent compatibility problems which can occur as the file definition changes
    over time. Because each piece of data in the file is identified by a standard header, an application that does
    not recognize a given data element can skip over the unknown information.

    A RIFF file is constructed from a basic building block called a “chunk.” In ‘C’ syntax, a chunk is defined:

    typedef DWORD FOURCC;    // Four-character code

    typedef struct
    {
        FOURCC DWORD BYTE
        ckID;    // A chunk ID identifies the type of data within the chunk.
        ckSize;    // The size of the chunk data in bytes, excluding any pad byte.
        ckDATA[ckSize];    // The actual data plus a pad byte if req’d to word align.
    };
    Two types of chunks, the “RIFF” and “LIST” chunks, may contain nested chunks called sub-chunks as their data.
*/


MEPH.define("MEPH.audio.soundfont.chunks.Chunk", {
    requires: ['MEPH.audio.soundfont.utils.SFByteArray'],
    extend: 'MEPH.audio.soundfont.SFObject',
    statics: {

        /// import com.ferretgodmother.soundfont.utils.SFByteArray;
        /// import com.ferretgodmother.soundfont.SFObject;

        RIFF_TAG: "RIFF",//:String = 
        LIST_TAG: "LIST",//:String = 
    },
    properties: {
        _format: null,//protected var ;
        _chunkSize: 0//:uint;
    },
    initialize: function (type, source)//:SFByteArray = null
    {
        this.callParent(type);
        if (source != null) {
            this.parse(source);
        }
    },
    parse: function (value)//:SFByteArray :void
    {
        // ABSTRACT
    }
});
