MEPH.define('MEPHControls.midi.view.MidiController', {
    alias: 'mephcontrols_midicontroller',
    templates: true,
    extend: 'MEPH.mobile.activity.container.Container',
    mixins: ['MEPH.mobile.mixins.Activity'],
    injections: ['audioResources'],
    requires: [
        'MEPH.list.View',
        'MEPH.util.FileReader',
        'MEPH.input.Number',
        'MEPH.input.Text',
        'MEPH.panel.Panel',
        'MEPH.file.Dropbox',
        'MEPH.input.Dropdown',
        'MEPHControls.midi.view.MidiEventItem',
        'MEPHControls.midi.view.SoundItem',
        'MEPHControls.midi.view.BankItem',
        'MEPH.input.Checkbox',
        'MEPH.audio.midi.controller.MidiController'],
    properties: {
        $midiController: null,
        listsource: null,
        note: null,
        soundfonts: null,
        soundfontvalue: null,
        banks: null,
        defaultMidiNumberFormat: '###',
        audioFileNumberFormat: null,
        currentBankName: null,
        mp3SoundSample: null,
        listOfSounds: null,
        usingPiano: false,
        listOfBanks: null,
        addBy: null,
        currentBank: null,
        numshift: 0,
        optionsForAddingBanks: null,
        numberOfMidiNotesDetected: 0,
        numberOfSamplesDetected: 0
    },
    initialize: function () {
        var me = this;
        me.optionsForAddingBanks = MEPH.util.Observable.observable([]);
        me.mp3SoundSample = MEPH.util.Observable.observable([]);
        me.listOfBanks = MEPH.util.Observable.observable([]);
        me.listOfSounds = MEPH.util.Observable.observable([]);
        me.listsource = MEPH.util.Observable.observable([]);

        me.callParent.apply(me, arguments);

        me.$midiController = new MEPH.audio.midi.controller.MidiController();
        me.ready = me.$midiController.auto().then(function (scope) {
            me.$scope = scope;
        });
    },
    onLoaded: function () {
        var me = this;
        me.name = 'Midi Controller';
        me.optionsForAddingBanks.push({ name: 'Add Note', value: 2 }, { name: 'Add as Midi Keys', value: 1 })
        me.ready.then(function () {
            console.log('loading the instrument');
            me.loadInstrument();
            me.audioFileNumberFormat = me.defaultMidiNumberFormat;
            me.addBy = 1;
            
            MEPH.util.Style.hideshow(me.activityview.optionspanel.addMidiKeyOption, me.activityview.optionspanel.addSamplesOption);
        })
    },
    loadResources: function () {
        var me = this, files = MEPH.Array(arguments).last().domEvent.files;
        return me.when.injected.then(function () {
            return MEPH.util.FileReader.readFileList(files, { readas: 'ArrayBuffer' })
                .then(function (fileResults) {
                    if (me.$inj && me.$inj.audioResources) {
                        me.$inj.audioResources.addResources(fileResults).then(function () {
                            me.updateResources();
                        })
                    }
                });
        });
    },
    updateResources: function () {
        var me = this;
        if (me.$updateTimeout) {
            clearTimeout(me.$updateTimeout);
        }
        me.allSounds = me.allSounds || [];
        me.$updateTimeout = setTimeout(function () {
            var resources = me.$inj.audioResources.getResources();
            var filter = function (x) {
                return me.allSounds.indexOf(x.id) === -1;
            };
            resources = resources.where(filter);
            me.soundfonts = resources.select(function (t) {
                if (t.resource && t.resource.file) {
                    me.allSounds.push(t.id);
                    return ({
                        name: t.resource.file.name,
                        id: t.id,
                        type: 'font'
                    });
                }
            }).where();
            me.listOfSounds.push.apply(me.listOfSounds, resources.select(function (t) {
                if (!(t.resource && t.resource.file)) {
                    me.allSounds.push(t.id);
                    return ({
                        name: t.name,
                        id: t.id,
                        type: 'font',
                        file: t.file
                    });
                }
            }).where().where(function (x) {
                return !me.listOfSounds.contains(function (t) {
                    return t.name === x.name;
                });
            }));
            me.detectNotes();
            me.mp3SoundSample.push.apply(me.mp3SoundSample, resources.select(function (t) {
                if (t && t.file) {
                    me.allSounds.push(t.id);
                    return ({
                        name: t.file,
                        id: t.id,
                        type: 'audio'
                    });
                }
            }).where());
            me.numberOfSamplesDetected = me.mp3SoundSample.length;
            if (me.soundfonts.first()) {
                me.soundfontvalue = me.soundfonts.first().id;
            }
        }, 1000)
    },
    clickedOnBank: function () {
        var me = this,
            data = MEPH.util.Array.convert(arguments).last().domEvent.data;

        me.currentBank = data;
    },
    detectNotes: function () {
        var me = this;
        me.audioFileNumberFormat = me.audioFileNumberFormat || me.defaultMidiNumberFormat
        me.numberOfMidiNotesDetected = me.listOfSounds.count(function (x) {
            var res = x.file.getNumber(me.audioFileNumberFormat);
            return res != null;
        });
        me.numberOfSamplesDetected = me.mp3SoundSample.length;
    },
    bookCurrentNotesToBank: function () {
        var me = this;
        if (me.listOfSounds.length) {
            me.createBank(me.listOfSounds.select(function (x) {
                var res = x.file.getNumber(me.audioFileNumberFormat);
                x.midiNote = res;
                return x;
            }), me.currentBankName);
        }
        me.updateSoundLists();
    },
    updateSoundLists: function () {
        var me = this;
        if (me.listOfSounds)
            me.listOfSounds.dump();
        if (me.mp3SoundSample)
            me.mp3SoundSample.dump();
        me.detectNotes();
    },
    bookCurrentSamplesToBank: function () {
        var me = this;
        if (me.mp3SoundSample.length)
            me.createBank(me.mp3SoundSample.select(function (x, index) {
                x.midiNote = index + 1;
                return x;
            }), me.currentBankName)

        me.updateSoundLists();
    },
    createBank: function (notes, name) {
        var me = this;
        me.listOfBanks.push({ notes: notes, name: name });
    },
    useSoundFont: function () {
        var me = this;
        me.when.injected.then(function () {
            var sound = me.$inj.audioResources.getResources().first(function (x) {
                return x.id === me.soundfontvalue;
            });
            if (sound) {
                var chunks = me.loadChunks(sound);

                var soundFontAudioInstances = chunks.select(function (chunk) {
                    var t = me.$inj.audioResources.getSoundFontAudioInstance(chunk);
                    t.id = chunk.id;
                    t.complete();
                    return t;
                });
                me.audioChunks = chunks;
                //                me.soundFontAudioInstances = soundFontAudioInstances;

            }
        })
    },
    loadChunks: function (info) {
        var me = this,
                   soundFontInstrument = info.soundfontInstrument;

        var chunks = soundFontInstrument.sampleChunks();
        me.selectedSoundFontId = info.id;
        me.selectedSoundFont = soundFontInstrument.$soundfontfile;
        me.selectedSoundFontChunks = chunks.select(function (x) {
            return ({
                name: x.name,
                id: x.id,
                sid: info.id
            });
        });
        return me.selectedSoundFontChunks;
    },
    clearCache: function () {
        var me = this;
        me.audioCache = null;
    },
    usePiano: function () {
        var me = this;
        me.usingPiano = true;
        me.loadGrandPiano();
    },
    loadGrandPiano: function () {
        var me = this;
        if (!me.pianoloaded) {
            me.pianoloaded = true;
            return MEPH.requires('MEPH.audio.music.instrument.piano.GrandPiano').then(function (piano) {
                var grandpiano = new MEPH.audio.music.instrument.piano.GrandPiano();
                return grandpiano.ready().then(function () {
                    var sequence = grandpiano.createSequence();
                    //if (me.$inj && me.$inj.audioResources) {
                    //  me.$inj.audioResources.addSequence(sequence);
                    me.grandpiano = grandpiano;
                    //me.openSequence(sequence.id);
                    // }
                })
            })
        }
    },
    openSequence: function () {
        var me = this;
    },
    get: function (id) {
        var me = this;
        me.audioCache = me.audioCache || {};
        me.audioCache[id] = me.audioCache[id] || [];
        var found = me.audioCache[id].first(function (x) {
            return x.isReady();
        });
        if (found) {
            return found;
        }
        if (me.currentBank) {
            var note = me.currentBank.notes.first(function (x) {
                return x.midiNote - id === 0;
            });
            if (note) {
                var audio = me.$inj.audioResources.getGraphInstance(note.id);
                if (audio) {
                    me.audioCache[id].push(audio);

                    return audio;
                }
            }
        }
        else if (me.usingPiano) {
            if (me.grandpiano) {
                me.grandpianosequence = me.grandpianosequence || me.grandpiano.createSequence();

                if (t) {
                    t.id = chunk.id;
                    //t.complete();
                    me.audioCache[id].push(t);
                    return t;
                }
            }
        }
        else if (me.audioChunks) {
            var chunk = me.audioChunks.first(function (chunk) {
                return chunk.id === id;
            });
            var t = me.$inj.audioResources.getSoundFontAudioInstance(chunk);
            t.id = chunk.id;
            me.audioCache[id].push(t);
            return t;
        }
    },
    loadInstrument: function () {
        var context = null;   // the Web Audio "context" object
        var midiAccess = null;  // the MIDIAccess object.
        var oscillator = null;  // the single oscillator
        var envelope = null;    // the envelope for the single oscillator
        var attack = 0.05;      // attack speed
        var release = 0.05;   // release speed
        var portamento = 0.05;  // portamento/glide speed
        var activeNotes = []; // the stack of actively-pressed keys

        // patch up prefixes
        //window.AudioContext = window.AudioContext || window.webkitAudioContext;

        //context = new AudioContext();
        //if (navigator.requestMIDIAccess)
        //    navigator.requestMIDIAccess().then(onMIDIInit, onMIDIReject);
        //else
        //    alert("No MIDI support present in your browser.  You're gonna have a bad time.")

        // set up the basic oscillator chain, muted to begin with.
        //oscillator = context.createOscillator();
        //oscillator.frequency.setValueAtTime(110, 0);
        //envelope = context.createGain();
        //oscillator.connect(envelope);
        //envelope.connect(context.destination);
        //envelope.gain.value = 0.0;  // Mute the sound
        //oscillator.start(0);  // Go ahead and start up the oscillator

        function frequencyFromNoteNumber(note) {
            return 440 * Math.pow(2, (note - 69) / 12);
        }

        function noteOn(noteNumber, data, evt) {
            var soundfont = me.get(noteNumber - me.numshift);
            //    me.soundFontAudioInstances.first(function (x) {
            //    return x.id === (noteNumber - me.numshift);
            //});
            if (soundfont) {
                activeNotes.push(soundfont);
                soundfont.complete();
                if (me.currentBank) {
                    soundfont.play(0);
                }
                else {
                    soundfont.playProcessor(0, true);
                }
                //debugger
            }
            //activeNotes.push(noteNumber);
            //oscillator.frequency.cancelScheduledValues(0);
            //oscillator.frequency.setTargetAtTime(frequencyFromNoteNumber(noteNumber), 0, portamento);
            //envelope.gain.cancelScheduledValues(0);
            //envelope.gain.setTargetAtTime(1.0, 0, attack);
            //me.listsource.unshift({ data: data, on: true, number: noteNumber, evt: evt });
            me.note = noteNumber;

        }
        var throttle = {};
        function noteOff(noteNumber, data, evt) {
            //var soundfont = me.get(noteNumber - me.numshift);
            //if (me.currentBank && soundfont) {
            //    soundfont.stop(0);
            //}
            //else {
            //}
            //setTimeout()
            //var soundfont = activeNotes.first(function (x) {
            //    return x.isReady() && x.id === (noteNumber - me.numshift);
            //});
            //if (soundfont) {
            //    soundfont.stopProcessor();
            //}
            //var position = activeNotes.indexOf(noteNumber);
            //if (position != -1) {
            //    activeNotes.splice(position, 1);
            //}
            //if (activeNotes.length == 0) {  // shut off the envelope
            //    envelope.gain.cancelScheduledValues(0);
            //    envelope.gain.setTargetAtTime(0.0, 0, release);
            //} else {
            //    oscillator.frequency.cancelScheduledValues(0);
            //    oscillator.frequency.setTargetAtTime(frequencyFromNoteNumber(activeNotes[activeNotes.length - 1]), 0, portamento);
            //}
            //  me.listsource.unshift({ data: data, on: true, key: noteNumber, evt: evt });

        }
        function othermessages(noteNumber, data, evt) {
            me.listsource.unshift({ data: data, on: true, key: noteNumber, evt: evt });
        }
        var me = this;
        me.$scope.noteOn(noteOn);
        me.$scope.noteOff(noteOff);
        me.$scope.message(othermessages);
    },
    clear: function () {
        var me = this;
        me.listsource.dump();
    }
});