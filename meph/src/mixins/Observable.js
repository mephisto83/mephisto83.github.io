/**
 * @class
 * Reads controls from the dom which should be created, and associated with there js objects. 
 **/
MEPH.define('MEPH.mixins.Observable', {
    requires: ['MEPH.util.Observable'],
    properties: {
    },
    initialize: function () {
        var me = this;
    },
    init: function () {
        var me = this,
          properties = [];
        for (var name in me) {
            if (typeof (me[name]) !== 'function' && (name !== 'requires' &&
                    name !== 'statics' &&
                    name !== 'extend' &&
                    name !== 'templates' &&
                    name !== 'mixins' &&
                    name !== 'templates' &&
                    name !== 'alias' &&
                    name !== '____type' &&
                    name !== 'observable' &&
                    name !== 'properties') && !name.startsWith(MEPH.privatePropertyPrefix)) {
                properties.push(name);
            }
        }
        MEPH.util.Observable.observable(me, properties);
    }
});