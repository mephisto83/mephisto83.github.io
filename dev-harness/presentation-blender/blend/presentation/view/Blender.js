(function () {
    var getTime = function (tempTrack, midiTracks, evt) {
        var track = tempTrack;
        var totalTime = 0;
        var lastclock = 0;
        var lastbeats = (120 / 60);
        var lastTicksPerBeat = midiTracks.header.ticksPerBeat;
        if (track && track.tempos)
            track.tempos.first(function (tempo) {
                if (tempo.clock > evt.clock) {
                    return true;
                }
                var beats = (tempo.clock - lastclock) / lastTicksPerBeat;
                var second = beats / lastbeats;
                lastclock = tempo.clock;
                lastbeats = (tempo.beatsPerMinute / 60);
                lastTicksPerBeat = tempo.ticksPerBeat;
                totalTime += second;
            });
        var beats = (evt.clock - lastclock) / lastTicksPerBeat;
        var second = beats / (lastbeats || (120 / 60));
        totalTime += second;
        return totalTime;
    };
    MEPH.define('Blend.presentation.view.Blender', {
        alias: 'blend_preseentation',
        templates: true,
        extend: 'MEPH.mobile.activity.container.Container',
        mixins: ['MEPH.mobile.mixins.Activity'],
        requires: [
            'MEPH.input.Number', 'MEPH.input.Text',
            'MEPH.input.MultilineText',
            'MEPH.audio.music.theory.Scales',
            'MEPH.list.View',
            'Blend.presentation.template.MidiFile',
            'MEPH.audio.midi.reader.MidiFile',
            'MEPH.util.Observable',
            'MEPH.input.File',
            'MEPH.file.FileSaver', 'MEPH.button.Button',
            'MEPH.audio.music.theory.Notes',
            'MEPH.file.Dropbox', 'MEPH.util.FileReader'],
        statics: {
            BlendObjects: ["OrbLight"],
            Materials: ["BlackShiny", "White", "Green", "Red", "Blue", 'Orange', 'Pink', 'Purple']
        },
        properties: {
            extrude: 0.07,
            blockspacing: 2.1,
            maxheight: 10,
            framesPerData: 3,
            framespertext: 75, 
            result: null,
            midiFiles: null,
            textalign: 'LEFT',
            splitWith: ';',
            wordCountNewLine: 4,
            textinput: null
        },
        initialize: function () {
            var me = this;
            me.fileSaver = new MEPH.file.FileSaver();
            me.callParent.apply(me, arguments);
            me.on('load', me.onLoaded.bind(me));
            me.midiFiles = MEPH.util.Observable.observable([]);
            MEPH.loadJSCssFile(MEPH.getSourcePath('Blend.presentation.template.batFile', '.html'), 'string', null, null, null, 'text/html').then(function (res) {
                me.batFileTemplate = res.response;
            });
            MEPH.loadJSCssFile(MEPH.getSourcePath('Blend.presentation.template.blenderRender', '.html'), 'string', null, null, null, 'text/html').then(function (res) {
                me.blenderRenderTemplate = res.response;
            });

            MEPH.loadJSCssFile(MEPH.getSourcePath('Blend.presentation.template.pythonScript', '.html'), 'string', null, null, null, 'text/html').then(function (res) {
                me.pythonScriptTemplate = res.response;
            });
            MEPH.audio.music.theory.Scales.init();
        },
        emptyRoom: function () {
            var me = this;
            me.stationaryCamera("D:\\dev\\Python\\Blender\\Presentation\\Stages\\wysiwyg.blend", false, true)
        },
        brickRoadStarWars: function () {
            var me = this;
            me.stationaryCamera("D:\\Render\\Presenatation\\Test\\3\\untitled1.blend", true, false)
        },
        stationaryCamera: function (stagefile, addcamera, vertialcalText) {
            var me = this;
            var textinput = me.textinput;

            var texts = textinput.split(me.splitWith || ';').where(function (x) { return x; }).select(function (x, index) {
                return {
                    "name": "text_" + index,
                    "type": "text",
                    "value": x + (me.splitWith || ';'),
                    "align": me.textalign,
                    "material": ["MedLightBlue", "MedLightWhite"].random().first(),
                    "rotation": { "x": vertialcalText ? 90 : 0, "y": 0, "z": 0 },
                    "scale": { "x": .6, "y": .6, "z": .6 },
                    "font": "segoeuib",
                    "extrude": me.extrude
                }
            });
            texts.foreach(function (t) {
                t.value = t.value.split(' ').where().select(function (x, index) {
                    if (index % me.wordCountNewLine === 0)
                        return x + ' ' + '\n';
                    return x + ' ';
                }).join('')
            })
            var chain = texts.select(function (x) { return x.name; });
            texts.push({
                "name": "default_camera",
                "position": { "x": -10, "y": 0, "z": 10 },
                "type": "camera"
            },
                   {
                       "name": "default_empty",
                       "position": { "x": 0, "y": 0, "z": 0 },
                       "type": "empty"
                   })
            var objects = texts.select(function (x) {
                return {
                    name: x.name
                }
            })
            objects.push({
                "name": "default_camera",
                "target": "default_empty"
            }, {
                "name": "default_empty",
            });
            var keyframes = [{
                "frame": 1,
                "objects": objects
            }];
            var framesper = me.framespertext;
            var outofframe = {
                x: -30,
                y: -0,
                z: 0
            };
            var inframe = {
                x: 0,
                y: 0,
                z: 0
            }
            var innframeoffset = 10;
            var outframeoffset = 60;
            var outframe = {
                x: 20,
                y: 0,
                z: 0
            };
            texts.where(function (t) {
                return t.type !== 'camera' && t.type !== 'empty'
            }).foreach(function (text, I) {
                var index = I * 2;

                var frame = I * outframeoffset;
                keyframes.push({
                    "frame": frame,
                    "objects": [{
                        "name": text.name,
                        "position": outofframe
                    }]
                });
                keyframes.push({
                    "frame": frame + innframeoffset,
                    "objects": [{
                        "name": text.name,
                        "position": inframe
                    }]
                });

                keyframes.push({
                    "frame": frame + outframeoffset - innframeoffset,
                    "objects": [{
                        "name": text.name,
                        "position": inframe
                    }]
                });

                keyframes.push({
                    "frame": frame + outframeoffset,
                    "objects": [{
                        "name": text.name,
                        "position": outframe
                    }]
                });

            });
            var t = {
                frame: 1,
                "objects": [{
                    "name": "default_empty",
                    "position": { "x": 0, "y": 0, "z": 0 }
                }]
            }
            if (addcamera) {
                t.objects.push({
                    "name": "default_camera",
                    "position": { "x": 1.5, "y": -5, "z": 5 },
                    "target": "default_empty"
                });
            }
            keyframes.push(t);
            var res = {
                "settings": {
                    "RenderEngine": "CYCLES",
                    "Materials": {
                        "File": "D:\\dev\\Python\\Blender\\Presentation\\Material\\mat.blend",
                        "Names": ["White", "Green", "Red", "Blue"]
                    }
                },
                "scenes": [
                    {
                        "name": "default",
                        "stage": {
                            "File": stagefile,//"D:\\Render\\Presenatation\\Test\\3\\untitled1.blend",
                            "Group": "Stage"
                        },
                        "armatures": [],
                        objects: texts,
                        keyframes: keyframes
                    }]
            };
            me.save(res);
        },
        clickedButton: function () {
            var me = this;
            var textinput = me.textinput;

            var texts = textinput.split(me.splitWith || ';').where(function (x) { return x; }).select(function (x, index) {
                return {
                    "name": "text_" + index,
                    "type": "text",
                    "value": x + (me.splitWith || ';'),
                    "align": me.textalign,
                    "material": ["White", "Green", "Red", "Blue"].random().first(),
                    "rotation": { "x": 90, "y": 0, "z": 0 },
                    "scale": { "x": .3, "y": .3, "z": .3 },
                    "font": "mriamc",
                    "extrude": me.extrude
                }
            });
            texts.foreach(function (t) {
                t.value = t.value.split(' ').where().select(function (x, index) {
                    if (index % me.wordCountNewLine === 0)
                        return x + ' ' + '\n';
                    return x + ' ';
                }).join('')
            })
            var chain = texts.select(function (x) { return x.name; });
            texts.push({
                "name": "default_camera",
                "type": "camera"
            }, {
                "name": "default_empty",
                "type": "empty"
            });

            var objects = texts.select(function (x) {
                return {
                    name: x.name
                }
            })
            objects.push({
                "name": "default_camera",
                "position": { "x": 0, "y": 2, "z": 0 },
                "target": "default_empty"
            }, {
                "name": "default_empty",
                "position": { "x": 0, "y": 0, "z": 0 }
            });
            var keyframes = [{
                "frame": 1,
                "objects": objects
            }];
            var framesper = me.framespertext
            texts.foreach(function (text, I) {
                var index = I * 2;
                keyframes.push({
                    "frame": 10 + (framesper * index),
                    "objects": [
                        {
                            "name": "default_camera",
                            "position_rel": {
                                "target": text.name,
                                "position": "front"
                            }
                        },
                        {
                            "name": "default_empty",
                            "position_rel": {
                                "target": text.name,
                                "position": "center"
                            }
                        }
                    ]
                }, {
                    "frame": 10 + (framesper * (1 + index)),
                    "objects": [
                        {
                            "name": "default_camera",
                            "position_rel": {
                                "target": text.name,
                                "position": "front"
                            }
                        },
                        {
                            "name": "default_empty",
                            "position_rel": {
                                "target": text.name,
                                "position": "center"
                            }
                        }
                    ]
                })
            })
            var res = {
                "settings": {
                    "RenderEngine": "CYCLES",
                    "fonts": "D:\\Downloads\\",
                    "Materials": {
                        "File": "D:\\dev\\Python\\Blender\\Presentation\\Material\\mat.blend",
                        "Names": ["White", "Green", "Red", "Blue"]
                    }
                },
                "scenes": [
                    {
                        "name": "default",
                        "armatures": [
                         {
                             "name": "test_" + MEPH.GUID(),
                             "chain": chain,
                             "grid": {
                                 "x": 10,
                                 "y": 10,
                                 "z": 10
                             }
                         }],
                        objects: texts,
                        keyframes: keyframes
                    }]
            };
            me.save(res);
        },
        loadFileInput: function () {
            var me = this;
            var mfi = document.getElementById('midiFileInput')

            return me.loadMidis({ domEvent: mfi });
        },
        loadMidis: function () {
            var me = this;
            var args = MEPH.util.Array.convert(arguments);
            var evntArgs = args.last();
            var files = args.last();

            return FileReader.readFileList(files.domEvent.files, { readas: 'BinaryString' })
                .then(function (res) {
                    res.foreach(function (t) {
                        t.trackNames = MEPH.util.Observable.observable([]);
                        t.texts = MEPH.util.Observable.observable([]);
                        t.markers = MEPH.util.Observable.observable([]);
                        me.readMetaData(t);
                    })
                    me.midiFiles.push.apply(me.midiFiles, res);
                })
        },
        rename: function (name) {
            '!@#$%^&*()_+{}[]-=/*-.:"\\<>??'.split('').forEach(function (t) {
                name = name.split(t).join('');
            });
            return name;
        },
        readMetaData: function (data) {
            var me = this,
                MidiFile = MEPH.audio.midi.reader.MidiFile;

            var file = new MidiFile();
            var result = file.create(data.res);
            data.trackNames.dump();
            data.markers.dump();
            data.texts.dump();
            if (result) {
                result.tracks.forEach(function (track) {
                    var clock = 0;

                    var trackObjects = [];
                    var trackEvents = [];
                    var trackTempos = [];
                    var trackNames = [];
                    track.forEach(function (evt) {
                        if (evt.type === 'meta') {
                            switch (evt.subtype) {
                                case "trackName":
                                    data.trackNames.push(evt.text);
                                    break;
                                case "text":
                                    data.texts.push(evt.text);
                                    break;
                                case "markers":
                                    data.markers.push(evt.text);
                                    break;
                                default:
                                    var eventsubtype = evt.subtype;
                                    break;
                            }
                        }
                    })
                })
            }
        },
        loadMidi: function () {
            var me = this,
                MidiFile = MEPH.audio.midi.reader.MidiFile,
                data = me.getDomEventArg(arguments);

            var file = new MidiFile();
            var result = file.create(data.res);
            var midiTracks = [];
            var fileName = me.rename(data.file.name);
            data.trackNames.dump();
            data.markers.dump();
            data.texts.dump();
            if (result) {
                result.tracks.forEach(function (track) {
                    var clock = 0;

                    var trackObjects = [];
                    var trackEvents = [];
                    var trackTempos = [];
                    var trackNames = [];
                    track.forEach(function (evt) {
                        if (evt.deltaTime) {
                            clock += evt.deltaTime;
                        }
                        if (evt.type === 'meta') {
                            switch (evt.subtype) {
                                case 'setTempo':
                                    trackTempos.push({
                                        beatsPerMinute: 60000000 / evt.microsecondsPerBeat,
                                        ticksPerBeat: result.header.ticksPerBeat,
                                        evt: evt,
                                        clock: clock
                                    });
                                    break;
                                case "trackName":
                                    data.trackNames.push(evt.text);
                                    break;
                                case "text":
                                    data.texts.push(evt.text);
                                    break;
                                case "markers":
                                    data.markers.push(evt.text);
                                    break;
                                default:
                                    var eventsubtype = evt.subtype;
                                    break;
                            }
                        }
                        else if (evt.type === 'channel') {

                            switch (evt.subtype) {
                                case 'noteOn':
                                case 'noteOff':
                                    if (!trackObjects.some(function (obj) {
                                        return obj.noteNumber === evt.noteNumber && obj.channel === evt.channel;
                                    })) {
                                        trackObjects.push({
                                            note: MEPH.audio.music.theory.Notes.convertToNote(evt.noteNumber),
                                            noteNumber: evt.noteNumber,
                                            channel: evt.channel
                                        });
                                    }

                                    var te = trackEvents.first(function (x) {
                                        return x.start.channel === evt.channel &&
                                        x.start.noteNumber === evt.noteNumber && !x.complete;
                                    });
                                    if (!te) {
                                        te = {
                                            start: evt,
                                            note: MEPH.audio.music.theory.Notes.convertToNote(evt.noteNumber),
                                            complete: false,
                                            noteNumber: evt.noteNumber,
                                            channel: evt.channel,
                                            clock: clock,
                                            end: null
                                        }
                                        trackEvents.push(te);
                                    }
                                    else {
                                        te.end = evt;
                                        te.endclock = clock;
                                        te.complete = true;
                                    }
                                    break;
                            }
                        }
                    });
                    var currentSelection = [];
                    var trackClock = 0;
                    var currentTrackNotes = {};
                    var start = null;
                    var end;
                    var currentTrackNotesArray = [];
                    trackEvents.forEach(function (obj, i) {
                        trackClock = obj.clock;

                        if (start === null) {
                            start = trackClock;
                        }
                        var removed = currentSelection.removeWhere(function (t) {
                            if (t.endclock === null) {
                                debugger;
                            }
                            if (!(t.clock <= trackClock && t.endclock >= trackClock)) {
                                return true;
                            }
                            return false;
                        });
                        if (removed.length) {
                            currentTrackNotes.notes = currentSelection.select(function (t) {
                                return t.noteNumber
                            });
                            removed.forEach(function (t) {
                                currentTrackNotes.notes.push(t.noteNumber);
                            });
                            currentTrackNotes.notes = currentTrackNotes.notes.unique();
                            currentTrackNotes.notes.sort();
                            currentTrackNotes.start = start;
                            currentTrackNotes.end = trackClock;
                            if (currentTrackNotes.notes.length > 2)
                                currentTrackNotesArray.push(currentTrackNotes)
                            currentTrackNotes = {};
                            start = trackClock;
                        }
                        currentSelection.push(obj);
                    });
                    trackObjects.sort(function (x, y) {
                        return x.noteNumber - y.noteNumber;
                    });
                    currentTrackNotesArray.where(function (t) {
                        return t.notes.length > 2;
                    }).forEach(function (info) {
                        var base = info.notes.select(function (t, i) {
                            return t - info.notes[0];
                        });
                        var found = TheoryScales.getVoice(base, true);
                        if (found) {
                            info.scaleInfo = found;
                        }
                        else {
                            info.scaleInfo = null;
                        }
                    });
                    midiTracks.push({
                        chords: currentTrackNotesArray,
                        tempos: trackTempos,
                        objects: trackObjects,
                        events: trackEvents,
                        endclock: clock
                    })
                });
            }
            midiTracks.header = result.header;
            midiTracks.fileName = fileName;
            midiTracks.orginalName = data.file.name;
            return midiTracks;
        },
        generateAllMovies: function (func) {
            var me = this;
            var promise = Promise.resolve();
            var jobId = Date.now();
            var jobFiles = [];
            var renderJob = 'renderBat_' + jobId + '.bat';
            var jobResources = ['anim_video_editor.py', 'render.py', 'mat.blend', 'objects.blend'];
            //v$.loadMidi | v$.generateSquareMovie | v$.saveMidiMovie
            me.blenderRenderInfos = [];
            me.midiFiles.select(function (x) {
                promise = promise.then(function () {
                    return me.loadMidi({
                        domEvent: {
                            data: x
                        }
                    });
                }).then(func)
                    .then(me.saveMidiMovie.bind(me))
                    .catch(function (e) {
                        debugger
                        MEPH.Log(e);
                    }).then(function () {
                        console.log('saved midi file')
                        return new Promise(function (resolve) {
                            setTimeout(function () {
                                resolve();
                            }, 1000)
                        });
                    });
            });
            return promise.then(function () {
                var completeBat = me.midiFiles.select(function (data) {
                    var fileName = me.rename(data.file.name);
                    return fileName;
                }).select(function (t) {
                    var presentationBat = 'presentation-blend-' + t + '.bat';
                    jobFiles.push(presentationBat);

                    var jsonFileName = 'presentation-json-' + t + '.js';
                    var blendfile = 'presentation-bl-' + t + '.blend';
                    var pyfile = 'presentation-py-' + t + '.py';
                    jobFiles.push(jsonFileName);
                    jobFiles.push(blendfile);
                    jobFiles.push(pyfile);

                    return 'call ' + presentationBat + ' \n';
                }).join('');
                completeBat = completeBat + '\n call ' + renderJob + '\n'
                var jobbat = 'completeBat_' + jobId + '.bat';
                me.saveFile(jobbat, completeBat, 'application/bat');
                jobFiles.push(jobbat);
            }).then(function () {
                var renderbatch = me.blenderRenderInfos.select(function (info) {
                     

                    var audio_file = info.orginalName.split('').subset(0, info.orginalName.length - 3).join('') + 'mp3';
                    var batFileTemplate = MEPH.util.Template.bindTemplate(me.blenderRenderTemplate, {
                        file: 'presentation-bl-' + info.file + '.blend',
                        output: '//output/' + 'presentation-bl-' + info.file + '/',
                        py_output: '\\output\\' + 'presentation-bl-' + info.file + '\\',
                        name: info.orginalName.split('').subset(0, info.orginalName.length - 4).join(''),
                        audio_file: audio_file,
                        audio_output_window: '.\\output\\audio-' + 'presentation-bl-' + info.file + '\\',
                        audio_output: '//output/audio-' + 'presentation-bl-' + info.file + '/',
                        py_audio_output: '\\output\\audio-' + 'presentation-bl-' + info.file + '\\',
                        startframe: info.start,
                        endframe: info.end
                    });
                    jobFiles.push(audio_file);
                    return batFileTemplate;
                }).join('\n');
                me.saveFile(renderJob, renderbatch, 'application/bat');
                jobFiles.push(renderJob);

            }).then(function () {
                var job = {
                    resources: jobResources,
                    files: jobFiles,
                    jobId: jobId,
                    target: './jobs/projects/'
                };
                var jobtext = JSON.stringify(job);
                setTimeout(function () {
                    me.saveFile('meph_job_' + jobId + '.js', jobtext, 'application/javascript');
                }, 3000);
            });
        },
        generateAllSquareMovies: function () {
            var me = this;
            return me.generateAllMovies(me.generateSquareMovie.bind(me));
        },
        generateAllStageInfoMovie: function () {
            var me = this;
            return me.generateAllMovies(me.generateStageInfoMovie.bind(me));
        },
        saveMidiMovie: function (midiDef) {
            var me = this;

            me.save({
                fileName: midiDef.fileName,
                "settings": {
                    "RenderEngine": "CYCLES",
                    "FrameStart": midiDef.startFrame,
                    "FrameEnd": midiDef.startEnd,
                    "samples": "150",
                    "Device": "GPU",
                    "Objects": {
                        "File": "//objects.blend",
                        "Names": Blend.presentation.view.Blender.BlendObjects
                    },
                    "Materials": {
                        "File": "//mat.blend",
                        "Names": Blend.presentation.view.Blender.Materials
                    }
                },
                "scenes": [{
                    "name": "default",
                    "world": "SkyWorld",
                    "objects": midiDef.objects,
                    "keyframes": midiDef.keyframes
                }]
            });

            var pythonScripeTemplate = me.pythonScriptTemplate;
            var jsonFileName = 'presentation-json-' + midiDef.fileName + '.js';
            var blendfile = 'presentation-bl-' + midiDef.fileName + '.blend';
            var pyfile = 'presentation-py-' + midiDef.fileName + '.py';
            var batfile = 'presentation-blend-' + midiDef.fileName + '.bat';
            var pythonFile = MEPH.util.Template.bindTemplate(pythonScripeTemplate, {
                jsonfile: jsonFileName,
                blendfile: blendfile
            });
            var batFileTemplate = MEPH.util.Template.bindTemplate(me.batFileTemplate, {
                pythonFile: pyfile
            });
            me.saveFile(pyfile, pythonFile, 'application/x-python');

            me.saveFile(batfile, batFileTemplate, 'application/bat');
            //bat-presentation-blend
        },
        saveFile: function (file, text, type) {
            var me = this;
            var aFileParts = [text];
            var oMyBlob = new Blob(aFileParts, { type: type });
            me.fileSaver.save(oMyBlob, file);
        },
        generateStaffMovie: function (midiTracks) {
            var me = this;

            var objects = [];
            var keyframes = [];
            var framesPerSecond = 24;

            var midiTracksWithContent = midiTracks.where(function (track) {
                return track.objects.length && track.events.length;
            }).orderBy(function (x, y) {
                return x.events.length - y.events.length;
            });
            var tempTrack = midiTracks.first(function (x) { return x.tempos.length; })
            var midDim = Math.ceil(Math.sqrt(midiTracksWithContent.length));
            var trackSquareSize = 10;
            var maxHeight = 3;
            var maxVelocity = 128;
            var getName = function (track, key, channel) {
                return 'track_' + track + '_' + key + '_' + channel;
            }

            var trackEvents = midiTracksWithContent.concatFluent(function (x, i) {
                return x.events.select(function (t) { t.track = i; return t; });
            });
            var getTime = function (evt) {
                var track = tempTrack;
                var totalTime = 0;
                var lastclock = 0;
                var lastbeats;
                if (track && track.tempos)
                    track.tempos.first(function (tempo) {
                        if (tempo.clock > evt.clock) {
                            return true;
                        }
                        var beats = (tempo.clock - lastclock) / midiTracks.header.ticksPerBeat;
                        var second = beats / (tempo.beatsPerMinute / 60);
                        lastclock = tempo.clock;
                        lastbeats = (tempo.beatsPerMinute / 60)
                        totalTime += second;
                    });
                var beats = (evt.clock - lastclock) / midiTracks.header.ticksPerBeat;
                var second = beats / (lastbeats || (120 / 60));
                totalTime += second;
                return totalTime;
            }

            trackEvents.sort(function (a, b) {
                return a.clock - b.clock;
            });

            var freeObjects = [];
            var travelingObjects = [];
            var busyObjects = [];
            var currentTime = 0;
            var windowSize = 5000;
            var getAvailableObject = function (time) {
                var obj;
                if (freeObjects.length) {
                    obj = freeObjects.pop();
                }
                else {
                    obj = {
                        name: 'Obj' + MEPH.GUID().split('-').join(''),
                        type: 'cube'
                    };
                    objects.push(obj);
                }
                busyObjects.push({ time: time, obj: obj });
                return obj;
            };
            var relieveTraveledObjects = function (time) {
                var freeObs = travelingObjects.removeWhere(function (t) {
                    return t.time < time;
                }).select(function (x) { return x.obj; });
                freeObjects.push.apply(freeObjects, freeObs);
            };

            var travelDoneObjects = function (time, windowSize) {
                var objectsReadyToTravel = busyObjects.removeWhere(function (t) {
                    return t.time < time;
                });
                return objectsReadyToTravel.foreach(function (x) {
                    x.time = time + windowSize;
                    travelingObjects.push(x);
                }).select(function (x) { return x.obj; });
            };

            var getFrame = function (time) {
                var frameIndex = Math.round(time * framesPerSecond) + 1;
                var start_frame, mid_frame, end_frame;

                (function () {
                    start_frame = keyframes.first(function (frame) {
                        return frame.frame === frameIndex;
                    });
                    if (!start_frame) {
                        start_frame = {
                            frame: frameIndex,
                            objects: []
                        };
                        keyframes.push(start_frame);
                    }
                })();
                return start_frame;
            }
            var noteOffset = .25;
            var noteHeights = 30 * noteOffset;
            var middleC = noteHeights / 2;
            var secondDistance = 4;
            var scale = {
                x: .25,
                y: .25,
                z: noteOffset
            };
            var rotation = { x: 13, y: 1231, z: 12 };
            var getTrackOffset = function (track) {
                var trackpos = track * noteHeights;
                return {
                    x: 0,
                    z: trackpos,
                    y: 0
                }
            };

            var getNotePosition = function (evt) {
                var trackOffset = getTrackOffset(evt.track || 0);
                var z = noteOffset * ((evt.noteNumber || 60) - 60 + middleC);
                var time = getTime(evt);
                var x = secondDistance * time;

                return {
                    x: x + trackOffset.x,
                    y: trackOffset.y,
                    z: z + trackOffset.z
                }
            };

            trackEvents.forEach(function (evt, i) {
                var time = getTime(evt) * 1000;
                var endtime = getTime({ clock: evt.endclock }) * 1000;
                relieveTraveledObjects(time);

                var placementTime = Math.max(0, time - windowSize);
                var completeTime = Math.max(0, endtime + windowSize);

                var objectsToTravel = travelDoneObjects(placementTime, windowSize);

                var frame = getFrame(placementTime / 1000)
                var endframe = getFrame(completeTime / 1000);

                var travelPos = getNotePosition(evt);
                travelPos.y = 100;
                objectsToTravel.forEach(function (ott) {
                    endframe.objects.push(me.createKeyFrame({
                        name: ott.name,
                        position: travelPos,
                        scale: scale
                    }));
                });

                var obj = getAvailableObject(endtime + windowSize);
                var keyframe = me.createKeyFrame({
                    name: obj.name,
                    position: getNotePosition(evt),
                    scale: scale,
                    rotation: { x: 0, y: 0, z: 0 }
                });
                var endkeyframe = me.createKeyFrame({
                    name: obj.name,
                    position: getNotePosition(evt),
                    scale: scale,
                    rotation: rotation
                });
                frame.objects.push(keyframe);
                endframe.objects.push(endkeyframe);

            });
            var lastevent = trackEvents.last();
            var endpos = getNotePosition(lastevent);

            var endtime = (lastevent.endclock + windowSize);
            var division = 600;
            //[].interpolate(0, Math.ceil(endtime / division), function (tim) {
            var camera_endframe = getFrame(0);
            camera_endframe.objects.push({
                "name": "default_camera",
                "target": "default_empty",
                "position": { "x": 0, "y": -40, "z": 10 },
                "type": "camera"
            }, {
                "name": "default_empty",
                "position": { "x": 0, "y": 00, "z": 10 },
                "type": "empty"
            });
            var camera_endframe = getFrame(getTime(lastevent));
            campos = getNotePosition(lastevent);
            camera_endframe.objects.push({
                "name": "default_camera",
                "target": "default_empty",
                "position": { "x": campos.x, "y": -40, "z": 10 },
                "type": "camera"
            }, {
                "name": "default_empty",
                "position": { "x": campos.x, "y": 00, "z": 10 },
                "type": "empty"
            }, {
                "name": "default_sun",
                "type": "lamp",
                "light": "SUN"
            });
            //})
            endpos.y = -10;
            endpos.z = 10;

            objects.push({
                "name": "default_camera",
                "target": "default_empty",
                "type": "camera"
            }, {
                "name": "default_empty",
                "type": "empty"
            }, {
                "name": "default_sun",
                "type": "lamp",
                "light": "SUN",
                "strength": "3"
            });


            return {
                keyframes: keyframes,
                objects: objects
            };

        },
        generateStageInfoMovie: function (midiTracks) {
            var me = this;

            var objects = [];
            var keyframes = [];
            var framesPerSecond = 24;

            var midiTracksWithContent = midiTracks.where(function (track) {
                return track.objects.length && track.events.length;
            });
            var tempTrack = midiTracks.first(function (x) { return x.tempos.length; })
            var midDim = Math.ceil(Math.sqrt(midiTracksWithContent.length));
            var trackSquareSize = 10;
            var sizeOfMidiNotePin = 5 / 127;
            var maxHeight = 3;
            var maxVelocity = 128;

            var getVertical = function (v) {
                return (v / maxVelocity) * maxHeight;
            }
            var squarePosition = function (num) {
                var x = num;
                var y = 0;
                return { x: x, y: y };
            }
            var trackOffset = function (tracNum) {
                return {
                    x: 0,
                    y: tracNum
                };
            }

            var getTrackSquareSize = function (trackIndex) {
                var track = midiTracksWithContent[trackIndex];
                var dim = Math.ceil(Math.sqrt(track.objects.length));
                var pos = squarePosition(trackIndex, dim);
                var squareSize = trackSquareSize / dim;
                return squareSize;
            };

            var trackSquareObjectPosition = function (trackIndex, noteNumber) {
                var pos = squarePosition(noteNumber);
                var trackPos = trackOffset(trackIndex);
                var squareSize = sizeOfMidiNotePin * 2;
                return {
                    x: ((trackPos.x + pos.x) * squareSize) - trackSquareSize / 2,
                    y: (trackPos.y + pos.y) * squareSize,
                    z: 0
                };
            }

            var getChordFrame = function (keyframes, tempTrack, midiTracks, chordInfo, trackIndex) {
                var time = getTime(tempTrack, midiTracks, { clock: chordInfo.start });
                var endtime = getTime(tempTrack, midiTracks, { clock: chordInfo.end });
                var frameIndex = Math.round(time * framesPerSecond) + 1;
                var endframeIndex = Math.round(endtime * framesPerSecond) + 1;
                var midframeIndex = Math.round((frameIndex + endframeIndex) / 2);
                var start_frame, mid_frame, end_frame;

                var name = getName(trackIndex, chordInfo.scaleInfo.name, "_");

                (function () {
                    start_frame = keyframes.first(function (frame) {
                        return frame.frame === frameIndex;
                    });
                    if (!start_frame) {
                        start_frame = {
                            frame: frameIndex,
                            objects: []
                        };
                        keyframes.push(start_frame);
                    }

                    mid_frame = keyframes.first(function (frame) {
                        return frame.frame == midframeIndex;;
                    });
                    if (!mid_frame) {
                        mid_frame = {
                            frame: midframeIndex,
                            objects: []
                        }
                        keyframes.push(mid_frame);
                    }


                    end_frame = keyframes.first(function (frame) {
                        return frame.frame === endframeIndex;
                    });
                    if (!end_frame) {
                        end_frame = {
                            frame: endframeIndex,
                            objects: []
                        }
                        keyframes.push(end_frame);
                    }
                })();
                var pos = {
                    x: 5 * Math.random(),
                    y: 5 * Math.random() + 3
                }
                var startpos = {
                    x: trackSquareSize * 2,
                    y: trackSquareSize * 2
                }
                var startAndEnd = me.createKeyFrame({
                    name: name,
                    position: startpos
                });

                var mid_fra = me.createKeyFrame({
                    name: name,
                    position: pos
                });

                start_frame.objects.push(startAndEnd);
                end_frame.objects.push(startAndEnd);
                mid_frame.objects.push(mid_fra);
            };
            var getFrame = function (keyframes, tempTrack, midiTracks, evt, trackIndex) {
                var time = getTime(tempTrack, midiTracks, { clock: evt.clock });
                var endtime = getTime(tempTrack, midiTracks, { clock: evt.endclock });
                var frameIndex = Math.round(time * framesPerSecond) + 1;
                var endframeIndex = Math.round(endtime * framesPerSecond) + 1;
                var midframeIndex = Math.round((frameIndex + endframeIndex) / 2);
                var start_frame, mid_frame, end_frame;

                var name = getName(trackIndex, evt.noteNumber, evt.channel);

                (function () {
                    start_frame = keyframes.first(function (frame) {
                        return frame.frame === frameIndex;
                    });
                    if (!start_frame) {
                        start_frame = {
                            frame: frameIndex,
                            objects: []
                        };
                        keyframes.push(start_frame);
                    }

                    mid_frame = keyframes.first(function (frame) {
                        return frame.frame == midframeIndex;;
                    });
                    if (!mid_frame) {
                        mid_frame = {
                            frame: midframeIndex,
                            objects: []
                        }
                        keyframes.push(mid_frame);
                    }


                    end_frame = keyframes.first(function (frame) {
                        return frame.frame === endframeIndex;
                    });
                    if (!end_frame) {
                        end_frame = {
                            frame: endframeIndex,
                            objects: []
                        }
                        keyframes.push(end_frame);
                    }
                })();
                // var objectIndex = getObjectIndex(trackIndex, evt)
                var pos = trackSquareObjectPosition(trackIndex, evt.noteNumber);
                pos.z = 0;

                var pos_mid = {
                    x: pos.x,
                    y: pos.y,
                    z: getVertical(evt.start.velocity)
                };
                var temp = {};
                temp.z = getVertical(evt.start.velocity);
                temp.x = midScale.x;
                temp.y = midScale.y;
                var startAndEnd = me.createKeyFrame({
                    name: name,
                    scale: startScale,
                    position: pos
                });

                var mid_fra = me.createKeyFrame({
                    name: name,
                    scale: temp,
                    position: pos_mid
                });

                start_frame.objects.push(startAndEnd);
                end_frame.objects.push(startAndEnd);
                mid_frame.objects.push(mid_fra);
            }
            var getObjectIndex = function (trackIndex, obj) {
                return midiTracksWithContent[trackIndex].objects.indexWhere(function (t) {
                    return obj.noteNumber === t.noteNumber && obj.channel === t.channel;
                })[0];
            }
            var getName = function (track, key, channel) {
                return 'track_' + track + '_' + key + '_' + channel;
            }
            var initialkeyframeobjects = []
            var initialkeyframe = {
                frame: 1,
                objects: initialkeyframeobjects
            };
            var scale = sizeOfMidiNotePin;
            var startScale = {
                x: scale,
                y: scale,
                z: scale
            };

            var midScale = {
                x: sizeOfMidiNotePin,
                y: sizeOfMidiNotePin,
                z: sizeOfMidiNotePin + 1
            }

            var startRotation = {
                x: 0,
                y: 0,
                z: 0
            };
            var colors = [].interpolate(0, midiTracks.length, function (t) {
                var i = t + 1;
                var Materials = Blend.presentation.view.Blender.Materials;
                return Materials[i % Materials.length];
            });

            midiTracksWithContent.forEach(function (track, trackI) {
                track.objects.forEach(function (obj, objecIndex) {
                    var name = getName(trackI, obj.noteNumber, obj.channel);
                    objects.push({
                        name: name,
                        type: "cube",
                        material: colors[trackI] || colors[0]
                    });

                    initialkeyframeobjects.push(me.createKeyFrame({
                        name: name,
                        position: trackSquareObjectPosition(trackI, obj.noteNumber),
                        scale: startScale,
                        rotation: startRotation
                    }));
                });
                [].interpolate(0, 127, function (t, i) {
                    var name = 'letter__' + t;
                    var val_note = MEPH.audio.music.theory.Notes.convertToNote(t)
                            .split(MEPH.audio.music.theory.Notes.sharp).join('#')
                            .split(MEPH.audio.music.theory.Notes.flat).join('b');
                    val_note = val_note.split('').subset(0, val_note.length - 2).join('');
                    objects.push({
                        name: name,
                        type: "text",
                        value: val_note,
                        material: colors[t % midiTracksWithContent.length] || colors[0],
                        "font": "l_10646_",
                        "extrude": me.extrude
                    });
                    objects.push({
                        name: name + 'box',
                        type: "cube",
                        material: colors[t % colors.length] || colors[0]
                    });
                    var pos = trackSquareObjectPosition(-1, t);
                    pos.y += -3;
                    pos.y += (i % 12) / 4;
                    pos.z += 0.04;
                    var sc = .15;
                    initialkeyframeobjects.push(me.createKeyFrame({
                        name: name,
                        position: pos,
                        scale: { x: sc, y: sc, z: sc },
                        rotation: { x: 45, y: 0, z: 0 }
                    }));
                    var bpos = { x: pos.x, y: -10 };
                    var add = 0;
                    if (i % 6 === 0) {
                        add = .003;
                    }
                    if (i % 12 === 0) {
                        add = .005;
                    }
                    if (i % 60 === 0) {
                        add = .008;
                    }
                    initialkeyframeobjects.push(me.createKeyFrame({
                        name: name + 'box',
                        position: bpos,
                        scale: {
                            x: 0.001 + add,
                            y: 10,
                            z: 0.001 + add
                        }
                    }));
                });

                track.events.forEach(function (evnt) {
                    getFrame(keyframes, tempTrack, midiTracks, evnt, trackI);
                });
            });

            var de_pos = trackSquareSize * midDim / 2;
            objects.push(
                {
                    "name": "default_camera",
                    "type": "camera"
                }, {
                    "name": "default_empty",
                    "type": "empty"
                },
            {
                "name": "default_ground_plane",
                "type": "plane",
                material: Blend.presentation.view.Blender.Materials[0]
            },
                //{
                //    "name": "wood_stage",
                //    "group": "StageWoodFloor",
                //    "type": "custom"
                //},
            {
                "name": "default_sun",

                "strength": 3,
                "type": "lamp",
                "light": "SUN"
            });

            initialkeyframeobjects.push(
                {
                    "name": "default_camera",
                    "position": { "x": 0, "y": -8.26655, "z": 10.84575 },
                    "target": "default_empty"
                },
            {
                "name": "default_empty",
                "position": { "x": 0, "y": 0, "z": 0 }
            },
            {
                "name": "default_ground_plane",
                scale: { x: 1000, y: 1000 },
                "position": { "x": 0, "y": 0, "z": 0 }
            },
            //{
            //    "name": "wood_stage",
            //    "position": { "x": 0, "y": 0, "z": 0 }
            //},
            {
                "name": "default_sun",
                "type": "lamp",
                "light": "SUN",
                "strength": 3,
                "rotation": { "x": 0, "y": -80, "z": 0 }
            });

            keyframes.push(initialkeyframe);
            keyframes.sort(function (x, y) {
                return x.frame - y.frame;
            });
            if (me.blenderRenderInfos) {
                me.blenderRenderInfos.push({
                    file: midiTracks.fileName,
                    start: 1,
                    orginalName: midiTracks.orginalName,
                    end: keyframes.last().frame
                });
            }
            return {
                fileName: midiTracks.fileName,
                keyframes: keyframes,
                objects: objects,
                startFrame: 1,
                startEnd: keyframes.last().frame
            }
        },
        generateSquareMovie: function (midiTracks) {
            var me = this;

            var objects = [];
            var keyframes = [];
            var framesPerSecond = 24;

            var midiTracksWithContent = midiTracks.where(function (track) {
                return track.objects.length && track.events.length;
            });
            var tempTrack = midiTracks.first(function (x) { return x.tempos.length; })
            var midDim = Math.ceil(Math.sqrt(midiTracksWithContent.length));
            var trackSquareSize = 10;
            var maxHeight = 3;
            var maxVelocity = 128;

            var getVertical = function (v) {
                return (v / maxVelocity) * maxHeight;
            }
            var squarePosition = function (num, dim) {
                dim = dim || midDim;
                var x = num % dim;
                var y = Math.floor(num / dim);
                return { x: x, y: y };
            }
            var trackOffset = function (tracNum) {
                var pos = squarePosition(tracNum);

                return {
                    x: pos.x * trackSquareSize,
                    y: pos.y * trackSquareSize
                };
            }

            var getTrackSquareSize = function (trackIndex) {
                var track = midiTracksWithContent[trackIndex];
                var dim = Math.ceil(Math.sqrt(track.objects.length));
                var pos = squarePosition(trackIndex, dim);
                var squareSize = trackSquareSize / dim;
                return squareSize;
            };

            var trackSquareObjectPosition = function (trackIndex, objectIndex) {
                var track = midiTracksWithContent[trackIndex];
                var dim = Math.ceil(Math.sqrt(track.objects.length));
                var pos = squarePosition(objectIndex, dim);
                var trackPos = trackOffset(trackIndex);
                var squareSize = getTrackSquareSize(trackIndex);
                return {
                    x: trackPos.x + (pos.x * squareSize),
                    y: trackPos.y + (pos.y * squareSize),
                    z: 0
                };
            }
            var getTime = function (evt) {
                var track = tempTrack;
                var totalTime = 0;
                var lastclock = 0;
                var lastbeats = (120 / 60);
                var lastTicksPerBeat = midiTracks.header.ticksPerBeat;
                if (track && track.tempos)
                    track.tempos.first(function (tempo) {
                        if (tempo.clock > evt.clock) {
                            return true;
                        }
                        var beats = (tempo.clock - lastclock) / lastTicksPerBeat;
                        var second = beats / lastbeats;
                        lastclock = tempo.clock;
                        lastbeats = (tempo.beatsPerMinute / 60);
                        lastTicksPerBeat = tempo.ticksPerBeat;
                        totalTime += second;
                    });
                var beats = (evt.clock - lastclock) / lastTicksPerBeat;
                var second = beats / (lastbeats || (120 / 60));
                totalTime += second;
                return totalTime;
            }
            var getFrame = function (evt, trackIndex) {
                var time = getTime({ clock: evt.clock });
                var endtime = getTime({ clock: evt.endclock });
                var frameIndex = Math.round(time * framesPerSecond) + 1;
                var endframeIndex = Math.round(endtime * framesPerSecond) + 1;
                var midframeIndex = Math.round((frameIndex + endframeIndex) / 2);
                var start_frame, mid_frame, end_frame;

                var name = getName(trackIndex, evt.noteNumber, evt.channel);

                (function () {
                    start_frame = keyframes.first(function (frame) {
                        return frame.frame === frameIndex;
                    });
                    if (!start_frame) {
                        start_frame = {
                            frame: frameIndex,
                            objects: []
                        };
                        keyframes.push(start_frame);
                    }

                    mid_frame = keyframes.first(function (frame) {
                        return frame.frame == midframeIndex;;
                    });
                    if (!mid_frame) {
                        mid_frame = {
                            frame: midframeIndex,
                            objects: []
                        }
                        keyframes.push(mid_frame);
                    }


                    end_frame = keyframes.first(function (frame) {
                        return frame.frame === endframeIndex;
                    });
                    if (!end_frame) {
                        end_frame = {
                            frame: endframeIndex,
                            objects: []
                        }
                        keyframes.push(end_frame);
                    }
                })();
                var objectIndex = getObjectIndex(trackIndex, evt)
                var pos = trackSquareObjectPosition(trackIndex, objectIndex);
                pos.z = 0;
                var pos_mid = {
                    x: pos.x,
                    y: pos.y,
                    z: getVertical(evt.start.velocity)
                };
                var startAndEnd = me.createKeyFrame({
                    name: name, scale: startScale,
                    position: pos
                });
                var mid_fra = me.createKeyFrame({
                    name: name,
                    scale: midScale,
                    position: pos_mid
                });
                start_frame.objects.push(startAndEnd);
                end_frame.objects.push(startAndEnd);
                mid_frame.objects.push(mid_fra);
            }
            var getObjectIndex = function (trackIndex, obj) {
                return midiTracksWithContent[trackIndex].objects.indexWhere(function (t) {
                    return obj.noteNumber === t.noteNumber && obj.channel === t.channel;
                })[0];
            }
            var getName = function (track, key, channel) {
                return 'track_' + track + '_' + key + '_' + channel;
            }
            var initialkeyframeobjects = []
            var initialkeyframe = {
                frame: 1,
                objects: initialkeyframeobjects
            };
            var scale = .5;
            var startScale = {
                x: scale,
                y: scale,
                z: scale
            };
            var midScale = {
                x: .7,
                y: .7,
                z: .7
            }

            var startRotation = {
                x: 0,
                y: 0,
                z: 0
            };
            var colors = [].interpolate(0, midiTracks.length, function (t) {
                var i = t + 1;
                var Materials = Blend.presentation.view.Blender.Materials;
                return Materials[i % Materials.length];
            });

            midiTracksWithContent.forEach(function (track, trackI) {
                track.objects.forEach(function (obj, objecIndex) {
                    var name = getName(trackI, obj.noteNumber, obj.channel);
                    objects.push({
                        name: name,
                        type: "cube",
                        material: colors[trackI] || colors[0]
                    });

                    initialkeyframeobjects.push(me.createKeyFrame({
                        name: name,
                        position: trackSquareObjectPosition(trackI, objecIndex),
                        scale: startScale,
                        rotation: startRotation
                    }));
                });

                track.events.forEach(function (evnt) {
                    getFrame(evnt, trackI);
                });
            });

            var de_pos = trackSquareSize * midDim / 2;
            objects.push({
                "name": "default_camera",
                "type": "camera"
            }, {
                "name": "default_empty",
                "type": "empty"
            }, {
                "name": "default_ground_plane",
                "type": "plane",
                material: Blend.presentation.view.Blender.Materials[0]
            }, {
                "name": "default_sun",

                "strength": 3,
                "type": "lamp",
                "light": "SUN"
            });

            initialkeyframeobjects.push({
                "name": "default_camera",
                "position": { "x": de_pos, "y": -de_pos * 2, "z": de_pos * 2 },
                "target": "default_empty"
            }, {
                "name": "default_empty",
                "position": { "x": de_pos, "y": de_pos, "z": 0 }
            }, {
                "name": "default_ground_plane",
                scale: { x: 1000, y: 1000 },
                "position": { "x": 0, "y": 0, "z": -0.5 }
            }, {
                "name": "default_sun",
                "type": "lamp",
                "light": "SUN",
                "strength": 3,
                "rotation": { "x": 0, "y": -80, "z": 0 }
            });

            keyframes.push(initialkeyframe);
            keyframes.sort(function (x, y) {
                return x.frame - y.frame;
            });
            if (me.blenderRenderInfos) {
                me.blenderRenderInfos.push({
                    file: midiTracks.fileName,
                    orginalName: midiTracks.orginalName,
                    start: 1,
                    end: keyframes.last().frame
                });
            }
            return {
                fileName: midiTracks.fileName,
                keyframes: keyframes,
                objects: objects,
                startFrame: 1,
                startEnd: keyframes.last().frame
            }
        },
        createKeyFrame: function (options) {
            return {
                name: options.name,
                position: options.position || { x: 0, y: 0, z: 0 },
                scale: options.scale || { x: 1, y: 1, z: 1 },
                rotation: options.rotation || null
            }
        },
        loadFiles: function () {
            var me = this;
            var args = MEPH.util.Array.convert(arguments);
            var evntArgs = args.last();

            var files = args.last();

            return FileReader.readFileList(files.domEvent.files, { readas: 'String' })
                .then(function (res) {
                    var blendData = res.first().res.split('\n');
                    //blendData = blendData.subset(0, 10);
                    var categories = blendData.first().split(',');
                    var numerical = blendData.nth(2).split(',').indexWhere(function (x) {
                        return !isNaN(x)
                    });
                    var nonnumerical = blendData.nth(2).split(',').indexWhere(function (x) {
                        return isNaN(x)
                    });
                    return {
                        categories: categories,
                        blocks: numerical.length,
                        numerical: numerical,
                        nonnumerical: nonnumerical,
                        data: blendData.subset(1).select(function (t) { return t.split(','); })
                    };

                }).then(null, function (e) {
                    console.log(e);
                }).then(function (d) {
                    return me.getScript(d);
                });
        },
        getScript: function (d) {
            var me = this;
            var blocks = [].interpolate(0, d.blocks, function (t) {
                return {
                    "name": "block" + t,
                    "type": "cube"
                }
            });
            var categories = d.categories.select(function (t, index) {
                return {
                    "name": "cat_" + index,
                    "type": "text",
                    "value": t,
                    "font": "mriamc",
                    "extrude": me.extrude
                }
            });
            var blockmaxes = [].interpolate(0, d.blocks, function (t) {
                return {
                    max: d.data.maxx(function (x) {
                        return parseFloat(x.nth(d.numerical[t] + 1))
                    }),
                    min: d.data.min(function (x) {
                        return parseFloat(x.nth(d.numerical[t] + 1))
                    })
                }
            });

            var keyframes = d.data.select(function (d_data, index) {
                var objects = blocks.select(function (x, block_index) {
                    return {
                        name: x.name,
                        position: {
                            x: block_index * me.blockspacing,
                            y: 0,
                            z: 0
                        },
                        scale: {
                            x: 1,
                            y: function (maxmin) {
                                try {
                                    var dataindex = d.numerical[block_index];
                                    var low = parseFloat(d_data[dataindex]) - maxmin.min;
                                    var h = maxmin.max - maxmin.min;
                                    var yt = low * (me.maxheight / h);

                                    return yt || 0;
                                } catch (e) {
                                    return 0;
                                }
                            }(blockmaxes[block_index]),
                            z: 1
                        }
                    }
                })
                return {
                    frame: (index * me.framesPerData) + 1,
                    objects: objects
                }
            })
            var first_frame_objects = keyframes.first().objects;
            categories.foreach(function (x, block_index) {
                first_frame_objects.push({
                    name: x.name,
                    scale: {
                        x: 0.5,
                        y: 0.5,
                        z: 0.5,
                    },
                    position: {
                        x: block_index * me.blockspacing,
                        y: 0,
                        z: 2.4
                    },
                    rotation: {
                        z: 90
                    }
                })
            })
            me.save({
                "settings": {},
                "scenes": [
                    {
                        "name": "default",
                        "objects": blocks.concat(categories),
                        keyframes: keyframes
                    }]
            });


        },
        save: function (obj) {
            var me = this;
            var aFileParts = [JSON.stringify(obj)];
            var oMyBlob = new Blob(aFileParts, { type: 'application/javascript' });
            me.fileSaver.save(oMyBlob, 'presentation-json-' + (obj.fileName || '') + '.js');
        },
        onLoaded: function () {
            var me = this;
            me.name = 'Blend presentation';
        }
    });
})();