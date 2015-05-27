describe("MEPH/graph/GraphViewPort.spec.js", function () {
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

    it("can create a graphviewport", function (done) {
        //Arrange

        //Act
        MEPH.create('MEPH.graph.GraphViewPort').then(function ($class) {
            //Arrange

            //Act
            var graphviewport = new $class();

            //Assert
            expect(graphviewport).toBeTruthy();
            graphviewport.destroy();

        }).catch(function (error) {
            expect(error).caught();
        }).then(function (x) {
            done();
        });
    });

    it("assign graph", function (done) {
        //Arrange

        //Act
        MEPH.create('MEPH.graph.GraphViewPort').then(function ($class) {
            //Arrange
            var graph = new MEPH.graph.Graph();
            var graphviewport = new MEPH.graph.GraphViewPort();

            //Act
            graphviewport.setGraph(graph);

            //Assert
            expect(graphviewport.getGraph() === graph).toBeTruthy();
            graphviewport.destroy();

        }).catch(function (error) {
            expect(error).caught();
        }).then(function (x) {
            done();
        });
    });
    it("assign canvas", function (done) {
        //Arrange

        //Act
        MEPH.create('MEPH.graph.GraphViewPort').then(function ($class) {
            //Arrange
            var graphviewport = new MEPH.graph.GraphViewPort();
            var canvas = document.createElement('canvas');
            document.body.appendChild(canvas);
            //Act
            graphviewport.setCanvas(canvas);

            //Assert
            expect(canvas).toBeTruthy();
            expect(canvas).toBeTruthy();
            expect(graphviewport.getCanvas() === canvas).toBeTruthy();
            graphviewport.destroy();

        }).catch(function (error) {
            expect(error).caught();
        }).then(function (x) {
            done();
        });
    });

    it("apply size to canvas", function (done) {
        //Arrange

        //Act
        MEPH.create('MEPH.graph.GraphViewPort').then(function ($class) {
            //Arrange
            var height = 400;
            var width = 400;
            var graphviewport = new MEPH.graph.GraphViewPort();
            var canvas = document.createElement('canvas');
            document.body.appendChild(canvas);
            graphviewport.setCanvas(canvas);
            //Act
            graphviewport.setCanvasSize({ height: height, width: width });
            //Assert
            expect(canvas).toBeTruthy();
            expect(graphviewport.getCanvas() === canvas).toBeTruthy();
            expect(canvas.height === height).toBeTruthy();
            expect(canvas.width === width).toBeTruthy();
            graphviewport.destroy();

            expect(canvas).toBeTruthy();
            expect(graphviewport.getCanvas() === canvas).toBeTruthy();
            graphviewport.destroy();

        }).catch(function (error) {
            expect(error).caught();
        }).then(function (x) {
            done();
        });
    });

    it("add invisible mask over canvas", function (done) {
        //Arrange

        //Act
        MEPH.create('MEPH.graph.GraphViewPort').then(function ($class) {
            //Arrange
            var height = 400;
            var width = 430;
            var graphviewport = new MEPH.graph.GraphViewPort();
            var canvas = document.createElement('canvas');
            document.body.appendChild(canvas);
            graphviewport.setCanvas(canvas);
            graphviewport.setCanvasSize({ height: height, width: width });

            //Act
            graphviewport.applyMask();

            //Assert
            expect(canvas).toBeTruthy();
            expect(graphviewport.getMask()).toBeTruthy();
            expect(canvas.width === width).toBeTruthy();
            expect(canvas.height === height).toBeTruthy();
            expect(graphviewport.getCanvas() === canvas).toBeTruthy();
            graphviewport.destroy();


        }).catch(function (error) {
            expect(error).caught();
        }).then(function (x) {
            done();
        });
    });
    it("setup dock", function (done) {
        //Arrange

        //Act
        MEPH.create('MEPH.graph.GraphViewPort').then(function ($class) {

            var temp = {};
            var graphviewport = new MEPH.graph.GraphViewPort();
            //Act
            graphviewport.setDock(temp);

            //Assert
            expect(temp, graphviewport.getDock()).toBeTruthy();
            graphviewport.destroy();

        }).catch(function (error) {
            expect(error).caught();
        }).then(function (x) {
            done();
        });
    });
    it("add invisible mask over canvas", function (done) {
        //Arrange

        //Act
        MEPH.create('MEPH.graph.GraphViewPort').then(function ($class) {
            //Arrange
            var height = 400;
            var width = 430;
            var graphviewport = new MEPH.graph.GraphViewPort();
            var canvas = document.createElement('canvas');
            document.body.appendChild(canvas);
            //Act

            graphviewport.setup('body', canvas, { height: height, width: width });

            //Assert
            expect(canvas).toBeTruthy();
            expect(canvas).toBeTruthy();
            expect(graphviewport.getCanvas());
            expect(graphviewport.getMask()).toBeTruthy();

            graphviewport.destroy();

        }).catch(function (error) {
            expect(error).caught();
        }).then(function (x) {
            done();
        });
    });

    it('Set garphviewport space ', function (done) {
        MEPH.create('MEPH.graph.GraphViewPort').then(function ($class) {
            //Arrange
            var viewport = new $class();

            //Act
            viewport.setPosition(0, 0, 0);

            //Assert
            expect(viewport.getPosition()).toBeTruthy();
            viewport.destroy();

        }).catch(function (error) {
            expect(new Error(error)).caught();
        }).then(function () {
            done();
        });;
    });

    it('set graphviewport renderer ', function (done) {
        MEPH.create('MEPH.graph.GraphViewPort').then(function ($class) {

            //Arrange
            var viewport = new $class();

            //Act
            viewport.setRenderer({});

            //Assert
            expect(viewport.getRenderer()).toBeTruthy();

        }).catch(function (error) {
            expect(new Error(error)).caught();
        }).then(function () {
            done();
        });;
    });

    it('mousedown on graphviewport will start viewport drag ', function (done) {
        MEPH.create('MEPH.graph.GraphViewPort').then(function ($class) {

            //Arrange
            var height = 400;
            var width = 430;
            var graphviewport = new $class();
            var canvas = document.querySelector('canvas');
            var dragstarted = false;

            //Act
            graphviewport.on('startdrag', function () {
                dragstarted = true;
            });

            graphviewport.setup('body', canvas, { height: height, width: width });
            graphviewport.$mask.dispatchEvent(new Event('mousedown', { x: 1, y: 3 }));

            //Assert
            expect(dragstarted).toBeTruthy();
            graphviewport.destroy();
        }).catch(function (error) {
            expect(new Error(error)).caught();
        }).then(function () {
            done();
        });;
    });


    it('mouseout on graphviewport stop drag ', function (done) {
        MEPH.create('MEPH.graph.GraphViewPort').then(function ($class) {
            var height = 400;
            var width = 430;
            var graphviewport = new $class();
            var canvas = document.querySelector('canvas');
            var dragstarted = false;
            var dragended = false;
            //Act
            graphviewport.on('startdrag', function () {
                dragstarted = true;
            });
            graphviewport.on('canceldrag', function () {
                dragended = true;
            });
            graphviewport.setup('body', canvas, { height: height, width: width });
            graphviewport.$mask.dispatchEvent(new Event('mousedown', { x: 1, y: 3 }));
            graphviewport.$mask.dispatchEvent(new Event('mouseout', { x: 1, y: 3 }));

            //Assert
            expect(dragstarted).toBeTruthy();
            expect(dragended).toBeTruthy()
            graphviewport.destroy();
        }).catch(function (error) {
            expect(new Error(error)).caught();
        }).then(function () {
            done();
        });;
    });
    it('mouseup on graphviewport stop drag ', function (done) {
        return MEPH.create('MEPH.graph.GraphViewPort').then(function ($class) {
            //Arrange
            var height = 400;
            var width = 430;
            var graphviewport = new $class();
            var canvas = document.querySelector('canvas');
            var dragstarted = false;
            var dragended = false;
            //Act
            graphviewport.on('startdrag', function () {
                dragstarted = true;
            });
            graphviewport.on('stopdrag', function () {
                dragended = true;
            });
            graphviewport.setup('body', canvas, { height: height, width: width });
            graphviewport.$mask.dispatchEvent(new Event('mousedown', { x: 1, y: 3 }));
            graphviewport.$mask.dispatchEvent(new Event('mouseup', { x: 1, y: 3 }));

            //Assert
            expect(dragstarted).toBeTruthy();
            expect(dragended).toBeTruthy();
            graphviewport.destroy();

        }).catch(function (error) {
            expect(new Error(error)).caught();
        }).then(function () {
            done();
        });;
    });

    it('mousemove on graphviewport fires viewportmove ', function (done) {
        return MEPH.create('MEPH.graph.GraphViewPort').then(function ($class) {
            //Arrange
            var height = 400;
            var width = 430;
            var graphviewport = new $class();
            var canvas = document.querySelector('canvas');
            var dragstarted = false;
            var viewportmoved = false;
            //Act
            graphviewport.on('startdrag', function () {
                dragstarted = true;
            });
            graphviewport.on('viewportmove', function () {
                viewportmoved = true;
            });
            graphviewport.setup('body', canvas, { height: height, width: width });
            graphviewport.$mask.dispatchEvent(new Event('mousedown', { x: 1, y: 3 }));
            graphviewport.$mask.dispatchEvent(new Event('mousemove', { x: 11, y: 31 }));

            //Assert
            expect(dragstarted).toBeTruthy();
            expect(viewportmoved).toBeTruthy();

            graphviewport.destroy();

        }).catch(function (error) {
            expect(new Error(error)).caught();
        }).then(function () {
            done();
        });;
    });

    it('mousedown at (1,1) -> mousemove to (10,10) = viewport relative position (10,10) ', function (done) {
        return MEPH.create('MEPH.graph.GraphViewPort').then(function ($class) {
            //Arrange
            var height = 400;
            var width = 430;
            var graphviewport = new $class();
            var canvas = document.querySelector('canvas');
            graphviewport.setup('body', canvas, { height: height, width: width });

            //Act
            graphviewport.$mask.dispatchEvent(GraphTest.createEvent('mousedown', { x: 1, y: 1 }));
            graphviewport.$mask.dispatchEvent(GraphTest.createEvent('mousemove', { x: 10, y: 10 }));

            //Assert

            expect(graphviewport.getPosition().x == 9 && graphviewport.getPosition().y == 9).toBeTruthy();
            graphviewport.destroy();

        }).catch(function (error) {
            expect(new Error(error)).caught();
        }).then(function () {
            done();
        });;
    });

    it('graphviewport destroy ', function (done) {
        return MEPH.create('MEPH.graph.GraphViewPort').then(function ($class) {
            //Assert
            var graphviewport = new $class();

            //Act
            graphviewport.destroy();

            //Assert
            expect(graphviewport.isDestroyed).toBeTruthy();
            graphviewport.destroy();
        }).catch(function (error) {
            expect(new Error(error)).caught();
        }).then(function () {
            done();
        });;
    });

    it('Set connection handler ', function (done) {
        return MEPH.create('MEPH.graph.GraphViewPort').then(function ($class) {

            //Arrange
            var graphviewport = new MEPH.graph.GraphViewPort();

            //Act
            graphviewport.setConnectionHandler('handler');


            //Assert
            expect(graphviewport.getConnectionHandler() == 'handler').toBeTruthy();
        }).catch(function (error) {
            expect(new Error(error)).caught();
        }).then(function () {
            done();
        });;
    });
    it('start connection on connector click ', function (done) {
        return MEPH.requires('MEPH.graph.GraphViewPort').then(function ($class) {
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
            graphviewport.$mask.dispatchEvent(GraphTest.createEvent('mousemove', { x: 11, y: 31 }));

            //Assert
            graphviewport.destroy();
        }).catch(function (error) {
            expect(new Error(error)).caught();
        }).then(function () {
            done();
        });;
    });

    it('Connection handler handles the connection creation ', function (done) {
        return MEPH.requires('MEPH.graph.GraphViewPort', 'MEPH.graph.ActiveZone').then(function ($class) {
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
            var zone2 = graphviewport.getActiveZones().second(function (item) {
                return item.zone.getZoneType() === MEPH.graph.ActiveZone.type.connector;
            }).zone;
            zone.getDom().dispatchEvent(GraphTest.createEvent('click', {}));


            //Act
            var handled;
            graphviewport.setConnectionHandler({ createConnection: function () { handled = true; } });
            zone2.getDom().dispatchEvent(GraphTest.createEvent('click', {}));

            //Assert
            graphviewport.destroy();
            expect(handled).toBeTruthy();
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });;
    });

});