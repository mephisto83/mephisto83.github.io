/**
* @class MEPH.graph.GraphRenderer
*/
MEPH.define('MEPH.graph.GraphRenderer', {
    requires: ['MEPH.util.Observable'],
    properties: {
        connectionCanvasZIndex: 2,
        maxSelectionDistance: 30,
        nodeCanvasZIndex: 3
    },
    initialize: function () {
        var me = this;
        me.$canvases = MEPH.util.Observable.observable([]);
        me.$selectedConnections = [];
        me.animationComplete = true;
    },
    setViewPort: function (viewport) {
        var me = this;
        me.$viewport = viewport;
        viewport.setRenderer(me);
        me.$viewport.on('moved', me.onViewPortChange.bind(me));
        me.$viewport.on('change', me.onViewPortChange.bind(me));
        me.$viewport.on('viewportconnectionflow', me.onViewPortConnectionFlow.bind(me));
        me.$viewport.on('viewportconnectionflowclear', me.onViewPortConnectionFlow.bind(me));
        me.$viewport.on('mousemove', me.onMouseMoveOverViewPort.bind(me));
    },
    use: function (what) {
        var me = this;
        switch (what) {
            case 'viewport':
                var viewport = me.getViewPort();
                me.setCanvasBag(viewport.getCanvasBag());
                break;
            default:
                throw 'use somethin with a canvas.'
        }
    },
    setCanvasBag: function (dom) {
        var me = this;
        me.$canvasBag = dom;
        me.$canvasBag.addEventListener('resize', me.onCanvasBagResize.bind(me));
    },
    getCanvasBag: function () {
        var me = this;
        return me.$canvasBag || null;
    },
    onCanvasBagResize: function () {
        me.resizeCanvases();
    },
    resizeCanvases: function () {
    },
    setGraph: function (graph) {
        var me = this;
        me.$graph = graph;
    },
    getGraph: function (graph) {
        var me = this;
        return me.$graph;
    },
    onViewPortChange: function () {
        var me = this;
        me.requestAnimationFrame();
    },
    requestAnimationFrame: function () {
        var me = this;

        if (me.requestedAnimation !== undefined) {
            cancelAnimationFrame(me.requestedAnimation);
        }

        me.requestedAnimation = requestAnimationFrame(function () {
            me.render();
            me.requestedAnimation = undefined;
        });
        return Promise.resolve();
    },
    setNodeRenderer: function (renderer) {
        var me = this;
        me.$nodeRenderer = renderer;
    },
    getNodeRenderer: function () {
        var me = this;
        return me.$nodeRenderer;
    },
    setConnectionRenderer: function (renderer) {
        var me = this;
        me.$connectionRenderer = renderer;
    },
    getConnectionRenderer: function () {
        var me = this;
        return me.$connectionRenderer;
    },
    getConnections: function () {
        var me = this;
        return me.getGraph().getConnections();
    },
    getNodes: function () {
        var me = this;
        return me.getGraph().getNodes();
    },
    generateCanvas: function (bucket, isconnectioncanvas) {
        var me = this,
        canvas = document.createElement('canvas');
        var viewportsize = me.getViewPort().getCanvasSize();
        bucket = bucket || me.getCanvasBag();
        bucket.appendChild(canvas);
        canvas.height = viewportsize.height;
        canvas.width = viewportsize.width;
        canvas.style.position = 'absolute';
        canvas.style.zIndex = isconnectioncanvas ? me.connectionCanvasZIndex : me.nodeCanvasZIndex;
        me.$canvases.push(canvas);
        return canvas;
    },
    getCanvases: function () {
        var me = this;
        if (me.$canvases.length === 0) {
            me.generateCanvas();
        }
        return me.$canvases;
    },
    render: function () {
        var me = this,
            canvases = me.getCanvases();
        me.clearCanvases();

        me.getNodes().where(function (x) {
            return !x.isHidden();
        }).foreach(function (x) {
            me.renderNode(x);
        });
        if (me.getConnectionRenderer()) {
            me.getConnections().foreach(function (x) {
                me.renderConnection(x);
            });
        }
        me.renderConnectionFlow();

    },
    clear: function () {
        var me = this;
        me.getNodes().removeWhere(function () { return true; });
        me.getConnections().removeWhere(function () { return true; });
    },
    onMouseMoveOverViewPort: function (ee) {
        var me = this;
        me.clearCanvas(me.getViewPortEffects());
        var tempee = me.getRelPosition(ee);
        me.renderViewPortEffects(me.getViewPortEffects(), tempee);
    },
    getRelPosition: function (ee) {
        var me = this,
            viewport = me.getViewPort();
        var xy = viewport.getXY(ee);
        var dompos = viewport.maskDomPosition();
        return {
            x: xy.x - dompos.x,
            y: xy.y - dompos.y
        };
    },
    onViewPortConnectionFlow: function (ee) {
        var me = this;
        me.clearCanvas(me.getFlowCanvas());
        me.renderConnectionFlow(ee);
    },
    renderConnectionFlow: function () {
        var me = this,
          canvases = me.getCanvases();
        var viewport = me.getViewPort();

        if (viewport.connectionFlow &&
            viewport.connectionFlow.state === MEPH.graph.GraphViewPort.start_connection) {
            var connectionRenderer = me.getConnectionRenderer();
            var connectioncanvas = me.getFlowCanvas();

            if (connectioncanvas) {
                connectionRenderer.render(connectioncanvas, [{
                    start: viewport.getMousePosition(),
                    end: viewport.connectionFlow.zone.getPosition(),
                    zone: viewport.connectionFlow.zone,
                    viewport: viewport
                }]);
            }
        }
    },
    renderViewPortEffects: function (canvas, ee) {
        var me = this,
            connectionRenderer = me.getConnectionRenderer();
        if (connectionRenderer) {
            var connection = me.getGraph().getConnections().minSelect(function (connection) {
                return connection.distanceFrom(ee)
            });
            if (connection) {
                Style.zIndex(canvas, me.connectionCanvasZIndex);
                if (connection.distanceFrom(ee) < me.maxSelectionDistance) {
                    connectionRenderer.renderConnection(connection, canvas, me.getViewPort().getPosition(), me.getClosetConnectionOptions(connection));
                }
            }
            me.getSelectedConnections().foreach(function (x) {
                connectionRenderer.renderConnection(x, canvas, me.getViewPort().getPosition(), me.getSelectedConnectionsOptions(x));
            });
        }
    },
    getSelectedConnections: function () {
        var me = this;
        return me.getViewPort().getSelectedConnections();
    },
    getSelectedConnectionsOptions: function (connection) {
        return {
            lineWidth: 2,
            strokeStyle: 'red'
        }
    },
    getClosetConnectionOptions: function () {
        return {
            lineWidth: 4,
            strokeStyle: 'orange'
        }
    },
    getFlowCanvas: function () {
        var me = this;
        return me.getNthCanvas(3, me.connectionCanvasZIndex);
    },
    getViewPortEffects: function () {
        var me = this;
        return me.getNthCanvas(4, me.connectionCanvasZIndex);
    },
    getNthCanvas: function (nth, zindex) {
        var me = this,
         canvases = me.getCanvases();
        var connectioncanvas = canvases.nth(nth);
        if (!connectioncanvas) {
            me.generateCanvas(null, true);
            connectioncanvas = canvases.nth(nth);
            if (connectioncanvas)
                connectioncanvas.style.zIndex = zindex;
        }
        return connectioncanvas;
    },
    renderConnection: function (connection) {
        var me = this,
            connectionRenderer = me.getConnectionRenderer(),
            canvases = me.getCanvases();
        var canvas = canvases.first();

        var connectioncanvas = canvases.second();
        if (!connectioncanvas) {
            me.generateCanvas(null, true);
            connectioncanvas = canvases.second();
            connectioncanvas.style.zIndex = me.connectionCanvasZIndex;
        }

        if (connectionRenderer) {
            Style.zIndex(connectioncanvas, me.connectionCanvasZIndex);
            connectionRenderer.renderConnection(connection, connectioncanvas, me.getViewPort().getPosition());
        }
    },
    renderNode: function (node) {
        var me = this,
            nodeRenderer = me.getNodeRenderer(),
            connectionRenderer = me.getConnectionRenderer(),
            canvases = me.getCanvases();
        var canvas = canvases.first();
        nodeRenderer.renderNode(node, canvas, me.getViewPort().getPosition());
    },
    clearCanvas: function (canvas) {
        var context;
        if (canvas) {
            context = canvas.getContext('2d');
            context.clearRect(0, 0, canvas.width, canvas.height);
        }
    },
    clearCanvases: function () {
        var me = this;
        me.getCanvases().foreach(function (canvas) {
            me.clearCanvas(canvas);
        });
    },
    getViewPort: function () {
        var me = this;
        return me.$viewport;
    }
});