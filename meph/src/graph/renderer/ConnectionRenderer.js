/**
* @class MEPH.graph.Graph
* Creates a graph.
*/
MEPH.define('MEPH.graph.renderer.ConnectionRenderer', {
    requires: ['MEPH.util.Renderer'],
    extend: "MEPH.graph.renderer.CanvasRenderer",
    properties: {
        singleNodePosition: null
    },
    initialize: function () {
        var me = this;
        MEPH.Events(me);
        me.singleNodePosition = { x: 100, y: 100 };
        me.callParent.apply(me, arguments);
    },
    draw: function (options, endpoints, overridingoptions) {
        var me = this,
            temp;
        overridingoptions = overridingoptions || {};
        var items = endpoints.select(function (x) {
            temp = me.options(options);
            temp = me.options(overridingoptions);
            temp.start = x.start
            temp.end = x.end;
            return temp;
        });
        return me.renderer.draw(items);
    },
    calculateEndPoints: function (nodes, offset, connection) {
        var me = this;
        offset = offset || { x: 0, y: 0 };
        var zones = connection.getZones();
        var result = zones.summation(function (zone, current, index) {
            var pos = zone.getPosition();
            if (current) {
                return {
                    x: pos.x + current.x,
                    y: pos.y + current.y
                };
            }
            return {
                x: pos.x,
                y: pos.y
            };
        }) || { x: 0, y: 0 };

        var average = {
            x: (result.x / zones.length),
            y: (result.y / zones.length)
        };

        var nodeendpoints = connection.getZones().select(function (x) {
            var pos = x.getPosition();
            return {
                start: {
                    x: pos.x,
                    y: pos.y
                },
                end: average
            }
        });
        return nodeendpoints;
    },
    render: function (canvas, endpoints, overridingoptions) {
        var me = this;
        me.renderer.setCanvas(canvas);
        me.draw({}, endpoints, overridingoptions);
    },
    renderConnection: function (connection, canvas, offset, overridingoptions) {
        var me = this;
        var nodes = connection.getNodes();
        var endpoints = me.calculateEndPoints(nodes, offset, connection);
        me.render(canvas, endpoints, overridingoptions);
        return true;
    },
    options: function (options) {
        var temp = {
            shape: MEPH.util.Renderer.shapes.line,
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