/**
 * @class MEPH.math.Expression
 * Describes mathematical expressions.
 *
 **/
MEPH.define('MEPH.math.Expression', {
    alternateNames: 'Expression',
    requires: ['MEPH.math.ExpressionMatch',
                'MEPH.math.Set',
                'MEPH.math.expression.Factor',
                'MEPH.math.ExpressionTranslation'],
    statics: {
        type: {
            variable: 'variable',
            integral: 'integral',
            addition: 'addition',
            power: 'power',
            limit: 'limit',
            fraction: 'fraction',
            sin: 'sin',
            cos: 'cos',
            tan: 'tan',
            csc: 'csc',
            cot: 'cot',
            sec: 'sec',
            tan: 'tan',
            sinh: 'sinh',
            cosh: 'cosh',
            tanh: 'tanh',
            sech: 'sech',
            coth: 'coth',
            csch: 'csch',
            ln: 'ln',
            log: 'log',
            e: 'e',
            factorial: 'factorial',
            summation: 'summation',
            sqrt: 'sqrt',
            negative: 'negative',
            abs: 'abs',
            func: 'func',
            mod: 'mod',
            modulo: 'modulo',
            theta: 'theta',
            subtraction: 'subtraction',
            plusminus: 'plusminus',
            multiplication: 'multiplication',
            division: 'division',
            anything: 'anything',
            derivative: 'derivative'
        },
        symbols: {
            Infinity: 'Infinity'
        },
        'function': {
            input: 'input',
            start: 'start',
            end: 'end',
            name: 'name',
            denominator: 'denominator',
            numerator: 'numerator',
            base: 'base',
            expression: 'exp',
            power: 'power',
            respectTo: 'respectTo',
            derivative: 'derivative'
        },
        translation: {
            Translate: function (a, b) {
                return ExpressionTranslation.translate(a, b)
            },
            Transform: function (transform, a, b) {
                return ExpressionTranslation.transform(transform, a, b);
            }
        },
        RuleType: {
            Derivation: {
                SimpleVariableA: 'SimpleVariableA',
                SimpleVariableB: 'SimpleVariableB'
            },
            Integration: {

            },
            IntegralConstMultiply: 'IntegralConstMultiply',
            MultiplyIntegralofFx: 'MultiplyIntegralofFx',
            IntegralConst: 'IntegralConst',
            AxPlusC: 'AxPlusC',
            Power: 'Power',
            PowerIntegrate: 'PowerIntegrate',
            IntegrationAddition: 'IntegrationAddition',
            AdditionIntegral: 'AdditionIntegral',
            IntegrationByParts: 'IntegrationByParts',
            IntegrationByPartsComplete: 'IntegrationByPartsComplete',
            Fudx: 'Fudx',
            FuOveruprimedx: 'FuOveruprimedx',
            OneOverX: 'OneOverX',
            NaturalLogAbsX: 'NaturalLogAbsX',
            GeneralFormula8A: 'GeneralFormula8A',
            GeneralFormula8B: 'GeneralFormula8B',
            GeneralFormula9A: 'GeneralFormula9A',
            GeneralFormula9B: 'GeneralFormula9B',
            TrigonometricFormula10A: 'TrigonometricFormula10A',
            TrigonometricFormula10B: 'TrigonometricFormula10B',
            TrigonometricFormula11A: 'TrigonometricFormula11A',
            TrigonometricFormula11B: 'TrigonometricFormula11B'
        },
        Dependency: {
            ConstRelation: function (c, x) {
                var inRespectTo = x && x.val && x.val.part ? x.val.part('variable').val : x.val;
                return !c.respects().contains(function (x) { return x === inRespectTo; });
            },
            VariableRelation: function (c, x) {
                var inRespectTo = x && x.val && x.val.part ? x.val.part('variable').val : x.val;
                return c.respects().contains(function (x) { return x === inRespectTo; });
            },
            ChainRule: function (Gx, Fx, expression) {
                
                var fx = expression.getMark(Fx);
                var gx = Expression.Dependency.GetGx(fx);
                if (gx) {
                    gx.mark(Gx);
                    return true;
                }
                return false;
            },
            AlreadyChainedRule: function (Gx, Fx, expression) {
                var properties = expression.getProperties();
                
                return !!!properties.chained;
            },
            GetGx: function (Fx) {
                switch (Fx.type) {
                    case Expression.type.fraction:
                    case Expression.type.division:
                    case Expression.type.subtraction:
                    case Expression.type.addition:
                    case Expression.type.multiplication:
                    case Expression.type.variable:
                    case Expression.type.integral:
                    case Expression.type.derivative:
                    case Expression.type.abs:
                    case Expression.type.summation:
                        return null;
                    case Expression.type.power:
                        return Fx.partOrDefault(Expression['function'].power);
                    case Expression.type.ln:
                    case Expression.type.e:
                    case Expression.type.log:
                    case Expression.type.cos:
                    case Expression.type.tan:
                    case Expression.type.sec:
                    case Expression.type.sin:
                    case Expression.type.csc:
                    case Expression.type.cosh:
                    case Expression.type.tanh:
                    case Expression.type.sech:
                    case Expression.type.coth:
                    case Expression.type.sinh:
                    case Expression.type.csch:
                    case Expression.type.cot:
                    case Expression.type.sqrt:
                        return Fx.partOrDefault(Expression['function'].input);
                    default:
                        throw new Error('unhandled case: ' + Fx.type + ', Expression.js(GetGx)')
                }
            },
            Matches: function (marks, expression) {
                var t = marks.select(function (x) {
                    return expression.getMark(x);
                });
                if (t.length === t.count(function (x) { return x; })) {
                    return t.subset(1).all(function (x) {
                        return t.first().equals(x, { exact: true });
                    })
                }
                return false;
            },
            OrderRequired: function (marks, parentMark, expression) {
                var parent = expression.getMark(parentMark);
                var ordered = marks.select(function (y) {
                    return parent.getParts().indexWhere(function (x) { return x.val === expression.getMark(y); }).first();
                });
                var res = ordered.all(function (x, i) {
                    if (i == 0) {
                        return true;
                    }
                    else {
                        return ordered[i - 1] < x;
                    }
                });
                return res;
            },
            SiblingIndependence: function (c, t) {
                var inRespectTo = t.select(function (x) {
                    var inRespectTo = x && x.val && x.val.part ? x.val.respects() : [x.val];
                    return inRespectTo;
                }).concatFluentReverse(function (x) { return x; });
                return !inRespectTo.intersection(c.respects()).count();
            },
            SiblingDependence: function (c, t) {
                var inRespectTo = t.select(function (x) {
                    var inRespectTo = x && x.val && x.val.part ? x.val.respects() : [x.val];
                    return inRespectTo;
                }).concatFluentReverse(function (x) { return x; });
                return inRespectTo.intersection(c.respects()).count();
            }
        },
        /**
         * Clears marks on expression.
         * @param {MEPH.math.Expression} expression
         **/
        clearMarks: function (expression) {
            expression.clearMarks();
        },
        /**
         * Selects the result based on the selector.
         *
         *              Example
         *              up:.[type of expression] -> traverses the expression upwards for the
         *              first expression of the type.
         * 
         * @param {MEPH.math.Expression}
         * @param {Object} d
         * @param {String} d.offset
         * @returns {MEPH.math.Expression}
         ***/
        select: function (expression, d) {
            var selector = d.offset;
            var split = selector.split(':');
            var traversalDirection = split.first();
            var expType;
            var exp = expression;
            switch (traversalDirection) {
                case 'stay':
                    return exp;
                case 'up':
                    expType = split.second().split('.').second();
                    do {
                        exp = exp.parent();
                    }
                    while (exp && exp.type !== expType);
                    if (exp) {
                        if (d.part) {
                            return exp.part(d.part);
                        }
                        else return exp;
                    }
            }
            /* I would like this section below to dissapear */
            switch (selector) {
                case 'grandparent':
                    offset = expression.parent().parent();
                    part = offset.part(d.part);
                    break;
                case 'parent':
                    offset = expression.parent();
                    part = offset.part(d.part);
                    break
                case 'sibling':
                    offset = expression.parent();
                    var json = JSON.parse('{' + d.part + '}');
                    part = offset.parts.where(function (x) {
                        return x.val !== expression;
                    });
                    break;
                default:
                    if (selector.split('.')) {
                        selector.split('.').foreach(function (x) {
                            if (x === 'parent') {
                                offset = offset.parent();
                            }
                        });
                        part = offset.part(d.part);
                    }
                    else
                        throw new Error('not handled offset');
                    break;
            }
            return part;
        },
        /**
         * Gets the greatest common factor from an array of expressions.
         * @param {MEPH.math.Expression} expression
         * @return {Array} of MEPH.math.expression.Factor
         */
        GreatestCommomFactor: function (expression) {

            var flattenedExpression = Expression.Flatten(expression.copy(), Expression.type.multiplication);
            var factors = [];
            var collectedFactors = flattenedExpression.getParts().select(function (x) {
                return MEPH.math.expression.Factor.getFactors(x.val);
            })
            var preCompactedFactors = collectedFactors.intersectFluent(function (x, y) {
                return x.exp.equals(y.exp, { exact: true });
            });

            var ret = preCompactedFactors.select(function (gh) {
                return collectedFactors.concatFluentReverse(function (x) { return x; }).where(function (x) {
                    return x.exp.equals(gh.exp, { exact: true });
                }).minSelect(function (y) {
                    return y.count;
                });
            });

            return ret;
        },
        /**
         * The greatest common divisor (gcd), also known as the greatest common factor (gcf), 
         * highest common factor (hcf), or greatest common measure (gcm), of two or more 
         * integers (when at least one of them is not zero), is the largest positive integer 
         * that divides the numbers without a remainder.
         * @param {MEPH.math.Expression} expression
         * @return {MEPH.math.Expression}
         **/
        GreatestCommonDenominator: function (expression) {
            var array = Expression.GreatestCommomFactor(expression);
            var res = array.select(function (x) {
                return Expression.power(x.exp, x.count);
            });
            if (res.length > 1) {
                res = Expression.multiplication.apply(this, res);
            }
            else if (res.length) {
                res = res.first();
            }
            else return null;

            return MEPH.math.expression.Evaluator.evaluate(res);
        },
        /**
         * The expression will have the factors removed from a flattened expression, and 
         * multiplied by those factors.
         * @param {MEPH.math.Expression} expression
         * @param {Array} factors 
         * @return {MEPH.math.Expression}
         ***/
        Refactor: function (expression, factors) {
            var flattenedExpression = Expression.Flatten(expression.copy(), Expression.type.multiplication);
            flattenedExpression.getParts().select(function (part) {
                var replacement = MEPH.math.expression.Factor.removeFactors(part.val, factors);
                return { r: replacement, p: part.val };
            }).foreach(function (t) {
                Expression.SwapPart(t.p, t.r);
            });

            return Expression.multiplication.apply(this, factors.select(function (x) { return x.exp }).concat(flattenedExpression))
        },

        /**
         * Swaps a for b.
         * @param {MEPH.math.Expression} b
         * @param {MEPH.math.Expression} a
         * @return {Boolean}s
         ***/
        SwapPart: function (a, b) {
            if (a.parent()) {
                var parent = a.parent();
                var part = parent.remove(a).first();
                parent.addPart(part.type, b);
                b.parent(parent);
                return true;
            }
            return false;
        },
        /**
         * Gets the rules which match the expression.
         **/
        getMatchingRules: function (exp) {
            var res = [];
            for (var j in Expression.Rules) {
                for (var i in Expression.Rules[j]) {
                    var rule = Expression.Rules[j][i]();
                    var ismatch = Expression.matchRule(exp, rule);
                    if (ismatch) {
                        res.push({
                            type: 'Differentiation' === j ? Expression.type.derivative : Expression.type.integral, rule: rule
                        });
                    }
                }
            }
            return res;
        },
        getRule: function (rule, type) {
            if ('Derivation' === type) {
                for (var i in Expression.Rules.Differentiation) {
                    if (i === rule) {
                        return Expression.Rules.Differentiation[i]();
                    }
                }
            }
            for (var i in Expression.Rules.Integration) {
                if (i === rule) {
                    return Expression.Rules.Integration[i]();
                }
            }
            return null;
        },
        Rules: {
            Differentiation: {
                SimpleVariableA: function () {
                    var exp = Expression.variable('x');
                    exp.dependency('up:.derivative', Expression['function'].denominator, Expression.Dependency.VariableRelation);

                    var denom = Expression.variable('d');
                    denom.mark('dx');

                    var expression = Expression.derivative(exp, 1, null, denom);

                    expression.name(Expression.RuleType.Derivation.SimpleVariableA);

                    return expression;
                },
                SimpleVariableB: function () {
                    var one = Expression.one();
                    one.name(Expression.RuleType.Derivation.SimpleVariableB);

                    return one;
                },
                GeneralFormula1a: function () {
                    var exp = Expression.anything();
                    exp.dependency('up:.derivative', Expression['function'].denominator, Expression.Dependency.ConstRelation);

                    var expression = Expression.derivative(exp, null, null);

                    expression.name(Expression.RuleType.Derivation.GeneralFormula1a);
                    return expression;
                },
                GeneralFormula1b: function () {
                    var expression = Expression.zero();
                    expression.name(Expression.RuleType.Derivation.GeneralFormula1b);
                    return expression;
                },
                GeneralFormula2a: function () {
                    var c = Expression.anything();
                    c.dependency('up:.derivative', Expression['function'].denominator, Expression.Dependency.ConstRelation);
                    c.mark('C');

                    var x = Expression.variable('x');
                    x.dependency('up:.derivative', Expression['function'].denominator, Expression.Dependency.VariableRelation);

                    var exp = Expression.multiplication(c, x);
                    exp.repeat = {
                        requires: [Expression['function'].input]
                    };

                    var denom = Expression.variable('d');
                    var expression = Expression.derivative(exp, 1, null, denom);

                    expression.name(Expression.RuleType.Derivation.GeneralFormula2a);

                    return expression;
                },
                GeneralFormula2b: function () {
                    var c = Expression.variable('c');
                    c.mark('C');
                    c.name(Expression.RuleType.Derivation.GeneralFormula2b);
                    return c;
                },
                GeneralFormula3a: function () {
                    var c = Expression.anything();
                    c.dependency('up:.derivative', Expression['function'].denominator, Expression.Dependency.ConstRelation);
                    c.mark('C');

                    var x = Expression.anything('x');
                    x.dependency('up:.derivative', Expression['function'].denominator, Expression.Dependency.VariableRelation);
                    x.mark('U');

                    var exp = Expression.multiplication(c, x);
                    exp.repeat = {
                        requires: [Expression['function'].input]
                    }

                    var denom = Expression.variable('d');
                    denom.mark('dx');

                    var diff = Expression.derivative(exp, 1, null, denom);
                    diff.name(Expression.RuleType.Derivation.GeneralFormula3a);

                    return diff;
                },
                GeneralFormula3b: function () {
                    var c = Expression.variable('c')
                    c.dependency('sibling', '', Expression.Dependency.SiblingIndependence);
                    c.mark('C');

                    var exp = Expression.anything();
                    exp.dependency('up:.derivative', Expression['function'].denominator, Expression.Dependency.VariableRelation);
                    exp.mark('U');

                    var denom = Expression.variable('d');
                    denom.mark('dx');

                    var diff = Expression.derivative(exp, 1, null, denom);

                    var expression = Expression.multiplication(c, diff);
                    expression.name(Expression.RuleType.Derivation.GeneralFormula3b);
                    return expression;
                },
                GeneralFormula4a: function () {
                    var d = Expression.anything();;
                    d.dependency('up:.derivative', Expression['function'].denominator, Expression.Dependency.VariableRelation);
                    d.mark('U');

                    var exp = Expression.addition(d);
                    exp.repeat = true;
                    exp.mark('A');

                    var denom = Expression.variable('d');
                    denom.mark('dx');

                    var diff = Expression.derivative(exp, 1, null, denom);
                    diff.name(Expression.RuleType.Derivation.GeneralFormula4a);
                    diff.mark('dir');

                    return diff;
                },
                GeneralFormula4b: function () {
                    var d = Expression.anything();;
                    d.dependency('up:.derivative', Expression['function'].denominator, Expression.Dependency.VariableRelation);
                    d.mark('U');

                    var denom = Expression.variable('d');
                    denom.mark('dx');


                    var derivative = Expression.derivative(d, 1, null, denom);
                    derivative.mark('dir');

                    var addition = Expression.addition(derivative);
                    addition.name(Expression.RuleType.Derivation.GeneralFormula4b);
                    addition.mark('A');
                    addition.repeat = true;

                    return addition;
                },
                GeneralFormula5a: function () {

                    var a = Expression.anything();
                    a.dependency('up:.derivative', Expression['function'].denominator, Expression.Dependency.VariableRelation);
                    a.mark('U');

                    var denom = Expression.variable('d');
                    denom.mark('dx');

                    var multiplication = Expression.multiplication(a);
                    multiplication.mark('A');
                    multiplication.repeat = true;


                    var dirivative = Expression.derivative(multiplication, 1, null, denom);
                    dirivative.name(Expression.RuleType.Derivation.GeneralFormula5a);
                    return dirivative;
                },
                GeneralFormula5b: function () {

                    var v = Expression.anything();
                    v.mark('V')
                    v.dependency('up:.derivative', Expression['function'].denominator, Expression.Dependency.VariableRelation);

                    var u = Expression.anything();
                    u.mark('U')
                    u.dependency('up:.derivative', Expression['function'].denominator, Expression.Dependency.VariableRelation);

                    var denom = Expression.variable('d');
                    denom.mark('dx');

                    var dir = Expression.derivative(u, 1, null, denom);
                    dir.mark('dir');

                    var mul = Expression.multiplication(dir, v);
                    mul.mark('copyTo');

                    var addition = Expression.addition(mul);
                    addition.mark('A');
                    addition.repeat = true;
                    addition.name(Expression.RuleType.Derivation.GeneralFormula5b);

                    return addition;
                },
                GeneralFormula7a: function () {
                    var v = Expression.anything();
                    v.mark('V')
                    v.dependency('up:.derivative', Expression['function'].denominator, Expression.Dependency.VariableRelation);

                    var u = Expression.anything();
                    u.mark('U')
                    u.dependency('up:.derivative', Expression['function'].denominator, Expression.Dependency.VariableRelation);

                    var division = Expression.division(u, v);

                    var denom = Expression.variable('d');
                    denom.mark('dx');

                    var diff = Expression.derivative(division, 1, null, denom);

                    diff.name(Expression.RuleType.Derivation.GeneralFormula7a);

                    return diff;
                },
                GeneralFormula7b: function () {
                    var v = Expression.anything();
                    v.mark('V');

                    var _du = Expression.anything();
                    _du.mark('dU');


                    var dudx = Expression.variable('d');
                    dudx.mark('dudx');

                    var du = Expression.derivative(_du, 1, null, dudx);

                    var _dv = Expression.anything();
                    _dv.mark('dV');

                    var dvdx = Expression.variable('d');
                    dvdx.mark('dvdx');

                    var dv = Expression.derivative(_dv, 1, null, dvdx);


                    var u = Expression.anything();
                    u.mark('U');

                    var vdu = Expression.multiplication(v, du);


                    var udv = Expression.multiplication(u, dv);

                    var top = Expression.subtraction(vdu, udv);

                    var vd = Expression.anything();
                    vd.mark('VD');

                    var bottom = Expression.power(vd, 2);
                    var division = Expression.division(top, bottom);

                    division.name(Expression.RuleType.Derivation.GeneralFormula7b);

                    return division;
                },
                /**
                 * Chain rule.
                 * In calculus, the chain rule is a formula for computing the derivative of the composition of two or more functions. 
                 * @return {MEPH.math.Expression}
                 */
                ChainRuleA: function () {
                    var expression = Expression.anything();
                    expression.mark('Fx');
                    expression.dependency('up:.derivative', Expression['function'].denominator, Expression.Dependency.VariableRelation);

                    var denom = Expression.variable('d');
                    denom.mark('dx');

                    var diff = Expression.derivative(expression, 1, null, denom);
                    diff.name(Expression.RuleType.Derivation.ChainRuleA);
                    diff.dependency('stay:', '', Expression.Dependency.AlreadyChainedRule.bind(this, 'Gx', 'Fx'), true);
                    diff.dependency('stay:', '', Expression.Dependency.ChainRule.bind(this, 'Gx', 'Fx'), true);

                    return diff;
                },
                ChainRuleB: function () {

                    var Gx = Expression.anything();
                    Gx.mark('Gx');

                    var Fx = Expression.anything();
                    Fx.mark('Fx');

                    var dx = Expression.variable('x');
                    dx.mark('dx1');

                    var dx2 = Expression.variable('x');
                    dx2.mark('dx2');

                    var dG = Expression.derivative(Gx, 1, null, dx2);

                    var dF = Expression.derivative(Fx, 1, null, dx);
                    dF.setProperties({ chained: true });

                    var multiplication = Expression.multiplication(dF, dG);

                    multiplication.name(Expression.RuleType.Derivation.ChainRuleB);

                    return multiplication;
                },
                GeneralFormula10a: function () {
                    var n = Expression.anything();
                    n.mark('N');

                    var exp = Expression.anything();
                    exp.mark('U');
                    exp.dependency('up:.derivative', Expression['function'].denominator, Expression.Dependency.VariableRelation);

                    var power = Expression.power(exp, n);

                    var denom = Expression.variable('d');
                    denom.mark('dx');

                    var diff = Expression.derivative(power, 1, null, denom);

                    diff.name(Expression.RuleType.Derivation.GeneralFormula10a);

                    return diff;
                },
                GeneralFormula10b: function () {

                    var denom = Expression.variable('d');
                    denom.mark('dx');

                    var _du = Expression.anything();
                    _du.mark('dU');

                    var du = Expression.derivative(_du, 1, null, denom);

                    var ns = Expression.anything();
                    ns.mark('NS');

                    var sub = Expression.subtraction(ns, 1);

                    var u = Expression.anything();
                    u.mark('U');

                    var power = Expression.power(u, sub);

                    var n = Expression.anything();
                    n.mark('N');

                    var multiplication = Expression.multiplication(n, power, du);

                    multiplication.name(Expression.RuleType.Derivation.GeneralFormula10b);

                    return multiplication;
                },
                GeneralFormula12a: function () {
                    var x = Expression.anything();
                    x.dependency('up:.derivative', Expression['function'].denominator, Expression.Dependency.VariableRelation);
                    x.mark('X');

                    var exp = Expression.e(x);

                    var denom = Expression.variable('d');
                    denom.mark('dx');

                    var diff = Expression.derivative(exp, 1, null, denom);
                    diff.name(Expression.RuleType.Derivation.GeneralFormula12a)
                    return diff;
                },
                GeneralFormula12b: function () {
                    var x = Expression.anything();
                    x.dependency('up:.derivative', Expression['function'].denominator, Expression.Dependency.VariableRelation);
                    x.mark('X');

                    var exp = Expression.e(x);
                    exp.name(Expression.RuleType.Derivation.GeneralFormula12b)
                    return exp;

                },
                GeneralFormula13a: function () {
                    var x = Expression.anything();
                    x.mark('X');
                    x.dependency('up:.derivative', Expression['function'].denominator, Expression.Dependency.VariableRelation)

                    var a = Expression.anything()
                    a.mark('A');
                    a.dependency('up:.derivative', Expression['function'].denominator, Expression.Dependency.ConstRelation);

                    var power = Expression.power(a, x);

                    var denom = Expression.variable('d');
                    denom.mark('dx');

                    var diff = Expression.derivative(power, 1, null, denom);

                    diff.name(Expression.RuleType.Derivation.GeneralFormula13a)

                    return diff;
                },
                GeneralFormula13b: function () {
                    var lna = Expression.anything();
                    lna.mark('LNA');

                    var ln = Expression.ln(lna);

                    var a = Expression.anything();
                    a.mark('A');

                    var x = Expression.anything();
                    x.mark('X');

                    var power = Expression.power(a, x);

                    var multiplication = Expression.multiplication(power, ln);

                    multiplication.name(Expression.RuleType.Derivation.GeneralFormula13b);

                    return multiplication;
                },
                GeneralFormula14a: function () {
                    var x = Expression.anything('x');
                    x.mark('X');
                    x.dependency('up:.derivative', Expression['function'].denominator, Expression.Dependency.VariableRelation);

                    var abs = Expression.abs(x);

                    var ln = Expression.ln(abs);

                    var denom = Expression.variable('d');
                    denom.mark('dx');

                    var diff = Expression.derivative(ln, 1, null, denom);
                    diff.name(Expression.RuleType.Derivation.GeneralFormula14a);
                    return diff;
                },
                GeneralFormula14b: function () {
                    var x = Expression.anything('x');
                    x.mark('X');

                    var division = Expression.division(Expression.variable('1'), x);
                    division.name(Expression.RuleType.Derivation.GeneralFormula14b);

                    return division;
                },
                GeneralFormula15a: function () {

                    var x = Expression.anything('x');
                    x.mark('X');

                    var a = Expression.variable('a');
                    a.mark('A');

                    var denom = Expression.variable('d');
                    denom.mark('dx');

                    var log = Expression.log(x, a);

                    var diff = Expression.derivative(log, 1, null, denom);

                    diff.name(Expression.RuleType.Derivation.GeneralFormula15a)
                    return diff;
                },
                GeneralFormula15b: function () {
                    var x = Expression.anything();
                    x.mark('X');
                    x.dependency('up:.derivative', Expression['function'].denominator, Expression.Dependency.VariableRelation);

                    var a = Expression.anything();
                    a.mark('A');

                    var ln = Expression.ln(a);

                    var sub = Expression.multiplication(x, ln);

                    var division = Expression.division(1, sub);

                    division.name(Expression.RuleType.Derivation.GeneralFormula15b);

                    return division;
                },
                GeneralFormula17a: function () {
                    var x = Expression.anything();
                    x.mark('X');
                    x.dependency('up:.derivative', Expression['function'].denominator, Expression.Dependency.VariableRelation);

                    var sin = Expression.sin(x);

                    var denom = Expression.variable('d');
                    denom.mark('dx');

                    var diff = Expression.derivative(sin, 1, null, denom);

                    diff.name(Expression.RuleType.Derivation.GeneralFormula17a);

                    return diff;
                },
                GeneralFormula17b: function () {
                    var x = Expression.anything();
                    x.mark('X');

                    var cos = Expression.cos(x);
                    cos.name(Expression.RuleType.Derivation.GeneralFormula17b);

                    return cos;
                },
                GeneralFormula18a: function () {
                    var x = Expression.anything();
                    x.mark('X');
                    x.dependency('up:.derivative', Expression['function'].denominator, Expression.Dependency.VariableRelation);

                    var cos = Expression.cos(x);

                    var denom = Expression.variable('d');
                    denom.mark('dx');

                    var diff = Expression.derivative(cos, 1, null, denom);

                    diff.name(Expression.RuleType.Derivation.GeneralFormula18a);

                    return diff;
                },
                GeneralFormula18b: function () {
                    var x = Expression.anything();
                    x.mark('X');

                    var cos = Expression.cos(x);
                    cos.name(Expression.RuleType.Derivation.GeneralFormula17b);

                    var mul = Expression.multiplication(-1, cos);

                    mul.name(Expression.RuleType.Derivation.GeneralFormula18b);

                    return mul;
                },
                GeneralFormula19a: function () {
                    var x = Expression.anything();
                    x.mark('X');
                    x.dependency('up:.derivative', Expression['function'].denominator, Expression.Dependency.VariableRelation);

                    var denom = Expression.variable('d');
                    denom.mark('dx');

                    var tan = Expression.tan(x);

                    var diff = Expression.derivative(tan, 1, null, denom);

                    diff.name(Expression.RuleType.Derivation.GeneralFormula19a);

                    return diff;
                },
                GeneralFormula19b: function () {
                    var x = Expression.anything();
                    x.mark('X');

                    var sec = Expression.sec(x);

                    var power = Expression.power(sec, 2);

                    power.name(Expression.RuleType.Derivation.GeneralFormula19b);

                    return power;
                },
                GeneralFormula20a: function () {
                    var x = Expression.anything();
                    x.dependency('up:.derivative', Expression['function'].denominator, Expression.Dependency.VariableRelation);
                    x.mark('X');

                    var cot = Expression.cot(x);

                    var denom = Expression.variable('d');
                    denom.mark('dx');

                    var diff = Expression.derivative(cot, 1, null, denom);
                    diff.name(Expression.RuleType.Derivation.GeneralFormula20a);
                    return diff;
                },
                GeneralFormula20b: function () {
                    var x = Expression.anything();
                    x.mark('X');

                    var csc = Expression.csc(x);

                    var pow = Expression.power(csc, 2);

                    var negone = Expression.variable(-1);

                    var multiplication = Expression.multiplication(negone, pow);
                    multiplication.name(Expression.RuleType.Derivation.GeneralFormula20b);

                    return multiplication;
                },
                GeneralFormula21a: function () {
                    var x = Expression.anything();
                    x.dependency('up:.derivative', Expression['function'].denominator, Expression.Dependency.VariableRelation);
                    x.mark('X');

                    var csc = Expression.csc(x);

                    var denom = Expression.variable('d');
                    denom.mark('dx');

                    var diff = Expression.derivative(csc, 1, null, denom);
                    diff.name(Expression.RuleType.Derivation.GeneralFormula21a);
                    return diff;
                },
                GeneralFormula21b: function () {
                    var x1 = Expression.anything();
                    x1.mark('X1');

                    var x2 = Expression.anything();
                    x2.mark('X2');

                    var csc = Expression.csc(x1);

                    var cot = Expression.cot(x2);

                    var mul = Expression.multiplication(-1, csc, cot);
                    mul.name(Expression.RuleType.Derivation.GeneralFormula21b);

                    return mul;
                },
                GeneralFormula22a: function () {
                    var x = Expression.anything();
                    x.dependency('up:.derivative', Expression['function'].denominator, Expression.Dependency.VariableRelation);
                    x.mark('X');

                    var sec = Expression.sec(x);

                    var denom = Expression.variable('d');
                    denom.mark('dx');

                    var diff = Expression.derivative(sec, 1, null, denom);
                    diff.name(Expression.RuleType.Derivation.GeneralFormula22a);
                    return diff;
                },
                GeneralFormula22b: function () {
                    var x1 = Expression.anything();
                    x1.mark('X1');

                    var x2 = Expression.anything();
                    x2.mark('X2');

                    var sec = Expression.sec(x1);

                    var tan = Expression.tan(x2);

                    var mul = Expression.multiplication(sec, tan);
                    mul.name(Expression.RuleType.Derivation.GeneralFormula21b);

                    return mul;
                },
                GeneralFormula23a: function () {
                    var x = Expression.anything();
                    x.dependency('up:.derivative', Expression['function'].denominator, Expression.Dependency.VariableRelation);
                    x.mark('X');

                    var sin = Expression.sin(x);

                    var denom = Expression.variable('d');
                    denom.mark('dx');
                    var power = Expression.power(sin, -1);

                    var diff = Expression.derivative(power, 1, null, denom);
                    diff.name(Expression.RuleType.Derivation.GeneralFormula23a);

                    return diff;
                },
                GeneralFormula23b: function () {
                    var x = Expression.anything();
                    x.mark('X');

                    var x2 = Expression.power(x, 2);

                    var sub = Expression.subtraction(1, x2);

                    var sqrt = Expression.sqrt(sub);

                    var division = Expression.division(1, sqrt);

                    division.name(Expression.RuleType.Derivation.GeneralFormula23b);

                    return division;
                },
                GeneralFormula24a: function () {
                    var x = Expression.anything();
                    x.dependency('up:.derivative', Expression['function'].denominator, Expression.Dependency.VariableRelation);
                    x.mark('X');

                    var cos = Expression.cos(x);

                    var denom = Expression.variable('d');
                    denom.mark('dx');

                    var power = Expression.power(cos, -1);

                    var diff = Expression.derivative(power, 1, null, denom);
                    diff.name(Expression.RuleType.Derivation.GeneralFormula24a);

                    return diff;
                },
                GeneralFormula24b: function () {
                    var x = Expression.anything();
                    x.mark('X');

                    var x2 = Expression.power(x, 2);

                    var sub = Expression.subtraction(1, x2);

                    var sqrt = Expression.sqrt(sub);

                    var division = Expression.division(1, sqrt);

                    division.name(Expression.RuleType.Derivation.GeneralFormula24b);

                    return division;
                },
                GeneralFormula25a: function () {
                    var x = Expression.anything();
                    x.dependency('up:.derivative', Expression['function'].denominator, Expression.Dependency.VariableRelation);
                    x.mark('X');

                    var tan = Expression.tan(x);

                    var denom = Expression.variable('d');
                    denom.mark('dx');

                    var power = Expression.power(tan, -1);

                    var diff = Expression.derivative(power, 1, null, denom);
                    diff.name(Expression.RuleType.Derivation.GeneralFormula25a);

                    return diff;
                },
                GeneralFormula25b: function () {
                    var x = Expression.anything();
                    x.mark('X');

                    var x2 = Expression.power(x, 2);

                    var addition = Expression.addition(1, x2);


                    var division = Expression.division(1, addition);

                    division.name(Expression.RuleType.Derivation.GeneralFormula25b);

                    return division;
                },
                GeneralFormula26a: function () {
                    var x = Expression.anything();
                    x.dependency('up:.derivative', Expression['function'].denominator, Expression.Dependency.VariableRelation);
                    x.mark('X');

                    var cot = Expression.cot(x);

                    var denom = Expression.variable('d');
                    denom.mark('dx');

                    var power = Expression.power(cot, -1);

                    var diff = Expression.derivative(power, 1, null, denom);
                    diff.name(Expression.RuleType.Derivation.GeneralFormula26a);

                    return diff;
                },
                GeneralFormula26b: function () {
                    var x = Expression.anything();
                    x.mark('X');

                    var x2 = Expression.power(x, 2);

                    var addition = Expression.addition(1, x2);


                    var division = Expression.division(1, addition);
                    var mul = Expression.multiplication(-1, division);
                    mul.name(Expression.RuleType.Derivation.GeneralFormula26b);

                    return mul;
                },
                GeneralFormula27a: function () {
                    var x = Expression.anything();
                    x.dependency('up:.derivative', Expression['function'].denominator, Expression.Dependency.VariableRelation);
                    x.mark('X');

                    var csc = Expression.csc(x);

                    var denom = Expression.variable('d');
                    denom.mark('dx');

                    var power = Expression.power(csc, -1);

                    var diff = Expression.derivative(power, 1, null, denom);
                    diff.name(Expression.RuleType.Derivation.GeneralFormula27a);

                    return diff;
                },
                GeneralFormula27b: function () {
                    var x = Expression.anything();
                    x.mark('X1');

                    var x1 = Expression.anything();
                    x1.mark('X2');

                    var x2 = Expression.power(x, 2);

                    var subtraction = Expression.subtraction(x2, 1);

                    var sqrt = Expression.sqrt(subtraction);

                    var multiply = Expression.multiplication(x1, sqrt);

                    var division = Expression.division(1, multiply);

                    var mul = Expression.multiplication(-1, division);

                    mul.name(Expression.RuleType.Derivation.GeneralFormula27b);

                    return mul;
                },
                GeneralFormula28a: function () {
                    var x = Expression.anything();
                    x.dependency('up:.derivative', Expression['function'].denominator, Expression.Dependency.VariableRelation);
                    x.mark('X');

                    var sec = Expression.sec(x);

                    var denom = Expression.variable('d');
                    denom.mark('dx');

                    var power = Expression.power(sec, -1);

                    var diff = Expression.derivative(power, 1, null, denom);
                    diff.name(Expression.RuleType.Derivation.GeneralFormula28a);

                    return diff;
                },
                GeneralFormula28b: function () {
                    var x = Expression.anything();
                    x.mark('X1');

                    var x1 = Expression.anything();
                    x1.mark('X2');

                    var x2 = Expression.power(x, 2);

                    var subtraction = Expression.subtraction(x2, 1);

                    var sqrt = Expression.sqrt(subtraction);

                    var multiply = Expression.multiplication(x1, sqrt);

                    var division = Expression.division(1, multiply);

                    division.name(Expression.RuleType.Derivation.GeneralFormula28b);

                    return division;
                },
                GeneralFormula29a: function () {
                    var x = Expression.anything();
                    x.dependency('up:.derivative', Expression['function'].denominator, Expression.Dependency.VariableRelation);
                    x.mark('X');

                    var sinh = Expression.sinh(x);

                    var denom = Expression.variable('d');
                    denom.mark('dx');

                    var diff = Expression.derivative(sinh, 1, null, denom);
                    diff.name(Expression.RuleType.Derivation.GeneralFormula29a);

                    return diff;
                },
                GeneralFormula29b: function () {
                    var x = Expression.anything();
                    x.mark('X');

                    var cosh = Expression.cosh(x);
                    cosh.name(Expression.RuleType.Derivation.GeneralFormula29b);

                    return cosh;
                },
                GeneralFormula30a: function () {
                    var x = Expression.anything();
                    x.dependency('up:.derivative', Expression['function'].denominator, Expression.Dependency.VariableRelation);
                    x.mark('X');

                    var cosh = Expression.cosh(x);

                    var denom = Expression.variable('d');
                    denom.mark('dx');

                    var diff = Expression.derivative(cosh, 1, null, denom);
                    diff.name(Expression.RuleType.Derivation.GeneralFormula30a);

                    return diff;
                },
                GeneralFormula30b: function () {
                    var x = Expression.anything();
                    x.mark('X');

                    var cosh = Expression.sinh(x);
                    cosh.name(Expression.RuleType.Derivation.GeneralFormula30b);

                    return cosh;
                },
                GeneralFormula31a: function () {
                    var x = Expression.anything();
                    x.dependency('up:.derivative', Expression['function'].denominator, Expression.Dependency.VariableRelation);
                    x.mark('X');

                    var tanh = Expression.tanh(x);

                    var denom = Expression.variable('d');
                    denom.mark('dx');

                    var diff = Expression.derivative(tanh, 1, null, denom);
                    diff.name(Expression.RuleType.Derivation.GeneralFormula31a);

                    return diff;
                },
                GeneralFormula31b: function () {
                    var x = Expression.anything();
                    x.mark('X');
                    var power = Expression.power(x, 2);

                    var sech = Expression.sech(power);

                    sech.name(Expression.RuleType.Derivation.GeneralFormula31b);

                    return sech;
                },
                GeneralFormula32a: function () {
                    var x = Expression.anything();
                    x.dependency('up:.derivative', Expression['function'].denominator, Expression.Dependency.VariableRelation);
                    x.mark('X');

                    var coth = Expression.coth(x);

                    var denom = Expression.variable('d');
                    denom.mark('dx');

                    var diff = Expression.derivative(coth, 1, null, denom);
                    diff.name(Expression.RuleType.Derivation.GeneralFormula32a);

                    return diff;
                },
                GeneralFormula32b: function () {
                    var x = Expression.anything();
                    x.mark('X');

                    var csch = Expression.csch(x);

                    var power = Expression.power(csch, 2);

                    var mul = Expression.multiplication(-1, power);

                    mul.name(Expression.RuleType.Derivation.GeneralFormula32b);

                    return mul;
                },
                GeneralFormula33a: function () {
                    var x = Expression.anything();
                    x.dependency('up:.derivative', Expression['function'].denominator, Expression.Dependency.VariableRelation);
                    x.mark('X');

                    var csch = Expression.csch(x);

                    var denom = Expression.variable('d');
                    denom.mark('dx');

                    var diff = Expression.derivative(csch, 1, null, denom);
                    diff.name(Expression.RuleType.Derivation.GeneralFormula33a);

                    return diff;
                },
                GeneralFormula33b: function () {
                    var x = Expression.anything();
                    x.mark('X1');

                    var x2 = Expression.anything();
                    x2.mark('X2');

                    var csch = Expression.csch(x);
                    var coth = Expression.coth(x2);


                    var mul = Expression.multiplication(-1, csch, coth);

                    mul.name(Expression.RuleType.Derivation.GeneralFormula33b);

                    return mul;
                },
                GeneralFormula34a: function () {
                    var x = Expression.anything();
                    x.dependency('up:.derivative', Expression['function'].denominator, Expression.Dependency.VariableRelation);
                    x.mark('X');

                    var sech = Expression.sech(x);

                    var denom = Expression.variable('d');
                    denom.mark('dx');

                    var diff = Expression.derivative(sech, 1, null, denom);

                    diff.name(Expression.RuleType.Derivation.GeneralFormula34a);

                    return diff;
                },
                GeneralFormula34b: function () {
                    var x = Expression.anything();
                    x.mark('X1');

                    var x2 = Expression.anything();
                    x2.mark('X2');

                    var sech = Expression.sech(x);
                    var tanh = Expression.tanh(x2);


                    var mul = Expression.multiplication(-1, sech, tanh);

                    mul.name(Expression.RuleType.Derivation.GeneralFormula34b);

                    return mul;
                },
                GeneralFormula35a: function () {
                    var x = Expression.anything();
                    x.dependency('up:.derivative', Expression['function'].denominator, Expression.Dependency.VariableRelation);
                    x.mark('X');

                    var sin = Expression.sinh(x);

                    var denom = Expression.variable('d');
                    denom.mark('dx');
                    var power = Expression.power(sin, -1);

                    var diff = Expression.derivative(power, 1, null, denom);

                    diff.name(Expression.RuleType.Derivation.GeneralFormula35a);

                    return diff;
                },
                GeneralFormula35b: function () {
                    var x = Expression.anything();
                    x.mark('X');

                    var x2 = Expression.power(x, 2);

                    var addition = Expression.addition(1, x2);

                    var sqrt = Expression.sqrt(addition);

                    var division = Expression.division(1, sqrt);

                    division.name(Expression.RuleType.Derivation.GeneralFormula35b);

                    return division;
                },
                GeneralFormula36a: function () {
                    var x = Expression.anything();
                    x.dependency('up:.derivative', Expression['function'].denominator, Expression.Dependency.VariableRelation);
                    x.mark('X');

                    var cos = Expression.cosh(x);

                    var denom = Expression.variable('d');
                    denom.mark('dx');

                    var power = Expression.power(cos, -1);

                    var diff = Expression.derivative(power, 1, null, denom);
                    diff.name(Expression.RuleType.Derivation.GeneralFormula36a);

                    return diff;
                },
                GeneralFormula36b: function () {
                    var x = Expression.anything();
                    x.mark('X');

                    var x2 = Expression.power(x, 2);

                    var sub = Expression.subtraction(x2, 1);

                    var sqrt = Expression.sqrt(sub);

                    var division = Expression.division(1, sqrt);

                    division.name(Expression.RuleType.Derivation.GeneralFormula36b);

                    return division;
                },
                GeneralFormula37a: function () {
                    var x = Expression.anything();
                    x.dependency('up:.derivative', Expression['function'].denominator, Expression.Dependency.VariableRelation);
                    x.mark('X');

                    var tanh = Expression.tanh(x);

                    var denom = Expression.variable('d');
                    denom.mark('dx');

                    var power = Expression.power(tanh, -1);

                    var diff = Expression.derivative(power, 1, null, denom);
                    diff.name(Expression.RuleType.Derivation.GeneralFormula37a);

                    return diff;
                },
                GeneralFormula37b: function () {
                    var x = Expression.anything();
                    x.mark('X');

                    var x2 = Expression.power(x, 2);

                    var subtraction = Expression.subtraction(1, x2);


                    var division = Expression.division(1, subtraction);

                    division.name(Expression.RuleType.Derivation.GeneralFormula37b);

                    return division;
                },
                GeneralFormula38a: function () {
                    var x = Expression.anything();
                    x.dependency('up:.derivative', Expression['function'].denominator, Expression.Dependency.VariableRelation);
                    x.mark('X');

                    var coth = Expression.coth(x);

                    var denom = Expression.variable('d');
                    denom.mark('dx');

                    var power = Expression.power(coth, -1);

                    var diff = Expression.derivative(power, 1, null, denom);
                    diff.name(Expression.RuleType.Derivation.GeneralFormula38a);

                    return diff;
                },
                GeneralFormula38b: function () {
                    var x = Expression.anything();
                    x.mark('X');

                    var x2 = Expression.power(x, 2);

                    var subtraction = Expression.subtraction(1, x2);


                    var division = Expression.division(1, subtraction);
                    division.name(Expression.RuleType.Derivation.GeneralFormula38b);

                    return division;
                },
                GeneralFormula39a: function () {
                    var x = Expression.anything();
                    x.dependency('up:.derivative', Expression['function'].denominator, Expression.Dependency.VariableRelation);
                    x.mark('X');

                    var csch = Expression.csch(x);

                    var denom = Expression.variable('d');
                    denom.mark('dx');

                    var power = Expression.power(csch, -1);

                    var diff = Expression.derivative(power, 1, null, denom);
                    diff.name(Expression.RuleType.Derivation.GeneralFormula39a);

                    return diff;
                },
                GeneralFormula39b: function () {
                    var x = Expression.anything();
                    x.mark('X1');

                    var x1 = Expression.anything();
                    x1.mark('X2');
                    var abs = Expression.abs(x1);

                    var x2 = Expression.power(x, 2);

                    var addition = Expression.addition(x2, 1);

                    var sqrt = Expression.sqrt(addition);

                    var multiply = Expression.multiplication(abs, sqrt);

                    var division = Expression.division(1, multiply);

                    var mul = Expression.multiplication(-1, division);

                    mul.name(Expression.RuleType.Derivation.GeneralFormula39b);

                    return mul;
                },
                GeneralFormula40a: function () {
                    var x = Expression.anything();
                    x.dependency('up:.derivative', Expression['function'].denominator, Expression.Dependency.VariableRelation);
                    x.mark('X');

                    var sec = Expression.sech(x);

                    var denom = Expression.variable('d');
                    denom.mark('dx');

                    var power = Expression.power(sec, -1);

                    var diff = Expression.derivative(power, 1, null, denom);
                    diff.name(Expression.RuleType.Derivation.GeneralFormula40a);

                    return diff;
                },
                GeneralFormula40b: function () {
                    var x = Expression.anything();
                    x.mark('X1');

                    var x1 = Expression.anything();
                    x1.mark('X2');

                    var x2 = Expression.power(x, 2);

                    var subtraction = Expression.subtraction(1, x2);

                    var sqrt = Expression.sqrt(subtraction);

                    var multiply = Expression.multiplication(x1, sqrt);

                    var division = Expression.division(1, multiply);

                    var mul = Expression.multiplication(-1, division);


                    mul.name(Expression.RuleType.Derivation.GeneralFormula40b);

                    return mul;
                }
            },
            Integration: {
                IntegralConstMultiply: function () {
                    var c = Expression.anything();
                    c.dependency('up:.integral', 'respectTo', Expression.Dependency.ConstRelation);
                    c.mark('C');

                    var a = Expression.anything();
                    a.dependency('up:.integral', 'respectTo', Expression.Dependency.VariableRelation);
                    a.mark('A');

                    var mul = Expression.multiplication(c, a);
                    mul.repeat = {
                        requires: [Expression['function'].input]
                    };

                    var expression = Expression.integral(mul, 'x');
                    expression.mark('I');

                    expression.name(Expression.RuleType.IntegralConstMultiply);

                    return expression;
                },
                MultiplyIntegralofFx: function () {
                    var c = Expression.anything('#C');
                    c.dependency('sibling', '', Expression.Dependency.SiblingIndependence);
                    c.mark('C');

                    var a = Expression.anything();
                    a.dependency('up:.integral', 'respectTo', Expression.Dependency.VariableRelation);
                    a.mark('A');

                    var I = Expression.integral(a, 'x');
                    I.mark('I');

                    var expression = Expression.multiplication(c, I);
                    expression.repeat = {
                        requires: [Expression['function'].input]
                    };

                    expression.name(Expression.RuleType.MultiplyIntegralofFx);

                    return expression;
                },
                IntegralConst: function () {
                    var c = Expression.anything();
                    c.mark('C');
                    c.dependency('up:.integral', 'respectTo', Expression.Dependency.ConstRelation);

                    var dx = Expression.variable('x');
                    dx.mark('dx');
                    var expression = Expression.integral(c, dx);
                    expression.mark('I');
                    expression.name(Expression.RuleType.IntegralConst);
                    return expression;
                },
                AxPlusC: function () {
                    var a = Expression.anything('A');
                    a.mark('A');

                    a.dependency('sibling', '', Expression.Dependency.SiblingIndependence);

                    var x = Expression.variable('x');
                    x.mark('x');

                    var c = Expression.variable('#C');
                    c.mark('C');

                    var expression = Expression.addition(Expression.multiplication(a, x), c);

                    expression.name(Expression.RuleType.AxPlusC);

                    return expression;
                },
                Power: function () {
                    var n = Expression.variable('n');
                    n.mark('n');
                    var x = Expression.variable('x');
                    x.mark('x');

                    var power = Expression.power(x, n);
                    x.dependency('up:.integral', 'respectTo', Expression.Dependency.VariableRelation);
                    n.dependency('up:.integral', 'respectTo', Expression.Dependency.ConstRelation);

                    var expression = Expression.integral(power, 'x');
                    expression.mark('I');

                    expression.name(Expression.RuleType.Power);

                    return expression
                },
                PowerIntegrate: function () {
                    var n = Expression.variable('n');
                    n.mark('n_pre');
                    var n2 = Expression.variable('n');
                    n2.mark('n_post');
                    var x = Expression.variable('x');
                    x.mark('x');
                    x.dependency('sibling', '', Expression.Dependency.SiblingIndependence);

                    var c = Expression.variable('C');
                    c.mark('C');

                    var exp = Expression.addition(Expression.multiplication(
                                    Expression.fraction(
                                        Expression.variable(1),
                                        Expression.addition(
                                            n,
                                            Expression.variable(1)
                                        )
                                    ),
                    Expression.power(
                        x,
                        Expression.addition(n2, Expression.variable(1)))), c);

                    exp.name(Expression.RuleType.PowerIntegrate);

                    return exp;
                },
                IntegrationAddition: function () {
                    var func = Expression.func('f', 'x');
                    func.mark('f');
                    func.dependency('up:.integral', 'respectTo', Expression.Dependency.VariableRelation);

                    var addition = Expression.addition(func);
                    addition.mark('A');
                    addition.repeat = true;
                    var dx = Expression.variable('x');
                    dx.mark('dx');
                    var integral = Expression.integral(addition, dx);
                    integral.mark('I');
                    integral.name(Expression.RuleType.IntegrationAddition);
                    return integral;
                },
                AdditionIntegral: function () {
                    var func = Expression.func('f', 'x');
                    func.mark('f');
                    func.dependency('up:.integral', 'respectTo', Expression.Dependency.VariableRelation);

                    var dx = Expression.variable('x');
                    dx.mark('dx');
                    var integral = Expression.integral(func, dx);
                    integral.mark('I');
                    var addition = Expression.addition(integral);
                    addition.repeat = true;
                    addition.mark('A');
                    addition.name(Expression.RuleType.AdditionIntegral);
                    return addition;
                },
                IntegrationByParts: function () {
                    var dv = Expression.variable('v');
                    dv.mark('dv');
                    var du = Expression.variable('u');
                    du.mark('du');
                    var Fx = Expression.func('f', du);
                    Fx.dependency('up:.integral', 'respectTo', Expression.Dependency.ConstRelation);
                    var integral = Expression.integral(Fx, dv);
                    integral.name(Expression.RuleType.IntegrationByParts);
                    return integral;
                },
                IntegrationByPartsComplete: function () {
                    var u1 = Expression.variable('u');
                    u1.mark('u_1');
                    var f = Expression.func('f', u1);

                    var v1 = Expression.variable('v');
                    v1.mark('v_1');
                    var g = Expression.func('g', v1);
                    f.dependency('sibling', '', Expression.Dependency.SiblingDependence);
                    g.dependency('sibling', '', Expression.Dependency.SiblingDependence);

                    var mul = Expression.multiplication(f, g);

                    var v2 = Expression.variable('v');
                    v2.mark('v_2');
                    var g2 = Expression.func('g', v2);
                    g2.dependency('up:.integral', 'respectTo', Expression.Dependency.VariableRelation);

                    var du = Expression.variable('u');
                    du.mark('u_2');
                    var integral = Expression.integral(g2, du);

                    var subtraction = Expression.subtraction(mul, integral);

                    subtraction.name(Expression.RuleType.IntegrationByPartsComplete);

                    return subtraction;
                },
                Fudx: function () {
                    var udx = Expression.variable('x');
                    udx.mark('u_dx');

                    var u = Expression.func('u', udx);
                    u.mark('u');

                    var dx = Expression.variable('x');
                    dx.mark('dx');

                    var fu = Expression.func('f', u);

                    var integral = Expression.integral(fu, dx);
                    integral.mark('I');

                    integral.name(Expression.RuleType.Fudx);

                    return integral;
                },
                FuOveruprimedx: function () {
                    var du3 = Expression.variable('u');
                    du3.mark('du3');

                    var FuPrime = Expression.derivative('f', 1, du3);

                    var du2 = Expression.variable('u');
                    du2.mark('du2');

                    var Fu = Expression.func('f', du2);

                    var du = Expression.variable('u');
                    du.mark('du');

                    var fraction = Expression.fraction(Fu, FuPrime);

                    var integral = Expression.integral(fraction, du);
                    integral.name(Expression.RuleType.FuOveruprimedx);
                    return integral;
                },
                OneOverX: function () {

                    var x = Expression.variable('x');
                    x.mark('x');
                    x.dependency('up:.integral', 'respectTo', Expression.Dependency.VariableRelation);

                    var one = Expression.variable('1');

                    var fraction = Expression.fraction(one, x);

                    var dx = Expression.variable('x');

                    var integral = Expression.integral(fraction, dx);

                    integral.name(Expression.RuleType.OneOverX);

                    return integral;
                },
                NaturalLogAbsX: function () {

                    var x = Expression.variable('x');
                    x.mark('x');

                    var abs = Expression.abs(x);

                    var ln = Expression.ln(abs);
                    ln.dependency('sibling', '', Expression.Dependency.SiblingIndependence);

                    var c = Expression.variable('c');

                    var addition = Expression.addition(ln, c);

                    addition.name(Expression.RuleType.NaturalLogAbsX);

                    return addition;
                },
                GeneralFormula8A: function () {
                    var a = Expression.variable('a');
                    a.mark('a');

                    var x = Expression.variable('x');
                    x.mark('x');

                    var x2 = Expression.power(x, 2);

                    var a2 = Expression.power(a, 2);

                    var denominator = Expression.addition(x2, a2);
                    x2.dependency('sibling', '', Expression.Dependency.SiblingIndependence);
                    x2.dependency('parent.parent.parent', 'respectTo', Expression.Dependency.VariableRelation);

                    var one = Expression.variable('1');

                    var f = Expression.fraction(one, denominator);

                    var dx = Expression.variable('x');

                    var integral = Expression.integral(f, dx);
                    integral.name(Expression.RuleType.GeneralFormula8A);


                    return integral;
                },
                GeneralFormula8B: function () {

                    var xtan = Expression.variable('x');
                    xtan.mark('x');

                    var atan = Expression.variable('a');
                    atan.mark('a_tan');

                    xtan.dependency('sibling', '', Expression.Dependency.SiblingIndependence);

                    var tanexp = Expression.fraction(xtan, atan);

                    var tanInv = Expression.tan(tanexp, -1);

                    var denominator = Expression.variable('a');
                    denominator.mark('a');

                    var numerator = Expression.variable('1');

                    var fraction = Expression.fraction(numerator, denominator);

                    var c = Expression.variable('c');

                    var f = Expression.multiplication(fraction, tanInv);

                    var addition = Expression.addition(f, c);
                    addition.name(Expression.RuleType.GeneralFormula8B);

                    return addition;
                },
                /**
                 * http://myhandbook.info/form_integ.html
                 * General Formula 8 a
                 * @return {MEPH.math.Expression}
                 **/
                GeneralFormula9A: function () {
                    var a = Expression.variable('a');
                    a.mark('a');

                    var x = Expression.variable('x');
                    x.mark('x');

                    var a2 = Expression.power(a, 2);
                    var x2 = Expression.power(x, 2);
                    x2.dependency('sibling', '', Expression.Dependency.SiblingIndependence);
                    x2.dependency('parent.parent.parent', 'respectTo', Expression.Dependency.VariableRelation);

                    var denominator = Expression.subtraction(x2, a2);

                    var numerator = Expression.variable('1');
                    var dx = Expression.variable('x');
                    var f = Expression.fraction(numerator, denominator);

                    var integral = Expression.integral(f, dx);
                    integral.name(Expression.RuleType.GeneralFormula9A);

                    return integral;
                },
                /**
                 * http://myhandbook.info/form_integ.html
                 * General Formula 8 b
                 * @return {MEPH.math.Expression}
                 **/
                GeneralFormula9B: function () {
                    var a2 = Expression.variable('a');
                    a2.mark('a2');

                    var x2 = Expression.variable('x');
                    x2.mark('x2');

                    x2.dependency('sibling', '', Expression.Dependency.SiblingIndependence);

                    var denominator = Expression.addition(x2, a2);

                    var a1 = Expression.variable('a');
                    a1.mark('a1');

                    var x1 = Expression.variable('x');
                    x1.mark('x1');

                    x1.dependency('sibling', '', Expression.Dependency.SiblingIndependence);

                    var numerator = Expression.subtraction(x1, a1);
                    var frac = Expression.fraction(numerator, denominator);

                    numerator.dependency('sibling', '', Expression.Dependency.SiblingDependence);

                    var abs = Expression.abs(frac);

                    var ln = Expression.ln(abs);

                    var two = Expression.variable('2');

                    var a3 = Expression.variable('a');
                    a3.mark('a3');
                    var denom = Expression.multiplication(two, a3);

                    var num = Expression.variable('1');

                    var fraction = Expression.fraction(num, denom);

                    var f = Expression.multiplication(fraction, ln);

                    var c = Expression.variable('c');

                    var addition = Expression.addition(f, c);

                    addition.name(Expression.RuleType.GeneralFormula9B);

                    return addition;
                },
                /**
                 * http://myhandbook.info/form_integ.html
                 * Trigonometric Formula 10 a
                 * @return {MEPH.math.Expression}
                 **/
                TrigonometricFormula10A: function () {
                    var dx = Expression.variable('x');
                    dx.mark('dx');

                    var x = Expression.variable('x');

                    x.mark('x');

                    var sin = Expression.sin(x);

                    var integral = Expression.integral(sin, dx);

                    integral.name(Expression.RuleType.TrigonometricFormula10A);

                    return integral;
                },
                /**
                 * http://myhandbook.info/form_integ.html
                 * Trigonometric Formula 10 b
                 * @return {MEPH.math.Expression}
                 **/
                TrigonometricFormula10B: function () {
                    var c = Expression.variable('c');

                    var x = Expression.variable('x');
                    x.mark('x');

                    var cosine = Expression.cos(x);

                    var neg1 = Expression.multiplication(-1, cosine);


                    var addition = Expression.addition(neg1, c);

                    addition.name(Expression.RuleType.TrigonometricFormula10B);

                    return addition;
                },
                /**
                 * http://myhandbook.info/form_integ.html
                 * Trigonometric Formula 10 a
                 * @return {MEPH.math.Expression}
                 **/
                TrigonometricFormula11A: function () {
                    var dx = Expression.variable('x');
                    dx.mark('dx');

                    var x = Expression.variable('x');

                    x.mark('x');

                    var cos = Expression.cos(x);

                    var integral = Expression.integral(cos, dx);

                    integral.name(Expression.RuleType.TrigonometricFormula11A);

                    return integral;
                },
                /**
                 * http://myhandbook.info/form_integ.html
                 * Trigonometric Formula 10 b
                 * @return {MEPH.math.Expression}
                 **/
                TrigonometricFormula11B: function () {
                    var c = Expression.variable('c');

                    var x = Expression.variable('x');
                    x.mark('x');

                    var sin = Expression.sin(x);

                    var addition = Expression.addition(sin, c);

                    addition.name(Expression.RuleType.TrigonometricFormula11B);

                    return addition;
                },
                IGeneralFormula12a: function () {

                    var x = Expression.anything();
                    x.dependency('up:.integral', Expression['function'].respectTo, Expression.Dependency.VariableRelation);
                    x.mark('X');

                    var tan = Expression.tan(x);

                    var dx = Expression.variable('x');
                    dx.mark('dx');

                    var integral = Expression.integral(tan, dx);

                    integral.name(Expression.RuleType.Integration.IGeneralFormula12a);

                    return integral;
                },
                IGeneralFormula12b: function () {
                    var x = Expression.anything();
                    x.mark('X');

                    var sec = Expression.sec(x);

                    var abs = Expression.abs(sec);

                    var ln = Expression.ln(abs);

                    var c = Expression.variable('c');

                    var addition = Expression.addition(ln, c);
                    addition.name(Expression.RuleType.Integration.IGeneralFormula12b);

                    return addition;
                },
                IGeneralFormula13a: function () {

                    var x = Expression.anything();
                    x.dependency('up:.integral', Expression['function'].respectTo, Expression.Dependency.VariableRelation);
                    x.mark('X');

                    var cot = Expression.cot(x);

                    var dx = Expression.variable('x');
                    dx.mark('dx');

                    var integral = Expression.integral(cot, dx);

                    integral.name(Expression.RuleType.Integration.IGeneralFormula13a);

                    return integral;
                },
                IGeneralFormula13b: function () {
                    var x = Expression.anything();
                    x.mark('X');

                    var sin = Expression.sin(x);

                    var abs = Expression.abs(sin);

                    var ln = Expression.ln(abs);

                    var c = Expression.variable('c');

                    var addition = Expression.addition(ln, c);
                    addition.name(Expression.RuleType.Integration.IGeneralFormula13b);

                    return addition;
                },
                IGeneralFormula14a: function () {

                    var x = Expression.anything();
                    x.dependency('up:.integral', Expression['function'].respectTo, Expression.Dependency.VariableRelation);
                    x.mark('X');

                    var sec = Expression.sec(x);
                    var power = Expression.power(sec, 2);
                    var dx = Expression.variable('x');
                    dx.mark('dx');

                    var integral = Expression.integral(power, dx);

                    integral.name(Expression.RuleType.Integration.IGeneralFormula14a);

                    return integral;
                },
                IGeneralFormula14b: function () {
                    var x = Expression.anything();
                    x.mark('X');

                    var tan = Expression.tan(x);

                    var c = Expression.variable('c');

                    var addition = Expression.addition(tan, c);
                    addition.name(Expression.RuleType.Integration.IGeneralFormula14b);

                    return addition;
                },
                IGeneralFormula15a: function () {

                    var x = Expression.anything();
                    x.dependency('up:.integral', Expression['function'].respectTo, Expression.Dependency.VariableRelation);
                    x.mark('X');

                    var csc = Expression.csc(x);
                    var power = Expression.power(csc, 2);
                    var dx = Expression.variable('x');
                    dx.mark('dx');

                    var integral = Expression.integral(power, dx);

                    integral.name(Expression.RuleType.Integration.IGeneralFormula15a);

                    return integral;
                },
                IGeneralFormula15b: function () {
                    var x = Expression.anything();
                    x.mark('X');

                    var cot = Expression.cot(x);

                    var c = Expression.variable('c');

                    var mul = Expression.multiplication(-1, cot);

                    var addition = Expression.addition(mul, c);

                    addition.name(Expression.RuleType.Integration.IGeneralFormula15b);

                    return addition;
                },
                IGeneralFormula16a: function () {

                    var x = Expression.anything();
                    x.dependency('up:.integral', Expression['function'].respectTo, Expression.Dependency.VariableRelation);
                    x.mark('X');

                    var tan = Expression.tan(x);
                    var power = Expression.power(tan, 2);
                    var dx = Expression.variable('x');
                    dx.mark('dx');

                    var integral = Expression.integral(power, dx);

                    integral.name(Expression.RuleType.Integration.IGeneralFormula16a);

                    return integral;
                },
                IGeneralFormula16b: function () {
                    var x = Expression.anything();
                    x.mark('X1');

                    var x2 = Expression.anything();
                    x2.mark('X2');

                    var tan = Expression.tan(x);

                    var c = Expression.variable('c');

                    var mul = Expression.multiplication(-1, x2);

                    var addition = Expression.addition(tan, mul, c);

                    addition.name(Expression.RuleType.Integration.IGeneralFormula16b);

                    return addition;
                },
                IGeneralFormula17a: function () {

                    var x = Expression.anything();
                    x.dependency('up:.integral', Expression['function'].respectTo, Expression.Dependency.VariableRelation);
                    x.mark('X');

                    var cot = Expression.cot(x);
                    var power = Expression.power(cot, 2);
                    var dx = Expression.variable('x');
                    dx.mark('dx');

                    var integral = Expression.integral(power, dx);

                    integral.name(Expression.RuleType.Integration.IGeneralFormula17a);

                    return integral;
                },
                IGeneralFormula17b: function () {
                    var x = Expression.anything();
                    x.mark('X1');

                    var x2 = Expression.anything();
                    x2.mark('X2');

                    var cot = Expression.cot(x);

                    var c = Expression.variable('c');

                    var mul = Expression.multiplication(-1, x2);

                    var addition = Expression.addition(cot, mul, c);

                    addition.name(Expression.RuleType.Integration.IGeneralFormula17b);

                    return addition;
                },
                IGeneralFormula18a: function () {

                    var x = Expression.anything();
                    x.dependency('up:.integral', Expression['function'].respectTo, Expression.Dependency.VariableRelation);
                    x.mark('X1');

                    var x2 = Expression.anything();
                    x2.dependency('up:.integral', Expression['function'].respectTo, Expression.Dependency.VariableRelation);
                    x2.mark('X2');

                    var sec = Expression.sec(x);
                    var tan = Expression.tan(x2);
                    var multiplication = Expression.multiplication(sec, tan);

                    var dx = Expression.variable('x');
                    dx.mark('dx');

                    var integral = Expression.integral(multiplication, dx);

                    integral.name(Expression.RuleType.Integration.IGeneralFormula18a);
                    integral.dependency('stay:', '', function (e, s) {
                        return Expression.Dependency.Matches(['X2', 'X1'], e, s);
                    }, true);

                    return integral;
                },
                IGeneralFormula18b: function () {
                    var x = Expression.anything();
                    x.mark('X');

                    var sec = Expression.sec(x);

                    var c = Expression.variable('c');

                    var addition = Expression.addition(sec, c);

                    addition.name(Expression.RuleType.Integration.IGeneralFormula18b);

                    return addition;
                },
                IGeneralFormula19a: function () {

                    var x = Expression.anything();
                    x.dependency('up:.integral', Expression['function'].respectTo, Expression.Dependency.VariableRelation);
                    x.mark('X1');

                    var x2 = Expression.anything();
                    x2.dependency('up:.integral', Expression['function'].respectTo, Expression.Dependency.VariableRelation);
                    x2.mark('X2');

                    var csc = Expression.csc(x);
                    var cot = Expression.cot(x2);
                    var multiplication = Expression.multiplication(csc, cot);

                    var dx = Expression.variable('x');
                    dx.mark('dx');

                    var integral = Expression.integral(multiplication, dx);

                    integral.name(Expression.RuleType.Integration.IGeneralFormula19a);
                    integral.dependency('stay:', '', function (e, s) {
                        return Expression.Dependency.Matches(['X2', 'X1'], e, s);
                    }, true);

                    return integral;
                },
                IGeneralFormula19b: function () {
                    var x = Expression.anything();
                    x.mark('X');

                    var csc = Expression.csc(x);

                    var c = Expression.variable('c');

                    var mul = Expression.multiplication(-1, csc);

                    var addition = Expression.addition(mul, c);

                    addition.name(Expression.RuleType.Integration.IGeneralFormula19b);

                    return addition;
                },
                IGeneralFormula20a: function () {

                    var x = Expression.anything();
                    x.dependency('up:.integral', Expression['function'].respectTo, Expression.Dependency.VariableRelation);
                    x.mark('X');

                    var sec = Expression.sec(x);

                    var dx = Expression.variable('x');
                    dx.mark('dx');

                    var integral = Expression.integral(sec, dx);

                    integral.name(Expression.RuleType.Integration.IGeneralFormula20a);

                    return integral;
                },
                IGeneralFormula20b: function () {
                    var x1 = Expression.anything();
                    x1.mark('X1');

                    var x2 = Expression.anything();
                    x2.mark('X2');

                    var c = Expression.variable('c');

                    var sec = Expression.sec(x1);

                    var tan = Expression.tan(x2);

                    var abs = Expression.abs(Expression.addition(sec, tan));

                    var ln = Expression.ln(abs);

                    var addition = Expression.addition(ln, c);

                    addition.name(Expression.RuleType.Integration.IGeneralFormula20b);

                    return addition;
                },
                IGeneralFormula21a: function () {

                    var x = Expression.anything();
                    x.dependency('up:.integral', Expression['function'].respectTo, Expression.Dependency.VariableRelation);
                    x.mark('X');

                    var csc = Expression.csc(x);

                    var dx = Expression.variable('x');
                    dx.mark('dx');

                    var integral = Expression.integral(csc, dx);

                    integral.name(Expression.RuleType.Integration.IGeneralFormula21a);

                    return integral;
                },
                IGeneralFormula21b: function () {
                    var x1 = Expression.anything();
                    x1.mark('X1');

                    var x2 = Expression.anything();
                    x2.mark('X2');

                    var c = Expression.variable('c');

                    var csc = Expression.csc(x1);

                    var cot = Expression.cot(x2);

                    var abs = Expression.abs(Expression.subtraction(csc, cot));

                    var ln = Expression.ln(abs);

                    var addition = Expression.addition(ln, c);

                    addition.name(Expression.RuleType.Integration.IGeneralFormula21b);

                    return addition;
                },
                IGeneralFormula24a: function () {

                    var x = Expression.anything();
                    x.dependency('up:.integral', Expression['function'].respectTo, Expression.Dependency.VariableRelation);
                    x.mark('X');

                    var po2 = Expression.anything();
                    po2.dependency('up:.integral', Expression['function'].respectTo, Expression.Dependency.ConstRelation);
                    po2.mark('N');

                    var sin = Expression.sin(x);
                    var power = Expression.power(sin, po2);

                    var dx = Expression.variable('x');
                    dx.mark('dx');

                    var integral = Expression.integral(power, dx);

                    integral.name(Expression.RuleType.Integration.IGeneralFormula24a);

                    return integral;
                },
                IGeneralFormula24b: function () {
                    var x = Expression.anything();
                    x.mark('X1');

                    var n2 = Expression.anything();
                    n2.mark('N2');

                    var x2 = Expression.anything();
                    x2.mark('X2');

                    var cos = Expression.cos(x2);

                    var sub = Expression.subtraction(n2, 1);

                    var sin = Expression.sin(x);

                    var power = Expression.power(sin, sub);

                    var n1 = Expression.anything();
                    n1.mark('N1');

                    var frac1 = Expression.division(Expression.variable(1), n1);

                    var part1 = Expression.multiplication(-1, frac1, power, cos);

                    var n3 = Expression.anything();
                    n3.mark('N3');

                    var sub2 = Expression.subtraction(n3, 1);

                    var n4 = Expression.anything();
                    n4.mark('N4');

                    var frac2 = Expression.division(sub2, n4);

                    var x3 = Expression.anything();
                    x3.mark('X3');

                    var n5 = Expression.anything();
                    n5.mark('N5');

                    var sinint = Expression.sin(x3);
                    var po3 = Expression.subtraction(n5, 2);
                    var powersin = Expression.power(sinint, po3);

                    var dx = Expression.variable('x');
                    dx.mark('dx');

                    var integral = Expression.integral(sinint, dx);


                    var part2 = Expression.multiplication(frac2, integral);

                    var addition = Expression.addition(part1, part2);
                    addition.name(Expression.RuleType.Integration.IGeneralFormula24b);
                    return addition;
                },
                IGeneralFormula25a: function () {

                    var x = Expression.anything();
                    x.dependency('up:.integral', Expression['function'].respectTo, Expression.Dependency.VariableRelation);
                    x.mark('X');

                    var po2 = Expression.anything();
                    po2.dependency('up:.integral', Expression['function'].respectTo, Expression.Dependency.ConstRelation);
                    po2.mark('N');

                    var cos = Expression.cos(x);
                    var power = Expression.power(cos, po2);

                    var dx = Expression.variable('x');
                    dx.mark('dx');

                    var integral = Expression.integral(power, dx);

                    integral.name(Expression.RuleType.Integration.IGeneralFormula25a);

                    return integral;
                },
                IGeneralFormula25b: function () {
                    var x = Expression.anything();
                    x.mark('X1');

                    var n2 = Expression.anything();
                    n2.mark('N2');

                    var x2 = Expression.anything();
                    x2.mark('X2');

                    var sin = Expression.sin(x2);

                    var sub = Expression.subtraction(n2, 1);

                    var cos = Expression.cos(x);

                    var power = Expression.power(cos, sub);

                    var n1 = Expression.anything();
                    n1.mark('N1');

                    var frac1 = Expression.division(Expression.variable(1), n1);

                    var part1 = Expression.multiplication(frac1, power, sin);

                    var n3 = Expression.anything();
                    n3.mark('N3');

                    var sub2 = Expression.subtraction(n3, 1);

                    var n4 = Expression.anything();
                    n4.mark('N4');

                    var frac2 = Expression.division(sub2, n4);

                    var x3 = Expression.anything();
                    x3.mark('X3');

                    var n5 = Expression.anything();
                    n5.mark('N5');

                    var cosint = Expression.cos(x3);
                    var po3 = Expression.subtraction(n5, 2);
                    var powersin = Expression.power(cosint, po3);

                    var dx = Expression.variable('x');
                    dx.mark('dx');

                    var integral = Expression.integral(cosint, dx);


                    var part2 = Expression.multiplication(frac2, integral);

                    var addition = Expression.addition(part1, part2);
                    addition.name(Expression.RuleType.Integration.IGeneralFormula25b);
                    return addition;
                },
                IGeneralFormula26a: function () {
                    var dx = Expression.variable('x');
                    dx.mark('dx');

                    var x = Expression.anything('x');
                    x.dependency('up:.integral', Expression['function'].respectTo, Expression.Dependency.VariableRelation);
                    x.mark('X');

                    var sinh = Expression.sinh(x);

                    var integral = Expression.integral(sinh, dx);

                    integral.name(Expression.RuleType.Integration.IGeneralFormula26a);

                    return integral;
                },
                IGeneralFormula26b: function () {
                    var c = Expression.variable('c');

                    var x = Expression.anything('x');
                    x.mark('X');

                    var cosh = Expression.cosh(x);

                    var addition = Expression.addition(cosh, c);

                    addition.name(Expression.RuleType.Integration.IGeneralFormula26b);

                    return addition;
                },
                IGeneralFormula27a: function () {
                    var dx = Expression.variable('x');
                    dx.mark('dx');

                    var x = Expression.anything('x');
                    x.dependency('up:.integral', Expression['function'].respectTo, Expression.Dependency.VariableRelation);
                    x.mark('X');

                    var cosh = Expression.cosh(x);

                    var integral = Expression.integral(cosh, dx);

                    integral.name(Expression.RuleType.Integration.IGeneralFormula27a);

                    return integral;
                },
                IGeneralFormula27b: function () {
                    var c = Expression.variable('c');

                    var x = Expression.anything('x');
                    x.mark('X');

                    var sinh = Expression.sinh(x);

                    var addition = Expression.addition(sinh, c);

                    addition.name(Expression.RuleType.Integration.IGeneralFormula27b);

                    return addition;
                },
                IGeneralFormula28a: function () {
                    var dx = Expression.variable('x');
                    dx.mark('dx');

                    var x = Expression.anything('x');
                    x.dependency('up:.integral', Expression['function'].respectTo, Expression.Dependency.VariableRelation);
                    x.mark('X');

                    var tanh = Expression.tanh(x);

                    var integral = Expression.integral(tanh, dx);

                    integral.name(Expression.RuleType.Integration.IGeneralFormula28a);

                    return integral;
                },
                IGeneralFormula28b: function () {
                    var c = Expression.variable('c');

                    var x = Expression.anything('x');
                    x.mark('X');

                    var cosh = Expression.cosh(x);

                    var ln = Expression.ln(cosh);

                    var addition = Expression.addition(ln, c);

                    addition.name(Expression.RuleType.Integration.IGeneralFormula28b);

                    return addition;
                },
                IGeneralFormula29a: function () {
                    var dx = Expression.variable('x');
                    dx.mark('dx');

                    var x = Expression.anything('x');
                    x.dependency('up:.integral', Expression['function'].respectTo, Expression.Dependency.VariableRelation);
                    x.mark('X');

                    var coth = Expression.coth(x);

                    var integral = Expression.integral(coth, dx);

                    integral.name(Expression.RuleType.Integration.IGeneralFormula29a);

                    return integral;
                },
                IGeneralFormula29b: function () {
                    var c = Expression.variable('c');

                    var x = Expression.anything('x');
                    x.mark('X');

                    var sinh = Expression.sinh(x);

                    var ln = Expression.ln(sinh);

                    var addition = Expression.addition(ln, c);

                    addition.name(Expression.RuleType.Integration.IGeneralFormula29b);

                    return addition;
                },
                IGeneralFormula30a: function () {
                    var dx = Expression.variable('x');
                    dx.mark('dx');

                    var x = Expression.anything('x');
                    x.dependency('up:.integral', Expression['function'].respectTo, Expression.Dependency.VariableRelation);
                    x.mark('X');

                    var sech = Expression.sech(x);

                    var integral = Expression.integral(sech, dx);

                    integral.name(Expression.RuleType.Integration.IGeneralFormula30a);

                    return integral;
                },
                IGeneralFormula30b: function () {
                    var c = Expression.variable('c');

                    var x = Expression.anything('x');
                    x.mark('X');

                    var tanh = Expression.tanh(x);

                    var sin = Expression.sin(tanh);

                    var power = Expression.power(sin, -1);

                    var addition = Expression.addition(power, c);

                    addition.name(Expression.RuleType.Integration.IGeneralFormula30b);

                    return addition;
                },
                IGeneralFormula31a: function () {
                    var dx = Expression.variable('x');
                    dx.mark('dx');

                    var x = Expression.anything('x');
                    x.dependency('up:.integral', Expression['function'].respectTo, Expression.Dependency.VariableRelation);
                    x.mark('X');

                    var csch = Expression.csch(x);

                    var integral = Expression.integral(csch, dx);

                    integral.name(Expression.RuleType.Integration.IGeneralFormula31a);

                    return integral;
                },
                IGeneralFormula31b: function () {
                    var c = Expression.variable('c');

                    var x = Expression.anything('x');
                    x.mark('X');

                    var div = Expression.division(x, Expression.variable(2));

                    var tanh = Expression.tanh(div);

                    var ln = Expression.ln(tanh);

                    var addition = Expression.addition(ln, c);

                    addition.name(Expression.RuleType.Integration.IGeneralFormula31b);

                    return addition;
                },
                IGeneralFormula32a: function () {
                    var dx = Expression.variable('x');
                    dx.mark('dx');

                    var x = Expression.anything('x');
                    x.dependency('up:.integral', Expression['function'].respectTo, Expression.Dependency.VariableRelation);
                    x.mark('X');

                    var sech = Expression.sech(x);

                    var power = Expression.power(sech, 2);

                    var integral = Expression.integral(power, dx);

                    integral.name(Expression.RuleType.Integration.IGeneralFormula32a);

                    return integral;
                },
                IGeneralFormula32b: function () {
                    var c = Expression.variable('c');

                    var x = Expression.anything('x');
                    x.mark('X');


                    var tanh = Expression.tanh(x);

                    var addition = Expression.addition(tanh, c);

                    addition.name(Expression.RuleType.Integration.IGeneralFormula32b);

                    return addition;
                },
                IGeneralFormula33a: function () {
                    var dx = Expression.variable('x');
                    dx.mark('dx');

                    var x = Expression.anything('x');
                    x.dependency('up:.integral', Expression['function'].respectTo, Expression.Dependency.VariableRelation);
                    x.mark('X');

                    var csch = Expression.csch(x);

                    var power = Expression.power(csch, 2);

                    var integral = Expression.integral(power, dx);

                    integral.name(Expression.RuleType.Integration.IGeneralFormula33a);

                    return integral;
                },
                IGeneralFormula33b: function () {
                    var c = Expression.variable('c');

                    var x = Expression.anything('x');
                    x.mark('X');


                    var coth = Expression.coth(x);

                    var mul = Expression.multiplication(-1, coth);

                    var addition = Expression.addition(mul, c);

                    addition.name(Expression.RuleType.Integration.IGeneralFormula33b);

                    return addition;
                },
                IGeneralFormula34a: function () {
                    var dx = Expression.variable('x');
                    dx.mark('dx');

                    var x = Expression.anything('x');
                    x.dependency('up:.integral', Expression['function'].respectTo, Expression.Dependency.VariableRelation);
                    x.mark('X');

                    var tanh = Expression.tanh(x);

                    var power = Expression.power(tanh, 2);

                    var integral = Expression.integral(power, dx);

                    integral.name(Expression.RuleType.Integration.IGeneralFormula34a);

                    return integral;
                },
                IGeneralFormula34b: function () {
                    var c = Expression.variable('c');

                    var x = Expression.anything('x');
                    x.mark('X1');

                    var x2 = Expression.anything('x');
                    x2.mark('X2');


                    var tanh = Expression.tanh(x);

                    var mul = Expression.multiplication(-1, tanh);

                    var addition = Expression.addition(x2, mul, c);

                    addition.name(Expression.RuleType.Integration.IGeneralFormula34b);

                    return addition;
                },
                IGeneralFormula35a: function () {
                    var dx = Expression.variable('x');
                    dx.mark('dx');

                    var x = Expression.anything('x');
                    x.dependency('up:.integral', Expression['function'].respectTo, Expression.Dependency.VariableRelation);
                    x.mark('X');

                    var coth = Expression.coth(x);

                    var power = Expression.power(coth, 2);

                    var integral = Expression.integral(power, dx);

                    integral.name(Expression.RuleType.Integration.IGeneralFormula35a);

                    return integral;
                },
                IGeneralFormula35b: function () {
                    var c = Expression.variable('c');

                    var x = Expression.anything('x');
                    x.mark('X1');

                    var x2 = Expression.anything('x');
                    x2.mark('X2');


                    var coth = Expression.coth(x);

                    var mul = Expression.multiplication(-1, coth);

                    var addition = Expression.addition(x2, mul, c);

                    addition.name(Expression.RuleType.Integration.IGeneralFormula35b);

                    return addition;
                },
                IGeneralFormula36a: function () {

                    var x = Expression.anything();
                    x.dependency('up:.integral', Expression['function'].respectTo, Expression.Dependency.VariableRelation);
                    x.mark('X1');

                    var x2 = Expression.anything();
                    x2.dependency('up:.integral', Expression['function'].respectTo, Expression.Dependency.VariableRelation);
                    x2.mark('X2');

                    var sech = Expression.sech(x);
                    var tanh = Expression.tanh(x2);
                    var multiplication = Expression.multiplication(sech, tanh);

                    var dx = Expression.variable('x');
                    dx.mark('dx');

                    var integral = Expression.integral(multiplication, dx);

                    integral.name(Expression.RuleType.Integration.IGeneralFormula36a);
                    integral.dependency('stay:', '', function (e, s) {
                        return Expression.Dependency.Matches(['X2', 'X1'], e, s);
                    }, true);

                    return integral;
                },
                IGeneralFormula36b: function () {
                    var x = Expression.anything();
                    x.mark('X');

                    var sech = Expression.sech(x);

                    var c = Expression.variable('c');
                    var mul = Expression.multiplication(-1, sech);
                    var addition = Expression.addition(mul, c);

                    addition.name(Expression.RuleType.Integration.IGeneralFormula36b);

                    return addition;
                },
                IGeneralFormula37a: function () {

                    var x = Expression.anything();
                    x.dependency('up:.integral', Expression['function'].respectTo, Expression.Dependency.VariableRelation);
                    x.mark('X1');

                    var x2 = Expression.anything();
                    x2.dependency('up:.integral', Expression['function'].respectTo, Expression.Dependency.VariableRelation);
                    x2.mark('X2');

                    var csch = Expression.csch(x);
                    var coth = Expression.coth(x2);
                    var multiplication = Expression.multiplication(csch, coth);

                    var dx = Expression.variable('x');
                    dx.mark('dx');

                    var integral = Expression.integral(multiplication, dx);

                    integral.name(Expression.RuleType.Integration.IGeneralFormula37a);
                    integral.dependency('stay:', '', function (e, s) {
                        return Expression.Dependency.Matches(['X2', 'X1'], e, s);
                    }, true);

                    return integral;
                },
                IGeneralFormula37b: function () {
                    var x = Expression.anything();
                    x.mark('X');

                    var csch = Expression.csch(x);

                    var c = Expression.variable('c');
                    var mul = Expression.multiplication(-1, csch);
                    var addition = Expression.addition(mul, c);

                    addition.name(Expression.RuleType.Integration.IGeneralFormula37b);

                    return addition;
                },
                IGeneralFormula38a: function () {

                    var x = Expression.anything();
                    x.dependency('up:.integral', Expression['function'].respectTo, Expression.Dependency.VariableRelation);
                    x.mark('X');

                    var sinh = Expression.sinh(x);
                    var power = Expression.power(sinh, 2);

                    var dx = Expression.variable('x');
                    dx.mark('dx');

                    var integral = Expression.integral(power, dx);

                    integral.name(Expression.RuleType.Integration.IGeneralFormula38a);

                    return integral;
                },
                IGeneralFormula38b: function () {
                    var x = Expression.anything();
                    x.mark('X1');

                    var x2 = Expression.anything();
                    x2.mark('X2');

                    var sinh = Expression.sinh(Expression.multiplication(2, x));

                    var c = Expression.variable('c');

                    var divi = Expression.division(sinh, 4);
                    var divi2 = Expression.division(x2, 2);
                    var addition = Expression.addition(divi, Expression.multiplication(-1, divi2), c);

                    addition.name(Expression.RuleType.Integration.IGeneralFormula38b);

                    return addition;
                },
                IGeneralFormula39a: function () {

                    var x = Expression.anything();
                    x.dependency('up:.integral', Expression['function'].respectTo, Expression.Dependency.VariableRelation);
                    x.mark('X');

                    var cosh = Expression.cosh(x);
                    var power = Expression.power(cosh, 2);

                    var dx = Expression.variable('x');
                    dx.mark('dx');

                    var integral = Expression.integral(power, dx);

                    integral.name(Expression.RuleType.Integration.IGeneralFormula39a);

                    return integral;
                },
                IGeneralFormula39b: function () {
                    var x = Expression.anything();
                    x.mark('X1');

                    var x2 = Expression.anything();
                    x2.mark('X2');

                    var sinh = Expression.sinh(Expression.multiplication(2, x));

                    var c = Expression.variable('c');

                    var divi = Expression.division(sinh, 4);
                    var divi2 = Expression.division(x2, 2);
                    var addition = Expression.addition(divi, divi2, c);

                    addition.name(Expression.RuleType.Integration.IGeneralFormula39b);

                    return addition;
                },
                IGeneralFormula40a: function () {

                    var x = Expression.anything();
                    x.dependency('up:.integral', Expression['function'].respectTo, Expression.Dependency.VariableRelation);
                    x.mark('X');

                    var e = Expression.e(x);

                    var dx = Expression.variable('x');
                    dx.mark('dx');

                    var integral = Expression.integral(e, dx);

                    integral.name(Expression.RuleType.Integration.IGeneralFormula40a);

                    return integral;
                },
                IGeneralFormula40b: function () {
                    var x = Expression.anything();
                    x.mark('X');

                    var e = Expression.e(x);

                    var c = Expression.variable('c');

                    var addition = Expression.addition(e, c);

                    addition.name(Expression.RuleType.Integration.IGeneralFormula40b);

                    return addition;
                },
                IGeneralFormula41a: function () {
                    var x = Expression.anything();
                    x.dependency('up:.integral', Expression['function'].respectTo, Expression.Dependency.VariableRelation);
                    x.mark('X');

                    var a = Expression.anything();
                    a.dependency('up:.integral', Expression['function'].respectTo, Expression.Dependency.ConstRelation);
                    a.mark('A');

                    var a = Expression.power(a, x);

                    var dx = Expression.variable('x');
                    dx.mark('dx');

                    var integral = Expression.integral(a, dx);

                    integral.name(Expression.RuleType.Integration.IGeneralFormula41a);

                    return integral;
                },
                IGeneralFormula41b: function () {
                    var x = Expression.anything();
                    x.mark('X');

                    var a1 = Expression.anything();
                    a1.mark('A1');

                    var a2 = Expression.anything();
                    a2.mark('A2');

                    var power = Expression.power(a1, x);

                    var ln = Expression.ln(a2);

                    var div = Expression.division(power, ln);

                    var c = Expression.variable('c');

                    var addition = Expression.addition(div, c);

                    addition.name(Expression.RuleType.Integration.IGeneralFormula41b);

                    return addition;
                },
                IGeneralFormula42a: function () {
                    var x = Expression.anything();
                    x.dependency('up:.integral', Expression['function'].respectTo, Expression.Dependency.VariableRelation);
                    x.mark('X');

                    var dx = Expression.variable('x');
                    dx.mark('dx');

                    var ln = Expression.ln(x);

                    var integral = Expression.integral(ln, dx);

                    integral.name(Expression.RuleType.Integration.IGeneralFormula42a);

                    return integral;
                },
                IGeneralFormula42b: function () {
                    var x = Expression.anything();
                    x.mark('X1');

                    var x2 = Expression.anything();
                    x2.mark('X2');

                    var ln = Expression.ln(x2);

                    var sub = Expression.subtraction(ln, 1);

                    var mul = Expression.multiplication(x, sub);

                    var c = Expression.variable('c');

                    var addition = Expression.addition(mul, c);

                    addition.name(Expression.RuleType.Integration.IGeneralFormula42b);

                    return addition;
                },
                IGeneralFormula43a: function () {
                    var x = Expression.anything();
                    x.dependency('up:.integral', Expression['function'].respectTo, Expression.Dependency.VariableRelation);
                    x.mark('X');

                    var a = Expression.anything();
                    a.dependency('up:.integral', Expression['function'].respectTo, Expression.Dependency.ConstRelation);
                    a.mark('A');

                    var dx = Expression.variable('x');
                    dx.mark('dx');

                    var log = Expression.log(x, a);

                    var integral = Expression.integral(log, dx);

                    integral.name(Expression.RuleType.Integration.IGeneralFormula43a);

                    return integral;
                },
                IGeneralFormula43b: function () {
                    var x = Expression.anything();
                    x.mark('X1');

                    var x2 = Expression.anything();
                    x2.mark('X2');

                    var a = Expression.anything();
                    a.mark('A');
                    var lnx = Expression.ln(x2);
                    var sub = Expression.subtraction(lnx, 1);
                    var ln = Expression.ln(a);

                    var fract = Expression.division(x, ln);
                    var mul = Expression.multiplication(fract, sub);

                    var c = Expression.variable('c');

                    var addition = Expression.addition(mul, c);

                    addition.name(Expression.RuleType.Integration.IGeneralFormula43b);

                    return addition;
                },
                IGeneralFormula44a: function () {
                    var x = Expression.anything();
                    x.dependency('up:.integral', Expression['function'].respectTo, Expression.Dependency.VariableRelation);
                    x.mark('X1');

                    var x2 = Expression.anything();
                    x2.dependency('up:.integral', Expression['function'].respectTo, Expression.Dependency.VariableRelation);
                    x2.mark('X2');

                    var a = Expression.anything();
                    a.dependency('up:.integral', Expression['function'].respectTo, Expression.Dependency.ConstRelation);
                    a.mark('A');

                    var dx = Expression.variable('x');
                    dx.mark('dx');

                    var eax = Expression.e(Expression.multiplication(a, x));
                    var mul = Expression.multiplication(x2, eax);
                    var integral = Expression.integral(mul, dx);

                    integral.name(Expression.RuleType.Integration.IGeneralFormula44a);
                    integral.dependency('stay:', '', function (e, s) {
                        return Expression.Dependency.Matches(['X2', 'X1'], e, s);
                    }, true);

                    return integral;
                },
                IGeneralFormula44b: function () {
                    var x = Expression.anything();
                    x.mark('X1');

                    var x2 = Expression.anything();
                    x2.mark('X2');

                    var a = Expression.anything();
                    a.mark('A1');

                    var a2 = Expression.anything();
                    a2.mark('A2');

                    var a3 = Expression.anything();
                    a3.mark('A3');

                    var ax = Expression.multiplication(a3, x2);

                    var sub = Expression.subtraction(ax, 1);

                    var c = Expression.variable('c');

                    var eax = Expression.e(a, x);

                    var apo = Expression.power(a2, 2);

                    var frac = Expression.division(eax, apo)

                    var mul = Expression.multiplication(frac, sub);

                    var addition = Expression.addition(mul, c);

                    addition.name(Expression.RuleType.Integration.IGeneralFormula44b);

                    return addition;
                },
                IGeneralFormula45a: function () {

                    var x = Expression.anything('x');
                    x.dependency('up:.integral', Expression['function'].respectTo, Expression.Dependency.VariableRelation);
                    x.mark('X2');

                    var a = Expression.anything('A');
                    a.dependency('up:.integral', Expression['function'].respectTo, Expression.Dependency.ConstRelation);
                    a.mark('A');

                    var x2 = Expression.anything('x');
                    x2.dependency('up:.integral', Expression['function'].respectTo, Expression.Dependency.VariableRelation);
                    x2.mark('X1');
                    var mul = Expression.multiplication(a, x2);

                    var eax = Expression.e(mul);
                    eax.mark('EAX');

                    var div = Expression.division(eax, x);
                    div.mark('PARENT');

                    var dx = Expression.variable('x');
                    dx.mark('X');

                    var integral = Expression.integral(div, dx);

                    integral.name(Expression.RuleType.Integration.IGeneralFormula45a);

                    integral.dependency('stay:', '', function (e, s) {

                        return Expression.Dependency.Matches(['X2', 'X1'], e, s);
                    }, true);

                    integral.dependency('stay:', '', function (e, s) {

                        return Expression.Dependency.OrderRequired(['EAX', 'X2'], 'PARENT', e, s);
                    }, true);

                    return integral;
                },
                IGeneralFormula45b: function () {

                    var i1 = Expression.variable('i');
                    i1.mark('i');

                    var a = Expression.anything();
                    a.mark('A');

                    var x = Expression.anything();
                    x.mark('X1');

                    var mul = Expression.multiplication(a, x);

                    var top = Expression.power(mul, i1);

                    var i2 = Expression.variable('i');
                    i2.mark('i');

                    var i3 = Expression.variable('i');
                    i3.mark('i');

                    var fact = Expression.factorial(i3);

                    var bottom = Expression.multiplication(i2, fact);

                    var division = Expression.division(top, bottom);

                    var summation = Expression.summation(division, 1, Expression.symbols.Infinity, 'i');

                    var x = Expression.variable('x');
                    x.mark('X2');

                    var abs = Expression.abs(x);

                    var ln = Expression.ln(abs);

                    var c = Expression.variable('c');

                    var addition = Expression.addition(ln, summation, c);

                    addition.name(Expression.RuleType.Integration.IGeneralFormula45b);

                    return addition;
                },
                IGeneralFormula47a: function () {

                    var n = Expression.anything();
                    n.dependency('up:.integral', Expression['function'].respectTo, Expression.Dependency.ConstRelation);
                    n.mark('N');


                    var x1 = Expression.anything('asdfx');
                    x1.dependency('up:.integral', Expression['function'].respectTo, Expression.Dependency.VariableRelation);
                    x1.mark('X1');

                    var powx = Expression.power(x1, n);

                    var a = Expression.anything();
                    a.dependency('up:.integral', Expression['function'].respectTo, Expression.Dependency.ConstRelation);
                    a.mark('A');

                    var x2 = Expression.anything('fdasdx');
                    x2.dependency('up:.integral', Expression['function'].respectTo, Expression.Dependency.VariableRelation);
                    x2.mark('X2');

                    var eax = Expression.e(Expression.multiplication(a, x2));

                    var mul = Expression.multiplication(powx, eax);

                    var dx = Expression.variable('x');
                    dx.mark('dx');

                    var integral = Expression.integral(mul, dx);

                    integral.name(Expression.RuleType.Integration.IGeneralFormula47a);

                    integral.dependency('stay:', '', function (e, s) {
                        return Expression.Dependency.Matches(['X2', 'X1'], e, s);
                    }, true);

                    return integral;
                },
                IGeneralFormula47b: function () {
                    var a1 = Expression.anything();
                    a1.mark('A1');

                    var a2 = Expression.anything();
                    a2.mark('A2');

                    var a3 = Expression.anything();
                    a3.mark('A3');

                    var a4 = Expression.anything();
                    a4.mark('A4');

                    var x1 = Expression.anything();
                    x1.mark('X1');

                    var x2 = Expression.anything();
                    x2.mark('X2');

                    var x3 = Expression.anything();
                    x3.mark('X3');

                    var x4 = Expression.anything();
                    x4.mark('X4');

                    var n1 = Expression.anything();
                    n1.mark('N1');

                    var n2 = Expression.anything();
                    n2.mark('N2');

                    var n3 = Expression.anything();
                    n3.mark('N3');

                    var dx = Expression.anything('dx');
                    dx.mark('dx');

                    var nsub = Expression.subtraction(n3, 1);
                    var mul3 = Expression.multiplication(a4, x4);
                    var eax2 = Expression.e(mul3);
                    var xn1 = Expression.power(x3, nsub);

                    var mul2 = Expression.multiplication(xn1, eax2);

                    var integral = Expression.integral(mul2, dx);
                    var frac2 = Expression.division(n2, a3);
                    var part2 = Expression.multiplication(frac2, integral);

                    var mul1 = Expression.multiplication(a2, x2);

                    var eax = Expression.e(mul1);
                    var xn = Expression.power(x1, n1);
                    var fract = Expression.division(1, a1);
                    var part1 = Expression.multiplication(fract, xn, eax);

                    var subtraction = Expression.subtraction(part1, part2);

                    subtraction.name(Expression.RuleType.Integration.IGeneralFormula47b);

                    return subtraction;
                },
                IGeneralFormula48a: function () {

                    var n = Expression.anything();
                    n.dependency('up:.integral', Expression['function'].respectTo, Expression.Dependency.ConstRelation);
                    n.mark('N');


                    var x1 = Expression.anything('x');
                    x1.dependency('up:.integral', Expression['function'].respectTo, Expression.Dependency.VariableRelation);
                    x1.mark('X1');

                    var powx = Expression.power(x1, n);
                    powx.mark('POWX');
                    var a = Expression.anything();
                    a.dependency('up:.integral', Expression['function'].respectTo, Expression.Dependency.ConstRelation);
                    a.mark('A');

                    var x2 = Expression.anything('x');
                    x2.dependency('up:.integral', Expression['function'].respectTo, Expression.Dependency.VariableRelation);
                    x2.mark('X2');

                    var eax = Expression.e(Expression.multiplication(a, x2));
                    eax.mark('EAX');
                    var div = Expression.division(eax, powx);
                    div.mark('PARENT');

                    var dx = Expression.variable('x');
                    dx.mark('dx');

                    var integral = Expression.integral(div, dx);

                    integral.name(Expression.RuleType.Integration.IGeneralFormula48a);

                    integral.dependency('stay:', '', function (e, s) {
                        return Expression.Dependency.Matches(['X2', 'X1'], e, s);
                    }, true);

                    integral.dependency('stay:', '', function (e, s) {

                        return Expression.Dependency.OrderRequired(['EAX', 'POWX'], 'PARENT', e, s);
                    }, true);


                    return integral;
                },
                IGeneralFormula48b: function () {

                    var a = Expression.anything();
                    //a.dependency('up:.integral', Expression['function'].respectTo, Expression.Dependency.ConstRelation);
                    a.mark('A1');

                    var x = Expression.anything();
                    //x.dependency('up:.integral', Expression['function'].respectTo, Expression.Dependency.VariableRelation);
                    x.mark('X1');

                    var ax = Expression.multiplication(a, x);

                    var top = Expression.e(ax)

                    var x2 = Expression.anything();
                    //x2.dependency('up:.integral', Expression['function'].respectTo, Expression.Dependency.VariableRelation);
                    x2.mark('X2');

                    var n2 = Expression.anything();
                    n2.mark('N2');

                    var nsub = Expression.subtraction(n2, 1);


                    var bottom = Expression.power(x2, nsub);

                    var frac2 = Expression.division(top, bottom);

                    var part1 = Expression.multiplication(-1, frac2);

                    var a2 = Expression.anything();
                    //a2.dependency('up:.integral', Expression['function'].respectTo, Expression.Dependency.ConstRelation);
                    a2.mark('A2');

                    var dx = Expression.anything('x');
                    dx.mark('dx');

                    var a3 = Expression.anything();
                    //a3.dependency('up:.integral', Expression['function'].respectTo, Expression.Dependency.ConstRelation);
                    a3.mark('A3');

                    var x3 = Expression.anything();
                    //x3.dependency('up:.integral', Expression['function'].respectTo, Expression.Dependency.VariableRelation);
                    x3.mark('X3');

                    var mul2 = Expression.multiplication(a3, x3);

                    var eax = Expression.e(mul2);


                    var x4 = Expression.anything();
                    //x4.dependency('up:.integral', Expression['function'].respectTo, Expression.Dependency.VariableRelation);
                    x4.mark('X4');

                    var n3 = Expression.anything();
                    n3.mark('N3');

                    var nsub2 = Expression.subtraction(n3, 1);

                    var pon1 = Expression.power(x4, nsub2);

                    var frac3 = Expression.division(eax, pon1);

                    var integral2 = Expression.integral(frac3, dx);

                    var part2 = Expression.multiplication(a2, integral2);

                    var add = Expression.addition(part1, part2);

                    var n = Expression.anything('n');
                    n.mark('N1');

                    var sub = Expression.subtraction(n, 1);

                    var frac = Expression.division(1, sub);

                    var mul = Expression.multiplication(frac, add);

                    var c = Expression.variable('c');

                    var addition = Expression.addition(mul, c);

                    addition.name(Expression.RuleType.Integration.IGeneralFormula48b);

                    return addition;
                },
                IGeneralFormula49a: function () {

                    var x2 = Expression.anything();
                    x2.dependency('up:.integral', Expression['function'].respectTo, Expression.Dependency.VariableRelation);
                    x2.mark('X2');

                    var ln = Expression.ln(x2);

                    var n = Expression.anything();
                    n.dependency('up:.integral', Expression['function'].respectTo, Expression.Dependency.ConstRelation);
                    n.mark('N');

                    var x1 = Expression.anything();
                    x1.dependency('up:.integral', Expression['function'].respectTo, Expression.Dependency.VariableRelation);
                    x1.mark('X1');

                    var power = Expression.power(x1, n);

                    var mul = Expression.multiplication(power, ln);

                    var dx = Expression.anything('x');
                    dx.mark('dx');

                    var integral = Expression.integral(mul, dx);

                    integral.dependency('stay:', '', function (e, s) {
                        return Expression.Dependency.Matches(['X2', 'X1'], e, s);
                    }, true);

                    integral.name(Expression.RuleType.Integration.IGeneralFormula49a);

                    return integral;
                },
                IGeneralFormula49b: function () {

                    var n3 = Expression.anything();
                    //n3.dependency('up:.integral', Expression['function'].respectTo, Expression.Dependency.ConstRelation);
                    n3.mark('N3');

                    var add2 = Expression.addition(n3, 1);

                    var x2 = Expression.anything();
                    //x2.dependency('up:.integral', Expression['function'].respectTo, Expression.Dependency.VariableRelation);
                    x2.mark('X2');

                    var lnx = Expression.ln(x2);

                    var mul2 = Expression.multiplication(add2, lnx)

                    var middleplus = Expression.addition(mul2, -1);

                    var n1 = Expression.anything();
                    //n1.dependency('up:.integral', Expression['function'].respectTo, Expression.Dependency.ConstRelation);
                    n1.mark('N1');

                    var plus = Expression.addition(n1, 1);

                    var x1 = Expression.anything();
                    //x1.dependency('up:.integral', Expression['function'].respectTo, Expression.Dependency.VariableRelation);
                    x1.mark('X1');

                    var top = Expression.power(x1, plus);

                    var n2 = Expression.anything();
                    //n2.dependency('up:.integral', Expression['function'].respectTo, Expression.Dependency.ConstRelation);
                    n2.mark('N2');

                    var add = Expression.addition(n2, 1);

                    var bottom = Expression.power(add, 2);

                    var frac = Expression.division(top, bottom);

                    var mul = Expression.multiplication(frac, middleplus);

                    var c = Expression.variable('c');

                    var addition = Expression.addition(mul, c);

                    addition.name(Expression.RuleType.Integration.IGeneralFormula49b);

                    return addition;
                }
            }
        },
        /**
         * Flattens an expression.
         * @param {MEPH.math.Expression} expression
         * @param {String} type
         * @return {MEPH.math.Expression}
         **/
        Flatten: function (expression, type, started) {

            switch (type) {
                case Expression.type.power:
                    return Expression.FlattenPower(expression.copy(), type, true);
                default:
                    if (expression.type !== type) {
                        if (started) {
                            return [expression];
                        }
                        else {
                            return expression;
                        }
                    }
                    else {
                        var parts = expression.getValues().concatFluentReverse(function (x) {
                            if (x.type === type) {

                                return Expression.Flatten(x.copy(), type, true);

                            }
                            else {
                                return [x.copy()];
                            }
                        });
                        if (!started) {
                            var copy = expression.copy();

                            copy.clearParts();
                            parts.foreach(function (p) {
                                copy.addInput(p)
                                return p.parent(copy);
                            });

                            return copy;
                        }

                        return parts;
                    }
            }
        },
        /**
         * Flattens a power expression.
         * @param {MEPH.math.Expression} expression
         * @param {String} type
         * @return {MEPH.math.Expression}
         **/
        FlattenPower: function (expression, type, started) {
            //
            //            expression.addPart(Expression['function'].base, base);
            //           expression.addPart(Expression['function'].power, power);
            var exp = expression.partOrDefault(Expression['function'].base),
                variable,
                flattenedPower;
            switch (exp.type) {
                case Expression.type.power:
                    flattenedPower = Expression.FlattenPower(exp.copy(), type, started);
                    break;
                default:
                    return expression;
            }
            var powerval,
                power = flattenedPower.partOrDefault(Expression['function'].power);

            if (typeof power === 'object') {
                switch (power.type) {
                    case Expression.type.variable:
                        powerval = power.partOrDefault(Expression.type.variable)
                        powerval = isNaN(powerval) ? powerval : parseFloat(powerval);
                        break;
                }
            }
            else {
                powerval = isNaN(power) ? power : parseFloat(power);;
            }

            var expressionpower = expression.partOrDefault(Expression['function'].power);
            var expressionpowerval;
            if (typeof expressionpower === 'object') {
                expressionpowerval = expressionpower.partOrDefault(Expression.type.input) || expressionpower.partOrDefault(Expression.type.variable);
                switch (expressionpower.type) {
                    case Expression.type.variable:
                        expressionpowerval = isNaN(expressionpowerval) ? expressionpowerval : parseFloat(expressionpowerval);
                        break;
                }
            }
            else {
                expressionpowerval = isNaN(expressionpower) ? expressionpower : parseFloat(expressionpower);
            }

            if (!isNaN(powerval) && !isNaN(expressionpowerval)) {
                var part = flattenedPower.partOrDefault(Expression['function'].power);
                flattenedPower.remove(part);
                flattenedPower.addPart(Expression['function'].power, Expression.variable(powerval * expressionpowerval));
            }
            else {
                var part = flattenedPower.partOrDefault(Expression['function'].power);
                flattenedPower.remove(part);
                if (typeof powerval !== 'object') {
                    powerval = Expression.variable(powerval);
                }
                if (typeof expressionpowerval !== 'object') {
                    expressionpowerval = Expression.variable(expressionpowerval);
                }

                flattenedPower.addPart(Expression['function'].power, Expression.multiplication(powerval, expressionpowerval));
            }

            return flattenedPower;
        },
        /**
         * Creates associative groupings of a flattened expression.
         * @param {MEPH.math.Expression} expression
         * @returns {Array}
         **/
        createAssociativeGroupings: function (expression) {

            var sagset = MEPH.math.Set.sagset(expression.parts.length);
            return sagset.select(function (sag) {
                var set = sag;
                var perm = MEPH.math.Set.permutate(new Set([].interpolate(0, expression.parts.length, function (x) {
                    return x;
                })));

                var generateSetPermutations = function (set, index, max, $subtree) {
                    var superset = MEPH.math.Set.superset(new Set([].interpolate(0, $subtree.length, function (x) {
                        return $subtree[x];
                    }))).get();
                    var sub_super_set = (superset).where(function (x) {
                        return x.count(function (t) {
                            return t !== null;
                        }) === set[index];
                    });

                    var result = sub_super_set.select(function (y) {
                        return y.select(function (t, i) {
                            return y[i] !== null ? $subtree[i] : false;
                        }).where(function (x) {
                            return x !== false;
                        });
                    });

                    result = result.concatFluentReverse(function (subresult) {
                        var subtree = ($subtree.where(function (x) {
                            return !subresult.contains(function (t) { return t === x; })
                        }));
                        var generatedSubTree;
                        if (index < max - 1 && subtree.length) {
                            return generateSetPermutations(set, index + 1, max, subtree).select(function (st) {
                                return subresult.concat(st);
                            });
                        }

                        return index ? subresult : [subresult];
                    });

                    return result;
                };

                var output = generateSetPermutations(set, 0, expression.parts.length, [].interpolate(0, expression.parts.length, function (x) {
                    return x;
                })).select(function (x, index) {
                    return x.select(function (t) {
                        var val = expression.parts[t].val;
                        return val && val.copy ? val.copy() : val;
                    });
                });


                return {
                    set: set,
                    grouping: output
                }
            });

        },
        /**
         * Convert a grouping to expressions.
         * @param {Object} grouping
         * @param {String} type
         * @return {Array}
         **/
        convertGrouping: function (grouping, type) {
            return grouping.concatFluentReverse(function (group) {
                return group.grouping.select(function (t) {
                    return Expression.convertGroup({ set: group.set, grouping: t }, type);
                });
            })
        },
        /**
         * Convert a grouping to an expression.
         * @param {Object} grouping
         * @param {String} type
         * @return {MEPH.math.Expression}
         **/
        convertGroup: function (grouping, type) {
            var expression,
                index = 0,
                buffer = [],
                parentFunc;
            switch (type) {
                case Expression.type.multiplication:
                    parentFunc = Expression.multiplication;
                    break;
                case Expression.type.addition:
                    parentFunc = Expression.addition;
                    break;
            }
            [].interpolate(0, grouping.set.length, function (_s) {
                var s = grouping.set[_s];
                if (expression) {
                    var temp = grouping.grouping.subset(index, s + index);
                    expression = parentFunc.apply(null, [expression].concat(temp));
                    index = s + index;
                }
                else {
                    if (buffer.length || s > 1) {
                        if (buffer.length) {
                            var temp = grouping.grouping.subset(index, s + index);
                            expression = parentFunc.apply(null, buffer.concat(temp));
                            buffer = [];
                        }
                        else {
                            expression = parentFunc.apply(null, grouping.grouping.subset(index, s + index));
                        }
                        index = s + index;
                    }
                    else {
                        buffer.push(grouping.grouping[index]);
                        index++;
                    }
                }
            });
            return expression;
        },
        matchRule: function (expression, rule, markRule) {
            var res = expression.match(rule, true);
            if (res) {
                if (rule.dependenciesMarkAreRespected(expression)) {
                    if (!markRule) {
                        expression.clearMarks();
                    }
                }
                else {
                    return false;
                }
                expression.name(rule.name());
            }
            return res;
        },
        getMatch: function (expression) {
            return ExpressionMatch.getMatch(expression);
        },
        integrate: function (expression) {
            return ExpressionMatch.integrate(expression);
        },
        anything: function (v) {
            var expression = new Expression();
            expression.anything = v || null;
            expression.setExp(Expression.type.anything);
            return expression;
        },
        /**
         * When printing an expression, sub expressions of certain types should be wrapped in parenthesis,
         * for readability purposes.
         * @param {String} type
         **/
        requiresParenthesis: function (type) {
            switch (type) {
                case Expression.type.subtraction:
                case Expression.type.division:
                case Expression.type.multiplication:
                case Expression.type.addition:
                    return true;
                default: return false;
            }
        },
        /**
         * Math.pow(base , power);
         * @param {MEPH.math.Expression} power
         * @param {MEPH.math.Expression} base
         */
        power: function (base, power) {
            var expression = new Expression();
            expression.setExp(Expression.type.power);

            if (!(base instanceof Expression)) {
                base = Expression.variable(base);
            }
            expression.addPart(Expression['function'].base, base);

            if (!(power instanceof Expression)) {
                power = Expression.variable(power);
            }
            expression.addPart(Expression['function'].power, power);
            return expression;
        },
        /**
         * Math.sqrt(expression);
         * @param {MEPH.math.Expression} expression
         */
        sqrt: function (base) {
            var expression = new Expression();
            expression.setExp(Expression.type.sqrt);

            if (!(base instanceof Expression)) {
                base = Expression.variable(base);
            }

            expression.addPart(Expression['function'].input, base);

            return expression;
        },
        plusminus: function (a, b) {
            var expression = new Expression();
            expression.setExp(Expression.type.plusminus);
            expression.addPart(Expression['function'].input, a);
            expression.addPart(Expression['function'].input, b);
            return expression
        },
        /**
         * An expression representing the value '1'
         * @return {MEPH.math.Expression}
         **/
        one: function () {
            return Expression.variable(1);
        },
        zero: function () {
            return Expression.variable(0);
        },
        /**
         * If an expression represents the value '0' then true is returned otherwise false.
         * @return {MEPH.math.Expression}
         **/
        isZero: function (exp) {
            return Expression.zero().equals(exp, { exact: true });
        },
        /**
         * If an expression represents the value '1' then true is returned otherwise false.
         * @return {MEPH.math.Expression}
         **/
        isOne: function (exp) {
            return Expression.one().equals(Expression.variableOr(exp), { exact: true });
        },
        /**
         * Removes all the parts of an expression representing one.
         * @param {MEPH.math.Expression} exp
         **/
        removeOne: function (exp) {
            var oneparts = exp.getParts().where(function (x) { return Expression.isOne(x.val); });
            if (oneparts.length === exp.getParts().length) {
                oneparts = oneparts.subset(1);
            }
            oneparts.foreach(function (x) { return exp.remove(x.val); });
            if (exp.getParts().length === 1) {
                return exp.getParts().first().val;
            }
            return exp;
        },
        variable: function (variable) {
            var expression = new Expression();
            expression.setExp(Expression.type.variable, variable);
            return expression;
        },
        limit: function (exp, a, b) {
            var expression = new Expression();
            expression.setExp(Expression.type.limit);
            expression.addPart(Expression['function'].expression, exp);
            expression.addPart(Expression['function'].start, a);
            expression.addPart(Expression['function'].end, b);
            return expression;
        },
        factorial: function (a) {
            var expression = new Expression();
            expression.setExp(Expression.type.factorial);
            expression.addPart(Expression['function'].input, a);
            return expression;
        },
        summation: function (exp, a, b, respectTo) {
            var expression = new Expression();
            expression.setExp(Expression.type.summation);
            expression.addPart(Expression['function'].input, exp);
            if (a && !(a instanceof Expression)) {
                a = Expression.variable(a);
            }
            expression.addPart(Expression['function'].start, a);
            if (b && !(a instanceof Expression)) {
                b = Expression.variable(b);
            }
            expression.addPart(Expression['function'].end, b);
            if (respectTo && !(respectTo instanceof Expression)) {
                respectTo = Expression.variable(respectTo);
            }
            expression.addPart(Expression['function'].respectTo, respectTo)
            return expression;
        },
        /**
         * Expresses an addition function, a + b + c + ... + n
         **/
        addition: function (a, b) {
            return Expression.arithmetic.apply(null, [Expression.type.addition].concat(MEPHArray.convert(arguments)));
        },
        /**
         * Expresses an addition function, a - b - c - ... - n
         **/
        subtraction: function (a, b) {
            return Expression.arithmetic.apply(null, [Expression.type.subtraction].concat(MEPHArray.convert(arguments)));
        },
        /**
         * Expresses an multiplication function, a * b * c * ... * n
         **/
        multiplication: function (a, b) {
            return Expression.arithmetic.apply(null, [Expression.type.multiplication].concat(MEPHArray.convert(arguments)));
        },
        /**
         * Expresses an multiplication function, a * b * c * ... * n
         **/
        division: function (a, b) {
            return Expression.arithmetic.apply(null, [Expression.type.division].concat(MEPHArray.convert(arguments)));
        },
        /**
         * Expresses a fraction
         **/
        fraction: function (numerator, denominator) {
            var expression = new Expression();
            expression.setExp(Expression.type.fraction);
            expression.addPart(Expression['function'].numerator, numerator)
            MEPHArray.convert(arguments).subset(1).foreach(function (x) {
                expression.addPart(Expression['function'].denominator, x);
            });
            return expression;
        },
        ln: function (x) {
            var expression = new Expression();
            expression.setExp(Expression.type.ln);
            if (!(x instanceof Expression)) {
                x = Expression.variable(x);
            }
            expression.addPart(Expression['function'].input, x);
            return expression;
        },
        e: function (x) {
            var expression = new Expression();
            expression.setExp(Expression.type.e);
            if (!(x instanceof Expression)) {
                x = Expression.variable(x);
            }
            expression.addPart(Expression['function'].input, x);
            return expression;
        },
        abs: function (x) {
            var expression = new Expression();
            expression.setExp(Expression.type.abs);
            expression.addPart(Expression['function'].input, x);
            return expression;
        },
        variableOr: function (input) {
            return input instanceof Expression ? input : Expression.variable(input);
        },
        /**
         * Expresses log
         * @param {Number} a
         * @param {Number} base
         * @return {MEPH.math.Expression}
         **/
        log: function (a, base) {
            var expression = new Expression();

            expression.setExp(Expression.type.log);

            if (!(a instanceof Expression)) {
                a = Expression.variable(a);
            }

            expression.addPart(Expression['function'].input, a)

            if (base === undefined || base === null) {
                base = 10;
            }

            if (!(base instanceof Expression)) {
                base = Expression.variable(base);
            }

            expression.addPart(Expression['function'].base, base)

            return expression;
        },
        neg: function () {
            var expression = new Expression();
            expression.setExp(Expression.type.negative);
            MEPHArray.convert(arguments).foreach(function (x) {
                expression.addPart(Expression['function'].input, x);
            });
            return expression;
        },
        /**
         * Expresses a modulo function
         **/
        mod: function (a, b) {
            var expression = new Expression();
            expression.setExp(Expression.type.modulo);
            expression.addPart(Expression['function'].input, a)

            expression.addPart(Expression['function'].input, b)
            return expression;
        },
        /**
         * Expresses an arithemetic like function, a - b - c - ... - n
         **/
        arithmetic: function (type, a, b) {
            var expression = new Expression();
            expression.setExp(type);
            MEPHArray.convert(arguments).subset(1).foreach(function (x) {
                var t = x;
                if (!(x instanceof Expression)) {
                    t = Expression.variable(t);
                }
                expression.addPart(Expression['function'].input, t);
            });
            return expression;
        },
        /**
         * Expresses cos
         * @param {MEPH.math.Expression} exp
         * @param {Number} power
         **/
        cos: function (exp, power) {
            return Expression.trigonometric(Expression.type.cos, exp, power);
        },
        /**
         * Expresses tan
         * @param {MEPH.math.Expression} exp
         * @param {Number} power
         **/
        tan: function (exp, power) {
            return Expression.trigonometric(Expression.type.tan, exp, power);
        },
        /**
         * Expresses sin
         * @param {MEPH.math.Expression} exp
         * @param {Number} power
         * @returns {MEPH.math.Expression}
         **/
        sin: function (exp, power) {
            return Expression.trigonometric(Expression.type.sin, exp, power);
        },
        /**
         * Expresses csc
         * @param {MEPH.math.Expression} exp
         * @param {Number} power
         * @returns {MEPH.math.Expression}
         **/
        csc: function (exp, power) {
            return Expression.trigonometric(Expression.type.csc, exp, power);
        },
        /**
         * Expresses sec
         * @param {MEPH.math.Expression} exp
         * @param {Number} power
         * @returns {MEPH.math.Expression}
         **/
        sec: function (exp, power) {
            return Expression.trigonometric(Expression.type.sec, exp, power);
        },
        /**
         * Expresses cot
         * @param {MEPH.math.Expression} exp
         * @param {Number} power
         * @returns {MEPH.math.Expression}
         **/
        cot: function (exp, power) {
            return Expression.trigonometric(Expression.type.cot, exp, power);
        },

        /**
         * Expresses sinh
         * @param {MEPH.math.Expression} exp
         * @returns {MEPH.math.Expression}
         **/
        sinh: function (exp) {
            return Expression.trigonometric(Expression.type.sinh, exp, null);
        },

        /**
         * Expresses cosh
         * @param {MEPH.math.Expression} exp
         * @returns {MEPH.math.Expression}
         **/
        cosh: function (exp) {
            return Expression.trigonometric(Expression.type.cosh, exp, null);
        },

        /**
         * Expresses tanh
         * @param {MEPH.math.Expression} exp
         * @returns {MEPH.math.Expression}
         **/
        tanh: function (exp) {
            return Expression.trigonometric(Expression.type.tanh, exp, null);
        },

        /**
         * Expresses sech
         * @param {MEPH.math.Expression} exp
         * @returns {MEPH.math.Expression}
         **/
        sech: function (exp) {
            return Expression.trigonometric(Expression.type.sech, exp, null);
        },
        /**
         * Expresses coth
         * @param {MEPH.math.Expression} exp
         * @returns {MEPH.math.Expression}
         **/
        coth: function (exp) {
            return Expression.trigonometric(Expression.type.coth, exp, null);
        },
        /**
         * Expresses csch
         * @param {MEPH.math.Expression} exp
         * @returns {MEPH.math.Expression}
         **/
        csch: function (exp) {
            return Expression.trigonometric(Expression.type.csch, exp, null);
        },
        /**
         * Expresses a trigonemtric function like, cos, sin and tan
         * @param {String} type
         * @param {MEPH.math.Expression} exp
         * @param {Number} power
         **/
        trigonometric: function (type, exp, power) {
            var expression = new Expression();
            expression.setExp(type);

            if (!(exp instanceof Expression)) {
                exp = Expression.variable(exp);
            }
            expression.addPart(Expression['function'].input, exp);

            if (power !== undefined && power !== null) {
                expression.addPart(Expression['function'].power, power);
            }

            return expression;

        },
        func: function (func) {
            var expression = new Expression();
            expression.setExp(Expression.type.func);
            expression.addPart(Expression['function'].name, MEPHArray.convert(arguments).first());
            MEPHArray.convert(arguments).subset(1).foreach(function (x) {
                expression.addPart(Expression['function'].input, x);
            });
            return expression;
        },
        derivative: function (func, dir, u, t) {
            var expression = new Expression();
            expression.setExp(Expression.type.derivative);
            if (func) {
                expression.addPart(Expression['function'].input, func);
            }

            if (dir instanceof Expression)
                expression.addPart(Expression['function'].derivative, dir);
            else {
                expression.addPart(Expression['function'].derivative, Expression.variable(dir || 1));
            }
            if (u) {
                if (typeof u === 'string') {
                    u = Expression.variable(u);
                }
                expression.addPart(Expression['function'].numerator, u);
            }
            if (t) {
                if (typeof t === 'string') {
                    t = Expression.variable(t);
                }
                expression.addPart(Expression['function'].denominator, t);
            }
            //expression.addPart(Expression['function'].name, MEPHArray.convert(arguments).first());
            //MEPHArray.convert(arguments).subset(2).foreach(function (x) {
            //    expression.addPart(Expression['function'].input, x);
            //});
            return expression;
        },
        theta: function () {
            var expression = new Expression();
            expression.setExp(Expression.type.theta);
            return expression;
        },
        /**
         * Expresses an integral
         * @param {MEPH.math.Expression} exp
         * @param {MEPH.math.Expression/String} dx
         * @param {MEPH.math.Expression/String/Number} a
         * @param {MEPH.math.Expression/String/Number} b
         **/
        integral: function (exp, dx, a, b) {
            var expression = new Expression();
            expression.setExp(Expression.type.integral);
            expression.addPart(Expression['function'].input, exp);
            if (a)
                expression.addPart(Expression['function'].start, a);
            if (b)
                expression.addPart(Expression['function'].end, b);
            if (dx) {
                if (typeof dx === 'string') {
                    dx = Expression.variable(dx);
                }
                expression.addPart(Expression['function'].respectTo, dx);
            }
            return expression;
        }
    },
    properties: {
        expression: null,
        parts: null,
        type: null,
        dependencies: null,
        _mark: null,
        _parent: null,
        repeat: false,
        _name: null
    },
    /**
     * @private
     * If the expession is repeating, its repeating parts are returned in an array.
     * @returns {Array}
     **/
    getRepeatParts: function () {
        var me = this;
        if (me.repeat) {
            return me.getParts();
        }
        return [];
    },
    /**
     * Sets properties on the expression.
     * @param {Object} props
     **/
    setProperties: function (props) {
        var me = this;
        me.properties = me.properties || {};
        MEPH.apply(props, me.properties);
    },
    /**
     * Gets properties set on the expression.
     * @return {Object}
     */
    getProperties: function () {
        var me = this;
        me.properties = me.properties || {};
        return me.properties;
    },
    copy: function () {
        var me = this;
        var expression = new Expression();
        expression.type = me.type;
        expression.mark(me.mark());
        expression.name(me.name());
        expression.setProperties(me.getProperties());
        expression.repeat = me.repeat;
        expression.parts = me.getParts().select(function (x) {
            var copy = x.val.copy ? x.val.copy() : x.val;
            if (x.val.copy) {
                copy.parent(expression);
            }
            return { type: x.type, val: copy };
        });
        expression.expression = me.expression;
        expression.dependencies = me.getDependencies().select();
        return expression;
    },
    mark: function (val) {
        var me = this;
        if (val !== undefined)
            me._mark = val;
        return me._mark;
    },
    clearMarks: function () {
        var me = this;
        me.getParts().select(function (x) {
            return x.val;
        }).foreach(function (x) {
            if (x instanceof Expression) {
                x.clearMarks();
            }
        });
        me._mark = null;
    },
    name: function (val) {
        var me = this;
        if (val !== undefined) {
            me._name = val;
        }
        return me._name;
    },
    setExp: function (type, val) {
        var me = this;
        me.type = type;
        if (val !== undefined) {
            me.parts.push({ type: type, val: val });
        }
    },
    clearParts: function () {
        var me = this;
        return me.parts.clear();
    },
    /**
     * Set the parts of the expression with the same type.
     * @param {Array} parts
     * @param {String} type
     */
    setParts: function (parts, type) {
        var me = this;
        me.clearParts();
        parts.foreach(function (val) {
            me.addPart(type, val);
        });
    },
    getMark: function (mark) {
        var me = this;
        return me.getMarks()[mark];
    },
    setMark: function (mark, val) {
        var me = this;
        var mark = me.getMark(mark);

        mark.parts.removeWhere();
    },
    /**
     * Gets the marks on the expression.
     * @returns {Object}
     ***/
    getMarks: function () {
        var me = this,
            marks = {};

        if (me.mark()) {
            marks[me.mark()] = me;
        }

        me.parts.foreach(function (part) {
            if (part && part.val && part.val.getMarks) {
                var submarks = part.val.getMarks();
                for (var i in submarks) {
                    if (submarks[i]) {
                        var smi = Array.isArray(submarks[i]) ? submarks[i].first() : submarks[i];
                        var temp_exp = marks[i];
                        if (temp_exp) {

                            temp_exp = (!Array.isArray((temp_exp))) ? temp_exp : temp_exp.first();
                            if (temp_exp.isSibling(smi)) {
                                if (!Array.isArray(submarks[i])) {
                                    marks[i] = [temp_exp];
                                    marks[i].push(submarks[i]);
                                }
                                else {
                                    marks[i] = [temp_exp].concat(submarks[i]);
                                }
                            }
                        }
                        else {
                            marks[i] = submarks[i];
                        }
                    }
                }
            }
        });
        return marks;
    },
    /**
     * Returns true if the exp expression share the same parent().
     * @param {MEPH.math.Expression} exp
     * @return {Boolean}
     **/
    isSibling: function (exp) {
        var me = this;
        return me.parent() === exp.parent();
    },
    /**
     * Gets the list of variables and consts in the expression.
     * @return {Array}
     **/
    respects: function () {
        var me = this;
        var respects = me.getParts().select(function (x) {
            if (x.val) {
                if (x.val instanceof Expression) {
                    return x.val.respects();
                }
                else {
                    if (isNaN(parseFloat(x.val))) {
                        return x.val;
                    }
                    else return null;
                }
            }
            else {
                return null;
            }
        }).concatFluentReverse(function (x) {
            if (x) {
                return Array.isArray(x) ? x : [x];
            }
            return [];
        }).unique();

        return respects;
    },
    addPart: function (type, val) {
        var me = this;
        if (val.parent) {
            val.parent(me);
        }
        me.parts.push({ type: type, val: val });
    },
    addInput: function (val) {
        var me = this;
        me.addPart(Expression['function'].input, val);
    },
    parent: function (parent) {
        var me = this;

        if (parent) {
            me._parent = parent;
        }

        return me._parent;
    },
    /**
     * Adds a dependency between itself and another expression relative to it.
     * @param {String} offset
     * @param {String} part
     * @param {Function} ruleFunc
     */
    dependency: function (offset, part, ruleFunc, mark) {
        var me = this;
        me.dependencies.push({ mark: mark, offset: offset, part: part, ruleFunction: ruleFunc });
    },
    /**
     * Gets dependencies
     * @return {Array}
     **/
    getDependencies: function () {
        var me = this;
        return me.dependencies;
    },
    dependenciesAreRespected: function (expression, after) {
        var me = this;

        return me.getDependencies().where(function (x) {
            if (after) {
                return x.mark;
            }
            return !!!x.mark;
        }).all(function (d) {
            var offset, part;
            part = Expression.select(expression, d);

            if (!part) {
                throw new Error('no offset found');
            }
            return d.ruleFunction(expression, part);
        });
    },
    dependenciesMarkAreRespected: function (rule) {
        var me = this;

        return me.dependenciesAreRespected(rule, true);
    },
    /**
     * Converts expressions in to latex format.s
     * @return {String}
     **/
    latex: function () {
        var me = this,
            result;
        switch (me.type) {
            case Expression.type.variable:
                return me.parts.first().val;
            case Expression.type.integral:
                //\int_a^b \! f(x) \, \mathrm{d}x.
                var start = me.partLatex(Expression['function'].start);
                var end = me.partLatex(Expression['function'].end);
                var middle = '';
                if (start && end) {
                    middle = start + '^' + end;
                }
                result =
                    '\\int_' +
                    middle + ' ' +
                '\\! ' +
                me.partLatex(Expression['function'].input) + ' ' +
                '\\,' + ' ' +
                '\\mathrm{d}' +
                me.partLatex(Expression['function'].respectTo) + ''
                return result;
            case Expression.type.e:
                return 'e^' + me.partLatex(Expression['function'].input);
            case Expression.type.addition:
                var before = '';
                var after = '';
                if (me.parent()) {
                    before = '(';
                    after = ')';
                }
                return before + me.parts.select(function (x) {
                    return x.val.latex();
                }).join(' + ') + after;
                break;
            case Expression.type.subtraction:
                return me.parts.select(function (x) {
                    return x.val.latex();
                }).join(' - ');
                break;
            case Expression.type.anything:
                return me.anything || 'f(x)';
            case Expression.type.func:
                return me.partLatex(Expression['function'].name) + '(' + me.parts.subset(1).select(function (x) {
                    return x.val && x.val.latex ? x.val.latex() : x.val;
                }).join(',') + ')';
                break;
            case Expression.type.derivative:
                // \frac{\partial u}{\partial t} (func)
                var func = me.partLatex(Expression['function'].input);
                var derivative = me.part(Expression['function'].derivative);
                derivative = derivative && derivative.val ? derivative.val : null;
                if (derivative && derivative.value() != 1) {
                    derivative = '^' + derivative.value();
                }
                else derivative = '';

                var numerator = me.partLatex(Expression['function'].numerator) || '';
                var denominator = me.partLatex(Expression['function'].denominator) || '';
                return '\\frac{\\partial' + derivative + ' ' + numerator + '}{\\partial ' + denominator + '' + derivative + '} (' + func + ')';
            case Expression.type.multiplication:
                if (me.parts.unique(function (x) {
                    return x.val.latex();
                }).length !== me.parts.length ||
                    me.parts.where(function (x) {
                    return parseFloat(x.val.latex());
                }).length !== me.parts.length) {//|| x.val.latex() === '0'
                    return me.parts.orderBy(me.orderParts.bind(me)).select(function (x, index) {
                        return x.val.latex();
                    }).join('');
                }
                else
                    return me.parts.orderBy(me.orderParts.bind(me)).select(function (x, index) {
                        return x.val.latex();
                    }).join(' * ');
                break;
            case Expression.type.modulo:
                return me.latexPart(me.parts.nth(1)) +
                    ' \\bmod ' +
                    me.latexPart(me.parts.nth(2));
                break;
            case Expression.type.negative:
                return '-' + me.parts.orderBy(me.orderParts.bind(me)).select(function (x, index) {
                    return x.val && x.val.latex ? x.val.latex() : x.val;
                }).join('');;
            case Expression.type.limit:
                var exp = me.partLatex(Expression['function'].expression);
                var a = me.partLatex(Expression['function'].start);
                var b = me.partLatex(Expression['function'].end);
                return '\\lim_{' + a + ' \\to ' + b + '} ' + exp
                break;
            case Expression.type.division:
                return me.parts.select(function (x) {
                    return x.val.latex();
                }).join(' / ');
                break;
            case Expression.type.ln:
                var start = '\\ln ';
                if (me.parts.length > 1) {
                    start += '(';
                }
                var val = me.parts.first().val;
                if (val.latex) {
                    start += val.latex();
                }
                else {
                    start += val;
                }
                if (me.parts.length > 1) {
                    start += ')';
                }
                return start;
            case Expression.type.abs:
                var start = '|';

                var val = me.parts.select(function (x) {
                    return me.latexPart(x);
                }).join('');
                start += val;
                start += '|';
                return start;
            case Expression.type.fraction:
                if (me.parts.length === 2) {
                    return '\\frac{' + me.partLatex(Expression['function'].numerator) +
                        '}{' + me.partLatex(Expression['function'].denominator) + '}';
                }
                else {
                    var start = '\\begin{equation}';
                    var end = ' \\end{equation}';
                    me.parts.subset(0, me.parts.length - 1).foreach(function (part) {
                        start += ' \\cfrac{' + me.latexPart(part) + '}{';

                        end = '}' + end;
                    });
                    return start + me.latexPart(me.parts.last()) + end;
                }
                break;
            case Expression.type.plusminus:
                var a = me.parts.first(function (x) { return x.type === Expression['function'].input; });
                var b = me.parts.second(function (x) { return x.type === Expression['function'].input; });

                return me.latexPart(a) + ' \\pm ' + me.latexPart(b);
                break;
            case Expression.type.theta:
                return '\\theta';
            case Expression.type.factorial:
                var facttext = me.partLatex(me.partOrDefault(Expression['function'].input)) + '!';
                return facttext;
            case Expression.type.summation:
                //\displaystyle\sum_{n=1}^{10} n^{2}
                var summationtext = '\\displaystyle\\sum_{' + me.partLatex(Expression['function'].respectTo) +
                    '=' + me.partLatex(Expression['function'].start) +
                    '}^{' + me.partLatex(Expression['function'].end) + '} ' + me.partLatex(Expression['function'].input) + '';
                return summationtext;
            case Expression.type.tanh:
            case Expression.type.sinh:
            case Expression.type.cosh:
            case Expression.type.tan:
            case Expression.type.sin:
            case Expression.type.cos:
            case Expression.type.sec:
            case Expression.type.cot:
            case Expression.type.csc:
            case Expression.type.sech:
            case Expression.type.csch:
            case Expression.type.coth:
                var power = me.partLatex(Expression['function'].power);
                if (power) {
                    power = '^' + power;
                }
                else { power = '' }
                return '\\' + me.type + power + ' (' + me.partLatex(Expression['function'].input) + ')';
            case Expression.type.power:
                return me.partLatex(Expression['function'].base) + '^{' + me.partLatex(Expression['function'].power) + '}';
                break;
            default:
                throw new Error('unhandled : ' + me.type);
        }
    },
    latexPart: function (start) {
        if (start && start.val) {
            if (start.val.latex) {
                start = start.val.latex();
            }
            else {
                start = start.val;
            }
        }
        return start || '';
    },
    partLatex: function (type) {
        var me = this;
        var start = me.part(type);
        return me.latexPart(start);
    },
    partOrDefault: function (type) {
        var me = this;
        var part = me.part(type)
        return part ? part.val : null;
    },
    part: function (type) {
        var me = this;
        return me.parts.first(function (x) { return x.type === type; });
    },
    /**
     * Swaps the part from the mark.
     ***/
    swap: function (mark, exp) {
        var me = this;
        me.ensureLineage();
        var marks = me.getMarks();
        var parts = me.getParts()
        if (marks[mark]) {
            var parent = marks[mark].parent();
            var pos;
            if (parent) {
                pos = parent.indexOf(marks[mark]);
                var part = parent.remove(marks[mark]).first();
            }
            exp.mark(mark);
            if (parent) {
                if (pos === null || !part) {
                    throw new Error('illegal state for swapping.');
                }
                parent.addPartAt(part.type, exp, pos);
            }
        }

    },
    ensureLineage: function () {
        var me = this;
        me.getParts().foreach(function (p) {
            if (p.val.parent) {
                p.val.parent(me);
                p.val.ensureLineage();
            }
        });
    },
    /**
     * Add part at position pos.
     * @param {string} type
     * @param {MEPH.math.Expression} exp
     * @param {Number} pos
     **/
    addPartAt: function (type, exp, pos) {
        var me = this;
        if (me.getParts().length > pos && pos !== -1) {
            me.getParts().splice(pos, 0, { val: exp, type: type });
        }
        else {
            me.addPart(type, exp);
        }
    },
    /**
     * Gets the index of the expression.
     * @param {MEPH.math.Expression} exp
     * @return {Number}
     **/
    indexOf: function (exp) {
        var me = this;
        var indexes = me.parts.indexWhere(function (x) { return x.val === exp; });
        return indexes.first();
    },
    /**
     * @private
     */
    orderParts: function (a, b) {
        var order = {
            variable: 0,
            ln: 8,
            integral: 10,
            addition: 5,
            power: 5,
            limit: 5,
            fraction: 3,
            sin: 5,
            cos: 5,
            tan: 5,
            csc: 5,
            cot: 5,
            sec: 5,
            tan: 5,
            func: 5,
            derivative: 5,
            mod: 5,
            modulo: 5,
            theta: 5,
            subtraction: 5,
            plusminus: 5,
            multiplication: 5,
            division: 5,
            anything: 5
        }

        return (a.val && a.val.type ? order[a.val.type] || 0 : 0) - (b.val && b.val.type ? order[b.val.type] || 0 : 0);
    },
    value: function () {
        var me = this;
        switch (me.type) {
            case Expression.type.variable:
                return me.partOrDefault(me.type);
            default:
                return me;
        }
    },
    /**
     * Removes the part.
     * @param {MEPH.math.Expression} part
     * @returns {Array} removed parts.
     **/
    remove: function (part) {
        var me = this;
        return me.getParts().removeWhere(function (x) { return x.val === part; });
    },
    partVal: function (type) {
        var me = this;
        var part = me.part(type);
        if (part) {
            return part.val;
        }
        return null;
    },
    getParts: function () {
        var me = this;
        return me.parts;
    },
    /**
     * Get parts by index.
     * @param {Number} index
     * @param {MEPH.math.Expression}
     ***/
    getPartByIndex: function (index) {
        var me = this;
        var p = me.getParts()[index];
        if (p) {
            return p.val;
        }
        return null;
    },
    getValues: function () {
        var me = this;
        return me.getParts().select(function (x) { return x.val; });
    },
    initialize: function (type) {
        var me = this;
        me.expression = {
        };
        me.dependencies = [];
        me.parts = [];
    },
    /**
     * Matches an expression to a rule.
     * @param {MEPH.math.Expression} rule
     * @return {Boolean}
     **/
    match: function (rule, markRule) {
        var me = this;
        if (me.type === rule.type && rule.dependenciesAreRespected(me)) {
            var meParts = me.getParts().select();
            var ruleParts = rule.getParts().select();

            var matchParts = function (ruleParts, x) {
                var first = ruleParts.first(function (y) {
                    if (y.type !== x.type) {
                        return false;
                    }
                    if (y.val && x.val && y.val.equals && x.val.equals) {
                        return x.val.match(y.val, markRule);
                    }
                    else if (y.val && !x.val || !y.val && x.val) {
                        return false;
                    }
                    else {
                        return true
                    }
                });
                if (first) {
                    ruleParts.removeFirstWhere(function (t) { return t === first; });
                    return first;
                }
                else return false;
            };
            if (rule.repeat) {
                var repeatedparts;
                if (rule.repeat.requires) {
                    repeatedparts = rule.getParts().where(function (x) {
                        return rule.repeat.requires.contains(function (y) {
                            return y === x.type;
                        });
                    }).select(function (x) { return x; });

                    var eq = repeatedparts.all(function (part) {
                        var p = [].interpolate(0, me.getParts().length, function () {
                            return part;
                        });
                        var start = p.length;

                        meParts.foreach(matchParts.bind(me, p));

                        return start != p.length;
                    });

                    return eq;
                }
                else {

                    repeatedparts = [].interpolate(0, me.getParts().length, function () {
                        return rule.parts.first();
                    });
                    meParts.foreach(matchParts.bind(me, repeatedparts));
                    if (repeatedparts.length === 0) {
                        if (markRule) {
                            me.mark(rule.mark());
                        }
                        me.repeat = rule.repeat;

                        return true;
                    }
                }
                return false;
            }
            else if (rule.getParts().contains(function (x) {
                return x.val.type === (Expression.type.anything);
            })) {

                ruleParts = rule.getParts().select();
                //.where(function (x) {
                //    return x.val.type === Expression.type.anything;
                //});

                meParts.foreach(matchParts.bind(me, ruleParts));
                if (ruleParts.length === 0) {
                    if (markRule) {
                        me.mark(rule.mark());
                    }
                    return true;
                }
                return false;
            }
            else {
                if (meParts.length !== ruleParts.length) {
                    return false;
                }
                meParts.foreach(matchParts.bind(me, ruleParts));
                if (ruleParts.length > 0) {
                    return false;
                }
                if (markRule) {
                    me.mark(rule.mark());
                }

                return true;
            }
        }
        else if (rule.type === Expression.type.anything && rule.dependenciesAreRespected(me)) {
            if (markRule) {
                me.mark(rule.mark());
            }
            return true;
        }

        return false;
    },
    /**
     * Returns true if the equation are equal
     * @param {Object} options
     * @param {Boolean} options.formEquals
     */
    equals: function (expression, options) {
        var me = this;
        options = options || { formEquals: true, exact: false };

        if (me.type === expression.type) {
            var meparts = me.getParts().select();
            var expparts = expression.getParts().select(function (x) { return x; });
            if (meparts.length !== expparts.length) return false;
            meparts.foreach(function (x) {
                var first = expparts.first(function (y) {
                    if (y.type !== x.type) {
                        return false;
                    }
                    if (y.val && x.val && y.val.equals && x.val.equals) {
                        return y.val.equals(x.val, options);
                    }
                    else if (y.val && !x.val || !y.val && x.val) {
                        return false;
                    }
                    else {
                        if (options.exact) {
                            if (isNaN(x.val) && isNaN(y.val)) {
                                return x.val === y.val;
                            }
                            else {
                                return parseFloat(x.val) === parseFloat(y.val);
                            }
                        }
                        return true
                    }
                });
                if (first) {
                    expparts.removeWhere(function (t) { return t === first; });
                }
                else return false;
            });
            if (expparts.length > 0) return false;
            return true;
        }
    }
}).then(function () {
    [].interpolate(0, 100, function (x) {
        Expression.RuleType.Derivation['GeneralFormula' + x + 'b'] = 'GeneralFormula' + x + 'b';
        Expression.RuleType.Derivation['GeneralFormula' + x + 'a'] = 'GeneralFormula' + x + 'a';
    });

    Expression.RuleType.Derivation.ChainRuleA = 'ChainRuleA';
    Expression.RuleType.Derivation.ChainRuleB = 'ChainRuleB';

    [].interpolate(0, 100, function (x) {
        Expression.RuleType.Integration['IGeneralFormula' + x + 'b'] = 'IGeneralFormula' + x + 'b';
        Expression.RuleType.Integration['IGeneralFormula' + x + 'a'] = 'IGeneralFormula' + x + 'a';
    });
});;