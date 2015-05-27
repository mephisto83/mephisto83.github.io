describe("MEPH/math/Expression.spec.js", function () {
    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });
    var printExpressionToScreen = function (result) {
        //return MEPH.requires('MEPH.math.jax.MathJax', 'MEPH.math.Expression').then(function () {
        //    return MEPHJax.ready().then(function () {
        //        var dom = document.createElement('div');
        //        document.body.appendChild(dom);
        //        return MEPHJax.load(result.latex(), dom)
        //    });
        //})
    };
    it('match rule Integration(a*f(x)) dx === Integration(a (g(x) + f(x)) dx, and marks the expression, then' +
        'translate a Integration(a (g(x) + f(x)) dx => a * Integration((g(x) + f(x)) dx ', function (done) {
            MEPH.requires('MEPH.math.Expression').then(function ($class) {
                var Expression = MEPH.math.Expression;
                var rule1 = Expression.Rules.Integration.IntegralConstMultiply();
                var rule2 = Expression.Rules.Integration.MultiplyIntegralofFx();

                var expression = Expression.integral(
                                    Expression.multiplication(
                                        Expression.variable('a'),
                                        Expression.addition(
                                            Expression.func('g', 'x'),
                                            Expression.func('f', 'x')
                                        )),
                                'x');

                var rule = Expression.matchRule(expression, rule1, true);

                var transformation = {
                    transformation: {
                        from: Expression.RuleType.IntegralConstMultiply,
                        to: Expression.RuleType.MultiplyIntegralofFx
                    },
                    C: 'C',
                    A: 'A'
                };
                var rule = Expression.matchRule(expression, Expression.Rules.Integration.IntegralConstMultiply(), true);
                var result = Expression.translation.Transform(transformation, expression, rule2);
                expect(result).toBeTruthy();

            }).catch(function () {
                expect(new Error('something went wrong while creating an expression')).caught();
            }).then(function (x) {
                done();
            });
        });
    it('can translate integralConstMultiply ', function (done) {
        MEPH.requires('MEPH.math.Expression').then(function ($class) {
            var Expression = MEPH.math.Expression;

            var rule1 = Expression.Rules.Integration.IntegralConstMultiply();
            var rule2 = Expression.Rules.Integration.MultiplyIntegralofFx();

            var expression = Expression.integral(
                                Expression.multiplication(
                                    Expression.variable('a'),
                                    Expression.addition(
                                        Expression.func('g', 'x'),
                                        Expression.func('f', 'x')
                                    )),
                            'x');
            expression.name(Expression.Rules.Integration.IntegralConstMultiply().name());
            var rule = Expression.matchRule(expression, rule1, true);
            var result = Expression.translation.Translate(expression, rule2);
            var matches = Expression.matchRule(result, rule2);
            expect(matches).toBeTruthy();
        }).catch(function () {
            expect(new Error('something went wrong while creating an expression')).caught();
        }).then(function (x) {
            done();
        });
    });

    it('translate a Power => PowerIntegrate ', function (done) {
        MEPH.requires('MEPH.math.Expression').then(function ($class) {
            var Expression = MEPH.math.Expression;
            var expression = Expression.Rules.Integration.IntegrationAddition();
            var rule1 = Expression.Rules.Integration.Power();
            var rule2 = Expression.Rules.Integration.PowerIntegrate();

            var transformation = {
                transformation: {
                    from: Expression.RuleType.PowerIntegrate,
                    to: Expression.RuleType.Power
                },
                n_pre: 'n',
                n_post: 'n',
                x: 'x'
            };
            var result = Expression.translation.Transform(transformation, rule1, rule2);
            console.log(result.latex());

            expect(result).toBeTruthy();
        }).catch(function () {
            expect(new Error('something went wrong while creating an expression')).caught();
        }).then(function (x) {
            done();
        });
    });
    it('can translate Power.', function (done) {
        MEPH.requires('MEPH.math.Expression').then(function ($class) {
            var Expression = MEPH.math.Expression;

            var rule1 = Expression.Rules.Integration.Power();
            var rule2 = Expression.Rules.Integration.PowerIntegrate();

            rule1.swap('n', Expression.variable('t'));

            rule1.name(Expression.Rules.Integration.Power().name());

            var result = Expression.translation.Translate(rule1, rule2);
            var matches = Expression.matchRule(result, rule2);
            expect(matches).toBeTruthy();
        }).catch(function () {
            expect(new Error('something went wrong while creating an expression')).caught();
        }).then(function (x) {
            done();
        });
    });



    it('get the repeating parts of int(u +/- v +/- w) -> u,v,w', function (done) {
        MEPH.requires('MEPH.math.Expression').then(function ($class) {
            var Expression = MEPH.math.Expression;
            var expression = Expression.integral(
                            Expression.addition(Expression.func('f', 'x'),
                                Expression.func('g', 'x'),
                                Expression.func('h', 'x')), 'x');
            var rule = Expression.matchRule(expression, Expression.Rules.Integration.IntegrationAddition(), true);

            var parts = expression.getMark('A').getRepeatParts();
            expect(parts.length).toBe(3);
        }).catch(function () {
            expect(new Error('something went wrong while creating an expression')).caught();
        }).then(function (x) {
            done();
        });
    });

    it('match int(u +/- v +/- w) -> int(u) +/- int(v) +/- int(w)', function (done) {
        MEPH.requires('MEPH.math.Expression').then(function ($class) {
            var Expression = MEPH.math.Expression;
            var expression = Expression.integral(
                            Expression.addition(Expression.func('f', 'x'),
                                Expression.func('g', 'x'),
                                Expression.func('h', 'x')), Expression.variable('x'));
            var rule2 = Expression.Rules.Integration.AdditionIntegral();
            var rule = Expression.matchRule(expression, Expression.Rules.Integration.IntegrationAddition(), true);
            expect(expression.getMarks().dx).toBeTruthy();
            var transformation = {
                repeat: {
                    A: {
                        target: 'A',

                        trans: {
                            transformation: {
                                from: Expression.RuleType.IntegrationAddition,
                                to: Expression.RuleType.AdditionIntegral
                            },
                            f: 'f'
                        }
                    },
                    dx: {
                        scatter: {
                            transformation: {
                                from: Expression.RuleType.IntegrationAddition,
                                to: Expression.RuleType.AdditionIntegral
                            },
                            dx: 'dx'
                        }
                    }
                },
                transform: {
                    from: 'A',
                    to: 'A'
                }
            };
            var result = Expression.translation.Transform(transformation, expression, rule2);
            console.log(result.latex());
            expect(result.getMarks().A.parts.length === 3).toBeTruthy();
            expect(result).toBeTruthy();
        }).catch(function () {
            expect(new Error('something went wrong while creating an expression')).caught();
        }).then(function (x) {
            done();
        });
    });


    it('match int(u +/- v +/- w) -> int(u) +/- int(v) +/- int(w)', function (done) {
        MEPH.requires('MEPH.math.Expression').then(function ($class) {
            var Expression = MEPH.math.Expression;
            var expression = Expression.integral(
                            Expression.addition(Expression.func('f', 'x'),
                                Expression.func('g', 'x'),
                                Expression.func('h', 'x')), Expression.variable('x'));
            var rule2 = Expression.Rules.Integration.AdditionIntegral();

            var rule = Expression.matchRule(expression, Expression.Rules.Integration.IntegrationAddition(), true);
            expect(expression.getMarks().dx).toBeTruthy();
            var result = Expression.translation.Translate(expression, rule2);
            console.log(result.latex());
            expect(result.getMarks().A.parts.length === 3).toBeTruthy();
            expect(result).toBeTruthy();
        }).catch(function (e) {
            expect(e).caught();
        }).then(function (x) {
            done();
        });
    });


    it('doesnt match int(u +/- v +/- w) -> int(u(t)) +/- int(v) +/- int(w)', function (done) {
        MEPH.requires('MEPH.math.Expression').then(function ($class) {
            var Expression = MEPH.math.Expression;
            var expression = Expression.integral(
                            Expression.addition(Expression.func('f', 't'),
                                Expression.func('g', 'x'),
                                Expression.func('h', 'x')), Expression.variable('x'));
            var rule2 = Expression.Rules.Integration.AdditionIntegral();

            expression.name(Expression.RuleType.IntegrationAddition);
            var rule = Expression.matchRule(expression, Expression.Rules.Integration.IntegrationAddition(), true); 
            expect(!rule).toBeTruthy();
        }).catch(function (e) {
            expect(e).caught();
        }).then(function (x) {
            done();
        });
    });



    it(' do Integration By Parts ', function (done) {
        MEPH.requires('MEPH.math.Expression').then(function ($class) {
            var Expression = MEPH.math.Expression;
            var rule1 = Expression.Rules.Integration.IntegrationByParts();
            var rule2 = Expression.Rules.Integration.IntegrationByPartsComplete();
            var transformation = {
                transformation: {
                    from: Expression.RuleType.IntegraionByPartsComplete,
                    to: Expression.RuleType.IntegrationByParts
                },
                v_2: 'dv',
                v_1: 'dv',
                u_1: 'du',
                u_2: 'du'
            };

            var result = Expression.translation.Transform(transformation, rule1, rule2);

            console.log(result.latex());
            expect(result).toBeTruthy();
        }).catch(function () {
            expect(new Error('something went wrong while creating an expression')).caught();
        }).then(function (x) {
            done();
        });
    });


    it(' translateIntegrationByParts ', function (done) {
        MEPH.requires('MEPH.math.Expression').then(function ($class) {
            var Expression = MEPH.math.Expression;
            var rule1 = Expression.Rules.Integration.IntegrationByParts();
            var rule2 = Expression.Rules.Integration.IntegrationByPartsComplete();

            var result = Expression.translation.Translate(rule1, rule2);

            console.log(result.latex());
            expect(result).toBeTruthy();
        }).catch(function () {
            expect(new Error('something went wrong while creating an expression')).caught();
        }).then(function (x) {
            done();
        });
    });



    it(' OneOverX -> NaturalLogAbsX ', function (done) {
        MEPH.requires('MEPH.math.Expression').then(function ($class) {
            var Expression = MEPH.math.Expression;
            var rule1 = Expression.Rules.Integration.OneOverX();
            var rule2 = Expression.Rules.Integration.NaturalLogAbsX();
            var transformation = {
                transformation: {
                    from: Expression.RuleType.OneOverX,
                    to: Expression.RuleType.NaturalLogAbsX
                },
                x: 'x'
            };

            var result = Expression.translation.Transform(transformation, rule1, rule2);

            console.log(result.latex());
            expect(result).toBeTruthy();
        }).catch(function (e) {
            expect(e).caught();
        }).then(function (x) {
            done();
        });
    });


    it(' OneOverX -> NaturalLogAbsX ', function (done) {
        MEPH.requires('MEPH.math.Expression').then(function ($class) {
            var Expression = MEPH.math.Expression;
            var rule1 = Expression.Rules.Integration.OneOverX();
            var rule2 = Expression.Rules.Integration.NaturalLogAbsX();
            var transformation = {
                transformation: {
                    from: Expression.RuleType.OneOverX,
                    to: Expression.RuleType.NaturalLogAbsX
                },
                x: 'x'
            };

            var result = Expression.translation.Transform(transformation, rule1, rule2);

            console.log(result.latex());
            expect(result).toBeTruthy();
        }).catch(function (e) {
            expect(e).caught();
        }).then(function (x) {
            done();
        });
    });

    it(' Translate OneOverX -> NaturalLogAbsX ', function (done) {
        MEPH.requires('MEPH.math.Expression').then(function ($class) {
            var Expression = MEPH.math.Expression;
            var rule1 = Expression.Rules.Integration.OneOverX();
            var rule2 = Expression.Rules.Integration.NaturalLogAbsX();

            var result = Expression.translation.Translate(rule1, rule2);

            console.log(result.latex());
            expect(result).toBeTruthy();
        }).catch(function (e) {
            expect(e).caught();
        }).then(function (x) {
            done();
        });
    });

    it(' Translate GeneralFormula8A -> GeneralFormula8B ', function (done) {
        MEPH.requires('MEPH.math.Expression').then(function ($class) {
            var Expression = MEPH.math.Expression;
            var rule1 = Expression.Rules.Integration.GeneralFormula8A();
            var rule2 = Expression.Rules.Integration.GeneralFormula8B();

            var result = Expression.translation.Translate(rule1, rule2);

            console.log(result.latex());
            expect(result).toBeTruthy();
        }).catch(function (e) {
            expect(e).caught();
        }).then(function (x) {
            done();
        });
    });


    it(' Translate GeneralFormula9A -> GeneralFormula9B ', function (done) {
        MEPH.requires('MEPH.math.Expression').then(function ($class) {
            var Expression = MEPH.math.Expression;
            var rule1 = Expression.Rules.Integration.GeneralFormula9A();
            var rule2 = Expression.Rules.Integration.GeneralFormula9B();

            var result = Expression.translation.Translate(rule1, rule2);

            console.log(result.latex());
            expect(result).toBeTruthy();
            return printExpressionToScreen(result);
        }).catch(function (e) {
            expect(e).caught();
        }).then(function (x) {
            done();
        });
    });


    it(' Translate GeneralFormula9B  -> GeneralFormula9A', function (done) {
        MEPH.requires('MEPH.math.Expression').then(function ($class) {
            var Expression = MEPH.math.Expression;
            var rule1 = Expression.Rules.Integration.GeneralFormula9A();
            var rule2 = Expression.Rules.Integration.GeneralFormula9B();

            var result = Expression.translation.Translate(rule2, rule1);

            console.log(result.latex());
            expect(result).toBeTruthy();
        }).catch(function (e) {
            expect(e).caught();
        }).then(function (x) {
            done();
        });
    });

    it('TrigonometricFormula10A -> TrigonometricFormula10B', function (done) {
        MEPH.requires('MEPH.math.Expression').then(function ($class) {
            var Expression = MEPH.math.Expression;
            var rule1 = Expression.Rules.Integration.TrigonometricFormula10A();
            var rule2 = Expression.Rules.Integration.TrigonometricFormula10B();

            var result = Expression.translation.Translate(rule2, rule1);

            console.log(result.latex());
            expect(result).toBeTruthy();
            return printExpressionToScreen(result);
        }).catch(function (e) {
            expect(e).caught();
        }).then(function (x) {
            done();
        });
    });

    it('TrigonometricFormula11A -> TrigonometricFormula11B', function (done) {
        MEPH.requires('MEPH.math.Expression').then(function ($class) {
            var Expression = MEPH.math.Expression;
            var rule1 = Expression.Rules.Integration.TrigonometricFormula11A();
            var rule2 = Expression.Rules.Integration.TrigonometricFormula11B();

            var result = Expression.translation.Translate(rule1, rule2);

            console.log(result.latex());
            expect(result).toBeTruthy();
        }).catch(function (e) {
            expect(e).caught();
        }).then(function (x) {
            done();
        });
    });

    it('TrigonometricFormula11B -> TrigonometricFormula11A ', function (done) {
        MEPH.requires('MEPH.math.Expression').then(function ($class) {
            var Expression = MEPH.math.Expression;
            var rule1 = Expression.Rules.Integration.TrigonometricFormula11A();
            var rule2 = Expression.Rules.Integration.TrigonometricFormula11B();

            var result = Expression.translation.Translate(rule2, rule1);

            console.log(result.latex());
            expect(result).toBeTruthy();
        }).catch(function (e) {
            expect(e).caught();
        }).then(function (x) {
            done();
        });
    });

    it(' an expression can say what variables are available for respecting', function (done) {
        MEPH.requires('MEPH.math.Expression').then(function ($class) {
            var Expression = MEPH.math.Expression;
            var power = Expression.power(Expression.variable('x'), Expression.variable('y'));
            var respects = power.respects();

            expect(respects.length === 2).toBeTruthy();
        }).catch(function (e) {
            expect(e).caught();
        }).then(function (x) {
            done();
        });
    });
    it(' an expression will not add numbers to the list', function (done) {
        MEPH.requires('MEPH.math.Expression').then(function ($class) {
            var Expression = MEPH.math.Expression;
            var power = Expression.power(Expression.variable('x'), Expression.variable('2'));
            var respects = power.respects();

            expect(respects.length === 1).toBeTruthy();
        }).catch(function (e) {
            expect(e).caught();
        }).then(function (x) {
            done();
        });
    });
    it(' an expression will not add numbers to the respects  list', function (done) {
        MEPH.requires('MEPH.math.Expression').then(function ($class) {
            var Expression = MEPH.math.Expression;
            var power = Expression.power(Expression.variable('2'), Expression.variable('2'));
            var respects = power.respects();

            expect(respects.length === 0).toBeTruthy();
        }).catch(function (e) {
            expect(e).caught();
        }).then(function (x) {
            done();
        });
    });
    it(' an expression will not add numbers to the respects list', function (done) {
        MEPH.requires('MEPH.math.Expression').then(function ($class) {
            var Expression = MEPH.math.Expression;
            var power = Expression.addition(Expression.variable('s'), Expression.power(Expression.variable('x'), '2'), Expression.variable('2'));
            var respects = power.respects();

            expect(respects.length === 2).toBeTruthy();
        }).catch(function (e) {
            expect(e).caught();
        }).then(function (x) {
            done();
        });
    });

    it(' an expression will not add duplicates to the respects list', function (done) {
        MEPH.requires('MEPH.math.Expression').then(function ($class) {
            var Expression = MEPH.math.Expression;
            var power = Expression.addition(Expression.variable('x'), Expression.power(Expression.variable('x'), '2'), Expression.variable('2'));
            var respects = power.respects();

            expect(respects.length === 1).toBeTruthy();
        }).catch(function (e) {
            expect(e).caught();
        }).then(function (x) {
            done();
        });
    });

    it('an expression can expression a dependency on another expression', function (done) {
        MEPH.requires('MEPH.math.Expression').then(function () {
            var c = Expression.variable('#C');
            c.mark('C');
            var dx = Expression.variable('x');
            dx.mark('dx');
            var expression = Expression.integral(c, dx);
            expression.mark('I');
            c.dependency('parent', 'respectTo', function (c, x) {
                var inRespectTo = x && x.val ? x.val : x;
                return c.respects().contains(function (x) { return x === inRespectTo; });
            });

            var list = c.getDependencies();

            expect(list.length).toBe(1);
            expect(list.first()).toBeTruthy();
        }).catch(function (e) {
            expect(e).caught();
        }).then(done);
    });

    it('an expression can tell if an expression respects its dependencies', function (done) {
        MEPH.requires('MEPH.math.Expression').then(function () {
            var c = Expression.variable('#C');
            c.mark('C');
            var dx = Expression.variable('x');
            dx.mark('dx');
            var expression = Expression.integral(c, dx);
            expression.mark('I');
            c.dependency('parent', 'respectTo', function (c, x) {
                var inRespectTo = x && x.val && x.val.part ? x.val.part('variable').val : x.val;

                return !c.respects().contains(function (x) { return x === inRespectTo; });
            });

            var d = Expression.variable('d');
            var dx = Expression.variable('x');
            dx.mark('dx');
            var integral = Expression.integral(d, dx);

            var result = c.dependenciesAreRespected(d);
            expect(result).toBeTruthy();
        }).catch(function (e) {
            expect(e).caught();
        }).then(done);
    });

    it('an expression can tell if an expression respects its dependencies, siblings', function (done) {
        MEPH.requires('MEPH.math.Expression').then(function () {
            var c = Expression.variable('#C');
            c.mark('C');
            var dx = Expression.variable('x');
            dx.mark('dx');
            var expression = Expression.integral(c, dx);
            expression.mark('I');
            c.dependency('sibling', '', function (c, t) {
                var inRespectTo = t.select(function (x) {
                    var inRespectTo = x && x.val && x.val.part ? x.val.part('variable').val : x.val;
                    return inRespectTo;
                });
                return !inRespectTo.intersection(c.respects()).count();
            });

            var d = Expression.variable('d');
            var dx = Expression.variable('x');
            dx.mark('dx');
            var multiplication = Expression.multiplication(d, dx);
            
            var result = c.dependenciesAreRespected(d);
            expect(result).toBeTruthy();
        }).catch(function (e) {
            expect(e).caught();
        }).then(done);
    });

    it('an expression has no dependencies, it is considered respected.', function (done) {
        MEPH.requires('MEPH.math.Expression').then(function () {
            var c = Expression.variable('#C');
            c.mark('C');
            var dx = Expression.variable('x');
            dx.mark('dx');
            var expression = Expression.integral(c, dx);
            expression.mark('I');

            var d = Expression.variable('d');
            var dx = Expression.variable('x');
            dx.mark('dx');
            var integral = Expression.integral(d, dx);

            var result = c.dependenciesAreRespected(d);
            expect(result).toBeTruthy();
        }).catch(function (e) {
            expect(e).caught();
        }).then(done);
    });

});