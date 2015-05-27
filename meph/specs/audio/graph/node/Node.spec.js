describe("MEPH/audio/graph/node/Node.spec.js", 'MEPH.audio.graph.node.Node', function () {
    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });

    it('can create an audio', function () {
        var node = new MEPH.audio.graph.node.Node();

        expect(node).toBeTruthy();
    });
});