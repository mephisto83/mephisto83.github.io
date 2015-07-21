MEPH.define('Connection.contact.view.SelectProfileContactImage', {
    alias: 'contact_view_select_profile_contact_image',
    templates: true,
    extend: 'MEPH.mobile.activity.container.Container',
    mixins: ['MEPH.mobile.mixins.Activity'],
    injections: ['contactService',
        'notificationService',
        'dialogService',
        'overlayService',
        'stateService'],
    requires: ['MEPH.input.Camera',
                'MEPH.input.Text',
                'MEPH.input.Image',
                'MEPH.input.Range',
                'MEPH.button.Button',
                'MEPH.util.Renderer',
                'MEPH.util.Observable',
                'MEPH.util.FileReader',
                'MEPH.util.Style',
                'MEPH.button.IconButton'],
    properties: {
        status: null,
        size: 200,
        scaleValue: 1,
        xValue: 0,
        yValue: 0,
        rotationValue: 0
    },
    initialize: function () {
        var me = this;
        me.great();
        me.$supportsUserMedia = MEPH.util.Dom.supportsUserMedia();
        me.renderer = new MEPH.util.Renderer();
    },
    onLoaded: function () {
        var me = this;
        if (me.$supportsUserMedia) {//
            //    me.camera.hide();
            me.useCamera();
        }
        else {
            me.usePictureFiles();
            //me.camerasource.hide();
        }
        MEPH.util.Draggable.draggable(me.draggableCursor, null, {
            preventScroll: true,
            translate: true,
            boundTo: me.canvasholder
        });
        me.renderer.setCanvas(me.canvas);
        MEPH.subscribe(Connection.constant.Constants.UsePictureFiles, function () {
            me.usePictureFiles();
        });

        MEPH.subscribe(Connection.constant.Constants.UseCamera, function () {
            me.useCamera();
        });

        MEPH.subscribe(Connection.constant.Constants.TakePicture, function () {
            me.takeAPicture();
        });

        MEPH.subscribe(Connection.constant.Constants.SavePicture, function () {
            var data = me.canvas.toDataURL(null, 1);
            me.when.injected.then(function () {
                return me.when.injected.then(function () {
                    return me.$inj.dialogService.confirm({
                        title: 'Are you sure?',
                        message: 'This will set your bridge profile image.',
                        yes: 'Save',
                        no: 'Cancel'
                    });
                }).then(function () {

                    var currentCard = me.$inj.stateService.get(Connection.constant.Constants.CurrentCard);
                    me.$inj.stateService.set(Connection.constant.Constants.SelectProfileContactImageData, data);
                    return me.$inj.contactService.setProfileImage(data, currentCard.selectedCardId);

                }).then(function (res) {
                    window.history.back();
                }).catch(function () {
                    me.$inj.notificationService.notify({
                        icon: 'exclamation-triangle',
                        message: 'Couldn\'t save image.'
                    });
                }).then(function () {
                    me.$inj.overlayService.close('remove from group conversation');
                });
            });
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
                                    me.$lastImage = me.useImage.bind(me, holder, ctx, img);
                                    img.onload = me.$lastImage;
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
    usePictureFiles: function () {
        var me = this;
        Style.hide(me.camerasource.formBody);
        Style.show(me.camera.formBody);
        Style.show(me.takepicture);
        if (me.$lastImage) {
            me.$lastImage();
        }
        me.usingCamera = false;
    },
    useCamera: function () {
        var me = this;
        Style.show(me.camerasource.formBody);
        Style.hide(me.camera.formBody);
        Style.hide(me.takepicture);
        me.usingCamera = true;
    },
    redraw: function () {
        var me = this;
        if (me.usingCamera) {
            return me.takeAPicture();
        }
        else {
            if (me.$lastImage) {
                me.$lastImage();
            }
        }

    }, useImage: function (holder, ctx, img) {
        var me = this;
        var myCanvas = me.canvas;
        ctx = ctx || myCanvas.getContext('2d');
        holder = holder || me.querySelector('[canvasholder]');
        var relwidth = Math.round(img.width)
        var relheight = Math.round(img.height);
        var scale = Math.max(img.width, img.height) / me.size;
        me.canvas.width = me.size;
        me.canvas.height = me.size;
        try {
            // me.canvas.height = relheight * (1 / scale);
            var canvas = me.canvas;
            me.render(img);
            Style.show(holder);
        } catch (e) {
            MEPH.Log(e);
        }
        me.$processing = false;

    },
    render: function (img, swidth, sheight) {
        var me = this;
        var scale = Math.max(img.clientWidth || img.width, img.clientHeight || img.height) / me.size;
        var canvas = me.canvas;
        var context = canvas.getContext('2d');
        context.save();

        me.renderer.drawImage(canvas.getContext('2d'), img, {
            shape: MEPH.util.Renderer.shapes.image,
            center: true,
            canvas: img,
            rotation: me.rotationValue,
            swidth: me.size,
            sheight: me.size,
            scale: 1,
            dy: 0,
            dx: 0,
            height: me.size,
            width: me.size,
            x: me.size / 2,
            y: me.size / 2
        });
        context.restore();
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
                video.width = video.clientWidth;
                video.height = video.clientHeight;
                me.render(video, video.clientWidth, video.clientHeight);
                // context.drawImage(video, 0, 0, relwidth / scale, relheight / scale);
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