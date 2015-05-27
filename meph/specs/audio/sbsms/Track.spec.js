describe("MEPH/audio/sbsms/Track.spec.js", 'MEPH.audio.sbsms.Track', function () {
    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });
    var createtrackpoint = function () {
        var slice = {};
        var peak = [].interpolate(0, 10);
        var gx = [].interpolate(0, 10, function () {
            return [].interpolate(0, 10), [].interpolate(0, 10);
        });;
        var mag = [].interpolate(0, 10)
        var mag2 = [].interpolate(0, 10);
        var k = 3;
        var N = 4;
        var band = 0;
        var audio = new MEPH.audio.sbsms.TrackPoint(slice, peak, gx, mag, mag2, k, N, band);
        return audio;
    }
    it('can create an Track', function () {
        var p = createtrackpoint();
        var h = 0;
        var index = {};
        var time = {};;
        var bStitch = false;
        //float h, TrackIndexType index, TrackPoint *p, const TimeType &time, bool bStitch
        var audio = new MEPH.audio.sbsms.Track(h, index, p, time, bStitch);

        expect(audio).toBeTruthy();
    });

});