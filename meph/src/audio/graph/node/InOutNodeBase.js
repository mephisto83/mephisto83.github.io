/**
 * @class MEPH.audio.graph.node.GainNode
 * @extend MEPH.audio.graph.node.Node
 **/
MEPH.define('MEPH.audio.graph.node.InOutNodeBase', {
    extend: 'MEPH.audio.graph.node.Node',
    requires: ['MEPH.audio.graph.node.controls.InputCollection'],
    templates: false,
    properties: {
        manipulateInput: false
    },
    //initialize: function () {
    //    var me = this;

    //    me.nodecontrols = me.nodecontrols || [];
    //    me.nodecontrols.push('bufferoutput');

    //    me.great();

    //    me.nodeOutputs.push(me.createOutput('buffer', MEPH.audio.graph.node.Node.Anything));

    //},
    setupActiveZones: function (viewport, node) {
        var me = this;
        node.on('connectionadded', me.onNodeChanged.bind(me));
        return me.great();
    },
    onConnectionChanged: function (connection, type, type2, args) {

        var me = this;
        me.onNodeChanged(type, type2, { added: [connection] });
    },
    onNodeChanged: function (type, type2, args) {
        var me = this;


        args.added.where(function (connection) {
            connection.un(me);
            connection.on('changed', me.onConnectionChanged.bind(me, connection), me);
            return connection.getZones().length > 1
        }).foreach(function (connection) {
            var zone = connection.getZones().first(function (x) {
                return x.getOptions().connectortype !== 'Anything'
            });
            if (zone) {
                if (me.manipulateInput) {
                    var res = me.addNodeInput(zone.getOptions().property, zone.getOptions().connectortype, zone.getOptions().id);
                    if (res) {
                        connection.on('removed', function () {
                            me.removeNodeInput(res);
                        });
                    }
                }
                else {
                    var res = me.addNodeOutput(zone.getOptions().property, zone.getOptions().connectortype, zone.getOptions().id);
                    if (res) {
                        connection.on('removed', function () {
                            me.removeNodeOutput(res);
                        });
                    }
                }
            }
        });

    },
    onLoaded: function () {
        var me = this;
        me.great();
        me.title = 'Input(s)';

        me.fire('altered', { path: 'nodeOutputs' })
    }

});