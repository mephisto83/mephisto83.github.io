MEPH.define('Connection.control.contactbase.ContactBase', {
    extend: 'MEPH.mobile.activity.container.Container',
    requires: ['MEPH.qrcode.Generator', 'MEPH.code.DotCode',
                'MEPH.util.Style'],
    injections: ['stateService'],
    properties: {
    },
    initialize: function () {
        var me = this;
        me.great();
        me.$qrgenerator = new MEPH.qrcode.Generator();
        me.$qrgeneratorsmall = new MEPH.qrcode.Generator();
        Promise.all([me.when.loaded, me.when.injected]).then(function () {
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
    toDotCode: function (val) {
        if (val) {
            return val.split('-').join('');
        }
        return '';
    },
    setDotCode: function (cardid) {
        var me = this;
        var dotcode = me.$activityview.dotcode || (me.$activityview.template ? me.$activityview.template.dotcode : null);
        if (dotcode) {
            dotcode.value = me.toDotCode(cardid);
            dotcode.draw();
        }
    },
    //getQrCodes: function () {
    //    var me = this;
    //    var qrcode = me.$activityview.template ? me.$activityview.template.qrcode : me.$activityview.qrcode;
    //    var smallqrcode = me.$activityview.template ? me.$activityview.template.smallqrcode : me.$activityview.smallqrcode;
    //    return {
    //        qrcode: qrcode,
    //        smallqrcode: smallqrcode
    //    }
    //},
    setupQrCodes: function () {
        var me = this;
        if (!me.contact) return;
        var cardid = me.contact.cardid || me.contact.card || me.selectedCard.id;//todo: I think cardid is no longer valid
        if (me.lastcode === cardid) {
            return;
        }
        me.setDotCode(cardid);
        //var qrs = me.getQrCodes();
        //var qrcode = qrs.qrcode;
        //var smallqrcode = qrs.smallqrcode;
        //// me.qrcode = me.querySelector('#qrcode');
        //me.$qrgenerator.setEl(qrcode);
        //me.$qrgenerator.clear();
        //var margin = 30;
        //var maxwidth = 300;
        //me.$qrgenerator.makeCode(cardid,
        //    Math.min(maxwidth, parseFloat(qrcode.clientWidth) - margin),
        //    Math.min(maxwidth, parseFloat(qrcode.clientWidth) - margin));
        //var gen = me.$qrgeneratorsmall;
        //gen.setEl(smallqrcode);
        //gen.clear();
        //var margin = 30;
        //gen.makeCode(cardid, 50, 50);
        //me.lastcode = cardid;
        //MEPH.util.Style.show(smallqrcode);
        //MEPH.util.Style.hide(qrcode);
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