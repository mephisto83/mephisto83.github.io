﻿MEPH.define('Connection.contact.view.Contact', {
    alias: 'my_contact_page',
    templates: true,
    extend: 'Connection.control.contactbase.ContactBase',
    mixins: ['MEPH.mobile.mixins.Activity'],
    injections: ['contactService',
        'identityProvider',
        'stateService',
        'overlayService'],
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
        me.$activityview.hideCloseBtn();

        MEPH.subscribe(MEPH.Constants.START_ACTIVITY, function (type, activityConfig) {
            me.nextActivityConfig = activityConfig;
        });
        me.initMe();
    },
    afterShow: function () {
        var me = this;
        me.great();

        if (!me.cards || !me.cards.first())
            if (me.$inj && me.$inj.overlayService)
                me.$inj.overlayService.open('connection-contact-aftershow');
        return me.refreshCard().then(function () {
            if (!me.cards || !me.cards.first())
                if (me.$inj && me.$inj.overlayService)
                    me.$inj.overlayService.close('connection-contact-aftershow');
        });
    },
    afterHide: function () {
        var me = this;
        if (me.nextActivityConfig && me.nextActivityConfig.viewId === 'EditContact') {

            return me.editMe();
        }
    },
    initMe: function () {
        var me = this;
        return me.when.injected.then(function () {
            if (me.$inj && me.$inj.identityProvider) {
                if (!me.cards || !me.cards.first())
                    me.$inj.overlayService.open('connection-contact-me');
                return me.$inj.identityProvider.getCards(me.cards).then(function () {
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
            me.when.injected.then(function () {
                me.$inj.stateService.set(Connection.constant.Constants.CurrentCard, {
                    selectedCardId: me.selectedCard.id,
                    autoSelect: false
                })
            });
        }
        else if (me.selectedCardValue) {

            me.$inj.overlayService.open('connection-contact-createcard');
            return me.$inj.contactService.createCard(me.selectedCardValue).then(function (card) {

                me.cards.push(card);
                me.selectedCard = card;
                me.$inj.identityProvider.autoSelect(card.id);
                me.$inj.stateService.set(Connection.constant.Constants.CurrentCard, {
                    selectedCardId: card.id,
                    autoSelect: true,
                    autoSelectId: card.id
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