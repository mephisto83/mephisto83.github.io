
var createScaleLib = function () {
    var scalelib = [];
    var _temp = "BCDEFGA".split("");
    for (var j = 0 ; j < 10; j++)
        for (var i = 0 ; i < _temp.length; i++) {
            scalelib.push(_temp[i]);
        }
    return scalelib;
}
Array.prototype.convertToMetric = function () {
    var result = [];
    for (var i = 0; i < this.length; i++) {
        result.push(getMetric(this[i]));
    }
    return result;
}
if (!String.prototype.trim) {

    String.prototype.trim = function () { return this.replace(/^\s\s*/, '').replace(/\s\s*$/, ''); };

    String.prototype.ltrim = function () { return this.replace(/^\s+/, ''); };

    String.prototype.rtrim = function () { return this.replace(/\s+$/, ''); };

    String.prototype.fulltrim = function () { return this.replace(/(?:(?:^|\n)\s+|\s+(?:$|\n))/g, '').replace(/\s+/g, ' '); };
    //code for trim
}
Array.prototype.clean = function (deleteValue) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] == deleteValue) {
            this.splice(i, 1);
            i--;
        }
    }
    return this;
};
Array.prototype.trim = function () {
    for (var i = 0; i < this.length; i++) {
        this[i] = this[i].trim();
    }
    return this;
}
Array.prototype.toLower = function () {
    for (var i = 0; i < this.length; i++) {
        this[i] = this[i].toLowerCase();
    }
    return this;
}

Array.prototype.replace = function (old, new_, nd) {
    var result = [];
    for (var i = 0; i < this.length; i++) {
        if (nd) {
            result.push(this[i].replace(old, new_));
        }
        else this[i] = this[i].replace(old, new_);
    }
    if (nd)
        return result;
    return this;
}


Array.prototype.appendString = function (op1, op2, array) {
    for (var i = 0; i < this.length; i++) {
        this[i] = this[i] + old;
    }
    return this;
}
Array.prototype.clean = function (deleteValue) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] == deleteValue) {
            this.splice(i, 1);
            i--;
        }
    }
    return this;
};
var key = ["A", "B", "C", "D", "E", "F", "G"];
var flat = htmlDecode('&#x266d;');
var sharp = htmlDecode('&#x266F;');
var natural = htmlDecode('&#x266E;');
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

var metricscale = {};
metricscale["1"] = 0;
metricscale["2"] = 2;
metricscale["3"] = 4;
metricscale["4"] = 5;
metricscale["5"] = 7;
metricscale["6"] = 9;
metricscale["7"] = 11;

var getKey = function (value, accidental) {
    for (var i in library) {
        if (library[i] == value) {
            if (i.indexOf(flat) == -1 && i.indexOf(sharp) == -1) {
                return i;
            }
            else if (i.indexOf(sharp) != -1 && accidental == sharp) {
                return i;
            }
            else if (i.indexOf(flat) != -1 && accidental == flat) {
                return i;
            }


        }
    }
}
var generateSigpoints = function () {
    var signaturePoints = {};
    for (var i = 0 ; i < 11 ; i++) {
        var key = getKey((library["C"] + i * 7) % 12, sharp);
        if (signaturePoints[key] == undefined) {
            signaturePoints[key] = { sharps: i };
        }
        else {
            signaturePoints[key].sharps = i;
        }
        var temp = (library["C"] - i * 7) % 12;
        if (temp < 0) {
            temp += 12;
        }
        key = getKey(temp, flat);
        if (signaturePoints[key] == undefined) {
            signaturePoints[key] = { flats: i };
        }
        else {
            signaturePoints[key].flats = i;
        }

    }
    return signaturePoints;
}
var signaturePoints = generateSigpoints();
var fitNotesTo = function (notes, notes2) {
    var results = [];
    for (var i = 0; i < notes.length; i++) {
        if (notes[i].indexOf(sharp) != -1 || notes[i].indexOf(flat) != -1) {
            if (notes2.indexOf(notes[i]) == -1) {
                var options = getOptions(notes[i]);
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
}
var getOptions = function (note) {
    var results = [];
    for (var i in library) {
        if (library[i] == library[note]) {
            results.push(i);
        }
    }
    return results;
}
var getMetric = function (normal) {
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
            key = parseInt(metricscale[values[i]]);
        }
    }
    if (key == null) {
        throw 'key not found';
    }
    return key + addition;
}

var containsType = function (array, info) {
    for (var i = array.length; i--;) {
        if (info.equals(array[i].voice)) {
            return true;
        }
    }
    return false;
}


function htmlDecode(input) {
    var e = document.createElement('div');
    e.innerHTML = input;
    return e.childNodes[0].nodeValue;
}
var findLetter = function (num, bias, base7) {
    var result = null;
    for (var i in library) {
        if (base7 != undefined) {
            var flatness = isAccidentaled(base7, "-");
            if (flatness) {
                bias = flat;
            }
            var sharped = isAccidentaled(base7, "+");
            if (sharped) {
                bias = sharp;
            }
        }
        if (library[i] == num) {

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
}

var isAccidentaled = function (val, acid) {
    var v = val.split("");
    var count = 0;
    for (var i = 0 ; i < v.length; i++) {
        if (v[i] == acid) {
            count++;
        }
    }
    return count;
}
var convertTo = function (base, offset) {
    var temp = null;
    if (offset < base) {
        temp = (offset + 12) - base;
    }
    else {
        temp = (offset) - base;
    }
    return temp;
}
var convertToMelody = function (base, offset) {
    var temp = null;
    if (offset < base) {
        temp = (offset) + base;
    }
    else {
        temp = (offset) + base;
    }
    return temp % 12;
}

export const converttoBase12 = function (v) {
    return v.toString(12);
}

Array.prototype.appendOctave = function (start, copy, octave_offset) {
    var result = [];
    var scalelib = createScaleLib();
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
        result.push(findLetter(convertToMelody(library[root], parseInt(this[i])), bias));
    }
    return result.appendOctave(start, result);
}
Array.prototype.toLetterNotes = function (root, bias) {
    var result = [];
    for (var i = 0; i < this.length; i++) {
        result.push(findLetter(convertToMelody(library[root], parseInt(this[i])), bias));
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
