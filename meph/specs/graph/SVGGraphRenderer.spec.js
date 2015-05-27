describe("MEPH/graph/SVGGraphRenderer.spec.js",
    'MEPH.audio.graph.node.Convolver',
    'MEPH.graph.SVGGraphRenderer', 'MEPH.graph.Graph', function () {

        beforeEach(function () {
            jasmine.addMatchers(MEPH.customMatchers);
        });

        it("create graphrenderer", function (done) {
            //Arrange

            //Act
            MEPH.create('MEPH.graph.SVGGraphRenderer').then(function ($class) {
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

        it('a svg graph renderer passes all the nodes to be rendered to the node renderer and all the connections to the connection ' +
            'renderer', function () {
                var called, ccalled,
                    graph = new MEPH.graph.Graph(),
                    renderer = new MEPH.graph.SVGGraphRenderer();
                renderer.setGraph(graph);
                renderer.getNodeRenderer = function () {
                    return {
                        render: function () {
                            called = true;
                        }
                    }
                }
                renderer.getViewPort = function () {
                    return {
                        getCanvas: function () { }
                    }
                }
                renderer.getConnectionRenderer = function () {
                    return {
                        render: function () {
                            ccalled = true;
                        }
                    }
                }
                renderer.render();
                expect(called).toBeTruthy();
                expect(ccalled).toBeTruthy();
            });
        it('can register a node template with a svg graph renderer ', function () {
            var called, ccalled,
            graph = new MEPH.graph.Graph(),
            renderer = new MEPH.graph.SVGGraphRenderer();

            renderer.registerTemplate('convolver');

            var template = renderer.getTemplate('convolver');
            expect(template).toBeTruthy();
        });
        it('can register a node template with a svg graph renderer ', function () {
            var called, ccalled,
            graph = new MEPH.graph.Graph(),
            renderer = new MEPH.graph.SVGGraphRenderer();

            var template = renderer.getTemplate('convolvecr');
            expect(template).toBeFalsy();
        })

    });