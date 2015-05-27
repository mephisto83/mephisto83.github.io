describe("MEPH/tween/TweenEditor.spec.js", 'MEPH.tween.TweenEditor', function () {
    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });

    it('can create a tween editor.', function (done) {
        MEPH.create('MEPH.tween.TweenEditor').then(function ($class) {
            var tree = new $class();
            expect(tree).theTruth('The tween editor can not be created');
        }).catch(function (error) {
            if (error) {
                expect(error).caught();
            }
        }).then(function () {
            done();
        });
    });


    it('can render a tween editor', function (done) {
        MEPH.render('MEPH.tween.TweenEditor', 'tweeneditor').then(function (r) {
            var results = r.res;
            var app = r.app;

            var dom,
                tweeneditor = results.first().classInstance;
            ///Assert
            dom = tweeneditor.getDomTemplate().first()
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
    var TweenEditor = MEPH.tween.TweenEditor;
    it('can add tween points', function () {
        var editor = new TweenEditor();
        editor.source = [];
        editor.addPoint({ x: 0, y: 1 });
        expect(editor.source.length).toBeTruthy();
    });

    it('tween points have to have values for x between 0 and 1', function () {
        var editor = new TweenEditor();
        editor.source = [];
        editor.addPoint({ x: -20, y: 1 });
        expect(editor.source.length).toBeTruthy();
        expect(editor.source.first().x === 0).toBeTruthy();
    });

    it('tween points have to have values for x between 0 and 1', function () {
        var editor = new TweenEditor();
        editor.source = [];
        editor.addPoint({ x: 20, y: 1 });
        expect(editor.source.length).toBeTruthy();
        expect(editor.source.first().x === 1).toBeTruthy();
    });


    it('tween points have to have values for y between -1 and 1', function () {
        var editor = new TweenEditor();
        editor.source = [];
        editor.addPoint({ x: 0, y: -11 });
        expect(editor.source.length).toBeTruthy();
        expect(editor.source.first().y).toBe(-1);
    });

    it('tween points have to have values for y between 0 and 1', function () {
        var editor = new TweenEditor();
        editor.source = [];
        editor.addPoint({ x: 0, y: 11 });
        expect(editor.source.length).toBeTruthy();
        expect(editor.source.first().y).toBe(1);
    });

    it('redraws the stage on resize ', function (done) {
        MEPH.render('MEPH.tween.TweenEditor', 'tweeneditor').then(function (r) {
            var results = r.res;
            var app = r.app, called;

            var dom,
                tweeneditor = results.first().classInstance;
            tweeneditor.render = function () {
                called = true;
            }

            dom = tweeneditor.getDomTemplate().first()
            dom.dispatchEvent(MEPH.createEvent('resize', {}));
            expect(called).toBeTruthy();

            if (app) {
                app.removeSpace();
            }
        }).catch(function (error) {
            expect(error || new Error('did not render as expected')).caught();
        }).then(function () {
            done();
        })
    });

    it('redraws the stage on resize ', function (done) {
        MEPH.render('MEPH.tween.TweenEditor', 'tweeneditor').then(function (r) {
            var results = r.res;
            var app = r.app, called;

            var dom,
                tweeneditor = results.first().classInstance;

            tweeneditor.render();
            expect(tweeneditor.$structureElements).toBeTruthy();

            if (app) {
                app.removeSpace();
            }
        }).catch(function (error) {
            expect(error || new Error('did not render as expected')).caught();
        }).then(function () {
            done();
        })
    });

    it('when a point is added the page is re rendered ', function (done) {
        MEPH.render('MEPH.tween.TweenEditor', 'tweeneditor').then(function (r) {
            var results = r.res;
            var app = r.app, called;

            var dom,
                tweeneditor = results.first().classInstance;
            tweeneditor.render = function () {
                called = true;
            }

            tweeneditor.onAddPoint();
            expect(called).toBeTruthy();

            if (app) {
                app.removeSpace();
            }
        }).catch(function (error) {
            expect(error || new Error('did not render as expected')).caught();
        }).then(function () {
            done();
        })
    });

    it('when a point is added it is added to the current path, with a mark', function (done) {
        MEPH.render('MEPH.tween.TweenEditor', 'tweeneditor').then(function (r) {
            var results = r.res;
            var app = r.app, called;

            var dom,
                tweeneditor = results.first().classInstance;
            tweeneditor.render = function () {
                called = true;
            }
            tweeneditor.mark = 'A';
            tweeneditor.onAddPoint();
            expect(called).toBeTruthy();
            expect(tweeneditor.source.first().mark).toBe('A');

            if (app) {
                app.removeSpace();
            }
        }).catch(function (error) {
            expect(error || new Error('did not render as expected')).caught();
        }).then(function () {
            done();
        })
    });

    it('tween points can be rendered.', function (done) {
        MEPH.render('MEPH.tween.TweenEditor', 'tweeneditor').then(function (r) {
            var results = r.res;
            var app = r.app, called;

            var dom,
                tweeneditor = results.first().classInstance;

            tweeneditor.onAddPoint();
            tweeneditor.onAddPoint();
            expect(tweeneditor.$tweenpoints).toBeTruthy();

            if (app) {
                app.removeSpace();
            }
        }).catch(function (error) {
            expect(error || new Error('did not render as expected')).caught();
        }).then(function () {
            done();
        })
    });

    it('on mousedown on a tween point, a tweendown even will fire', function (done) {
        MEPH.render('MEPH.tween.TweenEditor', 'tweeneditor').then(function (r) {
            var results = r.res;
            var app = r.app, called;

            var dom,
                tweeneditor = results.first().classInstance;

            tweeneditor.onAddPoint();
            var circle = tweeneditor.$tweenpoints.first().shape;
            tweeneditor.getDomTemplate().first().addEventListener('tweendown', function () {
                called = true;
            })
            circle.dispatchEvent(MEPH.createEvent('mousedown', {}));

            expect(called).toBeTruthy();

            if (app) {
                app.removeSpace();
            }
        }).catch(function (error) {
            expect(error || new Error('did not render as expected')).caught();
        }).then(function () {
            done();
        });
    });

    it('on mouse over the target is set if the state is not dragging', function (done) {
        MEPH.render('MEPH.tween.TweenEditor', 'tweeneditor').then(function (r) {
            var results = r.res;
            var app = r.app, called;

            var dom,
                tweeneditor = results.first().classInstance;

            tweeneditor.onAddPoint();
            var circle = tweeneditor.$tweenpoints.first().shape;

            circle.dispatchEvent(MEPH.createEvent('mouseover', {
                tweenpoint: tweeneditor.$tweenpoints.first(),
                position: {
                    x: 10,
                    y: 20
                }
            }));

            expect(tweeneditor.target).toBeTruthy();

            if (app) {
                app.removeSpace();
            }
        }).catch(function (error) {
            expect(error || new Error('did not render as expected')).caught();
        }).then(function () {
            done();
        });
    });

    it('on tweendown the state goes to dragging', function (done) {
        MEPH.render('MEPH.tween.TweenEditor', 'tweeneditor').then(function (r) {
            var results = r.res;
            var app = r.app, called;

            var dom,
                tweeneditor = results.first().classInstance;

            tweeneditor.onAddPoint();
            var circle = tweeneditor.$tweenpoints.first().shape;
            tweeneditor.getDomTemplate().first().addEventListener('tweendown', function () {
                called = true;
            });
            circle.dispatchEvent(MEPH.createEvent('tweendown', {
                tweenpoint: tweeneditor.$tweenpoints.first(),
                position: {
                    x: 10,
                    y: 20
                }
            }));

            expect(tweeneditor.startposition).toBeTruthy();
            expect(tweeneditor.state).toBe(MEPH.tween.TweenEditor.states.dragging);
            expect(tweeneditor.target).toBeTruthy();

            if (app) {
                app.removeSpace();
            }
        }).catch(function (error) {
            expect(error || new Error('did not render as expected')).caught();
        }).then(function () {
            done();
        });
    });

    it('on mousemove tween move is fired.', function (done) {
        MEPH.render('MEPH.tween.TweenEditor', 'tweeneditor').then(function (r) {
            var results = r.res;
            var app = r.app, called;

            var dom,
                tweeneditor = results.first().classInstance;

            tweeneditor.onAddPoint();
            var circle = tweeneditor.$tweenpoints.first().shape;
            tweeneditor.getDomTemplate().first().addEventListener('tweenmove', function () {
                called = true;
            });

            circle.dispatchEvent(MEPH.createEvent('tweendown', { tweenpoint: tweeneditor.$tweenpoints.first() }));
            tweeneditor.svg.dispatchEvent(MEPH.createEvent('mousemove', { pageX: 10, pageY: 10 }));

            expect(called).toBeTruthy();
            if (app) {
                app.removeSpace();
            }
        }).catch(function (error) {
            expect(error || new Error('did not render as expected')).caught();
        }).then(function () {
            done();
        });
    });


    it('on mousemove tween move is not fired, when not dragging.', function (done) {
        MEPH.render('MEPH.tween.TweenEditor', 'tweeneditor').then(function (r) {
            var results = r.res;
            var app = r.app, called;

            var dom,
                tweeneditor = results.first().classInstance;

            tweeneditor.onAddPoint();
            var circle = tweeneditor.$tweenpoints.first().shape;
            tweeneditor.getDomTemplate().first().addEventListener('tweenmove', function () {
                called = true;
            })

            tweeneditor.svg.dispatchEvent(MEPH.createEvent('mousemove', { pageX: 10, pageY: 10 }));

            expect(!called).toBeTruthy();

            if (app) {
                app.removeSpace();
            }
        }).catch(function (error) {
            expect(error || new Error('did not render as expected')).caught();
        }).then(function () {
            done();
        });
    });


    it('on tweenmove tween move is not fired, when not dragging.', function (done) {
        MEPH.render('MEPH.tween.TweenEditor', 'tweeneditor').then(function (r) {
            var results = r.res;
            var app = r.app, called;

            var dom,
                tweeneditor = results.first().classInstance;

            tweeneditor.onAddPoint();
            var circle = tweeneditor.$tweenpoints.first().shape;
            var point = tweeneditor.$tweenpoints.first();
            point = tweeneditor.source.first(function (x) { return x.guid === point.options.guid; });
            tweeneditor.getDomTemplate().first().addEventListener('tweenmove', function () {
                called = true;
            });

            circle.dispatchEvent(MEPH.createEvent('tweendown', { tweenpoint: tweeneditor.$tweenpoints.first() }));

            tweeneditor.svg.dispatchEvent(MEPH.createEvent('mousemove', {
                pageX: 10, pageY: 10
            }));


            expect(called).toBeTruthy();
            expect(point.x !== .5).toBeTruthy();
            expect(point.y !== 0).toBeTruthy();

            if (app) {
                app.removeSpace();
            }
        }).catch(function (error) {
            expect(error || new Error('did not render as expected')).caught();
        }).then(function () {
            done();
        });
    });

    it('on mouseup tweenup is fired ', function (done) {
        MEPH.render('MEPH.tween.TweenEditor', 'tweeneditor').then(function (r) {
            var results = r.res;
            var app = r.app, called,
                dom,
                tweeneditor = results.first().classInstance;

            tweeneditor.onAddPoint();
            var circle = tweeneditor.$tweenpoints.first().shape;
            var point = tweeneditor.$tweenpoints.first();
            point = tweeneditor.source.first(function (x) { return x.guid === point.options.guid; });

            circle.dispatchEvent(MEPH.createEvent('tweendown', {
                tweenpoint: tweeneditor.$tweenpoints.first(),
                position: {
                    x: 10,
                    y: 20
                }
            }));

            tweeneditor.svg.dispatchEvent(MEPH.createEvent('mousemove', {
                pageX: 10, pageY: 10
            }));

            tweeneditor.svg.addEventListener('tweenup', function () {
                called = true;
            })
            tweeneditor.svg.dispatchEvent(MEPH.createEvent('mouseup', {
            }));

            expect(called).toBeTruthy();

            if (app) {
                app.removeSpace();
            }
        }).catch(function (error) {
            expect(error || new Error('did not render as expected')).caught();
        }).then(function () {
            done();
        });
    });

    it('on mouseup tweenup is fired ', function (done) {
        MEPH.render('MEPH.tween.TweenEditor', 'tweeneditor').then(function (r) {
            var results = r.res;
            var app = r.app, called,
                dom,
                tweeneditor = results.first().classInstance;

            tweeneditor.onAddPoint();
            var circle = tweeneditor.$tweenpoints.first().shape;
            var point = tweeneditor.$tweenpoints.first();
            point = tweeneditor.source.first(function (x) { return x.guid === point.options.guid; });

            circle.dispatchEvent(MEPH.createEvent('tweendown', {
                tweenpoint: tweeneditor.$tweenpoints.first(),
                position: {
                    x: 10,
                    y: 20
                }
            }));

            tweeneditor.svg.dispatchEvent(MEPH.createEvent('mousemove', {
                pageX: 10, pageY: 10
            }));

            expect(tweeneditor.state).toBe(MEPH.tween.TweenEditor.states.dragging);

            tweeneditor.svg.addEventListener('tweenup', function () {
                called = true;
            })
            tweeneditor.svg.dispatchEvent(MEPH.createEvent('mouseup', {
            }));

            expect(called).toBeTruthy();
            expect(tweeneditor.state).toBe(null);

            if (app) {
                app.removeSpace();
            }
        }).catch(function (error) {
            expect(error || new Error('did not render as expected')).caught();
        }).then(function () {
            done();
        });
    });

    it('tween editor can add a mark with anchors', function (done) {
        MEPH.render('MEPH.tween.TweenEditor', 'tweeneditor').then(function (r) {
            var results = r.res;
            var app = r.app, called,
                dom,
                editor = results.first().classInstance;

            editor.addPath({ x: 0, y: 0 }, { x: 1, y: 0 });
            expect(editor.source.length).toBe(2);

            expect(editor.source.all(function (x) {
                return x.anchor;
            })).toBeTruthy();

            if (app) {
                app.removeSpace();
            }
        }).catch(function (error) {
            expect(error || new Error('did not render as expected')).caught();
        }).then(function () {
            done();
        });
    });

    it('tween point cant move if its an anchor ', function (done) {
        MEPH.render('MEPH.tween.TweenEditor', 'tweeneditor').then(function (r) {
            var results = r.res;
            var app = r.app, called;

            var dom,
                tweeneditor = results.first().classInstance;

            tweeneditor.addPath({ x: 0, y: 0 }, { x: 1, y: 0 });
            var circle = tweeneditor.$tweenpoints.first().shape;
            tweeneditor.getDomTemplate().first().addEventListener('tweendown', function () {
                called = true;
            });
            circle.dispatchEvent(MEPH.createEvent('tweendown', {
                tweenpoint: tweeneditor.$tweenpoints.first(),
                position: {
                    x: 10,
                    y: 20
                }
            }));

            expect(tweeneditor.state).toBe(null);

            if (app) {
                app.removeSpace();
            }
        }).catch(function (error) {
            expect(error || new Error('did not render as expected')).caught();
        }).then(function () {
            done();
        });
    });

    it('when there is a path, a line is draw between all points', function (done) {
        MEPH.render('MEPH.tween.TweenEditor', 'tweeneditor').then(function (r) {
            var results = r.res;
            var app = r.app, called,
                dom,
                editor = results.first().classInstance;
            editor.renderPaths = function () { called = true; };
            editor.onAddPath();
            expect(called).toBeTruthy()

            if (app) {
                app.removeSpace();
            }
        }).catch(function (error) {
            expect(error || new Error('did not render as expected')).caught();
        }).then(function () {
            done();
        });
    });


    it('when there is a path, a line is draw between all points', function (done) {
        MEPH.render('MEPH.tween.TweenEditor', 'tweeneditor').then(function (r) {
            var results = r.res;
            var app = r.app, called,
                dom,
                editor = results.first().classInstance;

            editor.onAddPath();
            expect(editor.renderedPaths).toBeTruthy()
            for (var i in editor.renderedPaths) {
                expect(editor.renderedPaths[i]).toBeTruthy();
                expect(editor.renderedPaths[i].lines.length).toBeTruthy();
            }

            if (app) {
                app.removeSpace();
            }
        }).catch(function (error) {
            expect(error || new Error('did not render as expected')).caught();
        }).then(function () {
            done();
        });
    });

    it('line state: clicking on a line will select it.', function (done) {
        MEPH.render('MEPH.tween.TweenEditor', 'tweeneditor').then(function (r) {
            var results = r.res;
            var app = r.app, called,
                dom,
                editor = results.first().classInstance;

            editor.onAddPointAndPath();

            expect(editor.renderedPaths).toBeTruthy()

            var lines = editor.getPathLines(editor.paths.first());


            editor.handleLineState(lines.first(), 'click');

            expect(editor.$selectedLine).toBeTruthy();
            if (app) {
                app.removeSpace();
            }
        }).catch(function (error) {
            expect(error || new Error('did not render as expected')).caught();
        }).then(function () {
            done();
        });
    });

    it('can add a control point ', function () {
        var editor = new TweenEditor();
        editor.controlpoints = [];
        editor.source = [];
        editor.onAddPoint();
        var p = editor.source.first()

        editor.addControlPoint(p.guid);
        expect(editor.controlpoints.length).toBeTruthy()
    });


    it('can render control points.', function (done) {
        MEPH.render('MEPH.tween.TweenEditor', 'tweeneditor').then(function (r) {
            var results = r.res;
            var app = r.app, called,
                dom,
                editor = results.first().classInstance;

            editor.onAddPointAndPath();
            var p = editor.source.first();
            editor.renderControlPoints = function () {
                called = true;
            };

            editor.addControlPoint(p.guid);

            expect(called).toBeTruthy();
            if (app) {
                app.removeSpace();
            }
        }).catch(function (error) {
            expect(error || new Error('did not render as expected')).caught();
        }).then(function () {
            done();
        });
    });


    it('can add controls to selected lines.', function (done) {
        MEPH.render('MEPH.tween.TweenEditor', 'tweeneditor').then(function (r) {
            var results = r.res;
            var app = r.app, called,
                dom,
                editor = results.first().classInstance;

            editor.onAddPointAndPath();
            var p = editor.source.first();

            var lines = editor.renderedPaths[Object.keys(editor.renderedPaths)[0]].lines;

            editor.$selectedLine = lines.first();

            editor.addControlsToSelectedLine();

            if (app) {
                app.removeSpace();
            }
        }).catch(function (error) {
            expect(error || new Error('did not render as expected')).caught();
        }).then(function () {
            done();
        });
    });

    it('can not add more than a single control point per tweenpoint.', function (done) {
        MEPH.render('MEPH.tween.TweenEditor', 'tweeneditor').then(function (r) {
            var results = r.res;
            var app = r.app, called,
                dom,
                editor = results.first().classInstance;

            editor.onAddPointAndPath();
            var p = editor.source.first();

            var lines = editor.renderedPaths[Object.keys(editor.renderedPaths)[0]].lines;

            editor.$selectedLine = lines.first();

            editor.addControlsToSelectedLine();
            editor.$selectedLine = lines.first();

            editor.addControlsToSelectedLine();
            expect(editor.renderedControlPoints.length).toBe(2);
            if (app) {
                app.removeSpace();
            }
        }).catch(function (error) {
            expect(error || new Error('did not render as expected')).caught();
        }).then(function () {
            done();
        });
    });


    it('can render a previously rendered control point .', function (done) {
        MEPH.render('MEPH.tween.TweenEditor', 'tweeneditor').then(function (r) {
            var results = r.res;
            var app = r.app, called,
                dom,
                editor = results.first().classInstance;

            editor.onAddPointAndPath();
            var p = editor.source.first();

            var lines = editor.renderedPaths[Object.keys(editor.renderedPaths)[0]].lines;

            editor.$selectedLine = lines.first();

            editor.addControlsToSelectedLine();

            editor.update();

            expect(editor.renderedControlPoints.length).toBe(2);
            if (app) {
                app.removeSpace();
            }
        }).catch(function (error) {
            expect(error || new Error('did not render as expected')).caught();
        }).then(function () {
            done();
        });
    });

    it('can remove a control point ', function () {
        var editor = new TweenEditor();
        editor.controlpoints = [];
        editor.source = [];
        editor.onAddPoint();
        var p = editor.source.first()

        editor.addControlPoint(p.guid, 0, MEPH.tween.TweenEditor.StartControlPoint);
        editor.removeControlPoint(editor.controlpoints.first());
        expect(editor.controlpoints.length).toBe(0)
    });

    it('a previously removed control point will no longer be rendered .', function (done) {
        MEPH.render('MEPH.tween.TweenEditor', 'tweeneditor').then(function (r) {
            var results = r.res;
            var app = r.app, called,
                dom,
                editor = results.first().classInstance;

            editor.onAddPointAndPath();
            var p = editor.source.first();

            var lines = editor.renderedPaths[Object.keys(editor.renderedPaths)[0]].lines;

            editor.$selectedLine = lines.first();

            editor.addControlsToSelectedLine();

            editor.removeControlPoint(editor.controlpoints.first());
            editor.update();

            expect(editor.renderedControlPoints.length).toBe(1);
            if (app) {
                app.removeSpace();
            }
        }).catch(function (error) {
            expect(error || new Error('did not render as expected')).caught();
        }).then(function () {
            done();
        });
    });

    it('when a control point has mousedown , controldown is fired.', function (done) {
        MEPH.render('MEPH.tween.TweenEditor', 'tweeneditor').then(function (r) {
            var results = r.res;
            var app = r.app, called,
                dom,
                editor = results.first().classInstance;

            editor.onAddPointAndPath();
            var p = editor.source.first();

            var lines = editor.renderedPaths[Object.keys(editor.renderedPaths)[0]].lines;

            editor.$selectedLine = lines.first();

            editor.addControlsToSelectedLine();

            editor.update();

            var controlpoint = editor.renderedControlPoints.first();

            var circle = controlpoint.point.parts.first(function (x) {
                return x.options.name === 'circle';
            });

            editor.svg.addEventListener('controldown', function () {
                called = true;
            })
            circle.shape.dispatchEvent(MEPH.createEvent('mousedown', {}));

            expect(called).toBeTruthy();

            if (app) {
                app.removeSpace();
            }
        }).catch(function (error) {
            expect(error || new Error('did not render as expected')).caught();
        }).then(function () {
            done();
        });
    });

    it('when a control point has mouseup , controlup is fired.', function (done) {
        MEPH.render('MEPH.tween.TweenEditor', 'tweeneditor').then(function (r) {
            var results = r.res;
            var app = r.app, called,
                dom,
                editor = results.first().classInstance;

            editor.onAddPointAndPath();
            var p = editor.source.first();

            var lines = editor.renderedPaths[Object.keys(editor.renderedPaths)[0]].lines;

            editor.$selectedLine = lines.first();

            editor.addControlsToSelectedLine();

            editor.update();

            var controlpoint = editor.renderedControlPoints.first();

            var circle = controlpoint.point.parts.first(function (x) {
                return x.options.name === 'circle';
            });
            circle.shape.dispatchEvent(MEPH.createEvent('mousedown', {}));

            editor.svg.addEventListener('controlup', function () {
                called = true;
            });
            editor.svg.dispatchEvent(MEPH.createEvent('mouseup', {}));

            expect(called).toBeTruthy();

            if (app) {
                app.removeSpace();
            }
        }).catch(function (error) {
            expect(error || new Error('did not render as expected')).caught();
        }).then(function () {
            done();
        });
    });

    it('on control down,  state is set to controldragging.', function (done) {
        MEPH.render('MEPH.tween.TweenEditor', 'tweeneditor').then(function (r) {
            var results = r.res;
            var app = r.app, called,
                dom,
                editor = results.first().classInstance;

            editor.onAddPointAndPath();
            var p = editor.source.first();

            var lines = editor.renderedPaths[Object.keys(editor.renderedPaths)[0]].lines;

            editor.$selectedLine = lines.first();

            editor.addControlsToSelectedLine();

            editor.update();

            var controlpoint = editor.renderedControlPoints.first();

            var circle = controlpoint.point.parts.first(function (x) {
                return x.options.name === 'circle';
            });

            circle.shape.dispatchEvent(MEPH.createEvent('mousedown', {}));

            expect(editor.state).toBe(MEPH.tween.TweenEditor.states.controldragging);
            expect(editor.target).toBeTruthy();

            if (app) {
                app.removeSpace();
            }
        }).catch(function (error) {
            expect(error || new Error('did not render as expected')).caught();
        }).then(function () {
            done();
        });
    });


    it('on control up,  state is set to null if controldragging.', function (done) {
        MEPH.render('MEPH.tween.TweenEditor', 'tweeneditor').then(function (r) {
            var results = r.res;
            var app = r.app, called,
                dom,
                editor = results.first().classInstance;

            editor.onAddPointAndPath();
            var p = editor.source.first();

            var lines = editor.renderedPaths[Object.keys(editor.renderedPaths)[0]].lines;

            editor.$selectedLine = lines.first();

            editor.addControlsToSelectedLine();

            editor.update();

            var controlpoint = editor.renderedControlPoints.first();

            var circle = controlpoint.point.parts.first(function (x) {
                return x.options.name === 'circle';
            });
            circle.shape.dispatchEvent(MEPH.createEvent('mousedown', {}));

            circle.shape.dispatchEvent(MEPH.createEvent('mouseup', {}));

            expect(editor.state).toBe(null);
            expect(editor.target).toBe(null);

            if (app) {
                app.removeSpace();
            }
        }).catch(function (error) {
            expect(error || new Error('did not render as expected')).caught();
        }).then(function () {
            done();
        });
    });


    it('on mousemove with control dragging ,  controlmove is fired.', function (done) {
        MEPH.render('MEPH.tween.TweenEditor', 'tweeneditor').then(function (r) {
            var results = r.res;
            var app = r.app, called,
                dom,
                editor = results.first().classInstance;

            editor.onAddPointAndPath();
            var p = editor.source.first();

            var lines = editor.renderedPaths[Object.keys(editor.renderedPaths)[0]].lines;

            editor.$selectedLine = lines.first();

            editor.addControlsToSelectedLine();

            editor.update();

            var controlpoint = editor.renderedControlPoints.first();

            var circle = controlpoint.point.parts.first(function (x) {
                return x.options.name === 'circle';
            });
            circle.shape.dispatchEvent(MEPH.createEvent('mousedown', {}));

            editor.svg.addEventListener('controlmove', function () {
                called = true;
            });

            circle.shape.dispatchEvent(MEPH.createEvent('mousemove', { pageX: 10, pageY: 10 }));

            expect(called).toBeTruthy(called)
            if (app) {
                app.removeSpace();
            }
        }).catch(function (error) {
            expect(error || new Error('did not render as expected')).caught();
        }).then(function () {
            done();
        });
    });


    it('on controlmove the control point is moved to a new location.', function (done) {
        MEPH.render('MEPH.tween.TweenEditor', 'tweeneditor').then(function (r) {
            var results = r.res;
            var app = r.app, called,
                dom,
                editor = results.first().classInstance;

            editor.onAddPointAndPath();
            var p = editor.source.first();

            var lines = editor.renderedPaths[Object.keys(editor.renderedPaths)[0]].lines;

            editor.$selectedLine = lines.first();

            editor.addControlsToSelectedLine();

            editor.update();

            var controlpoint = editor.renderedControlPoints.first();
            var lastposition = MEPH.clone(editor.getControlPointPosition(controlpoint));
            var circle = controlpoint.point.parts.first(function (x) {
                return x.options.name === 'circle';
            });
            circle.shape.dispatchEvent(MEPH.createEvent('mousedown', {}));

            editor.svg.addEventListener('controlmove', function () {
                called = true;
            });

            circle.shape.dispatchEvent(MEPH.createEvent('mousemove', { pageX: 10, pageY: 10 }));
            var currentposition = (editor.getControlPointPosition(controlpoint));

            expect(currentposition.x !== lastposition.x).toBeTruthy()
            expect(currentposition.y !== lastposition.y).toBeTruthy()
            if (app) {
                app.removeSpace();
            }
        }).catch(function (error) {
            expect(error || new Error('did not render as expected')).caught();
        }).then(function () {
            done();
        });
    });


    it('can get control points for a segment.', function (done) {
        MEPH.render('MEPH.tween.TweenEditor', 'tweeneditor').then(function (r) {
            var results = r.res;
            var app = r.app, called,
                dom,
                editor = results.first().classInstance;

            editor.onAddPointAndPath();
            var p = editor.source.first();

            var lines = editor.renderedPaths[Object.keys(editor.renderedPaths)[0]].lines;

            editor.$selectedLine = lines.first();

            editor.addControlsToSelectedLine();

            editor.update();
            editor.$selectedLine = lines.first();

            var cps = editor.getControlPoints(editor.$selectedLine.path, 0);

            expect(cps.point.start).toBeTruthy();
            expect(cps.point.end).toBeTruthy();

            if (app) {
                app.removeSpace();
            }
        }).catch(function (error) {
            expect(error || new Error('did not render as expected')).caught();
        }).then(function () {
            done();
        });
    });

    it('can output values in some kind of format', function () {
        var editor = new TweenEditor();
        editor.source = [];
        editor.paths = [];
        editor.controlpoints = [];

        editor.onAddPointAndPath();
        editor.updateData();

        expect(editor.tween).toBeTruthy();
    });

    it('can get control points for a segment.', function (done) {
        MEPH.render('MEPH.tween.TweenEditor', 'tweeneditor').then(function (r) {
            var results = r.res;
            var app = r.app, called,
                dom,
                editor = results.first().classInstance;

            editor.onAddPointAndPath();

            var lines = editor.renderedPaths[Object.keys(editor.renderedPaths)[0]].lines;

            editor.$selectedLine = lines.first();

            editor.addControlsToSelectedLine();

            editor.update();

            editor.$selectedLine = lines.first();

            var points = editor.getControlPoints(editor.$selectedLine.path, 0);

            points.point.start.position.x = .1;
            points.point.end.position.x = .45;
            
            editor.svg.addEventListener('dataupdated', function () {
                called = true;
            });

            editor.updateData();

            expect(called).toBeTruthy();

            if (app) {
                app.removeSpace();
            }
        }).catch(function (error) {
            expect(error || new Error('did not render as expected')).caught();
        }).then(function () {
            done();
        });
    });
});