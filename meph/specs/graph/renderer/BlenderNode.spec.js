describe("MEPH/graph/renderer/BlenderNode.spec.js", function () {
    var createConnectionWithNodes = function () {
        var connection = new MEPH.graph.Connection();
        var nodecount = 10;
        var nodes = [].interpolate(0, nodecount, function (x) {
            var node = new MEPH.graph.Node();
            node.setId(MEPH.GUID());
            return node;
        });;
        connection.addNodes(nodes.select(function (x) { return x; }));
        return connection;
    };
    var GraphTest = {

        createConnectionWithNodes: createConnectionWithNodes,

        createEvent: function (type, options) {
            var evt = new Event(type);
            for (var i in options) {
                evt[i] = options[i];
            }
            return evt;
        },
        createCanvas: function (height, width) {
            height = height || 300;
            width = width || 400;
            var canvas = document.createElement('canvas');
            document.body.appendChild(canvas);
            canvas.height = height;
            canvas.width = width;
            return canvas;
        },
        createGraphWithNodesAndConnections: function (count) {
            var graph = new MEPH.graph.Graph();
            var nodecount = count || 10;
            var nodes = [].interpolate(0, nodecount, function (x, index) {
                var node = new MEPH.graph.Node();
                node.setId(MEPH.GUID());
                node.appendData({
                    title: 'Node ' + x,
                    id: MEPH.GUID(),
                    nodeInputs: [].interpolate(0, 3, function (x) {
                        return {
                            title: 'Input ' + x,
                            type: x,
                            id: MEPH.GUID()
                        }
                    }),
                    nodeOutputs: [].interpolate(0, 3, function (x) {
                        return {
                            title: 'Output ' + x,
                            type: x,
                            id: MEPH.GUID()
                        }
                    })
                });
                node.setPosition(x * 10, x * 10, x * 10);
                return node;
            });;
            var connection = new MEPH.graph.Connection();
            connection.addNodes(nodes);
            nodes.foreach(function (node) {
                var zone = node.getZones().nth(8);
                if (zone) {
                    connection.addZone(zone);
                }
            });
            graph.addConnection(connection);
            graph.addNodes(nodes);
            return graph;
        },
        createGraph: function () {
            var graph = new MEPH.graph.Graph();
            var nodecount = 10;
            var nodes = [].interpolate(0, nodecount, function (x) {
                var node = new MEPH.graph.Node();
                node.setId(MEPH.GUID());
                return node;
            });;
            graph.addNodes(nodes);
            return graph;
        },
        createNode: function () {
            var node = new MEPH.graph.Node();
            node.setId(MEPH.GUID());
            return node;
        }
    };
    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });

    it("Blender node create.", function (done) {
        //Act
        MEPH.create('MEPH.graph.renderer.BlenderNode').then(function ($class) {
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

    it("Blender node render.", function (done) {
        //Act
        MEPH.requires('MEPH.graph.GraphViewPort', 'MEPH.graph.Graph'
            , 'MEPH.graph.Connection'
            , 'MEPH.graph.Node'
            , 'MEPH.graph.GraphRenderer').then(function () {
            return MEPH.create('MEPH.graph.renderer.BlenderNode').then(function ($class) {
                //Arrange
                var graphviewport = new MEPH.graph.GraphViewPort();
                var graph = GraphTest.createGraphWithNodesAndConnections(1);
                var graphrenderer = new MEPH.graph.GraphRenderer();
                var blenderNode = new $class(graphviewport);
                graphviewport.setup('body', { width: 600, height: 400 });
                graphrenderer.setNodeRenderer(blenderNode);
                graphrenderer.setGraph(graph);
                graphrenderer.setViewPort(graphviewport);
                graphrenderer.use('viewport');
                graphviewport.setGraph(graph);

                //Act
                graphrenderer.render();

                //Assert
                graphviewport.destroy();

            })
        }).catch(function (error) {
            expect(error).caught();
        }).then(function (x) {
            done();
        });
    });


    it("Blender node render with active zones.", function (done) {
        //Act
        MEPH.requires('MEPH.graph.GraphViewPort', 'MEPH.graph.GraphRenderer').then(function () {
            return MEPH.create('MEPH.graph.renderer.BlenderNode').then(function ($class) {
                //Arrange
                var graphviewport = new MEPH.graph.GraphViewPort();
                var graph = GraphTest.createGraphWithNodesAndConnections(1);
                var graphrenderer = new MEPH.graph.GraphRenderer();
                var blenderNode = new MEPH.graph.renderer.BlenderNode(graphviewport);
                graphviewport.setup('body', { width: 800, height: 800 });
                graphrenderer.setNodeRenderer(blenderNode);
                graphrenderer.setGraph(graph);
                graphrenderer.setViewPort(graphviewport);
                graphrenderer.use('viewport');
                graphviewport.fullwindow = true;
                graphviewport.setGraph(graph);

                //Act
                graphrenderer.render();

                //Assert
                graphviewport.destroy();
                expect(graphviewport.getActiveZones().length === 20).toBeTruthy();
            })
        }).catch(function (error) {
            expect(error).caught();
        }).then(function (x) {
            done();
        });
    });
           
});