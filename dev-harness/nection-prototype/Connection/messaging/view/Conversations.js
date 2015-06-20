MEPH.define('Connection.messaging.view.Conversations', {
    alias: 'main_conversations',
    templates: true,
    extend: 'MEPH.mobile.activity.container.Container',
    mixins: ['MEPH.mobile.mixins.Activity'],
    injections: ['messageService', 'stateService'],
    requires: ['Connection.main.view.mainview.MainView',
        'Connection.template.Conversation',
        'Connection.messaging.view.conversationview.ConversationView'],
    properties: {
        conversations: null
    },
    initialize: function () {
        var me = this;
        me.great();
    },
    onLoaded: function () {
        var me = this;
        me.conversations = MEPH.util.Observable.observable([]);

    },
    afterShow: function () {
        var me = this;

        if (me.$aftershow) {
            clearTimeout(me.$aftershow);
            me.$aftershow = null;
        }
        me.$aftershow = setTimeout(function () {
            return me.when.injected.then(function () {
                return me.$inj.messageService.getConversations(me.conversations);
            }).catch(function () {
            }).then(function () {
                me.$aftershow = null;
            });
        }, 500);

    },
    openConversation: function () {
        var me = this;
        var data = me.getDomEventArg(arguments);
        me.when.injected.then(function () {
            me.$inj.stateService.set('CurrentConversation', { data: data });
        }).then(function () {
            MEPH.publish(MEPH.Constants.OPEN_ACTIVITY, { viewId: 'chatmessage', path: 'chatmessage' });
        });
    },
    searchDynChanged: function () {
        var me = this,
            data = me.getDomEventArg(arguments);
        me.when.injected.then(function () {
            me.$inj.messageService.searchConversations(data, me.conversations);
        })
    }
});