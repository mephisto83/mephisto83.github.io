describe("MEPH/math/Expression.spec.js", 'MEPH.math.expression.Evaluator', 'MEPH.math.Expression', 'MEPH.math.expression.Factor', function () {
    var Evaluator;
    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
        Evaluator = MEPH.math.expression.Evaluator;
    });

    var printExpressionToScreen = function (result) {
        return MEPH.requires('MEPH.math.jax.MathJax', 'MEPH.math.Expression').then(function () {
            return MEPHJax.ready().then(function () {
                var dom = document.createElement('div');
                document.body.appendChild(dom);
                return MEPHJax.load(result.latex(), dom)
            });
        })
    };

    it('can print a derivative.', function () {
        var derivative = Expression.derivative(Expression.variable('a'), 1, 'u', 't');

        console.log(derivative.latex());
        printExpressionToScreen(derivative);
        expect(derivative.latex()).toBe('\\frac{\\partial u}{\\partial t} (a)');
    });


    it('can print the 2nd derivative.', function () {
        var derivative = Expression.derivative(Expression.variable('a'), 2, 'u', 't');

        console.log(derivative.latex());
        printExpressionToScreen(derivative);
        expect(derivative.latex()).toBe('\\frac{\\partial^2 u}{\\partial t^2} (a)');
    });

    it('can create a e expression', function () {
        var e = Expression.e('x');

        expect(e.latex() === 'e^x').toBeTruthy();
    });

    it('can set a properties on an expression', function () {
        var e = Expression.variable('x');
        e.setProperties({ val: true });

        var result = e.getProperties();
        expect(result.val).toBe(true);
    })

});