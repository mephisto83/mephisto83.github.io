/**
 * @class MEPH.util.DataModel
 * String
 */
MEPH.define('MEPH.util.DefaultRestStorage', {
    requires: ['MEPH.util.IndexedStorage'],
    properties: {
        $storage: null
    },
    initialize: function () {
        var me = this;
        me.$storage = new MEPH.util.IndexedStorage({
            id: 'MEPH.util.DefaultRestStorage',
            indexes: [{
                name: 'pathname',
                option: {
                    unique: false
                }
            }, {
                name: 'path',
                option: {
                    unique: false
                }
            }, {
                name: 'method',
                option: {
                    unique: false
                }
            }, {
                name: 'result',
                option: {
                    unique: false
                }
            }]
        });

        me.ready = me.$storage.open();
    },
    get: function (path, method) {
        var me = this;

        return me.ready.then(function () {
            return me.$storage.where(function (obj) {
                return obj.path === path && obj.method === method;
            }).then(function (results) {
                var item = results.first();
                if (item) {
                    return item.result;
                }
                return null;
            })
        })
    },
    set: function (path, method, newres) {
        var me = this;
        return me.ready.then(function () {
            return me.$storage.removeWhere(function (obj) {
                return obj.path === path && obj.method === method;
            }).then(function (res) {
                //if (res) {
                //    res.result = newres;
                //    return me.$storage.put(res);
                //}
                //else {
                return me.$storage.add({ pathname: '$' + path + method, path: path, method: method, result: newres });
                //}
            });
        });
    }
})