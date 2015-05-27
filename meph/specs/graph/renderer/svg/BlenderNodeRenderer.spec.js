describe("MEPH/graph/renderer/svg/BlenderNodeRenderer.spec.js",
    'MEPH.graph.GraphViewPort',
    'MEPH.graph.SVGGraphRenderer',
    'MEPH.graph.ConnectionHandler',
    'MEPH.graph.Node',
    'MEPH.audio.graph.node.Convolver',
    'MEPH.graph.renderer.svg.ConnectionRenderer',
    'MEPH.graph.renderer.svg.BlenderNodeRenderer', function () {

        it("Blender node renderer create.", function (done) {
            //Act
            MEPH.create('MEPH.graph.renderer.svg.BlenderNodeRenderer').then(function ($class) {
                //Act
                var blenderNode = new $class();

                //Assert
                expect(blenderNode).toBeTruthy();

            }).catch(function (error) {
                expect(error).caught();
            }).then(function (x) {
                done();
            });
        });
        var createGraphEco = function () {
            var graphviewport = new MEPH.graph.GraphViewPort();
            var graph = new MEPH.graph.Graph();
            var graphrenderer = new MEPH.graph.SVGGraphRenderer();
            var blenderNode = new MEPH.graph.renderer.svg.BlenderNodeRenderer(graphviewport);
            var connectionrenderer = new MEPH.graph.renderer.svg.ConnectionRenderer();

            var connectionHandler = new MEPH.graph.ConnectionHandler();
            connectionHandler.setGraph(graph);
            graphviewport.setConnectionHandler(connectionHandler);

            graphviewport.setup('body', { height: 700, width: 1000, element: 'svg' });
            graphrenderer.setNodeRenderer(blenderNode);
            graphrenderer.setConnectionRenderer(connectionrenderer);
            graphrenderer.setGraph(graph);
            graphrenderer.setViewPort(graphviewport);
            graphrenderer.use('viewport');
            graphviewport.setGraph(graph);
            return { graph: graph, graphrenderer: graphrenderer };
        }
        

    });