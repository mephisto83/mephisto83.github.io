describe("MEPH/audio/view/Visualizer.spec.js", 'MEPH.audio.view.Visualizer', function () {

    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });

    it("can create a visualizer", function () {
        //Arrange

        //Assert
        var input = new MEPH.audio.view.Visualizer();

        expect(input).toBeTruthy();

    });

    it('drop box has a depend property call dropboxCls, which will be computed on property change', function (done) {
        //Arrange

        MEPH.create('MEPH.audio.view.Visualizer').then(function ($class) {
            var dropbox = new $class();

            dropbox.componentCls = 'cssclass';

            //Assert
            expect(dropbox.visualizerCls.indexOf('cssclass') !== -1).theTruth('the class wasnt set correctly');
        }).catch(function (error) {
            expect(error).caught();
        }).then(function (x) {
            done();
        });
    });

    it('can render a visualizer', function (done) {
        MEPH.render('MEPH.audio.view.Visualizer', 'visualizer').then(function (r) {
            var results = r.res;
            var app = r.app;

            var dom,
                visualizer = results.first().classInstance;
            ///Assert
            dom = visualizer.getDomTemplate()[0]
            expect(dom).toBeTruthy();
            if (app) {
                app.removeSpace();
            }
        }).catch(function (error) {
            expect(error || new Error('did not render as expected')).caught();
        }).then(function () {
            done();
        })
    });


    it('has a canvas', function (done) {
        MEPH.render('MEPH.audio.view.Visualizer', 'visualizer').then(function (r) {
            var results = r.res;
            var app = r.app;
            var dom,
                visualizer = results.first().classInstance;
            ///Assert
            expect(visualizer.canvas).toBeTruthy();
            if (app) {
                app.removeSpace();
            }
        }).catch(function (error) {
            expect(error || new Error('did not render as expected')).caught();
        }).then(function () {
            done();
        })
    });


    //it('mouse wheel event will change the width of the visualizer', function (done) {
    //    MEPH.render('MEPH.audio.view.Visualizer', 'visualizer').then(function (r) {
    //        var results = r.res;
    //        var app = r.app;
    //        var dom,
    //            visualizer = results.first().classInstance;
    //        ///Assert
    //        expect(visualizer.canvas).toBeTruthy();

    //        dom = visualizer.getDomTemplate()[0];
    //        dom.dispatchEvent(MEPH.createEvent('mousewheel', { wheelDelta: 1 }));

    //        var p = new Promise(function (r, s) {
    //            setTimeout(function () {
    //                expect(visualizer.width == 301).toBeTruthy();

    //                if (app) {
    //                    app.removeSpace();
    //                }
    //                r();
    //            }, 10);
    //        });

    //        return p;
    //    }).catch(function (error) {
    //        expect(error || new Error('did not render as expected')).caught();
    //    }).then(function () {
    //        done();
    //    })
    //});


    it('can set height and width of visualizer', function (done) {
        MEPH.render('MEPH.audio.view.Visualizer', 'visualizer').then(function (r) {
            var results = r.res;
            var app = r.app;
            var dom,
                visualizer = results.first().classInstance;
            ///Assert
            visualizer.height = 400;
            visualizer.width = 400;
            return new Promise(function (r) {
                setTimeout(function () {
                    expect(parseInt(visualizer.canvas.height) === 400).toBeTruthy();
                    expect(parseInt(visualizer.canvas.width) === 400).toBeTruthy();
                    if (app) {
                        app.removeSpace();
                    }
                    r();
                }, 10)
            })
        }).catch(function (error) {
            expect(error || new Error('did not render as expected')).caught();
        }).then(function () {
            done();
        })
    })


    it('can draw', function (done) {
        MEPH.render('MEPH.audio.view.Visualizer', 'visualizer').then(function (r) {
            var results = r.res;
            var app = r.app;
            var dom,
                visualizer = results.first().classInstance;
            ///Assert
            var drawn;
            visualizer.draw = function () { drawn = true; return Promise.resolve(); }
            visualizer.source = new Uint8Array(100);
            return new Promise(function (r) {
                setTimeout(function () {
                    expect(drawn).toBeTruthy();
                    if (app) {
                        app.removeSpace();
                    }
                    r();
                }, 199)
            });
        }).catch(function (error) {
            expect(error || new Error('did not render as expected')).caught();
        }).then(function () {
            done();
        })
    });



    it('draw', function (done) {
        MEPH.render('MEPH.audio.view.Visualizer', 'visualizer').then(function (r) {
            var results = r.res;
            var app = r.app;
            var dom,
                visualizer = results.first().classInstance;
            ///Assert
            var drawn;
            var source = new Uint8Array(100);
            for (var i = 0 ; i < 100 ; i++) {
                source[i] = Math.random() * 127;
            }
            visualizer.source = source;
            return new Promise(function (r) {
                setTimeout(function () {
                    if (app) {
                        app.removeSpace();
                    }
                    r();
                }, 100)
            });
        }).catch(function (error) {
            expect(error || new Error('did not render as expected')).caught();
        }).then(function () {
            done();
        })
    });

    it('can detect mouse down on the canvas ', function (done) {
        MEPH.render('MEPH.audio.view.Visualizer', 'visualizer').then(function (r) {
            var results = r.res;
            var app = r.app;
            var dom, called,
                visualizer = results.first().classInstance;
            ///Assert
            var drawn;

            visualizer.canvas.dispatchEvent(MEPH.createEvent('mousedown', { offsetX: 1, offsetY: 1 }));
            return new Promise(function (r) {
                setTimeout(function () {
                    expect(visualizer.targetStart).toBeTruthy();
                    if (app) {
                        app.removeSpace();
                    }
                    r();
                }, 100)
            });

        }).catch(function (error) {
            expect(error || new Error('did not render as expected')).caught();
        }).then(function () {
            done();
        })
    });


    it('can detect mouse move on the canvas ', function (done) {
        MEPH.render('MEPH.audio.view.Visualizer', 'visualizer').then(function (r) {
            var results = r.res;
            var app = r.app;
            var dom, called,
                visualizer = results.first().classInstance;
            ///Assert
            var drawn;
            visualizer.targetStart = { x: 0, y: 0 };
            visualizer.canvas.dispatchEvent(MEPH.createEvent('mousemove', { offsetX: 1, offsetY: 1 }));

            return new Promise(function (r) {
                setTimeout(function () {
                    expect(visualizer.targetWidth).toBe(1);

                    if (app) {
                        app.removeSpace();
                    }
                    r();
                }, 100)
            });

        }).catch(function (error) {
            expect(error || new Error('did not render as expected')).caught();
        }).then(function () {
            done();
        })
    });


    it('can detect mouse up on the canvas ', function (done) {
        MEPH.render('MEPH.audio.view.Visualizer', 'visualizer').then(function (r) {
            var results = r.res;
            var app = r.app;
            var dom, called,
                visualizer = results.first().classInstance;
            ///Assert
            var drawn;
            visualizer.targetStart = { x: 0, y: 0 };
            visualizer.targetWidth = 1;
            visualizer.canvas.dispatchEvent(MEPH.createEvent('mouseup', {}));

            return new Promise(function (r) {
                setTimeout(function () {
                    expect(visualizer.targetWidth).toBe(1);
                    expect(visualizer.targetStart).toBe(null);
                    if (app) {
                        app.removeSpace();
                    }
                    r();
                }, 100)
            });

        }).catch(function (error) {
            expect(error || new Error('did not render as expected')).caught();
        }).then(function () {
            done();
        })
    });

});