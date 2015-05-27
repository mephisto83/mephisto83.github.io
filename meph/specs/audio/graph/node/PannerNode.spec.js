describe("MEPH/audio/graph/node/PannerNode.spec.js", 'MEPH.audio.graph.node.PannerNode', function () {
    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });

    it('can create a PannerNode node', function () {
        var PannerNode = new MEPH.audio.graph.node.PannerNode();

        expect(PannerNode).toBeTruthy();
    });

    it('has buffer and normalize inputs ', function () {
        var PannerNode = new MEPH.audio.graph.node.PannerNode();

        expect(PannerNode.nodeInputs.some(function (x) { return x.name === 'coneInnerAngle' })).toBeTruthy();
        expect(PannerNode.nodeInputs.some(function (x) { return x.name === 'coneOuterAngle' })).toBeTruthy();
        expect(PannerNode.nodeInputs.some(function (x) { return x.name === 'coneOuterGain' })).toBeTruthy();
        expect(PannerNode.nodeInputs.some(function (x) { return x.name === 'distanceModel' })).toBeTruthy();
        expect(PannerNode.nodeInputs.some(function (x) { return x.name === 'panningModel' })).toBeTruthy();
        expect(PannerNode.nodeInputs.some(function (x) { return x.name === 'refDistance' })).toBeTruthy();
        expect(PannerNode.nodeInputs.some(function (x) { return x.name === 'rolloffFactor' })).toBeTruthy();
    })

    it('has buffer and normalize inputs ', function () {
        var PannerNode = new MEPH.audio.graph.node.PannerNode();

        var output = PannerNode.nodeOutputs.some(function (x) { return x.name === 'buffer' });

        expect(output).toBeTruthy();
    })
});