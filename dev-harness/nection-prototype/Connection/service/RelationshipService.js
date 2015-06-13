MEPH.define('Connection.service.RelationshipService', {
    injections: ['rest', 'overlayService', 'deviceContactsProvider', 'storage', 'notificationService'],
    requires: ['MEPH.util.Geo', 'MEPH.util.KString'],
    mixins: {
        injectable: 'MEPH.mixins.Injections'
    },
    properties: {
        mergeThreshold: .99,
        $storageKey: 'connection-service-relationship-storage',
        $storageServerCached: 'connection-service-server-cached-cards'
    },
    initialize: function () {
        var me = this;

        me.geoUtil = new MEPH.util.Geo();
        me.deviceContacts = null;
        me.savedContactsFromServer = null;
        me.myRelationshipsContacts = null;
        me.serverCachedSearchResults = [];
        me.mixins.injectable.init.apply(me);
        me.alternateImages = me.getAlternateProfileImages();
        me.ready = new Promise(function (r) {
            me.injectionsResolve = r;
        });
        MEPH.subscribe(MEPH.Constants.LOGOUT, function () {
            me.when.injected.then(function () {
                me.$inj.storage.set(me.$storageKey, null);
                me.$inj.storage.set(me.$storageServerCached, null);
            })
        })
        me.loadedServerCachedContacts = me.when.injected.then(function () {
            return me.$inj.storage.get(me.$storageServerCached).then(function (res) {
                me.serverCachedSearchResults = res || me.serverCachedSearchResults;
            }).then(function () {
                setInterval(function () {
                    if (me.serverCachedSearchResults) {
                        me.$inj.storage.set(me.$storageServerCached, me.serverCachedSearchResults);
                    }
                }, 1000 * 60);
            });
        });
    },
    afterServerCachedLoaded: function (callback) {
        var me = this;
        me.loadedServerCachedContacts.then(function () { return callback(); })
    },
    onInjectionsComplete: function () {
        var me = this;
        me.injectionsResolve();
    },
    loadCache: function () {
        var me = this;
        return me.ready.then(function () {
            MEPH.Log('Loading cache');
            return me.$inj.storage.get(me.$storageKey).then(function (res) {
                if (res) {
                    me.savedContactsFromServer = res.savedContactsFromServer && res.savedContactsFromServer.length ? res.savedContactsFromServer : null;
                    me.myRelationshipsContacts = res.myRelationshipsContacts && res.myRelationshipsContacts.length ? res.myRelationshipsContacts : null;
                }
                MEPH.Log('Loaded cache');
            });
        }).catch(function () {
            MEPH.Log('an error occurred while loading cache.')
        });
    },
    setDeviceContacts: function (deviceContacts) {
        var me = this;
        return me.ready.then(function () {
            MEPH.Log('Set Contact Parts', 9);
            me.deviceContacts = deviceContacts || me.deviceContacts;
        });
    },
    setSavedContacts: function (savedContactsFromServer) {
        var me = this;
        return me.ready.then(function () {
            MEPH.Log('Set Contact Parts', 9);
            me.savedContactsFromServer = savedContactsFromServer || me.savedContactsFromServer;
        });
    },
    setMyRelationshipContacts: function (myRelationshipsContacts) {
        var me = this;
        return me.ready.then(function () {
            MEPH.Log('Set Contact Parts', 9);
            me.myRelationshipsContacts = myRelationshipsContacts || me.myRelationshipsContacts;
            if (me.myRelationshipsContacts) {
                me.relationshipsContacts = me.convertContactDTO(me.myRelationshipsContacts);
            }
        });
    },
    setContactParts: function (deviceContacts, savedContactsFromServer, myRelationshipsContacts) {
        var me = this;
        return me.ready.then(function () {
            MEPH.Log('Set Contact Parts', 9);
            me.deviceContacts = deviceContacts || me.deviceContacts;
            me.savedContactsFromServer = savedContactsFromServer || me.savedContactsFromServer;
            me.myRelationshipsContacts = myRelationshipsContacts || me.myRelationshipsContacts;
            if (savedContactsFromServer || myRelationshipsContacts) {
                MEPH.Log('calling me.$inj.storage.set', 9);
                //try {
                if (me.$inj) {
                    MEPH.Log('me.$inj exists', 9);
                    if (me.$inj.storage) {
                        MEPH.Log('me.$inj.storage exists', 9);
                        if (me.$inj.storage.set) {
                            MEPH.Log('me.$inj.storage.set exists', 9);
                        }

                        return me.$inj.storage.set(me.$storageKey, {
                            savedContactsFromServer: me.savedContactsFromServer,
                            myRelationshipsContacts: me.myRelationshipsContacts
                        }).catch(function () {
                            MEPH.Log('There was a problem setting the contacts, int storage', 3);
                        })
                    }
                }
                //} catch (e) {
                //    MEPH.Log('An exception was thrown while setting contacts.', 3)
                //}
            }
        })
    },
    updateContactList: function (devicecontacts) {
        var me = this;
        me.when.injected.then(function () {
            if (me.$inj.notificationService)
                me.$inj.notificationService.notify({ message: 'Updating contact list.' })
        });
        return me.$inj.rest.addPath('contact/post/contactlist').post({
            contactList: devicecontacts
        }).then(function (postresult) {
            MEPH.Log('post returned.')
            if (postresult && postresult.authorized) {
                MEPH.Log(postresult.contactList);
                return postresult.contactList;
            }
            return null;
        });
    },
    mergeDeviceContacts: function () {
        var me = this,
            mergeProperties = ['cardname'];
        //['firstname', 'lastname', 'middlename', 'phone2', 'phone1', 'name', 'email1', 'email2'];
        if (!window.runningInCordova && me.deviceContacts && me.deviceContacts.length && me.savedContactsFromServer) {
            MEPH.Log('Merging device contacts');
            var converted = me.savedContactsFromServer.where(function (t) {
                var x = me.convertDeviceContactToCard(t);
                return (x.phone1 || x.email1) && x.name;
            });
            var deviceConverted = me.deviceContacts.where(function (t) {
                var x = me.convertDeviceContactToCard(t);
                return (x.phone1 || x.email1) && x.name;
            });

            var nonmerged = deviceConverted.relativeCompliment(converted, function (xt, yt) {
                var x = me.convertDeviceContactToCard(xt);
                var y = me.convertDeviceContactToCard(yt);
                return mergeProperties.all(function (p) {
                    return x[p] === y[p];
                });
            });

            nonmerged.foreach(function (t) {
                var y = me.convertDeviceContactToCard(t);
                me.savedContactsFromServer.push(y);
            });


            MEPH.Log('Merged device contacts');
            if (nonmerged.length) {
                MEPH.Log('Definitely would like to merge some contacts to the server !!!!!', 1)
            }
        }

        else if (window.runningInCordova && me.deviceContacts && me.deviceContacts.length) {
            me.updateContactList(JSON.stringify(me.deviceContacts));
        }
        if (false && me.convertedContactCards) {
            me.kstringsProcessors = [];

            mergeProperties.foreach(function (x) {
                var kstring = new MEPH.util.KString();
                me.kstringsProcessors.push({
                    prop: x,
                    processor: kstring
                });

                var seed = me.convertedContactCards.select(function (t) {
                    return t[x] ? t[x].replace(/ /g, "") : '';
                });

                kstring.preprocess(seed);
            });

            var merged = [];
            var mergeCandidates = me.convertedContactCards.select(function (card) {
                var closestcards = []
                me.kstringsProcessors.foreach(function (obj) {
                    var val = card[obj.prop] ? card[obj.prop].replace(/ /g, "") : '';
                    var $closestcards = obj.processor.getClosest(val, 5);
                    $closestcards.foreach(function (c) {
                        var temp = closestcards.first(function (x) {
                            return x.i === c.i;
                        });
                        if (!temp) {
                            closestcards.push({ i: c.i, total_score: c.score, max_score: val.length - 2 })
                        }
                        else {
                            temp.total_score += c.score;
                            temp.max_score += val.length - 2;
                        }
                    });
                });
                return {
                    card: card, closest: closestcards.orderBy(function (x, y) {
                        return y.total_score - x.total_score;
                    }).subset(0, 5)
                };
            }).select(function (x, i) {
                if (merged.indexOf(i) === -1) {
                    merged.push(i);
                    x.closest.where(function (t) {
                        return merged.indexOf(t.i) === -1 && (t.total_score / t.max_score) >= me.mergeThreshold;;
                    }).foreach(function (t) {
                        if (merged.indexOf(parseInt(t.i)) === -1)
                            merged.push(parseInt(t.i));
                        var $card = me.convertedContactCards[t.i];
                        for (var prop in x.card) {
                            if (!mergeProperties.contains(function (x) { return x === prop; }))
                                if (x.card[prop] && $card[prop]) {
                                    if (x.card[prop].length < $card[prop].length) {
                                        x.card[prop] = $card[prop];
                                    }
                                }
                                else if ($card[prop]) {
                                    x.card[prop] = $card[prop];
                                }
                        }
                    });
                    return x.card;
                }
            }).where();
        }

    },
    getMyRelationshipContacts: function () {
        var me = this;

        return me.ready.then(function () {
            var getrelationshipcontacts = me.$inj.rest.addPath('relationship/my/relationships');
            MEPH.Log('[get]' + getrelationshipcontacts.path());
            return getrelationshipcontacts.get().then(function (response) {
                if (response && response.authorized && response.results) {
                    return response.results;
                }
                return null;
            })
        })
    },
    getContactList: function () {
        var me = this;
        return me.ready.then(function () {
            var getlist = me.$inj.rest.addPath('contact/me/contactlist');
            MEPH.Log('[get] ' + getlist.path());
            return getlist.get().then(function (response) {
                var contactlist = null;
                MEPH.Log('got contact list ')
                if (response && response.authorized && response.contactList) {
                    contactlist = response.contactList;
                    try {
                        contactlist = JSON.parse(contactlist);
                    }
                    catch (e) {
                        contactlist = null;
                    }
                }
                return contactlist;
            });
        });
    },
    loadDeviceContacts: function (search) {
        var me = this;
        MEPH.Log('loading device contacts');
        return me.ready.then(function () {
            if (me.$inj.deviceContactsProvider) {
                MEPH.Log('me.$inj.deviceContactsProvider exists.')
            }
            return me.$inj.deviceContactsProvider.find(search).then(function (res) {
                return res;
            })
        });

    },
    sortCards: function (x, y) {
        var res;
        if (x.match && (!y.match || y.match.indexOf('<b>') !== -1)) {
            return -1;
        }
        else if (y.match && (!x.match || x.match.indexOf('<b>') !== -1)) {
            return 1;
        }
        ['name', 'firstname', 'lastname', 'middlename', 'email1'].some(function (t) {
            var _t;
            if (y[t] && x[t]) {
                _t = (x[t] || '').localeCompare((y[t] || ''));
                if (_t)
                    res = _t;
            }
            else if (y[t]) {
                res = 1;
                return 1;
            }
            else if (x[t]) {
                res = -1;
                return -1;
            }
            return _t;
        });

        return res;
    },
    composeCards: function (source) {
        var me = this;

        if (me.savedContactsFromServer && !me.convertedContactCards) {
            var devicecards = me.savedContactsFromServer.select(function (x) {
                return me.convertDeviceContactToCard(x);
            }).where(function (x) {
                return (x.phone1 || x.email1) && x.name;
            });
            devicecards = devicecards.orderBy(me.sortCards);
            //.foreach(function (x, index) { return x.name = index; });
            me.convertedContactCards = devicecards;
            //#1
            //source.dump();
            //source.push.apply(source, devicecards);
            //#2


            source.pump(function (skip, take) {
                return devicecards.subset(skip, skip + (take || 15));
            });
            source.push.apply(source, devicecards.subset(0, 1));
            source.dump();
        }
        else if (me.savedContactsFromServer) {
            //
        }
    },
    convertDeviceContactToCard: function (deviceContact) {
        var me = this;
        var t = {
            "name": function (t) {
                if (t && t.displayName)
                    return t.displayName.trim();
            },
            "match": function (t) {
                if (t && t.displayName)
                    return t.displayName.trim();
            },
            "firstname": function (t) {
                if (t && t.name && t.name.givenNam)
                    return t.name.givenName.trim();
                return '';
            },
            "middlename": function () { return "" },
            "lastname": function (t) {
                if (t && t.name && t.name.familyName)
                    return t.name.familyName.trim();
                return '';
            },
            "gender": function () { return "" },
            "company": function (t) {
                if (t && t.organizations) {
                    var org = t.organizations.first(function (t) { return t.pref }) ||
                        t.organizations.first();
                    return org ? org.name : '';
                }
                return '';
            },
            "email1": function (t) {
                if (t && t.emails) {
                    var org = t.emails.first(function (t) { return t.pref }) || t.emails.first();
                    if (org) {
                        return org.value;
                    }
                }
                return '';
            },
            "email2": function (t) {
                if (t && t.emails) {
                    var org = t.emails.nth(2, function (t) { return t.pref }) || t.emails.nth(2);
                    if (org) {
                        return org.value;
                    }
                }
                return '';
            },
            "phone1": function (t) {
                if (t && t.phoneNumbers) {
                    var org = t.phoneNumbers.nth(1, function (t) { return t.pref }) || t.phoneNumbers.nth(1);
                    if (org) {
                        return org.value;
                    }
                }
                return '';
            },
            "profileimageurl": function (t) {
                if (window.runningInCordova)
                    if (t && t.photos) {
                        var org = t.photos.nth(1, function (t) { return t.pref }) || t.photos.nth(1);
                        if (org) {
                            return 'url(\'' + org.value + '\')';
                        }
                    }
                me.$randImageCount = me.$randImageCount || 0;
                var rand = (me.$randImageCount++ % me.alternateImages.length);
                if (me.alternateImages[rand]) {
                    return 'url(\'' + me.alternateImages[rand].backgroundSrc + '\')';
                }
                return 'url(data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==)';

            },
            "profileimage": function (t) {
                if (window.runningInCordova)
                    if (t && t.photos) {
                        var org = t.photos.nth(1, function (t) { return t.pref }) || t.photos.nth(1);
                        if (org) {
                            return 'url(\'' + org.value + '\')';
                        }
                    }
                me.$randImageCount = me.$randImageCount || 0;
                var rand = (me.$randImageCount++ % me.alternateImages.length);
                if (me.alternateImages[rand]) {
                    return 'url(\'' + me.alternateImages[rand].backgroundSrc + '\')';
                }
                return 'url(data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==)';

            },
            "phone2": function (t) {
                if (t && t.phoneNumbers) {
                    var org = t.phoneNumbers.nth(2, function (t) { return t.pref }) || t.phoneNumbers.nth(2);
                    if (org) {
                        return org.value;
                    }
                }
                return '';
            },
            "zipcode": function () { return ''; },
            "addressline1": function (t) {
                if (t && t.addresses) {
                    var org = t.addresses.nth(1, function (t) { return t.pref }) || t.addresses.nth(1);
                    if (org) {
                        return org.formatted;
                    }
                }
                return '';
            },
            "occupation": function () { return "" },
            "profileimage": function () { return "" },
            "cardname": function (t) {
                return t.displayName;
            },
            "card": function () { return "device-card" },
            "contact": function () { return "device-contact" }
        };
        var res = {};
        for (var i in t) {
            try {
                res[i] = t[i](deviceContact);
            } catch (e) {
            }

        }
        res.quick_search = (JSON.stringify(res) || '').toLowerCase();
        return res;

    },
    getCloseContacts: function (channel) {
        var me = this;
        return me.ready.then(function () {
            return me.geoUtil.get().then(function (position) {
                return me.$inj.rest.addPath('contact/me/find/contacts/{latitude}/{longitude}/{channel}').get({
                    latitude: position.latitude,
                    channel: channel,
                    longitude: position.longitude
                }).then(function (response) {
                    if (response && response.authorized && response.nearContacts) {
                        var cards = me.convertContactDTO(response.nearContacts);
                        return cards.where();
                    }
                    return [];
                });
            })
        }).catch(function () {
            MEPH.Log('Couldnt get near contacts.')
        });
    },
    setPosition: function (channel) {
        var me = this;
        return me.ready.then(function () {
            return me.geoUtil.get().then(function (position) {
                return me.$inj.rest.addPath('contact/me/position/{latitude}/{longitude}/{channel}').post({
                    latitude: position.latitude,
                    longitude: position.longitude,
                    channel: channel
                });
            })
        }).catch(function () {
            MEPH.Log('Couldnt get near contacts.')
        });
    },
    clearPosition: function () {
        var me = this;
        return me.ready.then(function () {
            return me.$inj.rest.addPath('contact/me/clear/position').post();
        }).catch(function () {
            MEPH.Log('Couldnt get near contacts.')
        });
    },
    loadRelationshipContacts: function (source) {
        if (source && source.length === 0) {
            var me = this;
            if (me.relationshipsContacts) {
                source.pump(function (skip, take) {
                    return me.relationshipsContacts.subset(skip, skip + (take || 15));
                });
                source.push.apply(source, me.relationshipsContacts.subset(0, 1));
                source.dump();
            }
        }
    },
    collectSearchItems: function (search, cards) {
        var me = this,
            result = (cards || []).select();

        var toaddcoverted = me.convertedContactCards && !cards ? me.convertedContactCards.filter(function (x) {
            return x.quick_search.indexOf(search) !== -1;
        }) : [];
        toaddcoverted = toaddcoverted.concat(me.serverCachedSearchResults.filter(function (x) {
            return x.quick_search.indexOf(search) !== -1;
        }));
        if (me.relationshipsContacts) {
            toaddcoverted.unshift.apply(toaddcoverted, me.relationshipsContacts.filter(function (x) {
                if (!me.serverCachedSearchResults.some(function (t) {
                       return t.contactId === x.contactId;
                })) {
                    return false;
                }
                return x.quick_search.indexOf(search) !== -1;
            }));
        }

        toaddcoverted.sort(me.sortCards);

        result = result.concat(toaddcoverted.filter(function (x) {
            return !result.contains(function (y) {
                return x.card === y.card;
            });
        }));
        result.forEach(function (card) {

            if (card.commonRelationshipCount && parseInt(card.commonRelationshipCount)) {

            }
            else {
                card.nocommoncontacts = 'nocommoncontacts';
            }
        });
        return result;
    },
    searchContacts: function (index, count, initial, search, source, cancel, useSearch) {
        var me = this, toaddcoverted = [];
        search = search || '';
        search = search.toLowerCase().trim()
        MEPH.Log('Searching contacts.');
        var now = Date.now();
        me.$source = source || me.$source;
        if (!me.$source) {
            return;
        }
        var toaddcoverted = me.collectSearchItems(search);
        toaddcoverted = toaddcoverted.orderBy(me.sortCards);
        toaddcoverted.foreach(function (x) {
            x.match = x.name;
        });
        var toadd = toaddcoverted;
        source.pump(function (skip, take) {
            return toaddcoverted.subset(skip, skip + (take || 15));
        });
        source.unshift.apply(source, toadd.subset(0, 1));
        source.dump();

        MEPH.Log('Time : ' + ((Date.now() - now) / 1000) + 's');
        var urlSearch = 'search'
        if (!search) {
            return;
        }
        if (!useSearch || search.length < 4)
            urlSearch = 'suggest'

        var guid = search;
        return me.ready.then(function () {
            return me.$inj.overlayService.open(guid);
        }).then(function () {
            me.$inj.overlayService.relegate(guid);
        }).then(function () {
            var rest = me.$inj.rest.addPath('relationship/').addPath(urlSearch);
            MEPH.Log('Relationship search');
            MEPH.Log(rest.path());
            var promise = rest.post({
                index: index,
                count: count,
                initial: initial,
                search: search
            });
            if (cancel) {
                cancel.abort = function () {
                    rest.out.http.abort();
                }
            }
            return promise.then(function (res) {
                if (res && res.results) {
                    res = res.results;

                    var cards = me.convertContactDTO(res);

                    var toremove = toaddcoverted.where(function (x) {
                        return x.card !== 'device-card'
                    }).relativeCompliment(cards, function (x, y) {
                        return x.card === y.card;
                    });

                    var toadd = cards.relativeCompliment(toaddcoverted, function (x, y) {
                        return x.card === y.card
                    });
                    me.serverCachedSearchResults.push.apply(me.serverCachedSearchResults, cards.where(function (x) {
                        var found = me.serverCachedSearchResults.contains(function (t) {

                            return t.card === x.card;
                        });
                        if (found) {
                            for (var i in x) {
                                if (i !== 'card' && i !== 'contact')
                                    found[i] = x[i];
                            }
                        }
                        return found;
                    }));
                    me.serverCachedSearchResults = me.serverCachedSearchResults.subset(0, 10000);
                    cards.forEach(function (x) {
                        x.quick_search = (JSON.stringify(x) || '').toLowerCase();
                    });

                    // me.serverCachedSearchResults.push.apply(me.serverCachedSearchResults, cards);

                    //toaddcoverted.unshift.apply(toaddcoverted, toadd)
                    toaddcoverted = me.collectSearchItems(search, cards);
                    source.pump(function (skip, take) {
                        return toaddcoverted.subset(skip, skip + (take || 15));
                    });
                    source.unshift.apply(source, toaddcoverted.subset(0, 1));
                    source.dump();
                    //source.drop.apply(source, toremove);

                    //source.push.apply(source, toadd);
                }
            }).then(function () {
                return me.$inj.overlayService.close(guid);
            }).catch(function () {
                me.$inj.overlayService.close(guid);
                return Promise.reject('Failed to get search results');
            });

        })
    },
    convertContactDTO: function (res) {
        var me = this;
        var cards = res.select(function (t) {
            return t.cards
        }).concatFluent(function (x) { return x; }).where();

        cards.foreach(function (card) {
            if (card.profileimage) {
                if (card.profileimage.indexOf('https://lh5.googleusercontent.com') !== -1) {
                    card.profileimageurl = 'url(\'' + card.profileimage + '\')';
                }
                else {
                    card.profileimageurl = 'url(\'' + card.profileimage + '?height=200&width=200\')';
                }
            }
            else {
                card.profileimageurl = '';
                card.profileimage = '';
            }
            card.quick_search = card.quick_search || (JSON.stringify(card) || '').toLowerCase();

            if (!card.match) {
                card.match = card.name;
            }
        });
        return cards;
    },
    createRelationship: function (contactData) {
        var me = this;

        return me.ready.then(function () {
            if (contactData) {
                return me.$inj.rest.addPath('relationship/create/{id}').patch({ id: contactData.contact }).then(function (res) {

                    return res.relationship;
                });
            }
            return Promise.reject('no contact ');
        });
    },
    updateRelationship: function (contactObj, relations, del) {
        var me = this;

        return me.ready.then(function () {

            if (contactObj && relations) {
                var model = {
                    id: contactObj.contact,
                    rtype: typeof relations === 'object' ? relations.name : relations,
                    'delete': del || false
                }
                return me.$inj.rest.addPath('relationship/update').post(model).then(function (res) {
                    return me.processRelationshipResult(res);
                });
            }
            return null;
        });
    },
    processRelationshipResult: function (response) {
        var res = response;
        if (res && res.relationship && res.relationship.attributes) {
            return res.relationship.attributes.select(function (t) {
                return {
                    name: t.rType.name
                };
            });
        }
        return null;
    },
    getRelationShip: function (contactData, callback, cancel) {
        var me = this;
        if (me.myRelationshipsContacts) {
            try {
                callback(me.myRelationshipsContacts.some(function (x) {
                    return x.cards.some(function (card) {
                        return card.cardid === contactData.cardid;
                    });
                }));
            } catch (E) { }
        }


        return me.ready.then(function () {
            if (contactData && contactData.card !== 'device-card') {
                var rest = me.$inj.rest.addPath('relationship/get/{id}');
                if (cancel) {
                    cancel.abort = function () {
                        rest.out.http.abort();
                    }
                }
                return rest.get({ id: contactData.contact }).then(function (res) {
                    return me.processRelationshipResult(res);
                });
            }
            return Promise.reject('no contact ');
        });
    },
    getRelationshiptypes: function (relationshipTypes) {
        var me = this;
        return me.ready.then(function () {
            return me.$inj.rest.addPath('relationship/gettypes').get().then(function (res) {
                ///Get the types that aren't include in the relationshipt types.
                var notinclude = res.relationshipTypes.relativeCompliment(relationshipTypes, function (x, y) {
                    return x.name === y.name;
                });

                relationshipTypes.push.apply(relationshipTypes, notinclude);
                return res.relationshipTypes;
            }).catch(function () {
                return Promise.reject('Failed to get relationship type results');
            });

        });
    },
    getAlternateProfileImages: function () {
        var me = this;
        return [{ name: 'Albert Einstein', src: 'AlbertEinstein', ext: '.jpg' },
        { name: 'Dr. Mae Jemison', src: 'Dr_Mae_C_Jemison', ext: '.jpg' },
        { name: 'Emilie Chatelet', src: 'Emilie_Chatelet_portrait_by_Latour', ext: '.jpg' },
        { name: 'George Washington Carver', src: 'George_Washington_Carver', ext: '.jpg' },
        { name: 'Gerty Theresa Cori', src: 'Gerty_Theresa_Cori', ext: '.jpg' },
        { name: 'Marie Curie', src: 'Marie_Curie_Tekniska_museet', ext: '.jpg' },
        { name: 'Neil Degrasse Tyson', src: 'NeilDegrasseTyson', ext: '.jpg' },
        { name: 'Neils Bohr', src: 'Niels_Bohr', ext: '.jpg' },
        { name: 'Yellapragada Subbarao', src: 'Yellapragada_subbarao', ext: '.jpg' }].select(function (x) {
            x.backgroundSrc = MEPH.getSourcePath('Connection.main.view.images.' + x.src, x.ext)
            return x;
        });
    }
});