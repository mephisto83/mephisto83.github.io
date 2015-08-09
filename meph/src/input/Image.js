
MEPH.define('MEPH.input.Image', {
    alias: 'camera',
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
        var input;
        input = me.querySelector('input');
        input.setAttribute('capture', 'camera');
        input.setAttribute('accept', 'image/*');
        input.setAttribute('type', me.type);

        //me.don('change', input, function () {
        //    setTimeout(function () {
        //        input.dispatchEvent(MEPH.createEvent('image-change', {}));
        //    }, 5000);
        //});
    }
});