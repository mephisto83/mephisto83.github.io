describe("MEPH", function () {

    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });

    it("calling namespace with a period delimited string will create a namespace", function () {
        //Arrange

        //Act
        MEPH.namespace('fake.name.space');

        //Assert
        expect(fake.name.space).toBeTruthy();
        fake = null;
    });

    it('can et ther required files for meph.js', function () {
        mephFrameWork('tEMP', '../src');

        expect(tEMP.requiredFiles.length).toBeTruthy();
    });

    it('mephFrameWork create a frame work', function () {
        //Arrange

        //Act
        mephFrameWork('FakeFramework', '../src');

        //Assert
        expect(FakeFramework.loadScript).toBeTruthy();
        expect(FakeFramework.Array).toBeTruthy();
    });

    it('can get source ', function (done) {

        MEPH.getSource('MEPHTests.helper.viewmodel.HelperViewModel', '.js').then(function (result) {
            expect(result).toBeTruthy();
        }).catch(function (er) {
            expect(er).caught();
        }).then(function () {
            done();
        });
    })
    it('define a class', function (done) {
        //Arrange
        var className = 'Fake.Class',
            config = {
                statics: {
                    staticProp: true
                },
                properties: {
                    prop: true
                },
                func: function () {
                }
            }
        //Act
        MEPH.define(className, config).then(function () {
            expect(Fake.Class).toBeTruthy();
            Fake = null;
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });

        //Assert
    });

    it('can set a authorization token to be used as default in all ajax calles', function () {

        MEPH.setAuthorizationToken('token');
        expect(MEPH.getAuthorizationToken() === 'token');

    });
    it('a class can have an alternate name', function (done) {
        var classNAME = 'Alternate.Fake.Class',
            config = {
                alternateNames: 'Alternate.Class'
            }
        MEPH.define(classNAME, config).then(function () {
            expect(Alternate.Fake.Class).toBeTruthy();
            expect(Alternate.Class).toBeTruthy();

            MEPH.undefine(classNAME);
            MEPH.undefine(config.alternateNames.first());

        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });
    it('when a class has dependencies they will be retrieved', function (done) {
        //Arrange
        var className = 'Fake.Class',
          config = {
              requires: ['MEPHTests.helper.Helper'],
              statics: {
                  staticProp: true
              },
              properties: {
                  prop: true
              },
              func: function () {
              }
          }
        //Act
        MEPH.define(className, config).then(function () {

            //Assert
            expect(Fake.Class).toBeTruthy();
            expect(MEPHTests.helper.Helper);
            Fake = null;
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });

    });

    it('when a class extends from a class it will be retrieved', function (done) {
        //Arrange
        var className = 'Fake.Class',
            config = {
                extend: 'Fake.Base.Class'
            },
            baseClassName = 'Fake.Base.Class',
            baseConfig = {
            };
        //Act
        MEPH.define(baseClassName, baseConfig).then(function () {
            return MEPH.define(className, config).then(function () {
                //Assert
                expect(Fake.Class).toBeTruthy();
                expect(Fake.Base.Class);
                MEPH.undefine(baseClassName);
                MEPH.undefine(className)

            });
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });


    it('When a class is already defined and retrieveRequiredClass is called it will return the class', function (done) {
        //Arrange
        var className = 'Fake.Class',
           config = {
               statics: {
                   staticProp: true
               },
               properties: {
                   prop: true
               },
               func: function () {
               }
           }
        //Act

        MEPH.define(className, config).then(function () {
            expect(Fake.Class).toBeTruthy();
            return MEPH.retrieveRequiredClass({ path: className, classifiedName: className }).then(function () {
                reached = true;
                expect(reached).toBeTruthy();
                MEPH.undefine('Fake.Class');
            });
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
        //Assert

    });

    it('when a class has a mixins they will be added to the instance of  ', function (done) {
        //Arrange
        var
            fakeMixinName = 'Fake.Mixin',
            className = 'Fake.Class',
            config = {
                requires: [fakeMixinName],
                mixins: {
                    fake: fakeMixinName
                }
            },
            mixinConfig = {
                func: function () { return 'success'; }
            }
        MEPH.define(fakeMixinName, mixinConfig).then(function () {
            return MEPH.define(className, config);
        }).then(function ($class) {
            var fake = new $class();

            expect(fake.mixins.fake.func).toBeTruthy();
            expect(fake.mixins.fake.func() === 'success').theTruth('Fake mixin func didnt return success, it returned ' + fake.mixins.fake.func());

        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });

    it('when a class has a mixin as an array, functions will be applied directly to the instance', function (done) {
        //Arrange
        var
           fakeMixinName = 'Fake.Mixin',
           className = 'New.Fake.Class',
           config = {
               requires: [fakeMixinName],
               mixins: [fakeMixinName]
           },
           mixinConfig = {
               func: function () { return 'success'; }
           }

        MEPH.define(fakeMixinName, mixinConfig).then(function () {
            return MEPH.define(className, config);
        }).then(function ($class) {
            var fake = new $class();

            expect(fake.func).toBeTruthy();
            expect(fake.func() === 'success').theTruth('Fake mixin func didnt return success, it returned ');

        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });

    it('Can load a html template ', function (done) {
        //Arrange
        var path = MEPH.getClassPath('MEPHTests.helper.HelperControl2') + MEPH.prefixes.templatePostFix;

        //Act
        MEPH.retrieveRequiredClass({
            type: 'tpl',
            path: path,
            classifiedName: 'MEPHTests.helper.HelperControl2'
        }).then(function (result) {

            //Assert
            expect(result.result).toBeTruthy();
            expect(result.details).toBeTruthy();

        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });

    });

    it('Can get all aliases ', function () {
        expect(MEPH.getAllAliases()).toBeTruthy();
    });

    it('Can define a class and then undefine a class', function (done) {
        //Arrange
        MEPH.define('Temp.Class', {
        }).then(function () {
            expect(Temp.Class).toBeTruthy();
            MEPH.undefine('Temp.Class');
            expect(window.Temp.Class === undefined).toBeTruthy();

        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });
    it('Can find a template by alias', function (done) {
        //Arrange
        MEPH.create('MEPH.input.Input').then(function ($class) {
            var result = new $class(),
                templateInfo;
            templateInfo = MEPH.getTemplate(result.alias);
            expect(templateInfo).toBeTruthy();

        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });

    it('create an instance of a class', function (done) {
        //Arrange

        //Act   
        MEPH.create('MEPH.control.Control').then(function () {
            var control = new MEPH.control.Control();
            expect(control).toBeTruthy();

        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });

    });

    it('add event listeners', function () {
        //Arrange
        var $classInstance = new Class();
        MEPH.Events($classInstance);
        //Act
        $classInstance.on('event', function () { });

        //Assert
        expect($classInstance[MEPH.listenersPropertyKey].length).toBeTruthy();
    });

    it('listen to event and fire event', function () {
        //Arrange
        var $classInstance = new Class(),
            called;
        MEPH.Events($classInstance);
        $classInstance.on('event', function () { called = true; });

        //Act
        $classInstance.fire('event', 1, 2, 3, 4);

        //Assert
        expect(called).toBeTruthy();
    });

    it('listeners can be removed', function () {
        //Arrange
        var $classInstance = new Class(),
            scope = {};
        MEPH.Events($classInstance);
        $classInstance.on('event', function () { }, scope);

        //Act
        $classInstance.un('event');

        //ASSERT
        expect($classInstance[MEPH.listenersPropertyKey].length === 0).toBeTruthy();
    });

    it('listeners can be removed by reference', function () {
        //Arrange
        var $classInstance = new Class(),
            scope = {};
        MEPH.Events($classInstance);
        $classInstance.on('e1', function () { }, scope);
        $classInstance.on('e2', function () { }, scope);

        //Act
        $classInstance.un(null, scope);

        //Assert
        expect($classInstance[MEPH.listenersPropertyKey].length === 0).toBeTruthy();
    });


    it('listeners can be removed by type', function () {
        //Arrange
        var $classInstance = new Class(),
            scope = {};
        MEPH.Events($classInstance);
        $classInstance.on('e1', function () { }, scope);
        $classInstance.on('e2', function () { }, scope);

        //Act
        $classInstance.un('e1');

        //Assert
        expect($classInstance[MEPH.listenersPropertyKey].length === 1).toBeTruthy();
    });

    it('can add a data-bind prefix', function () {
        //Arrange
        //There is a default prefix data-bind, it can not be removed.

        //Act
        MEPH.addDataBindPrefix('db');

        //Assert
        expect(MEPH.getDataBindPrefixes().length === 2);
        MEPH.removeDataBindPrefix('db');
    });

    it('can add a reverse data-bind-prefix', function () {
        //Arrange

        //Act
        MEPH.addReverseDataBindPrefx('rev-db');

        //Assert
        expect(MEPH.getReverseDataBindingPrefixes().length === 2);
        MEPH.addReverseDataBindPrefx('rev-db');
    });

    it('can add a event data-bind prefix', function () {
        //Arrange

        //Act
        MEPH.addEventDataBindingPrefixes('de-event');

        //Assert
        expect(MEPH.getEventDataBindingPrefixes().length === 2);
        MEPH.removeEventDataBindingPrefix('de-event');
    });


    it('can add a bind prefix shortcut', function () {
        //Arrange

        //Act
        MEPH.addBindPrefixShortCuts('c$', 'control');

        //Assert
        var controlPrefix = MEPH.getBindPrefixShortCuts().first(function (x) {
            return x.type === 'control';
        });
        expect(controlPrefix.prefix === 'c$').toBeTruthy();
    });

    it('can set the value at the end of a path', function () {
        //Arrange 
        var object = {
            prop: {
                prop1: null
            }
        }, result;

        //Act
        result = MEPH.setPathValue(object, 'prop.prop1', true);

        //Assert
        expect(result).toBeTruthy();
        expect(object.prop.prop1 === true).toBeTruthy();
    });


    it('will not set a prop if it doesnt exist', function () {
        //Arrange 
        var object = {
            prop: {
                prop1: null
            }
        }, result;

        //Act
        result = MEPH.setPathValue(object, 'prop.prop2.deep', true);

        //Assert
        expect(result === false).toBeTruthy();
    });

    it('an object can add a dom event listener ', function () {
        //Arrange
        var object = {},
            called,
            dom = document.createElement('div');
        MEPH.Events(object);

        //Act
        object.don('click', dom, function () { called = true; });
        dom.dispatchEvent(MEPH.createEvent('click', {}));

        //Assert
        expect(called).theTruth('The don function didnt put the event listener on correctly');

    });


    it('an object can REMOVE a dom event listener ', function () {
        //Arrange
        var object = {},
            called = false,
            dom = document.createElement('div');
        MEPH.Events(object);
        
        //Act
        object.don('click', dom, function () { called = true; });
        
        object.dun(object);
        dom.dispatchEvent(MEPH.createEvent('click', {}));

        //Assert
        expect(called == false).theTruth('The dun function didnt remove the event listener on correctly');

    });

    it(' objects can subscribe, publish, events', function () {
        //Arrange
        var called;

        //Act
        var id = MEPH.subscribe('subscribedevent', function () {
            called = true;
        }.bind({ scope: 'scope' }));
        MEPH.publish('subscribedevent', {});

        MEPH.unsubscribe(id);

        //Assert
        expect(called).theTruth('The subscribed event was not called');
    });
});
