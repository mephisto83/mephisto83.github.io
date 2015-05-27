/**
 * @class MEPH.audio.AudioResources
 * Audio resources are tracked from this service.
 **/
MEPH.define('MEPH.audio.AudioResources', {
    requires: ['MEPH.audio.Constants',
                'MEPH.audio.Audio',
                'MEPH.graph.Graph',
                'MEPH.audio.music.instrument.SoundFontInstrument',
                'MEPH.audio.graph.AudioGraphReader'],
    statics: {
        RESOURCE_MANAGER_UPDATE: 'RESOURCE_MANAGER_UPDATE'
    },
    properties: {
        sequences: null,
        resources: null,
        graphs: null
    },
    initialize: function () {
        var me = this,
            Audio = MEPH.audio.Audio;
        me.graphReader = new MEPH.audio.graph.AudioGraphReader();
        me.resources = [];
        me.graphs = [];
        me.sequences = [];
        me.soundfonts = [];
        MEPH.subscribe(MEPH.audio.Audio.CHANGED_BUFFER_SOURCE, me.onResourcesChanged.bind(me));

        MEPH.subscribe(MEPH.audio.Constants.AUDIO_GRAPH_SAVED, me.onAudioGraphSaved.bind(me));

        if (Audio.GetSourceBuffer()) {
            Audio.GetSourceBuffer().foreach(function (t) { me.resources.push(t); })
            MEPH.publish(MEPH.audio.AudioResources.RESOURCE_MANAGER_UPDATE, {});
        }

        MEPH.subscribe(MEPH.audio.Constants.CREATE_GRAPH, function (type, id, name) {
            var graph = me.createGraph(id, name);
            MEPH.publish(MEPH.audio.Constants.AUDIO_GRAPH_SAVED, graph);
        });
    },
    addResources: function (resources) {
        var me = this, promise = Promise.resolve();


        resources.foreach(function (resource) {
            if (resource.file && resource.file.name.indexOf('.sf2') !== -1) {


                var soundfontInstrument = new MEPH.audio.music.instrument.SoundFontInstrument();
                var id = MEPH.GUID();
                soundfontInstrument.addResource(resource.file.name, '.sf2', resource.res, id);
                soundfontInstrument.setFontFile(resource.file.name);
                soundfontInstrument.samplerate();
                soundfontInstrument.prepare(resource.file.name);
                me.soundfonts.push({
                    resource: resource,
                    type: 'soundfont',
                    id: id,
                    soundfontInstrument: soundfontInstrument
                });
            }
            else if (resource.file && (resource.file.type === "audio/wav" || resource.file.type === "audio/mp3")) {
                promise = promise.then(function () {
                    var audio = new MEPH.audio.Audio();
                    return audio.loadByteArray(resource.res, null, resource.file.name, resource.file.type).then(function (buffer) {

                        var graph = me.createGraph(buffer.id, buffer.file);
                        MEPH.publish(MEPH.audio.Constants.AUDIO_GRAPH_SAVED, graph);

                    }.bind(me));
                });
            }
        });

        return promise;
    },
    createGraph: function (id, name) {
        var graph = new MEPH.graph.Graph(),
          node,
          audiobuffer = new MEPH.audio.graph.node.AudioBufferSourceNode();

        node = new MEPH.graph.Node();
        node.setId(MEPH.GUID());
        audiobuffer.id = MEPH.GUID();
        audiobuffer.setNodeInputDefaultValue('source', id)
        node.appendData(audiobuffer);
        node.data = audiobuffer;
        graph.addNode(node);
        var result = graph.saveGraph();
        result.id = result.id || MEPH.GUID();
        result.name = name;
        result.file = name;
        audiobuffer.destroy();
        return result;
    },
    collectProject: function () {
        var me = this,
            audio = new MEPH.audio.Audio(),
            result = {};
        result.graphs = me.getGraphs();
        result.resources = me.resources.select(function (x) { return audio.serializeBuffer(x); });
        result.sequences = me.sequences.select(function (x) { return JSON.stringify(x.toJSON()); });
        return result;
    },
    onAudioGraphSaved: function (type, graph) {
        var me = this;
        me.graphs.push(graph);
        MEPH.publish(MEPH.audio.AudioResources.RESOURCE_MANAGER_UPDATE, {});
    },
    onResourcesChanged: function (type, options, resources) {
        var me = this, newresources;
        newresources = (resources || []).where(function (x) {
            return !me.resources.some(function (t) {
                return t === x;
            });
        });
        me.resources.push.apply(me.resources, newresources);
        MEPH.publish(MEPH.audio.AudioResources.RESOURCE_MANAGER_UPDATE, {});
    },
    getDuration: function (id) {
        var me = this;
        debugger
        var resource = me.getResourceById(id);
        if (resource) {
            if (resource.nodes) {

                var devalue = resource.nodes.first(function (x) {
                    return x.data.type === "MEPH.audio.graph.node.AudioBufferSourceNode";
                })
                if (devalue && devalue.data && devalue.data.nodeInputs) {
                    devalue = devalue.data.nodeInputs.first(function (x) {
                        return x.title === 'source';
                    });
                    if (devalue) {
                        var bufferid = devalue.defaultValue;
                    }
                }
            }
        }

    },
    getGraphs: function () {
        var me = this;
        return me.graphs.select();
    },
    getFontGraphInstance: function (process, graphextension) {
        var me = this;
        var audio = new MEPH.audio.Audio();
        audio.processor({
            size: 1024,
            process: process
        });
        return audio;
    },
    getGraphInstance: function (id, graphextension) {
        var me = this,
            graphRecipe = me.getGraphs().first(function (x) { return x.id === id; });
        graphextension = graphextension || [];
        if (graphRecipe) {
            me.graphReader.setGraph(MEPH.audio.graph.AudioGraphReader.cloneUnique(graphRecipe));
            graphextension.foreach(function (extension) {
                me.graphReader.connectGraph(extension);
            });
            try {
                return me.graphReader.createAudio();
            }
            catch (e) {
                MEPH.Log(e);
            }
        }

        return null;
    },
    getSequenceInstance: function (id) {
        var me = this;
        return me.sequences.first(function (x) { return x.id === id; })
    },
    getSoundFontInstance: function (id) {
        var me = this;
        return id.sid + '/' + id.id;
    },
    getSoundFontAudioInstance: function (info, graphExtensions) {
        var me = this,
            id = me.getSoundFontInstance(info),
            data = me.getSoundFont(info);
        data.cache = data.cache || {};
        //if (!data.cache[id]) {

        //var buffer = { buffer: data.soundfontInstrument.note(info.id, 30) };
        var bufferid = MEPH.GUID();
        //var graph = data.soundfontInstrument.createNoteGraph(bufferid, data.resource.file.name)
        var processornode = data.soundfontInstrument.nodeprocessor(info.id, 30, true);
        data.cache[id] = {
            graphid: bufferid,
            sid: info.sid,
            id: bufferid,
            process: processornode
        }
        //me.graphs.push(graph);
        //var audio = new MEPH.audio.Audio();
        //audio.addBufferSource({
        //    sid: info.sid,
        //    id: bufferid,
        //    buffer: buffer
        //})
        //}
        return me.getFontGraphInstance(data.cache[id].process, graphExtensions);
    },
    getSoundFont: function (info) {
        var me = this;
        return me.soundfonts.first(function (x) {
            return x.id === info.sid;
        })
    },
    addSequence: function (sequence) {
        var me = this;
        if (sequence.title)
            if (me.sequences.indexOf(sequence) === -1)
                me.sequences.push(sequence);
    },
    getSequences: function () {
        var me = this;
        return me.sequences.select();
    },
    getResources: function (audioresources) {
        var me = this;
        if (audioresources) {
            return me.resources.select();
        }
        return me.graphs.select().concat(me.soundfonts.select());
    },
    getResourceById: function (id) {
        var me = this;
        var resource = me.getResources().first(function (x) {
            return x.id === id;
        });

        return resource;
    },
    clearResources: function () {
        var me = this;
        me.graphs.clear();
        me.soundfonts.clear();
    }
}).then(function () {
    return MEPH.requires('MEPH.audio.graph.node.AudioBufferSourceNode')
})