/**
 * @class MEPH.math.ExpressionTranslation
 *
 **/
MEPH.define('MEPH.math.ExpressionTranslation', {
    alternateNames: 'ExpressionTranslation',
    requires: ['MEPH.math.Set', 'MEPH.math.expression.Evaluator'],
    statics: {
        translate: function (a, b) {
            switch (a.name()) {
                case Expression.RuleType.IntegralConst:
                    return ExpressionTranslation.translateIntegralConst(a, b);
                case Expression.RuleType.IntegralConstMultiply:
                    return ExpressionTranslation.translateIntegralConstMultiply(a, b);
                case Expression.RuleType.Power:
                case Expression.RuleType.PowerIntegrate:
                    return ExpressionTranslation.translatePowerIntegrate(a, b);
                case Expression.RuleType.IntegrationAddition:
                    return ExpressionTranslation.translateIntegrationAddition(a, b);
                case Expression.RuleType.IntegrationByParts:
                    return ExpressionTranslation.translateIntegrationByParts(a, b);
                case Expression.RuleType.OneOverX:
                    return ExpressionTranslation.translateOneOverX(a, b);
                case Expression.RuleType.GeneralFormula8A:
                case Expression.RuleType.GeneralFormula8B:
                    return ExpressionTranslation.translateGeneralFormula8(a, b);
                case Expression.RuleType.GeneralFormula9A:
                case Expression.RuleType.GeneralFormula9B:
                    return ExpressionTranslation.translateGeneralFormula9(a, b);
                case Expression.RuleType.TrigonometricFormula10A:
                case Expression.RuleType.TrigonometricFormula10B:
                    return ExpressionTranslation.translateGeneralFormula10(a, b);
                case Expression.RuleType.TrigonometricFormula11A:
                case Expression.RuleType.TrigonometricFormula11B:
                    return ExpressionTranslation.translateGeneralFormula11(a, b);
                case Expression.RuleType.Derivation.GeneralFormula1a:
                case Expression.RuleType.Derivation.GeneralFormula1b:
                    return ExpressionTranslation.derivation.translateGeneralFormula1(a, b);
                case Expression.RuleType.Derivation.GeneralFormula2a:
                case Expression.RuleType.Derivation.GeneralFormula2b:
                    return ExpressionTranslation.derivation.translateGeneralFormula2(a, b);
                case Expression.RuleType.Derivation.GeneralFormula3a:
                case Expression.RuleType.Derivation.GeneralFormula3b:
                    return ExpressionTranslation.derivation.translateGeneralFormula3(a, b);
                case Expression.RuleType.Derivation.GeneralFormula4a:
                case Expression.RuleType.Derivation.GeneralFormula4b:
                    return ExpressionTranslation.derivation.translateGeneralFormula4(a, b);
                case Expression.RuleType.Derivation.GeneralFormula5a:
                    return ExpressionTranslation.derivation.translateGeneralFormula5(a, b);
                case Expression.RuleType.Derivation.SimpleVariableA:
                case Expression.RuleType.Derivation.SimpleVariableB:
                    return ExpressionTranslation.derivation.translateSimpleFormula(a, b);
                case Expression.RuleType.Derivation.GeneralFormula7a:
                    return ExpressionTranslation.derivation.translateGeneralFormula7(a, b);
                case Expression.RuleType.Derivation.GeneralFormula10a:
                    return ExpressionTranslation.derivation.translateGeneralFormula10(a, b);
                case Expression.RuleType.Derivation.GeneralFormula12a:
                case Expression.RuleType.Derivation.GeneralFormula12b:
                    return ExpressionTranslation.derivation.translateGeneralFormula12(a, b);

                case Expression.RuleType.Derivation.GeneralFormula13a:
                case Expression.RuleType.Derivation.GeneralFormula13b:
                    return ExpressionTranslation.derivation.translateGeneralFormula13(a, b);

                case Expression.RuleType.Derivation.GeneralFormula14a:
                case Expression.RuleType.Derivation.GeneralFormula14b:
                    return ExpressionTranslation.derivation.translateGeneralFormula14(a, b);

                case Expression.RuleType.Derivation.GeneralFormula15a:
                case Expression.RuleType.Derivation.GeneralFormula15b:
                    return ExpressionTranslation.derivation.translateGeneralFormula15(a, b);

                case Expression.RuleType.Derivation.GeneralFormula17a:
                case Expression.RuleType.Derivation.GeneralFormula17b:
                    return ExpressionTranslation.derivation.translateGeneralFormula17(a, b);

                case Expression.RuleType.Derivation.GeneralFormula18a:
                case Expression.RuleType.Derivation.GeneralFormula18b:
                    return ExpressionTranslation.derivation.translateGeneralFormula18(a, b);

                case Expression.RuleType.Derivation.GeneralFormula19a:
                case Expression.RuleType.Derivation.GeneralFormula19b:
                    return ExpressionTranslation.derivation.translateGeneralFormula19(a, b);


                case Expression.RuleType.Derivation.GeneralFormula20a:
                case Expression.RuleType.Derivation.GeneralFormula20b:
                    return ExpressionTranslation.derivation.translateGeneralFormula20(a, b);

                case Expression.RuleType.Derivation.GeneralFormula21a:
                case Expression.RuleType.Derivation.GeneralFormula21b:
                    return ExpressionTranslation.derivation.translateGeneralFormula21(a, b);

                case Expression.RuleType.Derivation.GeneralFormula22a:
                case Expression.RuleType.Derivation.GeneralFormula22b:
                    return ExpressionTranslation.derivation.translateGeneralFormula22(a, b);

                case Expression.RuleType.Derivation.GeneralFormula23a:
                case Expression.RuleType.Derivation.GeneralFormula23b:
                    return ExpressionTranslation.derivation.translateGeneralFormula23(a, b);

                case Expression.RuleType.Derivation.GeneralFormula24a:
                case Expression.RuleType.Derivation.GeneralFormula24b:
                    return ExpressionTranslation.derivation.translateGeneralFormula24(a, b);

                case Expression.RuleType.Derivation.GeneralFormula25a:
                case Expression.RuleType.Derivation.GeneralFormula25b:
                    return ExpressionTranslation.derivation.translateGeneralFormula25(a, b);

                case Expression.RuleType.Derivation.GeneralFormula26a:
                case Expression.RuleType.Derivation.GeneralFormula26b:
                    return ExpressionTranslation.derivation.translateGeneralFormula26(a, b);


                case Expression.RuleType.Derivation.GeneralFormula27a:
                case Expression.RuleType.Derivation.GeneralFormula27b:
                    return ExpressionTranslation.derivation.translateGeneralFormula27(a, b);

                case Expression.RuleType.Derivation.GeneralFormula28a:
                case Expression.RuleType.Derivation.GeneralFormula28b:
                    return ExpressionTranslation.derivation.translateGeneralFormula28(a, b);

                case Expression.RuleType.Derivation.GeneralFormula29a:
                case Expression.RuleType.Derivation.GeneralFormula29b:
                    return ExpressionTranslation.derivation.translateGeneralFormula29(a, b);

                case Expression.RuleType.Derivation.GeneralFormula30a:
                case Expression.RuleType.Derivation.GeneralFormula30b:
                    return ExpressionTranslation.derivation.translateGeneralFormula30(a, b);

                case Expression.RuleType.Derivation.GeneralFormula31a:
                case Expression.RuleType.Derivation.GeneralFormula31b:
                    return ExpressionTranslation.derivation.translateGeneralFormula31(a, b);

                case Expression.RuleType.Derivation.GeneralFormula32a:
                case Expression.RuleType.Derivation.GeneralFormula32b:
                    return ExpressionTranslation.derivation.translateGeneralFormula32(a, b);

                case Expression.RuleType.Derivation.GeneralFormula33a:
                case Expression.RuleType.Derivation.GeneralFormula33b:
                    return ExpressionTranslation.derivation.translateGeneralFormula33(a, b);

                case Expression.RuleType.Derivation.GeneralFormula34a:
                case Expression.RuleType.Derivation.GeneralFormula34b:
                    return ExpressionTranslation.derivation.translateGeneralFormula34(a, b);

                case Expression.RuleType.Derivation.GeneralFormula35a:
                case Expression.RuleType.Derivation.GeneralFormula35b:
                    return ExpressionTranslation.derivation.translateGeneralFormula35(a, b);

                case Expression.RuleType.Derivation.GeneralFormula36a:
                case Expression.RuleType.Derivation.GeneralFormula36b:
                    return ExpressionTranslation.derivation.translateGeneralFormula36(a, b);


                case Expression.RuleType.Derivation.GeneralFormula37a:
                case Expression.RuleType.Derivation.GeneralFormula37b:
                    return ExpressionTranslation.derivation.translateGeneralFormula37(a, b);

                case Expression.RuleType.Derivation.GeneralFormula38a:
                case Expression.RuleType.Derivation.GeneralFormula38b:
                    return ExpressionTranslation.derivation.translateGeneralFormula38(a, b);

                case Expression.RuleType.Derivation.GeneralFormula39a:
                case Expression.RuleType.Derivation.GeneralFormula39b:
                    return ExpressionTranslation.derivation.translateGeneralFormula39(a, b);

                case Expression.RuleType.Derivation.GeneralFormula40a:
                case Expression.RuleType.Derivation.GeneralFormula40b:
                case Expression.RuleType.Integration.IGeneralFormula16a:
                case Expression.RuleType.Integration.IGeneralFormula16b:
                case Expression.RuleType.Integration.IGeneralFormula17a:
                case Expression.RuleType.Integration.IGeneralFormula17b:
                case Expression.RuleType.Integration.IGeneralFormula20a:
                case Expression.RuleType.Integration.IGeneralFormula20b:
                case Expression.RuleType.Integration.IGeneralFormula21a:
                case Expression.RuleType.Integration.IGeneralFormula21b:
                case Expression.RuleType.Integration.IGeneralFormula34a:
                case Expression.RuleType.Integration.IGeneralFormula34b:
                case Expression.RuleType.Integration.IGeneralFormula35a:
                case Expression.RuleType.Integration.IGeneralFormula35b:
                case Expression.RuleType.Integration.IGeneralFormula38a:
                case Expression.RuleType.Integration.IGeneralFormula38b:
                case Expression.RuleType.Integration.IGeneralFormula39a:
                case Expression.RuleType.Integration.IGeneralFormula39b:
                case Expression.RuleType.Integration.IGeneralFormula42a:
                case Expression.RuleType.Integration.IGeneralFormula42b:
                    return ExpressionTranslation.derivation.translateGeneralFormula40(a, b);

                case Expression.RuleType.Integration.IGeneralFormula18a:
                case Expression.RuleType.Integration.IGeneralFormula18b:
                case Expression.RuleType.Integration.IGeneralFormula19a:
                case Expression.RuleType.Integration.IGeneralFormula19b:
                case Expression.RuleType.Integration.IGeneralFormula36a:
                case Expression.RuleType.Integration.IGeneralFormula36b:
                case Expression.RuleType.Integration.IGeneralFormula37a:
                case Expression.RuleType.Integration.IGeneralFormula37b:
                    return ExpressionTranslation.derivation.translateIGeneralFormula18(a, b);


                case Expression.RuleType.Integration.IGeneralFormula12a:
                case Expression.RuleType.Integration.IGeneralFormula12b:
                case Expression.RuleType.Integration.IGeneralFormula13a:
                case Expression.RuleType.Integration.IGeneralFormula13b:
                case Expression.RuleType.Integration.IGeneralFormula14a:
                case Expression.RuleType.Integration.IGeneralFormula14b:
                case Expression.RuleType.Integration.IGeneralFormula15a:
                case Expression.RuleType.Integration.IGeneralFormula15b:
                case Expression.RuleType.Integration.IGeneralFormula26a:
                case Expression.RuleType.Integration.IGeneralFormula26b:
                case Expression.RuleType.Integration.IGeneralFormula27a:
                case Expression.RuleType.Integration.IGeneralFormula27b:
                case Expression.RuleType.Integration.IGeneralFormula28a:
                case Expression.RuleType.Integration.IGeneralFormula28b:
                case Expression.RuleType.Integration.IGeneralFormula29a:
                case Expression.RuleType.Integration.IGeneralFormula29b:
                case Expression.RuleType.Integration.IGeneralFormula30a:
                case Expression.RuleType.Integration.IGeneralFormula30b:
                case Expression.RuleType.Integration.IGeneralFormula31a:
                case Expression.RuleType.Integration.IGeneralFormula31b:
                case Expression.RuleType.Integration.IGeneralFormula32a:
                case Expression.RuleType.Integration.IGeneralFormula32b:
                case Expression.RuleType.Integration.IGeneralFormula33a:
                case Expression.RuleType.Integration.IGeneralFormula33b:
                case Expression.RuleType.Integration.IGeneralFormula40a:
                case Expression.RuleType.Integration.IGeneralFormula40b:
                    return ExpressionTranslation.derivation.translateIGeneralFormulaSingleVariable(a, b);

                case Expression.RuleType.Integration.IGeneralFormula24a:
                case Expression.RuleType.Integration.IGeneralFormula24b:
                    return ExpressionTranslation.derivation.translateIGeneralFormula24(a, b);

                case Expression.RuleType.Integration.IGeneralFormula25a:
                case Expression.RuleType.Integration.IGeneralFormula25b:
                    return ExpressionTranslation.derivation.translateIGeneralFormula25(a, b);

                case Expression.RuleType.Integration.IGeneralFormula45a:
                case Expression.RuleType.Integration.IGeneralFormula45b:
                    return ExpressionTranslation.derivation.translateIGeneralFormula45(a, b);

                case Expression.RuleType.Integration.IGeneralFormula41a:
                case Expression.RuleType.Integration.IGeneralFormula41b:
                    return ExpressionTranslation.derivation.translateIGeneralFormula41(a, b);

                case Expression.RuleType.Integration.IGeneralFormula43a:
                case Expression.RuleType.Integration.IGeneralFormula43b:
                    return ExpressionTranslation.derivation.translateGeneralFormula43(a, b);


                case Expression.RuleType.Integration.IGeneralFormula44a:
                case Expression.RuleType.Integration.IGeneralFormula44b:
                    return ExpressionTranslation.derivation.translateGeneralFormula44(a, b);

                case Expression.RuleType.Integration.IGeneralFormula47a:
                case Expression.RuleType.Integration.IGeneralFormula47b:
                    return ExpressionTranslation.derivation.translateGeneralFormula47(a, b);

                case Expression.RuleType.Integration.IGeneralFormula48a:
                case Expression.RuleType.Integration.IGeneralFormula48b:
                    return ExpressionTranslation.derivation.translateGeneralFormula48(a, b);

                case Expression.RuleType.Integration.IGeneralFormula49a:
                case Expression.RuleType.Integration.IGeneralFormula49b:
                    return ExpressionTranslation.derivation.translateGeneralFormula49(a, b);

                case Expression.RuleType.Derivation.ChainRuleA:
                case Expression.RuleType.Derivation.ChainRuleB:
                    return ExpressionTranslation.derivation.chainRule(a, b);

                default:
                    throw new Error('Unhandled case : ExpressionTranslation');
            }
        },
        /**
         * Returns an array of translation sets.
         * @returns {Array}
         ***/
        translationPool: function () {
            var res = [];

            //Integration
            res.push([Expression.RuleType.IntegralConst, Expression.RuleType.AxPlusC]);
            res.push([Expression.RuleType.IntegralConstMultiply, Expression.RuleType.MultiplyIntegralofFx]);
            res.push([Expression.RuleType.PowerIntegrate, Expression.RuleType.Power]);
            res.push([Expression.RuleType.IntegrationAddition, Expression.RuleType.AdditionIntegral]);
            res.push([Expression.RuleType.TrigonometricFormula10A, Expression.RuleType.TrigonometricFormula10B]);
            res.push([Expression.RuleType.TrigonometricFormula11A, Expression.RuleType.TrigonometricFormula11B]);


            //Derivatives
            res.push([Expression.RuleType.Derivation.GeneralFormula1a, Expression.RuleType.Derivation.GeneralFormula1b]);
            res.push([Expression.RuleType.Derivation.GeneralFormula2a, Expression.RuleType.Derivation.GeneralFormula2b]);
            res.push([Expression.RuleType.Derivation.GeneralFormula3a, Expression.RuleType.Derivation.GeneralFormula3b]);
            res.push([Expression.RuleType.Derivation.GeneralFormula4a, Expression.RuleType.Derivation.GeneralFormula4b]);
            res.push([Expression.RuleType.Derivation.GeneralFormula5a, Expression.RuleType.Derivation.GeneralFormula5b]);
            res.push([Expression.RuleType.Derivation.ChainRuleA, Expression.RuleType.Derivation.ChainRuleB]);


            res.push([Expression.RuleType.Derivation.SimpleVariableA, Expression.RuleType.Derivation.SimpleVariableB]);
            [].interpolate(0, 100, function (x) {
                res.push([Expression.RuleType.Derivation['GeneralFormula' + x + 'a'], Expression.RuleType.Derivation['GeneralFormula' + x + 'b']]);
            });

            [].interpolate(0, 100, function (x) {
                res.push([Expression.RuleType.Integration['IGeneralFormula' + x + 'a'], Expression.RuleType.Integration['IGeneralFormula' + x + 'b']]);
            });
            return res;
        },
        /**
         * Transforms a expression a in to expression b
         * @param {Object} transform
         * @param {MEPH.math.Expression} a
         * @param {MEPH.math.Expression} b
         */

        transform: function (transform, a, b) {
            var a_copy = a.copy();
            var b_copy = b.copy();
            a_copy.ensureLineage();
            b_copy.ensureLineage();
            var a_marks = a_copy.getMarks();
            var b_marks = b_copy.getMarks();
            var tranformedRepeats;
            if (transform.repeat) {

                for (var i in transform.repeat) {
                    var transFormInfo = transform.repeat[i];
                    if (transFormInfo.trans) {
                        var a_repeat = a_marks[i];
                        var b_repeat = b_marks[transFormInfo.target];
                        var repeatPartsA = a_repeat.getRepeatParts();
                        var repeatPartsB = b_repeat.getRepeatParts();

                        if (repeatPartsB.length > 1) {
                            throw 'not handled';
                        }
                        else {
                            tranformedRepeats = repeatPartsA.select(function (a) {
                                var tempA = a.val.copy();
                                return ExpressionTranslation.transform(transFormInfo.trans, tempA, repeatPartsB.first().val);
                            });
                        }
                    }
                    else if (transFormInfo.scatter) {
                        tranformedRepeats = tranformedRepeats.select(function (x) {
                            a_copy = a_copy.copy();
                            return ExpressionTranslation.transform(transFormInfo.scatter, a_copy, x);
                        });
                    }
                }
                b_copy.getMark(transform.transform.to).clearParts();
                b_copy.getMark(transform.transform.to).setParts(tranformedRepeats, Expression['function'].input);
                return b_copy;
            }
            else if (transform.pattern) {
                if (transform.pattern.process) {
                    return transform.pattern.process(transform, a_copy, b_copy);
                }
            }
            else {
                for (var i in transform) {
                    if (i !== 'transformation' && i !== 'repeat') {
                        var ai;
                        var bi;
                        if (transform.transformation.from === a.name()) {
                            ai = i;
                            bi = transform[i];
                        }
                        else {
                            ai = transform[i];
                            bi = i;
                        }
                        a_copy = a.copy();
                        var a_mark = a_copy.getMark(ai);
                        if (Array.isArray(a_mark)) {
                            a_mark = ExpressionTranslation.convertSiblingsToAnExpression(a_mark);
                        }
                        //var Evaluator = MEPH.math.expression.Evaluator;
                        //a_mark = Evaluator.evaluate(a_mark);

                        b_copy.swap(bi, a_mark);

                        if (b_copy === b_copy.getMark(bi)) {
                            b_copy = a_mark;
                        }
                    }
                }
                return b_copy;
            }
        },
        /**
         * Convers siblings to an expression of the same type as the parent.
         * @param {Array} siblings
         ***/
        convertSiblingsToAnExpression: function (siblings) {
            var sibling = siblings.first();
            var parent = sibling.parent();
            switch (parent.type) {
                case Expression.type.multiplication:
                    return Expression.multiplication.apply(this, siblings);
                case Expression.type.subtraction:
                    return Expression.subtraction.apply(this, siblings);
                case Expression.type.addition:
                    return Expression.addition.apply(this, siblings);
                case Expression.type.division:
                    return Expression.division.apply(this, siblings);
            }
        },

        derivation: {

            translateGeneralFormula1: function (a, b) {
                var transformation = {
                    transformation: {
                        from: Expression.RuleType.Derivation.GeneralFormula1a,
                        to: Expression.RuleType.Derivation.GeneralFormula1b
                    }
                };
                var result = Expression.translation.Transform(transformation, a, b);
                return result;
            },
            translateGeneralFormula2: function (a, b) {

                var transformation = {
                    transformation: {
                        from: Expression.RuleType.Derivation.GeneralFormula2a,
                        to: Expression.RuleType.Derivation.GeneralFormula2b
                    },
                    C: 'C'
                };
                var result = Expression.translation.Transform(transformation, a, b);
                return result;

            },
            translateGeneralFormula3: function (a, b) {
                var transformation = {
                    transformation: {
                        from: Expression.RuleType.Derivation.GeneralFormula3a,
                        to: Expression.RuleType.Derivation.GeneralFormula3b
                    },
                    C: 'C',
                    U: 'U',
                    dx: 'dx'
                };
                var result = Expression.translation.Transform(transformation, a, b);
                return result;
            },
            translateGeneralFormula4: function (a, b) {
                var transformation = {
                    repeat: {
                        A: {
                            target: 'A',

                            trans: {
                                transformation: {
                                    from: Expression.RuleType.Derivation.GeneralFormula4a,
                                    to: Expression.RuleType.Derivation.GeneralFormula4b
                                },
                                U: 'U'
                            }
                        },
                        dx: {
                            scatter: {
                                transformation: {
                                    from: Expression.RuleType.Derivation.GeneralFormula4a,
                                    to: Expression.RuleType.Derivation.GeneralFormula4b
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
                var result = Expression.translation.Transform(transformation, a, b);

                return result;
            },
            translateSimpleFormula: function (a, b) {
                // Expression.SwapPart(a, b);
                return b.copy();
            },
            translateGeneralFormula5: function (a, b) {
                var convert = {
                    from: 'A', to: 'A'
                }
                var targetselection = {
                    target: 'dir',
                    overrite: 'U'
                }
                var nonselection = {
                    target: 'V'
                }
                var respecto = {
                    target: 'dx'
                }
                var Copyto = {
                    target: 'copyTo'
                }
                var transformation = {
                    pattern: {
                        process: function (transform, a_copy, b_copy) {
                            var a_A = a_copy.getMark(convert.from);
                            var b_A = b_copy.getMark(convert.to);
                            var count = a_A.parts.length;

                            var masks = Set.base2MaskSet(count);
                            var partsTo = masks.where(function (t) {
                                return t.split('').count(function (x) {
                                    return x === '1';

                                }) === 1;
                            }).select(function (mask) {
                                var cc_a = a_A.copy();
                                var cc_b = b_A.copy();
                                var copyto = b_copy.getMark(Copyto.target).copy();

                                var res = mask.split('').select(function (x, index) {
                                    if (x === '1') {
                                        var target = cc_b.getMark(targetselection.target).copy();

                                        var dx = a_copy.getMark(respecto.target).copy();
                                        target.swap(respecto.target, dx);
                                        var overrite = target.swap(targetselection.overrite, cc_a.getPartByIndex(index).copy());
                                        return target;
                                    }
                                    else {
                                        var target = cc_a.getPartByIndex(index).copy();
                                        return target;
                                    }
                                }).select(function (x) { return x.copy(); });

                                copyto.clearParts();
                                copyto.setParts(res, Expression['function'].input);

                                return copyto;
                            });


                            b_copy.getMark(transformation.transform.to).clearParts();
                            b_copy.getMark(transformation.transform.to).setParts(partsTo, Expression['function'].input);
                            return b_copy;
                        }
                    },
                    transform: {
                        from: 'A',
                        to: 'A'
                    }
                };

                var result = Expression.translation.Transform(transformation, a, b);

                return result;
            },
            translateGeneralFormula7: function (a, b) {
                var transformation = {
                    transformation: {
                        from: Expression.RuleType.Derivation.GeneralFormula7b,
                        to: Expression.RuleType.Derivation.GeneralFormula7a,
                    },
                    V: 'V',
                    dU: 'U',
                    dV: 'V',
                    dudx: 'dx',
                    dvdx: 'dx',
                    U: 'U',
                    VD: 'V'
                };

                var result = Expression.translation.Transform(transformation, a, b);
                return result;
            },
            translateGeneralFormula10: function (a, b) {
                var transformation = {
                    transformation: {
                        from: Expression.RuleType.Derivation.GeneralFormula10b,
                        to: Expression.RuleType.Derivation.GeneralFormula10a
                    },
                    dx: 'dx',
                    dU: 'U',
                    NS: 'N',
                    U: 'U',
                    N: 'N'
                }

                var result = Expression.translation.Transform(transformation, a, b);
                return result;
            },
            translateGeneralFormula12: function (a, b) {
                var transformation = {
                    transformation: {
                        from: Expression.RuleType.Derivation.GeneralFormula12b,
                        to: Expression.RuleType.Derivation.GeneralFormula12a
                    },
                    X: 'X'
                }

                var result = Expression.translation.Transform(transformation, a, b);
                return result;
            },
            translateGeneralFormula13: function (a, b) {
                var transformation = {
                    transformation: {
                        from: Expression.RuleType.Derivation.GeneralFormula13b,
                        to: Expression.RuleType.Derivation.GeneralFormula13a
                    },
                    X: 'X',
                    A: 'A',
                    LNA: 'A'
                }

                var result = Expression.translation.Transform(transformation, a, b);
                return result;
            },
            translateGeneralFormula14: function (a, b) {
                var transformation = {
                    transformation: {
                        from: Expression.RuleType.Derivation.GeneralFormula14a,
                        to: Expression.RuleType.Derivation.GeneralFormula14b
                    },
                    X: 'X'
                }

                var result = Expression.translation.Transform(transformation, a, b);
                return result;
            },
            translateGeneralFormula15: function (a, b) {
                var transformation = {
                    transformation: {
                        from: Expression.RuleType.Derivation.GeneralFormula15a,
                        to: Expression.RuleType.Derivation.GeneralFormula15b
                    },
                    X: 'X',
                    A: 'A'
                }

                var result = Expression.translation.Transform(transformation, a, b);
                return result;
            },
            translateGeneralFormula17: function (a, b) {
                return ExpressionTranslation.derivation.trigstandard(a, b,
                    Expression.RuleType.Derivation.GeneralFormula17a,
                    Expression.RuleType.Derivation.GeneralFormula17b);
            },
            translateGeneralFormula18: function (a, b) {
                return ExpressionTranslation.derivation.trigstandard(a, b,
                    Expression.RuleType.Derivation.GeneralFormula18a,
                    Expression.RuleType.Derivation.GeneralFormula18b);
            },
            translateGeneralFormula19: function (a, b) {
                return ExpressionTranslation.derivation.trigstandard(a, b,
                    Expression.RuleType.Derivation.GeneralFormula19a,
                    Expression.RuleType.Derivation.GeneralFormula19b);
            },
            translateGeneralFormula20: function (a, b) {
                return ExpressionTranslation.derivation.trigstandard(a, b,
                    Expression.RuleType.Derivation.GeneralFormula20a,
                    Expression.RuleType.Derivation.GeneralFormula20b);
            },
            translateGeneralFormula23: function (a, b) {
                return ExpressionTranslation.derivation.trigstandard(a, b,
                    Expression.RuleType.Derivation.GeneralFormula23a,
                    Expression.RuleType.Derivation.GeneralFormula23b);

            },
            translateGeneralFormula24: function (a, b) {
                return ExpressionTranslation.derivation.trigstandard(a, b,
                    Expression.RuleType.Derivation.GeneralFormula24a,
                    Expression.RuleType.Derivation.GeneralFormula24b);
            },
            translateGeneralFormula25: function (a, b) {
                return ExpressionTranslation.derivation.trigstandard(a, b,
                    Expression.RuleType.Derivation.GeneralFormula25a,
                    Expression.RuleType.Derivation.GeneralFormula25b);
            },
            translateGeneralFormula26: function (a, b) {
                return ExpressionTranslation.derivation.trigstandard(a, b,
                    Expression.RuleType.Derivation.GeneralFormula26a,
                    Expression.RuleType.Derivation.GeneralFormula26b);
            },
            translateGeneralFormula29: function (a, b) {
                return ExpressionTranslation.derivation.trigstandard(a, b,
                    Expression.RuleType.Derivation.GeneralFormula29a,
                    Expression.RuleType.Derivation.GeneralFormula29b);
            },
            translateGeneralFormula30: function (a, b) {
                return ExpressionTranslation.derivation.trigstandard(a, b,
                    Expression.RuleType.Derivation.GeneralFormula30a,
                    Expression.RuleType.Derivation.GeneralFormula30b);
            },
            translateGeneralFormula31: function (a, b) {
                return ExpressionTranslation.derivation.trigstandard(a, b,
                    Expression.RuleType.Derivation.GeneralFormula31a,
                    Expression.RuleType.Derivation.GeneralFormula31b);
            },
            translateGeneralFormula32: function (a, b) {
                return ExpressionTranslation.derivation.trigstandard(a, b,
                Expression.RuleType.Derivation.GeneralFormula32a,
                Expression.RuleType.Derivation.GeneralFormula32b);

            },
            translateGeneralFormula35: function (a, b) {
                return ExpressionTranslation.derivation.trigstandard(a, b,
                    Expression.RuleType.Derivation.GeneralFormula34a,
                    Expression.RuleType.Derivation.GeneralFormula34b);
            },
            translateGeneralFormula36: function (a, b) {
                return ExpressionTranslation.derivation.trigstandard(a, b,
                    Expression.RuleType.Derivation.GeneralFormula36a,
                    Expression.RuleType.Derivation.GeneralFormula36b);
            },
            translateGeneralFormula37: function (a, b) {
                return ExpressionTranslation.derivation.trigstandard(a, b,
                    Expression.RuleType.Derivation.GeneralFormula37a,
                    Expression.RuleType.Derivation.GeneralFormula37b);
            },
            translateGeneralFormula38: function (a, b) {
                return ExpressionTranslation.derivation.trigstandard(a, b,
                    Expression.RuleType.Derivation.GeneralFormula38a,
                    Expression.RuleType.Derivation.GeneralFormula38b);
            },
            translateIGeneralFormulaSingleVariable: function (a, b) {
                return ExpressionTranslation.derivation.trigstandard(a, b,
                    a.name(),
                    Expression.RuleType.Integration.IGeneralFormula12b);
            },
            trigstandard: function (a, b, name1, name2) {
                var transformation = {
                    transformation: {
                        from: name1,
                        to: name2
                    },
                    X: 'X'
                }

                var result = Expression.translation.Transform(transformation, a, b);
                return result;
            },
            translateGeneralFormula21: function (a, b) {
                return ExpressionTranslation.derivation.trigTwoX(a, b,
                    Expression.RuleType.Derivation.GeneralFormula21a,
                    Expression.RuleType.Derivation.GeneralFormula21b);
            },
            translateGeneralFormula22: function (a, b) {
                return ExpressionTranslation.derivation.trigTwoX(a, b,
                    Expression.RuleType.Derivation.GeneralFormula22a,
                    Expression.RuleType.Derivation.GeneralFormula22b);
            },

            translateGeneralFormula27: function (a, b) {
                return ExpressionTranslation.derivation.trigTwoX(a, b,
                    Expression.RuleType.Derivation.GeneralFormula27a,
                    Expression.RuleType.Derivation.GeneralFormula27b);
            },
            translateGeneralFormula28: function (a, b) {
                return ExpressionTranslation.derivation.trigTwoX(a, b,
                    Expression.RuleType.Derivation.GeneralFormula28a,
                    Expression.RuleType.Derivation.GeneralFormula28b);
            },
            translateGeneralFormula33: function (a, b) {
                return ExpressionTranslation.derivation.trigTwoX(a, b,
                    Expression.RuleType.Derivation.GeneralFormula33a,
                    Expression.RuleType.Derivation.GeneralFormula33b);
            },
            translateGeneralFormula34: function (a, b) {
                return ExpressionTranslation.derivation.trigTwoX(a, b,
                    Expression.RuleType.Derivation.GeneralFormula34a,
                    Expression.RuleType.Derivation.GeneralFormula34b);
            },
            translateGeneralFormula39: function (a, b) {
                return ExpressionTranslation.derivation.trigTwoX(a, b,
                    Expression.RuleType.Derivation.GeneralFormula39a,
                    Expression.RuleType.Derivation.GeneralFormula39b);
            },
            translateGeneralFormula40: function (a, b) {
                return ExpressionTranslation.derivation.trigTwoX(a, b,
                    a.name(),
                    Expression.RuleType.Derivation.GeneralFormula40b);
            },
            translateIGeneralFormula18: function (a, b) {
                return ExpressionTranslation.derivation.trigTwoX(a, b,
                                  Expression.RuleType.Derivation.GeneralFormula40b,
                                  a.name());
            },
            translateGeneralFormula47: function (a, b) {
                var transformation = {
                    transformation: {
                        to: Expression.RuleType.Integration.IGeneralFormula47a,
                        from: Expression.RuleType.Integration.IGeneralFormula47b
                    },
                    dx: 'dx',
                    N1: 'N',
                    N2: 'N',
                    N3: 'N',
                    X1: 'X1',
                    A1: 'A',
                    A2: 'A',
                    A3: 'A',
                    A4: 'A',
                    X4: 'X2',
                    X3: 'X2',
                    X2: 'X2'
                }

                var result = Expression.translation.Transform(transformation, a, b);
                return result;
            },
            chainRule: function (a, b) {
                var transformation = {
                    transformation: {
                        to: Expression.RuleType.Derivation.ChainRuleA,
                        from: Expression.RuleType.Derivation.ChainRuleB
                    },
                    Gx: 'Gx',
                    Fx: 'Fx',
                    dx1: 'dx',
                    dx2: 'dx'
                }
                
                var result = Expression.translation.Transform(transformation, a, b);

                return result;
            },
            translateGeneralFormula49: function (a, b) {
                var transformation = {
                    transformation: {
                        to: Expression.RuleType.Integration.IGeneralFormula49a,
                        from: Expression.RuleType.Integration.IGeneralFormula49b
                    },
                    X2: 'X1',
                    X1: 'X1',
                    N3: 'N',
                    N1: 'N',
                    N2: 'N'
                }

                var result = Expression.translation.Transform(transformation, a, b);

                return result;
            },
            translateGeneralFormula48: function (a, b) {
                var transformation = {
                    transformation: {
                        to: Expression.RuleType.Integration.IGeneralFormula48a,
                        from: Expression.RuleType.Integration.IGeneralFormula48b
                    },
                    dx: 'dx',
                    N1: 'N',
                    N2: 'N',
                    N3: 'N',
                    X1: 'X1',
                    A1: 'A',
                    A2: 'A',
                    A3: 'A',
                    X4: 'X2',
                    X3: 'X2',
                    X2: 'X2'
                }

                var result = Expression.translation.Transform(transformation, a, b);

                return result;
            },
            translateGeneralFormula44: function (a, b) {
                var transformation = {
                    transformation: {
                        to: Expression.RuleType.Integration.IGeneralFormula44a,
                        from: Expression.RuleType.Integration.IGeneralFormula44b
                    },
                    X1: 'X1',
                    A1: 'A',
                    A2: 'A',
                    A3: 'A',
                    X2: 'X2'
                }

                var result = Expression.translation.Transform(transformation, a, b);
                return result;
            },
            translateGeneralFormula43: function (a, b) {
                var transformation = {
                    transformation: {
                        to: Expression.RuleType.Integration.IGeneralFormula43a,
                        from: Expression.RuleType.Integration.IGeneralFormula43b
                    },
                    X1: 'X',
                    A: 'A',
                    X2: 'X'
                }

                var result = Expression.translation.Transform(transformation, a, b);
                return result;
            },
            translateIGeneralFormula41: function (a, b) {
                var transformation = {
                    transformation: {
                        to: Expression.RuleType.Integration.IGeneralFormula41a,
                        from: Expression.RuleType.Integration.IGeneralFormula41b
                    },
                    X: 'X',
                    A1: 'A',
                    A2: 'A'
                }

                var result = Expression.translation.Transform(transformation, a, b);
                return result;
            },
            translateIGeneralFormula45: function (a, b) {

                var transformation = {
                    transformation: {
                        to: Expression.RuleType.Integration.IGeneralFormula45a,
                        from: Expression.RuleType.Integration.IGeneralFormula45b
                    },
                    A: 'A',
                    X1: 'X1',
                    X2: 'X2'
                }

                var result = Expression.translation.Transform(transformation, a, b);
                return result;
            },
            translateIGeneralFormula25: function (a, b) {
                var transformation = {
                    transformation: {
                        to: Expression.RuleType.Integration.IGeneralFormula25a,
                        from: Expression.RuleType.Integration.IGeneralFormula25b
                    },
                    X1: 'X',
                    X2: 'X',
                    X3: 'X',
                    dx: 'dx',
                    N1: 'N',
                    N2: 'N',
                    N3: 'N',
                    N4: 'N',
                    N5: 'N'
                }

                var result = Expression.translation.Transform(transformation, a, b);
                return result;
            },
            translateIGeneralFormula24: function (a, b, c, d) {
                var transformation = {
                    transformation: {
                        to: c || Expression.RuleType.Integration.IGeneralFormula24a,
                        from: d || Expression.RuleType.Integration.IGeneralFormula24b
                    },
                    X1: 'X',
                    X2: 'X',
                    X3: 'X',
                    dx: 'dx',
                    N1: 'N',
                    N2: 'N',
                    N3: 'N',
                    N4: 'N',
                    N5: 'N'
                }

                var result = Expression.translation.Transform(transformation, a, b);
                return result;
            },
            trigTwoX: function (a, b, name1, name2) {
                var transformation = {
                    transformation: {
                        to: name1,
                        from: name2
                    },
                    X1: 'X',
                    X2: 'X'
                }

                var result = Expression.translation.Transform(transformation, a, b);
                return result;
            }
        },
        translateGeneralFormula8: function (a, b) {

            var transformation = {
                transformation: {
                    from: Expression.RuleType.GeneralFormula8B,
                    to: Expression.RuleType.GeneralFormula8A
                },
                x: 'x',
                a_tan: 'a',
                a: 'a'
            };
            var result = Expression.translation.Transform(transformation, a, b);
            return result;
        },
        translateGeneralFormula11: function (a, b) {
            var transformation = {
                transformation: {
                    from: Expression.RuleType.GeneralFormula11A,
                    to: Expression.RuleType.GeneralFormula11B
                },
                x: 'x',
            };
            var result = Expression.translation.Transform(transformation, a, b);
            return result;
        },
        translateGeneralFormula10: function (a, b) {
            var transformation = {
                transformation: {
                    from: Expression.RuleType.GeneralFormula10B,
                    to: Expression.RuleType.GeneralFormula10A
                },
                x: 'x',
            };
            var result = Expression.translation.Transform(transformation, a, b);
            return result;

        },
        translateGeneralFormula9: function (a, b) {
            var transformation = {
                transformation: {
                    from: Expression.RuleType.GeneralFormula9B,
                    to: Expression.RuleType.GeneralFormula9A
                },
                x1: 'x',
                x2: 'x',
                a1: 'a',
                a2: 'a',
                a3: 'a'
            };
            var result = Expression.translation.Transform(transformation, a, b);
            return result;

        },
        translateOneOverX: function (a, b) {
            var transformation = {
                transformation: {
                    from: Expression.RuleType.OneOverX,
                    to: Expression.RuleType.NaturalLogAbsX
                },
                x: 'x'
            };

            var result = Expression.translation.Transform(transformation, a, b);
            return result;
        },
        translateIntegrationByParts: function (a, b) {
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

            var result = Expression.translation.Transform(transformation, a, b);

            return result;
        },
        translateIntegrationAddition: function (a, b) {
            switch (b.name()) {
                case Expression.RuleType.AdditionIntegral:
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
                    var result = Expression.translation.Transform(transformation, a, b);

                    return result;
            }
        },
        translateIntegralConst: function (a, b) {
            a = a.copy();
            b = b.copy();
            var a_marks = a.getMarks();
            var result = b.copy();
            var b_marks = result.getMarks();
            switch (b.name()) {
                case Expression.RuleType.AxPlusC:
                    var transformation = {
                        transformation: {
                            from: Expression.RuleType.IntegralConst,
                            to: Expression.RuleType.AxPlusC
                        },
                        C: 'A',
                        dx: 'x'
                    };
                    return Expression.translation.Transform(transformation, a, b);
                default: return null;
            }
        },
        translateIntegralConst: function (a, b) {
            a = a.copy();
            b = b.copy();
            var a_marks = a.getMarks();
            var result = b.copy();
            var b_marks = result.getMarks();
            switch (b.name()) {
                case Expression.RuleType.AxPlusC:
                    var transformation = {
                        transformation: {
                            from: Expression.RuleType.IntegralConst,
                            to: Expression.RuleType.AxPlusC
                        },
                        C: 'A',
                        dx: 'x'
                    };
                    return Expression.translation.Transform(transformation, a, b);
                default: return null;
            }
        },
        /**
         * Translates the IntegralConstMultiply
         * @param {MEPH.math.Expression} a
         * @param {MEPH.math.Expression} b
         * @return {MEPH.math.Expression}
         **/
        translateIntegralConstMultiply: function (a, b) {
            a = a.copy();
            b = b.copy();
            var a_marks = a.getMarks();
            var result = b.copy();
            var b_marks = result.getMarks();
            switch (b.name()) {
                case Expression.RuleType.MultiplyIntegralofFx:
                    var transformation = {
                        transformation: {
                            from: Expression.RuleType.IntegralConstMultiply,
                            to: Expression.RuleType.MultiplyIntegralofFx
                        },
                        C: 'C',
                        A: 'A'
                    };
                    return Expression.translation.Transform(transformation, a, b);
                default: return null;
            }
        },
        /**
      * Translates the PowerIntegrate
      * @param {MEPH.math.Expression} a
      * @param {MEPH.math.Expression} b
      * @return {MEPH.math.Expression}
      **/
        translatePowerIntegrate: function (a, b) {
            var name = a.name();
            if (Expression.RuleType.PowerIntegrate !== a.name()) {
                name = b.name();
            }
            a = a.copy();
            b = b.copy();
            var a_marks = a.getMarks();
            var result = b.copy();
            var b_marks = result.getMarks();
            switch (name) {
                case Expression.RuleType.PowerIntegrate:
                case Expression.RuleType.Power:
                    var transformation = {
                        transformation: {
                            from: Expression.RuleType.PowerIntegrate,
                            to: Expression.RuleType.Power
                        },
                        n_pre: 'n',
                        n_post: 'n',
                        x: 'x'
                    };
                    return Expression.translation.Transform(transformation, a, b);
                default: return null;
            }
        }
    }
});