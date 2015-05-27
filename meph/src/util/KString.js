MEPH.define('MEPH.util.KString', {
    statics: {
        invertedLists: null,
        dictionary: null
    },
    properties: {
        qSize: 2
    },
    initialize: function () {
    },
    preprocess: function (array) {
        var me = this, s, idx;
        me.dictionary = [];
        me.invertedLists = [];
        array.foreach(function (item, index) {
            if (item)
                [].interpolate(0, item.length - me.qSize, function (t) {
                    s = item.substr(t, me.qSize).toLowerCase();
                    idx = me.dictionary.indexOf(s);
                    if (idx === -1) {
                        idx = me.dictionary.length;
                        me.dictionary.push(s);
                        me.invertedLists.push([]);
                    }
                    me.invertedLists[idx].push(index);
                })
        })
        return me;
    },
    getClosest: function (item, count) {
        var me = this, s, idx;
        if (item) {
            
            var res = [].interpolate(0, item.length - me.qSize, function (t) {
                s = item.substr(t, me.qSize).toLowerCase();
                idx = me.dictionary.indexOf(s);
                if (idx !== -1) {
                    return me.invertedLists[idx];
                }
            });
            var score = {};
            res.foreach(function (t) {
                t.foreach(function (y) {
                    score[y] = score[y] || 0;
                    score[y]++;
                })
            });
            var order = []
            for (var i in score) {
                order.push({ i: i, score: score[i] })
            }
            var subset = order.orderBy(function (y, t) {
                return t.score - y.score;
            }).subset(0, count);
            return subset;
        }
        return [];
    }
});