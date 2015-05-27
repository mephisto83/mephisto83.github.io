

MEPH.define('MEPH.qrcode.finder.FinderPattern', {
    initialize: function (posX, posY, estimatedModuleSize) {
        var me = this;
        me.x = posX;
        me.y = posY;
        me.count = 1;
        me.estimatedModuleSize = estimatedModuleSize;
        Object.defineProperty(me, 'EstimatedModuleSize', {
            get: function () {
                return me.estimatedModuleSize;
            }
        });
        Object.defineProperty(me, 'Count', {
            get: function () {
                return me.count;
            }
        });
        Object.defineProperty(me, 'X', {
            get: function () {
                return me.x;
            }
        });

        Object.defineProperty(me, 'Y', {
            get: function () {
                return me.y;
            }
        });


    },
    aboutEquals: function (moduleSize, i, j) {
        var me = this;
        if (Math.abs(i - me.y) <= moduleSize && Math.abs(j - me.x) <= moduleSize) {
            var moduleSizeDiff = Math.abs(moduleSize - me.estimatedModuleSize);
            return moduleSizeDiff <= 1.0 || moduleSizeDiff / me.estimatedModuleSize <= 1.0;
        }
        return false;
    },
    incrementCount: function () {
        var me = this;
        me.count++;
    }

});
