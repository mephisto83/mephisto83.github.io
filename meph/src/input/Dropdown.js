/*global MEPH*/

/**
* @class MEPH.input.Dropdown
* @extends MEPH.field.FormField
* This is a convenient way of defining an input control
* color css selector when using the MEPH.iconfont.IconFont#color selector syntax.
*/
MEPH.define('MEPH.input.Dropdown', {
    alias: 'dropdown',
    extend: 'MEPH.field.FormField',
    requires: ['MEPH.util.Dom'],
    templates: true,
    properties: {
        source: null,
        labelfield: 'label',
        valuefield: 'value'
    },
    initialize: function () {
        var me = this;

        me.callParent.apply(me, arguments);
        me.on('altered', me.onAltered.bind(me));
    },
    onAltered: function (type, args) {
        var me = this;
        if (args.path === 'source' || args.property === 'source') {
            if (args && args.old && args.old.un) {
                args.old.foreach(function (t) {
                    if (typeof obj === 'object') {
                        MEPH.util.Observable.observable(obj);
                        obj.un(me.source);
                    }
                });
                args.old.un(args.old);
            }
            if (me.source && me.source.isObservable) {
                me.source.on('changed', function () {
                    me.source.foreach(function (obj, index) {
                        if (typeof obj === 'object') {
                            MEPH.util.Observable.observable(obj);
                            obj.un(me.source);
                            obj.on('changed', function () {
                                me.updateDomElements();
                            }, me.source);
                        }
                    })
                    me.updateDomElements();
                }, me.source);

            }

            me.updateDomElements();
        }
        else if (args.path === 'value') {

            me.$selectedObject = me.value;
            me.updateDomElements();
        }
    },
    updateDomElements: function () {
        var me = this;
        if (me.selectDom) {
            me.selectDom.options.length = 0;
            if (me.source && Array.isArray(me.source) && me.source.length) {

                me.source.foreach(function (x, index) {
                    MEPH.util.Dom.addOption(x[me.labelfield], index, me.selectDom);
                });
                if (me.$selectedObject) {
                    var index = me.source.indexOf(me.$selectedObject);
                    if (me.selectDom.selectedIndex !== index && index > -1) {
                        me.selectDom.selectedIndex = index;
                    }
                }
            }
        }

    },
    onchange: function (index) {
        var me = this;
        me.$selectedObject = me.source[index];
        if (me.valuefield !== 'null')
            return me.source[index][me.valuefield];
        return me.source[index];
    },
    onLoaded: function () {
        var me = this;;
        me.great();
        me.updateDomElements();
    },
    /**
    * @private
    * Adds transferable properties.
    **/
    addTransferables: function () {
        var me = this,
            properties = MEPH.Array(['value']);
        me.callParent.apply(me, arguments);
        properties.foreach(function (prop) {
            me.addTransferableAttribute(prop, {
                object: me,
                path: prop
            });
        });

    }
});