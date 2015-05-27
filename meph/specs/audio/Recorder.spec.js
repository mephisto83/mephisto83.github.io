describe("MEPH/audio/Recorder.spec.js", 'MEPH.audio.Recorder', function () {
    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });

    it('can create a recorder', function () {
        var recorder = new MEPH.audio.Recorder();

        expect(recorder).toBeTruthy();
    });

    it('can record an audiobuffer ', function (done) {

        var audiofile = '../specs/data/The_Creek.mp3', audiofiletyp = 'mp3';

        var audio = new MEPH.audio.Audio();

        audio.load(audiofile, audiofiletyp).then(function (resource) {
            var recorder = new MEPH.audio.Recorder();
            recorder.setup({
                type: 'audio/wav',
                sampleRate: resource.buffer.buffer.sampleRate
            }).clear();

            var res = recorder.record([resource.buffer.buffer.getChannelData(0), resource.buffer.buffer.getChannelData(1)])
            .exportWAV({
                type: 'audio/wav'
            });
            
            expect(res).toBeTruthy();
        }).catch(function (e) {
            expect(e).caught();
        }).then(done);
    });

    it('can listen to request for recordings', function () {
        var called,
            recorder = new MEPH.audio.Recorder();
        
        recorder.requestRecording = function () {
            called = true;
        }
        MEPH.publish(MEPH.audio.Constants.REQUEST_RECORDING, {});

        expect(called).toBeTruthy();
    })
});