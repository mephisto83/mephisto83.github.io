MEPH.define('Connection.service.MessageService', {
    extend: 'Connection.service.Service',
    injections: ['rest',
        'signalService',
        'overlayService',
        'sleepDetectionService',
        'userService',
        'stateService',
        'notificationService',
        'storage',
        'relationshipService',
        'tokenService'],
    mixins: {
        injectable: 'MEPH.mixins.Injections'
    },
    requires: ['Connection.template.SignalStateOverlay'],
    properties: {
        serviceStorageKey: 'connection-message-service-storage-key',
        $conversationSettingsKey: '$conversationSettingsKey',
        $messagingSettingsKey: '$messagingSettingsKey',
        throttleSeconds: 60 * 1000,
        $saveThrottleTime: 200
    },
    initialize: function () {
        var me = this;
        me.mixins.injectable.init.apply(me);
        me.$healthCheckPromise = Promise.resolve();
        me.$checkMessagesPromise = Promise.resolve();
        me.$conversationPropertyUpdatePromise = Promise.resolve();
        me.monitoredConversations = MEPH.util.Observable.observable([]);
        me.conversationSettings = MEPH.util.Observable.observable([]);
        me.unseenMessages = MEPH.util.Observable.observable([]);

        me.contactCardCollection = [];
        me.temporarilyDeleted = [];
        me.connected = false;

        setInterval(function (x) {
            me.updateMonitoredCards();
        }, 60000);
        MEPH.Events(me);
        me.openConversationSettings();
        me.addHandlers();
        me.when.injected.then(function () {

            me.$inj.notificationService.notify({ message: 'Preparing sleep detection' });
            me.$inj.sleepDetectionService.on('slept', function (type, args) {
                var seconds = (Date.now() - args.lastTime) / 1000;
                me.$inj.notificationService.notify({
                    message: 'Sychronizing messages',
                    icon: 'exchange'
                });
                me.getMessagesInTheLast(seconds);
                me.onSignalServiceStateChange('', { value: me.$inj.signalService.state })
            });
            me.$inj.userService.myCards().then(function (cards) {
                me.cards = cards;
            });

            me.$inj.signalService.on('state-changed', me.onSignalServiceStateChange.bind(me));
            me.$inj.signalService.addCallbackFunction('invalidToken', function () {
                me.$inj.notificationService.notify({ message: 'Token is invalid : ' + new Date(Date.now()).toLocaleTimeString() });
                me.refreshToken();
            });

            MEPH.subscribe(Connection.constant.Constants.RefreshedToken, function () {
                me.$inj.notificationService.notify({ message: 'Token is refreshed : ' + new Date(Date.now()).toLocaleTimeString() });
                me.resendUnconfirmedMessage();
            });

            me.$inj.signalService.addCallbackFunction('broadcastMessages', function (messages) {
                me.mergeMessagesIntoConversations(messages);
            });
            //GroupStatus(string token, string cardId, IEnumerable<Guid> groups)
            me.$inj.signalService.addCallbackFunction('broadcastGotCard', function (card) {
                if (card) {
                    me.collectCards([card]);
                }
            });
            me.$inj.signalService.addCallbackFunction('broadcastConnection', function (connected) {
                var wasconnected = me.connected;
                me.connected = connected === 'connected';
                if (me.connected && !wasconnected)
                    me.fire('connected', {});
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
                            case 'NewGroup':
                                me.newMonitoredGroup(update);
                                break;
                            case 'MessageUpdate':
                                me.updateMessages(update);
                                break;
                            case 'ConversationSetting':
                                me.updateConversationSettings(update);
                                break;
                            case 'MessagingSetting':
                                me.updateMessingSettings(update);
                                break;
                        }
                    });
                }
            });
            me.$inj.signalService.addCallbackFunction('broadcastMessageGroup', function (message, cardId, group, dateCreated, clientId, nextMessage) {
                var groupConversation = me.getConversationById(group);
                if (groupConversation) {
                    var themessage = {
                        clientId: clientId,
                        cardId: cardId,
                        id: nextMessage.Id,
                        message: message,
                        dateCreated: dateCreated,
                        now: null
                    };
                    var localMessage = groupConversation.messages.first(function (x) {
                        return x.clientId === themessage.clientId;
                    });
                    var alreadyExistsMessage = groupConversation.messages.first(function (x) {
                        return x.id === nextMessage.Id;
                    });
                    if (alreadyExistsMessage) {
                        debugger
                        return;
                    }
                    groupConversation.lastMessage = groupConversation.lastMessage || {};
                    if (groupConversation.lastMessage) {
                        groupConversation.lastMessage.message = message;
                        groupConversation.lastMessage.cardId = cardId;
                        groupConversation.lastMessage.clientId = clientId;
                        groupConversation.lastMessage.id = nextMessage.Id;
                        groupConversation.lastMessage.dateCreated = dateCreated;
                    }
                    me.updateMessage(themessage);
                    MEPH.util.Observable.observable(themessage);
                    if (localMessage) {
                        localMessage.id = nextMessage.Id;
                        localMessage.dateCreated = dateCreated;
                        localMessage.message = message;;
                        localMessage.cardId = cardId;
                    }
                    else {
                        me.$inj.notificationService.notify({
                            message: 'New Message',
                            icon: 'inbox'
                        });
                        groupConversation.messages.push(themessage);
                    }

                    me.sortMessages(groupConversation.messages);
                    me.saveConversations();
                }
            });

        });
    },
    addHandlers: function () {
        var me = this;
        me.on('connected', me.onConnected.bind(me));
        me.on('saved', me.onSaved.bind(me));
    },
    setUnseenMessages: function (unseen) {
        var me = this;
        if (unseen) {
            me.unseenMessages = unseen;
        }
    },
    publishUnseenMessagesUpdate: function () {
        var me = this;

        MEPH.publish(Connection.constant.Constants.UnseenMessages, {
            messages: me.getUnseenMessages()
        });
    },
    getUnseenMessages: function () {
        var me = this;
        return me.unseenMessages;
    },
    onConnected: function (type, options) {
        var me = this;
        me.$onConnectedPromise = me.$onConnectedPromise || Promise.resolve();
        me.$onConnectedPromise = me.$onConnectedPromise.then(function () {
            return me.getSettingsForConversations().then(function () {
                return me.calculateUnseenMessages().then(function (messages) {
                    me.clearSeenMessages();
                    me.addUnseenMessagesToConversations(messages);
                });
            });
        });
    },
    clearSeenMessages: function () {
        var me = this;
        me.monitoredConversations.forEach(function (conversation) {
            if (conversation && conversation.unseenMessages && conversation.unseenMessages.dump) {
                conversation.unseenMessages.dump();
            }
        });
    },
    onSaved: function (type, options) {
        var me = this;

        me.calculateUnseenMessages().then(function (messages) {
            me.clearSeenMessages();
            me.addUnseenMessagesToConversations(messages);
            me.publishUnseenMessagesUpdate();
        });
    },
    addUnseenMessagesToConversations: function (messages) {
        var me = this;
        if (messages) {
            messages.forEach(function (message) {
                if (message && message.id) {
                    var conversation = me.getConversationByMessage(message);
                    if (conversation) {
                        if (!conversation.unseenMessages.some(function (x) {
                             return x.id === message.id && message.id;
                        })) {
                            conversation.unseenMessages.push(message);
                            conversation.unseenCount = conversation.unseenMessages.length;
                        }
                    }
                }
            });
        }
    },
    getConversationByMessage: function (message) {
        var me = this;
        if (message && message.id) {
            return me.monitoredConversations.first(function (x) {
                return x && x.messages.some(function (t) { return t.id === message.id; });
            })
        }
        return null;
    },
    calculateUnseenMessages: function () {
        var me = this;
        var margin = 1000;
        //return me.getUnseen().then(function () {
        //    return me.getUnseenMessages();
        //});
        return me.getMessagingSettings().then(function (settings) {
            var unseenMessages = me.monitoredConversations.select(function (conversation) {
                if (conversation.messages && settings && me.cards) {

                    var index = conversation.messages.firstIndex(function (x) {
                        if (!me.cards.some(function (y) { return y.id === x.cardId; })) {
                            return new Date(x.dateCreated).getTime() <= (settings.oldestSeenMessage - margin);
                        }
                        return false;
                    });

                    var lastIndex = conversation.messages.firstIndex(function (x) {
                        if (!me.cards.some(function (y) { return y.id === x.cardId; })) {
                            return new Date(x.dateCreated).getTime() > (settings.latestSeenMessage + margin);
                        }
                        return false;
                    });

                    return (index === -1 ? [] : conversation.messages.subset(0, index))
                        .concat(lastIndex === -1 ? [] : conversation.messages.subset(lastIndex));
                }
                else {
                    return [];
                }
            }).concatFluent();
            me.setUnseenMessages(unseenMessages);
            return unseenMessages;
        });
    },
    onSignalServiceStateChange: function (type, options) {
        var me = this;
        me.when.injected.then(function () {
            me.$inj.overlayService.close('signal-service-state');
            if (options.value === 'disconnected') {
                setTimeout(function () {
                    me.$inj.signalService.restart();
                }, 5000);
            }
            else if (options.value === 'connected') {

                me.addConnection();
            }
            me.fire(type, options);
            return me.$inj.overlayService.open('signal-service-state', {
                template: 'Connection.template.SignalStateOverlay',
                bindTo: {
                    position: 'bottom-left',
                    signalColor: options.value
                }
            });
        });
    },
    addConnection: function () {
        var me = this;
        return me.when.injected.then(function () {
            return me.$inj.tokenService.getUserId().then(function (userId) {
                return me.getToken().then(function (token) {
                    return me.makeSignalReady().then(function () {
                        me.$inj.signalService.send.apply(me.$inj.signalService, ['addConnection', token, userId]);
                    });
                });
            });
        })
    },
    removeClientMessage: function (message, id) {
        var me = this;
        if (message && message.clientId && (id || message.messageGroup)) {
            var conversation = me.getConversationById((id || message.messageGroup));
            conversation.messages.removeWhere(function (x) {
                return x.clientId === message.clientId;
            });
        }
    },
    getMessagesInTheLast: function (seconds) {
        var me = this;
        return me.when.injected.then(function () {
            return me.$inj.tokenService.getUserId().then(function (userId) {
                return me.getToken().then(function (token) {
                    return me.makeSignalReady().then(function () {
                        me.$inj.signalService.send.apply(me.$inj.signalService, ['getMessages', token, userId, seconds ? seconds * 2 : 500]);
                    });
                });
            });
        })
    },
    makeSignalReady: function () {
        var me = this;
        return me.when.injected.then(function () {
            if (me.$inj.signalService.isDisconnected()) {
                return me.$inj.signalService.restart().then(function () {
                    return me.$inj.signalService.whenStarted();
                });
            }
            return me.$inj.signalService.whenStarted();
        });
    },
    mergeMessagesIntoConversations: function (messages) {
        var me = this;
        MEPH.Log('Merge messages from being asleep.');
        if (messages && messages.length) {
            MEPH.Log(messages);

            messages.forEach(function (message) {
                var group = message.MessageGroup;
                message = MEPH.clone(message);
                var newmessage = {};
                for (var i in message) {
                    newmessage[i.lowerCaseFirstLetter()] = message[i];
                }
                MEPH.util.Observable.observable(newmessage);
                var conversation = me.getConversationById(group);
                if (conversation.messages) {
                    var foundMessage = conversation.messages.first(function (x) {
                        return x.id === message.Id;
                    });
                    if (!foundMessage) {
                        conversation.messages.push(newmessage);
                    }
                    else {
                        foundMessage.message = newmessage.message;
                        foundMessage.dateCreated = newmessage.dateCreated;
                    }
                }
                else {
                    conversation.messages = MEPH.util.Observable.observable([newmessage]);
                }
            });
        }
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
        me.saveConversations();
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
            me.when.injected.then(function () {
                me.saveConversations();
                var conversation = me.$inj.stateService.getConversation()
                if (conversation && conversation.data && conversation.data.id === groupConversation.id) {
                    me.$inj.stateService.clearConversation();
                }
            });
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
    resendUnconfirmedMessage: function () {
        var me = this;

        me.when.injected.then(function () {
            return me.getToken();
        }).then(function (token) {
            me.monitoredConversations.forEach(function (chatSession) {
                if (chatSession.messages)
                    return chatSession.messages.select(function (themessage) {
                        if (themessage)
                            if (themessage.clientId && !themessage.id) {
                                me.makeSignalReady().then(function () {
                                    return me.sendMessage('sendGroup', token, themessage.message, chatSession.userCardId, chatSession.id, themessage.clientId);
                                });
                            }
                    });
            });
        });
    },
    updateMessage: function (message) {
        var me = this;
        var card = me.getCard(message.cardId);
        if (card) {
            message.name = card.name || (card.firstname + ' ' + card.lastname);
            message.profileimage = card.profileimage;
            message.now = Date.now();
            MEPH.util.Observable.observable(message);
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
                    if (me.$inj.relationshipService)
                        card = me.$inj.relationshipService.processCard(card);
                    me.contactCardCollection.push(card);
                }
            });

        }
    },
    addContactToConversation: function (contact, id, groupContacts) {
        var me = this;
        return me.addContactsToConversation([contact.card], id, groupContacts);
    },
    addContactsToConversation: function (contacts, id, groupContacts) {
        var me = this;
        return me.when.injected.then(function () {
            if (id) {
                return me.$inj.rest.addPath('messages/add/to/group').post({
                    cards: contacts,
                    group: id
                }).then(function (result) {
                    if (result.success && result.authorized) {
                        result.cards.foreach(function (contact) {
                            me.addContactToGroupContactsArray(contact, groupContacts);
                        });
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
            var me = this;
            MEPH.util.Observable.observable(contact);
            me.collectCards([contact]);
            groupContacts.removeWhere(function (x) {
                return x.card === contact.card;
            });
            groupContacts.push(MEPH.util.Observable.observable(contact));
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
                        return true;
                    }
                });
            }
            else {// If not saved just remove from the conversations.
                groupContacts.removeWhere(function (x) {
                    return x.card === contact.card;
                });
                return true;
            }
            return false;
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
        if (me.cards && me.cards.length) {
            if (!me.cards.some(function (card) {
    return contactsForConversation.some(function (x) { return x.card === card.id; });
            })) {

                if (update && update.Group) {
                    me.removeFromConversationsById(update.Group);
                    return;
                }
            }
        }
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
            if (conversation.cards) {
                MEPH.util.Observable.observable(conversation);
                MEPH.util.Observable.observable(conversation.cards);
                conversation.cards.dump();
                conversation.cards.push.apply(conversation.cards, contactsForConversation);
            }
            else {
                debugger
            }
        }
    },
    newMonitoredGroup: function (update) {
        var me = this;
        me.$getConvoPromise = (me.$getConvoPromise || Promise.resolve()).then(function () {
            return me.getConversations();
        });
    },
    updateMessages: function (update) {
        var me = this;
        var conversation = me.getConversationById(update.Group);

        if (conversation && conversation.messages) {
            if (update.RemovedMessages)
                update.RemovedMessages.foreach(function (messageId) {
                    conversation.messages.removeWhere(function (x) {
                        return x.id === messageId;
                    });
                });

            me.saveConversations();
        }
        if (update.Messages) {
            update.Messages.select(function (x) {
                var t = {};
                for (var i in x) {
                    t[i.lowerCaseFirstLetter()] = x[i];
                }
                return t;
            }).foreach(function (message) {
                me.receiveMessage(message);
            });
        }
    },
    receiveMessage: function (message) {
        var me = this;
        var group = message.messageGroup;
        var groupConversation = me.getConversationById(group);
        if (groupConversation) {
            if (!groupConversation.messages.some(function (x) { return x.id === message.id; })) {
                message.now = null;
                groupConversation.lastMessage = groupConversation.lastMessage || {};
                if (groupConversation.lastMessage) {
                    groupConversation.lastMessage.message = message.message;
                    groupConversation.lastMessage.cardId = message.cardId;
                    groupConversation.lastMessage.clientId = message.clientId;
                    groupConversation.lastMessage.id = message.id;
                    groupConversation.lastMessage.dateCreated = message.dateCreated;
                }
                me.updateMessage(message);
                MEPH.util.Observable.observable(message);
                me.$inj.notificationService.notify({
                    message: 'New Message',
                    icon: 'inbox'
                });
                groupConversation.messages._pause();
                groupConversation.messages.push(message);
                groupConversation.messages._start();
                me.sortMessages(groupConversation.messages);
                me.saveConversations();
            }
        }
    },
    updateConversationSettings: function (update) {
        var me = this;
        var settings = me.getConversationSetting(update.Group);
        if (!settings) {
            settings = { id: update.Group };
            me.conversationSettings.push(settings);
        }
        if (settings) {
            settings.notificationValue = update.NotificationValue;
            settings.notificationExpiration = update.NotificationExpiration && !isNaN(update.NotificationExpiration) ? Date.now() + update.NotificationExpiration : null;

        }
        me.saveConversationSettings();
    },
    setOldestSeenMessage: function (num) {
        var me = this;
        return me.getMessagingSettings().then(function (settings) {
            settings.oldestSeenMessage = num;
            return me.saveMessagingSettings(settings);
        });
    },
    setMostRecentlySeenMessageDate: function (num) {
        var me = this;
        return me.getMessagingSettings().then(function (settings) {
            settings.latestSeenMessage = num;
            return me.saveMessagingSettings(settings);
        });
    },
    updateMessingSettings: function (update) {
        var me = this;
        me.$messagingSettingPromise = (me.$messagingSettingPromise || Promise.resolve()).then(function () {
            return me.getMessagingSettings().then(function (settings) {
                if (!settings) {
                    settings = {};
                }
                if (settings) {
                    if (update.OldestSeenMessageDate) {
                        var olddate = new Date(update.OldestSeenMessageDate).getTime();
                        me.setOldestSeenMessage(olddate);
                    }
                    if (update.MostRecentlySeenMessageDate) {
                        var olddate = new Date(update.MostRecentlySeenMessageDate).getTime();
                        settings.latestSeenMessage = olddate;
                    }
                }
                return me.saveMessagingSettings(settings);
            });
        });
    },
    getMessagingSettings: function () {
        var me = this;
        return me.when.injected.then(function () {
            return me.$inj.storage.get(me.$messagingSettingsKey);
        });
    },
    saveMessagingSettings: function (settings) {
        var me = this;
        return me.when.injected.then(function () {
            return me.$inj.storage.set(me.$messagingSettingsKey, settings);
        }).then(function () {
            me.fire('saved', {});
        });
    },
    saveConversationSettings: function () {
        var me = this;
        if (me.$saveSettingsThrottle) {
            clearTimeout(me.$saveSettingsThrottle);
            me.$saveSettingsThrottle = null;
        }
        me.$saveSettingsThrottle = setTimeout(function () {
            me.$saveSettingsThrottle = null;
            me.when.injected.then(function () {
                return me.$inj.storage.set(me.$conversationSettingsKey, me.conversationSettings);
            }).then(function () {
                me.fire('saved', {});
            });
        }, me.$saveThrottleTime);
    },
    openConversationSettings: function () {
        var me = this;
        me.when.injected.then(function () {
            return me.$inj.storage.get(me.$conversationSettingsKey).then(function (res) {
                if (res) {
                    me.conversationSettings = res;
                }
            })
        });
    },
    getConversationSetting: function (id) {
        var me = this;
        var settings = me.conversationSettings.first(function (setting) {
            if (setting.id === id) {
                return setting;
            }
        });
        return settings;
    },
    updateMessageSeenSettings: function (id) {
        var me = this;
        var settings = me.getConversationSetting(id);
        if (settings) {
            var conversation = me.getConversationById(id);
            if (conversation && conversation.messages) {
                var oldest = conversation.messages.first();
                var newest = conversation.messages.maxSelection(function (x) {
                    return x && x.dateCreated ? new Date(x.dateCreated).getTime() : 0;
                })
                if (oldest && newest && (oldest.id !== me.$lastOldestId || newest.id !== me.$lastNewestId))
                    me.$conversationPropertyUpdatePromise = me.$conversationPropertyUpdatePromise.then(function () {
                        var newtime = new Date(newest.dateCreated).getTime();
                        var oldtime = new Date(oldest.dateCreated).getTime();
                        var $last = me.$lastOldestId;
                        var $newest = me.$lastNewestId;
                        me.$lastOldestId = oldest.id;
                        me.$lastNewestId = newest.id;
                        return ($last !== oldest.id ?
                            me.updateConversationProperty('OldestSeenMessage', oldest.id, id) : Promise.resolve()).then(function () {
                                if (($newest !== newest.id)) {
                                    return me.updateConversationProperty('NewestSeenMessage', newest.id, id).then(function (results) {
                                        if (results) {
                                            var olddate = new Date(results.oldestSeenMessageDate).getTime();
                                            return me.setOldestSeenMessage(olddate).then(function () {
                                                var newdate = new Date(results.mostRecentlySeenMessageDate).getTime();
                                                me.setMostRecentlySeenMessageDate(newdate);
                                            })
                                        }
                                    });
                                }
                            });
                    }).catch(function () {
                        me.$inj.notificationService.notify({
                            icon: 'exclamation-triangle',
                            message: 'An error occurred'
                        })
                    });
            }
        }
    },
    cleanUnseenMessages: function (id) {
        var me = this,
            conversation = me.getConversationById(id);
        if (conversation) {
            conversation.unseenMessages = MEPH.util.Observable.observable(conversation.unseenMessages || []);
            conversation.unseenMessages.dump();
            conversation.unseenCount = conversation.unseenMessages.length;
            conversation.messages.foreach(function (message) {
                me.getUnseenMessages().removeWhere(function (t) { return message.id === t.id; });
                me.publishUnseenMessagesUpdate();
            })
        }
    },
    monitorConversation: function (conversation) {
        var me = this, result = [];
        var res = MEPH.util.Array.convert(arguments).where(function (conversation) {
            conversation.unseenMessages = MEPH.util.Observable.observable(conversation.unseenMessages || []);
            conversation.unseenCount = conversation.unseenMessages.length;
            conversation.messages = MEPH.util.Observable.observable(conversation.messages || []);
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
                existingConversation.messages = MEPH.util.Observable.observable(existingConversation.messages || []);
                me.sortMessages(existingConversation.messages);
                result.push(existingConversation);
                return false;
            }
            else {
                if (conversation.messages)
                    me.sortMessages(conversation.messages);
                conversation.cards = MEPH.util.Observable.observable(conversation.cards || []);
                MEPH.util.Observable.observable(conversation);
                result.push(conversation);
                return conversation;
            }
        });
        me.monitoredConversations._pause();
        me.monitoredConversations.push.apply(me.monitoredConversations, res);
        me.monitoredConversations._start();
        me.sortMonitoredConversations(me.monitoredConversations);
        return result.length > 1 ? result : result[0] || null;
    },
    sortMonitoredConversations: function (monitoredConversations) {
        if (monitoredConversations) {
            monitoredConversations.sort(function (x, y) {
                if (y.lastMessage && x.lastMessage) {
                    return new Date(y.lastMessage.dateCreated).getTime() - new Date(x.lastMessage.dateCreated).getTime();
                }
                else if (y.lastMessage) {
                    return 1;
                }
                else if (x.lastMessage) {
                    return -1;
                }
                return 0;
            });
        }
    },
    sortMessages: function (messages) {
        if (messages)
            messages.sort(function (x, y) {
                return new Date(x.dateCreated).getTime() - new Date(y.dateCreated).getTime();
            })
    },
    refreshToken: function () {
        var me = this;
        return me.when.injected.then(function () {
            return me.$inj.tokenService.refreshToken();
        })
    },
    getToken: function () {
        var me = this;
        return me.when.injected.then(function () {
            return me.$inj.tokenService.getToken();
        });
    },
    getConversationById: function (id) {
        var me = this;
        return me.monitoredConversations.first(function (x) { return x.id === id; });
    },
    saveConversations: function () {
        var me = this;
        if (me.$saveThrottle) {
            clearTimeout(me.$saveThrottle);
            me.$saveThrottle = null;
        }
        me.$saveThrottle = setTimeout(function () {
            try {
                me.$saveThrottle = null;
                me.when.injected.then(function () {
                    me.$inj.storage.set(me.serviceStorageKey, { groups: me.monitoredConversations }).catch(function () {
                        MEPH.Log(new Error('Didnt save monitored conversations'));
                        me.$inj.notificationService.notify({
                            icon: 'exclamation-triangle',
                            message: 'Didn\'t save monitored conversations.'
                        });
                    })
                });
            } catch (e) {

            }
            me.fire('saved', {});
        }, me.$saveThrottleTime);
    },
    getConversations: function (conversationList, start, fetch) {
        var me = this, err;
        start = start || 0;
        fetch = fetch || 10;
        var throttleId = 'getConversations' + start + ' ' + fetch;

        var res = me.$throttle(throttleId, throttleId);
        if (res) {
            return res;
        }

        var cancel = {};
        var tothrottle = me.when.injected.then(function () {
            me.$inj.overlayService.open('get conversationts');
            if (conversationList) {
                conversationList.ref[conversationList.property] = me.monitoredConversations;
                conversationList = me.monitoredConversations;
            }
            return me.$inj.storage.get(me.serviceStorageKey).then(function (res) {
                if (res && res.groups) {
                    me.$inj.overlayService.relegate('get conversationts');
                    res.groups.foreach(function (x) {
                        x.cards = MEPH.util.Observable.observable(x.cards || []);
                        MEPH.util.Observable.observable(x);
                        x.cards.un(null, me);
                        x.cards.on('changed', function (x) {
                            x.fire('altered', { path: 'cards' });
                            MEPH.Log('cards updated')
                        }.bind(me, x), me);
                        me.collectCards(x.cards);
                    });
                    me.updateMonitoredCards();
                    me.monitorConversation.apply(me, res.groups);
                }
                return me.getToken().then(function (token) {
                    return me.$inj.rest.nocache().addPath('messages/groups/{fetch}/{start}/').get({
                        fetch: fetch,
                        start: start
                    }).then(function (res) {
                        if (res && res.success && res.authorized) {
                            if (res.groups) {
                                res.groups.foreach(function (x) {

                                    x.cards = MEPH.util.Observable.observable(x.cards || []);
                                    MEPH.util.Observable.observable(x);
                                    x.cards.un(null, me);
                                    x.cards.on('changed', function (x) {
                                        x.fire('altered', { path: 'cards' });
                                        MEPH.Log('cards updated')
                                    }.bind(me, x), me);
                                    me.collectCards(x.cards);
                                });
                                me.updateMonitoredCards();

                                me.monitorConversation.apply(me, res.groups);
                                fetch = res.groups.length;
                                me.$inj.storage.set(me.serviceStorageKey, res);
                            }
                        }
                    });
                });
            });
        }).catch(function (error) {
            err = error;
            me.$inj.notificationService.notify({
                icon: 'exclamation-triangle',
                message: 'Something went wrong: ' + (err && err.message ? err.message : err)
            });
        }).then(function () {
            me.$inj.overlayService.close('get conversationts');
            if (err) {
                throw err;
            }
            return { start: start, fetch: fetch };
        });
        tothrottle.cancel = cancel;
        return me.$throttle(tothrottle, throttleId, throttleId, me.throttleSeconds);

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
            return me.when.injected.then(function () {
                return me.getToken().then(function (token) {
                    if (!chatSession.id) {
                        return me.$inj.rest.nocache().addPath('messages/createconversation').post({
                            cards: chatSession.cards.select(function (x) { return x.card; })
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
                if (session) {
                    if (session.userCardId) {
                        return me.makeSignalReady().then(function () {
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
                                me.updateMessage(themessage);
                                convo.messages.push(themessage);
                            }
                            return me.sendMessage('sendGroup', token, val, session.userCardId, chatSession.id, clientId);
                        });
                    }
                    session.messages = session.messages || MEPH.util.Observable.observable([]);
                }
            }).catch(function (e) {
                me.$inj.notificationService.notify({
                    icon: 'exclamation-triangle',
                    message: 'Something went wrong: ' + (e && e.message ? e.message : e)
                });
            });
    },
    updateConversationMessages: function (conversation) {
        var me = this;
        if (conversation && conversation.id) {


            var convo = me.getConversationById(conversation.id);
            me.checkMessages(convo.messages.select(function (x) {
                return x.id;
            }), convo.id);
        }
    },
    checkMessages: function (messages, group) {
        var me = this;
        if (messages && messages.length && group) {
            me.$checkMessagesPromise = me.$checkMessagesPromise.then(function () {
                return me.when.injected.then(function () {
                    return me.$inj.rest.nocache().addPath('messages/check')
                          .post({
                              communicationGroup: group,
                              messages: messages
                          }).catch(function () {
                              me.$inj.notificationService.notify({
                                  icon: 'exclamation-triangle',
                                  message: 'Something went checking the messages'
                              });
                          });
                });
            });
        }
    },
    healthCheck: function () {
        var me = this;
        me.$healthCheckPromise = me.$healthCheckPromise.then(function () {
            return me.when.injected.then(function () {
                return me.$inj.tokenService.getUserId().then(function (userId) {
                    return me.getToken().then(function (token) {
                        return me.sendMessage('groupStatus', token, userId, me.getGroupIds());
                    });
                });
            }).catch(function () {
            });
        });
    },
    getSettingsForConversation: function (id) {
        var me = this;
        if (id) {
            var throttleKey = 'get settings for conversation';
            var res = me.$throttle(throttleKey + id, throttleKey + id);
            if (res) {
                return res;
            }
            var cancel = {};
            var tothrottle = me.when.injected.then(function () {
                var rest = me.$inj.rest.nocache().addPath('messages/get/conversation/settings/{id}');
                cancel.abort = function () {
                    rest.out.http.abort();
                }

                return rest.get({
                    id: id
                });
            });
            tothrottle.cancel = cancel;
            return me.$throttle(tothrottle, throttleKey + id, throttleKey + id, me.throttleSeconds);
        }
    },
    getUnseen: function () {
        var me = this;
        var throttleKey = 'get unseen';
        var res = me.$throttle(throttleKey, throttleKey);
        if (res) {
            return res;
        }

        var cancel = {};
        var tothrottle = me.when.injected.then(function () {
            var rest = me.$inj.rest.nocache().addPath('messages/unseen');
            cancel.abort = function () {
                rest.out.http.abort();
            }
            return rest.get().then(function (result) {
                if (result.success && result.authorized) {
                    me.setUnseenMessages(result.unseenMessages);
                }
            });
        });
        tothrottle.cancel = cancel;
        return me.$throttle(tothrottle, throttleKey, throttleKey);
    },
    getSettingsForConversations: function () {
        var me = this;
        var throttleKey = 'get settings for conversations';
        var res = me.$throttle(throttleKey, throttleKey);
        if (res) {
            return res;
        }
        var cancel = {};
        var tothrottle = me.when.injected.then(function () {
            var rest = me.$inj.rest.nocache().addPath('messages/get/conversations/settings');
            cancel.abort = function () {
                rest.out.http.abort();
            }

            return rest.get();
        });
        tothrottle.cancel = cancel;
        return me.$throttle(tothrottle, throttleKey, throttleKey, me.throttleSeconds);

    },
    openConversation: function (conversation, fetch, start) {
        var me = this;
        fetch = fetch || 10;
        start = start || 0;
        if (conversation && conversation.id) {
            me.cleanUnseenMessages(conversation.id);
            var res = me.$throttle('openConversation ' + conversation.id, 'openConversation');
            if (res) {
                return res;
            }
            var cancel = {};
            var tothrottle = me.when.injected.then(function () {
                var rest = me.$inj.rest.nocache().addPath('messages/conversations/{group}/{fetch}/{start}');
                cancel.abort = function () {
                    rest.out.http.abort();
                }

                return rest.get({
                    fetch: fetch,
                    start: start,
                    group: conversation.id
                }).then(function (results) {
                    if (results.authorized && results.success) {
                        results.cards = MEPH.util.Observable.observable(results.cards || []);
                        results.messages = MEPH.util.Observable.observable(results.messages || []);
                        me.sortMessages(results.messages);
                        me.collectCards(results.cards);
                        var toreturn = me.monitorConversation(results);
                        toreturn.cards = results.cards;
                        me.updateMonitoredCards();
                        me.cleanUnseenMessages(conversation.id);
                        return me.getConversationById(conversation.id);
                    }
                    else {

                        me.$inj.notificationService.notify({
                            icon: 'info',
                            message: 'May not be the most recent.'
                        });
                        return me.getConversationById(conversation.id);
                    }
                });
            });
            tothrottle.cancel = cancel;
            return me.$throttle(tothrottle, 'openConversation ' + conversation.id, 'openConversation');

        }
        else {
            return Promise.resolve(null);
        }
    },
    searchConversations: function (data, conversations) {
        var me = this;
        return me.when.injected.then(function () {

        });
    },
    updateConversationProperty: function (property, value, group) {
        var me = this;
        return me.when.injected.then(function () {
            return me.getToken().then(function (token) {
                return me.$inj.rest.nocache().addPath('messages/update/conversation/settings')
                        .post({
                            communicationGroup: group,
                            property: property,
                            value: value
                        }).then(function (result) {
                            if (result.success && result.authorized) {
                                return result;
                            }
                            else {
                                me.$inj.notificationService.notify({
                                    icon: 'exclamation-triangle',
                                    message: 'Could not update settings for some reason.'
                                });
                            }
                        });
            });
        });
    },
    removeMessage: function (message, id) {
        var me = this;
        if (message.id == null) {
            me.removeClientMessage(message, id || message.messageGroup);
        }
        else {
            return me.when.injected.then(function () {
                return me.getToken().then(function (token) {
                    return me.$inj.rest.nocache().addPath('messages/remove/from/conversation')
                            .post({
                                messages: [message.id],
                                group: id || message.messageGroup
                            }).then(function (result) {
                                if (result.success && result.authorized) {

                                }
                            });
                });
            });
        }
    },
    createConversation: function (cards) {
        var me = this;
        return me.when.injected.then(function () {
            return me.getToken().then(function (token) {
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
                            me.$inj.notificationService.notify({
                                icon: 'exclamation-triangle',
                                message: 'Couldn\'t create the converation.'
                            });
                            throw new Error('Couldnt create conversation')
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