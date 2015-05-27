MEPH.define('MEPHControls.signalprocessing.view.Spectrogram', {
    alias: 'mephcontrols_spectrogram',
    templates: true,
    extend: 'MEPH.mobile.activity.container.Container',
    mixins: ['MEPH.mobile.mixins.Activity'],
    requires: ['MEPH.mobile.activity.view.ActivityView', 'MEPH.signalprocessing.Spectrogram'],
    properties: {
        scrollbarposition: null,
        sin: null
    },
    onLoaded: function () {
        var me = this;
        me.name = 'Spectrogram';

    },
    initialize: function () {
        var me = this;
        me.callParent.apply(me, arguments);
        me.on('load', me.onLoaded.bind(me));
    },
    processSin: function () {
        var me = this;

        var createSin = function (length) {
            var input = new Float32Array(length);
            input.foreach(function (x, index) {
                input[index] = Math.cos(Math.PI * index / 16);
            });
            return input;
        }
        var sin = createSin(10240);
        me.sin = sin;
    }
});