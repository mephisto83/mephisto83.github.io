MEPH.define('MEPH.audio.music.theory.Notes', {
    statics: {
        metricscale: {
            '1': 0,
            '2': 2,
            '3': 4,
            '4': 5,
            '5': 7,
            '6': 9,
            '7': 11
        },

        generateSignaturePoints: function () {
            var signaturePoints = {}, Notes = MEPH.audio.music.theory.Notes,
                sharp = Notes.sharp, flat = Notes.flat;
            for (var i = 0 ; i < 11 ; i++) {
                var key = Notes.getKey((Notes.library["C"] + i * 7) % 12, sharp);
                if (signaturePoints[key] == undefined) {
                    signaturePoints[key] = { sharps: i };
                }
                else {
                    signaturePoints[key].sharps = i;
                }
                var temp = (Notes.library["C"] - i * 7) % 12;
                if (temp < 0) {
                    temp += 12;
                }
                key = Notes.getKey(temp, flat);
                if (signaturePoints[key] == undefined) {
                    signaturePoints[key] = { flats: i };
                }
                else {
                    signaturePoints[key].flats = i;
                }

            }
            return signaturePoints;
        },
        createScaleLib: function () {
            var scalelib = [];
            var _temp = "BCDEFGA".split("");
            for (var j = 0 ; j < 10; j++)
                for (var i = 0 ; i < _temp.length; i++) {
                    scalelib.push(_temp[i]);
                }
            return scalelib;
        },
        convertToNote: function (note) {
            var key = note % 12,
                foundkey;
            var Notes = MEPH.audio.music.theory.Notes;
            for (var i in Notes.library) {
                if (Notes.library[i] === key) {
                    foundkey = i;
                    break;
                }
            }
            return foundkey + '/' + Math.floor(note / 12)
        },
        convertToMidi: function (note) {
            var Notes = MEPH.audio.music.theory.Notes;
            var res = note.split('').where(function (x) { return isNaN(x); }).join('');
            var key = Notes.library[(res.split('')[0] + (res.split('')[1] === 'b' ? Notes.flat : ''))];

            var octave = parseInt(note.split('').where(function (x) { return !isNaN(x); }).first());
            return octave * 12 + key;
        },
        /**
         * Gets the key
         **/
        getKey: function (value, accidental) {
            var Notes = MEPH.audio.music.theory.Notes;
            for (var i in Notes.library) {
                if (Notes.library[i] == value) {
                    if (i.indexOf(Notes.flat) == -1 && i.indexOf(Notes.sharp) == -1) {
                        return i;
                    }
                    else if (i.indexOf(Notes.sharp) != -1 && accidental == Notes.sharp) {
                        return i;
                    }
                    else if (i.indexOf(Notes.flat) != -1 && accidental == Notes.flat) {
                        return i;
                    }


                }
            }
        },
        getMetric: function (normal) {
            var Notes = MEPH.audio.music.theory.Notes;
            var values = normal.split("");
            var key = null;
            var addition = 0;
            for (var i = 0; i < values.length; i++) {
                if (values[i] == "-") {
                    addition--;
                }
                else if (values[i] == "+") {
                    addition++;
                }
                else {
                    key = parseInt(Notes.metricscale[values[i]]);
                }
            }
            if (key == null) {
                throw 'key not found';
            }
            return key + addition;
        },
        midiNotes: function (bias, steps) {
            return steps.select(function (x) {
                return bias + parseInt(x, 12);
            });
        },
        getOptions: function (note) {
            var Notes = MEPH.audio.music.theory.Notes;
            var results = [];
            for (var i in Notes.library) {
                if (Notes.library[i] == Notes.library[note]) {
                    results.push(i);
                }
            }
            return results;
        },
        fitNotesTo: function (notes, notes2) {
            var results = [],
                Notes = MEPH.audio.music.theory.Notes,
                sharp = Notes.sharp,
                flat = Notes.flat;
            for (var i = 0; i < notes.length; i++) {
                if (notes[i].indexOf(sharp) != -1 || notes[i].indexOf(flat) != -1) {
                    if (notes2.indexOf(notes[i]) == -1) {
                        var options = Notes.getOptions(notes[i]);
                        var added = false;
                        for (var j = options.length; j--;) {
                            if (notes2.indexOf(options[j]) != -1) {
                                results.push(options[j]);
                                added = true;
                                break;
                            }
                        }
                        if (!added) {
                            results.push(notes[i]);
                        }
                    }
                    else {

                        results.push(notes[i]);
                    }
                }
                else {
                    results.push(notes[i]);
                }
            }
            return results;
        },
        containsType: function (array, info) {
            for (var i = array.length; i--;) {
                if (info.equals(array[i].voice)) {
                    return true;
                }
            }
            return false;
        },
        isAccidentaled: function (val, acid) {
            var v = val.split("");
            var count = 0;
            for (var i = 0 ; i < v.length; i++) {
                if (v[i] === acid) {
                    count++;
                }
            }
            return count;
        },
        findLetter: function (num, bias, base7) {
            var Notes = MEPH.audio.music.theory.Notes;
            var result = null;
            for (var i in Notes.library) {
                if (base7 !== undefined) {
                    var flatness = Notes.isAccidentaled(base7, "-");
                    if (flatness) {
                        bias = Notes.flat;
                    }
                    var sharped = Notes.isAccidentaled(base7, "+");
                    if (sharped) {
                        bias = Notes.sharp;
                    }
                }
                if (Notes.library[i] === num) {

                    if (i.indexOf(bias) !== -1) {
                        result = i;
                    }
                    else if (bias === undefined) {
                        result = i;
                    }
                    if (i.indexOf(Notes.sharp) === -1 && i.indexOf(Notes.flat) === -1) {
                        return i;
                    }
                }
            }
            return result;
        },
        convertTo: function (base, offset) {
            var temp = null;
            if (offset < base) {
                temp = (offset + 12) - base;
            }
            else {
                temp = (offset) - base;
            }
            return temp;
        },
        convertToMelody: function (base, offset) {
            var temp = null;
            if (offset < base) {
                temp = (offset) + base;
            }
            else {
                temp = (offset) + base;
            }
            return temp % 12;
        },
        converttoBase12: function (v) {
            return v.toString(12);
        }
    }
}).then(function () {

    var Notes = MEPH.audio.music.theory.Notes;

    if (!Array.prototype)
        Object.defineProperty(Array.prototype, 'convertToMetric ', {
            enumerable: false,
            writable: true,
            configurable: true,
            value: function () {
                var result = [];
                for (var i = 0; i < this.length; i++) {
                    result.push(Notes.getMetric(this[i]));
                }
                return result;
            }
        });


    function htmlDecode(input) {
        var e = document.createElement('div');
        e.innerHTML = input;
        return e.childNodes[0].nodeValue;
    }

    var flat = htmlDecode('&#x266d;');
    var sharp = htmlDecode('&#x266F;');
    var natural = htmlDecode('&#x266E;');
    Notes.sharp = sharp;
    Notes.flat = flat;
    Notes.natural = natural;
    var library = {};
    library["C"] = 0;
    library["B" + sharp] = 12;
    library["C" + sharp] = 1;
    library["D" + flat] = 1;
    library["D"] = 2;
    library["D" + sharp] = 3;
    library["E" + flat] = 3;
    library["E"] = 4;
    library["F" + flat] = 4;
    library["E" + sharp] = 5;
    library["F"] = 5;
    library["F" + sharp] = 6;
    library["G" + flat] = 6;
    library["G"] = 7;
    library["G" + sharp] = 8;
    library["A" + flat] = 8;
    library["A"] = 9;
    library["A" + sharp] = 10;
    library["B" + flat] = 10;
    library["B"] = 11;
    library["C" + flat] = -1;
    Notes.library = library;

    Notes.signaturePoints = Notes.generateSignaturePoints();


    Array.prototype.appendOctave = function (start, copy, octave_offset) {
        var result = [];
        var scalelib = Notes.createScaleLib();
        var lastfound = 1;
        for (var i = 0; i < this.length; i++) {

            var purenote = copy[i].replace(flat, "").replace(sharp, "").replace("#", "").toUpperCase();

            var scaleoffset = Math.floor(scalelib.indexOf(purenote, lastfound) / 7);
            if (scalelib.indexOf(purenote, lastfound) % 7 == 0 && scaleoffset != 0) {
                scaleoffset--;
            }
            lastfound = scalelib.indexOf(purenote, lastfound)
            if (octave_offset) {

                result[i] = (this[i] + "/" + (start + octave_offset[i])).toLowerCase();
            } else
                result[i] = (this[i] + "/" + (start + scaleoffset)).toLowerCase();
        }
        return result;
    }
    Array.prototype.makeDrawable = function (root, bias, start) {
        var result = [];
        for (var i = 0; i < this.length; i++) {
            result.push(Notes.findLetter(Notes.convertToMelody(Notes.library[root], parseInt(this[i])), bias));
        }
        return result.appendOctave(start, result);
    }
    Array.prototype.toLetterNotes = function (root, bias) {
        var result = [];
        for (var i = 0; i < this.length; i++) {
            result.push(Notes.findLetter(Notes.convertToMelody(Notes.library[root], parseInt(this[i])), bias));
        }
        return result;
    }
    Array.prototype.removeEmpties = function () {
        var result = [];
        for (var i = 0; i < this.length; i++) {
            if (this[i] != null && this[i] != "") {
                result.push(this[i]);
            }
        }
        return result;
    }
});