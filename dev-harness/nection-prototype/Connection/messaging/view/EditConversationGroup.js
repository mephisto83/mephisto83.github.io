MEPH.define('Connection.messaging.view.EditConversationGroup', {
    alias: 'main_edit_conversation_group',
    templates: true,
    extend: 'MEPH.mobile.activity.container.Container',
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
        contacts: null,
        memberNames: null,
        inputValue: null,
        messages: null,
        groupContacts: null,
        changePossible: true,
        chatSession: null
    },
    onLoaded: function () {
        var me = this;
        me.contacts = MEPH.util.Observable.observable([]);
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
    onContactsChange: function () {
        var me = this;
        if (me.groupContacts) {
            me.memberNames = 'To:' + me.groupContacts.select(function (x) {
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
            me.setupGroupContacts();
        }, 500);
    },
    searchContacts: function () {
        var me = this,
            val = me.getSearchValue();
        if (me.$lastValue === val || !val) return;
        me.$lastValue = val;
        me.searchThrottle = me.searchThrottle || MEPH.throttle(function () {
            me.when.injected.then(function () {
                if (me.cancel && me.cancel.abort) {
                    me.cancel.abort();
                }
                me.cancel = {};
                me.$inj.relationshipService.searchContacts(0, 10, true, val, me.groupContacts, me.cancel, false, true);
            })
        }, 500);
        me.searchThrottle();
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
                                    me.$inj.stateService.set(Connection.constant.Constants.CurrentConversation, {
                                        data: conversation
                                    });
                                    me.$inj.stateService.set(Connection.constant.Constants.CurrentConversationContacts, {
                                        groupId: conversation.id,
                                        data: conversation.cards
                                    });
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
        return me.when.injected.then(function () {
            return me.$inj.dialogService.confirm({
                title: 'Remove This Person?',
                message: 'They won\'t be able to keep chatting with this group.',
                yes: 'Remove',
                no: 'Cancel'
            });
        }).then(function (remove) {
            MEPH.Log('Removing');
            return me.$inj.messageService.removeContactFromConversation(data, me.currentGroupId, me.groupContacts);
        }).catch(function () {
            MEPH.Log('Not removing');
        }).then(function () {
        });
    },
    setupGroupContacts: function () {
        var me = this,
            currentContacts;
        return me.when.injected.then(function () {
            me.$inj.overlayService.open('openining editconversationgroup');
            currentContacts = me.$inj.stateService.get(Connection.constant.Constants.CurrentConversationContacts);//, { data: data }
            if (currentContacts && currentContacts.data && currentContacts.groupId) {
                me.currentGroupId = currentContacts.groupId;
                me.groupContacts = MEPH.util.Observable.observable(currentContacts.data);
            }
            else {
                me.groupContacts = MEPH.util.Observable.observable([]);
                me.isNewChatSession = true;
            }
            if (me.groupContacts) {
                me.groupContacts.un(me);
                me.groupContacts.on('changed', me.onContactsChange.bind(me), me);
            }
            me.onContactsChange();

        }).catch(function () {
        }).then(function () {
            me.$inj.overlayService.close('openining editconversationgroup');
        });
    }
});