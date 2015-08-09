/**
 * @class MEPH.ringcode.RingCode
 * @extends MEPH.control.Control
 * A infinitely scrolling Scrollbar.
 **/
MEPH.define('MEPH.ringcode.RingCode', {
    alias: 'ringcode',
    templates: true,
    requires: ['MEPH.util.Style', 'MEPH.util.Dom'],
    extend: 'MEPH.control.Control',
    properties: {
        width: null,
        height: null,
        centerPointRadius: 20,
        colorStepPerRing: 3,
        radiusStep: 25,
        colors: null,
        centerPointY: 200,
        centerPointX: 150,
        defaultColorCount: 16,
        $renderer: null
    },
    initialize: function () {
        var me = this,
            properties = MEPH.Array(['width', 'height']);
        var base = [].interpolate(2, Math.max(3, me.defaultColorCount + 2), function (x) { return x; }).first(function (t) {
            return me.defaultColorCount.toString(t).length === 3;
        });

        me.colors = [].interpolate(0, me.defaultColorCount + 2, function (x) {
            /*
             0 0 0
             0 0 1
             0 1 0 
             0 1 1
             1 0 0 
             1 0 1 
             1 1 0 
             1 1 1
            */
            return x.toString(base);
        }).select(function (x) {
            x = [].interpolate(x.length, 3, function () { return '0' }).join('') + x;
            return x.split('').select(function (t) {
                return Math.floor(t / (base - 1) * 255);
            })
        });
        me.breakColor = me.toColor([255, 255, 255]);
        me.centerColor = me.toColor(me.colors.first());
        me.centerColor = '#ff00ff';
        me.colors = me.colors.subset(1, me.colors.length - 1);
        me.great();

        properties.foreach(function (prop) {
            me.addTransferableAttribute(prop, {
                object: me,
                path: prop
            });
        });
    },
    draw: function () {
        var me = this,
            commands = me.getCommands(me.value);

        if (commands) {
            var renderer = me.getRenderer();
            renderer.setCanvas(me.body);
            renderer.draw(commands);
        }

    },
    getCommands: function (commands) {
        var me = this,
            ringRadius;
        if (commands) {
            commands = commands.split('').select(function (x, index) {
                var data = me.getRingData(commands.length, index);
                var color = me.getColorFor(x);
                ringRadius = me.radiusStep * (data.ringIndex + 1);
                return me.createCommand({
                    ring: data.ringIndex,
                    ringCount: data.ringCount,
                    color: color,
                    breakColor: me.breakColor,
                    indexInRing: data.indexInRing,
                    ringRadius: ringRadius
                });
            }).concatFluent(function (x) {
                return x;
            });
            var pi2 = 2 * Math.PI / 3;
            var equ = [].interpolate(0, 3, function (x) {
                return MEPH.math.Util.rectangular(pi2 * x, me.radiusStep + ringRadius)
            }).select(function (pos) {
                return {
                    shape: 'circle',
                    radius: me.radiusStep / 4,
                    lineWidth: 0,
                    strokeStyle: me.centerColor,
                    fill: me.centerColor,
                    fillStyle: me.centerColor,
                    x: me.centerPointX + pos.x,
                    y: me.centerPointY + pos.y
                }
            });
            var centereq = [].interpolate(0, 3, function (x) {
                return MEPH.math.Util.rectangular(pi2 * x, me.radiusStep + ringRadius)
            }).select(function (pos) {
                return {
                    shape: 'circle',
                    radius: me.radiusStep / 6,
                    lineWidth: 0,
                    strokeStyle: me.breakColor,
                    fill: me.breakColor,
                    fillStyle: me.breakColor,
                    x: me.centerPointX + pos.x,
                    y: me.centerPointY + pos.y
                }
            });
            commands.push.apply(commands, equ);
          //  commands.push.apply(commands, centereq);
            commands.push({
                shape: 'circle',
                radius: me.radiusStep / 4,
                lineWidth: 0,
                strokeStyle: me.centerColor,
                fill: me.centerColor,
                fillStyle: me.centerColor,
                x: me.centerPointX,
                y: me.centerPointY
            })
            return commands;
        }
        return [];
    },
    createCommand: function (options) {
        var me = this,
            ringindex = options.indexInRing,
            angleStep = Math.PI / options.ringCount,
            fullStep = angleStep * 2;// Half a step, ;

        var basicCommand = {
            shape: 'ring',
            lineCap: 'butt',
            lineJoin: 'miter',
            fill: options.color,
            strokeStyle: options.color,
            stroke: options.color,
            fillStyle: options.color,
            lineWidth: 0,
            radius: options.ringRadius,
            lineWidth: me.radiusStep + 2,
            sAngle: ringindex * fullStep,
            eAngle: (ringindex) * fullStep + angleStep,
            x: me.centerPointX,
            y: me.centerPointY
        };
        var commandBreak = MEPH.clone(basicCommand);
        commandBreak.fill = options.breakColor;
        commandBreak.strokeStyle = options.breakColor;
        commandBreak.sAngle = ((ringindex) * fullStep) + angleStep;
        commandBreak.eAngle = ((ringindex) * fullStep) + fullStep;

        return [basicCommand, commandBreak];
    },
    getRingData: function (messageLength, index) {
        var me = this,
            ringCount,
            u,
            total = 0,
            last = 0, rindIndex,
            step = me.colorStepPerRing;


        var t = [].interpolate(0, index + me.colorStepPerRing, function (x) {
            last = last + step;
            total += last;
            if (index < total && ringCount === undefined) {
                ringCount = last;
                rindIndex = x;
                u = index - last + step;
            }
            return last;
        })



        return { ringCount: ringCount, ringIndex: rindIndex, indexInRing: u };
    },
    getColorFor: function (x) {
        var me = this;
        return me.toColor(me.colors[parseInt(x, me.colors.length)]);
    },
    toColor: function (x) {
        return 'rgb(' + x.select(function (x) {
            return x;
        }).join() + ')';
    },
    getRenderer: function () {
        var me = this;
        me.$renderer = me.$renderer || new MEPH.util.Renderer();
        return me.$renderer;
    }
});