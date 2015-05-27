

MEPH.define('MEPH.qrcode.finder.FinderPatternInfo', {
    initialize: function (patternCenters) {
        var me = this;
        me.bottomLeft = patternCenters[0];
        me.topLeft = patternCenters[1];
        me.topRight = patternCenters[2];


        Object.defineProperty(me, 'BottomLeft', {
            get: function () {
                return me.bottomLeft;
            }
        });
        Object.defineProperty(me, 'TopLeft', {
            get: function () {
                return me.topLeft;
            }
        });
        Object.defineProperty(me, 'TopRight', {
            get: function () {
                return me.topRight
            }
        });
    }
});