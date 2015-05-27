MEPH.define('Connection.control.contactlink.ContactLink', {
    extend: 'MEPH.control.Control',
    templates: true,
    alias: 'contactlink',
    requires: ['MEPH.util.Style', 'MEPH.util.Observable'],
    properties: {
        faCls: 'fa',
        faIcon: 'fa-envelope-o',
        faSize: 'fa-2x',
        type: null,
        value: null
    },
    initialize: function () {
        var me = this;
        me.great();
        me.addAutoBindProperty('value', 'validationError');
        me.addTransferables();
        me.defineDependentProperties();
    },
    defineDependentProperties: function () {
        var me = this;
        me.combineClsIntoDepenendProperty('iconCls', ['faCls', 'faIcon']);
        MEPH.util.Observable.defineDependentProperty('valueCls', me, ['value'], me.valueChanged.bind(me));
        MEPH.util.Observable.defineDependentProperty('typeCls', me, ['type'], me.typeChanged.bind(me));
    },
    typeChanged: function () {
        var me = this;
        if (me.type === 'email') {
            MEPH.util.Style.show(me.email);
            MEPH.util.Style.hide(me.phone);
            MEPH.util.Style.hide(me.sms);
        }
        else if (me.type === 'phone') {
            MEPH.util.Style.hide(me.email);
            MEPH.util.Style.show(me.phone);
            MEPH.util.Style.show(me.sms);
        }
    },
    valueChanged: function () {
        var me = this;
        if (me.value) {
            MEPH.util.Style.show(me.linkbody);
        }
        else {
            MEPH.util.Style.hide(me.linkbody);
        }
    },
    toEmail: function () {
        var me = this;
        if (me.value)
            return 'mailto:' + me.value;
    },
    toPhoneNumber: function (val) {
        var me = this;
        if (me.value) {
            var val = me.value;
            val = val.split('').where(function (x) {
                return x === '+' || !isNaN(x)
            }).join('');
            return 'tel:' + val;
        }
    },
    toSMS: function (val) {
        var me = this;
        if (me.value) {
            var val = me.value;
            val = val.split('').where(function (x) {
                return x === '+' || !isNaN(x)
            }).join('');
            return 'sms:' + val;
        }
    },
    /**
     * @private
     * Adds transferable properties.
     **/
    addTransferables: function () {
        var me = this, properties = (['iconCls', 'type', 'value']);

        properties.foreach(function (prop) {
            me.addTransferableAttribute(prop, {
                object: me,
                path: prop
            });
        });
        me.addTransferableAttribute('faIcon', {
            object: me,
            asValue: true,
            path: 'faIcon'
        });
    }
});