describe("MEPH/session/SignalRService.spec.js", function () {

    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });

    it('can create a SignalRService.', function (done) {
        MEPH.create('MEPH.service.SignalRService').then(function ($class) {
            var servicecaller = new $class();

            expect(servicecaller).theTruth('there should be a service caller instance ');
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });
    var setuphub = function () {
        MEPH.namespace('$.hub.server');
        MEPH.namespace('$.connection.hub');
        $.hub.server.sendAll = function () {
        };
        $.hub.client = {
            broadcastMessage: null
        };

        $.connection.hub.start = function () {
            return {
                done: function (callback) {
                    Promise.resolve().then(callback);
                    return {
                        fail: function () {

                        }
                    }
                }
            }
        };
    }
    setuphub();
    it('can start the signalrservice ', function (done) {
        var servicecaller;
        MEPH.create('MEPH.service.SignalRService').then(function ($class) {
            servicecaller = new $class({ hubPath: '$.hub' });
            return servicecaller.start();
        }).then(function () {
            expect(servicecaller.state === MEPH.service.SignalRService.state.started).theTruth('the expected state wasnt found');
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });

    it('if signalrservice isnt running yet, messages get stored in the queue', function (done) {
        var servicecaller;
        MEPH.create('MEPH.service.SignalRService').then(function ($class) {
            servicecaller = new $class({ hubPath: '$.hub' });
            return servicecaller.sendMessage({ message: true }, 'id');
        }).then(function () {
            expect(servicecaller.messages.length === 1).theTruth('message length wasnt as expected');
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });


    it('if signalrservice is running , messages are removed when sent.', function (done) {
        var servicecaller;
        MEPH.create('MEPH.service.SignalRService').then(function ($class) {
            servicecaller = new $class({ hubPath: '$.hub' });
            return servicecaller.start();
        }).then(function () {
            return servicecaller.sendMessage({ message: true }, 'id');
        }).then(function () {
            expect(servicecaller.messages.length === 0).theTruth('message length wasnt as expected');
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });

    it(' when the signalrservice is running, messages in the queue are sent ', function (done) {
        var servicecaller;
        MEPH.create('MEPH.service.SignalRService').then(function ($class) {
            servicecaller = new $class({ hubPath: '$.hub' });
        }).then(function () {
            return servicecaller.sendMessage({ message: true }, 'id');
        }).then(function () {
            return servicecaller.start();
        }).then(function () {
            expect(servicecaller.messages.length === 0).theTruth('message length wasnt as expected');
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });

    it('when a message is received, it is routed to a specific channe', function (done) {
        var servicecaller;
        MEPH.create('MEPH.service.SignalRService').then(function ($class) {
            servicecaller = new $class({ hubPath: '$.hub' });
        }).then(function () {
            return servicecaller.start();
        }).then(function () {
            var promise = new Promise(function (resolve, fail) {
                servicecaller.channel('id', function (message) {
                    resolve();
                });
                $.hub.client.broadcastMessage(JSON.stringify({ channelId: 'id', id: 'id', message: {} }));
            });
            return promise;
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });

});