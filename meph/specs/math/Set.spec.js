describe("MEPH/math/Set.spec.js", function () {
    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });

    it('a set can be created', function (done) {
        MEPH.requires('MEPH.math.Set').then(function () {
            var set = new MEPH.math.Set();
            expect(set).theTruth('a set was not created');
        }).catch(function (e) {
            expect(e).caught();
        }).then(function (x) {
            done();
        });
    });

    it('can set the sets value ', function (done) {
        MEPH.requires('MEPH.math.Set').then(function () {
            var set = new MEPH.math.Set();
            set.set([1, 2, 3]);
            expect(set).theTruth('a set was not created');
            expect(set.get().first()).toBe(1);
            expect(set.get().nth(3)).toBe(3);
        }).catch(function (e) {
            expect(e).caught();
        }).then(function (x) {
            done();
        });
    });

    it('can generate the super set of a set. ', function (done) {
        MEPH.requires('MEPH.math.Set').then(function () {
            var set = new MEPH.math.Set();
            set.set([1, 2, 3]);

            var superset = MEPH.math.Set.superset(set);
            expect(superset.get().length).toBe(8);
        }).catch(function (e) {
            expect(e).caught();
        }).then(function (x) {
            done();
        });
    });

    it('can generate the super set of a set. ', function (done) {
        MEPH.requires('MEPH.math.Set').then(function () {
            var set = new MEPH.math.Set();
            set.set([].interpolate(0, 8, function (x) { return x; }));

            var superset = MEPH.math.Set.superset(set);

            expect(superset.get().length).toBe(256);
        }).catch(function (e) {
            expect(e).caught();
        }).then(function (x) {
            done();
        });
    });


    it('can generate a sag set. ', function (done) {
        MEPH.requires('MEPH.math.Set').then(function () {

            var superset = MEPH.math.Set.sagset(6);

            expect(superset.length).toBe(14);

        }).catch(function (e) {
            expect(e).caught();
        }).then(function (x) {
            done();
        });
    });
    it('can generate a sag set. ', function (done) {
        MEPH.requires('MEPH.math.Set').then(function () {
            
            var superset = MEPH.math.Set.sagset(3);

            expect(superset.length).toBe(4);

        }).catch(function (e) {
            expect(e).caught();
        }).then(function (x) {
            done();
        });
    });

    

    it('can generate all the 6 item subsets of a 6 item set', function (done) {
        MEPH.requires('MEPH.math.Set').then(function () {

            var sets = MEPH.math.Set.itemSets(6, 6);

            expect(sets.length).toBe(1);

        }).catch(function (e) {
            expect(e).caught();
        }).then(function (x) {
            done();
        });
    });


    it('can generate all the 6 item subsets of a 5 item set', function (done) {
        MEPH.requires('MEPH.math.Set').then(function () {

            var sets = MEPH.math.Set.itemSets(6, 5);

            expect(sets.length).toBe(6);

        }).catch(function (e) {
            expect(e).caught();
        }).then(function (x) {
            done();
        });
    });

    it('can generate all the 6 item subsets of a 4 item set', function (done) {
        MEPH.requires('MEPH.math.Set').then(function () {

            var sets = MEPH.math.Set.itemSets(6, 4);

            expect(sets.length).toBe(15);

        }).catch(function (e) {
            expect(e).caught();
        }).then(function (x) {
            done();
        });
    });

    it('can generate all the 6 item subsets of a 3 item set', function (done) {
        MEPH.requires('MEPH.math.Set').then(function () {

            var sets = MEPH.math.Set.itemSets(6, 3);

            expect(sets.length).toBe(20);

        }).catch(function (e) {
            expect(e).caught();
        }).then(function (x) {
            done();
        });
    });

    it('can generate all the permutations of a set ', function (done) {
        MEPH.requires('MEPH.math.Set').then(function () {
            var set = new MEPH.math.Set();
            set.set([].interpolate(0, 3, function (x) {
                return x;
            }));
            var sets = MEPH.math.Set.permutate(set);
            sets.foreach(function (set) {
                console.log(set.print());
            });
            expect(sets.length).toBe(6);

        }).catch(function (e) {
            expect(e).caught();
        }).then(function (x) {
            done();
        });
    });

    it('can generate all the permutations of a set ', function (done) {
        MEPH.requires('MEPH.math.Set').then(function () {
            var set = new MEPH.math.Set();
            set.set([].interpolate(0, 5, function (x) {
                return x;
            }));
            var sets = MEPH.math.Set.permutate(set);
            sets.foreach(function (set) {
                console.log(set.print());
            });
            expect(sets.length).toBe(MEPH.math.Util.factorial(5));

        }).catch(function (e) {
            expect(e).caught();
        }).then(function (x) {
            done();
        });
    });
});