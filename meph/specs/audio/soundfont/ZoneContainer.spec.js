//MEPH.audio.soundfont.ZoneContainer
describe("MEPH/audio/soundfont/ZoneContainer.spec.js", function () {
    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });

    it('can create an zonecontainer', function (done) {
        MEPH.requires('MEPH.audio.soundfont.ZoneContainer').then(function () {
            var zonecontainer = new MEPH.audio.soundfont.ZoneContainer();

            expect(zonecontainer).toBeTruthy();
        }).catch(function(e){
            expect(e).caught();
        }).then(function(){
            done();
        });
    });

});