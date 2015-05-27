/**
 * @class MEPH.audio.graph.node.GainNode
 * @extend MEPH.audio.graph.node.Node
 **/
MEPH.define('MEPH.audio.graph.node.GainNode', {
    extend: 'MEPH.audio.graph.node.Node',
    alias: 'gain',
    templates: true,
    properties: {
        gainTitle: '',
        gainvalue: null
    },
    initialize: function () {
        var me = this;

        me.nodecontrols = me.nodecontrols || [];
        me.nodecontrols.push('bufferoutput');
        me.nodecontrols.push('bufferinput');
        me.nodecontrols.push('gain');

        me.great();
        me.nodeInputs.push(me.createInput('buffer', MEPH.audio.graph.node.Node.AudioBuffer));
        me.nodeInputs.push(me.createInput('gain', MEPH.audio.graph.node.Node.Number, { path: 'gain.value' }));

        me.nodeOutputs.push(me.createOutput('buffer', MEPH.audio.graph.node.Node.AudioBuffer));
         
    },
    onLoaded: function () {
        var me = this;
        me.great();
        me.title = 'Gain';

        me.gainTitle = 'Volume';

    }

});