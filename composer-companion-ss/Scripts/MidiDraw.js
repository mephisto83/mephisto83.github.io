if (typeof (ChordMaster) == "undefined") {
    ChordMaster = {};
}
ChordMaster.MidiDraw = function (canvas) {
    this._canvas = canvas;
    this._renderer = new Vex.Flow.Renderer(this._canvas, Vex.Flow.Renderer.Backends.CANVAS);
    this._notevalues = {
        whole: 4,
        half: 2,
        quarter: 1,
        eigth: .5,
        sixtenth: (1 / 4),
        thirtysecond: (1 / 8)
    };
}

ChordMaster.MidiDraw.prototype = {
    bias: function (val) {
        if (val) {
            this._bias = "sharp";
        } else
            this._bias = "flat";
    },
    getDuration: function (d, qnd) {

        var left = d;
        var output = [];
        var names = []; //["whole", "half", "quarter", "eigth", "sixtenth", 'thirtysecond'];
        for (var i in this._notevalues) {
            names.push(i);
        }
        var values = this._notevalues;
        var i = 0;
        while (left > 0) {
            if (values[names[i]] * qnd <= left) {
                output.push(values[names[i]]);
                left -= values[names[i]] * qnd;
            }
            else {
                i++;
            }
            if (i >= names.length) {
                break;
                //close enough
            }
        }

        return output;
    },
    getDurationSymbols: function (output) {
        var symbols = [];
        for (var i = 0 ; i < output.length; i++) {
            //if (this.is("whole", output[i])) {
            //    symbols.push("w");
            //}
            //else if (this.is("half", output[i])) {
            //    symbols.push("h");
            //}
            //else if (this.is("quarter", output[i])) {
            //    symbols.push("q");
            //}
            //else if (this.is("eigth", output[i])) {
            //    symbols.push("8");
            //}
            symbols.push(Math.pow(output[i], -1) * 4);
        }
        return symbols;
    },
    is: function (key, value) {
        return this._values[key] == value;
    },
    calculateOutputDurationBeats: function (output) {
        var beats = 0;
        for (var i = 0 ; i < output.length; i++) {
            beats += output[i];
        }
        return beats;
    },
    drawMeasure: function (measureinfo) {
        var renderer = this._renderer;
        var ctx = renderer.getContext();
        ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
        var total_y = 0;
        for (var i = 0; i < measureinfo.clefs.length ; i++) {
            var x = measureinfo.clefs[i].offsetx;
            var y = measureinfo.clefs[i].offsety;
            var stave = new Vex.Flow.Stave(x, total_y, measureinfo.width);
            stave.addClef(measureinfo.clefs[i].type); //"treble"
            stave.setContext(ctx).draw();
            total_y += y;
        }
        // Create a voice in 4/4
        var createVoice = function (beats, valuek) {
            return new Vex.Flow.Voice({
                num_beats: beats,
                beat_value: valuek,
                resolution: Vex.Flow.RESOLUTION
            });
        }
        var shownotes = [];
        var notes = measureinfo.notes;
        var notes_copy = measureinfo.notes;
        var totalbeats = 0;
        if (measureinfo.notes) {
            var quarternote = measureinfo.quarterNoteDuration ? measureinfo.quarterNoteDuration : .5;
            var previousaccented = [];
            for (var t = 0; t < notes.length ; t++) {
                var i = (t + measureinfo.index) % notes.length;
                try {
                    var duration = this.getDuration(notes[i].duration, quarternote);
                    var beats = this.calculateOutputDurationBeats(duration);
                    if (totalbeats + beats > measureinfo.numerator) {
                        //make a rest instead;
                        var restduration = this.getDuration(measureinfo.numerator - totalbeats, 1);
                        totalbeats += this.calculateOutputDurationBeats(restduration);
                        var rests = this.getDurationSymbols(restduration);
                        for (var r = 0; r < rests.length; r++) {
                            shownotes.push(new Vex.Flow.StaveNote({ keys: ["b/4"], duration: rests[r] + "r" }));
                        }
                        break;
                    }
                    var beatduration = this.getDurationSymbols(duration);
                    for (var bd = 0; bd < beatduration.length; bd++) {
                        var stavenote = new Vex.Flow.StaveNote({ keys: notes[i].drawable.replace(sharp, "#", true).replace(flat, 'b', true), duration: beatduration[bd] + "" });
                        shownotes.push(stavenote);
                        for (var j = 0; j < notes[i].notes.length; j++) {
                            var purenote = notes[i].notes[j].replace(flat, "").replace(sharp, "");
                            if (notes[i].notes[j].indexOf(flat) != -1 && previousaccented.indexOf(purenote) == -1) {
                                stavenote.addAccidental(j, new Vex.Flow.Accidental("b"));
                                previousaccented.push(purenote);
                            }
                            else if (notes[i].notes[j].indexOf(sharp) != -1 && previousaccented.indexOf(purenote) == -1) {
                                stavenote.addAccidental(j, new Vex.Flow.Accidental("#"));
                                previousaccented.push(purenote);
                            }
                            else if (previousaccented.indexOf(purenote) != -1) {
                                stavenote.addAccidental(j, new Vex.Flow.Accidental("n"));
                                var _index = previousaccented.indexOf(purenote)
                                previousaccented.splice(_index, 1);
                            }
                        }
                    }
                    totalbeats += beats;
                    if (totalbeats == measureinfo.numerator) {
                        break;
                    }


                }
                catch (e) {
                    alert(e);
                    throw e;
                }
            }
            if (totalbeats < measureinfo.numerator) {
                //make a rest instead;
                var restduration = this.getDuration(measureinfo.numerator - totalbeats, 1);
                var rests = this.getDurationSymbols(restduration);
                for (var r = 0; r < rests.length; r++) {
                    shownotes.push(new Vex.Flow.StaveNote({ keys: ["b/4"], duration: rests[r] + "r" }));
                }
            }
            var voice = createVoice(measureinfo.numerator, measureinfo.denominator).addTickables(shownotes);
            //Vex.Flow.Formatter.FormatAndDraw(ctx, stave, shownotes);
            // Format and justify the notes to 500 pixels
            var formatter = new Vex.Flow.Formatter().
              joinVoices([voice]).format([voice], this._canvas.width);

            voice.draw(ctx, stave);

        }
    }
};