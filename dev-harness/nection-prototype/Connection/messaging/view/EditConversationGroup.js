MEPH.define('Connection.messaging.view.EditConversationGroup', {
    alias: 'main_edit_conversation_group',
    templates: true,
    extend: 'Connection.messaging.view.BaseChatActivity',
    mixins: ['MEPH.mobile.mixins.Activity'],
    injections: ['messageService',
        'relationshipService',
        'overlayService',
        'dialogService',
        'stateService'],
    requires: ['Connection.messaging.view.editconversationgroupview.EditConversationGroupView',
        'Connection.template.EditConversationGroupItem',
        'MEPH.input.MultilineText',
        'Connection.constant.Constants',
        'MEPH.list.View'],
    properties: {
        groupContacts: null,
        changePossible: true,
        chatSession: null
    },
    onLoaded: function () {
        var me = this;
        me.great();

        me.when.injected.then(function () {
            var conversationData = me.$inj.stateService.get(Connection.constant.Constants.CurrentConversation);
            me.$conversationSwitch = (me.$conversationSwitch || Promise.resolve()).then(function () {
                return me.loadCurrentConversation(conversationData, true);
            });

            me.$inj.stateService.on(Connection.constant.Constants.CurrentConversation, function (evnt, type, chatSession) {
                me.$conversationSwitch = me.$conversationSwitch.then(function () {
                    return me.loadCurrentConversation(chatSession);
                });
            });
        });
    },
    loadCurrentConversation: function (chatSession, skip) {
        var me = this;
        if (chatSession && chatSession.data) {
            me.setupGroupContacts(chatSession.data);
            //me.onContactsChange();
            if (!skip) {
                var guid = MEPH.GUID();
                me.$inj.overlayService.open(guid);
                me.$inj.overlayService.relegate(guid);

                return me.$inj.messageService.openConversation(chatSession.data).then(function (session) {
                    if (session) {
                        me.setupGroupContacts(session)
                    }
                }).catch(function () {
                    me.$inj.notificationService.notify({
                        icon: 'exclamation-triangle',
                        message: 'Something went wrong.'
                    });
                }).then(function () {
                    me.$inj.overlayService.close(guid);
                });
            }
            else { return Promise.resolve(); }
        }
    },
    setupGroupContacts: function (chatSession) {
        var me = this;
        me.currentGroupId = chatSession.id || null;
        me.groupContacts = chatSession.cards;
        me.isNewChatSession = chatSession.id ? false : true;

    },

    goToContactSelection: function () {
        var me = this;
        me.when.injected.then(function () {
            me.$inj.stateService.set(Connection.constant.Constants.CurrentSelectionConfig, {
                contacts: me.groupContacts
            });
            MEPH.publish(MEPH.Constants.OPEN_ACTIVITY, { viewId: 'contactSelection', path: 'selection' });
        });
    },
    addContact: function () {
        var me = this,
            data = me.getDomEventArg(arguments);
        if (data) {
            if (!me.groupContacts.some(function (x) {
               return x.card === data.card;
            })) {
                return me.when.injected.then(function () {
                    me.$inj.overlayService.open('adding editconversationgroup');
                    me.$inj.overlayService.relegate('adding editconversationgroup');
                    return Promise.resolve().then(function () {
                        if (me.isNewChatSession) {
                            return me.$inj.messageService.createConversation([data.card])
                                .then(function (conversation) {
                                    me.isNewChatSession = false;
                                    me.currentGroupId = conversation.id;
                                    me.$inj.stateService.setConversation(conversation);

                                });
                        }
                    }).then(function () {
                        return me.$inj.messageService.addContactToConversation(data, me.currentGroupId, me.groupContacts);
                    });
                }).catch(function () {
                }).then(function () {
                    me.$inj.overlayService.close('adding editconversationgroup');
                });
            }
        }
    },
    onOpenContactPage: function () {
        var me = this,
            domEvent = me.getDomEventArg(arguments);
        me.when.injected.then(function () {
            return me.$inj.stateService.set(Connection.constant.Constants.CurrentConversationContact, { data: domEvent });
        }).then(function () {
            MEPH.publish(MEPH.Constants.OPEN_ACTIVITY, { viewId: 'contactconversationgroup', path: 'contactconversationgroup' });
        });
    },
    removeContactFromList: function () {
        var me = this,
            data = me.getDomEventArg(arguments);
        if (data) {
            return me.when.injected.then(function () {
                return me.$inj.dialogService.confirm({
                    title: 'Remove This Person?',
                    message: 'They won\'t be able to keep chatting with this group.',
                    yes: 'Remove',
                    no: 'Cancel'
                });
            }).then(function (remove) {
                MEPH.Log('Removing');
                me.$inj.overlayService.open('remove from group conversation from edit conversation group');
                return me.$inj.messageService.removeContactFromConversation(data, me.currentGroupId, me.groupContacts);
            }).catch(function () {
                MEPH.Log('Not removing');
            }).then(function () {

                me.$inj.overlayService.close('remove from group conversation from edit conversation group');
            });
        }
    }
});