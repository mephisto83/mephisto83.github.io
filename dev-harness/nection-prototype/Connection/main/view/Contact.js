MEPH.define('Connection.main.view.Contact', {
    alias: 'contact_connection_view',
    templates: true,
    extend: 'Connection.control.contactbase.ContactBase',
    mixins: ['MEPH.mobile.mixins.Activity'],
    injections: ['contactService', 'relationshipService', 'overlayService'],
    requires: ['MEPH.input.Search',
        'MEPH.util.Style',
        'Connection.control.contactlink.ContactLink',
        'Connection.control.relationship.Relationship',
        'Connection.main.view.contactview.ContactView',
        'MEPH.util.Observable', 'MEPH.qrcode.Generator'],
    properties: {
        name: null,
        contact: null//,
        //$qrgenerator: null
    },
    initialize: function () {
        var me = this;
        me.callParent.apply(me, arguments);
        me.on('load', me.onLoaded.bind(me));
        //me.$qrgenerator = new MEPH.qrcode.Generator();
        //me.$qrgeneratorsmall = new MEPH.qrcode.Generator();

    },

    toPhoneNumber: function (val) {
        if (val)
            return 'tel:' + val.phone1;
    },
    toSMS: function (val) {
        if (val)
            return 'sms:' + val.phone1;
    },

    afterShow: function () {
        var me = this;
        var arguments = me.activityArguments;

        if (arguments.data) {
            me.contact = arguments.data;
        }

        me.setupQrCodes();

        return Promise.all([me.when.loaded, me.when.injected]).then(function () {
            if (me.$inj.relationshipService) {
                me.$inj.overlayService.open('connection-contact');
                me.$inj.overlayService.relegate('connection-contact');

                return me.$inj.relationshipService.getRelationShip(me.contact).then(function (relation) {
                    if (me.$activityview.relationshipdescription)
                        me.$activityview.relationshipdescription.relationship = relation
                    me.relationship = relation;
                }).catch(function () {
                    MEPH.Log('GetRelationship error.')
                }).then(function () {
                    me.$inj.overlayService.close('connection-contact');
                })
            }
        })
    },
    createIfNonExistent: function () {
        var me = this;
        return Promise.all([me.when.loaded, me.when.injected]).then(function () {
            if (me.$inj.relationshipService) {
                if (!me.relationship) {
                    me.$inj.overlayService.open('connection-contact-create-releationship');
                    me.$inj.overlayService.relegate('connection-contact-create-releationship');
                    return me.$inj.relationshipService.createRelationship(me.contact).then(function (relationship) {
                        me.relationship = relationship;
                        me.$activityview.relationshipdescription.relationship = relationship;
                    }).catch(function () {
                    }).then(function () {

                        me.$inj.overlayService.close('connection-contact-create-releationship');
                    });
                }
            }
        })
    },
    onLoaded: function () {
        var me = this;
        me.$activityview.hideCloseBtn();
        me.$activityview.hideHeader();
        me.name = 'Contact';
    }
});