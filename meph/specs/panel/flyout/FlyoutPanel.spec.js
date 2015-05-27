describe("MEPH/panel/flyout/FlyoutPanel.spec.js", function () {

    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });

    it('can create a mobile application.', function (done) {
        MEPH.create('MEPH.panel.flyout.FlyoutPanel').then(function ($class) {
            var panel = new $class();
            expect(panel).theTruth('the flyoutpanel was no created');
        }).catch(function (error) {
            if (error) {
                expect(error).caught()
            }
        }).then(function () {
            done();
        });;
    });

    it('a flyout panel can be pinned left/right/top/bottom.', function (done) {
        var app, div,
            dom;
        MEPH.requires('MEPH.panel.flyout.FlyoutPanel', 'MEPHTests.helper.Application').then(function () {
            app = new MEPHTests.helper.Application();
            dom = app.createAppSpace(), div = document.createElement('div');
            div.innerHTML = '<flyoutpanel></flyoutpanel>';
            return app.create('MEPH.panel.flyout.FlyoutPanel', div.firstElementChild);
        }).then(function (results) {
            return app.loadViewObject([results], dom);
        }).then(function (results) {
            var flyoutPanel = results.first().classInstance,
                toresolve, tofail,
                clicked,
                flyoutPanelDom;


            flyoutPanelDom = flyoutPanel.getDomTemplate().first(function (x) { return x.nodeType === 1; });
            flyoutPanel.position = 'left';

            setTimeout(function () {
                var correct = flyoutPanelDom.classList.toString().indexOf(flyoutPanel.positionLeft) !== -1;
                expect(correct).theTruth('The flyout panel didnt position correctly');

                if (app) {
                    app.removeSpace();
                }

                if (correct) {
                    toresolve();
                }
                else {
                    tofail(new Error('Flyout panel didnt position correctly'));
                }
            }, 300);
            return new Promise(function (resolve, fail) {
                toresolve = resolve;
                tofail = fail;
            });
        }).catch(function (error) {

            expect(error || new Error('did not render as expected')).caught();
        }).then(function () {
            done();
        });
    });

    it(' when position is set on flyoutpanel node, the property will be transferred to the classInstance', function (done) {
        var app, div,
           dom;
        MEPH.requires('MEPH.panel.flyout.FlyoutPanel', 'MEPHTests.helper.Application').then(function () {
            app = new MEPHTests.helper.Application();
            dom = app.createAppSpace(), div = document.createElement('div');
            div.innerHTML = '<flyoutpanel position="left"></flyoutpanel>';
            return app.create('MEPH.panel.flyout.FlyoutPanel', div.firstElementChild);
        }).then(function (results) {
            return app.loadViewObject([results], dom);
        }).then(function (results) {
            var flyoutPanel = results.first().classInstance,
                toresolve, tofail,
                clicked,
                flyoutPanelDom;


            flyoutPanelDom = flyoutPanel.getDomTemplate().first(function (x) { return x.nodeType === 1; });

            setTimeout(function () {
                var correct = flyoutPanelDom.classList.toString().indexOf(flyoutPanel.positionLeft) !== -1;
                expect(correct).theTruth('The flyout panel didnt position correctly');

                if (app) {
                    app.removeSpace();
                }

                if (correct) {
                    toresolve();
                }
                else {
                    tofail(new Error('Flyout panel didnt position correctly'));
                }
            }, 300);
            return new Promise(function (resolve, fail) {
                toresolve = resolve;
                tofail = fail;
            });
        }).catch(function (error) {
            expect(error || new Error('did not render as expected')).caught();
        }).then(function () {
            done();
        });
    });

    it(' when cls is set on flyoutpanel node, the property will be transferred to the classInstance', function (done) {
        var app, div,
           dom;
        MEPH.requires('MEPH.panel.flyout.FlyoutPanel', 'MEPHTests.helper.Application').then(function () {
            app = new MEPHTests.helper.Application();
            dom = app.createAppSpace(), div = document.createElement('div');
            div.innerHTML = '<flyoutpanel cls="transferred-cls"></flyoutpanel>';
            return app.create('MEPH.panel.flyout.FlyoutPanel', div.firstElementChild);
        }).then(function (results) {
            return app.loadViewObject([results], dom);
        }).then(function (results) {
            var flyoutPanel = results.first().classInstance,
                toresolve, tofail,
                clicked,
                flyoutPanelDom;


            flyoutPanelDom = flyoutPanel.getDomTemplate().first(function (x) { return x.nodeType === 1; });

            setTimeout(function () {
                var correct = flyoutPanelDom.classList.toString().indexOf('transferred-cls') !== -1;
                expect(correct).theTruth('The flyout panel didnt add the css class');

                if (app) {
                    app.removeSpace();
                }

                if (correct) {
                    toresolve();
                }
                else {
                    tofail(new Error('The flyout panel didnt add the css class'));
                }
            }, 300);
            return new Promise(function (resolve, fail) {
                toresolve = resolve;
                tofail = fail;
            });
        }).catch(function (error) {
            expect(error || new Error('did not render as expected')).caught();
        }).then(function () {
            done();
        });
    });

    it('a flyout panel can be "opened"', function (done) {
        var app, div,
          dom;
        MEPH.requires('MEPH.panel.flyout.FlyoutPanel', 'MEPHTests.helper.Application').then(function () {
            app = new MEPHTests.helper.Application();
            dom = app.createAppSpace(), div = document.createElement('div');
            div.innerHTML = '<flyoutpanel position="left"></flyoutpanel>';
            return app.create('MEPH.panel.flyout.FlyoutPanel', div.firstElementChild);
        }).then(function (results) {
            return app.loadViewObject([results], dom);
        }).then(function (results) {
            var flyoutPanel = results.first().classInstance,
                toresolve, tofail,
                clicked,
                flyoutPanelDom;

            flyoutPanelDom = flyoutPanel.getDomTemplate().first(function (x) { return x.nodeType === 1; });
            flyoutPanel.$maxTransitionTime = 10;
            return flyoutPanel.open().then(function () {
                var correct = flyoutPanelDom.classList.toString().indexOf(flyoutPanel.openLeft) !== -1;
                expect(correct).theTruth('The flyout panel didnt position correctly');

                if (app) {
                    app.removeSpace();
                }
            });
        }).catch(function (error) {
            expect(error || new Error('did not render as expected')).caught();
        }).then(function () {
            done();
        });
    });

    it('a flyout panel can be "closed" ', function (done) {
        var app, div,
           dom;
        MEPH.requires('MEPH.panel.flyout.FlyoutPanel', 'MEPHTests.helper.Application').then(function () {
            app = new MEPHTests.helper.Application();
            dom = app.createAppSpace(), div = document.createElement('div');
            div.innerHTML = '<flyoutpanel position="left"></flyoutpanel>';
            return app.create('MEPH.panel.flyout.FlyoutPanel', div.firstElementChild);
        }).then(function (results) {
            return app.loadViewObject([results], dom);
        }).then(function (results) {
            var flyoutPanel = results.first().classInstance,
                toresolve, tofail,
                clicked,
                flyoutPanelDom;

            flyoutPanelDom = flyoutPanel.getDomTemplate().first(function (x) { return x.nodeType === 1; });
            flyoutPanel.$maxTransitionTime = 10;
            return flyoutPanel.open().then(function () { return flyoutPanel.close(); }).then(function () {
                var correct = flyoutPanelDom.classList.toString().indexOf(flyoutPanel.openLeft) === -1;
                expect(correct).theTruth('The flyout panel didnt position correctly');

                if (app) {
                    app.removeSpace();
                }
            });
        }).catch(function (error) {
            expect(error || new Error('did not render as expected')).caught();
        }).then(function () {
            done();
        });
    });

    it(' a flyout panel cal be "opened"  then "closed" and then "opened"', function (done) {
        var app, div,
           dom;
        MEPH.requires('MEPH.panel.flyout.FlyoutPanel', 'MEPHTests.helper.Application').then(function () {
            app = new MEPHTests.helper.Application();
            dom = app.createAppSpace(), div = document.createElement('div');
            div.innerHTML = '<flyoutpanel position="left"></flyoutpanel>';
            return app.create('MEPH.panel.flyout.FlyoutPanel', div.firstElementChild);
        }).then(function (results) {
            return app.loadViewObject([results], dom);
        }).then(function (results) {
            var flyoutPanel = results.first().classInstance,
                toresolve, tofail,
                clicked,
                flyoutPanelDom;

            flyoutPanelDom = flyoutPanel.getDomTemplate().first(function (x) { return x.nodeType === 1; });
            flyoutPanel.$maxTransitionTime = 10;
            return flyoutPanel.open().then(function () { return flyoutPanel.close(); })
                .then(function () { return flyoutPanel.open(); }).then(function () {
                    var correct = flyoutPanelDom.classList.toString().indexOf(flyoutPanel.openLeft) !== -1;
                    expect(correct).theTruth('The flyout panel didnt position correctly');

                    if (app) {
                        app.removeSpace();
                    }
                });
        }).catch(function (error) {
            expect(error || new Error('did not render as expected')).caught();
        }).then(function () {
            done();
        });
    });

    it('a flyout menu can have items within', function (done) {
        //Arrange
        var app, div,
          dom;
        MEPH.requires('MEPH.panel.flyout.FlyoutPanel', 'MEPHTests.helper.Application').then(function () {
            app = new MEPHTests.helper.Application();
            dom = app.createAppSpace(), div = document.createElement('div');
            div.innerHTML = '<flyoutpanel position="left"><div class="internalstuff"></div></flyoutpanel>';
            return app.create('MEPH.panel.flyout.FlyoutPanel', div.firstElementChild);
        }).then(function (results) {
            return app.loadViewObject([results], dom);
        }).then(function (results) {
            var flyoutPanel = results.first().classInstance;
            ///Assert
            expect(flyoutPanel.querySelector('.internalstuff')).theTruth('No internal stuff found.');
            if (app) {
                app.removeSpace();
            }
        }).catch(function (error) {
            expect(error || new Error('did not render as expected')).caught();
        }).then(function () {
            done();
        })
    });

    it(' setting opened to true will open the flyoutmenu ', function (done) {
        //Arrange
        var app, div,
          dom;
        MEPH.requires('MEPH.panel.flyout.FlyoutPanel', 'MEPHTests.helper.Application').then(function () {
            app = new MEPHTests.helper.Application();
            dom = app.createAppSpace(), div = document.createElement('div');
            div.innerHTML = '<flyoutpanel position="left"><div class="internalstuff"></div></flyoutpanel>';
            return app.create('MEPH.panel.flyout.FlyoutPanel', div.firstElementChild);
        }).then(function (results) {
            return app.loadViewObject([results], dom);
        }).then(function (results) {
            var flyoutPanel = results.first().classInstance;
            ///Assert
            flyoutPanel.opened = true;
            return flyoutPanel.$flyoutPanelPromise.then(function () {
                expect(flyoutPanel.isOpen() === true).theTruth('the flyout panel was not opend');
            });
            if (app) {
                app.removeSpace();
            }
        }).catch(function (error) {
            expect(error || new Error('did not render as expected')).caught();
        }).then(function () {
            done();
        })
    });
});