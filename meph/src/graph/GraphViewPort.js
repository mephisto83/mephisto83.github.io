/// <reference path="GraphViewPort.js" />
/**
* @class MEPH.graph.GraphViewPort
*/
MEPH.define('MEPH.graph.GraphViewPort', {
    requires: ['MEPH.math.J3DIVector3',
                'MEPH.graph.ActiveZone',
                'MEPH.util.Style'],
    properties: {
        noViewPortDrag: false,
        maskDownZIndex: 10,
        maskUpZIndex: 20,
        isDestroyed: false,
        connectionFlow: null,
        maxSelectionDistance: 30,
        cancelDragging: false,
        boundaries: null,
        templates: null,
        selectConnectionOnClick: false,
        resizeDelay: 1000,
        boundaryRetensionSpeed: .91,
        fullwindow: false
    },
    statics: {
        start_connection: 'start_connection',

        create: function (graph, size, selector, holder) {;
            selector = selector || 'body';
            var graphviewport = new MEPH.graph.GraphViewPort();
            var graphrenderer = new MEPH.graph.GraphRenderer();
            var connectionrenderer = new MEPH.graph.renderer.ConnectionRenderer();
            var blenderNode = new MEPH.graph.renderer.BlenderNode(graphviewport);

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
    initialize: function () {
        var me = this;
        MEPH.Events(me);
        me.$activeZones = MEPH.util.Observable.observable([]);
        me.$templates = [];
        me.$selectedConnections = MEPH.util.Observable.observable([]).on('onpush', me.onSelectedConnectionAdded.bind(me));
        me.setPosition(0, 0, 0);
    },
    onSelectedConnectionAdded: function (type, options) {
        var me = this;
        var _connections = options.added;
        var connections = [].interpolate(0, _connections.length, function (x) {
            return _connections[x];
        });
        connections.foreach(function (connection) {
            connection.on('removed', function () {
                me.getSelectedConnections().removeWhere(function (x) { return x === connection; });
            });
        });
    },
    setGraph: function (graph) {
        var me = this;
        me.$graph = graph;
        me.$graph.$viewport = me;
        me.$graph.on('change', me.onGraphChange.bind(me));
        return me;
    },
    destroy: function () {
        var me = this;
        var dock = me.getDock();
        if (dock && dock.parentNode) {
            dock.parentNode.removeChild(dock);
        }
        me.isDestroyed = true;
    },
    onGraphChange: function (args) {
        var me = this;
        args.viewport = {
            position: me.getPosition()
        };
        me.fire('change', args);
    },
    getGraph: function () {
        var me = this;
        return me.$graph;
    },
    setRenderer: function (renderer) {
        var me = this;
        me.$renderer = renderer;
    },

    getRenderer: function () {
        var me = this;
        return me.$renderer;
    },
    refresh: function () {
        var me = this;
        me.onGraphChange({});
    },
    setup: function (selector, options) {
        var me = this;
        var target = document.querySelector(selector);
        var dock = document.createElement('div');
        var canvas = document.createElement(options && options.element ? options.element : 'canvas');
        canvas.style.position = 'absolute';
        canvas.style.zIndex = 3;
        options = options || { height: 400, width: 450 };
        target.appendChild(dock);
        dock.appendChild(canvas);
        me.setCanvas(canvas);
        me.setCanvasSize({ height: options.height, width: options.width });
        me.setDock(dock);
        me.applyMask(dock);
    },
    setHolder: function (holder) {
        var me = this;
        if (typeof (holder) === 'string') {
            holder = document.querySelector(holder);
        }
        me.holder = holder;
    },
    setPosition: function (x, y, z) {
        var me = this;
        if (me.isMoving(x, y, z)) {
            me.$position = new J3DIVector3(x, y, z);
            me.fire('moved', { node: me });
        }
    },
    isMoving: function (x, y, z) {
        var me = this, position = me.getPosition();
        if (position) {
            return !(position.x == x && position.y == y && position.z == z);
        }
        return true;
    },
    getPosition: function () {
        var me = this;
        if (me.$position) {
            return {
                x: me.$position[0],
                y: me.$position[1],
                z: me.$position[2]
            }
        }
        return null;
    },
    getRelPosition: function (ee) {
        var me = this,
            viewport = me;
        var xy = viewport.getXY(ee);
        var dompos = viewport.maskDomPosition();
        return {
            x: xy.x - dompos.x,
            y: xy.y - dompos.y
        };
    },
    onClick: function (ee) {
        var me = this;
        var relpos = me.getRelPosition(ee);
        var connection = me.getGraph().getConnections().minSelect(function (connection) {
            return connection.distanceFrom(relpos)
        });
        if (connection) {
            if (connection.distanceFrom(relpos) < me.maxSelectionDistance) {
                me.selectionConnection(connection);
            }
        }
    },
    onDblClick: function () {

        var me = this;
        if (me.connectionFlow && me.connectionFlow.state === MEPH.graph.GraphViewPort.start_connection) {
            me.connectionFlow = null;
            me.fire('viewportconnectionflowclear', {});
        }
    },
    onConnectorClick: function (activezone) {
        var me = this;
        if (me.connectionFlow == null) {
            me.connectionFlow = {
                zone: activezone,
                state: MEPH.graph.GraphViewPort.start_connection
            }
            me.fire('startconnection', { zone: activezone });
        }
        else if (me.connectionFlow && me.connectionFlow.state === MEPH.graph.GraphViewPort.start_connection) {
            var connectionHandler = me.getConnectionHandler()
            if (connectionHandler) {
                if (MEPH.graph.ActiveZone.canCreateConnection(me.connectionFlow.zone, activezone)) {
                    var result = connectionHandler.createConnection([me.connectionFlow.zone, activezone]);
                    if (result) {
                        me.connectionFlow = null;
                        me.fire('viewportconnectionflowcomplete', {});
                    }
                }
            }
        }
    },
    createConnection: function (zones) {
        var me = this,
            connectionHandler = me.getConnectionHandler();
        if (connectionHandler) {
            return connectionHandler.createConnection(zones);
        }
        return null;
    },
    getConnectionHandler: function () {
        var me = this;
        return me.$connectionHandler;
    },
    setConnectionHandler: function (handler) {
        var me = this;
        me.$connectionHandler = handler;
        return me;
    },
    requestZone: function (node, options) {
        var activezone,
            me = this;
        activezone = me.getActiveZones().first(function (x) {
            return x.id == options.id;
        })
        if (!activezone) {
            activezone = new ActiveZone();
            activezone.setNode(node);
            activezone.setGraphViewPort(me);
            activezone.setZoneType(options.type);
            activezone.setOptions(options);
            switch (options.type) {
                case ActiveZone.type.color:
                    activezone.on('click', activezone.onColorZoneClick.bind(activezone));
                    activezone.on('change', me.onActiveZoneChange.bind(me));
                    activezone.clickable();
                    break;
                case ActiveZone.type.title:
                    activezone.on('click', activezone.onTitleZoneClick.bind(activezone));
                    activezone.clickable();
                    break;
                case ActiveZone.type.connector:
                    activezone.on('click', me.onConnectorClick.bind(me, activezone));
                    activezone.clickable();
                    break;
                case ActiveZone.type.select:
                    activezone.clickable();
                    break;
                case ActiveZone.type.header:
                    activezone.draggable();
                    break;
                case ActiveZone.type.custom:
                    break
            }
            activezone.on('activezone_dragstart', me.activeZoneDrag.bind(me, activezone, node));
            var dom = me.createZoneDom(options, node);
            activezone.setDom(dom);
            activezone.on('destroy', function (zone) {
                me.getActiveZones().removeWhere(function (x) { return x === zone; });
            });
            me.getActiveZones().push({
                zone: activezone,
                id: options.id
            });
            me.fire('newactivezone', { id: options.id, zone: activezone });
        }

        else {
            activezone = activezone.zone;
        }
        activezone.ignoreCanvas = me.ignoreCanvas;
        activezone.setPosition(options.x, options.y, 0);
        return activezone;
    },
    activeZoneDrag: function (activezone, node, type, ee) {
        var me = this;
        Style.zIndex(me.getMask(), me.maskUpZIndex);

        if (!me.isDraggingNode) {
            me.setDragData(ee.evt);
            me.isDraggingNode = {
                activezone: activezone,
                node: node,
                startPos: node.getPosition()
            }
        }
    },
    addTemplate: function (selector) {
        var me = this;
        me.$templates.push(selector);
    },
    getTemplates: function () {
        var me = this;
        return me.$templates;
    },
    createZoneDom: function (options, graphnode) {
        var template,
            me = this,
            div = document.createElement('div'),
            dom;

        switch (options.type) {
            case ActiveZone.type.custom:
                template = options.template.selector;
                // me.getTemplates().first(function (x) { return x === options.template.selector; });
                if (template) {
                    dom = document.querySelector(template);
                    var newnode = dom.content.cloneNode(true);
                    div.classList.add('custom');
                    div.appendChild(newnode);
                    if (options.template) {
                        for (var i in options.template.style) {
                            div.style[i] = options.template.style[i];
                        }
                        if (options.template.promise && typeof (options.template.promise) === 'function') {
                            options.template.promise(div, newnode, graphnode);
                        }
                        if (options.template.handlers) {
                            for (var selector in options.template.handlers) {
                                var handlers = options.template.handlers[selector];
                                ConvertToList(div.querySelectorAll(selector))
                                    .foreach(function (item) {
                                        for (var evt in handlers) {
                                            item.addEventListener(evt, handlers[evt].bind(me, graphnode));
                                        }
                                    });
                            }
                        }
                    }
                }

                break;
            default:
                Style.width(div, options.width);
                Style.height(div, options.height);
                Style.backgroundColor(div, 'rgba(1,1,1,0)');
                Style.translate(div, options.x, options.y);
                Style.position(div, 'absolute');
                break;
        }
        return div;
    },
    getActiveZones: function () {
        var me = this;
        return me.$activeZones;
    },
    clear: function () {
        var me = this;
        me.getActiveZones().removeWhere(function () { return true; });
        me.getSelectedConnections().removeWhere(function () { return true; });
        me.getRenderer().clear();
    },
    setDock: function (dock) {
        var me = this;
        if (dock.style) {
            dock.style.overflow = 'hidden';
        }
        me.$dock = dock;
    },
    getCanvasBag: function () {
        var me = this;
        return me.getDock();
    },
    getDock: function () {
        var me = this;
        return me.$dock || null;
    },
    setCanvas: function (canvas) {
        var me = this;
        if (me.$canvas) {
            me.$canvas.parentNode.removeChild(me.$canvas);
        }
        me.$canvas = canvas;
        return me;
    },
    getCanvas: function () {
        var me = this;
        return me.$canvas;
    },
    applyMask: function (target) {
        var me = this,
            size = me.getCanvasSize();
        me.$mask = me.$mask || document.createElement('div');
        me.$mask.style.height = size.height + 'px';
        me.$mask.style.width = size.width + 'px';
        Style.zIndex(me.$mask, me.maskDownZIndex);
        me.$mask.style.position = 'absolute';
        (target || document.body).appendChild(me.$mask);
        me.$mask.addEventListener('mousedown', me.onMaskMouseDown.bind(me));
        me.$mask.addEventListener('mouseup', me.onMaskMouseUp.bind(me));
        me.$mask.addEventListener('mouseout', me.onMaskMouseOut.bind(me));
        me.$mask.addEventListener('mousemove', me.onMaskMouseMove.bind(me));
        me.$mask.addEventListener('dblclick', me.onDblClick.bind(me));
        me.$mask.addEventListener('click', me.onClick.bind(me));
        window.addEventListener('resize', function () {
            if (me.resizeTimout) {
                clearTimeout(me.resizeTimout);
            }
            me.resizeTimout = setTimeout(me.onResizeEvent.bind(me), me.resizeDelay);
        });
        me.on('startdrag', me.onStartDrag.bind(me));
        me.on('stopdrag', me.onStopDrag.bind(me));
        me.on('viewportmove', me.onViewPortMove.bind(me));
        me.on('nodedragging', me.onNodeDragging.bind(me));
        me.on('nodedragging', me.hoverConnection.bind(me));
    },
    getCenter: function () {
        var me = this, size;
        size = me.getCanvasSize();

        return {
            x: size.width / 2 + me.getPosition().x,
            y: size.height / 2 + me.getPosition().y,
        }
    },
    resize: function (size) {
        var me = this;
        if (me.holder) {
            size = size || Style.size(me.holder);
        }
        size = size || Style.windowSize();
        me.setCanvasSize(size);
        Style.width(me.getMask(), size.width);
        Style.height(me.getMask(), size.height);
        me.getRenderer().getCanvases().foreach(function (x) {
            Style.width(x, size.width);
            Style.height(x, size.height);
        });
    },
    onResizeEvent: function () {
        var me = this;
        if (me.fullwindow) {
            var size = Style.windowSize();
            me.setCanvasSize(Style.windowSize());
            Style.width(me.getMask(), size.width);
            Style.height(me.getMask(), size.height);
            me.getRenderer().getCanvases().foreach(function (x) {
                Style.width(x, size.width);
                Style.height(x, size.height);
            });
        }
    },
    onViewPortMove: function (type, ee) {
        var me = this;
        var xy = me.getXY(ee);
        var relPos = me.calculateRelativePosition(xy.x, xy.y);
        me.setDragData(ee);
        me.setPosition(me.dragdata.startPos.x + relPos.x, me.dragdata.startPos.y + relPos.y, 0);
    },
    hoverConnection: function (type, ee) {
        var me = this;
        var connection = me.getGraph().getConnections().minSelect(function (connection) {
            return connection.distanceFrom(ee)
        });
        if (connection) {
            if (connection.distanceFrom(ee) < me.maxSelectionDistance) {
                var xy = me.getXY(ee);
                me.fire('nodeoverconnection', {
                    node: me.isDraggingNode.node,
                    connection: connection,
                    xy: xy
                });
            }
        }
    },
    onNodeDragging: function (type, ee) {
        var me = this;
        var node = me.isDraggingNode.node;
        var xy = me.getXY(ee);
        var dragdata = me.dragdata;

        var relPos = { x: xy.x - dragdata.x, y: xy.y - dragdata.y };
        node.setPosition(me.isDraggingNode.startPos.x + relPos.x, me.isDraggingNode.startPos.y + relPos.y, 0);
    },
    getXY: function (ee) {
        var me = this,
            offset = { x: 0, y: 0 },
            currentTarget = ee.currentTarget;
        //if (currentTarget) {
        //    offset = Style.getOffset(ee.currentTarget, me.getMask());
        //}
        return {
            x: ((ee.pageX !== undefined ? ee.pageX : ee.x) || 0) + offset.x,
            y: ((ee.pageX !== undefined ? ee.pageY : ee.y) || 0) + offset.y
        }
    },
    selectionConnection: function (connection) {
        var me = this;
        if (me.getSelectedConnections().first(connection)) {
            me.removeSelectedConnection(connection);
            connection.fire('unselected', connection);
        }
        else {
            me.addSelectedConnection(connection);
            connection.fire('selected', connection);
        }
    },
    addSelectedConnection: function (connection) {
        var me = this;
        me.$selectedConnections.push(connection);
    },
    removeSelectedConnections: function () {
        var me = this;
        var result = me.getSelectedConnections().select(function (x) { return x; }).foreach(function (x) {
            me.removeSelectedConnection(x);
        });
        return result;
    },
    removeSelectedConnection: function (connection) {
        var me = this;
        me.getSelectedConnections().removeWhere(function (x) { return x === connection; });
    },
    getSelectedConnections: function () {
        var me = this;
        return me.$selectedConnections;
    },
    calculateRelativePosition: function (x, y) {
        var me = this;
        if (me.dragdata) {
            return { x: x - me.dragdata.x, y: y - me.dragdata.y };
        }
        return { x: 0, y: 0 };
    },
    onStartDrag: function (type, ee) {
        var me = this;
        if (!me.cancelDragging && !me.noViewPortDrag) {
            me.isDragging = true;
            me.setDragData(ee);
            Style.zIndex(me.$mask, me.maskUpZIndex);
        }
    },
    setDragData: function (ee) {
        var me = this;
        me.dragdata = me.dragdata || {};
        var xy = me.getXY(ee);
        me.dragdata.startPos = me.getPosition();
        me.dragdata.x = xy.x;
        me.dragdata.y = xy.y;
    },
    getMousePosition: function () {
        var me = this;
        return me.mousePosition || { x: 0, y: 0 };
    },
    maskDomPosition: function () {
        var me = this;
        var pos = Style.getOffset(me.getMask(), null);
        return pos;
    },
    onActiveZoneChange: function () {
        var me = this;
        me.fire('change', {});
    },
    onMaskMouseMove: function (ee) {
        var me = this;
        me.calculateMousePosition(ee);
        if (me.isDragging) {
            me.fire('viewportmove', ee);
        }
        else if (me.isDraggingNode) {
            me.fire('nodedragging', ee);
        }
        else if (me.connectionFlow) {
            me.fire('viewportconnectionflow', ee);
        }
        else {
            me.fire('mousemove', ee);
        }
    },
    calculateMousePosition: function (ee) {
        var me = this;
        var xy = me.getXY(ee);
        var dompos = me.maskDomPosition();
        var pos = me.getPosition();
        me.mousePosition = {
            x: xy.x - dompos.x,
            y: xy.y - dompos.y
        };

    },
    onMaskMouseOut: function (ee) {
        var me = this;
        if (me.isDragging) {
            me.isDragging = false;
            me.dragdata = null;
            me.fire('canceldrag', ee);
        }
    },
    onStopDrag: function (type, ee) {
        var me = this;
        if (me.isDragging) {
            me.isDragging = false;
            me.fire('stopdrag', ee);
            me.handleBoundaries();
        }
    },
    handleBoundaries: function () {
        var me = this,
            targetx,
            targety,
            position;

        if (me.boundaries) {
            position = me.getPosition();
            if (me.boundaries.xmin > position.x) {
                targetx = me.boundaries.xmin;
            }
            else if (me.boundaries.xmax < position.x) {
                targetx = me.boundaries.xmax;
            }

            if (me.boundaries.ymin > position.y) {
                targety = me.boundaries.ymin;
            }
            else if (me.boundaries.ymax < position.y) {
                targety = me.boundaries.ymax;
            }

            me.animateBoundary(targetx, targety);
        }
    },
    animateBoundary: function (x, y) {
        var me = this,
            position = me.getPosition();
        x = x === undefined ? position.x : x;
        y = y === undefined ? position.y : y;
        me.setPosition(x, y, 0);

    },
    onMaskMouseDown: function (ee) {
        var me = this;
        if (!me.isDragging) {
            me.fire('startdrag', ee);
        }
    },
    onMaskMouseUp: function (ee) {
        var me = this;
        if (me.isDragging || me.isDraggingNode) {
            me.dragdata = null;
            me.isDraggingNode = null;
            Style.zIndex(me.$mask, me.maskDownZIndex);
            me.fire('stopdrag', ee);
        }
    },
    getMask: function () {
        var me = this;
        return me.$mask;
    },
    getCanvasSize: function () {
        var me = this,
            canvas = me.getCanvas();
        return {
            height: canvas.height,
            width: canvas.width
        }
    },
    setCanvasSize: function (args) {
        var me = this,
            canvas = me.getCanvas();
        Style.height(canvas, args.height);
        Style.width(canvas, args.width);
    }
});
