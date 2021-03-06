﻿/*global MEPH*/

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
        valuefield: 'value',
        selected: null
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
                                me.updateDomElement(obj);
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
            me.updateDomElement(me.value);
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
                if (me.$selectedObject !== undefined) {
                    var index = me.source.indexWhere(function (x) {
                        if (me.valuefield !== 'null') {
                            return x[me.valuefield] === me.$selectedObject;
                        }
                        return x === me.$selectedObject;
                    });
                    index = index ? index.first() : null;
                    if (index !== null)
                        if (me.selectDom.selectedIndex !== index && index > -1) {
                            me.selectDom.selectedIndex = index;
                        }
                }
            }
        }

    },
    updateDomElement: function (obj) {
        var me = this;
        if (obj && me.source) {
            var index = me.source.indexOf(obj);
            var option = me.selectDom.options[index];
            if (option) {
                option.label = obj[me.labelfield]
            }
        }
        else me.updateDomElements();
    },
    onchange: function (index) {
        var me = this;
        if (!me.source) {
            return null;
        }
        me.$selectedObject = me.source[index];
        me.selected = me.$selectedObject;
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
            properties = MEPH.Array(['selected']);//'value'

        me.callParent.apply(me, arguments);
        properties.foreach(function (prop) {
            me.addTransferableAttribute(prop, {
                object: me,
                path: prop
            });
        });

    }
});