describe("MEPH/button/Button.spec.js", function () {
    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });

    it('a button can be created.', function (done) {
        MEPH.create('MEPH.button.Button').then(function ($class) {
            try {
                expect(new $class()).theTruth('The button class can not be created.');
            }
            catch (error) {
                expect(error).caught();
            }
            finally {
                done();
            }
        }).catch(function () {
            expect(new Error('Something went wrong while creating a button')).caught();
        });
    });


    it('when a button is clicked it will dispatch a buttonclicked event.', function (done) {
        var app, div,
            dom;
        MEPH.requires('MEPH.util.Observable', 'MEPH.button.Button', 'MEPHTests.helper.Application').then(function () {
            app = new MEPHTests.helper.Application();
            dom = app.createAppSpace(), div = document.createElement('div');
            div.innerHTML = '<mephbutton></mephbutton>';
            return app.create('MEPH.button.Button', div.firstElementChild);
        }).then(function (results) {
            return app.loadViewObject([results], dom);
        }).then(function (results) {
            var button = results.first().classInstance,
                clicked,
                buttonDom;

            try {
                buttonDom = button.getDomTemplate().first(function (x) { return x.nodeType === 1; })

                dom.addEventListener(MEPH.button.Button.buttonClickEvent, function () {
                    clicked = true;
                });

                buttonDom.dispatchEvent(MEPH.createEvent('click', {}));

                expect(clicked).theTruth('a buttonclick event was not fired');
            }
            finally {
                if (app) {
                    app.removeSpace();
                }
                done();
            }
        }).catch(function () {
            if (app) {
                app.removeSpace();
            }
            expect(new Error('did not render as expected')).caught();
            done();
        });;
    });


    it('classes applied to mephbuton are applied to the button.', function (done) {
        var app, div,
            dom;
        MEPH.requires('MEPH.util.Observable', 'MEPH.button.Button', 'MEPHTests.helper.Application').then(function () {
            app = new MEPHTests.helper.Application();
            dom = app.createAppSpace(), div = document.createElement('div');
            div.innerHTML = '<mephbutton class="appliedclass secondapplied"></mephbutton>';
            return app.create('MEPH.button.Button', div.firstElementChild);
        }).then(function (results) {
            return app.loadViewObject([results], dom);
        }).then(function (results) {
            var button = results.first().classInstance,
                clicked,
                buttonDom;

            try {
                buttonDom = button.getDomTemplate().first(function (x) { return x.nodeType === 1; })

                expect(buttonDom.classList.toString() === 'appliedclass secondapplied').theTruth('a buttonclick event was not fired');

            }
            catch (error) {
                expect(error).caught();
            }
            finally {
                if (app) {
                    app.removeSpace();
                }
                done();
            }
        }).catch(function () {
            if (app) {
                app.removeSpace();
            }
            expect(new Error('did not render as expected')).caught();
            done();
        });;
    });
    it('classes applied to mephbuton are applied to the button.', function (done) {
        var app, div,
            dom;
        MEPH.requires('MEPH.util.Observable', 'MEPH.button.Button', 'MEPHTests.helper.Application').then(function () {
            app = new MEPHTests.helper.Application();
            dom = app.createAppSpace(), div = document.createElement('div');
            div.innerHTML = '<mephbutton class="appliedclass"></mephbutton>';
            return app.create('MEPH.button.Button', div.firstElementChild);
        }).then(function (results) {
            return app.loadViewObject([results], dom);
        }).then(function (results) {
            var button = results.first().classInstance,
                clicked,
                buttonDom;

            try {
                buttonDom = button.getDomTemplate().first(function (x) { return x.nodeType === 1; })

                expect(buttonDom.classList.toString() === 'appliedclass').theTruth('a buttonclick event was not fired');

            }
            finally {
                if (app) {
                    app.removeSpace();
                }
            }
        }).catch(function () {
            if (app) {
                app.removeSpace();
            }
            expect(new Error('did not render as expected')).caught();
        }).then(function(){
            done();
        });;
    });

});