MEPH.define('Connection.messaging.view.Conversations', {
    alias: 'main_conversations',
    templates: true,
    extend: 'Connection.messaging.view.BaseChatActivity',
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
   
    afterShow: function () {
        var me = this;

        if (!me.hasShown) {
            me.hasShown = true;
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
        }

    },
    afterHide: function () {
        var me = this;
        me.hasShown = false;
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
            return me.$inj.messageService.removeMeFromConversation(data.id);
        }).catch(function () {
            MEPH.Log('Not removing');
        });
    },
    openConversation: function () {
        var me = this;
        var data = me.getDomEventArg(arguments);
        me.when.injected.then(function () {
            //me.$inj.stateService.set(Connection.constant.Constants.CurrentConversation, { data: data });
            me.$inj.stateService.setConversation(data);
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