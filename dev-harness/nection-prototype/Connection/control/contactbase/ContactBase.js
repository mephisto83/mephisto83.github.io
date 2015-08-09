MEPH.define('Connection.control.contactbase.ContactBase', {
    extend: 'MEPH.mobile.activity.container.Container',
    requires: ['MEPH.qrcode.Generator',
                'MEPH.util.Style'],
    injections: ['stateService'],
    properties: {
    },
    initialize: function () {
        var me = this;
        me.great();
        me.$qrgenerator = new MEPH.qrcode.Generator();
        me.$qrgeneratorsmall = new MEPH.qrcode.Generator();
   Promise.all([me.when.loaded,     me.when.injected]).then(function () {
            me.$inj.stateService.on('mycontact', function () {
                me.setupQrCodes();
            });
        });
    },

    hideShow: function (show, hide, toggle) {
        var me = this;

        if (me.$toggle) {
            MEPH.util.Style.show(show);
            MEPH.util.Style.hide(hide);
            me.$toggle = false;
        }
        else {
            me.$toggle = true;
            MEPH.util.Style.hide(show);
            MEPH.util.Style.show(hide);
        }
    },
    setupQrCodes: function () {
        var me = this;
        if (!me.contact) return;
        var cardid = me.contact.cardid || me.selectedCard.id;
        if (me.lastcode === cardid) {
            return;
        }
        var qrcode = me.$activityview.template.qrcode;
        var smallqrcode = me.$activityview.template.smallqrcode;
        // me.qrcode = me.querySelector('#qrcode');
        me.$qrgenerator.setEl(qrcode);
        me.$qrgenerator.clear();
        var margin = 30;
        var maxwidth = 300;
        me.$qrgenerator.makeCode(cardid,
            Math.min(maxwidth, parseFloat(qrcode.clientWidth) - margin),
            Math.min(maxwidth, parseFloat(qrcode.clientWidth) - margin));
        var gen = me.$qrgeneratorsmall;
        gen.setEl(smallqrcode);
        gen.clear();
        var margin = 30;
        gen.makeCode(cardid, 50, 50);
        me.lastcode = cardid;
        MEPH.util.Style.show(smallqrcode);
        MEPH.util.Style.hide(qrcode);
    },
    refreshCard: function () {
        var me = this,
            cardid = me.selectedCard ? me.selectedCard.id : null;

        if (me.$inj && me.$inj.contactService && cardid) {
            return me.$inj.contactService.me(cardid, me.contact).then(function (contact) {
                me.contact = contact;
                me.$inj.stateService.set('mycontact', contact);
            });
        }
        else if (me.source && me.source.length) {
            me.contact = me.source.first();
        }
        else {
            me.contact = null;
        }
        return Promise.resolve(null);
    }
});