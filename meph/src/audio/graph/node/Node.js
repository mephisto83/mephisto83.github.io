/**
 * @class MEPH.control.Control
 * Defines a base class for all controls and views.
 **/
MEPH.define('MEPH.audio.graph.node.Node', {
    requires: ['MEPH.util.Observable',
        'MEPH.graph.ActiveZone',
        'MEPH.util.Dom',
        'MEPH.audio.graph.node.controls.AudioRange',
        'MEPH.audio.graph.node.controls.AudioSelect',
        'MEPH.util.Style',
        'MEPH.audio.graph.node.controls.Control'],
    alias: 'audionode',
    templates: true,
    extend: 'MEPH.control.Control',
    statics: {
        AudioBuffer: 'AudioBuffer',
        Boolean: 'Boolean',
        Number: 'Number',
        Anything: 'Anything',
        String: 'String',
        Float32Array: 'Float32Array'
    },
    properties: {
        title: null,
        type: null,
        id: null,
        //x: null,
        y: null,
        sx: null,
        sy: null,
        refresh: 0,
        hideConnector: null,
        booleanSource: null,
        bufferTitle: '',
        normalizefill: '',
        normalizeTitle: '',
        numberFill: '',
        stringFill: '',
        controlverticalpadding: 4,
        inputoutputverticalpadding: 10,
        nodeInputs: null,
        nodeOutputs: null,
        booleanFill: '',
        audioBufferFill: '',
        bodyy: null,
        menuheightspace: 0,
        inputsy: 0,
        bodyry: 1,
        bodyrx: 1,
        bodystrokewidth: null,
        bodyfill: null,
        footerheight: null,
        headerfill: null,
        nodewidth: null,
        titlepadding: null,
        inputradius: 0,
        inputstroke: null,
        bodystroke: null,
        headerheight: null,
        titlepaddingtop: null
    },
    initialize: function () {
        var me = this;
        me.nodecontrols = me.nodecontrols || [];
        me.nodeInputs = MEPH.util.Observable.observable([]);
        me.nodeOutputs = MEPH.util.Observable.observable([]);
        me.id = MEPH.GUID();
        me.great();


        me.defineNodeDependentProperties();
    },
    /**
     * Gets the relative position of an element to the node.
     * @param {Object} el
     * @return {Object}
     **/
    getRelPosition: function (el) {
        var me = this;
        // viewport.connectionFlow.zone
        var top = me.svg;
        var transform = me.svg.getTransformToElement(el)
        var result = {
            x: transform.e,
            y: transform.f
        }
        return result;
    },
    /**
     * Setup the active control zones.
     * @param {Object} viewport
     * @param {Object} node
     ***/

    setupActiveControlZones: function (viewport, node) {
        var me = this;

        if (me.nodecontrols)
            me.nodecontrols.foreach(function (x) {
                me.setActiveControlZone(x, viewport, node);
            });
    },
    getCorrespondingMatch: function (x) {
        var me = this;
        var input = me.nodeInputs.first(function (t) {
            return t.name + 'input' === x || t.name === x;
        });

        input = input || me.nodeOutputs.first(function (t) {
            return t.name + 'output' === x || t.name === x;
        });

        var res = me.getCorrespondingControl(x);

        if (res && !input) {
            return me.getInputNodeObject(res);
        }
        return input;
    },
    getCorrespondingControls: function () {
        var me = this;

        me.$correspondingcontrols = me.$correspondingcontrols || [];
        return me.$correspondingcontrols;
    },
    getCorrespondingControl: function (nodeput) {
        var me = this;
        return me.getCorrespondingControls().first(function (x) {
            if (typeof nodeput === 'string')
                return x.name === nodeput;

            return x.inout === nodeput;
        })
    },
    addCorrespondingControl: function (name, input) {
        var me = this;
        me.getCorrespondingControls().push({
            name: name, inout: input
        });
    },
    getInputNodeObject: function (res) {
        return res.inout;
    },
    setActiveControlZone: function (x, viewport, node) {
        var me = this;

        viewport = viewport || me.$viewport;
        node = node || me.$node;
        if (me[x]) {
            var input = me.getCorrespondingMatch(x);
            var zone = viewport.requestZone(node, {
                managed: true,
                id: input.id,//node.getId() + '-' + x + '-connector',
                type: MEPH.graph.ActiveZone.type.connector,
                property: x,
                dom: me[x].connector,
                connectortype: input.type
            });
            zone.$options.option = {
                canConnect: me.canConnect.bind(me),
                isOutput: !me[x].left
            };
        }
    },
    onLoaded: function () {
        var me = this;
        me.nodex = 0;
        me.bodyrx = 10;
        me.bodyry = 10;
        me.bodystrokewidth = 2;
        me.bodyy = 0;
        me.title = me.title || 'Node';
        me.nodewidth = me.nodewidth || 170;
        me.titlepadding = 15;
        me.footerheight = 15;
        me.headerheight = 24;
        me.titlepaddingtop = 17;
        me.booleanFill = me.booleanFill || '#FAF332';
        me.audioBufferFill = me.audioBufferFill || '#3AF3F2';
        me.numberFill = '#3e3e11';
        me.stringFill = '#de31f1';
        me.bodyfill = "rgb(90,90,90)";
        me.headerfill = "rgb(79,79,79)";
        me.inputradius = me.inputradius || 8;
        me.inputstroke = 'black';
        me.bodystroke = "rgb(234,168,68)";
        if (me.bufferoutput)
            me.bufferoutput.left = false;
        me.bufferTitle = 'buffer';
        me.booleanSource = ['true', 'false'];
        me.normalizeTitle = 'normalize';
        me.applyNodeInputsAndOutputs();
        //setTimeout(function () {
        //    me.nodeg.setAttributeNS(null, "id", "node" + (me.id || MEPH.GUID()));
        //}, 1000)
    },
    applyNodeInputsAndOutputs: function () {
        var me = this;
        me.nodeInputs.foreach(function (input) {
            input.canConnect = me.canConnect.bind(me);
            input.isOutput = false;
            if (me[input.name] && input.defaultValue) {
                me[input.name].value = input.defaultValue;
            }
        });
        me.nodeOutputs.foreach(function (input) {
            input.canConnect = me.canConnect.bind(me);
            input.isOutput = false;
            if (me[input.name] && input.defaultValue) {
                me[input.name].value = input.defaultValue;
            }
        });
    },
    involvedInConnections: function (zone) {
        var me = this;
        return me.graph.getConnections().where(function (x) {
            return x.getZones().contains(zone);
        });
    },
    inAConnection: function (zone1, zone2) {

        var me = this;
        return me.graph.getConnections().where(function (x) {
            return x.getZones().contains(zone1) && x.getZones().contains(zone2);
        }).length > 0;
    },
    isOutput: function (zone) {
        return zone.isOutput();
    },
    checkZoneTypeCompatibility: function (zone1, zone2) {
        var me = this;
        if (me.getZoneType(zone1) === MEPH.audio.graph.node.Node.String ||
            me.getZoneType(zone2) === MEPH.audio.graph.node.Node.String) {
            return me.getZoneType(zone1) === me.getZoneType(zone2);
        }
        return true;
    },
    canConnect: function (zone1, zone2) {
        var me = this;

        if (zone1.getNode() === zone2.getNode()) {
            return false;
        }
        if (me.isOutput(zone1) !== !me.isOutput(zone2)) {
            return false;
        }
        if (!(me.getZoneType(zone1) === 'Anything' || me.getZoneType(zone2) === 'Anything'))
            if (!me.isOutput(zone1) && me.involvedInConnections(zone1).length > 0) {//
                return false;
            }

        if (!me.checkZoneTypeCompatibility(zone1, zone2)) {
            return false;
        }
        if (me.inAConnection(zone1, zone2)) {
            return false;
        }
        return true;
    },
    removeNodeOutput: function (output) {
        var me = this;
        me.nodeOutputs.removeWhere(function (t) { return t === output; });
    },
    removeNodeInput: function (input) {
        var me = this;
        me.nodeInputs.removeWhere(function (t) { return t === input; });
    },
    addNodeInput: function (name, type, id) {
        var me = this;
        if (!me.nodeInputs.some(function (x) { return x.id === id; })) {
            var res = me.createInput(name, type)
            res.id = id;
            me.nodeInputs.push(res);
            return res;
        }
        return false;
    },
    addNodeOutput: function (name, type, id) {
        var me = this;
        if (!me.nodeOutputs.some(function (x) { return x.id === id; })) {
            var res = me.createOutput(name, type)
            res.id = id;
            me.nodeOutputs.push(res);
            return res;
        }
        return false;
    },
    getZoneType: function (zone) {
        var me = this;
        if (zone && zone.$options && zone.$options.option) {
            return zone.$options.connectortype;
        }
        return null;
    },
    setupActiveZones: function (viewport, node) {
        var me = this;
        me.$viewport = viewport;
        me.$node = node;
        me.setupActiveHeaderZone(viewport, node);
        me.setupActiveControlZones(viewport, node);
    },
    setupConnectingListeners: function () {


    },
    updatedValue: function (prop) {
        var me = this;
        var value = MEPH.Array(arguments).last().domEvent.value;
        me.setNodeInputDefaultValue(prop, value);
    },
    setNodeInputDefaultValue: function (prop, value) {
        var me = this;
        var input = me.nodeInputs.first(function (t) {
            return t.name === prop;
        });

        input = input || me.nodeOutputs.first(function (t) {
            return t.name === prop;
        });

        if (input) {
            input.defaultValue = value;
        }
    },
    /**
     * Setup the active header zone.
     * @param {Object} viewport
     * @param {Object} node
     ***/
    setupActiveHeaderZone: function (viewport, node) {
        var me = this;
        viewport.requestZone(node, {
            managed: true,
            id: node.getId() + '-header',
            type: MEPH.graph.ActiveZone.type.header,
            dom: me.body
        });

        me.don('mousedown', [me.body, me.container, me.inputs], function () {
            me.svg.parentNode.appendChild(me.svg);
        }, me);
        me.don('close', [me.svg], function (e) {
        });
        me.graphnode = node;
        me.graphnode.on('removed', function () {
            me.closeNode();
        })
    },
    closeNode: function () {
        var me = this;
        if (me.graph && me.graphnode)
            me.graph.removeNode(me.graphnode);
        me.destroy();
    },
    defineNodeDependentProperties: function () {
        var me = this;
        me.definePositionProperty();
        me.defineNodeHeightProperty();
        me.definerHeaderBufferProperties();
        me.defineBodyHeightProperty();
        me.defineBodyWidthProperty();
        me.defineBodyXProperty();
        me.defineTitleProperties();
    },
    definePositionProperty: function () {

    },
    heightchanged: function () {
        var me = this;
        me.refresh += 1;
    },
    defineNodeHeightProperty: function () {
        var me = this;
        me.nodecontrols = me.nodecontrols || [];
        var noncontrols = ['headerheight', 'footerheight', 'refresh'];
        var nodeheightdp = me.nodecontrols.concat(noncontrols);

        MEPH.util.Observable.defineDependentProperty('nodeheight', me, nodeheightdp, function () {
            var result = (me.titlepaddingtop || 0);
            nodeheightdp.foreach(function (t, i) {
                var temp = t;
                if (!noncontrols.some(function (z) { return z === t; })) {
                    temp += '.height';
                }
                result += parseFloat(MEPH.getPathValue(temp, me) || 0);
            })
            result += (me.controlverticalpadding || 0) * me.nodecontrols.length;
            result += (me.inputoutputverticalpadding || 0);
            Style.height(me.svg, result);
            return result;
        });
        MEPH.util.Observable.defineDependentProperty('inputoutputposition', me, ['headerbuffer'], function () {
            var result = parseFloat(me.headerbuffer || 0);
            result += (me.inputoutputverticalpadding || 0);
            return result;
        });
        me.controlsOffsets(me.nodecontrols);

    },
    defineTitleProperties: function () {
        var me = this;

        MEPH.util.Observable.defineDependentProperty('menutransform', me, ['headerbuffer', 'inputsx', 'menuheight'], function () {
            var result = parseFloat(me.headerbuffer || 0) - parseFloat(me.menuheight || 0);

            return 'translate(' + (me.inputsx || 0) + ',' + (result) + ')';
        });

        MEPH.util.Observable.defineDependentProperty('inputtransform', me, ['inputoutputposition', 'inputsx', 'inputsy'], function () {
            var result = 'translate(' + (me.inputsx || 0) + ',' + ((me.inputoutputposition || 0) + (me.inputsy || 0)) + ')';

            return result;
        });

        MEPH.util.Observable.defineDependentProperty('titlex', me, ['titlepadding', 'titlepaddingtop'], function () {
            var result = (me.titlepadding || 0);

            return result;
        });

        MEPH.util.Observable.defineDependentProperty('titley', me, ['titlepadding', 'titlepaddingtop'], function () {
            var result = (me.titlepaddingtop || 0);

            return result;
        });
    },
    defineBodyXProperty: function () {
        var me = this;
        ///bodyheight
        MEPH.util.Observable.defineDependentProperty('inputsx', me, ['inputradius'], function () {
            var result = (me.inputradius || 0)
            return result;
        });

        MEPH.util.Observable.defineDependentProperty('nodex', me, ['inputradius'], function () {
            var result = (me.inputradius || 0)
            return result;
        });

        MEPH.util.Observable.defineDependentProperty('bodyx', me, ['nodex', 'bodystrokewidth'], function () {
            var result = (parseFloat(me.nodex) || 0) + (me.bodystrokewidth || 0);
            return result;
        });

        MEPH.util.Observable.defineDependentProperty('iconX', me, ['nodewidth', 'bodystrokewidth'], function () {
            var result = (parseFloat(me.nodewidth) || 0) + (me.bodystrokewidth || 0);
            return result - 12;
        });
        MEPH.util.Observable.defineDependentProperty('iconY', me, ['titley'], function () {
            return 5;
        });


    },
    defineBodyHeightProperty: function () {
        var me = this;

        MEPH.util.Observable.defineDependentProperty('bodyheight', me, ['nodeheight', 'headerheight', 'footerheight'], function () {
            var result = me.nodeheight - (me.headerheight || 0) - (me.footerheight || 0);
            return result;
        });
    },
    controlsOffsets: function (offsets) {
        //var offsets = ['buffery'];
        var me = this;
        [].interpolate(0, offsets.length + 1, function (x) {
            if (x) {
                MEPH.util.Observable.defineDependentProperty(offsets[x - 1] + 'y', me, offsets.subset(0, x - 1).concat(['headerbuffer', 'refresh']), function (osets) {
                    var result = 0;

                    osets.foreach(function (t) {
                        var temp = t + '.height';
                        var vv = MEPH.getPathValue(temp, me);
                        result += parseFloat(vv || 0) + (me.controlverticalpadding || 0);
                    });
                    return result;
                }.bind(me, offsets.subset(0, x - 1)));
            }
        })
    },
    getControlVerticalOffset: function (name) {
        var me = this;
        var offsets = me.nodecontrols.subset(0, me.nodecontrols.indexWhere(function (x) { return x === name; }).first());

        offsets = offsets.concat(['headerbuffer']);
        var sum = 0;
        offsets.foreach(function (t) {
            var temp = t + '.height';
            var vv = MEPH.getPathValue(temp, me);
            sum += parseFloat(vv || 0) + (me.controlverticalpadding || 0);
        });
        return sum;
    },
    defineBodyWidthProperty: function () {
        var me = this;

        MEPH.util.Observable.defineDependentProperty('bodywidth', me, ['inputradius', 'nodewidth', 'bodystrokewidth'], function () {
            var result = me.nodewidth - (me.bodystrokewidth * 2 || 0);
            Style.width(me.svg, (parseFloat(me.nodewidth) || 0) + (parseFloat(me.inputradius) * 2 || 0));
            return result;
        });
    },
    /**
     * Defines the header buffer property
     */
    definerHeaderBufferProperties: function () {
        var me = this;

        MEPH.util.Observable.defineDependentProperty('menuheight', me, ['menuheightspace'], function () {
            var result = me.menuheightspace || 0;
            return result;
        });

        MEPH.util.Observable.defineDependentProperty('headerbuffer', me, ['headerheight', 'menuheight'], function () {
            var result = 0;
            ['menuheight', 'headerheight'].foreach(function (x) {
                if (me[x]) {
                    result += me[x];
                }
            });
            return result;
        });
    },
    createInput: function (name, type, options) {
        return {
            name: name.nodename(),
            title: name,
            type: type,
            connector: null,
            id: MEPH.GUID(),
            options: options || null,
            output: false
        }
    },
    createOutput: function (name, type) {
        return {
            name: name.nodename(),
            title: name,
            type: type,
            connector: null,
            id: MEPH.GUID(),
            output: true
        }
    }
});