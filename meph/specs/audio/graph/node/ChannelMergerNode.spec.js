describe("MEPH/audio/graph/node/ChannelMergerNode.spec.js", 'MEPH.audio.graph.node.ChannelMergerNode', function () {
    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });

    it('can create a ChannelMergerNode node', function () {
        var ChannelMergerNode = new MEPH.audio.graph.node.ChannelMergerNode();

        expect(ChannelMergerNode).toBeTruthy();
    });

    it('has buffer and normalize inputs ', function () {
        var ChannelMergerNode = new MEPH.audio.graph.node.ChannelMergerNode();

        expect(ChannelMergerNode.nodeInputs.some(function (x) { return x.name === 'buffer' })).toBeTruthy();
    })

    it('has buffer and normalize inputs ', function () {
        var ChannelMergerNode = new MEPH.audio.graph.node.ChannelMergerNode();

        var output = ChannelMergerNode.nodeOutputs.some(function (x) { return x.name === 'buffer' });

        expect(output).toBeTruthy();
    })
});