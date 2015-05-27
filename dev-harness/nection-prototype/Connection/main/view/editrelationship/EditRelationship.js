MEPH.define('Connection.main.view.editrelationship.EditRelationship', {
    alias: 'edit_relationship_connection_view',
    templates: true,
    extend: 'MEPH.mobile.activity.container.Container',
    mixins: ['MEPH.mobile.mixins.Activity'],
    requires: ['MEPH.input.Checkbox',
                'Connection.template.Relationship',
                'MEPH.input.Typeahead',
                'Connection.main.view.editrelationship.relationshipview.RelationshipView'],
    injections: ['relationshipService',
                    'contactService'],
    properties: {
        currentRelationships: null,
        contact: null,
        relationshipValue: null,
        currentRelationshipAttrs: null,
        relationshipValueObj: null,
        relationshipTypes: null,
        contactname: null,
        currentRelationshipAttrs: null
    },
    initialize: function () {
        var me = this;
        me.callParent.apply(me, arguments);
    },
    onLoaded: function () {
        var me = this;
        me.great()
        me.init();
    },
    init: function () {
        var me = this;
        me.currentRelationshipAttrs = me.currentRelationshipAttrs || MEPH.util.Observable.observable([]);
        me.relationshipTypes = me.relationshipTypes || MEPH.util.Observable.observable([]);
    },
    afterShow: function () {
        var me = this;
        var arguments = me.activityArguments;

        if (arguments.contact) {
            me.contact = arguments.contact;
            me.contactname = me.contact.name;
        }
        me.updateRelations();
    },
    updateRelations: function () {
        var me = this;
        if (me.$inj && me.$inj.relationshipService && me.contact) {
            me.$inj.relationshipService.getRelationshiptypes(me.relationshipTypes).then(function (currentRelationshipAttrs) {
                return me.$inj.relationshipService.getRelationShip(me.contact).then(function (description) {
                    me.currentRelationshipAttrs.clear();

                    var res = description ? description.select() : [];

                    me.init();

                    me.currentRelationshipAttrs.push.apply(me.currentRelationshipAttrs, res);
                });
            })
        }
    },
    processRelationshipResponse: function (description) {
        var me = this;
        me.currentRelationshipAttrs.clear();

        var res = description ? description.select() : [];

        me.init();

        me.currentRelationshipAttrs.push.apply(me.currentRelationshipAttrs, res);
    },
    addRelationship: function (valueObj, value) {
        var me = this, service;
        if (me.$inj && me.$inj.relationshipService && me.contact) {
            return me.updateRelationship(valueObj, value, false);
            //service = me.$inj.relationshipService;
            //return service.updateRelationship(me.contact, valueObj || value).then(function (res) {
            //    me.processRelationshipResponse(res);
            //    me.relationshipValue = null;
            //    return res;
            //});
        }
        return null;
    },
    updateRelationship: function (valueObj, value, del) {
        var me = this, service;
        if (me.$inj && me.$inj.relationshipService && me.contact) {
            service = me.$inj.relationshipService;
            return service.updateRelationship(me.contact, valueObj || value, del).then(function (res) {
                me.processRelationshipResponse(res);
                me.relationshipValue = null;
                return res;
            });
        }
        return null;
    },
    datachanged: function (data, func, template) {
        var me = this;
        return me.updateRelationship(data, null, true);
    },
    ok: function () {
        var me = this;
        if (me.$inj && me.$inj.relationshipService && me.contact) {
            return Promise.resolve().then(function () {
                //Everything is already up to date by now.
                // return me.$inj.relationshipService.updateRelationship(me.contact, me.currentRelationshipAttrs.select());
            }).then(function () {
                window.history.back();
            })
        }

    },
    cancel: function () {
        window.history.back();
    },
    onInjectionsComplete: function () {
        var me = this;
        me.updateRelations();
    }
});