describe("MEPH/math/expression/Evaluator.spec.js", 'MEPH.math.expression.Evaluator', 'MEPH.math.Expression', 'MEPH.math.expression.Factor', function () {
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

    it('can evaluate an addition = Expression.addition(1, 2)', function (done) {
        MEPH.requires('MEPH.math.expression.Evaluator', 'MEPH.math.Expression', 'MEPH.math.expression.Factor').then(function ($class) {
            var additionExp = Expression.addition(1, 2);
            var result = MEPH.math.expression.Evaluator.evaluate(additionExp);

            expect(result.type === Expression.type.variable).toBeTruthy();
            expect(result.partOrDefault(Expression.type.variable) === 3).toBeTruthy();
        }).catch(function (e) {
            expect(e).caught();
        }).then(function (x) {
            done();
        });
    });


    it('can evaluate an addition = Expression.addition(1, 2 , Expression.variable(3))', function (done) {
        MEPH.requires('MEPH.math.expression.Evaluator', 'MEPH.math.Expression', 'MEPH.math.expression.Factor').then(function ($class) {
            var additionExp = Expression.addition(1, 2, Expression.variable(3));
            var result = MEPH.math.expression.Evaluator.evaluate(additionExp);

            expect(result.type === Expression.type.variable).toBeTruthy();
            expect(result.partOrDefault(Expression.type.variable) === 6).toBeTruthy();
        }).catch(function (e) {
            expect(e).caught();
        }).then(function (x) {
            done();
        });
    });

    it('can evaluate an addition = Expression.addition(Expression.variable(3), Expression.variable(3), Expression.variable(3))', function (done) {
        MEPH.requires('MEPH.math.expression.Evaluator', 'MEPH.math.Expression', 'MEPH.math.expression.Factor').then(function ($class) {
            var additionExp = Expression.addition(Expression.variable(3), Expression.variable(3), Expression.variable(3));
            var result = MEPH.math.expression.Evaluator.evaluate(additionExp);

            expect(result.type === Expression.type.variable).toBeTruthy();
            expect(result.partOrDefault(Expression.type.variable) === 9).toBeTruthy();
        }).catch(function (e) {
            expect(e).caught();
        }).then(function (x) {
            done();
        });
    });


    it('can evaluate an addition = Expression.addition(Expression.variable(3), Expression.variable(a))', function (done) {
        MEPH.requires('MEPH.math.expression.Evaluator', 'MEPH.math.Expression', 'MEPH.math.expression.Factor').then(function ($class) {
            var additionExp = Expression.addition(Expression.variable(3), Expression.variable('a'));
            var result = MEPH.math.expression.Evaluator.evaluate(additionExp);

            expect(result.type === Expression.type.addition).toBeTruthy();
            expect(result.getParts().length === 2).toBeTruthy();
        }).catch(function (e) {
            expect(e).caught();
        }).then(function (x) {
            done();
        });
    });

    it('can evaluate an addition = Expression.addition(Expression.variable(3), Expression.variable(3), Expression.variable(a))', function (done) {
        MEPH.requires('MEPH.math.expression.Evaluator', 'MEPH.math.Expression', 'MEPH.math.expression.Factor').then(function ($class) {
            var additionExp = Expression.addition(Expression.variable(3), Expression.variable(3), Expression.variable('a'));
            var result = MEPH.math.expression.Evaluator.evaluate(additionExp);

            expect(result.type === Expression.type.addition).toBeTruthy();
            expect(result.getParts().length === 2).toBeTruthy();
        }).catch(function (e) {
            expect(e).caught();
        }).then(function (x) {
            done();
        });
    });


    it('can evaluate an addition = Expression.addition(Expression.variable(3), Expression.variable(a), Expression.variable(3), Expression.variable(a))', function (done) {
        MEPH.requires('MEPH.math.expression.Evaluator', 'MEPH.math.Expression', 'MEPH.math.expression.Factor').then(function ($class) {
            var additionExp = Expression.addition(Expression.variable(3), Expression.variable('a'), Expression.variable(3), Expression.variable('a'));
            var result = MEPH.math.expression.Evaluator.evaluate(additionExp);

            expect(result.type === Expression.type.addition).toBeTruthy();
            expect(result.getParts().length === 3).toBeTruthy();
        }).catch(function (e) {
            expect(e).caught();
        }).then(function (x) {
            done();
        });
    });


    it('can evaluate an subtraction = Expression.subtraction(Expression.variable(3), Expression.variable(2))', function (done) {
        MEPH.requires('MEPH.math.expression.Evaluator', 'MEPH.math.Expression', 'MEPH.math.expression.Factor').then(function ($class) {
            var subtractionExp = Expression.subtraction(Expression.variable(3), Expression.variable(2));
            var result = MEPH.math.expression.Evaluator.evaluate(subtractionExp);
            expect(result.type === Expression.type.variable).toBeTruthy();
            expect(result.getParts().length === 1).toBeTruthy();
            expect(result.partOrDefault(Expression.type.variable) === 1).toBeTruthy();
        }).catch(function (e) {
            expect(e).caught();
        }).then(function (x) {
            done();
        });
    });

    it('can evaluate an subtraction = Expression.subtraction(Expression.variable(3), Expression.variable(2), Expression.variable(2))', function (done) {
        MEPH.requires('MEPH.math.expression.Evaluator', 'MEPH.math.Expression', 'MEPH.math.expression.Factor').then(function ($class) {
            var subtractionExp = Expression.subtraction(Expression.variable(3), Expression.variable(2), Expression.variable(2));
            var result = MEPH.math.expression.Evaluator.evaluate(subtractionExp);
            expect(result.type === Expression.type.variable).toBeTruthy();
            expect(result.getParts().length === 1).toBeTruthy();
            expect(result.partOrDefault(Expression.type.variable) === -1).toBeTruthy();
        }).catch(function (e) {
            expect(e).caught();
        }).then(function (x) {
            done();
        });
    });

    it('can evaluate an subtraction = Expression.subtraction(Expression.variable(3), Expression.variable(a))', function (done) {
        MEPH.requires('MEPH.math.expression.Evaluator', 'MEPH.math.Expression', 'MEPH.math.expression.Factor').then(function ($class) {
            var subtractionExp = Expression.subtraction(Expression.variable(3), Expression.variable('a'));
            var result = MEPH.math.expression.Evaluator.evaluate(subtractionExp);


            expect(result.type === Expression.type.subtraction).toBeTruthy();
            expect(result.getParts().length === 2).toBeTruthy();

        }).catch(function (e) {
            expect(e).caught();
        }).then(function (x) {
            done();
        });
    });

    it('can evaluate an subtraction = Expression.subtraction(Expression.variable(3), Expression.variable(a), Expression.variable(a), Expression.variable(3))', function (done) {
        MEPH.requires('MEPH.math.expression.Evaluator', 'MEPH.math.Expression', 'MEPH.math.expression.Factor').then(function ($class) {
            var subtractionExp = Expression.subtraction(Expression.variable(3), Expression.variable('a'), Expression.variable(3), Expression.variable('a'));
            var result = MEPH.math.expression.Evaluator.evaluate(subtractionExp);


            expect(result.type === Expression.type.subtraction).toBeTruthy();
            expect(result.getParts().length === 2).toBeTruthy();
        }).catch(function (e) {
            expect(e).caught();
        }).then(function (x) {
            done();
        });
    });

    it('can evaluate a division = Expression.division(Expression.variable(9),Expression.variable(3))', function () {
        var division = Expression.division(Expression.variable(9), Expression.variable(3));
        var result = MEPH.math.expression.Evaluator.evaluate(division);
        expect(result.partOrDefault(Expression.type.variable) === 3).toBeTruthy();
        expect(result.type === Expression.type.variable).toBeTruthy();
    });


    it('can evaluate a division = Expression.division(Expression.variable(9),Expression.variable(3),Expression.variable(a),Expression.variable(b))', function () {
        var division = Expression.division(Expression.variable(9), Expression.variable(3), Expression.variable('a'), Expression.variable('b'));
        var result = MEPH.math.expression.Evaluator.evaluate(division);
        expect(result.parts.length === 3).toBeTruthy();
        expect(result.type === Expression.type.division).toBeTruthy();
    });

    it('can evaluate a multiplication = 4*5*3', function () {
        var multiplication = Expression.multiplication(4, 5, 3);
        var result = MEPH.math.expression.Evaluator.evaluate(multiplication);

        expect(result.partOrDefault(Expression.type.variable).val === 60);
    });

    it('can evaluate a multiplication = 4*a*3', function () {
        var multiplication = Expression.multiplication(4, 'a', 3);
        var result = MEPH.math.expression.Evaluator.evaluate(multiplication);
        expect(result.parts.length === 2).toBeTruthy();
        expect(result.type === Expression.type.multiplication).toBeTruthy();
    });

    it('can evaluate a integral of a constant:general formula 1 of Integration rules', function () {
        var integral = Expression.integral(Expression.variable('f'), Expression.variable('x'));

        var result = Evaluator.evaluate(integral);
        console.log(integral.latex() + ' => ' + result.latex());
        expect(result.type === Expression.type.addition).toBeTruthy();
    });

    it('can evaluate an integral of general formula 2 of Integration rules.', function () {
        var integral = Expression.integral(Expression.multiplication('a', 'x'), 'x');
        var result = Evaluator.evaluate(integral, {
            strategy: function (rules) {
                return [rules.first()]
            }
        });
        console.log(result.latex());

        expect(result.type === Expression.type.multiplication).toBeTruthy();

    });

    it('can evaluate a fraction', function () {
        var fraction = Expression.fraction(4, 2);
        var result = Evaluator.evaluate(fraction);

        expect(result.value() === 2).toBeTruthy();
    });


    it('can evaluate a fraction', function () {
        var fraction = Expression.fraction(2, 3);
        var result = Evaluator.evaluate(fraction);

        expect(result.getParts().first().val.value() === 2).toBeTruthy();
    });

    it('can evaluate an integral of general formula 3 of Integration rules ', function () {
        var integral = Expression.integral(Expression.power(Expression.variable('x'), Expression.variable(3)), 'x');

        var result = Evaluator.evaluate(integral, {
            strategy: function (rules) {
                return [rules.first()];
            }
        });
        console.log(result.latex());

        expect(result.type === Expression.type.addition).toBeTruthy();
    });


    it('can evaluate an integral of general formula 4 of Inetegration rules', function () {
        var integral = Expression.integral(Expression.addition('a', 'b', 'c'), 'x');

        var result = Evaluator.evaluate(integral);
        console.log(result.latex());

        expect(result.type === Expression.type.addition).toBeTruthy();
    });


    it('can evaluate an integral of general formula 4 of Inetegration rules', function () {
        var integral = Expression.integral(Expression.addition('5', '0', '2'), 'x');

        var result = Evaluator.evaluate(integral);
        console.log(result.latex());

        expect(result.type === Expression.type.addition).toBeTruthy();
    });

    it('can evaluate a derivative of general formula 1 of Derivative rules', function () {
        var derivative = Expression.derivative(Expression.variable('a'), 1, null, 'x');

        var result = Evaluator.evaluate(derivative);

        expect(result === 0).toBeTruthy();
    });

    it('can evaluate a derivative of general formula 1 of Derivative rules', function () {
        var derivative = Expression.derivative(Expression.multiplication(
            Expression.variable('a'), Expression.variable('b')), 1, null, 'x');

        var result = Evaluator.evaluate(derivative);

        expect(result === 0).toBeTruthy();
    });

    it('can evaluate a derivative of general formula 2 of Derivative rules', function () {
        var derivative = Expression.derivative(
            Expression.multiplication(Expression.variable('c'), Expression.variable('x'))
            , 1, null, 'x');

        var result = Evaluator.evaluate(derivative, {
            strategy: function (rules) {
                return rules.where(function (x) { return x.rule.name() === Expression.RuleType.Derivation.GeneralFormula2a; });
            }
        });

        expect(result === 'c').toBeTruthy();

    });

    it('can evaluate a derivative of general formula 2 of Derivative rules', function () {
        var derivative = Expression.derivative(
            Expression.multiplication(Expression.variable('d'), Expression.variable('c'), Expression.variable('x'))
            , 1, null, 'x');

        var result = Evaluator.evaluate(derivative, {
            strategy: function (rules) {
                return rules.where(function (x) {
                    return x.rule.name() === Expression.RuleType.Derivation.GeneralFormula2a;
                });
            }
        });

        expect(result.type === Expression.type.multiplication).toBeTruthy();

    });

    it('can evaluate a derivative of general formula 3 of Derivative rules', function () {
        var d = Expression.derivative(Expression.multiplication(Expression.variable('c')
            , Expression.multiplication('d', 'x', 'f')), 1, null, 'x');

        var result = Evaluator.evaluate(d, {
            strategy: function (rules) {
                if (rules.length === 2) {
                    return [rules.first()]
                }
                return rules.where(function (x) { return x.rule.name() === Expression.RuleType.Derivation.GeneralFormula3a; });
            }
        });

        expect(result.type === Expression.type.multiplication).toBeTruthy();
    });

    it('can evaluate a derivative of general formula 4 of Derivative rules', function () {
        var d = Expression.derivative(Expression.addition('x', 'x'), 1, null, 'x');
        var result = Evaluator.evaluate(d, {
            strategy: function (rules) {
                return [rules.first(function (x) {
                    return x.rule.name() === Expression.RuleType.Derivation.GeneralFormula4a;
                })];
            }
        });
        expect(result.parts.length === 1).toBeTruthy();
        expect(result.type === Expression.type.addition).toBeTruthy();
    });

    it('can evaluate a derivative of general formula 4 of Derivative rules', function () {
        var d = Expression.derivative(Expression.addition('x', 'x', 'x'), 1, null, 'x');
        var result = Evaluator.evaluate(d, {
            strategy: function (rules) {
                return [rules.first(function (x) {
                    return x.rule.name() === Expression.RuleType.Derivation.GeneralFormula4a;
                })];
            }
        });
        expect(result.parts.length === 1).toBeTruthy();
        expect(result.type === Expression.type.addition).toBeTruthy();
    });

    it('can evaluate a derivative of general formula 5 of Derivative rules', function () {
        var d = Expression.derivative(Expression.multiplication('x', 'x', 'x'), 1, null, 'x');

        var result = Evaluator.evaluate(d);

        expect(result.parts.length === 3).toBeTruthy();
        expect(result.type === Expression.type.addition).toBeTruthy();
    });

    it('can evaluate a single variable in a derivative', function () {
        var d = Expression.derivative(Expression.variable('x'), 1, null, 'x');

        var result = Evaluator.evaluate(d);

        expect(result === 1).toBeTruthy();
    });

    it('can evaluate a quotient rule , derivative of general formula 7 of derivative rules', function () {
        var d = Expression.derivative(Expression.division(Expression.multiplication(2, 'x'), Expression.multiplication(4, 'x')), 1, null, 'x');

        var result = Evaluator.evaluate(d, {
            strategy: function (rules) {
                return rules.where(function (x) {
                    called = true;
                    return x.rule.name() === Expression.RuleType.Derivation.GeneralFormula7a;
                });
            }
        });

        expect(result.type === Expression.type.division).toBeTruthy();
    });

    it('can evaluate the power rule , derivative of general formula 10 of derivative rules', function () {
        var d = Expression.derivative(Expression.power(Expression.variable('x'), 10), 1, null, 'x');

        var result = Evaluator.evaluate(d, {
            strategy: function (rules) {
                return rules.where(function (x) {
                    called = true;
                    return x.rule.name() === Expression.RuleType.Derivation.GeneralFormula10a;
                });
            }
        });
        console.log(result.latex());
        expect("10x^{9}" === result.latex()).toBeTruthy();
        expect(result.type === Expression.type.multiplication).toBeTruthy();
    });

    it('can evaluate the power rule , derivative of general formula 10 of derivative rules', function () {
        var d = Expression.derivative(Expression.power(Expression.power(Expression.variable('x'), 2), 4), 1, null, 'x');

        var result = Evaluator.evaluate(d, {
            strategy: function (rules) {
                return rules.where(function (x) {
                    called = true;
                    return x.rule.name() === Expression.RuleType.Derivation.GeneralFormula10a;
                });
            }
        });
        
        expect("4x^{2}^{3}2x" === result.latex()).toBeTruthy();
        expect(result.type === Expression.type.multiplication).toBeTruthy();
    });



    it('can translate with more than the expect parts.', function () {
        var Expression = MEPH.math.Expression;

        var rule1 = Expression.Rules.Integration.IntegralConstMultiply();
        var rule2 = Expression.Rules.Integration.MultiplyIntegralofFx();

        var expression = Expression.integral(
                            Expression.multiplication(
                                Expression.variable('a'),
                                Expression.variable('b'),
                                Expression.addition(
                                    Expression.variable('x'),
                                    Expression.variable('x')
                                )),
                        'x');


        var result = Evaluator.evaluate(expression);

        expect(result).toBeTruthy();

    });

    it('can evaluate a derivative of general formula 12 of derivative rules', function () {
        var d = Expression.derivative(Expression.e('x'), 1, null, 'x');

        var result = Evaluator.evaluate(d, {
            strategy: function (rules) {
                return rules.where(function (x) {
                    return x.rule.name() === Expression.RuleType.Derivation.GeneralFormula12a;
                });
            }
        });

        expect(result.type === Expression.type.e).toBeTruthy();
    });

    it('can evaluate a derivative of general formula 13 of derivatives rules', function () {
        var d = Expression.derivative(Expression.power('a', 'x'), 1, null, 'x');

        var result = Evaluator.evaluate(d, {
            strategy: function (rules) {
                return rules.where(function (x) {
                    return x.rule.name() === Expression.RuleType.Derivation.GeneralFormula13a;
                });
            }
        });

        expect(result.latex() === 'a^{x}\\ln a').toBeTruthy();
        expect(result.type === Expression.type.multiplication).toBeTruthy();
    });

    it('can evaluate a derivative of general formula 14 of derivative rules', function () {
        var d = Expression.derivative(Expression.ln(Expression.abs(Expression.variable('x'))), 1, null, 'x');

        var result = Evaluator.evaluate(d, {
            strategy: function (rules) {
                return rules.where(function (x) {
                    return x.rule.name() === Expression.RuleType.Derivation.GeneralFormula14a;
                });
            }
        });

        expect(result.type === Expression.type.division).toBeTruthy();
    });

    it('can evaluate an absolute value expression', function () {
        var d = Expression.abs('-4');

        var result = Evaluator.evaluate(d);

        expect(result === 4).toBeTruthy();
    });

    it('can evalute a log a x => ', function () {
        var d = Expression.log(Expression.variable('10'), Expression.variable('10'));

        var result = Evaluator.evaluate(d);

        expect(result === 1).toBeTruthy();

    });

    it('can evaluate a derivative of general formula 15 of derivative rules', function () {
        var d = Expression.derivative(Expression.log(Expression.variable('x'), Expression.variable('a')), 1, null, 'x');

        var result = Evaluator.evaluate(d, {
            strategy: function (rules) {
                return rules.where(function (x) {
                    return x.rule.name() === Expression.RuleType.Derivation.GeneralFormula15a;
                });
            }
        });

        expect(result.type === Expression.type.division).toBeTruthy();
    });

    it('can evaluate a derivative of general formula 17 of derivative rules', function () {
        var d = Expression.derivative(Expression.sin('x'), 1, null, 'x');

        var result = Evaluator.evaluate(d, {
            strategy: function (rules) {
                return rules.where(function (x) {
                    return x.rule.name() === Expression.RuleType.Derivation.GeneralFormula17a;
                });
            }
        });

        expect(result.type === Expression.type.cos).toBeTruthy();
    });

    it('can evalute a derivative of general formula 18 of derivative rules ', function () {
        var d = Expression.derivative(Expression.cos('x'), 1, null, 'x');

        var result = Evaluator.evaluate(d, {
            strategy: function (rules) {
                return rules.where(function (x) {
                    return x.rule.name() === Expression.RuleType.Derivation.GeneralFormula18a;
                });
            }
        });

        expect(result.latex() === '-1\\cos (x)').toBeTruthy();
        expect(result.type === Expression.type.multiplication).toBeTruthy();
    });


    it('can evalute a derivative of general formula 19 of derivative rules ', function () {
        var d = Expression.derivative(Expression.tan('x'), 1, null, 'x');

        var result = Evaluator.evaluate(d, {
            strategy: function (rules) {
                return rules.where(function (x) {
                    return x.rule.name() === Expression.RuleType.Derivation.GeneralFormula19a;
                });
            }
        });

        expect(result.type === Expression.type.power).toBeTruthy();
    });

    it('can evalutate a derivative of general formula 20 of derivative rules ', function () {
        var d = Expression.derivative(Expression.cot('x'), 1, null, 'x');

        var result = Evaluator.evaluate(d, {
            strategy: function (rules) {
                return rules.where(function (x) {
                    return x.rule.name() === Expression.RuleType.Derivation.GeneralFormula20a;
                });
            }
        });

        expect(result.type === Expression.type.multiplication).toBeTruthy();
    });


    it('can evalutate a derivative of general formula 21 of derivative rules ', function () {
        var d = Expression.derivative(Expression.csc('x'), 1, null, 'x');

        var result = Evaluator.evaluate(d, {
            strategy: function (rules) {
                return rules.where(function (x) {
                    return x.rule.name() === Expression.RuleType.Derivation.GeneralFormula21a;
                });
            }
        });

        expect(result.type === Expression.type.multiplication).toBeTruthy();
    });


    it('can evalutate a derivative of general formula 22 of derivative rules ', function () {
        var d = Expression.derivative(Expression.sec('x'), 1, null, 'x');

        var result = Evaluator.evaluate(d, {
            strategy: function (rules) {
                return rules.where(function (x) {
                    return x.rule.name() === Expression.RuleType.Derivation.GeneralFormula22a;
                });
            }
        });

        expect(result.type === Expression.type.multiplication).toBeTruthy();
    });


    it('can evalutate a derivative of general formula 23 of derivative rules ', function () {
        var d = Expression.derivative(Expression.power(Expression.sin('x'), -1), 1, null, 'x');

        var result = Evaluator.evaluate(d, {
            strategy: function (rules) {
                return rules.where(function (x) {
                    return x.rule.name() === Expression.RuleType.Derivation.GeneralFormula23a;
                });
            }
        });

        expect(result.type === Expression.type.division).toBeTruthy();
    });


    it('can evalutate a derivative of general formula 24 of derivative rules ', function () {
        var d = Expression.derivative(Expression.power(Expression.cos('x'), -1), 1, null, 'x');

        var result = Evaluator.evaluate(d, {
            strategy: function (rules) {
                return rules.where(function (x) {
                    return x.rule.name() === Expression.RuleType.Derivation.GeneralFormula24a;
                });
            }
        });

        expect(result.type === Expression.type.division).toBeTruthy();
    });

    it('can evalutate a derivative of general formula 25 of derivative rules ', function () {
        var d = Expression.derivative(Expression.power(Expression.tan('x'), -1), 1, null, 'x');

        var result = Evaluator.evaluate(d, {
            strategy: function (rules) {
                return rules.where(function (x) {
                    return x.rule.name() === Expression.RuleType.Derivation.GeneralFormula25a;
                });
            }
        });

        expect(result.type === Expression.type.division).toBeTruthy();
    });

    it('can evalutate a derivative of general formula 26 of derivative rules ', function () {
        var d = Expression.derivative(Expression.power(Expression.cot('x'), -1), 1, null, 'x');

        var result = Evaluator.evaluate(d, {
            strategy: function (rules) {
                return rules.where(function (x) {
                    return x.rule.name() === Expression.RuleType.Derivation.GeneralFormula26a;
                });
            }
        });

        expect(result.type === Expression.type.multiplication).toBeTruthy();
    });


    it('can evalutate a derivative of general formula 27 of derivative rules ', function () {
        var d = Expression.derivative(Expression.power(Expression.csc('x'), -1), 1, null, 'x');

        var result = Evaluator.evaluate(d, {
            strategy: function (rules) {
                return rules.where(function (x) {
                    return x.rule.name() === Expression.RuleType.Derivation.GeneralFormula27a;
                });
            }
        });

        expect(result.type === Expression.type.multiplication).toBeTruthy();
    });


    it('can evalutate a derivative of general formula 28 of derivative rules ', function () {
        var d = Expression.derivative(Expression.power(Expression.sec('x'), -1), 1, null, 'x');

        var result = Evaluator.evaluate(d, {
            strategy: function (rules) {
                return rules.where(function (x) {
                    return x.rule.name() === Expression.RuleType.Derivation.GeneralFormula28a;
                });
            }
        });

        expect(result.type === Expression.type.division).toBeTruthy();

    });


    it('can evalutate a derivative of general formula 29 of derivative rules ', function () {
        var d = Expression.derivative(Expression.sinh('x'), 1, null, 'x');

        var result = Evaluator.evaluate(d, {
            strategy: function (rules) {
                return rules.where(function (x) {
                    return x.rule.name() === Expression.RuleType.Derivation.GeneralFormula29a;
                });
            }
        });

        expect(result.type === Expression.type.cosh).toBeTruthy();

    });

    it('can evalutate a derivative of general formula 30 of derivative rules ', function () {
        var d = Expression.derivative(Expression.cosh('x'), 1, null, 'x');

        var result = Evaluator.evaluate(d, {
            strategy: function (rules) {
                return rules.where(function (x) {
                    return x.rule.name() === Expression.RuleType.Derivation.GeneralFormula30a;
                });
            }
        });

        expect(result.type === Expression.type.sinh).toBeTruthy();

    });

    it('can evalutate a derivative of general formula 31 of derivative rules ', function () {
        var d = Expression.derivative(Expression.tanh('x'), 1, null, 'x');

        var result = Evaluator.evaluate(d, {
            strategy: function (rules) {
                return rules.where(function (x) {
                    return x.rule.name() === Expression.RuleType.Derivation.GeneralFormula31a;
                });
            }
        });

        expect(result.type === Expression.type.sech).toBeTruthy();

    });

    it('can evalutate a derivative of general formula 32 of derivative rules ', function () {
        var d = Expression.derivative(Expression.coth('x'), 1, null, 'x');

        var result = Evaluator.evaluate(d, {
            strategy: function (rules) {
                return rules.where(function (x) {
                    return x.rule.name() === Expression.RuleType.Derivation.GeneralFormula32a;
                });
            }
        });

        expect(result.type === Expression.type.multiplication).toBeTruthy();

    });

    it('can evalutate a derivative of general formula 33 of derivative rules ', function () {
        var d = Expression.derivative(Expression.csch('x'), 1, null, 'x');

        var result = Evaluator.evaluate(d, {
            strategy: function (rules) {
                return rules.where(function (x) {
                    return x.rule.name() === Expression.RuleType.Derivation.GeneralFormula33a;
                });
            }
        });

        expect(result.type === Expression.type.multiplication).toBeTruthy();

    });

    it('can evalutate a derivative of general formula 34 of derivative rules ', function () {
        var d = Expression.derivative(Expression.sech('x'), 1, null, 'x');

        var result = Evaluator.evaluate(d, {
            strategy: function (rules) {
                return rules.where(function (x) {
                    return x.rule.name() === Expression.RuleType.Derivation.GeneralFormula34a;
                });
            }
        });

        expect(result.type === Expression.type.multiplication).toBeTruthy();

    });



    it('can evalutate a derivative of general formula 35 of derivative rules ', function () {
        var d = Expression.derivative(Expression.power(Expression.sinh('x'), -1), 1, null, 'x');

        var result = Evaluator.evaluate(d, {
            strategy: function (rules) {
                return rules.where(function (x) {
                    return x.rule.name() === Expression.RuleType.Derivation.GeneralFormula35a;
                });
            }
        });

        expect(result.type === Expression.type.division).toBeTruthy();
    });

    it('can evalutate a derivative of general formula 36 of derivative rules ', function () {
        var d = Expression.derivative(Expression.power(Expression.cosh('x'), -1), 1, null, 'x');

        var result = Evaluator.evaluate(d, {
            strategy: function (rules) {
                return rules.where(function (x) {
                    return x.rule.name() === Expression.RuleType.Derivation.GeneralFormula36a;
                });
            }
        });

        expect(result.type === Expression.type.division).toBeTruthy();
    });


    it('can evalutate a derivative of general formula 37 of derivative rules ', function () {
        var d = Expression.derivative(Expression.power(Expression.tanh('x'), -1), 1, null, 'x');
        var called;
        var result = Evaluator.evaluate(d, {
            strategy: function (rules) {
                return rules.where(function (x) {
                    called = true;
                    return x.rule.name() === Expression.RuleType.Derivation.GeneralFormula37a;
                });
            }
        });
        expect(called).toBeTruthy();
        expect(result.type === Expression.type.division).toBeTruthy();
    });

    it('can evalutate a derivative of general formula 38 of derivative rules ', function () {
        var d = Expression.derivative(Expression.power(Expression.coth('x'), -1), 1, null, 'x');

        var result = Evaluator.evaluate(d, {
            strategy: function (rules) {
                return rules.where(function (x) {
                    return x.rule.name() === Expression.RuleType.Derivation.GeneralFormula38a;
                });
            }
        });

        expect(result.type === Expression.type.division).toBeTruthy();
    });


    it('can evalutate a derivative of general formula 39 of derivative rules ', function () {
        var d = Expression.derivative(Expression.power(Expression.csch('x'), -1), 1, null, 'x');

        var result = Evaluator.evaluate(d, {
            strategy: function (rules) {
                return rules.where(function (x) {
                    return x.rule.name() === Expression.RuleType.Derivation.GeneralFormula39a;
                });
            }
        });

        expect(result.type === Expression.type.multiplication).toBeTruthy();
    });


    it('can evalutate a derivative of general formula 40 of derivative rules ', function () {
        var d = Expression.derivative(Expression.power(Expression.sech('x'), -1), 1, null, 'x');
        var called;
        var result = Evaluator.evaluate(d, {
            strategy: function (rules) {
                return rules.where(function (x) {
                    called = true;
                    return x.rule.name() === Expression.RuleType.Derivation.GeneralFormula40a;
                });
            }
        });
        expect(called).toBeTruthy();
        expect(result.type === Expression.type.multiplication).toBeTruthy();

    });


    it('can evalutate an integral of general formula 12 of integral rules ', function () {
        var d = Expression.integral(Expression.tan('x'), 'x');
        var called;
        var result = Evaluator.evaluate(d, {
            strategy: function (rules) {
                return rules.where(function (x) {
                    called = true;
                    return x.rule.name() === Expression.RuleType.Integration.IGeneralFormula12a;
                });
            }
        });
        //expect(called).toBeTruthy();
        expect(result.type === Expression.type.addition).toBeTruthy();
        expect(Expression.matchRule(result, Expression.Rules.Integration.IGeneralFormula12b())).toBeTruthy();;
    });

    it('can evalutate an integral of general formula 13 of integral rules ', function () {
        var d = Expression.integral(Expression.cot('x'), 'x');
        var called;
        var result = Evaluator.evaluate(d, {
            strategy: function (rules) {
                return rules.where(function (x) {
                    called = true;
                    return x.rule.name() === Expression.RuleType.Integration.IGeneralFormula13a;
                });
            }
        });
        //expect(called).toBeTruthy();
        expect(result.type === Expression.type.addition).toBeTruthy();
        expect(Expression.matchRule(result, Expression.Rules.Integration.IGeneralFormula13b())).toBeTruthy();;
    });


    it('can evalutate an integral of general formula 14 of integral rules ', function () {
        var d = Expression.integral(Expression.power(Expression.sec('x'), 2), 'x');
        var called;
        var result = Evaluator.evaluate(d, {
            strategy: function (rules) {
                return rules.where(function (x) {
                    called = true;
                    return x.rule.name() === Expression.RuleType.Integration.IGeneralFormula14a;
                });
            }
        });

        expect(Expression.matchRule(result, Expression.Rules.Integration.IGeneralFormula14b())).toBeTruthy();
    });


    it('can evalutate an integral of general formula 15 of integral rules ', function () {
        var d = Expression.integral(Expression.power(Expression.csc('x'), 2), 'x');
        var called;
        var result = Evaluator.evaluate(d, {
            strategy: function (rules) {
                return rules.where(function (x) {
                    called = true;
                    return x.rule.name() === Expression.RuleType.Integration.IGeneralFormula15a;
                });
            }
        });
        //expect(called).toBeTruthy();
        expect(Expression.matchRule(result, Expression.Rules.Integration.IGeneralFormula15b())).toBeTruthy();;
    });


    it('can evalutate an integral of general formula 16 of integral rules ', function () {
        var d = Expression.integral(Expression.power(Expression.tan('x'), 2), 'x');
        var called;
        var result = Evaluator.evaluate(d, {
            strategy: function (rules) {
                return rules.where(function (x) {
                    called = true;
                    return x.rule.name() === Expression.RuleType.Integration.IGeneralFormula16a;
                });
            }
        });
        //expect(called).toBeTruthy();
        expect(Expression.matchRule(result, Expression.Rules.Integration.IGeneralFormula16b())).toBeTruthy();;
    });

    it('can evalutate an integral of general formula 17 of integral rules ', function () {
        var d = Expression.integral(Expression.power(Expression.cot('x'), 2), 'x');
        var called;
        var result = Evaluator.evaluate(d, {
            strategy: function (rules) {
                return rules.where(function (x) {
                    called = true;
                    return x.rule.name() === Expression.RuleType.Integration.IGeneralFormula17a;
                });
            }
        });
        //expect(called).toBeTruthy();
        expect(Expression.matchRule(result, Expression.Rules.Integration.IGeneralFormula17b())).toBeTruthy();;
    });

    it('can evalutate an integral of general formula 18 of integral rules ', function () {
        var d = Expression.integral(Expression.multiplication(Expression.sec('x'), Expression.tan('x')), 'x');
        var called;
        var result = Evaluator.evaluate(d, {
            strategy: function (rules) {
                return rules.where(function (x) {
                    called = true;
                    return x.rule.name() === Expression.RuleType.Integration.IGeneralFormula18a;
                });
            }
        });
        //expect(called).toBeTruthy();
        expect(Expression.matchRule(result, Expression.Rules.Integration.IGeneralFormula18b())).toBeTruthy();;
    });

    it('can evalutate an integral of general formula 18 of integral rules ', function () {
        var d = Expression.integral(Expression.multiplication(Expression.sec(Expression.multiplication(2, 'x')), Expression.tan('x')), 'x');
        var called;
        var result = Evaluator.evaluate(d, {
            strategy: function (rules) {
                return rules.where(function (x) {
                    called = true;
                    return x.rule.name() === Expression.RuleType.Integration.IGeneralFormula18a;
                });
            }
        });
        //expect(called).toBeTruthy();
        expect(!Expression.matchRule(result, Expression.Rules.Integration.IGeneralFormula18b())).toBeTruthy();;
    });



    it('can evalutate an integral of general formula 19 of integral rules ', function () {
        var d = Expression.integral(Expression.multiplication(Expression.csc('x'), Expression.cot('x')), 'x');
        var called;
        var result = Evaluator.evaluate(d, {
            strategy: function (rules) {
                return rules.where(function (x) {
                    called = true;
                    return x.rule.name() === Expression.RuleType.Integration.IGeneralFormula19a;
                });
            }
        });
        //expect(called).toBeTruthy();
        expect(Expression.matchRule(result, Expression.Rules.Integration.IGeneralFormula19b())).toBeTruthy();;
    });

    it('can evalutate an integral of general formula 19 of integral rules ', function () {
        var d = Expression.integral(Expression.multiplication(Expression.csc(Expression.multiplication(2, 'x')), Expression.cot('x')), 'x');
        var called;
        var result = Evaluator.evaluate(d, {
            strategy: function (rules) {
                return rules.where(function (x) {
                    called = true;
                    return x.rule.name() === Expression.RuleType.Integration.IGeneralFormula19a;
                });
            }
        });
        //expect(called).toBeTruthy();
        expect(!Expression.matchRule(result, Expression.Rules.Integration.IGeneralFormula19b())).toBeTruthy();;
    });

    it('can evalutate an integral of general formula 20 of integral rules ', function () {
        var d = Expression.integral(Expression.sec('x'), 'x');
        var called;
        var result = Evaluator.evaluate(d, {
            strategy: function (rules) {
                return rules.where(function (x) {
                    called = true;
                    return x.rule.name() === Expression.RuleType.Integration.IGeneralFormula20a;
                });
            }
        });
        //expect(called).toBeTruthy();
        expect(Expression.matchRule(result, Expression.Rules.Integration.IGeneralFormula20b())).toBeTruthy();;
    });

    it('can evalutate an integral of general formula 21 of integral rules ', function () {
        var d = Expression.integral(Expression.csc('x'), 'x');
        var called;
        var result = Evaluator.evaluate(d, {
            strategy: function (rules) {
                return rules.where(function (x) {
                    called = true;
                    return x.rule.name() === Expression.RuleType.Integration.IGeneralFormula21a;
                });
            }
        });
        //expect(called).toBeTruthy();
        expect(Expression.matchRule(result, Expression.Rules.Integration.IGeneralFormula21b())).toBeTruthy();;
    });

    it('can evalutate an integral of general formula 24 of integral rules ', function () {
        var d = Expression.integral(Expression.power(Expression.sin('x'), 2), Expression.variable('x'));
        var called;
        var result = Evaluator.evaluate(d, {
            strategy: function (rules) {
                return rules.where(function (x) {
                    called = true;
                    return x.rule.name() === Expression.RuleType.Integration.IGeneralFormula24a;
                });
            }
        });
        //expect(called).toBeTruthy();
        expect(result.latex()).toBe('-11 / 2\\sin (x)\\cos (x) + 1 / 2(-1\\cos (x) + c)');;
    });


    it('can evalutate an integral of general formula 25 of integral rules ', function () {
        var d = Expression.integral(Expression.power(Expression.cos('x'), 2), Expression.variable('x'));
        var called;
        var result = Evaluator.evaluate(d, {
            strategy: function (rules) {
                return rules.where(function (x) {
                    called = true;
                    return x.rule.name() === Expression.RuleType.Integration.IGeneralFormula25a;
                });
            }
        });
        //expect(called).toBeTruthy();
        console.log(result.latex())

        expect(result.latex()).toBe('1 / 2\\cos (x)\\sin (x) + 1 / 2(\\sin (x) + c)');
    });


    it('can evalutate an integral of general formula 26 of integral rules ', function () {
        var d = Expression.integral(Expression.sinh('x'), Expression.variable('x'));
        var called;
        var result = Evaluator.evaluate(d, {
            strategy: function (rules) {
                return rules.where(function (x) {
                    called = true;
                    return x.rule.name() === Expression.RuleType.Integration.IGeneralFormula26a;
                });
            }
        });
        //expect(called).toBeTruthy();
        expect(Expression.matchRule(result, Expression.Rules.Integration.IGeneralFormula26b())).toBeTruthy();;

    });


    it('can evalutate an integral of general formula 27 of integral rules ', function () {
        var d = Expression.integral(Expression.cosh('x'), Expression.variable('x'));
        var called;
        var result = Evaluator.evaluate(d, {
            strategy: function (rules) {
                return rules.where(function (x) {
                    called = true;
                    return x.rule.name() === Expression.RuleType.Integration.IGeneralFormula27a;
                });
            }
        });
        //expect(called).toBeTruthy();
        expect(Expression.matchRule(result, Expression.Rules.Integration.IGeneralFormula27b())).toBeTruthy();;

    });

    it('can evalutate an integral of general formula 28 of integral rules ', function () {
        var d = Expression.integral(Expression.tanh('x'), Expression.variable('x'));
        var called;
        var result = Evaluator.evaluate(d, {
            strategy: function (rules) {
                return rules.where(function (x) {
                    called = true;
                    return x.rule.name() === Expression.RuleType.Integration.IGeneralFormula28a;
                });
            }
        });
        //expect(called).toBeTruthy();
        expect(Expression.matchRule(result, Expression.Rules.Integration.IGeneralFormula28b())).toBeTruthy();;

    });

    it('can evalutate an integral of general formula 29 of integral rules ', function () {
        var d = Expression.integral(Expression.coth('x'), Expression.variable('x'));
        var called;
        var result = Evaluator.evaluate(d, {
            strategy: function (rules) {
                return rules.where(function (x) {
                    called = true;
                    return x.rule.name() === Expression.RuleType.Integration.IGeneralFormula29a;
                });
            }
        });
        //expect(called).toBeTruthy();
        expect(Expression.matchRule(result, Expression.Rules.Integration.IGeneralFormula29b())).toBeTruthy();;

    });

    it('can evalutate an integral of general formula 30 of integral rules ', function () {
        var d = Expression.integral(Expression.sech('x'), Expression.variable('x'));
        var called;
        var result = Evaluator.evaluate(d, {
            strategy: function (rules) {
                return rules.where(function (x) {
                    called = true;
                    return x.rule.name() === Expression.RuleType.Integration.IGeneralFormula30a;
                });
            }
        });
        //expect(called).toBeTruthy();
        expect(Expression.matchRule(result, Expression.Rules.Integration.IGeneralFormula30b())).toBeTruthy();;
    });

    it('can evalutate an integral of general formula 31 of integral rules ', function () {
        var d = Expression.integral(Expression.csch('x'), Expression.variable('x'));
        var called;
        var result = Evaluator.evaluate(d, {
            strategy: function (rules) {
                return rules.where(function (x) {
                    called = true;
                    return x.rule.name() === Expression.RuleType.Integration.IGeneralFormula31a;
                });
            }
        });
        //expect(called).toBeTruthy();
        expect(Expression.matchRule(result, Expression.Rules.Integration.IGeneralFormula31b())).toBeTruthy();;
    });

    it('can evalutate an integral of general formula 32 of integral rules ', function () {
        var d = Expression.integral(Expression.power(Expression.sech('x'), 2), Expression.variable('x'));
        var called;
        var result = Evaluator.evaluate(d, {
            strategy: function (rules) {
                return rules.where(function (x) {
                    called = true;
                    return x.rule.name() === Expression.RuleType.Integration.IGeneralFormula32a;
                });
            }
        });
        //expect(called).toBeTruthy();
        expect(Expression.matchRule(result, Expression.Rules.Integration.IGeneralFormula32b())).toBeTruthy();;
    });

    it('can evalutate an integral of general formula 33 of integral rules ', function () {
        var d = Expression.integral(Expression.power(Expression.csch('x'), 2), Expression.variable('x'));
        var called;
        var result = Evaluator.evaluate(d, {
            strategy: function (rules) {
                return rules.where(function (x) {
                    called = true;
                    return x.rule.name() === Expression.RuleType.Integration.IGeneralFormula33a;
                });
            }
        });
        //expect(called).toBeTruthy();
        expect(Expression.matchRule(result, Expression.Rules.Integration.IGeneralFormula33b())).toBeTruthy();;
    });

    it('can evalutate an integral of general formula 34 of integral rules ', function () {
        var d = Expression.integral(Expression.power(Expression.tanh('x'), 2), Expression.variable('x'));
        var called;
        var result = Evaluator.evaluate(d, {
            strategy: function (rules) {
                return rules.where(function (x) {
                    called = true;
                    return x.rule.name() === Expression.RuleType.Integration.IGeneralFormula34a;
                });
            }
        });
        //expect(called).toBeTruthy();
        expect(Expression.matchRule(result, Expression.Rules.Integration.IGeneralFormula34b())).toBeTruthy();;
    });


    it('can evalutate an integral of general formula 35 of integral rules ', function () {
        var d = Expression.integral(Expression.power(Expression.coth('x'), 2), Expression.variable('x'));
        var called;
        var result = Evaluator.evaluate(d, {
            strategy: function (rules) {
                return rules.where(function (x) {
                    called = true;
                    return x.rule.name() === Expression.RuleType.Integration.IGeneralFormula35a;
                });
            }
        });
        //expect(called).toBeTruthy();
        expect(Expression.matchRule(result, Expression.Rules.Integration.IGeneralFormula35b())).toBeTruthy();;
    });



    it('can evalutate an integral of general formula 36 of integral rules ', function () {
        var d = Expression.integral(Expression.multiplication(Expression.sech('x'), Expression.tanh('x')), Expression.variable('x'));
        var called;
        var result = Evaluator.evaluate(d, {
            strategy: function (rules) {
                return rules.where(function (x) {
                    called = true;
                    return x.rule.name() === Expression.RuleType.Integration.IGeneralFormula36a;
                });
            }
        });
        //expect(called).toBeTruthy();
        expect(Expression.matchRule(result, Expression.Rules.Integration.IGeneralFormula36b())).toBeTruthy();;
    });

    it('can evalutate an integral of general formula 37 of integral rules ', function () {
        var d = Expression.integral(Expression.multiplication(Expression.csch('x'), Expression.coth('x')), Expression.variable('x'));
        var called;
        var result = Evaluator.evaluate(d, {
            strategy: function (rules) {
                return rules.where(function (x) {
                    called = true;
                    return x.rule.name() === Expression.RuleType.Integration.IGeneralFormula37a;
                });
            }
        });
        //expect(called).toBeTruthy();
        expect(Expression.matchRule(result, Expression.Rules.Integration.IGeneralFormula37b())).toBeTruthy();;
    });

    it('can evalutate an integral of general formula 38 of integral rules ', function () {
        var d = Expression.integral(Expression.power(Expression.sinh('x'), 2), Expression.variable('x'));
        var called;
        var result = Evaluator.evaluate(d, {
            strategy: function (rules) {
                return rules.where(function (x) {
                    called = true;
                    return x.rule.name() === Expression.RuleType.Integration.IGeneralFormula38a;
                });
            }
        });
        //expect(called).toBeTruthy();
        expect(Expression.matchRule(result, Expression.Rules.Integration.IGeneralFormula38b())).toBeTruthy();;
    });


    it('can evalutate an integral of general formula 39 of integral rules ', function () {
        var d = Expression.integral(Expression.power(Expression.cosh('x'), 2), Expression.variable('x'));
        var called;
        var result = Evaluator.evaluate(d, {
            strategy: function (rules) {
                return rules.where(function (x) {
                    called = true;
                    return x.rule.name() === Expression.RuleType.Integration.IGeneralFormula39a;
                });
            }
        });
        //expect(called).toBeTruthy();
        expect(Expression.matchRule(result, Expression.Rules.Integration.IGeneralFormula39b())).toBeTruthy();;
    });


    it('can evalutate an integral of general formula 40 of integral rules ', function () {
        var d = Expression.integral(Expression.e('x'), Expression.variable('x'));
        var called;
        var result = Evaluator.evaluate(d, {
            strategy: function (rules) {
                return rules.where(function (x) {
                    called = true;
                    return x.rule.name() === Expression.RuleType.Integration.IGeneralFormula40a;
                });
            }
        });
        //expect(called).toBeTruthy();
        expect(Expression.matchRule(result, Expression.Rules.Integration.IGeneralFormula40b())).toBeTruthy();;
    });

    it('can evalutate an integral of general formula 41 of integral rules ', function () {
        var d = Expression.integral(Expression.power('a', 'x'), Expression.variable('x'));
        var called;
        var result = Evaluator.evaluate(d, {
            strategy: function (rules) {
                return rules.where(function (x) {
                    called = true;
                    return x.rule.name() === Expression.RuleType.Integration.IGeneralFormula41a;
                });
            }
        });
        //expect(called).toBeTruthy();
        expect(Expression.matchRule(result, Expression.Rules.Integration.IGeneralFormula41b())).toBeTruthy();;
    });


    it('can evalutate an integral of general formula 42 of integral rules ', function () {
        var d = Expression.integral(Expression.ln('x'), Expression.variable('x'));
        var called;
        var result = Evaluator.evaluate(d, {
            strategy: function (rules) {
                return rules.where(function (x) {
                    called = true;
                    return x.rule.name() === Expression.RuleType.Integration.IGeneralFormula42a;
                });
            }
        });
        //expect(called).toBeTruthy();
        
        expect(result.latex()).toBe('x-1 - -1\\ln x + c');
        //expect(Expression.matchRule(result, Expression.Rules.Integration.IGeneralFormula42b())).toBeTruthy();;
    });



    it('can evalutate an integral of general formula 43 of integral rules ', function () {
        var d = Expression.integral(Expression.log('x', 'a'), Expression.variable('x'));
        var called;
        var result = Evaluator.evaluate(d, {
            strategy: function (rules) {
                return rules.where(function (x) {
                    called = true;
                    return x.rule.name() === Expression.RuleType.Integration.IGeneralFormula43a;
                });
            }
        });
        //expect(called).toBeTruthy();
        expect(result.latex()).toBe("x / \\ln a-1 - -1\\ln x + c");
        // expect(Expression.matchRule(result, Expression.Rules.Integration.IGeneralFormula43b())).toBeTruthy();;
    });


    it('can evalutate an integral of general formula 44 of integral rules ', function () {
        var d = Expression.integral(Expression.multiplication('x', Expression.e(Expression.multiplication('a', 'x'))), Expression.variable('x'));
        var called;
        var result = Evaluator.evaluate(d, {
            strategy: function (rules) {
                return rules.where(function (x) {
                    called = true;
                    return x.rule.name() === Expression.RuleType.Integration.IGeneralFormula44a;
                });
            }
        });
        //expect(called).toBeTruthy();
        result.latex();
        expect(Expression.matchRule(result, Expression.Rules.Integration.IGeneralFormula44b())).toBeTruthy();;
    });


    it('can evalutate an integral of general formula 45 of integral rules ', function () {
        var d = Expression.integral(Expression.division(
            Expression.e(Expression.multiplication('a', 'x')), 'x'), Expression.variable('x'));
        var called;
        var result = Evaluator.evaluate(d, {
            strategy: function (rules) {
                return rules.where(function (x) {
                    called = true;
                    return x.rule.name() === Expression.RuleType.Integration.IGeneralFormula45a;
                });
            }
        });
        //expect(called).toBeTruthy();
        expect(Expression.matchRule(result, Expression.Rules.Integration.IGeneralFormula45b())).toBeTruthy();;
    });


    it('can evalutate an integral of general formula 45 of integral rules ', function () {
        var d = Expression.integral(Expression.division('x', Expression.e(Expression.multiplication('a', 'x'))), Expression.variable('x'));
        var called;
        var result = Evaluator.evaluate(d, {
            strategy: function (rules) {
                return rules.where(function (x) {
                    called = true;
                    return x.rule.name() === Expression.RuleType.Integration.IGeneralFormula45a;
                });
            }
        });
        //expect(called).toBeTruthy();
        expect(!Expression.matchRule(result, Expression.Rules.Integration.IGeneralFormula45b())).toBeTruthy();;
    });


    it('can evalutate an integral of general formula 47 of integral rules ', function () {
        var d = Expression.integral(Expression.multiplication(
                    Expression.power('x', '3'),
                    Expression.e(Expression.multiplication('a', 'x'))
                ), Expression.variable('x'));
        var called;
        var result = Evaluator.evaluate(d, {
            strategy: function (rules) {
                return rules.where(function (x) {
                    called = true;
                    return x.rule.name() === Expression.RuleType.Integration.IGeneralFormula47a;
                });
            }
        });
        //expect(called).toBeTruthy();
        console.log(result.latex());
        expect(result.latex()).toBe('e^ax1 / ax^{3} - e^ax1 / ax^{2} - 2 / a(e^a / a^{2}-1 - -1ax + c)3 / a');
        //expect(Expression.matchRule(result, Expression.Rules.Integration.IGeneralFormula47b())).toBeTruthy();;
    });


    it('can evalutate an integral of general formula 48 of integral rules ', function () {
        var d = Expression.integral(Expression.division(
                    Expression.e(Expression.multiplication('a', 'x')),
                    Expression.power('x', '2')
                ), Expression.variable('x'));
        var called;
        var result = Evaluator.evaluate(d, {
            strategy: function (rules) {
                return rules.where(function (x) {
                    called = true;
                    return x.rule.name() === Expression.RuleType.Integration.IGeneralFormula48a;
                });
            }
        });
        //expect(called).toBeTruthy();
        expect(result.latex()).toBe('(-1e^ax / x + a(\\ln |x| + \\displaystyle\\sum_{i=1}^{Infinity} ax^{i} / i! + c)) + c');
        //expect(Expression.matchRule(result, Expression.Rules.Integration.IGeneralFormula48b())).toBeTruthy();;
    });

    it('can evalutate an integral of general formula 48 of integral rules ', function () {
        var d = Expression.integral(Expression.division(
                    Expression.power('x', '2'),
                    Expression.e(Expression.multiplication('a', 'x'))
                ), Expression.variable('x'));
        var called;
        var result = Evaluator.evaluate(d, {
            strategy: function (rules) {
                return rules.where(function (x) {
                    called = true;
                    return x.rule.name() === Expression.RuleType.Integration.IGeneralFormula48a;
                });
            }
        });
        //expect(called).toBeTruthy();
        console.log(result.latex());
        expect(!Expression.matchRule(result, Expression.Rules.Integration.IGeneralFormula48b())).toBeTruthy();;
    });

    it('can evaluate a subtraction', function () {
        var result = Evaluator.evaluate(Expression.subtraction(5, 4));

        expect(result.partOrDefault(Expression.type.variable)).toBe(1);
    });


    it('can evaluate a subtraction', function () {
        var result = Evaluator.evaluate(Expression.subtraction(Expression.subtraction(5, 4), 4));

        expect(result.partOrDefault(Expression.type.variable)).toBe(-3);
    });

    it('can evalutate an integral of general formula 49 of integral rules ', function () {
        var d = Expression.integral(Expression.multiplication(
                Expression.power('x','n'),
                Expression.ln('x')
            ), Expression.variable('x'));

        var called;
        var result = Evaluator.evaluate(d, {
            strategy: function (rules) {
                return rules.where(function (x) {
                    called = true;
                    return x.rule.name() === Expression.RuleType.Integration.IGeneralFormula49a;
                });
            }
        });

        expect(Expression.matchRule(result, Expression.Rules.Integration.IGeneralFormula49b())).toBeTruthy();;

    });

    it('can evaluate a derivative with the chain rule correctly', function () {
        var d = Expression.derivative(Expression.cos(Expression.sin('x')), 1, null, Expression.variable('x'));
        var called;
        var result = Evaluator.evaluate(d, {
            strategy: function (rules) {
                return rules.where(function (x) {
                    called = true;
                    return x.rule.name() === Expression.RuleType.Derivation.ChainRuleA;
                });
            }
        });
        console.log(result.latex());
        expect(result.latex()).toBe('-1\\cos (\\sin (x))\\cos (x)');;
    });
});
