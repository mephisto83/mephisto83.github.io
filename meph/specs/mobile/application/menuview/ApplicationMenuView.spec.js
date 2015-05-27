describe("MEPH/mobile/application/menuview/ApplicationMenuView.spec.js", function () {

    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });

    it('can create a applicationmenuview instance ', function (done) {
        MEPH.requires('MEPH.mobile.application.menuview.ApplicationMenuView').then(function ($class) {
            expect(new MEPH.mobile.application.menuview.ApplicationMenuView()).theTruth('the applicationmenuview didnt create an instance');
        }).catch(function (error) {
            expect(new Error('something when wrong when trying to create a applicatiomenuview')).caught();
        }).then(function (x) {
            done();
        });
    });

    it('application menu will get the menuinformation from a menu provider, when load is called.', function (done) {

        MEPH.requires('MEPH.mobile.application.menuview.ApplicationMenuView', 'MEPH.application.Application', 'MEPH.mobile.providers.menuprovider.MenuProvider', 'MEPH.mobile.activity.ActivityController',
                     'MEPH.mobile.services.MobileServices', 'MEPH.ioc.Container').then(function () {

                         return MEPH.IOC.register({
                             name: 'menuProvider',
                             type: 'MEPH.mobile.providers.menuprovider.MenuProvider',
                             config: {
                                 viewsResource: {
                                     uri: 'Menu.json',
                                     path: 'dataviews',
                                     preload: false
                                 },
                                 root: 'menu'
                             }
                         });

                     }).then(function () {
                         var applicationmenuview = new MEPH.mobile.application.menuview.ApplicationMenuView();
                         return applicationmenuview.loadMenu().then(function () {
                             var data = applicationmenuview.getMenuData();
                             expect(data).theTruth('There was no data');
                         });
                     }).catch(function (error) {
                         expect(new Error('something when wrong ')).caught();
                     }).then(function (x) {
                         done();
                     });
    });
});