MEPH.define('MEPH.util.Task', {
    initialize: function () {
        var me = this;
    },
    statics: {
        taskable: function (array) {
            var me = new MEPH.util.Task();
            array.task = {};
            for (var i in me) {
                if (me[i].bind) {
                    array.task[i] = me[i].bind(array);
                }
            }
            return array;
        }
    },
    taskable: function (t) {
        MEPH.util.Task.taskable(t);
        return t;
    },
    //select: function (func) {
    //    var i = 0;
    //    var result = MEPH.util.Array.$create(this, this.length);

    //    func = func || function (x) { return x; };
    //    var collection = this;
    //    var framespersecond = 1000 / 60;

    //    //for (var i = 0 ; i < collection.length ; i++) {
    //    return new Promise(function (resolve) {
    //        var anim = (function () {
    //            var now = Date.now();
    //            var timeleft = true;
    //            while (timeleft) {
    //                timeleft = false;
    //                if (this instanceof Float32Array) {
    //                    result[i] = func(collection[i], i);
    //                }
    //                else {
    //                    result.push(func(collection[i], i));
    //                }
    //                i++;
    //                if (i < collection.length) {
    //                    timeleft = now + framespersecond > Date.now();
    //                    if (!timeleft)
    //                        requestAnimationFrame(anim);
    //                }
    //                else {
    //                    resolve(result);
    //                }
    //            }
    //        });
    //        requestAnimationFrame(anim);
    //    });
    //},
    select: function (func) {
        return this.task._(func, 0, this.length, this.task.taskable([]));
    },
    _: function (func, start, stop, result, filter) {
        var i = start || 0;

        func = func || function (x) { return x; };
        var collection = this;
        var framespersecond = 1000 / 60;

        return new Promise(function (resolve) {
            var anim = (function () {
                var now = Date.now();
                var timeleft = true;
                while (timeleft) {
                    timeleft = false;
                    if (this instanceof Float32Array) {
                        result[i] = func(collection[i], i);
                    }
                    else {
                        if (filter) {
                            if (filter(collection[i], i)) {
                                result.push(func(collection[i], i));
                            }
                        }
                        else
                            result.push(func(collection[i], i));
                    }
                    i++;
                    if (i < stop) {
                        timeleft = now + framespersecond > Date.now();
                        if (!timeleft)
                            requestAnimationFrame(anim);
                    }
                    else {
                        resolve(result);
                    }
                }
            });
            requestAnimationFrame(anim);
        });
    },
    where: function (func) {
        func = func || function (x) { return x; };
        return this.task._(function (x) { return x; }, 0, this.length, this.task.taskable([]), func);
    },
    foreach: function (func) {
        func = func || function (x) { return x; };
        var me = this;
        return this.task._(func, 0, this.length, this.task.taskable([])).then(function () {
            return me;
        });
    },
    subset: function (start, stop) {
        return this.task._(function (x) { return x; }, start, stop, this.task.taskable([]));
    }
});