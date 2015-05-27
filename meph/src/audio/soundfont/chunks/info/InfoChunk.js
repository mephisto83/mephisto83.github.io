/*
    The INFO-list chunk in a SoundFont 2 compatible file contains three mandatory and a variety of optional sub-chunks.
    The INFO-list chunk gives basic information about the SoundFont compatible bank that is contained in the file.
*/



MEPH.define("MEPH.audio.soundfont.chunks.info.InfoChunk", {
    requires: ['MEPH.audio.soundfont.utils.SFByteArray'],
    extend: 'MEPH.audio.soundfont.chunks.Chunk',
    statics: {
        INFO_TAG: "INFO",//:String = ;
        RIFF_VERSION_TAG: "ifil",//:String = ;
        TARGET_ENGINE_TAG: "isng",//:String = ;
        BANK_NAME_TAG: "INAM",//:String = ;
        ROM_NAME_TAG: "irom",//:String = ;
        ROM_VERSION_TAG: "iver",//:String = ;
        CREATION_DATE_TAG: "ICRD",//:String = ;
        ENGINEERS_TAG: "IENG",//:String = ;
        PRODUCT_TAG: "IPRD",//:String = ;
        COPYRIGHT_TAG: "ICOP",//:String = ;
        COMMENTS_TAG: "ICMT",//:String = ;
        TOOLS_TAG: "ISFT"//:String = ;
    },
    properties: {
        properties: null,//:Object = ;
    },
    initialize: function (source)//:SFByteArray = null
    {
        this.properties = {};
        this.callParent("InfoChunk", source);
    },

    parse: function (value)//:SFByteArray //:void
    {
        while (value.bytesAvailable() > 0) {
            this._format = value.readString(4);
            this._chunkSize = value.readDWord();
            switch (this._format) {
                case InfoChunk.RIFF_VERSION_TAG:
                    {
                        var version =//:Object 
                        {
                            major: value.readWord(),
                            minor: value.readWord()
                        };
                        this.properties["version"] = version;
                        break;
                    }
                case InfoChunk.ROM_VERSION_TAG:
                    {
                        var romVersion =//:Object 
                        {
                            major: value.readWord(),
                            minor: value.readWord()
                        };
                        this.properties["romVersion"] = romVersion;
                        break;
                    }
                case InfoChunk.TARGET_ENGINE_TAG:
                    {
                        this.properties["targetEngine"] = value.readString(this._chunkSize);
                        break;
                    }
                case InfoChunk.BANK_NAME_TAG:
                    {
                        this.properties["bankName"] = value.readString(this._chunkSize);
                        break;
                    }
                case InfoChunk.ROM_NAME_TAG:
                    {
                        this.properties["romName"] = value.readString(this._chunkSize);
                        break;
                    }
                case InfoChunk.CREATION_DATE_TAG:
                    {
                        this.properties["creationDate"] = value.readString(this._chunkSize);
                        break;
                    }
                case InfoChunk.ENGINEERS_TAG:
                    {
                        this.properties["engineers"] = value.readString(this._chunkSize);
                        break;
                    }
                case InfoChunk.PRODUCT_TAG:
                    {
                        this.properties["product"] = value.readString(this._chunkSize);
                        break;
                    }
                case InfoChunk.COPYRIGHT_TAG:
                    {
                        this.properties["copyright"] = value.readString(this._chunkSize);
                        break;
                    }
                case InfoChunk.COMMENTS_TAG:
                    {
                        this.properties["comments"] = value.readString(this._chunkSize);
                        break;
                    }
                case InfoChunk.TOOLS_TAG:
                    {
                        this.properties["tools"] = value.readString(this._chunkSize);
                        break;
                    }
                    // If we find a "LIST" tag, we've gone too far. So we need to set the byteArray position
                    // back and then scram.
                case Chunk.LIST_TAG:
                    {
                        value.position -= 8;
                        return;
                        break;
                    }
                default:
                    {
                        this.raiseError("Info::set bytes: Unrecognized tag! format: " + this._format);
                        break;
                    }
            }
        }
    }
});