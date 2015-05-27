/**
 * @class
 * Reads controls from the dom which should be created, and associated with there js objects. 
 **/
MEPH.define('MEPH.mixins.Referrerable', {
    properties: {
    },
    initialize: function () {
        var me = this;
    },
    statics: {
        referrerFunctions: {
            isReferrerable: function () { return true; },
            /**
             * Adds the reference to an object
             * @param {String} type
             * @param {Object} obj
             * @param {Boolean} creator
             **/
            addReferenceConnection: function (type, obj, creator) {
                var me = this;
                if (!me.getConnection(type)) {
                    me.$referenceConnections.push({
                        type: type, obj: obj, creator: creator || false
                    });
                    //if (type !== 'view' && type !== 'control' && type !== 'subcontrol' && obj.on) {
                    //    obj.on('altered', function () {
                    //        me.fire.apply(me, arguments);
                    //    });
                    //}
                    me.fire('reference ' + type, { value: obj });
                    if (!me.hasOwnProperty(type)) {
                        Object.defineProperty(me, type, {
                            value: obj
                        });
                    }
                }
            },
            /**
             * Adds a reference to an obj
             * @param {Object} obj
             * @param {String} obj.type
             * @param {Object} obj.obj
             **/
            addReferenceConnectionObj: function (obj) {
                var me = this;
                me.addReferenceConnection(obj.type, obj.obj);
            },
            /**
             * Removes reference connection by type.
             * @param {String} type
             * @returns {Array} removed connections.
             */
            removeReferenceConnection: function (type) {
                var me = this;
                return me.$referenceConnections.removeWhere(function (x) { return x.type === type; });
            },
            /**
             * Gets the reference connections.
             **/
            getReferenceConnections: function () {
                var me = this;
                return me.$referenceConnections;
            },
            getConnectableTypes: function () {
                var me = this,
                    connections = me.getReferenceConnections().select(function (x) { return x.type });;
                return MEPH.Array(connections.concat(MEPH.getBindPrefixShortCuts().select(function (x) { return x.type; }))).unique(function (x) { return x; });
            },
            getConnection: function (type) {
                var me = this,
                    reference;
                if (type === MEPH.control.Control.connectables.control) {
                    return me;
                }
                reference = me.$referenceConnections.first(function (x) { return x.type === type; });
                if (reference) {
                    return reference.obj;
                }
                return null;
            }
        }
    },
    init: function () {
        var me = this,
            i,
            referrerFunctions = MEPH.mixins.Referrerable.referrerFunctions;

        for (i in referrerFunctions) {
            me[i] = referrerFunctions[i].bind(me);
        }
    }
});