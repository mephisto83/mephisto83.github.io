describe("MEPH/util/Queryable.spec.js", function () {

    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });

    it('will make an array queryable', function (done) {
        MEPH.requires('MEPH.util.Queryable').then(function () {
            var array = [];
            MEPH.Queryable.queryable(array);
            expect(array.isQueryable).toBeTruthy();

        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });


    it(' a queryable array can execute on a select look on multiple threads', function (done) {
        MEPH.requires('MEPH.util.Queryable').then(function () {
            var array = [].interpolate(0, 1000, function (x) { return { x: x }; });
            MEPH.Queryable.queryable(array);
            expect(array.isQueryable).toBeTruthy();
            return array.query.select(function (x) { return x.x; }, 4).then(function (result) {
                expect(result).toBeTruthy();
                expect(result.length === 1000).toBeTruthy();
            });
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });



    it(' a queryable array can execute on a where look on multiple threads', function (done) {
        MEPH.requires('MEPH.util.Queryable').then(function () {
            var array = [].interpolate(0, 1000, function (x) { return { x: x }; });
            MEPH.Queryable.queryable(array);
            expect(array.isQueryable).toBeTruthy();
            return array.query.where(function (x) { return x.x % 2; }, 4).then(function (result) {

                expect(result).toBeTruthy();
                expect(result.length === 500).toBeTruthy();
            });
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    }, 100000);

    it(' a queryable array can execute on a where look on multiple threads', function (done) {
        MEPH.requires('MEPH.util.Queryable').then(function () {
            var array = [].interpolate(0, Math.pow(11, 2), function (x) { return { x: x }; });
            MEPH.Queryable.queryable(array);
            expect(array.isQueryable).toBeTruthy();
            var start = Date.now()
            return array.query.where(function (x) {
                return x.x % 2;
            }, 4).then(function (result) {

                var end = Date.now()
                var time = end - start;
                MEPH.Log('Multiple threads(4) , Execution time : ' + time);
            });
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    }, 100000);
    it(' a queryable array can execute on a where look on multiple threads', function (done) {
        MEPH.requires('MEPH.util.Queryable').then(function () {
            var array = [].interpolate(0, Math.pow(11, 2), function (x) { return { x: x }; });
            MEPH.Queryable.queryable(array);
            expect(array.isQueryable).toBeTruthy();
            var start = Date.now()
            return array.query.where(function (x) {
                var promise = new Promise(function (r, s) {
                    setTimeout(function () {
                        r(x.x % 2);
                    }, 4);
                });
                return promise;
            }, 4).then(function (result) {

                var end = Date.now()
                var time = end - start;
                MEPH.Log('Multiple threads(4) , Execution time : ' + time);
            });
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    }, 100000);
    it(' a queryable array can execute on a where look on multiple threads', function (done) {
        MEPH.requires('MEPH.util.Queryable').then(function () {
            var array = [].interpolate(0, Math.pow(11, 2), function (x) { return { x: x }; });
            var start = Date.now()
            return Promise.all(array.select(function (x) {
                var promise = new Promise(function (r) {
                    setTimeout(function () {
                        r(x.x % 2);
                    }, 4);
                });
                return promise;
            })).then(function (result) {

                var end = Date.now()
                var time = end - start;
                MEPH.Log('Single thread , Execution time : ' + time);
            });


        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    }, 100000);

    it(' Queryable can give available threads ', function (done) {
        MEPH.requires('MEPH.util.Queryable').then(function () {
            return MEPH.Queryable.requestWorkers(4).then(function (x) {
                var workers = x;
                expect(workers.length === 4).toBeTruthy();
            });
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });

    it(' Queryable can divide work in to sections of an arbitrary size ', function (done) {
        MEPH.requires('MEPH.util.Queryable').then(function () {
            return MEPH.Queryable.divideWork([].interpolate(0, 1000, function (x) {
                return x;
            }), 4).then(function (x) {
                var workers = x;
                expect(workers.length === 4).toBeTruthy();
                expect(workers[0].length === 250).toBeTruthy();
            });
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });

});