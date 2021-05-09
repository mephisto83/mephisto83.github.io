// VexFlow - Music Engraving for HTML5
// Copyright Mohit Muthanna 2010
//
// This class implements diatonic key management.
//
// requires: vex.js   (Vex)
// requires: flow.js  (Vex.Flow)
// requires: music.js (Vex.Flow.Music)

/**
 * @constructor
 */
Vex.Flow.KeyManager = function (key) {
    this.init(key);
}

Vex.Flow.KeyManager.scales = {
    "M": Vex.Flow.Music.scales.major,
    "m": Vex.Flow.Music.scales.minor
};

Vex.Flow.KeyManager.prototype.init = function (key) {
    this.music = new Vex.Flow.Music();
    this.setKey(key);
}

Vex.Flow.KeyManager.prototype.setKey = function (key) {
    this.key = key;
    this.reset();
    return this;
}

Vex.Flow.KeyManager.prototype.getKey = function () { return this.key; }

Vex.Flow.KeyManager.prototype.reset = function () {
    this.keyParts = this.music.getKeyParts(this.key);

    this.keyString = this.keyParts.root;
    if (this.keyParts.accidental) this.keyString += this.keyParts.accidental;

    var is_supported_type = Vex.Flow.KeyManager.scales[this.keyParts.type];
    if (!is_supported_type)
        throw new Vex.RERR("BadArguments", "Unsupported key type: " + this.key);

    this.scale = this.music.getScaleTones(
        this.music.getNoteValue(this.keyString + "/4") - 48,
        Vex.Flow.KeyManager.scales[this.keyParts.type]);

    this.scaleMap = {};
    this.scaleMapByValue = {};
    this.originalScaleMapByValue = {};

    var noteLocation = Vex.Flow.Music.root_indices[this.keyParts.root];
    for (var j = 1; j < 8 ; j++)
        for (var i = 0; i < Vex.Flow.Music.roots.length; ++i) {
            var index = (noteLocation + i) % Vex.Flow.Music.roots.length;
            var rootName = Vex.Flow.Music.roots[index];

            var noteName = this.music.getRelativeNoteName(rootName, this.scale[i]);
            this.scaleMap[rootName + "/" + j] = noteName + "/" + j;
            this.scaleMapByValue[this.scale[i] + (12 * j)] = noteName + "/" + j;
            this.originalScaleMapByValue[this.scale[i] + (12 * j)] = noteName + "/" + j;
        }

    return this;
}

Vex.Flow.KeyManager.prototype.getAccidental = function (key) {
    var root = this.music.getKeyParts(key).root;
    var parts = this.music.getNoteParts(this.scaleMap[root]);

    return {
        note: this.scaleMap[root],
        accidental: parts.accidental
    }
}

Vex.Flow.KeyManager.prototype.selectNote = function (note, octave) {
    note = note.toLowerCase();
    var parts = this.music.getNoteParts(note, octave);

    // First look for matching note in our altered scale
    var scaleNote = this.scaleMap[parts.root + "/" + parts.octave];

    if (scaleNote == undefined) {

    }
    var _scaleNoteParts = scaleNote.split("/");
    var modparts = this.music.getNoteParts(_scaleNoteParts[0], _scaleNoteParts[1]);

    if (scaleNote == note + "/" + octave) return {
        "note": scaleNote.split("/")[0],
        "accidental": parts.accidental,
        "change": false
    }

    // Then search for a note of equivalent value in our altered scale
    var valueNote = this.scaleMapByValue[this.music.getNoteValue(note + "/" + octave)];
    if (valueNote != null) {
        return {
            "note": valueNote.split("/")[0],
            "accidental": this.music.getNoteParts(valueNote.split("/")[0], valueNote.split("/")[1]).accidental,
            "change": false
        }
    }

    // Then search for a note of equivalent value in the original scale
    var originalValueNote = this.originalScaleMapByValue[
  this.music.getNoteValue(note + "/" + octave)];
    if (originalValueNote != null) {
        this.scaleMap[modparts.root + "/" + modparts.octave] = originalValueNote;
        delete this.scaleMapByValue[this.music.getNoteValue(scaleNote)];
        this.scaleMapByValue[this.music.getNoteValue(note + "/" + octave)] = originalValueNote;
        return {
            "note": originalValueNote,
            "accidental": this.music.getNoteParts(originalValueNote.split("/")[0], originalValueNote.split("/")[1]).accidental,
            "change": true
        }
    }

    // Then try to unmodify a currently modified note.
    if (modparts.root + '/' + modparts.octave == note + "/" + octave) {
        delete this.scaleMapByValue[
          this.music.getNoteValue(this.scaleMap[parts.root + "/" + parts.octave])];
        this.scaleMapByValue[this.music.getNoteValue(modparts.root + "/" + parts.octave)] =
          modparts.root + "/" + modparts.octave;
        this.scaleMap[modparts.root + "/" + modparts.octave] = modparts.root + "/" + modparts.octave;
        return {
            "note": modparts.root,
            "accidental": null,
            "change": true
        }
    }

    // Last resort -- shitshoot
    delete this.scaleMapByValue[
      this.music.getNoteValue(this.scaleMap[parts.root + "/" + parts.octave])];
    this.scaleMapByValue[this.music.getNoteValue(note + "/" + octave)] = note + "/" + octave;

    delete this.scaleMap[modparts.root + "/" + modparts.octave];
    this.scaleMap[modparts.root + "/" + modparts.octave] = note + "/" + octave;

    return {
        "note": note,
        "accidental": parts.accidental,
        "change": true
    }
}
