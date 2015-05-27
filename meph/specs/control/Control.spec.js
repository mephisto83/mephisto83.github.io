describe("MEPH/control/Control.spec.js", function () {

    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });

    it("Control class is defined.", function (done) {
        //Arrange

        //Act
        MEPH.create('MEPH.control.Control').then(function (result) {
            var control = new MEPH.control.Control();
            try {
                expect(control).toBeTruthy();
                expect(result).toBeTruthy();
            }
            finally {
                done();
            }
        });
        //Assert
    });

    it('a control will be able to get its template information', function (done) {
        //Arrange
        MEPH.create('MEPHTests.helper.HelperControl').then(function (result) {
            var control = new result();
            return control;
        }).then(function (control) {
            //Act
            var templates = control.getTemplates();
            return templates;
        }).catch(function (error) {

            done();
            throw error;
        }).then(function (templates) {
            //Assert
            try {
                expect(templates).toBeTruthy();
                expect(templates.length).toBeTruthy();
            }
            finally {
                done();
            }
        }).catch(function (error) {
            expect(false).toBeTruthy();
            done();
        });
    });


    it('a control can add to a list of attributes that will transfer', function (done) {
        //Arrange
        MEPH.create('MEPHTests.helper.HelperControl').then(function (result) {
            try {
                var control = new result();
                control.addTransferableAttribute('attributeName', { options: true });
                expect(control.getListOfTransferableAttributes().length === 2).theTruth('the number of transferable attributes was incorrect');
            }
            catch (error) {
                expect(error).caught();
            }
            finally {
                done();
            }
        })
    });


    it('a control can have an alias', function (done) {
        //Arrange
        MEPH.create('MEPHTests.helper.HelperControl').then(function (result) {
            try {
                var control = new result();
                expect(control.alias === 'meph_helper').toBeTruthy();
            }
            finally {
                done();
            }
        })
    });

    it('a control can have a html template instance set', function (done) {
        //Arrange
        var dom = document.createElement('div');
        dom.innerHTML = 'stuff';

        MEPH.create('MEPH.control.Control').then(function ($class) {
            try {
                var control = new $class();
                control.setDomTemplate(dom);
                expect(control.getDomTemplate()).toBeTruthy();
            }
            finally {
                done();
            }
        });
    });

    it('a control can extend the html of another', function (done) {
        //Arrange
        MEPH.create('MEPHTests.helper.input.InputHelper').then(function ($class) {
            try {
                var inputHelper = new $class(),
                templates = inputHelper.templates;

                //Act
                //Assert
                expect(templates.length === 3).toBeTruthy();

            }
            finally {
                done();
            }
        });
    });

    it('a control can construct a template ', function (done) {
        //Arrange
        MEPH.create('MEPHTests.helper.input.InputHelper').then(function ($class) {

            var inputHelper = new $class(),
                generatedDomTemplate;

            Promise.resolve().then(function () { return inputHelper.generateDomTemplate() }).then(function (reslut) {;
                try {
                    //Act
                    generatedDomTemplate = reslut;

                    //Assert
                    expect(generatedDomTemplate).toBeTruthy();
                }
                catch (error) {
                    throw error;
                }
                finally {
                    done();
                }
            });
        });
    });

    it('when a control has generated its dom template, then a the dom objects with a data-bind process are found', function (done) {
        //Arrange
        MEPH.create('MEPHTests.helper.input.InputHelper').then(function ($class) {
            var inputHelper = new $class(),
                generatedDomTemplate;
            Promise.resolve().then(function () { return inputHelper.generateDomTemplate() }).then(function (result) {
                generatedDomTemplate = result;

                //Act
                return inputHelper.getDomObjectsToBind(generatedDomTemplate);
            }).then(function (domObjects) {
                try {

                    //Assert
                    expect(domObjects.length > 1).toBeTruthy();
                }
                catch (error) {
                    throw error;
                }
                finally {
                    done();
                }
            });
        })
    });

    it('when a control has identified controls that require a bind process, the setup is applied ', function (done) {
        //
        done();
    });

    it(' can add reference connection', function (done) {
        //Arrange
        MEPH.create('MEPHTests.helper.input.InputHelper').then(function ($class) {
            try {
                var inputHelper = new $class(),
                    view,
                    obj = {};

                inputHelper.addReferenceConnection('view', obj);
                view = inputHelper.getConnection('view');
                expect(view === obj).toBeTruthy();
                view = inputHelper.getConnection('noview');
                expect(view === null).toBeTruthy();
            }
            catch (error) {
                expect(false).toBeTruthy();
            }
            finally {
                done();
            }
        });
    });

    it('a control can get comment groups', function (done) {
        //Arrange
        MEPH.create('MEPHTests.helper.input.InputHelper').then(function ($class) {
            try {

                var inputHelper = new $class(),
                    templateInfo,
                    template = 'MEPHTests.helper.input.InputHelper',
                    commentGroups,
                    childNodes,
                    generatedDomTemplate;
                templateInfo = MEPH.getDefinedTemplate(template);
                childNodes = MEPH.dom.ControlLoader.getTemplateDom(templateInfo);


                //Act
                commentGroups = inputHelper.getCommentGroups(childNodes);

                expect(commentGroups).toBeTruthy();
            }
            finally {
                done();
            }
        });
    });

    it('a control can inject dom objects to a specific location', function (done) {
        MEPH.create('MEPH.control.Control').then(function ($class) {
            var div,
                template,
                parentDom = document.createElement('div'),
                control = new $class();
            template = document.createElement('custom');
            template.innerHTML = '<header><div class="target"></div></header>';
            div = document.createElement('div');
            div.innerHTML = '<!-- "name" : "header" -->';
            parentDom.appendChild(div);
            control.setInstanceTemplate(template);
            control.setDomTemplate([div]);
            control.injectControls = {
                location: {
                    header: 'header'
                }
            }
            control.handleDomTemplate();
            expect(div.querySelector('.target')).theTruth('Nothing was found, there should have been div.target');
        }).catch(function (error) {
            if (error) {
                expect(error).caught();
            }
        }).then(function () {
            done();
        });
    });

    it('a control can get the comment groups for templates it requires', function (done) {
        //Arrange
        MEPH.create('MEPHTests.helper.input.InputHelper').then(function ($class) {
            try {

                var inputHelper = new $class(),
                    templateInfo,
                    template = 'MEPHTests.helper.input.InputHelper',
                    commentGroups,
                    childNodes,
                    generatedDomTemplate;
                //Act
                var groups = inputHelper.getOrdereredConstructionInstructions();

                //Assert
                expect(groups.length === 3).toBeTruthy();
            }
            catch (error) {
                throw error;
            }
            finally {
                done();
            }
        });
    });

    it('a control can detect if the template has construction instructions', function (done) {
        //Arrange
        MEPH.create('MEPHTests.helper.input.InputHelper').then(function ($class) {
            try {
                var inputHelper = new $class(),
                template,
                template2,
                result;
                template = inputHelper.getOrdereredConstructionInstructions().first();
                template2 = inputHelper.getOrdereredConstructionInstructions().nth(2);
                //Act
                result = inputHelper.hasInstructions(template);

                expect(result === false).toBeTruthy();
                expect(inputHelper.hasInstructions(template2)).toBeTruthy();
            }
            catch (error) {
                throw error;
            }
            finally {
                done();
            }
        });
    });

    it('a control can inject dom objects into another at a specific position', function (done) {
        ///Arrange
        var dom = document.createElement('div');
        dom.innerHTML = '<div><span><!-- "name":"beforedescription" --></span></div>';
        var injectelement = document.createElement('injected');
        MEPH.create('MEPH.control.Control').then(function ($class) {
            try {
                var control = new $class();

                //Act
                control.injectDom(dom, {
                    domObjects: [injectelement],
                    position: 'beforedescription',
                    before: 'true'
                }, [injectelement]);

                //Assert
                expect(dom.querySelector('injected')).toBeTruthy();

            }
            catch (error) {
                throw error;
            }
            finally {
                done();
            }
        });
    });

    it('will have be observable on initialization', function (done) {
        MEPH.create('MEPH.control.Control').then(function ($class) {
            try {

                //Act
                var control = new $class();

                //Assert
                expect(control[MEPH.isObservablePropertyKey]).toBeTruthy();

            }
            catch (error) {
                throw error;
            }
            finally {
                done();
            }
        });
    });

    it('can add auto bind controls', function (done) {
        MEPH.create('MEPH.control.Control').then(function ($class) {
            var control = new $class(), div, result;
            div = document.createElement('custom');
            div.setAttribute('custom', 'value');
            control.addAutoBindProperty('custom', 'autoProp', 'path');
            result = control.getAutoBindProperties();
            expect(result.first()).toBeTruthy();
            expect(result.first().autoProperty === 'autoProp').toBeTruthy();
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });;
    });

    it('calling querySelectorAll will return dom objects', function (done) {
        var dom = document.createElement('div');
        dom.innerHTML = '<div><div class="name"><div></div></div></div><div><div class="name"><div></div></div></div>';
        MEPH.create('MEPH.control.Control').then(function ($class) {
            var control = new $class(),
                divs;

            control.$domTemplate = MEPH.Array(dom.childNodes);
            divs = control.querySelectorAll('.name');
            expect(divs.length === 2).theTruth('Not returning the correct number of items.');
            done();
        }).catch(function (error) {
            expect(error).caught();
            done();
        });
    });
});