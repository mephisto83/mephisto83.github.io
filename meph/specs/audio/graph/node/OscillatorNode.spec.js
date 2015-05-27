describe("MEPH/audio/graph/node/OscillatorNode.spec.js", 'MEPH.audio.graph.node.OscillatorNode', function () {
    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });

    it('can create an audio', function () {
        var OscillatorNode = new MEPH.audio.graph.node.OscillatorNode();

        expect(OscillatorNode).toBeTruthy();
    });

    it('has buffer and normalize inputs ', function () {
        var OscillatorNode = new MEPH.audio.graph.node.OscillatorNode();

        expect(OscillatorNode.nodeInputs.some(function (x) { return x.name === 'buffer' })).toBeTruthy();
        expect(OscillatorNode.nodeInputs.some(function (x) { return x.name === 'detune' })).toBeTruthy();
        expect(OscillatorNode.nodeInputs.some(function (x) { return x.name === 'type' })).toBeTruthy();
        expect(OscillatorNode.nodeInputs.some(function (x) { return x.name === 'frequency' })).toBeTruthy();
    })

    it('has buffer and normalize inputs ', function () {
        var OscillatorNode = new MEPH.audio.graph.node.OscillatorNode();

        var output = OscillatorNode.nodeOutputs.some(function (x) { return x.name === 'buffer' });

        expect(output).toBeTruthy();
    })
});