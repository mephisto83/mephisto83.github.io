/**
 * @class MEPH.math.Hamilton
 * Describes Hamiltonian result.
 * see http://en.wikipedia.org/wiki/Quaternions
 **/
MEPH.define('MEPH.math.Hamilton', {
    alternateNames: 'Hamilton',
    requires: ['MEPH.math.Vector'],
    properties: {
        keys: 'hijk'
    },
    initialize: function (v1, v2) {
        var me = this;
        me.v1 = v1;
        me.v2 = v2;
    },
    /**
     * Performs a hamiltonian multiplication of two vectors.
     * @return {MEPH.math.Vector}
     */
    multiplication: function () {
        var me = this,
            v1 = me.v1,
            v2 = me.v2;

        var h = v1.a * v2.a - v1.b * v2.b - v1.c * v2.c - v1.d * v2.d;
        var i = v1.a * v2.b + v1.b * v2.a + v1.c * v2.d - v1.d * v2.c;
        var j = v1.a * v2.c - v1.b * v2.d + v1.c * v2.a + v1.d * v2.b;
        var k = v1.a * v2.d + v1.b * v2.c - v1.c * v2.b + v1.d * v2.a;

        return new MEPH.math.Vector([h, i, j, k]);
    },
    addition: function () {
        var me = this,
            v1 = me.v1,
            v2 = me.v2;

        return new MEPH.math.Vector([v1.a + v2.a, v1.b + v2.b, v1.c + v2.c, v1.d + v2.d]);
    }
});