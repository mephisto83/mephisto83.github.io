describe("MEPH/bind/Binder.spec.js", function () {

    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });
    var createDomObjectWithDataBind = function createDomObjectWithDataBind(nodeName, dataBindString) {
        var dom = document.createElement(nodeName);
        dom.setAttribute(MEPH.defaultDataBindString, dataBindString);
        return dom;
    }
    it("A binder can be created.", function (done) {
        //Arrange
        MEPH.create('MEPH.bind.Binder').then(function ($class) {
            try {

                //Act
                var binder = new $class();

                //Assert
                expect(binder).toBeTruthy();
            }
            catch (error) {
                throw error;
            }
            finally {
                done();
            }
        });
    });

    it('a binder can create a handler from an object with a dom object', function (done) {
        //Arrange
        var dom = createDomObjectWithDataBind('div', '"innerHTML":"c$.prop"'),
            object = {
                value: 'value',
                transform: null,
                transformAgain: null,
                getConnection: function (type) {
                    return object;
                },
                getReferenceConnections: function () {
                    return [{ type: 'control', obj: object }];
                },
                getConnectableTypes: function () {
                    return MEPH.Array([MEPH.control.Control.connectables.control, 'view']);
                }
            };
        MEPH.Events(object);
        MEPH.requires('MEPH.control.Control').then(function () {
            return MEPH.create('MEPH.bind.Binder').then(function ($class) {
                try {
                    var binder = new $class();
                    binder.bindObject(object, dom);
                }
                catch (error) {
                    expect(false).toBeTruthy();
                }
                finally {
                    done();
                }
            })
        });
    });

    it('a binder can bind dom-events to handleers', function (done) {
        //Arrange
        var dom = createDomObjectWithDataBind('div', '"innerHTML":"c$.prop"'),
            called = 0,
            object = {
                value: 'value',
                transform: null,
                transformAgain: null,
                clicked: function () {
                    called++;
                },
                getConnection: function (type) {
                    return object;
                },
                getReferenceConnections: function () {
                    return [{ type: 'control', obj: object }];
                },
                getConnectableTypes: function () {
                    return MEPH.Array([MEPH.control.Control.connectables.control, 'view']);
                }
            };
        dom.setAttribute('data-events', '"click" : "c$.clicked"');
        MEPH.Events(object);
        MEPH.create('MEPH.bind.Binder').then(function ($class) {
            try {
                var binder = new $class();
                binder.bindObject(object, dom);

                dom.dispatchEvent(MEPH.createEvent('click', {}));
                setTimeout(function () {
                    expect(called === 1).theTruth('The click should have been handled.');
                    done();
                }, 100);
            }
            catch (error) {
                expect(false).toBeTruthy();
            }
            finally {
            }
        });
    });

    it('a binder can bind dom-events and execute once', function (done) {
        //Arrange
        var dom = createDomObjectWithDataBind('div', '"innerHTML":"c$.prop"'),
            called = 0,
            object = {
                value: 'value',
                transform: null,
                transformAgain: null,
                clicked: function () {
                    called++;
                },
                getConnection: function (type) {
                    return object;
                },
                getReferenceConnections: function () {
                    return [{ type: 'control', obj: object }];
                },
                getConnectableTypes: function () {
                    return MEPH.Array([MEPH.control.Control.connectables.control, 'view']);
                }
            };
        dom.setAttribute('data-events', '"click" : "c$.clicked"');
        MEPH.Events(object);
        MEPH.create('MEPH.bind.Binder').then(function ($class) {
            try {
                var binder = new $class();
                binder.bindObject(object, dom);

                dom.dispatchEvent(MEPH.createEvent('click', {}));
                setTimeout(function () {
                    expect(called === 1).theTruth('The click should have been handled.');
                    done();
                }, 1000);
            }
            catch (error) {
                expect(false).toBeTruthy();
            }
            finally {
            }
        });
    });

    it('can collect all the custom alias tags a certain level down', function (done) {
        ///getSubObjects
        var dom = createDomObjectWithDataBind('div', '"innerHTML":"c$.prop"'),
            object = {};
        dom.innerHTML = '<div></div><div><m_input></m_input><div></div></div><m_input><m_input></m_input><div></div></m_input>'
        MEPH.create('MEPH.bind.Binder').then(function ($class) {
            try {
                var binder = new $class();
                var result = binder.getSubObjects(dom, 1);
                expect(result).toBeTruthy();
                expect(result.length === 2).toBeTruthy();
            }
            catch (error) {
                expect(false).toBeTruthy();
            }
            finally {
                done();
            }
        });
    });

    it('can collect all the dom objects which are not custom tags', function (done) {
        var dom = createDomObjectWithDataBind('div', '"innerHTML":"c$.prop"'),
            object = {};
        dom.innerHTML = '<div></div><div><m_input></m_input><div></div></div><m_input><div></div></m_input>'
        MEPH.create('MEPH.bind.Binder').then(function ($class) {
            try {
                var binder = new $class();
                var result = binder.getDomObjectsForBinding(dom);
                expect(result).toBeTruthy();
                expect(result.length === 4).toBeTruthy();
            }
            catch (error) {
                expect(false).toBeTruthy();
            }
            finally {
                done();
            }
        });
    });

    it('a binder can parse the data-bind attributes', function (done) {
        //Arrange
        var dom = createDomObjectWithDataBind('div', '"innerHTML":"c$.prop"'),
            object = {};
        MEPH.create('MEPH.bind.Binder').then(function ($class) {
            try {
                var binder = new $class();
                var result = binder.parseDomAttributes(dom);
                expect(result).toBeTruthy();
                expect(result.innerHTML).toBeTruthy();
                expect(result.innerHTML === 'c$.prop').toBeTruthy();
            }
            catch (error) {
                expect(false).toBeTruthy();
            }
            finally {
                done();
            }
        });
    });

    it('a binder can parse the data-bind attributes and data-bind-value', function (done) {
        //Arrange
        var dom = createDomObjectWithDataBind('div', '"innerHTML":"c$.prop"'),
            object = {};
        dom.setAttribute('data-bind-value', '"c$.value | c$.transform"');
        MEPH.create('MEPH.bind.Binder').then(function ($class) {
            try {
                var binder = new $class();
                var result = binder.parseDomAttributes(dom);
                expect(result).toBeTruthy();
                expect(result.innerHTML).toBeTruthy();
                expect(result.innerHTML === 'c$.prop').toBeTruthy();
                expect(result.value === '"c$.value | c$.transform"').toBeTruthy();
            }
            catch (error) {
                expect(false).toBeTruthy();
            }
            finally {
                done();
            }
        });
    });

    it('a binder can parse the data-bind attributes and meph-data-value', function (done) {
        //Arrange
        var dom = createDomObjectWithDataBind('div', '"innerHTML":"c$.prop"'),
            object = {};
        MEPH.addDataBindPrefix('meph-data');
        dom.setAttribute('meph-data-value', '"c$.transform"');
        MEPH.create('MEPH.bind.Binder').then(function ($class) {
            try {
                var binder = new $class();
                var result = binder.parseDomAttributes(dom);
                expect(result).toBeTruthy();
                expect(result.innerHTML).toBeTruthy();
                expect(result.innerHTML === 'c$.prop').toBeTruthy();
                expect(result.value === '"c$.transform"').toBeTruthy();
            }
            catch (error) {
                expect(false).toBeTruthy();
            }
            finally {
                done();
            }
        });
    });



    it('a binder can parse the data-bind attributes and data-bind-value and custom d-binder-tutut', function (done) {
        //Arrange
        var dom = createDomObjectWithDataBind('div', '"innerHTML":"c$.prop"'),
            object = {};
        MEPH.addDataBindPrefix('d-binder');
        dom.setAttribute('data-bind-value', 'c$.value | c$.transform');
        dom.setAttribute('d-binder-tutut', 'c$.value | c$.transform');
        MEPH.create('MEPH.bind.Binder').then(function ($class) {
            try {
                var binder = new $class();
                var result = binder.parseDomAttributes(dom);
                expect(result).toBeTruthy();
                expect(result.innerHTML).toBeTruthy();
                expect(result.innerHTML === 'c$.prop').toBeTruthy();
                expect(result.value === 'c$.value | c$.transform').toBeTruthy();
                expect(result.tutut === 'c$.value | c$.transform').toBeTruthy();
            }
            catch (error) {
                expect(false).toBeTruthy();
            }
            finally {
                done();
            }
        });
    });

    it('a binder will add a single listener for a property that should be monitored for binding', function (done) {
        //Arrange
        MEPH.requires('MEPH.control.Control').then(function () {
            var dom = createDomObjectWithDataBind('div', '"innerHTML":"c$.prop"'),
                propertyAltered,
                object = {
                    getConnection: function () { return object; },
                    getReferenceConnections: function () {
                        return [{ type: 'control', obj: object }];
                    },
                    getConnectableTypes: function () {
                        return MEPH.Array([MEPH.control.Control.connectables.control]);
                    }
                };
            MEPH.Events(object);
            MEPH.addDataBindPrefix('d-binder');
            dom.setAttribute('data-bind-value', 'c$.value | c$.transform');
            dom.setAttribute('d-binder-tutut', 'c$.value | c$.transform');
            MEPH.create('MEPH.bind.Binder').then(function ($class) {
                try {
                    var binder = new $class();
                    var result = binder.parseDomAttributes(dom);
                    binder.executeInstructions = function (prop, eventType, instruction, target) {
                        propertyAltered = true;
                    };
                    binder.addEventListeners(result, object, dom);
                    object.fire(MEPH.bind.Binder.events.altered, { path: 'prop' });
                    expect(propertyAltered).toBeTruthy();
                    MEPH.removeDataBindPrefix('d-binder');
                }
                catch (error) {
                    expect(false).toBeTruthy();
                }
                finally {
                    done();
                }
            });
        });
    });

    it('a binder can parse an instruction stirng ', function (done) {
        //Arrange
        var instructionstring = 'c$.value | c$.transform | c$.transformAgain';
        MEPH.create('MEPH.bind.Binder').then(function ($class) {
            try {
                var binder = new $class(),
                    result;
                result = binder.parseInstructionString(instructionstring);
                expect(result.length === 3).toBeTruthy();
            }
            catch (error) {
                expect(false).toBeTruthy();
            }
            finally {
                done();
            }

        });
    });

    it('a binder will execute an instruction chain', function (done) {
        //Arrange
        MEPH.requires('MEPH.control.Control').then(function () {
            var dom = createDomObjectWithDataBind('div', '"innerHTML":"c$.prop"'),
                propertyAltered,
                object = {
                    value: 'value',
                    transform: null,
                    transformAgain: null,
                    getConnection: function (type) {
                        return object;
                    },
                    getReferenceConnections: function () {
                        return [{ type: 'control', obj: object }];
                    },
                    getConnectableTypes: function () {
                        return MEPH.Array([MEPH.control.Control.connectables.control]);
                    }
                };
            MEPH.Events(object);
            MEPH.addDataBindPrefix('d-binder');
            dom.setAttribute('data-bind-value', 'c$.value | c$.transform');
            dom.setAttribute('d-binder-tutut', 'c$.value | c$.transform');
            MEPH.create('MEPH.bind.Binder').then(function ($class) {
                try {
                    var binder = new $class(),
                        instructionstring,
                        instructions;
                    instructionstring = 'c$.value | c$.transform | c$.transformAgain';
                    instructions = binder.parseInstructionString(instructionstring);

                    //Act
                    binder.executeInstructions(dom, 'value', 'Changed', instructions, object, 'value')
                    .then(function () {
                        try {
                            //Assert
                            expect(object.transformAgain === 'value').toBeTruthy();
                        }
                        catch (error) {
                            expect(false).toBeTruthy();
                        }
                        finally {
                            done();
                        }
                    });
                }
                catch (error) {
                    expect(false).toBeTruthy();
                    done();
                }
                finally {
                }
            });
        });
    });

    it('a binder will execute an instruction chain accross objects', function (done) {
        //Arrange
        MEPH.requires('MEPH.control.Control').then(function () {
            var dom = createDomObjectWithDataBind('div', '"innerHTML":"c$.prop"'),
                propertyAltered,
                view = {
                    value: 'value'
                },
                object = {
                    value: 'value',
                    transform: null,
                    transformAgain: null,
                    getConnection: function (type) {
                        if (type === 'view') {
                            return view;
                        }
                        else {
                            return object;
                        }
                    },
                    getReferenceConnections: function () {
                        return [{ type: 'control', obj: object }];
                    },
                    getConnectableTypes: function () {
                        return MEPH.Array([MEPH.control.Control.connectables.control, 'view']);
                    }
                };
            MEPH.Events(view);
            MEPH.Events(object);
            MEPH.addDataBindPrefix('d-binder');
            MEPH.addBindPrefixShortCuts('v$', 'view');
            dom.setAttribute('data-bind-value', 'c$.value | c$.transform');
            dom.setAttribute('d-binder-tutut', 'c$.value | c$.transform');
            MEPH.create('MEPH.bind.Binder').then(function ($class) {
                try {
                    var binder = new $class(),
                        instructionstring,
                        instructions;
                    instructionstring = 'c$.value | v$.value | c$.transformAgain';
                    instructions = binder.parseInstructionString(instructionstring);

                    //Act
                    binder.executeInstructions(dom, 'value', 'altered', instructions, object, 'value')
                    .then(function () {
                        try {
                            //Assert
                            expect(object.transformAgain === 'value').toBeTruthy();
                            expect(object.value === 'value').toBeTruthy();
                        }
                        catch (error) {
                            expect(false).toBeTruthy();
                        }
                        finally {
                            done();
                        }
                    });
                }
                catch (error) {
                    expect(false).toBeTruthy();
                    done();
                }
                finally {
                }
            });
        });
    });

    it('a binder will execute an instruction chain accross objects with deep objects', function (done) {
        //Arrange
        MEPH.requires('MEPH.control.Control').then(function () {
            var dom = createDomObjectWithDataBind('div', '"innerHTML":"c$.prop"'),
                propertyAltered,
                view = {
                    value: 'value'
                },
                object = {
                    value: { prop: 'newvalue' },
                    transform: null,
                    transformAgain: null,
                    getConnection: function (type) {
                        if (type === 'view') {
                            return view;
                        }
                        else {
                            return object;
                        }
                    },
                    getConnectableTypes: function () {
                        return MEPH.Array([MEPH.control.Control.connectables.control, 'view']);
                    }
                };
            MEPH.Events(view);
            MEPH.Events(object);
            MEPH.addDataBindPrefix('d-binder');
            MEPH.addBindPrefixShortCuts('v$', 'view');
            dom.setAttribute('data-bind-value', 'c$.value.prop | c$.transform');
            dom.setAttribute('d-binder-tutut', 'c$.value.prop | c$.transform');
            MEPH.create('MEPH.bind.Binder').then(function ($class) {
                try {
                    var binder = new $class(),
                        instructionstring,
                        instructions;
                    instructionstring = 'c$.value.prop | v$.value | c$.transformAgain';
                    instructions = binder.parseInstructionString(instructionstring);

                    //Act
                    binder.executeInstructions(dom, 'value.prop', 'altered', instructions, object, 'value')
                    .then(function () {
                        try {
                            //Assert
                            expect(object.transformAgain === 'newvalue').toBeTruthy();
                            expect(object.value.prop === 'newvalue').toBeTruthy();
                        }
                        catch (error) {
                            expect(false).toBeTruthy();
                        }
                        finally {
                            done();
                        }
                    });
                }
                catch (error) {
                    expect(false).toBeTruthy();
                    done();
                }
                finally {
                }
            });
        });
    });


    it('a binder will execute an instruction chain accross objects with deep objects,' +
        ' and when reference objects are set new the corresponding changes will follow.', function (done) {
            //Arrange
            MEPH.requires('MEPH.control.Control').then(function () {
                var dom = createDomObjectWithDataBind('div', '"innerHTML":"c$.prop"'),
                    propertyAltered,
                    view = {
                        value: 'value'
                    },
                    object = {
                        value: { prop: 'newvalue' },
                        transform: null,
                        transformAgain: null,
                        getConnection: function (type) {
                            if (type === 'view') {
                                return view;
                            }
                            else {
                                return object;
                            }
                        },
                        getConnectableTypes: function () {
                            return MEPH.Array([MEPH.control.Control.connectables.control, 'view']);
                        }
                    };
                MEPH.Events(view);
                MEPH.Events(object);
                MEPH.addDataBindPrefix('d-binder');
                MEPH.addBindPrefixShortCuts('v$', 'view');
                dom.setAttribute('data-bind-value', 'c$.value.prop | c$.transform');
                dom.setAttribute('d-binder-tutut', 'c$.value.prop | c$.transform');
                MEPH.create('MEPH.bind.Binder').then(function ($class) {
                    try {
                        var binder = new $class(),
                            instructionstring,
                            instructions;
                        instructionstring = 'c$.value.prop | v$.value | c$.transformAgain';
                        instructions = binder.parseInstructionString(instructionstring);

                        //Act
                        binder.executeInstructions(dom, 'value', 'Changed', instructions, object, 'value')
                        .then(function () {
                            try {
                                //Assert
                                expect(object.transformAgain === 'newvalue').toBeTruthy();
                                expect(object.value.prop === 'newvalue').toBeTruthy();
                            }
                            catch (error) {
                                expect(false).toBeTruthy();
                            }
                            finally {
                                done();
                            }
                        });
                    }
                    catch (error) {
                        expect(false).toBeTruthy();
                        done();
                    }
                    finally {
                    }
                });
            });
        });
    it('a binder will execute an instruction if there is an invalid property chain an error will be thrown', function (done) {
        //Arrange
        MEPH.requires('MEPH.control.Control').then(function () {
            var dom = createDomObjectWithDataBind('div', '"innerHTML":"c$.prop"'),
                propertyAltered,
                view = {
                    value: 'value'
                },
                object = {
                    transform: null,
                    transformAgain: null,
                    getConnection: function (type) {
                        if (type === 'view') {
                            return view;
                        }
                        else {
                            return object;
                        }
                    },
                    getConnectableTypes: function () {
                        return MEPH.Array([MEPH.control.Control.connectables.control, 'view']);
                    }
                };
            MEPH.Events(view);
            MEPH.Events(object);
            MEPH.addDataBindPrefix('d-binder');
            MEPH.addBindPrefixShortCuts('v$', 'view');
            dom.setAttribute('data-bind-value', 'c$.value.prop | c$.transform');
            dom.setAttribute('d-binder-tutut', 'c$.value.prop | c$.transform');
            MEPH.create('MEPH.bind.Binder').then(function ($class) {
                try {
                    var binder = new $class(),
                        instructionstring,
                        errorthrown,
                        instructions;
                    instructionstring = 'c$.value.prop | v$.value | c$.transformAgain';
                    instructions = binder.parseInstructionString(instructionstring);

                    //Act
                    binder.executeInstructions(dom, 'value', 'Changed', instructions, object, 'value')
                        .catch(function (error) {
                            errorthrown = true;
                        })
                        .then(function (result) {
                            try {
                                //Assert
                                expect(errorthrown).toBeTruthy();
                                expect(object.transformAgain === null).toBeTruthy();
                                expect(object.value === undefined).toBeTruthy();
                            }
                            catch (error) {
                                expect(false).toBeTruthy();
                            }
                            finally {
                                done();
                            }
                        });
                }
                catch (error) {
                    expect(false).toBeTruthy();
                    done();
                }
                finally {
                }
            });
        });
    });

    it('a binder can set the value on a dom object', function (done) {
        //Arrange
        var dom = createDomObjectWithDataBind('div', '"innerHTML":"c$.prop"');
        MEPH.create('MEPH.bind.Binder').then(function ($class) {
            try {
                var binder = new $class();
                binder.setValueOnDom('innerHTML', dom, 'innerHTML');
                expect(dom.innerHTML === 'innerHTML').toBeTruthy();
            }
            catch (error) {
                expect(false).toBeTruthy();
            }
            finally {
                done();
            }
        });
    });

    it('a binder can set the value on a dom object class', function (done) {
        //Arrange
        var dom = createDomObjectWithDataBind('div', '"innerHTML":"c$.prop"');
        MEPH.create('MEPH.bind.Binder').then(function ($class) {
            try {
                var binder = new $class();
                binder.setValueOnDom('class1 class2', dom, 'class');
                expect(dom.classList.contains('class1')).toBeTruthy();
                expect(dom.classList.contains('class2')).toBeTruthy();
            }
            catch (error) {
                expect(false).toBeTruthy();
            }
            finally {
                done();
            }
        });
    });


    it('a control can bind to events on custom controls', function (done) {
        //Arrange
        var dom = createDomObjectWithDataBind('div', '');
        helperCompositeNode = ' <helpercomposite mephid="helperComposite"' +
        ' data-bind=\'"helperCompositeProperty" : "c$.deepHelperProperty"\'' +
        ' mephuniqueid="f6f0b8c8-ac52-401c-b2ec-e0adaec4e963">' +
        '</helpercomposite>';
        dom.innerHTML = helperCompositeNode,
        helperCompositeNode = dom.firstElementChild;

        MEPH.requires('MEPH.bind.Binder',
            'MEPHTests.helper.composite.DeepHelperComposite',
            'MEPHTests.helper.composite.HelperComposite').then(function () {
                try {
                    var dhc = new MEPHTests.helper.composite.DeepHelperComposite(),
                    hc = new MEPHTests.helper.composite.HelperComposite();

                    MEPH.Binder.bindControl(dhc, hc, helperCompositeNode);

                    //Act
                    var teep = dhc.deepHelperProperty = 'prop';

                    //Assert
                    setTimeout(function () {
                        expect(hc.helperCompositeProperty === 'prop').theTruth('helperCompositeProperty didnt propogate to the deepHelperProperty');
                        done();
                    }, 100);
                }
                catch (error) {
                    expect(error).caught();
                }
                finally {
                }
            });
    });

    it('can parse instructions for subcontrols', function (done) {
        //Arrange
        MEPH.requires('MEPH.bind.Binder',
            'MEPHTests.helper.composite.DeepHelperComposite',
            'MEPHTests.helper.composite.HelperComposite').then(function () {
                try {

                    var dhc = new MEPHTests.helper.composite.DeepHelperComposite(),
                        instruction,
                        parsedInstruction,
                        hc = new MEPHTests.helper.composite.HelperComposite();

                    hc.setUniqueId(MEPH.GUID());

                    shorcut = MEPH.getBindPrefixShortCuts().first(function (x) {
                        return x.type === 'subcontrol';
                    });

                    instruction = shorcut.prefix + hc.getUniqueId() + '.helperCompositeProperty';

                    //Act    
                    parsedInstruction = MEPH.Binder.parseInstructionString(instruction)[0]

                    //Assert
                    expect(parsedInstruction.shortCut.prefix === shorcut.prefix);
                    expect(parsedInstruction.path.join('.') === shorcut.prefix + '.helperCompositeProperty');
                    expect(parsedInstruction.uniqueId === hc.getUniqueId());

                }
                catch (error) {
                    expect(error).caught();
                }
                finally {
                    done();
                }
            });
    });
    it(' can parse push instructions from dom objects', function (done) {
        //Arrange
        var dom = createDomObjectWithDataBind('div', '');
        helperCompositeNode = ' <helpercomposite mephid="helperComposite"' +
        ' data-push=\'"helperCompositeProperty" : "s$.deepHelperProperty"\'' +
        ' mephuniqueid="f6f0b8c8-ac52-401c-b2ec-e0adaec4e963">' +
        '</helpercomposite>';
        dom.innerHTML = helperCompositeNode,
        helperCompositeNode = dom.firstElementChild;

        MEPH.requires('MEPH.bind.Binder').then(function () {
            try {
                //Act
                var parsedInstruction = MEPH.Binder.parseDomAttributes(helperCompositeNode, MEPH.getReverseDataBindingPrefixes(), MEPH.defaultReversePrefix);

                //Assert
                expect(parsedInstruction.helperCompositeProperty === 's$.deepHelperProperty').theTruth('the parsed reverse binding was not correct : ' + parsedInstruction.helperCompositeProperty);;
            }
            catch (error) {
                expect(error).caught();
            }
            finally {
                done();
            }
        });
    });


    it(' can parse data-event attributes on a dom object', function (done) {
        //Arrange
        var dom = createDomObjectWithDataBind('div', '');
        helperCompositeNode = ' <helpercomposite mephid="helperComposite"' +
        ' data-events=\'"click" : "c$.function"\'' +
        ' mephuniqueid="f6f0b8c8-ac52-401c-b2ec-e0adaec4e963">' +
        '</helpercomposite>';
        dom.innerHTML = helperCompositeNode,
        helperCompositeNode = dom.firstElementChild;

        MEPH.requires('MEPH.bind.Binder').then(function () {
            try {
                //Act
                var parsedInstruction = MEPH.Binder.parseDomAttributes(helperCompositeNode, MEPH.getEventDataBindingPrefixes(), MEPH.defaultEventPrefix);

                //Assert
                expect(parsedInstruction.click === 'c$.function').theTruth('the parsed event was not correct : ' + parsedInstruction.click);
            }
            catch (error) {
                expect(error).caught();
            }
            finally {
                done();
            }
        });
    });

    it('when a click event occurs, the clicked function will get called. ', function (done) {
        //Arrange
        var dom = createDomObjectWithDataBind('div', '');
        helperCompositeNode = ' <helpercomposite mephid="helperComposite"' +
        ' data-events=\'"click" : "c$.function"\'' +
        ' mephuniqueid="f6f0b8c8-ac52-401c-b2ec-e0adaec4e963">' +
        '</helpercomposite>';
        dom.innerHTML = helperCompositeNode,
        helperCompositeNode = dom.firstElementChild;


        MEPH.requires('MEPH.bind.Binder',
             'MEPHTests.helper.composite.DeepHelperComposite',
             'MEPHTests.helper.composite.HelperComposite').then(function () {
                 try {

                     var dhc = new MEPHTests.helper.composite.DeepHelperComposite(),
                         called,
                         hc = new MEPHTests.helper.composite.HelperComposite();
                     hc.setUniqueId(MEPH.GUID());
                     dhc.function = function () {
                         called = true;
                     }
                     //Act    
                     MEPH.Binder.bindDomControl({
                         classInstance: dhc
                     }, {
                         classInstance: hc,
                         templateNode: MEPH.Array([helperCompositeNode])
                     }, helperCompositeNode);

                     helperCompositeNode.dispatchEvent(MEPH.createEvent('click', {}));
                     //Assert
                     setTimeout(function () {
                         expect(called).theTruth('the click event was not propogated to the parent node');
                         done();
                     }, 10);

                 }
                 catch (error) {
                     expect(error).caught();
                 }
                 finally {
                 }
             });
    });

    it('when a click event occurs, the clicked function will get called. with meph-event-click', function (done) {
        //Arrange
        var dom = createDomObjectWithDataBind('div', '');
        helperCompositeNode = ' <helpercomposite mephid="helperComposite"' +
        ' meph-event-click="c$.function"' +
        ' mephuniqueid="f6f0b8c8-ac52-401c-b2ec-e0adaec4e963">' +
        '</helpercomposite>';
        dom.innerHTML = helperCompositeNode,
        helperCompositeNode = dom.firstElementChild;


        MEPH.requires('MEPH.bind.Binder',
             'MEPHTests.helper.composite.DeepHelperComposite',
             'MEPHTests.helper.composite.HelperComposite').then(function () {
                 try {
                     var dhc = new MEPHTests.helper.composite.DeepHelperComposite(),
                         called,
                         hc = new MEPHTests.helper.composite.HelperComposite();
                     hc.setUniqueId(MEPH.GUID());
                     dhc.function = function () {
                         called = true;
                     }
                     MEPH.addEventDataBindingPrefixes('meph-event');
                     //Act    
                     MEPH.Binder.bindDomControl({
                         classInstance: dhc
                     }, {
                         classInstance: hc,
                         templateNode: MEPH.Array([helperCompositeNode])
                     }, helperCompositeNode);

                     helperCompositeNode.dispatchEvent(MEPH.createEvent('click', {}));
                     //Assert
                     setTimeout(function () {
                         expect(called).theTruth('the click event was not propogated to the parent node');
                         done();
                     }, 10);

                 }
                 catch (error) {
                     expect(error).caught();
                 }
                 finally {
                 }
             });
    });


    it('when a click event occurs, a series of functions are called . ', function (done) {
        //Arrange
        var dom = createDomObjectWithDataBind('div', '');
        helperCompositeNode = ' <helpercomposite mephid="helperComposite"' +
        ' data-events=\'"click" : "c$.function | c$.function |c$.function |c$.function "\'' +
        ' mephuniqueid="f6f0b8c8-ac52-401c-b2ec-e0adaec4e963">' +
        '</helpercomposite>';
        dom.innerHTML = helperCompositeNode,
        helperCompositeNode = dom.firstElementChild;


        MEPH.requires('MEPH.bind.Binder',
             'MEPHTests.helper.composite.DeepHelperComposite',
             'MEPHTests.helper.composite.HelperComposite').then(function () {
                 try {

                     var dhc = new MEPHTests.helper.composite.DeepHelperComposite(),
                         called = 0,
                         hc = new MEPHTests.helper.composite.HelperComposite();
                     hc.setUniqueId(MEPH.GUID());
                     dhc.function = function () {
                         called++;
                     }
                     //Act    
                     MEPH.Binder.bindDomControl({
                         classInstance: dhc
                     }, {
                         classInstance: hc,
                         templateNode: MEPH.Array([helperCompositeNode])
                     }, helperCompositeNode);

                     helperCompositeNode.dispatchEvent(MEPH.createEvent('click', {}));
                     //Assert
                     setTimeout(function () {
                         expect(called === 4).theTruth('the functions were executed the wrong number of times : ' + called);
                         done();
                     }, 10);

                 }
                 catch (error) {
                     expect(error).caught();
                 }
                 finally {
                 }
             });
    });


    it('will reverse the instructions when there are no pipes in the instructions', function (done) {
        MEPH.requires('MEPH.bind.Binder',
            'MEPHTests.helper.composite.DeepHelperComposite',
            'MEPHTests.helper.composite.HelperComposite').then(function () {
                try {

                    var dhc = new MEPHTests.helper.composite.DeepHelperComposite(),
                    hc = new MEPHTests.helper.composite.HelperComposite();
                    hc.setUniqueId(MEPH.GUID());
                    //Act    
                    var reversedInstructions = MEPH.Binder.reverseInstructions({
                        helperCompositeProperty: "c$.deepHelperProperty",
                        property: "c$.holwa.asdf"
                    }, dhc, hc);

                    //Assert
                    expect(reversedInstructions.deepHelperProperty === 's$' + '.helperCompositeProperty');

                }
                catch (error) {
                    expect(error).caught();
                }
                finally {
                    done();
                }
            });
    });


    it('a binder will be able to prune the bindingInformation specifically for a presenter/control/viewmodel/view', function (done) {
        //Arrange
        var transform = 'transform';
        MEPH.requires('MEPH.control.Control').then(function () {
            var dom = createDomObjectWithDataBind('div', '"innerHTML":"c$.value | c$.transform"');

            MEPH.create('MEPH.bind.Binder').then(function ($class) {
                try {
                    var binder = new $class(),
                        controlTrimInstructions,
                        presenterTrimmedInstructions,
                        bindingInformation;

                    bindingInformation = binder.parseDomAttributes(dom);

                    //Act
                    controlTrimInstructions = binder.trimInstructions(bindingInformation, 'control');
                    presenterTrimmedInstructions = binder.trimInstructions(bindingInformation, 'presenter');

                    //Assert
                    expect(controlTrimInstructions).theTruth('Nothing was returned.');
                    if (controlTrimInstructions) {
                        expect(controlTrimInstructions).theTruth('Nothing was returned.');
                    }
                    expect(presenterTrimmedInstructions === false).theTruth('the presenter returned instructions when it shouldnt');
                }
                catch (error) {
                    expect(error).caught();
                }
                finally {
                    done();
                }
            });
        });
    });


    it('a binder can parse an instruction string with parameters', function (done) {
        var instructionstring = 'c$.value | c$.transform, c$.param1, c$.param2 | c$.transformgain';
        MEPH.create('MEPH.bind.Binder').then(function ($class) {
            var binder = new $class(), result;
            result = binder.parseInstructionString(instructionstring);
            expect(result.length === 3).toBeTruthy();
            expect(result.nth(2).params.length === 2).toBeTruthy();
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });

    it('a binder will execute an instruction chain, and parameters will passed along .', function (done) {
        //Arrange
        MEPH.requires('MEPH.control.Control').then(function () {
            var passedvalues, dom = createDomObjectWithDataBind('div', '"innerHTML":"c$.prop"'),
                propertyAltered,
                object = {
                    value: 'value',
                    transform: function (p, p2) { passedvalues = [p, p2]; return p; },
                    transformAgain: null,
                    getConnection: function (type) {
                        return object;
                    },
                    getConnectableTypes: function () {
                        return MEPH.Array([MEPH.control.Control.connectables.control]);
                    }
                };
            MEPH.Events(object);
            MEPH.addDataBindPrefix('d-binder');
            dom.setAttribute('data-bind-value', 'c$.value | c$.transform');
            dom.setAttribute('d-binder-tutut', 'c$.value | c$.transform');
            return MEPH.create('MEPH.bind.Binder').then(function ($class) {
                var binder = new $class(),
                    instructionstring,
                    instructions;
                instructionstring = 'c$.value | c$.transform, param1, param2 | c$.transformAgain';
                instructions = binder.parseInstructionString(instructionstring);

                //Act
                return binder.executeInstructions(dom, 'value', 'Changed', instructions, object, 'value')
                   .then(function () {
                       //Assert
                       expect(passedvalues.first() === 'param1').toBeTruthy();
                       expect(passedvalues.nth(2) === 'param2').toBeTruthy();
                       expect(object.transformAgain === 'param1').toBeTruthy();

                   });

            })
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });;
    });

    it('a binder will execute an instruction chain, and parameters will passed along, even if the are also binding parameters .', function (done) {
        //Arrange
        MEPH.requires('MEPH.control.Control').then(function () {
            var passedvalues, dom = createDomObjectWithDataBind('div', '"innerHTML":"c$.prop"'),
                propertyAltered,
                object = {
                    value: 'value',
                    anotherparam: 123,
                    transform: function (p, p2) { passedvalues = [p, p2]; return p; },
                    transformAgain: null,
                    getConnection: function (type) {
                        return object;
                    },
                    getConnectableTypes: function () {
                        return MEPH.Array([MEPH.control.Control.connectables.control]);
                    }
                };
            MEPH.Events(object);
            MEPH.addDataBindPrefix('d-binder');
            dom.setAttribute('data-bind-value', 'c$.value | c$.transform');
            dom.setAttribute('d-binder-tutut', 'c$.value | c$.transform');
            return MEPH.create('MEPH.bind.Binder').then(function ($class) {
                var binder = new $class(),
                    instructionstring,
                    instructions;
                instructionstring = 'c$.value | c$.transform, c$.anotherparam, param2 | c$.transformAgain';
                instructions = binder.parseInstructionString(instructionstring);

                //Act
                return binder.executeInstructions(dom, 'value', 'Changed', instructions, object, 'value')
                   .then(function () {
                       //Assert
                       expect(passedvalues.first() === 123).toBeTruthy();
                       expect(passedvalues.nth(2) === 'param2').toBeTruthy();
                       expect(object.transformAgain === 123).toBeTruthy();

                   });

            })
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });;
    });


    it('a control can have attributes on a custom tag that will be bound ie; <custom customAttr="p$.value"></custom', function (done) {
        //Arrange
        MEPH.requires('MEPH.control.Control', 'MEPH.bind.Binder').then(function () {
            var dom = createDomObjectWithDataBind('custom', ''),
                binder = new MEPH.bind.Binder(), result,
                object = {
                    getListOfTransferableAttributes: function () {
                        return MEPH.Array([{ name: 'customAttr', options: {} }])
                    }
                };
            dom.setAttribute('customAttr', 'p$.value');

            result = binder.parseDomAttributes(dom, null, null, object);
            expect(result).theTruth('parsing didnt work as expected');
            expect(result.customAttr).theTruth('parsing didnt yield a customAttr rule');

        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });

    it('a control can have properties that will automatically be bound ' +
        'also when another is present ie <custom value="m$.value"></custom> will have a property m$. isValidatable.value', function (done) {
            //Arrange
            MEPH.requires('MEPH.control.Control', 'MEPH.bind.Binder').then(function () {
                var dom = createDomObjectWithDataBind('custom', ''),
                    binder = new MEPH.bind.Binder(), result,
                    object = {
                        getListOfTransferableAttributes: function () {
                            return ([{ name: 'customAttr', options: {} }])
                        },
                        getAutoBindPropertyPath: function (path) {
                            return path;
                        },
                        getAutoBindProperties: function () {
                            return [{ property: 'customAttr', path: 'p$. isValidatable.value', autoProperty: 'invalid' }];
                        }
                    };
                dom.setAttribute('customAttr', 'p$.value');

                result = binder.parseDomAttributes(dom, null, null, object);
                expect(result).theTruth('parsing didnt work as expected');
                expect(result['invalid']).theTruth('parsing didnt yield a customAttr rule');

            }).catch(function (error) {
                expect(error).caught();
            }).then(function () {
                done();
            });
        });


    it('a binder will execute an instruction chain accross objects and with functions', function (done) {
        //Arrange
        var transform = 'transform';
        MEPH.requires('MEPH.control.Control').then(function () {
            var dom = createDomObjectWithDataBind('div', '"innerHTML":"c$.prop"'),
                propertyAltered,
                view = {
                    valueAfter: null,
                    value: 'value',
                    func: function (val) {
                        return val + transform
                    }
                },
                object = {
                    value: 'value',
                    transform: null,
                    transformAgain: null,
                    getConnection: function (type) {
                        if (type === 'view') {
                            return view;
                        }
                        else {
                            return object;
                        }
                    },
                    getConnectableTypes: function () {
                        return MEPH.Array([MEPH.control.Control.connectables.control, 'view']);
                    }
                };
            MEPH.Events(view);
            MEPH.Events(object);
            MEPH.addDataBindPrefix('d-binder');
            MEPH.addBindPrefixShortCuts('v$', 'view');
            dom.setAttribute('data-bind-value', 'c$.value | c$.transform');
            dom.setAttribute('d-binder-tutut', 'c$.value | c$.transform');
            MEPH.create('MEPH.bind.Binder').then(function ($class) {
                try {
                    var binder = new $class(),
                        instructionstring,
                        instructions;
                    instructionstring = 'c$.value | v$.value | v$.func | v$.valueAfter | c$.transformAgain';
                    instructions = binder.parseInstructionString(instructionstring);

                    //Act
                    binder.executeInstructions(dom, 'value', 'Changed', instructions, object, 'path')
                    .then(function () {
                        try {
                            //Assert
                            expect(object.transformAgain === 'value' + transform).toBeTruthy();
                            expect(object.value === 'value').toBeTruthy();
                            expect(view.valueAfter = 'value' + transform).toBeTruthy();
                        }
                        catch (error) {
                            expect(false).toBeTruthy();
                        }
                        finally {
                            done();
                        }
                    });
                }
                catch (error) {
                    expect(false).toBeTruthy();
                    done();
                }
                finally {
                }
            });
        });
    });
});