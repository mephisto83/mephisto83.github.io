describe("MEPH/graph/ActiveZone.spec.js", function () {
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

    it("create active zone", function (done) {
        //Arrange

        //Act
        MEPH.create('MEPH.graph.ActiveZone').then(function ($class) {
            //Act
            var activezone = new $class();

            //Assert
            expect(activezone).toBeTruthy();

        }).catch(function (error) {
            expect(error).caught();
        }).then(function (x) {
            done();
        });
    });

    it("set graphviewport on ActiveZone", function (done) {
        //Arrange

        //Act
        MEPH.requires('MEPH.graph.GraphViewPort').then(function () {
            return MEPH.create('MEPH.graph.ActiveZone').then(function ($class) {
                //Arrange
                var activezone = new $class();
                var graphviewport = new MEPH.graph.GraphViewPort();

                //Act
                activezone.setGraphViewPort(graphviewport);

                //Assert
                expect(activezone.getGraphViewPort()).toBeTruthy();
                expect(activezone.getGraphViewPort() === graphviewport).toBeTruthy();

            })
        }).catch(function (error) {
            expect(error).caught();
        }).then(function (x) {
            done();
        });
    });
    it("Add dom object", function (done) {
        //Arrange

        //Act
        MEPH.requires('MEPH.graph.GraphViewPort').then(function () {
            return MEPH.create('MEPH.graph.ActiveZone').then(function ($class) {
                //Arrange
                var activezone = new $class();
                var graphviewport = new MEPH.graph.GraphViewPort();
                graphviewport.setup('body', { width: 600, height: 400 });
                activezone.setGraphViewPort(graphviewport);
                var div = document.createElement('div');
                //Act
                activezone.setDom(div);

                //Assert
                expect(activezone.getDom()).toBeTruthy();
                graphviewport.destroy();

            })
        }).catch(function (error) {
            expect(error).caught();
        }).then(function (x) {
            done();
        });
    });
    it("detect click", function (done) {
        //Arrange

        //Act
        MEPH.requires('MEPH.graph.GraphViewPort').then(function () {
            return MEPH.create('MEPH.graph.ActiveZone').then(function ($class) {
                //Arrange
                var activezone = new $class();
                var graphviewport = new MEPH.graph.GraphViewPort();
                graphviewport.setup('body', { width: 600, height: 400 });
                activezone.setGraphViewPort(graphviewport);
                var div = document.createElement('div');
                activezone.setDom(div);
                var activezoneclicked = false

                activezone.clickable();
                //Act
                activezone.on('click', function () { activezoneclicked = true; });
                div.dispatchEvent(GraphTest.createEvent('click', {}));

                //Assert
                expect(activezoneclicked).toBeTruthy();
                graphviewport.destroy();

            })
        }).catch(function (error) {
            expect(error).caught();
        }).then(function (x) {
            done();
        });
    });

    it("position dom element according to graphviewport", function (done) {
        //Arrange

        //Act
        MEPH.requires('MEPH.graph.GraphViewPort').then(function () {
            return MEPH.create('MEPH.graph.ActiveZone').then(function ($class) {
                //Arrange
                var activezone = new MEPH.graph.ActiveZone();
                var graphviewport = new MEPH.graph.GraphViewPort();
                graphviewport.setup('body', { width: 600, height: 400 });
                activezone.setGraphViewPort(graphviewport);
                var div = document.createElement('div');
                div.style.height = "20px";
                div.style.width = "20px";
                div.style.backgroundColor = 'yellow';
                activezone.setDom(div);
                var activezoneclicked = false
                //Act
                graphviewport.setPosition(109, 10, 0);

                graphviewport.destroy();
            })
        }).catch(function (error) {
            expect(error).caught();
        }).then(function (x) {
            done();
        });
    });
    it("set active zone type", function (done) {
        //Arrange

        //Act
        MEPH.requires('MEPH.graph.GraphViewPort').then(function () {
            return MEPH.create('MEPH.graph.ActiveZone').then(function ($class) {
                //Arrange
                var activezone = new MEPH.graph.ActiveZone();

                //Act
                activezone.clickable();

                //Assert
                expect(activezone.$clickable).toBeTruthy();
            })
        }).catch(function (error) {
            expect(error).caught();
        }).then(function (x) {
            done();
        });
    });

    it("set active zone type draggable", function (done) {
        //Arrange

        //Act
        MEPH.requires('MEPH.graph.GraphViewPort').then(function () {
            return MEPH.create('MEPH.graph.ActiveZone').then(function ($class) {
                //Arrange
                var activezone = new MEPH.graph.ActiveZone();

                //Act
                activezone.draggable();

                //Assert
                expect(activezone.$draggable).toBeTruthy();
            })
        }).catch(function (error) {
            expect(error).caught();
        }).then(function (x) {
            done();
        });
    });

    it("assign active zone to node", function (done) {
        //Arrange

        //Act
        MEPH.requires('MEPH.graph.Node').then(function () {
            return MEPH.create('MEPH.graph.ActiveZone').then(function ($class) {
                //Arrange
                var activezone = new MEPH.graph.ActiveZone();
                var node = new MEPH.graph.Node();

                //Act
                node.addZone(activezone);

                //Assert
                expect(node.getZones().length === 1).toBeTruthy();
            })
        }).catch(function (error) {
            expect(error).caught();
        }).then(function (x) {
            done();
        });
    });
    it("Active zone set zone type", function (done) {
        //Arrange

        //Act
        MEPH.requires('MEPH.graph.Node').then(function () {
            return MEPH.create('MEPH.graph.ActiveZone').then(function ($class) {
                //Arrange
                var activezone = new MEPH.graph.ActiveZone();

                //Act
                activezone.setZoneType('temp');

                //Assert
                expect(activezone.getZoneType() === 'temp').toBeTruthy();
            })
        }).catch(function (error) {
            expect(error).caught();
        }).then(function (x) {
            done();
        });
    });
    it("Active zone set zone type", function (done) {
        //Arrange

        //Act
        MEPH.requires('MEPH.graph.Node',
            'MEPH.graph.GraphViewPort',
            'MEPH.graph.GraphRenderer',
            'MEPH.graph.renderer.BlenderNode',
            'MEPH.graph.Connection',
            'MEPH.graph.Graph',
            'MEPH.graph.renderer.ConnectionRenderer').then(function () {
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
                var clicked;
                //Act
                var zone = graphviewport.getActiveZones().first(function (item) {
                    return item.zone.getZoneType() === MEPH.graph.ActiveZone.type.connector;
                }).zone;
                zone.on('click', function () {
                    clicked = true;
                });
                zone.getDom().dispatchEvent(GraphTest.createEvent('click', {}));

                //Assert
                graphviewport.destroy();
                expect(clicked).toBeTruthy();

            }).catch(function (error) {
                expect(error).caught();
            }).then(function (x) {
                done();
            });
    });

    it("start connection on connector click", function (done) {
        MEPH.requires('MEPH.graph.Node',
            'MEPH.graph.GraphViewPort',
            'MEPH.graph.GraphRenderer',
            'MEPH.graph.renderer.BlenderNode',
            'MEPH.graph.Connection',
            'MEPH.graph.Graph',
            'MEPH.graph.renderer.ConnectionRenderer').then(function () {
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

                graphviewport.on('startconnection', function () {
                    startconnection = true;
                });

                //Act
                zone.getDom().dispatchEvent(GraphTest.createEvent('click', {}));

                //Assert
                graphviewport.destroy();
                expect(startconnection).toBeTruthy();
            }).catch(function (error) {
                expect(error).caught();
            }).then(function (x) {
                done();
            });
    });
});