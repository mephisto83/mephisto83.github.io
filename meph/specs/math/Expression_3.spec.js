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

    it('can create a flat  addition expression, from a tree', function (done) {
        MEPH.requires('MEPH.math.Expression').then(function () {
            var addition = Expression.addition(Expression.variable('a'),
                                                Expression.addition(Expression.variable('b'),
                                                                    Expression.variable('c')));
            var flattenedAddition = Expression.Flatten(addition, 'addition');

            expect(flattenedAddition.parts.length === 3).theTruth('wrong number of parts ');
        }).catch(function (e) {
            expect(e).caught();
        }).then(function (x) {
            done();
        });
    });

    it('can flatten a power expression, from a tree', function (done) {
        MEPH.requires('MEPH.math.Expression').then(function () {
            var power = Expression.power(Expression.power('x', 2), 2);
            var flattenedAddition = Expression.Flatten(power, Expression['function'].power);

            expect(flattenedAddition.partOrDefault(Expression['function'].power).partOrDefault(Expression.type.variable) === 4).theTruth('power in correct');

        }).catch(function (e) {
            expect(e).caught();
        }).then(function (x) {
            done();
        });
    });


    it('can flatten a power expression with (x^2)^a, from a tree', function (done) {
        MEPH.requires('MEPH.math.Expression').then(function () {
            var power = Expression.power(Expression.power('x', 2), 'a');
            var flattenedAddition = Expression.Flatten(power, Expression['function'].power);
            var pow = flattenedAddition.partOrDefault(Expression['function'].power);
            expect(pow.type === Expression.type.multiplication).theTruth('power in correct');
            expect(pow.getParts().length === 2).toBeTruthy();
        }).catch(function (e) {
            expect(e).caught();
        }).then(function (x) {
            done();
        });
    });


    it('can flatten a power expression with (x^a)^2, from a tree', function (done) {
        MEPH.requires('MEPH.math.Expression').then(function () {
            var power = Expression.power(Expression.power('x', 'a'), 2);
            var flattenedAddition = Expression.Flatten(power, Expression['function'].power);
            var pow = flattenedAddition.partOrDefault(Expression['function'].power);
            expect(pow.type === Expression.type.multiplication).theTruth('power in correct');
            expect(pow.getParts().length === 2).toBeTruthy();
        }).catch(function (e) {
            expect(e).caught();
        }).then(function (x) {
            done();
        });
    });


    it('can flatten a power expression with (((x^2)^2)^2), from a tree', function (done) {
        MEPH.requires('MEPH.math.Expression').then(function () {
            var power = Expression.power(Expression.power(Expression.power('x', 2), 2), 2);
            var flattenedAddition = Expression.Flatten(power, Expression['function'].power);
            expect(flattenedAddition.partOrDefault(Expression['function'].power).partOrDefault(Expression.type.variable) === 8).theTruth('power in correct');

        }).catch(function (e) {
            expect(e).caught();
        }).then(function (x) {
            done();
        });
    });

    it('can flatten a power expression with ((x^2)^2), from a tree', function (done) {
        MEPH.requires('MEPH.math.Expression').then(function () {
            var power = Expression.power(Expression.power(Expression.variable('x'), Expression.variable('2')), Expression.variable('2'));
            var flattenedAddition = Expression.Flatten(power, Expression['function'].power);
            expect(flattenedAddition.partOrDefault(Expression['function'].power).partOrDefault(Expression.type.variable) === 4).theTruth('power in correct');

        }).catch(function (e) {
            expect(e).caught();
        }).then(function (x) {
            done();
        });
    });



    it('can create all the possible associative groupings for an expression', function (done) {
        MEPH.requires('MEPH.math.Expression').then(function () {
            var addition = Expression.addition(Expression.variable('a'), Expression.variable('b'), Expression.variable('c'));

            var groupings = Expression.createAssociativeGroupings(addition);
            expect(groupings).toBeTruthy();
        }).catch(function (e) {
            expect(e).caught();
        }).then(done);
    });

    it(' can convert groupings into an expression.', function (done) {
        MEPH.requires('MEPH.math.Expression').then(function () {
            var addition = Expression.addition(Expression.variable('a'), Expression.variable('b'), Expression.variable('c'));

            var groupings = Expression.createAssociativeGroupings(addition);

            var expression = Expression.convertGroup({ set: groupings[0].set, grouping: groupings.first().grouping.first() }, Expression.type.addition);

            expect(expression).toBeTruthy();

            expect(expression.parts.length === 2).toBeTruthy();
            return printExpressionToScreen(expression);
        }).catch(function (e) {
            expect(e).caught();
        }).then(done);
    });


    it('can convert all groupings into expressions.', function (done) {
        MEPH.requires('MEPH.math.Expression').then(function () {
            var addition = Expression.addition(Expression.variable('a'), Expression.variable('b'), Expression.variable('c'));

            var groupings = Expression.createAssociativeGroupings(addition);

            var expressions = Expression.convertGrouping(groupings, Expression.type.addition);

            expect(expressions).toBeTruthy();
            expressions.foreach(function (x) {
                console.log(x.latex());
            })
            expect(expressions.length).toBe(13);
        }).catch(function (e) {
            expect(e).caught();
        }).then(done);
    });

    it('can get the base version of a expression, pow -> multiplication of ', function (done) {
        MEPH.requires('MEPH.math.Expression').then(function () {
            var power = Expression.power(Expression.variable('x'), Expression.variable('2'));
            var x = Expression.variable('x');

            var factor = Expression.GreatestCommomFactor(Expression.multiplication(power, x));

            expect(factor).toBeTruthy();
            expect(factor.length === 1).toBeTruthy();
            expect(factor.first().exp.type === Expression.type.variable).toBeTruthy();

        }).catch(function (e) {
            expect(e).caught();
        }).then(done);
    });



    it('can get the base version of a expression, pow -> multiplication + multiplication ', function (done) {
        MEPH.requires('MEPH.math.Expression').then(function () {
            var power = Expression.power(Expression.variable('x'), Expression.variable('2'));
            var power2 = Expression.power(Expression.variable('x'), Expression.variable('2'));
            var x = Expression.variable('x');
            var addition = Expression.addition(Expression.multiplication(power, x), power2);
            var factor = Expression.GreatestCommomFactor(addition);

            expect(factor).toBeTruthy();
            expect(factor.length === 1).toBeTruthy();
            expect(factor.first().exp.type === Expression.type.variable).toBeTruthy();
            expect(factor.first().count === 2).toBeTruthy();

        }).catch(function (e) {
            expect(e).caught();
        }).then(done);
    });


    it('can get the base version of a expression, pow -> a x^2+ a x^2', function (done) {
        MEPH.requires('MEPH.math.Expression').then(function () {
            var power = Expression.power(Expression.variable('x'), Expression.variable('2'));
            var power2 = Expression.power(Expression.variable('x'), Expression.variable('2'));
            var a = Expression.variable('a');
            var a2 = Expression.variable('a');
            var addition = Expression.addition(Expression.multiplication(power, a), Expression.multiplication(power2, a2));
            var factor = Expression.GreatestCommomFactor(addition);

            expect(factor).toBeTruthy();
            expect(factor.length === 2).toBeTruthy();

        }).catch(function (e) {
            expect(e).caught();
        }).then(done);
    });

    it('can refactor an expression in to ; ax + bx => x(a+b)', function (done) {
        MEPH.requires('MEPH.math.Expression').then(function () {
            var x = Expression.variable('x');
            var x2 = Expression.variable('x');
            var a = Expression.variable('a');
            var a2 = Expression.variable('b');
            var addition = Expression.addition(Expression.multiplication(x, a), Expression.multiplication(x2, a2));
            var factor = Expression.GreatestCommomFactor(addition);

            expect(factor).toBeTruthy();
            expect(factor.length === 1).toBeTruthy();

            factor = factor.first();

            var refactored = Expression.Refactor(addition, [factor]);

            var expectedResult = Expression.multiplication(Expression.variable('x'), Expression.addition(Expression.variable('a'), Expression.variable('b')));

            expect(refactored.equals(expectedResult)).toBeTruthy();

        }).catch(function (e) {
            expect(e).caught();
        }).then(done);
    });

    it('can refactor an expression from 2x + 2y => 2(x + y)', function () {
        var two = Expression.variable('2');
        var t2 = Expression.variable('2');
        var x = Expression.variable('x');
        var y = Expression.variable('y');
        var addition = Expression.addition(Expression.multiplication(two, x), Expression.multiplication(t2, y));

        var factor = Expression.GreatestCommomFactor(addition);

        expect(factor).toBeTruthy();
        expect(factor.length === 1).toBeTruthy();

        factor = factor.first();
        var refactored = Expression.Refactor(addition, [factor]);

        var expectedResult = Expression.multiplication(Expression.variable('2'), Expression.addition(Expression.variable('x'), Expression.variable('y')));
        expect(refactored.equals(expectedResult, { exact: true })).toBeTruthy();
    });


    it('can refactor an expression from 6x + 3y => 3(2x + y)', function () {
        var two = Expression.variable('6');
        var t2 = Expression.variable('3');
        var x = Expression.variable('x');
        var y = Expression.variable('y');
        var addition = Expression.addition(Expression.multiplication(two, x), Expression.multiplication(t2, y));

        var factor = Expression.GreatestCommomFactor(addition);

        expect(factor).toBeTruthy();
        expect(factor.length === 1).toBeTruthy();

        factor = factor.first();
        var refactored = Expression.Refactor(addition, [factor]);

        var expectedResult = Expression.multiplication(Expression.variable('3'), Expression.addition(Expression.multiplication(Expression.variable('2'), Expression.variable('x')), Expression.variable('y')));
        expect(refactored.equals(expectedResult, { exact: true })).toBeTruthy();
    });

    it('Expression.one() is a variable with the value of 1', function () {
        var one = Expression.one();
        expect(one.type === Expression.type.variable).toBeTruthy();
        expect(one.partOrDefault(Expression.type.variable) === 1).toBeTruthy();
    });


    it('Expression.isOne(exp) detects if the expression equals one.', function () {
        var one = Expression.one();
        expect(Expression.isOne(one)).toBeTruthy();
    });

    it('Expression.isOne(exp) detects if the expression equals one.', function () {
        var one = 1
        expect(Expression.isOne(one)).toBeTruthy();
    });

    it('Can remove a one from an expression', function () {

        var one = Expression.one();
        var mul = Expression.multiplication(Expression.variable('b'), Expression.variable('a'), one);
        Expression.removeOne(mul);

        expect(mul.parts.length === 2).toBeTruthy();
    });

    it('Can remove multiple ones from an expression', function () {

        var one = Expression.one();
        var mul = Expression.multiplication(Expression.variable('b'), Expression.variable('a'), one, Expression.one());
        Expression.removeOne(mul);

        expect(mul.parts.length === 2).toBeTruthy();
    });

    it('if everything is remove except for 1 value, it returns the single part left.', function () {

        var one = Expression.one();
        var mul = Expression.multiplication(Expression.variable('b'), one, Expression.one());
        var result = Expression.removeOne(mul);
        expect(result.type === Expression.type.variable).toBeTruthy();

    });

    it('if everything is a 1 then a 1 is all that will remain.', function () {

        var one = Expression.one();
        var mul = Expression.multiplication(Expression.variable('1'), one, Expression.one());
        var result = Expression.removeOne(mul);
        expect(result.type === Expression.type.variable).toBeTruthy();
        expect(result.partOrDefault(Expression.type.variable) == 1).toBeTruthy();
    });

    it('can refactor an expression from 6(int(fx)) + 3(int(fy)) => 3(2(int(fx)) + (int(fy)))', function () {
        var two = Expression.variable('6');
        var t2 = Expression.variable('3');
        var x = Expression.integral(Expression.variable('a'), 'x');
        var y = Expression.integral(Expression.variable('d'), 'y');
        var addition = Expression.addition(Expression.multiplication(two, x), Expression.multiplication(t2, y));

        var factor = Expression.GreatestCommomFactor(addition);

        expect(factor).toBeTruthy();
        expect(factor.length === 1).toBeTruthy();

        factor = factor.first();
        var refactored = Expression.Refactor(addition, [factor]);

        var expectedResult = Expression.multiplication(Expression.variable('3'), Expression.addition(
            Expression.multiplication(Expression.variable('2'),
                                        Expression.integral(Expression.variable('a'), 'x')),
                                        Expression.integral(Expression.variable('d'), 'y')));
        expect(refactored.equals(expectedResult, { exact: true })).toBeTruthy();
    });


    it('can refactor an expression from 2(int(fx)) + 3(int(fx)) => int(fx)(2 + 3)', function () {
        var two = Expression.variable('2');
        var t2 = Expression.variable('3');
        var x = Expression.integral(Expression.variable('a'), 'x');
        var y = Expression.integral(Expression.variable('a'), 'x');
        var addition = Expression.addition(Expression.multiplication(two, x), Expression.multiplication(t2, y));

        var factor = Expression.GreatestCommomFactor(addition);

        expect(factor).toBeTruthy();
        expect(factor.length === 1).toBeTruthy();

        factor = factor.first();
        var refactored = Expression.Refactor(addition, [factor]);

        var expectedResult = Expression.multiplication(Expression.integral(Expression.variable('a'), 'x'),
            Expression.addition(Expression.variable('2'), Expression.variable('3')));
        expect(refactored.equals(expectedResult, { exact: true })).toBeTruthy();
    });
});