describe("MEPH/panel/Panel.spec.js", function () {

    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });

    it('can create a panel.', function (done) {
        MEPH.create('MEPH.panel.Panel').then(function ($class) {
            var panel = new $class();
            expect(panel).theTruth('the panel was no created');
        }).catch(function (error) {
            if (error) {
                expect(error).caught()
            }
        }).then(function () {
            done();
        });;
    });

})