MEPH.define('MEPHControls.iconbutton.controller.IconButtonController', {
    requires: ['MEPH.mixins.Referrerable',
               'MEPH.mixins.Observable',
               'MEPH.util.Array',
               'MEPH.iconfont.enums.Icon',
               'MEPH.iconfont.enums.Size'],
    mixins: {
        observable: 'MEPH.mixins.Observable',
        referrerable: 'MEPH.mixins.Referrerable'
    },
    properties: {
        listsource: null
    },
    initialize: function () {
        var me = this;
        me.mixins.referrerable.init.apply(me);
        me.mixins.observable.init.apply(me);
        me.$referenceConnections = MEPH.Array([{
            type: MEPH.control.Control.connectables.control, obj: me
        }]);

        me.referenceBound();
    },
    referenceBound: function () {
        var me = this;
        //u4-if-size-x2
        var pf = Icons.getPrefix(),
            cpf = Color.getPrefix(),
            spf = Size.getPrefix();
        var source = Array.convertObject(Icons).where(function (x) { return typeof x !== 'function'; }).select(function (x) {
            return {
                cls: pf + x,
                clsX2: [pf + x, spf + Size.X2, cpf + Color.Blue].join(' '),
                clsX4: [pf + x, spf + Size.X3, cpf + Color.Green].join(' '),
                name: pf + x
            }
        });;
        me.listsource = source;
    }
});