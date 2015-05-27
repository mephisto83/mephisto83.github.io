/**k
 * @class MEPH.util.SVG
 * String
 */
MEPH.define('MEPH.util.SVG', {
    requires: ['MEPH.util.Vector'],
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
        shape = shape || document.createElementNS(svgns, "rect");
        
        shape.setAttributeNS(null, "x", options.x);
        shape.setAttributeNS(null, "y", options.y);
        shape.setAttributeNS(null, "width", options.width);
        shape.setAttributeNS(null, "height", options.height);
        shape.setAttributeNS(null, "stroke", options.strokeStyle);
        shape.setAttributeNS(null, "stroke-width", options.strokeWidth);
        shape.setAttributeNS(null, "fill", options.fillStyle);

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
        shape = document.createElementNS(svgns, 'text');
        shape.innerHTML = options.text;
        if (options.hasOwnProperty('x'))
            shape.setAttribute('x', options.x);
        if (options.hasOwnProperty('y'))
            shape.setAttribute('y', options.y);

        if (options.hasOwnProperty('dx'))
            shape.setAttribute('dx', options.dx);
        if (options.hasOwnProperty('dy'))
            shape.setAttribute('dy', options.dy);
        if (options.hasOwnProperty('fill'))
            shape.setAttribute('fill', options.fill);
        var me = this;
        var canvas = me.getCanvas();
        canvas.appendChild(shape);
        return {
            shape: shape, options: options
        };
    },
    drawLine: function (options, el) {
        var me = this,
            d, canvas, shape,
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
        shape = shape || document.createElementNS(svgns, "path");
        if (options.shape === MEPH.util.SVG.shapes.line) {
            d = 'M' + options.start.x + ' ' + options.start.y + ' L' + options.end.x + ' ' + options.end.y;
        }
        else if (options.shape === MEPH.util.SVG.shapes.bezier) {
            d = 'M' + options.start.x + ', ' + options.start.y + ' C ' + options.bezier1.x + ' ' + options.bezier1.y +
            ', ' + options.bezier2.x + ' ' + options.bezier2.y + ', ' + options.end.x + ' ' + options.end.y;
        }
        shape.setAttributeNS(null, "d", d);
        if (options['stroke-dasharray']) {
            shape.setAttributeNS(null, 'stroke-dasharray', options['stroke-dasharray']);
        }
        if (options.fill !== 'css')
            shape.setAttributeNS(null, "fill", options.fill);


        if (options.strokeStyle !== 'css')
            shape.setAttributeNS(null, "style", "stroke:" + options.strokeStyle + "; stroke-width:" + options.strokeWidth + ";");

        if (options['class']) {
            shape.classList.add(options['class']);
        }

        if (add) {
            canvas.appendChild(shape);
        }
        return {
            shape: shape, options: options
        };
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
        shape = shape || document.createElementNS(svgns, "circle");
        // cx="50" cy="50" r="40" stroke="black" stroke-width="3" fill="red"

        shape.setAttributeNS(null, "cx", options.x);
        shape.setAttributeNS(null, "cy", options.y);
        shape.setAttributeNS(null, "r", options.radius);
        shape.setAttributeNS(null, "stroke", options.stroke);
        shape.setAttributeNS(null, "stroke-width", options.strokeWidth);
        shape.setAttributeNS(null, "fill", options.fill);

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