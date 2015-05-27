describe("MEPH/util/Observable.spec.js", function () {

    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });

    it('will make an array observable', function (done) {
        MEPH.requires('MEPH.util.Observable').then(function () {
            var array = [];
            MEPH.Observable.observable(array);
            expect(array.isObservable).toBeTruthy();

        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });

    it('arrays will fire changed event on push.', function (done) {
        MEPH.requires('MEPH.util.Observable').then(function () {
            var array = [],
               changed = 0;
            MEPH.Observable.observable(array);
            array.on('changed', function () {
                changed++;
            });
            array.push('value');
            expect(changed).toBeTruthy();

        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });


    it('arrays will fire changed event on pushed.', function (done) {
        MEPH.requires('MEPH.util.Observable').then(function () {
            var array = [],
               changed = 0;
            MEPH.util.Observable.observable(array);
            array.on('changed', function () {
                changed++;
            });

            array.push('value');
            expect(changed).toBeTruthy();

        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });

    it('arrays will fire changed event on shift.', function (done) {
        MEPH.requires('MEPH.util.Observable').then(function () {
            var array = [],
               added,
               removed,
               changed = 0;
            array.push('value');
            MEPH.Observable.observable(array);
            array.on('changed', function (type, options) {
                changed++;
                added = options.added[0];
                removed = options.removed[0];
            });
            array.shift();
            expect(removed === 'value').theTruth('the removed value was incorrect');
            expect(changed).toBeTruthy();

        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });


    it('arrays will fire changed event on unshift.', function (done) {
        MEPH.requires('MEPH.util.Observable').then(function () {
            var array = [],
                added,
                removed,
                changed = 0;
            MEPH.Observable.observable(array);
            array.on('changed', function (type, options) {
                changed++;
                added = options.added[0];
                removed = options.removed[0];
            });
            array.unshift('value');
            expect(added === 'value').theTruth('the added value was incorrect');
            expect(changed).toBeTruthy();
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });

    it('arrays will fire changed event on pop.', function (done) {
        MEPH.requires('MEPH.util.Observable').then(function () {
            var array = [],
                added,
                removed,
                changed = 0;
            MEPH.Observable.observable(array);
            array.push('value');
            array.on('changed', function (type, options) {
                changed++;
                added = options.added[0];
                removed = options.removed[0];
            });
            array.pop();
            expect(removed === 'value').theTruth('the popped value was incorrect');
            expect(changed).toBeTruthy();

        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });;
    });


    it('arrays will fire changed event on splice.', function (done) {
        MEPH.requires('MEPH.util.Observable').then(function () {
            var array = [],
                added,
                removed,
                changed = 0;
            MEPH.Observable.observable(array);
            array.push('value');
            array.on('changed', function (type, options) {
                changed++;
                added = options.added[0];
                removed = options.removed[0];
            });

            array.splice(0, 1, 'newvalue');
            expect(removed === 'value').theTruth('the spliced removed value was incorrect');
            expect(added === 'newvalue').theTruth('the spliced added value was incorrect');
            expect(changed).toBeTruthy();

        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });


    it('will make an object observable', function (done) {
        MEPH.requires('MEPH.util.Observable').then(function () {
            var object = {};
            MEPH.Observable.observable(object);
            expect(object[MEPH.nonEnumerablePropertyPrefix + 'isObservable']).toBeTruthy();
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });

    it('an empty oberservable object will have 0 enumerable properties', function (done) {
        MEPH.requires('MEPH.util.Observable').then(function () {
            var object = {},
               i,
               count = 0;
            MEPH.Observable.observable(object);
            for (i in object) {
                if (object.hasOwnProperty(i)) {
                    count++;
                }
            }
            expect(count === 0).toBeTruthy();
            expect(object[MEPH.nonEnumerablePropertyPrefix + 'isObservable']).toBeTruthy();

        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });

    it('objects that are observable have to have events applied. so i can listen to changes', function (done) {
        MEPH.requires('MEPH.util.Observable').then(function () {
            var object = { prop: null },
               i,
               count = 0;
            MEPH.Observable.observable(object);
            object.on('changed', function () { count++; });
            object.prop = 'newvalue';
            expect(object[MEPH.nonEnumerablePropertyPrefix + 'isObservable']).toBeTruthy();
            expect(count).toBeTruthy();

        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });
    it('can create properties which depend on others', function (done) {
        MEPH.requires('MEPH.util.Observable').then(function () {
            var object = {
                propCls: null,
                prop2Cls: null
            };
            MEPH.util.Observable.observable(object);

            MEPH.util.Observable.defineDependentProperty('finalProperty', object, ['propCls', 'prop2Cls'], function () {
                var me = this;
                return MEPH.Array([object.prop2Cls, object.propCls]).where(function (x) { return x; }).join(' ');
            });
            object.prop2Cls = 'NEWVALUE';
            expect(object.finalProperty === 'NEWVALUE').theTruth('The new cls was not correct.');

        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });

    it(' when a property changes the dependent property will also throw an altered and changed event', function (done) {
        MEPH.requires('MEPH.util.Observable').then(function () {
            var object = {
                prop1: null,
                prop2: null
            }, newpropertychanged, changedproperty;
            MEPH.util.Observable.observable(object);
            MEPH.util.Observable.defineDependentProperty('newproperty', object, ['prop1', 'prop2'], function () {
                return true;
            });
            object.on('altered', function (type, args) {
                if (args.path === 'newproperty') {
                    newpropertychanged = true;
                }
            });
            object.on('changed', function (type, args) {
                if (args.new === true) {
                    changedproperty = true;
                }
            });
            object.prop1 = 'asdf';
            expect(changedproperty).theTruth('changed was not fired');
            expect(newpropertychanged).theTruth('altered was not fired');

        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });
    it('when a reference object is added to an observable object, it will become observable also', function (done) {
        MEPH.requires('MEPH.util.Observable').then(function () {
            var object = { prop: null, obj: null },
               count = 0;
            MEPH.Observable.observable(object);
            object.obj = {
                newobject: null
            };
            object.obj.on('changed', function () {
                count++;
            });
            object.obj.newobject = 'new';
            expect(count === 1).theTruth('referece object didnt report coutn === 1 changed.');

        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });
    it('when an object is set observable, the entire tree is set observable', function (done) {
        MEPH.requires('MEPH.util.Observable').then(function () {
            var object = { prop: { subobj: { value: null } } },
               count = 0;
            MEPH.Observable.observable(object);

            object.prop.subobj.on('changed', function () { count++; });
            object.prop.subobj.value = 'new';
            expect(count === 1).theTruth('the sub object did not raise a changed event');

        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });
    it('when an object changes, the path to the property changed is propogated up the tree', function (done) {
        MEPH.requires('MEPH.util.Observable').then(function () {
            var object = { prop: { subobj: { value: null } } },
                               path, path2,
                               count = 0;
            MEPH.Observable.observable(object);

            object.on('altered', function (type, options) {
                path = options.path;
            });
            object.prop.on('altered', function (type, options) {
                path2 = options.path;
            });
            object.prop.subobj.value = 'new';

            expect(path === 'prop.subobj.value').theTruth('the altered path was not correct. path: ' + path);

        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });

    it('when an object chain has a circular path, it will stop propogating altered', function (done) {
        MEPH.requires('MEPH.util.Observable').then(function () {
            var object = { prop: { subobj: { value: null, value2: null } } },
                path, path2,
          count = 0;
            object.prop.subobj.value = object;
            MEPH.Observable.observable(object);

            object.on('altered', function (type, options) {
                path = options.path;
            });

            object.prop.subobj.value2 = 'new';

            expect(path === 'prop.subobj.value2').theTruth('the altered path was not correct. path: ' + path);

        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });

    it('when an object chain has a circular path, it will stop setting observable', function (done) {
        MEPH.requires('MEPH.util.Observable').then(function () {
            var object = {
                prop: {
                    subobj: {
                        value: null,
                        value2: null
                    }
                }
            },
          path, path2,
          count = 0;
            object.prop.subobj.value = object;
            MEPH.Observable.observable(object);
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });


});