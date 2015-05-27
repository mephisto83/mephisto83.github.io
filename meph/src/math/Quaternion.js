/**
 * @class MEPH.math.Quaternion
 *  In mathematics, the quaternions are a number system that extends the complex numbers. 
 * They were first described by Irish mathematician William Rowan Hamilton in 1843[1][2]
 * and applied to mechanics in three-dimensional space. A feature of quaternions is that 
 * multiplication of two quaternions is noncommutative. Hamilton defined a quaternion as 
 * the quotient of two directed lines in a three-dimensional space[3] or equivalently as 
 * the quotient of two vectors.[4]
 * Quaternions find uses in both theoretical and applied mathematics, in particular for 
 * calculations involving three-dimensional rotations such as in three-dimensional computer 
 * graphics and computer vision. In practical applications, they can be used alongside 
 * other methods, such as Euler angles and rotation matrices, or as an alternative to them 
 * depending on the application.
 * http://en.wikipedia.org/wiki/Quaternion
 */
MEPH.define('MEPH.math.Quaternion', {
    alternateNames: 'Quaternion',
    extend: 'MEPH.math.Vector',
    requires: ['MEPH.math.Hamilton'],
    statics: {
        mul: function (rule) {
            switch (rule) {
                case 'hh':
                    return 'h';
                case 'ih':
                case 'hi':
                case 'jk':
                    return 'i';
                case 'hj':
                case 'jh':
                case 'ki':
                    return 'j';
                case 'hk':
                case 'kh':
                case 'ij':
                    return 'k';
                case 'ii':
                case 'jj':
                case 'kk':
                    return -1;
                case 'ik':
                    return '-j';
                case 'ji':
                    return '-k';
                case 'kj':
                    return '-i';
            }
        }
    },
    initialize: function (x, y, z, useBinaryHeap) {
        var me = this;

        me.callParent.apply(me, arguments);

    },
    defineVectorShortcuts: function () {
        var me = this;
        me.callParent.apply(me, arguments);
        var $shortcuts = 'hijk';
        $shortcuts.split('').foreach(function (prop, index) {
            if (me[prop] === undefined) {
                Object.defineProperty(me, prop, {
                    get: function (prop, index) {
                        return me.vector[index] || me.$defaultValue;
                    }.bind(me, prop, index)
                });
            }
        })
    },
    multiply: function (v) {
        var me = this;
        var ham = new Hamilton(me, v);
        return new Quaternion(ham.multiplication().vector);
    },
    add: function (v) {
        var me = this;
        var ham = new Hamilton(me, v);
        return new Quaternion(ham.addition().vector);
    },
    /**
     * If a quaternion is divided up into a scalar part and a vector part, i.e.
     * q = (r, v), q in set of H, r in set of R, v in set of R3
     * then the formulas for addition is:
     *  (r1, v1) + (r2, v2) = (r1 + r2, v1 + v2)
     * where "·" is the dot product and "×" is the cross product.
     * @param {Number} q2
     */
    qaddition: function (q2) {
        var me = this;
        var scalarpart = me.scalarPart() + q2.scalarPart();
        var vectorpart = me.vectorPart().add(q2.vectorPart());
        var res = [scalarpart].concat(vectorpart.vector);
        return new Quaternion(res);
    },
    /**
     * @method norm
     * The square root of the product of a quaternion with its conjugate is 
     * called its norm and is denoted ||q|| (Hamilton called this quantity 
     * the tensor of q, but this conflicts with modern meaning of "tensor").
     * In formula, this is expressed as follows: ||q|| = sqrt{qq*} = sqrt{q*q} = sqrt{a^2 + b^2 + c^2 + d^2}
     *
     */
    norm: function () {
        return this.length();
    },
    /**
     * Determinant
     * @returns {Number}
     **/
    det: function () {
        return this.dot(this);
    },
    /**
     * @method reciprocal
     * @returns {MEPH.math.Quaternion}
     **/
    reciprocal: function () {
        var me = this;
        var norm = me.norm();
        return new Quaternion(me.conjugate().divide(norm * norm).vector);
    },
    /**
     * @method unit 
     * Unit Quaternion
     * @returns {MEPH.math.Quaternion}
     **/
    unit: function () {
        return this.divide(this.norm());
    },
    /**
     * Choose two imaginary quaternions p = b1i + c1j + d1k and q = b2i + c2j + d2k. Their dot product is
     * @param {MEPH.math.Quaternion} that
     * @return {MEPH.math.Quaternion} 
     **/
    gdot: function (that) {
        var me = this;
        var v1 = me.vectorPart();
        var v2 = that.vectorPart();
        return v1.dot(v2);
    },
    /**
     * quaternion rotations
     * @param {MEPH.math.Vector} axis
     * @param {Number} thetas
     **/
    rotate: function (axis, theta) {
        var me = this;
        axis = axis.unit();
        
        var qaxis = new Quaternion([Math.cos(theta / 2),
                                    Math.sin(theta / 2) * axis.x,
                                    Math.sin(theta / 2) * axis.y,
                                    Math.sin(theta / 2) * axis.z]);


        var qInvAxis = new Quaternion([Math.cos(theta / 2),
                                    Math.sin(theta / 2) * -axis.x,
                                    Math.sin(theta / 2) * -axis.y,
                                    Math.sin(theta / 2) * -axis.z]);

        return qaxis.qmultiply(me.qmultiply(qInvAxis));
    },
    /**
     * If a quaternion is divided up into a scalar part and a vector part, i.e.
     * q = (r, v), q in set of H, r in set of R, v in set of R3
     * then the formulas for multiplication is:
     *  (r1, v1)(r2, v2) = (r1 r2 - v1 . v2, (r1 v1) + (r2 v2) + (v1 x v2))
     * where "·" is the dot product and "×" is the cross product.
     * @param {MEPH.math.Quaternion} that
     */
    qmultiply: function (that) {
        var me = this;
        var r1 = me.scalarPart();
        var r2 = that.scalarPart();
        var v1 = me.vectorPart();
        var v2 = that.vectorPart();

        var scalarpart = r1 * r2 - v1.dot(v2);
        var vectorpart = v2.multiply(r1).add(v1.multiply(r2).add(v1.cross(v2)));
        var res = [scalarpart].concat(vectorpart.vector);
        return new Quaternion(res);
    },
    /**
     * The conjugate of q is the quaternion  q^* = a - bi - c j - d k . 
     * It is denoted by q∗, q,[6] qt, or \tilde q. Conjugation is an involution, 
     * meaning that it is its own inverse, so conjugating an element twice returns 
     * the original element. The conjugate of a product of two quaternions is 
     * the product of the conjugates in the reverse order. That is, if p and q 
     * are quaternions, then (pq)∗ = q∗p∗, not p∗q∗.
     *  http://en.wikipedia.org/wiki/Quaternion
     **/
    conjugate: function () {
        return new Quaternion([this.h, -this.i, -this.j, -this.k])
    },
    /**
     * If a + bi + cj + dk is any quaternion, then a is called its scalar part.
     * @return {Number}
     */
    scalarPart: function () {
        return this.h;
    },
    /**
     * If a + bi + cj + dk is any quaternion, then  bi + cj + dk is called its vector part.
     * @return {MEPH.math.Vector}
     */
    vectorPart: function () {
        return new Vector([this.i, this.j, this.k])
    }
});