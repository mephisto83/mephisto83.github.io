describe("MEPH/audio/graph/node/InputNode.spec.js", 'MEPH.audio.graph.node.InputNode', function () {
    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });

    it('can create a InputNode node', function () {
        var InputNode = new MEPH.audio.graph.node.InputNode();

        expect(InputNode).toBeTruthy();
    });

    it('has buffer and normalize inputs ', function () {
        var InputNode = new MEPH.audio.graph.node.InputNode();

        expect(InputNode.nodeOutputs.some(function (x) { return x.name === 'buffer' })).toBeTruthy();
    })

});