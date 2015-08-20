/**
 * @class MEPH.code.DotCode
 * @extends MEPH.control.Control
 * A infinitely scrolling Scrollbar.
 **/
MEPH.define('MEPH.code.DotCode', {
    alias: 'dotcode',
    templates: true,
    requires: ['MEPH.util.Style', 'MEPH.util.Dom', 'MEPH.util.Operations'],
    extend: 'MEPH.control.Control',
    properties: {
        width: null,
        centerColor: '#ffff00',
        height: null,
        radius: 4,
        step: 16,
        offsetY: 10,
        offsetX: 10,
        $renderer: null
    },
    initialize: function () {
        var me = this,
            properties = MEPH.Array(['width', 'height']);

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
                var x = (index % rowcount) * me.step + me.offsetX;
                var y = Math.floor(index / rowcount) * me.step + me.offsetY;
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
                    command.radius = 0;
                }
                return command
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