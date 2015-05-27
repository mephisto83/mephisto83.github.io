describe("MEPH/tween/Calculator.spec.js", 'MEPH.tween.Calculator', 'MEPH.tween.TweenEditor', function () {
    var TweenEditor = MEPH.tween.TweenEditor;
    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });

    it('can create a tween calculator.', function (done) {
        MEPH.create('MEPH.tween.Calculator').then(function ($class) {
            var calculator = new $class();
            expect(calculator).theTruth('The calculator can not be created');
        }).catch(function (error) {
            if (error) {
                expect(error).caught();
            }
        }).then(function () {
            done();
        });
    });

    it('can calculator a bezier cubic curve', function () {
        var p1 = MEPH.math.Vector.Create([0, 0]);
        var p2 = MEPH.math.Vector.Create([0.2, 0.2]);
        var p3 = MEPH.math.Vector.Create([0.4, 0.4]);
        var p4 = MEPH.math.Vector.Create([0.6, 0.6]);

        var res = MEPH.tween.Calculator.BezierCubic(p1, p2, p3, p4, 0);

        expect(res.equals(MEPH.math.Vector.ZeroVector(2))).toBeTruthy();
    });

    it('can calculator a bezier cubic curve', function () {
        var p1 = MEPH.math.Vector.Create([0, 0]);
        var p2 = MEPH.math.Vector.Create([0.2, 0.2]);
        var p3 = MEPH.math.Vector.Create([0.4, 0.4]);
        var p4 = MEPH.math.Vector.Create([1, 1]);

        var res = MEPH.tween.Calculator.BezierCubic(p1, p2, p3, p4, 1);

        expect(res.equals(new MEPH.math.Vector([1, 1]))).toBeTruthy();
    });

    it('can calculate a linear set', function () {
        var p1 = MEPH.math.Vector.Create([0, 0]);
        var p2 = MEPH.math.Vector.Create([1, 1]);

        var res = MEPH.tween.Calculator.Linear(p1, p2, 1);

        expect(res.equals(new MEPH.math.Vector([1, 1]))).toBeTruthy();
    });

    it('can calculate a linear set', function () {
        var p1 = MEPH.math.Vector.Create([0, 0]);
        var p2 = MEPH.math.Vector.Create([1, 1]);

        var res = MEPH.tween.Calculator.Linear(p1, p2, 0);

        expect(res.equals(new MEPH.math.Vector([0, 0]))).toBeTruthy();
    });

    it('can calculate a linear set', function () {
        var p1 = MEPH.math.Vector.Create([0, 0]);
        var p2 = MEPH.math.Vector.Create([1, 1]);

        var res = MEPH.tween.Calculator.Linear(p1, p2, .5);

        expect(res.equals(new MEPH.math.Vector([0.5, 0.5]))).toBeTruthy();
    });

    it('can set the tween data', function () {
        var calculator = new MEPH.tween.Calculator();

        calculator.setData('tweendata');

        expect(calculator.tweendata).toBe('tweendata');
    });

    it('can calculate value from tween data', function () {
        var editor = new TweenEditor();
        editor.source = [];
        editor.paths = [];
        editor.controlpoints = [];

        editor.onAddPointAndPath();
        editor.updateData();
        expect(editor.tween).toBeTruthy();

        var calculator = new MEPH.tween.Calculator();

        calculator.setData(editor.tween);

        var result = calculator.get(0);
        expect(result).toBe(0);
    });

    it('can calculate value from tween data', function () {
        var editor = new TweenEditor();
        editor.source = [];
        editor.paths = [];
        editor.controlpoints = [];

        editor.onAddPointAndPath();
        editor.updateData();
        expect(editor.tween).toBeTruthy();

        var calculator = new MEPH.tween.Calculator();

        calculator.setData(editor.tween);

        var result = calculator.get(1);
        expect(result).toBe(0);
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

            var calculator = new MEPH.tween.Calculator();

            calculator.setData(editor.tween);

            var result = calculator.get(0);
            expect(result).toBe(0);
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

            var calculator = new MEPH.tween.Calculator();

            calculator.setData(editor.tween);

            var result = calculator.get(1);
            expect(result).toBe(0);
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
})