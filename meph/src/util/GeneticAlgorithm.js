MEPH.define('MEPH.util.GeneticAlgorithm', {
    requires: ['MEPH.util.Dom',
        'MEPH.math.Vector',
        'MEPH.math.Matrix3d',
        'MEPH.math.Util',
        'MEPH.util.Task'],
    initialize: function () {
        var me = this;
    },
    setEvalFunction: function (func) {
        var me = this;
        me.$evalFunction = func;
    },
    setScoreFunction: function (func) {
        var me = this;
        me.$scoreFunction = func;
    },
    clear: function () {
        var me = this;
        me.$currentGenerations = [];
    },
    execute: function () {
        var me = this,
            csize;

        me.$currentGenerations = me.$currentGenerations || [];
        csize = me.$currentGenerations.length;
        if (csize) {
            [].interpolate(0, me.$procreateRate, function () {
                var randomIndex1 = Math.floor(Math.random() * csize);
                var randomIndex2 = Math.floor(Math.random() * csize);
                var split = Math.floor(Math.random() * me.$evalArgs.length);
                var gen1 = me.$currentGenerations[randomIndex1];
                var gen2 = me.$currentGenerations[randomIndex2];
                var newargs = gen1.args.subset(0, split).concat(gen2.args.subset(split));
                var str = me.$evalFunc.toString();
                if (str) {
                    me.$evalArgs.foreach(function (t, i) {
                        str = me.replace(str, t.arg, newargs[i]);
                    });
                    eval('var func = ' + str);
                    me.$currentGenerations.push({ args: newargs, func: func });
                }
            });
            csize = me.$currentGenerations.length;
        }
        [].interpolate(0, me.$genSize - csize, function () {
            var generation = me.$evalArgs.select(function (x) {
                switch (x.type) {
                    case 'integer':
                        return Math.round(MEPH.math.Util.random(x.min, x.max));

                }
                return MEPH.math.Util.random(x.min, x.max);
            });
            var str = me.$evalFunc.toString();
            if (str) {
                me.$evalArgs.foreach(function (t, i) {
                    str = me.replace(str, t.arg, generation[i]);
                });
                eval('var func = ' + str);
                me.$currentGenerations.push({ args: generation, func: func });
            }
        });

        var res = me.$currentGenerations.select(function (cg) {
            return {
                result: cg.func.apply(me.$scope, cg.args),
                func: cg.func,
                args: cg.args
            }
        });

        res.foreach(function (t) {
            t.evaluatedResult = me.$evalFunction(t.result, me.$actualResult);
            t.score = me.$scoreFunction(t.evaluatedResult);
        });
        res = res.sort(function (a, b) {
            return b.score - a.score;
        }).subset(0, me.$top);
        me.$currentGenerations = res;
        return res;
    },
    replace: function (templateString, t, val) {

        var subregex = new RegExp('(\'{)' + t + '(}\')', 'g');
        templateString = templateString.replace(subregex, val === null || val === undefined ? '' : val);
        return templateString;
    },
    setEval: function (func, args, scope) {
        var me = this;
        me.$evalFunc = func;
        me.$evalArgs = args;
        me.$scope = scope;
    },
    setActual: function (actual) {
        var me = this;
        me.$actualResult = actual;
    },
    keepTop: function (top) {
        var me = this;
        me.$top = top;
    },
    procreateRate: function (num) {
        var me = this;
        me.$procreateRate = num;
    },

    generationSize: function (size) {
        var me = this;
        me.$genSize = size;
    }
});