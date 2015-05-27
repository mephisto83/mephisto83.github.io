describe("MEPH/audio/graph/node/BiquadFilter.spec.js", 'MEPH.audio.graph.node.BiquadFilter', function () {
    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });

    it('can create a BiquadFilter node', function () {
        var BiquadFilter = new MEPH.audio.graph.node.BiquadFilter();

        expect(BiquadFilter).toBeTruthy();
    });

    it('has buffer and normalize inputs ', function () {
        var BiquadFilter = new MEPH.audio.graph.node.BiquadFilter();

        var buffer = BiquadFilter.nodeInputs.some(function (x) { return x.name === 'q' });
        var normalize = BiquadFilter.nodeInputs.some(function (x) { return x.name === 'frequency' });

        expect(BiquadFilter.nodeInputs.some(function (x) { return x.name === 'gain' })).toBeTruthy();
        expect(BiquadFilter.nodeInputs.some(function (x) { return x.name === 'type' })).toBeTruthy();
        expect(BiquadFilter.nodeInputs.some(function (x) { return x.name === 'buffer' })).toBeTruthy();
        expect(BiquadFilter.nodeInputs.some(function (x) { return x.name === 'detune' })).toBeTruthy();
        expect(buffer).toBeTruthy();
        expect(normalize).toBeTruthy();
    })

    it('has buffer and normalize inputs ', function () {
        var BiquadFilter = new MEPH.audio.graph.node.BiquadFilter();

        var output = BiquadFilter.nodeOutputs.some(function (x) { return x.name === 'buffer' });

        expect(output).toBeTruthy();
    })
});