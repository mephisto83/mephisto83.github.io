describe("MEPH/graph/Node.spec.js", function () {
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

    it("can create a node", function (done) {
        //Arrange

        //Act
        MEPH.create('MEPH.graph.Node').then(function ($class) {
            //Assert
            var input = new $class();

            expect(input).toBeTruthy();

        }).catch(function (error) {
            expect(error).caught();
        }).then(function (x) {
            done();
        });
    });
    it("Set node Id", function (done) {
        //Arrange

        //Act
        MEPH.create('MEPH.graph.Node').then(function ($class) {
            //Assert
            var id = 'nodeid';
            var node = new $class();
            node.setId(id);
            expect(id === node.getId()).toBeTruthy();

            expect(node).toBeTruthy();

        }).catch(function (error) {
            expect(error).caught();
        }).then(function (x) {
            done();
        });
    });
    it("Get node Id", function (done) {
        //Arrange

        //Act
        MEPH.create('MEPH.graph.Node').then(function ($class) {
            //Assert
            var id = 'nodeid';
            var node = new $class();
            node.setId(id);
            expect(id === node.getId()).toBeTruthy();

            expect(node).toBeTruthy();

        }).catch(function (error) {
            expect(error).caught();
        }).then(function (x) {
            done();
        });
    });

    it("Get node by id", function (done) {
        //Arrange

        //Act
        MEPH.requires('MEPH.graph.Graph').then(function () {
            return MEPH.create('MEPH.graph.Node').then(function ($class) {
                //Assert
                var graph = new MEPH.graph.Graph();
                var guid = MEPH.GUID();
                var node = new $class();
                node.setId(guid);
                graph.addNode(node);
                var gotnode = graph.getNode(guid);

                expect(guid === node.getId()).toBeTruthy();

                //Assert 
                expect(gotnode === node).toBeTruthy();

            }).catch(function (error) {
                expect(error).caught();
            }).then(function (x) {
                done();
            })
        });;
    });
    it("remove node from graph", function (done) {
        //Arrange

        //Act
        MEPH.requires('MEPH.graph.Graph', 'MEPH.graph.Connection', 'MEPH.graph.Node').then(function () {

            //Arrange
            var graph = GraphTest.createGraphWithNodesAndConnections();
            var length = graph.getNodes().length;
            var node = graph.getNodes().first();

            //Act
            var result = graph.removeNode(node);

            //Assert
            expect(result).toBeTruthy();
            expect(length - 1 === graph.getNodes().length).toBeTruthy();
        }).catch(function (error) {
            expect(error).caught();
        }).then(function (x) {
            done();
        })
    });

    it("remove nodes from graph and fire node removedevent", function (done) {
        //Arrange

        //Act
        MEPH.requires('MEPH.graph.Graph', 'MEPH.graph.Connection', 'MEPH.graph.Node').then(function () {
            var noderemoved;
            var graph = GraphTest.createGraphWithNodesAndConnections();
            var node = graph.getNodes().first();
            //Act
            graph.on('noderemoved', function () { noderemoved = true; });
            graph.removeNode(node);

            //Assert
            expect(noderemoved).toBeTruthy();
        }).catch(function (error) {
            expect(error).caught();
        }).then(function (x) {
            done();
        })
    });

    it("add nodes to graph and fire node nodeadded", function (done) {
        //Arrange

        //Act
        MEPH.requires('MEPH.graph.Graph', 'MEPH.graph.Connection', 'MEPH.graph.Node').then(function () {
            //Arrange
            var nodeadded;
            var graph = GraphTest.createGraphWithNodesAndConnections();
            var node = new MEPH.graph.Node();
            //Act
            graph.on('nodeadded', function () { nodeadded = true; });
            graph.addNode(node);

            //Assert
            expect(nodeadded).toBeTruthy();
        }).catch(function (error) {
            expect(error).caught();
        }).then(function (x) {
            done();
        })
    });
    it("remove node from graph and connection removes corresponding node", function (done) {
        //Arrange

        //Act
        MEPH.requires('MEPH.graph.Graph', 'MEPH.graph.Connection', 'MEPH.graph.Node').then(function () {

            //Arrange
            var connectionchanged;
            var graph = GraphTest.createGraphWithNodesAndConnections();
            var node = graph.getNodes().first();
            var connection = graph.getConnections().first();

            //Act;
            connection.on('changed', function () { connectionchanged = true; });
            graph.removeNode(node);

            //Assert
            expect(connectionchanged).toBeTruthy();
        }).catch(function (error) {
            expect(error).caught();
        }).then(function (x) {
            done();
        })
    });
    it("when connections add new nodes, handlers setup node event handling", function (done) {
        //Arrange

        //Act
        MEPH.requires('MEPH.graph.Graph', 'MEPH.graph.Connection', 'MEPH.graph.Node').then(function () {

            //Arrange
            var nodeRemoved;
            var node = new MEPH.graph.Node();
            var connection = new MEPH.graph.Connection();
            connection.addNode(node);
            connection.on('changed', function () { nodeRemoved = true });

            //Act
            node.removed();

            //Assert
            expect(nodeRemoved).toBeTruthy();

        }).catch(function (error) {
            expect(error).caught();
        }).then(function (x) {
            done();
        })
    });
    it("when connections remove nodes, handlers setup node event handling", function (done) {
        //Arrange

        //Act
        MEPH.requires('MEPH.graph.Graph', 'MEPH.graph.Connection', 'MEPH.graph.Node').then(function () {
            //Arrange
            var nodeRemoved;
            var node = new MEPH.graph.Node();
            var connection = new MEPH.graph.Connection();
            connection.addNode(node);
            connection.on('changed', function () { nodeRemoved = true });

            //Act
            connection.removeNode(node);

            //Assert
            expect(nodeRemoved).toBeTruthy();

        }).catch(function (error) {
            expect(error).caught();
        }).then(function (x) {
            done();
        })
    });

    it("when connections are removed nodes handle it", function (done) {
        //Arrange

        //Act
        MEPH.requires('MEPH.graph.Graph', 'MEPH.graph.Connection', 'MEPH.graph.Node').then(function () {
            //Arrange
            var connectionRemoved;
            var node = new MEPH.graph.Node();
            var connection = new MEPH.graph.Connection();
            var graph = new MEPH.graph.Graph();
            graph.addConnection(connection);
            connection.addNode(node);

            node.on('changed', function () { connectionRemoved = true });

            //Act
            graph.removeConnection(connection);

            //Assert
            expect(connectionRemoved).toBeTruthy();

        }).catch(function (error) {
            expect(error).caught();
        }).then(function (x) {
            done();
        })
    });
    it("add connection to node", function (done) {
        //Arrange

        //Act
        MEPH.requires('MEPH.graph.Graph', 'MEPH.graph.Connection', 'MEPH.graph.Node').then(function () {
            //Arrange
            var node = new MEPH.graph.Node();
            var connection = new MEPH.graph.Connection();
            //Act
            node.addConnection(connection);

            //Assert
            expect(node.getConnections().length === 1).toBeTruthy();

        }).catch(function (error) {
            expect(error).caught();
        }).then(function (x) {
            done();
        })
    });
    it("remove connection from node", function (done) {
        //Arrange

        //Act
        MEPH.requires('MEPH.graph.Graph', 'MEPH.graph.Connection', 'MEPH.graph.Node').then(function () {
            //Arrange
            var node = new MEPH.graph.Node();
            var connection = new MEPH.graph.Connection();
            node.addConnection(connection);

            //Act
            node.removeConnection(connection);

            //Assert
            expect(node.getConnections().length === 0).toBeTruthy();

        }).catch(function (error) {
            expect(error).caught();
        }).then(function (x) {
            done();
        })
    });
    it("set node position", function (done) {
        //Arrange

        //Act
        MEPH.requires('MEPH.graph.Graph', 'MEPH.graph.Connection', 'MEPH.graph.Node').then(function () {
            //Arrange
            //Arrange
            var node = new MEPH.graph.Node();

            //Act
            node.setPosition(1, 2, 3);

            //Assert
            expect(node.getPosition()).toBeTruthy();

        }).catch(function (error) {
            expect(error).caught();
        }).then(function (x) {
            done();
        })
    });
    it("node moved", function (done) {
        //Arrange

        //Act
        MEPH.requires('MEPH.graph.Graph', 'MEPH.graph.Connection', 'MEPH.graph.Node').then(function () {
            //Arrange
            var node = new MEPH.graph.Node();
            var moved;
            node.on('move', function () { moved = true; });
            //Act
            node.setPosition(1, 2, 3);

            //Assert
            expect(node.getPosition()).toBeTruthy();
            expect(moved).toBeTruthy();

        }).catch(function (error) {
            expect(error).caught();
        }).then(function (x) {
            done();
        })
    });
    it("Append node data", function (done) {
        //Arrange

        //Act
        MEPH.requires('MEPH.graph.Node').then(function () {
            //Arrange
            //Arrange
            var node = new MEPH.graph.Node();

            //Act
            node.appendData({ title: 'Title' });

            //Assert
            expect(node.getTitle() === 'Title').toBeTruthy();

        }).catch(function (error) {
            expect(error).caught();
        }).then(function (x) {
            done();
        })
    });
});