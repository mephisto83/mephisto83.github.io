/**
 * @class MEPH.pad.DrawingSurface
 * Creates a canvas that can be drawn on with a mouse or by touch.
 **/
(function () {
    function distanceBetween(point1, point2) {
        return Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2));
    }
    function angleBetween(point1, point2) {
        return Math.atan2(point2.x - point1.x, point2.y - point1.y);
    }

    MEPH.define('MEPH.pad.DrawingSurface', {
        alias: 'drawingsurface',
        templates: true,
        requires: ['MEPH.util.Renderer'],
        extend: 'MEPH.control.Control',
        properties: {
            $renderer: null,
            nearpointthreshold: 2000,
            painting: false,
            drawing: null,
            currentStroke: null,
            nearpointskip: 10,
            strokes: null,
            brushsrc: null,
            strokestyle: null,
            trailingEdge: 10,
            mindistance: 5,
            randomrotation: 0,
            nearpoints: false,
            linecap: null,
            scale: null,
            rotation: null,
            radius: 1,
            layers: null,
            shadowcolor: null,
            quadraticlines: false,
            shadowblur: null,
            keeponresize: false,
            shape: '',
            image: null,
            miterlimit: null,
            timebase: false,
            linejoin: null,
            fillstyle: null,
            centerbrush: false,
            opacity: 1,
            linevariation: null,
            linewidth: null,
            height: null,
            width: null,
            canvasSelector: 'canvas.drawing-surface-canvas'
        },
        initialize: function () {
            var me = this;
            me.drawing = [];
            me.cache = [];
            me.strokes = [];
            me.allstrokes = [];
            me.layers = [];
            me.callParent.apply(me, arguments);
            me.$renderer = new Renderer();
            me.addTransferables();
        },
        getRenderer: function () {
            var me = this;
            return me.$renderer;
        },
        clear: function () {
            var me = this;
            var renderer = me.getRenderer();
            if (renderer) {
                renderer.clear();
            }
        },
        getImage: function () {
            var me = this;
            var renderer = me.getRenderer();
            if (renderer) {
                var canvas = renderer.getCanvas();
                if (canvas) {
                    var dataURL = canvas.toDataURL();
                    return dataURL;
                }
            }
            return null;
        },
        onLoaded: function () {
            var me = this;
            me.callParent.apply(me, arguments);
            me.getRenderer().setCanvas(me.querySelector(me.canvasSelector));
            me.appendEvents();
        },
        /**
         * Appends events to the canvas.
         */
        appendEvents: function () {
            var me = this,
                canvas;
            canvas = me.querySelector(me.canvasSelector);
            me.canvas = canvas;
            me.canvasPos = me.getPosition(me.canvas);
            canvas.addEventListener('touchstart', me.onCanvasMouseDown.bind(me), false);
            canvas.addEventListener('mousedown', me.onCanvasMouseDown.bind(me), false);
            canvas.addEventListener('mouseup', me.onCanvasMouseUp.bind(me), false);
            canvas.addEventListener('touchend', me.onCanvasMouseUp.bind(me), false);
            canvas.addEventListener('mouseleave', me.onCanvasMouseLeave.bind(me), false);
            canvas.addEventListener('touchleave', me.onCanvasMouseLeave.bind(me), false);
            canvas.addEventListener('mousemove', me.onCanvasMouseMove.bind(me), false);
            canvas.addEventListener('touchmove', me.onCanvasMouseMove.bind(me), false);
            document.addEventListener('touchmove', me.onDocumentMove.bind(me), false);
        },
        onDocumentMove: function (evt) {
            var me = this;
            if (me.painting) {
                return false;
            }
        },
        resize: function () {
            var me = this;
            // debugger
            if (me.keeponresize) {
                me.floatingImage = me.getImage();
            }
            var newsize = MEPH.util.Style.size(MEPH.util.Array.convert(arguments).last().domEvent.body);
            me.height = newsize.height;
            me.width = newsize.width;
            me.getRenderer().draw({
                shape: MEPH.util.Renderer.shapes.canvas,
                imageurl: me.floatingImage,
                x: 0,
                y: 0
            })
        },
        draw: function () {
            var me = this, instructions;
            requestAnimationFrame(function () {
                // me.strokeBegin();
                instructions = me.getInstructions();
                if (instructions.length > 1) {
                    //me.drawing = [me.drawing.last()];
                    me.getRenderer().draw(instructions);
                }
            });
        },
        getShape: function () {
            var me = this;
            if (me.shape) {
                if (me.shape === MEPH.util.Renderer.shapes.circle) {
                    return MEPH.util.Renderer.shapes.circle;
                }
            }
            if (me.brushsrc) {
                return MEPH.util.Renderer.shapes.image;
            }
            return me.quadraticlines ? MEPH.util.Renderer.shapes.quadratic : MEPH.util.Renderer.shapes.line;
        },
        getRotation: function () {
            var me = this;
            if (me.rotation !== null && me.randomrotation) {
                return me.getRandomInt(me.rotation + me.randomrotation, me.rotation - me.randomrotation);
            }
            return me.rotation;
        },
        getRandomInt: function (max, min) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        },
        getInstructions: function () {
            var me = this,
                result = [],
                group,
                newgroups = [];
            instructionGroups;
            instructionGroups = me.drawing.groupBy(function (x) { return x.id; });
            for (group in instructionGroups) {
                result = result.concat(instructionGroups[group].select(function (x, index) {
                    if (index > 0) {
                        return me.instruction(instructionGroups[group][index - 1], x);
                    }
                    return null;
                }).where(function (x) { return x; }));
                var last = instructionGroups[group].last();
                if (instructionGroups[group].length > me.trailingEdge && last) {
                    newgroups.push([last]);
                }
                else {
                    newgroups.push(instructionGroups[group]);
                }
            }
            me.drawing = newgroups.concatFluent(function (x) { return x; });
            return result;
        },
        instruction: function (start, end) {
            var me = this;
            return {
                shape: me.getShape(),
                fillstyle: me.fillstyle,
                lineWidth: me.linewidth,
                opacity: me.opacity,
                shadowBlur: me.shadowblur,
                scale: me.scale,
                rotation: me.getRotation(),
                imageurl: me.brushsrc,
                shadowColor: me.shadowcolor,
                center: me.centerbrush,
                lineJoin: me.linejoin,
                lineCap: me.linecap,
                color: me.color,
                miterLimit: me.miterlimit,
                radius: me.radius,
                strokeStyle: me.strokestyle,
                start: start,
                x: end.x,
                y: end.y,
                end: end
            }
        },
        onCanvasMouseMove: function (evt) {
            var me = this;
            if (me.painting) {
                me.setContactPositions(evt);
                evt.preventDefault();
            }
        },
        getPosition: function (element) {
            var xPosition = 0;
            var yPosition = 0;

            while (element) {
                xPosition += (element.offsetLeft - element.scrollLeft + element.clientLeft);
                yPosition += (element.offsetTop - element.scrollTop + element.clientTop);
                element = element.offsetParent;
            }
            return { x: xPosition, y: yPosition };
        },
        onCanvasMouseLeave: function () {
            var me = this;
            me.strokeOver();
        },
        onCanvasMouseUp: function (evt) {
            var me = this;
            me.strokeOver();
        },
        strokeOver: function () {
            var me = this;
            if (me.currentStroke) {
                me.strokes.push(me.currentStroke);
                me.allstrokes.push.apply(me.allstrokes, me.currentStroke);
                me.currentStroke = null;
            }
            me.drawing = [];
            me.painting = false;
        },
        strokeBegin: function () {
            var me = this;
            if (me.timebase && me.drawing) {
                //   me.setContactPositions(evt);

            }
        },
        onCanvasMouseDown: function (evt) {
            var i,
                me = this, pos = me.canvasPos,
                touch;
            me.painting = true;
            me.currentStroke = [];
            me.setContactPositions(evt);
        },
        setContactPositions: function (evt) {
            var me = this,
                pos = me.canvasPos;
            if (evt.changedTouches) {
                for (i = evt.changedTouches.length; i--;) {
                    touch = evt.changedTouches[i];
                    me.addDraw(touch.pageX - pos.x, touch.pageY - pos.y, touch.identifier);
                }
            }
            else {
                me.addDraw(evt.offsetX || evt.pageX, evt.offsetY || evt.pageY, -1);

            }
            evt.preventDefault();
        },
        addDraw: function (x, y, id) {
            var me = this;
            var lastPoint = me.drawing.last(function (x) {
                return x.id === id;
            });
            var currentPoint = { x: x, y: y, id: id };
            if (lastPoint) {
                var dist = distanceBetween(lastPoint, currentPoint);
                var angle = angleBetween(lastPoint, currentPoint);
                var toadd = [];
                var md = parseFloat(me.mindistance);
                if (md) {
                    for (var i = 1 ; i < dist; i += md) {
                        x = lastPoint.x + (Math.sin(angle) * i);
                        y = lastPoint.y + (Math.cos(angle) * i);
                        toadd.push({ x: x, y: y, id: id });
                    }
                    if (toadd.length) {
                        me.drawing.push.apply(me.drawing, toadd);
                    }
                }
                if (me.nearpoints) {
                    var dx, dy, d;
                    var last = me.currentStroke.last();
                    me.currentStroke.foreach(function (point, i) {
                        if (i % me.nearpointskip === 0) {
                            dx = point.x - last.x;
                            dy = point.y - last.y;
                            d = (dx * dx) + (dy * dy);
                            if (d < 1 + (me.nearpointthreshold || 0)) {
                                var tempid = MEPH.GUID();
                                me.drawing.push({
                                    x: last.x + (dx * 0.2), y: last.y + (dy * 0.2),
                                    id: tempid
                                });
                                me.drawing.push({
                                    x: point.x - (dx * 0.2), y: point.y - (dy * 0.2),
                                    id: tempid
                                });
                            }
                        }
                    });
                }
            }

            me.drawing.push(currentPoint);
            me.currentStroke.push({
                x: x,
                y: y,
                id: id
            });
            me.draw();
        },

        addTransferables: function () {
            var me = this, properties = (['width', 'height', 'strokestyle',
                'linewidth',
                'timebase',
                'keeponresize',
                'centerbrush',
                'opacity',
                'quadraticlines',
                'mindistance',
                'radius',
                'brushsrc',
                'linecap',
                'shadowcolor',
                'scale',
                'shape',
                'rotation',
                'nearpointskip',
                'shadowblur',
                'linevariation',
                'nearpointthreshold',
                'randomrotation',
                'nearpoints',
                'miterlimit',
                'fillstyle']);

            properties.foreach(function (prop) {
                me.addTransferableAttribute(prop, {
                    object: me,
                    path: prop
                });
            });

        }
    });
})();