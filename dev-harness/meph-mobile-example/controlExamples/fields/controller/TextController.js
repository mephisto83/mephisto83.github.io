MEPH.define('MEPHControls.fields.controller.TextController', {
    requires: ['MEPH.mixins.Referrerable',
               'MEPH.mixins.Observable'],
    mixins: {
        observable: 'MEPH.mixins.Observable',
        referrerable: 'MEPH.mixins.Referrerable'
    },
    properties: {
        textValue: null,
        colorValue: null
    },
    initialize: function () {
        var me = this;
        me.mixins.referrerable.init.apply(me);
        me.mixins.observable.init.apply(me);
        me.$referenceConnections = [];
    }
});