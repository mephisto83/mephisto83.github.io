describe("MEPH/math/Matrix.spec.js", function () {
    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });

    it('a matrix can be created', function (done) {
        MEPH.requires('MEPH.math.Matrix').then(function () {
            var m = new Matrix();
            expect(m).theTruth('a matrix was not created');
        }).catch(function () {
            expect(new Error('something went wrong while creating a list')).caught();
        }).then(function (x) {
            done();
        });
    });

    it('a matrix can be created with n x m', function (done) {
        MEPH.requires('MEPH.math.Matrix').then(function () {
            var m = new Matrix(3, 4);
            expect(m.matrix.length === 12).theTruth('a matrix was not created correctly');
        }).catch(function () {
            expect(new Error('something went wrong while creating a list')).caught();
        }).then(function (x) {
            done();
        });
    });

    it('can set a matrix with an array', function (done) {
        MEPH.requires('MEPH.math.Matrix').then(function () {
            var m = new Matrix(3, 4);
            m.set([].interpolate(0, 12, function (x) { return x; }));
            expect(m.get(1, 1) === 5).toBeTruthy();
        }).catch(function () {
            expect(new Error('something went wrong while creating a list')).caught();
        }).then(function (x) {
            done();
        });
    });

    it('get row as vector ', function (done) {
        MEPH.requires('MEPH.math.Matrix').then(function () {
            var m = new Matrix(3, 4);
            m.set([].interpolate(0, 12, function (x) { return x; }));
            expect(m.row(1).equals(new MEPH.math.Vector([4, 5, 6, 7]))).toBeTruthy();
        }).catch(function () {
            expect(new Error('something went wrong while creating a list')).caught();
        }).then(function (x) {
            done();
        });
    });

    it('get column as vector', function (done) {
        MEPH.requires('MEPH.math.Matrix').then(function () {
            var m = new Matrix(3, 4);
            m.set([].interpolate(0, 12, function (x) { return x; }));
            expect(m.column(1).equals(new MEPH.math.Vector([1, 5, 9]))).toBeTruthy();
        }).catch(function () {
            expect(new Error('something went wrong while creating a list')).caught();
        }).then(function (x) {
            done();
        });
    });

    it('create a matrix row wise ', function (done) {
        MEPH.requires('MEPH.math.Matrix').then(function () {
            var m = new Matrix();
            m.addRow(new MEPH.math.Vector([0, 1, 2, 3]));
            expect(m.rows === 1).toBeTruthy();
            expect(m.columns === 4).toBeTruthy();
            expect(m.get(0, 1) === 1).toBeTruthy();
        }).catch(function () {
            expect(new Error('something went wrong while creating a list')).caught();
        }).then(function (x) {
            done();
        });
    });

    it('create a matrix row wise ', function (done) {
        MEPH.requires('MEPH.math.Matrix').then(function () {
            var m = new Matrix();
            m.addRow(new MEPH.math.Vector([0, 1, 2, 3]));
            m.addRow(new MEPH.math.Vector([0, 3, 2, 3]));
            expect(m.rows === 2).toBeTruthy();
            expect(m.columns === 4).toBeTruthy();
            expect(m.get(0, 1) === 1).toBeTruthy();
            expect(m.get(1, 1) === 3).toBeTruthy();
        }).catch(function () {
            expect(new Error('something went wrong while creating a list')).caught();
        }).then(function (x) {
            done();
        });
    });

    it('matrix addition ', function (done) {
        MEPH.requires('MEPH.math.Matrix').then(function () {
            var m1 = new Matrix(3, 4);
            m1.set([].interpolate(0, 12, function (x) { return x; }));

            var m2 = new Matrix(3, 4);
            m2.set([].interpolate(0, 12, function (x) { return x; }));

            expect(m1.add(m2).get(1, 1) === 10).toBeTruthy();

        }).catch(function () {
            expect(new Error('something went wrong while creating a list')).caught();
        }).then(function (x) {
            done();
        });
    });

    it('matrix scalar multiplication ', function (done) {
        MEPH.requires('MEPH.math.Matrix').then(function () {
            var m1 = new Matrix(3, 4);
            m1.set([].interpolate(0, 12, function (x) { return 1; }));
            expect(m1.mul(10).get(1, 1) === 10).toBeTruthy();

        }).catch(function () {
            expect(new Error('something went wrong while creating a list')).caught();
        }).then(function (x) {
            done();
        });
    });

    it('matrix transpose ', function (done) {
        MEPH.requires('MEPH.math.Matrix').then(function () {
            var m1 = new Matrix(3, 4);
            m1.set([].interpolate(0, 12, function (x) { return x; }));
            expect(m1.transpose().get(0, 2) === 8).toBeTruthy();

        }).catch(function () {
            expect(new Error('something went wrong while creating a list')).caught();
        }).then(function (x) {
            done();
        });
    });

    it('matrix multiplication ', function (done) {
        MEPH.requires('MEPH.math.Matrix').then(function () {
            var m1 = new Matrix(3, 4);
            m1.set([].interpolate(0, 12, function (x) { return x; }));

            var m2 = new Matrix(4, 3);
            m2.set([].interpolate(0, 12, function (x) { return x; }));

            expect(m1.mul(m2).get(2, 2) > 1).toBeTruthy();

        }).catch(function () {
            expect(new Error('something went wrong while creating a list')).caught();
        }).then(function (x) {
            done();
        });
    });

    it('matrix interchange row ', function (done) {
        MEPH.requires('MEPH.math.Matrix').then(function () {
            var m1 = new Matrix(3, 4);
            m1.set([].interpolate(0, 12, function (x) { return x; }));

            m1.switchRow(0, 1);
            expect(m1.get(0, 0) === 4).toBeTruthy();

        }).catch(function () {
            expect(new Error('something went wrong while creating a list')).caught();
        }).then(function (x) {
            done();
        });
    });

    it('matrix print', function (done) {
        MEPH.requires('MEPH.math.Matrix').then(function () {

            var m2 = new Matrix(4, 4);
            m2.set([].interpolate(0, 4 * 4, function (x) { return x; }));

            expect(m2.printMatrix()).toBeTruthy();

        }).catch(function () {
            expect(new Error('something went wrong while creating a list')).caught();
        }).then(function (x) {
            done();
        });
    });


    it('matrix calculate row multiple for rref', function (done) {
        MEPH.requires('MEPH.math.Matrix').then(function () {

            var m2 = new Matrix(4, 4);
            m2.set([].interpolate(0, 4 * 4, function (x) { return x + 1; }));
            var multiple = m2.getMultiple(0, 1);
            expect(multiple === -5).toBeTruthy();
        }).catch(function () {
            expect(new Error('something went wrong while creating a list')).caught();
        }).then(function (x) {
            done();
        });
    });


    it('matrix row operate ', function (done) {
        MEPH.requires('MEPH.math.Matrix').then(function () {

            var m2 = new Matrix(4, 4);
            m2.set([].interpolate(0, 4 * 4, function (x) { return x + 1; }));
            console.log(m2.printMatrix());
            m2.reduceColumn(0);
            console.log(m2.printMatrix());
            expect(m2.column(0).equals(new MEPH.math.Vector([1, 0, 0, 0]))).toBeTruthy();
        }).catch(function () {
            expect(new Error('something went wrong while creating a list')).caught();
        }).then(function (x) {
            done();
        });
    });


    it('matrix row operate twice ', function (done) {
        MEPH.requires('MEPH.math.Matrix').then(function () {

            var m2 = new Matrix(4, 4);
            m2.set([].interpolate(0, 4 * 4, function (x) { return x + 1; }));
            console.log(m2.printMatrix());
            m2.reduceColumn(0);
            console.log(m2.printMatrix());
            m2.reduceColumn(1);
            console.log(m2.printMatrix());
            expect(m2.column(0).equals(new MEPH.math.Vector([1, 0, 0, 0]))).toBeTruthy();
        }).catch(function () {
            expect(new Error('something went wrong while creating a list')).caught();
        }).then(function (x) {
            done();
        });
    });


    it('matrix row reduce echelon form', function (done) {
        MEPH.requires('MEPH.math.Matrix').then(function () {
            var m1 = new Matrix(3, 4);
            m1.set([]);

            var m2 = new Matrix(4, 3);
            m2.set([].interpolate(0, 12, function (x) { return x; }));
            console.log(m2.printMatrix());
            m2.rref();
            console.log(m2.printMatrix());

        }).catch(function () {
            expect(new Error('something went wrong while creating a list')).caught();
        }).then(function (x) {
            done();
        });
    });
    it('matrix row reduce echelon form', function (done) {
        MEPH.requires('MEPH.math.Matrix').then(function () {

            var m2 = new Matrix(4, 4);
            m2.set([1, 3, 5, 6,
                    2, 7, 1, 12,
                    2, 3, 4, 1,
                    2, 3, 4, 1]);
            console.log(m2.printMatrix());
            m2.rref();
            console.log(m2.printMatrix());

        }).catch(function () {
            expect(new Error('something went wrong while creating a list')).caught();
        }).then(function (x) {
            done();
        });
    });
});