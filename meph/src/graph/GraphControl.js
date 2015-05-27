/**
 * @class MEPH.graph.GraphControl
 * @extends MEPH.control.Control
 * Graph control.
 **/
MEPH.define('MEPH.graph.GraphControl', {
    alias: 'graph',
    templates: true,
    requires: ['MEPH.graph.GraphViewPort',
        'MEPH.graph.Graph',
                'MEPH.graph.ConnectionHandler',
                'MEPH.graph.renderer.ConnectionRenderer',
                'MEPH.graph.renderer.BlenderNode',
                'MEPH.graph.GraphRenderer'],
    extend: 'MEPH.control.Control',
    properties: {
        id: null
    },
    initialize: function () {
        var me = this;
        me.graph = me.graph || new MEPH.graph.Graph();
        me.callParent.apply(me, arguments);
    },
    onLoaded: function () {
        var me = this;
        me.id = 'graph' + MEPH.GUID();
        me.querySelectorAll('div.graphBody').first().parentNode.setAttribute('id', me.id);
        setTimeout(function () {
            MEPH.graph.GraphControl.create(me.graph || new MEPH.graph.Graph(), null, '#' + me.id + ' div.graphBody', '#' + me.id);
        }, 10);
    },
    addNode: function (node) {
        var me = this;
        me.graph.addNode(node);
    },
    getNodes: function () {
        var me = this;
        return me.graph.getNodes();
    },
    statics: {
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
    }
});