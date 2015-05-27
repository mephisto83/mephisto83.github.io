describe("MEPH/audio/graph/node/GainNode.spec.js", 'MEPH.audio.graph.node.GainNode', function () {
    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });

    it('can create a GainNode node', function () {
        var GainNode = new MEPH.audio.graph.node.GainNode();

        expect(GainNode).toBeTruthy();
    });

    it('has buffer and normalize inputs ', function () {
        var GainNode = new MEPH.audio.graph.node.GainNode();

        expect(GainNode.nodeInputs.some(function (x) { return x.name === 'buffer' })).toBeTruthy();
        expect(GainNode.nodeInputs.some(function (x) { return x.name === 'gain' })).toBeTruthy();   
        expect(GainNode.nodeOutputs.some(function (x) { return x.name === 'buffer' })).toBeTruthy();
    })

    it('has buffer and normalize inputs ', function () {
        var GainNode = new MEPH.audio.graph.node.GainNode();

        var output = GainNode.nodeOutputs.some(function (x) { return x.name === 'buffer' });

        expect(output).toBeTruthy();
    })
});