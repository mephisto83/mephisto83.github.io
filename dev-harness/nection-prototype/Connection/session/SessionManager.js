MEPH.define('Connection.session.SessionManager', {
    extend: 'MEPH.session.SessionManager',
    requires: ['MEPH.Constants'],
    injections: ['identityProviderService', 'notificationService', 'relationshipService'],
    initialize: function () {
        var me = this;
        me.great();

        MEPH.subscribe(Connection.constant.Constants.ConnectionLogIn, function (type, res) {
            if (res && res.provider) {
                me.when.injected.then(function () {
                    me.$inj.notificationService.notify({
                        message: 'Logged in',
                        icon: res.provider.type
                    });
                })
            }
        });
        MEPH.subscribe(MEPH.Constants.ProviderStatusChange, function (type, res) {
            if (res && res.provider && res.online) {
                me.when.injected.then(function () {
                    me.$inj.notificationService.notify({
                        message: 'Logged in',
                        icon: res.provider.constructor.key
                    });
                })
            }
        });
        //
        MEPH.subscribe(Connection.constant.Constants.LoggedIn, function (type, res) {
            if (res && res.provider) {
                me.when.injected.then(function () {
                    me.$inj.notificationService.notify({ message: 'Logged in', icon: res.provider.type })
                });
            }
        });

        MEPH.subscribe(Connection.constant.Constants.ConnectionLogIn, me.loadContactsAndMerge.bind(me));
    },
    loadContactsAndMerge: function () {
        var me = this;
        return me.when.injected.then(function () {
            MEPH.Log('Loading device contacts: Main.js');
            var deviceContacts,
                savedContactsFromServer,
                myRelationshipsContacts;

            return Promise.resolve().then(function () {
                return me.$inj.relationshipService.loadDeviceContacts().then(function (contacts) {
                    if (contacts) {
                        deviceContacts = contacts;
                        if (window.runningInCordova && deviceContacts && deviceContacts.length) {
                            me.$inj.relationshipService.updateContactList(JSON.stringify(deviceContacts))
                            .then(function () {
                                me.when.injected.then(function () {
                                    me.$inj.notificationService.notify({ message: 'Updated contact list', icon: 'cog' })
                                });
                            }).catch(function () {
                                me.when.injected.then(function () {
                                    me.$inj.notificationService.notify({ message: 'Failed to update contact list', icon: 'cog' })
                                });
                            });
                        }
                    }
                });
            }).catch(function () {
            })
        });;
    }
});