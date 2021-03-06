﻿MEPH.define('Connection.contact.view.SelectProfileContactImage', {
    alias: 'contact_view_select_profile_contact_image',
    templates: true,
    extend: 'MEPH.mobile.activity.container.Container',
    mixins: ['MEPH.mobile.mixins.Activity'],
    injections: ['contactService',
        'notificationService',
        'scrollService',
        'dialogService',
        'overlayService',
        'exifService',
        'stateService'],
    requires: ['MEPH.input.Camera',
                'MEPH.input.Text',
                'MEPH.input.Image',
                'MEPH.input.Range',
                'MEPH.button.Button',
                'MEPH.util.Renderer',
                'MEPH.math.Vector',
                'MEPH.util.Observable',
                'MEPH.util.FileReader',
                'MEPH.util.Style',
                'MEPH.button.IconButton'],
    properties: {
        status: null,
        size: 200,
        scaleValue: 1,
        maxsize: 640,
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

        MEPH.util.Draggable.draggable(me.draggableCursor, null, {
            preventScroll: me.body,
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
        me.when.injected.then(function () {
            if (me.$supportsUserMedia) {//
                //    me.camera.hide();
                me.useCamera();
            }
            else {
                me.usePictureFiles();
                //me.camerasource.hide();
            }
        });
    },
    onImageChange: function () {
        var me = this;
        return MEPH.util.FileReader.readFileList(me.camera.inputfield.files)
                .then(function (fileResults) {
                    try {
                        var file = fileResults.first();
                        if (file)
                            return me.when.injected.then(function () {
                                return me.$inj.exifService.getEXIF(file).then(function (result) {
                                    if (file) {
                                        var myCanvas = me.canvas;
                                        var ctx = myCanvas.getContext('2d');
                                        var holder = me.querySelector('[canvasholder]');

                                        var img = new Image;
                                        me.$lastImage = me.useImage.bind(me, holder, ctx, img, result);
                                        img.onload = me.$lastImage;
                                        img.src = file.res;
                                    }
                                });
                            })
                    }
                    catch (e) {
                        MEPH.Log(e);
                    }
                });
    },
    usePictureFiles: function () {
        var me = this;
        Style.hide(me.camerasource.formBody);
        Style.show(me.camera.formBody);
        Style.show(me.testcanvas);
        me.testcanvas.width = document.body.clientWidth;
        me.testcanvas.height = '310';
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
        Style.hide(me.testcanvas);
        Style.hide(me.takepicture);
        me.usingCamera = true;
    },
    redraw: function () {
        var me = this;
        if (!me.usingCamera) {
            if (me.$lastImage) {
                me.$lastImage();
            }
        }
        return me.takeAPicture().catch(function () {
        });

    },
    resizeCursor: function () {
        var me = this;
        Style.height(me.draggableCursor, parseFloat(me.scaleValue) * me.size);
        Style.width(me.draggableCursor, parseFloat(me.scaleValue) * me.size);
    },
    useImage: function (holder, ctx, img, exif) {
        var me = this;
        var myCanvas = me.canvas;

        ctx = ctx || myCanvas.getContext('2d');
        holder = holder || me.querySelector('[canvasholder]');
        var orientation = exif.Orientation
        var imagewidth = MEPH.ifUndefined(exif.PixelXDimension, Math.round(img.width));
        var imageheight = MEPH.ifUndefined(exif.PixelYDimension, Math.round(img.height));
        var sca = Math.max(imagewidth / me.maxsize, imageheight / me.maxsize);
        imageheight = sca > 1 ? imageheight / sca : imageheight
        imagewidth = sca > 1 ? imagewidth / sca : imagewidth;
        var scale = imagewidth / imageheight;
        var relwidth = Math.min(me.maxsize, document.body.clientWidth);
        var relheight = relwidth / scale;
        me.canvas.width = me.size;
        me.canvas.height = me.size;
        Style.height(me.testcanvas, relheight);
        Style.width(me.testcanvas, relwidth);
        me.testcanvas.width = imagewidth;
        me.testcanvas.height = imageheight;
        me.$selectedImage = img;
        me.$selectedImage.relative = {
            width: relwidth,
            height: relheight,
            scale: imagewidth / relwidth,
            imagewidth: imagewidth,
            imageheight: imageheight
        }

        var transform = { rotation: 0, scaleX: 1, scaleY: 1 };
        me.$selectedImage.relative.transform = transform;
        switch (exif.Orientation) {
            case 1:
                break;
            case 2:
                transform.scaleX = -1;
                break;
            case 3:
                transform.rotation = (Math.PI)
                break;
            case 4:
                transform.scaleY = -1;
                break;
            case 5:
                break;
            case 6:
                transform.rotation = Math.PI / 2
            case 7: break;
            case 8:
                tranform.rotation = 1.5 * Math.PI;
            default:
                break;
        }
        me.$inj.notificationService.notify({
            icon: 'exclamation-triangle',
            message: 'imagewidth :  ' + imagewidth
        });
        try {
            me.renderTo(img, me.testcanvas, img.width, img.height, null, transform);
            Style.show(holder);
        } catch (e) {
            MEPH.Log(e);
        }
    },
    renderTo: function (img, canvas, ratiowidth, ratioheight, relPosition, transform) {
        var context = canvas.getContext('2d');
        relPosition = relPosition || { x: 0, y: 0 };
        context.save();
        context.clearRect(0, 0, canvas.width, canvas.height);
        var me = this;

        me.renderer.drawImage(context, img, {
            shape: MEPH.util.Renderer.shapes.image,
            rotation: me.rotationValue,
            centered: true,
            transform: transform,
            scale: 1,
            swidth: ratiowidth,
            sheight: ratioheight,
            sx: relPosition.x,
            sy: relPosition.y,
            height: canvas.height,
            width: canvas.width,
            dx: 0,
            dy: 0
        });
        context.restore();
    },
    render: function (img, ratiowidth, ratioheight, relPosition, notcenter) {
        var me = this;
        ratiowidth = ratiowidth || 1;
        ratioheight = ratioheight || 1;

        relPosition = relPosition || { x: 0, y: 0 };
        var scale = Math.max(img.clientWidth || img.width, img.clientHeight || img.height) / me.size;
        var canvas = me.canvas;
        var context = canvas.getContext('2d');
        var selectedScale = parseFloat(me.scaleValue);
        context.save();
        context.clearRect(0, 0, canvas.width, canvas.height);
        me.renderer.drawImage(context, img, {
            shape: MEPH.util.Renderer.shapes.image,
            rotation: me.rotationValue,
            center: notcenter ? false : true,
            centered: notcenter ? true : false,
            scale: 1,
            transform: img.relative ? img.relative.transform : null,
            swidth: me.size * ratiowidth * selectedScale,
            sheight: me.size * ratioheight * selectedScale,
            sx: relPosition.x,
            sy: relPosition.y,
            height: me.size,
            width: me.size,
            dx: 0,
            dy: 0
        });
        context.restore();
    },
    takeAPicture: function () {
        var me = this, video;
        return Promise.resolve().then(function () {
            if (me.usingCamera && me.camerasource) {
                video = me.camerasource.getVideo();

                var relwidth = Math.round(video.clientWidth)
                var relheight = Math.round(video.clientHeight);
                var relObj = MEPH.util.Dom.getRelativeScreenPosition(me.draggableCursor, video);
                MEPH.util.Dom.setSize(me.canvas, {
                    height: me.size,
                    width: me.size
                }, true);
                MEPH.util.Style.show(me.canvasholder);
                relObj.y = relObj.y * (video.videoHeight / video.clientHeight);
                relObj.x = relObj.x * (video.videoWidth / video.clientWidth);
                me.render(video, video.videoWidth / video.clientWidth, video.videoHeight / video.clientHeight, relObj);
            }
            else if (me.$selectedImage) {
                var relObj = MEPH.util.Dom.getRelativeScreenPosition(me.draggableCursor, me.testcanvas);
                if (me.$selectedImage) {
                    relObj.x *= me.$selectedImage.relative.scale;
                    relObj.y *= me.$selectedImage.relative.scale;
                    var img = me.canvas;
                    var rel = me.$selectedImage.relative;
                    var tsize = parseFloat(me.scaleValue) * me.size;
                    var rw = tsize / me.$selectedImage.relative.width;
                    var rh = tsize / me.$selectedImage.relative.height;
                    me.renderTo(me.testcanvas, img, me.testcanvas.width * rw, me.testcanvas.height * rh, relObj, {});
                }
            }
        });
    },
    processPicture: function () {
        var me = this;
    }
});