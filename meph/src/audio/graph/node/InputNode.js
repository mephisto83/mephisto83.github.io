/**
 * @class MEPH.audio.graph.node.GainNode
 * @extend MEPH.audio.graph.node.Node
 **/
MEPH.define('MEPH.audio.graph.node.InputNode', {
    extend: 'MEPH.audio.graph.node.InOutNodeBase',
    alias: 'inputnode',
    templates: true,
    properties: {
        manipulateInput: true
    },
    initialize: function () {
        var me = this;

        me.nodecontrols = me.nodecontrols || [];
        me.nodecontrols.push('bufferoutput');

        me.great();

        me.nodeOutputs.push(me.createOutput('buffer', MEPH.audio.graph.node.Node.Anything));

    },
    onLoaded: function () {
        var me = this;
        me.great();
        me.title = 'Input(s)';

        me.fire('altered', { path: 'nodeInputs' })
    }

});