describe("MEPH/synchronization/SyncObject.spec.js", function () {

    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });

    it('can create a synchobject.', function (done) {
        MEPH.create('MEPH.synchronization.SyncObject').then(function ($class) {
            var syncobject = new $class();
            expect(syncobject).theTruth('no synchobject was created');
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });


    it('can create a synchobject object.', function (done) {
        MEPH.create('MEPH.synchronization.SyncObject').then(function ($class) {
            var syncobject = new $class();

            //Act
            var result = syncobject.createObj({
                properties: {
                    prop1: [],
                    prop2: null
                }
            });

            //Assert
            expect(result).theTruth('no result was created');
            expect(Array.isArray(result.prop1)).theTruth('was not an array, as expected');
            expect(result.prop2 === null).theTruth('prop2 was not null');
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });


    it('can create an object with properties ', function (done) {
        MEPH.create('MEPH.synchronization.SyncObject').then(function ($class) {
            var syncobject = new $class();

            //Act
            var result = syncobject.createObj({ properties: { prop1: null, prop2: null } });

            //Assert
            expect(result).toBeTruthy();
            expect(result.prop1 === null).theTruth('the property should be null');
            expect(result.prop2 === null).theTruth('the property should be null');
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });

    it('create an object with properties and set arrays to observable ', function (done) {
        MEPH.create('MEPH.synchronization.SyncObject').then(function ($class) {
            var syncobject = new $class();

            //Act
            var result = syncobject.createObj({ properties: { arrayprop: null } });

            result.arrayprop = [];
            //Assert
            return MEPH.continueWhen(function () {
                return result.arrayprop.isObservableCollection &&
                    Array.isArray(result.arrayprop);
            }).then(function () {
                expect(result.arrayprop.isObservableCollection).theTruth('the arrayprop was not an observable collection.');;
                expect(Array.isArray(result.arrayprop)).theTruth('the arrayprop was not an array');
            });
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });

    it('can create an object, and the initial values are set', function (done) {
        MEPH.create('MEPH.synchronization.SyncObject').then(function ($class) {

            //Arrange
            var syncobject = new $class();


            //Act
            var result = syncobject.createObj({
                properties: {
                    name: 'name'
                }
            });

            //Assert
            expect(result.name === 'name').theTruth('the name was not as expected');
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });;
    });

    it('objects notify when properties are set', function (done) {
        MEPH.create('MEPH.synchronization.SyncObject').then(function ($class) {
            //Arrange
            var syncobject = new $class();
            var result = syncobject.createObj({
                properties: {
                    name: 'name'
                }
            });
            var old, neww;
            //Act
            result.on('setname', function (type, options) {
                old = options.old;
                neww = options.new;
            })
            result.name = 'changed';

            return MEPH.continueWhen(function () {
                //Assert
                return result.name == 'changed' &&
                    old == 'name' &&
                    neww == 'changed';
            }).then(function () {
                expect(result.name == 'changed').theTruth('the name was not as expected');
                expect(old == 'name').theTruth('the old name was not as expected');
                expect(neww == 'changed').theTruth('the new name was not as expected');
            });
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });;
    });

    it('when setting an object, observable is applied', function (done) {
        MEPH.create('MEPH.synchronization.SyncObject').then(function ($class) {
            //Arrange
            var syncobject = new $class();

            //Act
            var result = syncobject.createObj({
                properties: {
                    name: 'name',
                    obj: null
                }
            });
            result.obj = { newobject: null };

            return MEPH.continueWhen(function () {
                return MEPH.util.Observable.isObservable(result.obj);
            }).then(function () {
                expect(MEPH.util.Observable.isObservable(result.obj)).theTruth('the object was not observable');
            });
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });;
    });

    it('multi levels deep will throw set events', function (done) {
        MEPH.create('MEPH.synchronization.SyncObject').then(function ($class) {
            //Arrange
            var syncobject = new $class();
            var result = syncobject.createObj({
                properties: {
                    name: 'name',
                    obj: null
                }
            });

            result.on('altered', function (type, options) {
                path = options.path;
            });

            result.obj = {
                object: {
                    level1: {
                        level2: {
                            name: ''
                        }
                    }
                }
            };
            var path;
            //Act
            result.obj.object.level1.level2.name = 'name';
            MEPH.continueWhen(function () {
                return path === 'obj.object.level1.level2.name';
            })
            .then(function () {
                //Assert
                expect(path === 'obj.object.level1.level2.name').theTruth('the path wasnt as expected');
            });
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });;
    });

    it('get path of jobject change with old and new args 1', function (done) {
        MEPH.create('MEPH.synchronization.SyncObject').then(function ($class) {
            //Arrange
            var syncobject = new $class();
            var result = syncobject.createObj({
                properties: {
                    name: 'name',
                    obj: null
                }
            });
            result.obj = {
                object: {
                    level1: {
                        level2: {
                            name: null
                        }
                    }
                }
            };

            //Act
            var path;
            var old;
            var value;
            result.on('altered', function (type, options) {
                path = options.path;
                value = options.value;
                old = options.old;
            });
            return MEPH.continueWhen(function () {
                result.obj.object.level1.level2.name = 'name';
                return value === 'name' &&
                    old == null &&
                    path === 'obj.object.level1.level2.name';

            }).then(function () {
                //Assert
                expect(value == 'name').theTruth('the value was not as expected');
                expect(old == null).theTruth('old was not as expected');
                expect(path === 'obj.object.level1.level2.name').theTruth('the path was not as expected');
            });
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });;
    });


    it('get path of jobject change with old and new args 2', function (done) {
        MEPH.create('MEPH.synchronization.SyncObject').then(function ($class) {
            //Arrange
            var syncobject = new $class();
            var result = syncobject.createObj({
                properties: {
                    name: 'name',
                    obj: null
                }
            });
            result.obj = {
                object: {
                    level1: {
                        level2: {
                            name: null
                        }
                    }
                }
            };

            //Act
            var path;
            var old;
            var value,
                values = [];
            result.on('altered', function (type, options) {
                path = options.path;
                value = options.value;
                old = options.old;
                values.push(options);
            });

            setTimeout(function () {
                result.obj.object.level1.level2.name = {
                    value: 'name'
                };
            }, 10);
            return MEPH.continueWhen(function () {
                return values.some(function (options) {
                    path = options.path;
                    value = options.value;
                    old = options.old;
                    return value.value === 'name' &&
                        old == null &&
                        path === 'obj.object.level1.level2.name';
                });
            }).then(function () {

                //Assert
                expect(value.value == 'name').theTruth('value is not equal to name');
                expect(old == null).theTruth('old was not null');
                expect(path === 'obj.object.level1.level2.name').theTruth('the path was not correct');

                result.obj.object.level1.level2.name.value = 'newname';

            }).then(function () {
                return MEPH.continueWhen(function () {
                    return value === 'newname' &&
                        old == 'name' &&
                        path === 'obj.object.level1.level2.name.value';
                });

            }).then(function () {

                //Assert
                expect(value == 'newname').theTruth('value is not equal to name');
                expect(old == 'name').theTruth('old was not null');
                expect(path === 'obj.object.level1.level2.name.value').theTruth('the path was not correct');
            })
            //expect(value == 'newname').theTruth('value was not equal to newname');
            //expect(old == 'name').theTruth('old was not equal to name');
            //expect(path === 'obj.object.level1.level2.name.value').theTruth('the path was not correct.');
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });;
    });
    it('get path of jobject change with old and new args 3', function (done) {
        MEPH.create('MEPH.synchronization.SyncObject').then(function ($class) {
            //Arrange
            var syncobject = new $class();
            var result = syncobject.createObj({
                properties: {
                    name: 'name',
                    obj: null
                }
            });


            //Act
            var moves = [];
            result.on('altered', function (type, options) {
                moves.push({
                    path: options.path,
                    value: options.value,
                    old: options.old
                });
            });

            result.obj = { level: null, level2: null };
            result.obj.level = {};
            result.obj.level2 = {};

            //Assert
            return MEPH.continueWhen(function () {
                return moves.length;
            }).then(function () {
                expect(moves.length).theTruth('the number of moves was incorrect');
            });

        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });;
    });
    it('jsync object has id', function (done) {
        MEPH.create('MEPH.synchronization.SyncObject').then(function ($class) {
            //Arrange
            var syncobject = new $class();
            var result = syncobject.createObj({
                properties: {
                    name: 'name',
                    obj: null
                }
            });

            //Act

            //Assert
            expect(result.jsyncId()).theTruth('there was a problem with the jsyncId');
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });;
    });
    it('can Create jsync object', function (done) {
        MEPH.create('MEPH.synchronization.SyncObject').then(function ($class) {
            //Arrange
            var syncobject = new $class();

            //Act
            var obj = syncobject.createObj();

            //Assert
            expect(obj).toBeTruthy();
            expect(obj.jsyncId()).toBeTruthy();

        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });;
    });
    it('can Create jsync object and add property', function (done) {
        MEPH.create('MEPH.synchronization.SyncObject').then(function ($class) {
            //Arrange
            var syncobject = new $class();
            var obj = syncobject.createObj();

            //Act
            var moves = [];
            obj.on('altered', function (type, options) {
                moves.push({
                    path: options.path,
                    value: options.new,
                    old: options.old
                });
            });
            obj.property = 'property';
            obj[MEPH.jsync].sweep();
            obj.property = 'newprop';
            //Assert
            return MEPH.continueWhen(function () {
                return moves.length;
            }).then(function () {
                expect(obj.jsyncId()).toBeTruthy();
                expect(moves.length).toBeTruthy();
            });
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });;
    });
    it('check that when adding a complex object, multiple creation steps are fired', function (done) {
        MEPH.create('MEPH.synchronization.SyncObject').then(function ($class) {
            //Arrange
            var syncobject = new $class();
            var result = syncobject.createObj({
                properties: {
                    name: 'name',
                    obj: null
                }
            });
            var moves = [];
            result.on('created', function (type, options) {
                moves.push(options);
            });
            result.on('altered', function (type, options) {
                moves.push(options);
            });
            result.obj = {
                object: {
                    level1: {
                        level2: {
                            name: null
                        }
                    }
                }
            };

            //Act
            result.obj.object.level1.level2.name = 'name';

            return MEPH.continueWhen(function () {
                return moves.length;
            }).then(function () {
                //Assert
                expect(moves.length).theTruth('the number of moves was incorrect');
            });
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });;
    });
    it('add created objects to a new object.', function (done) {
        MEPH.create('MEPH.synchronization.SyncObject').then(function ($class) {
            ///Arrange
            var syncobject = new $class();
            var result = syncobject.createObj();
            var moves = [];
            result.on('created', function (type, options) {
                moves.push(options);
            })
            result.on('altered', function (type, options) {
                moves.push(options);
            });
            result.property = null;
            var second = syncobject.createObj();
            second.prop2 = 'two';
            result[MEPH.jsync].sweep();
            second[MEPH.jsync].sweep();

            //Act
            result.property = second;

            ///Assert

            return MEPH.continueWhen(function () {
                return moves.length;
            }).then(function () {
                expect(moves.length).theTruth('wrong number of moves ');
            });
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });;
    });
    it('undo move.', function (done) {
        MEPH.create('MEPH.synchronization.SyncObject').then(function ($class) {
            //Arrange
            var syncobject = new $class();
            var result = syncobject.createObj();
            var moves = [];
            result.on('created', function (type, options) {
                moves.push(options);
            });
            result.on('altered', function (type, options) { moves.push(options); });
            result.property = 'prop1';
            result[MEPH.jsync].sweep();
            result.property = 'prop2';
            result.property = 'prop3';
            result.property = 'prop4';

            //Act

            //            var movereuslt = result[MEPH.jsync].undo(moves.last());

            //Assert

            return MEPH.continueWhen(function () {
                return moves.last();
            }).then(function () {
                var movereuslt = result[MEPH.jsync].undo(moves.last());
                return MEPH.continueWhen(function () {
                    return movereuslt;
                }).then(function () {
                    expect(movereuslt).toBeTruthy();
                    expect(result.property === 'prop3').theTruth('the property was not correct set ');
                });
            });
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });;
    });
    it('return false if moves current value doesnt equal the value.', function (done) {
        MEPH.create('MEPH.synchronization.SyncObject').then(function ($class) {
            //Arrange
            var syncobject = new $class();
            var result = syncobject.createObj();
            var moves = [];
            result.on('created', function (type, options) { moves.push(options); });
            result.on('altered', function (type, options) { moves.push(options); });
            result.property = 'prop1';
            result[MEPH.jsync].sweep();
            result.property = 'prop2';
            result.property = 'prop3';
            result.property = 'prop4';
            //Act
            return MEPH.continueWhen(function () {
                return moves[0];
            }).then(function () {
                moves[0].value = 'v';
                var failed = result[MEPH.jsync].undo(moves[0]);
                //Assert
                expect(!failed).toBeTruthy();
            });
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });;
    });
    it('objects of type object are considered the same value if their ids match.', function (done) {
        MEPH.create('MEPH.synchronization.SyncObject').then(function ($class) {
            //Arrange
            var syncobject = new $class();
            var result = syncobject.createObj();
            var otherobject = syncobject.createObj();
            var moves = [];
            result.on('created', function (type, options) { moves.push(options); });
            result.on('altered', function (type, options) { moves.push(options); });
            result.property = 'prop1';
            result[MEPH.jsync].sweep();
            result.property = otherobject;
            return MEPH.continueWhen(function () {
                return moves.last();
            }).then(function () {
                var lastmove = moves.last();
                lastmove.new = MEPH.clone(otherobject);
                //Act
                var move_result = result[MEPH.jsync].undo(lastmove);

                //Assert
                expect(move_result).toBeTruthy();
            });
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });;
    });
    it('undo a few moves.', function (done) {
        MEPH.create('MEPH.synchronization.SyncObject').then(function ($class) {
            //Arrange
            var syncobject = new $class();
            var result = syncobject.createObj();
            var moves = [];
            result.on('created', function (type, options) { moves.push(options); });
            result.on('altered', function (type, options) { moves.push(options); });
            result.property = 'prop1';
            result[MEPH.jsync].sweep();
            result.property = 'prop2';
            result.property = 'prop3';
            result.property = 'prop4';
            //Act
            return MEPH.continueWhen(function () {
                return moves.last();
            }).then(function () {

                var failed = moves.reverse().all(function (move) {
                    return result[MEPH.jsync].undo(move);
                });

                //Assert
                expect(!failed).toBeTruthy();
                expect(result.property === 'prop3').theTruth('property was not equal to prop1');
            });
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });;
    });
    it('jsync objects will fire created-object event.', function (done) {
        MEPH.create('MEPH.synchronization.SyncObject').then(function ($class) {
            //Arrange
            var syncobject = new $class();
            var objectadded;
            syncobject.on('created-object', function () { objectadded = true; });
            //Act
            syncobject.createObj();
            //Assert
            expect(objectadded).toBeTruthy();
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });;
    });
});
