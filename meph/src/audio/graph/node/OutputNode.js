/**
 * @class MEPH.audio.graph.node.GainNode
 * @extend MEPH.audio.graph.node.Node
 **/
MEPH.define('MEPH.audio.graph.node.OutputNode', {
    extend: 'MEPH.audio.graph.node.InOutNodeBase',
    alias: 'outputnode',
    templates: true,
    properties: {
        manipulateInput: false
    },
    initialize: function () {
        var me = this;

        me.nodecontrols = me.nodecontrols || [];
        me.nodecontrols.push('bufferinput');

        me.great();

        me.nodeInputs.push(me.createInput('buffer', MEPH.audio.graph.node.Node.Anything));

    },
    onLoaded: function () {
        var me = this;
        me.great();
        me.title = 'Outputs(s)';

        me.fire('altered', { path: 'nodeOutputs' })
    }

});