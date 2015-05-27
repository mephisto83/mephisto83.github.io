describe("MEPH/mobile/services/MobileServices.spec.js", function () {
    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });

    it('can create mobile services.', function (done) {
        //Arrange
        MEPH.create('MEPH.mobile.services.MobileServices').then(function () {
            try {
                //Act
                expect(MEPH.mobile.services.MobileServices).theTruth('Mobiles services do not exist');
                //Assert
            }
            catch (error) {
                if (error) {
                    expect(error).caught();
                }
            }
            finally {
                done();
            }
        });
    })


    it('a mobile service can return a service instance', function (done) {
        var called;
        MEPH.requires('MEPH.mobile.services.MobileServices').then(function () {
            return MEPH.define('Fake.Service', {})
        }).then(function () {

            return MEPH.IOC.register({
                name: 'serviceName',
                type: 'Fake.Service',
                config: {}
            });
        }).then(function () {
            return MEPH.MobileServices.get('serviceName');
        }).then(function (instance) {
            expect(instance instanceof Fake.Service).theTruth('The instance was not an instanceof Fake.Service');
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            MEPH.undefine('Fake.Service');
            done();
        });
    });


    it('if there is no definition , null is returned.', function (done) {
        var called;
        MEPH.requires('MEPH.mobile.services.MobileServices').then(function () {
            return MEPH.define('Fake.Service', {})
        }).then(function () {
            return MEPH.MobileServices.get('fserviceName');
        }).then(function (instance) {
            expect(instance === null).theTruth('a service should not have been found.');
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            MEPH.undefine('Fake.Service');
            done();
        });
    });

});