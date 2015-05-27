describe("MEPH/audio/graph/node/ChannelSplitterNode.spec.js", 'MEPH.audio.graph.node.ChannelSplitterNode', function () {
    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });

    it('can create a ChannelSplitterNode node', function () {
        var ChannelSplitterNode = new MEPH.audio.graph.node.ChannelSplitterNode();

        expect(ChannelSplitterNode).toBeTruthy();
    });

    it('has buffer and normalize inputs ', function () {
        var ChannelSplitterNode = new MEPH.audio.graph.node.ChannelSplitterNode();

        expect(ChannelSplitterNode.nodeInputs.some(function (x) { return x.name === 'buffer' })).toBeTruthy();
    })

    it('has buffer and normalize inputs ', function () {
        var ChannelSplitterNode = new MEPH.audio.graph.node.ChannelSplitterNode();

        var output = ChannelSplitterNode.nodeOutputs.some(function (x) { return x.name === 'buffer' });

        expect(output).toBeTruthy();
    })
});