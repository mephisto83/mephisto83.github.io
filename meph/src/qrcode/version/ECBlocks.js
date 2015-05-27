
MEPH.define('MEPH.qrcode.version.ECBlocks', {
    initialize: function (ecCodewordsPerBlock, ecBlocks1, ecBlocks2) {
        var me = this;
        me.defineGetters();
        me.ecCodewordsPerBlock = ecCodewordsPerBlock;
        if (ecBlocks2) {
            me.ecBlocks = new Array(ecBlocks1, ecBlocks2);
        }
        else {
            me.ecBlocks = new Array(ecBlocks1);
        }
    },
    defineGetters: function () {
        var me = this;
        Object.defineProperty(me, 'ECCodewordsPerBlock', {
            get: function () {
                return me.ecCodewordsPerBlock;
            }
        });
        Object.defineProperty(me, 'TotalECCodewords', {
            get: function () {
                return me.ecCodewordsPerBlock * me.NumBlocks;
            }
        });
        Object.defineProperty(me, 'NumBlocks', {
            get: function () {
                var total = 0;
                for (var i = 0; i < me.ecBlocks.length; i++) {
                    total += me.ecBlocks[i].length;
                }
                return total;
            }
        });

    },
    getECBlocks: function () {
        var me = this;
        return me.ecBlocks;
    }
});