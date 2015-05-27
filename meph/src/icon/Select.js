/**
 * @class MEPH.field.FormField
 * @extends MEPH.control.Control
 * Standard form for a input field.
 **/
MEPH.define('MEPH.icon.Select', {
    alias: 'iconselect',
    templates: true,
    extend: 'MEPH.control.Control',
    requires: [],
    properties: {
        value: null,
        iconSource: null,
        size: null
    },
    initialize: function () {
        var me = this;
        me.callParent.apply(me, arguments);
        me.addTransferableAttribute('iconSource', {
            object: me,
            asValue: true,
            path: 'iconSource'
        });
        me.addTransferableAttribute('size', {
            object: me,
            asValue: true,
            path: 'size'
        });
        me.defineButtonDependentProperties();
    },
    onLoaded: function () {
        var me = this;
        me.value = me.value || 0;
    },
    next: function () {
        var me = this;

        me.value = me.value || 0;
        me.value = (me.value + 1) % (me.iconSource || '').split(';').length;
        var element = me.getFirstElement();
        element.dispatchEvent(MEPH.createEvent('change', { data: me.value }));
    },
    defineButtonDependentProperties: function () {
        var me = this;
        MEPH.util.Observable.defineDependentProperty('cls', me, ['iconSource', 'value', 'size'], function () {
            var result = ['fa'];
            if (me.size) {
                result.push('fa-' + me.size + 'x')
            }
            if (me['iconSource']) {
                var icon = me['iconSource'].split(';').select(function (x) {
                    return x.trim();
                })[me.value];
                if (icon) {
                    result.push(icon);
                }
            }
            return result.join(' ');
        });
    }
});