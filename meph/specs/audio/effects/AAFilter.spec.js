describe("MEPH/audio/effects/AAFilter.spec.js", 'MEPH.audio.effects.AAFilter', function () {
    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });

    it('can create an AAFilter', function () {
        var filter = new MEPH.audio.effects.AAFilter(64);

        expect(filter).toBeTruthy();
    });
});