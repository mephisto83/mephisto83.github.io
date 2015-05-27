/**
 * @class MEPH.util.Queryable
 * Defines a base class for all controls and views.
 **/
MEPH.define('MEPH.util.Queryable', {
    requires: ['MEPH.query.QueryableWorker'],
    statics: {
        workers: null,
        /**
         * Requests a number of threads to do some work.
         * @param {Number} numberOfThreads
         * @returns {Promise}
         */
        requestWorkers: function (numberOfThreads) {
            var workers = MEPH.util.Queryable.workers = MEPH.util.Queryable.workers || [];
            numberOfThreads = numberOfThreads || 1;
            var neededworkers = numberOfThreads - workers.length;

            for (var i = 0  ; i < neededworkers; i++) {
                var worker = new MEPH.query.QueryableWorker();
                workers.push(worker);
            }
            var result = workers.subset(0, numberOfThreads);
            return Promise.all(result.select(function (x) {
                return x.ready();
            }));
        },
        queryable: function (array) {
            var Queryable = MEPH.util.Queryable;
            if (!Array.isArray(array)) {
                return array;
            }

            Object.defineProperty(array, 'isQueryable', {
                value: true,
                enumerable: false
            });
            Object.defineProperty(array, 'query', {
                value: {},
                enumerable: false
            });
            Queryable.select(array);
            Queryable.where(array);
        },
        /**
         * Add a function to an array
         * @param {Array} array
         * @param {String} funcName
         */
        funct: function (array, funcName) {
            var Queryable = MEPH.util.Queryable
            array.query[funcName] = array.query[funcName] || function (func, threads) {
                return Queryable.requestWorkers(threads).then(function (workers) {
                    return Queryable.divideWork(array, threads).then(function (works) {

                        var resultParts = [];
                        var partIndex = -1;
                        var handler = function (worker, work, index) {
                            return worker.execute(function (funcName, funct, array_part) {
                                try {
                                    eval('var localfunc = ' + funct);
                                    var result = array_part[funcName](localfunc);

                                }
                                catch (e) {
                                    MEPH.Log(e);
                                }
                                return Promise.resolve().then(function () { return result; });
                            }, [funcName, func.toString(), work]).then(function (x) {
                                resultParts.push({ index: index, result: x });
                                if (works.length) {
                                    var morework = works.pop();
                                    partIndex++;
                                    return handler(worker, morework, partIndex);
                                }
                            });
                        }
                        var promises = [];
                        var resultPromise = Promise.resolve();
                        promises = promises.concat(workers.select(function (worker, index) {
                            var work = works.pop();
                            partIndex++;
                            return handler(worker, work, index);
                        }));;

                        return Promise.all(promises).then(function () {
                            return resultParts.orderBy(function (x, y) { return x.index - y.index }).concatFluentReverse(function (x) {
                                return x.result;
                            });
                        });
                    });
                });
            }
        },
        where: function (array) {
            var Queryable = MEPH.util.Queryable;
            Queryable.funct(array, 'where');
        },
        select: function (array) {
            var Queryable = MEPH.util.Queryable;
            Queryable.funct(array, 'select');
           
        },
        divideWork: function (array, threads) {
            var stepSize = Math.ceil(array.length / threads);
            var index = 0;
            var result = [];
            while (index * stepSize < array.length) {
                result.push(array.subset(index * stepSize, (index + 1) * stepSize));
                index++;
            }

            return Promise.resolve().then(function () {
                return result;
            });
        },
        divideWorkSync: function (array, threads) {
            var stepSize = Math.ceil(array.length / threads);
            var index = 0;
            var result = [];
            while (index * stepSize < array.length) {
                result.push(array.subset(index * stepSize, (index + 1) * stepSize));
                index++;
            }

            return result;
        }
    }
}).then(function () {
    MEPH.Queryable = MEPH.util.Queryable;
})