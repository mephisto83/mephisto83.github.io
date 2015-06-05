﻿MEPH.define('Connection.main.view.Main', {
    alias: 'main_connection_view',
    templates: true,
    extend: 'MEPH.mobile.activity.container.Container',
    mixins: ['MEPH.mobile.mixins.Activity'],
    injections: ['relationshipService', 'overlayService', 'notificationService'],
    requires: ['MEPH.input.Search',
        'MEPH.util.Observable',
        'MEPH.list.View',
        'Connection.constant.Constants',
        'Connection.template.ContactItem',
        'Connection.main.view.mainview.MainView'],
    properties: {
        listsource: null,
        searchlimit: 250,
        name: null
    },
    initialize: function () {
        var me = this;
        me.callParent.apply(me, arguments);
        MEPH.Log('Creating Main page.');
        // me.on('load', me.onLoaded.bind(me));

        me.ready = me.when.injected;
        MEPH.subscribe(Connection.constant.Constants.ConnectionLogIn, me.loadContactsAndMerge.bind(me));
    },
    afterShow: function () {
        var me = this;
        me.name = 'Main';
        MEPH.Log('Loaded Main.');
        if (!me.listsource) {
            me.listsource = MEPH.util.Observable.observable([]);
            me.loadRelationshipContacts();
        }
    },
    loadRelationshipContacts: function () {
        var me = this;
        me.afterRelationshipsLoaded = me.when.injected.then(function () {
            Promise.resolve().then(function () {
                return me.$inj.relationshipService.loadCache();
            }).then(function () {
                return me.$inj.relationshipService.setMyRelationshipContacts();
            }).then(function () {
                me.$inj.relationshipService.loadRelationshipContacts(me.listsource);
            });
        });
    },
    loadCacheContacts: function () {
        var me = this;
        return (me.afterRelationshipsLoaded || Promise.resolve()).then(function () {
            return me.when.injected.then(function () {
                return Promise.resolve().then(function () {
                    return me.$inj.overlayService.open('connection-main');
                }).then(function () {
                    return me.$inj.relationshipService.loadCache();
                }).then(function () {
                    return me.$inj.relationshipService.composeCards(me.listsource);
                }).catch(function () {
                    MEPH.Error('Couldnt compose cards for some reason.')
                });
            });
        });
    },
    loadContactsAndMerge: function () {
        var me = this;
        me.loggedIn = true;
        return me.ready.then(function () {
            MEPH.Log('Loading device contacts: Main.js');
            var deviceContacts,
                savedContactsFromServer,
                myRelationshipsContacts;
            if (me.$inj.notificationService) {
                me.$inj.notificationService.notify({
                    icon: 'cog',
                    message: 'Loading and merging contacts'
                });
            }
            return me.loadCacheContacts()
                 .then(function () {
                     return me.$inj.overlayService.relegate('connection-main');
                 })
                 .then(function () {
                     return me.$inj.relationshipService.loadDeviceContacts().then(function (contacts) {
                         if (contacts) {
                             deviceContacts = contacts;
                         }
                         MEPH.Log('Loaded device contacts.' + (contacts ? contacts.length : 0));
                     }).then(function () {
                         return me.$inj.relationshipService.setDeviceContacts(deviceContacts);
                     });
                 }).catch(function () {
                     MEPH.Error('There was a problem getting contacts from the device')
                 }).then(function () {
                     MEPH.Log('Get contact list ', 5)
                     return me.$inj.relationshipService.getContactList()
                 }).then(function (contactListFromServer) {
                     MEPH.Log('Set contact list ', 5)
                     savedContactsFromServer = contactListFromServer;
                     return me.$inj.relationshipService.setSavedContacts(savedContactsFromServer);
                 }).catch(function () {
                     MEPH.Error('an error occurred while getting my contact list from the server')
                 }).then(function () {
                     MEPH.Log('Get my relationship contacts', 5)
                     return me.$inj.relationshipService.getMyRelationshipContacts();
                 }).then(function (mycontacts) {
                     MEPH.Log('Got contact list ', 5)
                     myRelationshipsContacts = mycontacts;
                     me.$inj.relationshipService.setMyRelationshipContacts(myRelationshipsContacts);
                 }).catch(function () {
                     MEPH.Error('An error occurred while eget my relationship contacts.')
                 }).then(function () {
                     MEPH.Log('Setting contact parts', 5);
                     //return me.$inj.relationshipService.setContactParts(deviceContacts, savedContactsFromServer, myRelationshipsContacts);
                 }).then(function () {
                     MEPH.Log('Merging device contacts', 5);
                     return me.$inj.relationshipService.mergeDeviceContacts();
                 }).then(function () {
                     MEPH.Log('Composing cards ', 5);
                     return me.$inj.relationshipService.composeCards(me.listsource);
                 }).catch(function () {
                     MEPH.Error('Something went wrong composing the cards.');
                 }).then(function () {
                     if (!me.$hasSearched)
                         me.$inj.relationshipService.searchContacts(0, me.searchlimit, true, '', me.listsource);
                     return me.$inj.overlayService.close('connection-main');
                 });
        });;

    },
    toImageSource: function () {
        var me = this;
        return 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';
    },
    searchDynChanged: function () {
        var me = this;
        var val = MEPH.Array(arguments).last().domEvent.val;//
        me.search(val);
    },
    searchChanged: function (type, val) {
        var me = this;
        //if (me.$timeout) {
        //    clearTimeout(me.$timeout);
        //    me.$timeout = null;
        //}
        var val = me.mainview.searchInput.value; //MEPH.Array(arguments).last().domEvent.val;//
        me.search(val, true);
        //me.listsource.clear();
        //me.orgsource.where(function (x) {
        //    return JSON.stringify(x).toLowerCase().indexOf(val.toLowerCase()) !== -1;
        //}).foreach(function (t) {
        //    me.listsource.push(t);
        //});
        //}, 50);

    },
    search: function (val, search) {
        var me = this;
        MEPH.Log('search value : ' + val);
        if (me.$last_val === val && !search) {
            return;
        }
        me.$last_val = val;
        me.$timeout = setTimeout(function () {

            if (me.cancel && me.cancel.abort) {
                me.cancel.abort();
            }
            me.cancel = {};
            me.$hasSearched = true;
            me.$inj.relationshipService.searchContacts(0, me.searchlimit, true, val, me.listsource, me.cancel, search);

        }, 500);
    },
    openContact: function (data) {
        MEPH.publish(MEPH.Constants.OPEN_ACTIVITY, {
            viewId: 'Contact',
            path: 'main/contact',
            data: MEPH.util.Array.convert(arguments).last().domEvent.data
        });
    }
});