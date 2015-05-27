describe("MEPH/graph/ConnectionHandler.spec.js", function () {
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
            });
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

    it('Create connection handler', function (done) {
        //Arrange
        MEPH.requires('MEPH.graph.ConnectionHandler').then(function () {
            //Act
            var handler = new MEPH.graph.ConnectionHandler();

            //Assert
            expect(handler).toBeTruthy();
        }).catch(function (error) {
            expect(error).caught();
        }).then(function (x) {
            done();
        });
    });

    it('Set graph', function (done) {
        //Arrange
        MEPH.requires('MEPH.graph.ConnectionHandler', 'MEPH.graph.Graph').then(function () {
            //Act
            var handler = new MEPH.graph.ConnectionHandler();
            var graph = new MEPH.graph.Graph();
            //Act
            handler.setGraph(graph);

            //Assert
            expect(handler.getGraph()).toBeTruthy();
        }).catch(function (error) {
            expect(error).caught();
        }).then(function (x) {
            done();
        });
    });

    it('Connection handler handles the connection creation', function (done) {
        //Arrange
        MEPH.requires('MEPH.graph.ConnectionHandler', 'MEPH.graph.Graph').then(function () {

            //Arrange
            var graphviewport = new MEPH.graph.GraphViewPort();
            var graph = GraphTest.createGraphWithNodesAndConnections(2);
            var graphrenderer = new MEPH.graph.GraphRenderer();
            var connectionrenderer = new MEPH.graph.renderer.ConnectionRenderer();

            var blenderNode = new MEPH.graph.renderer.BlenderNode(graphviewport);
            var connectionHandler = new MEPH.graph.ConnectionHandler();
            connectionHandler.setGraph(graph);
            graphviewport.setConnectionHandler(connectionHandler);

            graphviewport.setup('body', { width: 600, height: 400 });
            graphrenderer.setNodeRenderer(blenderNode);
            graphrenderer.setConnectionRenderer(connectionrenderer);
            graphrenderer.setGraph(graph);
            graphrenderer.setViewPort(graphviewport);
            graphrenderer.use('viewport');
            graphviewport.fullwindow = true;
            graphviewport.setGraph(graph);
            graphrenderer.render();
            var startconnection;
            var zone = graphviewport.getActiveZones().first(function (item) {
                return item.zone.getZoneType() === MEPH.graph.ActiveZone.type.connector;
            }).zone;
            var zone2 = graphviewport.getActiveZones().second(function (item) {
                return item.zone.getZoneType() === MEPH.graph.ActiveZone.type.connector;
            }).zone;


            //Act

            //Assert
            graphviewport.destroy();

        }).catch(function (error) {
            expect(error).caught();
        }).then(function (x) {
            done();
        });
    });

    
    it('Cancel connection creation with double click', function (done) {
        //Arrange
        MEPH.requires('MEPH.graph.ConnectionHandler', 'MEPH.graph.Graph').then(function () {
            //Arrange
            var graphviewport = new MEPH.graph.GraphViewPort();
            var graph = GraphTest.createGraphWithNodesAndConnections(2);
            var graphrenderer = new MEPH.graph.GraphRenderer();
            var connectionrenderer = new MEPH.graph.renderer.ConnectionRenderer();
            var blenderNode = new MEPH.graph.renderer.BlenderNode(graphviewport);
            graphviewport.setup('body', { width: 600, height: 400 });
            graphrenderer.setNodeRenderer(blenderNode);
            graphrenderer.setConnectionRenderer(connectionrenderer);
            graphrenderer.setGraph(graph);
            graphrenderer.setViewPort(graphviewport);
            graphrenderer.use('viewport');
            graphviewport.setGraph(graph);
            graphrenderer.render();
            var startconnection;
            var zone = graphviewport.getActiveZones().first(function (item) {
                return item.zone.getZoneType() === MEPH.graph.ActiveZone.type.connector;
            }).zone;
            zone.getDom().dispatchEvent(GraphTest.createEvent('click', {}));


            //Act
            var handled;
            graphviewport.$mask.dispatchEvent(GraphTest.createEvent('dblclick', {}));

            //Assert
            graphviewport.destroy();
            expect(graphviewport.connectionFlow === null).toBeTruthy();
        }).catch(function (error) {
            expect(error).caught();
        }).then(function (x) {
            done();
        });
    }); 
});