describe("MEPH/audio/view/VisualSelector.spec.js", 'MEPH.audio.view.VisualSelector', function () {

    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });

    it("can create a VisualSelector", function () {
        //Arrange

        //Assert
        var input = new MEPH.audio.view.VisualSelector();

        expect(input).toBeTruthy();

    });

    it('can render a VisualSelector', function (done) {
        MEPH.render('MEPH.audio.view.VisualSelector', 'visualizer').then(function (r) {
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

    it('has a mark canvas', function (done) {
        MEPH.render('MEPH.audio.view.VisualSelector', 'visualizer').then(function (r) {
            var results = r.res;
            var app = r.app;

            var dom,
                visualizer = results.first().classInstance;
            ///Assert
            expect(visualizer.markCanvas).toBeTruthy();
            if (app) {
                app.removeSpace();
            }
        }).catch(function (error) {
            expect(error || new Error('did not render as expected')).caught();
        }).then(function () {
            done();
        })
    });


    it('has an array of objects that can be rendered to a canvas', function (done) {

        MEPH.render('MEPH.audio.view.VisualSelector', 'visualizer').then(function (r) {
            var results = r.res;
            var app = r.app;

            var dom, rendered,
                visualizer = results.first().classInstance;
            ///Assert
            visualizer.render = function () { rendered = true; }
            visualizer.marks = MEPH.util.Observable.observable([{ position: .1, type: 'start' }]);

            return new Promise(function (r) {
                setTimeout(function () {
                    expect(rendered).toBeTruthy();
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
    });

    it("can add mark to a relative position", function () {
        //Arrange

        //Assert
        var input = new MEPH.audio.view.VisualSelector();
        input.draw = function () { return Promise.resolve(); }
        input.marks = MEPH.util.Observable.observable([]);
        input.position = 0;
        input.source = [];
        input.scrollleft = 1;
        input.canvas = { clientWidth: 400, getContext: function () { return null; } };
        input.container = { clientWidth: 400 };
        input.addMark();
        expect(input).toBeTruthy();
        
        expect(input.marks.first()).toBeTruthy();

    });

});