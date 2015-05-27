//MEPH.audio.soundfont.SFObject
describe("MEPH/audio/soundfont", 'MEPH.audio.soundfont.SFObject', function () {
    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });

    it('can create an sfobject', function () {
        var sfobject = new MEPH.audio.soundfont.SFObject();

        expect(sfobject).toBeTruthy();
    });

});