describe("MEPH/audio/soundfont/chunks/data/ZoneRecord.spec.js", 'MEPH.audio.soundfont.chunks.data.ZoneRecord', function () {
    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });

    it('can create an zonerecord', function () {
        var sfobject = new MEPH.audio.soundfont.chunks.data.ZoneRecord();

        expect(sfobject).toBeTruthy();
    });

});