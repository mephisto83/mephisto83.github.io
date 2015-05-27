describe("MEPH/pad/DrawingSurface.spec.js", function () {

    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });

    it('can create a DrawingSurface', function (done) {
        MEPH.create('MEPH.pad.DrawingSurface').then(function ($class) {
            var pad = new $class();
            expect(pad.$renderer).theTruth('the renderer is not created');
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });;
    });

    it('on load the renderers canvas is set ', function (done) {

        MEPH.requires('MEPH.util.Observable', 'MEPH.pad.DrawingSurface', 'MEPHTests.helper.Application').then(function () {
            app = new MEPHTests.helper.Application();
            dom = app.createAppSpace(), div = document.createElement('div');
            div.innerHTML = '<drawingsurface></drawingsurface>';
            return app.create('MEPH.pad.DrawingSurface', div.firstElementChild);
        }).then(function (results) {
            return app.loadViewObject([results], dom);
        }).then(function (results) {
            var drawingSurface = results.first().classInstance;
            expect(drawingSurface.getRenderer().getCanvas()).theTruth('the canvas was not set on the renderer');


            if (app) {
                app.removeSpace();
            }
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });

    it('on mouse down a point is added to the list of drawing', function (done) {

        MEPH.requires('MEPH.util.Observable', 'MEPH.pad.DrawingSurface', 'MEPHTests.helper.Application').then(function () {
            app = new MEPHTests.helper.Application();
            dom = app.createAppSpace(), div = document.createElement('div');
            div.innerHTML = '<drawingsurface></drawingsurface>';
            return app.create('MEPH.pad.DrawingSurface', div.firstElementChild);
        }).then(function (results) {
            return app.loadViewObject([results], dom);
        }).then(function (results) {
            var drawingSurface = results.first().classInstance,
                canvas = drawingSurface.getRenderer().getCanvas();
            expect(drawingSurface.getRenderer().getCanvas()).theTruth('the canvas was not set on the renderer');

            canvas.dispatchEvent(MEPH.createEvent('mousedown', { pageX: 10, pageY: 10 }));
            if (app) {
                app.removeSpace();
            }
            expect(drawingSurface.painting).theTruth('the surface should be painting.');
            expect(drawingSurface.drawing.length === 1).theTruth('the drawing wasnt saved to the array');

        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });
    it('on mouse up painting should be false', function (done) {

        MEPH.requires('MEPH.util.Observable', 'MEPH.pad.DrawingSurface', 'MEPHTests.helper.Application').then(function () {
            app = new MEPHTests.helper.Application();
            dom = app.createAppSpace(), div = document.createElement('div');
            div.innerHTML = '<drawingsurface></drawingsurface>';
            return app.create('MEPH.pad.DrawingSurface', div.firstElementChild);
        }).then(function (results) {
            return app.loadViewObject([results], dom);
        }).then(function (results) {
            var drawingSurface = results.first().classInstance,
                canvas = drawingSurface.getRenderer().getCanvas();
            expect(drawingSurface.getRenderer().getCanvas()).theTruth('the canvas was not set on the renderer');

            canvas.dispatchEvent(MEPH.createEvent('mousedown', { pageX: 10, pageY: 10 }));
            expect(drawingSurface.painting).theTruth('the surface should be painting.');
            canvas.dispatchEvent(MEPH.createEvent('mouseup', { pageX: 10, pageY: 10 }));
            expect(!drawingSurface.painting).theTruth('the surface should not be painting.');
            if (app) {
                app.removeSpace();
            }
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });
    it('on mouse leave painting should be false', function (done) {

        MEPH.requires('MEPH.util.Observable', 'MEPH.pad.DrawingSurface', 'MEPHTests.helper.Application').then(function () {
            app = new MEPHTests.helper.Application();
            dom = app.createAppSpace(), div = document.createElement('div');
            div.innerHTML = '<drawingsurface></drawingsurface>';
            return app.create('MEPH.pad.DrawingSurface', div.firstElementChild);
        }).then(function (results) {
            return app.loadViewObject([results], dom);
        }).then(function (results) {
            var drawingSurface = results.first().classInstance,
                canvas = drawingSurface.getRenderer().getCanvas();
            expect(drawingSurface.getRenderer().getCanvas()).theTruth('the canvas was not set on the renderer');

            canvas.dispatchEvent(MEPH.createEvent('mousedown', { pageX: 10, pageY: 10 }));
            expect(drawingSurface.painting).theTruth('the surface should be painting.');
            canvas.dispatchEvent(MEPH.createEvent('mouseleave', { pageX: 10, pageY: 10 }));
            expect(!drawingSurface.painting).theTruth('the surface should not be painting.');
            expect(drawingSurface.strokes.length === 1).theTruth('the drawing wasnt saved to the array');
            if (app) {
                app.removeSpace();
            }
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });

    it('on mouse move ', function (done) {
        MEPH.requires('MEPH.util.Observable', 'MEPH.pad.DrawingSurface', 'MEPHTests.helper.Application').then(function () {
            app = new MEPHTests.helper.Application();
            dom = app.createAppSpace(), div = document.createElement('div');
            div.innerHTML = '<drawingsurface></drawingsurface>';
            return app.create('MEPH.pad.DrawingSurface', div.firstElementChild);
        }).then(function (results) {
            return app.loadViewObject([results], dom);
        }).then(function (results) {
            var drawingSurface = results.first().classInstance,
                canvas = drawingSurface.getRenderer().getCanvas();

            canvas.dispatchEvent(MEPH.createEvent('mousedown', { pageX: 10, pageY: 10 }));
            expect(drawingSurface.painting).theTruth('the surface should be painting.');
            canvas.dispatchEvent(MEPH.createEvent('mousemove', { pageX: 120, pageY: 10 }));
            expect(drawingSurface.painting).theTruth('the surface should not be painting.');
            canvas.dispatchEvent(MEPH.createEvent('mouseup', { pageX: 10, pageY: 10 }));
            expect(!drawingSurface.painting).theTruth('the surface should not be painting.');
            if (app) {
                app.removeSpace();
            }
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });

    it(' can get drawing instructions for renderer ', function (done) {
        MEPH.requires('MEPH.util.Observable', 'MEPH.pad.DrawingSurface', 'MEPHTests.helper.Application').then(function () {
            app = new MEPHTests.helper.Application();
            dom = app.createAppSpace(), div = document.createElement('div');
            div.innerHTML = '<drawingsurface></drawingsurface>';
            return app.create('MEPH.pad.DrawingSurface', div.firstElementChild);
        }).then(function (results) {
            return app.loadViewObject([results], dom);
        }).then(function (results) {
            var drawingSurface = results.first().classInstance, instructions,
                canvas = drawingSurface.getRenderer().getCanvas();

            canvas.dispatchEvent(MEPH.createEvent('mousedown', { pageX: 10, pageY: 10 }));
            canvas.dispatchEvent(MEPH.createEvent('mousemove', { pageX: 120, pageY: 10 }));
            canvas.dispatchEvent(MEPH.createEvent('mouseup', { pageX: 10, pageY: 10 }));

            instructions = drawingSurface.getInstructions();
            expect(instructions.length === 0).theTruth();
            if (app) {
                app.removeSpace();
            }
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });

    it(' surface will request an animation frame and draw to the canvas', function (done) {

        MEPH.requires('MEPH.util.Observable', 'MEPH.pad.DrawingSurface', 'MEPHTests.helper.Application').then(function () {
            app = new MEPHTests.helper.Application();
            dom = app.createAppSpace(), div = document.createElement('div');
            div.innerHTML = '<drawingsurface></drawingsurface>';
            return app.create('MEPH.pad.DrawingSurface', div.firstElementChild);
        }).then(function (results) {
            return app.loadViewObject([results], dom);
        }).then(function (results) {
            var drawingSurface = results.first().classInstance, instructions,
                canvas = drawingSurface.getRenderer().getCanvas();

            canvas.dispatchEvent(MEPH.createEvent('mousedown', { pageX: 10, pageY: 10 }));
            canvas.dispatchEvent(MEPH.createEvent('mousemove', { pageX: 120, pageY: 10 }));
            canvas.dispatchEvent(MEPH.createEvent('mouseup', { pageX: 10, pageY: 10 }));

            drawingSurface.draw();
            if (app) {
                app.removeSpace();
            }
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });
});