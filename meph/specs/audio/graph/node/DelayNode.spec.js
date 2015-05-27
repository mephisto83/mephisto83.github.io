describe("MEPH/audio/graph/node/DelayNode.spec.js", 'MEPH.audio.graph.node.DelayNode', function () {
    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });

    it('can create a DelayNode node', function () {
        var DelayNode = new MEPH.audio.graph.node.DelayNode();

        expect(DelayNode).toBeTruthy();
    });

    it('has buffer and normalize inputs ', function () {
        var DelayNode = new MEPH.audio.graph.node.DelayNode();

        var buffer = DelayNode.nodeInputs.some(function (x) { return x.name === 'buffer' });
        var normalize = DelayNode.nodeInputs.some(function (x) { return x.name === 'delayTime' });

        expect(buffer).toBeTruthy();
        expect(normalize).toBeTruthy();
    })

    it('has buffer and normalize inputs ', function () {
        var DelayNode = new MEPH.audio.graph.node.DelayNode();

        var output = DelayNode.nodeOutputs.some(function (x) { return x.name === 'buffer' });

        expect(output).toBeTruthy();
    })
});