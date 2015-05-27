describe("MEPH/audio/sbsms/Subband.spec.js", 'MEPH.audio.sbsms.Subband', 'MEPH.audio.sbsms.SMS', function () {
    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });

    xit('can create an Subband', function () {

        //SubBand *parent, int band, int channels, SBSMSQuality *quality, bool bSynthesize
        var parent = null,
            band = 1,
            channels = 1,
            quality = {
                getMaxPresamples: function () { return 1; },
                params: {
                    bands: 1,
                    N: [].interpolate(0, 10),
                    N0: [].interpolate(0, 10),
                    N1: [].interpolate(0, 10),
                    N2: [].interpolate(0, 10),
                    res: [].interpolate(0, 10, function () { return 1 }),
                }
            }, bSynthesize = false;
        var subband = new MEPH.audio.sbsms.Subband(parent, band, channels, quality, bSynthesize);

        expect(subband).toBeTruthy();
    });

});