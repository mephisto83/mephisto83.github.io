describe("MEPH/audio/sbsms/Slice.spec.js", 'MEPH.audio.sbsms.Slice', function () {
    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });

    it('can create an Slice', function () {
        var audio = new MEPH.audio.sbsms.Slice();

        expect(audio).toBeTruthy();
    });

});