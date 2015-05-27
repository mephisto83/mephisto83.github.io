describe("MEPH/audio/soundfont/chunks/data/operators/KeyRange.spec.js", 'MEPH.audio.soundfont.chunks.data.operators.KeyRange', function () {
    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });

    it('can create an keyrange', function () {
        var keyrange = new MEPH.audio.soundfont.chunks.data.operators.KeyRange([1, 2, 3, 4]);

        expect(keyrange).toBeTruthy();
    });

});