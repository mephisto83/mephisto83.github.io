MEPH.define('Connection.sync.view.SyncContacts', {
    alias: 'synccontactss_connection_view',
    templates: true,
    extend: 'MEPH.mobile.activity.container.Container',
    mixins: ['MEPH.mobile.mixins.Activity'],
    requires: ['Connection.sync.view.syncactivity.SyncView'],
    injections: ['contactProvider'],
    properties: {
        name: null,
        synccontacts: null
    },
    initialize: function () {
        var me = this;
        me.callParent.apply(me, arguments);
        me.on('load', me.onLoaded.bind(me));
    },
    onLoaded: function () {
        var me = this;
        me.name = 'Sync Contacts';
        me.initcontacts();
    },
    initcontacts: function () {
        var me = this;

        me.synccontacts = me.synccontacts || MEPH.util.Observable.observable([]);
    },
    onInjectionsComplete: function () {
        var me = this;

        me.initcontacts();
        if (me.$inj && me.$inj.contactProvider) {
            me.$inj.contactProvider.contacts().then(function (contacts) {
            });;
            [].interpolate(0, 10, function () {
                me.synccontacts.push({
                    name: 'Test',
                    phone: '555-867-5309',
                    address: '4100 Raspberry Dr.'
                })
            })
        }
    },
    continueTo: function () {
        MEPH.publish(MEPH.Constants.OPEN_ACTIVITY, {
            viewId: 'main',
            path: 'main'
        });
    }
});