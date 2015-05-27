describe("MEPH/audio/graph/AudioGraph.spec.js", 'MEPH.audio.graph.AudioGraph', function () {

    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });

    it("can create a AudioGraph", function () {
        //Arrange

        //Assert
        var input = new MEPH.audio.graph.AudioGraph();

        expect(input).toBeTruthy();

    });

    it('can render a AudioGraph', function (done) {
        MEPH.render('MEPH.audio.graph.AudioGraph', 'audiograph').then(function (r) {
            var results = r.res;
            var app = r.app;

            var dom,
                AudioGraph = results.first().classInstance;
            ///Assert
            dom = AudioGraph.getDomTemplate()[0]
            expect(dom).toBeTruthy();
            if (app) {
                app.removeSpace();
            }
        }).catch(function (error) {
            expect(error || new Error('did not render as expected')).caught();
        }).then(function () {
            done();
        });
    });

    it('can add a convolver AudioGraph', function (done) {
        MEPH.render('MEPH.audio.graph.AudioGraph', 'audiograph').then(function (r) {
            var results = r.res;
            var app = r.app;

            var dom,
                AudioGraph = results.first().classInstance;
            ///Assert
            dom = AudioGraph.getDomTemplate()[0];

            AudioGraph.addConvolver();
            expect(dom).toBeTruthy();

            return new Promise(function (r) {
                setTimeout(function () {
                    var d = AudioGraph.graph;
                    if (app) {
                        app.removeSpace();
                    }
                    r();
                }, 5000)
            });
        }).catch(function (error) {
            expect(error || new Error('did not render as expected')).caught();
        }).then(function () {
            done();
        });
    });

    it('can save an audio graph with nodes only ', function (done) {
        MEPH.render('MEPH.audio.graph.AudioGraph', 'audiograph').then(function (r) {
            var results = r.res;
            var app = r.app;

            var dom,
                AudioGraph = results.first().classInstance;
            ///Assert
            dom = AudioGraph.getDomTemplate()[0];

            return AudioGraph.addConvolver().then(function () {
                var d = AudioGraph.graph;

                var result = AudioGraph.saveGraph();
                var node = result.nodes.first();
                expect(result.connections).toBeTruthy();
                expect(node.data).toBeTruthy();
                expect(node.id).toBeTruthy();
                expect(node.position).toBeTruthy();
                expect(node.data.type).toBeTruthy();
                expect(node.data.nodeOutputs).toBeTruthy();
                expect(node.data.nodeInputs).toBeTruthy();
                if (app) {
                    app.removeSpace();
                }
            });
        }).catch(function (error) {
            expect(error || new Error('did not render as expected')).caught();
        }).then(function () {
            done();
        });
    });

    it('can save more than one node', function (done) {
        MEPH.render('MEPH.audio.graph.AudioGraph', 'audiograph').then(function (r) {
            var results = r.res;
            var app = r.app;

            var dom,
                AudioGraph = results.first().classInstance;
            ///Assert
            dom = AudioGraph.getDomTemplate()[0];

            return Promise.all([AudioGraph.addConvolver(), AudioGraph.addConvolver()]).then(function () {
                var d = AudioGraph.graph;

                var result = AudioGraph.saveGraph();
                var node = result.nodes.first();
                expect(node.data).toBeTruthy();
                expect(node.id).toBeTruthy();
                expect(node.position).toBeTruthy();
                expect(node.data.type).toBeTruthy();
                expect(node.data.nodeOutputs).toBeTruthy();
                expect(node.data.nodeInputs).toBeTruthy();
                if (app) {
                    app.removeSpace();
                }
            });
        }).catch(function (error) {
            expect(error || new Error('did not render as expected')).caught();
        }).then(function () {
            done();
        });
    });

    it('can save to a json string', function (done) {
        MEPH.render('MEPH.audio.graph.AudioGraph', 'audiograph').then(function (r) {
            var results = r.res;
            var app = r.app;

            var dom,
                AudioGraph = results.first().classInstance;
            ///Assert
            dom = AudioGraph.getDomTemplate()[0];

            return Promise.all([AudioGraph.addConvolver()]).then(function () {
                var d = AudioGraph.graph;

                var result = AudioGraph.save();
                var res = JSON.parse(result);
                expect(res).toBeTruthy();
                if (app) {
                    app.removeSpace();
                }
            });
        }).catch(function (error) {
            expect(error || new Error('did not render as expected')).caught();
        }).then(function () {
            done();
        });
    });


    it('can load a graph', function (done) {
        MEPH.render('MEPH.audio.graph.AudioGraph', 'audiograph').then(function (r) {
            var results = r.res;
            var app = r.app;

            var dom,
                AudioGraph = results.first().classInstance;
            ///Assert
            dom = AudioGraph.getDomTemplate()[0];

            return Promise.all([AudioGraph.addConvolver()]).then(function () {
                var d = AudioGraph.graph;
                var result = AudioGraph.save();
                var res = JSON.parse(result);
                return AudioGraph.loadGraph(result).then(function () {
                    expect(res).toBeTruthy();
                    if (app) {
                        app.removeSpace();
                    }
                });
            });
        }).catch(function (error) {
            expect(error || new Error('did not render as expected')).caught();
        }).then(function () {
            done();
        });
    });

    it('can load a graph with connections', function (done) {
        MEPH.render('MEPH.audio.graph.AudioGraph', 'audiograph').then(function (r) {
            var results = r.res;
            var app = r.app;

            var dom,
                AudioGraph = results.first().classInstance;
            ///Assert
            dom = AudioGraph.getDomTemplate()[0];

            return Promise.all([AudioGraph.addConvolver()]).then(function () {
                return new Promise(function (r) {
                    setTimeout(function () {

                        var d = AudioGraph.graph;
                        var node = d.getNodes().first();
                        var zones = node.getZones().subset(0, 2);
                        var connections = AudioGraph.graphviewport.createConnection(zones);
                        var result = AudioGraph.save();
                        var res = JSON.parse(result);
                        return AudioGraph.loadGraph(result).then(function () {
                            expect(res).toBeTruthy();
                            if (app) {
                                app.removeSpace();
                            }
                            r();
                        });
                    }, 1000)
                })
            });
        }).catch(function (error) {
            expect(error || new Error('did not render as expected')).caught();
        }).then(function () {
            done();
        });
    });
});