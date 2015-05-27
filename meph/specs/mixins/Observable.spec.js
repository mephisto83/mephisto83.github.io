describe("MEPH/mixins/Observable.spec.js", function () {

    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });


    it('will make an object observable', function (done) {
        var fakeObservableNAME = 'Fake.Observable.Class',
            config = {
                initialize: function () {
                    var me = this;
                    me.mixins.observable.init.apply(me);
                },
                requires: ['MEPH.mixins.Observable'],
                mixins: {
                    observable: 'MEPH.mixins.Observable'
                }
            }
        MEPH.undefine(fakeObservableNAME);
        MEPH.define(fakeObservableNAME, config).then(function ($class) {
            var instance = new $class();

            expect(instance.mixins.observable).theTruth('Mixin was not defined on the instance');
            expect(instance[MEPH.nonEnumerablePropertyPrefix + 'isObservable']).theTruth('The object is not observable');
            MEPH.undefine(fakeObservableNAME);

        }).catch(function (error) {
            expect(new Error('Didnt get the required files.')).caught();
        }).then(function (x) {
            done();
        });
    });

    it('will fire altered events on the class when a property is changed', function (done) {
        //Arrange
        var fakeObservableNAME = 'Fake.Observable.Class',
           config = {
               initialize: function () {
                   var me = this;
                   me.mixins.observable.init.apply(me);
               },
               properties: {
                   property: null,
                   property2: null
               },
               requires: ['MEPH.mixins.Observable'],
               mixins: {
                   observable: 'MEPH.mixins.Observable'
               }
           }
        MEPH.undefine(fakeObservableNAME);
        MEPH.define(fakeObservableNAME, config).then(function ($class) {
            var instance = new $class(),
                path;

            instance.on('altered', function (type, options) {
                path = options.path;
            });

            //Act
            instance.property = 'newproperty';
            MEPH.undefine(fakeObservableNAME);

            //Assert
            expect(path === 'property').theTruth('the path on the altered event options was not "property"');
        }).catch(function (error) {
            expect(error).caught();
        }).then(function (x) {
            done();
        });
    });

    it('will ignore private properties', function (done) {
        //Arrange
        var fakeObservableNAME = 'Fake.Observable.Class',
           config = {
               initialize: function () {
                   var me = this;
                   me.mixins.observable.init.apply(me);
               },
               properties: {
                   property: null,
                   property2: null,
                   $private: null
               },
               requires: ['MEPH.mixins.Observable'],
               mixins: {
                   observable: 'MEPH.mixins.Observable'
               }
           }
        MEPH.undefine(fakeObservableNAME);
        MEPH.define(fakeObservableNAME, config).then(function ($class) {

            var instance = new $class(),
                count = 0,
                path;

            instance.on('altered', function (type, options) {
                count++;
            });

            //Act
            instance.$private = 'newproperty';

            //Assert
            expect(count === 0).theTruth('the private property was observable');
            MEPH.undefine(fakeObservableNAME);

        }).catch(function (error) {
            expect(error).caught();
        }).then(function (x) {
            done();
        });
    });

    it('will fire altered events on the class when a property is changed', function (done) {
        //Arrange
        var fakeObservableNAME = 'Fake.Observable.Class',
           config = {
               initialize: function () {
                   var me = this;
                   me.mixins.observable.init.apply(me);
               },
               properties: {
                   property: null,
                   property2: null
               },
               requires: ['MEPH.mixins.Observable'],
               mixins: {
                   observable: 'MEPH.mixins.Observable'
               }
           }
        MEPH.undefine(fakeObservableNAME);
        MEPH.define(fakeObservableNAME, config).then(function ($class) {
            var instance = new $class(),
                path;

            instance.on('altered', function (type, options) {
                path = options.path;
            });

            //Act
            instance.property = { property: null };
            instance.property.property = 'prop';

            //Assert
            expect(path === 'property.property').theTruth('the path on the altered event options was not "property"');

            MEPH.undefine(fakeObservableNAME);
        }).catch(function (error) {
            expect(error).caught();
        }).then(function (x) {
            done();
        });
    });
    it('fires altered events on the class when a property is changed, and not ', function (done) {
        //Arrange
        var fakeObservableNAME = 'Fake.Observable.Class',
           config = {
               initialize: function () {
                   var me = this;
                   me.mixins.observable.init.apply(me);
               },
               properties: {
                   property: null,
                   property2: null
               },
               requires: ['MEPH.mixins.Observable'],
               mixins: {
                   observable: 'MEPH.mixins.Observable'
               }
           }
        MEPH.undefine(fakeObservableNAME);
        MEPH.define(fakeObservableNAME, config).then(function ($class) {
            var instance = new $class(),
                old,
                path;

            instance.on('altered', function (type, options) {
                path = options.path;
            });

            //Act
            instance.property = { property: null };
            old = instance.property;
            instance.property = 'prop';

            //Assert
            MEPH.undefine(fakeObservableNAME);
            expect(old[MEPH.listenersPropertyKey].length === 0).theTruth('');
            expect(path === 'property').theTruth('the path on the altered event options was not "property"');

        }).catch(function (error) {
            expect(error).caught();
        }).then(function (x) {
            done();
        });
    });
});