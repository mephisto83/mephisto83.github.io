/**
* @class MEPH.graph.Node
*/
MEPH.define('MEPH.graph.Connection', {
    requires: ['MEPH.math.Vector'],
    properties: {
        $connectionDetectionDepth: 10,
        $selectable: true,
        $deleteable: true
    },
    isSelectable: function (selectable) {
        var me = this;
        if (selectable !== undefined) {
            me.$selectable = selectable;
        }
        return me.$selectable;
    },
    isDeleteable: function (deleteable) {
        var me = this;
        if (deleteable !== undefined) {
            me.$deleteable = deleteable;
        }
        return me.$deleteable;
    },
    initialize: function (options) {
        var me = this;
        MEPH.Events(me);
        me.$zones = [];
        me.nodes = MEPH.util.Observable.observable([])
            .on('afterpush', me.handleNewNodes.bind(me))
            .on('beforepush', me.fire.bind(me, 'beforenodeadded'))
            .on('afterpush', me.fire.bind(me, 'afternodeadded'))
            .on('onpush', me.fire.bind(me, 'nodeadded'))
            .on('onpush', me.fire.bind(me, 'changed'))
            .on('beforesplice', me.fire.bind(me, 'beforenoderemoved'))
            .on('aftersplice', me.fire.bind(me, 'afternoderemoved'))
            .on('onremove', me.fire.bind(me, 'noderemoved'))
            .on('onremove', me.fire.bind(me, 'changed'));
    },
    handleNewNodes: function (type, anodes) {
        var me = this, nodes = [];
        for (var i = 0 ; i < anodes.added.length ; i++) {
            if (nodes.indexOf(anodes.added[i]) === -1) {
                nodes.push(anodes.added[i]);
            }
        }
        if (nodes) {
            nodes.foreach(function (node) {
                node.addConnection(me);
                node.on('removed', me.onNodeRemoved.bind(me, node));
            });
        }
    },
    removed: function () {
        var me = this;
        me.fire('removed', {});
    },
    /**
    * Selects a zone, Override this function for business logic to control which point should be 
    * selected.
    */
    selectZones: function (zones, node) {
        var me = this;
        return me.getZones().where(function (zone) {
            return zone.getNode() === node;
        });
    },
    onNodeRemoved: function (node) {
        var me = this;
        me.removeNode(node);
    },
    setConnectionDetectionDepth: function (depth) {
        var me = this;
        me.$connectionDetectionDepth = depth;
    },
    getConnectionDetectionDepth: function () {
        var me = this;
        return me.$connectionDetectionDepth;
    },
    distanceFrom: function (point) {
        var me = this;
        var target = Vector.Create(point);
        var nodeendpoints = me.calculateEndPoints(me);
        return nodeendpoints.min(function (x) {
            var start = Vector.Create(x.start);
            var end = Vector.Create(x.end);

            var depth = me.getConnectionDetectionDepth();
            return [].interpolate(0, depth, function (t) {
                return Vector.Lerp2D(start, end, t / depth).distance(target);
            }).min();
        });
    },
    calculateEndPoints: function (connection) {
        var me = this;
        var offset = { x: 0, y: 0 };
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
    setId: function (id) {
        var me = this;
        if (!me.$id) {
            me.$id = id;
        }
    },
    getId: function () {
        var me = this;
        return me.$id;
    },
    addNodes: function (nodes) {
        var me = this;
        if (!Array.isArray(nodes)) {
            nodes = [nodes];
        }
        nodes.foreach(function (node) {
            me.nodes.push(node);
        });
    },
    addZone: function (zone) {
        var me = this;
        var node = zone.getNode();
        if (!me.$zones.first(zone)) {
            me.$zones.push(zone);
        }
    },
    getZones: function () {
        var me = this;
        return me.$zones;
    },
    save: function () {
        var me = this, result = {};
        result.id = me.getId() || me.setId(MEPH.GUID()) || me.getId();
        result.nodes = me.getNodes().select(function (node) { return node.getId(); });
        result.zones = me.getZones().select(function (zone) { return zone.getOptions().id; });
        return result;
    },
    hasZone: function (zone) {
        var me = this;
        return me.getZones().contains(function (x) { return x === zone; });
    },
    hasNode: function (node) {
        var me = this;
        return me.nodes.contains(function (x) { return x === node; })
    },
    addNode: function (node) {
        var me = this;
        if (!me.nodes.contains(function (x) { return x === node; })) {
            me.nodes.push(node);
        }
    },
    getNode: function (node) {
        var me = this;
        return me.nodes.first(function (x) { return x === node; });
    },
    getNodes: function () {
        var me = this;
        return me.nodes;
    },
    removeNode: function (node) {
        var me = this;
        var results = me.nodes.removeWhere(function (x) { return x === node; });
        if (me.nodes.length < 2) {
            me.fire('emptyconnection', me);
        }
    }
});