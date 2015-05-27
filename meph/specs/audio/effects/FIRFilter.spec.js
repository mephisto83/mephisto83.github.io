describe("MEPH/audio/effects/FIRFilter.spec.js", 'MEPH.audio.effects.FIRFilter', function () {
    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });

    it('can create an FIRFilter', function () {
        var filter = new MEPH.audio.effects.FIRFilter();

        expect(filter).toBeTruthy();
    });
});