MEPH.define('Connection.messaging.view.Conversations', {
    alias: 'main_conversations',
    templates: true,
    extend: 'MEPH.mobile.activity.container.Container',
    mixins: ['MEPH.mobile.mixins.Activity'],
    injections: ['messageService', 'stateService'],
    requires: ['Connection.main.view.mainview.MainView'],
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

        me.when.injected.then(function () {
            me.$inj.messageService.getConversations(me.conversations);
        });
    },
    openConversation: function () {
        var me = this;
        var data = me.getDomEventArg(arguments);
        me.when.injected.then(function () {
            me.$inj.stateService.set('CurrentConversation', { data: data });
        })
    },
    searchDynChanged: function () {
        var me = this,
            data = me.getDomEventArg(arguments);
        me.when.injected.then(function () {
            me.$inj.messageService.searchConversations(data, me.conversations);
        })
    }
});