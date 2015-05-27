/**
 * @class MEPH.field.FormField
 * @extends MEPH.control.Control
 * Standard form for a input field.
 **/
MEPH.define('Connection.control.relationship.Relationship', {
    alias: 'relationship',
    templates: true,
    extend: 'MEPH.control.Control',
    requires: [],
    properties: {
        /**
          * Files of the input field
          */
        contact: null,
        relationship: null
    },
    editRelationship: function () {
        var me = this;


        MEPH.publish(MEPH.Constants.OPEN_ACTIVITY, { viewId: 'EditRelationship', path: 'main/contact/relationship/edit', contact: me.contact });
    }
})