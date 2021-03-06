﻿MEPH.define('MEPH.util.Boolean', {
    alternateNames: 'Boolean',
    statics: {
        IsEqual: function () {
            var args = MEPH.util.Array.create(arguments);
            var t = args[0];
            var instructions = MEPH.util.Boolean.Parameters(args);

            return args.subset(0, instructions.params.length).all(function (x) {
                return t === x;
            });
        },
        IsTrue: function () {
            var args = MEPH.util.Array.create(arguments);
            var t = args[0];
            var instructions = MEPH.util.Boolean.Parameters(args);
            var paramcount = MEPH.util.Boolean.ParamaterCount(args)

            if (args.length >= paramcount) {
                if (typeof arguments[0] === 'function') {
                    var paramFunc = arguments[0];
                    var parameters = args.subset(1, paramcount - 1).concat([arguments[arguments.length - 1]]);
                    return paramFunc.apply(arguments[paramcount - 1], parameters);
                }
                else {
                    return arguments[0];
                }
            }
        },
        IsLikeEqual: function () {
            var args = MEPH.util.Array.create(arguments);
            var t = args[0];
            var instructions = MEPH.util.Boolean.Parameters(args);

            return args.subset(0, instructions.params.length).all(function (x) {
                return t == x;
            });
        },
        Then: function () {
            var args = MEPH.util.Array.create(arguments), paramcount = Boolean.ParamaterCount(args);
            if (args[paramcount]) {
                var paramFunc = arguments[0];
                paramFunc.apply(null, args.subset(1, paramcount));
            }
            return args[paramcount];
        },
        Else: function () {
            var args = MEPH.util.Array.create(arguments), paramcount = Boolean.ParamaterCount(args);

            if (!args[paramcount]) {
                var paramFunc = arguments[0];
                paramFunc.apply(null, args.subset(1, paramcount));
            }
            return args[paramcount];
        },
        ParamaterCount: function (args) {
            var instructions = MEPH.util.Boolean.Parameters(args);
            return instructions.params.length;
        },
        Parameters: function (args) {
            var instructions = args.first(function (instructions) {
                return instructions && instructions[' instructions'];
            });
            if (instructions) {
                return instructions[instructions[' instructionIndex']];
            }
            return null;
        }
    }
}).then(function () {
    MEPH.addBindPrefixShortCuts('boolean', 'object', MEPH.util.Boolean);
});