describe("MEPH/graph/renderer/SquareBoxRenderer.spec.js", function () {
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


    it("create square box node renderer", function (done) {
        //Arrange

        //Act
        MEPH.requires('MEPH.graph.Graph').then(function () {
            return MEPH.create('MEPH.graph.renderer.SquareBoxRenderer').then(function ($class) {
                //Arrange

                //Act
                var squareboxrenderer = new $class();

                //Assert
                expect(squareboxrenderer).toBeTruthy();
                squareboxrenderer.destroy(true);
            })
        }).catch(function (error) {
            expect(error).caught();
        }).then(function (x) {
            done();
        });
    });


    it("Draw node at 100, 100", function (done) {
        //Arrange

        //Act
        MEPH.requires('MEPH.graph.Graph').then(function () {
            return MEPH.create('MEPH.graph.renderer.SquareBoxRenderer').then(function ($class) {
                //Arrange
                var sbr = new $class();
                var canvas = document.createElement('canvas');
                document.body.appendChild(canvas);
                canvas.height = 300;
                canvas.width = 400;
                sbr.setCanvas(canvas);
                //Act
                var result = sbr.draw({
                    x: 100,
                    y: 100
                })

                //Assert;
                expect(result).toBeTruthy();
                canvas.parentNode.removeChild(canvas);
            })
        }).catch(function (error) {
            expect(error).caught();
        }).then(function (x) {
            done();
        });
    });
    it("Draw cached canvas", function (done) {
        //Arrange

        //Act
        MEPH.requires('MEPH.graph.Graph').then(function () {
            return MEPH.create('MEPH.graph.renderer.SquareBoxRenderer').then(function ($class) {
                //Arrange
                var sbr = new $class();

                var canvas = GraphTest.createCanvas();
                sbr.setCanvas(canvas);

                //Act
                sbr.drawToCache();
                sbr.destroy(true);
                //Assert
            })
        }).catch(function (error) {
            expect(error).caught();
        }).then(function (x) {
            done();
        });
    });

    it('set option for noderenderer ', function (done) {
        MEPH.create('MEPH.graph.renderer.SquareBoxRenderer').then(function ($class) {

            var options = {};
            var sbr = new $class();

            //Act 

            sbr.setOptions(options);

            //Assert
            expect(sbr.getOptions() === options).toBeTruthy();

        }).catch(function (error) {
            expect(new Error(error)).caught();
        }).then(function () {
            done();
        });;
    });
});