/**
* @class MEPH.graph.Graph
* Creates a graph.
*/
MEPH.define('MEPH.graph.ConnectionHandler', {
    requires: ['MEPH.graph.Connection'],
    properties: {
    },
    initialize: function () {
    },
    setGraph: function (graph) {
        var me = this;
        me.$graph = graph;
    },
    getGraph: function () {
        var me = this;
        return me.$graph;
    },
    generateConnection: function () {
        var connection = new MEPH.graph.Connection();
        return connection;
    },
    createConnection: function (zones) {
        try {
            var me = this,
                connection = me.generateConnection();
            zones.foreach(function (x, index) {
                connection.addZone(x);
                connection.addNode(x.getNode());
                x.getNode().addConnection(connection);
            })
            var graph = me.getGraph();
            if (graph) {
                graph.addConnection(connection);
            }
        }
        catch (e) {
            return false;
        }
        return connection;
    }
});