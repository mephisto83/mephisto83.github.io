MEPH.define('MEPH.service.SleepDetectionService', {
    initialize: function (config) {
        config = config || {};
        config.timing = config.timing || 20 * 1000;
        config.margin = config.margin || 4 * 1000;
        var me = this,
            lastTime = Date.now();

        MEPH.Events(me);

        me.$interval = setInterval(function () {
            var now = Date.now();
            if (lastTime + config.timing + config.margin < now) {
                me.fire('slept', {
                    lastTime: lastTime,
                    margin: config.margin,
                    timing: config.timing
                });
            }
            lastTime = now;
        }, config.timing);
    }
});