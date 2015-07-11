MEPH.define('Connection.service.Service', {
    injections: [],

    $throttle: function (a, b, category, timelimit) {
        var me = this;
        me.$throttLib = me.$throttLib || [];
        if (typeof a === 'string') {
            var res = me.$throttLib.first(function (x) {
                if (b) { return x.id === a && x.category === b; }
                return x.id === a;
            });
            if (res) {
                return res.item
            }
            res = me.$throttLib.first(function (x) {
                return x.category === b;
            });
            if (res) {
                if (res.cancel) {
                    me.$throttLib.removeWhere(function (x) { return x === res; });
                    res.cancel.abort();
                }
            }
            return null;
        }
        var item = a.catch(function (a, b, e) {
            setTimeout(function () {
                me.$throttLib.removeWhere(function (x) { return x.id === a && x.category === b });
            }, timelimit || 0);
            return Promise.reject(e);
        }.bind(me, b, category)).then(function (a, b, res) {
            setTimeout(function () {
                me.$throttLib.removeWhere(function (x) { return x.id === a && x.category === b });
            }, timelimit || 0);
            return res
        }.bind(me, b, category));
        me.$throttLib.push({
            item: item,
            id: b,
            cancel: a.cancel,
            category: category
        });
        return item;
    },
});