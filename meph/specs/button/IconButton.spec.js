describe("MEPH/button/IconButton.spec.js", function () {
    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });

    it('an iconbutton can be created.', function (done) {
        MEPH.create('MEPH.button.IconButton').then(function ($class) {
            var iconbutton = new $class();
            expect(iconbutton).theTruth('the icon button was not created');
        }).catch(function (error) {
            if (error) {
                expect(error).caught();
            }
        }).then(function () {
            done();
        });
    });


    it(' an icon button can set the icon type ', function (done) {
        //Arrange
        var app, div,
          dom;
        MEPH.requires('MEPH.button.IconButton', 'MEPHTests.helper.Application').then(function () {
            app = new MEPHTests.helper.Application();
            dom = app.createAppSpace(), div = document.createElement('div');
            div.innerHTML = '<iconbutton icon="fakeicon"></iconbutton>';
            return app.create('MEPH.button.IconButton', div.firstElementChild);
        }).then(function (results) {
            return app.loadViewObject([results], dom);
        }).then(function (results) {
            var iconbutton = results.first().classInstance;
            ///Assert
            expect(iconbutton.icon === 'fakeicon').theTruth('the icon type wasnt set correctly');
            if (app) {
                app.removeSpace();
            }
        }).catch(function (error) {
            expect(error || new Error('did not render as expected')).caught();
        }).then(function () {
            done();
        })
    });



    it(' an icon button can set the icon color', function (done) {
        //Arrange
        var app, div,
          dom;
        MEPH.requires('MEPH.button.IconButton', 'MEPHTests.helper.Application').then(function () {
            app = new MEPHTests.helper.Application();
            dom = app.createAppSpace(), div = document.createElement('div');
            div.innerHTML = '<iconbutton icon="fakeicon" color="Red" size="X2"></iconbutton>';
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


    it(' an icon button can set the icon size', function (done) {
        //Arrange
        var app, div,
          dom;
        MEPH.requires('MEPH.button.IconButton', 'MEPHTests.helper.Application').then(function () {
            app = new MEPHTests.helper.Application();
            dom = app.createAppSpace(), div = document.createElement('div');
            div.innerHTML = '<iconbutton icon="fakeicon" color="Red"></iconbutton>';
            return app.create('MEPH.button.IconButton', div.firstElementChild);
        }).then(function (results) {
            return app.loadViewObject([results], dom);
        }).then(function (results) {
            var iconbutton = results.first().classInstance;
            ///Assert
            expect(iconbutton.color === 'Red').theTruth('the icon color wasnt set correctly');
            if (app) {
                app.removeSpace();
            }
        }).catch(function (error) {
            expect(error || new Error('did not render as expected')).caught();
        }).then(function () {
            done();
        })
    });



    it(' an icon button with the type set will apply the css ', function (done) {
        //Arrange
        var app, div,
          dom;
        MEPH.requires('MEPH.button.IconButton', 'MEPHTests.helper.Application').then(function () {
            app = new MEPHTests.helper.Application();
            dom = app.createAppSpace(), div = document.createElement('div');
            div.innerHTML = '<iconbutton icon="calculator"></iconbutton>';
            return app.create('MEPH.button.IconButton', div.firstElementChild);
        }).then(function (results) {
            return app.loadViewObject([results], dom);
        }).then(function (results) {
            var iconbutton = results.first().classInstance;
            ///Assert
            expect(iconbutton.iconButtonCls.indexOf(iconbutton.iconPrefix + 'calculator') !== -1).theTruth('the icon class wasnt set correctly');
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