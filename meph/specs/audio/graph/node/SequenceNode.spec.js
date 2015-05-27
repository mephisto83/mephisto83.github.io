describe("MEPH/audio/graph/node/SequenceNode.spec.js", 'MEPH.audio.graph.node.SequenceNode', function () {
    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });

    it('can create a SequenceNode node', function () {
        var SequenceNode = new MEPH.audio.graph.node.SequenceNode();

        expect(SequenceNode).toBeTruthy();
    });

    it('has buffer and normalize inputs ', function () {
        var SequenceNode = new MEPH.audio.graph.node.SequenceNode();

        expect(SequenceNode.nodeOutputs.some(function (x) { return x.name === 'buffer' })).toBeTruthy();
    })

    it('has buffer and normalize inputs ', function () {
        var SequenceNode = new MEPH.audio.graph.node.SequenceNode();

        var output = SequenceNode.nodeOutputs.some(function (x) { return x.name === 'buffer' });

        expect(output).toBeTruthy();
    })
});