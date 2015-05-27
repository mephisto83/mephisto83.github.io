/**
 * @class MEPH.audio.graph.node.PannerNode
 * @extend MEPH.audio.graph.node.Node
 **/
MEPH.define('MEPH.audio.graph.AudioGraph', {
    templates: true,
    alias: 'audiograph',
    extend: 'MEPH.graph.GraphControl',
    requires: ['MEPH.button.Button',
        'MEPH.audio.graph.node.DelayNode',
        'MEPH.graph.SVGGraphViewPort',
        'MEPH.list.List',
        'MEPH.graph.SVGGraph',
        'MEPH.util.Style',
        'MEPH.audio.graph.node.Convolver',
        'MEPH.util.Dom',
        'MEPH.input.Text',
        'MEPH.graph.renderer.svg.BlenderNodeRenderer',
    'MEPH.graph.renderer.svg.ConnectionRenderer',
    'MEPH.audio.graph.node.BiquadFilter',
    'MEPH.audio.graph.node.ChannelMergerNode',
    'MEPH.audio.graph.node.GeneratedNode',
    'MEPH.audio.graph.node.ChannelSplitterNode',
    'MEPH.graph.SVGGraphRenderer',
    'MEPH.audio.graph.node.DynamicsCompressorNode',
    'MEPH.audio.graph.node.GainNode',
    'MEPH.audio.graph.node.AudioBufferSourceNode',
    'MEPH.audio.graph.node.OutputNode',
    'MEPH.audio.graph.node.InputNode',
    'MEPH.audio.graph.node.OscillatorNode',
    'MEPH.audio.graph.node.PannerNode',
    'MEPH.audio.graph.node.WaveShaperNode',
    'MEPH.audio.AudioResources'
    ],
    scripts: ['MEPH.audio.graph.AudioGraphNameChange'],
    properties: {
        graphsources: null
    },
    injections: ['audioResources'],
    initialize: function () {
        var me = this;
        me.graph = new MEPH.graph.SVGGraph();
        MEPH.subscribe(MEPH.audio.AudioResources.RESOURCE_MANAGER_UPDATE, me.updateGraphList.bind(me));
        MEPH.subscribe('opengraphinstance', me.openGraphInstanceHandler.bind(me));;
        me.great();
    },
    statics: {
        screate: function (graph, size, selector, holder) {;
            selector = selector || 'body';
            var graphviewport = new MEPH.graph.SVGGraphViewPort();
            var graphrenderer = new MEPH.graph.SVGGraphRenderer();
            var connectionrenderer = new MEPH.graph.renderer.svg.ConnectionRenderer();
            var blenderNode = new MEPH.graph.renderer.svg.BlenderNodeRenderer(graphviewport);

            var connectionHandler = new MEPH.graph.ConnectionHandler();
            connectionHandler.setGraph(graph);
            graphviewport.setConnectionHandler(connectionHandler);

            graphviewport.setup(selector, size);
            graphrenderer.setNodeRenderer(blenderNode);
            graphrenderer.setConnectionRenderer(connectionrenderer);
            graphrenderer.setGraph(graph);
            graphrenderer.setViewPort(graphviewport);
            graphrenderer.use('viewport');
            graphviewport.setGraph(graph);
            graphrenderer.render();
            if (holder && document.querySelector(holder)) {
                graphviewport.setHolder(holder);
                graphviewport.resize();
                window.addEventListener('resize', function () {
                    graphviewport.resize();
                });
            }
            graphviewport.selectConnectionOnClick = true;
            return graphviewport;
        }
    },
    openGraphInstanceHandler: function (type, name) {
        var me = this;

        var graph = me.graphsources.first(function (x) { return x.name === name; });
        me.graph.clear();
        var strgraph = JSON.stringify(graph);
        return me.graph.load(strgraph, me);
    },
    onLoaded: function () {
        var me = this;
        me.id = 'graph' + MEPH.GUID();
        me.graphsources = MEPH.util.Observable.observable([]);
        me.querySelectorAll('div.graphBody').first().parentNode.setAttribute('id', me.id);
        me.graphviewport = MEPH.audio.graph.AudioGraph.screate(me.graph || new MEPH.graph.SVGGraph(), {
            element: 'svg'
        }, '#' + me.id + ' div.graphBody', '#' + me.id);

        me.don('click', document.body, function (evt) {
            if (!MEPH.util.Dom.isDomDescendant(document.activeElement, me.audiographpopup)) {
                me.closepopup();
            }
        }, me);
    },
    resize: function () {
        var me = this;
        me.graphviewport.resize();
    },
    removeSelectedConnections: function () {
        var me = this;
        me.graph.removeConnections(me.graphviewport.getSelectedConnections().select());
        me.graphviewport.removeSelectedConnections();
    },
    updateGraphList: function () {
        var me = this;
        if (me.$inj && me.$inj.audioResources) {

            me.graphsources.clear();
            me.graphsources.push.apply(me.graphsources, me.$inj.audioResources.getGraphs());
        }
    },
    openGraphInstance: function (name) {
        var me = this;
        MEPH.publish('opengraphinstance', name);
    },
    openGraph: function () {
        var me = this;
        if (!me.openedonce) {
            me.openedonce = true;
            document.body.appendChild(me.audiographpopup);
            MEPH.util.Dom.centerElement(me.audiographpopup);
        }
        me.popupopen = true;
        Style.show(me.audiographpopup);
        MEPH.util.Dom.centerElement(me.audiographpopup);
    },
    closepopup: function () {
        var me = this;
        me.popupopen = false;
        Style.hide(me.audiographpopup);
    },
    saveGraph: function () {
        var me = this;
        var savedgraph = me.graph.save();
        var result = {
            id: me.graph.id || MEPH.GUID(),
            connections: savedgraph.connections.select(),
            nodes: savedgraph.nodes.select(function (x) {
                var res = {
                    id: x.id,
                    position: x.position,
                    data: {
                        id: x.data.id,
                        type: x.data.____type,
                        nodeInputs: x.data.nodeInputs.select(),
                        nodeOutputs: x.data.nodeOutputs.select(),
                    }
                }
                if (x.data.subGraph) {
                    res.data.subGraph = JSON.parse(JSON.stringify(x.data.subGraph))
                }
                return res;
            })
        }
        return result;
    },
    nameGraph: function (graph) {
        var me = this;
        return new Promise(function (r, f) {
            var tempEl = me.getTemplateEl('MEPH.audio.graph.AudioGraphNameChange');
            var input = tempEl.querySelector('input');

            var value;
            Dom.addSimpleDataEntryToElments(me, [{
                element: input,
                setFunc: function (val) {
                    value = val;
                }
            }], tempEl, function () {
                if (value) {
                    graph.name = value;
                    r(graph);
                }
            })

            input.focus();
        });
    },
    save: function () {
        var me = this;
        return JSON.stringify(me.saveGraph());
    },
    /**
     * Loads a graph.
     **/
    loadGraph: function (graph) {
        var me = this;
        return me.graph.load(graph, me);
    },
    /**
     * Add convolver audio node.
     * @return {Promise}
     **/
    addConvolver: function () {
        var me = this,
            node;
        return me.addAudioNode('MEPH.audio.graph.node.Convolver');
    },
    addCustom: function () {

        var me = this;
        var seed = { "connections": [{ "id": "1fd470e0-e09d-4c65-b512-3f2001227685", "nodes": ["df585831-ac49-443f-bdae-c48fc85183e3", "037a064b-374d-40eb-9648-4e7ca5591baf"], "zones": ["1ca9a3a1-0642-4054-b654-3cc2f896619d", "9c782c6e-2ebf-4afc-9f17-d8e8874e44f5"] }, { "id": "acbbaf26-525e-420b-8ac5-20ef066efd09", "nodes": ["df585831-ac49-443f-bdae-c48fc85183e3", "037a064b-374d-40eb-9648-4e7ca5591baf"], "zones": ["f7f889d7-152c-42fb-b5d4-74a0d802bfcc", "9c782c6e-2ebf-4afc-9f17-d8e8874e44f5"] }, { "id": "c27827d0-b8e2-49d3-b2f6-3ff2827c13f8", "nodes": ["df585831-ac49-443f-bdae-c48fc85183e3", "037a064b-374d-40eb-9648-4e7ca5591baf"], "zones": ["6d7a696b-c1e9-4cf7-8b29-c8213f528b6e", "9c782c6e-2ebf-4afc-9f17-d8e8874e44f5"] }, { "id": "f90a7359-7124-4e01-ade3-b6c394f28a6d", "nodes": ["df585831-ac49-443f-bdae-c48fc85183e3", "037a064b-374d-40eb-9648-4e7ca5591baf"], "zones": ["4905939a-f5ab-44ff-8d8f-1e2973d3eafe", "9c782c6e-2ebf-4afc-9f17-d8e8874e44f5"] }, { "id": "48a4446f-6537-4059-a490-31cede7ac8a1", "nodes": ["df585831-ac49-443f-bdae-c48fc85183e3", "cef80e71-f0b9-45ef-99c6-67ee4554745c"], "zones": ["13d343a0-9cc4-4c7d-8674-25069bdca343", "bfee62ed-9a4f-4fab-875b-3e24c87b8e06"] }], "nodes": [{ "id": "037a064b-374d-40eb-9648-4e7ca5591baf", "position": { "x": 0, "y": 0, "z": 0 }, "data": { "id": "6b241096-8024-4f84-ae5b-3e4ea5ff0abb", "type": "MEPH.audio.graph.node.InputNode", "nodeInputs": [{ "name": "bufferinput", "title": "bufferinput", "type": "AudioBuffer", "connector": null, "id": "1ca9a3a1-0642-4054-b654-3cc2f896619d", "options": null, "output": false }, { "name": "q", "title": "q", "type": "Number", "connector": null, "id": "f7f889d7-152c-42fb-b5d4-74a0d802bfcc", "options": null, "output": false }, { "name": "frequency", "title": "frequency", "type": "Number", "connector": null, "id": "6d7a696b-c1e9-4cf7-8b29-c8213f528b6e", "options": null, "output": false }, { "name": "detune", "title": "detune", "type": "Number", "connector": null, "id": "4905939a-f5ab-44ff-8d8f-1e2973d3eafe", "options": null, "output": false }], "nodeOutputs": [{ "name": "buffer", "title": "buffer", "type": "Anything", "connector": null, "id": "9c782c6e-2ebf-4afc-9f17-d8e8874e44f5", "output": true, "isOutput": false }] } }, { "id": "cef80e71-f0b9-45ef-99c6-67ee4554745c", "position": { "x": 953, "y": 217, "z": 0 }, "data": { "id": "5a46043a-dc5d-46b2-a479-58bb29137be3", "type": "MEPH.audio.graph.node.OutputNode", "nodeInputs": [{ "name": "buffer", "title": "buffer", "type": "Anything", "connector": null, "id": "bfee62ed-9a4f-4fab-875b-3e24c87b8e06", "options": null, "output": false, "isOutput": false }], "nodeOutputs": [{ "name": "bufferoutput", "title": "bufferoutput", "type": "AudioBuffer", "connector": null, "id": "13d343a0-9cc4-4c7d-8674-25069bdca343", "output": true }] } }, { "id": "df585831-ac49-443f-bdae-c48fc85183e3", "position": { "x": 537, "y": 71, "z": 0 }, "data": { "id": "dd2ce35b-bbba-4b22-9141-ae14426c5f16", "type": "MEPH.audio.graph.node.BiquadFilter", "nodeInputs": [{ "name": "buffer", "title": "buffer", "type": "AudioBuffer", "connector": null, "id": "1ca9a3a1-0642-4054-b654-3cc2f896619d", "options": null, "output": false, "isOutput": false }, { "name": "q", "title": "q", "type": "Number", "connector": null, "id": "f7f889d7-152c-42fb-b5d4-74a0d802bfcc", "options": { "path": "Q.value" }, "output": false, "isOutput": false }, { "name": "frequency", "title": "frequency", "type": "Number", "connector": null, "id": "6d7a696b-c1e9-4cf7-8b29-c8213f528b6e", "options": { "path": "frequency.value" }, "output": false, "isOutput": false }, { "name": "detune", "title": "detune", "type": "Number", "connector": null, "id": "4905939a-f5ab-44ff-8d8f-1e2973d3eafe", "options": { "path": "detune.value" }, "output": false, "isOutput": false }, { "name": "gain", "title": "gain", "type": "Number", "connector": null, "id": "1add0375-f396-4cb0-8f6e-d5f520919856", "options": { "path": "gain.value" }, "output": false, "isOutput": false }, { "name": "type", "title": "type", "type": "String", "connector": null, "id": "35d307d9-097d-4e07-b0e3-f09acbd658d3", "options": { "values": ["lowpass", "highpass", "bandpass", "lowshelf", "highshelf", "peaking", "notch", "allpass"] }, "output": false, "isOutput": false }], "nodeOutputs": [{ "name": "buffer", "title": "buffer", "type": "AudioBuffer", "connector": null, "id": "13d343a0-9cc4-4c7d-8674-25069bdca343", "output": true, "isOutput": false }] } }] };

        return me.addAudioNode('MEPH.audio.graph.node.GeneratedNode', seed)
    },
    addOutput: function () {
        var me = this;
        return me.addAudioNode('MEPH.audio.graph.node.OutputNode');
    },
    addInput: function () {
        var me = this;
        return me.addAudioNode('MEPH.audio.graph.node.InputNode');
    },
    addAudioSource: function () {
        var me = this,
            node;
        return me.addAudioNode('MEPH.audio.graph.node.AudioBufferSourceNode');
    },
    addDelay: function () {
        var me = this;

        return me.addAudioNode('MEPH.audio.graph.node.DelayNode');
    },
    addBiquadFilter: function () {
        var me = this;

        return me.addAudioNode('MEPH.audio.graph.node.BiquadFilter');
    },
    addChannelMerger: function () {
        var me = this;

        return me.addAudioNode('MEPH.audio.graph.node.ChannelMergerNode');
    },
    addChannelSplitter: function () {
        var me = this;

        return me.addAudioNode('MEPH.audio.graph.node.ChannelSplitterNode');

    },
    addDynamicsCompressor: function () {
        var me = this;

        return me.addAudioNode('MEPH.audio.graph.node.DynamicsCompressorNode');
    },
    addGain: function () {
        var me = this;

        return me.addAudioNode('MEPH.audio.graph.node.GainNode');
    },
    addOscillator: function () {
        var me = this;
        return me.addAudioNode('MEPH.audio.graph.node.OscillatorNode');
    },
    addPanner: function () {
        var me = this;

        return me.addAudioNode('MEPH.audio.graph.node.PannerNode');
    },
    addWaveShaper: function () {
        var me = this;

        return me.addAudioNode('MEPH.audio.graph.node.WaveShaperNode');
    },
    /**
     * Add audio node.
     * @param {String} nodedata
     * @return {Promise}
     **/
    addAudioNode: function (nodedata, injections) {
        var me = this,
            svg = me.graphviewport.getGCanvas(),
            node;

        return me.renderControl(nodedata, svg, me, null, injections).then(function (t) {
            var res = t.first();
            node = new MEPH.graph.Node();
            node.setId(MEPH.GUID());
            node.appendData(res.classInstance);
            me.addNode(node);
        })
    }
});