MEPH.define('Connection.messaging.view.Chat', {
    alias: 'main_chat',
    templates: true,
    extend: 'Connection.messaging.view.BaseChatActivity',
    mixins: ['MEPH.mobile.mixins.Activity'],
    injections: ['messageService',
        'relationshipService',
        'dialogService',
        'notificationService',
        'overlayService',
        'stateService'],
    requires: ['Connection.messaging.view.chatview.ChatView',
        'Connection.template.ConversationMessage',
        'Connection.constant.Constants',
        'MEPH.input.MultilineText',
        'MEPH.list.View'],
    properties: {
        cards: null,
        memberNames: null,
        inputValue: null,
        messages: null,
        changePossible: true,
        chatSession: null,
        disabled: false
    },
    initialize: function () {
        var me = this;
        me.great();
    },
    onLoaded: function () {
        var me = this;
        me.great();
        me.canchange = true;
        me.cards = MEPH.util.Observable.observable([]);
        me.when.injected.then(function () {
            me.$inj.messageService.on('state-changed', function (type, options) {
                if (options && options.value === 'connected') {
                    me.disabled = false;
                }
                else {
                    me.disabled = true;
                }
            });
            var conversationData = me.$inj.stateService.get(Connection.constant.Constants.CurrentConversation);
            me.$lastLoaded = {
                fetch: 10,
                start: 0
            }
            me.$conversationSwitch = (me.$conversationSwitch || Promise.resolve()).then(function () {
                return me.loadCurrentConversation(conversationData);
            });
            me.$inj.stateService.on(Connection.constant.Constants.CurrentConversation, function (evnt, type, chatSession) {
                me.$conversationSwitch = me.$conversationSwitch.then(function () {
                    me.$lastLoaded = {
                        fetch: 10,
                        start: 0
                    }
                    me.loadCurrentConversation(chatSession);
                });
            });
        });
    },
    refreshList: function () {
        var me = this,
            guid = MEPH.GUID();
        var chatSession = me.chatSession;
        if (chatSession) {
            me.$inj.overlayService.open('openining conversation' + guid);
            me.$inj.overlayService.relegate('openining conversation' + guid);
            var fetch = 10;
            var start = 0;
            if (me.$lastLoaded) {
                fetch = me.$lastLoaded.fetch;
                start = Math.min(chatSession.messages.length, me.$lastLoaded.start + fetch);
                me.$lastLoaded.start = start;
            }

            return me.$inj.messageService.openConversation(chatSession, fetch, start).then(function (session) {
                if (session) {
                    me.setConversation(session);
                }
            }).catch(function () {
                me.$inj.notificationService.notify({
                    icon: 'exclamation-triangle',
                    message: 'Something went wrong.'
                });
            }).then(function () {
                me.$inj.overlayService.close('openining conversation' + guid);
            });
        }
    },
    loadCurrentConversation: function (chatSession, skip) {
        var me = this;
        if (chatSession && chatSession.data) {
            me.setConversation(chatSession.data);
            if (!skip) {
                var guid = MEPH.GUID();
                me.$inj.overlayService.open('openining conversation' + guid);
                me.$inj.overlayService.relegate('openining conversation' + guid);
                return me.$inj.messageService.openConversation(chatSession.data).then(function (session) {
                    if (session) {
                        me.setConversation(session);
                    }
                }).catch(function (args) {
                    if (!(args && args.status === 0))
                        me.$inj.notificationService.notify({
                            icon: 'exclamation-triangle',
                            message: 'Something went wrong.'
                        });
                }).then(function () {
                    me.$inj.overlayService.close('openining conversation' + guid);
                });
            }
            else {
                return Promise.resolve();
            }
        }
    },
    removeMessage: function () {
        var me = this,
            data = me.getDomEventArg(arguments),
            scope = 'remove message from group conversation';

        return me.when.injected.then(function () {
            return me.$inj.dialogService.confirm({
                title: 'Remove This Message?',
                message: 'Once you remove the message noone will be able to see it, and it cannot be undone.',
                yes: 'Remove',
                no: 'Cancel'
            });
        }).then(function (remove) {
            if (data) {
                me.$inj.overlayService.open(scope);
                return me.$inj.messageService
                    .removeMessage(data, me.chatSession.id)
                    .catch(function () {
                        me.$inj.notificationService.notify({
                            icon: 'exclamation-triangle',
                            message: 'Couldn\'t remove message from conversation.'
                        });
                    });
            }
        }).catch(function () {
        }).then(function () {
            me.$inj.overlayService.close(scope);
        });

    },
    enterText: function () {
        var me = this;
        if (me.chatSession.cards.length && me.inputValue) {
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
        if (me.chatSession && me.chatSession.cards) {
            me.memberNames = 'To:' + me.chatSession.cards.select(function (x) {
                return x.name;
            }).join(', ');
        }
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

        if (!me.chatSession.cards.some(function (x) {
            return x.card === data.card;
        })) {
            me.chatSession.cards.push(data);
            me.selectedContact = null;
            me.selectedCardValue = null;
        }
    },
    setConversation: function (session) {
        var me = this;
        if (session) {
            session.messages = MEPH.util.Observable.observable(session.messages || []);
            me.chatSession = session;
            me.chatSession.cards.un(null, me);
            me.chatSession.cards.on('changed', me.onContactsChange.bind(me), me);
            me.onContactsChange();
        }
    },
    gotoEditGroupView: function () {
        var me = this;
        //editconversationgroup
        if (me.chatSession && me.chatSession.cards) {
            me.when.injected.then(function () {
                //me.$inj.stateService.set(Connection.constant.Constants.CurrentConversationContacts, {
                //    groupId: me.chatSession.id,
                //    data: me.chatSession.cards
                //});

                me.$inj.stateService.setConversation(me.chatSession);
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