describe("MEPH/audio/graph/node/DynamicsCompressorNode.spec.js", 'MEPH.audio.graph.node.DynamicsCompressorNode', function () {
    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });

    it('can create a DynamicsCompressorNode node', function () {
        var DynamicsCompressorNode = new MEPH.audio.graph.node.DynamicsCompressorNode();

        expect(DynamicsCompressorNode).toBeTruthy();
    });

    it('has buffer and normalize inputs ', function () {
        var DynamicsCompressorNode = new MEPH.audio.graph.node.DynamicsCompressorNode();

        expect(DynamicsCompressorNode.nodeInputs.some(function (x) { return x.name === 'buffer' })).toBeTruthy();
        expect(DynamicsCompressorNode.nodeInputs.some(function (x) { return x.name === 'attack' })).toBeTruthy();
        expect(DynamicsCompressorNode.nodeInputs.some(function (x) { return x.name === 'knee' })).toBeTruthy();
        expect(DynamicsCompressorNode.nodeInputs.some(function (x) { return x.name === 'ratio' })).toBeTruthy();
        expect(DynamicsCompressorNode.nodeInputs.some(function (x) { return x.name === 'reduction' })).toBeTruthy();
        expect(DynamicsCompressorNode.nodeInputs.some(function (x) { return x.name === 'release' })).toBeTruthy();
        expect(DynamicsCompressorNode.nodeInputs.some(function (x) { return x.name === 'threshold' })).toBeTruthy();
    })

    it('has buffer and normalize inputs ', function () {
        var DynamicsCompressorNode = new MEPH.audio.graph.node.DynamicsCompressorNode();

        var output = DynamicsCompressorNode.nodeOutputs.some(function (x) { return x.name === 'buffer' });

        expect(output).toBeTruthy();
    })
});