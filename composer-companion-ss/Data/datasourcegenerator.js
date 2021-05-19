import { master_voice_list } from './voices';

Array.prototype.parseInt = function (base) {
    var result = [];
    for (var i = 0; i < this.length; i++) {
        result.push(parseInt(this[i], base));
    }
    return result;
}
Array.prototype.chordInversion = function (shiftamount) {
    var result = [];
    for (var i = 0; i < this.length; i++) {
        result.push(this[i]);
    }
    for (var i = 0; i < shiftamount; i++) {
        var value = result.shift();
        result.push(value);
    }
    return result;

}
Array.prototype.chordNormalize = function (base) {
    var changeamount = this[0];
    var result = [];
    for (var i = 0; i < this.length; i++) {
        var _i = (this[i] - changeamount);
        if (_i < 0) {
            _i += base;
        }
        while (result[result.length - 1] > _i) {
            _i += base;
        }
        result.push(_i);
    }

    return result;
}
Array.prototype.isVoiceInScale = function (array) {
    for (var i = 0; i < this.length; i++) {
        if (array.indexOf(parseInt(this[i]) % 12) == -1) {
            return false;
        }
    }
    return true;
}
Array.prototype.convertToVVoice = function () {
    var result = "V";
    for (var i = 0; i < this.length; i++) {
        result += this[i].toString(12);
    }
    return result.toUpperCase();
}
if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function (searchElement /*, fromIndex */) {
        "use strict";
        if (this == null) {
            throw new TypeError();
        }
        var t = Object(this);
        var len = t.length >>> 0;
        if (len === 0) {
            return -1;
        }
        var n = 0;
        if (arguments.length > 1) {
            n = Number(arguments[1]);
            if (n != n) { // shortcut for verifying if it's NaN
                n = 0;
            } else if (n != 0 && n != Infinity && n != -Infinity) {
                n = (n > 0 || -1) * Math.floor(Math.abs(n));
            }
        }
        if (n >= len) {
            return -1;
        }
        var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);
        for (; k < len; k++) {
            if (k in t && t[k] === searchElement) {
                return k;
            }
        }
        return -1;
    }
}

String.prototype.splice = function (
    index,
    howManyToDelete,
    stringToInsert /* [, ... N-1, N] */
) {
    var characterArray = this.split("");
    Array.prototype.splice.apply(
        characterArray,
        arguments
    );
    return (
        characterArray.join("")
    );

};

String.prototype.parseAndSlice = function () {
    return this.split("").parseInt(12);
}
String.prototype.parseAndSliceDouble = function () {
    var spit = this.trim().split("");
    spit.shift();
    var result = [];
    for (var i = 0; i < spit.length; i = i + 2) {
        result.push((spit[i] + "" + spit[i + 1]));
    }
    return result;
}
String.prototype.nth = function (j) {
    if (j == 1) {
        return "1st";
    }
    if (j == 2)
        return "2nd";
    if (j == 3)
        return "3rd";
    if (j == 0)
        return "";
    return j + "th";
}
var createScaleArray = function (scale, shift, mod) {
    var result = [];
    for (var i = 0; i < scale.length; i++) {
        result.push((scale[i] + shift) % mod);
    }
    return result;
}
var parseXml = function (e, s, d) {
    //var rows = $(e.responseText).find("Data");
    //for (var i = 0 ; i < rows.length; i++) {
    //    var data = rows[i].innerHTML.split(";");
    //    var d = data[0].parseAndSlice();
    //    d.shift();
    //    voices.push({ name: jQuery.trim(data[1]), voice: d });
    //}
    //voices = (master_voice_list);
    var voices = invertVoices(master_voice_list);
    complete(voices);
    return voices;
}
var parseXmlDelimeted = function (e, s, d) {
    var rows = e.responseText.split("\r\n");
    for (var i = 0; i < rows.length; i++) {
        var data = rows[i].split(";");
        if (data.length == 1) continue;
        var d = data[1].parseAndSliceDouble();
        voices.push({ name: jQuery.trim(data[0]), voice: d });
    }
    // voices = (master_voice_list);
    //var voices = invertVoices(master_voice_list);
    // complete(voices);
    var stringed = JSON.stringify(voices);
    return voices;
}
$.ajax({
    type: "GET",
    url: "Data/TextFile2.txt",
    dataType: "string",
    success: parseXmlDelimeted,
    error: parseXmlDelimeted
});
var master_scale_list = {
    majorscale: { base12: "024579B".parseAndSlice(), base7: "1 2 3 4 5 6 7", name: "Major Scale" },
    melodicminorscale: { base12: "023579B".parseAndSlice(), base7: "1 2 -3 4 5 6 7", name: "Melodic Minor" },
    harmonicminor: { base12: "023578B".parseAndSlice(), base7: "1 2 -3 4 5 -6 7", name: "Harmonic Minor" },
    harmonicmajor: { base12: "024578B".parseAndSlice(), base7: "1 2 3 4 5 -6 7", name: "Harmonic Major" },
    lois: { base12: "0236789".parseAndSlice(), base7: "1 2 -3 +4 5 -6 --7", name: "Lois" },
    spanishgypsy: { base12: "014579B".parseAndSlice(), base7: "1 -2 3 4 5 6 7", name: "Spanish Gypsy" },
    byzantine: { base12: "014578B".parseAndSlice(), base7: "1 -2 3 4 5 -6 7", name: "Byzantine" },
    hungarianmajor: { base12: "034679A".parseAndSlice(), base7: "1 +2 3 +4 5 6 -7", name: "Hungarian Major" },
    melaratrangi: { base12: "012578A".parseAndSlice(), base7: "1 -2 --3 4 5 -6 -7", name: "Mela Ratrangi" },
    melaganamurti: { base12: "012578B".parseAndSlice(), base7: "1 -2 --3 4 5 -6 7", name: "Mela Ganamurti" },
    melavanaspati: { base12: "012579A".parseAndSlice(), base7: "1 -2 --3 4 5 6 -7", name: "Mela Vanaspati" },
    melayagapraya: { base12: "0345789".parseAndSlice(), base7: "1 +2 3 4 5 -6 --7", name: "Mela Yagapraya" },
    melaragavardhani: { base12: "034578A".parseAndSlice(), base7: "1 +2 3 4 5 -6 -7", name: "Mela Ragavardhani" },
    melagangeyabhusani: { base12: "034578B".parseAndSlice(), base7: "1 +2 3 4 5 -6 7", name: "Mela Gangeyabhusani" },
    melavagedhisvari: { base12: "034579A".parseAndSlice(), base7: "1 +2 3 4 5 6 -7", name: "Mela Vagedhisvari" },
    melasulini: { base12: "034579B".parseAndSlice(), base7: "1 +2 3 4 5 6 7", name: "Mela Sulini" },
    melachalenata: { base12: "03457AB".parseAndSlice(), base7: "1 +2 3 4 5 +6 7", name: "Mela Chalenata" },
    melasucharitra: { base12: "0346789".parseAndSlice(), base7: "1 +2 3 +4 5 -6 --7", name: "Mela Sucharitra" },
    melajyotisvarupini: { base12: "034678A".parseAndSlice(), base7: "1 +2 3 +4 5 -6 -7", name: "Mela Jyotisvarupini" },
    meladhatuvardhani: { base12: "034678B".parseAndSlice(), base7: "1 +2 3 +4 5 -6 7", name: "Mela Dhatuvardhani" },
    melakanakangi: { base12: "0125789".parseAndSlice(), base7: "1 -2 --3 4 5 -6 --7", name: "Mela Kanakangi" },
    leadingwholetone: { base12: "02468AB".parseAndSlice(), base7: "1 2 3 +4 +5 +6 7", name: "Leading Whole Tone" },
    melamanavati: { base12: "0245789".parseAndSlice(), base7: "1 2 3 4 5 -6 --7", name: "Mela Manavati" },
    blues: { base12: "034567A".parseAndSlice(), base7: "1 -3 3 4 +4 5 -7", name: "Blues" },
    dimmhed7note: { base12: "023569B".parseAndSlice(), base7: "1 2 -3 4 -5 6 7", name: "Dimhed 7 Note" },
    majorpentatonic: { base12: "02479".parseAndSlice(), base7: "1 2 3 5 6", name: "Major Pentatonic Scale" },
    hemitonicpentatonic: { base12: "0459B".parseAndSlice(), base7: "1 3 4 6 7", name: "Hemitonic pentatonic scale" },
    donminant8note: { base12: "0134679A".parseAndSlice(), base7: "1 -2 -3 3 +4 5 6 -7", name: "Dominant 8 note scale" },
    diminished8note: { base12: "0235689B".parseAndSlice(), base7: "1 2 -3 4 +4 +5 6 7", name: "Diminished 8 note scale" },
    wholescale: { base12: "02468A".parseAndSlice(), base7: "1 2 3 +4 +5 +6", name: "Whole scale" },
    majorbebop: { base12: "0245789B".parseAndSlice(), base7: "1 2 3 4 5 +5 6 7", name: "Major bebop scale " },
    dominantbebop: { base12: "024579AB".parseAndSlice(), base7: "1 2 3 4 5 6  -7 7", name: "Dominant bebop scale " },
    augmented: { base12: "03478B".parseAndSlice(), base7: "1 2 3 +4 +5 +6", name: "Augmented scale " },
    prometheus: { base12: "02469A".parseAndSlice(), name: "Prometheus scale", base7: "1 2 3 +4 6 -7" },
    tritone: { base12: "01467A".parseAndSlice(), name: "Tritone scale", base7: "1 -2 3 -5 5 -7" },
    twosemitritone: { base12: "012678".parseAndSlice(), name: "two-semitone tritone scale ", base7: "1 -2 2 +4 5 -6" }
};
var bosslist = {

};
var scaleid = 0;
for (var j in master_scale_list) {
    bosslist[j] = [];
    for (var i = 0; i < 12; i++) {
        var newscale = createScaleArray(master_scale_list[j].base12, i, 12);
        bosslist[j].push({
            id: scaleid++,
            name: j + " " + i, root: (12 - i % 12) == 12 ? 0 : (12 - i % 12),
            scale: newscale,
            base12: master_scale_list[j].base12,
            base7: master_scale_list[j].base7,
            official: master_scale_list[j].name
        });
        //bosslist.melodicminorscale.push({ id: scaleid++, name: "melodicminor " + i, root: i, scale: melscale });
        //bosslist.melodicminorscale.push(melscale);
    }

}

var voices = [];
//voices.push({ name: "m(9)", voice: "0237".parseAndSlice() });
//voices.push({ name: "m9", voice: "0237A".parseAndSlice() });
//voices.push({ name: "s2", voice: "027".parseAndSlice() });


var voiceswithinversions = [];
var invertVoices = function (voices) {
    var voiceswithinversions = [];
    for (var i = 0; i < voices.length; i++) {
        for (var j = 0; j < voices[i].voice.length; j++) {
            var inversionversion = voices[i].voice.chordInversion(j);
            inversionversion = inversionversion.parseInt(12)
            var iv = inversionversion.chordNormalize(12);
            voiceswithinversions.push({
                _familyname: voices[i].name,
                scales: [],
                name: voices[i].name,
                inversion: j,
                voice: iv,
                isInversion: j != 0
            });
        }
    }
    return voiceswithinversions
}
 function InvertVoice(voice, inv) {

    var inversionversion = voice.chordInversion(inv);
    inversionversion = inversionversion.parseInt(12)
    var iv = inversionversion.chordNormalize(12);
    return iv;
}
var complete = function (voiceswithinversions) {
    for (var i in bosslist) {
        for (var j = 0; j < bosslist[i].length; j++) {
            for (var k = 0; k < voiceswithinversions.length; k++) {
                if (voiceswithinversions[k].voice.isVoiceInScale(bosslist[i][j].scale)) {
                    voiceswithinversions[k].scales.push(bosslist[i][j].id);
                }
            }
        }
    }
}



var riff_library = {
    Funk: {
        GiveItUpOrTurnItLose: {
            name: "Give It up or Turn it lose(guitar part)",
            data: [[{ note: 60, value: 8 }],
            [{ note: 60, value: 8 }],
            [{ note: 60, value: 8 }],
            [{ note: 60, value: 8, rest: true }],

            [{ note: 60, value: 8 }],
            [{ note: 60, value: 8 }],
            [{ note: 60, value: 8, rest: true }],
            [{ note: 60, value: 8 }],

            [{ note: 62, value: 8, rest: true }],
            [{ note: 62, value: 8 }],
            [{ note: 62, value: 8, rest: true }],
            [{ note: 62, value: 8 }],

            [{ note: 60, value: 8, rest: true }],
            [{ note: 71, value: 8 }, { note: 74, value: 8 }],
            [{ note: 71, value: 4 }, { note: 74, value: 4 }],

            [{ note: 60, value: 8 }],
            [{ note: 60, value: 8 }],
            [{ note: 60, value: 8 }],
            [{ note: 60, value: 8, rest: true }],

            [{ note: 60, value: 8 }],
            [{ note: 60, value: 8 }],
            [{ note: 60, value: 8, rest: true }],
            [{ note: 60, value: 8 }],

            [{ note: 62, value: 8, rest: true }],
            [{ note: 62, value: 8 }],
            [{ note: 62, value: 8, rest: true }],
            [{ note: 62, value: 8 }],

            [{ note: 62, value: 8, rest: true }],
            [{ note: 65, value: 8 }],
            [{ note: 62, value: 8 }],
            [{ note: 62, value: 8, rest: true }]]
        }
    }
};