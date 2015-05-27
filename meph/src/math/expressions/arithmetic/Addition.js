MEPH.define('MEPH.math.expressions.arithemetic.Addition', {
    extend: 'MEPH.math.Expression',
    initialize: function () {
        var me = this;
        me.callParent.apply(me, ['addition']);
    }
});