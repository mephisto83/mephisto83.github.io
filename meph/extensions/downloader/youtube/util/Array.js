var $array = Array
/**
 * @class MEPH.util.Array
 * A static class used to add extra functions to arrays.
 **/
MEPH.define('MEPH.util.Array', {
    alternateNames: ['MEPHArray'],
    statics: {
        isArray: function () {
            $array.isArray.apply(null, arguments);
        },
        /**
         * Adds extension function to an array.
         **/
        create: function (array, neveragain) {
            array = array || [];
            if (window.appliedToAllArrays && Array.isArray(array)) {
                return array;
            }
            if (!array.where) {
                Object.defineProperty(array, 'where', {
                    enumerable: false,
                    writable: true,
                    configurable: true,
                    value: function (func) {
                        var result = MEPH.util.Array.create();
                        var collection = this;
                        for (var i = 0 ; i < collection.length ; i++) {
                            if (func(collection[i], i)) {
                                result.push(collection[i]);
                            }
                        }
                        return result;
                    }
                });
            }

            //if (!array.observable) {
            //    object.defineproperty(array, 'observable', {
            //        enumerable: false,
            //        writable: true,
            //        configurable: true,
            //        value: function () {
            //            var collection = this;
            //            return meph.util.observable.observable(collection);
            //        }
            //    });
            //}

            if (!array.orderBy) {
                Object.defineProperty(array, 'orderBy', {
                    enumerable: false,
                    writable: true,
                    configurable: true,
                    value: function (func) {
                        var collection = this.select(function (x) { return x; });
                        return collection.sort(func);
                    }
                });
            }

            if (!array.maxSelection) {
                Object.defineProperty(array, 'maxSelection', {
                    enumerable: false,
                    writable: true,
                    configurable: true,
                    value: function (func) {
                        var result = null;
                        var _result = null;
                        var collection = this;
                        for (var i = 0 ; i < collection.length; i++) {
                            if (result == null || func(collection[i]) > result) {
                                result = func(collection[i]);
                                _result = collection[i];
                            }
                        }
                        return _result;
                    }
                });
            }
            if (!array.maximum) {
                Object.defineProperty(array, 'maximum', {
                    enumerable: false,
                    writable: true,
                    configurable: true,
                    value: function (func) {
                        var result = null;
                        var _result = null;
                        var collection = this;
                        for (var i = 0 ; i < collection.length; i++) {
                            if (result == null || func(collection[i]) > result) {
                                result = func(collection[i]);
                                _result = collection[i];
                            }
                        }
                        return result;
                    }
                });
            }
            if (!array.intersection) {
                Object.defineProperty(array, 'intersection', {
                    enumerable: false,
                    writable: true,
                    configurable: true,
                    value: function (othercollection, func) {
                        var collection = this;
                        var result = [];
                        func = func || function (x, y) { return x === y; };
                        for (var i = collection.length; i--;/**/) {
                            for (var j = othercollection.length; j--;/**/) {
                                if ((func(othercollection[j], collection[i]))) {
                                    result.push(collection[i]);
                                    break;
                                }
                            }
                        }
                        return result;
                    }
                });
            }
            if (!array.intersectFluent) {
                Object.defineProperty(array, 'intersectFluent', {
                    enumerable: false,
                    writable: true,
                    configurable: true,
                    value: function (func) {
                        var collection = this;
                        var result = [];
                        func = func || function (x, y) { return x === y; };
                        result.push.apply(result, collection[0]);
                        collection = collection.subset(1);
                        collection.foreach(function (x) {
                            result = result.intersection(x, func);
                        });
                        return result;
                    }
                });
            }
            if (!array.count) {
                Object.defineProperty(array, 'count', {
                    enumerable: false,
                    writable: true,
                    configurable: true,
                    value: function (func) {
                        func = func || function () { return true; };
                        return this.where(func).length;
                    }
                });
            }

            if (!array.trim) {
                Object.defineProperty(array, 'trim', {
                    enumerable: false,
                    writable: true,
                    configurable: true,
                    value: function () {
                        var result = [];
                        var collection = this;
                        for (var i = 0 ; i < collection.length; i++) {
                            result.push(collection[i].trim());
                        }
                        return result;
                    }
                });
            }

            if (!array.indexWhere) {
                Object.defineProperty(array, 'indexWhere', {
                    enumerable: false,
                    writable: true,
                    configurable: true,
                    value: function (func) {
                        var result = [];
                        var collection = this;
                        for (var i = 0 ; i < collection.length ; i++) {
                            if (func(collection[i])) {
                                result.push(i);
                            }
                        }
                        return result;
                    }
                });
            }

            if (!array.relativeCompliment) {
                var extrasection_relativeCompliment = {
                    enumerable: false,
                    writable: true,
                    configurable: true,
                    value: function (othercollection, func) {
                        var collection = this;
                        var result = [];
                        func = func || function (x, y) { return x === y; };
                        for (var i = collection.length; i--;/**/) {//function (x) { return x == collection[i]; }
                            if (othercollection.count(func.bind(window, collection[i])) == 0) {
                                result.push(collection[i]);
                            }
                        }
                        return result;
                    }
                }
                if (!array.relativeCompliment) {
                    Object.defineProperty(array, 'relativeCompliment', extrasection_relativeCompliment);
                }
            }
            if (!array.random) {
                Object.defineProperty(array, 'random', {
                    enumerable: false,
                    writable: true,
                    configurable: true,
                    value: function () {
                        var result = [];
                        var collection = this;
                        for (var i = 0 ; i < collection.length; i++) {
                            result.splice(Math.floor(Math.random(0) * result.length), 0, (collection[i]));
                        }
                        return result;
                    }
                });
            }


            if (!array.all) {
                Object.defineProperty(array, 'all', {
                    enumerable: false,
                    writable: true,
                    configurable: true,
                    value: function (func) {
                        var collection = this;
                        for (var i = 0 ; i < collection.length ; i++) {
                            if (!func(collection[i], i)) {
                                return false;
                            }
                        }
                        return true;
                    }
                });
            }
            if (!array.removeWhere) {
                Object.defineProperty(array, 'removeWhere', {
                    enumerable: false,
                    writable: true,
                    configurable: true,
                    value: function (func) {
                        var collection = this;
                        func = func || function () { return true; }
                        var result = collection.where(func);
                        for (var i = 0 ; i < result.length; i++) {
                            collection.splice(collection.indexOf(result[i]), 1);
                        }
                        return result;
                    }
                });
            }
            if (!array.clear) {
                Object.defineProperty(array, 'clear', {
                    enumerable: false,
                    writable: true,
                    configurable: true,
                    value: function (func) {
                        var collection = this;
                        return collection.removeWhere(function (x) { return true; });
                    }
                });
            }
            if (!array.removeFirstWhere) {
                Object.defineProperty(array, 'removeFirstWhere', {
                    enumerable: false,
                    writable: true,
                    configurable: true,
                    value: function (func) {
                        var collection = this;
                        var result = collection.where(func);
                        for (var i = 0 ; i < Math.min(result.length, 1) ; i++) {
                            collection.splice(collection.indexOf(result[i]), 1);
                        }
                        return result;
                    }
                });
            }
            if (!array.remove) {
                Object.defineProperty(array, 'remove', {
                    enumerable: false,
                    writable: true,
                    configurable: true,
                    value: function (from, to) {
                        var collection = this,
                            rest = collection.slice((to || from) + 1 || collection.length);
                        collection.length = from < 0 ? collection.length + from : from;
                        return collection.push.apply(collection, rest);
                    }
                });
            }

            if (!array.max) {
                Object.defineProperty(array, 'max', {
                    enumerable: false,
                    writable: true,
                    configurable: true,
                    value: function (func) {
                        var result = null,
                            resultValue = null;
                        func = func || function (x) { return x; }
                        var collection = this;
                        for (var i = 0 ; i < collection.length; i++) {
                            if (resultValue == null || func(collection[i]) > resultValue) {
                                result = (collection[i]);
                                resultValue = func(collection[i]);
                            }
                        }
                        return result;
                    }
                });
            }
            if (!array.foreach) {
                Object.defineProperty(array, 'foreach', {
                    enumerable: false,
                    writable: true,
                    configurable: true,
                    value: function (func) {
                        var collection = this;
                        for (var i = 0; i < collection.length; i++) {
                            func(collection[i], i);
                        }
                        return this;
                    }
                });
            }

            if (!array.select) {
                Object.defineProperty(array, 'select', {
                    enumerable: false,
                    writable: true,
                    configurable: true,
                    value: function (func) {
                        var result = MEPH.util.Array.create();
                        func = func || function (x) { return x; };
                        var collection = this;
                        for (var i = 0 ; i < collection.length ; i++) {
                            result.push(func(collection[i], i));
                        }
                        return result;
                    }
                });
            }

            if (!array.contains) {
                Object.defineProperty(array, 'contains', {
                    enumerable: false,
                    writable: true,
                    configurable: true,
                    value: function (func) {
                        return this.first(func) != null;
                    }
                });
            }


            if (!array.first) {
                Object.defineProperty(array, 'first', {
                    enumerable: false,
                    writable: true,
                    configurable: true,
                    value: function (func) {
                        var collection = this.select(function (x) { return x });
                        func = func || function () { return true; };
                        if (typeof (func) !== 'function') {
                            var temp = func;
                            func = function (x) {
                                return temp === x;
                            }
                        }
                        for (var i = 0 ; i < collection.length ; i++) {
                            if (func(collection[i], i)) {
                                return (collection[i]);
                            }
                        }
                        return null;
                    }
                });
            }

            if (!array.selectFirst) {
                Object.defineProperty(array, 'selectFirst', {
                    enumerable: false,
                    writable: true,
                    configurable: true,
                    value: function (func) {
                        var collection = this.select(function (x) { return x });
                        func = func || function () { return true; };
                        if (typeof (func) !== 'function') {
                            var temp = func;
                            func = function (x) {
                                return temp === x;
                            }
                        }
                        for (var i = 0 ; i < collection.length ; i++) {
                            if (func(collection[i])) {
                                return func(collection[i]);
                            }
                        }
                        return null;
                    }
                });
            }

            if (!array.last) {
                Object.defineProperty(array, 'last', {
                    enumerable: false,
                    writable: true,
                    configurable: true,
                    value: function (func) {
                        func = func || function () { return true; };
                        if (typeof (func) !== 'function') {
                            var temp = func;
                            func = function (x) {
                                return temp === x;
                            }
                        }
                        var collection = MEPH.Array(this.select(function (x) {
                            return x
                        }).reverse());
                        for (var i = 0 ; i < collection.length ; i++) {
                            if (func(collection[i])) {
                                var result = (collection[i])
                                return result;
                            }
                        }
                        return null;
                    }
                });
            }

            if (!array.interpolate) {
                Object.defineProperty(array, 'interpolate', {
                    enumerable: false,
                    writable: true,
                    configurable: true,
                    value: function (start, stop, func) {
                        var collection = this;
                        for (var i = start; i < stop ; i++) {
                            collection.push(func(i));
                        }
                        return collection;
                    }
                });
            }
            if (!array.groupBy) {
                Object.defineProperty(array, 'groupBy', {
                    enumerable: false,
                    writable: true,
                    configurable: true,
                    value: function (func) {
                        var collection = this;
                        var result = {};
                        for (var i = 0 ; i < collection.length ; i++) {
                            var t = func(collection[i]);
                            result[t] = result[t] || [];
                            result[t].push(collection[i]);
                        }
                        return result;
                    }
                });
            }

            if (!array.second) {
                Object.defineProperty(array, 'second', {
                    enumerable: false,
                    writable: true,
                    configurable: true,
                    value: function (func) {
                        var collection = this.select(function (x) { return x });
                        var metcriteria = 0;
                        func = func || function () { return true; };
                        for (var i = 0 ; i < collection.length ; i++) {
                            if (func(collection[i])) {
                                metcriteria++;
                            }
                            if (metcriteria == 2) {
                                return (collection[i]);
                            }
                        }
                        return null;
                    }
                });
            }

            if (!array.min) {
                Object.defineProperty(array, 'min', {
                    enumerable: false,
                    writable: true,
                    configurable: true,
                    value: function (func) {
                        var result = null;
                        var collection = this;
                        func = func || function (x) { return x; }
                        for (var i = 0 ; i < collection.length; i++) {
                            if (result == null || func(collection[i]) < result) {
                                result = func(collection[i]);
                            }
                        }
                        return result;
                    }
                });
            }

            if (!array.nth) {
                Object.defineProperty(array, 'nth', {
                    enumerable: false,
                    writable: true,
                    configurable: true,
                    value: function (nth, func) {
                        var collection = this.select(function (x) { return x });
                        var metcriteria = 0;
                        func = func || function () { return true; };
                        for (var i = 0 ; i < collection.length ; i++) {
                            if (func(collection[i])) {
                                metcriteria++;
                            }
                            if (metcriteria == nth) {
                                return (collection[i]);
                            }
                        }
                        return null;
                    }
                });
            }

            if (!array.unique) {
                Object.defineProperty(array, 'unique', {
                    enumerable: false,
                    writable: true,
                    configurable: true,
                    value: function (func) {
                        var result = MEPH.util.Array.create();
                        var finalresult = MEPH.util.Array.create();
                        func = func || function (x) { return x; };
                        var collection = this;
                        for (var i = 0 ; i < collection.length ; i++) {
                            //if (func(collection[i])) {
                            if (result.indexOf(func(collection[i])) === -1) {
                                result.push(func(collection[i]));
                                finalresult.push(collection[i]);
                            }
                            //}
                        }
                        return finalresult;
                        //return result;
                    }
                });
            }
            if (!array.summation) {
                Object.defineProperty(array, 'summation', {
                    enumerable: false,
                    writable: true,
                    configurable: true,
                    value: function (func) {
                        var result = 0;
                        var collection = this;
                        for (var i = 0; i < collection.length ; i++) {
                            result = func(collection[i], result, i);
                        }
                        return result;
                    }
                });
            }

            if (!array.sum) {
                Object.defineProperty(array, 'sum', {
                    enumerable: false,
                    writable: true,
                    configurable: true,
                    value: function (func) {
                        var result = 0;
                        var collection = this;
                        for (var i = 0 ; i < collection.length; i++) {
                            result += func(collection[i], i);
                        }
                        return result;
                    }
                });
            }

            if (!array.minSelect) {
                Object.defineProperty(array, 'minSelect', {
                    enumerable: false,
                    writable: true,
                    configurable: true,
                    value: function (func) {
                        var result = null;
                        var selection = null
                        var collection = this;
                        func = func || function (x) { return x; }
                        for (var i = 0 ; i < collection.length; i++) {
                            if (result == null || func(collection[i]) < result) {
                                result = func(collection[i]);
                                selection = collection[i];
                            }
                        }
                        return selection;
                    }
                });
            }
            if (!array.concatFluentReverse) {
                Object.defineProperty(array, 'concatFluentReverse', {
                    enumerable: false,
                    writable: true,
                    configurable: true,
                    value: function (func) {
                        var collection = this;
                        var result = MEPH.util.Array.create();
                        for (var i = collection.length; i--;/**/) {
                            result = MEPH.util.Array.create(result.concat(func(collection[i], i)));
                        }
                        return result;
                    }
                });
            }
            if (!array.concatFluent) {
                Object.defineProperty(array, 'concatFluent', {
                    enumerable: false,
                    writable: true,
                    configurable: true,
                    value: function (func) {
                        var collection = this;
                        var result = MEPH.util.Array.create();
                        for (var i = 0; i < collection.length; i++) {
                            result = MEPH.util.Array.create(result.concat(func(collection[i], i)));
                        }
                        return result;
                    }
                });
            }

            if (!array.subset) {
                Object.defineProperty(array, 'subset', {
                    enumerable: false,
                    writable: true,
                    configurable: true,
                    value: function (start, stop) {
                        var collection = this;
                        var result = [];
                        stop = Math.min(collection.length, stop === undefined || stop === null ? collection.length : stop);
                        for (var i = start ; i < stop ; i++) {
                            result.push(collection[i]);
                        }
                        return MEPH.util.Array.create(result);
                    }
                });
            }

            if (neveragain) {
                window.appliedToAllArrays = true;
            }
            return array;
        },
        convert: function (obj) {
            var array = MEPH.util.Array.create(),
                i;
            for (i = 0 ; i < obj.length ; i++) {
                array.push(obj[i]);
            }
            return array;
        },
        /**
         * Converts the object into an array.
         * @param {Object} obj;
         **/
        convertObject: function (obj) {
            var i, result = [];
            if (Array.isArray(obj)) {
                return MEPH.Array(obj);
            }
            for (i in obj) {
                result.push(obj[i]);
            }
            return result;
        }
    }
}).then(function () {
    MEPH.util.Array.create(Array.prototype, true);
})
