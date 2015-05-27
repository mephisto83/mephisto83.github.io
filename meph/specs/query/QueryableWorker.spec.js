describe("MEPH/query/QueryableWorker.spec.js", function () {

    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });

    it('can create a Remoting COntroller.', function (done) {

        MEPH.create('MEPH.query.QueryableWorker').then(function ($class) {
            var queryable = new $class();
            expect(queryable).theTruth('no queryable worker was created was created');
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });

    it('a queryable worker has an internal worker', function (done) {

        MEPH.create('MEPH.query.QueryableWorker').then(function ($class) {
            var queryable = new $class();
            expect(queryable.$worker).toBeTruthy();
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });

    it('a queryable work can initializes ', function (done) {
        MEPH.create('MEPH.query.QueryableWorker').then(function ($class) {
            var queryable = new $class();
            return queryable.ready().then(function (result) {

                expect(result).toBeTruthy();
            })
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });

    it('a queryable work can load code ', function (done) {
        MEPH.create('MEPH.query.QueryableWorker').then(function ($class) {
            var queryable = new $class();
            return queryable.ready().then(function (q) {
                return q.load('MEPH.query.QueryableWorker')
            }).then(function (result) {
                expect(result.success).toBeTruthy();
            }).catch(function () {
                expect(false).toBeTruthy();
            });
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });

    it(' can execute a static function from a class', function (done) {
        MEPH.create('MEPH.query.QueryableWorker').then(function ($class) {
            var queryable = new $class();
            return queryable.ready().then(function (q) {
                return q.load('MEPH.query.QueryableWorker')
            }).then(function (result) {
                return queryable.execute(function () {
                    var code = 1;
                    return code;
                }).then(function (result) {
                    expect(result === 1).toBeTruthy();
                });
            }).catch(function () {
                expect(false).toBeTruthy();
            });
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });

    it(' can execute an array function on', function (done) {
        MEPH.create('MEPH.query.QueryableWorker').then(function ($class) {
            var queryable = new $class();
            return queryable.ready().then(function (q) {
                return q.load('MEPH.query.QueryableWorker')
            }).then(function (result) {
                return queryable.execute(function () {
                    return [].interpolate(0, 1000, function (x) { return { x: x } });
                }).then(function (result) {
                    expect(result.length === 1000).toBeTruthy();
                });
            }).catch(function () {
                expect(false).toBeTruthy();
            });
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });

});