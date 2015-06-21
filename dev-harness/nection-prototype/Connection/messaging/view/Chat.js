MEPH.define('Connection.messaging.view.Chat', {
    alias: 'main_chat',
    templates: true,
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
    properties: {
        contacts: null,
        memberNames: null,
        inputValue: null,
        messages: null,
        changePossible: true,
        chatSession: null
    },
    initialize: function () {
        var me = this;
        me.great();
    },
    onLoaded: function () {
        var me = this;

        me.canchange = true;
        me.contacts = MEPH.util.Observable.observable([]);
    },
    enterText: function () {
        var me = this;
        if (me.chatSession.contacts.length && me.inputValue) {
            var input = me.inputValue;
            me.inputValue = '';
            me.canchange = false;

            me.sendToChatSession(input);
        }
    },
    sendToChatSession: function (val) {
        var me = this;

        me.when.injected.then(function () {
            return me.$inj.messageService.send(val, me.chatSession);
        }).then(function (conversation) {
            if (conversation && conversation.messages) {
                me.messages = conversation.messages;
            }
        });
    },

    canChangeContacts: function () {
        var me = this;
        if (!me.canchange) {
            throw new Error('no error');
        }
    },
    onContactsChange: function () {
        var me = this;
        if (me.chatSession && me.chatSession.contacts) {
            me.memberNames = 'To:' + me.chatSession.contacts.select(function (x) {
                return x.name;
            }).join(', ');
        }
    },
    afterShow: function () {
        var me = this;

        if (me.$aftershow) {
            clearTimeout(me.$aftershow);
            me.$aftershow = null;
        }
        me.$aftershow = setTimeout(function () {
            me.openConversation();
        }, 500);
    },
    isReturnHit: function (domData) {
        var me = this;
        if (domData) {
            var charCode = MEPH.util.Dom.getCharCode(domData.domEvent);
            switch (charCode) {
                case 13:
                    return me.canchange;
                default:
                    return false;
            }
        }
        return false;
    },
    selectionChanged: function () {
        var me = this,
            data = me.getDomEventArg(arguments);

        if (!me.chatSession.contacts.some(function (x) {
            return x.card === data.card;
        })) {
            me.chatSession.contacts.push(data);
            me.selectedContact = null;
            me.selectedCardValue = null;
        }
    },

    openConversation: function () {
        var me = this,
            chatSession;
        return me.when.injected.then(function () {
            me.canchange = false;
            me.$inj.overlayService.open('openining conversation');
            chatSession = me.$inj.stateService.get(Connection.constant.Constants.CurrentConversation);//, { data: data }
            if (chatSession && chatSession.data) {
                return me.$inj.messageService.openConversation(chatSession.data).then(function (session) {
                    me.chatSession = session;
                    me.messages = MEPH.util.Observable.observable(session.messages);
                    me.chatSession.contacts = MEPH.util.Observable.observable(me.chatSession.contacts || []);
                    me.onContactsChange();
                });
            }
            else {
                me.chatSession = {
                    contacts: MEPH.util.Observable.observable([])
                };
                me.messages = MEPH.util.Observable.observable([]);
                me.chatSession.contacts.on('changed', me.onContactsChange.bind(me));
                me.canchange = true;
                me.onContactsChange();
            }
        }).catch(function () {
        }).then(function () {
            me.$inj.overlayService.close('openining conversation');
        });
    },
    gotoEditGroupView: function () {
        var me = this;
        //editconversationgroup
        if (me.chatSession && me.chatSession.contacts) {
            me.when.injected.then(function () {
                me.$inj.stateService.set(Connection.constant.Constants.CurrentConversationContacts, {
                    groupId: me.chatSession.id,
                    data: me.chatSession.contacts
                });
            }).then(function () {
                MEPH.publish(MEPH.Constants.OPEN_ACTIVITY, { viewId: 'editconversationgroup', path: 'editconversationgroup' });
            });
        }
    },
    searchDynChanged: function () {
        var me = this,
            data = me.getDomEventArg(arguments);
        me.when.injected.then(function () {
            me.$inj.messageService.searchConversations(data, me.conversations);
        })
    }
});