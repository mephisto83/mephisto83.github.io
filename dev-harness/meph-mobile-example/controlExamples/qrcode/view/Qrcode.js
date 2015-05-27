MEPH.define('MEPHControls.qrcode.view.Qrcode', {
    alias: 'qcrcodeview',
    templates: true,
    extend: 'MEPH.mobile.activity.container.Container',
    requires: ['MEPH.mobile.activity.view.ActivityView',
                'MEPH.input.Search',
                'MEPH.list.List',
                'MEPH.input.Camera',
                'MEPH.input.Text',
                'MEPH.qrcode.Qrcode',
                'MEPH.input.MultilineText',
                'MEPH.panel.Panel'],
    properties: {
        name: null,
        $qrcode: null,
        resolvedCode: null
    },
    initialize: function () {
        var me = this;
        me.callParent.apply(me, arguments);

        me.$qrcode = new MEPH.qrcode.Qrcode();
        me.$qrcode.callback = function (str) {
            if (str !== "error decoding QR Code") {
                me.resolvedCode = str;
            }

            me.$processing = false;
        }
    },
    onLoaded: function () {
        var me = this;
        me.name = 'QR Code';
    },
    takeAPicture: function () {
        var me = this, video;
        if (me.camerasource) {

            video = me.camerasource.getVideo();
            MEPH.util.Dom.setSize(me.canvas, { height: video.clientHeight, width: video.clientWidth }, true);
            me.canvas.getContext('2d').drawImage(video, 0, 0, video.clientWidth, video.clientHeight);
            me.pictureTaken = true;
        }
    },
    processPicture: function () {
        var me = this;
        if (me.pictureTaken && !me.$processing) {
            me.$processing = true;
            me.$qrcode.decode(me.canvas);
        }
    }
});