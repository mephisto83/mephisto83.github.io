MEPH.define('MEPH.audio.midi.controller.MidiController', {
    statics: {

    },
    properties: {
        midiInputs: null
    },
    auto: function () {
        var me = this;
        if (me.$autoComplete) {
            return me.$autoComplete;
        }
        me.$autoComplete = me.access().then(function () {
            return me.list();
        }).then(function () {
            var noteOnCallbacks = [];
            var noteOffCallbacks = [];
            var othermessages = [];
            var scope = {
                noteOn: function (func, s) {
                    noteOnCallbacks.push({ func: func, s: s });
                },
                noteOff: function (func, s) {
                    noteOffCallbacks.push({ func: func, s: s });
                },
                message: function (func, s) {
                    othermessages.push({ func: func, s: s })
                }
            };
            me.on('midimessage', function (event) {
                // Mask off the lower nibble (MIDI channel, which we don't care about)
                switch (event.data[0] & 0xf0) {
                    case 0x90:
                        if (event.data[2] != 0) {  // if velocity != 0, this is a note-on message
                            noteOnCallbacks.forEach(function (t) {
                                t.func(event.data[1], event.data, event, event.data[2]);
                            });
                            // noteOn(event.data[1]);
                            return;
                        }
                        // if velocity == 0, fall thru: it's a note-off.  MIDI's weird, y'all.
                    case 0x80:
                        noteOffCallbacks.forEach(function (t) {
                            t.func(event.data[1], event.data, event, event.data[2]);
                        });
                        //noteOff(event.data[1]);
                        return;
                    default:
                        othermessages.forEach(function (t) {
                            t.func(event.data[1], event.data, event);
                        });
                        return;
                }
            });
            return scope;
        });
        return me.$autoComplete;
    },
    access: function () {
        var me = this;
        if (!navigator.requestMIDIAccess) {
            return Promise.reject(new Error('not supported'));
        }
        if (MEPH.audio.midi.controller.MidiController.midi) {
            me.ready = Promise.resolve(MEPH.audio.midi.controller.MidiController.midi);
        }
        else {
            me.ready = me.ready || new Promise(function (resolve, fail) {
                navigator.requestMIDIAccess({ sysex: true }).then(function (midi) {
                    me.midi = midi;
                    MEPH.audio.midi.controller.MidiController.midi = midi;
                    resolve(midi);
                    return midi;
                }, function (err) {
                    fail(err);
                });
            });

        }
        return me.ready;
    },
    inputs: function () {
        var me = this;
        return me.access().then(function (midi) {
            var midiAccess;

            if (midi) {
                midiAccess = midi;
                var inputs = midiAccess.inputs.values();
                me.midiInputs = [];
                for (var input = inputs.next() ; input && !input.done; input = inputs.next()) {
                    //input.value.onmidimessage = MIDIMessageEventHandler;
                    //haveAtLeastOneDevice = true;
                    me.midiInputs.push(input);
                }
                return me.midiInputs;
            }
        });
    },
    outputs: function () {
        var me = this;
        return me.access().then(function (midi) {
            var midiAccess;

            if (midi) {
                midiAccess = midi;
                var outputs = midiAccess.outputs.values();
                me.midiOutputs = [];
                for (var output = outputs.next() ; output && !output.done; output = outputs.next()) {
                    //output.value.onmidimessage = MIDIMessageEventHandler;
                    //haveAtLeastOneDevice = true;
                    me.midiOutputs.push(output);
                }
                return me.midiOutputs;
            }
        });
    },
    list: function () {
        var me = this;
        return me.access().then(function () {
            return me.inputs();
        }).then(function () {
            return me.outputs();
        }).then(function () {
            //    console.log("Input port [type:'" + input.type + "'] id:'" + input.id +
            //"' manufacturer:'" + input.manufacturer + "' name:'" + input.name +
            //"' version:'" + input.version + "'");
            var res = [];
            me.midiOutputs.foreach(function (x) {
                res.push({
                    midi: x.value,
                    isOutput: true,
                    isInput: false,
                    manufacturer: x.value.manufacturer,
                    name: x.value.name,
                    version: x.value.version,
                    id: x.value.id
                });
            });
            //          console.log("Output port [type:'" + output.type + "'] id:'" + output.id +
            //"' manufacturer:'" + output.manufacturer + "' name:'" + output.name +
            //"' version:'" + output.version + "'");
            me.midiInputs.foreach(function (x) {
                res.push({
                    midi: x.value,
                    isOutput: false,
                    isInput: true,
                    manufacturer: x.value.manufacturer,
                    name: x.value.name,
                    version: x.value.version,
                    id: x.value.id
                });
            });
            return res;
        });
    },
    on: function (type, func) {
        var me = this;
        me.midiInputs.foreach(function (x) {
            x.value['on' + type] = func;
        });
    }
});