describe("MEPH/graph/Connection.spec.js", function () {
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


    it("can create a connection", function (done) {
        //Arrange

        //Act
        MEPH.create('MEPH.graph.Connection').then(function ($class) {
            //Assert
            var input = new $class();

            expect(input).toBeTruthy();

        }).catch(function (error) {
            expect(error).caught();
        }).then(function (x) {
            done();
        });
    });

    it("Create hyper link between nodes", function (done) {
        //Arrange

        //Act
        MEPH.requires('MEPH.graph.Graph', 'MEPH.graph.Connection').then(function () {
            return MEPH.create('MEPH.graph.Node').then(function ($class) {
                var connection = new MEPH.graph.Connection();
                var nodecount = 10;
                var nodes = [].interpolate(0, nodecount, function (x) {
                    var node = new MEPH.graph.Node();
                    node.setId(MEPH.GUID());
                    return node;
                });;
                connection.addNodes(nodes.select(function (x) { return x; }));


                expect(nodecount === connection.nodes.length).toBeTruthy();


            }).catch(function (error) {
                expect(error).caught();
            }).then(function (x) {
                done();
            })
        });
    });

    it("get nodes in connection", function (done) {
        //Arrange

        //Act
        MEPH.requires('MEPH.graph.Graph', 'MEPH.graph.Connection', 'MEPH.graph.Node').then(function () {
            //Arrange
            var connection = new MEPH.graph.Connection();
            var nodecount = 10;
            var nodes = [].interpolate(0, nodecount, function (x) {
                var node = new MEPH.graph.Node();
                node.setId(MEPH.GUID());
                return node;
            });;
            connection.addNodes(nodes.select(function (x) { return x; }));

            //Act
            var nodes = connection.getNodes();


            expect(nodecount === nodes.length).toBeTruthy();


        }).catch(function (error) {
            expect(error).caught();
        }).then(function (x) {
            done();
        })
    });


    it("remove node from connection", function (done) {
        //Arrange

        //Act
        MEPH.requires('MEPH.graph.Graph', 'MEPH.graph.Connection', 'MEPH.graph.Node').then(function () {
            //Arrange
            var connection = GraphTest.createConnectionWithNodes();
            var orignallength = connection.getNodes().length;
            var node = connection.getNodes().first();

            //Act
            connection.removeNode(node);

            //Assert
            expect(connection.getNodes().length == orignallength - 1).toBeTruthy();


        }).catch(function (error) {
            expect(error).caught();
        }).then(function (x) {
            done();
        })
    });

    it("add node to existing connection", function (done) {
        //Arrange

        //Act
        MEPH.requires('MEPH.graph.Graph', 'MEPH.graph.Connection', 'MEPH.graph.Node').then(function () {
            //Arrange
            var connection = GraphTest.createConnectionWithNodes();
            var orglength = connection.getNodes().length;
            var node = GraphTest.createNode();

            //Act
            connection.addNode(node);

            //Assert
            expect(connection.getNodes().length == orglength + 1).toBeTruthy();


        }).catch(function (error) {
            expect(error).caught();
        }).then(function (x) {
            done();
        })
    });

    it("set connection id", function (done) {
        //Arrange

        //Act
        MEPH.requires('MEPH.graph.Graph', 'MEPH.graph.Connection', 'MEPH.graph.Node').then(function () {
            //Arrange
            var connection = new MEPH.graph.Connection();

            //Act
            connection.setId(MEPH.GUID());

            //Assert
            //Assert
            expect(connection.getId()).toBeTruthy();


        }).catch(function (error) {
            expect(error).caught();
        }).then(function (x) {
            done();
        })
    });

    it("Add connection to graph", function (done) {
        //Arrange

        //Act
        MEPH.requires('MEPH.graph.Graph', 'MEPH.graph.Connection', 'MEPH.graph.Node').then(function () {
            var graph = GraphTest.createGraph();

            //Act
            graph.addConnection(new MEPH.graph.Connection());

            //Assert
            expect(graph.getConnections().length === 1).toBeTruthy();


        }).catch(function (error) {
            expect(error).caught();
        }).then(function (x) {
            done();
        })
    });

    it("remove connection", function (done) {
        //Arrange

        //Act
        MEPH.requires('MEPH.graph.Graph', 'MEPH.graph.Connection', 'MEPH.graph.Node').then(function () {
            //Arrange
            var graph = GraphTest.createGraphWithNodesAndConnections();
            var connection = graph.getConnections().first();
            var connectioncount = graph.getConnections().length;
            //Act
            var result = graph.removeConnection(connection);

            //Assert
            expect(connectioncount - 1 === graph.getConnections().length).toBeTruthy();
            expect(result).toBeTruthy();
        }).catch(function (error) {
            expect(error).caught();
        }).then(function (x) {
            done();
        })
    });

    it("get distance from connection", function (done) {
        MEPH.requires('MEPH.graph.ActiveZone',
            'MEPH.graph.Graph',
            'MEPH.graph.Connection',
            'MEPH.graph.Node').then(function () {
                //Arrange 
                var graph = GraphTest.createGraphWithNodesAndConnections(2);
                var node = graph.getNodes()[0];
                var node2 = graph.getNodes()[1];
                var zone = new MEPH.graph.ActiveZone();
                zone.setPosition(10, 10, 10);
                node.addZone(zone);


                var zone2 = new MEPH.graph.ActiveZone();
                zone2.setPosition(110, 10, 10);
                node.addZone(zone2);

                var connection = graph.getConnections()[0];

                connection.addZone(zone);
                connection.addZone(zone2);
                connection.setConnectionDetectionDepth(1);

                //Act
                var distance = connection.distanceFrom({ x: 100, y: 100 });

                //Assert
                expect(distance).toBeTruthy();
            }).catch(function (error) {
                expect(error).caught();
            }).then(function (x) {
                done();
            })
    });


    it("Detect closest connection to click", function (done) {
        MEPH.requires('MEPH.graph.ActiveZone',
            'MEPH.graph.Graph',
            'MEPH.graph.Connection',
            'MEPH.graph.Node').then(function () {
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


                //Act
                var handled;

                graphviewport.getMask().dispatchEvent(GraphTest.createEvent('mousemove', {
                    x: 3,
                    y: 4
                }));
                //Assert
                graphviewport.destroy();
            }).catch(function (error) {
                expect(error).caught();
            }).then(function (x) {
                done();
            })
    });

    it("Add selected connection", function (done) {
        MEPH.requires('MEPH.graph.ActiveZone',
            'MEPH.graph.Graph',
            'MEPH.graph.Connection',
            'MEPH.graph.Node').then(function () {

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


                //Act
                var handled;
                graphviewport.selectConnectionOnClick = true;
                graphviewport.getMask().dispatchEvent(GraphTest.createEvent('click', {
                    x: 3,
                    y: 4
                }));
                //Assert
                graphviewport.destroy();
                //Assert.isTrue(graphviewport.getSelectedConnections().length === 1);

            }).catch(function (error) {
                expect(error).caught();
            }).then(function (x) {
                done();
            })
    });

    it("Remove selected connection", function (done) {
        MEPH.requires('MEPH.graph.ActiveZone',
            'MEPH.graph.Graph',
            'MEPH.graph.GraphViewPort',
            'MEPH.graph.ConnectionHandler',
            'MEPH.graph.GraphRenderer',
            'MEPH.graph.renderer.ConnectionRenderer',
            'MEPH.graph.renderer.BlenderNode',
            'MEPH.graph.Connection',
            'MEPH.graph.Node').then(function () {

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


                //Act
                graph.removeConnections(graphviewport.getSelectedConnections());
                //Assert
                graphviewport.destroy();
                expect(graphviewport.getSelectedConnections().length === 0).toBeTruthy();
            }).catch(function (error) {
                expect(error).caught();
            }).then(function (x) {
                done();
            })
    });
});