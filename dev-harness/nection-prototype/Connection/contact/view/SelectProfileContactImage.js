MEPH.define('Connection.contact.view.SelectProfileContactImage', {
    alias: 'contact_view_select_profile_contact_image',
    templates: true,
    extend: 'MEPH.mobile.activity.container.Container',
    mixins: ['MEPH.mobile.mixins.Activity'],
    injections: ['contactService',
        'stateService'],
    requires: ['MEPH.input.Camera',
                'MEPH.input.Text',
                'MEPH.input.Image',
                'MEPH.button.Button',
                'MEPH.util.Observable',
                'MEPH.util.FileReader',
                'MEPH.util.Style',
                'MEPH.button.IconButton'],
    properties: {
        status: null,
        size: 200
    },
    initialize: function () {
        var me = this;
        me.callParent.apply(me, arguments);
        me.on('load', me.onLoaded.bind(me));
        me.$supportsUserMedia = MEPH.util.Dom.supportsUserMedia();
    },
    onLoaded: function () {
        var me = this;
        if (me.$supportsUserMedia) {//
            //    me.camera.hide();
        }
        else {
            me.camerasource.hide();
        }
        MEPH.subscribe(Connection.constant.Constants.UsePictureFiles, function () {
            Style.hide(me.camerasource.formBody);
            Style.show(me.camera.formBody);
            Style.show(me.takepicture);
        });

        MEPH.subscribe(Connection.constant.Constants.UseCamera, function () {
            Style.show(me.camerasource.formBody);
            Style.hide(me.camera.formBody);
            Style.hide(me.takepicture);
        });

        MEPH.subscribe(Connection.constant.Constants.TakePicture, function () {
            me.takeAPicture();
        });

        MEPH.subscribe(Connection.constant.Constants.SavePicture, function () {
            alert('Save picture');
        });
        Style.hide(me.camerasource.formBody);
        Style.show(me.camera.formBody);
    },
    onImageChange: function () {
        var me = this;
        return MEPH.util.FileReader.readFileList(me.camera.inputfield.files)
                .then(function (fileResults) {
                    if (!me.$processing) {
                        return new Promise(function (r) {
                            try {
                                me.$processing = true;
                                var file = fileResults.first();

                                if (file) {
                                    var myCanvas = me.canvas;
                                    var ctx = myCanvas.getContext('2d');
                                    var holder = me.querySelector('[canvasholder]');
                                    var img = new Image;
                                    img.onload = function () {
                                        var relwidth = Math.round(img.width)
                                        var relheight = Math.round(img.height);
                                        var scale = Math.max(img.width, img.height) / me.size;
                                        me.canvas.width = me.size;
                                        me.canvas.height = me.size;
                                        try {
                                            // me.canvas.height = relheight * (1 / scale);
                                            // me.canvas.width = relwidth * (1 / scale);
                                            ctx.scale(1 / scale, 1 / scale);
                                            ctx.drawImage(img, 0, 0); // Or at whatever offset you like
                                            Style.show(holder);
                                            // me.$qrcode.decode(me.canvas);
                                        } catch (e) {
                                            MEPH.Log(e);
                                        }
                                        me.$processing = false;

                                    };
                                    img.src = file.res;
                                    r();
                                }
                            }
                            catch (e) {
                                MEPH.Log(e);
                            }
                        });
                    }
                });


    },
    takeAPicture: function () {
        var me = this, video;
        me.$processing = true;
        return Promise.resolve().then(function () {
            me.status = 'processing';
        })
        .then(function () {
            if (me.camerasource) {
                video = me.camerasource.getVideo();

                var relwidth = Math.round(video.clientWidth)
                var relheight = Math.round(video.clientHeight);
                var scale = Math.max(video.clientWidth, video.clientHeight) / me.size;

                MEPH.util.Dom.setSize(me.canvas, {
                    height: me.size,
                    width: me.size
                }, true);
                MEPH.util.Style.show(me.canvasholder);
                // me.canvas.getContext('2d').scale(1 / scale, 1 / scale);
                me.canvas.getContext('2d').drawImage(video, 0, 0, relwidth / scale, relheight / scale);

                me.$processing = false;
            }
        })
    },
    processPicture: function () {
        var me = this;
        if (me.pictureTaken && !me.$processing) {
            me.$processing = false;

            // sme.$qrcode.decode(me.canvas);
        }
    }
});