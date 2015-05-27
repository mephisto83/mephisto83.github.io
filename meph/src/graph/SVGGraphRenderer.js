/**
* @class MEPH.graph.SVGGraphRenderer
*/
MEPH.define('MEPH.graph.SVGGraphRenderer', {
    requires: ['MEPH.util.Observable'],
    statics: {
        graphtemplates: null
    },
    extend: 'MEPH.graph.GraphRenderer',
    initialize: function () {
        var me = this;
        me.great();
        MEPH.graph.SVGGraphRenderer.graphtemplates = [];
    },
    clearCanvas: function (canvas) {
        var context;
        if (canvas && canvas.getContext) {
            context = canvas.getContext('2d');
            context.clearRect(0, 0, canvas.width, canvas.height);
        }
    },
    setViewPort: function () {
        var me = this;
        me.great();

        me.$viewport.on('viewportconnectionflowcomplete', me.onFlowClear.bind(me));
        me.$viewport.on('viewportconnectionflowclear', me.onFlowClear.bind(me));
    },
    onFlowClear: function () {
        var me = this;
        var connectionRenderer = me.getConnectionRenderer();
        if (connectionRenderer) {
            connectionRenderer.clearFlow();
        }
    },
    generateCanvas: function (bucket, isconnectioncanvas) {
        var me = this;//,
        //canvas = document.createElement('svg');

        //var viewportsize = me.getViewPort().getCanvasSize();
        //bucket = bucket || me.getCanvasBag();
        //bucket.appendChild(canvas);
        //canvas.height = viewportsize.height;
        //canvas.width = viewportsize.width;
        //canvas.style.position = 'absolute';
        //if (me.createdCanvas) {
        //    canvas.style.zIndex = isconnectioncanvas ? me.connectionCanvasZIndex : 1;
        //}
        //else
        //    canvas.style.zIndex = isconnectioncanvas ? me.connectionCanvasZIndex : 1;
        //me.createdCanvas = true;
        //me.$canvases.push(canvas);

        return me.getViewPort().getCanvas();
    },
    /**
     * Renders view port effects to canvas.
     * @param {Object} canvas
     * @param {Object} ee
     */
    renderViewPortEffects: function (canvas, ee) {
        var me = this,
            connectionRenderer = me.getConnectionRenderer();
        if (connectionRenderer) {
            connectionRenderer.render(canvas, ee, me.getGraph().getConnections(), me.$viewport);
        }
    },
    getFlowCanvas: function () {
        var me = this;
        return me.getViewPort().getGCanvas();
    },
    getViewPortEffects: function () {
        var me = this;
        return me.getViewPort().getGCanvas();
    },
    /**
     * Registers a svg template by the alias name.
     * @param {String} alias
     **/
    registerTemplate: function (alias) {
        var me = this;
        MEPH.graph.SVGGraphRenderer.graphtemplates.push(alias);
    },
    /**
     * Gets the template by alias.
     * @param {String} alias
     **/
    getTemplate: function (alias) {
        var me = this;
        var template = MEPH.graph.SVGGraphRenderer.graphtemplates.first(function (x) {
            return x === alias
        });
        if (template) {
            var res = MEPH.getTemplateByAlias(alias);
            if (res) {
                return res.template;
            }
        }
        return null;
    },
    render: function () {
        var me = this;

        var nodes = me.getNodes();

        me.getNodeRenderer().render(nodes);

        me.getConnectionRenderer().render(me.getViewPort().getCanvas(), null, me.getConnections(), me.getViewPort());
    }
});