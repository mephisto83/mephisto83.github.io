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
        var me = this, changed = false;
        if (me.state[type] !== state) {
            me.state[type] = state;
            me.fire(type, 'change', me.state[type]);
        }
    },
    getConversation: function () {
        var me = this;
        return me.get(Connection.constant.Constants.CurrentConversation);
    },
    clearConversation: function () {
        var me = this;
        me.set(Connection.constant.Constants.CurrentConversation, null);
        me.set(Connection.constant.Constants.CurrentConversationContacts, null);
    },
    newConversation: function () {
        var me = this;
        var conversation = {
            id: null,
            cards: MEPH.util.Observable.observable([]),
            messages: MEPH.util.Observable.observable([]),
            lastMessage: null,
            dataCreated: null
        }
        me.setConversation(conversation);
    },
    setConversation: function (conversation) {
        var me = this;
        me.set(Connection.constant.Constants.CurrentConversationContacts, {
            groupId: conversation ? conversation.id : null,
            data: conversation ? conversation.cards : null
        });
        me.set(Connection.constant.Constants.CurrentConversation, {
            data: conversation
        });
    },
    get: function (type) {
        var me = this;
        return me.state[type];
    }
});