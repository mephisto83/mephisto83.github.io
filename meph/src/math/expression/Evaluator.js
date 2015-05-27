/**
 * @class MEPH.math.expression.Evaluator
 * Evaulates mathematical expressions.
 *
 **/
MEPH.define('MEPH.math.expression.Evaluator', {
    statics: {
        /**
         * Evaluate an expression.
         * @param {MEPH.math.Expression} expression
         * @param {Object} options
         * @return {MEPH.math.Expression}
         **/
        evaluate: function (expression, options) {
            var Evaluator = MEPH.math.expression.Evaluator;
            expression = Evaluator.preprocess(expression);
            options = options || {};
            options.count = options.count || 0;
            options.count++;

            if (!expression instanceof Expression) {
                throw 'incorrect input.';
            }
            if (options.count > 256) {
                return expression.copy();
            }
            switch (expression.type) {
                case Expression.type.addition:
                    return Evaluator.evalAddition(expression, options);
                case Expression.type.subtraction:
                    return Evaluator.evalSubtraction(expression, options);
                case Expression.type.fraction:
                case Expression.type.division:
                    return Evaluator.evalDivision(expression, options);
                case Expression.type.multiplication:
                    return Evaluator.evalMultiplication(expression, options);
                case Expression.type.power:
                    return Evaluator.evalPower(expression, options);
                case Expression.type.variable:
                    return Evaluator.evalVariable(expression, options);
                case Expression.type.integral:
                    return Evaluator.evalIntegral(expression, options);
                case Expression.type.derivative:
                    return Evaluator.evalDerivative(expression, options);
                case Expression.type.e:
                    return Evaluator.evalE(expression, options);
                case Expression.type.ln:
                    return Evaluator.evalLn(expression, options);
                case Expression.type.abs:
                    return Evaluator.evalAbs(expression, options);
                case Expression.type.summation:
                    return Evaluator.evalSummation(expression, options);
                case Expression.type.log:
                    return Evaluator.evalLog(expression, options);
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
                    return Evaluator.evalTrig(expression, options);
                case Expression.type.sqrt:
                    return Evaluator.evalSqrt(expression, options);
                default:
                    throw new Error('unhandled case : ' + expression.type);
            }
        },
        preprocess: function (expression) {
            switch (typeof (expression)) {
                case 'string':
                case 'number':
                    return Expression.variable(expression);
                default:
                    return expression;
            }
        },
        evalTrig: function (expression, options) {
            var Factor = MEPH.math.expression.Factor;
            var Evaluator = MEPH.math.expression.Evaluator;
            var x = expression.partOrDefault(Expression['function'].input);

            if (Factor.isNumerical(x)) {
                var val;

                switch (expression.type) {
                    case Expression.type.csch:
                        val = Math.csch(Factor.getNumerical(x));
                        break;
                    case Expression.type.cosh:
                        val = Math.cosh(Factor.getNumerical(x));
                        break;
                    case Expression.type.sech:
                        val = Math.sech(Factor.getNumerical(x));
                        break;

                    case Expression.type.tanh:
                        val = Math.tanh(Factor.getNumerical(x));
                        break;
                    case Expression.type.sinh:
                        val = Math.sinh(Factor.getNumerical(x));
                        break;
                    case Expression.type.coth:
                        val = Math.coth(Factor.getNumerical(x));
                        break;
                    case Expression.type.csc:
                        val = Math.csc(Factor.getNumerical(x));
                        break;
                    case Expression.type.sec:
                        val = Math.sec(Factor.getNumerical(x));
                        break;
                    case Expression.type.tan:
                        val = Math.tan(Factor.getNumerical(x));
                        break;
                    case Expression.type.cos:
                        val = Math.cos(Factor.getNumerical(x));
                        break;
                    case Expression.type.sin:
                        val = Math.sin(Factor.getNumerical(x));
                        break;
                    case Expression.type.cot:
                        val = Math.cot(Factor.getNumerical(x));
                        break;
                    default:
                        throw new Error('unhandled trignometric case : ' + expression.type);
                }

                if (!isNaN(val) && (val % 1) === 0) {
                    return (val);
                }
            };

            switch (expression.type) {
                case Expression.type.coth:
                    return Expression.coth(Evaluator.evaluate(x, options));
                case Expression.type.csch:
                    return Expression.csch(Evaluator.evaluate(x, options));
                case Expression.type.cosh:
                    return Expression.cosh(Evaluator.evaluate(x, options));
                case Expression.type.sech:
                    return Expression.sech(Evaluator.evaluate(x, options));
                case Expression.type.tanh:
                    return Expression.tanh(Evaluator.evaluate(x, options));
                case Expression.type.sinh:
                    return Expression.sinh(Evaluator.evaluate(x, options));
                case Expression.type.sec:
                    return Expression.sec(Evaluator.evaluate(x, options));
                case Expression.type.tan:
                    return Expression.tan(Evaluator.evaluate(x, options));
                case Expression.type.cos:
                    return Expression.cos(Evaluator.evaluate(x, options));
                case Expression.type.sin:
                    return Expression.sin(Evaluator.evaluate(x, options));
                case Expression.type.csc:
                    return Expression.csc(Evaluator.evaluate(x, options));
                case Expression.type.cot:
                    return Expression.cot(Evaluator.evaluate(x, options));
                default:
                    throw new Error('unhandled trignometric case : ' + expression.type);
            }
        },
        evalLog: function (expression, options) {
            var Factor = MEPH.math.expression.Factor;
            var Evaluator = MEPH.math.expression.Evaluator;
            var x = expression.partOrDefault(Expression['function'].input);
            var base = expression.partOrDefault(Expression['function'].base);

            if (Factor.isNumerical(x) && Factor.isNumerical(base)) {
                var val = Math.log(Factor.getNumerical(x)) / Math.log(Factor.getNumerical(base));
                if (!isNaN(val)) {
                    return (val);
                }
            };
            ;
            return Expression.log(Evaluator.evaluate(x, options), Evaluator.evaluate(base, options));
        },
        evalSqrt: function (expression, options) {
            var Factor = MEPH.math.expression.Factor;
            var Evaluator = MEPH.math.expression.Evaluator;
            var x = expression.partOrDefault(Expression['function'].input);

            if (Factor.isNumerical(x) && Factor.isNumerical(base)) {
                var val = Math.sqrt(Factor.getNumerical(x));
                if (!isNaN(val) && (val % 1) === 0) {
                    return (val);
                }
            };
            ;
            return Expression.sqrt(Evaluator.evaluate(x, options));
        },
        evalSummation: function (expression) {
            console.log('Need to actually implement summation.')
            return expression.copy();
        },
        evalAbs: function (expression, options) {
            var Factor = MEPH.math.expression.Factor;
            var Evaluator = MEPH.math.expression.Evaluator;
            var x = expression.partOrDefault(Expression['function'].input);
            if (Factor.isNumerical(x)) {
                var val = Math.abs(Factor.getNumerical(x));
                if (!isNaN(val)) {
                    return (val);
                }
            };
            ;
            return Expression.abs(Evaluator.evaluate(x, options));
        },
        evalE: function (expression, options) {
            var Factor = MEPH.math.expression.Factor;
            var Evaluator = MEPH.math.expression.Evaluator;
            var x = expression.partOrDefault(Expression['function'].input);
            if (Factor.isNumerical(x)) {
                var val = Math.pow(Math.E, Factor.getNumerical(x));
                if ((val % 1) === 0) {
                    return Expression.variable(val);
                }
            };
            ;
            return Expression.e(Evaluator.evaluate(x, options));
        },
        evalLn: function (expression, options) {

            var Factor = MEPH.math.expression.Factor;
            var Evaluator = MEPH.math.expression.Evaluator;
            var x = expression.partOrDefault(Expression['function'].input);
            if (Factor.isNumerical(x)) {
                var val = Math.log(Factor.getNumerical(x)) / Math.log(Math.E);
                if ((val % 1) === 0) {
                    val;
                }
            };
            ;
            return Expression.ln(Evaluator.evaluate(x, options));
        },
        evalVariable: function (expression) {
            var Factor = MEPH.math.expression.Factor;
            return Factor.getNumerical(expression, true);
        },
        evalPower: function (expression, options) {
            var Factor = MEPH.math.expression.Factor;
            var Evaluator = MEPH.math.expression.Evaluator;
            var base = expression.partOrDefault(Expression['function'].base);
            var exponent = expression.partOrDefault(Expression['function'].power);

            base = Evaluator.evaluate(base, options);
            exponent = Evaluator.evaluate(exponent, options);

            if (Factor.isNumerical(exponent)) {
                if (Expression.isZero(exponent)) {
                    return Expression.one();
                }
                else if (Expression.isOne(exponent)) {
                    if (base instanceof Expression) {
                        return base.copy();
                    }
                    return Expression.variable(base);
                }
                if (Factor.isNumerical(base)) {
                    return Expression.variable(Math.pow(base, exponent));
                }
                else {
                    return Expression.power(base, exponent);
                }
            } else {
                return Expression.power(base, exponent);
            }
        },
        evalMultiplication: function (expression, options) {
            var Factor = MEPH.math.expression.Factor;
            var Evaluator = MEPH.math.expression.Evaluator;
            var multiplyNums = function (exps) {
                return exps.summation(function (x, t, i) {
                    if (i === 0) {
                        var temp = Evaluator.evaluate(x, options);
                        return Factor.getNumerical(temp);
                    }
                    return t * Factor.getNumerical(Evaluator.evaluate(x, options));
                });
            }
            var parts = expression.getParts().select(function (x) {
                return Evaluator.evaluate(x.val, options);
            });
            if (Evaluator.allNumbers(parts)) {
                var result = multiplyNums(parts);
                return Expression.variable(result);
            }
            var numerparts = parts.where(function (x) {
                return Factor.isNumerical(x) && !Expression.isOne(x);
            });
            var notnumbers = parts.where(function (x) {
                return !Factor.isNumerical(x);
            });

            var numexp = Expression.variable(multiplyNums(numerparts));

            if (!Expression.isOne(numexp) && numerparts.length && notnumbers.length) {
                return Expression.multiplication.apply(this, [numexp].concat(notnumbers));
            }
            else if (notnumbers.length) {
                if (notnumbers.length > 1) {
                    return Expression.multiplication.apply(this, notnumbers);
                }
                else {
                    var t = notnumbers.first();
                    return Expression.variableOr(t).copy();
                }
            }
            else {
                return Expression.variableOr(numexp).copy();
            }
        },
        /**
         * Evaluates a division expression.
         * @param {MEPH.math.Expression} expression
         * @param {Object} options
         * @return {MEPH.math.Expression}s
         **/
        evalDivision: function (expression, options) {
            var Factor = MEPH.math.expression.Factor;
            var Evaluator = MEPH.math.expression.Evaluator;
            var divideNums = function (exps) {
                return exps.summation(function (x, t, i) {
                    if (i === 0) {
                        return Evaluator.evaluate(x.val, options);
                    }
                    return t / Evaluator.evaluate(x.val, options);
                });
            }
            var parts = expression.getParts().select(function (x) {
                return Evaluator.evaluate(x.val, options);
            });
            var currentval, index = 0;
            do {
                if (currentval === undefined) {
                    currentval = parts[index] instanceof Expression ? parts[index].value() : parts[index];
                    if (!Factor.isNumerical(currentval) && !(currentval instanceof Expression)) {
                        currentval = Expression.variable(currentval);
                    }
                }
                else {
                    if (Factor.isNumerical(parts[index])) {
                        var pi = Factor.getNumerical(parts[index]);
                        if (pi === 0) {
                            if (currentval > 0)
                                return Expression.variable(Number.POSITIVE_INFINITY);
                            else return Expression.variable(Number.NEGATIVE_INFINITY);
                        }
                        if ((currentval / pi) % 1 === 0) {
                            currentval = currentval / pi;
                        }
                        else {
                            currentval = Expression.variable(currentval);
                            break;
                        }
                    }
                    else {
                        currentval = Expression.variable(currentval);
                        break;
                    }
                }
                index++;
            }
            while ((typeof currentval === 'number') && index < parts.length);

            if (currentval instanceof Expression) {
                return Expression.division.apply(this, [currentval].concat(parts.subset(index)));
            }
            else {
                return Expression.variable(currentval);
            }
        },
        /**
         * Evaluates  an addition expression.
         * @param {MEPH.math.Expression} expression
         * @param {Object} options
         * @return {MEPH.math.Expression}
         **/
        evalAddition: function (expression, options) {
            var Factor = MEPH.math.expression.Factor;
            var Evaluator = MEPH.math.expression.Evaluator;
            if (Evaluator.allNumbers(expression)) {
                var result = expression.getParts().summation(function (x, t) {
                    return Factor.getNumerical(x.val) + t;
                });
                return Expression.variable(result);
            }
            else {
                var copied = expression.copy();
                var parts = copied.getParts().select(function (x) {
                    return Evaluator.evaluate(x.val, options);
                });
                var number = parts.where(function (x) {
                    return Factor.isNumerical(x);
                }).summation(function (x, t) {
                    return Evaluator.evaluate(x, options) + t;
                });
                var notnumbers = parts.where(function (x) {
                    return !Factor.isNumerical(x);
                }).select(function (x) {
                    return x;
                });
                if (number !== 0 && notnumbers.length) {
                    return Expression.addition.apply(this, [Expression.variable(number)].concat(notnumbers));
                }
                else if (number === 0 && notnumbers.length) {
                    return Expression.addition.apply(this, notnumbers);
                }
                else if (notnumbers.length === 0) {
                    return Expression.addition.apply(this, [number]);
                }
            }
        },
        orderDependentEval: function (parts, evalFunc, expFunc) {
            var Evaluator = MEPH.math.expression.Evaluator;
            var Factor = MEPH.math.expression.Factor;
            var currentval, index = 0;

            do {
                if (currentval === undefined) {
                    currentval = parts[index] instanceof Expression ? parts[index].value() : parts[index];
                    if (!Factor.isNumerical(currentval) && !(currentval instanceof Expression)) {
                        currentval = Expression.variable(currentval);
                    }
                }
                else {
                    if (Factor.isNumerical(parts[index])) {

                        currentval = evalFunc(parts[index], currentval);

                        if (currentval instanceof Expression) {
                            break;
                        }
                    }
                    else {
                        currentval = Expression.variable(currentval);
                        break;
                    }
                }
                index++;
            }
            while ((typeof currentval === 'number') && index < parts.length);

            if (currentval instanceof Expression) {
                return expFunc.apply(this, [currentval].concat(parts.subset(index)));
                //Expression.subtraction.apply(this, [currentval].concat(parts.subset(index));
            }
            else {
                return Expression.variable(currentval);
            }

        },
        /**
         * Evaluates  an subtraction expression.
         * @param {MEPH.math.Expression} expression
         * @param {Object} options
         * @return {MEPH.math.Expression}
         **/
        evalSubtraction: function (expression, options) {
            var Evaluator = MEPH.math.expression.Evaluator;
            var Factor = MEPH.math.expression.Factor;

            var parts = expression.getParts().select(function (x, i) {
                if (i === 0) {
                    if (x.val instanceof Expression)
                        return x.val.copy();
                    return Expression.variable(x.val);
                }
                else {
                    if (x.val instanceof Expression)
                        return Expression.multiplication(-1, x.val.copy());
                    return Expression.multiplication(-1, x.val);
                }
                //return Evaluator.evaluate(x.val, options);
            });

            var result = Evaluator.evaluate(Expression.addition.apply(this, parts), options);

            parts = result.getParts().select(function (x, i) {
                if (i === 0) {
                    if (x.val instanceof Expression)
                        return x.val.copy();
                    return Expression.variable(x.val);
                }
                else {
                    var t;
                    t = Expression.Flatten(Expression.multiplication(-1,
                        (x.val instanceof Expression) ?
                         x.val.copy() :
                         x.val), Expression.type.multiplication);
                    if (t === null) {
                        throw 'invalid value for t : Evaluator.js';
                    }



                    return Evaluator.evaluate(t, options);
                }
            });

            var result = Evaluator.orderDependentEval(parts, function evalFunc(partsindex, currentval) {
                var pi = Factor.getNumerical(partsindex);

                if (pi === 0) {
                    if (currentval > 0)
                        return Expression.variable(Number.POSITIVE_INFINITY);
                    else
                        return Expression.variable(Number.NEGATIVE_INFINITY);
                }
                if ((currentval - pi) % 1 === 0) {
                    currentval = currentval - pi;
                }
                else {
                    currentval = Expression.variable(currentval);
                }
                return currentval;
            }, Expression.subtraction);

            if (!(result instanceof Expression)) {
                result = Expression.variable(result);
            }
            return result;
            //if (Evaluator.allNumbers(expression)) {
            //    var result = expression.getParts().summation(function (x, t, i) {
            //        if (i === 0) {
            //            return Evaluator.evaluate(x.val, options) + t;
            //        }
            //        else
            //            return t - Evaluator.evaluate(x.val, options);
            //    });
            //    return Expression.variable(result);
            //}
            //else {
            //    var copied = expression.copy(),
            //        numberfirst;

            //    var number = copied.getParts().where(function (x, index) {
            //        x.index = index;
            //        return Factor.isNumerical(x.val);
            //    }).summation(function (x, t, i) {
            //        if (x.index === 0) {
            //            numberfirst = true;
            //            return Evaluator.evaluate(x.val, options) + t
            //        }
            //        else
            //            return -Evaluator.evaluate(x.val, options) + t;
            //    });

            //    var notnumbers = copied.getParts().where(function (x) {
            //        return !Factor.isNumerical(x.val);
            //    });

            //    if (numberfirst) {
            //        return Expression.subtraction.apply(this, [Expression.variable(number)].concat(notnumbers));
            //    }
            //    else {
            //        var first = notnumbers.first(function (x) { return x.index === 0; });
            //        var start = !!number ? [first.val, number] : [first.val];
            //        return Expression.subtraction.apply(this, start.concat(notnumbers.where(function (x) {
            //            return x !== first;
            //        }).select(function (x) { return x.val; })));
            //    }
            //}
        },
        /**
         * Evaluates a derivative expression.
         * @param {MEPH.math.Expression} expression
         * @param {Object} options
         * @return {MEPH.math.Expression}
         **/
        evalDerivative: function (expression, options) {
            var Evaluator = MEPH.math.expression.Evaluator;
            var Factor = MEPH.math.expression.Factor;
            var rules = Expression.getMatchingRules(expression);
            var derivativeRules = rules.where(function (x) { return x.type === Expression.type.derivative; });
            if (options && derivativeRules.length > 1) {
                if (options.strategy) {
                    derivativeRules = options.strategy(derivativeRules);
                }
            }
            if (derivativeRules.length === 1) {
                var rule = derivativeRules.first().rule;


                Expression.clearMarks(expression);

                Expression.matchRule(expression, rule, true);

                var translation = ExpressionTranslation.translationPool().first(function (x) {
                    return x.some(function (y) { return y === rule.name() });
                });

                var translateTo = translation.first(function (x) {
                    return x !== rule.name();
                });

                var translateToRule = Expression.getRule(translateTo, 'Derivation');

                var result = ExpressionTranslation.translate(expression, translateToRule);

                var evaluatedresult = Evaluator.evaluate(result, options);

                return evaluatedresult;
            }
            else if (derivativeRules.length > 1) {
                throw new Error('dont know which rule to apply');
            }
            else {
                return expression;
            }
        },
        /**
         * Evaluates an integral expression.
         * @param {MEPH.math.Expression} expression
         * @param {Object} options
         * @return {MEPH.math.Expression}
         **/
        evalIntegral: function (expression, options) {
            var Evaluator = MEPH.math.expression.Evaluator;
            var Factor = MEPH.math.expression.Factor;
            var input = expression.partOrDefault(Expression['function'].input);
            expression.remove(input);
            input = Evaluator.evaluate(input, options);
            expression.addPart(Expression['function'].input, Expression.variableOr(input));

            var rules = Expression.getMatchingRules(expression);
            var integralRules = rules.where(function (x) { return x.type === Expression.type.integral; });

            if (options && integralRules.length > 1) {
                if (options.strategy) {
                    integralRules = options.strategy(integralRules);
                }
            }

            if (integralRules.length === 1) {
                var rule = integralRules.first().rule;


                Expression.clearMarks(expression);

                Expression.matchRule(expression, rule, true);

                var translation = ExpressionTranslation.translationPool().first(function (x) {
                    return x.some(function (y) { return y === rule.name() });
                });

                var translateTo = translation.first(function (x) {
                    return x !== rule.name();
                });

                var translateToRule = Expression.getRule(translateTo);

                var result = ExpressionTranslation.translate(expression, translateToRule);

                var evaluatedresult = Evaluator.evaluate(result, options);

                return evaluatedresult;
            }
            else {
                return expression;
            }
        },
        /**
         * All the parts of the expression are numerical.
         * @param {MEPH.math.Expression/Array}
         * @return {Boolean}
         */
        allNumbers: function (expression) {
            var Factor = MEPH.math.expression.Factor;
            var t = expression;
            if (!Array.isArray(expression)) {
                t = expression.getParts();
            }
            return t.all(function (x) {
                return typeof (Factor.getNumerical(x.val)) === 'number';
            })
        }
    }
});