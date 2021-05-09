var ComposerCompanion = {
    variables: {
        recordingSessions: [],
        threads: 4
    },
    state: {
        rhythmSessions: []
    },
    css: {
        ComposerCompanionItem: 'ComposerCompanionItem',
        seletedItemCss: 'seletedItemCss'
    },
    keystyles: {
        arpeggio_up: 'arpeggio_up',
        arpeggio_down: 'arpeggio_down',
        chord: 'chord',
        userdefined: 'userdefined'
    },
    workers: {
        composercompanionworker: 'Scripts/composercompanionworker.js'
    },
    popup: {
        compositeBankOptions: '#compositeBankOptions'
    },
    panel: {
        midipanel: '#midipanel',
        rhythmpanel: '#rhythmpanel',
        rhythmsForEntries: '#rhythmsForEntries',
        rhythemoptionspanel: '#rhythemoptionspanel',
        rhythmApplyPanel: '#rhythmApplyPanel'
    },
    letters: '12345qwert67890asdfyuiophgjklpqrstuvwxyz',
    spaces: {
        compositeBankOptionsSpace: '#compositeBankOptionsSpace',
        rhythmApplySpace: '#rhythmApplySpace',
        rhythmspace: '#rhythmspace',
        midiInstrumentsForAssignment: '#midiInstrumentsForAssignment',
        midilistspace: '#midilistspace',
        rhythmoptionspanelspace: '#rhythmoptionspanelspace',
        bankspace: '.bankspace',
        tracks: '#tracks',
        chordgenpanel: '#chordgenpanel',
        chordoptionspace: '#chordoptionspace',
        toplist: '#toplist',
        rhythmaddspace: '#rhythmaddspace',
        soundfontspace: '#soundfontspace'
    },
    inputs: {
        quickInputArea: '#quickInputArea',
        recordingtempo: '#recordingtempo',
        soundfontfiles: 'files',
        stepCounter: '#stepCounter',
        masterVolume: '#masterVolume',
        availableThreads: '#availableThreads',
        rhythemname: '#rhythemname',
        rhythmSearch: '#rhythmSearch'
    },
    lists: {
        rhythmlist: '#rhythmlist'
    },
    buttons: {
        createComposite: '#createComposite',
        closeAllBanks: '#closeAllBanks',
        itemMenuSelect: '#itemMenuSelect',
        itemMenuSelectAll: '#itemMenuSelectAll',
        instrumentsCC: '#instrumentsCC',
        itemMenuRemove: '#itemMenuRemove',
        itemMenuCreateComposite: '#itemMenuCreateComposite',
        quickInput: '#quickInput',
        quickInputAddBtn: '#quickInputAddBtn',
        startrecord: '#startrecord',
        addTrack: '#addTrack',
        addrhythmbtn: '#addrhythmbtn',
        newbtn: '#newbtn',
        savebtn: '#savebtn',
        stoprecord: '#stoprecord',
        timesignatureTop: '#timesignatureTopSelect',
        timesignatureBottomSelect: '#timesignatureBottomSelect',
        playbackcurrentsessionbtn: '#playbackcurrentsessionbtn'
    },
    intervals: {
        recordingInterval: null
    },
    runtime: {
        closeAllBanks: function () {
            $cc.runtime.getBankEntries().forEach(function (x) {
                x.closeBank();
            });
        },
        addQuickEntry: function (val) {
            val = val || "";
            var inputs = val.split("");
            var session = null;
            var duration = 1;
            for (var i = 0; i < inputs.length; i++) {
                var bank = $cc.runtime.getBankByKey(inputs[i]);
                if (bank) {
                    if (session == null) {
                        session = $cc.runtime.addTrack();
                    }
                    $cc.runtime.addEntryToTrack(bank, session.datarow, { startTime: duration });
                    duration += bank.getDuration(); // + 1/ bank.getDivisions();//1 is for spacing the sounds a beat.
                }
            }
        },
        minute: function () {
            var second = 1000;
            return second * 60;
        },
        addSession: function (session) {
            $cc.variables.recordingSessions.push(session);
            $cc.runtime.storeState();
        },
        removeSession: function (session) {
            $cc.variables.recordingSessions.removeWhere(function (x) { return x.id == session.id });
            $cc.runtime.storeState();
            $cc.runtime.removeTrackFromGantt(session.datarow);
        },
        setStepCounter: function (args) {
            $($cc.inputs.stepCounter).val(args.beat);
        },
        recordingSessionEntryAdded: function (args) {
            if ($cc.variables.currentRecordingSession && $cc.intervals.recordingInterval != null && $cc.variables.currentRecordingSession.beat >= 0) {
                $cc.variables.currentRecordingSession.addEntry(args);
            }
        },
        getSessionById: function (id) {
            return $cc.variables.recordingSessions.first(function (x) { return x.id == id });
        },
        addEntryToTrack: function (bank, datarow, options) {
            options = options || {};
            var temp = new Mephistowa.Gantt.DataItem({
                start: options.startTime,
                duration: bank.getDuration()
            }, "", {
                snap: 1
            })
            temp.addClass($cc.css.ComposerCompanionItem);
            var item = datarow.addItem(temp, {
                render: true
            });
            var session = $cc.runtime.getSessionById(datarow.sessionId);
            var date = $cc.variables.currentRecordingSession ? new Date().getTime() - $cc.variables.currentRecordingSession.start : null;
            var entry = {
                bankentry: bank,
                dataitem: item,
                beat: options.startTime != undefined ? options.startTime : $cc.variables.currentRecordingSession.beat,
                date: date
            }
            bank.addListener('updated', function (bank) {
                this._data.duration = bank.getDuration();
                this.update();
            }.bind(item, bank));
            item.addListener("updated", $cc.runtime.itemUpdated.bind({
                item: item,
                entry: entry
            }));
            item._bank = bank;
            item.addListener("contextmenu", function (args) {
                $($cc.buttons.itemMenuCreateComposite).unbind();
                $($cc.buttons.itemMenuCreateComposite).click(function () {
                    var selecteditems = $cc.variables.ganttchart.getItems().where(function (x) {
                        return (x.runtimeVariables && x.runtimeVariables.selected);
                    });

                    $cc.runtime.createCompositeBank(selecteditems.select(function (x) {
                        return x._bank;
                    }), selecteditems, this.item.getRow())
                }.bind(this));
                $($cc.buttons.itemMenuRemove).unbind();
                $($cc.buttons.itemMenuRemove).click(function () {
                    this.item.remove();
                    this.session.remove(this.entry);
                }.bind({
                    item: item,
                    session: session,
                    entry: entry
                }));
                $($cc.buttons.itemMenuSelect).unbind();
                var selectItem = function (item, select) {
                    item.runtimeVariables = item.runtimeVariables || { selected: select };
                    item.runtimeVariables.selected = select;
                    if (select) {
                        item.getBox().addClass($cc.css.seletedItemCss);
                    }
                    else {
                        item.getBox().removeClass($cc.css.seletedItemCss);
                    }
                };
                $($cc.buttons.itemMenuSelect).click(function () {
                    this.item.runtimeVariables = this.item.runtimeVariables || { selected: false };
                    this.item.runtimeVariables.selected = !this.item.runtimeVariables.selected;
                    selectItem(this.item, this.item.runtimeVariables.selected)
                }.bind(this));
                $($cc.buttons.itemMenuSelectAll).unbind();
                $($cc.buttons.itemMenuSelectAll).click(function () {
                    var selecteditems = this.item.getRow().getItems().where(function (x) {
                        return (x.runtimeVariables && x.runtimeVariables.selected);
                    });
                    this.item.getRow().getItems().forEach(function (x) {
                        selectItem(x, selecteditems.length == 0)
                    });
                }.bind(this));
                $("#itemPopupMenu").popup("open");
            }.bind({
                item: item,
                entry: entry
            }));
            item.addListener('mouseout', function (args) {
            }.bind({
                item: item,
                entry: entry
            }))

            session.addBankEntry(entry);
        },
        itemUpdated: function () {
            var second = 1000;
            var beat = $cc.runtime.beatsPerSecond();
            var me = this;
            var duration = beat * me.item._data.duration;
            var startbeat = me.item._data.start;
            //me.entry.setDuration(me.item._data.duration);
            me.entry.beat = startbeat;
            //me.entry.stop = startbeat + duration;
        },
        beatsPerSecond: function () {
            return $cc.runtime.minute() / $cc.runtime.getRecordingTempo();
        },
        getFirstAvailableKey: function () {
            $cc.variables.bankentry = $cc.variables.bankentry || [];
            var letters = $cc.letters.split('');
            for (var i = 0 ; i < letters.length ; i++) {
                if (!$cc.variables.bankentry.contains(function (x) {
                     return x.lockedKey && x.lockedKey.toLowerCase() == letters[i].toLowerCase()
                })) {
                    return letters[i];
                }
            }
            return null;
        },
        beats: function (time) {
            var beat = $cc.runtime.getRecordingTempo();

            return time / $cc.runtime.minute() * beat;
        },
        getKeyOffset: function (entry) {
            return 60 / $cc.runtime.getRecordingTempo() / entry.v.length * 1000;
            // return $cc.runtime.getRecordingTempo() / $cc.runtime.minute();
        },
        bankStopped: function (args) {
            if ($cc.variables.currentRecordingSession && $cc.intervals.recordingInterval != null && $cc.variables.currentRecordingSession.bankEntries) {
                var entry = $cc.variables.currentRecordingSession.bankEntries.last(function (x) {
                    return x.bankentry == args.bank
                });
                if (entry) {
                    var stop = new Date().getTime() - $cc.variables.currentRecordingSession.start;
                    entry.bankentry.setDuration($cc.runtime.beats(stop - entry.date));
                    entry.dataitem.setDuration($cc.runtime.beats(stop - entry.date));
                    entry.dataitem.update();
                }
            }
        },
        playBackCurrentSession: function () {
            if ($cc.variables.currentRecordingSession && !$cc.runtime.isRecording()) {
                $cc.runtime.playBackSession($cc.variables.currentRecordingSession);
            }
        },
        isRecording: function () {
            return !($cc.intervals.recordingInterval == null);
        },
        playBackSession: function (session, i) {
            var score = [];

            var entries = $cc.runtime.getEntries(0, session.bankEntries);
            var last = 0;
            entries = entries.orderBy(function (x, y) {
                return x.beat - y.beat;
            });
            entries.forEach(function (x, index) {
                var now = $cc.runtime.beatToTime(x.beat);
                x.delay = now - last;
                last = now;//+ $cc.runtime.beatToTime(x.bankentry.getDuration());
                score.push(x);
            });
            $cc.runtime.playChords({ bankEntries: score }, { channel: i, volume: session.volume, instrument: session.instrument });
        },
        beatToTime: function (beat) {
            return $cc.runtime.beatsPerSecond() * beat;
        },
        getEntries: function (delay, entries) {
            delay = delay || 0;
            var allEntries = [];
            entries.forEach(function (x, index) {
                if (x.bankentry instanceof ComposerCompanion.CompositeEntry) {
                    allEntries = allEntries.concat(x.bankentry.getBankEntries(x.beat));
                }
                else {
                    allEntries.push(x);
                }
            });
            return allEntries;
        },
        getNotesFromScore: function (score, options) {
            var notes = [];
            var totalduration = 0;
            var lastnote = { lastoffset: 0 };
            score.bankEntries.forEach(function (x, index) {
                if (x.bankentry instanceof ComposerCompanion.CompositeEntry) {
                    var last = 0;
                    notes = notes.concat(x.bankentry.getNotes(notes, x.delay));
                    totalduration += x.delay;
                }
                else {
                    var config = {//+ lastnote.lastoffset
                        keystyle: x.bankentry.keyStyle,
                        keyoffset: $cc.runtime.getKeyOffset(x.bankentry),
                        selectedBeat: x.bankentry.selectedBeats,
                        duration: x.bankentry.getDuration(),
                        selectedDivisions: x.bankentry.selectedDivisions,
                        tempo: $cc.runtime.getRecordingTempo(),
                        selectedNotes: x.bankentry.selectedNotes,
                        masterOffset: totalduration,
                        stop: true
                    };
                    if (x.bankentry.composite) {
                        config.appendedValues = {
                            boxDuration: 1,
                            beatOffset: x.beat
                        }
                    }
                    else {
                        config.appendedValues = {
                            boxDuration: 1,
                            beatOffset: x.beat
                        }
                    }
                    notes = notes.concat($cc.runtime.getNotes(x.bankentry.melodylist, x.delay, config, lastnote));

                    totalduration += x.delay;
                }
            });
            notes = notes.orderBy(function (x, y) {
                if (x[0].event.appendedValues.beatOffset == y[0].event.appendedValues.beatOffset) {
                    if (y[0].event.subtype == "noteOff") {
                        return -1;
                    }
                    if (x[0].event.subtype == "noteOff") {
                        return 1;
                    }
                }
                return x[0].event.appendedValues.beatOffset - y[0].event.appendedValues.beatOffset;
            });
            notes.forEach(function (x, index) {

                if (index > 0) {
                    notes[index][1] = notes[index][0].event.appendedValues.beatOffset
                                    - notes[index - 1][0].event.appendedValues.beatOffset;
                }
                else {
                    notes[index][1] = notes[index][1] || 1;
                }
            });
            return notes;
        },
        printTrack: function (score, options) {
            var notes = $cc.runtime.getNotesFromScore(score, options);

            var noteEvents = [];
            notes.forEach(function (note, index) {
                var last = index > 0 ? notes[index - 1] : [0, 0];
                Array.prototype.push.apply(noteEvents, $cc.variables.master.MidiEvent.createNoteFromCC(note, note[1]));
            });
            //["C4", "E4", "G4"].forEach(function (note) {
            //    Array.prototype.push.apply(noteEvents, $cc.variables.master.MidiEvent.createNote(note));
            //});

            // Create a track that contains the events to play the notes above
            var track = new $cc.variables.master.MidiTrack({
                events: noteEvents
            });
            // Creates an object that contains the final MIDI track in base64 and some
            // useful methods.
            var song = $cc.variables.master.MidiWriter({ tracks: [track] });

            var arraybuffer = Base64Binary.decodeArrayBuffer(song.b64);
            var blobbuilder = new Blob([arraybuffer]);
            //            var blobbuilder = new Blob();
            // Alert the base64 representation of the MIDI file
            saveAs(blobbuilder, "song_asdf.mid");
            //song.play();
        },
        playChords: function (score, options) {
            var notes = $cc.runtime.getNotesFromScore(score, options);
            var player = MIDI.TrackManager.getPlayer(options.channel, options);
            player.playRandomNotes(notes);
        },
        setRecordingSession: function (session) {
            $cc.variables.currentRecordingSession = session;
        },
        getRecordingTimeSignature: function () {
            var top = $($cc.buttons.timesignatureTop).val();
            var bottom = $($cc.buttons.timesignatureBottomSelect).val();
            return { top: top, bottom: bottom };
        },
        step: function () {
            if ($cc.variables.currentRecordingSession) {
                if ($cc.variables.currentRecordingSession.beat == undefined) {
                    $cc.variables.currentRecordingSession.beat = $cc.variables.currentRecordingSession.beatOffset;
                }
                $cc.variables.currentRecordingSession.beat++;
            }
            $cc.runtime.raise("stepped", { beat: $cc.variables.currentRecordingSession.beat });
        },
        getRecordingTempo: function () {
            return parseFloat($($cc.inputs.recordingtempo).val()) || 120;
        },
        startRecording: function () {
            if ($cc.intervals.recordingInterval == null) {
                var tempo = $cc.runtime.getRecordingTempo();
                var result = $cc.runtime.addTrack();
                $cc.runtime.setRecordingSession(result);
                $cc.intervals.recordingInterval = setInterval(function () {
                    $cc.runtime.step();
                }, $cc.runtime.minute() / tempo);
            }
        },
        addTrack: function (_session) {
            var timesignature = $cc.runtime.getRecordingTimeSignature();
            var tempo = $cc.runtime.getRecordingTempo();
            var id = Mephistowa.GUID();
            var datarow = new Mephistowa.Gantt.DataRow({
                view: 'Data row',
                viewClass: id
            });
            $cc.runtime.addTrackToGant(datarow);
            var result = {
                timesignature: timesignature,
                id: id,
                tempo: tempo,
                datarow: datarow
            };
            session = new ComposerCompanion.RecordingSessionTrack({
                tempo: result.tempo,
                id: result.id,
                start: new Date().getTime(),
                datarow: result.datarow,
                beatOffset: -result.timesignature.top,
                timesignature: result.timesignature,
                onupdate: $cc.runtime.renderRecordingSessionControls
            })
            result.datarow.sessionId = session.id;
            $cc.runtime.addSession(session);
            if (_session) {
                _session.bankEntries.forEach(function (x, index) {
                    var bank = $cc.runtime.getBankEntry(x.bankentry.internalId);

                    $cc.runtime.addEntryToTrack(bank, result.datarow, { startTime: x.beat })
                });
            }
            return session;
        },
        getBankEntry: function (id) {
            return $cc.variables.bankentry.first(function (x) { return x.internalId == id; })
        },
        getBankEntries: function () {
            return $cc.variables.bankentry;
        },
        generateBankName: function () {
            return "Bank " + Mephistowa.GUID().substring(0, 1);
        },
        stopRecording: function () {
            if ($cc.intervals.recordingInterval) {
                clearInterval($cc.intervals.recordingInterval);
                $cc.intervals.recordingInterval = null;
            }
            if ($cc.variables.currentRecordingSession) {
                $cc.variables.recordingSessions.push($cc.variables.currentRecordingSession);
                $cc.runtime.renderRecordingSessionControls($cc.variables.currentRecordingSession);
            }
        },
        renderRecordingSessionControls: function (session) {
            ComposerCompanion.RecordingSessionTrack.renderRecordingSessionControls(session);
        },
        apply: function (obj, target) {
            for (var i in obj) {
                target[i] = obj[i];
            }
            return target;
        },
        createKeySelect: function () {
            var letters = $cc.letters.split("");
            letters = letters.select(function (x) { return { text: x, value: x }; })
            return $cc.runtime.createSelect(letters);
        },
        createPlayStyleSelect: function () {
            var style = [{
                text: "Arpeggio up",
                value: $cc.keystyles.arpeggio_up
            }, {
                text: "Arpeggio down",
                value: $cc.keystyles.arpeggio_down
            }, {
                text: "Custom",
                value: $cc.keystyles.userdefined
            }, {
                text: "Chord",
                value: $cc.keystyles.chord
            }];
            return $cc.runtime.createSelect(style);
        },
        createSelect: function (options, otheroptions) {
            var select = $("<select>", otheroptions || {});
            for (var i = 0 ; i < options.length ; i++) {
                select.append($("<option>", {
                    text: options[i].text,
                    value: options[i].value
                }));
            }
            return select;
        },
        createText: function (_label) {
            var group = $cc.runtime.createControlGroup();
            var guid = Mephistowa.GUID();
            var label = $("<label>", { for: guid, text: _label });
            var text = $("<input>", { type: 'text' });
            group.append(label);
            group.append(text);
            return { group: group, text: text };
        },
        updateSelect: function (select, options) {
            select.html("");
            for (var i = 0 ; i < options.length ; i++) {
                select.append($("<option>", {
                    text: options[i].text,
                    value: options[i].value
                }));
            }
            return select;
        },
        createButton: function (text, callback, options) {
            callback = callback || function () { };
            options = options || {};
            var config = {
                "data-role": "button",
                "data-icon": "delete",
                "data-inline": "true",
                "data-mini": true,
                href: "#",
                text: text,
                click: callback
            };
            for (var i in options) {
                config[i] = options[i]
            }
            return $("<a>", config);
        },
        createControlGroup: function () {
            //<div data-role="controlgroup" data-type="horizontal">
            return $("<div>", {
                'data-role': 'controlgroup',
                "data-mini": true,
                'data-type': 'horizontal'
            });
        },
        createCanvas: function (options) {
            options = $cc.runtime.apply(options, { id: Mephistowa.GUID(), height: 200, width: 200 });
            return $("<canvas>", {
                height: options.height,
                width: options.width,
                id: options.id
            });
        },
        createList: function (inset) {
            return $("<ul>", {
                'data-role': 'listview',
                'data-inset': inset || "true",
                'data-mini': true,
                'data-theme': "c"
            });
        },
        createTable: function (_rows, columns) {
            var table = $("<table>");
            var rows = [];
            var logicalrows = [];
            var cells = [];
            for (var i = 0 ; i < _rows; i++) {
                var row = $("<tr>");
                table.append(row);
                var logicalrow = [];
                for (var j = 0 ; j < columns; j++) {
                    var cell = $("<td>");
                    row.append(cell);
                    cells.push(cell);
                    logicalrow.push(cell);
                }
                rows.push(row);
                logicalrows.push(logicalrow);
            }
            return { logicalrows: logicalrows, rows: rows, cells: cells, table: table };
        },
        keyText: function (obj, letter) {
            if (obj.smartinfo.isInversion) {
                //var scale = getScale(scaleId);
                //var offset = obj.smartinfo.voice[obj.smartinfo.voice.length - obj.smartinfo.inversion]
                //var letter = findLetter(convertToMelody(base_int, offset));
                return letter + "  " + obj.smartinfo.name.split("or")[0] + " " + " ".nth(obj.smartinfo.inversion) + " Inv"
            }
            return letter + " " + obj.smartinfo.name.split("or")[0];//obj._info[("col1")].data[0];
        },
        optionButtons: function (entry) {
            var voice = $cc.runtime.convertToVoice(entry.v);
            var chordoptionspace = $($cc.spaces.chordoptionspace);
            chordoptionspace.html("");
            var match = $cc.variables.chordmaster.findExactMatch(entry.v);
            // if (match) 
            {
                //
                var prev = entry.base_int;
                var list = $cc.runtime.createList();
                for (var i = 0 ; i < 12; i++) {
                    var nextbase = $cc.runtime.moveUp(prev, 7);
                    var letteroptions = whereObj($cc.variables.library, function (x) { return x == prev });
                    var letters = letteroptions.sum(function (x) { return "/" + x; }).substring(1, 100);
                    // { key: selectedmelody, accidental: selectedaccidental.trim(), octave: selectedoctave}
                    var link = $("<a>", {
                        href: '#',
                        text: ("Circle") + " " + letters,
                        click: function () {
                            var clonelist = $cc.runtime.clone(this.melodylist);
                            var letternotes = this.v.select(function (x) {
                                return parseInt(x, 12);
                            }).toLetterNotes(this.letter, null);
                            clonelist.forEach(function (x, index) {
                                var result = !letternotes[index] ? [] : letternotes[index].split("").intersection($cc.variables.accidentals, function (x, y) {
                                    return x == y;
                                });
                                if (result.length > 0) {
                                    x.accidental = result[0];
                                }
                                x.key = letternotes[index][0];
                            });
                            var newentry = {
                                melodylist: clonelist,
                                v: this.v,
                                rootbase: $cc.runtime.getrootbase($cc.variables.library, this.melodylist),
                                base_int: this.prev,
                                accidentals: $cc.runtime.getaccidentalsvalue($cc.variables.library, this.melodylist)
                            };
                            $cc.runtime.addToBank(newentry);
                        }.bind({
                            base: nextbase,
                            prev: prev,
                            melodylist: entry.melodylist,
                            letter: letteroptions[0],
                            v: entry.v
                        })
                    });
                    prev = $cc.variables.library[nextbase];
                    var li = $("<li>");
                    li.append(link);
                    list.append(li);
                }
                chordoptionspace.append(list);
                list.listview();
            }
        },
        moveUp: function (v, amount) {
            var _r = (v + amount) % 12;
            if (_r < 0) {
                _r = 12;
            }
            for (var i in $cc.variables.library) {
                if ($cc.variables.library[i] == _r) {
                    return i;
                }
            }
            return null;
        },
        calculateV: function (library) {
            var base_int = library[($cc.runtime.getrootbase() + $cc.runtime.getaccidentalsvalue()).trim()];
            var sorted = melodylist.sort(function (a, b) {
                var val_a = library[a.key + a.accidental] + a.octave * 12;
                var val_b = library[b.key + b.accidental] + b.octave * 12;
                return val_a - val_b;
            });
            var result = ["00"];
            var base_int = library[(sorted[0].key + sorted[0].accidental).trim()];
            for (var i = 1; i < sorted.length; i++) {
                result.push(converttoBase12(getKeyValue(sorted[i]) - getKeyValue(sorted[0])));
            }

            return (result);
        },
        openRhythmPanel: function () {
            $($cc.panel.rhythmsForEntries).panel("open");
            $cc.variables.rhythmManager.setEntry(this)
        },
        getrootbase: function (library, melodylist) {
            var lowest = 1000;
            var base = null;
            for (var i = 0 ; i < melodylist.length; i++) {
                var temp = library[melodylist[i].key + melodylist[i].accidental] + melodylist[i].octave * 12;
                if (temp < lowest) {
                    base = melodylist[i].key;
                    lowest = temp;
                }
            }
            return base;
            // return output;
        },
        getaccidentalsvalue: function (library, melodylist) {
            var lowest = 1000;
            var base = null;
            for (var i = 0 ; i < melodylist.length; i++) {
                var temp = library[melodylist[i].key + melodylist[i].accidental] + melodylist[i].octave * 12;
                if (temp < lowest) {
                    base = melodylist[i].accidental;
                    lowest = temp;
                }
            }
            return base;
        },
        isInt: function (n) {
            return typeof n === 'number' && parseFloat(n) == parseInt(n, 10) && !isNaN(n);
        },
        convertToVoice: function (v) {
            var me = this;
            return v.select(function (x) {
                if (!me.isInt(x))
                    return parseInt(x.toLowerCase(), 12)
                return x;
            });
        },
        getMidiNote: function () {
            $cc.variables.library[list[i].key + list[i].accidental] + ((parseInt(list[i].octave) + 1) * 12)
        },
        showOptions: function () {
            $($cc.spaces.chordgenpanel).panel("open");

        },
        createNoteGrid: function (args) {
            var id = Mephistowa.GUID();
            var div = $("<div>", { id: id });
            var target = $cc.runtime.apply(args, {
                renderspace: '#' + id,
                cellCss: 'cell',
                rowCss: 'row',
                cellSelectedCss: 'selectedcell',
                cellOverCss: 'cellOver',
                cellX: 5,
                cellY: 4,
                cellWidth: 20,
                render: true
            })
            return {
                notegrid: new Mephistowa.NoteGrid(target),
                div: div
            }
        },
        ///Redraw the banks of sounds
        //
        ///
        //
        //
        refreshBank: function (args) {
            args = args || {};
            if (!args.entry) {
                $($cc.spaces.bankspace).html("");
            }
            $cc.variables.bankentry.forEach(function (x, index) {
                if (x instanceof ComposerCompanion.CompositeEntry) {
                    ComposerCompanion.CompositeEntry.createEntryDom(args, x, index);
                }
                else {
                    ComposerCompanion.BankEntry.createEntryDom(args, x, index);
                }
            });
        },
        displayRhythmOptions: function (args) {
            var entry = this.entry;
            var sessions = $cc.state.rhythmSessions.where(function (x) { return true; });
            var space = $($cc.spaces.rhythmoptionspanelspace);
            space.html("");
            var ul = $cc.runtime.createList();
            space.append(ul);
            for (var i = 0 ; i < sessions.length ; i++) {
                var li = $("<li>");
                var notegrid = $cc.runtime.createNoteGrid({
                    cellX: 16,
                    cellCss: 'smallcell',
                    cellWidth: 10,
                    nocopy: true,
                    rowCss: 'smallrow',
                    cellY: entry.melodylist.length
                })
                var ahref = $("<a>", {
                    href: '#', click: function () {
                        this.entry.notegrid.selectNotes(this.session.rhythm);
                    }.bind({ session: sessions[i], entry: entry })
                });
                ahref.append(notegrid.div)
                li.append(ahref);
                ul.append(li);
                notegrid.notegrid.render();
                notegrid.notegrid.selectNotes(sessions[i].rhythm);
                notegrid.notegrid.setNoteEditable(true);
            }
            ul.listview();
            $($cc.panel.rhythemoptionspanel).panel("open", {});
        },
        addToRhythmBank: function (rhythm, options) {
            $cc.runtime.raise("rhythmsessions", { rhythm: rhythm, options: options });
        },
        invertEntry: function () {
            var entry = this;
            var baseint = entry.rootbase;
            if (entry.melodylist.length > 1) {
                var newbase = entry.melodylist[1];
                var midinote = $cc.runtime.convertToMidiNote(newbase);
                var invertedNormalized = entry.v.chordInversion(1).parseInt(12).chordNormalize(12);
                entry.v = invertedNormalized.select(function (x) { return x.toString(12) });
                entry.melodylist = invertedNormalized.select(function (x) { return x + midinote; }).select(function (x) { return $cc.runtime.convertToMelodyNote(x); });
                entry.rootbase = newbase.key;
                entry.accidentals = newbase.accidental;
                // $cc.runtime.stepUp.bind(entry, 0)();
                $cc.runtime.raise("bankchange", { entry: entry });
            }
        },
        convertToMidiNote: function (note) {
            return $cc.variables.library[note.key + note.accidental] + ((parseInt(note.octave) + 1) * 12);
        },
        stepUp: function (direction) {
            var entry = this;
            var prev = entry.base_int;
            var nextbase = $cc.runtime.moveUp(prev, direction);
            prev = $cc.variables.library[nextbase];

            //var letteroptions = whereObj($cc.variables.library, function (x) { return x == prev });
            //var letters = letteroptions.sum(function (x) { return "/" + x; }).substring(1, 100);
            // var clonelist = (entry.melodylist);
            var midinotes = entry.melodylist.select(function (note) { return $cc.runtime.convertToMidiNote(note); })
                                .select(function (notes) {
                                    return $cc.runtime.convertToMelodyNote(notes + direction);
                                });
            entry.melodylist = midinotes;
            //var letternotes = entry.v.select(function (x) {
            //    return parseInt(x, 12);
            //}).toLetterNotes(nextbase, null);
            //clonelist.forEach(function (x, index) {
            //    var result = letternotes[index].split("").intersection($cc.variables.accidentals, function (x, y) {
            //        return x == y;
            //    });
            //    if (result.length > 0) {
            //        x.accidental = result[0];
            //    }
            //    x.key = letternotes[index][0];
            //});
            entry.base_int = prev;
            entry.rootbase = entry.melodylist[0].key;
            entry.accidentals = entry.melodylist[0].accidental;
            $cc.runtime.raise("bankchange", { entry: entry });
        },
        executeBank: function (key) {
            var bankentry = $cc.runtime.getBankByKey(key)
            if (bankentry) {
                $cc.variables.downKeys = $cc.variables.downKeys || [];
                if ($cc.variables.downKeys.contains(function (k) { return k == key })) {
                    return;
                }
                $cc.variables.downKeys.push(key);
                $cc.runtime.raise("bankplayed", { bank: bankentry });
                if (bankentry instanceof ComposerCompanion.CompositeEntry) {
                    $cc.runtime.playChords({ bankEntries: [{ bankentry: bankentry }] }, {});
                }
                else {
                    $cc.runtime.play(bankentry, 1);
                }
            }
        },
        getBankByKey: function (key) {
            var bankentry = $cc.variables.bankentry.first(function (x) {
                return x.lockedKey && x.lockedKey.toLowerCase() == key.toLowerCase();
            });
            return bankentry;
        },
        stopBank: function (key) {
            $cc.variables.downKeys = $cc.variables.downKeys || [];
            if ($cc.variables.downKeys.contains(function (k) { return k == key })) {
                $cc.variables.downKeys.removeWhere(function (k) { return k == key })
            }
            var bankentry = $cc.variables.bankentry.first(function (x) {
                return x.lockedKey == key;
            });
            if (bankentry) {
                if (bankentry instanceof ComposerCompanion.CompositeEntry) {
                    $cc.runtime.stopChords([{ bankentry: bankentry }], {});
                }
                else {
                    $cc.runtime.stop(bankentry, 1);
                }
            }
            $cc.runtime.raise("bankstopped", { bank: bankentry });
        },
        play: function (bankEntry, delay, stop) {
            stop = stop || false;
            delay = delay || 100
            var notes = $cc.runtime.getNotes(bankEntry.melodylist, delay, {
                keystyle: bankEntry.keyStyle,
                keyoffset: $cc.runtime.getKeyOffset(bankEntry),
                selectedBeat: bankEntry.selectedBeats,
                selectedDivisions: bankEntry.selectedDivisions,
                tempo: $cc.runtime.getRecordingTempo(),
                selectedNotes: bankEntry.selectedNotes,
                stop: false
            });
            notes.forEach(function (x, index) {
                if (stop) {
                    x[0].event.subtype = "noteOff";
                }
                return x;
            });
            var player = MIDI.TrackManager.getPlayer(0);
            player.playRandomNotes(notes, 0);
        },
        stopChords: function (bankEntriesObj) {
        },
        stop: function (bankentry) {
            // $cc.runtime.play(bankentry, 100, true);
        },
        draw: function (bankEntry) {
            var sorted = bankEntry.melodylist.sort(function (a, b) {
                var val_a = $cc.variables.library[a.key + a.accidental] + a.octave * 12;
                var val_b = $cc.variables.library[b.key + b.accidental] + b.octave * 12;
                return val_a - val_b;
            });
            var code = $cc.runtime.generateCode(sorted)
            //melodylist: melodylistclone,
            //v: v
            bankEntry.drawer.draw(code, bankEntry.width, bankEntry.height);
        },
        setupGantt: function () {

            var ganttchart = new Mephistowa.GanttChart({ handles: true });
            ganttchart.properties({
                minzoom: 1,
                maxzoom: 300,
                zoom: 10,
                minimumItemWidth: 0,
                timestart: 0,
                autoscroll: true,
                rightPadding: 0
            });
            ganttchart.setRenderSpace(($cc.spaces.tracks));
            ganttchart.addlistener('rowclicked', $cc.runtime.rowClicked);
            $cc.variables.ganttchart = ganttchart;
            var timerow = new Mephistowa.Gantt.DataRow({ view: 'Time', viewClass: 'timerowClass', canAddOnClick: false });
            for (var i = 0 ; i < 32; i++) {
                timerow.addItem(new Mephistowa.Gantt.DataItem({ start: i, duration: .1, itemCls: 'timedata' }));
            }
            ganttchart.addDataRow(timerow);
            ganttchart.addlistener('ganttchartrefresh', $cc.runtime.renderTopLevelRecordingSessionControls);
            ganttchart.addlistener('ganttchartrefresh', function () {
                $cc.variables.recordingSessions.forEach(function (x) { x.update(); });
            });
            ganttchart.renderData();
        },
        renderTopLevelRecordingSessionControls: function () {
            var space = $(".timerowClass");
            var controlgroup = $cc.runtime.createControlGroup();
            var button = $cc.runtime.createButton("play all", function () {
                var supersession = [];
                $cc.variables.recordingSessions.forEach(function (x, index) {

                    supersession = supersession.concat(x.bankEntries);

                });
                $cc.runtime.playBackSession({ bankEntries: supersession }, 0);

            }, {
                'data-mini': "true"
            });
            controlgroup.append(button)
            space.append(controlgroup);
            button.button();
        },
        addTrackToGant: function (track) {
            $cc.variables.ganttchart.addDataRow(track, { render: true });
            $($cc.spaces.toplist).trigger("refresh");

        },
        removeTrackFromGantt: function (track) {
            $cc.variables.ganttchart.removeDataRow(track, { render: true });
            $($cc.spaces.toplist).trigger("refresh");
        },
        hasCurrentDocument: function () {
            return $cc.state.currentDocument && true;
        },
        loadCurrentDocument: function () {

            var document = new ComposerCompanion.MusicDocument();
            document.load($cc.state.currentDocument);
            $cc.state.currentDocument = document;
            document.getBankEntries().forEach(function (x, index) {
                $cc.runtime.addToBank(x);
            });
            setTimeout(function () {
                $cc.runtime.raise("bankchange", null);
            }, 1000);
            document.getTracks().forEach(function (x, index) {
                $cc.runtime.addTrack(x);
            });
        },
        createNewDocument: function () { 
            $cc.state.currentDocument = new ComposerCompanion.MusicDocument();
        },
        saveDocument: function () {
            $cc.state.currentDocument.setData($cc.variables.recordingSessions, $cc.variables.bankentry);
            $cc.runtime.storeState();
        },
        getCurrentDocument: function () {
            return $cc.state.currentDocument;
        },
        newDocument: function () {
            $cc.variables.bankentry = [];
        },
        load: function () {
            $cc.runtime.loadState();
            $cc.variables.master = midiMaster(window);
            var pianoDrawer = new Mephistowa.PianoDrawer({
                space: document.getElementById('midiSpace')
            });
            pianoDrawer.init();
            $cc.variables.midiManager = new Mephistowa.MIDI({
                listspace: $cc.spaces.midilistspace,
                panel: '#midipanel',
                midiInstrumentsSpace: '#midiInstrumentsForAssignment',
                playmidifilesection: '#playmidifilesection',
                playmidifile: '#playmidifile',
                selectbtn: '#getselectedmidinotes',
                pianoDrawer: pianoDrawer
            });
            $($cc.popup.compositeBankOptions).popup();
            $($cc.buttons.createComposite).click($cc.runtime.createCompositeBank.bind(this, [], []));
            $cc.variables.rhythmManager = new Mephistowa.Rhythm({
                space: $cc.spaces.rhythmspace,
                rhythmSearch: $cc.inputs.rhythmSearch,
                rhythmApplyPanel: $cc.panel.rhythmApplyPanel,
                rhythmApplySpace: $cc.spaces.rhythmApplySpace
            });
            $cc.variables.rhythmManager.addListener('updaterhythms', function () {
                $cc.state.rhythms = $cc.variables.rhythmManager.getRhythms();
                $cc.runtime.storeState();
            });
            $cc.variables.rhythmManager.init();

            if ($cc.state.rhythms) {
                $cc.variables.rhythmManager.setRhythms($cc.state.rhythms);
            }
            $($cc.buttons.closeAllBanks).click($cc.runtime.closeAllBanks);

            $cc.variables.listeners = $cc.variables.listeners || [];
            $cc.variables.bankentry = $cc.variables.bankentry || [];
            $(document).bind('keydown', function (e) {
                $cc.runtime.executeBank(String.fromCharCode(e.keyCode));
            });
            try {
                $($cc.spaces.chordgenpanel).panel();
            }
            catch (e) { }
            document.getElementById('midiFiles').addEventListener('change', $cc.variables.midiManager.handleSelect.bind($cc.variables.midiManager), false)

            $($cc.panel.rhythmsForEntries).panel();
            $(document).bind('keyup', function (e) {
                $cc.runtime.stopBank(String.fromCharCode(e.keyCode));
            });
            window.addListener("newintruments", function (args) {
                //instrumentsCC
                $($cc.buttons.instrumentsCC).html("");
                var instruments = [{ text: window.naturalDefaultInstrument, value: window.naturalDefaultInstrument }];
                for (var i = 0; i < args.instruments.length ; i++) {
                    instruments.push({
                        text: args.instruments[i],
                        value: args.instruments[i]
                    });
                }
                if ($($cc.buttons.instrumentsCC))
                    $cc.runtime.updateSelect($($cc.buttons.instrumentsCC), instruments);

                $($cc.buttons.instrumentsCC).unbind();
                $($cc.buttons.instrumentsCC).change(function () {
                    defaultInstrument = $($cc.buttons.instrumentsCC).val();
                });
            });
            $cc.runtime.setupGantt();
            $($cc.buttons.startrecord).click($cc.runtime.startRecording);
            $($cc.buttons.stoprecord).click($cc.runtime.stopRecording);
            $cc.runtime.addListener("bankplayed", $cc.runtime.recordingSessionEntryAdded);
            $($cc.buttons.savebtn).click($cc.runtime.saveDocument);
            $($cc.buttons.newbtn).click($cc.runtime.newDocument);
            $($cc.inputs.masterVolume).change(function () {
                var volume = parseFloat(($($cc.inputs.masterVolume).val()));
                MIDI.setVolume(volume);
            });
            $($cc.buttons.quickInputAddBtn).click(function () {
                $cc.runtime.addQuickEntry($($cc.inputs.quickInputArea).val());
            });
            $($cc.inputs.availableThreads).change(function () {
                $cc.variables.threads = $($cc.inputs.availableThreads).val() * 1;
            });
            $($cc.buttons.addTrack).click(function () {
                $cc.runtime.addTrack();
            });
            $cc.runtime.addListener("stepped", $cc.runtime.setStepCounter);
            $cc.runtime.addListener('bankstopped', $cc.runtime.bankStopped);
            $cc.runtime.addListener('rhythmsessions', $cc.runtime.updateRhythmSessions);
            $($cc.buttons.playbackcurrentsessionbtn).click($cc.runtime.playBackCurrentSession);
            document.getElementById($cc.inputs.soundfontfiles).addEventListener('change', $cc.runtime.handleFileSelect, false);

            if (!$cc.runtime.hasCurrentDocument()) {
                $cc.runtime.createNewDocument();
            }
            else {
                $cc.runtime.loadCurrentDocument();
            }
        },
        updateRhythmSessions: function (args) {
            $($cc.panel.rhythmpanel).panel("open", {});
            var rhythm = args.rhythm
            $($cc.buttons.addrhythmbtn).unbind();
            $($cc.spaces.rhythmaddspace).html("");
            args.options.nocopy = true;
            var added = false;
            var prenotegrid = $cc.runtime.createNoteGrid(args.options);
            $($cc.spaces.rhythmaddspace).append(prenotegrid.div);
            prenotegrid.notegrid.setNoteEditable(true);
            prenotegrid.notegrid.render();
            $($cc.buttons.addrhythmbtn).click(function () {
                var name = $($cc.inputs.rhythemname).val();
                if (added)
                    return;
                added = true;
                var rhyth = { name: name, rhythm: rhythm };
                prenotegrid.notegrid.setName(name);
                $cc.state.rhythmSessions.push(rhyth);
                var li = $("<li>");
                var ahref = $("<a>", { href: '#' });
                li.append(ahref);
                var notegrid = prenotegrid;
                ahref.append(notegrid.div);
                var deleteahref = $("<a>", {
                    href: '#',
                    text: 'delete',
                    'data-icon': 'delete',
                    click: function () {

                    }.bind({ rhythm: args.rhythm })
                });
                li.append(deleteahref);
                $($cc.lists.rhythmlist).append(li);
                $($cc.lists.rhythmlist).listview('refresh');
            });
            prenotegrid.notegrid.selectNotes(rhythm);
        },
        raise: function (type, args) {
            $cc.variables.listeners = $cc.variables.listeners || [];
            $cc.variables.listeners.where(function (x) { return type == x.type; }).forEach(function (x, index) {
                x.func(args || null);
            });
            $cc.runtime.storeState();
        },
        addListener: function (type, funct) {
            $cc.variables.listeners.push({ type: type, func: funct });
        },
        removeBankEntry: function (bankentry) {
            $cc.variables.bankentry.removeWhere(function (x) { return bankentry.internalId == x.internalId; });
            bankentry.span.remove();
            //$cc.runtime.raise("bankchange", { entry: bankentry });
        },
        addToBank: function (bankentry) {
            var entryobject = $cc.runtime.createBank(bankentry);
            $cc.variables.bankentry.push(entryobject);
            $cc.runtime.raise("bankchange", entryobject);
        },
        createBank: function (bankentry) {
            $cc.variables.bankentry = $cc.variables.bankentry || [];
            bankentry.internalId = bankentry.internalId || Mephistowa.GUID();
            bankentry.selectedBeats = bankentry.selectedBeats || 1;
            bankentry.selectedBeat = bankentry.selectedBeat || 1;
            bankentry.selectedDivisions = bankentry.selectedDivisions || 16;
            bankentry.selectedNotes = bankentry.selectedNotes || [];
            bankentry.keyStyle = bankentry.keyStyle || $cc.keystyles.chord;
            var entryobject = $cc.runtime.applyFunctions(bankentry);

            return entryobject;

        },
        addSoundFont: function (soundfont, name, info) {
            $cc.variables.soundFonts = $cc.variables.soundFonts || [];
            $cc.variables.instruments = $cc.variables.instruments || [];
            if (!$cc.variables.instruments.contains(function (x) { return x == name; })) {
                $cc.variables.instruments.push(name);
                window.raise('newintruments', { instruments: $cc.variables.instruments });
            }
            if (!$cc.variables.soundFonts.contains(function (x) { return x.name == name; })) {
                var data = { name: name, soundfont: soundfont };
                $cc.variables.soundFonts.push(data);
                $cc.runtime.appendToSoundFontList(data);

                if (data.slider) {
                    data.slider.change(function (d, _slider) {
                        if (_slider.val() == "on") {
                            //   defaultInstrument = d.name.split(".")[0];
                        }
                        else {
                            //   defaultInstrument = naturalDefaultInstrument;
                        }
                        if (!d.loading && !d.hasLoaded) {
                            d.loading = true;
                            window.addListener('requestNote', function (args) {
                                if (name != args.instrument || this.loaded.contains(function (x) { return x == args.note })) {
                                    return;
                                }
                                this.loaded.push(args.note);
                                $cc.runtime.asyncLoad(d, info, args.note, function (_d, dataURI) {
                                    window.MIDI.LoadSoundFont(_d, dataURI, function () {
                                        ;
                                        //     defaultInstrument = _d.name.split(".")[0];
                                        delete (dataURI);
                                    });
                                    delete (dataURI);
                                })
                            }.bind({
                                loaded: []
                            }));
                        }
                        else {
                        }
                    }.bind(this, data, data.slider));
                }
            }
        },
        getWorker: function () {
            return new Worker($cc.workers.composercompanionworker);
        },
        killWorker: function (worker) {
            $cc.variables.workers = $cc.variables.workers || [];
            var index = $cc.variables.workers.indexOf(worker);
            if (index !== -1) {
                $cc.variables.workers.splice(index, 1);
            }
            delete worker
        },
        getAvailableWorkers: function () {
            $cc.variables.workers = $cc.variables.workers || [];
            var result = [];
            while ($cc.variables.workers.length < $cc.variables.threads) {
                var worker = $cc.runtime.getWorker();
                result.push(worker);
                $cc.variables.workers.push(worker);
            }
            return result;
        },
        addToWorkStack: function (item) {
            $cc.variables.workstack = $cc.variables.workstack || [];
            $cc.variables.workstack.push(item);
        },
        onStackItemCompletion: function () {
            setTimeout(function () { $cc.runtime.workStackChanged(); }, 3000);
        },
        addToCompletedTasks: function (task) {
            //$cc.variables.completedTasks = $cc.variables.completedTasks || {};
            //$cc.variables.completedTasks[task.id] = $cc.variables.completedTasks[task.id] || [];
            //$cc.variables.completedTasks[task.id].push(task);
        },
        getCompletedTasks: function (id) {
            //$cc.variables.completedTasks = $cc.variables.completedTasks || {};
            //$cc.variables.completedTasks[id] = $cc.variables.completedTasks[id] || [];
            //return $cc.variables.completedTasks[id];
        },
        workStackChanged: function () {
            if ($cc.variables.workstack.length > 0) {
                var workers = $cc.runtime.getAvailableWorkers();
                if (workers.length > 0) {
                    for (var i = 0; i < workers.length && $cc.variables.workstack.length > i; i++) {
                        var item = $cc.variables.workstack.shift();
                        item.callback = function (item, worker, args) {

                            $cc.runtime.addToCompletedTasks(item);
                            item.completed = item.completed || 0;
                            item.completed++;
                            item.data.range.html((item.completed / item.total) * 100 + "%");
                            if (item.completed == item.total) {
                                delete (item.data);
                            }
                            $cc.runtime.killWorker(worker);
                            $cc.runtime.onStackItemCompletion();


                            item.finalcallback(item.data, args);
                            delete (item)
                        }.bind(this, item, workers[i]);
                        $cc.runtime.takeActionOnItem(workers[i], item)
                    }
                }
            }
        },
        takeActionOnItem: function (worker, item) {
            var currentNote = item.currentNote;
            var velocity = item.velocity;
            var data = item.data;
            var info = item.info;
            var callback = item.callback;
            var hascalledback = false;
            var temp = {
                name: data.name,
                soundfont: info.target.result
            }
            worker.onmessage = function (e) {
                var worker = this;
                switch (e.data.messageType) {
                    case 'ready':
                        //getsoundfont
                        worker.postMessage({
                            messageType: 'setdata',
                            data: temp
                        });
                        break;
                    case 'dataset':
                        worker.postMessage({
                            messageType: 'getsoundfont'
                        });
                        break;
                    case 'gotSoundFont':
                        postnextmessage(worker);
                        break;
                    case 'message':
                        //alert("Received: " + e.data.message);
                        break;
                    case 'complete':
                        worker.postMessage({
                            messageType: 'complete'
                        });
                        callback({
                            dataUri: e.data.dataUri,
                            note: e.data.note,
                            velocity: e.data.velocity
                        })
                        ;
                        delete (e.data.dataUri);
                        break;
                    default: break;
                }
            }.bind(worker);
            var postnextmessage = function (worker) {
                worker.postMessage({
                    messageType: 'getwavuri',
                    currentNote: currentNote++,
                    velocity: velocity
                });
            }
            worker.onerror = function (e) {
                alert("Received: " + [
                  'ERROR: Line ', e.lineno, ' in ', e.filename, ': ', e.message
                ].join(''));
            }
            worker.postMessage({
                messageType: 'init',
                url: "http://" + document.location.host + "/SFMaster/"
            });
        },
        asyncLoad: function (data, info, noterequested, callback) {
            var currentNote = 21;
            var startNote = 21;
            var lastnote = 109;
            var velocity = 100;
            var result = [];
            var hascalledback = false;
            var id = Mephistowa.GUID();


            //  for (var i = startNote ; i < lastnote; i++) 
            {
                $cc.runtime.addToWorkStack({
                    currentNote: noterequested,//  i,//
                    velocity: 100,
                    data: data,
                    info: info,
                    total: lastnote - startNote,
                    id: id,
                    finalcallback: callback
                });
            }
            setTimeout(function () { $cc.runtime.workStackChanged(); }, 1000);
            var func = function () {
                var sample = app.getNoteSample({ file: data.soundfont }, currentNote, velocity);
                if (sample) {
                    var wave = app.getWave(sample, currentNote);
                    result.push({
                        dataUri: wave.dataURI,
                        note: currentNote,
                        velocity: velocity
                    });
                    delete (wave.dataURI);
                }
                data.range.text((((currentNote - startNote) / (lastnote - startNote)) * 100) + "%")
                currentNote++;
                if (currentNote > lastnote) {
                    callback(data, result);
                    return;
                }
                setTimeout(func, 1000);
            }
            //    setTimeout(func, 3000);
        },
        appendToSoundFontList: function (data) {
            //    <label for="flip2">Flip switch:</label>
            //<select name="flip2" id="flip2" data-role="slider">
            //    <option value="off">Off</option>
            //    <option value="on">On</option>
            //</select>
            //        <label for="slider-2">Slider (default is "false"):</label>
            //<input type="range" name="slider-2" id="slider-2" data-highlight="true" min="0" max="100" value="50">
            var space = $($cc.spaces.soundfontspace);
            if (!$cc.variables.soundFontUl) {
                $cc.variables.soundFontUl = $cc.runtime.createList();
                space.append($cc.variables.soundFontUl);
                $cc.variables.soundFontUl.listview();
            }
            var id = Mephistowa.GUID();
            var rangeID = Mephistowa.GUID();
            var listitem = $("<li>");
            listitem.append($("<a>", {
                text: data.name,
                href: '#'
            }).append($("<label>", {
                'for': id,
                text: ''
            }))
            .append($("<select>", {
                name: id,
                id: id,
                'data-role': 'slider'
            }).append($("<option>", {
                value: 'off',
                text: 'Off'
            }))
            .append($("<option>", {
                value: 'on',
                text: 'On'
            })))
            .append($("<div>", {
                'data-role': "fieldcontain"
            })
            .append($("<label>", {
                'id': rangeID,
                text: 'loaded'
            })))
            .append($("<a>", {
                'data-split-icon': "gear",
                href: '#'
            })));
            $cc.variables.soundFontUl.append(listitem);
            $cc.variables.soundFontUl.listview("refresh");
            data.slider = $("#" + id);
            data.range = $("#" + rangeID);
            data.slider.slider();
        },
        loadState: function () {
            var strnig = Mephistowa.Storage.getObject('composercompanion');
            var state = JSON.parse(strnig);
            for (var i in state) {
                $cc.state[i] = state[i];
            }
        },
        storeState: function () {
            Mephistowa.Storage.setObject('composercompanion', JSON.stringify($cc.state))
        },
        handleFileSelect: function (evt) {
            var files = evt.target.files; // FileList object
            var app = new script.soundfont.app();

            // Loop through the FileList and render image files as thumbnails.
            for (var i = 0, f; f = files[i]; i++) {

                if (!f.name.endsWith(".sf2") && !f.name.endsWith(".js")) {
                    continue;
                }
                // Only process image files.

                var reader = new FileReader();

                // Closure to capture the file information.
                if (f.name.endsWith(".sf2")) {
                    reader.onload = (function (theFile) {
                        return function (e) {
                            // Render thumbnail.
                            //var span = document.createElement('div');
                            var name = (theFile.name).split(".")[0];
                            var soundfont = app.getSoundFont(e);

                            $cc.variables.instruments = $cc.variables.instruments || [];
                            if (!$cc.variables.instruments.contains(function (x) { return x == name; })) {
                                $cc.variables.instruments.push(name);
                                window.raise('newintruments', { instruments: $cc.variables.instruments });
                            }

                            $cc.runtime.addSoundFont(soundfont, name, e);
                            delete (e);
                        };
                    })(f);

                    // Read in the image file as a data URL.
                    reader.readAsArrayBuffer(f);
                }
                if (f.name.endsWith(".js")) {
                    reader.onload = (function (theFile) {
                        return function (e) {
                            // Render thumbnail.
                            //var span = document.createElement('div');
                            var name = (theFile.name);
                            var data = { name: name, e: e };
                            $cc.runtime.appendToSoundFontList(data);
                            window.MIDI.LoadMp3Sounds(theFile.name, e, function () {
                                this.range.html("Loaded");
                                this.hasLoaded = true;
                            }.bind(data), function (current, last) {
                                var percentage = current / last * 100;
                                this.loading = true;
                                this.range.html(percentage + "%");
                            }.bind(data));
                            data.slider.change(function (d, _slider) {
                                if (_slider.val() == "on") {
                                    //    defaultInstrument = d.name.split(".")[0];
                                }
                                else {
                                    //defaultInstrument = naturalDefaultInstrument;
                                }
                                if (!d.loading && !d.hasLoaded) {
                                    d.loading = true;
                                }
                            }.bind(this, data, data.slider));
                        };
                    })(f);

                    // Read in the image file as a data URL.
                    reader.readAsText(f);
                }


            }
        },
        createCompositeBank: function (banks, itemstoremove) {
            itemstoremove = itemstoremove || [];
            banks = banks || [];
            var starttime = -itemstoremove.max(function (x) {
                return -x._data.start
            });
            var config = {
                entrysource: function (id) {
                    return $cc.runtime.getBankEntry(id);
                },
                internalId: Mephistowa.GUID(),
                configuration: {
                    banks: banks.select(function (x) {
                        return x.internalId;
                    }),
                    editSpaceSource: function () { },
                    startTime: starttime,
                    offsets: itemstoremove.select(function (x) {
                        return {
                            internalId: x._bank.internalId,
                            compositeId: Mephistowa.GUID(),
                            startTime: x._data.start - starttime,
                            duration: x._data.duration
                        }
                    })
                }
            }

            var compositeEntry = new ComposerCompanion.CompositeEntry(config);
            var session = $cc.variables.recordingSessions.first(function (x) {
                return x.bankEntries.contains(function (y) {
                    return itemstoremove.contains(function (t) {
                        return t == y.dataitem;
                    });
                });
            });
            if (session) {
                session.bankEntries.removeWhere(function (y) {
                    return itemstoremove.contains(function (t) {
                        return t == y.dataitem;
                    });
                });
                $cc.runtime.addEntryToTrack(compositeEntry, session.datarow, {
                    startTime: compositeEntry.getStartTime()
                });
                itemstoremove.forEach(function (x, index) { x.remove(); });
            }
            $cc.variables.bankentry.push(compositeEntry);
            $cc.runtime.raise("bankchange", { entry: compositeEntry });
        }
    }
};
var $cc = ComposerCompanion;