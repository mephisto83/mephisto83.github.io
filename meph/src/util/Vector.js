var pgx = pgx || {};
MEPH.define('MEPH.util.Vector', {
    requires: ['MEPH.math.J3DIVector3'],
    properties: {
    },
    initialize: function (x, y, z, useBinaryHeap) {
        if (useBinaryHeap)
            this._id = pgx.Vector.Id++;
        if (arguments.length > 0) {
            this._x = x;
            this._y = y;
            this._z = 0;
            if (z != undefined)
                this._z = z;
            if (useBinaryHeap)
                this._adjacentEdges = new BinaryHeap(function (node) {
                    return node.length();
                });
        }
        Object.defineProperty(this, 'x', {
            get: function () {
                return this._x;
            }
        });
        Object.defineProperty(this, 'y', {
            get: function () {
                return this._y;
            }
        });
        Object.defineProperty(this, 'z', {
            get: function () {
                return this._z;
            }
        });
    },
    statics: {
        Create: function (obj) {
            if (Array.isArray(obj) || obj instanceof J3DIVector3) {
                return new MEPH.util.Vector(obj[0], obj[1], obj[2]);
            }
            return new MEPH.util.Vector(obj.x, obj.y, obj.z);
        },
        Lerp: function (thrustAmount, to, percentage) {
            return thrustAmount + (to - thrustAmount) * percentage;
        },
        Lerp2D: function (vect1, vect2, percentage) {
            return new MEPH.util.Vector(MEPH.util.Vector.Lerp(vect1._x, vect2._x, percentage), MEPH.util.Vector.Lerp(vect1._y, vect2._y, percentage))
        },
        Lerp3D: function (vect1, vect2, percentage) {
            return new MEPH.util.Vector(MEPH.util.Vector.Lerp(vect1._x, vect2._x, percentage), MEPH.util.Vector.Lerp(vect1._y, vect2._y, percentage), MEPH.util.Vector.Lerp(vect1._z, vect2._z, percentage))
        },
        Slope: function (p1, p2) {

            var p21 = p2.subtract(p1)
            return p21.y / p21.x;
        },
        Line: function (p1, p2) {
            var slope = MEPH.math.Vector.Slope(p1, p2);
            return {
                p1: new MEPH.math.Vector(0, 0),
                p2: new MEPH.math.Vector(1, slope)
            }
        },
        Zero: function () {
            return new MEPH.util.Vector(0, 0, 0)
        },
        Id: 0
    },
    ToDebug: function () { return "x : " + this._x + "y : " + this._y + "z : " + this._z },
    equals: function (that) {
        if (this._x == that._x && this._y == that._y)
            return true;
        return false;
    },
    toObject: function () {
        return {
            x: this.x,
            y: this.y,
            z: this.z
        }
    },
    equals3d: function (that) {
        if (this._x == that._x && this._y == that._y && this._z == that._z)
            return true;
        return false;
    },
    get_id: function () { return this._id; },
    copy: function () {
        return new pgx.Vector(this._x, this._y, this._z);
    },

    destroy: function (edge) {
        this.remove_adjacentEdge(edge);
    },
    consume: function (that) {
        while (that.get_adjacentEdges().size() > 0) {
            var edge = that.get_adjacentEdges().pop();
            edge.swapVertex(that, this);
            this.add_adjacentEdge(edge);
        }
    },
    add_adjacentEdge: function (edge) {
        this._adjacentEdges.push(edge);
    },
    get_adjacentEdges: function () {
        return this._adjacentEdges;
    },
    remove_adjacentEdge: function (edge) {
        this._adjacentEdges.remove(edge);
    },
    reset: function () {
        this._adjacentEdges.clear();
    },
    length: function () {
        return Math.sqrt(this._x * this._x + this._y * this._y);
    },
    distance: function (that) {
        var x = this._x - that._x;
        var y = this._y - that._y;
        return Math.sqrt(x * x + y * y);
    },
    distanceSquared: function (that) {
        var x = this._x - that._x;
        var y = this._y - that._y;
        var v = Math.sqrt(x * x + y * y);
        return v * v;
    },
    set: function (x, y, z) {
        this.setX(x);
        this.setY(y);
        this.setZ(z);
    },
    setZ: function (z) {
        this._z = z;
    },
    setY: function (y) {
        this._y = y;
    },
    setX: function (x) {
        this._x = x;
    },
    setXY: function (x, y) {
        this.setX(x);
        this.setY(y);
    },
    dot: function (that) {
        return this._x * that._x + this._y * that._y;
    },
    cross: function (that) {
        return this._x * that._y - this._y * that._x;
    },
    unit: function () {
        return this.divide(this.length());
    },
    getVectorOfLength: function (length) {
        return this.divide(this.length() / length);
    },
    unitEquals: function () {
        this.divideEquals(this.length());

        return this;
    },
    add: function (that) {
        return new pgx.Vector(this._x + that._x, this._y + that._y, this._z + that._z);
    },
    addEquals: function (that) {
        this._x += that._x;
        this._y += that._y;

        return this;
    },
    subtract: function (that) {
        return new pgx.Vector(this._x - that._x, this._y - that._y, this._z - that._z);
    },
    subtractEquals: function (that) {
        this._x -= that._x;
        this._y -= that._y;
        return this;
    },
    mapdivide: function (that) {
        return new pgx.Vector(this._x / that._x, this._y / that._y);
    },
    mapmultiply: function (that) {
        return new pgx.Vector(this._x * that._x, this._y * that._y);
    },
    square: function () {
        return this._x * this._x + this._y * this._y;
    },
    multiply: function (scalar) {
        return new pgx.Vector(this._x * scalar, this._y * scalar);
    },
    multiplyEquals: function (scalar) {
        this._x *= scalar;
        this._y *= scalar;
        return this;
    },
    divide: function (scalar) {
        if (scalar == 0) {
            return new pgx.Vector(0, 0);
        }
        return new pgx.Vector(this._x / scalar, this._y / scalar);
    },
    divideEquals: function (scalar) {
        this._x /= scalar;
        this._y /= scalar;
        return this;
    },
    perp: function () {
        return new pgx.Vector(-this._y, this._x);
    },
    perpendicular: function (that) {
        return this.subtract(this.project(that));
    },
    project: function (that) {
        var percent = this.dot(that) / that.dot(that);

        return that.multiply(percent);
    },
    toString: function () {
        return this._x + "," + this._y;
    },
    fromPoints: function (p1, p2) {
        return new Vector2D(
        p2.x - p1.x,
        p2.y - p1.y);
    },
    angleBetween: function (that) {
        return Math.acos(this.dot(that) / (this.length() * that.length()));
    },
    rotate: function (angle) {
        var ca = Math.cos(angle);
        var sa = Math.sin(angle);
        var rx = this._x * ca - this._y * sa;
        var ry = this._x * sa + this._y * ca;
        return new pgx.Vector(rx, ry);
    },
    random: function () {
        return new pgx.Vector(2 * (Math.random() - .5), 2 * (Math.random() - .5));
    }
}).then(function (res) {
    pgx = MEPH.util;
    return res;
});