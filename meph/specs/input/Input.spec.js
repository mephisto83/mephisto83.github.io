describe("MEPH/input/Input.spec.js", function () {
    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });

    it("Creates a input.", function (done) {
        //Arrange

        //Act
        MEPH.create('MEPH.input.Input').then(function ($class) {
            //Assert
            var input = new MEPH.input.Input(),
                template;

            var newinput = new $class();
            expect(input !== null).toBeTruthy();
            template = MEPH.getDefinedTemplate('MEPH.input.Input');
            expect(template).toBeTruthy();
        }).catch(function (error) {
            expect(error).caught();
        }).then(function (x) {
            done();
        });

    });

    it('creates a text input field', function (done) {
        //Arrange
        MEPH.requires('MEPH.input.Text').then(function () {
            return MEPH.create('MEPH.input.Text').then(function ($class) {
                var input = new $class();
            })
        }).catch(function (error) {
            expect(error).caught();
        }).then(function (x) {
            done();
        });
    });


    it(' can render an icon button', function (done) {
        //Arrange
        var app, div,
          dom;
        MEPH.requires('MEPH.input.Text', 'MEPHTests.helper.Application').then(function () {
            app = new MEPHTests.helper.Application();
            dom = app.createAppSpace(), div = document.createElement('div');
            div.innerHTML = '<text></text>';
            return app.create('MEPH.input.Text', div.firstElementChild);
        }).then(function (results) {
            return app.loadViewObject([results], dom);
        }).then(function (results) {
            var dom,
                iconbutton = results.first().classInstance;
            ///Assert
            dom = iconbutton.querySelector('input');

            expect(dom).theTruth('the input wasnt found.');
            if (app) {
                app.removeSpace();
            }
        }).catch(function (error) {
            expect(error || new Error('did not render as expected')).caught();
        }).then(function () {
            done();
        })
    });

    it(' can set the descriptionCls', function (done) {
        //Arrange
        var app, div,
          dom;
        MEPH.requires('MEPH.input.Text', 'MEPHTests.helper.Application').then(function () {
            app = new MEPHTests.helper.Application();
            dom = app.createAppSpace(), div = document.createElement('div');
            div.innerHTML = '<text icon="fakeicon" color="Red" size="X2"></text>';
            return app.create('MEPH.button.IconButton', div.firstElementChild);
        }).then(function (results) {
            return app.loadViewObject([results], dom);
        }).then(function (results) {
            var iconbutton = results.first().classInstance;
            ///Assert
            expect(iconbutton.size === 'X2').theTruth('the icon size wasnt set correctly');
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