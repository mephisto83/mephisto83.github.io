
MEPH.define('MEPH.graph.renderer.SquareBoxRenderer', {
    requires: ['MEPH.util.Renderer'],
        extend: 'MEPH.graph.renderer.CanvasRenderer',
        properties: {
        },
        initialize: function () {
            var me = this;
            me.callParent.apply(me, arguments);
        },
        draw: function (options) {
            var me = this, temp = me.options(options);
            me.renderer.draw([temp]);
            return true;
        },

        renderNode: function (node, canvas, offset) {
            var me = this;
            var position = node.getPosition();
            me.renderer.setCanvas(canvas);
            me.draw({ x: position.x + offset.x, y: position.y + offset.y });
        },
        options: function (options) {
            var temp = {
                shape: 'rectangle',
                fillStyle: 'grey',
                x: 10,
                y: 10,
                width: 200,
                height: 100,
                radius: 4
            }
            for (var i in options) {
                temp[i] = options[i];
            }
            return temp;
        },
        drawToCache: function (key, options) {
            options = options || {};
            var me = this,
                temp = me.options(options);
            me.callParent.apply(me, [key, temp]);
        }
    });