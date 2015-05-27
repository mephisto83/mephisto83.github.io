describe("MEPH/audio/graph/node/AudioBufferSourceNode.spec.js", 'MEPH.audio.graph.node.AudioBufferSourceNode', function () {
    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });

    it('can create a AudioBufferSourceNode node', function () {
        var AudioBufferSourceNode = new MEPH.audio.graph.node.AudioBufferSourceNode();

        expect(AudioBufferSourceNode).toBeTruthy();
    });

    it('has buffer and normalize inputs ', function () {
        var AudioBufferSourceNode = new MEPH.audio.graph.node.AudioBufferSourceNode();

        expect(AudioBufferSourceNode.nodeInputs.some(function (x) { return x.name === 'source' })).toBeTruthy();
        expect(AudioBufferSourceNode.nodeInputs.some(function (x) { return x.name === 'loop' })).toBeTruthy();
        expect(AudioBufferSourceNode.nodeInputs.some(function (x) { return x.name === 'loopEnd' })).toBeTruthy();
        expect(AudioBufferSourceNode.nodeInputs.some(function (x) { return x.name === 'loopStart' })).toBeTruthy();
        expect(AudioBufferSourceNode.nodeInputs.some(function (x) { return x.name === 'playbackRate' })).toBeTruthy();
        expect(AudioBufferSourceNode.nodeOutputs.some(function (x) { return x.name === 'buffer' })).toBeTruthy();
    })

    it('has buffer and normalize inputs ', function () {
        var AudioBufferSourceNode = new MEPH.audio.graph.node.AudioBufferSourceNode();

        var output = AudioBufferSourceNode.nodeOutputs.some(function (x) { return x.name === 'buffer' });

        expect(output).toBeTruthy();
    })
});