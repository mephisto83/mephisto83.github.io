describe("MEPH/math/expression/Factor.spec.js", 'MEPH.math.Expression', 'MEPH.math.expression.Factor', 'MEPH.math.expression.Evaluator', function () {
    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });

    it('an expression can be created', function (done) {

        MEPH.requires('MEPH.math.expression.Factor').then(function ($class) {

            var factor = new MEPH.math.expression.Factor();

            expect(factor).theTruth('a factor was not created');

        }).catch(function (e) {
            expect(e).caught();
        }).then(function (x) {
            done();
        });
    });


    it('can get factors of a "variable" ', function (done) {

        MEPH.requires('MEPH.math.Expression', 'MEPH.math.expression.Factor').then(function ($class) {

            var variable = Expression.variable('x');
            var factors = MEPH.math.expression.Factor.getFactors(variable);
            expect(factors).toBeTruthy();
            expect(factors.length === 1).toBeTruthy();
            expect(factors.first().exp.equals(Expression.variable('x'))).toBeTruthy();
            expect(factors.first().count === 1).toBeTruthy();

        }).catch(function (e) {
            expect(e).caught();
        }).then(function (x) {
            done();
        });
    });


    it('can get factors of a "power" x^2 ', function (done) {

        MEPH.requires('MEPH.math.Expression', 'MEPH.math.expression.Factor').then(function ($class) {

            var power = Expression.power(Expression.variable('x'), Expression.variable('2'));
            var factors = MEPH.math.expression.Factor.getFactors(power);
            expect(factors).toBeTruthy();
            expect(factors.length === 1).toBeTruthy();
            expect(factors.first().exp.type === Expression.type.variable).toBeTruthy();
            expect(factors.first().count === 2).toBeTruthy();

        }).catch(function (e) {
            expect(e).caught();
        }).then(function (x) {
            done();
        });
    });

    it('can get factors of a "power" (x^2)^2 ', function (done) {

        MEPH.requires('MEPH.math.Expression', 'MEPH.math.expression.Factor').then(function ($class) {

            var power = Expression.power(Expression.power(Expression.variable('x'), Expression.variable('2')), Expression.variable('2'));
            var factors = MEPH.math.expression.Factor.getFactors(power);
            expect(factors).toBeTruthy();
            expect(factors.length === 1).toBeTruthy();
            expect(factors.first().exp.type === Expression.type.variable).toBeTruthy();
            expect(factors.first().count === 4).toBeTruthy();

        }).catch(function (e) {
            expect(e).caught();
        }).then(function (x) {
            done();
        });
    });

    it('can get factors of a "power" x^a ', function (done) {

        MEPH.requires('MEPH.math.Expression', 'MEPH.math.expression.Factor').then(function ($class) {

            var power = Expression.power(Expression.variable('x'), Expression.variable('a'));
            var factors = MEPH.math.expression.Factor.getFactors(power);
            expect(factors).toBeTruthy();
            expect(factors.length === 1).toBeTruthy();
            expect(factors.first().exp.type === Expression.type.variable).toBeTruthy();
            var c = MEPH.math.expression.Factor.getNumerical(factors.first().count, true);
            expect(c === 'a').toBeTruthy();

        }).catch(function (e) {
            expect(e).caught();
        }).then(function (x) {
            done();
        });
    });

    it('can get factors of a "power" x*x^2 ', function (done) {

        MEPH.requires('MEPH.math.Expression', 'MEPH.math.expression.Factor').then(function ($class) {

            var power = Expression.multiplication(Expression.variable('x'), Expression.power(Expression.variable('x'), Expression.variable(2)));
            var factors = MEPH.math.expression.Factor.getFactors(power);
            expect(factors).toBeTruthy();
            expect(factors.length === 1).toBeTruthy();
            expect(factors.first().exp.type === Expression.type.variable).toBeTruthy();
            expect(factors.first().count === 3).toBeTruthy();

        }).catch(function (e) {
            expect(e).caught();
        }).then(function (x) {
            done();
        });
    });

    it('can get factors of a "power" a*x^2 ', function (done) {

        MEPH.requires('MEPH.math.Expression', 'MEPH.math.expression.Factor').then(function ($class) {

            var power = Expression.power(Expression.variable('x'), Expression.variable('2'));
            var power2 = Expression.power(Expression.variable('x'), Expression.variable('2'));
            var a = Expression.variable('a');
            var a2 = Expression.variable('a');
            var addition = Expression.multiplication(power, a);

            var factors = MEPH.math.expression.Factor.getFactors(addition);
            expect(factors).toBeTruthy();
            expect(factors.length === 2).toBeTruthy();
            expect(factors.first(function (x) { return x.count === 1; })).toBeTruthy();
            expect(factors.first(function (x) { return x.count === 2; })).toBeTruthy();

        }).catch(function (e) {
            expect(e).caught();
        }).then(function (x) {
            done();
        });
    });

    it('can remove "a" factors from an expression a*x^2 => x^2', function (done) {
        MEPH.requires('MEPH.math.Expression', 'MEPH.math.expression.Factor').then(function ($class) {

            var power = Expression.power(Expression.variable('x'), Expression.variable('2'));
            var power2 = Expression.power(Expression.variable('x'), Expression.variable('2'));
            var a = Expression.variable('a');
            var a2 = Expression.variable('b');
            var addition = Expression.multiplication(power, a);

            var factors = MEPH.math.expression.Factor.getFactors(addition);

            var raddition = MEPH.math.expression.Factor.removeFactors(addition, [factors.first()]);

            expect(raddition.type === Expression.type.power);

        }).catch(function (e) {
            expect(e).caught();
        }).then(function (x) {
            done();
        });
    })

    it('can remove "x^2" factors from an expression a*x^2 => a', function (done) {
        MEPH.requires('MEPH.math.Expression', 'MEPH.math.expression.Factor').then(function ($class) {

            var power = Expression.power(Expression.variable('x'), Expression.variable('2'));
            var power2 = Expression.power(Expression.variable('x'), Expression.variable('2'));
            var a = Expression.variable('a');
            var a2 = Expression.variable('b');
            var addition = Expression.multiplication(power, a);

            var factors = MEPH.math.expression.Factor.getFactors(addition);

            var raddition = MEPH.math.expression.Factor.removeFactors(addition, [factors.second()]);

            expect(raddition.type === Expression.type.variable);
            expect(raddition.getParts().first().val === 'a');

        }).catch(function (e) {
            expect(e).caught();
        }).then(function (x) {
            done();
        });
    })

    it('can remove "x^b" factors from an expression a*x^b => a', function (done) {
        MEPH.requires('MEPH.math.Expression',
                        'MEPH.math.expression.Factor',
                        'MEPH.math.expression.Evaluator').then(function ($class) {

                            var power = Expression.power(Expression.variable('x'), Expression.variable('b'));
                            var a = Expression.variable('a');
                            var addition = Expression.multiplication(power, a);

                            var factors = MEPH.math.expression.Factor.getFactors(addition);

                            var raddition = MEPH.math.expression.Factor.removeFactors(addition, [factors.second()]);

                            expect(raddition.type === Expression.type.variable);
                            expect(raddition.getParts().first().val === 'a');

                        }).catch(function (e) {
                            expect(e).caught();
                        }).then(function (x) {
                            done();
                        });
    });

    it('gets primes that make the number 6', function () {
        var number = Expression.variable('6');

        var factors = MEPH.math.expression.Factor.getFactors(number);

        expect(factors.length === 2).toBeTruthy();

    });
});