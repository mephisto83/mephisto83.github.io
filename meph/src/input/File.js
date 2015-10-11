
MEPH.define('MEPH.input.File', {
    alias: 'file',
    templates: true,
    extend: 'MEPH.field.FormField',
    properties: {
        type: 'file',
        step: null,
        disabled: null,
        max: null,
        maxlength: null,
        min: null,
        pattern: null,
        readonly: null,
        required: null,
        placeholder: null, 
        size: null
    },
    initialize: function () {
        var me = this,
            properties = MEPH.Array(['value']);

        me.callParent.apply(me, arguments);
        properties.foreach(function (prop) {
            me.addTransferableAttribute(prop, {
                object: me,
                path: prop
            });
        });
    },
    onLoaded: function () {
        var me = this;
        me.callParent.apply(me, arguments);
        me.fire('altered', { path: 'type', references: [] });
    }
});