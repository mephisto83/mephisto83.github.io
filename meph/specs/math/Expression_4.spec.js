describe("MEPH/math/Expression.spec.js", 'MEPH.math.Expression', function () {
    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
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

    it('when anything is matched, it can be more than one things matching the anything.', function () {
        // MultiplyIntegralofFx
        var rule = Expression.Rules.Integration.IntegralConstMultiply();

        var c = Expression.variable('A');
        var t = Expression.variable('x');
        var y = Expression.variable('x');

        var expression = Expression.integral(Expression.multiplication(c, t, y), 'x');

        expect(Expression.matchRule(expression, rule)).toBeTruthy();
    });

    it('when anything is matched, it can be more than one things matching the anything.', function () {
        // MultiplyIntegralofFx
        var rule = Expression.Rules.Integration.IntegralConstMultiply();

        var c = Expression.variable('c');
        var t = Expression.variable('t');
        var y = Expression.variable('y');

        var expression = Expression.integral(Expression.multiplication(c, t, y), 'x');

        expect(!Expression.matchRule(expression, rule)).toBeTruthy();
    });

    it('a dependency can describe a relation from a child to a parent using upTo:[type of function]', function () {
        var c = Expression.variable('A');
        var a = Expression.anything();
        var expression = Expression.integral(Expression.multiplication(c, a), 'x');

        var res = Expression.select(c, { offset: 'up:.integral' });
        expect(expression === res).toBeTruthy();
    });



    it('wont translate if it is not correct.', function () {
        var Expression = MEPH.math.Expression;

        var rule1 = Expression.Rules.Integration.IntegralConstMultiply();
        var rule2 = Expression.Rules.Integration.MultiplyIntegralofFx();

        var expression = Expression.integral(
                            Expression.multiplication(
                                Expression.variable('x'),
                                Expression.addition(
                                    Expression.func('g', 'x'),
                                    Expression.func('f', 'x')
                                )),
                        'x');
        expression.name(Expression.Rules.Integration.IntegralConstMultiply().name());
        var rule = Expression.matchRule(expression, rule1, true);
        expect(!rule).toBeTruthy();
    });

    it('a zero expression has a value, and can be detected', function () {
        var exp = Expression.zero();

        var res = Expression.isZero(exp);

        expect(res).toBeTruthy();
    });

    it('can return the gcd of an expression like 4*x + 4*y => 4', function () {
        var exp = Expression.addition(Expression.multiplication('4', 'x'), Expression.multiplication('4', 'y'));

        var denom = Expression.GreatestCommonDenominator(exp);

        expect(denom.partOrDefault(Expression.type.variable) == 4).toBeTruthy();
    });

    it('can return the gcd of an expression like 4*x + 4*x => 4*x', function () {
        var exp = Expression.addition(Expression.multiplication('4', 'x'), Expression.multiplication('4', 'x'));

        var denom = Expression.GreatestCommonDenominator(exp);
        
        expect(denom.latex() === '4x').toBeTruthy();
    });


    it('can return the gcd of an expression like 4*x + 5*t => null', function () {
        var exp = Expression.addition(Expression.multiplication('4', 'x'), Expression.multiplication('5', 't'));

        var denom = Expression.GreatestCommonDenominator(exp);

        expect(denom === null).toBeTruthy();
    });

    it('can get matching rules ', function () {
        var exp = Expression.integral(Expression.variable('a'), Expression.variable('x'));
        var rules = Expression.getMatchingRules(exp);
        expect(rules.first().type === Expression.type.integral);
        expect(rules.length === 1).toBeTruthy();
    });
});