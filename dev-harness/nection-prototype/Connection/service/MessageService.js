MEPH.define('Connection.service.MessageService', {
    injections: ['rest',
        'signalService',
        'overlayService',
        'stateService',
        'storage',
        'relationshipService',
        'userService',
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
        me.$healthCheckPromise = Promise.resolve();
        me.monitoredConversations = MEPH.util.Observable.observable([]);
        me.contactCardCollection = [];
        me.temporarilyDeleted = [];
        me.connected = false;

        setInterval(function (x) {
            me.updateMonitoredCards();
        }, 60000);

        me.when.injected.then(function () {
            //GroupStatus(string token, string cardId, IEnumerable<Guid> groups)
            me.$inj.signalService.addCallbackFunction('broadcastGotCard', function (card) {
                if (card) {
                    me.collectCards([card]);
                }
            });
            me.$inj.signalService.addCallbackFunction('broadcastConnection', function (connected) {
                me.connected = connected === 'connected';
            })
            me.$inj.signalService.addCallbackFunction('broadcastGroupStatus', function (results) {
                if (results) {
                    var deletedGroups = results.where(function (x) {
                        return x.Deleted;
                    }).forEach(function (x) {
                        if (x.Id) {
                            me.removeFromConversationsById(x.Id);
                        }
                    });
                }
            });
            me.$inj.signalService.addCallbackFunction('broadcastUpdates', function (results) {
                if (results) {
                    results.forEach(function (update) {
                        switch (update.Type) {
                            case "GroupContacts":
                                me.updateMonitoredGroupCards(update);
                                break;
                        }
                    });
                }
            });
            me.$inj.signalService.addCallbackFunction('broadcastMessageGroup', function (message, cardId, group, dateCreated, clientId) {
                var groupConversation = me.getConversationById(group);
                if (groupConversation) {
                    var themessage = {
                        clientId: clientId,
                        cardId: cardId,
                        message: message,
                        dateCreated: dateCreated,
                        now: null
                    };
                    var localMessage = groupConversation.messages.first(function (x) {
                        return x.clientId === themessage.clientId;
                    });
                    me.updateMessage(themessage);
                    MEPH.util.Observable.observable(themessage);
                    if (localMessage) {
                        localMessage.dateCreated = dateCreated;
                        localMessage.message = message;;
                        localMessage.cardId = cardId;
                    }
                    else {
                        groupConversation.messages.push(themessage);
                    }
                }
            });

        });
    },
    addConnection: function () {
        var me = this;
        return me.when.injected.then(function () {
            return me.$inj.userService.getUserId().then(function (userId) {
                return me.getMessageToken().then(function (token) {
                    me.$inj.signalService.send.apply(me.$inj.signalService, ['addConnection', token, userId]);
                });
            });
        })
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
    getGroupIds: function () {
        var me = this;
        return me.monitoredConversations.select(function (x) { return x.id; }).where();
    },
    removeFromConversationsById: function (id) {
        var me = this;
        var groupConversation = me.getConversationById(id);
        if (groupConversation) {
            me.monitoredConversations.removeWhere(function (x) { return x === groupConversation; });
            me.temporarilyDeleted.removeWhere(function (x) { return x === groupConversation });
        }
    },
    undeleteConversationById: function (id) {
        var me = this;
        var res = me.temporarilyDeleted.removeWhere(function (x) { return x.id === id });
        if (res && res.length) {
            me.monitoredConversations.push(res.first());
        }
    },
    previewRemoveFromConversationsById: function (id) {
        var me = this;
        var groupConversation = me.getConversationById(id);
        if (groupConversation) {
            me.monitoredConversations.removeWhere(function (x) { return x === groupConversation; });
            me.temporarilyDeleted.push(groupConversation);
        }
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
            cards.forEach(function (card) {
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
                        me.addContactToGroupContactsArray(contact, groupContacts);
                    }
                });
            }
            else {
                me.addContactToGroupContactsArray(contact, groupContacts);
            }
        });
    },
    addContactToGroupContactsArray: function (contact, groupContacts) {
        if (groupContacts) {
            MEPH.util.Observable.observable(contact);
            me.collectCards([contact]);
            groupContacts.removeWhere(function (x) { return x.card === contact.card; });
            groupContacts.push(contact);
        }
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
    removeMeFromConversation: function (id) {
        var me = this;
        return me.when.injected.then(function () {
            me.previewRemoveFromConversationsById(id);
            if (id) {//If saved in the server
                return me.$inj.rest.addPath('messages/remove/me/from/{group}').get({
                    group: id
                }).then(function (result) {
                    if (result.success && result.authorized) {
                        me.removeFromConversationsById(id);
                    }
                    else {
                        me.undeleteConversationById(id);
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
    updateMonitoredGroupCards: function (update) {
        var me = this;
        var conversation = me.getConversationById(update.Group);
        var contactsForConversation = update.UpdatedList.select(function (x) {
            return me.getCard(x) || false;
        }).where();

        var toFind = update.UpdatedList.where(function (x) {
            return !me.getCard(x);
        });

        var all = toFind.select(function (t) {
            return me.$inj.relationshipService.getCard(t);
        });
        if (all.length) {

            Promise.all(all).then(function (res) {
                me.collectCards(res);
                if (res.length) {
                    me.updateMonitoredGroupCards(update);
                }
            });
        }
        else {
            conversation.contacts.dump();
            conversation.contacts.push.apply(conversation.contacts, contactsForConversation);
        }
    },
    monitorConversation: function (conversation) {
        var me = this, result = [];
        var res = MEPH.util.Array.convert(arguments).where(function (conversation) {
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
                        return !conversation.cards.some(function (m) {
                            return m.card === contact.card;
                        });
                    });
                }
                existingConversation.messages = existingConversation.messages || MEPH.util.Observable.observable([]);
                existingConversation.messages.sort(function (x, y) {
                    return new Date(x.dateCreated).getTime() - new Date(y.dateCreated).getTime();
                });
                result.push(existingConversation);
                return false;
            }
            else {
                if (conversation.messages)
                    conversation.messages.sort(function (x, y) {
                        return new Date(x.dateCreated).getTime() - new Date(y.dateCreated).getTime();
                    });
                MEPH.util.Observable.observable(conversation);
                result.push(conversation);
                return conversation;
            }
        });

        me.monitoredConversations.push.apply(me.monitoredConversations, res);

        return result.length > 1 ? result : result[0] || null;
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
            conversationList.pump(function (skip, take) {
                skip = skip || 0;
                return me.monitoredConversations.subset(skip, skip + (take || 15));
            }, me.monitoredConversations);

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
                    me.monitorConversation.apply(me, res.groups);
                }
                return me.getMessageToken().then(function (token) {
                    return me.$inj.rest.nocache().addPath('messages/groups').get().then(function (res) {
                        if (res && res.success && res.authorized) {
                            if (res.groups) {
                                res.groups.foreach(function (x) {

                                    me.collectCards(x.cards);
                                    if (x.messages) {
                                        MEPH.util.Observable.observable(x.messages);
                                    }
                                });
                                me.updateMonitoredCards();

                                me.monitorConversation.apply(me, res.groups);

                                me.$inj.storage.set(me.serviceStorageKey, res);
                            }
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
            if (me.connected) {
                return me.$inj.signalService.send.apply(me.$inj.signalService, args);
            }
            else {
                return me.addConnection().then(function () {
                    return me.$inj.signalService.send.apply(me.$inj.signalService, args);
                });
            }
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
                        var clientId = MEPH.GUID();
                        var themessage = {
                            clientId: clientId,
                            cardId: session.userCardId,
                            message: val,
                            dateCreated: null,
                            now: null
                        };
                        var convo = me.getConversationById(chatSession.id);
                        if (convo) {

                            MEPH.util.Observable.observable(themessage);
                            me.updateMessage(themessage);
                            convo.messages.push(themessage);
                        }
                        return me.sendMessage('sendGroup', token, val, session.userCardId, chatSession.id, clientId);
                    });
                }
                session.messages = session.messages || MEPH.util.Observable.observable([]);
            });
    },
    healthCheck: function () {
        var me = this;
        me.$healthCheckPromise = me.$healthCheckPromise.then(function () {
            return me.when.injected.then(function () {
                return me.$inj.userService.getUserId().then(function (userId) {
                    return me.getMessageToken().then(function (token) {
                        return me.sendMessage('groupStatus', token, userId, me.getGroupIds());
                    });
                });
            }).catch(function () {
            });
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
        });
    }

});