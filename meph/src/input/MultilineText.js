/*global MEPH*/

/**
* @class MEPH.input.MultilineText
* @extends MEPH.field.FormField
* This is a convenient way of defining an input control
* color css selector when using the MEPH.iconfont.IconFont#color selector syntax.
*/
MEPH.define('MEPH.input.MultilineText', {
    alias: 'multilinetext',
    extend: 'MEPH.field.FormField',
    templates: true,
    properties: {
        rows: null,
        cols: 40
    },
    initialize: function () {
        var me = this;
        me.great();
    },
    /**
    * @private
    * Adds transferable properties.
    **/

    addTransferables: function () {
        var me = this,
            properties = MEPH.Array(['value', 'rows', 'cols']);
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
    }
});