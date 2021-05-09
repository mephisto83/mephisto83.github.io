if (typeof (ChordMaster) == "undefined") {
    ChordMaster = {};
}
ChordMaster.MidiReader = function (flat, sharp) {
    this._player = MIDI.Player;
    this._player.timeWarp = 1; // speed the song is played back
    this._notehistory = null;
    this._eventQueue = [];
    this._currentTime = 0;
    this._timeInfo = {};
    this._quarternotevalue = 1;
    this._flat = flat;//   htmlDecode('&#x266d;');
    this._sharp = sharp;// htmlDecode('&#x266F;');
    this._channels = [];
    var library = {};
    library["a"] = 0;
    library["b" + sharp] = 1;
    library["b" + flat] = 1;
    library["b"] = 2;
    library["c" + flat] = 2;
    library["c"] = 3;
    library["b" + sharp] = 3;
    library["c" + sharp] = 4;
    library["d" + flat] = 4;
    library["d"] = 5;
    library["d" + sharp] = 6;
    library["e" + flat] = 6;
    library["e"] = 7;
    library["f" + flat] = 7;
    library["e" + sharp] = 8;
    library["f"] = 8;
    library["f" + sharp] = 9;
    library["g" + flat] = 9;
    library["g"] = 10;
    library["g" + sharp] = 11;
    library["a" + flat] = 11;
    this._library = library;
}
ChordMaster.MidiReader.prototype = {
    loadFile: function (file, callback) {
        this._loadedfile = this._player.getMidiFileData(file, 1);
        this._endTime = this.getLength(this._loadedfile);
    },
    findLetter: function (num, bias, toavoid) {
        var result = null;
        for (var i in this._library) {
            if (this._library[i] == num) {
                if (i.indexOf(bias) != -1) {
                    result = i;
                }
                else if (bias == undefined) {
                    result = i;
                }
                if (i.indexOf(sharp) == -1 && i.indexOf(flat) == -1) {
                    return i;
                }
            }
        }
        return result;
    },
    getDrawableChord: function (chord, bias) {
        if (!chord) {
            return null;
        }
        var root = this.getChordRoot(chord) - 7;
        if (root < 0) {
            root += 12;
        }
        var vscale = this.getVScaleofChord(chord);
        var duration = 0;
        for (var i = chord.length ; i--;) {
            if (chord[i].duration > duration) {
                duration = chord[i].duration;
            }
        }
        var _root = findLetter(root, bias);
        return {
            notes: vscale.toLetterNotes(_root, bias),
            drawable: vscale.makeDrawable(_root, bias, 4),
            duration: duration,
            timeInfo: this._timeInfo
        }

    },
    getLength: function (data) {
        var length = data.length;
        var totalTime = 0.5;
        for (var n = 0; n < length; n++) {
            totalTime += data[n][1];
        }
        return totalTime;
    },
    setQuarterNoteVal: function (val) {
        this._quarternotevalue = val;
    },
    getNoteTypes: function (chord) {
        if (chord) {
            var result = [];
            for (var i = 0 ; i < chord.length; i++) {
                result.push((chord[i].source.endtime - chord[i].source.time) / this._quarternotevalue);
            }
            return result;
        }
        return null;
    },
    getChordRoot: function (chord) {
        if (!chord) {
            return null;
        }
        var numbers = [];
        for (var i = 0; i < chord.length ; i++) {
            var n = parseInt(chord[i].event.noteNumber);
            if (numbers.indexOf(n) == -1) {
                numbers.push(n);
            }
        }
        var sorted = numbers.sort(function (a, b) { return a - b });
        var cleaned = [];
        for (var i = 0 ; i < sorted.length; i++) {
            if (cleaned.indexOf(sorted[i] % 12) == -1) {
                cleaned.push(sorted[i] % 12);
            }
        }
        return cleaned[0];
    },
    getVScaleofChord: function (chord) {
        if (!chord) {
            return null;
        }
        var numbers = [];
        for (var i = 0; i < chord.length ; i++) {
            var n = parseInt(chord[i].event.noteNumber);
            if (numbers.indexOf(n) == -1) {
                numbers.push(n);
            }
        }
        var sorted = numbers.sort(function (a, b) { return a - b });
        var cleaned = [];
        for (var i = 0 ; i < sorted.length; i++) {
            if (cleaned.indexOf(sorted[i] % 12) == -1) {
                cleaned.push(sorted[i] % 12);
            }
        }
        var normalized = cleaned.chordNormalize(12).sort(function (a, b) { return a - b });
        return normalized;
    },
    scheduleTracking: function (id, channel, note, currentTime, offset, message, velocity) {
        var interval = window.setInterval((function () {
            window.clearInterval(interval);
            var data = {
                channel: channel,
                note: note,
                now: currentTime,
                end: this._endTime,
                message: message,
                velocity: velocity
            };
            //
            //if (message === 128) {
            //    delete noteRegistrar[note];
            //}
            //else {
            //    noteRegistrar[note] = data;
            //}
            for (var i = this._eventQueue.length; i--;) {
                if (this._eventQueue[i].id == id) {
                    this._eventQueue[i].complete = true;
                }
            }
            this._currentTime = currentTime;
            if (this._currentTime === this._queuedTime && this._queuedTime <= this._endTime) { // grab next sequence
                this.process(this._queuedTime, true);
            }
        }).bind(this), currentTime - offset);
        // window.setInterval
        return interval;
    },
    possiblyFinished: function () {

        for (var i = this._eventQueue.length; i--;) {
            if (!this._eventQueue[i].complete) {
                if (!this._eventQueue[i].complete) {
                    return
                }
            }
        }
        if (!this._hasNotRaiseedComplete)
            alert("finished");
        this._hasNotRaiseedComplete = true;
    },
    process: function (queuedTime) {
        var note;
        var offset = 0;
        var messages = 0;
        var data = this._loadedfile;
        var ctx = this._player.ctx; // new AudioContext()
        var length = data.length;
        var currentTime = this._currentTime;
        this._channels = [];
        // 
        queuedTime = 0.5;
        this._queuedTime = queuedTime;
        startTime = ctx.currentTime;
        //
        for (var n = 0; n < length  ; n++) {
            if (data[n][0].event.subtype == "timeSignature") {
                this._timeInfo[data[n][0].track] = data[n][0].event;
            }
            queuedTime += data[n][1];

            if (queuedTime <= currentTime) {
                offset = queuedTime;

                // currentTime += step;
                continue;
            }
            currentTime = queuedTime - offset;

            this._queuedTime = queuedTime;
            var event = data[n][0].event;
            if (event.type !== "channel") {
                var event_typpe = event.type;

                continue;
            }
            var channel = event.channel;
            if (this._channels.indexOf(channel) == -1) {
                this._channels.push(channel);
            }
            switch (event.subtype) {
                case 'noteOn':
                    if (MIDI.channels[channel].mute) break;
                    note = event.noteNumber - (this._player.MIDIOffset || 0);
                    this._eventQueue.push({
                        id: this._eventQueue.length,
                        event: event,
                        source: {
                            channel: channel,
                            noteNumber: event.noteNumber,
                            velocity: event.velocity,
                            time: currentTime / 1000 + ctx.currentTime
                        }//,
                        //   interval: this.scheduleTracking(this._eventQueue.length, channel, note, queuedTime, offset, 144, event.velocity)
                    });
                    messages++;
                    break;
                case 'noteOff':
                    if (MIDI.channels[channel].mute) break;
                    note = event.noteNumber - (this._player.MIDIOffset || 0);
                    this._eventQueue.push({
                        id: this._eventQueue.length,
                        event: event,
                        source: {
                            channel: channel,
                            noteNumber: event.noteNumber,
                            velocity: event.velocity,
                            time: currentTime / 1000 + ctx.currentTime
                        }//,
                        //interval: this.scheduleTracking(this._eventQueue.length, channel, note, queuedTime, offset - 10, 128)
                    });
                    break;
                default:
                    break;
            }
        }
        var timedictionary = {};
        for (var i = 0 ; i < this._eventQueue.length ; i++) {
            if (timedictionary[this._eventQueue[i].source.time] == undefined) {
                timedictionary[this._eventQueue[i].source.time] = [];
            }
            timedictionary[this._eventQueue[i].source.time].push(this._eventQueue[i]);
        }
        this._timedictionary = timedictionary;
        var notehistory = {};
        for (var i = 0 ; i < this._eventQueue.length ; i++) {
            var notename = this._eventQueue[i].source.noteNumber;
            var channel = this._eventQueue[i].event.channel;
            if (!notehistory[channel]) {
                notehistory[channel] = {};
            }
            if (notehistory[channel][notename] == undefined) {
                notehistory[channel][notename] = [];
            }

            notehistory[channel][notename].push(this._eventQueue[i]);
            if (this._eventQueue[i].event.subtype == "noteOff") {
                for (var j = notehistory[channel][notename].length; j--;) {
                    if (notehistory[channel][notename][j].event.subtype == "noteOn") {
                        notehistory[channel][notename][j].source.endtime = this._eventQueue[i].source.time;
                        break;
                    }
                }
            }
        }
        this._notehistory = notehistory;
    },
    extractChords: function (quarternote, channels, _duration, _minimumduration) {
        var offset = .5;
        var duration = _duration;
        var minimumduration = _minimumduration;

        if (duration == undefined) {
            duration = 0;
        }
        if (minimumduration == undefined) {
            minimumduration = 0;
        }
        var lasttime = 0;
        var times = [];
        for (var i in this._timedictionary) {
            if (i > lasttime) {
                lasttime = i;
            }
            times.push(i);
        }
        var chords = [];
        for (var o = 0 ; o < times.length; o++) {
            //offset; i <= lasttime ; i = i + timestep) {
            var i = parseFloat(times[o]);
            var chord = [];
            for (var h = (channels ? channels : this._channels).length; h--;) {
                var channel = parseInt(channels ? channels[h] : this._channels[h]);
                for (var j in this._notehistory[channel]) {
                    for (var k = this._notehistory[channel][j].length ; k--;) {
                        if (this._notehistory[channel][j][k].event.subtype == "noteOn")
                            if (this._notehistory[channel][j][k].source.time >= i &&
                                this._notehistory[channel][j][k].source.time <= i + duration &&
                                (this._notehistory[channel][j][k].source.endtime - this._notehistory[channel][j][k].source.time) > minimumduration) {
                                this._notehistory[channel][j][k].duration = this._notehistory[channel][j][k].source.endtime - this._notehistory[channel][j][k].source.time;
                                chord.push(this._notehistory[channel][j][k]);
                            }
                    }
                }
            }
            if (chord.length > 0) {
                if (chords[times[o]] == undefined) {
                    chords[times[o]] = [];
                }
                chords[times[o]].push(chord)
            }

        }
        var result = [];
        for (var i in chords) {
            var a = parseFloat(i);
            var c = chords[i];
            if (chords[i][0] != undefined)
                if (chords[i][0].length > 1) {
                    result.push({ index: a, chord: c });
                }
        }
        result = result.sort(function (a, b) { a.index - b.index });
        var t = [];
        for (var i = 0 ; i < result.length; i++) {
            t.push(result[i].chord);
        }
        return t;
    }
}