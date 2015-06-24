MEPH.define('Connection.service.MessageService', {
    injections: ['rest',
        'signalService',
        'overlayService',
        'stateService',
        'storage',
        'tokenService'],
    mixins: {
        injectable: 'MEPH.mixins.Injections'
    },
    properties: {
        serviceStorageKey: 'connection-message-service-storage-key'
    },
    initialize: function () {
        var me = this;
        me.mixins.injectable.init.apply(me);
        me.monitoredConversations = [];
        me.contactCardCollection = [];

        setInterval(function (x) {
            me.updateMonitoredCards();
        }, 60000);

        me.when.injected.then(function () {
            me.$inj.signalService.addCallbackFunction('broadcastMessageGroup', function (message, cardId, group, dateCreated) {
                var groupConversation = me.monitoredConversations.first(function (x) {
                    return x.id === group;
                });
                var themessage = { cardId: cardId, message: message, dateCreated: dateCreated, now: null };
                me.updateMessage(themessage);
                MEPH.util.Observable.observable(themessage);
                groupConversation.messages.push(themessage);
            });

        });
    },
    makeSignalReady: function () {
        var me = this;
        return (me.$inj.signalService.isStarted() ? Promise.resolve() : me.$inj.signalService.start());
    },
    updateMonitoredCards: function () {
        var me = this;
        me.monitoredConversations.foreach(function (conversation) {
            if (conversation && conversation.messages) {
                conversation.messages.forEach(function (message) {
                    me.updateMessage(message);
                    MEPH.util.Observable.observable(message);
                });
            }
        });
    },
    updateMessage: function (message) {
        var me = this;
        var card = me.getCard(message.cardId);
        if (card) {
            message.name = card.name || (card.firstname + ' ' + card.lastname);
            message.profileimage = card.profileimage;
            message.now = Date.now();
        }
    },
    getCard: function (id) {
        var me = this;
        return me.contactCardCollection.first(function (x) {
            return x.id === id || x.card === id || x.contact === id;
        });
    },
    collectCards: function (cards) {
        var me = this;
        if (cards) {
            cards.foreach(function (card) {
                if (card) {
                    var contact = me.contactCardCollection.first(function (x) {
                        return x.card == card.card;
                    });
                    if (contact) {
                        me.contactCardCollection.removeWhere(function (x) {
                            return x === contact;
                        });
                    }
                    MEPH.util.Observable.observable(card);
                    me.contactCardCollection.push(card);
                }
            });

        }
    },
    addContactToConversation: function (contact, id, groupContacts) {
        var me = this;
        return me.when.injected.then(function () {
            if (id) {
                return me.$inj.rest.addPath('messages/add/to/group').post({
                    cards: [contact.card],
                    group: id
                }).then(function (result) {
                    if (result.success && result.authorized) {
                        if (groupContacts) {
                            MEPH.util.Observable.observable(contact);
                            groupContacts.push(contact);
                        }
                    }
                });
            }
            else {
                if (groupContacts) {
                    MEPH.util.Observable.observable(contact);
                    groupContacts.push(contact);
                }
            }
        });
    },
    removeContactFromConversation: function (contact, id, groupContacts) {
        var me = this;
        return me.when.injected.then(function () {
            if (id) {//If saved in the server
                return me.$inj.rest.addPath('messages/remove/from/group').post({
                    cards: [contact.card],
                    group: id
                }).then(function (result) {
                    if (result.success && result.authorized) {
                        groupContacts.removeWhere(function (x) {
                            return x.card === contact.card;
                        });
                    }
                });
            }
            else {// If not saved just remove from the conversations.
                groupContacts.removeWhere(function (x) {
                    return x.card === contact.card;
                });
            }
        });
    },
    monitorConversation: function (conversation) {
        var me = this;
        if (me.monitoredConversations.some(function (x) { return x.id === conversation.id; })) {

            var existingConversation = me.monitoredConversations.first(function (x) {
                return x.id === conversation.id;
            });

            if (conversation.messages && existingConversation && existingConversation.messages) {
                conversation.messages.foreach(function (message) {
                    var existingMessage = existingConversation.messages.first(function (m) {
                        return m.id === message.id;
                    });
                    if (!existingMessage) {
                        MEPH.util.Observable.observable(message);
                        existingConversation.messages.push(message);
                    }
                });
            }
            else if (conversation.messages) {
                existingConversation.messages = conversation.messages;
            }
            if (conversation.cards && existingConversation && existingConversation.cards) {
                conversation.cards.forEach(function (message) {
                    var existingMessage = existingConversation.cards.first(function (m) {
                        return m.card === message.card;
                    });
                    if (!existingMessage) {
                        MEPH.util.Observable.observable(message);
                        existingConversation.cards.push(message);
                    }
                });
                existingConversation.cards.removeWhere(function (contact) {
                    return conversation.cards.some(function (m) {
                        return m.card === contact.card;
                    });
                });
            }
            existingConversation.messages = existingConversation.messages || MEPH.util.Observable.observable([]);
            existingConversation.messages.sort(function (x, y) {
                return new Date(x.dateCreated).getTime() - new Date(y.dateCreated).getTime();
            });
            return existingConversation;
        }
        else {
            if (conversation.messages)
                conversation.messages.sort(function (x, y) {
                    return new Date(x.dateCreated).getTime() - new Date(y.dateCreated).getTime();
                });
            MEPH.util.Observable.observable(conversation);
            me.monitoredConversations.push(conversation);
        }
        return conversation;
    },
    getMessageToken: function () {
        var me = this;
        return me.$inj.tokenService.getMessageToken();
    },
    getConversationById: function (id) {
        var me = this;
        return me.monitoredConversations.first(function (x) { return x.id === id; });
    },
    getConversations: function (conversationList) {
        var me = this, err;
        me.when.injected.then(function () {
            me.$inj.overlayService.open('get conversationts');
            return me.$inj.storage.get(me.serviceStorageKey).then(function (res) {
                if (res && res.groups) {
                    me.$inj.overlayService.relegate('get conversationts');
                    res.groups.foreach(function (x) {
                        me.collectCards(x.cards);
                        if (x.messages) {
                            MEPH.util.Observable.observable(x.messages);
                        }
                    });
                    me.updateMonitoredCards();
                    res.groups.foreach(function (x) {
                        me.monitorConversation(x);
                    });
                    conversationList.pump(function (skip, take) {
                        return res.groups.subset(skip, skip + (take || 15));
                    });
                    conversationList.unshift.apply(conversationList, res.groups.subset(0, 1));
                }
                return me.getMessageToken().then(function (token) {
                    return me.$inj.rest.nocache().addPath('messages/groups').get().then(function (res) {
                        if (res && res.success && res.authorized) {
                            if (res.groups) {
                                res.groups.foreach(function (x) {
                                    if (x.userCardId) {
                                        me.sendMessage('addConnection', token, x.userCardId, x.id);
                                    }
                                    me.collectCards(x.cards);
                                    if (x.messages) {
                                        MEPH.util.Observable.observable(x.messages);
                                    }
                                });
                                me.updateMonitoredCards();

                                res.groups.foreach(function (x) {
                                    me.monitorConversation(x);
                                });

                                conversationList.pump(function (skip, take) {
                                    return res.groups.subset(skip, skip + (take || 15));
                                });
                                conversationList.unshift.apply(conversationList, res.groups.subset(0, 1));
                                me.$inj.storage.set(me.serviceStorageKey, res);
                            }
                            conversationList.dump();
                        }
                    });
                });
            });
        }).catch(function (error) {
            err = error;
        }).then(function () {
            me.$inj.overlayService.close('get conversationts');
            if (err) {
                throw err;
            }
        });
    },
    sendMessage: function () {
        var me = this, args = arguments;
        return me.makeSignalReady().then(function () {
            return me.$inj.signalService.send.apply(me.$inj.signalService, args);
        });
    },
    send: function (val, chatSession) {
        var me = this;
        if (chatSession && val)
            me.when.injected.then(function () {
                return me.$inj.tokenService.getMessageToken().then(function (token) {
                    if (!chatSession.id) {
                        return me.$inj.rest.nocache().addPath('messages/createconversation').post({
                            cards: chatSession.contacts.select(function (x) { return x.card; })
                        }).then(function (results) {
                            if (results && results.groups) {
                                results.groups.foreach(function (group) {
                                    group.messages = [];
                                    chatSession.id = group.id;
                                    me.monitorConversation(group);
                                });
                            }

                            return token;
                        });
                    }
                    return token;
                });
            }).then(function (token) {
                var session = me.getConversationById(chatSession.id);
                if (session.userCardId) {
                    me.makeSignalReady().then(function () {
                        return me.sendMessage('sendGroup', token, val, session.userCardId, chatSession.id);
                    });
                }
                session.messages = session.messages || MEPH.util.Observable.observable([]);
            });
    },
    openConversation: function (conversation, fetch, start) {
        var me = this;
        fetch = fetch || 10;
        start = start || 0;

        return me.when.injected.then(function () {
            return me.getMessageToken().then(function (token) {
                return me.$inj.rest.nocache().addPath('messages/conversations/{group}/{token}/{fetch}/{start}').get({
                    token: token,
                    fetch: fetch,
                    start: start,
                    group: conversation.id
                }).then(function (results) {

                    me.collectCards(results.contacts);
                    var toreturn = me.monitorConversation(results);
                    toreturn.contacts = results.contacts;
                    me.updateMonitoredCards();
                    return toreturn;
                });
            });
        });
    },
    searchConversations: function (data, conversations) {
        var me = this;
        return me.when.injected.then(function () {

        });
    },
    createConversation: function (cards) {
        var me = this;
        return me.when.injected.then(function () {
            return me.getMessageToken().then(function (token) {
                return me.$inj.rest.nocache().addPath('messages/createconversation')
                        .post({ cards: cards })
                        .then(function (results) {
                            if (results &&
                                results.success &&
                                results.authorized &&
                                results.groups) {
                                var group = results.groups.first();
                                results.groups.foreach(function (group) {
                                    group.messages = MEPH.util.Observable.observable([]);
                                    me.monitorConversation(group);
                                    me.sendMessage('addConnection', token, group.userCardId, group.id);
                                });
                                return me.getConversationById(group.id);
                            }
                        });
            });
        });
    },
    duolog: function (card) {
        var me = this;
        return me.when.injected.then(function () {
            if (card) {
                return me.createConversation([card.card]);
            }
            //return me.getMessageToken().then(function (token) {
            //    return me.$inj.rest.nocache().addPath('messages/duolog/{card}')
            //            .get()
            //            .then(function (results) {
            //                if (results &&
            //                    results.success &&
            //                    results.authorized &&
            //                    results.groups) {
            //                    var group = results.groups.first();
            //                    results.groups.foreach(function (group) {
            //                        group.messages = [];
            //                        me.monitorConversation(group);
            //                        me.sendMessage('addConnection', token, group.userCardId, group.id);
            //                    });
            //                    return me.getConversationById(group.id);
            //                }
            //            });
            //});
        });
    }

});