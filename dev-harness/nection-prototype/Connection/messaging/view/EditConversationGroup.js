MEPH.define('Connection.messaging.view.EditConversationGroup', {
    alias: 'main_edit_conversation_group',
    templates: true,
    extend: 'MEPH.mobile.activity.container.Container',
    mixins: ['MEPH.mobile.mixins.Activity'],
    injections: ['messageService',
        'relationshipService',
        'overlayService',
        'stateService'],
    requires: ['Connection.messaging.view.editconversationgroupview.EditConversationGroupView',
        'Connection.template.EditConversationGroupItem', ,
        'MEPH.input.MultilineText',
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

    addContact: function () {
        var me = this,
            domEvent = me.getDomEventArg(arguments);
        var data = domEvent.data;
        if (data) {
            if (!me.chatSession.contacts.some(function (x) {
               return x.card === data.card;
            })) {
                me.chatSession.contacts.push(data);
            }
        }
    },

    setupGroupContacts: function () {
        var me = this,
            currentContacts;
        return me.when.injected.then(function () {
            me.canchange = false;
            me.$inj.overlayService.open('openining conversation');
            currentContacts = me.$inj.stateService.get(Connection.constant.Constants.CurrentContacts);//, { data: data }
            if (currentContacts && currentContacts.data) {
                if (me.groupContacts) {
                    me.groupContacts.un(me);
                }

                me.groupContacts = MEPH.util.Observable.observable(currentContacts.data);
                // me.messages = MEPH.util.Observable.observable([]);
                me.groupContacts.on('changed', me.onContactsChange.bind(me), me);
                me.canchange = true;
            }
            me.onContactsChange();

        }).catch(function () {
        }).then(function () {
            me.$inj.overlayService.close('openining conversation');
        });
    }
});