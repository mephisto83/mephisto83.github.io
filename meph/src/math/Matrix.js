/**
 * @class MEPH.math.Matrix
 * In mathematics, a matrix (plural matrices) is a rectangular array[1] of numbers, 
 * symbols, or expressions, arranged in rows and columns.[2][3] 
 * http://en.wikipedia.org/wiki/Matrix_(mathematics)
 */
MEPH.define('MEPH.math.Matrix', {
    alternateNames: 'Matrix',
    requires: ['MEPH.math.Vector'],
    properties: {
        columns: 0,
        rows: 0,
        matrix: null
    },
    initialize: function (rows, cols) {
        var me = this;
        me.columns = cols || me.columns;
        me.rows = rows || me.rows;
        me.matrix = [].interpolate(0, me.rows * me.columns, function () { return 0; });
    },
    set: function (array) {
        var me = this;
        array.foreach(function (x, index) {
            me.matrix[index] = x;
        });
    },
    get: function (row, col) {
        var me = this;
        return me.matrix[(row * me.columns + col)];
    },
    setCell: function (row, col, value) {
        var me = this;
        me.matrix[(row * me.columns + col)] = value;
    },
    /**
     * Set the rows values.
     */
    setRow: function (ith, vector) {
        var me = this;
        vector.vector.foreach(function (x, index) {
            me.matrix[(ith * me.columns) + index] = vector.getIndex(index);
        });
    },
    row: function (ith) {
        var me = this;
        return new MEPH.math.Vector(me.matrix.subset(ith * me.columns, (ith + 1) * me.columns));
    },
    column: function (ith) {
        var me = this;
        return new MEPH.math.Vector([].interpolate(0, me.rows, function (x) {
            return me.matrix[x * me.columns + ith];
        }));
    },

    addRow: function (vector) {
        var me = this;
        if (me.columns === 0 && me.rows === 0) {
            vector.vector.foreach(function (x) {
                me.matrix.push(x);
            });
            me.columns = vector.dimensions();
            me.rows++;
        }
        else if (me.rows > 0 && me.columns === vector.dimensions()) {
            vector.vector.foreach(function (x) {
                me.matrix.push(x);
            });
            me.rows++;
        }
    },

    add: function (matrix) {
        var me = this;
        var res = me.matrix.select(function (x, index) {
            return x + matrix.matrix[index];
        });

        var result = new MEPH.math.Matrix(me.rows, me.columns);
        result.set(res);
        return result;
    },
    mul: function (scalar) {
        var me = this,
            result;

        if (typeof (scalar) === 'number') {
            result = me.scalarMul(scalar);
        }
        else {
            result = me.matMul(scalar);
        }
        return result;
    },
    matMul: function (that) {
        var me = this,
            result;

        if (me.columns === that.rows) {
            result = new Matrix(me.rows, that.columns);
            for (var i = me.rows; i--;) {
                var row = me.row(i);
                for (var j = that.columns ; j--;) {
                    var col = that.column(j);
                    result.setCell(i, j, row.dot(col));
                }
            }
        }
        else {
            throw new Error('not a valid matrix multiplication');
        }
        return result;
    },
    scalarMul: function (scalar) {
        var me = this;
        var res = me.matrix.select(function (x, index) {
            return x * scalar;
        });

        var result = new MEPH.math.Matrix(me.rows, me.columns);
        result.set(res);
        return result;
    },
    transpose: function () {
        var me = this;

        var result = new MEPH.math.Matrix(me.columns, me.rows);
        for (var i = 0 ; i < me.columns ; i++) {
            for (var j = 0 ; j < me.rows; j++) {
                result.setCell(i, j, me.get(j, i));
            }
        }
        return result;
    },
    /**
     * Switch rows in matrix
     * @param {Number} r1
     * @param {Number} r2
     **/
    switchRow: function (r1, r2) {
        var me = this;
        var row1 = me.row(r1);
        var row2 = me.row(r2);
        me.setRow(r1, row2);
        me.setRow(r2, row1);
        return me;
    },
    rref: function () {
        var me = this;
        var firstcolumn = me.column(0);
        var firstindex = firstcolumn.firstNonZeroIndex();
        if (firstindex !== 0) {
            me.switchRow(0, firstindex);
        }
        // For each column reduce the row
        for (var i = 0; i < me.rows; i++) {
            me.reduceColumn(i);
            console.log(me.printMatrix());
        }
    },
    /**
     * Gets the row multiple to use in rref.
     * @param {Number} ith
     * @param {Number} jth
     */
    getMultiple: function (ith, jth) {
        var me = this;
        var r1 = me.row(ith);
        var r2 = me.row(jth);
        var index = r1.firstNonZeroIndex();
        if (index !== null || index !== undefined) {
            var r1v = r1.getIndex(index);
            var r2v = r2.getIndex(index);
            if (r2v === 0) {
                return 0;
            }
            else {
                return -r2v / r1v;
            }
        }
        return 0;
    },
    /**
     * Reduces the matrix by column and row.
     * @param {Number} col
     * @param {Number} row
     */
    reduceColumn: function (ithRow) {
        var me = this;
        me.reduceRow(ithRow);
        var row = me.row(ithRow);
        [].interpolate(0, me.rows, function (x) {
            return x;
        })
        .where(function (x) {
            return x !== ithRow;
        }).foreach(function (jthRow) {
            var multiple = me.getMultiple(ithRow, jthRow);
            var r1 = me.row(ithRow);
            var r2 = me.row(jthRow);
            r1 = r1.multiply(multiple);
            r2 = r2.add(r1);
            if (r2.isZero()) {
                me.setRow(jthRow, MEPH.math.Vector.ZeroVector(r2.dimensions()));
            }
            else {
                me.setRow(jthRow, r2);
            }
        });
    },
    /**
     * Reduces the row.
     * @param {Number} ith
     */
    reduceRow: function (ith) {
        var me = this;
        var r1 = me.row(ith);
        var index = r1.firstNonZeroIndex();
        if (index !== null && index !== undefined) {
            var r1v = r1.getIndex(index);
            r1 = r1.multiply(1 / r1v);
            r1.vector[index] = 1;
            me.setRow(ith, r1);
        }
    },
    printMatrix: function () {
        var me = this;
        var newline = '\r\n';
        var result = '[' + newline;
        for (var j = 0 ; j < me.rows; j++) {

            for (var i = 0 ; i < me.columns; i++) {
                result += me.get(j, i) + ','
            }
            result += newline;
        }
        result += ']';

        return result;
    }
});