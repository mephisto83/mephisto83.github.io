describe("MEPH/audio/graph/node/WaveShaperNode.spec.js", 'MEPH.audio.graph.node.WaveShaperNode', function () {
    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });

    it('can create a WaveShaperNode node', function () {
        var WaveShaperNode = new MEPH.audio.graph.node.WaveShaperNode();

        expect(WaveShaperNode).toBeTruthy();
    });

    it('has buffer and normalize inputs ', function () {
        var WaveShaperNode = new MEPH.audio.graph.node.WaveShaperNode();

        expect(WaveShaperNode.nodeInputs.some(function (x) { return x.name === 'buffer' })).toBeTruthy();
        expect(WaveShaperNode.nodeInputs.some(function (x) { return x.name === 'curve' })).toBeTruthy();
        expect(WaveShaperNode.nodeInputs.some(function (x) { return x.name === 'oversample' })).toBeTruthy();
    })

    it('has buffer and normalize inputs ', function () {
        var WaveShaperNode = new MEPH.audio.graph.node.WaveShaperNode();

        var output = WaveShaperNode.nodeOutputs.some(function (x) { return x.name === 'buffer' });

        expect(output).toBeTruthy();
    })
});