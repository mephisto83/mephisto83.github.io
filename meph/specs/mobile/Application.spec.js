describe("MEPH/mobile/Application.spec.js", function () {

    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });

    it('can create a mobile application.', function (done) {
        //Arrange
        MEPH.create('MEPH.mobile.Application').then(function ($class) {
            var mobileapplication = new $class();

            expect(mobileapplication).theTruth('The mobile application was not created.');

        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });

    it('can set the application name of the mobile application', function (done) {
        //Arrange
        MEPH.create('MEPH.mobile.Application').then(function ($class) {
            var mobileapplication = MEPH.App.mobileApplication({
                applicationName: 'Agresso Mobile Platform'
            });

            expect(mobileapplication.getApplicationName()).theTruth('The application name was not set correctly: ');

        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });

    it('can set the product', function (done) {
        //Arrange
        MEPH.create('MEPH.mobile.Application').then(function ($class) {
            var mobileapplication = MEPH.App.mobileApplication({
                product: 'UNIT4'
            });

            expect(mobileapplication.getProduct()).theTruth('The application name was not set correctly: ');

        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });

    it(' will inject the mobileapplicationcontainer into the dom', function (done) {
        MEPH.create('MEPH.mobile.Application').then(function ($class) {
            var div = document.createElement('mobileappspot');
            document.body.appendChild(div);
            var mobileApp = MEPH.App.mobileApplication({
                product: 'UNIT4'
            });
            mobileApp.applicationSelector = 'mobileappspot';
            mobileApp.injectMobileApp();
            expect(div.querySelector('mobileapplicationcontainer')).theTruth('The mobile application container was not found');
            div.parentElement.removeChild(div);

        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });;
    });


    it(' the injected mobile application container will have a controller attached', function (done) {
        MEPH.requires('MEPH.util.Dom').then(function () {
            return MEPH.create('MEPH.mobile.Application').then(function ($class) {
                var div = document.createElement('mobileappspot'),
                   mobileApp,
                   result,
                   mobileAppContainer;
                document.body.appendChild(div);
                mobileApp = MEPH.App.mobileApplication({
                    product: 'UNIT4'
                });
                mobileApp.applicationSelector = 'mobileappspot';
                mobileApp.injectMobileApp();
                mobileAppContainer = div.querySelector('mobileapplicationcontainer');
                result = MEPH.util.Dom.tryParseAttributeJson(mobileAppContainer.getAttribute(MEPH.dataObjectReferenceAttribute));
                expect(result.controller || result.ct$).theTruth('The mobile application container did not have a controller attached.');
                div.parentElement.removeChild(div);

            });
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });
});