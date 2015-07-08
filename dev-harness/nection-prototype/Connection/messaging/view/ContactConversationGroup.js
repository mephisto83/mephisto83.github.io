MEPH.define('Connection.messaging.view.ContactConversationGroup', {
    alias: 'main_contact_conversation_group',
    templates: true,
    extend: 'Connection.messaging.view.BaseChatActivity',
    mixins: ['MEPH.mobile.mixins.Activity'],
    injections: ['messageService',
        'relationshipService',
        'overlayService',
        'dialogService',
'notificationService',
        'stateService'],
    requires: ['Connection.messaging.view.contactconversationgroupview.ContactConversationGroupView',
        'Connection.template.EditConversationGroupItem', ,
        'MEPH.input.MultilineText',
        'MEPH.list.View'],
    properties: {
        contacts: null,
        inputValue: null,
        currentContact: null,
        chatSession: null
    },
    onLoaded: function () {
        var me = this;
        me.great();

        me.when.injected.then(function () {
            var conversationData = me.$inj.stateService.get(Connection.constant.Constants.CurrentConversation);
            me.$conversationSwitch = (me.$conversationSwitch || Promise.resolve()).then(function () {
                return me.loadCurrentConversation(conversationData);
            });
            me.$inj.stateService.on(Connection.constant.Constants.CurrentConversationContact, function () {
                me.setupCurrentContact();
            });
            me.$inj.stateService.on(Connection.constant.Constants.CurrentConversation, function (evnt, type, chatSession) {
                me.$conversationSwitch = me.$conversationSwitch.then(function () {
                    me.loadCurrentConversation(chatSession);
                });
            });
        });
    },
    loadCurrentConversation: function (chatSession, skip) {
        var me = this;
        if (chatSession && chatSession.data) {
            me.setupGroupContacts(chatSession.data);
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
            else {
                return Promise.resolve();
            }
        }
    },
    setupGroupContacts: function (conversation) {
        var me = this;

        me.currentGroupId = conversation.id;
        me.currentConversation = conversation;
        me.setupCurrentContact();

    },
    setupCurrentContact: function () {
        var me = this, currentContact;

        currentContact = me.$inj.stateService.get(Connection.constant.Constants.CurrentConversationContact);//, { data: data }
        if (currentContact && currentContact.data) {
            me.currentContact = currentContact.data;
        }


    },
    viewProfile: function () {
        var me = this;
        if (me.currentContact) {
            return me.when.injected.then(function () {
                me.$inj.stateService.set(Connection.constant.Constants.CurrentContact, me.currentContact);
            }).then(function () {
                MEPH.publish(MEPH.Constants.OPEN_ACTIVITY, {
                    viewId: 'Contact',
                    path: 'main/contact',
                    data: me.currentContact
                });
            });
        }
    },
    messageContact: function () {
        var me = this;
        if (me.currentContact) {
            return me.$inj.messageService
                .duolog(me.currentContact)
                .then(function (conversation) {
                    me.$inj.stateService.set(Connection.constant.Constants.CurrentConversation, { data: conversation });//, { data: data }
                    MEPH.publish(MEPH.Constants.OPEN_ACTIVITY, {
                        viewId: 'chatmessage', path: 'chatmessage'
                    });
                });
        }
    },
    removeFromGroup: function () {
        var me = this;
        return me.when.injected.then(function () {
            return me.$inj.dialogService.confirm({
                title: 'Remove This Person?',
                message: 'They won\'t be able to keep chatting with this group.',
                yes: 'Remove',
                no: 'Cancel'
            });
        }).then(function (remove) {
            var conversation = me.currentConversation;
            if (conversation && conversation && me.currentContact && me.currentGroupId) {
                me.$inj.overlayService.open('remove from group conversation');
                return me.$inj.messageService.removeContactFromConversation(me.currentContact, me.currentGroupId, conversation.cards);
            }
            MEPH.Log('Removing');
        }).then(function (res) {
            if (res) {
                me.goBack();
            }
        }).catch(function () {
            me.$inj.notificationService.notify({
                icon: 'exclamation-triangle',
                message: 'Couldn\'t remove person from group.'
            });
        }).then(function () {
            me.$inj.overlayService.close('remove from group conversation');
        });
    }
});