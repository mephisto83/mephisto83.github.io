describe("MEPH/math/Matrix3d.spec.js", 'MEPH.math.Matrix3d', function () {
    var Matrix3d;
    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
        Matrix3d = MEPH.math.Matrix3d;
    });

    it('zero matrix', function () {
        var mat = Matrix3d.zeros(3);
        expect(mat.length === 9).toBeTruthy();
    });

    it('identity matrix', function () {
        var mat = Matrix3d.identity(3);
        expect(mat.where().length === 3).toBeTruthy();
        expect(mat.length === 9).toBeTruthy();

    });


    it('identity matrix 2', function () {
        var mat = Matrix3d.identity(2);
        expect(mat.where().length === 2).toBeTruthy();
        expect(mat.length === 4).toBeTruthy();
        expect(mat[0] === 1).toBeTruthy();
        expect(mat[3] === 1).toBeTruthy();
        expect(mat[2] === 0).toBeTruthy();
        expect(mat[1] === 0).toBeTruthy();
    });

    it('a === b', function () {
        var a = Matrix3d.identity(2),
            b = Matrix3d.identity(2);

        expect(Matrix3d.equals(a, b)).toBeTruthy();
    });

    it('a !== b', function () {

        var a = Matrix3d.identity(2),
            b = Matrix3d.identity(2);
        a[2] = 1;
        expect(Matrix3d.equals(a, b)).toBeFalsy();
    });


    it('a * b', function () {

        var a = Matrix3d.vector(3),
            b = Matrix3d.identity(3);
        var res = Matrix3d.multmv(b, a);
        expect(Matrix3d.equals(res, Matrix3d.vector(3))).toBeTruthy();
    });

    it('a * b 2', function () {

        var a = Matrix3d.vector(3),
            b = Matrix3d.identity(3);
        a[0] = 1;
        a[1] = 1;
        a[2] = 1;

        var res = Matrix3d.multmv(b, a);
        expect(Matrix3d.equals(res, [].interpolate(0, 3, function () { return 1; }))).toBeTruthy();
    });


    it('mat(a)*mat(b)', function () {
        var a = Matrix3d.identity(3),
            b = Matrix3d.identity(3);

        var res = Matrix3d.multmm(a, b);
        expect(Matrix3d.equals(res, Matrix3d.identity(3))).toBeTruthy();

    });

    it('adj(mat(a))', function () {
        var a = Matrix3d.adj(Matrix3d.identity(3));

        expect(Matrix3d.equals(a, Matrix3d.identity(3))).toBeTruthy();
    });
});