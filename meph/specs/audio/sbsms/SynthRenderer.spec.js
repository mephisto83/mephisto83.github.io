describe("MEPH/audio/sbsms/SynthRenderer.spec.js", 'MEPH.audio.sbsms.SynthRenderer', function () {
    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });

    it('can create an SMS', function () {
        var sms = new MEPH.audio.sbsms.SynthRenderer();

        expect(sms).toBeTruthy();
    });

});