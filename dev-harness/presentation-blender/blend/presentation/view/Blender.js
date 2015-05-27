MEPH.define('Blend.presentation.view.Blender', {
    alias: 'blend_preseentation',
    templates: true,
    extend: 'MEPH.mobile.activity.container.Container',
    mixins: ['MEPH.mobile.mixins.Activity'],
    requires: [
        'MEPH.input.Number', 'MEPH.input.Text',
        'MEPH.input.MultilineText',
        'MEPH.file.FileSaver', 'MEPH.button.Button',
        'MEPH.file.Dropbox', 'MEPH.util.FileReader'],
    properties: {
        extrude: 0.07,
        blockspacing: 2.1,
        maxheight: 10,
        framesPerData: 3,
        framespertext: 75,
        result: null,
        textalign: 'LEFT',
        splitWith: ';',
        wordCountNewLine: 4,
        textinput: null
    },
    initialize: function () {
        var me = this;
        me.fileSaver = new MEPH.file.FileSaver();
        me.callParent.apply(me, arguments);
        me.on('load', me.onLoaded.bind(me));
    },
    emptyRoom: function () {
        var me = this;
        me.stationaryCamera("D:\\dev\\Python\\Blender\\Presentation\\Stages\\wysiwyg.blend", false, true)
    },
    brickRoadStarWars: function () {
        var me = this;
        me.stationaryCamera("D:\\Render\\Presenatation\\Test\\3\\untitled1.blend", true, false)
    },
    stationaryCamera: function (stagefile, addcamera, vertialcalText) {
        var me = this;
        var textinput = me.textinput;

        var texts = textinput.split(me.splitWith || ';').where(function (x) { return x; }).select(function (x, index) {
            return {
                "name": "text_" + index,
                "type": "text",
                "value": x + (me.splitWith || ';'),
                "align": me.textalign,
                "material": ["MedLightBlue", "MedLightWhite"].random().first(),
                "rotation": { "x": vertialcalText ? 90 : 0, "y": 0, "z": 0 },
                "scale": { "x": .6, "y": .6, "z": .6 },
                "font": "segoeuib",
                "extrude": me.extrude
            }
        });
        texts.foreach(function (t) {
            t.value = t.value.split(' ').where().select(function (x, index) {
                if (index % me.wordCountNewLine === 0)
                    return x + ' ' + '\n';
                return x + ' ';
            }).join('')
        })
        var chain = texts.select(function (x) { return x.name; });
        texts.push({
            "name": "default_camera",
            "position": { "x": -10, "y": 0, "z": 10 },
            "type": "camera"
        },
               {
                   "name": "default_empty",
                   "position": { "x": 0, "y": 0, "z": 0 },
                   "type": "empty"
               })
        var objects = texts.select(function (x) {
            return {
                name: x.name
            }
        })
        objects.push({
            "name": "default_camera",
            "target": "default_empty"
        }, {
            "name": "default_empty",
        });
        var keyframes = [{
            "frame": 1,
            "objects": objects
        }];
        var framesper = me.framespertext;
        var outofframe = {
            x: -30,
            y: -0,
            z: 0
        };
        var inframe = {
            x: 0,
            y: 0,
            z: 0
        }
        var innframeoffset = 10;
        var outframeoffset = 60;
        var outframe = {
            x: 20,
            y: 0,
            z: 0
        };
        texts.where(function (t) {
            return t.type !== 'camera' && t.type !== 'empty'
        }).foreach(function (text, I) {
            var index = I * 2;

            var frame = I * outframeoffset;
            keyframes.push({
                "frame": frame,
                "objects": [{
                    "name": text.name,
                    "position": outofframe
                }]
            });
            keyframes.push({
                "frame": frame + innframeoffset,
                "objects": [{
                    "name": text.name,
                    "position": inframe
                }]
            });

            keyframes.push({
                "frame": frame + outframeoffset - innframeoffset,
                "objects": [{
                    "name": text.name,
                    "position": inframe
                }]
            });

            keyframes.push({
                "frame": frame + outframeoffset,
                "objects": [{
                    "name": text.name,
                    "position": outframe
                }]
            });

        });
        var t = {
            frame: 1,
            "objects": [{
                "name": "default_empty",
                "position": { "x": 0, "y": 0, "z": 0 }
            }]
        }
        if (addcamera) {
            t.objects.push({
                "name": "default_camera",
                "position": { "x": 1.5, "y": -5, "z": 5 },
                "target": "default_empty"
            });
        }
        keyframes.push(t);
        var res = {
            "settings": {
                "RenderEngine": "CYCLES",
                "Materials": {
                    "File": "D:\\dev\\Python\\Blender\\Presentation\\Material\\mat.blend",
                    "Names": ["White", "Green", "Red", "Blue"]
                }
            },
            "scenes": [
                {
                    "name": "default",
                    "stage": {
                        "File": stagefile,//"D:\\Render\\Presenatation\\Test\\3\\untitled1.blend",
                        "Group": "Stage"
                    },
                    "armatures": [],
                    objects: texts,
                    keyframes: keyframes
                }]
        };
        me.save(res);
    },
    clickedButton: function () {
        var me = this;
        var textinput = me.textinput;

        var texts = textinput.split(me.splitWith || ';').where(function (x) { return x; }).select(function (x, index) {
            return {
                "name": "text_" + index,
                "type": "text",
                "value": x + (me.splitWith || ';'),
                "align": me.textalign,
                "material": ["White", "Green", "Red", "Blue"].random().first(),
                "rotation": { "x": 90, "y": 0, "z": 0 },
                "scale": { "x": .3, "y": .3, "z": .3 },
                "font": "mriamc",
                "extrude": me.extrude
            }
        });
        texts.foreach(function (t) {
            t.value = t.value.split(' ').where().select(function (x, index) {
                if (index % me.wordCountNewLine === 0)
                    return x + ' ' + '\n';
                return x + ' ';
            }).join('')
        })
        var chain = texts.select(function (x) { return x.name; });
        texts.push({
            "name": "default_camera",
            "type": "camera"
        },
               {
                   "name": "default_empty",
                   "type": "empty"
               })
        var objects = texts.select(function (x) {
            return {
                name: x.name
            }
        })
        objects.push({
            "name": "default_camera",
            "position": { "x": 0, "y": 2, "z": 0 },
            "target": "default_empty"
        }, {
            "name": "default_empty",
            "position": { "x": 0, "y": 0, "z": 0 }
        });
        var keyframes = [{
            "frame": 1,
            "objects": objects
        }];
        var framesper = me.framespertext
        texts.foreach(function (text, I) {
            var index = I * 2;
            keyframes.push({
                "frame": 10 + (framesper * index),
                "objects": [
                    {
                        "name": "default_camera",
                        "position_rel": {
                            "target": text.name,
                            "position": "front"
                        }
                    },
                    {
                        "name": "default_empty",
                        "position_rel": {
                            "target": text.name,
                            "position": "center"
                        }
                    }
                ]
            }, {
                "frame": 10 + (framesper * (1 + index)),
                "objects": [
                    {
                        "name": "default_camera",
                        "position_rel": {
                            "target": text.name,
                            "position": "front"
                        }
                    },
                    {
                        "name": "default_empty",
                        "position_rel": {
                            "target": text.name,
                            "position": "center"
                        }
                    }
                ]
            })
        })
        var res = {
            "settings": {
                "RenderEngine": "CYCLES",
                "Materials": {
                    "File": "D:\\dev\\Python\\Blender\\Presentation\\Material\\mat.blend",
                    "Names": ["White", "Green", "Red", "Blue"]
                }
            },
            "scenes": [
                {
                    "name": "default",
                    "armatures": [
                     {
                         "name": "test_" + MEPH.GUID(),
                         "chain": chain,
                         "grid": {
                             "x": 10,
                             "y": 10,
                             "z": 10
                         }
                     }],
                    objects: texts,
                    keyframes: keyframes
                }]
        };
        me.save(res);
    },
    loadFiles: function () {
        var me = this;
        var args = MEPH.util.Array.convert(arguments);
        var evntArgs = args.last();

        var files = args.last();

        return FileReader.readFileList(files.domEvent.files, { readas: 'String' })
            .then(function (res) {
                var blendData = res.first().res.split('\n');
                //blendData = blendData.subset(0, 10);
                var categories = blendData.first().split(',');
                var numerical = blendData.nth(2).split(',').indexWhere(function (x) {
                    return !isNaN(x)
                });
                var nonnumerical = blendData.nth(2).split(',').indexWhere(function (x) {
                    return isNaN(x)
                });
                return {
                    categories: categories,
                    blocks: numerical.length,
                    numerical: numerical,
                    nonnumerical: nonnumerical,
                    data: blendData.subset(1).select(function (t) { return t.split(','); })
                };

            }).then(null, function (e) {
                console.log(e);
            }).then(function (d) {
                return me.getScript(d);
            });
    },
    getScript: function (d) {
        var me = this;
        var blocks = [].interpolate(0, d.blocks, function (t) {
            return {
                "name": "block" + t,
                "type": "cube"
            }
        });
        var categories = d.categories.select(function (t, index) {
            return {
                "name": "cat_" + index,
                "type": "text",
                "value": t,
                "font": "mriamc",
                "extrude": me.extrude
            }
        });
        var blockmaxes = [].interpolate(0, d.blocks, function (t) {
            return {
                max: d.data.maxx(function (x) {
                    return parseFloat(x.nth(d.numerical[t] + 1))
                }),
                min: d.data.min(function (x) {
                    return parseFloat(x.nth(d.numerical[t] + 1))
                })
            }
        });

        var keyframes = d.data.select(function (d_data, index) {
            var objects = blocks.select(function (x, block_index) {
                return {
                    name: x.name, position: {
                        x: block_index * me.blockspacing,
                        y: 0,
                        z: 0
                    },
                    scale: {
                        x: 1,
                        y: function (maxmin) {
                            try {
                                var dataindex = d.numerical[block_index];
                                var low = parseFloat(d_data[dataindex]) - maxmin.min;
                                var h = maxmin.max - maxmin.min;
                                var yt = low * (me.maxheight / h);

                                return yt || 0;
                            } catch (e) {
                                return 0;
                            }
                        }(blockmaxes[block_index]),
                        z: 1
                    }
                }
            })
            return {
                frame: (index * me.framesPerData) + 1,
                objects: objects
            }
        })
        var first_frame_objects = keyframes.first().objects;
        categories.foreach(function (x, block_index) {
            first_frame_objects.push({
                name: x.name,
                scale: {
                    x: 0.5,
                    y: 0.5,
                    z: 0.5,
                },
                position: {
                    x: block_index * me.blockspacing,
                    y: 0,
                    z: 2.4
                },
                rotation: {
                    z: 90
                }
            })
        })
        me.save.save({
            "settings": {},
            "scenes": [
                {
                    "name": "default",
                    "objects": blocks.concat(categories),
                    keyframes: keyframes
                }]
        });
    },
    save: function (obj) {
        var me = this;
        var aFileParts = [JSON.stringify(obj)];
        var oMyBlob = new Blob(aFileParts, { type: 'text/json' });
        me.fileSaver.save(oMyBlob, 'presentation.json');
    },
    onLoaded: function () {
        var me = this;
        me.name = 'Blend presentation';
    }
});