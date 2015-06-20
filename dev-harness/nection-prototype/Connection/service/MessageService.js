MEPH.define('Connection.service.MessageService', {
    injections: ['rest', 'signalService', 'stateService', 'tokenService'],
    mixins: {
        injectable: 'MEPH.mixins.Injections'
    },
    properties: {
    },
    initialize: function () {
        var me = this;
        me.mixins.injectable.init.apply(me);
        me.monitoredConversations = [];
        me.contactCardCollection = [];
        //MEPH.subscribe('SIGNALRMESSAGE', function (envelope) {
        //    if (envelope && envelope.message != null) {

        //    }
        //});

        me.when.injected.then(function () {
            me.$inj.signalService.addCallbackFunction('broadcastMessageGroup', function (message, cardId, group, dateCreated) {
                var groupConversation = me.monitoredConversations.first(function (x) {
                    return x.id === group;
                });
                var themessage = { cardId: cardId, message: message, dateCreated: dateCreated };
                me.updateMessage(themessage);
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
        }
    },
    getCard: function (id) {
        var me = this;
        return me.contactCardCollection.first(function (x) { return x.card === id || x.contact === id; });
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
                    me.contactCardCollection.push(card);
                }
            });

        }
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
                        existingConversation.messages.push(message);
                    }
                });
            }
            existingConversation.messages = existingConversation.messages || MEPH.util.Observable.observable([]);
            existingConversation.messages.sort(function (x, y) {
                return new Date(x.dateCreated).getTime() - new Date(y.dateCreated).getTime();
            });
            return existingConversation;
        }
        else {
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
        var me = this;
        me.when.injected.then(function () {
            return me.getMessageToken().then(function (token) {
                me.$inj.rest.nocache().addPath('messages/groups').get().then(function (res) {
                    if (res && res.success && res.authorized) {
                        if (res.groups) {
                            res.groups.foreach(function (x) {
                                x.card1 = x.cards.first();
                                x.card2 = x.cards.nth(2);
                                x.card3 = x.cards.nth(3);
                                if (x.userCardId) {
                                    me.sendMessage('addConnection', token, x.userCardId, x.id);
                                }
                                me.collectCards(x.cards);
                                me.updateMonitoredCards();
                            });
                            conversationList.pump(function (skip, take) {
                                return res.groups.subset(skip, skip + (take || 15));
                            });
                            conversationList.unshift.apply(conversationList, res.groups.subset(0, 1));

                            res.groups.foreach(function (x) {
                                me.monitorConversation(x);
                            });
                        }
                        conversationList.dump();
                    }
                });
            });
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
        me.when.injected.then(function () {
            me.$inj.rest.nocache().addPath('messages/createconversation')
                .post({ cards: cards })
                .then(function (res) {
                    if (res && res.success && res.authorized) {
                    }
                });
        });
    }

});