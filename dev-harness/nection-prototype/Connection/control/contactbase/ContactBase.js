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
        if (me.lastcode === cardid) {
            return;
        }
        var qrcode = me.$activityview.qrcode;
        var smallqrcode = me.$activityview.smallqrcode;
        // me.qrcode = me.querySelector('#qrcode');
        me.$qrgenerator.setEl(qrcode);
        me.$qrgenerator.clear();
        var margin = 30;
        var cardid = me.contact.cardid || me.selectedCard.id;
        me.$qrgenerator.makeCode(cardid,
            parseFloat(qrcode.clientWidth) - margin,
            parseFloat(qrcode.clientWidth) - margin);
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
        //if (me.selectedCard && me.selectedCard.name === me.selectedCardValue) {
        //    cardid = null;
        //}
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