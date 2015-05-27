describe("MEPH/math/Hamilton.spec.js", function () {
    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });

    it('a hamilton can be created', function (done) {
        MEPH.requires('MEPH.math.Hamilton').then(function () {
            var hamilton = new Hamilton(new MEPH.math.Vector([1, 2, 3, 4]), new MEPH.math.Vector([1, 2, 3, 4]));
            expect(hamilton).theTruth('a quaternion was not created');
        }).catch(function () {
            expect(new Error('something went wrong while creating a quaternion')).caught();
        }).then(function (x) {
            done();
        });
    });

    it('hamilton multiplication', function (done) {
        MEPH.requires('MEPH.math.Hamilton').then(function () {
            var hamilton = new Hamilton(new MEPH.math.Vector([1, 2, 3, 4]), new MEPH.math.Vector([1, 2, 3, 4]));
            var vector = hamilton.multiplication();
            
            expect(vector.equals(new MEPH.math.Vector([-28, 4, 6, 8]))).theTruth('the wrong vector was created');
        }).catch(function () {
            expect(new Error('something went wrong while creating a quaternion')).caught();
        }).then(function (x) {
            done();
        });
    });


    it('hamilton addition', function (done) {
        MEPH.requires('MEPH.math.Hamilton').then(function () {
            var hamilton = new Hamilton(new MEPH.math.Vector([1, 2, 3, 4]), new MEPH.math.Vector([1, 2, 3, 4]));
            
            var vector = hamilton.addition();

            expect(vector.equals(new MEPH.math.Vector([2, 4, 6, 8]))).theTruth('the wrong vector was created');
        }).catch(function () {
            expect(new Error('something went wrong while creating a quaternion')).caught();
        }).then(function (x) {
            done();
        });
    });

});