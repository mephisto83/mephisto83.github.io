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
        me.selectedContacts.dump();
        me.contacts.dump();
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
    loadSearchContacts: function () {
        var me = this;

        me.when.injected.then(function () {

            if (me.cancel && me.cancel.abort) {
                me.cancel.abort();
            }
            me.cancel = {};
            //me.$inj.relationshipService.searchContacts(0, 10, true, val, me.contacts, me.cancel, false, true);
            me.$inj.relationshipService.search({
                index: 0,
                count: 10,
                initial: true,
                search: '',
                source: me.contacts,
                cancel: me.cancel,
                useSearch: true,
                skipLocalContacts: true,
                filter: function (data) {
                    return !me.violatesContactConfig(data) && !me.selectedContacts.some(function (x) {

                        return x && x.card === data.card
                    });
                }
            });

        })
    },
    violatesContactConfig: function (data) {
        var me = this;
        if (me.currentConfig && me.currentConfig.contacts) {
            if (me.currentConfig.contacts.some(function (x) { return x.card === data.card; })) {
                return true;
            }
        }
        return false;
    },
    setCurrentConfig: function (config) {
        var me = this;
        me.currentConfig = config;
    },
    searchContacts: function (force) {
        var me = this,
            val = me.getSearchValue();
        if (me.$lastValue === val) return;
        me.$lastValue = val;
        me.searchThrottle = me.searchThrottle || MEPH.throttle(function () {
            me.when.injected.then(function () {

                if (me.cancel && me.cancel.abort) {
                    me.cancel.abort();
                }
                val = me.getSearchValue();
                me.cancel = {};
                //me.$inj.relationshipService.searchContacts(0, 10, true, val, me.contacts, me.cancel, false, true);
                return me.$inj.relationshipService.search({
                    index: 0,
                    count: 10,
                    initial: true,
                    search: val,
                    source: me.contacts,
                    cancel: me.cancel,
                    useSearch: true,
                    skipLocalContacts: true,
                    filter: function (data) {
                        return !me.violatesContactConfig(data) && !me.selectedContacts.some(function (x) { return x && x.card === data.card });
                    }
                });

            })
        }, 500);
        return me.searchThrottle();
    },
    toggleSelected: function () {
        var me = this, data = me.getDomEventArg(arguments);
        if (!data) return;

        return Promise.resolve().then(function () {
            var filter = function (x) {
                return x.card === data.card;
            };
            if (!me.selectedContacts.some(filter)) {
                me.selectedContacts.push(data);
            }
            //me.contacts.removeWhere(filter);
            // me.contacts.dump();
            if (me.searchThrottle)
                return me.searchThrottle();
            else {
                return me.searchContacts();
            }
        });
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
                me.$inj.overlayService.open('selection - view - add- contacts');
                var currentConversation = me.$inj.stateService.get(Connection.constant.Constants.CurrentConversation);
                if (currentConversation && currentConversation.data && currentConversation.data.id) {
                    var conversation = me.$inj.messageService.getConversationById(currentConversation.data.id);
                    if (conversation) {
                        return me.$inj.messageService.addContactsToConversation(me.selectedContacts.select(function (x) {
                            return x.card;
                        }), currentConversation.data.id, conversation.cards).then(function () {
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
                        me.$inj.stateService.setConversation(conversation);
                        me.goBack();
                    });
                }
                MEPH.Log('Add');
                //   return me.$inj.messageService.removeContactFromConversation(data, me.currentGroupId, me.groupContacts);
            }).then(function () {
                me.$inj.overlayService.close('selection - view - add- contacts');
            }).catch(function () {
                MEPH.Log('Not add');
            }).then(function () {
            });
    },
    removeTouched: function () {

        var me = this, data = me.getDomEventArg(arguments);
        if (!data) return;
        return Promise.resolve().then(function () {
            var filter = function (x) {
                return x.card === data.card;
            };

            //me.contacts.dump();
            me.selectedContacts.removeWhere(filter);
            //if (!me.contacts.some(filter))
            //    me.contacts.push(data);
            if (me.searchThrottle)
                return me.searchThrottle();
            else {
                return me.searchContacts();
            }
        });
    },
    getSearchValue: function () {
        var me = this;
        return me.search.getRawValue();
    }
});