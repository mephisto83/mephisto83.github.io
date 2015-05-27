describe("MEPH/math/Expression.spec.js", function () {
    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });

    it('an expression can be created', function (done) {

        MEPH.requires('MEPH.math.Expression').then(function ($class) {

            var expression = new MEPH.math.Expression();

            expect(expression).theTruth('a quaternion was not created');

        }).catch(function (e) {
            expect(e.message? e : new Error(e)).caught();
        }).then(function (x) {
            done();
        });
    });

    it('represent a variable ', function (done) {
        MEPH.requires('MEPH.math.Expression').then(function ($class) {
            var Expression = MEPH.math.Expression;
            var expression = Expression.variable('a');
            var latexp = expression.latex();
            expect(latexp === 'a').toBeTruthy();

        }).catch(function (e) {
            expect(e.message? e : new Error(e)).caught();
        }).then(function (x) {
            done();
        });
    });

    it('represent an integration function', function (done) {

        MEPH.requires('MEPH.math.Expression').then(function ($class) {
            var Expression = MEPH.math.Expression;
            var expression = Expression.integral(Expression.variable('f(x)'), 'x', Expression.variable('a'), Expression.variable('b'));
            var latexp = '\\int_a^b \\! f(x) \\, \\mathrm{d}x';
            
            expect(latexp === expression.latex()).toBeTruthy();
        }).catch(function (e) {
            expect(e.message? e : new Error(e)).caught();
        }).then(function (x) {
            done();
        });
    });

    it('represent an integration without start an end', function (done) {
        MEPH.requires('MEPH.math.Expression').then(function ($class) {
            var Expression = MEPH.math.Expression;
            var expression = Expression.integral(Expression.variable('f(x)'), 'x');
            var latexp = '\\int_ \\! f(x) \\, \\mathrm{d}x';
            expect(latexp === expression.latex()).toBeTruthy();
        }).catch(function (e) {
            expect(e.message? e : new Error(e)).caught();
        }).then(function (x) {
            done();
        });
    });

    it('represents an addition', function (done) {
        MEPH.requires('MEPH.math.Expression').then(function ($class) {
            var Expression = MEPH.math.Expression;
            var expression = Expression.addition(Expression.variable('f(x)'), Expression.variable('x'));
            var latexp = 'f(x) + x';
            expect(latexp === expression.latex()).toBeTruthy();
        }).catch(function (e) {
            expect(e.message? e : new Error(e)).caught();
        }).then(function (x) {
            done();
        });
    });

    it('represents an addition with multiple parts', function (done) {
        MEPH.requires('MEPH.math.Expression').then(function ($class) {
            var Expression = MEPH.math.Expression;
            var expression = Expression.addition(Expression.variable('f(x)'),
                Expression.variable('x'),
                Expression.variable('x'),
                Expression.variable('b'),
                Expression.variable('a'),
                Expression.variable('y'));
            var latexp = 'f(x) + x + x + b + a + y';

            expect(latexp === expression.latex()).toBeTruthy();
        }).catch(function (e) {
            expect(e.message? e : new Error(e)).caught();
        }).then(function (x) {
            done();
        });
    });

    it('represents an substitute with subtraction parts', function (done) {
        MEPH.requires('MEPH.math.Expression').then(function ($class) {
            var Expression = MEPH.math.Expression;
            var expression = Expression.subtraction(Expression.variable('f(x)'),
                Expression.variable('x'),
                Expression.variable('x'),
                Expression.variable('b'),
                Expression.variable('a'),
                Expression.variable('y'));
            var latexp = 'f(x) - x - x - b - a - y';

            expect(latexp === expression.latex()).toBeTruthy();
        }).catch(function (e) {
            expect(e.message? e : new Error(e)).caught();
        }).then(function (x) {
            done();
        });
    });

    it('represents an substitute with division parts', function (done) {
        MEPH.requires('MEPH.math.Expression').then(function ($class) {
            var Expression = MEPH.math.Expression;
            var expression = Expression.division(Expression.variable('f(x)'),
                Expression.variable('x'),
                Expression.variable('x'),
                Expression.variable('b'),
                Expression.variable('a'),
                Expression.variable('y'));
            var latexp = 'f(x) / x / x / b / a / y';

            expect(latexp === expression.latex()).toBeTruthy();
        }).catch(function (e) {
            expect(e.message? e : new Error(e)).caught();
        }).then(function (x) {
            done();
        });
    });

    it('represents an substitute with multiplication parts, if two variables are the same', function (done) {
        MEPH.requires('MEPH.math.Expression').then(function ($class) {
            var Expression = MEPH.math.Expression;
            var expression = Expression.multiplication(Expression.variable('f(x)'),
                Expression.variable('x'),
                Expression.variable('x'),
                Expression.variable('b'),
                Expression.variable('a'),
                Expression.variable('y'));
            var latexp = 'f(x)xxbay';

            expect(latexp === expression.latex()).toBeTruthy();
        }).catch(function (e) {
            expect(e.message? e : new Error(e)).caught();
        }).then(function (x) {
            done();
        });
    });


    it('represents an substitute with multiplication parts, if two variables are the same', function (done) {
        MEPH.requires('MEPH.math.Expression').then(function ($class) {
            var Expression = MEPH.math.Expression;
            var expression = Expression.multiplication(
                Expression.variable('x'),
                Expression.variable('b'),
                Expression.variable('a'),
                Expression.variable('y'));
            var latexp = 'xbay';

            expect(latexp === expression.latex()).toBeTruthy();
        }).catch(function (e) {
            expect(e.message? e : new Error(e)).caught();
        }).then(function (x) {
            done();
        });
    });

    it('requires parenthesis ', function (done) {
        MEPH.requires('MEPH.math.Expression').then(function ($class) {
            var Expression = MEPH.math.Expression;

            expect(Expression.requiresParenthesis(Expression.type.addition)).toBeTruthy();
            expect(Expression.requiresParenthesis(Expression.type.subtraction)).toBeTruthy();
            expect(Expression.requiresParenthesis(Expression.type.multiplication)).toBeTruthy();
            expect(Expression.requiresParenthesis(Expression.type.division)).toBeTruthy();
        }).catch(function (e) {
            expect(e.message? e : new Error(e)).caught();
        }).then(function (x) {
            done();
        });
    });


    it('expression power ', function (done) {
        MEPH.requires('MEPH.math.Expression').then(function ($class) {
            var Expression = MEPH.math.Expression;
            var expression = Expression.power(Expression.variable('f(x)'), Expression.variable('y'));
            var latexp = 'f(x)^{y}';

            expect(latexp === expression.latex()).toBeTruthy();
        }).catch(function (e) {
            expect(e.message? e : new Error(e)).caught();
        }).then(function (x) {
            done();
        });
    });

    it('expression fraction ', function (done) {
        MEPH.requires('MEPH.math.Expression').then(function ($class) {
            var Expression = MEPH.math.Expression;
            var expression = Expression.fraction(Expression.variable('f(x)'), Expression.variable('y'));
            var latexp = '\\frac{f(x)}{y}';

            expect(latexp === expression.latex()).toBeTruthy();
        }).catch(function (e) {
            expect(e.message? e : new Error(e)).caught();
        }).then(function (x) {
            done();
        });
    });

    it('expression fraction continuous', function (done) {
        MEPH.requires('MEPH.math.Expression').then(function ($class) {
            var Expression = MEPH.math.Expression;
            var expression = Expression.fraction(Expression.variable('f(x)'),
                Expression.variable('f(x)'),
                Expression.variable('f(x)'),
                Expression.variable('f(x)'),
                Expression.variable('y'));
            var latexp = '\\begin{equation}' +
                        ' \\cfrac{f(x)}{' +
                        ' \\cfrac{f(x)}{' +
                        ' \\cfrac{f(x)}{' +
                        ' \\cfrac{f(x)}{y}}}}' +
                        ' \\end{equation}';

            expect(latexp === expression.latex()).toBeTruthy();
        }).catch(function (e) {
            expect(e.message? e : new Error(e)).caught();
        }).then(function (x) {
            done();
        });
    });

    it('expression cos', function (done) {
        MEPH.requires('MEPH.math.Expression').then(function ($class) {
            var Expression = MEPH.math.Expression;
            var expression = Expression.cos(Expression.theta());
            var latexp = '\\cos (\\theta)';

            expect(latexp === expression.latex()).toBeTruthy();
        }).catch(function (e) {
            expect(e.message? e : new Error(e)).caught();
        }).then(function (x) {
            done();
        });
    });

    it('expression sin', function (done) {
        MEPH.requires('MEPH.math.Expression').then(function ($class) {
            var Expression = MEPH.math.Expression;
            var expression = Expression.sin(Expression.theta());
            var latexp = '\\sin (\\theta)';

            expect(latexp === expression.latex()).toBeTruthy();
        }).catch(function (e) {
            expect(e.message? e : new Error(e)).caught();
        }).then(function (x) {
            done();
        });
    });

    it('expression tan', function (done) {
        MEPH.requires('MEPH.math.Expression').then(function ($class) {
            var Expression = MEPH.math.Expression;
            var expression = Expression.tan(Expression.theta());
            var latexp = '\\tan (\\theta)';

            expect(latexp === expression.latex()).toBeTruthy();
        }).catch(function (e) {
            expect(e.message? e : new Error(e)).caught();
        }).then(function (x) {
            done();
        });
    });


    it('expression csc', function (done) {
        MEPH.requires('MEPH.math.Expression').then(function ($class) {
            var Expression = MEPH.math.Expression;
            var expression = Expression.csc(Expression.theta());
            var latexp = '\\csc (\\theta)';

            expect(latexp === expression.latex()).toBeTruthy();
        }).catch(function (e) {
            expect(e.message? e : new Error(e)).caught();
        }).then(function (x) {
            done();
        });
    });

    it('expression sec', function (done) {
        MEPH.requires('MEPH.math.Expression').then(function ($class) {
            var Expression = MEPH.math.Expression;
            var expression = Expression.sec(Expression.theta());
            var latexp = '\\sec (\\theta)';

            expect(latexp === expression.latex()).toBeTruthy();
        }).catch(function (e) {
            expect(e.message? e : new Error(e)).caught();
        }).then(function (x) {
            done();
        });
    });

    it('expression cot', function (done) {
        MEPH.requires('MEPH.math.Expression').then(function ($class) {
            var Expression = MEPH.math.Expression;
            var expression = Expression.cot(Expression.theta());
            var latexp = '\\cot (\\theta)';

            expect(latexp === expression.latex()).toBeTruthy();
        }).catch(function (e) {
            expect(e.message? e : new Error(e)).caught();
        }).then(function (x) {
            done();
        });
    });

    it('expression sin^2', function (done) {
        MEPH.requires('MEPH.math.Expression').then(function ($class) {
            var Expression = MEPH.math.Expression;
            var expression = Expression.sin(Expression.theta(), 2);
            var latexp = '\\sin^2 (\\theta)';

            expect(latexp === expression.latex()).toBeTruthy();
        }).catch(function (e) {
            expect(e.message? e : new Error(e)).caught();
        }).then(function (x) {
            done();
        });
    });

    it('expression mod', function (done) {
        MEPH.requires('MEPH.math.Expression').then(function ($class) {
            var Expression = MEPH.math.Expression;
            var expression = Expression.mod(Expression.theta(), Expression.variable('f'));
            var latexp = '\\theta \\bmod f';

            expect(latexp === expression.latex()).toBeTruthy();
        }).catch(function (e) {
            expect(e.message? e : new Error(e)).caught();
        }).then(function (x) {
            done();
        });
    });



    it('expression limit', function (done) {
        MEPH.requires('MEPH.math.Expression').then(function ($class) {
            var Expression = MEPH.math.Expression;
            var expression = Expression.limit(Expression.variable('f(x)'), Expression.variable('a'), Expression.variable('b'));
            var latexp = '\\lim_{a \\to b} f(x)';

            expect(latexp === expression.latex()).toBeTruthy();
        }).catch(function (e) {
            expect(e.message? e : new Error(e)).caught();
        }).then(function (x) {
            done();
        });
    });

    it('expression is the same form as', function (done) {
        MEPH.requires('MEPH.math.Expression').then(function ($class) {
            var Expression = MEPH.math.Expression;
            var expression = Expression.sec(Expression.variable('a'));
            var exp2 = Expression.sec(Expression.variable('b'));

            expect(expression.equals(exp2)).toBeTruthy();
        }).catch(function (e) {
            expect(e.message? e : new Error(e)).caught();
        }).then(function (x) {
            done();
        });
    });

    it('expression is equal to sin2 θ + cos2 θ === sin2 f(x) + cos2 f(x)  ', function (done) {
        MEPH.requires('MEPH.math.Expression').then(function ($class) {
            var Expression = MEPH.math.Expression;
            var expression = Expression.addition(Expression.sin('theta', 2), Expression.cos('theta', 2));
            var exp2 = Expression.addition(Expression.sin(Expression.variable('y'), 2), Expression.cos(Expression.variable('x'), 2));

            expect(expression.equals(exp2)).toBeTruthy();
        }).catch(function (e) {
            expect(e.message? e : new Error(e)).caught();
        }).then(function (x) {
            done();
        });
    });


    it('expression is equal to sin2 θ + cos2 θ + cos2 θ !== sin2 f(x) + cos2 f(x)  ', function (done) {
        MEPH.requires('MEPH.math.Expression').then(function ($class) {
            var Expression = MEPH.math.Expression;
            var expression = Expression.addition(Expression.sin('theta', 2), Expression.cos('theta', 2), Expression.cos('theta', 2));
            var exp2 = Expression.addition(Expression.sin(Expression.variable('y'), 2), Expression.cos(Expression.variable('x'), 2));

            expect(expression.equals(exp2)).toBeFalsy();
        }).catch(function (e) {
            expect(e.message? e : new Error(e)).caught();
        }).then(function (x) {
            done();
        });
    });


    it('expression function', function (done) {
        MEPH.requires('MEPH.math.Expression').then(function ($class) {
            var Expression = MEPH.math.Expression;
            var expression = Expression.func('f', 'x');

            var latexp = 'f(x)';

            expect(latexp === expression.latex()).toBeTruthy();
        }).catch(function (e) {
            expect(e.message? e : new Error(e)).caught();
        }).then(function (x) {
            done();
        });
    });


    it('expression plusorminus', function (done) {
        MEPH.requires('MEPH.math.Expression').then(function ($class) {
            var Expression = MEPH.math.Expression;
            var expression = Expression.plusminus(Expression.variable('a'), Expression.variable('b'));
            var latexp = 'a \\pm b';

            expect(latexp === expression.latex()).toBeTruthy();
        }).catch(function (e) {
            expect(e.message? e : new Error(e)).caught();
        }).then(function (x) {
            done();
        });
    });

    it('can detect  Integration(a)dx = ax + c ', function (done) {
        MEPH.requires('MEPH.math.Expression').then(function ($class) {
            var Expression = MEPH.math.Expression;
            var expression = Expression.integral(Expression.variable('a'), 'x');

            var results = Expression.getMatch(expression);
            var exp2 = Expression.addition(
                        Expression.multiplication(
                            Expression.variable('a'),
                            Expression.variable('x')),
                        Expression.variable('c'));
            expect(results.length).toBe(1);
            var r = results.some(function (x) {
                return x.equals(exp2);
            });
            expect(r).toBeTruthy();
        }).catch(function (e) {
            expect(e.message? e : new Error(e)).caught();
        }).then(function (x) {
            done();
        });
    });


    it('can detect Integration(ax)dx = ax + c ', function (done) {
        MEPH.requires('MEPH.math.Expression').then(function ($class) {
            var Expression = MEPH.math.Expression;
            var expression = Expression.integral(Expression.multiplication(
                                                    Expression.variable('a'),
                                                    Expression.variable('x')),
                                'x');

            var results = Expression.getMatch(expression);
            var exp2 = Expression.addition(
                        Expression.multiplication(
                            Expression.variable('a'),
                            Expression.variable('x')),
                        Expression.variable('c'));
            expect(results.length).toBe(0);
            var r = results.some(function (x) {
                return x.equals(exp2);
            });
            expect(r).toBeFalsy();
        }).catch(function (e) {
            expect(e.message? e : new Error(e)).caught();
        }).then(function (x) {
            done();
        });
    });

    it('match rule Integration(a*f(x)) dx = a integrate(f(x))', function (done) {
        MEPH.requires('MEPH.math.Expression').then(function ($class) {
            var Expression = MEPH.math.Expression;
            var expression = Expression.integral(Expression.multiplication(Expression.variable('a'),
                Expression.func('f', 'x')), 'x');

            var rule = Expression.matchRule(expression, Expression.Rules.Integration.IntegralConstMultiply());

            expect(rule).toBeTruthy();
        }).catch(function (e) {
            expect(e.message? e : new Error(e)).caught();
        }).then(function (x) {
            done();
        });
    });

    it('match rule Integration(a*f(x)) dx !== Integration(a + f(x)) dx ', function (done) {
        MEPH.requires('MEPH.math.Expression').then(function ($class) {
            var Expression = MEPH.math.Expression;
            var expression = Expression.integral(Expression.addition(Expression.variable('a'),
                Expression.func('f', 'x')), 'x');

            var rule = Expression.matchRule(expression, Expression.Rules.Integration.IntegralConstMultiply());

            expect(!rule).toBeTruthy();
        }).catch(function (e) {
            expect(e.message? e : new Error(e)).caught();
        }).then(function (x) {
            done();
        });
    });


    it('match rule Integration(a*f(x)) dx === Integration(a (g(x) + f(x)) dx ', function (done) {
        MEPH.requires('MEPH.math.Expression').then(function ($class) {
            var Expression = MEPH.math.Expression;
            var expression = Expression.integral(
                                Expression.multiplication(
                                    Expression.variable('a'),
                                    Expression.addition(
                                        Expression.func('g', 'x'),
                                        Expression.func('f', 'x')
                                    )),
                            'x');

            var rule = Expression.matchRule(expression, Expression.Rules.Integration.IntegralConstMultiply());

            expect(rule).toBeTruthy();
        }).catch(function (e) {
            expect(e.message? e : new Error(e)).caught();
        }).then(function (x) {
            done();
        });
    });


    it('match rule Integration(a*f(x)) dx === Integration(a * (g(x) + f(x)) + h(x)) dx ', function (done) {
        MEPH.requires('MEPH.math.Expression').then(function ($class) {
            var Expression = MEPH.math.Expression;
            var expression = Expression.integral(
                                Expression.addition(
                                Expression.multiplication(
                                    Expression.variable('a'),
                                    Expression.addition(
                                        Expression.func('g', 'x'),
                                        Expression.func('f', 'x')
                                    )
                                ),
                                Expression.func('h', 'x')),
                            'x');

            var rule = Expression.matchRule(expression, Expression.Rules.Integration.IntegralConstMultiply());

            expect(!rule).toBeTruthy();
        }).catch(function (e) {
            expect(e.message? e : new Error(e)).caught();
        }).then(function (x) {
            done();
        });
    });


    it('match rule Integration(a) dx === Integration(a) dx ', function (done) {
        MEPH.requires('MEPH.math.Expression').then(function ($class) {
            var Expression = MEPH.math.Expression;
            var expression = Expression.integral(Expression.variable('a'), 'x');

            var rule = Expression.matchRule(expression, Expression.Rules.Integration.IntegralConst());

            expect(rule).toBeTruthy();
        }).catch(function (e) {
            expect(new Error(e)).caught();
        }).then(function (x) {
            done();
        });
    });


    it('match rule Integration(a) dx === Integration(a) dx ', function (done) {
        MEPH.requires('MEPH.math.Expression').then(function ($class) {
            var Expression = MEPH.math.Expression;
            var expression = Expression.integral(Expression.func('a', 'x'), 'x');

            var rule = Expression.matchRule(expression, Expression.Rules.Integration.IntegralConst());

            expect(!rule).toBeTruthy();
        }).catch(function (e) {
            expect(e).caught();
        }).then(function (x) {
            done();
        });
    });

    it('match rule ax + c', function (done) {
        MEPH.requires('MEPH.math.Expression').then(function ($class) {
            var Expression = MEPH.math.Expression;
            var expression = Expression.addition(Expression.multiplication(Expression.variable('#B'), Expression.variable('x')), Expression.variable('#C'));

            var rule = Expression.matchRule(expression, Expression.Rules.Integration.AxPlusC());

            expect(rule).toBeTruthy();
        }).catch(function (e) {
            expect(e.message? e : new Error(e)).caught();
        }).then(function (x) {
            done();
        });
    });

    it('match rule  a int(f(x))dx ', function (done) {
        MEPH.requires('MEPH.math.Expression').then(function ($class) {
            var Expression = MEPH.math.Expression;
            var expression = Expression.multiplication(Expression.variable('#B'), Expression.integral(Expression.func('f', 'x'), 'x'));

            var rule = Expression.matchRule(expression, Expression.Rules.Integration.MultiplyIntegralofFx());

            expect(rule).toBeTruthy();
        }).catch(function (e) {
            expect(e.message? e : new Error(e)).caught();
        }).then(function (x) {
            done();
        });

    });
    it('match rule  a int(f(x))dx ', function (done) {
        MEPH.requires('MEPH.math.Expression').then(function ($class) {
            var Expression = MEPH.math.Expression;
            var expression = Expression.multiplication(
                                Expression.variable('#B'),
                                Expression.integral(
                                    Expression.multiplication(
                                        Expression.func('g', 'x'),
                                        Expression.func('f', 'x'))
                                    , 'x')
                                );

            var rule = Expression.matchRule(expression, Expression.Rules.Integration.MultiplyIntegralofFx());

            expect(rule).toBeTruthy();
        }).catch(function (e) {
            expect(e.message? e : new Error(e)).caught();
        }).then(function (x) {
            done();
        });
    });


    it('match power rule  int(x^n)dx ', function (done) {
        MEPH.requires('MEPH.math.Expression').then(function ($class) {
            var Expression = MEPH.math.Expression;
            var expression = Expression.integral(
                Expression.power(
                    Expression.variable('x'),
                    Expression.variable('n'))
                , 'x');

            var rule = Expression.matchRule(expression, Expression.Rules.Integration.Power());

            expect(rule).toBeTruthy();
        }).catch(function (e) {
            expect(e).caught();
        }).then(function (x) {
            done();
        });
    });


    it('doesnt match power rule  int(y^n)dx ', function (done) {
        MEPH.requires('MEPH.math.Expression').then(function ($class) {
            var Expression = MEPH.math.Expression;
            var expression = Expression.integral(
                Expression.power(
                    Expression.variable('y'),
                    Expression.variable('n'))
                , 'x');

            
            var rule = Expression.matchRule(expression, Expression.Rules.Integration.Power());

            expect(!rule).toBeTruthy();
        }).catch(function (e) {
            expect(e).caught();
        }).then(function (x) {
            done();
        });
    });

    it('doesnt match power rule  int(y^n)dx ', function (done) {
        MEPH.requires('MEPH.math.Expression').then(function ($class) {
            var Expression = MEPH.math.Expression;
            var expression = Expression.integral(
                Expression.power(
                    Expression.variable('x'),
                    Expression.variable('x'))
                , 'x');


            var rule = Expression.matchRule(expression, Expression.Rules.Integration.Power());

            expect(!rule).toBeTruthy();
        }).catch(function (e) {
            expect(e).caught();
        }).then(function (x) {
            done();
        });
    });


    it('match power rule  1/(n+1)(x^(n+1))', function (done) {
        MEPH.requires('MEPH.math.Expression').then(function ($class) {
            var Expression = MEPH.math.Expression;
            var expression = Expression.addition(Expression.multiplication(
                                Expression.fraction(
                                    Expression.variable(1),
                                    Expression.addition(
                                        Expression.variable('n'),
                                        Expression.variable(1)
                                    )
                                ),
                Expression.power(
                    Expression.variable('x'),
                    Expression.addition(Expression.variable('n'), Expression.variable(1)))), Expression.variable('a'));

            var rule = Expression.matchRule(expression, Expression.Rules.Integration.PowerIntegrate());

            expect(rule).toBeTruthy();
        }).catch(function (e) {
            expect(e.message? e : new Error(e)).caught();
        }).then(function (x) {
            done();
        });
    });
    it('match power rule  1/(n+1)(x^(n+1))', function (done) {
        MEPH.requires('MEPH.math.Expression').then(function ($class) {
            var Expression = MEPH.math.Expression;
            var expression = Expression.addition(Expression.multiplication(
                                Expression.fraction(
                                    Expression.variable(1),
                                    Expression.addition(
                                        Expression.variable('n'),
                                        Expression.variable(1)
                                    )
                                ),
                Expression.power(
                    Expression.variable('x'),
                    Expression.addition(Expression.variable('x'), Expression.variable(1)))), Expression.variable('a'));

            var rule = Expression.matchRule(expression, Expression.Rules.Integration.PowerIntegrate());

            expect(!rule).toBeTruthy();
        }).catch(function (e) {
            expect(e).caught();
        }).then(function (x) {
            done();
        });
    });


    it('match int(u +/- v +/- w)', function (done) {
        MEPH.requires('MEPH.math.Expression').then(function ($class) {
            var Expression = MEPH.math.Expression;
            var expression = Expression.integral(
                            Expression.addition(Expression.func('f', 'x'),
                                Expression.func('g', 'x'),
                                Expression.func('h', 'x')), 'x');

            var rule = Expression.matchRule(expression, Expression.Rules.Integration.IntegrationAddition());

            expect(rule).toBeTruthy();
        }).catch(function (e) {
            expect(e.message? e : new Error(e)).caught();
        }).then(function (x) {
            done();
        });
    });

    it('can describe the transfer from one for to another', function (done) {
        MEPH.requires('MEPH.math.Expression').then(function ($class) {
            var Expression = MEPH.math.Expression;
            var expression = Expression.integral(
                            Expression.multiplication(Expression.variable('a')), 'x');

            expression.mark('A');
            var variable = expression.partVal(Expression['function'].input);
            variable.mark('B');

            expect(expression.mark() === 'A').toBeTruthy();
            expect(variable.mark() === 'B').toBeTruthy();

        }).catch(function (e) {
            expect(e.message? e : new Error(e)).caught();
        }).then(function (x) {
            done();
        });
    });

    it('can describe the transfer from one for to another', function (done) {
        MEPH.requires('MEPH.math.Expression').then(function ($class) {
            var Expression = MEPH.math.Expression;
            var expression = Expression.Rules.Integration.IntegralConstMultiply();

            var marks = expression.getMarks();
            expect(marks.C).toBeTruthy();
            expect(marks.A).toBeTruthy();
            expect(marks.I).toBeTruthy();

        }).catch(function (e) {
            expect(e.message? e : new Error(e)).caught();
        }).then(function (x) {
            done();
        });
    });

    it('can get marks from AxPlusC', function (done) {
        MEPH.requires('MEPH.math.Expression').then(function ($class) {
            var Expression = MEPH.math.Expression;
            var expression = Expression.Rules.Integration.AxPlusC();

            var marks = expression.getMarks();
            expect(marks.A).toBeTruthy();
            expect(marks.C).toBeTruthy();
            expect(marks.x).toBeTruthy();

        }).catch(function (e) {
            expect(e.message? e : new Error(e)).caught();
        }).then(function (x) {
            done();
        });
    });

    it('can get marks from AxPlusC', function (done) {
        MEPH.requires('MEPH.math.Expression').then(function ($class) {
            var Expression = MEPH.math.Expression;
            var expression = Expression.Rules.Integration.AxPlusC();

            var marks = expression.getMarks();
            expect(marks.A).toBeTruthy();
            expect(marks.C).toBeTruthy();
            expect(marks.x).toBeTruthy();

        }).catch(function (e) {
            expect(e.message? e : new Error(e)).caught();
        }).then(function (x) {
            done();
        });
    });

    it('can get marks from AxPlusC', function (done) {
        MEPH.requires('MEPH.math.Expression').then(function ($class) {
            var Expression = MEPH.math.Expression;
            var expression = Expression.Rules.Integration.MultiplyIntegralofFx();

            var marks = expression.getMarks();
            expect(marks.A).toBeTruthy();
            expect(marks.C).toBeTruthy();
            expect(marks.I).toBeTruthy();

        }).catch(function (e) {
            expect(e.message? e : new Error(e)).caught();
        }).then(function (x) {
            done();
        });
    });

    it('can get marks from IntegralConst', function (done) {
        MEPH.requires('MEPH.math.Expression').then(function ($class) {
            var Expression = MEPH.math.Expression;
            var expression = Expression.Rules.Integration.IntegralConst();

            var marks = expression.getMarks();

            expect(marks.C).toBeTruthy();
            expect(marks.I).toBeTruthy();

        }).catch(function (e) {
            expect(e.message? e : new Error(e)).caught();
        }).then(function (x) {
            done();
        });
    });

    it('can get marks from Power', function (done) {
        MEPH.requires('MEPH.math.Expression').then(function ($class) {
            var Expression = MEPH.math.Expression;
            var expression = Expression.Rules.Integration.Power();

            var marks = expression.getMarks();

            expect(marks.x).toBeTruthy();
            expect(marks.n).toBeTruthy();
            expect(marks.I).toBeTruthy();

        }).catch(function (e) {
            expect(e.message? e : new Error(e)).caught();
        }).then(function (x) {
            done();
        });
    });

    it('can get marks from PowerIntegrate', function (done) {
        MEPH.requires('MEPH.math.Expression').then(function ($class) {
            var Expression = MEPH.math.Expression;
            var expression = Expression.Rules.Integration.PowerIntegrate();

            var marks = expression.getMarks();

            expect(marks.n_pre).toBeTruthy();
            expect(marks.n_post).toBeTruthy();
            expect(marks.x).toBeTruthy();
            expect(marks.C).toBeTruthy();

        }).catch(function (e) {
            expect(e.message? e : new Error(e)).caught();
        }).then(function (x) {
            done();
        });
    });

    it('can get marks from IntegrationAddition', function (done) {
        MEPH.requires('MEPH.math.Expression').then(function ($class) {
            var Expression = MEPH.math.Expression;
            var expression = Expression.Rules.Integration.IntegrationAddition();

            var marks = expression.getMarks();

            expect(marks.I).toBeTruthy();
            expect(marks.A).toBeTruthy();
            expect(marks.f).toBeTruthy();

        }).catch(function (e) {
            expect(e.message? e : new Error(e)).caught();
        }).then(function (x) {
            done();
        });
    });


    it('an expression can copy ', function (done) {
        MEPH.requires('MEPH.math.Expression').then(function ($class) {
            var Expression = MEPH.math.Expression;
            var expression = Expression.Rules.Integration.IntegrationAddition();

            var copy = expression.copy();

            expect(copy.type === expression.type).toBeTruthy();
            expect(copy.mark() === expression.mark()).toBeTruthy();
            expect(copy.parts.length === expression.parts.length).toBeTruthy();

        }).catch(function (e) {
            expect(e.message? e : new Error(e)).caught();
        }).then(function (x) {
            done();
        });
    });

    it('a rule has a name ', function (done) {
        MEPH.requires('MEPH.math.Expression').then(function ($class) {
            var Expression = MEPH.math.Expression;
            var expression = Expression.Rules.Integration.IntegrationAddition();

            for (var i in Expression.Rules.Integration) {
                expect(Expression.Rules.Integration[i]).theTruth(i + ' does not have a name.');
                expect(Expression.Rules.Integration[i]().name).theTruth(i + ' does not have a name.');
            }
        }).catch(function (e) {
            expect(e).caught();
        }).then(function (x) {
            done();
        });
    });

    it('an expression can be set parent. ', function (done) {
        MEPH.requires('MEPH.math.Expression').then(function ($class) {
            var Expression = MEPH.math.Expression;
            var expression = new Expression();
            expression.parent(new Expression());
            expect(expression.parent()).toBeTruthy();

        }).catch(function (e) {
            expect(e.message? e : new Error(e)).caught();
        }).then(function (x) {
            done();
        });
    });


    it('can replace a part, in an expression. ', function (done) {
        MEPH.requires('MEPH.math.Expression').then(function ($class) {

            var a = Expression.anything();
            a.mark('A');

            var I = Expression.integral(a, 'x');
            var newc = Expression.variable('newc');
            I.swap('A', newc);
            expect(I.getMark('A')).toBeTruthy();

        }).catch(function (e) {
            expect(e.message? e : new Error(e)).caught();
        }).then(function (x) {
            done();
        });
    });

    it('can use swap rules to transform an expression from a -> b', function (done) {
        MEPH.requires('MEPH.math.Expression').then(function ($class) {
            var rule1 = Expression.Rules.Integration.IntegralConstMultiply();
            var rule2 = Expression.Rules.Integration.MultiplyIntegralofFx();
            var transformation = {
                transformation: {
                    from: Expression.RuleType.IntegralConstMultiply,
                    to: Expression.RuleType.MultiplyIntegralofFx
                },
                C: 'C',
                A: 'A',
                I: 'I'
            };
            var result = Expression.translation.Transform(transformation, rule1, rule2);
            expect(result).toBeTruthy();

        }).catch(function (e) {
            expect(e).caught();
        }).then(function (x) {
            done();
        });
    });

    it('can set the value of a mark', function (done) {
        MEPH.requires('MEPH.math.Expression').then(function ($class) {
            var Expression = MEPH.math.Expression;
            var rule1 = Expression.Rules.Integration.AxPlusC();

            rule1.swap('A', Expression.variable('A'));
            console.log(rule1.latex());
            expect(rule1.latex() === 'Ax + #C').toBeTruthy();
        }).catch(function (e) {
            expect(e.message? e : new Error(e)).caught();
        }).then(function (x) {
            done();
        });
    });

    it('translate a IntegralConst => AxPlusC ', function (done) {
        MEPH.requires('MEPH.math.Expression').then(function ($class) {
            var Expression = MEPH.math.Expression;
            var expression = Expression.Rules.Integration.IntegrationAddition();
            var rule1 = Expression.Rules.Integration.IntegralConst();
            var rule2 = Expression.Rules.Integration.AxPlusC();

            var transformation = {
                transformation: {
                    from: Expression.RuleType.IntegralConst,
                    to: Expression.RuleType.AxPlusC
                },
                C: 'A',
                dx: 'x'
            };
            var result = Expression.translation.Transform(transformation, rule1, rule2);
            console.log(result.latex());
            expect(result).toBeTruthy();
        }).catch(function (e) {
            expect(e.message? e : new Error(e)).caught();
        }).then(function (x) {
            done();
        });
    });

    it('translate a IntegralConst => AxPlusC , with Expression.translation.Translate', function (done) {
        MEPH.requires('MEPH.math.Expression').then(function ($class) {
            var Expression = MEPH.math.Expression;
            var expression = Expression.Rules.Integration.IntegrationAddition();
            var rule1 = Expression.Rules.Integration.IntegralConst();
            var rule2 = Expression.Rules.Integration.AxPlusC();

            var result = Expression.translation.Translate(rule1, rule2);
            console.log(result.latex());
            expect(result).toBeTruthy();
        }).catch(function (e) {
            expect(e.message? e : new Error(e)).caught();
        }).then(function (x) {
            done();
        });
    });

    it('translate a IntegralConstMultiply => MultiplyIntegralofFx ', function (done) {
        MEPH.requires('MEPH.math.Expression').then(function ($class) {
            var Expression = MEPH.math.Expression;
            var expression = Expression.Rules.Integration.IntegrationAddition();
            var rule1 = Expression.Rules.Integration.IntegralConstMultiply();
            var rule2 = Expression.Rules.Integration.MultiplyIntegralofFx();

            var transformation = {
                transformation: {
                    from: Expression.RuleType.IntegralConstMultiply,
                    to: Expression.RuleType.MultiplyIntegralofFx
                },
                C: 'C',
                A: 'A'
            };
            var result = Expression.translation.Transform(transformation, rule1, rule2);
            console.log(result.latex());
            expect(result).toBeTruthy();
        }).catch(function (e) {
            expect(e.message? e : new Error(e)).caught();
        }).then(function (x) {
            done();
        });
    });

    it('match rule Integration(a*f(x)) dx === Integration(a (g(x) + f(x)) dx, and marks the expression ', function (done) {
        MEPH.requires('MEPH.math.Expression').then(function ($class) {
            var Expression = MEPH.math.Expression;
            var a = Expression.variable('a');
            var anything = Expression.addition(
                                        Expression.func('g', 'x'),
                                        Expression.func('f', 'x')
                                    );
            var expression = Expression.integral(
                                Expression.multiplication(
                                    a,
                                    anything),
                            'x');


            var rule = Expression.matchRule(expression, Expression.Rules.Integration.IntegralConstMultiply(), true);
            var marks = expression.getMarks();
            expect(rule).toBeTruthy();
            expect(marks.C === a).toBeTruthy();
            expect(marks.I === expression).toBeTruthy();
            expect(marks.A === anything).toBeTruthy();

        }).catch(function (e) {
            expect(e.message? e : new Error(e)).caught();
        }).then(function (x) {
            done();
        });
    });
});