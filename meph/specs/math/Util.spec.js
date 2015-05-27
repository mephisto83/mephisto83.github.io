describe("MEPH/math/Util.spec.js", 'MEPH.math.Util', function () {
    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });

    it('a factorial can be calculated.', function (done) {
        MEPH.requires('MEPH.math.Util').then(function () {
            var vector = MEPH.math.Util.factorial(3);
            expect(vector === 6).theTruth('the factorial was incorrect.');
        }).catch(function (e) {
            expect(new Error(e)).caught();
        }).then(function (x) {
            done();
        });
    });

    it('a selection of prime numbers can be computed up to a val', function (done) {
        MEPH.requires('MEPH.math.Util').then(function () {

            var primes = MEPH.math.Util.primes(10);

            expect(primes.length === 4).theTruth('the number of primes was incorrect.');
        }).catch(function (e) {
            expect(new Error(e)).caught();
        }).then(function (x) {
            done();
        });
    });



    it('a selection of prime numbers can be computed up to a val', function (done) {
        MEPH.requires('MEPH.math.Util').then(function () {

            var primes = MEPH.math.Util.primes(100);

            expect(primes.length === 25).theTruth('the number of primes was incorrect.');
        }).catch(function (e) {
            expect(new Error(e)).caught();
        }).then(function (x) {
            done();
        });
    });

    it(' can factor a number into an array of its prime multiples.', function (done) {
        MEPH.requires('MEPH.math.Util').then(function () {

            var factor = MEPH.math.Util.factor(10);

            expect(factor.length === 3).theTruth('the number of primes was incorrect.');
        }).catch(function (e) {
            expect(new Error(e)).caught();
        }).then(function (x) {
            done();
        });
    });


    it(' can factor a number into an array of its prime multiples.', function (done) {
        MEPH.requires('MEPH.math.Util').then(function () {
            var primes = MEPH.math.Util.primes(11),
                p = 1,
                pl = primes.length;

            primes.foreach(function (x) { p = x * p; })
            var factor = MEPH.math.Util.factor(p);

            expect(factor.length === (pl + 1)).theTruth('the number of primes was incorrect.');
        }).catch(function (e) {
            expect(new Error(e)).caught();
        }).then(function (x) {
            done();
        });
    });

    it('can apply a window function to an array of numbers ', function () {
        var res = [].interpolate(0, 100, function (x) {
            return 10;
        }).window(0, 10, MEPH.math.Util.window.Triangle.bind(null, -1));
        var h1 = res.subset(0, 5);
        var h2 = res.subset(5).reverse();
        expect(h1.all(function (x, y) {
            return x === h2[y];
        })).toBeTruthy();
    });

    it('can apply a square window function', function () {
        var res = [].interpolate(0, 100, function (x) {
            return 10;
        }).window(0, 10, MEPH.math.Util.window.Rectangle);
        var h1 = res;
        expect(h1.all(function (x, y) {
            return x === 10;
        })).toBeTruthy();
    });

    it('can convert x,y to polar coordinates', function () {
        var x = 1;
        var y = 0;
        var polar = MEPH.math.Util.polar(x, y);

        expect(polar.radius).toBe(1);
        expect(polar.theta).toBe(0);
    });

    it('can generate a sinc ', function () {
        var res = MEPH.math.Util.sinc([].interpolate(0, 10, function (x) {
            return Math.sin(x);
        }), 10);

        expect(res.length).toBeTruthy();
    });

    it('can generate a blackmanharris lobe ', function () {
        var fftsize = 1024;
        
        var bhl = MEPH.math.Util.getBhLobe([].interpolate(0, 10, function (x) {
            return Math.sin(x);;
        }), fftsize);

        expect(bhl.length).toBe(10);
        expect(bhl.all(function (t) {
            return !isNaN(t);
        })).toBeTruthy();
    })
});