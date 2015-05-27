MEPH.define('MEPHControls.music.controller.Controller', {
    extend: 'MEPH.controller.Controller',
    requires: [
        'MEPH.util.FileReader',
        'MEPH.audio.Audio',
        'MEPH.util.Observable'
    ],
    properties: {
        fileResources: null,
        soundFileMarks: null,
        range: 100,
        timeScroll: 100,
        lastSong: null,
        magnification: 0,
        timeWindow: null,
        visualizedFile: null,
        visualizedFileType: null,
        banks: null,
        stretchMarks: null
    },
    initialize: function () {
        var me = this;
        me.great()
        ///meph-event-change="ct$.loadBytes, ct$.lastSong | v$.drawBytes"
        var source = [];
        MEPH.util.Observable.observable(source)
        me.stretchMarks = MEPH.util.Observable.observable([]);
        me.soundFileMarks = MEPH.util.Observable.observable([])
        me.banks = MEPH.util.Observable.observable([])
        me.fileResources = source;
    },
    loadFiles: function () {
        var me = this;
        var args = MEPH.util.Array.convert(arguments);
        var evntArgs = args.last();

        var files = args.last();

        return FileReader.readFileList(files.domEvent.files, { readas: 'ArrayBuffer' }).then(function (res) {
            res.foreach(function (t) {
                me.fileResources.push(t);
            })
        }).then(null, function (e) {
            console.log(e);
        });
    },
    visualizeFile: function (file, res) {
        var me = this;
        me.visualizedFile = file.name;
        me.visualizedFileType = file.type;
        switch (file.type) {
            case 'audio/wav':
            case 'audio/mp3':
                return { res: res };
            default:
                return null;
        }
    },
    loadBytes: function (file, songBytes) {
        var me = this;
        if (!songBytes) {
            return null;
        }
        var audio = new MEPH.audio.Audio();

        if (me.lastSong) {
            me.lastSong = null;
        }
        me.lastSong = songBytes;

        return audio.loadByteArray(songBytes.res, null, file.name, file.type).then(function (result) {
            me.result = result;
            me.lastSong = result;

            return MEPH.audio.Audio.copy(result);
        });
    },
    removeSnippet: function (data) {
        var me = this;
        me.banks.removeWhere(function (x) { return x === data; });
    },
    createResource: function (name, clip) {
        var audio = new MEPH.audio.Audio();
        var buffer = audio.addBufferSource({
            buffer: clip.clip.buffer,
            file: clip.name,
            type: clip.type
        })
        MEPH.publish(MEPH.audio.Constants.CREATE_GRAPH, buffer.id, clip.name);
    },
    timeWindowCalc: function () {
        var me = this;
        var magnification = parseFloat(me.magnification || 100);
        if (me.result) {
            me.timeWindow = me.result.buffer.buffer.duration / magnification;
        }
        return me.magnification;
    },
    getSnippet: function () {
        var me = this;
        if (!me.result) {
            return null;
        }
        var audio = new MEPH.audio.Audio();
        var magnification = parseFloat(me.magnification || 100);
        var timeScroll = parseFloat(me.timeScroll || 0) / 100;
        var start = timeScroll * me.result.buffer.buffer.duration;
        var time = me.result.buffer.buffer.duration / magnification;



        var res = MEPH.audio.Audio.clip(me.result, start, Math.min(me.result.buffer.buffer.duration, time + start));
        return res;

    },
    playSnippet: function () {

        var me = this;
        var arg = MEPH.Array(arguments).last();
        var _start = arg.domEvent.start;
        var _end = arg.domEvent.end;

        var audio = new MEPH.audio.Audio();
        var magnification = parseFloat(me.magnification || 100);
        var timeScroll = parseFloat(me.timeScroll || 0) / 100;
        var start = timeScroll * me.result.buffer.buffer.duration;
        var time = me.result.buffer.buffer.duration / magnification;



        var res = MEPH.audio.Audio.clip(me.result, start + (time * _start),
            Math.min(me.result.buffer.buffer.duration, (time * _end) + start));
        return res;
    },
    saveClipToBank: function () {
        var me = this;

        var snippets = MEPH.Array(arguments).last().domEvent.snippets;
        if (snippets) {
            snippets.foreach(function (snippet) {
                if (snippet) {
                    var time = snippet.buffer.buffer.duration;
                    me.banks.push({
                        id: MEPH.GUID(),
                        clip: snippet,
                        name: me.visualizedFile,
                        type: me.visualizedFileType,
                        time: time
                    });
                }
            })
        }
    },
    sliceClipToBank: function () {
        var me = this;
        var filemarks = me.soundFileMarks;


        var audio = new MEPH.audio.Audio();
        var magnification = parseFloat(me.magnification || 100);
        var timeScroll = parseFloat(me.timeScroll || 0) / 100;
        var start = timeScroll * me.result.buffer.buffer.duration;
        var _time = me.result.buffer.buffer.duration / magnification;
        var resources = filemarks.orderBy(function (x, y) {
            return x.position - y.position;
        }).select(function (mark, i) {
            if (i) {
                var pos2 = filemarks[i].position;
                var pos1 = filemarks[i - 1].position;
                var substart = start + (_time * pos1);
                var subend = (_time * pos2) + start;
                var res = MEPH.audio.Audio.clip(me.result, substart,
                    Math.min(me.result.buffer.buffer.duration, subend));
                return { time: subend - substart, res: res };
            }
            return null
        }).where().foreach(function (r) {
            me.banks.push({
                id: MEPH.GUID(),
                clip: r.res,
                name: me.visualizedFile + ' ' + MEPH.GUID().split('').subset(0, 3).join(''),
                type: me.visualizedFileType,
                time: r.time
            });
        });

    },
    captureSnippet: function () {
        var me = this;
        return me.getSnippet();
    },
    createSnippets: function () {
        var me = this;
        console.log('create snippets of files');
        console.log(arguments);
    }
});