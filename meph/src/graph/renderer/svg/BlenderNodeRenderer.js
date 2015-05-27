/**
* @class MEPH.graph.Graph
* Creates a graph.
*/
MEPH.define('MEPH.graph.renderer.svg.BlenderNodeRenderer', {
    requires: ['MEPH.util.SVG',
                'MEPH.graph.ActiveZone'],
    properties: {
        rowHeight: 26,
        colorBoxWidth: 30,
        offsetFromLeft: 10,
        labelFontSize: 15,
        rowTopPadding: 0,
        labelPaddingLeft: 10,
        labelPaddingRight: 20,
        colorBoxRadius: 4,
        selectBoxOffset: -10,
        connectorOffsetTop: 10,
        colorBoxHeight: 20,
        connectorRadius: 4,
        rowBottomPadding: 0,
        offsetFromTop: 34,
        headerHeight: 30,
        headerWidth: 198,
        titleWidth: 85,
        nodeWidth: 200,
        drawCanvas: true
    },
    initialize: function (graphviewport) {
        var me = this;
        MEPH.Events(me);
        me.$graphviewport = graphviewport;
    },
    renderNode: function (node, canvas, offset) {
        var me = this;
        var position = node.getPosition();
        var title = node.getTitle();
        me.renderer.setCanvas(canvas);
        me.draw({
            x: position.x + offset.x,
            y: position.y + offset.y,
            title: title,
            node: node,
            nodeInputs: node.getNodeInputs(),
            nodeOutputs: node.getNodeOutputs()
        });
    },
    getColorByType: function (option) {
        var fillstyle, me = this;
        fillstyle = me.getColor(option.languageType);
        return fillstyle;
    },
    getColor: function (languageType) {
        var me = this;

        switch (languageType) {
            case 'array':
                return 'CornflowerBlue';
            case 'function':
                return 'red';
            case 'context':
            case 'then':
            case 'else':
                return 'green';
            case 'number':
            case 'variable':
            case 'bool':
            case 'string':
                return 'blue';
            case 'operator':
                return 'purple';
            default:
                return 'yellow';
        }
    },
    requestZone: function (node, options) {
        var me = this;
        if (!options.customonly) {
            me.$graphviewport.requestZone(node, options);
        }
    },
    colorLabel: function (x, y, option, right) {
        var me = this, fillstyle;
        fillstyle = me.getColorByType(option);
        var node = option.node;
        var text = {
            text: option.title.substr(0, 20),
            textAlign: option.textAlign,
            shape: 'text',
            textBaseline: "top",
            font: me.labelFontSize + 'px Verdana',
            fillStyle: 'black',
            x: x + (right ? -(me.colorBoxWidth + me.labelPaddingRight) : me.colorBoxWidth + me.labelPaddingLeft),
            y: y
        }
        var _x = x + (right ? -(me.colorBoxWidth + me.labelPaddingLeft) : 0);
        var _y = y;
        if (!(option.node && option.node.$data && option.node.$data.customonly)) {
            var zone = me.$graphviewport.requestZone(node, {
                id: option.id + '-title',
                type: MEPH.graph.ActiveZone.type.title,
                option: option,
                x: _x + (right ? -(me.colorBoxWidth + me.labelPaddingRight) : me.colorBoxWidth + me.labelPaddingLeft),
                height: me.colorBoxHeight,
                width: me.titleWidth,
                y: _y
            });
            me.$graphviewport.requestZone(node, {
                id: option.id + '-color',
                type: MEPH.graph.ActiveZone.type.color,
                option: option,
                x: _x,
                height: me.colorBoxHeight,
                width: me.colorBoxWidth,
                y: _y
            });
        }
        return [{
            x: _x,
            y: _y,
            shape: 'rectangle',
            strokeStyle: null,
            fillStyle: fillstyle,
            radius: me.colorBoxRadius,
            height: me.colorBoxHeight,
            width: me.colorBoxWidth
        }, text]
    },
    createOutOptions: function (node, array, x, y) {
        var result = [], me = this;
        array.foreach(function (option, index) {
            var fillstyle;
            option.node = node;
            option.textAlign = 'end';
            var _y = y + me.connectorOffsetTop + (index * (me.rowHeight + me.rowTopPadding));
            var _x = x + me.nodeWidth;
            result = result.concat(me.colorLabel(me.nodeWidth + x, y + (index * (me.rowHeight + me.rowTopPadding)), option, true));
            result.push({
                fillStyle: me.getColorByType(option),// fillstyle,
                strokeStyle: 'black',
                shape: MEPH.util.Renderer.shapes.circle,
                radius: me.connectorRadius,
                y: _y,
                x: _x
            });

            me.$graphviewport.requestZone(node, {
                id: option.id,
                option: option,
                type: MEPH.graph.ActiveZone.type.connector,
                radius: me.connectorRadius,
                width: me.connectorRadius * 2,
                height: me.connectorRadius * 2,
                x: _x - me.connectorRadius,
                y: _y - me.connectorRadius
            });
        });
        return result;
    },
    createInOptions: function (node, array, x, y) {
        var result = [], me = this;
        array.foreach(function (option, index) {
            var fillstyle;
            option.textAlign = 'start';
            option.node = node;
            result = result.concat(me.colorLabel(x, y + (index * (me.rowHeight + me.rowTopPadding)), option));
            var _y = y + me.connectorOffsetTop + (index * (me.rowHeight + me.rowTopPadding));
            var _x = x + (-me.offsetFromLeft);
            result.push({
                fillStyle: me.getColorByType(option),// fillstyle,
                strokeStyle: 'black',
                shape: MEPH.util.Renderer.shapes.circle,
                radius: me.connectorRadius,
                y: _y,
                x: _x
            });

            me.$graphviewport.requestZone(node, {
                id: option.id,
                option: option,
                radius: me.connectorRadius,
                type: MEPH.graph.ActiveZone.type.connector,
                width: me.connectorRadius * 2,
                height: me.connectorRadius * 2,
                x: _x - me.connectorRadius,
                y: _y - me.connectorRadius
            });
        });
        return result;
    },
    /**
     * Renders the nodes.
     * @param {Array} nodes
     */
    render: function (nodes) {
        var me = this;
        if (nodes) {
            var unrendered = nodes.where(function (x) { return !x[' blendersvgid']; });
            unrendered.foreach(function (x) {
                me.setBlenderSVGID(x);
                x.$data.setupActiveZones(me.$graphviewport, x)
            });
            
            nodes.foreach(function (node) {
                var position = node.getPosition();
                var offset = me.$graphviewport.getPosition();
                node.$data.sx = position.x + offset.x;
                node.$data.sy = position.y + offset.y;
            });
        }
    },
    setBlenderSVGID: function (node) {
        var me = this;
        node[' blendersvgid'] = MEPH.GUID();
    },
    draw: function (options) {
        // Create Linear Gradients
        var me = this, temp = me.options(options);
        var node = options.node;
        var text = {
            text: options.title,
            shape: 'text',
            font: '17px Verdana',
            fillStyle: 'black',
            x: options.x + 30 || 0,
            y: options.y + 13 || 0
        }
        if (!me.rendered) {
            //   me.rendered = true;

            var inoptions = node.$data.customonly ? [] : me.createInOptions(node, options.nodeInputs, options.x + me.offsetFromLeft, options.y + me.offsetFromTop + options.nodeOutputs.length * me.rowHeight);
            var outoptions = node.$data.customonly ? [] : me.createOutOptions(node, options.nodeOutputs, options.x, options.y + me.offsetFromTop);
            var _x = options.x + 1;
            var _y = options.y + 1;
            var headerOptions = {
                shape: 'rectangle',
                fillStyle: null,
                gradientFillStyle: {
                    x0: options.x,
                    y0: options.y,
                    x1: options.x,
                    y1: options.y + 25,
                    colorStops: [{ stop: 0, color: "#A5A5A5" },
                    { stop: 0.4, color: "#A5A5A5" },
                    { stop: 0.5, color: "#A5A5A5" },
                    { stop: 1, color: "#A5A5A5" }]
                },
                x: _x || 0,
                y: _y || 0,
                strokeStyle: "",
                lineWidth: 0,
                width: me.headerWidth,
                height: me.headerHeight,
                radius: { upperLeft: 10, upperRight: 10, lowerLeft: 0, lowerRight: 0 }
            };
            var selectBoxOffsetOptions = {
                shape: 'rectangle',
                fillStyle: null,
                gradientFillStyle: {
                    x0: options.x,
                    y0: options.y,
                    x1: options.x,
                    y1: options.y + 25,
                    colorStops: [{ stop: 0, color: "#00A5A5" },
                    { stop: 0.4, color: "#A5A500" },
                    { stop: 0.5, color: "#A5A5A5" },
                    { stop: 1, color: "#A500A5" }]
                },
                x: (_x + me.headerWidth + me.selectBoxOffset) || 0,
                y: _y || 0,
                strokeStyle: "",
                lineWidth: 0,
                width: me.selectBoxWidth || 10,
                height: me.selectBoxHeight || 10,
                radius: { upperLeft: 2, upperRight: 10, lowerLeft: 0, lowerRight: 2 }
            };

            if (node.getId() && !node.$data.customonly) {

                me.$graphviewport.requestZone(node, {
                    id: node.getId() + '-header',
                    type: MEPH.graph.ActiveZone.type.header,
                    radius: me.connectorRadius,
                    width: me.headerWidth,
                    height: me.headerHeight,
                    x: _x,
                    y: _y
                });

                me.$graphviewport.requestZone(node, {
                    id: node.getId() + '-selectBox',
                    type: MEPH.graph.ActiveZone.type.select,
                    radius: me.connectorRadius,
                    width: me.selectBoxWidth || 10,
                    height: me.selectBoxHeight || 10,
                    x: (_x + me.headerWidth + me.selectBoxOffset) || 0,
                    y: _y || 0
                });
            }
            if (options.node.$data && options.node.$data.template) {
                me.$graphviewport.requestZone(node, {
                    id: node.getId() + '-template',
                    type: MEPH.graph.ActiveZone.type.custom,
                    template: options.node.$data.template,
                    x: _x,
                    y: _y
                });
            }
            headerOptions = me.options(headerOptions, options);
        }
        if (me.drawCanvas) {
            me.renderer.draw([temp, headerOptions, selectBoxOffsetOptions, text].concat(inoptions).concat(outoptions));
        }
        return true;
    },
    options: function (options, temp) {
        var me = this;
        temp = temp || {
            shape: 'rectangle',
            fillStyle: '#727272',
            x: 8,
            y: 8,
            strokeStyle: "#F15800",
            lineWidth: 1,
            width: me.nodeWidth,
            height: me.offsetFromTop + (options.nodeInputs.length + options.nodeOutputs.length) * me.rowHeight,
            radius: 10
        };
        for (var i in options) {
            temp[i] = options[i];
        }
        return temp;
    }
});