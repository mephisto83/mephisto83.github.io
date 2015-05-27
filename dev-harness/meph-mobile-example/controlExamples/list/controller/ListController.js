MEPH.define('MEPHControls.list.controller.ListController', {
    requires: ['MEPH.mixins.Referrerable',
               'MEPH.mixins.Observable'],
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

        //   me.on('referencesbound', me.referenceBound.bind(me));
        // setTimeout(function () {
        me.referenceBound()
        //}, 3000);
    },
    referenceBound: function () {
        var me = this;
        var source = [].interpolate(0, 10, function (x) {
            return {
                property: 'Property' + x,
                name: 'name ' + x,
                address: '' + x + ' Ave. N'
            }
        });
        me.listsource = source;
    }
});