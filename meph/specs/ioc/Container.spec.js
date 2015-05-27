describe("MEPH/ioc/Container.spec.js", function () {
    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });

    it('ioc services are available.', function (done) {
        MEPH.requires('MEPH.ioc.Container').then(function () {
            expect(MEPH.ioc.Container).theTruth('The IOC Container is not available');
        }).catch(function (error) {
            expect(error).caught();
        }).then(function (x) {
            done();
        });
    })

    it(' services can be registered with the container', function (done) {
        //Arrange
        MEPH.requires('MEPH.ioc.Container').then(function () {
            //Act
            return MEPH.IOC.register({
                name: 'serviceName',
                type: 'serviceType',
                config: 'serviceConfig'
            }).then(function () {
                var services = MEPH.IOC.getServices();
                expect(services.first(function (x) { return x.name === 'serviceName' })).theTruth('The service was not found');

                MEPH.IOC.unregister('serviceName');

            });
        }).catch(function (error) {
            expect(error).caught();
        }).then(function (x) {
            MEPH.IOC.clearServices();
            done();
        });
    });

    it('services can be unregistered', function (done) {
        //Arrange
        MEPH.requires('MEPH.ioc.Container').then(function () {
            //Act
            return MEPH.IOC.register({
                name: 'serviceName',
                type: 'serviceType',
                config: 'serviceConfig'
            }).then(function () {
                var services = MEPH.IOC.getServices();
                expect(services.first().name === 'serviceName').theTruth('The service was not found');
                MEPH.IOC.unregister('serviceName');

            });

        }).catch(function (error) {
            expect(error).caught();
        }).then(function (x) {
            MEPH.IOC.clearServices();
            done();
        });
    });

    it(' a service can be registered twice, but will raise an event when changed', function (done) {
        MEPH.requires('MEPH.ioc.Container', 'MEPH.Constants').then(function () {
         
                var changed,
                    id = MEPH.subscribe(MEPH.Constants.serviceTypeChanged, function (options) {
                        changed = true;
                    });
                MEPH.IOC.register({
                    name: 'servicename',
                    type: 'serviceType',
                    config: 'serviceconfig'
                }).then(function () {
                    return MEPH.IOC.register({
                        name: 'servicename',
                        type: 'serviceType2',
                        config: 'serviceconfig'
                    });
                }).then(function () {
                    expect(changed).theTruth('The service change wasnt registered.');
                    MEPH.IOC.unregister('servicename');
                }); 
        }).catch(function (error) {
            expect(error).caught();
        }).then(function (x) {
            MEPH.IOC.clearServices();
            done();
        });
    });
});