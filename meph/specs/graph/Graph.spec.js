describe("MEPH/graph/Graph.spec.js", function () {
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

    afterEach(function () {
        
        var canvases = MEPHArray.convert(document.querySelectorAll('canvas'));
        canvases.foreach(function (x) {
            if (x && x.parentNode)
                return x.parentNode.removeChild(x);
        })
    });

    it("can create a graph", function (done) {
        //Arrange

        //Act
        MEPH.create('MEPH.graph.Graph').then(function ($class) {
            //Assert
            var input = new $class();

            expect(input).toBeTruthy();

        }).catch(function (error) {
            expect(error).caught();
        }).then(function (x) {
            done();
        });
    });

    it('Get node from graph', function (done) {
        MEPH.create('MEPH.graph.Graph').then(function ($class) {
            //Assert
            var graph = new $class();
            var node = new MEPH.graph.Node();
            graph.addNode(node);

            expect(graph).toBeTruthy();

            //Act
            var nodes = graph.getNodes();

            //Assert
            expect(nodes).toBeTruthy();
            expect(nodes.length === 1).toBeTruthy();

        }).catch(function (error) {
            expect(error).caught();
        }).then(function (x) {
            done();
        });
    });

    it('graph can be saved', function (done) {
        MEPH.create('MEPH.graph.Graph').then(function ($class) {

            var graph = GraphTest.createGraphWithNodesAndConnections(3);

            var result = graph.save();

            expect(result).toBeTruthy();
        }).catch(function (error) {
            expect(error).caught();
        }).then(function (x) {
            done();
        });
    });
    it('graph can be saved and a graph can reload it', function (done) {
        MEPH.create('MEPH.graph.Graph').then(function ($class) {
            var graph = GraphTest.createGraphWithNodesAndConnections(3);

            var result = graph.save();


            var graph = new MEPH.graph.Graph();
            graph.load(result);
            expect(graph.getNodes().length).toBeTruthy();
        }).catch(function (error) {
            expect(error).caught();
        }).then(function (x) {
            done();
        });
    });

    it('When dragging a  node near a connection it fires a nodeoverconnection event', function (done) {
        MEPH.requires('MEPH.graph.Graph',
            'MEPH.graph.renderer.ConnectionRenderer',
            'MEPH.graph.ConnectionHandler',
            'MEPH.graph.renderer.BlenderNode').then(function ($class) {
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
                graphviewport.setGraph(graph);
                graphrenderer.render();
                var startconnection;
                var zone = graphviewport.getActiveZones().first(function (item) {
                    return item.zone.getZoneType() === MEPH.graph.ActiveZone.type.connector;
                }).zone;
                var zone2 = graphviewport.getActiveZones().second(function (item) {
                    return item.zone.getZoneType() === MEPH.graph.ActiveZone.type.connector;
                }).zone;
                zone.getDom().dispatchEvent(GraphTest.createEvent('click', {}));
                zone2.getDom().dispatchEvent(GraphTest.createEvent('click', {}));
                graphviewport.selectConnectionOnClick = true;
                graphviewport.getMask().dispatchEvent(GraphTest.createEvent('click', {
                    x: 3,
                    y: 4
                }));

                var newnode = new MEPH.graph.Node();
                newnode.setId(MEPH.GUID());
                newnode.appendData({
                    title: 'Node ',
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
                graphviewport.setDragData({ x: 10, y: 20 });
                graph.addNode(newnode);
                var nodeoverconnection;
                graphviewport.on('nodeoverconnection', function () {
                    nodeoverconnection = true;
                });
                graphviewport.isDraggingNode = { node: newnode, startPos: { x: 2, y: 4 } };
                //Act
                graphviewport.getMask().dispatchEvent(GraphTest.createEvent('mousemove', {
                    x: 4,
                    y: 4
                }));


                //Assert
                graphviewport.destroy();
                //Assert.isTrue(nodeoverconnection);
            }).catch(function (error) {
                expect(error).caught();
            }).then(function (x) {
                done();
            });
    });
});