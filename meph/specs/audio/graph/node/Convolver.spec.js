describe("MEPH/audio/graph/node/Convolver.spec.js", 'MEPH.audio.graph.node.Convolver', function () {
    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });

    it('can create a convolver node', function () {
        var convolver = new MEPH.audio.graph.node.Convolver();

        expect(convolver).toBeTruthy();
    });

    it('has buffer and normalize inputs ', function () {
        var convolver = new MEPH.audio.graph.node.Convolver();

        var buffer = convolver.nodeInputs.some(function (x) { return x.name === 'buffer' });
        var normalize = convolver.nodeInputs.some(function (x) { return x.name === 'normalize' });

        expect(buffer).toBeTruthy();
        expect(normalize).toBeTruthy();
    })

    it('has buffer and normalize inputs ', function () {
        var convolver = new MEPH.audio.graph.node.Convolver();

        var output = convolver.nodeOutputs.some(function (x) { return x.name === 'buffer' });

        expect(output).toBeTruthy();
    })
});