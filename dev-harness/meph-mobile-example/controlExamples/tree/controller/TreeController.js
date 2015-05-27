MEPH.define('MEPHControls.tree.controller.TreeController', {
    requires: ['MEPH.mixins.Referrerable',
               'MEPH.mixins.Observable'],
    mixins: {
        observable: 'MEPH.mixins.Observable',
        referrerable: 'MEPH.mixins.Referrerable'
    },
    properties: {
        source: null
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
        var source = {
            name: 'dev-harness',
            children: [{
                name: 'controlExamples',
                children: [{
                    name: 'button',
                    children: [{
                        name: 'presenter'
                    }, {
                        name: 'view'
                    }]
                }, {
                    name: 'iconbutton',
                    children: [{
                        name: 'controller'
                    }, {
                        name: 'view'
                    }]
                }]
            }]
        }
        me.source = source;
    }
});