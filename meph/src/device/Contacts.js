/**
 * @class MEPH.device.Contacts
 * Device contacts service.
 **/
MEPH.define('MEPH.device.Contacts', {
    requires: ['MEPH.util.Storage'],
    properties: {
        key: 'meph-device-contacts-storage-key'
    },
    initialize: function () {
        var me = this;

        me.storage = new MEPH.util.Storage();
    },
    find: function (filter) {
        MEPH.Log('Searching :' + filter);
        var me = this;
        return Promise.resolve().then(function () {
            MEPH.Log('returning cached contacts.')
            if (me.cachedcontacts) {
                MEPH.Log('Contacts ' + me.cachedcontacts.length)
                return me.cachedcontacts;
            }
            else {
                return new Promise(function (resolve, fail) {
                    if (window.ContactFindOptions) {
                        MEPH.Log('ContactFindOptions exists');
                        var options = new ContactFindOptions();
                        options.filter = '';
                        options.multiple = true;
                        var fields = ['displayName', 'name', 'nickname', 'phoneNumbers', 'emails', 'addresses',
                            'ims', 'organizations', 'birthday', 'note', 'photos'];
                        if (navigator && navigator.contacts && navigator.contacts.find) {
                            MEPH.Log('navigator.contacts.find exists');
                        }
                        else {
                            MEPH.Log('navigator.contacts.find doesnt exists');
                        }
                        navigator.contacts.find(fields, function onSuccess(contacts) {
                            contacts = contacts || [];
                            MEPH.Log('Got contacts back');
                            MEPH.Log('# of contacts : ' + contacts.length);

                            var res = contacts.select(function (contact) {
                                return contact;
                            });

                            resolve(contacts)
                        }, function onError(error) {
                            MEPH.Log('There was an error finding contacts.');
                            fail(error);
                        }, options);
                    }
                    else {
                        MEPH.Log('Device contacts not supported');
                        resolve([]);
                    }
                }).then(function (contacts) {
                    MEPH.Log('Setting contacts into local cache.');
                    return me.storage.set(me.key, contacts).catch(function () {
                        MEPH.Log('There was a problem saving the contacts into local storage.');
                    }).then(function () {
                        MEPH.Log('There was no problem saving contacts to local storage.');
                        me.cachedcontacts = contacts;
                        MEPH.Log('set cached contacts');
                        return contacts
                    })
                }).catch(function (e) {
                    MEPH.Log('There was an error ');
                    for (var i in e) {
                        if (typeof e[i] !== 'function')
                            MEPH.Log(i + ' ' + e[i]);
                    }
                    me.cachedcontacts = false;
                    return false;
                });
            }
        });
    }

});