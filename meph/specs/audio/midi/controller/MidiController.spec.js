describe("MEPH/audio/midi/controller/MidiController.spec.js", 'MEPH.audio.midi.controller.MidiController', function () {

    var MIDI_CONNECTED = false;
    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });
    it('can create an audio', function () {
        var audio = new MEPH.audio.midi.controller.MidiController();

        expect(audio).toBeTruthy();
    });

    describe('premade controller', function () {
        var controller;
        beforeEach(function () {
            controller = new MEPH.audio.midi.controller.MidiController();
        });
        it('can request midi controllers from the api', function (done) {
            controller.access().then(function (access) {
                expect(access).toBeTruthy();
            }).catch(function (e) {
                expect(e).caught();
            }).then(done);
        });

        it('can access midi input devices, and place them in an array', function (done) {
            controller.access().then(function () {
                return controller.inputs().then(function (res) {
                    expect(res).toBeTruthy();
                });
            }).catch(function (e) { expect(e).caught(); }).then(done);
        });

        it('can access midi output devices, and place them in an array', function (done) {
            controller.access().then(function () {
                return controller.outputs().then(function (res) {
                    expect(res).toBeTruthy();
                });
            }).catch(function (e) { expect(e).caught(); }).then(done);
        });

        it('can list the inputs and outputs ', function (done) {
            controller.access().then(function () {
                return controller.list().then(function (res) {
                    expect(res).toBeTruthy();
                    expect(Array.isArray(res));
                });
            }).catch(function (e) { expect(e).caught(); }).then(done);
        });

        if (MIDI_CONNECTED)
            describe('premade controller', function () {
                it('adds listeners to midi interfaces ', function (done) {
                    var called = false;
                    controller.list().then(function () {
                        return new Promise(function (res) {
                            controller.on('midimessage', function () {
                                called = true;
                                res();
                            });
                        });
                    }).then(function () {
                        expect(called).toBeTruthy();
                    }).catch(function (e) { expect(e).caught(); }).then(done);
                });

                it('can auto midi setup', function (done) {
                    controller.auto().then(function (scope) {
                        expect(scope.noteOn).toBeTruthy();
                        expect(typeof scope.noteOn === 'function').toBeTruthy();

                        expect(scope.noteOff).toBeTruthy();
                        expect(typeof scope.noteOff === 'function').toBeTruthy();
                    }).catch(function (e) { expect(e).caught(); }).then(done);
                });
            });
    });
});