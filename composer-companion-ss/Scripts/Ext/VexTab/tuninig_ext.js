Vex.Flow.Tuning.prototype.getFretForNote = function (note, octave) {
    var integer = this.noteToInteger(note + "/" + octave);
    var smallest = -10000;
    var index = -1;
    for (var i = this.tuningValues.length; i--;) {
        if (this.tuningValues[i] - integer < 0 && this.tuningValues[i] - integer > smallest) {
            smallest = this.tuningValues[i] - integer;
            index = i;
        }

    }
    var string = index + 1;
    var fret = smallest * -1;
    return { fret: fret, string: string };
}
Vex.Flow.VexTab.prototype.parseAccidentals = function () {

}
Vex.Flow.VexTab.Accidentals = {
    "♭": "B",
    "♯": "#"
};
Vex.Flow.VexTab.prototype.parseVoiceId = function () {
    if (!this.getNextVoiceToken()) {
        this.parseError("Invalid voice token");
    }
    var voiceId = this.parse_state.value;
    if (voiceId == true) {
        voiceId = voiceId;
    }
    if (isNaN(parseInt(voiceId))) {
        this.parseError("Invalid voice: " + this.parse_state.value);
    }
    else {
        this.state.current_voice = voiceId;
    }

    if (this.parse_state.done) return;
    this.parseError("Unexpected : check parseVoiceId");
}
Vex.Flow.VexTab.prototype.getNextVoiceToken = function () {
    return this.getNextRegExp(/^([0-9]+|:)(.*)/);
}
Vex.Flow.Formatter.FormatAndDrawTiesMulti = function (voice_ties, _CONTEXT) {
    var voice_tie_tracks = {};
    for (var i = voice_ties.length; i--;) {
        if (voice_tie_tracks[voice_ties[i].notes.first_note.voiceId] == undefined) {
            voice_tie_tracks[voice_ties[i].notes.first_note.voiceId] = [];
        }
        voice_tie_tracks[voice_ties[i].notes.first_note.voiceId].push(voice_ties[i]);
    }

    for (var j = 0; j < voice_ties.length; ++j) {
        voice_ties[j].setContext(_CONTEXT).draw();
    }
}
// Helper function to format and draw a single/multi voice
Vex.Flow.Formatter.FormatAndDrawMulti = function (ctx, stave, notes) {
    var voicetracks = {};
    for (var i = 0; i < notes.length; i++) {
        if (voicetracks[notes[i].voiceId] == undefined) {
            voicetracks[notes[i].voiceId] = [];
        }
        voicetracks[notes[i].voiceId].push(notes[i]);
    }
    var voices = [];
    for (var i in voicetracks) {
        var voice = new Vex.Flow.Voice(Vex.Flow.TIME4_4).setStrict(false);
        voice.addTickables(voicetracks[i]);
        voices.push(voice);
    }
    var formatter = new Vex.Flow.Formatter().joinVoices(voices).
      formatToStave(voices, stave);
    for (var i = 0 ; i < voices.length; i++)
        voices[i].draw(ctx, stave);
}

Vex.Drawer = function (canvasid) {
    this._canvas = document.getElementById(canvasid);
    this._CONTEXT = new Vex.Flow.Renderer(
               document.getElementById(canvasid),
                 Vex.Flow.Renderer.Backends.CANVAS).getContext();
    this._JUSTIFY_WIDTH = document.getElementById(canvasid).width;
    this._parser = new Vex.Flow.VexTab();
}

Vex.Drawer.prototype = {
    draw: function (vextab_code, width, height) {
        try {
            if (width != undefined) {
                this._JUSTIFY_WIDTH = width;
                this._canvas.width = width;
            }
            if (height != undefined) {
                this._canvas.height = height;
            }
            this._canvas.width = this._canvas.width;
            this._parser.parse(vextab_code);
            if (this._parser.isValid()) {
                var elements = this._parser.getElements();
                var staves = elements.staves;
                var tabnotes = elements.tabnotes;
                var notes = elements.notes;
                var ties = elements.ties;
                var beams = elements.beams;

                for (var i = 0; i < staves.length; ++i) {
                    var tabstave = staves[i].tab;
                    var voice_tabnotes = elements.tabnotes[i];
                    var voice_ties = elements.ties[i];
                    var notestave = staves[i].note;
                    var voice_notes = notes[i];

                    if (tabstave) {
                        tabstave.setWidth(this._JUSTIFY_WIDTH - 50);
                        tabstave.setContext(this._CONTEXT).draw();
                    }

                    if (notestave) {
                        notestave.setWidth(this._JUSTIFY_WIDTH - 50);
                        notestave.setContext(this._CONTEXT).draw();
                    }

                    if (notestave && tabstave) {
                        Vex.Flow.Formatter.FormatAndDrawTab(
                          this._CONTEXT,
                          tabstave,
                          notestave,
                          voice_tabnotes,
                          voice_notes);
                    } else if (tabstave) {
                        if (voice_tabnotes) Vex.Flow.Formatter.FormatAndDraw(
                            this._CONTEXT, tabstave, voice_tabnotes);
                    } else if (notestave) {
                        if (voice_notes) Vex.Flow.Formatter.FormatAndDrawMulti(
                            this._CONTEXT, notestave, voice_notes);
                    }

                    Vex.Flow.Formatter.FormatAndDrawTiesMulti(voice_ties, this._CONTEXT);

                }
                // Draw beams
                for (var j = 0; j < beams.length; ++j) {
                    beams[j].setContext(this._CONTEXT).draw();
                }
            }
        } catch (e) {
            alert(e.message);
        }
    }
}