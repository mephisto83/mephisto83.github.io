/**
 * @class MEPH.math.Set
 * Describes mathematical sets.
 *
 **/
MEPH.define('MEPH.math.Set', {
    alternateNames: 'Set',
    requires: ['MEPH.math.Util'],
    statics: {
        /**
         * Creates a superset of the set.
         * @param {MEPH.math.Set} set
         * @returns {MEPH.math.Set}
         **/
        superset: function (set) {
            var values = set.get();
            var length = values.length;
            var sets = [];
            var supersetcount = Math.pow(2, length);

            var base2Masks = [].interpolate(0, supersetcount, function (x) {
                var t = Set.baseConvert(x, 10, 2);
                return [].interpolate(0, length - t.length, function () {
                    return '0';
                }).join('') + Set.baseConvert(x, 10, 2);
            }).select(function (mask) {
                var subset = mask.split('').select(function (x, index) {
                    return parseInt(x, 10) ? values[index] : null;
                });
                return subset;
            });;
            var result = new Set();
            result.set(base2Masks);
            return result;
        },
        /**
         * Creates a set of strings represent all the possible base2 bit masks.
         * @param {Number} bits
         */
        base2MaskSet: function (bits) {
            var supersetcount = Math.pow(2, bits);
            var length = Math.log(bits) / Math.log(2)
            var base2Masks = [].interpolate(0, supersetcount, function (x) {
                var t = Set.baseConvert(x, 10, 2);
                return [].interpolate(0, length - t.length + 1, function () {
                    return '0';
                }).join('') + Set.baseConvert(x, 10, 2);
            });
            return base2Masks;
        },
        /**
         * Returns a set of items that have the item set size.
         * @param {Number} setSize
         * @param {Number} itemsCountInSet
         * @return {Array}
         */
        itemSets: function (setSize, itemsCountInSet) {
            var set = new Set();
            set.set([].interpolate(0, setSize, function (x) {
                return x;
            }));
            return Set.superset(set).get().where(function (set) {
                return set.count(function (x) { return x !== null; }) === itemsCountInSet;
            });
        },
        /**
         * Returns all the permutations of the set.
         * @param {MEPH.math.Set} set
         * @returns {Array}
         */
        permutate: function (set, i, n) {
            var j,
                result = [];

            if (i === undefined && n === undefined) {
                i = 0;
                n = set.get().length;
            }

            if (i == n) {
                result.push(set);
            }
            else {
                for (j = i; j < n; j++) {
                    Set.swap(set, i, j);
                    result = result.concat(Set.permutate(set.copy(), i + 1, n));
                    Set.swap(set, i, j); //backtrack
                }
            }
            return result;
        },
        /**
         * Swaps the ith and jth item of a set.
         * @param {MEPH.math.Set} set
         * @param {Number} i
         * @param {Number} j
         **/
        swap: function (set, i, j) {
            var array = set.get();
            var temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        },
        /**
         * Produces a sag set.
         * @param {Number} count
         **/
        sagset: function (count) {

            var set = [].interpolate(1, count, function (x) {
                var subset = [].interpolate(0, count - x, function (t) {
                    return 1;
                });
                return subset;
            });
            set.push([]);
            set = set.reverse().select(function (x, index) {
                return [count - index].concat(x);
            });

            set = set.select(function (x) {
                var result = [];
                var first = x.first();
                result.push(x);
                var xcopy = x.select();
                var setMax = count - first;
                var c = 0;
                while (setMax > xcopy.subset(1).min(function (x) { return x ? x : count + 1; })) {
                    var min = xcopy.subset(1).min(function (x) {
                        return x ? x : count + 1;
                    });
                    c++;
                    if (c > 1000) { break; }
                    var lastMin = xcopy.lastIndexOf(min);
                    xcopy[lastMin]--;

                    var min = xcopy.subset(1).min(function (x) {
                        return x ? x : count + 1;
                    });

                    var firstMin = xcopy.indexOf(min);
                    if (firstMin === -1) {
                        firstMin = lastMin;
                    }
                    xcopy[firstMin]++;

                    if (lastMin === firstMin) {
                        break;
                    }
                    result.push(xcopy);
                    xcopy = xcopy.select();
                }

                return result;
            });
            return set.concatFluentReverse(function (x) { return x; });

        },
        /**
         * Converst a number from one base to another.
         * @param {Number} number
         * @param {Number} fromBase
         * @param {Number} toBase
         * @returns {String}
         **/
        baseConvert: function (number, fromBase, toBase) {
            return parseInt(number, fromBase || 10).toString(toBase || 10);
        }
    },
    properties: {
        value: null
    },
    initialize: function (val) {
        var me = this;
        me.value = val || [];
    },
    /**
     * Create a copy of it self.
     **/
    copy: function () {
        var me = this,
            set = new MEPH.math.Set();

        set.set(me.value.select());
        return set;
    },
    /**
     * Set the sets value.;
     * @param {Array} array
     **/
    set: function (array) {
        var me = this;
        me.value.length = 0;
        me.value.push.apply(me.value, array);
    },
    /**
     * Returns a string.
     **/
    print: function () {
        var me = this;
        return '[' + me.get().join() + ']';
    },
    /**
     * Returns the array of items.
     **/
    get: function () {
        var me = this;
        return me.value;
    }
});