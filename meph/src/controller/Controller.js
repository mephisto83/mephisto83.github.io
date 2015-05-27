/**
 * @class
 * The base class for Controllers used in the mobile application.
 */

/*global MEPH,U4,window*/
MEPH.define('MEPH.controller.Controller', {
    requires: ['MEPH.mixins.Referrerable',
               'MEPH.mobile.services.MobileServices',
               'MEPH.mixins.Observable'],
    mixins: {
        observable: 'MEPH.mixins.Observable',
        referrerable: 'MEPH.mixins.Referrerable'
    },
    initialize: function () {
        var me = this;
        me.mixins.referrerable.init.apply(me);
        me.mixins.observable.init.apply(me);
        me.$referenceConnections = MEPH.Array([{
            type: MEPH.control.Control.connectables.control, obj: me
        }]);
    }
});