describe("MEPH/session/ServiceCaller.spec.js", function () {

    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });

    it('can create a ServiceCaller.', function (done) {
        MEPH.create('MEPH.service.ServiceCaller').then(function ($class) {
            var servicecaller = new $class();

            expect(servicecaller).theTruth('there should be a service caller instance ');
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });

    it('can set the default resource service endpoint', function (done) {

        MEPH.create('MEPH.service.ServiceCaller').then(function ($class) {
            var servicecaller = new $class();

            servicecaller.setDefaultResourceEndpoint('defaultendpoint');

            expect(servicecaller.getDefaultResourceEndpoint() === 'defaultendpoint').theTruth('the default end point wasnt as expected');

        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });

    it(' a defaultServiceEndpoint can be set in initialization of the serviceCaller instance ', function (done) {
        MEPH.create('MEPH.service.ServiceCaller').then(function ($class) {
            var servicecaller = new $class({
                defaultResourceEndpoint: 'defaultendpoint'
            });



            expect(servicecaller.getDefaultResourceEndpoint() === 'defaultendpoint').theTruth('the default end point wasnt as expected');

        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });

    it('can set the api path', function (done) {
        MEPH.create('MEPH.service.ServiceCaller').then(function ($class) {
            var servicecaller = new $class();
            servicecaller.setApiPath('api');

            expect(servicecaller.getApiPath() === 'api').theTruth('The api was not as expected');
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });

    it('the api path can be set during initlization', function (done) {
        MEPH.create('MEPH.service.ServiceCaller').then(function ($class) {
            var servicecaller = new $class({ apiPath: 'api' });

            expect(servicecaller.getApiPath() === 'api').theTruth('The api was not as expected');
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });

    it(' will call service', function (done) {
        var ajax = MEPH.ajax;
        MEPH.create('MEPH.service.ServiceCaller').then(function ($class) {
            var servicecaller = new $class({ apiPath: 'api/', defaultResourceEndpoint: 'http://localhost/' });
            MEPH.ajax = function (path) {
                return Promise.resolve().then(function () {
                    return 'http://localhost/api/fieldforce/mobile/serviceorders/en' === path ? 'called' : false;
                });
            }
            return servicecaller.call('fieldforce/mobile/serviceorders/en').then(function (x) {
                expect(x === 'called').theTruth('the service caller didnt get the value expected');
            });
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            MEPH.ajax = ajax;
            done();
        });
    });


})