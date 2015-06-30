MEPH.define('Connection.selection.view.selectionview.SelectionView', {
    alias: 'selectionview',
    templates: true,
    requires: [
        'MEPH.button.IconButton',
        'MEPH.input.Search',
        'MEPH.util.Style',
        'Connection.template.SelectedContactListItem'
    ],
    extend: 'MEPH.mobile.activity.view.ActivityView',
    injections: [
        'relationshipService',
        'dialogService',
        'messageService',
        'overlayService',
        'stateService'],
    properties: {
        contacts: null,
        memberNames: null,
        inputValue: null,
        selectedContacts: null,
        selectedCardValue: null
    },
    clear: function () {
        var me = this;
        me.selectedContacts.clear();
        me.contacts.clear();
    },
    onLoaded: function () {
        var me = this;
        me.great()
        me.hideCloseBtn()
        me.hideFooter();
        me.hideHeaderName();
        me.contacts = MEPH.util.Observable.observable([]);
        me.selectedContacts = MEPH.util.Observable.observable([]);
        MEPH.util.Style.hide(me.selectedContactsSpace);
        me.selectedContacts.on('changed', me.updateSelectedContactsChange.bind(me));
    },
    updateSelectedContactsChange: function () {
        var me = this;
        if (me.selectedContacts && me.selectedContacts.length) {
            me.body.classList.add('connection-has-selected-contacts');
            me.headerdiv.classList.add('connection-has-selected-contacts');
            me.footer.classList.add('connection-has-selected-contacts');
            MEPH.util.Style.show(me.selectedContactsSpace);
        }
        else {
            MEPH.util.Style.hide(me.selectedContactsSpace);
            me.body.classList.remove('connection-has-selected-contacts');
            me.footer.classList.remove('connection-has-selected-contacts');
            me.headerdiv.classList.remove('connection-has-selected-contacts');
        }
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
                val = me.getSearchValue();
                me.cancel = {};
                //me.$inj.relationshipService.searchContacts(0, 10, true, val, me.contacts, me.cancel, false, true);
                me.$inj.relationshipService.search({
                    index: 0,
                    count: 10,
                    initial: true,
                    search: val,
                    source: me.contacts,
                    cancel: me.cancel,
                    useSearch: true,
                    skipLocalContacts: true,
                    filter: function (data) {
                        return !me.selectedContacts.some(function (x) { return x.card === data.card });
                    }
                });

            })
        }, 500);
        me.searchThrottle();
    },
    toggleSelected: function () {
        var me = this, data = me.getDomEventArg(arguments);
        var filter = function (x) {
            return x.card === data.card;
        };
        if (!me.selectedContacts.some(filter)) {
            me.selectedContacts.push(data);
        }
        me.contacts.removeWhere(filter);
    },
    addContacts: function () {
        var me = this;
        if (me.selectedContacts && me.selectedContacts.length)
            return me.when.injected.then(function () {
                return me.$inj.dialogService.confirm({
                    title: 'Are you sure?',
                    message: 'They will be able to see all the previous messages and chat with people in this group.',
                    yes: 'Add',
                    no: 'Cancel'
                });
            }).then(function (remove) {
                var currentConversation = me.$inj.stateService.get(Connection.constant.Constants.CurrentConversation);
                if (currentConversation && currentConversation.data && currentConversation.data.id) {
                    var conversation = me.$inj.messageService.getConversationById(currentConversation.data.id);
                    if (conversation) {
                        return me.$inj.messageService.addContactsToConversation(me.selectedContacts.select(function (x) {
                            return x.card;
                        }), currentConversation.data.id, conversation.cards).then(function (conversation) {
                            me.$inj.stateService.setConversation(conversation);
                            //me.$inj.stateService.set(Connection.constant.Constants.CurrentConversation, {
                            //    data: conversation
                            //});
                            //me.$inj.stateService.set(Connection.constant.Constants.CurrentConversationContacts, {
                            //    groupId: conversation.id,
                            //    data: conversation.cards
                            //});
                            me.goBack();
                        });
                    }
                }
                else {
                    return me.$inj.messageService.createConversation(me.selectedContacts.select(function (x) {
                        return x.card;
                    })).then(function (conversation) {
                        debugger
                        me.$inj.stateService.setConversation(conversation);
                        me.goBack();
                    });
                }
                MEPH.Log('Add');
                //   return me.$inj.messageService.removeContactFromConversation(data, me.currentGroupId, me.groupContacts);
            }).catch(function () {
                MEPH.Log('Not add');
            }).then(function () {
            });
    },
    removeTouched: function () {
        var me = this, data = me.getDomEventArg(arguments);

        var filter = function (x) {
            return x.card === data.card;
        };
        if (!me.contacts.some(filter)) {
            me.contacts.push(data);
        }
        me.selectedContacts.removeWhere(filter);
    },
    getSearchValue: function () {
        var me = this;
        return me.search.getRawValue();
    }
});