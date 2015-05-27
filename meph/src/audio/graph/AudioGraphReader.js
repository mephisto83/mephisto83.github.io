/**
 * @class MEPH.audio.Audio
 * Defines a base class for Audio.
 **/
MEPH.define('MEPH.audio.graph.AudioGraphReader', {
    requires: ['MEPH.audio.Audio'],
    properties: {
        $graph: null
    },
    statics: {
        cloneUnique: function (graph) {


            var ids = MEPH.audio.graph.AudioGraphReader.collectIds(graph).select(function (x) {
                return {
                    n: MEPH.GUID(),
                    o: x
                }
            });

            var str = JSON.stringify(graph);

            ids.foreach(function (item) {
                str = str.replace(new RegExp(item.o, 'g'), item.n);
            });

            var res = JSON.parse(str);
            return res;
        },
        collectIds: function (graph) {
            var nodeids = graph.nodes.concatFluent(function (x) {
                return [x.id].concat(x.data.nodeInputs.select(function (x) { return x.id; }))
                    .concat(x.data.nodeOutputs.select(function (x) { return x.id; })).concat(x.data.subGraph ? MEPH.audio.graph.AudioGraphReader.collectIds(x.data.subGraph) : []);
            });
            var connectionids = graph.connections.select(function (x) { return x.id; });

            connectionids = connectionids.concat(graph.connections.concatFluent(function (x) { return x.zones; }));
            connectionids = connectionids.concat(graph.connections.concatFluent(function (x) { return x.nodes; }));
            if (graph.id)
                connectionids.push(graph.id);
            return nodeids.concat(connectionids)
        }
    },
    setGraph: function (graph) {
        var me = this;
        me.$graph = graph;
    },
    getGraph: function () {
        var me = this;
        return me.$graph;
    },
    /**
     * Gets the nodes from the graph
     * @param {Object} [graph]
     ***/
    getNodes: function (graph) {
        var me = this;

        graph = graph || me.getGraph();

        var nodes = graph.nodes;
        nodes = nodes.concat(graph.nodes.where(function (x) { return x.data.subGraph; }).concatFluent(function (x) {


            return me.getNodes(x.data.subGraph);
        }));
        return nodes.where(me.nodesToIgnore);
    },
    /**
     * Gets the connections in the graph.
     * @param {Object} [graph]
     **/
    getConnections: function (graph) {
        var me = this;

        graph = graph || me.getGraph();
        var connections = graph.connections;
        connections = connections.concat(graph.nodes.where(function (x) {
            return x.data.subGraph;
        }).concatFluent(function (x) {
            return me.getConnections(x.data.subGraph);
        }));
        return connections;
    },
    /**
     * Constructs an audio object from the graph.
     * @return {MEPH.audio.Audio}
     **/
    constructAudioNodeList: function () {
        var me = this;

        if (me.hasSingleRoot()) {
            var root = me.getRoot();
            var res = me.fillListWithOrderedTree(root);
            return res;
        }
    },
    connectGraph: function (graph) {
        var me = this;
        if (me.hasSingleRoot()) {
            var input = me.getNodeOfType(graph, 'MEPH.audio.graph.node.InputNode');
            var inputNodesToConnectToFromRoot = me.getNodesConnectedToOutputsOf(input, graph);
            var nodeAndTargetZones = inputNodesToConnectToFromRoot.select(function (x) {
                return {
                    zones: me.getZoneToConnectToFromInput(input, x, graph),
                    node: x
                }
            })
            var root = me.getRoot();
            var audiooutputs = root.data.nodeOutputs.where(function (t) {
                return t.type === 'AudioBuffer';
            });
            var currentgraph = me.getGraph();
            var res = nodeAndTargetZones.select(function (x) {
                return {
                    id: MEPH.GUID(),
                    nodes: [x.node.id, root.id],
                    zones: [x.zones.first(), audiooutputs.first().id]
                }
            });
            graph.nodes.where(me.nodesToIgnore).foreach(function (node) {
                currentgraph.nodes.push(node);
            })
            graph.connections.foreach(function (connection) {
                if (!graph.nodes.where(function (x) {
                    return !me.nodesToIgnore(x);
                }).some(function (t) {

                    return connection.nodes.some(function (y) { return y === t.id; });
                })) {
                    currentgraph.connections.push(connection);
                }
            });
            res.foreach(function (connection) {
                currentgraph.connections.push(connection);
            });

        }
    },
    /**
     * Gets a node of a type from a graph.
     * @param {Object} graph
     * @param {String} type
     * @return {Object}
     */
    getNodeOfType: function (graph, type) {
        var me = this;
        return graph.nodes.first(function (x) { return x.data.type === type; });
    },
    /**
     * Gets the nodes connected to the outputs of the node.
     * @param {Object} node 
     * @param {Object} graph
     * @return {Array}
     **/
    getNodesConnectedToOutputsOf: function (node, graph) {
        var me = this;
        var connections = graph.connections.where(function (x) {
            return x.nodes.some(function (x) { return node.id === x; });
        });

        var othernodes = connections.select(function (x) {
            return x.nodes.first(function (x) { return node.id !== x; });
        });
        return graph.nodes.where(function (x) { return othernodes.some(function (t) { return t === x.id; }) });
    },
    getZoneToConnectToFromInput: function (inputnode, outputnode, graph) {
        var zones = graph.connections.where(function (x) {
            return x.nodes.all(function (x) { return x === inputnode.id || x === outputnode.id; });
        }).select(function (x) {
            return x.zones.first(function (t) {
                return outputnode.data.nodeInputs.some(function (y) {
                    return y.id === t;
                });
            })
        });
        return zones;
    },
    createAudio: function () {
        var me = this, audio = new MEPH.audio.Audio();
        var list = me.constructAudioNodeList();
        list.foreach(function (t) {
            switch (t.node.data.type) {
                case 'MEPH.audio.graph.node.WaveShaperNode':
                    audio.waveShaper(t);
                    break;
                case 'MEPH.audio.graph.node.PannerNode':
                    audio.panner(t);
                    break;
                case 'MEPH.audio.graph.node.OscillatorNode':
                    audio.oscillator(t);
                    break;
                case 'MEPH.audio.graph.node.GainNode':
                    audio.gain(t);
                    break;
                case 'MEPH.audio.graph.node.DynamicsCompressorNode':
                    audio.dynamicsCompressor(t);
                    break;
                case 'MEPH.audio.graph.node.ChannelMergerNode':
                    audio.merger(t);
                    break;
                case 'MEPH.audio.graph.node.ChannelSplitterNode':
                    audio.splitter(t);
                    break;
                case 'MEPH.audio.graph.node.BiquadFilter':
                    audio.biquadFilter(t);
                    break;
                case 'MEPH.audio.graph.node.DelayNode':
                    audio.delay(t);
                    break;
                case 'MEPH.audio.graph.node.Convolver':
                    audio.convolver(t);
                    break;
                case 'MEPH.audio.graph.node.AudioBufferSourceNode':
                    audio.buffer(null, t);
                    break;
                default:
                    throw new Error('unhandled type : ' + t.data.type);
            }
        });
        return audio;
    },
    /**
     * Fills the list with the nodes ordered.
     * @param {Object} root
     * @param {Array} list
     * @return {Array}
     **/
    fillListWithOrderedTree: function (root, list) {
        var me = this;
        var inputs = me.getInputs(root);
        var audionode = me.constructAudioNode(root, inputs);
        list = list || [];

        list.removeWhere(function (x) { return x.node.id === audionode.node.id; });

        list.unshift(audionode);
        inputs.foreach(function (x) {
            me.fillListWithOrderedTree(x.node, list);
        });
        return list;
    },
    nodesToIgnore: function (x) {
        return x.data.type !== 'MEPH.audio.graph.node.OutputNode' &&
            x.data.type !== 'MEPH.audio.graph.node.InputNode' &&
            x.data.type !== "MEPH.audio.graph.node.GeneratedNode";
    },
    /**
     * Can get the root.
     **/
    getRoots: function () {
        var me = this,
            connections = me.getConnections(),
            nodes = me.getNodes();
        connections.foreach(function (connection) {
            connection.zones.foreach(function (zone) {
                var node = nodes.first(function (node) {
                    return me.getOutputZones(node).first(function (nz) { return nz.id === zone; });
                });
                if (node) {
                    nodes.removeWhere(function (n) { return n == node; });
                }
            });
        });


        return nodes;
        //return me.getNodes().where(function (x) {
        //    return me.getIndependentNodes(x).length === 0 && x.data.type !== 'MEPH.audio.graph.node.OutputNode'
        //    && x.data.type !== "MEPH.audio.graph.node.GeneratedNode";
        //});
    },
    getOutputZones: function (node) {
        var me = this;
        return node.data.nodeOutputs;
    },
    getInputZones: function (node) {
        var me = this;
        return node.data.nodeInputs;
    },
    /**
     * Returns true if the graph has a single root.
     *
     **/
    hasSingleRoot: function () {
        return this.getRoots().length === 1;
    },
    /**
     * Gets the root of the graph.
     * @returns {Object}
     **/
    getRoot: function () {
        return this.getRoots().first();
    },
    /**
     * Gets the nodes of the graph which are inputs of the node.
     * @param {Object} node
     * @return {Array}
     **/
    getIndependentNodes: function (node) {
        var me = this;
        var result = me.getConnections().where(function (x) {
            var cn = x.nodes.first(function (t) { return t === node.id; });
            if (cn) {
                var zone = me.getOutputZonesOfNode(cn, x.zones);
                return zone;
            }
            return false;
        }).select(function (x) {
            var cn = x.nodes.first(function (t) { return t !== node.id; });

            return me.getNodeById(cn);
        });

        return result;
    },

    getOutputZonesOfNode: function (nodeid, zones) {
        var me = this, res = me.getZonesOfNode(nodeid);
        return res.outputs.first(function (t) {
            return zones.some(function (x) {
                return x === t.id;
            });
        });
    },
    getInputZonesOfNode: function (nodeid, zones) {
        var me = this, res = me.getZonesOfNode(nodeid);
        return res.inputs.first(function (t) {
            return zones.some(function (x) {
                return x === t.id;
            });
        });
    },
    getZonesOfNode: function (nodeId) {
        var me = this;
        return {
            inputs: me.getNodeById(nodeId).data.nodeInputs,
            outputs: me.getNodeById(nodeId).data.nodeOutputs
        };
    },
    getZone: function (id) {
        var me = this, nodes = me.getNodes();
        return nodes.selectFirst(function (node) {
            var z = me.getZonesOfNode(node.id);
            return z.inputs.first(function (y) { return y.id === id; }) ||
                z.outputs.first(function (y) { return y.id === id; });
        });
    },
    getNodeByZone: function (zone) {
        var me = this, nodes = me.getNodes();
        return nodes.first(function (node) {
            var zd = me.getZonesOfNode(node.id);
            return zd.inputs.first(function (t) { return t === zone; }) ||
                zd.outputs.first(function (t) { return t === zone; })

        })
    },
    /**
     * Gets the node's input connections.
     * @param {Object} node
     * @returns {Array}
     **/
    getInputs: function (node) {
        var me = this;
        var inpedentnodes = me.getConnections().where(function (x) {

            var zones = x.zones.select(function (t) { return me.getZone(t); }).where();
            if (zones.length < 2) return false;
            var target = zones.first(function (t) { return !t.output; });
            return me.getNodeByZone(target) === node;
        }).select(function (x) {
            var zones = x.zones.select(function (t) { return me.getZone(t); });
            var input = zones.first(function (t) { return !t.output; });
            var output = zones.first(function (t) { return t.output; });
            var othernode = me.getNodeByZone(output);


            return {
                node: othernode,
                connection: output,
                to: input
            }
        });
        return inpedentnodes;
    },
    /**
     * Constructs the audio node.
     * @param {Object} node
     * @param {Array} inputs
     * @return {Object}
     **/
    constructAudioNode: function (node, inputs) {
        var me = this;
        switch (node.data.type) {
            case "MEPH.audio.graph.node.GainNode":
                return me.createGainNode(node, inputs);
            case 'MEPH.audio.graph.node.BiquadFilter':
                return me.createBiquadFilter(node, inputs);
            case 'MEPH.audio.graph.node.PannerNode':
                return me.createPannerNode(node, inputs);
            case 'MEPH.audio.graph.node.AudioBufferSourceNode':
                return me.createAudioBufferSourceNode(node, inputs);
            case 'MEPH.audio.graph.node.ChannelMergerNode':
                return me.createChannelMergerNode(node, inputs);
            case 'MEPH.audio.graph.node.ChannelSplitterNode':
                return me.createChannelSplitterNode(node, inputs);
            case 'MEPH.audio.graph.node.Convolver':
                return me.createConvolverNode(node, inputs);
            case 'MEPH.audio.graph.node.DelayNode':
                return me.createDelayNode(node, inputs);
            case 'MEPH.audio.graph.node.DynamicsCompressorNode':
                return me.createDynamicsCompressorNode(node, inputs);
            case 'MEPH.audio.graph.node.OscillatorNode':
                return me.createOscillatorNode(node, inputs);
            case 'MEPH.audio.graph.node.WaveShaperNode':
                return me.createWaveShaperNode(node, inputs);
            default:
                throw new Error('unhandled type : ' + node.data.type);
        }
    },
    createWaveShaperNode: function (node, inputs) {
        var me = this;
        return {
            node: node,
            buffer: me.getNodeInputValue(node, inputs, 'buffer'),
            curve: me.getNodeInputValue(node, inputs, 'curve'),
            oversample: me.getNodeInputValue(node, inputs, 'oversample')
        };
    },
    createOscillatorNode: function (node, inputs) {
        var me = this;
        return {
            node: node,
            buffer: me.getNodeInputValue(node, inputs, 'buffer'),
            detune: me.getNodeInputValue(node, inputs, 'detune'),
            frequency: me.getNodeInputValue(node, inputs, 'frequency'),
            type: me.getNodeInputValue(node, inputs, 'type')
        };
    },
    createDynamicsCompressorNode: function (node, inputs) {
        var me = this;
        return {
            node: node,
            buffer: me.getNodeInputValue(node, inputs, 'buffer'),
            knee: me.getNodeInputValue(node, inputs, 'knee'),
            ratio: me.getNodeInputValue(node, inputs, 'ratio'),
            reduction: me.getNodeInputValue(node, inputs, 'reduction'),
            release: me.getNodeInputValue(node, inputs, 'release'),
            threshold: me.getNodeInputValue(node, inputs, 'threshold'),
            attack: me.getNodeInputValue(node, inputs, 'attack')
        };
    },
    createDelayNode: function (node, inputs) {
        var me = this;
        return {
            node: node,
            buffer: me.getNodeInputValue(node, inputs, 'buffer'),
            delayTime: me.getNodeInputValue(node, inputs, 'delayTime')
        };
    },
    createConvolverNode: function (node, inputs) {
        var me = this;
        return {
            node: node,
            convobuffer: me.getNodeInputValue(node, inputs, 'convobuffer'),
            buffer: me.getNodeInputValue(node, inputs, 'buffer'),
            normalize: me.getNodeInputValue(node, inputs, 'normalize')
        };
    },
    createChannelSplitterNode: function (node, inputs) {
        var me = this;
        return {
            node: node,
            buffer: me.getNodeInputValue(node, inputs, 'buffer')
        };
    },
    createChannelMergerNode: function (node, inputs) {
        var me = this;
        return {
            node: node,
            buffer: me.getNodeInputValue(node, inputs, 'buffer'),
            buffer2: me.getNodeInputValue(node, inputs, 'buffer2'),
            buffer3: me.getNodeInputValue(node, inputs, 'buffer3'),
            buffer4: me.getNodeInputValue(node, inputs, 'buffer4')
        };
    },
    createAudioBufferSourceNode: function (node, inputs) {
        var me = this;
        return {
            node: node,
            source: me.getNodeInputValue(node, inputs, 'source'),
            loop: me.getNodeInputValue(node, inputs, 'loop'),
            loopEnd: me.getNodeInputValue(node, inputs, 'loopEnd'),
            loopStart: me.getNodeInputValue(node, inputs, 'loopStart'),
            playbackRate: me.getNodeInputValue(node, inputs, 'playbackRate')
        };
    },
    createPannerNode: function (node, inputs) {
        var me = this;
        return {
            node: node,
            coneInnerAngle: me.getNodeInputValue(node, inputs, 'coneInnerAngle'),
            coneOuterAngle: me.getNodeInputValue(node, inputs, 'coneOuterAngle'),
            coneOuterGain: me.getNodeInputValue(node, inputs, 'coneOuterGain'),
            refDistance: me.getNodeInputValue(node, inputs, 'refDistance'),
            maxDistance: me.getNodeInputValue(node, inputs, 'maxDistance'),
            rolloffFactor: me.getNodeInputValue(node, inputs, 'rolloffFactor'),
            panningModel: me.getNodeInputValue(node, inputs, 'panningModel'),
            buffer: me.getNodeInputValue(node, inputs, 'buffer')
        }
    },
    createBiquadFilter: function (node, inputs) {
        var me = this,
            q = me.getNodeInputValue(node, inputs, 'q'),
            frequency = me.getNodeInputValue(node, inputs, 'frequency'),
            gain = me.getNodeInputValue(node, inputs, 'gain'),
            type = me.getNodeInputValue(node, inputs, 'type'),
            detune = me.getNodeInputValue(node, inputs, 'detune'),
            buffer = me.getNodeInputValue(node, inputs, 'buffer');

        return {
            node: node,
            Q: q,
            frequency: frequency,
            detune: detune,
            gain: gain,
            type: type,
            buffer: buffer
        }
    },
    /**
     * Create gain node.
     * @param {Object} node
     * @param {Array} inputs
     * @return {Object}
     **/
    createGainNode: function (node, inputs) {
        var me = this,
            gain = me.getNodeInputValue(node, inputs, 'gain'),
            buffer = me.getNodeInputValue(node, inputs, 'buffer');

        return {
            node: node,
            gain: gain,
            buffer: buffer
        }
    },
    /**
     * Gets the nodes input value.
     * @param {Object} node
     * @param {Array} inputs
     * @param {String} name
     * @return {Number/String/Object}
     **/
    getNodeInputValue: function (node, inputs, name) {
        var me = this;
        var input = me.getNodeInput(node, name),
            value;
        if (!input) return null;
        switch (input.type) {
            case 'Number':
                value = isNaN(input.defaultValue) ? null : parseFloat(input.defaultValue);
                break;
            case 'Boolean':
                value = (input.defaultValue && input.defaultValue.toLowerCase() === 'true') ? true : false;
                break;
            default:
                value = input.defaultValue || null;
                break;
        }
        var inp = inputs.first(function (x) { return x.to.name === name; })
        if (inp) {
            return inp.connection;
        }
        return value;
    },
    getNodeInput: function (node, name) {
        return node.data.nodeInputs.first(function (x) { return x.name === name; })
    },
    /**
     * Gets node by id.
     * @param {String} id
     * @returns {Object}
     **/
    getNodeById: function (id) {
        var me = this;
        return me.getNodes().first(function (x) { return x.id === id; });
    }
});