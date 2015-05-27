/**
* @class MEPH.graph.Graph
* Creates a graph.
*/
MEPH.define('MEPH.graph.SVGGraph', {
    extend: 'MEPH.graph.Graph',
    initialize: function () {
        var me = this;
        me.great();
        me.on('nodeadded', function (type, evtfunc, args) {

            args.added.foreach(function (x) {
                //                me.setBlenderSVGID(x);
                x.$data.setupActiveZones(me.$viewport, x);
                x.$data.graph = x.$data.graph || me;
            });
        })
    },
    /**
     * Loads a graph from a json string.
     * @param {String} result
     * @param {Object} control
     * @return {Promise}
     **/
    load: function (result, control) {
        var me = this;
        result = JSON.parse(result);

        me.clear();
        var svg = me.$viewport.getGCanvas();
        return Promise.all(result.nodes.select(function (nodeinfo) {
            return control.renderControl(nodeinfo.data.type, svg, control).then(function (t) {
                var res = t.first();
                node = new MEPH.graph.Node();
                node.setId(nodeinfo.id);
                node.appendData(res.classInstance);
                res.classInstance.nodeInputs.clear();
                res.classInstance.nodeOutputs.clear();
                nodeinfo.data.nodeInputs.foreach(function (x) { res.classInstance.nodeInputs.push(x); });
                nodeinfo.data.nodeOutputs.foreach(function (x) { res.classInstance.nodeOutputs.push(x); });
                control.addNode(node);
                node.setPosition(nodeinfo.position.x, nodeinfo.position.y, nodeinfo.position.z);
                res.classInstance.applyNodeInputsAndOutputs();
                return node;
            })
        })).then(function (nodes) {

            me.$loadedGraph = result;

            var connections = result.connections.select(function (connection) {
                var newconnection = new MEPH.graph.Connection();
                newconnection.setId(connection.id);
                nodes.where(function (x) {
                    return connection.nodes.contains(function (y) { return y == x.getId(); })
                })
                .foreach(function (x) {
                    newconnection.addNodes(x);
                });;
                newconnection.getNodes().foreach(function (x) {
                    x.getZones().where(function (z) {
                        return connection.zones.contains(z.getOptions().id);
                    }).foreach(function (zones) {
                        newconnection.addZone(zones);
                    });;
                });
                me.addConnection(newconnection)
            });
        });
    }
});