/* @class
* Reads controls from the dom which should be created, and associated with there js objects. 
**/
MEPH.define('MEPH.mixins.Injections', {
    requires: ['MEPH.mobile.services.MobileServices'],
    statics: {
        injectFunctions: {
            onInjectionsComplete: function () {
            },
        }
    },
    init: function () {
        var me = this,
                   i,
                   referrerFunctions = MEPH.mixins.Injections.injectFunctions;


        for (i in referrerFunctions) {
            me[i] = me[i] || referrerFunctions[i].bind(me);
        }

        if (me.addWhen) {
            me.addWhen('injected');
        }
        else {
            ['injected'].foreach(function (evt) {
                me.$when = me.$when || {};
                me.when = me.when || {};
                me.when[evt] = new Promise(function (r, s) {
                    me.$when[evt] = r;
                });
            });

        }

        if (me.injections) {
            me.$inj = {};
            Promise.all(me.injections.select(function (injection) {
                return MEPH.MobileServices.get(injection).then(function (provider) {
                    me.$inj[injection] = provider;
                }).catch(function (e) {
                    MEPH.Log(e);
                });
            })).then(function () {
                me.onInjectionsComplete();
                me.$when.injected();
            });
        }
    }
});