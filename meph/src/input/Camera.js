
MEPH.define('MEPH.input.Camera', {
    alias: 'camerastream',
    extend: 'MEPH.field.FormField',
    requires: ['MEPH.util.Dom'],
    templates: true,
    properties: {
        $video: null,
        autoload: true
    },
    initialize: function () {
        var me = this,
            properties = MEPH.Array(['autoload']);

        me.callParent.apply(me, arguments);
        properties.foreach(function (prop) {
            me.addTransferableAttribute(prop, {
                object: me,
                path: prop
            });
        });
    },
    onLoaded: function () {
        var me = this, video, input, Dom = MEPH.util.Dom;
        me.callParent.apply(me, arguments);
        video = me.querySelector('video');
        video.setAttribute('autoplay', true);
        me.$video = video;
        if (me.autoload) {
            setTimeout(function () {
                me.loadVideo();
            }, 300);
        }
    },
    getVideo: function () {
        var me = this;

        return me.$video;
    },
    loadVideo: function () {
        var me = this, video, Dom = MEPH.util.Dom;
        video = me.$video;
        if (video) {
            if (Dom.supportsUserMedia()) {
                Dom.getUserMedia({ video: true }).then(function (localMediaStream) {
                    video.src = window.URL.createObjectURL(localMediaStream);
                });
            }
            else {
                //alert('does not support user media');
            }
        }
        else {
            //alert('does not support user media');
        }
    }
});