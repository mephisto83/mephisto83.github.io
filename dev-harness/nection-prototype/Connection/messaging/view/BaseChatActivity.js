MEPH.define('Connection.messaging.view.BaseChatActivity', {
    templates: false,
    extend: 'MEPH.mobile.activity.container.Container',
    mixins: ['MEPH.mobile.mixins.Activity'],
    injections: ['messageService',
        'relationshipService',
        'overlayService',
        'stateService'],
    requires: ['Connection.messaging.view.chatview.ChatView',
        'Connection.template.ConversationMessage',
        'Connection.constant.Constants',
        'MEPH.input.MultilineText',
        'MEPH.list.View'],
    
    onLoaded: function () {
        var me = this;
        me.great();
        me.when.injected.then(function () {
            me.$inj.stateService.on(Connection.constant.Constants.CurrentConversation, function () {
                var conversation = me.$inj.stateService.getConversation();
                if (conversation === null && me.isShowing) {
                    MEPH.publish(MEPH.Constants.OPEN_ACTIVITY, { viewId: 'chat', path: 'chat' });
                }
            });
        });
    },
    goBack: function () {
        var me = this;
        history.back();
    }
});