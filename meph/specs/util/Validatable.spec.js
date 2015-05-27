describe("MEPH/util/Validatable.spec.js", function () {

    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });

    it('will make an array observable', function (done) {
        MEPH.requires('MEPH.util.Validatable', 'MEPH.util.Observable').then(function () {
            var object = {
            };

            MEPH.util.Validatable.validatable(object);

            expect(MEPH.util.Observable.isObservable(object)).theTruth('The objec has to be an observable');
        }).catch(function (error) {
            if (error) {
                expect(error).caught();
            }
        }).then(function () {
            done();
        });
    });

    it('will return true when object is validatable', function (done) {
        MEPH.requires('MEPH.util.Validatable').then(function () {
            var object = {
            };

            MEPH.util.Validatable.validatable(object);

            expect(MEPH.util.Validatable.isValidatable(object)).theTruth('The objec has to be an validatable');
        }).catch(function (error) {
            if (error) {
                expect(error).caught();
            }
        }).then(function () {
            done();
        });
    });

    it('can add a validation rule to a specific property', function (done) {
        MEPH.requires('MEPH.util.Validatable').then(function () {
            var object = {
                property: null
            };

            MEPH.util.Validatable.validatable(object);

            MEPH.util.Validatable.addValidationRule(object, 'property', function () {
            });

            expect(object[MEPH.isValidatablePropertyKey][' rules'].first(function (x) {
                return x.paths.some(function (y) { return y === 'property'; });
            })).theTruth('no rule found for property');
        }).catch(function (error) {
            if (error) {
                expect(error).caught();
            }
        }).then(function () {
            done();
        });
    });

    it('validation will get the list of validation rules that will be executed on a path', function (done) {
        MEPH.requires('MEPH.util.Validatable').then(function () {
            var object = {
                property: null
            }, rules;

            MEPH.util.Validatable.validatable(object);

            MEPH.util.Validatable.addValidationRule(object, 'property', function () {
                validated = true;
            });
            rules = MEPH.util.Validatable.getRulesOnPath(object, 'property');

            expect(rules.length).theTruth('no rules were found.');
        }).catch(function (error) {
            if (error) {
                expect(error).caught();
            }
        }).then(function () {
            done();
        });
    });

    it('validation will be executed when an object is altered', function (done) {
        MEPH.requires('MEPH.util.Validatable').then(function () {
            var object = {
                property: null
            }, validated = false;

            MEPH.util.Validatable.validatable(object);

            MEPH.util.Validatable.addValidationRule(object, 'property', function () {
                validated = true;
            });
            object.property = 'newvalue';

            expect(validated).theTruth('the object was no validated.');
        }).catch(function (error) {
            if (error) {
                expect(error).caught();
            }
        }).then(function () {
            done();
        });
    });

    it('when a property fails validation, will raise an altered events on the propertys.', function (done) {
        MEPH.requires('MEPH.util.Validatable').then(function () {
            var object = {
                property: null
            }, validated = false;

            MEPH.util.Validatable.validatable(object);

            MEPH.util.Validatable.addValidationRule(object, 'property', function () {
                return false;
            });

            object.on('altered', function (type, params) {
                if (params.path === MEPH.isValidatablePropertyKey + '.property') {
                    validated = true;
                }
            });
            object.property = 'newvalue';

            expect(validated).theTruth('the object didnt throw a validation error with the correct path.');
        }).catch(function (error) {
            if (error) {
                expect(error).caught();
            }
        }).then(function () {
            done();
        });
    });


    it('when a property changes, but the validation is wrong it wont fire altered..', function (done) {
        MEPH.requires('MEPH.util.Validatable').then(function () {
            var object = {
                property: null
            }, validated = false;

            MEPH.util.Validatable.validatable(object);

            MEPH.util.Validatable.addValidationRule(object, 'property', function () {
                return false;
            });

            object.on('altered', function (type, params) {
                if (params.path === MEPH.isValidatablePropertyKey + '.property') {
                    validated++;
                }
            });

            
            object.property = 'newvalue';
            object.property = 'newvalue2';

            expect(validated === 2).theTruth('the validation changed more than once, and it should have change 2 times.');
        }).catch(function (error) {
            if (error) {
                expect(error).caught();
            }
        }).then(function () {
            done();
        });
    });



    it('when a property changes, but the validation wont fire.', function (done) {
        MEPH.requires('MEPH.util.Validatable').then(function () {
            var object = {
                subobject: {
                    property: null
                },
                property: null
            }, validated = 0;

            MEPH.util.Validatable.validatable(object);

            MEPH.util.Validatable.addValidationRule(object, 'property', function () {
                return false;
            });

            object.on('altered', function (type, params) {
                if (params.path === MEPH.isValidatablePropertyKey + '.property') {
                    validated++;
                }
            });

            object.subobject.property = 'newvalue';

            expect(validated === 0).theTruth('the validation changed more than once, and it should have change 1 time.');
        }).catch(function (error) {
            if (error) {
                expect(error).caught();
            }
        }).then(function () {
            done();
        });
    });


    it('when a property changes, but the validation wont fire.', function (done) {
        MEPH.requires('MEPH.util.Validatable').then(function () {
            var object = {
                subobject: {
                    property: null
                },
                property: null
            }, validated = 0;

            MEPH.util.Validatable.validatable(object);

            MEPH.util.Validatable.addValidationRule(object, 'subobject.property', function (obj, path, params) {
                if (path === 'subobject.property') {
                    validated++;
                }
            });


            object.subobject.property = 'newvalue';

            expect(validated === 1).theTruth('the validation changed more than once, and it should have change 1 time.');
        }).catch(function (error) {
            if (error) {
                expect(error).caught();
            }
        }).then(function () {
            done();
        });
    });


    it('multiple validation rules..', function (done) {
        MEPH.requires('MEPH.util.Validatable').then(function () {
            var object = {
                subobject: {
                    property: null
                },
                property: null
            }, validated = 0, propertyvalidated = 0;

            MEPH.util.Validatable.validatable(object);

            MEPH.util.Validatable.addValidationRule(object, 'subobject.property', function (obj, path, params) {
                if (path === 'subobject.property') {
                    validated++;
                }
            });

            MEPH.util.Validatable.addValidationRule(object, 'property', function (obj, path, params) {
                if (path === 'property') {
                    propertyvalidated++;
                }
            });

            object.subobject.property = 'newvalue';

            expect(validated === 1).theTruth('the validation didnt not occur, and it should have.');
            expect(propertyvalidated === 0).theTruth('the property should not have been validated.');
        }).catch(function (error) {
            if (error) {
                expect(error).caught();
            }
        }).then(function () {
            done();
        });
    });


    it('can get rules ', function (done) {
        MEPH.requires('MEPH.util.Validatable').then(function () {

            var object = {
                subobject: {
                    property: null
                },
                property: null
            }, validated = 0, propertyvalidated = 0;

            MEPH.util.Validatable.validatable(object);

            MEPH.util.Validatable.addValidationRule(object, 'subobject.property', function (obj, path, params) {
                if (path === 'subobject.property') {
                    validated++;
                }
            });

            expect(MEPH.util.Validatable.getRules(object).length === 1).theTruth('not the right number of rules on the object');
        }).catch(function (error) {
            if (error) {
                expect(error).caught();
            }
        }).then(function () {
            done();
        });
    });
});