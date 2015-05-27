describe("MEPH/audio/sbsms/TrackPoint.spec.js", 'MEPH.audio.sbsms.TrackPoint', function () {
    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });

    it('can create an TrackPoint', function () {
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

        expect(audio).toBeTruthy();
    });

});