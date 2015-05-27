/**
 * @class MEPH.field.FormField
 * @extends MEPH.control.Control
 * Standard form for a input field.
 **/
MEPH.define('MEPH.file.Dropbox', {
    alias: 'dropbox',
    templates: true,
    extend: 'MEPH.control.Control',
    requires: [],
    properties: {
        hoverCls: '',
        dragovercssclass: 'hover',
        /**
         * @property {String} cls
         * CSS class to apply for this node.
         */
        cls: '',

        baseCls: 'dropbox',

        dragoutcssclass: '',
        /**
          * Files of the input field
          */
        files: null,

    },
    initialize: function () {
        var me = this;
        me.callParent.apply(me, arguments);
        me.addTransferables();
        me.defineDependentProperties();
    },
    fileDrop: function () {
        var args = arguments;
        var evntArgs = MEPH.util.Array.convert(args).last();
        var me = this;

        me.getDomTemplate().first().dispatchEvent(MEPH.createEvent('filesdropped', {
            files: evntArgs.domEvent.dataTransfer.files
        }));

    },
    /**
     * @private
     * Adds transferable properties.
     **/

    addTransferables: function () {
        var me = this, properties = MEPH.Array(['componentCls', 'files']);

        properties.foreach(function (prop) {
            me.addTransferableAttribute(prop, {
                object: me,
                path: prop
            });
        });

    },

    defineDependentProperties: function () {
        var me = this;
        me.combineClsIntoDepenendProperty('dropboxCls', ['componentCls', 'hoverCls', 'cls', 'baseCls']);
    },
});