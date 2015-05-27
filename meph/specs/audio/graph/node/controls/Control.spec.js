describe("MEPH/audio/graph/node/controls/Control.spec.js", 'MEPH.audio.graph.node.controls.Control', function () {
    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });

    it('can create a control node', function () {
        var control = new MEPH.audio.graph.node.controls.Control();

        expect(control).toBeTruthy();
    });
});