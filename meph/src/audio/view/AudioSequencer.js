/**
 * @class MEPH.audio.view.AudioSequencer
 * @extends MEPH.table.Sequencer
 * Standard form for a input field.
 **/
MEPH.define('MEPH.audio.view.AudioSequencer', {
    alias: 'audiosequencer',
    templates: true,
    scripts: ['MEPH.audio.view.sequencer.CanvasContextMenu',
        'MEPH.audio.view.sequencer.SequencerResourcesSelect',
        'MEPH.audio.view.sequencer.CanvasHeaderLeftMenu'],
    extend: 'MEPH.table.Sequencer',
    requires: ['MEPH.audio.Audio',
        'MEPH.audio.music.theory.Notes',
        'MEPH.audio.AudioResources',
        'MEPH.input.Text',
        'MEPH.audio.view.AudioSignalVisualizer',
        'MEPH.audio.Sequence',
        'MEPH.util.FileReader',
        'MEPH.audio.graph.AudioGraph',
        'MEPH.input.Checkbox',
        'MEPH.input.Range',
        'MEPH.util.Dom',
        'MEPH.input.Number',
        'MEPH.input.Dropdown',
        'MEPH.file.Dropbox',
        'MEPH.audio.Constants',
        'MEPH.audio.music.theory.Scales',
        'MEPH.util.Observable'],
    statics: {
        TrackResource: 'TrackResource',
        ContextMenu: 'ContextMenu',
        Play: 'Play'
    },
    injections: ['audioResources',
        'fileSaver',
        'recorder',
        'scheduler'],
    properties: {
        firstMidiNote: null,
        lastMidiNote: null,
        selectedSoundFontValue: null,
        defaultColumnWidth: 25,
        nearest: 32,
        singleUnit: 1,
        sequence: null,
        animatemode: true,
        currentSoundFontSelection: null,
        smallestnote: 16,
        scalevalue: 1,
        selectedSoundFont: null,
        fontlistsource: null,
        defaultBpm: 75,
        beatspermin: null,
        selectedSoundFontChunks: null,
        resources: null,
        scales: null,
        triadExtensions: null,
        availableShortCutKeys: null,
        selectedShortCutKey: null,
        chordShortCuts: null,
        selectedTriadExtensionType: null,
        triadTypes: null,
        timeLength: null,
        whistleBuffer: null,
        currentChord: null
    },
    initialize: function () {
        var me = this;
        me.setupFunctions();
        me.setupKeyCommands();
        Object.defineProperty(me, 'bpm', {
            get: function () {
                var bpm = me.beatspermin;
                return (1 / (bpm / 60)) * (1 / me.smallestnote)
                //return 60 / me.smallestnote / me.beatspermin;
            }
        })
        me.great();
        if (!me.sequence) {
            me.sequence = new MEPH.audio.Sequence();
        }
        me.on('altered', function (type, args) {
            if (args.property === 'sequence') {
                me.translateToSource(me.sequence);
            }
            if (args.property === 'beatspermin') {
                me.updateBeat();
            }
            if (args.property === 'commands' || args.property === 'chordShortCuts') {
                me.updateAvailableShortCutKeys();
            }
        });
        me.setupHeaders();


        MEPH.subscribe(MEPH.audio.Constants.RECORDING_COMPLETE, function (type, result) {
            var name = prompt("Save As : ", "");
            MEPH.publish(MEPH.Constants.REQUEST_BLOB_SAVE, result, name + '.wav')
        });

        MEPH.subscribe('removekey', function (type, key) {
            me.commands.removeWhere(function (x) {
                return x.key === key;
            });
            me.chordShortCuts.removeWhere(function (x) {
                return x.key === key;
            })
        });

        MEPH.subscribe(MEPH.audio.Constants.VIEW_RESOURCE, function (type, resource, resourceType) {
            if (me.$inj.audioResources) {
                var resource = me.$inj.audioResources.getResourceById(resource);
                switch (resource.type) {
                    case 'soundfont':
                        me.showSoundFont(resource);
                        break;
                    default:
                        if (resource.nodes) {
                            var sequence = me.addTrackSequence(resource.name);
                            sequence.setDefault('graph', resource.id)
                        }
                        break;
                }
            }
            // me.showResource(resource);
        })
    },
    onLoaded: function () {
        var me = this;
        me.great();
        me.beatspermin = me.defaultBpm;
        me.firstMidiNote = 0;
        me.lastMidiNote = 192;
        me.resources = MEPH.util.Observable.observable([]);
        me.fontlistsource = MEPH.util.Observable.observable([]);
        me.currentSoundFontSelection = MEPH.util.Observable.observable([]);
        me.scales = [{ id: null, name: 'none' }].concat(TheoryScales.getScales());

        me.setupHeaders();
        me.sequence.title = me.sequence.title || 'untitled';
        me.fire('altered', { path: 'sequence' });
        document.body.appendChild(me.soundfontlistholder);
        document.body.appendChild(me.audiographholder);
        document.body.appendChild(me.resourceloader);
        document.body.appendChild(me.shortcutconfigpanel)

        me.hideSoundFontList();
        me.hideParts(me.audiographholder, me.hideGraph.bind(me));
        me.hideParts(me.whistlinlistenin, me.hideWhistlin.bind(me));
        me.hideParts(me.soundfontlistholder, me.hideSoundFontList.bind(me));
        me.hideParts(me.resourceloader, me.hideResource.bind(me));
        me.hideParts(me.shortcutconfigpanel, me.hideShortCutConfigPanel.bind(me));
        me.triadTypes = [{ name: '', text: "", triad: [] },
                { name: 'Major', text: "major", triad: ["0", "4", "7"] },
                { name: 'Minor', text: "minor", triad: ["0", "3", "7"] },
                { name: 'Dim', text: "dim", triad: ["0", "3", "6"] },
                { name: 'Aug', text: "aug", triad: ["0", "4", "8"] },
                { name: 'Sus4', text: "sus4", triad: ["0", "5", "7"] },
                { name: 'Sus2', text: "sus2", triad: ["0", "2", "7"] },
                { name: 'Flat2nd', text: "flat2nd", triad: ["0", "1", "7"] },
                { name: 'Sharp4th', text: "sharp4th", triad: ["0", "6", "7"] }];

        me.triadExtensions = [{ text: "", ext: [] },
                        { text: "Maj 7th", ext: ["b"] },
                        { text: "Dom 7th", ext: ["a"] },
                        { text: "Maj 9th", ext: ["b", "12"] },
                        { text: "Dom 9th", ext: ["a", "12"] },
                        { text: "Maj 11th", ext: ["b", "12", "15"] },
                        { text: "Dom 11th", ext: ["a", "12", "15"] }];

        me.chordShortCuts = MEPH.util.Observable.observable([]);
        me.chordShortCuts.on('changed', function () {
            me.updateAvailableShortCutKeys();
        })
        me.updateAvailableShortCutKeys();
    },
    hideWhistlin: function () {
        var me = this;
        Style.hide(me.whistlinlistenin);
    },
    showShortCuts: function () {
        var me = this;
        Style.show(me.chordshortcuts);
    },
    hideShortCuts: function () {
        var me = this;
        Style.hide(me.chordshortcuts);
    },
    showWhistlin: function () {
        var me = this;
        Style.show(me.whistlinlistenin);
    },
    updateAvailableShortCutKeys: function () {
        var me = this,
            keys = 'abcdefghijklmnopqrstuvwxyz,./;[]'.split('');
        keys = keys.where(function (x) {
            var res = me.commands.first(function (t) {
                return t.key === x;
            });
            return res === null;
        }).select(function (x) {
            return {
                text: x
            }
        });

        me.availableShortCutKeys = keys;
    },
    hideParts: function (part, hidefunc) {
        var me = this;
        me.don('click', document.body, function (evt) {
            if (!MEPH.util.Dom.isDomDescendant(evt.srcElement, part) &&
                !evt.srcElement.classList.contains('form-control')) {
                hidefunc();
            }
        });
        hidefunc();
    },
    createAudioGraph: function () {
        var me = this;
        return me.renderControl('MEPH.audio.graph.AudioGraph', me.audiographholder, me)
    },
    loadResources: function () {

        var me = this;
        return MEPH.util.FileReader.readFileList(MEPH.Array(arguments).last().domEvent.files, { readas: 'ArrayBuffer' })
            .then(function (fileResults) {
                if (me.$inj && me.$inj.audioResources) {
                    me.$inj.audioResources.addResources(fileResults).then(function () {
                        me.updateResources();
                    })
                }
            })
    },
    updateResources: function () {
        var me = this;
        if (me.$updateTimeout) {
            clearTimeout(me.$updateTimeout);
        }
        me.$updateTimeout = setTimeout(function () {
            var resources = me.$inj.audioResources.getResources();
            me.resources = resources.select(function (t) {
                if (t.resource && t.resource.file) {
                    return ({
                        name: t.resource.file.name,
                        id: t.id,
                        type: 'font'
                    });
                }
                else if (t.name) {
                    return ({
                        name: t.name,
                        id: t.id,
                        type: 'graph'
                    });
                }
            })
        }, 1000)
    },
    viewResource: function (resource, type) {
        var me = this;
        MEPH.publish(MEPH.audio.Constants.VIEW_RESOURCE, resource, type)
    },
    openResources: function () {
        var me = this;
        me.showResource();
    },
    showResource: function () {
        var me = this;
        Style.show(me.resourceloader);
        me.$resourcehidden = false;
        me.updateResources();
    },
    hideResource: function () {
        var me = this;
        if (me.$resourcehidden) { return; }
        Style.hide(me.resourceloader);
        me.$resourcehidden = true;
    },
    showShortCutConfigPanel: function () {
        var me = this;
        Style.show(me.shortcutconfigpanel);
        me.$shotcutConfigPanelHidden = false;
    },
    hideShortCutConfigPanel: function () {
        var me = this;
        if (me.$shotcutConfigPanelHidden) { return; }
        Style.hide(me.shortcutconfigpanel);
        me.$shotcutConfigPanelHidden = true;
    },
    hideSoundFontList: function () {
        var me = this;
        if (me.$fontlisthidden) { return; }
        Style.hide(me.soundfontlistholder);
        me.$fontlisthidden = true;
    },
    showSoundFontList: function () {
        var me = this;
        Style.show(me.soundfontlistholder);
        me.$fontlisthidden = false;
    },
    showSoundFont: function (info) {
        var me = this,
            soundFontInstrument = info.soundfontInstrument;
        me.hideAll();
        var chunks = soundFontInstrument.sampleChunks();
        me.selectedSoundFontId = info.id;
        me.selectedSoundFont = soundFontInstrument.$soundfontfile;
        me.selectedSoundFontChunks = chunks.select(function (x) {
            return ({
                name: x.name,
                id: x.id,
                sid: info.id
            });
        });
        me.showSoundFontList();
    },
    selectSoundFontNotes: function () {
        var me = this,
            scale, selection;

        scale = me.selectedScale;
        me.currentSoundFontSelection.clear();

        if (scale === 'none' || !scale) {
            selection = [].interpolate(parseInt(me.firstMidiNote), parseInt(me.lastMidiNote) + 1, function (x) {
                return x;
            });
        }
        else {
            selection = TheoryScales.getNotesInScale(scale, parseInt(me.firstMidiNote), parseInt(me.lastMidiNote) + 1);
        }
        selection = selection.select(function (x) {
            return {
                name: Notes.convertToNote(x),
                id: x,
                midi: x,
                selected: true,
                sid: me.selectedSoundFontId
            }
        })
        selection.foreach(function (t) {
            me.currentSoundFontSelection.push(t);
        })
    },
    toNote: function (d) {

        var note = Notes.convertToNote(d)
        return note;
    },
    addToSelection: function (chunkid) {
        var me = this;
        var info = me.selectedSoundFontChunks.first(function (x) { return x.id.toString() === chunkid; })
        if (info) {
            me.currentSoundFontSelection.push(info);
        }
    },
    addAllChunks: function () {
        var me = this;
        me.currentSoundFontSelection.clear();
        me.selectedSoundFontChunks.foreach(function (x) {
            x.selected = true;
            me.currentSoundFontSelection.push(x);
        });
    },
    addToSequence: function () {
        var me = this;
        me.currentSoundFontSelection.where(function (x) {
            return x.selected;
        }).foreach(function (x) {

            var sequence = me.addTrackSequence(x.name);
            sequence.setDefaultSoundFont({
                sid: x.sid,
                id: x.id
            });
            if (x.midi) {
                sequence.midiNote(x.midi);
            }
        });
        me.currentSoundFontSelection.clear();
    },
    hideAll: function () {
        var me = this;
        me.hideGraph();
        me.hideSoundFontList();
        me.hideResource();
    },
    hideGraph: function () {
        var me = this;
        if (me.$graphhidden) { return; }
        Style.hide(me.audiographholder);
        if (me.editedSequence) {
            me.editedSequence.saveGraph(me.audiographinstance.saveGraph());
            me.editedSequence = null;
        }
        me.$graphhidden = true;
    },
    showGraph: function () {
        var me = this;
        me.$graphhidden = false;
        Style.show(me.audiographholder);
    },
    showGraphForSequence: function () {
        var me = this,
            hovercells = MEPH.clone(me.hovercells),
            lane = hovercells.first().row;

        var seq = me.sequence.items()[lane];
        if (seq) {
            return Promise.resolve().then(function () {
                return me.audiographinstance || me.createAudioGraph();
            }).then(function (t) {
                if (!me.audiographinstance) {
                    var res = t.first();
                    me.audiographinstance = res.classInstance;
                }
            }).then(function () {
                me.showGraph();
            }).then(function () {
                me.editedSequence = seq.source;
                return me.audiographinstance.loadGraph(JSON.stringify(seq.source.getGraph()));
            }).then(function () {
                me.audiographinstance.resize();
            });;
        }
    },
    updateBeat: function () {
        var me = this;
        if (me.$inj && me.$inj.scheduler) {
            me.$inj.scheduler.bpm = me.bpm;
        }
    },
    onInjectionsComplete: function () {
        var me = this;
        me.updateBeat();
    },
    addShortcut: function () {
        var me = this,
            data = {
                triad: me.selectedTriadType,
                triadExt: me.selectedTriadExtensionType,
                key: me.selectedShortCutKey
            };
        if (me.selectedShortCutKey) {
            me.setCommand(data.key, data.key + ' : shortcut set current chord', me.setCurrentChord.bind(me, data));
            me.chordShortCuts.push(data);
            me.selectedShortCutKey = null;
            me.selectedTriadExtensionType = null;
            me.selectedTriadType = null;
        }
    },
    setCurrentChord: function (data) {
        var me = this;
        me.currentChord = data;
    },
    removeShortCut: function (key) {
        MEPH.publish('removekey', key);
    },
    /**
     * Save sequence.
     **/
    saveSequence: function () {
        var me = this;
        if (me.$inj && me.$inj.audioResources) {
            me.$inj.audioResources.addSequence(me.sequence);
        }
    },
    loadGrandPiano: function () {
        var me = this;
        //if (!me.pianoloaded) {
        me.pianoloaded = true;
        return MEPH.requires('MEPH.audio.music.instrument.piano.GrandPiano').then(function (piano) {

            var grandpiano = new MEPH.audio.music.instrument.piano.GrandPiano();
            return grandpiano.ready().then(function () {
                var sequence = grandpiano.createSequence();
                if (me.$inj && me.$inj.audioResources) {
                    me.$inj.audioResources.addSequence(sequence);
                    me.openSequence(sequence.id);
                }
            })
        })
        //   }
    },
    /**
     * New sequence.
     **/
    newSequence: function () {
        var me = this;
        me.sequence = new MEPH.audio.Sequence();
        me.update();
    },
    /**
     * Opens a sequence
     * @param {String} id
     **/
    openSequence: function (id) {
        var me = this;
        if (me.$inj && me.$inj.audioResources) {
            me.sequence = me.$inj.audioResources.getSequenceInstance(id) || me.sequence;

        }
    },
    setupHeaders: function () {
        var me = this, columns = 2000, rows = 88;
        me.leftheadersource = [].interpolate(0, rows, function (x) {
            return MEPH.util.Observable.observable({
                lane: x,
                time: x,
                length: 1
            });
        });
        me.topheadersource = [].interpolate(0, columns, function (x) {
            return MEPH.Observable.observable({
                lane: 0,
                time: x,
                length: 1
            });
        });
        me.rowheaders = 1;
        me.columnheaders = 1;
        me.columns = columns;
        me.rows = rows;
    },
    setupKeyCommands: function () {
        var me = this;
        me.setContextMenuOpenKey('v');
        me.setTrackResourceOpenKey('t');
        me.setDurationKeys()
        me.setRemoveKey('x');
        me.setSequenceGraphMod('m');
        me.setPlayButton('p');
        me.setClearCurrentChord('q');
        me.updateAvailableShortCutKeys();
    },
    translateToSource: function (sequence) {
        var me = this;
        if (!me.source) {
            me.source = sequence.itemSequences();
        }
        else {
            me.source.clear();
            me.source.push.apply(me.source, sequence.itemSequences());
        }
    },
    setupFunctions: function () {
        var me = this;
        me.time = {
            'function': function (item, offset) {
                if (item && (item.source instanceof MEPH.audio.Audio || item.source instanceof MEPH.audio.Sequence) || typeof item.source === 'string') {
                    return me.scaleValue(item.relativeTimeOffset);
                }
                if (offset === 'left') {
                    return 0;
                }
                return item.time;
            }
        }

        me.lane = {
            'function': function (item, offset) {
                if (item && (item.source instanceof MEPH.audio.Audio || item.source instanceof MEPH.audio.Sequence || typeof item.source === 'string'))
                    return me.sequence.getParentIndexOf(item);

                return item.lane;

            }
        }

        me.settime = {
            'function': function (time, item) {
                if (item && (item.source instanceof MEPH.audio.Audio || item.source instanceof MEPH.audio.Sequence || typeof item.source === 'string')) {
                    time = Math.round(time * me.nearest) / me.nearest;
                    time = me.scaleValue(time)
                    me.sequence.setRelativeTime(item, time);
                    me.update();
                }
                return item;

            }
        }
        me.color = {
            'function': function (item) {
                var result = '#ff0000';
                if (item && (item.source instanceof MEPH.audio.Audio || item.source instanceof MEPH.audio.Sequence)) {
                    var duration = me.sequence.getDuration(item)
                    result = me.getColorForDuration(duration);
                }
                else if (item && typeof item.source === 'string') {
                    if (item.duration === null) {
                        var audio = item.getAudio();
                        var res;
                        if (audio.getSourceDuration)
                            res = audio.getSourceDuration();
                        if (res) {
                            try {
                                res = res * (parseFloat(me.beatspermin) / 60) * me.smallestnote;
                            } catch (e) { res = 0; }
                        }
                        return me.getColorForDuration(me.singleUnit);
                    }
                    result = me.getColorForDuration(item.duration);
                }
                return result;
            }
        }
        me.length = {
            'function': function (item) {
                var result;
                if (item && (item.source instanceof MEPH.audio.Audio || item.source instanceof MEPH.audio.Sequence)) {
                    var duration = me.sequence.getDuration(item)


                    result = duration;
                }
                else if (item && typeof item.source === 'string') {
                    if (item.duration === null) {
                        var audio = item.getAudio();
                        var res;
                        if (audio.getSourceDuration)
                            res = audio.getSourceDuration();
                        if (res) {
                            try {
                                res = res * (parseFloat(me.beatspermin) / 60) * me.smallestnote;
                            } catch (e) { res = 0; }
                        }
                        return me.singleUnit;//res || 
                    }
                    result = item.duration;
                }
                return me.scaleValue(result);
            }
        }
        me['delete'] = {
            'function': function (items) {

                if (items) {
                    items.foreach(function (item) {
                        var parent = me.sequence.getParent(item);
                        if (parent) {
                            parent.source.remove(item);
                        }
                    });
                    me.translateToSource(me.sequence);
                    me.update();
                }
            }
        }
        me.rowheader = {
            'function': function (item) {

                var seq = me.sequence.items()[item.lane];
                return seq && seq.source ? (seq.source.title || '') : '';
            }
        }
        me.columnheader = {
            'function': function (item) {
                return item.time % me.smallestnote === 0 ? (item.time / me.smallestnote) + " " : null;
            }
        }
    },
    getColorForDuration: function (duration) {
        duration = parseFloat(duration);
        if (isNaN(duration)) {
            duration = 0;
        }
        if (duration >= 32) {
            return '#dabfff';
        }
        else if (duration >= 16) {
            return '#907ad6';
        }
        else if (duration >= 8) {
            return '#4f518c';
        }
        else if (duration >= 4) {
            return '#2c2a4a';
        }
        else if (duration >= 2) {
            return '#7fdeff';
        }
        else if (duration >= 1) {
            return '#204442';
        }
        else if (duration >= -1) {
            return '#7956f';
        }
    },
    scaleValue: function (value) {
        var me = this;
        return parseFloat(me.scalevalue) * value;
    },
    unscaleValue: function (value) {
        var me = this;
        return value / parseFloat(me.scalevalue);
    },
    openContextMenu: function (evt) {
        var me = this,
            form;

        var hovercells = me.hovercells;
        if (evt.currentTarget === me.leftheader) {
            var el = me.getTemplateEl('MEPH.audio.view.sequencer.CanvasHeaderLeftMenu');
            var select = el.querySelector('input');
            select.focus();
            var value;
            Dom.addSimpleDataEntryToElments(me, [{
                element: select,
                setFunc: function (val) {
                    value = val;
                }
            }], el, function () {
                if (value)
                    me.addTrackSequence(value)
            });
            Dom.centerElement(el);
        }
        else {
            me.addSequence(hovercells.first());

            //var el = me.getTemplateEl('MEPH.audio.view.sequencer.CanvasContextMenu');
            //me.$canvasContextMenuEl = el;
            //el.querySelector('[addsequence]').focus();
            //var elements = MEPH.Array(el.querySelectorAll('[addsequence]')).select(function (t) { return { setFunc: function () { }, element: t } });
            //Dom.addSimpleDataEntryToElments(me, elements, el);
            //me.don('click', elements.select(function (t) { return t.element; }), function () {
            //    me.addSequence(hovercells.first());
            //    me.canvas.focus();
            //}, 'button');
        }
    },
    onInjectionsComplete: function () {
        var me = this;
        if (me.$inj.audioResources) {
            MEPH.subscribe(MEPH.audio.AudioResources.RESOURCE_MANAGER_UPDATE, function () {
                me.updateResources();
            });

        }

    },
    openSavedSequence: function () {
        var me = this;
        return new Promise(function (resolve) {
            if (me.$inj.audioResources) {
                var el = me.getTemplateEl('MEPH.audio.view.sequencer.SequencerResourcesSelect');
                var select = el.querySelector('select');
                select.focus();
                var value;
                var sequences = me.$inj.audioResources.getSequences();


                var selectOptions = sequences.select(function (x, index) {
                    return {
                        title: x.title,
                        value: x.id
                    }
                });

                selectOptions.foreach(function (t) {
                    Dom.addOption(t.title, t.value, select);
                });

                Dom.addSimpleDataEntryToElments(me, [{
                    element: select,
                    setFunc: function (val) {
                        value = val;
                    }
                }], el, function () {
                    var val = sequences.first(function (x) { return x.id === value; })
                    if (val)
                        me.openSequence(val.id);
                    resolve();
                });
            }
        })
    },
    selectTrackResource: function (evt) {
        var me = this;
        var hovercells = MEPH.clone(me.hovercells);
        if (me.$inj.audioResources && hovercells) {
            var el = me.getTemplateEl('MEPH.audio.view.sequencer.SequencerResourcesSelect');
            var select = el.querySelector('select');
            select.focus();
            var value;
            var graphs = me.$inj.audioResources.getGraphs();
            var sequences = me.$inj.audioResources.getSequences();


            var selectOptions = graphs.select(function (x, index) {
                return {
                    title: x.name,
                    value: x.id
                }
            });

            sequences.foreach(function (x) {
                selectOptions.push({
                    title: x.title,
                    value: x.id
                });
            });

            selectOptions.foreach(function (t) {
                Dom.addOption(t.title, t.value, select);
            });

            Dom.addSimpleDataEntryToElments(me, [{
                element: select,
                setFunc: function (val) {
                    value = val;
                }
            }], el, function () {
                var val = graphs.first(function (x) { return x.id === value; }) ||
                    sequences.first(function (x) { return x.id === value; })
                me.setTrackResource(hovercells.first().row, val)
            });
        }
    },
    /**
     * Sets the resources which the track will use, and will 
     * set the sources of the sequences.
     ***/
    setTrackResource: function (lane, graph) {
        var me = this, sequence = me.sequence.items()[lane];
        if (sequence) {
            sequence.source.setDefault(graph instanceof MEPH.audio.Sequence ? 'sequence' : 'graph', graph.id)
        }
    },
    /**
     * Set the resources source for each sequence in the row.
     * @param {Object/String} val
     * @param {Object} hovercells
     **/
    addTrackSequence: function (title) {
        var me = this,
            sequence = new MEPH.audio.Sequence({ title: title });
        me.sequence.add(sequence);
        me.update();
        return sequence;
    },
    getCurrentChord: function () {
        var me = this, triad;
        if (me.currentChord) {
            var triad = me.triadTypes.first(function (x) {
                return x.text === me.currentChord.triad;
            });
            var triadExt = me.triadExtensions.first(function (x) {
                return x.text === me.currentChord.triadExt;
            })
            if (triad && triadExt) {
                return triad.triad.concat(triadExt.ext);
            }
            else if (triad) {
                return triad.triad.select();
            }
            else if (triadExt) {
                return triadExt.ext.select();
            }
        }
        return null;
    },
    /**
     * Adds a sequence/audio source to the row at the cell.
     **/
    addSequence: function (location) {
        var me = this,
            sequence,
            row = location.row,
            column = location.column;
        sequence = me.getSequenceItem(row);
        if (sequence) {
            var currentChord = me.getCurrentChord();
            var midiNote = sequence.source.midiNote();
            if (currentChord && midiNote !== null && midiNote !== undefined) {
                me.addChordSequence(currentChord, midiNote, column);
            }
            else {
                sequence.source.add(null, me.unscaleValue(column));
                me.translateToSource(me.sequence);
                var itemtodraw = sequence.source.parts.last();
                me.drawSingleDataItem(itemtodraw);
            }
        }
    },
    getSequenceNotes: function (notes) {
        var me = this,
            sequence = me.sequence,
            items = sequence.items();
        var sequenceNotes = notes.select(function (t) {
            return items.first(function (x) {
                return x.source.midiNote() === t;
            });
        });
        return sequenceNotes;
    },
    removeSequence: function () {
        var me = this,
            location = me.hovercells.first(),
            sequence,
            row = location.row,
            column = location.column;
        sequence = me.getSequenceItem(row);
        if (sequence && me.lastitem) {
            var res = sequence.source.remove(me.lastitem);

            me.translateToSource(me.sequence);
            me.update();
        }
    },
    addSequenceDuration: function (key) {
        var me = this,
            location = me.hovercells.first(),
            sequence,
            row = location.row,
            column = location.column;
        sequence = me.getSequenceItem(row);
        if (sequence) {
            var currentChord = me.getCurrentChord();
            var midiNote = sequence.source.midiNote();
            if (currentChord && midiNote !== null && midiNote !== undefined) {
                me.addChordSequence(currentChord, midiNote, column, key);
            }
            else {
                var res = sequence.source.add(null, me.unscaleValue(column), me.getDuration(key));
                me.translateToSource(me.sequence);
                var itemtodraw = sequence.source.parts.last();
                me.drawSingleDataItem(itemtodraw);
            }
        }
    },
    addChordSequence: function (currentChord, midiNote, column, key) {
        var me = this;
        if (currentChord && midiNote !== null && midiNote !== undefined) {
            var notes = Notes.midiNotes(midiNote, currentChord);
            var sequences = me.getSequenceNotes(notes).where();
            itemtodraw = sequences.concatFluent(function (sequence) {
                sequence.source.add(null, me.unscaleValue(column), key ? me.getDuration(key) : null);
                var itemtodraw = sequence.source.parts.last();
                return itemtodraw;
            });
            me.drawSingleDataItem(itemtodraw)
            me.translateToSource(me.sequence);
        }
    },
    removeSelectedSequences: function (itemstoremove) {
        var me = this;

        me.deleteSelected();
    },
    getDuration: function (key) {
        switch (key) {
            case '1':
                return 16;
            case '2':
                return 8;
            case '3':
                return 6;
            case '4':
                return 4;
            case '5':
                return 2;
            case '6':
                return 1;
            case '0':
                return 64;
            case '9':
                return 32;
            case '8':
                return 24;
            case '7':
                return 20;
            default: return 1;
        }
    },
    /**
     * Get sequence item.
     * @param {Number} item
     * @param {Object}
     ***/
    getSequenceItem: function (item) {
        var me = this;

        return me.sequence.items()[item] || null;
    },
    setTrackResourceOpenKey: function (key) {
        var me = this;

        me.setCommand(key, MEPH.audio.view.AudioSequencer.TrackResource, me.selectTrackResource.bind(me));
    },
    saveSequenceAsWave: function () {
        var me = this;
        if (me.$inj && me.$inj.scheduler) {
            me.$inj.scheduler.render().then(function (x) {
                MEPH.publish(MEPH.audio.Constants.REQUEST_RECORDING, { buffer: { buffer: x.renderedBuffer } });
            });;
        }
    },
    setPlayButton: function (key) {
        var me = this;
        me.setCommand(key, MEPH.audio.view.AudioSequencer.Play, function () {

            if (me.$inj && me.$inj.scheduler) {
                if (!me.$inj.scheduler.playing) {
                    me.$inj.scheduler.sequence(me.sequence);
                    me.$inj.scheduler.play();
                }
                else {
                    me.$inj.scheduler.sequence(me.sequence);
                    me.$inj.scheduler.stop();
                }
            }
        });
        me.setCommand('r', 'render', function () {
            if (me.$inj && me.$inj.scheduler) {
                me.$inj.scheduler.render().then(function (x) {
                    debugger;
                    var res = x;
                })['catch'](function (e) {
                    debugger
                })
            }
        })
    },
    setCommand: function (key, commandCode, func) {
        var me = this,
            command;


        me.commands = me.commands || [];
        command = me.commands.first(function (x) {
            return x.command === commandCode;
        });
        if (!command) {
            command = {
                command: commandCode,
                'function': func
            }
            me.commands.push(command);
        }
        command.key = key.toLowerCase();
    },
    setContextMenuOpenKey: function (key) {
        var me = this;
        me.setCommand(key, MEPH.audio.view.AudioSequencer.ContextMenu, me.openContextMenu.bind(me));
    },
    setSequenceGraphMod: function (key) {
        var me = this;
        me.setCommand(key, 'sequencegraphmod', me.showGraphForSequence.bind(me));
    },
    setClearCurrentChord: function (key) {
        var me = this;
        me.setCommand(key, 'clearurrentchord', function () {
            me.currentChord = null;
        });
    },
    setRemoveKey: function (key) {
        var me = this;
        me.setCommand(key, 'RemoveSequence', me.removeSequence.bind(me));
    },
    setDurationKeys: function () {
        var me = this;
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 0].foreach(function (key) {
            me.setCommand(key.toString(), 'AddSequence' + key, me.addSequenceDuration.bind(me, key.toString()));
        });
    },
    //////////////// Sequencer Rendering///
    rowDrawInstruction: function () {
        return null;
    },
    recordWhistle: function () {
        var me = this;
        if (!me.$whistleRecorder && parseFloat(me.timeLength)) {
            me.$whistleRecorder = new MEPH.audio.Audio();
            me.$whistleRecorder.mediastream({
                callback: function (stream) {
                    var video = document.createElement('video');
                    document.body.appendChild(video);
                    video.src = (window.URL && window.URL.createObjectURL(stream)) || stream;;
                    video.autoPlay = true;
                    video.muted = true;
                    video.onloadedmetadata = function (e) {
                        video.play();

                        var audioCtx = me.$whistleRecorder.createContext();
                        var frameCount = Math.ceil(parseFloat(me.timeLength) * audioCtx.sampleRate);
                        var myArrayBuffer = audioCtx.createBuffer(2, frameCount, audioCtx.sampleRate);
                        var c = 0;
                        me.$whistleRecorder.processor({
                            process: function (audioProcessingEvent) {

                                var inputBuffer = audioProcessingEvent.inputBuffer;
                                var length = audioProcessingEvent.inputBuffer.numberOfChannels;
                                var duration = inputBuffer.length;
                                var channeldata;
                                var data;
                                for (var i = length ; i--;) {
                                    channeldata = inputBuffer.getChannelData(i);
                                    data = myArrayBuffer.getChannelData(i);
                                    for (var sample = 0; sample < duration; sample++) {
                                        data[sample + c] = channeldata[sample];
                                    }
                                }
                                c += duration;
                                if (frameCount < c) {
                                    me.$whistleRecorder.disconnect();
                                    me.$whistleRecorder = null;
                                    var b = audioCtx.createBufferSource();
                                    b.buffer = myArrayBuffer;
                                    me.whistleBuffer = { buffer: b };
                                }
                            }

                        }).complete();
                    };
                }
            })
        }
    }
});