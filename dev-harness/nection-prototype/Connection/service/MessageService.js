MEPH.define('Connection.service.MessageService', {
    injections: ['rest'],
    mixins: {
        injectable: 'MEPH.mixins.Injections'
    },
    properties: {
    },
    initialize: function () {
        var me = this;
        me.mixins.injectable.init.apply(me);
    },

    getConversations: function (conversationList) {
        var me = this;
        me.when.injected.then(function () {
            me.$inj.rest.addPath('messages/groups').get().then(function (res) {
                if (res && res.success && res.authorized) {
                    conversationList.dump();
                    res.groups.foreach(function (group) {
                        conversationList.push(group);
                    });
                }
            });
        });
    },
    searchConversations: function (data, conversations) {
        var me = this;
        me.when.injected.then(function () {
            
        });
    },
    createConversation: function (cards) {
        var me = this;
        me.when.injected.then(function () {
            me.$inj.rest.addPath('messages/createconversation')
                .post({ cards: cards })
                .then(function (res) {
                    if (res && res.success && res.authorized) {
                    }
                });
        });
    }

});