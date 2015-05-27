describe("MEPH/audio/AudioResources.spec.js", 'MEPH.audio.AudioResources', function () {
    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });

    it('can create an audioresources', function () {
        var audioresources = new MEPH.audio.AudioResources();

        expect(audioresources).toBeTruthy();
    });

    it('can collect everything that needs to save into a string', function () {
        var audioresources = new MEPH.audio.AudioResources();
        var res = audioresources.collectProject();

        expect(res).toBeTruthy();
    });
});