MEPH.define('MEPH.math.expressions.arithemetic.Subtraction', {
    extend: 'MEPH.math.Expression',
    initialize: function () {
        var me = this;
        me.callParent.apply(me, ['subtraction']);
    }
});