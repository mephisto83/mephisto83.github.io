describe("MEPH/dom/ControlLoader.spec.js", function () {
    var createDomObjects = function (node) {
        var dom = document.createElement(node);
        return dom;
    };

    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });

    it('will load controls from the nodes', function (done) {
        ///Arrange
        var nodes = [].interpolate(0, 10, function (i) {
            return { node: createDomObjects('m_input'), alias: 'm_input' };
        });
        MEPH.create('MEPH.input.Input').then(function ($class) {
            return MEPH.create('MEPH.dom.ControlLoader')
        }).then(function ($class) {
            //Act
            var loader = new $class();
            return Promise.resolve().then(function () {
                return loader.loadControls(nodes)
            }).then(function (controls) {
                try {
                    expect(controls).toBeTruthy();
                    expect(controls.length === 10).toBeTruthy();
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
    it('will load controls from the node, then generate bound controls', function (done) {
        ///Arrange
        var nodes = [].interpolate(0, 10, function (i) {
            return { node: createDomObjects('m_input'), alias: 'm_input' };
        });
        MEPH.create('MEPH.input.Input').then(function ($class) {
            return MEPH.create('MEPH.dom.ControlLoader')
        }).then(function ($class) {
            //Act
            var loader = new $class();
            return loader.loadControls(nodes)
        }).then(function (packages) {
            var loader = new MEPH.dom.ControlLoader();
            return loader.generateBoundControls(packages);
        }).then(function (controls) {
            try {
                expect(controls).toBeTruthy();
                expect(controls.length === 10).toBeTruthy();
            }
            catch (error) {
                expect(error).caught();
            }
            finally {
                done();
            }
        });
    });

    it('can get all the ref from the node', function (done) {
        var dom = createDomObjects('deephelpercomposite');
        dom.setAttribute('ref-controller', 'value1');
        dom.setAttribute('ref-something', 'value2');
        MEPH.create('MEPH.dom.ControlLoader').then(function ($class) {
            var loader = new $class();
            var references = loader.getNodeInstanceReferences(dom);

            expect(references).toBeTruthy();;
            expect(references.length === 2).toBeTruthy();
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });

    it('when a control is being loaded, events will fire at key points in the process', function (done) {
        ///Arrange
        var classInstances = [],
            initted = 0,
            setdomtemplate = 0,
            subcontrolsloaded = 0,
            referencesbound = 0,
            nodes = [].interpolate(0, 2, function (i) {
                return { node: createDomObjects('deephelpercomposite'), alias: 'deephelpercomposite' };
            });
        MEPH.requires('MEPHTests.helper.Application').then(function () {
            return MEPH.create('MEPHTests.helper.composite.DeepHelperComposite').then(function ($class) {
                return MEPH.create('MEPH.dom.ControlLoader')
            }).then(function ($class) {
                //Act
                var loader = new $class();

                var app = new MEPHTests.helper.Application();
                app.on('controladded', function (type, control) {
                    classInstances.push(control);
                    control.on('init', function () {
                        initted++;
                    });
                    control.on('setdomtemplate', function () {
                        setdomtemplate++;
                    });
                    control.on('referencesbound', function () {
                        referencesbound++;
                    });

                });
                return loader.loadControls(nodes, null, app)
            }).then(function (packages) {
                var loader = new MEPH.dom.ControlLoader();
                return loader.generateBoundControls(packages);
            }).then(function (controls) {
                try {
                    expect(controls).toBeTruthy();
                    expect(controls.length).toBeTruthy();
                    expect(initted == 2).theTruth('The controls didnt fire init event');
                    expect(setdomtemplate).theTruth('The controls didnt fire setdomtemplate event');
                    expect(referencesbound).theTruth('The controls didnt fire referencesbound event');
                }
                catch (error) {
                    expect(error).caught();
                }
                finally {
                    done();
                }
            });
        }).catch(function () {
            expect(new Error('something went wrong')).caught();
            done();
        });
    });


    it('will load controls from the node, then generate bound controls, then process sub composite controls and bind.', function (done) {
        ///Arrange
        var nodes = [].interpolate(0, 10, function (i) {
            return { node: createDomObjects('m_input'), alias: 'm_input' };
        });
        MEPH.create('MEPH.input.Input').then(function ($class) {
            return MEPH.create('MEPH.dom.ControlLoader')
        }).then(function ($class) {
            //Act
            var loader = new $class();
            return loader.loadControls(nodes)
        }).then(function (packages) {
            var loader = new MEPH.dom.ControlLoader();
            return loader.generateBoundControls(packages);
        }).then(function (controls) {
            var loader = new MEPH.dom.ControlLoader();
            return loader.loadSubControls(controls);
        }).then(function (controls) {
            expect(controls).toBeTruthy();
            expect(controls.length === 10).toBeTruthy();

        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });
    it('will load MEPHTests.helper.composite.HelperComposite controls from the node, then generate bound controls, then process sub composite controls and bind.', function (done) {
        ///Arrange
        var nodes = [].interpolate(0, 2, function (i) {
            return { node: createDomObjects('helpercomposite'), alias: 'helpercomposite' };
        });
        MEPH.requires('MEPHTests.helper.composite.HelperComposite', 'MEPH.dom.ControlLoader')
        .then(function () {
            //Act
            var loader = new MEPH.dom.ControlLoader();
            return loader.loadControls(nodes)
        }).then(function (packages) {
            var loader = new MEPH.dom.ControlLoader();
            return loader.generateBoundControls(packages);
        }).then(function (controls) {
            var loader = new MEPH.dom.ControlLoader();
            return loader.loadSubControls(controls);
        }).then(function (controls) {
            try {
                expect(controls).toBeTruthy();
                expect(controls.length === 2).toBeTruthy();
            }
            catch (error) {
                expect(error).caught();
            }
            finally {
                done();
            }
        });
    });

    it(' controls will be loaded into the a specific area specified by a control, otherwise internal items of the dom will be ignored.', function (done) {
        ///Arrange
        var nodes = [].interpolate(0, 2, function (i) {
            return { node: createDomObjects('mephtests_view_view'), alias: 'mephtests_view_view' };
        }).foreach(function (x) {
            x.node.innerHTML = '<div class="internal">Internal</div>';
        });;

        MEPH.requires('MEPHTests.helper.view.View', 'MEPH.dom.ControlLoader').then(function () {
            //Act
            var loader = new MEPH.dom.ControlLoader();
            return loader.loadControls(nodes);
        }).then(function (packages) {
            var loader = new MEPH.dom.ControlLoader();
            return loader.generateBoundControls(packages);
        }).then(function (controls) {
            var loader = new MEPH.dom.ControlLoader();
            return loader.loadSubControls(controls);
        }).then(function (controls) {
            try {
                var internal,
                    control = controls.first().classInstance.getDomTemplate().first(function (x) {
                        return x.querySelector('.defaultLocation');
                    });
                expect(control).theTruth('no control was found');
                if (control) {
                    internal = control.querySelector('.internal');
                    expect(internal).theTruth('No items were injected in to the control');
                }
            }
            finally {
                done();
            }
        }).catch(function () {
            expect(new Error('something when wrong while trying to inject an item')).caught();
        });
    })

    it('can load controls more than 2 levels deep', function (done) {
        ///Arrange
        var nodes = [].interpolate(0, 2, function (i) {
            return {
                node: createDomObjects('deephelpercomposite'),
                alias: 'deephelpercomposite'
            };
        });
        MEPH.requires('MEPH.bind.Binder',
            'MEPHTests.helper.composite.DeepHelperComposite',
            'MEPH.dom.ControlLoader')
        .then(function () {
            //Act
            var loader = new MEPH.dom.ControlLoader();
            return loader.loadControls(nodes)
        }).then(function (packages) {
            var loader = new MEPH.dom.ControlLoader();
            return loader.generateBoundControls(packages);
        }).then(function (controls) {
            var loader = new MEPH.dom.ControlLoader();

            return loader.loadSubControls(controls);
        }).then(function (controls) {
            try {
                var dom = controls[0].templateNode[0],
                    helpercomposite,
                    m_inputs;
                helpercomposite = dom.querySelector('[data-alias="helpercomposite"]');
                m_inputs = helpercomposite.querySelectorAll('m_input');
                expect(controls).toBeTruthy();
                expect(m_inputs.length === 0).toBeTruthy();
                expect(controls.length === 2).toBeTruthy();
            }
            catch (error) {
                expect(error).caught();
            }
            finally {
                done();
            }
        });
    });

    it('controls will connect to child controls. ', function (done) {
        ///Arrange
        var nodes = [].interpolate(0, 2, function (i) {
            return {
                node: createDomObjects('deephelpercomposite'),
                alias: 'deephelpercomposite'
            };
        });
        MEPH.requires('MEPH.bind.Binder',
            'MEPHTests.helper.composite.DeepHelperComposite',
            'MEPH.dom.ControlLoader')
        .then(function () {
            //Act
            var loader = new MEPH.dom.ControlLoader();
            return loader.loadControls(nodes)
        }).then(function (packages) {
            var loader = new MEPH.dom.ControlLoader();
            return loader.generateBoundControls(packages);
        }).then(function (controls) {
            var loader = new MEPH.dom.ControlLoader();

            return loader.loadSubControls(controls);
        }).then(function (controls) {
            try {
                var dom = controls[0].templateNode[0],
                    helpercomposite,
                    instance = controls[0].classInstance,
                    m_inputs;


                expect(instance.headerInput).theTruth('the control instance did not have the expected properties');
                expect(instance.helperComposite).theTruth('the control instance did not have the "helperComposite" expected properties');
                expect(instance.personInput).theTruth('the control instance did not have the "personInput" expected properties');
                expect(instance.lastHelperComposite).theTruth('the control instance did not have the "lastHelperComposite" expected properties');

            }
            catch (error) {
                expect(error).caught();
            }
            finally {
                done();
            }
        });
    });

    it('will load controls from the node, and attach controllers, presenter, models and viewmodels', function (done) {
        ///Arrange
        var nodes = [].interpolate(0, 10, function (i) {
            var dom = createDomObjects('m_input');
            dom.setAttribute('data-reference', '"p$":"helperpresenter",' +
       ' "vm$":"helperviewmodel","ct$":"helpercontroller","m$":"helpermodel"');
            return { node: dom, alias: 'm_input' };
        });
        MEPH.requires('MEPHTests.helper.controller.HelperController',
           'MEPHTests.helper.viewmodel.HelperViewModel',
           'MEPHTests.helper.presenter.HelperPresenter',
           'MEPH.input.Input',
           'MEPHTests.helper.model.HelperModel'
       ).then(function () {
           return MEPH.create('MEPH.dom.ControlLoader')
       }).then(function ($class) {
           //Act
           var loader = new $class();
           return loader.loadControls(nodes)
       }).then(function (controls) {
           try {
               expect(controls).toBeTruthy();
               expect(controls.length === 10).toBeTruthy();
           }
           catch (error) {
               expect(error).caught();
           }
           finally {
               done();
           }
       });
    });

    it(' will detect if a dom object has data-object references  ', function (done) {
        var dom = createDomObjects('m_input');
        var emptydom = createDomObjects('m_input');
        dom.setAttribute('data-reference', '"p$":"helperpresenter",' +
            ' "vm$":"helperviewmodel","ct$":"helpercontroller","m$":"helpermodel"');
        MEPH.create('MEPH.dom.ControlLoader').then(function ($class) {
            var controlLoader = new $class(),
                result;
            result = controlLoader.hasReferences(dom);
            expect(result).toBeTruthy();
            result = controlLoader.hasReferences(emptydom);
            expect(result === false).toBeTruthy();
        }).catch(function (error) {
            expect(error).caught();
        }).then(function (x) {
            done();
        });
    });

    it('will find presenters, controller, viewmodel, models  which will be paired with controls/views', function (done) {
        var dom = createDomObjects('m_input'),
            nodes;
        dom.setAttribute('data-reference', '"p$":"helperpresenter",' +
            ' "vm$":"helperviewmodel","ct$":"helpercontroller","m$":"helpermodel"');
        nodes = [{ node: dom, alias: 'm_input' }];
        MEPH.requires('MEPHTests.helper.controller.HelperController',
            'MEPHTests.helper.viewmodel.HelperViewModel',
            'MEPHTests.helper.presenter.HelperPresenter',
            'MEPHTests.helper.model.HelperModel'
        ).then(function () {
            return MEPH.create('MEPH.dom.ControlLoader');
        }).then(function ($class) {
            var controlLoader = new $class(),
                references;
            Promise.resolve().then(function () { return controlLoader.getObjectReferences(dom) }).then(function (references) {
                try {

                    expect(references).toBeTruthy();
                    expect(references.length === 4).toBeTruthy();
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

    it('will get the template dom ', function (done) {
        //Arrange
        MEPH.create('MEPH.input.Input').then(function () {
            return MEPH.getDefinedTemplate('MEPH.input.Input')
        }).then(function (templatInfo) {
            MEPH.create('MEPH.dom.ControlLoader').then(function ($class) {
                try {
                    var controlLoader = new $class(),
                    childNodes;

                    //Act
                    childNodes = controlLoader.getTemplateDom(templatInfo);

                    //Assert
                    expect(childNodes).toBeTruthy();
                    expect(childNodes.length).toBeTruthy();
                }
                catch (error) {
                    expect(error).caught();
                }
                finally {
                    done();
                }
            });
        });;
    });
    it('will get an unattached div', function (done) {
        //Arrange

        MEPH.create('MEPH.dom.ControlLoader').then(function ($class) {
            try {            //Act
                var loader = new $class(),
                    div = loader.getUnattachedDiv();

                //Assert
                expect(div).toBeTruthy();
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