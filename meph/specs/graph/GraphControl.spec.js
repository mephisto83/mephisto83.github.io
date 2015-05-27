describe("MEPH/graph/GraphControl.spec.js", function () {

    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });


    it("can create a graph control", function (done) {
        MEPH.requires('MEPH.graph.GraphControl').then(function () {
            var graphcontrol = new MEPH.graph.GraphControl()

            expect(graphcontrol).toBeTruthy();
        }).catch(function (error) {
            expect(error).caught();
        }).then(function (x) {
            done();
        });
    });

    it("can add a node", function (done) {
        MEPH.requires('MEPH.graph.GraphControl').then(function () {
            var graphcontrol = new MEPH.graph.GraphControl()

            graphcontrol.addNode(new MEPH.graph.Node());

            expect(graphcontrol.getNodes().length === 1).toBeTruthy();

        }).catch(function (error) {
            expect(error).caught();
        }).then(function (x) {
            done();
        });
    });
});