describe("MEPH/math/Quaternion.spec.js", function () {
    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });

    it('a quaternion can be created', function (done) {
        MEPH.requires('MEPH.math.Quaternion').then(function () {
            var quaternion = new MEPH.math.Quaternion();
            expect(quaternion).theTruth('a quaternion was not created');
        }).catch(function () {
            expect(new Error('something went wrong while creating a quaternion')).caught();
        }).then(function (x) {
            done();
        });
    });


    it('a quaternion can be created', function (done) {
        MEPH.requires('MEPH.math.Quaternion').then(function () {
            var quaternion = new MEPH.math.Quaternion([1, 1, 2, 3]);
            expect(quaternion.h === 1).theTruth('a quaternion.h was not 1');
            expect(quaternion.i === 1).theTruth('a quaternion.i was not 1');
            expect(quaternion.j === 2).theTruth('a quaternion.j was not 2');
            expect(quaternion.k === 3).theTruth('a quaternion.k was not 3');
        }).catch(function () {
            expect(new Error('something went wrong while creating a quaternion')).caught();
        }).then(function (x) {
            done();
        });
    });

    it('a quaternion noncommunitivity of quaternion multiplication', function (done) {
        MEPH.requires('MEPH.math.Quaternion').then(function () {
            var res = Quaternion.mul('hh');
            expect(res === 'h').theTruth('hh rule is incorrect');
            res = Quaternion.mul('hi');
            expect(res === 'i').theTruth(' hi rule is incorrect');
            res = Quaternion.mul('hj');
            expect(res === 'j').theTruth(' hj rule is incorrect');
            res = Quaternion.mul('hk');
            expect(res === 'k').theTruth(' hk rule is incorrect');
            res = Quaternion.mul('ih');
            expect(res === 'i').theTruth(' hi rule is incorrect');
            res = Quaternion.mul('jh');
            expect(res === 'j').theTruth(' hj rule is incorrect');
            res = Quaternion.mul('kh');
            expect(res === 'k').theTruth(' hk rule is incorrect');


            res = Quaternion.mul('ii');
            expect(res === -1).theTruth('ii rule is incorrect');
            res = Quaternion.mul('ij');
            expect(res === 'k').theTruth('ij rule is incorrect');
            res = Quaternion.mul('ik');
            expect(res === '-j').theTruth('ik rule is incorrect');


            res = Quaternion.mul('ji');
            expect(res === '-k').theTruth('ji rule is incorrect');
            res = Quaternion.mul('jj');
            expect(res === -1).theTruth('jj rule is incorrect');
            res = Quaternion.mul('jk');
            expect(res === 'i').theTruth('jk rule is incorrect');


            res = Quaternion.mul('kh');
            expect(res === 'k').theTruth('kh rule is incorrect');
            res = Quaternion.mul('ki');
            expect(res === 'j').theTruth('ki rule is incorrect');
            res = Quaternion.mul('kj');
            expect(res === '-i').theTruth('kj rule is incorrect');
            res = Quaternion.mul('kk');
            expect(res === -1).theTruth('kk rule is incorrect');


        }).catch(function () {
            expect(new Error('something went wrong while creating a quaternion')).caught();
        }).then(function (x) {
            done();
        });
    });

    it('a quaternion noncommunitivity of quaternion multiplication', function (done) {
        MEPH.requires('MEPH.math.Quaternion').then(function () {
            var quaternion1 = new MEPH.math.Quaternion([1, 2, 3, 4]);
            var quaternion2 = new MEPH.math.Quaternion([1, 2, 3, 4]);
            var res = quaternion1.multiply(quaternion2);
            expect(res.equals(new MEPH.math.Vector([-28, 4, 6, 8]))).toBeTruthy();
        }).catch(function () {
            expect(new Error('something went wrong while creating a quaternion')).caught();
        }).then(function (x) {
            done();
        });
    });

    it('a quaternion noncommunitivity of quaternion addition', function (done) {
        MEPH.requires('MEPH.math.Quaternion').then(function () {
            var quaternion1 = new MEPH.math.Quaternion([1, 2, 3, 4]);
            var quaternion2 = new MEPH.math.Quaternion([1, 2, 3, 4]);
            var res = quaternion1.add(quaternion2);
            expect(res.equals(new MEPH.math.Vector([2, 4, 6, 8]))).toBeTruthy();
        }).catch(function () {
            expect(new Error('something went wrong while creating a quaternion')).caught();
        }).then(function (x) {
            done();
        });
    });
    it('quaternion conjugate', function (done) {
        MEPH.requires('MEPH.math.Quaternion').then(function () {
            var quaternion1 = new Quaternion([1, 2, 3, 4]);

            var vector = quaternion1.conjugate();

            expect(vector.equals(new MEPH.math.Vector([1, -2, -3, -4]))).theTruth('the wrong quaternion was created');
        }).catch(function () {
            expect(new Error('something went wrong while creating a quaternion')).caught();
        }).then(function (x) {
            done();
        });
    });

    it('quaternion qaddtion', function (done) {
        MEPH.requires('MEPH.math.Quaternion').then(function () {
            var quaternion1 = new Quaternion([1, 2, 3, 4]);

            var res = quaternion1.qaddition(new Quaternion([1, 2, 3, 4]));

            expect(res.equals(new MEPH.math.Vector([2, 4, 6, 8]))).theTruth('the wrong quaternion was created');
        }).catch(function () {
            expect(new Error('something went wrong while creating a quaternion')).caught();
        }).then(function (x) {
            done();
        });
    });
    it('quaternion qmultiply', function (done) {
        MEPH.requires('MEPH.math.Quaternion').then(function () {
            var quaternion1 = new Quaternion([3, 1, 0, -2]);

            var res = quaternion1.qmultiply(new Quaternion([2, 1, 2, 3]));

            expect(res.equals(new MEPH.math.Vector([11, 9, 1, 7]))).theTruth('the wrong quaternion was created');
        }).catch(function () {
            expect(new Error('something went wrong while creating a quaternion')).caught();
        }).then(function (x) {
            done();
        });
    });

    it('quaternion norm', function (done) {
        MEPH.requires('MEPH.math.Quaternion').then(function () {
            var quaternion1 = new Quaternion([1, 1, 1, -1]);


            expect(quaternion1.norm() === 2).theTruth('the wrong quaternion was created');
        }).catch(function () {
            expect(new Error('something went wrong while creating a quaternion')).caught();
        }).then(function (x) {
            done();
        });
    });

    it('quaternion det', function (done) {
        MEPH.requires('MEPH.math.Quaternion').then(function () {
            var quaternion1 = new Quaternion([1, 1, 1, -1]);

            expect(quaternion1.det() === 4).theTruth('the wrong quaternion was created');
        }).catch(function () {
            expect(new Error('something went wrong while creating a quaternion')).caught();
        }).then(function (x) {
            done();
        });
    });

    it('quaternion unit', function (done) {
        MEPH.requires('MEPH.math.Quaternion').then(function () {
            var quaternion1 = new Quaternion([2, 0, 0, 0]);

            expect(quaternion1.unit().equals(new MEPH.math.Vector([1, 0, 0, 0]))).theTruth('the wrong quaternion was created');
        }).catch(function () {
            expect(new Error('something went wrong while creating a quaternion')).caught();
        }).then(function (x) {
            done();
        });
    });

    it('quaternion reciprocal', function (done) {
        MEPH.requires('MEPH.math.Quaternion').then(function () {
            var quaternion1 = new Quaternion([2, 0, 0, 0]);

            expect(quaternion1.reciprocal().equals(new MEPH.math.Vector([2 / 4, 0, 0, 0]))).theTruth('the wrong quaternion was created');
        }).catch(function () {
            expect(new Error('something went wrong while creating a quaternion')).caught();
        }).then(function (x) {
            done();
        });
    });

    it('Choose two imaginary quaternions p = b1i + c1j + d1k and q = b2i + c2j + d2k. Their dot product is' +
        'p.q = b1b2 + c1c2 + d1d2', function (done) {
            MEPH.requires('MEPH.math.Quaternion').then(function () {
                var q1 = new Quaternion([2, 1, 2, 3]);
                var q2 = new Quaternion([1, 1, 2, 3]);
                var res = q1.gdot(q2)

                expect(res === 14).theTruth('the wrong quaternion was created');
            }).catch(function () {
                expect(new Error('something went wrong while creating a quaternion')).caught();
            }).then(function (x) {
                done();
            });

        });

    it('Quaternion rotate', function (done) {
        MEPH.requires('MEPH.math.Quaternion').then(function () {
            var q1 = new Quaternion([0, 1, 2, 3]);
            var axis = new MEPH.math.Vector([1, 1, 1]);
            var angle = Math.PI * 2 / 3;
            var res = q1.rotate(axis, angle)

            expect(res.distance(new MEPH.math.Vector([0, 3, 1, 2])) < .0001).theTruth('the wrong quaternion was created');
        }).catch(function () {
            expect(new Error('something went wrong while creating a quaternion')).caught();
        }).then(function (x) {
            done();
        });

    });
});