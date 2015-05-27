/**
 * @class
 * Defines a base class for all controls and views.
 **/
MEPH.define('MEPH.util.Observable', {
    statics: {

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
                        if (MEPH.IsObject(old)) {
                            //MEPH.Observable.observable(old);
                            if (old.un) {
                                old.un('altered', sThis);
                            }
                        }
                    }

                    function attachAlteredListeners(value, sThis, propName) {
                        if (MEPH.IsObject(value)) {
                            MEPH.Observable.observable(value);
                            if (!value.hasOn('altered', sThis)) {
                                value.on('altered', function (propName, type, options) {
                                    var obj = this,
                                        alteredOptions,
                                        path = options.path.split(MEPH.pathDelimiter),
                                        references;
                                    path.unshift(propName);
                                    if (!options.references.contains(function (x) { return x === obj; })) {
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
                        if (isObservable(obj)) {
                            return !getObservableProperties(obj).contains(function (y) {
                                return y === x;
                            });;
                        }
                        return true;
                    });

                    var funcpre = '$';

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

                                this.fire('beforeset' + propName, { old: old, new: value });

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

                    properties.foreach(function (x) {
                        if (!obj[MEPH.isObservablePropertyKey].properties.contains(function (y) { return x === y; })) {
                            obj[MEPH.isObservablePropertyKey].properties.push(x);
                        }
                    });

                    return this;
                }).bind(object, properties || null, override || null)();
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
                            this.fire('beforeunshift', {
                                added: ConvertToList(arguments),
                                removed: []
                            });
                            var result = unshiftFunc.apply(this, arguments);
                            this.fire('afterunshift', {
                                removed: MEPH.Array([]),
                                added: ConvertToList(arguments)
                            });
                            this.fire('onunshift', arguments);
                            this.fire('changed', {
                                removed: MEPH.Array([]),
                                added: ConvertToList(arguments)
                            });
                            this.fire('unshifted', ConvertToList(arguments));
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