describe("MEPH/audio/sbsms/Util.spec.js", 'MEPH.audio.sbsms.Util', function () {
    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });

    it('can create an audio', function () {
        var audio = new MEPH.audio.sbsms.Util();

        expect(audio).toBeTruthy();
    });

});