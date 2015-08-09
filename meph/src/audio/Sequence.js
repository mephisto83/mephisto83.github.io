/**
 * @class MEPH.audio.Sequence
 * Defines a base class for an audio sequence.
 **/
MEPH.define('MEPH.audio.Sequence', {
    requires: ['MEPH.mixins.Injections',
               'MEPH.audio.graph.AudioGraphReader'],
    mixins: {
        injections: 'MEPH.mixins.Injections'
    },
    statics: {
        defaultSequenceGraphRecipe: {
            "id": "b2ab59ba-df15-48ad-b6a0-0fc76c14d963",
            "connections": [], "nodes": [{
                "id": "a13c9096-907e-49a1-97f8-76bd929585e8", "position": {
                    "x": 400, "y": 107, "z": 0
                }, "data": {
                    "id": "17afd0d6-aec7-4006-8510-b32a0cbef594", "type": "MEPH.audio.graph.node.GainNode", "nodeInputs": [{ "name": "buffer", "title": "buffer", "type": "AudioBuffer", "connector": null, "id": "30cae3fa-52c6-477f-9420-8f2bc5a6c346", "options": null, "output": false, "isOutput": false }, { "name": "gain", "title": "gain", "type": "Number", "connector": null, "id": "3552de45-df3e-47c4-8fd6-32df291079ff", "options": { "path": "gain.value" }, "output": false, "isOutput": false, "defaultValue": "0.56" }], "nodeOutputs": [{ "name": "buffer", "title": "buffer", "type": "AudioBuffer", "connector": null, "id": "26190909-b9a9-443f-9a30-c544ac469c7a", "output": true, "isOutput": false }]
                }
            }]
        },
        /**
         * Translates a string into a sequence.
         ***/
        deserialize: function (str, audioservice) {
            var sequence = new MEPH.audio.Sequence();
            var obj = JSON.parse(str);
            sequence.deserialize(obj, audioservice);

            return sequence;
        }
    },
    injections: ['audioResources'],
    properties: {
        parts: null,
        title: null,
        id: null,
        $midinote: null,
        containsSequences: false
    },
    initialize: function (args) {
        var me = this;
        me.parts = [];
        me.mixins.injections.init.apply(me);
        me.id = MEPH.GUID();
        if (args) {
            if (args.title) {
                me.title = args.title;
            }
            if (args.id) {
                me.id = args.id;
            }
        }
    },
    setDefault: function (type, id) {
        var me = this;
        me.$defaultType = type;
        me.$defaultRefId = id;
    },
    setDefaultGraph: function (id) {
        var me = this;
        me.setDefault('graph', id);
    },
    setDefaultSoundFont: function (id) {
        var me = this;
        me.setDefault('soundfont', id);
    },
    setMode: function (offline) {
        var me = this, graph = me.getGraph(true);
        if (graph) {
            graph.disconnect();
            graph.offlineMode = offline;
        }

        if (me.containsSequences) {
            res = [];
            me.parts.foreach(function (sequence) {
                sequence.source.setMode(offline);
            });
        }
        else {
            me.parts.select(function (x) {
                x.getAudio().disconnect();
                x.getAudio().clearContext();
                x.getAudio().offlineMode = offline;
            });
        }
    },
    getGraph: function (raw) {
        var me = this;
        if (!me.$$graph && me.$graph) {
            var g = MEPH.audio.graph.AudioGraphReader.cloneUnique(me.$graph);
            var reader = new MEPH.audio.graph.AudioGraphReader();
            reader.setGraph(g);
            try {
                me.$$graph = reader.createAudio();
                me.$$graph.sequencecreated = true;
            }
            catch (e) {
                me.$$graph = null;
                MEPH.Log(e);
            }
        }

        if (raw)
            return me.$$graph;

        me.$graph = me.$graph || MEPH.audio.graph.AudioGraphReader.cloneUnique(MEPH.audio.Sequence.defaultSequenceGraphRecipe)
        return me.$graph;
    },
    saveGraph: function (graph) {
        var me = this;
        me.$graph = graph;
        if (me.$$graph) {
            me.$$graph.disconnect();
        }
        me.$$graph = null;
    },
    getDefaultInstance: function () {
        var me = this,
            result = null;
        if (me.$inj.audioResources) {
            switch (me.$defaultType) {
                case 'graph':
                    result = me.$defaultRefId;//me.$inj.audioResources.getGraphInstance();
                    break;
                case 'sequence':
                    result = me.$inj.audioResources.getSequenceInstance(me.$defaultRefId)
                    break;
                case 'soundfont':
                    result = me.$inj.audioResources.getSoundFontInstance(me.$defaultRefId);
                    break;
            }
        }
        return result;
    },
    midiNote: function (midinote) {
        var me = this;
        if (midinote !== undefined) {
            me.$midinote = parseFloat(midinote);
        }
        return me.$midinote;
    },
    /**
     * Returns the instance used by the sequence.
     ***/
    items: function () {
        var me = this;
        return me.parts;
    },
    itemSequences: function () {
        var me = this;
        return me.items().concatFluent(function (x) {
            return x.source.items();
        })
    },
    applyAbsoluteTime: function (rel) {
        //var me = this;
        //rel = rel || 0;
        //me.items().foreach(function (x) {
        //    if (x.source instanceof MEPH.audio.Sequence) {
        //        x.source.applyAbsoluteTime(rel + x.relativeTimeOffset);
        //    }
        //    x.absoluteTime = rel + x.relativeTimeOffset;
        //})

    },
    getAbsoluteTime: function (item) {
        var me = this;
        if (item.absoluteTime !== undefined) {
            return item.absoluteTime;
        }
        //var found = me.items().first(function (x) { return x === item; });

        //if (found) {
        //    return found.relativeTimeOffset;
        //}
        //var rel = 0;
        //found = me.items().selectFirst(function (x) {
        //    if (me.containsSequences) {
        //        var res = x.source.getAbsoluteTime(item);
        //        if (res) {
        //            rel = x.relativeTimeOffset;
        //            return res;
        //        }
        //    }
        //    return false;
        //});
        //if (found === false) {
        //    return false
        //}
        //var unittime = (found || 0) + rel;
        //return unittime;
    },
    setRelativeTime: function (item, time) {
        var me = this;
        var parent = me.getParent(item);
        if (parent.source.isChild(item)) {
            item.relativeTimeOffset = Math.max(0, time);
            item.absoluteTime = undefined;
        }
        else {
            parent.source.setRelativeTime(item, time - parent.relativeTimeOffset);
        }
    },
    /**
     * Gets the index of the item relative to the parent/ancestor.
     * @param {Object} item
     * @returns {Number}s
     **/
    getParentIndexOf: function (item) {
        var me = this,
            res;

        if (item.parentIndex !== undefined) {
            return item.parentIndex;
        }
        else {
            res = me.getParent(item);
            if (item.parent && item.parent !== res) {
                debugger
            }
            item.parent = res;
        }
        item.parentIndex = me.items().indexOf(res);
        return item.parentIndex;
    },
    /**
     * Gets the parent/ ancestor
     **/
    getParent: function (item) {
        var me = this;
        var res = me.items().first(function (x) {
            return x === item || (me.containsSequences ? x.source.hasDescendant(item) : false);
        });
        return res;
    },
    isChild: function (item) {
        var me = this;
        return me.items().first(function (x) { return item === x; })
    },
    /**
     * Returns true, if it belongs to the sequence structure.
     * @param {Object} item
     * @returns {Boolean}
     ***/
    hasDescendant: function (item) {
        var me = this;
        return me.items().any(function (x) {
            return x === item || (me.containsSequences ? x.source.hasDescendant(item) : false);
        });
    },
    containsRef: function (source) {
        var me = this;
        return me.items().any(function (x) {
            return x.source === source || (me.containsSequences ? x.source.containsRef(source) : false);
        });
    },
    /**
     * Removes the source from the sequence.
     * @param {Object} source
     * @return {Array}
     **/
    remove: function (source) {
        var me = this;

        return me.items().removeWhere(function (x) {
            return x === source;
        });
    },
    /**
     * Adds a source to the sequence.
     * @param  { Object} source
     * @param {Number} timeOffset
     * @param {Number} duration
     ***/
    add: function (source, timeOffset, duration) {
        var me = this,
            defaults,
            args = MEPH.Array(arguments);
        duration = duration || null;
        if (!source) {
            source = me.getDefaultInstance();
            if (!source) {
                return;
            }
        }


        if (me.parts.length === 0) {
            me.containsSequences = source instanceof MEPH.audio.Sequence;
        }

        if (((me.containsSequences && source instanceof MEPH.audio.Sequence) ||
            (!me.containsSequences && source instanceof MEPH.audio.Audio) ||
            (!me.containsSequences && typeof source === 'string')) &&
            (typeof source === 'string' ||
             source instanceof MEPH.audio.Audio || (!source.containsRef(me)))) {
            me.parts.push({
                id: MEPH.GUID(),
                source: source,
                relativeTimeOffset: timeOffset || 0,
                duration: duration,
                getAudio: function () {
                    if (typeof this.source === 'string' && this.audioSource) {
                        this.audioSource.duration(this.duration);
                        return this.audioSource;
                    }
                    return this.source;
                }
            });
            if (source instanceof MEPH.audio.Audio && duration) {
                source.duration(duration)
            }

            return source;
        }
        return false;
    },
    get: function () {
        var me = this;
        return me.parts.select();
    },
    duration: function (graphExtensions) {
        var me = this;
        graphExtensions = graphExtensions || [];
        return me.parts.maximum(function (x) {
            if (x.containsSequences) {
                return x.source.duration(graphExtensions) + x.relativeTimeOffset;
            }
            else {
                if (typeof x.source === 'string') {
                    return x.duration + x.relativeTimeOffset; //me.$inj.audioResources.getGraphInstance(x.source, graphExtensions).duration();
                }
                return x.source.duration() + x.relativeTimeOffset;
            }
        })
    },
    getDuration: function (item) {
        return item.source.duration();
    },
    /**
     * Ges the schedule audio parts to begin playing from the start to the start +length time.
     * @param {Number} start
     * @param {Number} length
     * @return {Object}
     **/
    getScheduledAudio: function (start, length, graphExtensions) {
        var me = this;
        graphExtensions = graphExtensions || [];
        graphExtensions = me.connectExtensions(graphExtensions)
        if (me.containsSequences) {
            return me.parts.concatFluent(function (sequence) {
                return sequence.source.getScheduledAudio(sequence.relativeTimeOffset - start, length, graphExtensions);
            });;
        }
        else {
            return me.parts.where(function (x) {
                return x.relativeTimeOffset >= start && x.relativeTimeOffset <= (start + length);
            }).select(function (x) {
                return me.assignAudioSource(x, graphExtensions);
            });
        }
    },
    connectExtensions: function (graphExtensions) {
        var me = this;
        var graphextension = me.getGraph(true) || null;
        if (graphextension) {
            graphextension.setDestination(graphExtensions.first());
            graphextension.complete();

            graphExtensions = [graphextension];
        }
        return graphExtensions;
    },
    assignAudioSource: function (x, graphExtensions) {
        var me = this;
        if (typeof x.source === 'string') {
            if (me.$defaultType === 'soundfont') {
                x.audioSource = me.$inj.audioResources.getSoundFontAudioInstance(me.$defaultRefId);
            }
            else {
                x.audioSource = me.$inj.audioResources.getGraphInstance(x.source);
            }
            if (graphExtensions && graphExtensions.length) {
                x.audioSource.setDestination(graphExtensions.first());
            }
        }
        return x;
    },
    clone: function (x) {
        var t = {
        };
        for (var i in x) {
            t[i] = x[i];
        }
        return t;
    },
    getAudios: function (graphExtensions, rel) {
        var me = this, res;
        rel = rel || 0
        graphExtensions = graphExtensions || [];
        graphExtensions = me.connectExtensions(graphExtensions)

        if (me.containsSequences) {
            res = [];
            me.parts.foreach(function (sequence) {
                var subres = sequence.source.getAudios(graphExtensions, rel + sequence.relativeTimeOffset);
                subres.foreach(function (t) {
                    if (res.indexOf(t) === -1) {
                        res.push(t);
                    }
                });
            });
        }
        else {
            res = me.parts.select(function (x) {
                var clone = me.clone(me.assignAudioSource(x, graphExtensions));
                clone.absoluteTime = rel + x.relativeTimeOffset
                return clone;
            });
        }
        return res;
    },
    getAudioWithAbsoluteTime: function () {
        var me = this, audios = me.getAudios()
        return audios;
    },
    toJSON: function () {
        var me = this,
            res;
        if (me.containsSequences) {
            if (me.parts)
                res = me.parts.select(function (sequence) {
                    return {
                        sequence: sequence.source.toJSON(),
                        relativeTimeOffset: sequence.relativeTimeOffset
                    }
                });

        }
        else {
            if (me.parts)
                res = me.parts.select(function (x) {
                    return {
                        audioId: x.id,
                        relativeTimeOffset: x.relativeTimeOffset
                    };
                })
        }
        return {
            parts: res,
            id: me.id,
            title: me.title,
            graph: me.getGraph(true),
            sequence: me.containsSequences
        }
    },
    /**
     * Translates an object into a sequence.
     ***/
    deserialize: function (obj, audioservice, sequences) {
        var me = this;
        sequences = sequences || [];
        me.id = obj.id;
        me.title = obj.title || me.title;
        me.$graph = obj.graph || null;
        if (obj.sequence) {
            obj.parts.foreach(function (part) {
                var newsequence = new MEPH.audio.Sequence();
                var res = me.add(newsequence, part.relativeTimeOffset);
                if (!sequences.some(function (x) { return x === part.sequence.id; })) {
                    sequences.push(newsequence.id);
                    newsequence.deserialize(part.sequence, audioservice, sequences);
                }
            });
        }
        else {
            obj.parts.foreach(function (part) {
                var audio = audioservice.get(part.audioId);
                me.add(audio, part.relativeTimeOffset);
            })
        }
    }
});