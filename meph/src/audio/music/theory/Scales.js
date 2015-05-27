MEPH.define('MEPH.audio.music.theory.Scales', {
    alias: 'theory_scales',
    alternateNames: ['TheoryScales'],
    requires: ['MEPH.audio.music.theory.data.Voices'],
    scripts: ['MEPH.audio.music.theory.data.ChordData'],

    statics: {
        init: function () {
            var Scales = MEPH.audio.music.theory.Scales;
            if (Scales.completedScales) {
                return Scales.completedScales;
            }
            var voices = Scales.getVoices();
            var invertedVoices = Scales.invertVoices(voices);
            Scales.completedScales = Scales.complete(invertedVoices);
            return Scales.completedScales;
        },
        getScales: function () {
            var res = [];
            for (var i in TheoryScales.scales) {
                if (TheoryScales.scales.hasOwnProperty(i)) {
                    TheoryScales.scales[i].id = TheoryScales.scales[i].id || MEPH.GUID();
                    res.push(TheoryScales.scales[i])
                }
            }
            return res;
        },
        getNotesInScale: function (id, from, to) {
            var scale = TheoryScales.getScale(id);
            
            var re = [].interpolate(from, to, function (x) {
                var note = (x - from) % 12;
                var res = scale.base12.first(function (t) { return t === note; });
                if (res !== null) {
                    return x;
                }
                return -1;
            }).where(function (x) { return x !== -1; });
            return re;
        },
        getScale: function (id) {
            var scales = TheoryScales.getScales();
            return scales.first(function (x) { return x.id === id; });
        },
        getChordData: function () {
            var template = MEPH.getTemplate('MEPH.audio.music.theory.data.ChordData').template;
            return JSON.parse(template);
        },
        getVoices: function () {
            return MEPH.audio.music.theory.data.Voices.voiceList;
        },
        createScaleArray: function (scale, shift, mod) {
            var result = [];
            for (var i = 0  ; i < scale.length; i++) {
                result.push((scale[i] + shift) % mod);
            }
            return result;
        },
        getScaleById: function (id) {
            var Scales = MEPH.audio.music.theory.Scales
            bosslist = Scales.bossList();
            for (var i in bosslist) {
                var res = bosslist[i].first(function (x) { return x.id === id; });
                if (res) return res;
            }
            return null;
        },
        bossList: function () {
            var bosslist = {},
                scaleid = 0,
                Scales = MEPH.audio.music.theory.Scales,
                master_scale_list = Scales.scales;
            if (Scales.cachedBossList) {
                return Scales.cachedBossList;
            }
            for (var j in master_scale_list) {
                bosslist[j] = [];
                for (var i = 0 ; i < 12; i++) {
                    var newscale = Scales.createScaleArray(master_scale_list[j].base12, i, 12);
                    bosslist[j].push({
                        id: scaleid++,
                        name: j + " " + i,
                        root: (12 - i % 12) == 12 ? 0 : (12 - i % 12),
                        scale: newscale,
                        base12: master_scale_list[j].base12,
                        base7: master_scale_list[j].base7,
                        official: master_scale_list[j].name
                    });
                }
            }
            Scales.cachedBossList = bosslist;
            return bosslist;
        },
        invertVoices: function (voices) {
            var voiceswithinversions = [];
            for (var i = 0 ; i < voices.length; i++) {
                for (var j = 0 ; j < voices[i].voice.length; j++) {
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
        },
        complete: function (voiceswithinversions) {

            var Scales = MEPH.audio.music.theory.Scales,
                bosslist = Scales.bossList();
            for (var i in bosslist) {
                for (var j = 0 ; j < bosslist[i].length ; j++) {
                    for (var k = 0 ; k < voiceswithinversions.length ; k++) {
                        if (voiceswithinversions[k].voice.isVoiceInScale(bosslist[i][j].scale)) {
                            voiceswithinversions[k].scales.push(bosslist[i][j].id);
                        }
                    }
                }
            }
            return voiceswithinversions;
        },

        scales: {
            majorscale: {
                base12: "024579B".parseAndSlice(),
                base7: "1 2 3 4 5 6 7", name: "Major Scale"
            },
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
        }
    }
})