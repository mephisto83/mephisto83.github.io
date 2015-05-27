describe("MEPH/mobile/providers/viewprovider/ViewProvider.spec.js", function () {
    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });

    it('can create mobile view provider.', function (done) {
        //Arrange
        MEPH.create('MEPH.mobile.providers.viewprovider.ViewProvider').then(function ($class) {

            //Act
            var instance = new $class();

            //Assert
            expect(instance).theTruth('a mobileviewprovider couldnt be created');

        }).catch(function (error) {
            if (error) {
                expect(error).caught();
            }
        }).then(function () {
            done();
        });
    });

    it('can retrieve a set of view data ', function (done) {
        //Arrange
        MEPH.create('MEPH.mobile.providers.viewprovider.ViewProvider').then(function ($class) {
            var viewprovider = new $class({
                viewsResource: {
                    uri: 'Views.json',
                    path: 'dataviews',
                    preload: false
                }
            });
            //Act
            return viewprovider.load().then(function (rawdata) {
                expect(rawdata).theTruth('the mobileviewprovider is not loading the data');
            });

        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });

    it('can get view from provider', function (done) {
        //Arrange
        MEPH.create('MEPH.mobile.providers.viewprovider.ViewProvider').then(function ($class) {
            var viewprovider = new $class({
                viewsResource: {
                    uri: 'Views.json',
                    path: 'dataviews',
                    preload: false
                }
            });
            //Act
            return viewprovider.getView({ viewId: '4UHP001' }).then(function (viewconfig) {
                expect(viewconfig).theTruth('The view config was not retrieved');
            });

        }).catch(function (error) {
            expect(error).caught();
        }).then(function (x) {
            done();
        });
    });

    it('can get all views from provider', function (done) {
        //Arrange
        MEPH.create('MEPH.mobile.providers.viewprovider.ViewProvider').then(function ($class) {

            var viewprovider = new $class({
                viewsResource: {
                    uri: 'Views.json',
                    path: 'dataviews',
                    preload: false
                }
            });
            //Act
            return viewprovider.getViews().then(function (views) {
                expect(views.length > 0).theTruth('The view config was not retrieved');
            });

        }).catch(function (error) {
            expect(error).caught();
        }).then(function (x) {
            done();
        });
    });

    it('if there is not configuration , the load promise will fail', function (done) {
        //Arrange
        MEPH.create('MEPH.mobile.providers.viewprovider.ViewProvider').then(function ($class) {
            var viewprovider = new $class();
            //Act
            return viewprovider.load().then(function () {
                expect(false).theTruth('the view provider should have failed the load');
            });

        }).catch(function (error) {
            expect(error).caught();
        }).then(function (x) {
            done();
        });
    });
});