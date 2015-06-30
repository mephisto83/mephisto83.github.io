MEPH.define('Connection.service.StateService', {
    properties: {
        state: null
    },
    mixins: {
        injectable: 'MEPH.mixins.Injections'
    },
    injections: [],
    initialize: function () {
        var me = this;

        MEPH.Events(me);
        me.mixins.injectable.init.apply(me);
        me.state = {};

        MEPH.Events(me);

    },
    set: function (type, state) {
        var me = this;
        me.state[type] = state;
        me.fire(type, 'change');
    },
    setConversation: function (conversation) {
        var me = this;
        me.set(Connection.constant.Constants.CurrentConversation, {
            data: conversation
        });
        me.set(Connection.constant.Constants.CurrentConversationContacts, {
            groupId: conversation ? conversation.id : null,
            data: conversation ? conversation.cards : null
        });
    },
    get: function (type) {
        var me = this;
        return me.state[type];
    }
});