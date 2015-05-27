describe("MEPH/graph/renderer/ConnectionRenderer.spec.js", function () {
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

    it('Create connection renderer ', function (done) {
        MEPH.create('MEPH.graph.renderer.ConnectionRenderer').then(function ($class) {

            //Arrange
            //Act
            var connectionRenderer = new $class();

            //Assert
            expect(connectionRenderer).toBeTruthy();
        }).catch(function (error) {
            expect(new Error(error)).caught();
        }).then(function () {
            done();
        });;
    });

    it('Render a connection ', function (done) {
        MEPH.requires('MEPH.graph.renderer.ConnectionRenderer',
            'MEPH.graph.Connection',
            'MEPH.graph.Node',
            'MEPH.graph.ActiveZone',
            'MEPH.graph.Graph',
            'MEPH.graph.GraphViewPort').then(function () {

            //Arrange
            var connectionrenderer = new MEPH.graph.renderer.ConnectionRenderer();
            var canvas = document.createElement('canvas');
            document.body.appendChild(canvas);
            canvas.height = 300;
            canvas.width = 400;
            var graphviewport = new MEPH.graph.GraphViewPort();
            var graph = GraphTest.createGraphWithNodesAndConnections(2);
            var connection = graph.getConnections().first();

            //Act 
            var result = connectionrenderer.renderConnection(connection, canvas, { x: 0, y: 0 });

            //Assert 
            expect(result).toBeTruthy();
            canvas.parentNode.removeChild(canvas);
        }).catch(function (error) {
            expect(new Error(error)).caught();
        }).then(function () {
            done();
        });;
    });

    
    it('Render a single node connection', function (done) {
        MEPH.requires('MEPH.graph.renderer.ConnectionRenderer',
            'MEPH.graph.Connection',
            'MEPH.graph.Node',
            'MEPH.graph.ActiveZone',
            'MEPH.graph.Graph',
            'MEPH.graph.GraphViewPort').then(function () {

                //Arrange
                var connectionrenderer = new MEPH.graph.renderer.ConnectionRenderer();
                var canvas = document.createElement('canvas');
                document.body.appendChild(canvas);
                canvas.height = 300;
                canvas.width = 400;
                var graphviewport = new MEPH.graph.GraphViewPort();
                var graph = GraphTest.createGraphWithNodesAndConnections(1);
                var connection = graph.getConnections().first();

                //Act 
                var result = connectionrenderer.renderConnection(connection, canvas, { x: 0, y: 0 });

                //Assert 
                expect(result).toBeTruthy();
                canvas.parentNode.removeChild(canvas);
            }).catch(function (error) {
                expect(new Error(error)).caught();
            }).then(function () {
                done();
            });;
    });
     
    it('Set connection renderer', function (done) {
        MEPH.requires('MEPH.graph.renderer.ConnectionRenderer',
            'MEPH.graph.Connection',
            'MEPH.graph.Node',
            'MEPH.graph.GraphRenderer',
            'MEPH.graph.ActiveZone',
            'MEPH.graph.Graph',
            'MEPH.graph.GraphViewPort').then(function () {

                var connectionrenderer = new MEPH.graph.renderer.ConnectionRenderer();
                var graphrenderer = new MEPH.graph.GraphRenderer();

                //Act
                graphrenderer.setConnectionRenderer(connectionrenderer);

                //Assert
                expect(graphrenderer.getConnectionRenderer()).toBeTruthy();
            }).catch(function (error) {
                expect(new Error(error)).caught();
            }).then(function () {
                done();
            });;
    });
});