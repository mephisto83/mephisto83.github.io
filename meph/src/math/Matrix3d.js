MEPH.define('MEPH.math.Matrix3d', {
    statics: {
        distance2d: function (a, b) {
            return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
        },
        adj: function (m) { // Compute the adjugate of m
            return [
              m[4] * m[8] - m[5] * m[7], m[2] * m[7] - m[1] * m[8], m[1] * m[5] - m[2] * m[4],
              m[5] * m[6] - m[3] * m[8], m[0] * m[8] - m[2] * m[6], m[2] * m[3] - m[0] * m[5],
              m[3] * m[7] - m[4] * m[6], m[1] * m[6] - m[0] * m[7], m[0] * m[4] - m[1] * m[3]
            ];
        },
        multmm: function (a, b) { // multiply two matrices
            var c = Array(9);
            for (var i = 0; i != 3; ++i) {
                for (var j = 0; j != 3; ++j) {
                    var cij = 0;
                    for (var k = 0; k != 3; ++k) {
                        cij += a[3 * i + k] * b[3 * k + j];
                    }
                    c[3 * i + j] = cij;
                }
            }
            return c;
        },
        multmv: function (m, v) { // multiply matrix and vector
            return [
              m[0] * v[0] + m[1] * v[1] + m[2] * v[2],
              m[3] * v[0] + m[4] * v[1] + m[5] * v[2],
              m[6] * v[0] + m[7] * v[1] + m[8] * v[2]
            ];
        },
        //pdbg: function (m, v) {
        //    var r = MEPH.math.Matrix3d.multmv(m, v);
        //    return r + " (" + r[0] / r[2] + ", " + r[1] / r[2] + ")";
        //},
        basisToPoints: function (x1, y1, x2, y2, x3, y3, x4, y4) {
            var Matrix3d = MEPH.math.Matrix3d;
            var m = [
              x1, x2, x3,
              y1, y2, y3,
               1, 1, 1
            ];
            var v = Matrix3d.multmv(Matrix3d.adj(m), [x4, y4, 1]);
            return Matrix3d.multmm(m, [
              v[0], 0, 0,
              0, v[1], 0,
              0, 0, v[2]
            ]);
        },
        general2DProjection: function (
              x1s, y1s, x1d, y1d,
              x2s, y2s, x2d, y2d,
              x3s, y3s, x3d, y3d,
              x4s, y4s, x4d, y4d
            ) {
            var Matrix3d = MEPH.math.Matrix3d;
            var s = Matrix3d.basisToPoints(x1s, y1s, x2s, y2s, x3s, y3s, x4s, y4s);
            var d = Matrix3d.basisToPoints(x1d, y1d, x2d, y2d, x3d, y3d, x4d, y4d);
            return Matrix3d.multmm(d, Matrix3d.adj(s));
        },
        project: function (m, x, y) {
            var v = MEPH.math.Matrix3d.multmv(m, [x, y, 1]);
            return [v[0] / v[2], v[1] / v[2]];
        },
        zeros: function (dim) {
            var mat = [].interpolate(0, dim * dim, function () {
                return 0;
            });
            return mat;
        },
        vector: function (dim) {
            return [].interpolate(0, dim, function () { return 0; });
        },
        determinant: function (m) {
            return m[0] * (m[4] * m[8] - m[5] * m[7]) - m[1] * (m[3] * m[8] - m[5] * m[6])
            + m[2] * (m[3] * m[7] - m[4] * m[6])
        },
        identity: function (dim, val) {
            var mat = MEPH.math.Matrix3d.zeros(dim);
            for (var i = 0 ; i < dim ; i++) {
                mat[i * dim + i] = val === undefined ? 1 : val;
            }
            return mat;
        },
        equals: function (a, b) {
            if (a.length === b.length) {
                return a.all(function (x, i) {
                    return x === b[i];
                });
            }
            return false;
        },
        transform2d: function (a, b) {
            var Matrix3d = MEPH.math.Matrix3d;
            var x1 = b[0],
                y1 = b[1],
                x2 = b[2],
                y2 = b[3],
                x3 = b[4],
                y3 = b[5],
                x4 = b[6],
                y4 = b[7];

            var i1 = a[0],
                j1 = a[1],
                i2 = a[2],
                j2 = a[3],
                i3 = a[4],
                j3 = a[5],
                i4 = a[6],
                j4 = a[7];


            var t = Matrix3d.general2DProjection(i1, j1, x1, y1, i2, j2, x2, y2, i3, j3, x3, y3, i4, j4, x4, y4);
            for (i = 0; i != 9; ++i) {
                t[i] = t[i] / t[8];
            }

            return t;
        },
        transform2da: function (a, b) {
            var Matrix3d = MEPH.math.Matrix3d;
            var x1 = b[0],
                y1 = b[1],
                x2 = b[2],
                y2 = b[3],
                x3 = b[4],
                y3 = b[5],
                x4 = b[6],
                y4 = b[7];

            var i1 = a[0],
                j1 = a[1],
                i2 = a[2],
                j2 = a[3],
                i3 = a[4],
                j3 = a[5],
                i4 = a[6],
                j4 = a[7];


            var t = Matrix3d.general2DProjection(i1, j1, x1, y1, i2, j2, x2, y2, i3, j3, x3, y3, i4, j4, x4, y4);
            for (i = 0; i != 9; ++i) {
                t[i] = t[i] / t[8];
            }
            t = [t[0], t[3], 0, t[6],
                 t[1], t[4], 0, t[7],
                 0, 0, 1, 0,
                 t[2], t[5], 0, t[8]];

            return t;
        }
    }
});