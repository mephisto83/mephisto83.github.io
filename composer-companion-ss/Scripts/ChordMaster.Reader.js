
if (typeof (ChordMaster) == "undefined") {
    ChordMaster = {};
}

ChordMaster.Reader = function () {
    this._readRows = [];
    this._scales = [];
    this._chordVoiceTypes = [];
    this._oncompletes = [];
    //this._canvas = $("#staffnotes")[0];
    //this._canvas.width = $(window).width();
    this._chordstaffcanvas = new Vex.Drawer("staffnotes");
    //this._renderer = new Vex.Flow.Renderer(this._canvas, Vex.Flow.Renderer.Backends.CANVAS);
    this.bias = sharp;
}
ChordMaster.Reader.prototype = {
    raiseComplete: function () {
        for (var i = 0; i < this._oncompletes.length; i++) {
            this._oncompletes[i]();
        }
    },
    get_lastChords: function () {
        return this._lastChoords;
    },
    add_oncomplete: function (func) {
        this._oncompletes.push(func);
    },
    get_scalemidinotes: function () {
        if (this._scalemidinotes == undefined) {
            return [];
        }
        return this._scalemidinotes;
    },
    get_scale: function (selectedScale) {

        var currentscale = getScale(selectedScale);
        var scale_ = currentscale.base12;//chords._info.col3._val.convertToMetric();
        var base7 = currentscale.base7.split(" ").removeEmpties();
        return {
            currentScale: currentscale,
            scale: scale_,
            base7: base7
        };
    },
    get_chordmidinotes: function () {
        if (this._chordmidinotes == undefined) {
            return [];
        }
        return this._chordmidinotes;
    },
    renderNotes: function (_chords) {
        var chords = _chords;
        if (chords == undefined) {
            chords = this._lastChoords;
            if (this._lastChoords == undefined) {
                return;
            }
        }
        else {
            this._lastChoords = chords;
        }
        //var renderer = this._renderer;
        //var ctx = renderer.getContext();
        //ctx.clearRect(0, 0, this._canvas.width, this._canvas.height)
        //var stave = new Vex.Flow.Stave(0, 0, 350);
        //stave.addClef(selectedcleffchoice2);
        //stave.setContext(ctx).draw();

        var scalelib = createScaleLib();
        var baseroot = (library[getrootbase() + getaccidentalsvalue()]);
        var _d = getrootbase() + getaccidentalsvalue(); // getBaseRoot(chords._info.col2.data);
        var voicearray = chords._info.col0.voice._parseVoice;
        var chord_scale_info = chords._info.col3.val();
        var notes = [_d];
        var notes_copy = [_d];
        var octave_offset = [getrootoctave() - 4];
        for (var i = 1; i < voicearray.length; i++) {
            var note = findLetter(convertToMelody(baseroot, parseInt(voicearray[i])));
            notes.push(note);
            notes_copy.push(note);
            octave_offset.push(octave_offset[0] + Math.floor((baseroot + parseInt(voicearray[i])) / 12));
        }
        var currentscale = getScale(chords.selectedScale);
        var scale_ = currentscale.base12;//chords._info.col3._val.convertToMetric();
        var base7 = currentscale.base7.split(" ").removeEmpties();
        var scale_start = getBaseRoot(currentscale.root.toString(12).toUpperCase(), true);;
        var scale_notes = [];
        var scale_notes_copy = [];
        var scale_octave_offset = null;
        var scaleprintnotes = [];
        var scalemidinotes = [];
        for (var i = 0; i < scale_.length; i++) {
            scale_notes.push(findLetter(convertToMelody(library[scale_start], parseInt(scale_[i])), this.bias, base7[i]));
            scale_notes_copy.push(findLetter(convertToMelody(library[scale_start], parseInt(scale_[i])), this.bias, base7[i]));
            if (scale_octave_offset == null) {
                scale_octave_offset = [0];
            }
            else {
                scale_octave_offset.push(Math.floor((library[scale_start] + parseInt(scale_[i])) / 12));
            }
            var base_offset = 4;
            switch (selectedcleffchoice2) {
                case "alto":
                    base_offset = 4;
                    break;
                case "bass":
                    base_offset = 2;
                    break;
                case "tenor":
                    base_offset = 4;
            }
            scaleprintnotes.push(scale_notes[i] + '/' + ((scale_octave_offset[i] + base_offset)));
            scalemidinotes.push(library[scale_notes[i]] + ((parseInt(((scale_octave_offset[i] + base_offset))) + 1)) * 12);
        }
        this._scalemidinotes = scalemidinotes;
        notes = fitNotesTo(notes, scale_notes);
        notes_copy = fitNotesTo(notes, scale_notes);

        var chordnotelist = [];
        var chordmidinotes = [];
        for (var i = 0 ; i < notes.length; i++) {
            chordnotelist.push(notes[i] + "/" + (octave_offset[i] + 4));
            chordmidinotes.push(library[notes[i]] + (octave_offset[i] + 4 + 1) * 12);
        }
        this._chordmidinotes = chordmidinotes;
        var generateCodeInside = function (chords, scale, clef) {
            var vextab_code = "tabstave notation=true  tablature=false clef=" + clef + " \r\n" +
                              "notes ;1 :w (";
            for (var i = 0; i < chords.length; i++) {
                vextab_code += chords[i];
                if (i != chords.length - 1) {
                    vextab_code += ".";
                }
            }
            vextab_code += ")";
            vextab_code += " \r\n tabstave notation=true  tablature=false clef=" + clef + " \r\n";
            vextab_code += "notes ;1  :8d [ ";
            for (var i = 0 ; i < scale.length; i++) {
                vextab_code += scale[i];
                if (i != scale.length - 1) {
                    vextab_code += " ";
                }
            }
            vextab_code += " ]  \r\n";
            return vextab_code;
        }
        var gencode = generateCodeInside(chordnotelist, scaleprintnotes, selectedcleffchoice2);
        this._chordstaffcanvas.draw(gencode);
    },
    findExactMatch: function (v, scales) {
        for (var i = this._readRows.length; i--;) {
            if (this._readRows[i].get("col0").success && this._readRows[i].get("col0").voice.exactMatch(v)) {
                return this._readRows[i];
            }
        }
        return null;
    },
    findMatches: function (v, scales, page, pagesize) {
        if (pagesize == undefined) {
            pagesize = 10;
        }
        var matches = [];
        for (var i = this._readRows.length; i--;) {
            if (this._readRows[i].get("col0").success && this._readRows[i].get("col0").voice.matches(v)) {
                if (scales.length == 0 || scales.indexOf(this._readRows[i]._info.col3._name) != -1 || shouldShow(scales, this._readRows[i]._info.col3._scales)) {
                    matches.push(this._readRows[i]);
                }
            }

        }
        lastpage = Math.ceil(matches.length / pagesize);
        $("#paginginfo").html("<span>" + (page + 1) + " of " + (lastpage) + "</span>");
        var result = [];
        for (var i = page * pagesize ; i < (page + 1) * pagesize; i++) {
            if (i >= 0 && matches.length > i) {
                result.push(matches[i]);
            }
        }
        return result;
    },
    convertToJSON: function (xml) {
        var rows = $(xml.xml).find("Row");
        var result = { rows: [] }
        for (var i = 0; i < rows.length; i++) {
            var cells = $(rows[i]).find("Cell");
            var row = [];
            for (var j = 0; j < cells.length; j++) {
                row.push(cells[j].innerText);
            }
            result.rows.push(row);

        }
        var _result = JSON.stringify(result);
    },
    parseChordXml: function (xml) {
        //find every Tutorial and print the author
        this._readRows = [];
        var rows = mster_coord_data.rows;

        var info = parseXml();
        var copy = info;
        var length = rows.length;
        var chunk = info.splice(0, 20);
        var chunklength = chunk.length;
        var newlength = rows.length;
        var chunkalator = (function () {
            for (var i = chunk.length; i--;) {
                this.parseRow(i, rows[0], chunk[i]);
            }
            if (info.length > 0) {
                chunk = info.splice(0, 20);
                setTimeout(chunkalator, 50);
            }
            else
                this.raiseComplete();
        }).bind(this);

        for (var i in bosslist) {
            this._scales.push(bosslist[i][0].official);
        }
        setTimeout(chunkalator, 50);

        // Output:
        // The Reddest
        // The Hairiest
        // The Tallest
        // The Fattest
    },
    parseRow: function (index, body, newbody) {
        var rowinfo = new ChordMaster.RowInfo();
        var _scaleinfo = bosslist;
        rowinfo.smartinfo = newbody;
        for (var e = 0; e < body.length; e++) {
            var content = body[e];
            switch (e) {
                case 0:
                    rowinfo.set("col0", ChordMaster.ParseVoice(content, newbody));
                    break;
                case 1:
                    rowinfo.set("col1", ChordMaster.ParseChordNames(content, newbody));
                    break;
                case 2:
                    rowinfo.set("col2", ChordMaster.ParseCoordAt(content, newbody));
                    break;
                case 3:
                    rowinfo.set("col3", ChordMaster.ParseScaleInfo(content, newbody));
                    break;
                case 4:
                    rowinfo.set("col4", ChordMaster.ParseConnectionData(content, newbody));
                    break;
                case 5:
                    rowinfo.set("col5", ChordMaster.ParseConnectionData(content, newbody));
                    break;
                case 6:
                    rowinfo.set("col6", ChordMaster.ParseConnectionData(content, newbody));
                    break;
                case 7:
                    rowinfo.set("col7", ChordMaster.ParseConnectionData(content, newbody));
                    break;
            }
        }
        this._readRows.push(rowinfo);
        //var info = rowinfo.get("col3");
        //if (this._scales.indexOf(info.scaleName()) == -1) {
        //    this._scales.push(info.scaleName());
        //}
        var voiceinfo = rowinfo.get("col0");
        if (!containsType(this._chordVoiceTypes, voiceinfo.voice)) {
            this._chordVoiceTypes.push(voiceinfo);
        }
    }
};
ChordMaster.ParseScaleInfo = function (data, newdata) {
    if (newdata == undefined) {
        var scale = "scale";
        var Scale = "Scale";
        var Tone = "Tone";
        var one = "1";
        var length = 4;
        var index = data.indexOf(scale);
        var index = index == -1 ? data.indexOf(Scale) : index;
        var index = index == -1 ? data.indexOf(Tone) : index;
        var addone = 1;
        if (index == -1) {
            length = 1;
            addone = -1;
        }
        var index = index == -1 ? data.indexOf(one) : index;
        if (index == -1) {
            return data;
        }
        var scalenamem = data.substring(0, index);
        var _scale = data.substring(index + length + addone, data.length);
        var s = new ChordMaster.Scale(scalenamem);
        s.val(_scale);
        return s;
    }
    else {
        var s = new ChordMaster.Scale();
        s.setScales(newdata.scales);
        return s;
    }

};
ChordMaster.ParseVoice = function (data, moredata) {
    var voice = new ChordMaster.Voice(data, moredata);
    return { success: true, voice: voice };
};
ChordMaster.Scale = function (name) {
    if (name) {
        this._val = null;
        this._name = name.trim();
    }

}
ChordMaster.Scale.prototype = {
    setScales: function (value) {
        this._scales = value;
    },
    val: function (value) {
        if (value == undefined) {
            return this._val;
        }
        if (Object.prototype.toString.call(value) === '[object Array]') {
            this._val = value;
        }
        else {
            this._val = value.split(" ").clean("");
        }
    },
    scaleName: function () {
        return this._name;
    }
};
ChordMaster.Voice = function (voice, betterdata) {
    if (betterdata == undefined) {
        this._voice = voice;
        this.parse();
    }
    else {
        this._voice = betterdata.voice;//.convertToVVoice();
        this._parseVoice = betterdata.voice;
    }
}
ChordMaster.Voice.prototype = {
    parse: function () {
        this._parseVoice = this._voice.split("").clean(" ");
    },
    exactMatch: function (array) {
        if (array.length !== this._parseVoice.length)
            return false;
        for (var i = 0; i < array.length  ; i++) {
            if (parseInt(array[i].toLowerCase(), 12) !== (this._parseVoice[i])) {
                return false;
            }
        }
        return true;
    },
    matches: function (array) {
        //if (array.length > this._parseVoice.length) {
        //    return false;
        //}
        var lastj = 0;
        var found_i = false;
        for (var i = 0; i < array.length  ; i++) {
            for (var j = lastj ; j < this._parseVoice.length; j++) {
                if (parseInt(array[i].toLowerCase(), 12) == (this._parseVoice[j])) {
                    found_i = true;
                    break;
                }
            }
            j = lastj
            if (found_i == false) {
                return false;
            }
            found_i = false;
        }
        return true;
    },
    equals: function (that) {
        return this._voice == that._voice;
    }
};

ChordMaster.ParseChordNames = function (data, newdata) {
    var or = "or";
    var names = data.split(or);
    if (newdata != undefined) {
        var names = newdata._familyname.split(or);
        if (newdata.isInversion) {
            for (var i = names.length; i--;) {
                names[i] = names[i] + "".nth(newdata.inversion);
            }
        }
    }
    return {
        success: true,
        data: ChordMaster.ParseChordName(names)
    };
};
ChordMaster.ParseChordName = function (data) {
    return data;
}
ChordMaster.ParseCoordAt = function (data, newdata) {
    var phrase = "Chord Root at ";
    var phrase3 = " Chord Root at ";
    var phrase2 = " of";
    var index = data.indexOf(phrase3);
    index = index == -1 ? data.indexOf(phrase) : index;
    var index2 = data.indexOf(phrase2);
    if (index == -1 || index2 == -1 || index2 < (index + phrase.length)) {
        var _d = data.substring(index + phrase.length, data.length).trim();
        _d = _d == "11" ? "0B" : _d;
        _d = _d == "10" ? "0A" : _d;
        return {
            success: true,
            orgdata: data,
            data: _d
        }
    }
    else {
        var _d = data.substring(index + phrase.length, index2);
        _d = _d == "11" ? "0B" : _d;
        _d = _d == "10" ? "0A" : _d;
        return {
            success: true,
            orgdata: data,
            data: _d
        }
    }
};

ChordMaster.ParseConnectionData = function (data, newdata) {
    var phrase = "Chord Root at ";
    var phrase2 = " of";
    var index = data.indexOf(phrase);
    var index2 = data.indexOf(phrase2);
    if (index == -1 || index2 == -1 || index2 < (index + phrase.length)) {
        return data;
    }
    else {
        var modified = data.substring(0, index);
        var array = modified.split(",").trim().clean("").clean(" ").clean();
        var result = [];
        for (var i = array.length; i--;) {
            var voice_chord = ChordMaster.ParseVoiceOrChord(array[i], newdata);
            result.push(voice_chord);
        }

    }
    return result;
}

ChordMaster.ParseVoiceOrChord = function (data, newdata) {
    if (data.substring(0, 1) == "V") {
        return { type: "voice", data: ChordMaster.ParseVoice(data, newdata) };
    }
    return { type: "chord", data: ChordMaster.ParseChordNames(data, newdata) };
}

ChordMaster.RowInfo = function () {
    this._info = {};
}
ChordMaster.RowInfo.prototype = {
    set: function (type, value) {
        if (value != "")
            this._info[type] = value;
    },
    get: function (type) {
        return this._info[type];
    }
}
ChordMaster.CellInfo = function (type) {
    this._type = type;
    this._value = null;
}
ChordMaster.CellInfo.prototype = {
    value: function (val) {
        if (val == undefined) {
            return this._value;
        }
        this._value = val;
    }
}