var Mephistowa = Mephistowa || {};
Mephistowa.MIDI = function (options) {
    options = options || {};
    this.listeners = [];
    this.midis = [];

    for (var i in options) {
        this["set_" + i] = function (i, value) {
            this["_" + i] = value;
        }.bind(this, i);
        this["get_" + i] = function (i) {
            return this["_" + i];
        }.bind(this, i);
        this["set_" + i](options[i]);
    }
    this.midiInstruments = [];
    $(this.get_panel()).panel();
    $(this.get_selectbtn()).click(this.select.bind(this));
    $(this.get_playmidifile()).click(this.playMidiFile.bind(this));
    $(this.get_playmidifilesection()).click(this.playMidiFileSection.bind(this));

    this.addListener('fileAdded', this.loadList.bind(this));
    this.addListener('midiselected', this.midiSelected.bind(this));
    this.addListener('select', this.createBankFromMidiNotes.bind(this));
    this.get_pianoDrawer().addListener('midiloaded', this.midiLoaded.bind(this));
    this.addListener('programlistupdated', this.updateMidiInstrumentList.bind(this));
    window.addListener("newintruments", this.updateMidiInstrumentList.bind(this));
}

Mephistowa.MIDI.prototype = {
    updateMidiInstrumentList: function (args) {
        $(this.get_midiInstrumentsSpace()).html("");
        for (var i = 0 ; i < this.midiInstruments.length ; i++) {
            var div = $("<div>");
            var inst = MIDI.instruments[this.midiInstruments[i].instrument.programNumber];
            var span = $("<span>", {
                text: inst ? inst.instrument : ""
            });
            var instruments = [];
            if (args.instruments) {
                args.instruments.forEach(function (x) {
                    instruments.push({ text: x, value: x });
                });
            }
            else
                for (var j in (window.MIDI.AudioBuffers)) {
                    instruments.push({ text: j, value: j });
                }
            var instrumentselect = $cc.runtime.createSelect(instruments, { 'data-mini': true });
            instrumentselect.change(function (instr) {
                instr.soundfont = instrumentselect.val();
            }.bind(this, this.midiInstruments[i]));
            div.append(span);
            div.append(instrumentselect);
            $(this.get_midiInstrumentsSpace()).append(div);
        }
    },
    getMidiInstrument: function (num) {
        var result = this.midiInstruments.first(function (x) { return x.instrument.programNumber == num });
        if (result)
            return result.soundfont;
        return result;
    },
    midiLoaded: function (args) {
        var programChanges = args.drawer.getProgramChanges();
        programChanges.where(function (x) { return !this.midiInstruments.contains(function (y) { return y.instrument == x }) }.bind(this))
        .forEach(function (x) { this.midiInstruments.push({ instrument: x, soundfont: null }); }.bind(this));
        this.raise('programlistupdated', {});
    },
    playMidiFile: function () {
        if (this.getMidiBankEntry() == null) {
            var drawer = this.get_pianoDrawer();
            var notes = drawer.getNotes();
            if (notes.length == 0) return;
            var bank = this.convertToNotes(notes);
            this.setMidiBankEntry(bank);
        }
        var bankentry = this.getMidiBankEntry();
        $cc.runtime.play(bankentry, 1);
    },
    playMidiFileSection: function () {
        var drawer = this.get_pianoDrawer();
        var notes = drawer.getSelected();
        if (notes == null || notes.length == 0) return;
        var bank = this.convertToNotes(notes);
        $cc.runtime.play(bank, 1);
    },
    getMidiBankEntry: function (bank) {
        return this._midiBankEntry || null;
    },
    setMidiBankEntry: function (bank) {
        this._midiBankEntry = bank;
    },
    clear: function () {
        this.setMidiBankEntry(null);
    },
    midiSelected: function (args) {
        var drawer = this.get_pianoDrawer();
        setTimeout(function () {
            drawer.loadFile(args.midi.file, args.midi.e);
        }, 100);
    },
    createBankFromMidiNotes: function (selection) {
        var drawer = this.get_pianoDrawer();
        var tempo = drawer.getBeatTime();
        var notes = selection.selection.orderBy(function (x, y) {
            return x.currentTime - y.currentTime;
        }).select(function (x) {
            var item = x;
            var result = {};
            for (var i in item) {
                result[i] = item[i];
            }
            result.beats = (item.endTime - item.currentTime) / tempo;
            return result;
        });
        //var reversed = notes.select(function (x) { return x }).orderBy(function (x, y) { return -(x.currentTime - y.currentTime); });
        var shortestnote = notes.maxSelection(function (item) { return -(item.beats) });
        var longestnote = notes.maxSelection(function (item) { return (item.beats) });
        var lastnote = notes.last();
        var start = notes.first();
        var startTime = start.currentTime;
        var endTime = lastnote.endTime;
        var totalLength = endTime - startTime;
        var singleValue = 1 / this.getSingleValue();//shortestnote.beats;
        var longestValueNote = longestnote.beats * singleValue;
        var uniquenotes = notes.unique(function (x) { return x.noteNumber; }).orderBy(function (x, y) { return x.noteNumber - y.noteNumber }).select(function (x) { return x.noteNumber });

        var lowest = -uniquenotes.max(function (x) { return -x; });
        var melodynote = $cc.runtime.convertToMelodyNote(lowest);
        var baseint = $cc.variables.library[melodynote.key + melodynote.accidental];
        var entryobject = $cc.runtime.createBank({
            melodylist: uniquenotes.select(function (x) { return $cc.runtime.convertToMelodyNote(x) }),
            selectedBeats: totalLength / tempo,
            selectedBeat: totalLength,
            base_int: baseint,
            v: uniquenotes.select(function (x) { return (x - uniquenotes[0]).toString(12) }),
            selectedDivisions: Math.ceil(totalLength * singleValue),
            selectedNotes: notes.select(function (x) {
                var divisions = Math.ceil(totalLength * singleValue);
                return [uniquenotes.indexWhere(function (y) { return x.noteNumber == y; })[0].toString(),
                        ((x.currentTime - startTime) * singleValue).toString(),
                        (x.beats) * singleValue,
				        x.velocity];
            }),
            keyStyle: $cc.keystyles.userdefined
        });

        $cc.variables.bankentry.push(entryobject);
        $cc.runtime.raise("bankchange", entryobject);
    },
    getSingleValue: function () {
        var drawer = this.get_pianoDrawer();
        var tempo = drawer.getBeatTime();
        var min = -drawer.getNotes().select(function (x) {
            var item = x;
            var result = {};
            result.beats = (item.endTime - item.currentTime) / tempo;
            return result;
        }).where(function (x) { return x.beats != 0 }).max(function (item) { return -(item.beats) });
        return min;
    },
    convertToNotes: function ($notes) {
        var drawer = this.get_pianoDrawer();
        var tempo = drawer.getBeatTime();
        var notes = $notes.orderBy(function (x, y) {
            return x.currentTime - y.currentTime;
        }).select(function (x) {
            var item = x;
            var result = {};
            for (var i in item) {
                result[i] = item[i];
            }
            result.beats = (item.endTime - item.currentTime) / tempo;
            return result;
        });
        //var reversed = notes.select(function (x) {
        //    return x
        //}).orderBy(function (x, y) {
        //    return -(x.currentTime - y.currentTime);
        //});
        var shortestnote = notes.maxSelection(function (item) { return -(item.beats) });
        var longestnote = notes.maxSelection(function (item) { return (item.beats) });
        var lastnote = notes.last();
        var start = notes.first();
        var startTime = start.currentTime;
        var endTime = lastnote.endTime;
        var totalLength = endTime - startTime;
        var singleValue = 1 / this.getSingleValue();//shortestnote.beats;
        var longestValueNote = longestnote.beats * singleValue;
        var uniquenotes = notes.unique(function (x) { return x.noteNumber; }).orderBy(function (x, y) { return x.noteNumber - y.noteNumber }).select(function (x) { return x.noteNumber });
        var entryobject = $cc.runtime.createBank({
            melodylist: uniquenotes.select(function (x) { return $cc.runtime.convertToMelodyNote(x) }),
            selectedBeats: totalLength / tempo,
            selectedBeat: totalLength,
            v: uniquenotes.select(function (x) { return (x - uniquenotes[0]).toString(12) }),
            selectedDivisions: Math.ceil(totalLength * singleValue),
            selectedNotes: notes.select(function (x) {
                var divisions = Math.ceil(totalLength * singleValue);
                return [uniquenotes.indexWhere(function (y) { return x.noteNumber == y; })[0].toString(),
                        ((x.currentTime - startTime) * singleValue).toString(),
                        (x.beats) * singleValue,
				        x.velocity, drawer.getProgramFor(x.channel, x.currentTime)];
            }),
            keyStyle: $cc.keystyles.userdefined
        });

        return entryobject;
    },
    select: function () {
        var drawer = this.get_pianoDrawer();
        var selected = drawer.getSelected();
        this.raise('select', { selection: selected });
    },
    loadList: function () {
        $(this.get_listspace()).html('');
        var list = $cc.runtime.createList();
        for (var i = 0; i < this.midis.length ; i++) {
            var li = $("<li>");
            var ahref = $("<a>", {
                href: '#',
                text: this.midis[i].file.name,
                title: this.midis[i].file.name,
                click: function (midi) {
                    this.clear();
                    this.raise('midiselected', { midi: midi });
                }.bind(this, this.midis[i])
            });
            li.append(ahref);
            list.append(li);
        }
        $(this.get_listspace()).append(list);
        list.listview();
    },
    raise: function (type, args) {
        this.listeners.where(function (x) { return x.type == type })
		.foreach(function (x, index) {
		    x.func(args)
		});
    },
    addListener: function (type, func) {
        this.listeners.push({ type: type, func: func });
    },
    addMidi: function (file, e) {
        this.midis.push({ file: file, e: e });
        this.raise('fileAdded', { file: file, e: e });
    },
    getMidis: function () {
        return this.midis;
    },
    handleSelect: function (evt) {
        var files = evt.target.files; // FileList object

        // Loop through the FileList and render image files as thumbnails.
        for (var i = 0, f; f = files[i]; i++) {

            // Only process image files.
            var reader = new FileReader();

            // Closure to capture the file information.
            reader.onload = (function (theFile) {
                return function (e) {
                    this.addMidi(theFile, e);

                }.bind(this);
            }.bind(this))(f);

            // Read in the image file as a data URL.
            reader.readAsDataURL(f);

        };
    }
}