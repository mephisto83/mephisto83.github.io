describe("MEPH/math/Vector.spec.js", function () {
    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });

    it('a vector can be created', function (done) {
        MEPH.requires('MEPH.math.Vector').then(function () {
            var vector = new MEPH.math.Vector();
            expect(vector).theTruth('a list was not created');
        }).catch(function () {
            expect(new Error('something went wrong while creating a list')).caught();
        }).then(function (x) {
            done();
        });
    });

    it('a vector can be created with an x,y', function (done) {
        MEPH.requires('MEPH.math.Vector').then(function () {
            var vector = new MEPH.math.Vector(1, 2);
            expect(vector.x === 1).theTruth('vector x was not 1');
        }).catch(function () {
            expect(new Error('something went wrong while creating a list')).caught();
        }).then(function (x) {
            done();
        });
    });

    it('a vector can be created with an n components', function (done) {
        MEPH.requires('MEPH.math.Vector').then(function () {
            var vector = new MEPH.math.Vector([1, 2, 4]);
            expect(vector.x === 1).theTruth('vector x was not 1');
            expect(vector.z === 4).theTruth('vector z was not 4');
        }).catch(function () {
            expect(new Error('something went wrong while creating a list')).caught();
        }).then(function (x) {
            done();
        });
    });

    it('a vector can equat to another vector', function (done) {
        MEPH.requires('MEPH.math.Vector').then(function () {
            var vector = new MEPH.math.Vector([1, 2, 4, 4]);
            var vector2 = new MEPH.math.Vector([1, 2, 4, 4]);

            expect(vector.equals(vector2)).theTruth('vector x was not 1');
        }).catch(function () {
            expect(new Error('something went wrong while creating a list')).caught();
        }).then(function (x) {
            done();
        });
    });

    it('a vector1 doesnt equal vector2', function (done) {
        MEPH.requires('MEPH.math.Vector').then(function () {
            var vector1 = new MEPH.math.Vector([1, 2, 4, 14]);
            var vector2 = new MEPH.math.Vector([1, 2, 4, 4]);
            expect(!vector1.equals(vector2)).theTruth('v1 doesnt equal v2');
        }).catch(function () {
            expect(new Error('something went wrong while creating a list')).caught();
        }).then(function (x) {
            done();
        });
    });

    it('a vector1 doesnt equal vector2', function (done) {
        MEPH.requires('MEPH.math.Vector').then(function () {
            var vector1 = new MEPH.math.Vector([1, 2, 4, 14]);
            var vector2 = new MEPH.math.Vector([1, 2, 4, 14, 1]);
            expect(!vector1.equals(vector2)).theTruth('v1 doesnt equal v2');
        }).catch(function () {
            expect(new Error('something went wrong while creating a list')).caught();
        }).then(function (x) {
            done();
        });
    });

    it('can get the ith prosition in the vector', function (done) {
        MEPH.requires('MEPH.math.Vector').then(function () {
            var vector1 = new MEPH.math.Vector([1, 2, 4, 14]);
            expect(vector1.getIndex(3) === 14).theTruth('the wrong index was gotten');
        }).catch(function () {
            expect(new Error('something went wrong while creating a list')).caught();
        }).then(function (x) {
            done();
        });
    });


    it('can make a copy of a vector', function (done) {
        MEPH.requires('MEPH.math.Vector').then(function () {
            var vector1 = new MEPH.math.Vector([1, 2, 4, 14]);
            var copy = vector1.copy();
            expect(vector1.equals(copy)).theTruth('the copy was incorrect');
        }).catch(function () {
            expect(new Error('something went wrong while creating a list')).caught();
        }).then(function (x) {
            done();
        });
    });

    it('calculate dot product 2 vectors', function (done) {
        MEPH.requires('MEPH.math.Vector').then(function () {
            var vector1 = new MEPH.math.Vector([1, 0, 2, 4]);
            var vector2 = new MEPH.math.Vector([2, 0, 2, 1]);
            var v3 = vector1.dot(vector2);
            expect(v3 === 10).theTruth('the dot was incorrect');
        }).catch(function () {
            expect(new Error('something went wrong while creating a list')).caught();
        }).then(function (x) {
            done();
        });
    });

    it('calculate length of a vector', function (done) {
        MEPH.requires('MEPH.math.Vector').then(function () {
            var vector1 = new MEPH.math.Vector([1, 0, 0]);
            var length = vector1.length();
            expect(length === 1).theTruth('the length was incorrect');
        }).catch(function () {
            expect(new Error('something went wrong while creating a list')).caught();
        }).then(function (x) {
            done();
        });
    });


    it('v1 - v2 = v3', function (done) {
        MEPH.requires('MEPH.math.Vector').then(function () {
            var v1 = new MEPH.math.Vector([1, 0, 0]);
            var v2 = new MEPH.math.Vector([1, 0, 0]);
            var v3 = new MEPH.math.Vector([0, 0, 0]);
            expect(v1.subtract(v2).equals(v3)).theTruth('the subtraction was incorrect');
        }).catch(function () {
            expect(new Error('something went wrong while creating a list')).caught();
        }).then(function (x) {
            done();
        });
    });

    it('v1 + v2 = v3', function (done) {
        MEPH.requires('MEPH.math.Vector').then(function () {
            var v1 = new MEPH.math.Vector([1, 0, 0]);
            var v2 = new MEPH.math.Vector([1, 0, 0]);
            var v3 = new MEPH.math.Vector([2, 0, 0]);
            expect(v1.add(v2).equals(v3)).theTruth('the subtraction was incorrect');
        }).catch(function () {
            expect(new Error('something went wrong while creating a list')).caught();
        }).then(function (x) {
            done();
        });
    });

    it('can get dimension of a vector', function (done) {
        MEPH.requires('MEPH.math.Vector').then(function () {
            var v1 = new MEPH.math.Vector([]);
            var v2 = new MEPH.math.Vector([1, 0, 0]);
            var v3 = new MEPH.math.Vector([1, 2, 0, 0]);
            expect(v1.dimensions() === 0).theTruth('the dimensions were incorrect');
            expect(v2.dimensions() === 3).theTruth('the dimensions were incorrect');
            expect(v3.dimensions() === 4).theTruth('the dimensions were incorrect');
        }).catch(function () {
            expect(new Error('something went wrong while creating a list')).caught();
        }).then(function (x) {
            done();
        });
    });

    it('calculates distance v1 -> v2', function (done) {
        MEPH.requires('MEPH.math.Vector').then(function () {
            var v1 = new MEPH.math.Vector([1, 0, 0]);
            var v2 = new MEPH.math.Vector([-1, 0, 0]);
            expect(v1.distance(v2) === 2).theTruth('The distance was incorrect');
        }).catch(function () {
            expect(new Error('something went wrong while creating a list')).caught();
        }).then(function (x) {
            done();
        });
    });
    it('calculates the v1 x v2 = v3', function (done) {
        MEPH.requires('MEPH.math.Vector').then(function () {
            var v1 = new MEPH.math.Vector([1, 0, -2]);
            var v2 = new MEPH.math.Vector([1, 2, 3]);
            expect(v1.cross(v2).equals(new MEPH.math.Vector([4, -5, 2]))).theTruth('The cross was incorrect');
        }).catch(function () {
            expect(new Error('something went wrong while creating a list')).caught();
        }).then(function (x) {
            done();
        });
    });

    it('calculates the v1 x v2 = v3', function (done) {
        MEPH.requires('MEPH.math.Vector').then(function () {
            var v1 = new MEPH.math.Vector([1, 0]);
            var v2 = new MEPH.math.Vector([1, 2]);
            expect(v1.cross(v2).equals(new MEPH.math.Vector([2]))).theTruth('The cross was incorrect');
        }).catch(function () {
            expect(new Error('something went wrong while creating a list')).caught();
        }).then(function (x) {
            done();
        });
    });
    it('calculates the unit vector', function (done) {
        MEPH.requires('MEPH.math.Vector').then(function () {
            var v1 = new MEPH.math.Vector([1, 1, 0]);
            expect(Math.abs(v1.unit().length() - 1) < .0000001).theTruth('The unit was incorrect');
        }).catch(function () {
            expect(new Error('something went wrong while creating a list')).caught();
        }).then(function (x) {
            done();
        });
    });

    it('calculates the lerp of vector', function (done) {
        MEPH.requires('MEPH.math.Vector').then(function () {
            var v1 = new MEPH.math.Vector([1, 1, 0]);
            var v2 = new MEPH.math.Vector([0, 0, 0]);
            var v3 = MEPH.math.Vector.Lerp(v1, v2, .5);
            expect(v3.equals(new MEPH.math.Vector([.5, .5, 0]))).theTruth('The unit was incorrect');
        }).catch(function () {
            expect(new Error('something went wrong while creating a list')).caught();
        }).then(function (x) {
            done();
        });
    });
});