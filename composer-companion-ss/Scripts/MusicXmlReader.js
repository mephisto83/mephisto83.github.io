
if (typeof (ChordMaster) == "undefined") {
    ChordMaster = {};
}

ChordMaster.MusicXmlReader = function () {
    this._structure = {};
    this._warnings = [];
    this._cleffs = [];
    this._divisions = [];
    this._timeSignatures = [];
    this._voice = [];
    this._id = 0;
}
ChordMaster.MusicXmlReader.prototype = {
    _addVoice: function (voice) {
        if (!this.hasVoice(voice)) {
            this._voice.push(voice);
        }
    },
    getID: function () {
        this._id++;
        return this._id;
    },
    hasVoice: function (voice) {
        for (var i = 0 ; i < this._voice.length; i++) {
            if (this._voice[i] == voice) {
                return true;
            }

        }
        return false;
    },
    parse: function (xml) {
        var partwise = $(xml).find("score-partwise");
        if ($(partwise).length > 0) {
            var name = $(partwise)[0].nodeName;
            this._structure.version = $(partwise).attr("version");
        }
        var timewise = $(xml).find("score-timewise");

        this._structure.isPartWise = name ? true : false;
        this._structure.isTimewise = timewise.length > 0 ? true : false;
        this._structure.work = this.getWork(partwise);
        this._structure["movement-number"] = this.getSimpleType(partwise, "movement-number");
        this._structure["movement-title"] = this.getSimpleType(partwise, "movement-title");
        this._structure["credits"] = this.getCredits(partwise);
        //this._structure.work["work-number"] = this.getNodesNodesText($(partwise), "work", 'work-number');
        //this._structure.work["work-title"] = this.getNodesNodesText($(partwise), "work", "work-title");

        this._structure.identification = this.getIdentification(partwise);
        //this._structure.identification.creator.composer = this.getNodesNodesText($(partwise), "identification", "creator", { type: "type", value: "composer" });
        //this._structure.identification.creator.poet = this.getNodesNodesText($(partwise), "identification", "creator", { type: "type", value: "poet" });
        //this._structure.identification.rights = this.getNodesNodesText($(partwise), "identification", "rights")

        this.parsePartsList($(partwise).find("part-list"));

        if (this._structure.isPartWise) {
            this._structure.parts = this.parseParts(xml);
        }
        else if (this._structure.isTimewise) {
        }
        else {
            throw ('This document is neither part-wise or time-wise');
        }
    },
    getCredits: function (subroot) {
        var credits = subroot.find("credit");
        var result = [];
        for (var i = 0 ; i < credits.length ; i++) {
            result.push({
                page: $(credits[i]).attr("page"),
                tbd: "gotta complete this later"
            });
        }
        return result;
    },
    getWork: function (subroot) {
        var work = subroot.find("work");

        return {
            "work-number": this.getSimpleType(work, "work-number"),
            "work-title": this.getSimpleType(work, "work-title"),
            "opus": this.getTypedGeneralEnumerableField(work, "opus", { attributes: ["xlink:actuate", "xlink:href", "xlink:role"] })
        };
    },
    getIdentification: function (subroot) {
        var identification = subroot.find("identification");
        var creators = this.getCreators(identification);

        var result = {
            creators: creators,
            rights: this.getGeneralEnumerableField(subroot, "rights"),
            relation: this.getGeneralEnumerableField(subroot, "relation"),
            encoding: this.getEncoding(subroot),
            source: this.getSimpleType(subroot, "source"),
            miscellaneous: this.getTypedGeneralEnumerableField(subroot, "miscellaneous-field", { attributes: [] }),
        };
        return result;
    },
    getEncoding: function (subroot) {
        var encoding = subroot.find("encoding");
        var result = {
            "encoding-date": this.getSimpleGeneralEnumerableField(encoding, "encoding-date"),
            encoder: this.getSimpleGeneralEnumerableField(encoding, "encoder"),
            software: this.getSimpleGeneralEnumerableField(encoding, "software"),
            "encoding-description": this.getSimpleGeneralEnumerableField(encoding, "encoding-description"),
            "supports": this.getTypedGeneralEnumerableField(encoding, "supports", { attributes: ["type", "element", "attribute", "value"] })
        };
        return result;
    },
    getCreators: function (subroot) {
        return this.getGeneralEnumerableField(subroot, "creator");
    },
    getTypedGeneralEnumerableField: function (subroot, field, typeinfo) {
        var el = subroot.find(field);
        var result = [];
        if (el) {
            for (var i = 0 ; i < el.length; i++) {
                var attribute = {};
                for (var j = 0 ; j < typeinfo.attributes.length; j++) {
                    attribute[typeinfo.attributes[j]] = $(el[i]).attr(typeinfo.attributes[j]);
                }
                result.push(attribute);
            }
        }

        return result;
    },
    getSimpleGeneralEnumerableField: function (subroot, field) {
        var el = subroot.find(field);
        var result = [];
        if (el) {
            for (var i = 0 ; i < el.length; i++) {
                result.push($(el[i]).text());
            }
        }

        return result;
    },
    getSimpleType: function (subroot, field) {
        var el = subroot.find(field);
        if (el) {
            return $(el).text();
        }
        else {
            return null;
        }
    },
    getGeneralEnumerableField: function (subroot, field) {
        var createors = subroot.find(field);
        var result = {};
        for (var i = 0 ; i < createors.length ; i++) {
            result[createors[i].tagName + "_" + i] = $(createors[i]).text();
        }
        return result;
    },
    generateVexFlowText: function (measurenumber, part) {
        if (isNaN(measurenumber)) {
            alert("not a real number try harder");
            return;
        }
        var measure = this.getMeasureAt(measurenumber, part);
        var measureinfo = [];
        for (var i = 0; i < measure.note.length; i++) {
            var noteinfo = this.gatherChordInfo(measure.note[i]);
            var chordinfo = [noteinfo];
            for (var j = 0 ; j < measure.note[i].chordparts.length; j++) {
                var _subnoteinfo = this.gatherChordInfo(measure.note[i].chordparts[j]);
                chordinfo.push(_subnoteinfo);
            }
            measureinfo.push({
                chordinfo: chordinfo,
                voice: noteinfo.voice,
                staff: measure.note[i].staff,
                timeoffset: noteinfo.timeoffset
            });
        }
        var staffs = {
        };
        for (var i = 0 ; i < measureinfo.length ; i++) {
            if (staffs[measureinfo[i].staff] == undefined) {
                staffs[measureinfo[i].staff] = {};
            }
            if (staffs[measureinfo[i].staff][measureinfo[i].voice] == undefined) {
                staffs[measureinfo[i].staff][measureinfo[i].voice] = [];
            }
            staffs[measureinfo[i].staff][measureinfo[i].voice].push(measureinfo[i].chordinfo);
        }
        return this.writeOutMeasure(staffs, measure);
    },
    writeOutMeasure: function (staffs, measure) {

        var newline = "\r\n";
        var result = "";
        var staffcount = 0;
        for (var i in staffs) {
            var c = 0;
            var lastcleff = null;
            for (var voiceid in staffs[i]) {

                //this._structure.parts[0].measures[0].attributes[0].cleffs[0].sign
                var clef = this.getTimeAndSignature(measure.partid, measure.number, i);
                if (c % 2 == 0) {
                    result += "tabstave notation=true tablature=false " +
                       (clef.beats && clef.beattype ? "time=" + clef.beats + "/" + clef.beattype : "") +
                       (clef.cleff == "G" ? " clef=treble" : "") +
                       (clef.cleff == "F" ? " clef=bass" : "") +
                       newline + newline;
                    staffcount++;
                }
                c++;
                lastcleff = clef;
                result += this.writeOutVoice(staffs[i], voiceid, clef) + newline;
            }
        }
        this._staffcount = staffcount;
        return result;
    },
    get_staffcount: function () {
        return this._staffcount ? this._staffcount : 1;
    },
    getTimeAndSignature: function (part, measure, staffid) {
        var lastcleff = null;
        for (var i = 0 ; i < this._cleffs.length; i++) {
            if (part == this._cleffs[i].part) {
                if (this._cleffs[i].measure.number - measure < 0 && staffid == this._cleffs[i].staff) {
                    lastcleff = this._cleffs[i];
                }
            }
        }
        if (lastcleff == null) {
            lastcleff = this._cleffs[0]
        }
        for (var i = 0; i < this._timeSignatures.length; i++) {
            if (part == this._timeSignatures[i].part) {
                if (this._timeSignatures[i].measure.number - measure < 0) {
                    if (lastcleff == null) {
                        lastcleff = {};
                    }
                    lastcleff.beats = this._timeSignatures[i].beats;
                    lastcleff.beattype = this._timeSignatures[i].beattype;
                }
            }
        }
        for (var i = 0 ; i < this._divisions.length; i++) {
            if (part == this._divisions[i].part) {
                if (this._divisions[i].measure.number - measure < 0) {
                    if (lastcleff == null) {
                        lastcleff = {};
                    }
                    lastcleff.divisions = this._divisions[i].divisions;
                }
            }
        }
        return lastcleff;
    },
    writeOutVoice: function (voice, voiceid, clef) {
        var newline = "\r\n ";
        var result = "";
        result += "notes ;" + voiceid;
        var lastnoteduration = null;
        var hasopen = false;
        var hasclose = false;
        var notecount = 0;
        for (var i = 0; i < voice[voiceid].length; i++) {
            var duration = this.getNoteChordDuration(voice[voiceid][i], clef);
            if (duration != lastnoteduration) {
                result += " :" + duration + " ";
                lastnoteduration = duration;
            }
            var note = voice[voiceid][i];
            if (note[0].beam == "begin") {
                if (hasopen && !hasclose) {
                    if (notecount > 1) {
                        result += " ] ";
                    }
                    else
                        result = result.splice(result.lastIndexOf("["), 1);
                }
                result += " [ ";

                hasopen = true;
                hasclose = false;
            }
            if (hasopen) {
                notecount++;
            }
            result += this.writeoutChord(note, clef) + " ";
            if (note[0].beam == "end" && hasopen) {
                result += " ] ";
                notecount = 0;
                hasclose = true;
            }

        }
        if (hasopen && !hasclose) {
            if (voice[voiceid].length < 2) {
                result = result.splice(result.lastIndexOf("["), 1);
            }
            else
                result += " ] ";
        }
        result += newline;
        return result;
    },
    writeoutChord: function (chord, clef) {
        var result = "";
        if (chord.length == 1) {
            var note = chord[0];
            if (note.isRest) {
                switch (note.notetype) {
                    case "whole":
                        result += "B/4";
                        break;
                    case "16th":
                        result += "B/4";
                        break;
                    case "32th":
                        result += "B/4";
                        break;
                    case "eighth":
                        result += "D/4";
                        break;
                    case "quarter":
                        result += "B/4";
                        break;
                    case "half":
                        result += "B/4";
                        break;
                }
            }
            else
                result += note.key + "/" + note.octave;
        }
        else if (chord.length > 1) {
            result += "(";
            for (var i = 0; i < chord.length; i++) {
                var note = chord[i];
                result += note.key + "/" + note.octave;
                if (i != chord.length - 1) {
                    result += ".";
                }
            }
            result += ")";
        }
        return result;
    },
    getNoteChordDuration: function (note, clef) {
        var type = note[0].notetype;
        var noteduration = parseInt(note[0].duration);
        var result = null;
        var division = parseInt(clef.divisions);
        if (type == "") {
            switch (noteduration / division) {
                case 4:
                    type = "whole";
                    break;
                case 2: type = "half"; break;
                case 1: type = "quarter"; break;
            }
        }
        switch (type) {
            case "whole":
                var d_u = noteduration / division;
                result = note[0].dotted ? "wd" : "w";
                break;
            case "16th":
                result = note[0].dotted ? "16d" : "16"; break;
            case "32th":
                result = note[0].dotted ? "32d" : "32"; break;
            case "eighth":
                result = note[0].dotted ? "8d" : "8"; break;
            case "quarter":
                result = note[0].dotted ? "qd" : "q"; break;
            case "half":
                result = note[0].dotted ? "hd" : "h"; break;
        }
        if (note[0].isRest) {
            result += "r";
        }
        return result;
    },
    getTimeOffset: function (addins) {
        var offset = 0;
        for (var i = addins.forward_backwards.length; i--;) {
            if (addins.forward_backwards[i].type == "backup" ||
                addins.forward_backwards[i].type == "backward") {
                offset -= parseInt(addins.forward_backwards[i].duration);
            }
            else if (addins.forward_backwards[i].type == "forward") {
                offset += parseInt(addins.forward_backwards[i].duration);
            }
            else {
                var asdf = "asdf";
            }
        }
        return offset;
    },
    gatherChordInfo: function (note) {
        var voice = note.voice;
        var key = this.alterPitch(note.pitch.step, note.pitch.alter);
        var octave = note.pitch.octave
        var notetype = note.type;
        var currentTimeOffset = this.getTimeOffset(note.addins);
        return {
            isRest: note.isRest,
            notations: note.notations.tied,
            voice: voice,
            key: key,
            octave: octave,
            notetype: notetype,
            timeoffset: currentTimeOffset,
            dotted: note.dotted,
            beam: note.beam.value,
            beamnumber: note.beam.number,
            duration: note.duration,
            addins: note.addins
        };
    },
    alterPitch: function (result, val) {
        var flat = htmlDecode("&#x266d;");
        var sharp = htmlDecode("&#x266f;");
        var key = result;
        switch (val) {
            case "-1":
                key = key + flat;
                break;
            case "-2":
                key = key + flat + flat;
                break;
            case "1":
                key = key + sharp;
                break;
            case "2":
                key = key + sharp
                break;
        }
        return key;
    },
    getPart: function (part) {
        for (var i = 0 ; i < this._structure.parts.length; i++) {
            if (this._structure.parts[i].id == part) {
                return i;
            }
        }
        return null;
    },
    getParts: function () {
        var result = [];
        for (var i = 0 ; i < this._structure.parts.length; i++) {
            result.push(this._structure.parts[i].id);
        }
        return result;
    },
    getMeasureAt: function (val, part) {
        if (this._structure.isPartWise) {
            var count = 0;
            for (var i = 0; i < this._structure.parts.length; i++) {

                for (var j = 0; j < this._structure.parts[i].measures.length; j++) {
                    if (this._structure.parts[i].measures[j].index == val) {
                        if (this._structure.parts[i].measures[j].note.length == 0) {
                            break;
                        }
                        return this._structure.parts[i].measures[j];
                    }
                }
                count += this._structure.parts.length;
            }
        }
        return null;
    },
    getLastMeasureIndex: function () {
        if (this._structure.isPartWise) {
            var count = 0;
            for (var i = 0; i < this._structure.parts.length; i++) {
                for (var j = 0; j < this._structure.parts[i].measures.length; j++) {
                    return this._structure.parts[i].measures.length - 1;
                }
            }
        }
    },
    parsePartsList: function (subroot) {
        /*
         <part-list>
            <score-part id="P1">
              <part-name>Part 1</part-name>
            </score-part>
          </part-list>
        */
        var scoreparts = $(subroot).find("score-part");
        this._structure.scoreParts = [];
        for (var i = 0; i < scoreparts.length; i++) {
            var id = $(scoreparts[i]).attr("id");
            this._structure.scoreParts.push({
                id: id,
                identification: this.getIdentification($(scoreparts[i])),
                "part-name-display": this.getTypedObject($(scoreparts[i]), [{
                    node: "part-name-display",
                    attributes: ["print-objects"],
                    subtypes: [{
                        node: "display-text",
                        attributes: ["color", "default-x=", "default-y=", "tbd"]
                    },
                    {
                        node: "accidental-text",
                        attributes: [],
                        text: true
                    }]
                }]),
                partName: $(scoreparts[i]).find("part-name").text(),
                scoreinstruments: this.parseInstruments($(scoreparts[i])),
                midiinstruments: this.parseMidiInstruments($(scoreparts[i]))
            });
        }

    },
    getTypedObject: function (subroot, fieldtypeinfo) {
        var result = {};
        for (var i = 0 ; i < fieldtypeinfo.length; i++) {
            var node = $(subroot.find(fieldtypeinfo[i].node));
            for (var n = 0 ; n < node.length; n++) {
                if (node.length == 1) {
                    if (fieldtypeinfo[i].attributes)
                        for (var j = 0 ; j < fieldtypeinfo[i].attributes.length; j++) {
                            result[fieldtypeinfo[i].attributes[j]] = node.attr(fieldtypeinfo[i].attributes[j]);
                        }
                    if (fieldtypeinfo[i].subtypes)
                        for (var j = 0 ; j < fieldtypeinfo[i].subtypes.length ; j++) {
                            result[fieldtypeinfo[i].subtypes[j].node] = this.getTypedObject($(node), fieldtypeinfo[i].subtypes[j]);
                        }
                    if (fieldtypeinfo.text) {
                        result = node.text();
                    }
                }
            }
        }
        return result;
    },
    parseMidiInstruments: function (subroot) {
        var results = [];
        var scoreinstruments = $(subroot).find("midi-instrument");
        for (var i = 0; i < scoreinstruments.length; i++) {
            var midi = {};
            midi.channel = this.getAttrText($(scoreinstruments[i]), "midi-channel");
            midi.program = this.getAttrText($(scoreinstruments[i]), "midi-program");
            midi.unpitched = this.getAttrText($(scoreinstruments[i]), "midid-unpitched");
            midi.pan = this.getAttrText($(scoreinstruments[i]), "pan");
            midi.volume = this.getAttrText($(scoreinstruments[i]), "volume");
            results.push(midi);
        }
        return results;
    },
    parseInstruments: function (subroot) {
        var results = [];
        var scoreinstruments = $(subroot).find("score-instrument");
        for (var i = 0; i < scoreinstruments.length; i++) {
            var instrument = {};
            instrument.id = $(scoreinstruments[i]).attr("id");
            instrument.name = this.getAttrText($(scoreinstruments[i]), "instrument-name");
            results.push(instrument);
        }
        return results;
    },
    hasPart: function (id) {
        for (var i = 0; i < this._structure.scoreParts.length; i++) {
            if (this._structure.scoreParts[i].id == id)
                return true;
        }
        return false;
    },
    parseParts: function (subroot) {
        //  <part id="P1">
        var parts = $(subroot).find("part");
        var parts_result = [];
        for (var i = 0; i < parts.length; i++) {
            var _a_part = { id: $(parts[i]).attr("id") };
            if (this.hasPart(_a_part.id)) {
                if (this._structure.isPartWise) {
                    var measures = this.parseMeasures($(parts[i]), _a_part.id);
                    _a_part.measures = measures;
                    parts_result.push(_a_part);
                }
            }
            else {
                this._warnings.push("Missing Part " + _a_part.id);
            }
        }
        return parts_result;
    },
    parseMeasures: function (subroot, part) {
        var measures = $(subroot).find("measure");
        var result = [];
        for (var i = 0 ; i < measures.length; i++) {
            var _measure_part = { number: $(measures[i]).attr("number") };
            if (this._structure.isTimewise) {
            }
            else if (this._structure.isPartWise) {
                var attributes = this.getAttributes($(measures[i]), part, _measure_part);
                _measure_part.attributes = attributes;
                var note = this.getNotes($(measures[i]));
                _measure_part.note = note;
                _measure_part.index = i;
                _measure_part.partid = part;
            }
            result.push(_measure_part);
        }
        return result;
    },
    getNotes: function (subroot) {
        var notes = $(subroot).children("note,forward,backward,backup");
        var results = [];
        var forward_backward_pack = [];
        var lastnonchord = null;
        for (var i = 0; i < notes.length; i++) {
            if (notes[i].nodeName == "note") {
                var _subnote = {};
                _subnote.pitch = {};
                _subnote.pitch.step = this.getNodesNodesText(notes[i], "pitch", "step");
                _subnote.pitch.element = this.getNodesNodesText(notes[i], "pitch", "element");
                _subnote.pitch.octave = this.getNodesNodesText(notes[i], "pitch", "octave");
                _subnote.duration = this.getAttrText(notes[i], "duration");
                _subnote.whole = this.getAttrText(notes[i], "type");
                _subnote.pitch.alter = this.getNodesNodesText(notes[i], "pitch", "alter");
                _subnote.tie = this.getAttr(notes[i], { name: "type" });
                var lyrics = this.getLyrics(notes[i]);
                _subnote.lyrics = lyrics;
                _subnote.addins = {};
                _subnote.accidental = this.getAttrText(notes[i], "accidental");
                _subnote["time-modifications"] = {};
                _subnote["time-modifications"]["actual-notes"] = this.getNodesNodesText(notes[i], "time-modifications", "actual-notes");
                _subnote["time-modifications"]["normal-notes"] = this.getNodesNodesText(notes[i], "time-modifications", "normal-notes");
                _subnote["time-modifications"]["normal-type"] = this.getNodesNodesText(notes[i], "time-modifications", "normal-type");
                _subnote.notations = {};
                _subnote.notations.tied = {};
                _subnote.notations.tied.type = this.getChildChildAttr(notes[i], "notations", "tied", { name: "type" });
                _subnote.notations.tied.number = this.getChildChildAttr(notes[i], "notations", "tied", { name: "number" });
                _subnote.notations.tied.placement = this.getChildChildAttr(notes[i], "notations", "tied", { name: "placement" });
                _subnote.notations.tied.orientation = this.getChildChildAttr(notes[i], "notations", "tied", { name: "orientation" });
                _subnote.voice = this.getAttrText(notes[i], "voice");
                this._addVoice(_subnote.voice);
                _subnote.type = this.getAttrText(notes[i], "type");
                _subnote.dotted = $(notes[i]).find("dot").length > 0;
                _subnote.staff = this.getAttrText(notes[i], "staff");
                _subnote.beam = {};
                _subnote.beam.number = this.getChildAttr(notes[i], "beam", { name: "number" });
                _subnote.beam.value = this.getAttrText(notes[i], "beam");
                _subnote.instrument = this.getChildAttr(notes[i], "instrument", { name: "id" });
                _subnote.addins.forward_backwards = forward_backward_pack;
                forward_backward_pack = [];
                _subnote.id = this.getID();
                _subnote.chordparts = [];
                _subnote.isRest = $(notes[i]).find("rest").length > 0;
                _subnote.isPartOfChord = $(notes[i]).find("chord").length > 0;
                if (_subnote.isPartOfChord && lastnonchord != null) {
                    lastnonchord.chordparts.push(_subnote);
                }
                if (!_subnote.isPartOfChord) {
                    lastnonchord = _subnote;
                    results.push(_subnote);
                }
            }
            else if (notes[i].nodeName == "forward") {
                var forward = { type: notes[i].nodeName };
                forward.duration = this.getAttrText(notes[i], "duration");
                forward_backward_pack.push(forward);
            }
            else if (notes[i].nodeName == "backward") {
                var backward = { type: notes[i].nodeName };
                backward.duration = this.getAttrText(notes[i], "duration");
                forward_backward_pack.push(backward);
            }
            else if (notes[i].nodeName == "backup") {
                var backup = { type: notes[i].nodeName };
                backup.duration = this.getAttrText(notes[i], "duration");
                forward_backward_pack.push(backup);
            }
        }
        return results;
    },
    getLyrics: function (subroot) {
        var results = [];
        var lys = $(subroot).find("lyric");
        for (var i = 0 ; i < lys.length; i++) {
            var lyric = {};
            lyric.id = this.getAttr($(lys[i]), { name: "number" });
            lyric.syllabic == this.getAttrText(lys[i], "syllabic");
            lyric.text = this.getAttrText(lys[i], "text");
            results.push(lyric);
        }
        return results;
    },
    getAttr: function (subroot, opt) {
        return $(subroot).attr(opt.name)
    },
    getChildChildAttr: function (subroot, parent, child, opt) {
        var _child = $(subroot).find(parent);
        return this.getChildAttr(_child, child, opt);
    },
    getChildAttr: function (subroot, child, opt) {
        var child = $(subroot).find(child);
        return this.getAttr(child, opt);
    },
    getAttributes: function (subroot, part, measure) {
        var attributeslist = $(subroot[0]).find("attributes");
        if (attributeslist.length == 0) {
            return {};
        }
        var results_attributes = [];
        for (var i = 0; i < attributeslist.length ; i++) {
            var attributes = attributeslist[i];
            var result = {};
            result.divisions = this.getAttrText(attributes, "divisions");
            result.key = {};
            result.number = this.getTypedObject(subroot, [{ node: "attributes", attributes: ["number"] }]);
            result.key.fifths = this.getNodesNodesText(attributes, "key", "fifths");
            result.key.mode = this.getNodesNodesText(attributes, "key", "mode");
            result.time = {};
            result.time["beat-type"] = this.getNodesNodesText(attributes, "time", "beat-type");
            result.time.beats = this.getNodesNodesText(attributes, "time", "beats");
            if (result.divisions) {
                this._divisions.push({
                    part: part,
                    measure: measure,
                    divisions: result.divisions
                });
            }

            if (result.time.beats) {
                this._timeSignatures.push({
                    part: part,
                    measure: measure,
                    beattype: result.time["beat-type"],
                    beats: result.time.beats,
                    divisions: result.divisions
                });
            }
            result.cleffs = this.getClefs(attributes);
            result.staff = this.getAttrText(attributes, "staves");
            if (result.cleffs)
                for (var j = 0; j < result.cleffs.length; j++) {
                    this._cleffs.push({
                        cleff: result.cleffs[j].sign, staff: result.cleffs[j].number, part: part, measure: measure

                    });
                }
            result.transpose = {};
            result.transpose.diatonic = this.getNodesNodesText(attributes, "transpose", "diatonic");
            result.transpose.chromatic = this.getNodesNodesText(attributes, "transpose", "chromatic");
            results_attributes.push(result);
        }
        //result.clef.sign = this.getNodesNodesText(attributes, "clef", "sign");
        return results_attributes;
    },
    getClefs: function (subroot) {
        var result = [];
        var clefs = $(subroot).find("clef");
        for (var i = 0; i < clefs.length; i++) {
            var clef = {};
            clef.number = this.getAttr($(clefs[i]), { name: "number" });
            clef.sign = this.getAttrText($(clefs[i]), "sign");
            clef.line = this.getAttrText($(clefs[i]), "line");
            result.push(clef);
        }
        return result;
    },
    getNodesNodesText: function (subroot, parent, node, type) {
        var _parent = $(subroot).find(parent);
        if (type == undefined) {
            return this.getAttrText(_parent, node);
        }
        else {
            return this.getAttrText(_parent, node, type);
        }
    },
    getNodesNodesAttr: function (subroot, parent, node, type) {
        var _parent = $(subroot).find(parent);
        return this.getAttr(_parent, type);
    },
    getAttrText: function (subroot, name, type) {
        if (type) {
            var _parent = $(subroot).find(name);
            for (var i = 0 ; i < _parent.length; i++) {
                if ($(_parent[i]).attr(type.type) == type.value) {
                    return $(_parent[i]).text();
                }
            }
        }
        return $(subroot).find(name).text();
    }

}