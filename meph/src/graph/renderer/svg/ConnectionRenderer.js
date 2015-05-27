/**
* @class MEPH.graph.Graph
* Creates a graph.
*/
MEPH.define('MEPH.graph.renderer.svg.ConnectionRenderer', {
    requires: ['MEPH.util.Renderer', 'MEPH.util.SVG', 'MEPH.util.Dom'],
    extend: "MEPH.graph.renderer.ConnectionRenderer",
    properties: {
        singleNodePosition: null,
        controlpointstroke: '#ff0021',
        controlpointstrokewidth: 3,
        controlpointfill: 'blue',
        $connectioncache: null
    },
    initialize: function () {
        var me = this;
        MEPH.Events(me);
        me.$connectioncache = [];
        me.singleNodePosition = { x: 100, y: 100 };
        me.callParent.apply(me, arguments);
        me.svgrenderer = new MEPH.util.SVG();
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
    addEventsToConnection: function (viewport, obj) {
        var me = this, connection = obj.connection;
        me.don('mouseover', obj.path.shape, function (ee) {
            var xy = viewport.getXY(ee);

            viewport.fire('nodeoverconnection', {
                node: viewport.isDraggingNode ? viewport.isDraggingNode.node : null,
                connection: connection,
                xy: xy
            });
        }, obj);
        connection.on('selected', function (obj) {
            obj.path.shape.classList.add('selected');
        }.bind(me, obj));
        connection.on('unselected', function (obj) {
            obj.path.shape.classList.remove('selected');
        }.bind(me, obj));
        me.don('click', obj.path.shape, function (obj) {
            viewport.selectionConnection(obj.connection)
        }.bind(me, obj), obj);

        connection.on('removed', function (obj) {
            me.svgrenderer.remove(obj.path);
            me.dun(obj);
            me.$connectioncache.removeWhere(function (x) { return x === obj; });
        }.bind(me, obj));

    },
    /**
     * Renders connections
     * @param {Object} canvas
     * @param {Object} ee
     * @param {Array} connections
     **/
    render: function (canvas, ee, connections, viewport) {
        var me = this;
        if (connections && connections.length && canvas && viewport) {
            var unrenderedconnections = connections.where(function (x) {
                return !me.$connectioncache.some(function (t) { return t.connection === x; })
            });
            var vp = viewport.getPosition();

            unrenderedconnections.foreach(function (connection) {
                var obj = {
                    connection: connection,
                    path: me.createPath(canvas).first()
                };
                me.addEventsToConnection(viewport, obj);
                me.$connectioncache.push(obj);
            });
            if (me.$connectioncache.length > 0) {
                me.$connectioncache.foreach(function (connectionObj) {
                    var connection = connectionObj.connection;
                    var path = connectionObj.path;
                    if (connection.$zones.length > 1) {
                        var dom = connection.$zones.first().$dom;
                        var dom2 = connection.$zones.second().$dom;
                        var pos = Dom.getRelativeSvgPosition(dom, canvas.parentElement, 'center');
                        var pos2 = Dom.getRelativeSvgPosition(dom2, canvas.parentElement, 'center');

                        if (!(MEPH.equals(path.options.start, pos) && MEPH.equals(path.options.end, pos2))) {
                            path.options.start = pos;
                            path.options.end = pos2;

                            me.svgrenderer.drawLine(path.options, path);
                            path.shape.parentNode.insertBefore(path.shape, path.shape.parentNode.firstChild);
                        }
                    }
                });
            }
        }
        else if (canvas && ee && !connections) {
            //render connection flow
            if (!me.connectionflowpath) {
                me.connectionflowpath = me.createPath(canvas).first();
                me.don('dblclick', me.connectionflowpath.shape, function () {
                    me.dun(me.connectionflowpath.shape);
                    t.viewport.onDblClick();
                }, me.connectionflowpath.shape);
            }

            var t = ee.first();
            var pos = Dom.getRelativeSvgPosition(t.zone.$dom, canvas.parentElement, 'center');

            me.connectionflowpath.options.start = t.start;
            me.connectionflowpath.options.end = pos;
            me.connectionflowpath.shape.classList.add('preconnection')
            me.svgrenderer.drawLine(me.connectionflowpath.options, me.connectionflowpath);
            if (me.connectionflowpath.shape.parentNode) {
                me.connectionflowpath.shape.parentNode.insertBefore(me.connectionflowpath.shape, me.connectionflowpath.shape.parentNode.firstChild);
            }
        }
    },
    clearFlow: function () {
        var me = this;
        if (me.connectionflowpath) {
            me.svgrenderer.remove(me.connectionflowpath);
            me.connectionflowpath = null;
        }
    },
    /**
     * Creates an svg path and adds it to the canvas.
     * @param {Object} canvas
     **/
    createPath: function (canvas, start, end) {
        var me = this;
        me.svgrenderer.setCanvas(canvas);
        return me.svgrenderer.draw({
            name: 'line',
            shape: MEPH.util.SVG.shapes.line,
            end: { x: 0, y: 0 },
            start: { x: 0, y: 0 },
            strokeStyle: "css",
            fill: "css",
            strokeWidth: me.controlpointstrokewidth,
            'class': 'connection'
        })
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