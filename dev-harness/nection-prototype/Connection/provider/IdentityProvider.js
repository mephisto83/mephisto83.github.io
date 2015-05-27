/**
 * @class MEPH.identity.IdentityProvider
 **/
MEPH.define('Connection.provider.IdentityProvider', {
    requires: ['Connection.provider.local.CustomProvider'],
    extend: 'MEPH.identity.IdentityProvider',
    injections: ['customProvider'],
    initialize: function () {
        var me = this;
        me.mixins.injectable.init.apply(me);
        return me.great();
    },
    values: function (card) {
        var me = this;

        return me.when.injected.then(function () {
            return Promise.resolve().then(function () {
                return me.$inj.customProvider.values(card)
            });
        });
    },
    autoSelect: function (val) {
        var me = this;
        if (val === undefined) {
            val = me.autoSelecting;
            return val;
        }
        else {
            me.autoSelecting = val;
        }
    },
    /**
   * Manages the soures
   * @param {Array} array
   * @return {Promise}
   **/
    source: function (array, cardid, options) {
        var me = this,
            callParent = me.callParent;
        return me.when.injected.then(function () {
            return me.ready().then(function () {
                me.$inj.customProvider.source(array, cardid)
            }).then(function () {
                callParent.apply(me, [array, options]);
            });
        });
    },
    getCards: function (cards) {
        var me = this, callParent = me.callParent;
        return me.when.injected.then(function () {
            return me.$inj.customProvider.getCards(cards);
        });
    },
    getProperties: function (obj, card, cached) {
        var me = this,
            callParent = me.callParent;
        return me.when.injected.then(function () {
            return me.$inj.customProvider.getProperties(card).then(function (t) {
                obj.foreach(function (combo) {
                    var val = t[combo.property];
                    var obj = t.first(function (x) {
                        return x.propType === combo.property;
                    });
                    var observableArray = combo.source;
                    observableArray.removeWhere(function (x) {
                        return x.provider === me.$inj.customProvider.id;
                    });

                    if (obj && obj.value !== null && obj.value !== undefined) {
                        obj.label = obj.value + ' (' + obj.type + ')';

                        observableArray.push({
                            label: obj.label,
                            provider: obj.provider,
                            value: obj.value
                        });
                    }
                });
            })
        });
    },
    get: function (property, observableArray, card, cached) {
        var me = this,
            callParent = me.callParent;
        return Promise.resolve().then(function () {
            callParent.apply(me, [property, observableArray, { provider: 'name' }, cached]);
        });
    }
});