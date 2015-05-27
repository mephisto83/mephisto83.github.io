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
        'MEPH.file.Dropbox',
        'MEPH.input.Dropdown',
        'MEPHControls.midi.view.MidiEventItem',
        'MEPH.audio.midi.controller.MidiController'],
    properties: {
        $midiController: null,
        listsource: null,
        note: null,
        soundfonts: null,
        soundfontvalue: null,
        numshift: 0
    },
    initialize: function () {
        var me = this;
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
        me.ready.then(function () {
            console.log('loading the instrument');
            me.loadInstrument();
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
        me.$updateTimeout = setTimeout(function () {
            var resources = me.$inj.audioResources.getResources();
            me.soundfonts = resources.select(function (t) {
                if (t.resource && t.resource.file) {
                    return ({
                        name: t.resource.file.name,
                        id: t.id,
                        type: 'font'
                    });
                }
            })
            if (me.soundfonts.first()) {
                me.soundfontvalue = me.soundfonts.first().id;
            }
        }, 1000)
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
    clearCache: function(){
        var me = this;
        me.audioCache = null;
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
        var chunk = me.audioChunks.first(function (chunk) {
            return chunk.id === id;
        });
        var t = me.$inj.audioResources.getSoundFontAudioInstance(chunk);
        t.id = chunk.id;
        //t.complete();
        me.audioCache[id].push(t);
        return t;
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
                soundfont.playProcessor(0, true);
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