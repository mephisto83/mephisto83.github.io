/**
 * @class
 * Defines a base class for all controls and views.
 **/
MEPH.define('MEPH.util.Observable', {
    statics: {
        useObserve: false,

        propKeyToArray: function (obj) {
            var props = [];
            for (var i in obj) {
                props.push(i);
            }
            return props;
        },
        isObservable: function (obj) {
            if (!obj) {
                return false;
            }
            if (Array.isArray(obj)) {
                return obj.isObservable && true;
            }
            return obj[MEPH.isObservablePropertyKey] ? true : false;
        },
        sweep: function ($obj) {
            var props = [],
                hasNewProp = false;
            MEPH.util.Observable.propKeyToArray($obj)
                .where(function (x) {
                    return !$obj[MEPH.isObservablePropertyKey].properties.some(function (y) { return y === x; });
                })
                .foreach(function (x) {
                    props.push(x);
                    hasNewProp = true;
                });
            if (hasNewProp) {
                MEPH.util.Observable.observable($obj, props, true);
            }
        },
        defineDependentProperty: function (newproperty, object, properties, caculationFunction) {
            Object.defineProperty(object, newproperty, {
                configurable: true,
                enumerable: false,
                get: function (props) {
                    return caculationFunction.apply(this, props);
                }.bind(object, MEPH.Array(properties))
            });
            MEPH.Array(properties).foreach(function (propName) {
                object.on('change_' + propName, function (propName) {
                    this.fire('change_' + newproperty, {
                        old: undefined,
                        'new': this[newproperty],
                        property: newproperty
                    });
                    this.fire('changed', {
                        old: undefined,
                        'new': this[newproperty],
                        property: propName
                    });
                    this.fire('altered', {
                        references: MEPH.Array([this]),
                        path: newproperty,
                        old: undefined,
                        'value': this[newproperty],
                        property: propName
                    });
                }.bind(object, propName))
            });
        },
        canObserve: function (object) {
            var AudioBuffer = AudioBuffer || null;
            var Float32Array = Float32Array || null;
            var ArrayBuffer = ArrayBuffer || null;
            var AudioContext = AudioContext || null;
            return ![Float32Array, AudioBuffer, AudioContext, ArrayBuffer].where().some(function (x) { return object instanceof x; });
        },
        /**
         * Makes the passed object observable.
         * @param {Object} object
         * @param {Array} properties
         * @param {Boolean} overried
         */
        observable: function (object, properties, override) {
            MEPH.Observable = MEPH.util.Observable;
            if (Array.isArray(object)) {
                MEPH.util.Observable.observableArray(object);
            }
            else {
                if (MEPH.util.Observable.canObserve(object)) {

                    (function (properties, override) {

                        var obj = this,
                            nonEnumerablePropertyPrefix = MEPH.nonEnumerablePropertyPrefix;

                        if (obj[MEPH.isObservablePropertyKey] && !override) {
                            return obj;
                        }

                        MEPH.Events(obj);

                        properties = properties || MEPH.util.Observable.propKeyToArray(obj);

                        properties = MEPH.Array(properties);

                        if (getObservable(obj) === undefined) {

                            Object.defineProperty(obj, MEPH.isObservablePropertyKey, {
                                value: {
                                    properties: []
                                },
                                enumerable: false,
                                writable: false,
                                configurable: false
                            });

                        }

                        function isObservable(obj) {
                            return obj[MEPH.isObservablePropertyKey] ? true : false;
                        }

                        function getObservable(obj) {
                            return obj[MEPH.isObservablePropertyKey];
                        }

                        function getObservableProperties(obj) {
                            return getObservable(obj).properties;
                        }

                        function removeAlteredListeners(old, sThis) {
                            if (MEPH.IsObject(old) && MEPH.util.Observable.canObserve(old)) {
                                //MEPH.Observable.observable(old);
                                if (old.un) {
                                    old.un('altered', sThis);
                                }
                            }
                        }
                        function makeObservable(value) {
                            if (MEPH.IsObject(value) && MEPH.util.Observable.canObserve(value)) {
                                MEPH.Observable.observable(value);
                            }
                        };
                        function attachAlteredListeners(value, sThis, propName) {
                            if (MEPH.IsObject(value) && MEPH.util.Observable.canObserve(value)) {
                                MEPH.Observable.observable(value);
                                if (!value.hasOn('altered', sThis)) {
                                    value.on('altered', function (propName, type, options) {
                                        var obj = this,
                                            alteredOptions,
                                            path = options.path.split(MEPH.pathDelimiter),
                                            references;
                                        options.references = options.references || [];
                                        path.unshift(propName);
                                        if (!options.references.some(function (x) { return x === obj; })) {
                                            references = MEPH.Array([this].concat(options.references));
                                            alteredOptions = {
                                                references: references,
                                                path: path.join(MEPH.pathDelimiter)
                                            };
                                            MEPH.applyIf(options, alteredOptions);
                                            this.fire('altered', alteredOptions);
                                        }
                                    }.bind(sThis, propName), sThis);
                                }
                            }
                        }

                        properties = properties.where(function (x) {
                            if (isObservable(obj) && MEPH.util.Observable.canObserve(obj)) {
                                return !getObservableProperties(obj).some(function (y) {
                                    return y === x;
                                });;
                            }
                            return true;
                        });

                        var funcpre = '$';

                        Object.defineProperty(obj, 'fireAltered', {
                            enumerable: false,
                            writable: true,
                            configurable: false,
                            value: function () {
                                this.fire('altered', { path: '' });
                            }
                        });


                        if (Object.observe && MEPH.util.Observable.useObserve) {
                            Object.observe(obj, function (changes) {
                                var me = this;
                                changes
                                    .reverse()
                                    .unique(function (x) {
                                        //makeObservable(obj[x.name]);
                                        removeAlteredListeners(x.oldValue, me);
                                        return x.name;
                                    })
                                    .filter(function (x) {
                                        return typeof (obj[x.name]) !== 'function' && x.name[0] !== '$';
                                    })
                                    .forEach(function (change) {
                                        var propName = change.name;
                                        var old = change.oldValue;
                                        var value = obj[change.name];

                                        this.fire('beforeset' + propName, { old: old, 'new': value });

                                        // removeAlteredListeners(old, me);
                                        attachAlteredListeners(value, me, propName);

                                        //this[nonEnumerablePropertyPrefix + propName] = value;
                                        //this.fire('afterset' + propName, { old: old, new: value });

                                        if (!this.is_paused || !this.is_paused()) {
                                            this.fire('set' + propName, { old: old, 'new': value, property: propName });
                                            if (old !== value) {
                                                this.fire('change_' + propName, { old: old, 'new': value, property: propName });
                                                this.fire('changed', { old: old, 'new': value, property: propName });
                                                this.fire('altered', {
                                                    references: MEPH.Array([me]),
                                                    path: propName,
                                                    old: old,
                                                    'value': value,
                                                    property: propName
                                                });
                                            }
                                        }
                                    }.bind(this))
                                return true;
                            }.bind(obj));
                            properties.forEach(function (property) {
                                var propName = property;
                                oldvalue = obj[propName];
                                if (typeof (oldvalue) === 'function') {
                                    return;
                                }
                                if (MEPH.IsObject(oldvalue) && !isObservable(oldvalue)) {
                                    removeAlteredListeners(oldvalue, obj);
                                    //MEPH.Observable.observable(oldvalue);
                                    attachAlteredListeners(oldvalue, obj, propName);
                                }
                            });
                        }
                        else {
                            for (var i = properties.length ; i--;) {
                                var propName = properties[i],
                                    oldvalue = obj[propName];
                                if (typeof (oldvalue) === 'function') {
                                    continue;
                                }
                                Object.defineProperty(obj, propName, {
                                    enumerable: true,
                                    get: function (propName) {
                                        return this[nonEnumerablePropertyPrefix + propName];
                                    }.bind(obj, propName),
                                    set: function (propName, value) {
                                        var old = this[nonEnumerablePropertyPrefix + propName];

                                        this.fire('beforeset' + propName, { old: old, 'new': value });

                                        removeAlteredListeners(old, this);
                                        attachAlteredListeners(value, this, propName);

                                        this[nonEnumerablePropertyPrefix + propName] = value;
                                        //this.fire('afterset' + propName, { old: old, new: value });

                                        if (!this.is_paused || !this.is_paused()) {
                                            this.fire('set' + propName, { old: old, 'new': value, property: propName });
                                            if (old !== value) {
                                                this.fire('change_' + propName, { old: old, 'new': value, property: propName });
                                                this.fire('changed', { old: old, 'new': value, property: propName });
                                                this.fire('altered', {
                                                    references: MEPH.Array([this]),
                                                    path: propName,
                                                    old: old,
                                                    'value': value,
                                                    property: propName
                                                });
                                            }
                                        }
                                        return true;
                                    }.bind(obj, propName)
                                });


                                Object.defineProperty(obj, nonEnumerablePropertyPrefix + propName, {
                                    enumerable: false,
                                    writable: true,
                                    configurable: false,
                                    value: null
                                });

                                obj[nonEnumerablePropertyPrefix + propName] = oldvalue;
                                if (MEPH.IsObject(oldvalue) && !isObservable(oldvalue)) {
                                    removeAlteredListeners(oldvalue, obj);
                                    //MEPH.Observable.observable(oldvalue);
                                    attachAlteredListeners(oldvalue, obj, propName);
                                }
                            }
                        }

                        properties.foreach(function (x) {
                            if (!obj[MEPH.isObservablePropertyKey].properties.contains(function (y) { return x === y; })) {
                                obj[MEPH.isObservablePropertyKey].properties.push(x);
                            }
                        });

                        return this;
                    }).bind(object, properties || null, override || null)();
                }
                else {

                    debugger

                }
            }
            return object;
        },
        observableArray: function (array) {

            if (!array.observable) {
                (function (collection) {

                    if (collection.isObservable) {
                        return collection;
                    }
                    var ConvertToList = MEPH.util.Array.convert;

                    MEPH.Events(collection);

                    Object.defineProperty(collection, "isObservable", {
                        value: true,
                        enumerable: false,
                        configurable: false,
                        writeable: false
                    });

                    Object.defineProperty(collection, "isObservableCollection", {
                        value: true,
                        enumerable: false,
                        configurable: false,
                        writeable: false
                    });

                    var pushFunc = collection.push;
                    Object.defineProperty(collection, 'push', {
                        enumerable: false,
                        configurable: true,
                        writable: true,
                        value: function () {
                            this.fire('beforepush', {
                                added: ConvertToList(arguments),
                                removed: [],
                            });
                            pushFunc.apply(this, arguments);
                            this.fire('afterpush', {
                                removed: MEPH.Array([]),
                                added: ConvertToList(arguments)
                            });
                            //this.fire.apply(this, MEPH.Array(['onpush'].concat(ConvertToList(arguments))));
                            this.fire('onpush', {
                                removed: [],
                                added: ConvertToList(arguments)
                            });
                            this.fire('changed', {
                                added: ConvertToList(arguments),
                                removed: []
                            });
                            this.fire('pushed', {
                                added: (ConvertToList(arguments)),
                                removed: []
                            });
                        }.bind(collection)
                    });

                    var popFunc = collection.pop;
                    Object.defineProperty(collection, 'pop', {
                        enumerable: false,
                        configurable: true,
                        writable: true,
                        value: function () {
                            this.fire.apply(this, MEPH.Array(['beforepop'].concat(ConvertToList(arguments))));
                            var result = MEPH.Array([popFunc.apply(this, arguments)]);
                            this.fire('afterpop', { removed: result, added: MEPH.Array([]) });
                            this.fire.apply(this, MEPH.Array(['onpop'].concat(ConvertToList(arguments))));
                            this.fire('changed', { removed: result, added: MEPH.Array([]) });
                            this.fire('popped', result);
                            //result.where(function (x) {
                            //    return x;
                            //}).foreach(function (x, index) {
                            //    if (x.isObservable) {
                            //        x.clearListeners();
                            //    }
                            //});
                            return result[0];
                        }.bind(collection)
                    });

                    var unshiftFunc = collection.unshift;
                    Object.defineProperty(collection, 'unshift', {
                        enumerable: false,
                        configurable: true,
                        writable: true,
                        value: function () {
                            var res = ConvertToList(arguments);
                            this.fire('beforeunshift', {
                                added: res,
                                removed: []
                            });
                            var result = unshiftFunc.apply(this, arguments);
                            this.fire('afterunshift', {
                                removed: MEPH.Array([]),
                                added: res
                            });
                            this.fire('onunshift', arguments);

                            if (res.length)
                                this.fire('changed', {
                                    removed: MEPH.Array([]),
                                    added: res
                                });
                            this.fire('unshifted', res);
                            return result;
                        }.bind(collection)
                    });

                    var shiftFunc = collection.shift;
                    Object.defineProperty(collection, 'shift', {
                        enumerable: false,
                        configurable: true,
                        writable: true,
                        value: function () {
                            this.fire.apply(this, MEPH.Array(['beforeshift'].concat(ConvertToList(arguments))));
                            var result = shiftFunc.apply(this, arguments);
                            this.fire('aftershift', {
                                removed: MEPH.Array([result]),
                                added: MEPH.Array([])
                            });
                            this.fire.apply(this, MEPH.Array(['onshift'].concat(ConvertToList(arguments))));

                            if (result.length)
                                this.fire('changed', {
                                    removed: MEPH.Array([result]),
                                    added: MEPH.Array([])
                                });
                            this.fire('shifted', MEPH.Array([result]));
                        }.bind(collection)
                    });

                    var spliceFunc = collection.splice;
                    Object.defineProperty(collection, 'splice', {
                        enumerable: false,
                        configurable: true,
                        writable: true,
                        value: function () {
                            this.fire.apply(this, MEPH.Array(['beforesplice'].concat(ConvertToList(arguments))));
                            var result = MEPH.Array(spliceFunc.apply(this, arguments));

                            var convertedArgs = ConvertToList(arguments);
                            var added = convertedArgs.subset(2, convertedArgs.length);
                            this.fire('aftersplice', { removed: result, added: added, arguments: convertedArgs.subset(0, 2) });
                            this.fire('onremove', result);
                            if (result.length || added.length)
                                this.fire('changed', { removed: result, added: added });
                            this.fire('spliced', { removed: result, added: added });
                            //result.foreach(function (x, index) {
                            //    if (x.isObservable) {
                            //        x.clearListeners();
                            //    }
                            //});
                            return result;
                        }.bind(collection)
                    });

                    Object.defineProperty(collection, 'drop', {
                        enumerable: false,
                        configurable: true,
                        writable: true,
                        value: function () {
                            var args = ConvertToList(arguments);
                            this.fire.apply(this, MEPH.Array(['beforedrop'].concat(args)));
                            var index;
                            var r;
                            var result = [];
                            for (var i = args.length ; i--;) {
                                index = this.indexOf(args[i]);
                                if (index !== -1) {
                                    r = spliceFunc.apply(this, [index, 1]);
                                    result = result.concat(r);
                                }
                            }
                            // var result = MEPH.Array(spliceFunc.apply(this, arguments));

                            var convertedArgs = ConvertToList(arguments);
                            var added = [];
                            this.fire('afterdrop', { removed: result, added: added });
                            this.fire('ondrop', result);
                            if (result.length || added.length)
                                this.fire('changed', { removed: result, added: added });
                            this.fire('dropped', { removed: result, added: added });
                            //result.foreach(function (x, index) {
                            //    if (x.isObservable) {
                            //        x.clearListeners();
                            //    }
                            //});
                            return result;
                        }.bind(collection)
                    });

                    Object.defineProperty(collection, 'dump', {
                        enumerable: false,
                        configurable: true,
                        writable: true,
                        value: function () {
                            var args = ConvertToList(arguments);
                            this.fire.apply(this, MEPH.Array(['beforedrop'].concat(args)));
                            var index;
                            var r;
                            var result = [];
                            for (var i = this.length ; i--;) {
                                result.push(this[i]);
                            }
                            this.length = 0;
                            var added = [];
                            this.fire('afterdump', { removed: result, added: added });
                            this.fire('ondump', result);
                            if (result.length)
                                this.fire('changed', { removed: result, added: added });
                            this.fire('dumped', { removed: result, added: added });

                            return result;
                        }.bind(collection)
                    });
                    Object.defineProperty(collection, 'synchronize', {
                        enumerable: false,
                        configurable: true,
                        writable: true,
                        value: function (array, idFunc, num) {
                            var me = this;
                            // var arraySubset = array.subset(0, num);
                            //var mapped = array.map(function (item, i) {
                            //    var itemId = idFunc(item);
                            //    return {
                            //        index: i,
                            //        value: me.first(function (x) {
                            //            return idFunc(x) === itemId;
                            //        }) || item,
                            //        itemId: itemId
                            //    };
                            //});
                            //mapped.sort(function (a, b) {
                            //    return +(a.value > b.value) || +(a.value === b.value) - 1;
                            //});
                            //var toremove = me.relativeCompliment(arraySubset, function (x, y) {
                            //    return idFunc(x) === idFunc(y);
                            //});
                            //var toadd = arraySubset.relativeCompliment(me, function (y, x) {
                            //    return idFunc(x) === idFunc(y);
                            //});
                            //me._pause();
                            //me.length = 0;
                            //   me.removeWhere(function (x) { return toremove.indexOf(x) !== -1; });
                            //me._start();
                            //pushFunc.apply(me, mapped.select(function (x) {
                            //    return x.value;
                            //}));
                            me.length = 0;
                            pushFunc.apply(me, array);

                            me.fire('synchronized', {
                                //added: toadd,
                                //removed: toremove
                            });
                        }
                    });
                    Object.defineProperty(collection, 'pump', {
                        enumerable: false,
                        configurable: true,
                        writable: true,
                        value: function (a, b) {
                            var key = ' $pump';
                            var me = this;
                            var c = b;
                            var key2 = '$ attached array';
                            if (Array.isArray(b)) {
                                MEPH.util.Observable.observable(c);


                                if (this[key2]) {
                                    this[key2].un(null, me);
                                }

                                c.on('changed', function () {
                                    me.pump(me.length);
                                }, me);
                                c.on('synchronized', function (type, options) {
                                    // pushFunc.apply(me, options.added);
                                    me.length = 0;
                                    me._pause();
                                    me.pump(me.length);
                                    me._start();
                                    me.fire(type, options);
                                }, me);
                                this[key2] = c;
                            }
                            if (typeof a === 'function') {
                                //setting pump getter
                                this[key] = a;
                            }
                            else {
                                //executing
                                if (this[key]) {
                                    var res = this[key](a, b);
                                    if (res && res.length) {
                                        this.push.apply(this, res);
                                    }
                                }
                            }
                            return this;
                        }.bind(collection)
                    });

                    var concatFunc = collection.concat;
                    Object.defineProperty(collection, 'concat', {
                        enumerable: false,
                        configurable: true,
                        writable: true,
                        value: function () {
                            this.fire(this, MEPH.Array(['beforeconcat'].concat(ConvertToList(arguments))));
                            var result = concatFunc.apply(this, arguments);
                            this.fire('afterconcat', result);
                            this.fire('onconcat', result);
                            this.fire('concatted', result);
                        }.bind(collection)
                    });
                    return this;
                })(array);
            }
        }
    }
}).then(function (result) {
    MEPH.Observable = MEPH.util.Observable;
    return result;
});