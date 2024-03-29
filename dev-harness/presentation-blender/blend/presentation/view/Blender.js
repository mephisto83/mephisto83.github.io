﻿(function () {
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
            'MEPH.math.Vector',
            'MEPH.math.Util',
            'MEPH.input.Number', 'MEPH.input.Text',
            'MEPH.input.MultilineText',
            'MEPH.audio.music.theory.Scales',
            'MEPH.list.View',
            'MEPH.util.CitySystem',
            'MEPH.math.Quat',
            'Blend.presentation.template.MidiFile',
            'MEPH.audio.midi.reader.MidiFile',
            'MEPH.util.Observable',
            'MEPH.input.File',
            'MEPH.file.FileSaver', 'MEPH.button.Button',
            'MEPH.audio.music.theory.Notes',
            'MEPH.file.Dropbox', 'MEPH.util.FileReader'],
        statics: {
            BlendObjects: ["OrbLight"],
            ProjectTileGroup: 'Bullet',
            Materials: ["BlackShiny", "White", "Green", "Red", "Blue", 'Orange', 'Pink', 'Purple'],
            Ships: {
                Ship_1: 'Ship_1',
                Ship_3: 'Ship_3',
                Ship_4: 'Ship_4',
                Ship_2: 'Ship_2'
            }
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
            MEPH.loadJSCssFile(MEPH.getSourcePath('Blend.presentation.template.batFile', '.html'), 'string', null, null, null, 'text/html', true).then(function (res) {
                me.batFileTemplate = res.response;
            });
            MEPH.loadJSCssFile(MEPH.getSourcePath('Blend.presentation.template.blenderRender', '.html'), 'string', null, null, null, 'text/html', true).then(function (res) {
                me.blenderRenderTemplate = res.response;
            });
            MEPH.loadJSCssFile(MEPH.getSourcePath('Blend.presentation.template.cameraRender', '.html'), 'string', null, null, null, 'text/html', true).then(function (res) {
                me.cameraRenderTemplate = res.response;
            });
            MEPH.loadJSCssFile(MEPH.getSourcePath('Blend.presentation.template.pythonScript', '.html'), 'string', null, null, null, 'text/html', true).then(function (res) {
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
                        var found = TheoryScales.getVoice(base);
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
            window.blenderFilesCreated = false;
            var saveFileObjects = [];
            me.midiFiles.select(function (x) {
                promise = promise.then(function () {
                    return me.loadMidi({
                        domEvent: {
                            data: x
                        }
                    });
                }).then(func)
                    .then(me.saveMidiMovie.bind(me, saveFileObjects))
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
                jobFiles.push(jobbat);
                saveFileObjects.push({ name: jobbat, file: completeBat });
                return me.saveFile(jobbat, completeBat, 'application/bat');
            }).then(function () {
                var renderbatch = me.blenderRenderInfos.select(function (info) {


                    var audio_file = info.orginalName.split('').subset(0, info.orginalName.length - 3).join('') + 'mp3';
                    var potentialcamera = me.cameras || [{ name: 'default_camera' }];
                    var batFileTemplate = '';
                    var end, start;
                    var count = potentialcamera.length;
                    var each = 500;
                    var last = 1;
                    each = Math.round(each);
                    while (last < info.end) {
                        var cam = potentialcamera.random().first();
                        start = last;
                        end = last + (each);
                        batFileTemplate += MEPH.util.Template.bindTemplate(me.cameraRenderTemplate, {
                            file: 'presentation-bl-' + info.file + '.blend',
                            output: '//output/' + 'presentation-bl-' + info.file + '/',
                            py_output: '\\output\\' + 'presentation-bl-' + info.file + '\\',
                            name: info.orginalName.split('').subset(0, info.orginalName.length - 4).join(''),
                            audio_file: audio_file,
                            audio_output_window: '.\\output\\audio-' + 'presentation-bl-' + info.file + '\\',
                            audio_output: '//output/audio-' + 'presentation-bl-' + info.file + '/',
                            py_audio_output: '\\output\\audio-' + 'presentation-bl-' + info.file + '\\',
                            startframe: start || 1,
                            endframe: end,
                            camera: cam.name
                        }) + '\n';

                        last = last + each + 1;
                    }
                    batFileTemplate += MEPH.util.Template.bindTemplate(me.blenderRenderTemplate, {
                        file: 'presentation-bl-' + info.file + '.blend',
                        output: '//output/' + 'presentation-bl-' + info.file + '/',
                        py_output: '\\output\\' + 'presentation-bl-' + info.file + '\\',
                        name: info.orginalName.split('').subset(0, info.orginalName.length - 4).join(''),
                        audio_file: audio_file,
                        audio_output_window: '.\\output\\audio-' + 'presentation-bl-' + info.file + '\\',
                        audio_output: '//output/audio-' + 'presentation-bl-' + info.file + '/',
                        py_audio_output: '\\output\\audio-' + 'presentation-bl-' + info.file + '\\',
                        startframe: info.start,
                        endframe: info.end,
                        camera: cam.name
                    }) + '\n';
                    jobFiles.push(audio_file);
                    return batFileTemplate;
                }).join('\n');
                jobFiles.push(renderJob);
                saveFileObjects.push({ name: renderJob, file: renderbatch });
                return me.saveFile(renderJob, renderbatch, 'application/bat');

            }).then(function () {
                var job = {
                    resources: jobResources,
                    files: jobFiles,
                    jobId: jobId,
                    target: './jobs/projects/'
                };
                var jobtext = JSON.stringify(job);
                window.blenderFiles = JSON.stringify(saveFileObjects);
                window.blenderFilesCreated = true;
                function splitValue(value, index) {
                    return [value.substring(0, index), value.substring(index)];
                }
                window.suckUpFile = function () {
                    var parts = splitValue(window.blenderFiles, 1000000);
                    window.blenderFiles = parts[1];
                    return parts[0];
                }
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
            return new Promise(function (t) {
                setTimeout(function () {
                    me.generateAllMovies(function (a) {
                        var res;
                        if (!window.stagemovie) {
                            res = me.generateStageInfoMovie(a);
                        }
                        else {
                            res = me.generateChaseMovie(a);
                        }
                        if (false) {
                            return me.attachCity(res).then(function () {
                                me.shipFlyThrough(res);
                            }).then(function () {
                                t(res);
                                return res;
                            });
                        }
                        else {
                            return Promise.resolve(res);
                        }
                        return me.attachBattleScene(res, !window.stagemovie).then(function () {
                            return res;
                        })
                        .then(function () {
                            t(res);
                            return res;
                        });
                    });

                }, 200);
            })
        },
        saveMidiMovie: function (saveFileObjects, midiDef) {
            var me = this;
            if (!midiDef) {
                midiDef = saveFileObjects
            }
            me.save({
                fileName: midiDef.fileName,
                "settings": {
                    "RenderEngine": "CYCLES",
                    "FrameStart": midiDef.startFrame,
                    "FrameEnd": midiDef.startEnd,
                    "samples": "1000",
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
                    "world": "DarkWorld",
                    "objects": midiDef.objects,
                    "keyframes": midiDef.keyframes
                }]
            }, saveFileObjects);

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
            saveFileObjects.push({ name: pyfile, file: pythonFile });

            me.saveFile(batfile, batFileTemplate, 'application/bat');
            saveFileObjects.push({ name: batfile, file: batFileTemplate });
            //bat-presentation-blend
        },
        saveFile: function (file, text, type) {
            var me = this;
            var aFileParts = [text];
            var oMyBlob = new Blob(aFileParts, { type: type });
            if (!window.donotSaveFiles) {
                return me.fileSaver.save(oMyBlob, file);
            }
            return Promise.resolve();
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
        getChordData: function (midiTracks) {
            var currentSelection = [];
            var trackClock = 0;
            var currentTrackNotes = {};
            var start = null;
            var end;

            var trackEvents = [];
            midiTracks.forEach(function (trackInfo) {
                trackEvents = trackEvents.concat(trackInfo.events);
            });

            trackEvents.sort(function (a, b) {
                return a.clock - b.clock;
            });

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

            currentTrackNotesArray.where(function (t) {
                return t.notes.length > 2;
            }).forEach(function (info) {
                var base = info.notes.select(function (t, i) {
                    return t - info.notes[0];
                });
                var found = TheoryScales.getVoice(base);
                if (found) {
                    info.scaleInfo = found;
                }
                else {
                    info.scaleInfo = null;
                }
            });
            return currentTrackNotesArray;
        },
        collectUniqueCharactersFromChordData: function (chordData) {
            return chordData.select(function (t) {
                return t && t.scaleInfo && t.scaleInfo.name ? t.scaleInfo.name : '';
            }).concatFluent(function (t) {
                return t.split(' ');
            }).unique().where(function (t) { return t.trim(); })
                .select(function (t) {
                    return t.replace('°', ' dim ');
                });
        },
        shipName: function (fleet, shipNo) {
            var me = this;
            return fleet + '_' + shipNo;
        },
        createShipType: function (type, fleet, index, guns, noteNumbers) {
            var me = this,
                ship,
                name = me.shipName(fleet, index);
            switch (type) {
                case type:
                    ship = {
                        "name": name,
                        "group": type,
                        "type": "custom"
                    };
                    break;
                default:
                    ship = {
                        "name": name,
                        "group": Blend.presentation.view.Blender.Ships.Ship_1,
                        "type": "custom"
                    };
                    break;
            }
            ship.guns = guns;
            ship.noteNumbers = noteNumbers;

            return ship;
        },
        createShipObjects: function (ships, fleet) {
            var me = this;
            fleet = fleet || 'default_fleet_';
            var shipobjects = ships.select(function (type, index) {
                return me.createShipType(type, fleet, index);
            });

            return shipobjects;
        },
        getShipsForTrack: function (trackInfo, keyframes) {
            var me = this,
                requiredGuns,
                shipDefinitions = [],
                ships = [];
            requiredGuns = trackInfo.length;
            var i = 0;
            while (requiredGuns > 0) {
                var info = trackInfo[i];
                i++;
                var rand = Math.ceil(Math.random() * requiredGuns + .00001);
                var guns;
                if (rand > 24) {
                    requiredGuns -= 24;
                    guns = 24;
                    group = Blend.presentation.view.Blender.Ships.Ship_2;
                }
                else if (rand > 9) {
                    requiredGuns -= 9;
                    guns = 9;
                    group = Blend.presentation.view.Blender.Ships.Ship_3;
                }
                else if (rand > 7) {
                    requiredGuns -= 7;
                    guns = 7;
                    group = Blend.presentation.view.Blender.Ships.Ship_4;
                }
                else {
                    requiredGuns -= 3;
                    guns = 3;
                    group = Blend.presentation.view.Blender.Ships.Ship_1;
                }
                var gun_note_start = trackInfo.length - requiredGuns - guns;
                var ship = me.createShipType(group, 'default_fleet_' + info.track, i, guns,
                    trackInfo.subset(gun_note_start, gun_note_start + guns).select(function (t) {
                        return t.noteNumber;
                    }));
                shipDefinitions.push(ship);
                ships.push(me.getInitialShipSettings(ship, null, keyframes));
            }
            if (ships.length < 2) {
                group = Blend.presentation.view.Blender.Ships.Ship_1;
                var guns = 2;
                var ship = me.createShipType(group, 'default_fleet_' + 0, i, guns, []);
                shipDefinitions.push(ship);
                ships.push(me.getInitialShipSettings(ship, null, keyframes));
            }
            return { ships: ships, shipDefinitions: shipDefinitions };
        },
        addShotFrames: function (keyframes, gunname, frame, body) {
            var v = [0, 10000, 100000, 0];
            [0, 1, 14, 15].forEach(function (i, t) {
                var b = MEPH.clone(body);
                b.children.push({
                    name: gunname,
                    scale: {
                        y: v[t]
                    }
                });
                keyframes.push({
                    objects: [b], frame: frame + i
                });
            });
        },
        setShipPosition: function (ship, pos) {
            ship.position = pos;
        },
        getInitialShipSettings: function (ship, position, keyframes) {
            var me = this,
                setting;
            position = position || {
                x: 0,
                y: 0,
                z: 0
            };
            setting = {
                "name": ship.name,
                "position": {
                    "x": position.x || 0,
                    "y": position.y || 0,
                    "z": position.z || 0
                },
                "scale": {
                    "x": 1,
                    "y": 1,
                    "z": 1
                },
                "children": []
            };

            var bothGuns =[]|| ship.noteNumbers.select(function (noteNumber) {
                //
                return keyframes.where(function (t) {
                    return t.objects.where(function (j) {
                        return j.noteNumber === noteNumber;
                    }).length;
                }).select(function (keyframe) {;
                    var tem = {
                        "frame_start": keyframe.frame,
                        "noteNumber": noteNumber
                    };
                    return tem;
                })
            });
            var body = {
                "name": ship.name,
                "children": []
            };
            var gunshotFrames = [];
            switch (ship.group) {
                case Blend.presentation.view.Blender.Ships.Ship_4:
                    setting.children = [];
                    [1, 2].forEach(function (x) {
                        setting.children.push({
                            "name": "Squirtgun_" + x.toString().pad(3, '0'),
                            "track_to": {
                                "target": me.getEmptyTargetName(ship)
                            },
                            "limit_rotation": {
                                "use_limit_y": "True",
                                "use_limit_z": "True",
                                "owner_space": "LOCAL"
                            }
                        })
                    });

                    [].interpolate(1, 7, function (x) {
                        var gunname = 'gunpointstart_' + x.toString().pad(3, '0');

                        if (bothGuns[x - 1])
                            bothGuns[x - 1].forEach(function (x) {
                                me.addShotFrames(keyframes, gunname, x.frame_start, MEPH.clone(body));
                            });
                    });

                    var children = [];
                    children.push({
                        "name": "eng.body.Y-block"
                    }, {
                        "name": "eng.strut.cylinda"
                    }, {
                        "name": "Fin.Runner"
                    }, {
                        "name": "CruiseShip"
                    }, {
                        "name": "HandleHullShip_4"
                    }, {
                        "name": "Ship4_Ram"
                    }, {
                        "name": "Ship4_HandleHull"
                    }, {
                        "name": "Ship_Ram_bottom"
                    }, {
                        "name": "Ship_4_hull_lump"
                    }, {
                        "name": "SHIP_4_G_block"
                    }, {
                        "name": "Ship_4_crab_claw"
                    }, {
                        "name": "Ship_4_clip_bridge"
                    }, {
                        "name": "Ship4_ybllock"
                    });


                    setting.children.push.apply(setting.children, children);
                    break;
                case Blend.presentation.view.Blender.Ships.Ship_3:
                    setting.children = [{
                        "name": "Ship3_bracketengine"
                    }, {
                        "name": "Ship3_duckhead"
                    }, {
                        "name": "Ship3_hull_black"
                    }];

                    [1, 2, 3, 8].forEach(function (x) {
                        setting.children.push({
                            "name": "gun_ship_3_" + x.toString().pad(3, '0'),
                            "track_to": {
                                "target": me.getEmptyTargetName(ship)
                            },
                            "limit_rotation": {
                                "use_limit_y": "True",
                                "use_limit_x": "True",
                                "owner_space": "LOCAL"
                            }
                        })
                    });

                    [4, 5, 6, 7, 9].forEach(function (x) {
                        setting.children.push({
                            "name": "gun_ship_3_" + x.toString().pad(3, '0'),
                            "track_to": {
                                "target": me.getEmptyTargetName(ship)
                            },
                            "limit_rotation": {
                                "use_limit_y": "True",
                                "use_limit_z": "True",
                                "owner_space": "LOCAL"
                            }
                        })
                    });
                    [].interpolate(1, 10, function (x) {
                        var gunname = 'gun_ship_3_tip_' + x.toString().pad(3, '0');

                        if (bothGuns[x - 1])
                            bothGuns[x - 1].forEach(function (x) {
                                me.addShotFrames(keyframes, gunname, x.frame_start, MEPH.clone(body));
                            });
                    });
                    break;
                case Blend.presentation.view.Blender.Ships.Ship_2:
                    gunshotFrames = [].interpolate(1, 29, function (x) {
                        var gunname = 'Gun_' + x.toString().pad(3, '0');

                        if (bothGuns[x - 1])
                            bothGuns[x - 1].forEach(function (x) {
                                me.addShotFrames(keyframes, gunname, x.frame_start, MEPH.clone(body));
                            });
                    });
                    break;
                case Blend.presentation.view.Blender.Ships.Ship_1:

                    setting.children = [{
                        "name": "hardpoint.dev.hammer_left",
                        "track_to": {
                            "target": this.getEmptyTargetName(ship)
                        },
                        "limit_rotation": {
                            "use_limit_y": "True",
                            "use_limit_z": "True",
                            "owner_space": "LOCAL"
                        }
                    }, {
                        "name": "hardpoint.dev.hammer_right",
                        "track_to": {
                            "target": this.getEmptyTargetName(ship)
                        },
                        "limit_rotation": {
                            "use_limit_y": "True",
                            "use_limit_z": "True",
                            "owner_space": "LOCAL"
                        }
                    }, {
                        "name": "hardpoint.dev.hammer_top",
                        "track_to": {
                            "target": this.getEmptyTargetName(ship)
                        },
                        "limit_rotation": {
                            "use_limit_y": "True",
                            "use_limit_x": "True",
                            "owner_space": "LOCAL"
                        }
                    }];
                    ([1, 2, 3]).forEach(function (t) {
                        var gunname = 'gun_endpoint_' + t.toString();

                        if (bothGuns[t - 1])
                            (bothGuns[t - 1] || []).forEach(function (x) {
                                me.addShotFrames(keyframes, gunname, x.frame_start, MEPH.clone(body));
                            });
                    })
            }
            //MEPH.setPathValue(setting.children[1], 'collision.use_particle_kill', 'false');
            return setting;
        },
        createProjectTiles: function (name) {
            var me = this;
            return [{
                "name": name,
                "group": Blend.presentation.view.Blender.ProjectTileGroup,
                "type": "custom"
            }]
        },
        createShipPath: function (ship, options) {
            var space = 10;
            var $VQC = $Vector.Quick.Create;
            return {
                "name": ship.name + '_ship_path',
                "type": "path",
                "curvetype": "NURBS",
                "twist_mode": "Z_UP",
                "use_path": "true",
                "use_path_follow": "true",
                "path_animation": [{
                    "eval_time": 0,
                    "frame": 1
                }, {
                    "eval_time": options.duration,
                    "frame": options.duration
                }],
                "path_duration": options.duration,
                "points": ship.positions.select(function (x) {
                    var v = $VQC(x);
                    return v.vector.concat([1]);
                })
            };
        },
        createShipPipes: function (ship, options) {
            var $VQC = $Vector.Quick.Create;
            var frames = [{
                frame: 1,
                objects: [{
                    name: ship.name + "_hook_empty",
                    "position": {
                        "x": 0,
                        "y": 0,
                        "z": 0
                    }
                }, {
                    name: ship.name + "_circle_path",
                    "position": {
                        "x": 0,
                        "y": 0,
                        "z": 0
                    },
                    scale: {
                        x: .01,
                        y: .01,
                        z: .01
                    }
                }, {
                    name: ship.name + "_vector_path",
                    "position": {
                        "x": 0,
                        "y": 0,
                        "z": 0
                    }
                }, {
                    name: ship.name + "arm_vector_path",
                    material: 'TransparentBlue',
                    "position": {
                        "x": 0,
                        "y": 0,
                        "z": 0
                    }
                }]
            }, {
                frame: options.lastframe,
                objects: [{
                    name: ship.name + "_hook_empty",
                    "position": {
                        "x": -1,
                        "y": 0,
                        "z": 0
                    }
                }]
            }];
            var objects = [{
                "name": ship.name + "_hook_empty",
                "type": "empty",
                "position": {
                    "x": 0,
                    "y": 0,
                    "z": 0
                }
            }, {
                "name": ship.name + "_circle_path",
                "type": "circle",
                "position": {
                    "x": 0,
                    "y": 0,
                    "z": 0
                }
            }, {
                "name": ship.name + "_vector_path",
                "type": "path",
                "position": {
                    "x": 0,
                    "y": 0,
                    "z": 0
                },
                "points": [
                                [0, 0, 0, 0],
                                [1, 0, 0, 0],
                                [1, 1, 0, 0]],
                "hooks": [{
                    "index": 1,
                    "hook": ship.name + "_hook_empty",
                }],
                "use_path_follow": "False"
            }, {
                "name": ship.name + "arm_vector_path",
                material: 'TransparentBlue',
                "curvetype": "NURBS",
                "type": "path",
                "points": ship.positions.select(function (x) {
                    var v = $VQC(x);
                    return v.vector.concat([1]);
                }).reverse(),
                "bevel_object": ship.name + "_circle_path",
                "taper_object": ship.name + "_vector_path",
                "use_path_follow": "False"
            }];
            if (ship.retreating) {
                var sp_count = 1;
                var spiralrad = 7.4;
                MEPH.math.Vector.skipDefine = true;
                [].interpolate(0, sp_count, function (t) {
                    var angle = 0;
                    objects.push({
                        "name": ship.name + "arm_vector_path_tunnelpath_" + t,
                        material: 'TransparentBlue',
                        "curvetype": "NURBS",
                        "type": "path",
                        "bevel_object": ship.name + "_circle_path",
                        "points": ship.positions.select(function (x, i) {
                            if (i > 0) {
                                var v1 = $VQC(x);
                                var v2 = $VQC(ship.positions[i - 1]);
                                var vect = v2.subtract(v1);

                                vect = vect.unit();
                                var arbitrary = $VQC([1, 0, 0]);
                                var res = arbitrary.vector[0] * vect.vector[0] + arbitrary.vector[1] * vect.vector[1];
                                var z = -res / vect.vector[2];
                                var cvect = $VQC([1, 0, z]).unit();

                                //var cvect = vect.cross($VQC([-vect.vector[0], -vect.vector[1], vect.vector[2]]));
                                //cvect = cvect.getVectorOfLength(spiralrad);
                                var points = 100;
                                var circles = 4;
                                angle += .1;
                                return [].interpolate(0, points, function (j) {
                                    var point = $VQC(cvect.vector).rotate(Math.PI * 2 * t / sp_count).multiply(spiralrad);
                                    var q = new $Q(vect.vector, angle + (circles * Math.PI * 2 * j / points))
                                    var qres = q.rotate(point.vector);

                                    return qres.add(MEPH.math.Vector.Lerp3D(v1, v2, j / points)).vector.concat([1]);
                                })
                            }
                        }).where().concatFluent(function (x) { return x; }).reverse(),
                        "use_path_follow": "False"
                    })
                    frames.push({
                        frame: 1,
                        objects: [{
                            "name": ship.name + "arm_vector_path_tunnelpath_" + t,
                            "position": {
                                "x": 0,
                                "y": 0,
                                "z": 0
                            }
                        }]
                    })
                });
            }
            return {
                objects: objects,
                frames: frames
            };
        },
        getEmptyTargetName: function (ship) {
            return ship.name + '_empty';
        },
        createEmpty: function (ship) {
            return {
                "name": this.getEmptyTargetName(ship),
                "type": "empty"
            };
        },
        getCameraName: function (ship, index) {
            return ship.name + '_camera_' + index;
        },
        createShipCameras: function (ship) {
            var me = this;
            return [].interpolate(0, 1, function (i) {
                return {
                    "name": me.getCameraName(ship, i),
                    "type": "camera",
                    "parent": ship.name
                }
            })
        },
        timeIt: function (func) {
            var start = Date.now();
            func();
            var end = Date.now();
            var time = end - start;
            time = time / 1000;
            console.log("time : " + (time));
        },
        addBattleScene: function (objects, keyframes, midiTracks, options) {
            var me = this, intialframe = keyframes[0];
            //Create ships
            var lastframe = keyframes.last().frame;
            var frame_last = keyframes.last();
            return Promise.resolve().then(function () {

                return new Promise(function (stepresolve) {

                    var midiTracksWithContent = midiTracks.where(function (track) {
                        return track.objects.length && track.events.length;
                    });

                    var uniqueTracksAndNotes = midiTracksWithContent.select(function (trackInfo, i) {
                        return trackInfo.objects.select(function (t) {
                            return {
                                track: i,
                                noteNumber: t.noteNumber
                            }
                        });
                    });
                    var shipGroupsForTracks = uniqueTracksAndNotes.select(function (trackInfo) {
                        return me.getShipsForTrack(trackInfo, keyframes);
                    });
                    var shipDefinitions = shipGroupsForTracks.select(function (x) { return x.shipDefinitions });


                    shipGroupsForTracks = shipGroupsForTracks.select(function (x) { return x.ships; });
                    var projectiles = me.createProjectTiles('bullet');

                    var cameras = [];
                    var shipTargetEmpties = shipDefinitions.select(function (x) {
                        return x.select(function (ship) {
                            var empty = me.createEmpty(ship);
                            intialframe.objects.unshift(me.createKeyFrame({
                                name: empty.name,
                                position: {
                                    x: 0,
                                    y: 0,
                                    z: 0
                                }
                            }));
                            objects.unshift(empty);
                            me.createShipCameras(ship).forEach(function (camera, i) {

                                cameras.push(camera);
                                frame_last.objects.push(({
                                    name: camera.name,
                                    "lens": 15.66,
                                    "sensor_width": 15.80,
                                    "track_to": {
                                        "target": ship.name,
                                        "up_axis": "UP_Y",
                                        "track_axis": "TRACK_NEGATIVE_Z"
                                    },
                                    position: {
                                        x: 0,
                                        z: 1.21,
                                        y: -5
                                    }
                                }))
                            });
                            return empty;
                        })
                    });
                    me.cameras = cameras;
                    //shipTargetEmpties.forEach(function (team) {
                    //    objects.unshift.apply(objects, team);
                    //});

                    intialframe.objects.push(me.createKeyFrame({
                        name: "bullet",
                        position: {
                            x: 10000,
                            y: 10000,
                            z: 10000
                        }
                    }));

                    var x = 0;
                    var y = 0;
                    var space = 10;
                    var z = space / 3;
                    var center = -5;
                    var angle = 0;
                    var count = 1;
                    var $VQC = $Vector.Quick.Create;
                    shipGroupsForTracks.forEach(function (ships, i) {
                        ships.forEach(function (ship, index) {
                            angle += Math.PI * .3;
                            var shippos = {
                                x: count * Math.cos(angle),
                                y: count * Math.sin(angle),
                                z: z
                            }
                            count += .5;
                            me.setShipPosition(ship, shippos)
                            ship.follow_path = {
                                "target": ship.name + '_ship_path'
                            };
                        });
                    });
                    shipDefinitions.forEach(function (ships) {
                        objects.push.apply(objects, ships);
                    });


                    objects.push.apply(objects, projectiles);

                    var framesPerSecond = 24;
                    var step = 50;//frames
                    var checkPotentialCollisionsEvery = 10;
                    var stepToMovieLengthFactor = step / 10;
                    var chaseSpeed = 2 / (framesPerSecond) * stepToMovieLengthFactor
                    var retreatSpeed = 2.2 / (framesPerSecond) * stepToMovieLengthFactor
                    var retreatDistance = 4;
                    var evadeDistance = 4;
                    var maxAngularVelocity = chaseSpeed * 2.2;
                    var changetarget = 140000;
                    var boundarySphere = options.chase ? 500 : 5;
                    var shipData = shipGroupsForTracks.select(function (t, team) {
                        return t.select(function (x) {
                            return {
                                name: x.name,
                                position: [
                                    x.position.x,
                                    x.position.y,
                                    x.position.z
                                ],
                                team: team,
                                positions: [],
                                target: null
                            };
                        });
                    });
                    var assignTargets = function (shipData, frame) {
                        var chasee;
                        shipData.forEach(function (team, teamIndex) {
                            team.forEach(function (t) {
                                if (!chasee) {

                                    var otherteam = shipData.where(function (s, i) {
                                        return teamIndex !== i && s.length;
                                    }).random().first();
                                    otherteam = otherteam || shipData[0];

                                    var rships = otherteam.where(function (x) {
                                        return x.name !== t.name;
                                    }).random();

                                    var tship;
                                    if (rships.length) {
                                        tship = rships[0];
                                    }
                                    chasee = tship;
                                }
                                if (tship) {
                                    chasee = tship;
                                    t.target = tship.name;
                                }
                                else if (chasee && chasee.name !== t.name) {
                                    t.target = chasee.name;
                                }
                                else {
                                    t.retreating = true;
                                    t.target = null;
                                }
                            });
                        });
                    }
                    var getShipPosition = function (name, shipData) {
                        var res;
                        if (shipPositionDictionary[name]) {
                            return shipPositionDictionary[name]
                        }
                        shipData.first(function (team) {
                            return team.first(function (ship) {
                                if (ship.name === name) {
                                    res = ship.position;
                                    shipPositionDictionary[name] = ship.position;
                                    return true;
                                }
                            })
                        });
                        return res;
                    }
                    var saveCurrentPositions = function (shipData) {
                        shipData.forEach(function (team) {
                            team.forEach(function (ship) {
                                ship.positions.push(ship.position);
                            });
                        });
                    }
                    var $VQC = $Vector.Quick.Create;
                    var getShipsTargeting = function (name, shipData) {
                        var results = [];
                        shipData.forEach(function (team) {
                            team.forEach(function (ship) {
                                if (ship.target === name) {
                                    results.push(ship);
                                }
                            });
                        });
                        return results;
                    }
                    var calculateIfRetreatRequired = function (shipData) {
                        shipData.forEach(function (team) {
                            team.forEach(function (ship) {
                                var enemyShips = getShipsTargeting(ship.name, shipData);
                                var shipPos = getShipPosition(ship.name, shipData);
                                shipPos = $VQC(shipPos);
                                var tooCloseShips = enemyShips.where(function (enemy) {
                                    var dist = shipPos.distance($VQC(enemy.position));
                                    return dist < retreatDistance;
                                });
                                ship.tooCloseShips = tooCloseShips;
                                ship.retreating = tooCloseShips.length > 0;
                            });
                        })
                    }
                    var calculateRetreatDirection = function (shipData) {
                        shipData.forEach(function (team) {
                            team.forEach(function (ship) {
                                var retreatDir = $VQC([0, 0, 0]);;
                                if (ship.retreating) {

                                    ship.tooCloseShips.forEach(function (enemy) {
                                        retreatDir = retreatDir.add($VQC(enemy.position))
                                    });
                                    retreatDir = retreatDir.divide(ship.tooCloseShips.length);
                                    $VQC(ship.position).subtract(retreatDir);
                                }
                                ship.direction = retreatDir;
                            });
                        })
                    }
                    var calculateTargetDirection = function (shipData) {
                        shipData.forEach(function (team) {
                            team.forEach(function (ship) {
                                if (!ship.retreating) {
                                    var targetShipPosition = getShipPosition(ship.target, shipData);
                                    if (targetShipPosition) {
                                        targetShipPosition = $VQC(targetShipPosition);
                                        ship.direction = targetShipPosition.subtract($VQC(ship.position));
                                    }
                                    else {
                                        ship.direction = $VQC([1, 0, 0])
                                    }
                                }
                            });
                        })
                    };
                    var getAllShipsCloserThan = function (dist, ship, shidData) {
                        var result = [];
                        var shipdistance = $VQC(ship.position);
                        shipData.forEach(function (team) {
                            team.forEach(function (othership) {
                                if (othership.name !== ship.name) {
                                    if (dist > $VQC(othership.position).distance(shipdistance)) {
                                        result.push(othership);
                                    }
                                }
                            })
                        });
                        return result;
                    };
                    var calculateEvasiveManeuvers = function (shipData) {
                        shipData.forEach(function (team) {
                            team.forEach(function (ship) {
                                var shipsCloserThan = getAllShipsCloserThan(evadeDistance, ship, shipData);
                                var evasiveDir = $VQC([0, 0, 0]);

                                if (shipsCloserThan.length) {
                                    shipsCloserThan.forEach(function (closeShip) {
                                        evasiveDir = evasiveDir.add($VQC(closeShip.position));
                                    });

                                    evasiveDir = evasiveDir.cross(ship.direction);
                                }

                                ship.evasiveDir = evasiveDir;
                            });
                        })
                    }
                    var calculateFinalDirection = function (shipData) {
                        shipData.forEach(function (team) {
                            team.forEach(function (ship) {
                                var direction = ship.evasiveDir
                                    .add(ship.direction).unit();
                                var shiposVector = $VQC(ship.position);
                                if (shiposVector.length() > boundarySphere) {
                                    direction = ship.evasiveDir
                                   .add(ship.direction).add(shiposVector.multiply(-1)).unit()
                                }
                                if (ship.position[2] < .1) {
                                    direction = ship.evasiveDir
                                   .add(ship.direction).add(shiposVector.multiply(-1))
                                        .add($VQC([0, 0, 1 - (1 - ship.position[2])])).unit()
                                }
                                if (ship.positions.length > 1) {
                                    var current = shiposVector.subtract($VQC(ship.positions[ship.positions.length - 2])).unit();
                                    var changeOfDirection = direction.subtract(current);
                                    var amoutOfChange = changeOfDirection.length();
                                    if (amoutOfChange > maxAngularVelocity) {
                                        changeOfDirection = changeOfDirection.getVectorOfLength(maxAngularVelocity);
                                    }
                                    direction = current.add(changeOfDirection).unit();
                                }


                                ship.direction = direction;
                            });
                        });
                    }
                    var shipPositionDictionary = {};
                    var calculateNextPosition = function (shipData) {
                        var lowerz = 0;
                        shipData.forEach(function (team) {
                            team.forEach(function (ship) {
                                var speed = ship.retreating ? retreatSpeed : chaseSpeed;
                                var pos = $VQC(ship.position).add(ship.direction.multiply(speed));
                                ship.position = pos.vector;
                                if (lowerz > pos.vector[2]) {
                                    lowerz = pos.vector[2]
                                }
                                shipPositionDictionary[ship.name] = ship.position;
                            });
                        });
                        return lowerz;
                    };

                    var positionEmptyTargets = function (shipData, frame) {
                        shipData.forEach(function (team) {
                            team.forEach(function (ship) {
                                var position = getShipPosition(ship.target, shipData);

                                if (!position) {
                                    position = getShipPosition(ship.name, shipData);
                                }

                                keyframes.push({
                                    frame: frame,
                                    objects: [me.createKeyFrame({
                                        name: me.getEmptyTargetName(ship),
                                        position: {
                                            x: position[0],
                                            y: position[1],
                                            z: position[2]
                                        }
                                    })]
                                });
                            });
                        });
                    };

                    var addShipPaths = function (shipData, objects) {
                        shipData.forEach(function (team) {
                            team.forEach(function (ship) {
                                var shippath = me.createShipPath(ship, { duration: lastframe, pipes: options.pipes });
                                objects.push(shippath);
                                intialframe.objects.push({
                                    "name": shippath.name
                                });
                                var res = me.createShipPipes(ship, { lastframe: lastframe, pipes: options.pipes });
                                objects.push.apply(objects, res.objects);
                                keyframes.push.apply(keyframes, res.frames);
                            });
                        })
                    }
                    var low = 0;
                    var lowest = 0;
                    //for (var i = 0 ; i < lastframe; i = i + step) {
                    var i = 0;
                    objects.push.apply(objects, cameras);
                    var anim = function () {
                        if (i < lastframe) {

                            if (i === 0 || (i > 0 && i % changetarget === 0)) {
                                assignTargets(shipData, i)
                            }

                            // get current positions
                            saveCurrentPositions(shipData);

                            // calculate if retreat required
                            calculateIfRetreatRequired(shipData);

                            // calculate retreat direction 
                            calculateRetreatDirection(shipData);

                            // calulate target direction
                            calculateTargetDirection(shipData);

                            // calculate evasive maneuver
                            if (i % checkPotentialCollisionsEvery === 0) {
                                calculateEvasiveManeuvers(shipData);
                            }

                            // add all together
                            calculateFinalDirection(shipData);

                            //position empty targets
                            positionEmptyTargets(shipData, i);

                            // multiply times speed
                            low = calculateNextPosition(shipData);
                            if (low < lowest) {
                                lowest = low;
                            }

                            i = i + step;
                            requestAnimationFrame(anim);
                        }
                        else {
                            assignTargets(shipData, lastframe)

                            addShipPaths(shipData, objects);
                            shipGroupsForTracks.forEach(function (ships, i) {
                                ships.forEach(function (ship, index) {
                                    var shippos = { x: 0, y: 0, z: 0 };
                                    me.setShipPosition(ship, shippos);
                                    intialframe.objects.push(ship);
                                });
                            });
                            stepresolve();

                        }
                    }
                    requestAnimationFrame(anim);
                }).then(function () {

                });
            })
        },
        attachCity: function (sceneData) {
            var me = this,
                objects = sceneData.objects,
                keyframes = sceneData.keyframes,
                count = 0,
                city_size = 1000,
                city_state = MEPH.util.CitySystem.get({ iterations: 30, size_w: city_size, size_h: city_size });
            var addCityBlockToScene = function (state) {
                state.forEach(function (t) {
                    if (Array.isArray(t)) {
                        addCityBlockToScene(t);
                    }
                    else {
                        switch (t.type) {
                            case 'lot':
                            case 'city_alley':
                            case 'sidewalk':
                                objects.push({
                                    'name': 'city_object_sidewalk_' + count,
                                    'type': 'cube'
                                });
                                var frame = {
                                    frame: 1,
                                    objects: [{
                                        'name': 'city_object_sidewalk_' + count,
                                        'position': {
                                            x: t.position.x,
                                            y: t.position.y,
                                            z: .1
                                        },
                                        'scale': {
                                            x: t.width / 2,
                                            y: t.height / 2,
                                            z: .2
                                        }
                                    }]
                                }
                                keyframes.push(frame);
                                break;
                            case 'city_building':
                                objects.push({
                                    'name': 'city_object_city_building_' + count,
                                    'type': 'cube'
                                });


                                var dist = MEPH.math.Vector.Quick.Create([t.position.x, t.position.y, 0]).length();
                                var max_height = MEPH.math.Util.window.Triangle(0, dist, city_size) * 100;

                                var vert_height = (3 + (3 * (Math.random() * max_height))) / 2;

                                var frame = {
                                    frame: 1,
                                    objects: [{
                                        'name': 'city_object_city_building_' + count,
                                        'position': {
                                            x: t.position.x,
                                            y: t.position.y,
                                            z: vert_height
                                        },
                                        'scale': {
                                            x: t.width / 2,
                                            y: t.height / 2,
                                            z: vert_height
                                        }
                                    }]
                                };

                                keyframes.push(frame);

                                break;
                        }

                        count++;
                    }
                })
            };

            var addCityToScene = function (state) {
                state.forEach(function (t) {
                    if (Array.isArray(t)) {
                        addCityToScene(t);
                    }
                    else {
                        var horizontal = 'horizontal';
                        var vertical = 'vertical';
                        if (t.type === 'road') {
                            var city_obj = {
                                'type': t.type === 'road' ? 'plane' : 'cube',
                                'name': 'city_object_road_' + count
                            };
                            objects.push(city_obj);
                            var dist = MEPH.math.Vector.Quick.Create([t.position.x, t.position.y, 0]).length();
                            var max_height = MEPH.math.Util.window.Triangle(0, dist, city_size / 2) * 100;

                            var vert_height = (3 + (3 * (Math.random() * max_height))) / 2;

                            var frame = {
                                frame: 1,
                                objects: [{
                                    'name': 'city_object_road_' + count,
                                    'position': {
                                        y: t.position.y,
                                        x: t.position.x,
                                        z: t.type === 'road' ? 0 : vert_height
                                    },
                                    'scale': {
                                        x: t.width / 2,
                                        y: t.height / 2,
                                        z: t.type === 'road' ? 0 : vert_height
                                    }
                                }]
                            }
                            keyframes.push(frame);
                            count++;
                        }
                        else {
                            var state = MEPH.util.CitySystem.block({
                                iterations: 30, size_w: t.width, size_h: t.height, area: t
                            });
                            addCityBlockToScene(state);
                        }
                    }
                })
            }
            return Promise.resolve().then(function () {
                addCityToScene(city_state);
                sceneData.city_state = city_state;
                return sceneData;
            });;
        },
        constructCityMap: function (city_state) {
            var roads = city_state.filter(function (x) {
                x.road_id = MEPH.GUID();
                return x.type === 'road'
            });
            var $VQC = $Vector.Quick.Create;
            var map = {};
            var hroadWidth = 30;
            roads.forEach(function (road) {
                var length = road.orientation === 'vertical' ? 'height' : 'width';
                var olength = road.orientation !== 'vertical' ? 'height' : 'width';
                var roadposition = $VQC([road.position.x, road.position.y, 0]);;
                roads.filter(function (t) {
                    return road.orientation !== t.orientation && t.road_id !== road.road_id;
                }).filter(function (otherRoad) {
                    var potentialCross = road.orientation === 'vertical' ?
                        $VQC([road.position.x, otherRoad.position.y, 0]) :
                        $VQC([otherRoad.position.x, road.position.y, 0]);
                    var dist = roadposition.distance(potentialCross);

                    if (dist <= road[length] / 2 + hroadWidth) {
                        var otherposition = $VQC([otherRoad.position.x, otherRoad.position.y, 0]);
                        dist = otherposition.distance(potentialCross);
                        if (dist <= otherRoad[olength] / 2 + hroadWidth) {
                            return true;
                        }
                    }
                    return false;
                }).forEach(function (otherRoad) {
                    map[road.road_id] = map[road.road_id] || {};
                    map[road.road_id][otherRoad.road_id] = true;
                });

            });
            return map;
        },
        shipFlyThrough: function (sceneData) {
            var me = this,
            objects = sceneData.objects,
            keyframes = sceneData.keyframes,
            midiTracks = sceneData.midiTracks,
            city_state = sceneData.city_state;
            keyframes.sort(function (x, y) {
                return x.frame - y.frame;
            });
            var map = me.constructCityMap(city_state);
            var tracksAndDefinitions = me.getShipsForTracksAndDefinitions(midiTracks, keyframes);
            keyframes.sort(function (x, y) {
                return x.frame - y.frame;
            });
            var lastframe = keyframes.last().frame;
            objects.push({
                "name": "default_sun_shipfly",
                "type": "lamp",
                "light": "SUN",
                "strength": 10.01,
                "rotation": { "x": 0, "y": -80, "z": 0 }
            })
            keyframes.push({
                frame: 1, objects: [{
                    "name": "default_sun_shipfly",
                    "type": "lamp",
                    "light": "SUN",
                    "strength": 10.01,
                    "rotation": { "x": 0, "y": -80, "z": 0 }
                }]
            });
            keyframes.push({
                frame: lastframe, objects: [{
                    "name": "default_sun_shipfly",
                    "type": "lamp",
                    "light": "SUN",
                    "strength": 10.01,
                    "rotation": { "x": 45, "y": 80, "z": 0 }
                }]
            });
            me.addShipsToMove(keyframes, objects, tracksAndDefinitions, map, city_state);
        },
        generateShipPath: function (randomRoads, randomRoad, city_state, map, options) {
            var me = this, result = [],
                done;
            var getPath = function (road, dest, map, seen) {
                var res = [];
                seen = seen || [];
                if (map[road] && map[road][dest]) {
                    res.push(dest);
                }
                else {
                    var best = null;
                    for (var i in map[road]) {
                        if (seen.indexOf(i) === -1) {
                            var traversed = seen.select().concat([i]);
                            var re = getPath(i, dest, map, traversed);
                            if (re && re.indexOf(road) === -1) {
                                if (best === null || best.length < traversed.length) {
                                    best = traversed;
                                }
                            }
                        }
                    }
                    res = best;
                }
                return res;
            }
            var getPoints = function (start, end) {
                if (start.orientation === 'horizontal') {
                    return [$VQC(start.position), $VQC({ x: end.position.x, y: start.position.y }), $VQC(end.position)];
                }
                return [$VQC(start.position), $VQC({
                    x: start.position.x,
                    y: end.position.y
                }), $VQC(end.position)];
            }
            var $VQC = $Vector.Quick.Create;
            var distancetraveled = 0;
            var step = .02;
            var speed = 1 / step;
            var ship_positions = [];
            var dist_to_travel = options.lastframe * speed;
            MEPH.math.Vector.skipeDefine = true;
            var end;
            while (!done) {
                done = true;
                var dest = randomRoads.random().first(function (t) { return t.road_id !== randomRoad.road_id; });
                var dest_path = getPath(end ? end.road_id : randomRoad.road_id, dest.road_id, map);
                if (dest_path)
                    dest_path.forEach(function (road, index) {
                        var start;
                        if (!end) {
                            start = city_state.first(function (t) { return t.road_id === randomRoad.road_id; });
                            end = city_state.first(function (t) { return t.road_id === road; });
                        }
                        else {
                            start = end;
                            end = city_state.first(function (t) { return t.road_id === road; });
                        };
                        var points = getPoints(start, end);
                        for (var p = 0 ; p < 2 ; p++) {
                            var dist = points[p].distance(points[p + 1]);
                            var count = dist / speed;
                            distancetraveled += dist;
                            [].interpolate(0, count, function (t) {
                                ship_positions.push($Vector.Lerp2D(points[p], points[p + 1], t / count));
                            });
                        }
                    });
                if (distancetraveled < dist_to_travel) {
                    done = false;
                }

            }
            return ship_positions;
        },
        addShipsToMove: function (keyframes, objects, tracksAndDefinitions, map, city_state) {
            var me = this;
            keyframes.sort(function (x, y) {
                return x.frame - y.frame;
            });
            var lastframe = keyframes.last().frame;
            var shipGroupsForTracks = tracksAndDefinitions.shipGroupsForTracks;
            var shipDefinitions = tracksAndDefinitions.shipDefinitions;
            var randomRoads = city_state.filter(function (t) { return t.type === 'road'; }).random()
            var cameras = [];
            shipGroupsForTracks.forEach(function (ships, i) {;
                ships.forEach(function (ship, index) {
                    var randomRoad = randomRoads[index % randomRoads.length];
                    var shippos = {
                        x: 0,
                        y: 0,
                        z: index + 3
                    };
                    me.setShipPosition(ship, shippos);
                    var shippositions = me.generateShipPath(randomRoads, randomRoad, city_state, map, {
                        lastframe: lastframe
                    });
                    ship.positions = shippositions;
                    var shippath = me.createShipPath(ship, { duration: lastframe });
                    objects.push(shippath);
                    me.createShipCameras(ship).forEach(function (camera, i) {
                        cameras.push(camera);
                        objects.push(camera);
                        keyframes.push(({
                            frame: 1, objects: [{
                                name: camera.name,
                                "lens": 15.66,
                                "sensor_width": 15.80,
                                "track_to": {
                                    "target": ship.name,
                                    "up_axis": "UP_Y",
                                    "track_axis": "TRACK_NEGATIVE_Z"
                                },
                                position: {
                                    x: 0,
                                    z: 20.21,
                                    y: -1
                                }
                            }]
                        }));
                    });
                    ship.scale = {
                        x: 10, y: 10, z: 10
                    };
                    ship.follow_path = {
                        "target": me.getShipPathName(ship)
                    };
                    keyframes.push({
                        frame: 1,
                        objects: [{
                            "name": shippath.name
                        }, ship]
                    })
                });
            });
            me.cameras = cameras;
            shipDefinitions.forEach(function (ships) {
                objects.push.apply(objects, ships);
                ships.forEach(function (ship) {
                    objects.push({
                        name: me.getEmptyTargetName(ship),
                        type: 'empty',
                        parent: ship.name
                    });
                    keyframes.push({
                        frame: 1,
                        objects: [{
                            "name": me.getEmptyTargetName(ship)
                        }]
                    })
                });
            });
        },
        getShipPathName: function (ship) {
            return ship.name + '_ship_path';
        },
        getShipsForTracksAndDefinitions: function (midiTracks, keyframes) {
            var me = this;
            var midiTracksWithContent = midiTracks.where(function (track) {
                return track.objects.length && track.events.length;
            });

            var uniqueTracksAndNotes = midiTracksWithContent.select(function (trackInfo, i) {
                return trackInfo.objects.select(function (t) {
                    return {
                        track: i,
                        noteNumber: t.noteNumber
                    }
                });
            });
            var shipGroupsForTracks = uniqueTracksAndNotes.select(function (trackInfo) {
                return me.getShipsForTrack(trackInfo, keyframes);
            });
            var shipDefinitions = shipGroupsForTracks.select(function (x) { return x.shipDefinitions });


            shipGroupsForTracks = shipGroupsForTracks.select(function (x) { return x.ships; });
            return {
                shipGroupsForTracks: shipGroupsForTracks,
                shipDefinitions: shipDefinitions
            }
        },
        attachBattleScene: function (sceneData, chase) {
            var me = this,
                objects = sceneData.objects,
                keyframes = sceneData.keyframes,
                midiTracks = sceneData.midiTracks;

            return Promise.resolve().then(function () {
                return me.addBattleScene(objects, keyframes, midiTracks, {
                    trackSquareSize: 10,
                    chase: chase || false,
                    pipes: true
                });
            }).then(function () {
                return sceneData;
            });
        },
        generateChaseMovie: function (midiTracks) {
            var me = this;
            var objects = [];
            var keyframes = [];
            var initialkeyframeobjects = []
            var initialkeyframe = {
                frame: 1,
                objects: initialkeyframeobjects
            };
            var midiTracksWithContent = midiTracks.where(function (track) {
                return track.objects.length && track.events.length;
            });
            var framesPerSecond = 24;
            var tempTrack = midiTracks.first(function (x) { return x.tempos.length; })
            var getFrame = function (keyframes, tempTrack, midiTracks, evt, trackIndex) {
                var endtime = getTime(tempTrack, midiTracks, { clock: evt.endclock });
                var endframeIndex = Math.round(endtime * framesPerSecond) + 1;
                return endframeIndex;
            }
            var lastframe = null;
            midiTracksWithContent.forEach(function (track, trackI) {
                track.events.forEach(function (evnt) {
                    var frame = getFrame(keyframes, tempTrack, midiTracks, evnt, trackI);
                    if (lastframe == null || lastframe < frame) {
                        lastframe = frame;
                    }
                });
            });
            var midDim = Math.ceil(Math.sqrt(midiTracksWithContent.length));
            var trackSquareSize = 10;
            var maxHeight = 3;
            var maxVelocity = 128;
            var sizeOfMidiNotePin = 5 / 127;

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
                startAndEnd.noteNumber = evt.noteNumber;

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
            var colorslight = [].interpolate(0, midiTracks.length, function (t) {
                var i = t + 1;
                var Materials = Blend.presentation.view.Blender.Materials;
                return Materials[i % Materials.length] + 'Light';
            });


            midiTracksWithContent.forEach(function (track, trackI) {
                track.objects.forEach(function (obj, objecIndex) {
                    var name = getName(trackI, obj.noteNumber, obj.channel);
                    objects.push({
                        name: name,
                        type: "cube",
                        material: colorslight[trackI] || colorslight[0]
                    });

                    initialkeyframeobjects.push(me.createKeyFrame({
                        name: name,
                        position: trackSquareObjectPosition(trackI, obj.noteNumber),
                        scale: startScale,
                        rotation: startRotation
                    }));
                });

                track.events.forEach(function (evnt) {
                    getFrame(keyframes, tempTrack, midiTracks, evnt, trackI);
                });
            });
            keyframes.push({
                frame: lastframe + 60,
                objects: []
            });
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

                "strength": 0,
                "type": "lamp",
                "light": "SUN"
            });

            initialkeyframeobjects.push({
                "name": "default_camera",
                "position": { "x": 0, "y": -13.26655, "z": 2.84575 },
                "target": "default_empty",
                "lens": 15.66,
                "sensor_width": 15.80
            }, {
                "name": "default_empty",
                "position": { "x": 0, "y": 0, "z": 2.2 }
            }, {
                "name": "default_sun",
                "type": "lamp",
                "light": "SUN",
                "strength": 0.01,
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
                startEnd: keyframes.last().frame,
                midiTracks: midiTracks
            }

        },
        generateStageInfoMovie: function (midiTracks) {
            var me = this;
            var objects = [];
            var keyframes = [];
            var framesPerSecond = 24;

            var midiTracksWithContent = midiTracks.where(function (track) {
                return track.objects.length && track.events.length;
            });
            var chordData = me.getChordData(midiTracks);
            var uniqueChordCharacterData = me.collectUniqueCharactersFromChordData(chordData);
            var tempTrack = midiTracks.first(function (x) { return x.tempos.length; })
            var midDim = Math.ceil(Math.sqrt(midiTracksWithContent.length));
            var trackSquareSize = 10;
            var maxHeight = 3;
            var maxVelocity = 128;
            var sizeOfMidiNotePin = 5 / 127;

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
                startAndEnd.noteNumber = evt.noteNumber;

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
            var colorslight = [].interpolate(0, midiTracks.length, function (t) {
                var i = t + 1;
                var Materials = Blend.presentation.view.Blender.Materials;
                return Materials[i % Materials.length] + 'Light';
            });


            midiTracksWithContent.forEach(function (track, trackI) {
                track.objects.forEach(function (obj, objecIndex) {
                    var name = getName(trackI, obj.noteNumber, obj.channel);
                    objects.push({
                        name: name,
                        type: "cube",
                        material: colorslight[trackI] || colorslight[0]
                    });

                    initialkeyframeobjects.push(me.createKeyFrame({
                        name: name,
                        position: trackSquareObjectPosition(trackI, obj.noteNumber),
                        scale: startScale,
                        rotation: startRotation
                    }));
                });
                window.skipNotesAndLines = true;
                if (!window.skipNotesAndLines)
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
                            material: colorslight[t % midiTracksWithContent.length] || colorslight[0],
                            "font": "l_10646_",
                            "extrude": me.extrude
                        });
                        objects.push({
                            name: name + 'box',
                            type: "cube",
                            material: colorslight[t % colors.length] || colors[0]
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

                "strength": 0,
                "type": "lamp",
                "light": "SUN"
            });

            initialkeyframeobjects.push(
                {
                    "name": "default_camera",
                    "position": { "x": 0, "y": -13.26655, "z": 2.84575 },
                    "target": "default_empty",
                    "lens": 15.66,
                    "sensor_width": 15.80
                },
            {
                "name": "default_empty",
                "position": { "x": 0, "y": 0, "z": 2.2 }
            },
            //{
            //    "name": "default_ground_plane",
            //    "scale": { x: 1000, y: 1000, z: 1 },
            //    "position": { "x": 0, "y": 0, "z": 0 }
            //},
            {
                "name": "default_sun",
                "type": "lamp",
                "light": "SUN",
                "strength": 0.01,
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
                startEnd: keyframes.last().frame,
                midiTracks: midiTracks
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
                    noteNumber: evt.noteNumber,
                    position: pos
                });
                startAndEnd.noteNumber = evt.noteNumber;
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
        save: function (obj, saveFileObjects) {
            var me = this;
            var file = JSON.stringify(obj);
            saveFileObjects.push({ file: file, name: 'presentation-json-' + (obj.fileName || '') + '.js' })
            var aFileParts = [file];
            if (!window.donotSaveFiles) {
                var oMyBlob = new Blob(aFileParts, { type: 'application/javascript' });
                me.fileSaver.save(oMyBlob, 'presentation-json-' + (obj.fileName || '') + '.js');
            }
        },
        onLoaded: function () {
            var me = this;
            me.name = 'Blend presentation';
        }
    });
})();