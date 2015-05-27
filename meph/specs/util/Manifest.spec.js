describe("MEPH/util/Manifest.spec.js", function () {

    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });
    it("can create manifest instance.", function (done) {
        MEPH.create('MEPH.util.Manifest').then(function ($class) {
            var manifest = new $class();

            expect(manifest).theTruth('the manifest was not created.');

        }).catch(function (error) {
            expect(error).caught();
        }).then(function (x) {
            done();
        });
    });

    it(' can get a list of all the views in the application', function (done) {
        MEPH.create('MEPH.util.Manifest').then(function ($class) {
            var manifest = new $class();

            expect(manifest).theTruth('the manifest was not created.');
            return manifest.getViews();
        }).then(function (viewsconfigs) {
            
            expect(viewsconfigs.length > 1).toBeTruthy();
        }).catch(function (error) {
            expect(error).caught();
        }).then(function (x) {
            done();
        });
    });

    it(' can load all the required classes of the views', function (done) {

        MEPH.create('MEPH.util.Manifest').then(function ($class) {
            var manifest = new $class();

            expect(manifest).theTruth('the manifest was not created.');
            return manifest.loadViews();
        }).then(function (viewsconfigs) {
            expect(viewsconfigs.classes.length > 1).toBeTruthy();
            expect(viewsconfigs.templates.length > 1).toBeTruthy();
        }).catch(function (error) {
            expect(error).caught();
        }).then(function (x) {
            done();
        });
    });
});