describe("MEPH/audio/sbsms/SMS.spec.js", 'MEPH.audio.sbsms.SMS', function () {
    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });

    xit('can create an SMS', function () {
        var sms = new MEPH.audio.sbsms.SMS();

        expect(sms).toBeTruthy();
    });

});