MEPH.define('Connection.contact.view.Contact', {
    alias: 'my_contact_page',
    templates: true,
    extend: 'Connection.control.contactbase.ContactBase',
    mixins: ['MEPH.mobile.mixins.Activity'],
    injections: ['contactService', 'identityProvider', 'overlayService'],
    requires: ['MEPH.util.Observable',
        'MEPH.input.Dropdown', 'MEPH.qrcode.Generator',
        'Connection.template.business.DefaultTemplate',
        'Connection.contact.view.contactview.ContactView',
                'MEPH.util.Style'],
    properties: {
        cards: null,
        contact: null,
        selectedCardValue: null,
        selectedCard: null
    },

    onLoaded: function () {
        var me = this;
        me.cards = me.cards || MEPH.util.Observable.observable([]);
        me.great()
        me.$activityview.hideCloseBtn()
        me.initMe();
    },
    afterShow: function () {
        var me = this;
        me.great();

        console.info('qr code;')
        if (!me.cards || !me.cards.first())
            me.$inj.overlayService.open('connection-contact-aftershow');
        return me.refreshCard().then(function () {
            me.setupQrCodes();
            if (!me.cards || !me.cards.first())
                me.$inj.overlayService.close('connection-contact-aftershow');
            console.info('end qr code;')
        })
    },
    initMe: function () {
        var me = this;
        me.when.injected.then(function () {
            if (me.$inj && me.$inj.identityProvider) {
                if (!me.cards || !me.cards.first())
                    me.$inj.overlayService.open('connection-contact-me');
                me.$inj.identityProvider.getCards(me.cards).then(function () {
                    me.selectedCard = me.cards.first();
                    return me.refreshCard();
                }).catch(function () {
                    MEPH.Log('refreshing card : contact.js');
                }).then(function () {
                    me.$inj.overlayService.close('connection-contact-me');
                });
            }
        });
    },
    editMe: function () {
        var me = this;

        if (me.selectedCard && (!me.selectedCardValue || (me.selectedCardValue === me.selectedCard.name))) {
            me.$inj.identityProvider.autoSelect(false);

            MEPH.publish(Connection.constant.Constants.CurrentCard, {
                selectedCardId: me.selectedCard.id,
                autoSelect: false
            });
            MEPH.publish(MEPH.Constants.OPEN_ACTIVITY, {
                viewId: 'EditContact', path: 'main/me/edit',
                selectedCardId: me.selectedCard ? me.selectedCard.id : null
            });
        }
        else if (me.selectedCardValue) {

            me.$inj.overlayService.open('connection-contact-createcard');
            me.$inj.contactService.createCard(me.selectedCardValue).then(function (card) {
                
                me.cards.push(card);
                me.selectedCard = card;
                MEPH.publish(Connection.constant.Constants.CurrentCard, {
                    selectedCardId: card.id,
                    autoSelect: true
                });
                me.$inj.identityProvider.autoSelect(card.id);
                MEPH.publish(MEPH.Constants.OPEN_ACTIVITY, {
                    viewId: 'EditContact', path: 'main/me/edit',
                    selectedCardId: card.id,
                    autoSelect: true
                });
            }).catch(function () { }).then(function () {
                me.$inj.overlayService.close('connection-contact-createcard');
            });
        }
    },
    toImageSource: function () {
        return 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';
    }

});