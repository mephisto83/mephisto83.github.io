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
        $create: function (array, length) {
            if (array instanceof Float32Array) {
                return new Float32Array(length);
            }
            if (array instanceof Float64Array) {
                return new Float64Array(length);
            }
            return [];
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
                        var result;
                        var collection = this;
                        if (func === undefined) {
                            func = function (x) { return x }
                        }
                        if (collection.filter) {
                            result = collection.filter(func);
                        }
                        else {
                            result = MEPH.util.Array.create();
                            for (var i = 0 ; i < collection.length ; i++) {
                                if (func(collection[i], i)) {
                                    result.push(collection[i]);
                                }
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
            };

            if (!array.argsort) {
                Object.defineProperty(array, 'argsort', {
                    enumerable: false,
                    writable: true,
                    configurable: true,
                    value: function (func) {
                        var collection = this.select(function (x) {
                            return { d: x };
                        });
                        var sorted = collection.sort(function (x, y) {
                            return func(x.d, y.d);
                        });

                        return sorted.select(function (t) {
                            return collection.indexOf(t);
                        })
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
            if (!array.zeroes) {
                Object.defineProperty(array, 'zeroes', {
                    enumerable: false,
                    writable: true,
                    configurable: true,
                    value: function (count) {
                        return [].interpolate(0, count, function () { return 0; })
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
                        func = func || function (x) { return x; };
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

            if (!array.minimum) {
                Object.defineProperty(array, 'minimum', {
                    enumerable: false,
                    writable: true,
                    configurable: true,
                    value: function (func) {
                        var result = null;
                        var _result = null;
                        var collection = this;
                        var val;
                        func = func || function (x) { return x; };
                        for (var i = 0 ; i < collection.length; i++) {
                            val = func(collection[i], i);
                            if (result == null || val < result) {
                                result = val;
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
                            if (func(collection[i], i)) {
                                result.push(i);
                            }
                        }
                        return result;
                    }
                });
            }
            if (!array.firstIndexWhere) {
                Object.defineProperty(array, 'firstIndexWhere', {
                    enumerable: false,
                    writable: true,
                    configurable: true,
                    value: function (func) {
                        var result = [];
                        var collection = this;
                        for (var i = 0 ; i < collection.length ; i++) {
                            if (func(collection[i], i)) {
                                return i;
                            }
                        }
                        return -1;
                    }
                });
            }

            if (!array.relativeCompliment) {
                var extrasection_relativeCompliment = {
                    enumerable: false,
                    writable: true,
                    configurable: true,
                    value: function (othercollection, func, output) {
                        var collection = this;
                        var result = [];

                        func = func || function (x, y) { return x === y; };
                        for (var i = collection.length; i--;/**/) {//function (x) { return x == collection[i]; }
                            if (!othercollection.contains(func.bind(window, collection[i]))) {
                                result.push(collection[i]);
                            }
                            else if (output) {
                                output.push(collection[i]);
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
                        var result = this.select();
                        shuffle(result);
                        return result;
                    }
                });
                function shuffle(array) {
                    var currentIndex = array.length, temporaryValue, randomIndex;

                    // While there remain elements to shuffle...
                    while (0 !== currentIndex) {

                        // Pick a remaining element...
                        randomIndex = Math.floor(Math.random() * currentIndex);
                        currentIndex -= 1;

                        // And swap it with the current element.
                        temporaryValue = array[currentIndex];
                        array[currentIndex] = array[randomIndex];
                        array[randomIndex] = temporaryValue;
                    }

                    return array;
                }
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

            if (!array.removeIndices) {
                //removeIndices
                Object.defineProperty(array, 'removeIndices', {
                    enumerable: false,
                    writable: true,
                    configurable: true,
                    value: function (indices) {
                        indices = indices.orderBy(function (x, y) { return y - x; });
                        var collection = this;
                        indices.foreach(function (index) {
                            collection.splice(index, 1);
                        });

                        return collection;
                    }
                });
            }
            if (!array.drop) {
                Object.defineProperty(array, 'drop', {
                    enumerable: false,
                    configurable: true,
                    writable: true,
                    value: function () {
                        var args = MEPH.util.Array.convert(arguments);
                        var index;
                        var r;
                        var result = [];
                        for (var i = args.length ; i--;) {
                            index = this.indexOf(args[i]);
                            if (index !== -1) {
                                r = this.splice.apply(this, [index, 1]);
                                result = result.concat(r);
                            }
                        }

                        return this;
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

                        if (collection.forEach) {
                            collection.forEach(func);
                        }
                        else
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
                        var result = MEPH.util.Array.$create(this, this.length);
                        func = func || function (x) { return x; };
                        var collection = this;
                        for (var i = 0 ; i < collection.length ; i++) {
                            if (this instanceof Float32Array) {
                                result[i] = func(collection[i], i);
                            }
                            else {
                                result.push(func(collection[i], i));
                            }
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
                        var res = (this.some ? this.some(func) : this.first(func));
                        return this.some ? res : res != null;
                    }
                });
            }


            if (!array.first) {
                Object.defineProperty(array, 'first', {
                    enumerable: false,
                    writable: true,
                    configurable: true,
                    value: function (func) {
                        var collection = this;//.select(function (x) { return x });
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
            if (!array.any) {
                Object.defineProperty(array, 'any', {
                    enumerable: false,
                    writable: true,
                    configurable: true,
                    value: function (func) {
                        return this.select(function (x) { return x }).first(func) !== null
                    }
                })
            }

            if (!array.firstIndex) {
                Object.defineProperty(array, 'firstIndex', {
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
                                return i;
                            }
                        }
                        return -1;
                    }
                });
            }
            if (!array.lastIndex) {
                Object.defineProperty(array, 'lastIndex', {
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
                        for (var i = collection.length; i--  ;) {
                            if (func(collection[i], i)) {
                                return i;
                            }
                        }
                        return -1;
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
                        var collection = this;
                        for (var i = collection.length ; i-- ;) {
                            if (func(collection[i])) {
                                var result = (collection[i])
                                return result;
                            }
                        }

                        //var collection = MEPH.Array(this.select(function (x) {
                        //    return x
                        //}).reverse());
                        //for (var i = 0 ; i < collection.length ; i++) {
                        //    if (func(collection[i])) {
                        //        var result = (collection[i])
                        //        return result;
                        //    }
                        //}
                        return null;
                    }
                });
            }
            if (!array.skipEvery) {
                Object.defineProperty(array, 'skipEvery', {
                    enumerable: false,
                    writable: true,
                    configurable: true,
                    value: function (skip, func) {
                        var collection = this;
                        var res = this instanceof Float32Array ? new Float32Array(Math.ceil(collection.length / skip)) : [];
                        skip = Math.abs(skip);
                        var c = 0;
                        func = func || function (x) { return x; };
                        for (var i = 0; i < collection.length; i = i + skip) {
                            if (res instanceof Float32Array) {
                                res[c] = collection[i]
                            }
                            else {
                                res.push(collection[i]);
                            }
                            c++;
                        }
                        return res;
                    }
                });
            }
            if (!array.step) {
                Object.defineProperty(array, 'step', {
                    enumerable: false,
                    writable: true,
                    configurable: true,
                    value: function (skip, func) {
                        var collection = this;
                        skip = Math.abs(skip);
                        func = func || function (x) { return x; };
                        for (var i = 0; i < collection.length; i = i + skip) {
                            func(collection[i], i);
                        }
                        return this;
                    }
                });
            }
            if (!array.skipEveryFromTo) {
                Object.defineProperty(array, 'skipEveryFromTo', {
                    enumerable: false,
                    writable: true,
                    configurable: true,
                    value: function (skip, start, stop, func) {
                        var collection = this;

                        var count = Math.ceil((stop - start) / skip);
                        var res = this instanceof Float32Array ? new Float32Array(Math.max(0, Math.ceil(count))) : [];
                        skip = Math.abs(skip);
                        var c = 0;
                        func = func || function (x) { return x; };
                        for (var i = start; i < stop; i = i + skip) {
                            if (res instanceof Float32Array) {
                                res[c] = collection[i]
                            }
                            else {
                                res.push(collection[i]);
                            }
                            c++;
                        }
                        return res;
                    }
                });
            }
            if (!array.normalize) {
                Object.defineProperty(array, 'normalize', {
                    enumerable: false,
                    writable: true,
                    configurable: true,
                    value: function () {
                        var w = this;
                        var wt = w.summation(function (r, t) { return r + t; });
                        w = w.select(function (t) { return t / wt; });
                        return w;
                    }
                })
            }
            if (!array.fftshift) {
                Object.defineProperty(array, 'fftshift', {
                    enumerable: false,
                    writable: true,
                    configurable: true,
                    value: function () {
                        var collection = this;
                        var res = MEPHArray.$create(collection, collection.length);
                        var half = Math.floor((collection.length + 1) / 2);
                        var half2 = Math.floor(collection.length / 2);
                        for (var i = 0 ; i < half; i++) {
                            res[i] = collection[i + half2];
                        }
                        for (var i = 0 ; i < half2 ; i++) {
                            res[i + half] = collection[i];
                        }
                        return res;
                    }
                })
            }
            if (!array.interpolate) {
                Object.defineProperty(array, 'interpolate', {
                    enumerable: false,
                    writable: true,
                    configurable: true,
                    value: function (start, stop, func) {
                        var collection = this;
                        func = func || function (x) { return x; };
                        for (var i = start; i < stop ; i++) {
                            if (collection instanceof Float32Array) {
                                collection[i - start] = (func(i));
                            }
                            else
                                collection.push(func(i, i - start));
                        }
                        return collection;
                    }
                });
            }

            if (!array.interpSquare) {
                Object.defineProperty(array, 'interpSquare', {
                    enumerable: false,
                    writable: true,
                    configurable: true,
                    value: function (x, y, func) {
                        var collection = this;
                        func = func || function (x) { return x; };
                        for (var i = 0; i < x; i++) {
                            for (var j = 0; j < y; j++) {
                                collection.push(func(i, j));
                            }
                        }
                        return collection;
                    }
                });
            }

            if (!array.squareMinimum) {
                Object.defineProperty(array, 'squareMinimum', {
                    enumerable: false,
                    writable: true,
                    configurable: true,
                    value: function (x, y, func) {
                        var collection = this;
                        var result = null;
                        var _result = null;
                        var val;
                        func = func || function (x) { return x; };
                        for (var i = 0; i < x; i++) {
                            for (var j = 0; j < y; j++) {
                                val = func(i, j, x, y);
                                if (result == null || val < result) {
                                    result = val;
                                    _result = {
                                        i: i,
                                        j: j
                                    }
                                }
                            }
                        }
                        return _result;
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

            if (!array.mostcommon) {
                Object.defineProperty(array, 'mostcommon', {
                    enumerable: false,
                    writable: true,
                    configurable: true,
                    value: function (func) {
                        var collection = this;
                        var res = collection.groupBy(func);
                        var most;

                        for (var i in res) {
                            if (most === undefined) {
                                most = i;
                            }
                            else if (res[most].length < res[i].length) {
                                most = i;
                            }
                        }
                        return most
                    }
                })
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
            if (!array.maxx) {
                Object.defineProperty(array, 'maxx', {
                    enumerable: false,
                    writable: true,
                    configurable: true,
                    value: function (func) {
                        var result = null;
                        var collection = this;
                        func = func || function (x) { return x; }
                        for (var i = 0 ; i < collection.length; i++) {
                            if (result == null || func(collection[i]) > result) {
                                result = func(collection[i]);
                            }
                        }
                        return result;
                    }
                });
            }

            if (!array.closestAbs) {
                Object.defineProperty(array, 'closestAbs', {
                    enumerable: false,
                    writable: true,
                    configurable: true,
                    value: function (val, func) {
                        var result = null;
                        var resdiff = null;
                        var collection = this;
                        func = func || function (x) { return x; }
                        for (var i = 0 ; i < collection.length; i++) {
                            var x = func(collection[i]);
                            var dif;
                            if (Math.abs(val) > Math.abs(x)) {
                                dif = Math.abs(val) - Math.abs(x)
                            }
                            else {
                                dif = Math.abs(x) - Math.abs(val)
                            }
                            if (result === null) {
                                resdiff = dif;
                                result = i;
                            }

                            if (resdiff === 0) {
                                return i;
                            }
                            else if (resdiff > dif) {
                                resdiff = dif;
                                result = i;
                            }
                        }
                        return result
                    }
                })
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
                            result = func(collection[i], result, i, collection.length);
                        }
                        return result;
                    }
                });
            }
            if (!array.addition) {
                Object.defineProperty(array, 'addition', {
                    enumerable: false,
                    writable: true,
                    configurable: true,
                    value: function (func) {
                        var result = 0;
                        var collection = this;
                        func = func || function (x) { return x; }
                        for (var i = 0; i < collection.length ; i++) {
                            result += func(collection[i], i);
                        }
                        return result;
                    }
                });
            }
            var pushArray = function (array, value, i) {
                if (array instanceof Float32Array || array instanceof Float64Array) {
                    array[i] = value;
                }
                else {
                    array.push(value);
                }
            }
            if (!array.cumsum) {
                Object.defineProperty(array, 'cumsum', {
                    enumerable: false,
                    writable: true,
                    configurable: true,
                    value: function (func) {
                        var result = MEPHArray.$create(this, this.length);
                        var total = 0;
                        func = func || function (x) { return x; };
                        var collection = this;
                        for (var i = 0; i < collection.length ; i++) {
                            total += func(collection[i]);
                            pushArray(result, total, i);
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
                        var val;
                        func = func || function (x) { return x; }
                        for (var i = 0 ; i < collection.length; i++) {
                            val = func(collection[i]);
                            if (result == null || val < result) {
                                result = val;
                                selection = collection[i];
                            }
                        }
                        return selection;
                    }
                });
            }

            if (!array.minSelectIndex) {
                Object.defineProperty(array, 'minSelectIndex', {
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
                                selection = i;
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
                        var collection = this, count = 0;
                        func = func || function (x) { return x; };
                        collection.foreach(function (t) {
                            count += t.length;
                        });

                        var result = this instanceof Float32Array ? new Float32Array(count) : [];

                        if (this instanceof Float32Array) {
                            var len = collection.length;
                            for (var i = 0; i < collection.length ; i++) {
                                var res = func(collection[i], i);
                                for (var j = 0 ; j < collection[i].length; i++) {
                                    result[i * len + j] = collection[i][j];
                                }
                            }
                        }
                        else {
                            for (var i = 0; i < collection.length ; i++) {
                                result = MEPH.util.Array.create(result.concat(func(collection[i], i)));
                            }
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
                        stop = Math.min(collection.length, stop === undefined || stop === null ? collection.length : stop);
                        start = Math.min(collection.length, start === undefined || start === null ? collection.length : start);
                        start = start < 0 ? 0 : start;
                        stop = stop < 0 ? 0 : stop;
                        var result = this instanceof Float32Array ? new Float32Array(stop - start) : [];
                        for (var i = start ; i < stop ; i++) {
                            if (this instanceof Float32Array) {
                                result[i - start] = collection[i];
                            }
                            else {
                                result.push(collection[i]);
                            }

                        }
                        return MEPH.util.Array.create(result);
                    }
                });
            }
            if (!array.subsetSelect) {
                Object.defineProperty(array, 'subsetSelect', {
                    enumerable: false,
                    writable: true,
                    configurable: true,
                    value: function (start, stop, func) {
                        var collection = this;
                        func = func || function (x) { return x; }
                        stop = Math.min(collection.length, stop === undefined || stop === null ? collection.length : stop);
                        start = Math.min(collection.length, start === undefined || start === null ? collection.length : start);
                        start = start < 0 ? 0 : start;
                        stop = stop < 0 ? 0 : stop;
                        var result = this instanceof Float32Array ? new Float32Array(stop - start) : [];
                        for (var i = start ; i < stop ; i++) {
                            if (this instanceof Float32Array) {
                                result[i - start] = func(collection[i]);
                            }
                            else {
                                result.push(func(collection[i]));
                            }

                        }
                        return MEPH.util.Array.create(result);
                    }
                });
            }

            if (!array.subeach) {
                Object.defineProperty(array, 'subeach', {
                    enumerable: false,
                    writable: true,
                    configurable: true,
                    value: function (start, stop, func) {
                        var collection = this;
                        stop = Math.min(collection.length, stop === undefined || stop === null ? collection.length : stop);
                        start = Math.min(collection.length, start === undefined || start === null ? collection.length : start);
                        start = start < 0 ? 0 : start;
                        stop = stop < 0 ? 0 : stop;
                        for (var i = start ; i < stop ; i++) {
                            func(collection[i]);
                        }
                        return collection;
                    }
                });
            }

            if (!array.window) {
                Object.defineProperty(array, 'window', {
                    enumerable: false,
                    writable: true,
                    configurable: true,
                    value: function (start, stop, windowFunc) {
                        var collection = this;
                        stop = Math.min(collection.length, stop === undefined || stop === null ? collection.length : stop);
                        var result = this instanceof Float32Array ? new Float32Array(stop - start) : [];
                        for (var i = start ; i < stop ; i++) {
                            pushArray(result, collection[i] * windowFunc(i - start, stop), i - start)
                        }
                        return MEPH.util.Array.create(result);
                    }
                })
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
});
(function () {
    MEPH.util.Array.create(Array.prototype, true);
    if (Float32Array)
        MEPH.util.Array.create(Float32Array.prototype, true);
    if (Float64Array)
        MEPH.util.Array.create(Float64Array.prototype, true);
})();