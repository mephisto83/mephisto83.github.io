MEPH.define('Connection.main.view.connect.ConnectContact', {
    alias: 'connect_contact',
    templates: true,
    extend: 'MEPH.mobile.activity.container.Container',
    mixins: ['MEPH.mobile.mixins.Activity'],
    injections: ['contactService', 'relationshipService'],
    requires: ['MEPH.input.Text',
        'MEPH.util.Style',
        'MEPH.icon.Select',
        'MEPH.qrcode.Qrcode',
        'Connection.template.ContactItemDistance',
        'Connection.main.view.create.createcontactview.CreateContactView',
        'MEPH.util.Observable'],
    properties: {
        refreshPeriod: 50 * 1000,
        contacts: null,
        channelR: 0,
        channelG: 0,
        channelB: 0
    },
    initialize: function () {
        var me = this;
        me.contacts = MEPH.util.Observable.observable([]);
        me.callParent.apply(me, arguments);

    },
    connectContact: function () {
        var me = this,
            item = MEPH.util.Array.create(arguments).last().domEvent.data;
        
        MEPH.publish(MEPH.Constants.OPEN_ACTIVITY, {
            viewId: 'Contact',
            path: 'main/contact',
            data: item
        });
    },
    afterHide: function () {
        var me = this;

        if (me.$refreshTimeout) {
            clearTimeout(me.$refreshTimeout);
        }
        me.when.injected.then(function () {
            return me.$inj.relationshipService.clearPosition()
        });
    },
    hideBar: function () {
        var me = this;
        me.createview.hideCloseBtn();
        me.createview.hideHeader();
        me.createview.hideFooter();
        MEPH.util.Style.hide(me.createview.filterRow);
    },
    afterShow: function () {
        var me = this;
        me.refreshContactList();
        me.$channel = '0-0-0';
        me.when.injected.then(function () {
            return me.$inj.relationshipService.setPosition(me.$channel)
        });
    },
    channelUpdate: function (r, g, b) {
        var me = this;
        me.$channel = r + '-' + g + '-' + b;
    },
    refreshContactList: function () {
        var me = this;
        return me.when.injected.then(function () {
            return me.$inj.relationshipService.getCloseContacts(me.$channel).then(function (list) {
                me.contacts.pump(function (skip, take) {
                    return list.subset(skip, skip + (take || 15));
                });
                me.contacts.unshift.apply(me.contacts, list.subset(0, 1));
                me.contacts.dump();
            }).catch(function () {
                MEPH.Log('No contacts to update near contacts list.');
            });
        });
    },
    onLoaded: function () {
        var me = this;
        me.hideBar();
    }
});