describe("MEPH/audio/soundfont/chunks/data/GeneratorRecord.spec.js", 'MEPH.audio.soundfont.chunks.data.GeneratorRecord', function () {
    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });

    it('can create an zonerecord', function () {
        var generatorrecord= new MEPH.audio.soundfont.chunks.data.GeneratorRecord();

        expect(generatorrecord).toBeTruthy();
    });

});