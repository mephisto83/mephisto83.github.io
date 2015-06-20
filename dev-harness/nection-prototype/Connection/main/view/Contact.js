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
        MEPH.util.Style.hide(me.$activityview.removeRelationshipBtn);
        MEPH.util.Style.hide(me.$activityview.addRelationshipBtn);
        MEPH.util.Style.show(me.$activityview.checkingRelationship);
        if (arguments.data) {
            me.contact = arguments.data;
        }
        me.checkingResult();

        me.setupQrCodes();

        Promise.all([me.when.loaded, me.when.injected]).then(function () {
            if (me.$inj.relationshipService) {
                me.$inj.overlayService.open('connection-contact');
                me.$inj.overlayService.relegate('connection-contact');
                var callback = function (relation) {
                    if (relation) {
                        MEPH.util.Style.show(me.$activityview.removeRelationshipBtn);
                        MEPH.util.Style.hide(me.$activityview.addRelationshipBtn);
                    }
                    else {
                        MEPH.util.Style.show(me.$activityview.addRelationshipBtn);
                        MEPH.util.Style.hide(me.$activityview.removeRelationshipBtn);
                    }
                    MEPH.util.Style.hide(me.$activityview.checkingRelationship);
                };

                if (me.cancel && me.cancel.abort) {
                    me.cancel.abort();
                }
                me.cancel = {};

                return me.$inj.relationshipService.getRelationShip(me.contact, callback, me.cancel).then(function (relation) {
                    callback(relation);
                    me.relationship = relation;
                }).catch(function () {
                    MEPH.Log('GetRelationship error.')
                }).then(function () {
                    me.$inj.overlayService.close('connection-contact');
                })
            }
        })
    },
    displayResult: function () {
        var me = this;
        if (me.relationship) {
            MEPH.util.Style.show(me.$activityview.removeRelationshipBtn);
            MEPH.util.Style.hide(me.$activityview.addRelationshipBtn);
        }
        else {
            MEPH.util.Style.show(me.$activityview.addRelationshipBtn);
            MEPH.util.Style.hide(me.$activityview.removeRelationshipBtn);
        }

        MEPH.util.Style.hide(me.$activityview.checkingRelationship);
    },
    checkingResult: function () {
        var me = this;

        MEPH.util.Style.hide(me.$activityview.removeRelationshipBtn);
        MEPH.util.Style.hide(me.$activityview.addRelationshipBtn);
        MEPH.util.Style.show(me.$activityview.checkingRelationship);

    },
    editRelationship: function () {
        var me = this;

        MEPH.publish(MEPH.Constants.OPEN_ACTIVITY, { viewId: 'EditRelationship', path: 'main/contact/relationship/edit', contact: me.contact });
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
                        //  me.$activityview.relationshipdescription.relationship = relationship;
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
    }
});