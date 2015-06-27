MEPH.define('Connection.messaging.view.Conversations', {
    alias: 'main_conversations',
    templates: true,
    extend: 'MEPH.mobile.activity.container.Container',
    mixins: ['MEPH.mobile.mixins.Activity'],
    injections: ['messageService',
        'overlayService',
        'dialogService',
        'stateService'],
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

    },
    afterShow: function () {
        var me = this;

        if (me.$aftershow) {
            clearTimeout(me.$aftershow);
            me.$aftershow = null;
        }
        me.$aftershow = setTimeout(function () {
            return me.when.injected.then(function () {
                me.$inj.overlayService.open('openining conversations');
                me.$inj.overlayService.relegate('openining conversations');
                return me.$inj.messageService.getConversations({ ref: me, property: 'conversations' });
            }).catch(function () {
            }).then(function () {
                me.$aftershow = null;
                me.$inj.overlayService.close('openining conversations');
                me.$inj.messageService.healthCheck();
            });
        }, 500);

    },
    removeMeFromConversation: function () {
        var me = this,
            data = me.getDomEventArg(arguments);
        return me.when.injected.then(function () {
            return me.$inj.dialogService.confirm({
                title: 'Delete Conversation',
                message: 'This will permanently delete the conversation history.',
                yes: 'Delete Conversation',
                no: 'Cancel'
            });
        }).then(function (remove) {
            MEPH.Log('Removing');
            debugger
            return me.$inj.messageService.removeMeFromConversation(data.id);
        }).catch(function () {
            MEPH.Log('Not removing');
        }).then(function () {
        });
    },
    openConversation: function () {
        var me = this;
        var data = me.getDomEventArg(arguments);
        me.when.injected.then(function () {
            me.$inj.stateService.set(Connection.constant.Constants.CurrentConversation, { data: data });
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