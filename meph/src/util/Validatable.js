MEPH.define('MEPH.util.Validatable', {
    requires: ['MEPH.util.Observable'],
    statics: {
        isValidatable: function (obj) {
            return obj[MEPH.isValidatablePropertyKey] ? true : false;
        },
        addValidationRule: function (obj, properties, testFunction) {
            properties = Array.isArray(properties) ? properties : MEPH.Array([properties]);

            if (MEPH.util.Validatable.isValidatable(obj)) {
                obj[MEPH.isValidatablePropertyKey][' rules'].push({
                    paths: properties,
                    test: testFunction
                });
                properties.foreach(function (property) {
                    if (!obj[MEPH.isValidatablePropertyKey][' properties'].some(function (x) {
                        return x.path == property;
                    })) {
                        obj[MEPH.isValidatablePropertyKey][' properties'].push({
                            path: property,
                            valid: undefined,
                            change: false
                        });

                        Object.defineProperty(obj[MEPH.isValidatablePropertyKey], property, {
                            value: null,
                            enumerable: false,
                            writable: true,
                            configurable: true
                        });
                    }
                });
            }
        },
        isOnPath: function (path1, path2) {
            //return path1.indexOf(path2) !== -1;
            return path1 === path2;
        },
        getRulesOnPath: function (obj, path) {
            var validatable = MEPH.util.Validatable;
            if (!validatable.isValidatable(obj)) {
                return [];
            }

            return obj[MEPH.isValidatablePropertyKey][' rules'].where(function (x) {
                return x.paths.some(function (y) {
                    return validatable.isOnPath(y, path);
                });
            });
        },
        getRules: function (obj) {
            if (MEPH.util.Validatable.isValidatable(obj)) {
                return obj[MEPH.isValidatablePropertyKey][' rules'];
            }
            return [];
        },
        validatable: function (obj) {
            if (!MEPH.util.Observable.isObservable(obj)) {
                MEPH.util.Observable.observable(obj);
            }


            if (MEPH.util.Validatable.isValidatable(obj)) {
                return;
            }

            Object.defineProperty(obj, MEPH.isValidatablePropertyKey, {
                value: {
                    ' rules': [],
                    ' properties': [],
                    props: {}
                },
                enumerable: false,
                writable: false,
                configurable: false
            });

            obj.on('altered', function (type, params) {
                //debugger
                var validatable = MEPH.util.Validatable,
                    results = [], altered,
                    rules;
                rules = validatable.getRulesOnPath(obj, params.path);
                results = rules.select(function (rule) {
                    var result = rule.test(obj, params.path, params);
                    if (result === false || (result !== null && typeof (result) === 'object' && result.error)) {
                        return { result: result, rule: rule };
                    }
                    else {
                        return false;
                    }
                }).where(function (x) { return x; });
                if (results.length) {
                    MEPH.setPathValue(obj, [MEPH.isValidatablePropertyKey, params.path].join(MEPH.pathDelimiter), results.select(function (x) { return x.result; }));
                    obj.fire('altered', {
                        references: [],
                        path: [MEPH.isValidatablePropertyKey, params.path].join(MEPH.pathDelimiter)
                    });
                } else {
                    if (MEPH.getPathValue([MEPH.isValidatablePropertyKey, params.path].join(MEPH.pathDelimiter), obj)) {
                        altered = true;
                    }
                    MEPH.setPathValue(obj, [MEPH.isValidatablePropertyKey, params.path].join(MEPH.pathDelimiter), null);
                    if (altered) {
                        obj.fire('altered', {
                            references: [],
                            path: [MEPH.isValidatablePropertyKey, params.path].join(MEPH.pathDelimiter)
                        });
                    }
                }
            });
        }
    }
});