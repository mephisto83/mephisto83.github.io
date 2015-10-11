/**
 * @class MEPH.code.DotCode
 * @extends MEPH.control.Control
 * A infinitely scrolling Scrollbar.
 **/
MEPH.define('MEPH.code.DotCode', {
    alias: 'dotcode',
    templates: true,
    requires: ['MEPH.util.Renderer', 'MEPH.util.Style', 'MEPH.util.Dom', 'MEPH.util.Operations'],
    extend: 'MEPH.control.Control',
    properties: {
        width: null,
        centerColor: '#ffff00',
        ringColor: '#00ffff',
        height: null,
        radius: 4,
        step: 16,
        offsetY: 10,
        size: false,
        offsetX: 10,
        ringLineWidth: 4,
        $renderer: null
    },
    initialize: function () {
        var me = this,
            properties = MEPH.Array(['width', 'height', 'size']);

        me.breakColor = me.toColor([255, 255, 255]);
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
            renderer.clear();
            renderer.draw(commands);
        }

    },
    convertCode: function (code) {
        var me = this;
        return (code || '').split('').select(function (x) {
            return MEPH.util.Operations.pad(MEPH.util.Operations.Hex2Bin(x), 4);
        }).join('');
    },
    getCommands: function (commands) {
        var me = this;

        if (commands) {
            var binaryCode = me.convertCode(commands).split('');
            var count = binaryCode.length + 4;
            var rowcount = Math.ceil(Math.sqrt(count));
            binaryCode.unshift(1);

            var width = me.step * rowcount;
            var height = me.step * rowcount;
            if (me.size === 'auto') {
                if (me.width !== width || me.height !== height) {
                    me.width = width;
                    me.height = height;
                    if (me.$drawTimeout) {
                        clearTimeout(me.$drawTimeout);
                        me.$drawTimeout = null;
                    }
                    me.$drawTimeout = setTimeout(function () {
                        me.draw();
                        me.$drawTimeout = null;
                    }, 100);
                }
            }
            var centerPointX = me.body.clientWidth / 2;
            var centerPointY = me.body.clientHeight / 2;
            binaryCode.splice(rowcount - 1, 0, 1);

            var lbc = rowcount * rowcount - rowcount;
            if (lbc < binaryCode.length) {
                binaryCode.splice(rowcount * rowcount - rowcount, 0, 1);
            }
            else {
                [].interpolate(0, (rowcount * rowcount) - binaryCode.length - 2, function () {
                    binaryCode.push(0);
                });
                binaryCode.splice(rowcount * rowcount - rowcount, 0, 1);
            }
            [].interpolate(0, (rowcount * rowcount) - binaryCode.length - 1, function () {
                binaryCode.push(0);
            })
            binaryCode.push(1);

            var drawCommands = binaryCode.select(function (value, index) {
                var x = ((index % rowcount) * me.step) + (centerPointX) - (width / 2) + 2 * me.radius;
                var y = (Math.floor(index / rowcount) * me.step) + (centerPointY) - (height / 2) + 2 * me.radius;
                var command = {
                    shape: 'circle',
                    radius: me.radius,
                    lineWidth: 0,
                    fill: me.centerColor,
                    fillStyle: me.centerColor,
                    x: x,
                    y: y
                }
                if (value == 0) {
                    return false;
                }
                return command
            }).where();

            drawCommands.push({
                shape: 'ring',
                lineCap: 'butt',
                lineJoin: 'miter',
                fill: me.ringColor,
                strokeStyle: me.ringColor,
                stroke: me.ringColor,
                fillStyle: me.ringColor,
                lineWidth: 0,
                radius: Math.sqrt(Math.pow(width / 2, 2) + Math.pow(height / 2, 2)),
                lineWidth: me.ringLineWidth,
                sAngle: 0,
                eAngle: Math.PI * 2,
                x: centerPointX,
                y: centerPointY
            });
            return drawCommands;
        }
        return [];
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