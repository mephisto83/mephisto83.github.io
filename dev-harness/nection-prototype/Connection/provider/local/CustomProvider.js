/**
 * @class MEPH.identity.IdentityProvider
 **/
MEPH.define('Connection.provider.local.CustomProvider', {
    extend: 'MEPH.mobile.providers.identity.IdentityProvider',
    injections: ['rest', 'storage'],
    mixins: {
        injectable: 'MEPH.mixins.Injections'
    },
    statics: {
        key: 'custom'
    },
    properties: {
        $properties: null,
        storageKeyForSource: 'meph-custom-provider-storage-key-source',
        id: 'custom'
    },
    initialize: function () {
        var me = this;

        me.$properties = {};
        me.mixins.injectable.init.apply(me);
        me.ready = new Promise(function (r) {
            me.injectionsResolve = r;
        });
        me.great();
    },
    logout:function(){
    },
    onInjectionsComplete: function () {
        var me = this;
        me.injectionsResolve();
    },
    source: function (array, card) {
        var me = this;
        me.ready.then(function () {
            return me.$inj.storage.get(me.storageKeyForSource).then(function (res) {
                if (res) {
                    me.applyResponse(res, array);
                }
            }).catch(function () {
                MEPH.Log('Couldnt get custom storage cache', 9);
            }).then(function () {
                return me.getProperties(card).then(function (response) {
                    me.applyResponse(response, array);
                    if (me.$inj.storage && response)
                        return me.$inj.storage.set(me.storageKeyForSource, response);
                });
            })
        });
    },
    applyResponse: function (response, array) {
        var me = this;

        array.foreach(function (item) {
            var add,
                source = item.source.first(function (x) { return x.provider === me.constructor.key; });
            if (!source) {
                source = {};
                add = true;
            }
            var val = me.filterResponse(response, item.prop);
            source.label = val + '(' + me.constructor.key + ')';
            source.provider = me.constructor.key;/// options.provider && options.provider == 'name' ? obj.type : obj.provider,
            source.type = me.constructor.key,
            source.value = val;
            if (add) {
                item.source.push(source);
            }
        });
    },
    filterResponse: function (response, prop) {
        var me = this,
            res = response.where(function (x) {
                return x.provider === me.constructor.key;
            }).first(function (x) {
                return x.propType === prop;
            });
        if (res) {
            return res.value || '';
        }
        return '';

    },
    values: function (card) {
        var me = this;
        return me.ready.then(function () {
            return me.$inj.rest.addPath('contact/me/sources/{card}').get({ card: card }).then(function (res) {
                return res;
            }).catch(function () {
                return Promise.reject('Failed to get property : ' + property);
            });
        });
    },
    getCards: function (cards) {

        var me = this;
        return me.ready.then(function () {
            return me.$inj.rest.addPath('contact/me/cards').get().then(function (res) {
                var updatedcards = res.cards.select(function (x) { x.name = x.name ? x.name : '< unnamed >'; return x; });
                var t = cards;
                cards.clear();;
                cards.push.apply(cards, updatedcards);
                me.cards = cards;
                return res;
            }).catch(function () {
                return Promise.reject('Failed to cards ');
            });
        });
    },
    assignProperties: function (cardid, result) {
        var me = this;
        return Promise.resolve().then(function () {
            if (me.cards) {
                var cachecard = me.cards.first(function (x) { return x.id === cardid; });
                if (cachecard) {

                    var prop = cachecard.properties ? cachecard.properties.first(function (x) {
                        result[x.property] = x.value;
                        if (x.property === 'profileimage') {
                            result['profileimageurl'] = "url('" + x.value + "')";
                        }
                    }) : [];
                }
            }
        });
    },
    set: function (property, value, card) {
        var me = this;
        var cachecard = me.cards.first(function (x) { return x.id === card; });
        if (cachecard) {

            var prop = cachecard.properties ? cachecard.properties.first(function (x) {
                return x.property === property;
            }) : [];

            if (prop) {
                prop.value = value;
            }
        }
    },
    getProperties: function (card) {
        var me = this;
        if (me.card) {
            var cachedCard = me.cards.first(function (x) {
                return x.id === card;
            });
            if (cachedCard && cachedCard.properties && cachedCard.properties.length) {
                return Promise.resolve().then(function () {
                    return cachedCard.properties ? cachedCard.properties.select(function (x) {
                        return {
                            provider: me.id,
                            type: me.id,
                            propType: x.property,
                            value: x.value
                        }
                    }) : [];
                });
            }
        }
        return me.$inj.rest.addPath('contact/me/card/{card}').get({ card: card }).then(function (res) {
            if (res && res.attributes)
                return res.attributes.select(function (x) {

                    return {
                        provider: me.id,
                        type: me.id,
                        propType: x.type,
                        value: x.value
                    };
                });
            return [];
        });
    },
    property: function (property, card, cached) {
        var me = this;
        if (property === 'profileimage') {
            return Promise.resolve(null);
        }
        if (cached && me.$properties[property]) {
            return Promise.resolve({
                provider: me.id,
                type: me.id,
                value: me.$properties[property]
            });
        }
        return me.ready.then(function () {
            return me.$inj.rest.addPath('contact/me/card/{card}').get({ card: card }).then(function (res) {

                if (res && res.attributes && res.attributes.first(function (x) { return x.type === property; })) {
                    me.$properties[property] = res.attributes.first(function (x) {
                        return x.type === property;
                    }).value;

                    return {
                        provider: me.id,
                        type: me.id,
                        value: me.$properties[property]
                    };
                }
                else {
                    return {
                        provider: me.id,
                        type: me.id,
                        value: ''
                    };
                }
            }).catch(function () {
                return Promise.reject('Failed to get property : ' + property);
            });
        });
    }
});