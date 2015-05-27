describe("MEPH/graph/GraphRenderer.spec.js", function () {
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

    it("create graphrenderer", function (done) {
        //Arrange

        //Act
        MEPH.create('MEPH.graph.GraphRenderer').then(function ($class) {
            //Act
            var graphrenderer = new $class();

            //Assert
            expect(graphrenderer).toBeTruthy();

        }).catch(function (error) {
            expect(error).caught();
        }).then(function (x) {
            done();
        });
    });


    it("set graphviewport", function (done) {
        //Arrange

        //Act
        MEPH.requires('MEPH.graph.GraphViewPort').then(function () {
            return MEPH.create('MEPH.graph.GraphRenderer').then(function ($class) {
                //Arrange
                var viewport = new MEPH.graph.GraphViewPort();
                var graphrenderer = new $class();

                //Act
                graphrenderer.setViewPort(viewport);

                //Assert
                expect(graphrenderer.getViewPort()).toBeTruthy();

            })
        }).catch(function (error) {
            expect(error).caught();
        }).then(function (x) {
            done();
        });
    });

    it("listen graphviewport changes", function (done) {
        //Arrange

        //Act
        MEPH.requires('MEPH.graph.GraphViewPort').then(function () {
            return MEPH.create('MEPH.graph.GraphRenderer').then(function ($class) {
                //Arrange
                var viewport = new MEPH.graph.GraphViewPort();
                var graphrenderer = new $class();
                graphrenderer.onViewPortChange = function () {
                    viewportchanged = true;
                }
                var viewportchanged;
                graphrenderer.setViewPort(viewport);

                //Act
                viewport.setPosition(1, 2, 3);

                //Assert
                expect(viewportchanged).toBeTruthy();
                viewport.destroy();
            })
        }).catch(function (error) {
            expect(error).caught();
        }).then(function (x) {
            done();
        });
    });

    it("when graphviewport changes the graphrenderer will requeset an animation frame", function (done) {
        //Arrange

        //Act
        MEPH.requires('MEPH.graph.Graph', 'MEPH.graph.GraphViewPort', 'MEPH.graph.Node').then(function () {
            return MEPH.create('MEPH.graph.GraphRenderer').then(function ($class) {
                //Arrange
                var requestanimationframe = false;
                var graph = new MEPH.graph.Graph();
                var viewport = new MEPH.graph.GraphViewPort();
                var renderer = new $class();
                viewport.setGraph(graph);
                renderer.setViewPort(viewport);
                renderer.requestAnimationFrame = function () {
                    requestanimationframe = true;
                };

                //Act
                graph.addNode(new MEPH.graph.Node());

                //Assert
                expect(requestanimationframe).toBeTruthy();
                viewport.destroy();
            })
        }).catch(function (error) {
            expect(error).caught();
        }).then(function (x) {
            done();
        });
    });

    it("set node renderer", function (done) {
        //Arrange

        //Act
        MEPH.requires('MEPH.graph.Graph', 'MEPH.graph.GraphViewPort', 'MEPH.graph.Node').then(function () {
            return MEPH.create('MEPH.graph.GraphRenderer').then(function ($class) {
                //Arrange
                var renderer = new MEPH.graph.GraphRenderer();

                //Act
                renderer.setNodeRenderer({});

                //Assert
                expect(renderer.getNodeRenderer()).toBeTruthy();
            })
        }).catch(function (error) {
            expect(error).caught();
        }).then(function (x) {
            done();
        });
    });

    it('create graphrenderer ', function (done) {
        MEPH.create('MEPH.graph.GraphRenderer').then(function ($class) {

            var graphrenderer = new $class();

            //Assert
            expect(graphrenderer).toBeTruthy();

        }).catch(function (error) {
            expect(new Error(error)).caught();
        }).then(function () {
            done();
        });;
    });


    it('set graphrenderer ', function (done) {
        MEPH.create('MEPH.graph.GraphRenderer').then(function ($class) {

            //Assert
            var graphrenderer = new $class();
            graphrenderer.setGraph({});
            //Act
            var graph = graphrenderer.getGraph();

            //Assert
            expect(graph).toBeTruthy();

        }).catch(function (error) {
            expect(new Error(error)).caught();
        }).then(function () {
            done();
        });;
    });
    it('get nodes ', function (done) {
        MEPH.requires('MEPH.graph.Connection').then(function () {
            return MEPH.create('MEPH.graph.GraphRenderer').then(function ($class) {


                //Arrange
                var graph = GraphTest.createGraphWithNodesAndConnections();
                var graphrenderer = new $class();
                graphrenderer.setGraph(graph);

                //Act
                var nodes = graphrenderer.getNodes();

                //Assert
                expect(nodes.length === graph.getNodes().length).toBeTruthy();

            }).catch(function (error) {
                expect(new Error(error)).caught();
            }).then(function () {
                done();
            });;
        });
    });

    it('create graph and render nodes in graphviewport ', function (done) {
        MEPH.requires('MEPH.graph.Connection', 'MEPH.graph.renderer.SquareBoxRenderer').then(function () {
            return MEPH.create('MEPH.graph.GraphRenderer').then(function ($class) {

                var graphviewport = new MEPH.graph.GraphViewPort();
                var graph = GraphTest.createGraphWithNodesAndConnections();
                var graphrenderer = new MEPH.graph.GraphRenderer();
                var sbr = new MEPH.graph.renderer.SquareBoxRenderer();
                graphviewport.setup('body', { width: 600, height: 400 });
                graphrenderer.setNodeRenderer(sbr);
                graphrenderer.setGraph(graph);
                graphrenderer.setViewPort(graphviewport);
                graphrenderer.use('viewport');
                graphviewport.setGraph(graph);

                //Act
                graphrenderer.render();

                //Assert
                graphviewport.destroy();

                //Assert

            }).catch(function (error) {
                expect(new Error(error)).caught();
            }).then(function () {
                done();
            });;
        });
    });
    it('Get connections ', function (done) {
        MEPH.requires('MEPH.graph.GraphViewPort',
            'MEPH.graph.GraphRenderer',
            'MEPH.graph.renderer.BlenderNode',
            'MEPH.graph.Node',
            'MEPH.graph.renderer.ConnectionRenderer',
            'MEPH.graph.Connection', 'MEPH.graph.renderer.SquareBoxRenderer').then(function () {

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
                graphviewport.fullwindow = true;
                //Act
                var connections = graphrenderer.getConnections();

                //Assert
                expect(connections).toBeTruthy();
                graphviewport.destroy();

            }).catch(function (error) {
                expect(new Error(error)).caught();
            }).then(function () {
                done();
            });;
    });
    
    it('Blender node and connectionsrender ', function (done) {
        MEPH.requires('MEPH.graph.GraphViewPort',
            'MEPH.graph.GraphRenderer',
            'MEPH.graph.renderer.BlenderNode',
            'MEPH.graph.Node',
            'MEPH.graph.renderer.ConnectionRenderer',
            'MEPH.graph.Connection').then(function () {

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

                //Act
                graphrenderer.render();

                //Assert
                graphviewport.destroy();

            }).catch(function (error) {
                expect(new Error(error)).caught();
            }).then(function () {
                done();
            });;
    });
     
      
});