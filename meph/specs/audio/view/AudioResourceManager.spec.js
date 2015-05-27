describe("MEPH/audio/view/AudioResourceManager.spec.js", 'MEPH.audio.view.AudioResourceManager', function () {

    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });

    it("can create a AudioResourceManager", function () {
        //Arrange

        //Assert
        var manager = new MEPH.audio.view.AudioResourceManager();

        expect(manager).toBeTruthy();

    });

});