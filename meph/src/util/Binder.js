MEPH.define('MEPH.util.Binder', {
    requires: ['MEPH.util.Boolean'],
    alternateNames: 'Binder',
    statics: {
        apply: function () {
            var args = MEPH.util.Array.create(arguments);
            var t = args[0];
            var instructions = MEPH.util.Boolean.Parameters(args);
            var paramcount = MEPH.util.Boolean.ParamaterCount(args)

            if (args.length >= paramcount) {
                var paramFunc = arguments[0];
                return paramFunc.apply(arguments[paramcount - 1], args.subset(1, paramcount - 1).concat([arguments[arguments.length - 1]]));
            }
            return null;
        }
    }
}).then(function () {
    MEPH.addBindPrefixShortCuts('b$', 'object', MEPH.util.Binder);
});