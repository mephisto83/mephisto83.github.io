

MEPH.define('MEPH.qrcode.detector.DetectorResult', {
    initialize: function (bits, points) {
        var me = this;
        me.bits = bits;
        me.points = points;
    }
});