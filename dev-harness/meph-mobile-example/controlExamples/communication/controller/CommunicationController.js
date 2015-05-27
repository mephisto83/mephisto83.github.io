MEPH.define('MEPHControls.communication.controller.CommunicationController', {
    requires: ['MEPH.mixins.Referrerable',
                'MEPH.mobile.providers.viewprovider.ViewProvider',
                'MEPH.mixins.Observable'],
    mixins: {
        observable: 'MEPH.mixins.Observable',
        referrerable: 'MEPH.mixins.Referrerable'
    },
    properties: {
        id: null,
        textValue: null,
        name: null,
        messages: null
    },
    initialize: function () {
        var me = this;
        me.id = MEPH.GUID();
        me.mixins.referrerable.init.apply(me);
        me.mixins.observable.init.apply(me);
        me.messages = MEPH.util.Observable.observable([]);
        me.$referenceConnections = MEPH.Array([{
            type: MEPH.control.Control.connectables.control, obj: me
        }]);
        MEPH.MobileServices.get('signalService').then(function (provider) {
            me.sProvider = provider;
            me.sProvider.start().then(function () {
                me.sProvider.channel('communicationcontroller', me.onMessage.bind(me));
            });
        });
        me.referenceBound();
    },
    onMessage: function (message) {
        var me = this;
        me.messages.push(message.message);
    },
    send: function () {
        var me = this;
        me.sProvider.sendMessage({
            message: me.textValue,
            name: me.name
        }, me.id, 'communicationcontroller');
        me.textValue = '';
    },
    referenceBound: function () {
        var me = this;
    }
});