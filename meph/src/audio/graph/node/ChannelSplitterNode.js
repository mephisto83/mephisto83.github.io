/**
 * @class MEPH.audio.graph.node.ChannelSplitterNode
 * @extend MEPH.audio.graph.node.Node
 **/
MEPH.define('MEPH.audio.graph.node.ChannelSplitterNode', {
    extend: 'MEPH.audio.graph.node.Node',
    alias: 'channelsplitter',
    templates: true,
    properties: {
    },
    initialize: function () {
        var me = this;

        me.nodecontrols = me.nodecontrols || [];
        me.nodecontrols.push('bufferoutput');
        me.nodecontrols.push('buffer2output');
        me.nodecontrols.push('buffer3output');
        me.nodecontrols.push('buffer4output');
        me.nodecontrols.push('bufferinput');

        me.great();
        me.nodeInputs.push(me.createInput('buffer', MEPH.audio.graph.node.Node.AudioBuffer));
        me.nodeOutputs.push(me.createOutput('buffer', MEPH.audio.graph.node.Node.AudioBuffer));
        me.nodeOutputs.push(me.createOutput('buffer2', MEPH.audio.graph.node.Node.AudioBuffer));
        me.nodeOutputs.push(me.createOutput('buffer3', MEPH.audio.graph.node.Node.AudioBuffer));
        me.nodeOutputs.push(me.createOutput('buffer4', MEPH.audio.graph.node.Node.AudioBuffer)); 
    },
    onLoaded: function () {
        var me = this;
        me.great();
        me.buffer2output.left = false;
        me.buffer3output.left = false;
        me.buffer4output.left = false;
        me.title = 'Channel Splitter';

    }
});