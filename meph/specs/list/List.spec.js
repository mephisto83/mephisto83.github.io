describe("MEPH/list/List.spec.js", function () {
    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });

    it('a list can be created', function (done) {
        MEPH.requires('MEPH.list.List').then(function () {
            var list = new MEPH.list.List();
            expect(list).theTruth('a list was not created');
        }).catch(function () {
            expect(new Error('something went wrong while creating a list')).caught();
        }).then(function (x) {
            done();
        });
    });

    it('a list can be bound to a source of data', function (done) {
        MEPH.requires('MEPH.util.Observable.observable').then(function () {
            return MEPH.create('MEPH.list.List').then(function ($class) {
                var list = new $class();
                list.source = [].interpolate(0, 10, function (i) {
                    var obj = { prop: 1 };
                    MEPH.util.Observable.observable(obj);
                    return obj;
                });
            })
        }).catch(function (error) {
            expect(new Error('something went wrong while creating a list')).caught();
        }).then(function (x) {
            done();
        });
    });





    it('will have templates assigned to the list', function (done) {
        var app,
            dom;
        MEPH.requires('MEPH.util.Observable.observable', 'MEPH.list.List', 'MEPHTests.helper.Application').then(function () {
            app = new MEPHTests.helper.Application();
            dom = app.createAppSpace(), div = document.createElement('div');
            div.innerHTML = '<list><template name="standard"><div data-bind=\'"innerHTML" : "c$.name"\'></div></template></list>';
            return app.create('MEPH.list.List', div.firstElementChild);
        }).then(function (results) {
            return app.loadViewObject([results], dom);
        }).then(function (results) {
            var list = results.first().classInstance,
                templates;

            templates = list.getListTemplates();
            expect(templates.length === 1).theTruth('No templates have be found');
            if (app) {
                app.removeSpace();
            }
        }).catch(function (error) {
            expect(new Error('something went wrong while creating a list')).caught();
        }).then(function (x) {
            done();
        });
    });

    it('will render data to list, when source is set.', function (done) {
        var app,
            dom;
        MEPH.requires('MEPH.util.Observable', 'MEPH.list.List', 'MEPHTests.helper.Application').then(function () {
            app = new MEPHTests.helper.Application();
            dom = app.createAppSpace(), div = document.createElement('div');
            div.innerHTML = '<list><template name="standard"><div data-bind=\'"innerHTML" : "c$.name"\'></div></template></list>';
            return app.create('MEPH.list.List', div.firstElementChild);
        }).then(function (results) {
            return app.loadViewObject([results], dom);
        }).then(function (results) {
            var list = results.first().classInstance,
                templates,
                source, promise = Promise.resolve();
            source = [].interpolate(0, 10, function (index) {
                var obj = { prop: 1 };
                MEPH.util.Observable.observable(obj);
                return obj;
            });

            list.on('render', function (type, options) {
                promise = options.renderComplete.then(function () {
                    if (app) {
                        app.removeSpace();
                    }
                });
            });
            list.source = source;
            return promise;
        }).catch(function () {
            if (app) {
                app.removeSpace();
            }
            expect(new Error('did not render as expected')).caught();
        }).then(function (x) {
            done();
        });
    });

    it('will render data to list.', function (done) {
        var app,
            dom;
        MEPH.requires('MEPH.util.Observable', 'MEPH.list.List', 'MEPHTests.helper.Application').then(function () {
            app = new MEPHTests.helper.Application();
            dom = app.createAppSpace(), div = document.createElement('div');
            div.innerHTML = '<list><template name="standard"><div data-bind=\'"innerHTML" : "c$.name"\'></div></template></list>';
            return app.create('MEPH.list.List', div.firstElementChild);
        }).then(function (results) {
            return app.loadViewObject([results], dom);
        }).then(function (results) {
            var list = results.first().classInstance,
                promise = Promise.resolve(),
                source,
                templates;
            list.on('render', function (type, options) {
                promise = options.renderComplete.then(function () {
                    return list;
                });
            });
            source = [].interpolate(0, 10, function (index) {
                var obj = { prop: 1 };
                MEPH.util.Observable.observable(obj);
                return obj;
            });

            list.source = source;

            return promise;

        }).then(function (list) {
            expect(list.boundSource.length === 10).theTruth('The bound source wasnt connected to the list. ' + list.boundSource.length);
            if (app) {
                app.removeSpace();
            }
        }).catch(function () {
            if (app) {
                app.removeSpace();
            }
            expect(new Error('did not render as expected')).caught();
        }).then(function (x) {
            done();
        });
    });

    it('will render data to list, and handle updates.', function (done) {
        var app,
            dom;
        MEPH.requires('MEPH.util.Observable', 'MEPH.list.List', 'MEPHTests.helper.Application').then(function () {
            app = new MEPHTests.helper.Application();
            dom = app.createAppSpace(), div = document.createElement('div');
            div.innerHTML = '<list><template name="standard"><div data-bind=\'"innerHTML" : "c$.name"\'></div></template></list>';
            return app.create('MEPH.list.List', div.firstElementChild);
        }).then(function (results) {
            return app.loadViewObject([results], dom);
        }).then(function (results) {
            var list = results.first().classInstance,
                promise = Promise.resolve(),
                source,
                templates;
            source = MEPH.util.Observable.observable([].interpolate(0, 10, function (index) {
                var obj = { prop: 1 };
                MEPH.util.Observable.observable(obj);
                return obj;
            }));

            list.on('render', function (type, options) {
                promise = options.renderComplete.then(function () {
                    return list;
                });
            }, 1);

            list.source = source;

            return promise;

        }).then(function (list) {
            expect(list.boundSource.length === 10).theTruth('The bound source wasnt connected to the list. ' + list.boundSource.length);
            return list;
        }).then(function (list) {
            var promise = Promise.resolve();
            list.un(null, 1);
            list.on('render', function (type, options) {
                promise = options.renderComplete.then(function () {
                });
            }, 1);
            list.on('updatecomplete', function () {
                expect(list.boundSource.length === 9).theTruth('the list didnt update correctly');
                if (app) {
                    app.removeSpace();
                }
            });
            list.source.pop();
            return promise;

        }).catch(function (error) {
            if (app) {
                app.removeSpace();
            }
            expect(error).caught();
        }).then(function (x) {
            done();
        });
    });

    it('when the source is updated the added item will go to the correct position', function (done) {
        var app,
           dom;
        MEPH.requires('MEPH.util.Observable', 'MEPH.list.List', 'MEPHTests.helper.Application').then(function () {
            app = new MEPHTests.helper.Application();
            dom = app.createAppSpace(), div = document.createElement('div');
            div.innerHTML = '<list><template name="standard"><div data-bind=\'"innerHTML" : "c$.name"\'></div></template></list>';
            return app.create('MEPH.list.List', div.firstElementChild);
        }).then(function (results) {
            return app.loadViewObject([results], dom);
        }).then(function (results) {
            var list = results.first().classInstance,
                promise = Promise.resolve(),
                source,
                templates;
            source = MEPH.util.Observable.observable([].interpolate(0, 10, function (index) {
                var obj = { prop: 1 };
                MEPH.util.Observable.observable(obj);
                return obj;
            }));

            list.on('render', function (type, options) {
                promise = options.renderComplete.then(function () {
                    return list;
                });
            }, 1);

            list.source = source;

            return promise;

        }).then(function (list) {
            expect(list.boundSource.length === 10).theTruth('The bound source wasnt connected to the list. ' + list.boundSource.length);

            //    done();
            return list;
        }).then(function (list) {
            var promise = Promise.resolve(),
                newobject = { prop: 1 };
            MEPH.util.Observable.observable(newobject);;
            list.un(null, 1);
            list.on('render', function (type, options) {
                promise = options.renderComplete.then(function () {
                });
            }, 1);
            list.on('updatecomplete', function () {
                expect(list.boundSource.length === 11).theTruth('the list didnt update correctly');
                var boundInfo = list.getBoundSourceInfo(newobject);

                expect(list.getBoundSourceIndex(newobject) === 4).theTruth('The item in the list wasnt in the right place.');
                if (app) {
                    app.removeSpace();
                }
            });
            list.source.splice(4, 0, newobject);
            return promise;

        }).catch(function () {
            if (app) {
                app.removeSpace();
            }
            expect(new Error('did not render as expected')).caught();
        }).then(function (x) {
            done();
        });
    });

    it('will destroy all template objects when clearing the list ', function (done) {
        var app,
           dom;
        MEPH.requires('MEPH.util.Observable', 'MEPH.list.List', 'MEPHTests.helper.Application').then(function () {
            app = new MEPHTests.helper.Application();
            dom = app.createAppSpace(), div = document.createElement('div');
            div.innerHTML = '<list><template name="standard"><div data-bind=\'"innerHTML" : "c$.name"\'></div></template></list>';
            return app.create('MEPH.list.List', div.firstElementChild);
        }).then(function (results) {
            return app.loadViewObject([results], dom);
        }).then(function (results) {
            var list = results.first().classInstance,
                source,
                promise = Promise.resolve(),
                templates;

            list.on('render', function (type, options) {
                promise = options.renderComplete.then(function () {
                    return list;
                });
            });

            source = [].interpolate(0, 10, function (index) {
                var obj = { prop: 1 };
                MEPH.util.Observable.observable(obj);
                return obj;
            });

            list.source = source;

            return promise;

        }).then(function (list) {
            expect(list.boundSource.length === 10).theTruth('The bound source wasnt connected to the list.');
            var destroyed = 0;
            list.boundSource.foreach(function (x) {
                x.renderResult.foreach(function (y) {
                    y.classInstance.on('destroy', function () {
                        destroyed++;
                    });
                });
            });
            return list.clearList().then(function () {

                expect(destroyed === 10).theTruth('not all the controls templates were destroyed : destroyed :' + destroyed);
                expect(list.boundSource.length === 0).theTruth('the boundsource still has stuff in it.');
            });

        }).catch(function () {
            if (app) {
                app.removeSpace();
            }
            expect(new Error('did not render as expected')).caught();
        }).then(function (x) {
            done();
        });
    });

    it('can get list space ', function (done) {
        var app,
          dom;
        MEPH.requires('MEPH.util.Observable', 'MEPH.list.List', 'MEPHTests.helper.Application').then(function () {
            app = new MEPHTests.helper.Application();
            dom = app.createAppSpace(), div = document.createElement('div');
            div.innerHTML = '<list><template name="standard"><div data-bind=\'"innerHTML" : "c$.name"\'></div></template></list>';
            return app.create('MEPH.list.List', div.firstElementChild);
        }).then(function (results) {
            return app.loadViewObject([results], dom);
        }).then(function (results) {
            var list = results.first().classInstance,
                space;
            space = list.getListSpace();


            expect(space).theTruth('The space was not foudn.');
        }).catch(function () {
            if (app) {
                app.removeSpace();
            }
            expect(new Error('did not get the list space')).caught();
        }).then(function (x) {
            done();
        });
    });

    it('can get template for dataitem', function (done) {
        var app,
          dom;
        MEPH.requires('MEPH.util.Observable', 'MEPH.list.List', 'MEPHTests.helper.Application').then(function () {
            app = new MEPHTests.helper.Application();
            dom = app.createAppSpace(), div = document.createElement('div');
            div.innerHTML = '<list><template name="standard"><div data-bind=\'"innerHTML" : "c$.name"\'></div></template></list>';
            return app.create('MEPH.list.List', div.firstElementChild);
        }).then(function (results) {
            return app.loadViewObject([results], dom);
        }).then(function (results) {
            var list = results.first().classInstance,
                template;

            template = list.getTemplateForDataItem({ prop: 'data' });


            expect(template.getAttribute('name') === 'standard').theTruth('The template doesnt have the right name.');
        }).catch(function () {
            if (app) {
                app.removeSpace();
            }
            expect(new Error('Something went wrong when trying to find the template.')).caught();
        }).then(function (x) {
            done();
        });
    });

    it('when a template is handled by the list a class is generated which encompasses it', function (done) {
        var app,
          dom;
        MEPH.requires('MEPH.util.Observable', 'MEPH.list.List', 'MEPHTests.helper.Application').then(function () {
            app = new MEPHTests.helper.Application();
            dom = app.createAppSpace(), div = document.createElement('div');
            div.innerHTML = '<list><template name="standard"><div data-bind=\'"innerHTML" : "c$.name"\'></div></template></list>';
            return app.create('MEPH.list.List', div.firstElementChild);
        }).then(function (results) {
            return app.loadViewObject([results], dom);
        }).then(function (results) {
            expect(MEPH.generated.template.standard).theTruth('The class wasnt generated as expected.');
            MEPH.undefine('MEPH.generated.template.standard');
        }).catch(function (error) {
            expect(error).caught(); if (app) {
                app.removeSpace();
            }
            expect(new Error('Something went wrong when trying to find the template.')).caught();
        }).then(function (x) {
            done();
        });
    });

    it('when a templated item can access its parents functions, through list.', function (done) {
        var app,
            tochange,
            called,
          dom;
        MEPH.requires('MEPH.util.Observable', 'MEPH.list.List', 'MEPHTests.helper.Application').then(function () {
            app = new MEPHTests.helper.Application();
            dom = app.createAppSpace(), div = document.createElement('div');
            div.innerHTML = '<list><template name="standard2"><div data-bind=\'"innerHTML" : "c$.data.name | c$.list.callFunc"\'></div></template></list>';
            return app.create('MEPH.list.List', div.firstElementChild);
        }).then(function (results) {
            return app.loadViewObject([results], dom);
        }).then(function (results) {
            var result = results[0].classInstance;
            result.callFunc = function () {
                called = true;
            }
            result.source = MEPH.util.Observable.observable([]);
            tochange = { name: 'name' };
            result.source.push(tochange);
        }).then(function () {
            var toresolve,
                tofail,
                promise = new Promise(function (resolve, fail) {
                    toresolve = resolve;
                    tofail = fail;
                });
            setTimeout(function () {
                tochange.name = 'change';
                toresolve();
            }, 500);
            return promise;
        }).catch(function (error) {
            expect(error).caught(); if (app) {
                app.removeSpace();
                app = null;
            }
            expect(new Error('Something went wrong when trying to find the template.')).caught();
        }).then(function (x) {
            setTimeout(function () {
                if (app) {
                    app.removeSpace();
                    app = null;
                }
                expect(called).toBeTruthy();
                MEPH.undefine('MEPH.generated.template.standard');
                done();
            }, 1000);
        });
    });
});