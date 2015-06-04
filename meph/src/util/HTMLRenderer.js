/**k
 * @class MEPH.util.HTMLRenderer
 * String
 */
MEPH.define('MEPH.util.HTMLRenderer', {
    requires: ['MEPH.util.Vector', 'MEPH.util.Style'],
    statics: {
        shapes: {
            rectangle: 'rectangle',
            circle: 'circle',
            text: 'text',
            line: 'line',
            canvas: 'canvas',
            bezier: 'bezier'
        },
        defaultShapeOptions: {
            x: 50,
            y: 50,
            'stroke-dasharray': '',
            width: 100,
            height: 100,
            radius: 100,
            textBaseline: "middle",
            maxWidth: 1000,
            fillStyle: '#000000',
            strokeStyle: '#000000',
            fill: '#000000',
            strokeWidth: '2px',
            font: '22px Verdana',
            stroke: true
        }
    },
    properties: {
        batchdraw: false,
        parts: null
    },
    initialize: function () {
        var me = this;
        me.parts = [];
        me.unused = [];
    },
    setCanvas: function (svg) {
        var me = this;
        me.$svg = svg;
    },
    getCanvas: function () {
        var me = this;
        return me.$svg;
    },
    getContext: function () {
        var me = this;
        me.$svg = me.$svg || me.getCanvas();
        return me.$svg;
    },
    draw: function (args) {
        var me = this,
            pool = [],
            result = [],
            context = me.getContext();
        if (!Array.isArray(args)) {
            args = [args];
        }
        if (me.batchdraw) {
            pool = me.parts.select();
        };

        args.foreach(function (options, index) {
            options = me.applyDefaults(options);
            switch (options.shape) {
                case MEPH.util.Renderer.shapes.rectangle:
                    var res = pool.removeFirstWhere(function (x) {
                        x.options.shape === options.shape;
                    }).first();
                    result = result.concat(me.drawRectangle(options, res ? res.shape : null));
                    break;
                case MEPH.util.SVG.shapes.bezier:
                case MEPH.util.SVG.shapes.line:
                    result = result.concat(me.drawLine(options));
                    break;
                case MEPH.util.SVG.shapes.text:
                    result = result.concat(me.drawText(options));
                    break;
                case MEPH.util.SVG.shapes.circle:
                    result = result.concat(me.drawCircle(options));
                    break;
            }
        });
        if (me.batchdraw)
            pool.foreach(function (x) {
                me.remove(x);
            })
        result.foreach(function (t) {
            me.parts.push(t);
        })
        return result;
    },
    remove: function (obj) {
        var me = this;
        var p = me.parts.removeWhere(function (x) { return x === obj; });

        p.foreach(function (t) {
            if (t.shape.parentNode)
                t.shape.parentNode.removeChild(t.shape);
        })
    },
    /**
     * Clears the svg canvas of all objects
     */
    clear: function () {
        var me = this, canvas = me.getCanvas();
        canvas.childNodes.select().foreach(function (x) {
            if (x.parentNode)
                x.parentNode.removeChild(x);
        })
    },
    drawRectangle: function (options, el) {
        var me = this,
                  canvas, shape,
                  add, line;

        canvas = me.getCanvas();
        var svgns = "http://www.w3.org/2000/svg";
        if (!el) {
            add = true;
        }
        else {
            shape = el.shape;
            options = me.applyDefaults(options);
        }
        shape = shape || document.createElement("div");
        MEPH.util.Style.absolute(shape);
        MEPH.util.Style.setPosition(shape, x, y);
        //shape.setAttributeNS(null, "x", options.x);
        //shape.setAttributeNS(null, "y", options.y);
        // shape.setAttributeNS(null, "width", options.width);
        MEPH.util.Style.width(shape, options.width);
        //shape.setAttributeNS(null, "height", options.height);
        //shape.setAttributeNS(null, "stroke", options.strokeStyle);
        MEPH.util.Style.height(shape, options.height);
        // shape.setAttributeNS(null, "stroke-width", options.strokeWidth);
        MEPH.util.Style.strokeWidth(shape, options.strokeWidth);
        MEPH.util.Style.backgroundColor(shape, options.fillStyle);
        //shape.setAttributeNS(null, "fill", options.fillStyle);

        if (add) {
            canvas.appendChild(shape);
        }
        return {
            shape: shape, options: options
        };
    },
    drawText: function (options) {
        var shape;

        var svgns = "http://www.w3.org/2000/svg";
        shape = document.createElementNS(svgns, 'span');
        shape.innerHTML = options.text;
        //if (options.hasOwnProperty('x'))
        //    shape.setAttribute('x', options.x);
        //if (options.hasOwnProperty('y'))
        //    shape.setAttribute('y', options.y);

        //if (options.hasOwnProperty('dx'))
        //    shape.setAttribute('dx', options.dx);
        //if (options.hasOwnProperty('dy'))
        //    shape.setAttribute('dy', options.dy);
        //if (options.hasOwnProperty('fill'))
        //    shape.setAttribute('fill', options.fill);
        MEPH.util.Style.absolute(shape);
        MEPH.util.Style.setPosition(shape, x, y);
        //MEPH.util.Style.width(shape, options.width);
        //MEPH.util.Style.height(shape, options.height);
        MEPH.util.Style.strokeWidth(shape, options.strokeWidth);
        MEPH.util.Style.backgroundColor(shape, options.fillStyle);
        var me = this;
        var canvas = me.getCanvas();
        canvas.appendChild(shape);
        return {
            shape: shape, options: options
        };
    },
    drawLine: function (options, el) {

    },
    drawCircle: function (options, el) {
        var me = this,
                  canvas, shape,
                  add, line;

        canvas = me.getCanvas();
        var svgns = "http://www.w3.org/2000/svg";
        if (!el) {
            add = true;
        }
        else {
            shape = el.shape;
            options = me.applyDefaults(options);
        }
        shape = shape || document.createElementNS(svgns, "div");
        // cx="50" cy="50" r="40" stroke="black" stroke-width="3" fill="red"
        MEPH.util.Style.borderRadius(shape, '50%', true);
        MEPH.util.Style.absolute(shape);
        MEPH.util.Style.setPosition(shape, x, y);
        MEPH.util.Style.height(shape, options.radius);
        MEPH.util.Style.width(shape, options.radius);

        //shape.setAttributeNS(null, "stroke", options.stroke);
        // shape.setAttributeNS(null, "stroke-width", options.strokeWidth);
        MEPH.util.Style.strokeWidth(shape, options.strokeWidth);
        MEPH.util.Style.backgroundColor(shape, options.fill);
        if (add) {
            canvas.appendChild(shape);
        }
        return {
            shape: shape, options: options
        };
    },
    applyDefaults: function (options) {
        options = options || {
        };
        for (var i in MEPH.util.SVG.defaultShapeOptions) {
            if (options[i] === undefined) {
                options[i] = MEPH.util.SVG.defaultShapeOptions[i];
            }
        }
        return options;
    }
});