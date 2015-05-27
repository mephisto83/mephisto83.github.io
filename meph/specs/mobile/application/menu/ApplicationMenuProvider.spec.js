describe("MEPH/mobile/application/menu/ApplicationMenuProvider.spec.js", function () {

    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });

    it('can create an application menu provider.', function (done) {
        MEPH.create('MEPH.mobile.application.menu.ApplicationMenuProvider').then(function ($class) {
            var menu = new $class();

            expect(menu).theTruth('the application menu provider was not created.');

        }).catch(function (error) {
            expect(error).caught();
        }).then(function (x) {
            done();
        });
    });

    it(' an application menu provider , shall receive a list of the providers it will hold', function (done) {
        var called;
        MEPH.requires('MEPH.mobile.services.MobileServices').then(function () {
            return MEPH.define('Fake.Service', {
                getCollection: function () {
                    called = true;
                }
            });
        }).then(function () {
            return MEPH.IOC.register({
                name: 'aservice',
                type: 'Fake.Service',
                config: {}
            });
        }).then(function () {
            return MEPH.create('MEPH.mobile.application.menu.ApplicationMenuProvider').then(function ($class) {
                var menu = new $class({
                    providers: ['aservice']
                });

                expect(menu).theTruth('the application menu provider was not created.');
                return menu.getMenuItemProviders().then(function (result) {
                    
                    expect(result.length === 1).theTruth('the result was incorrect.');
                });
            });
        }).catch(function (error) {
            expect(error).caught();
        }).then(function (x) {
            MEPH.undefine('Fake.Service');
            done();
        });
    });

    it('will return an array of providers when getProviders is called', function () {

    });
});