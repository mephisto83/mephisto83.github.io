/**
 * @class MEPH.audio.graph.node.DelayNode
 * @extend MEPH.audio.graph.node.Node
 **/
MEPH.define('MEPH.audio.graph.node.DelayNode', {
    extend: 'MEPH.audio.graph.node.Node',
    alias: 'delay',
    templates: true,
    properties: {
        delayTimeTitle: '',
        delayTimevalue: null
    },
    initialize: function () {
        var me = this;

        me.nodecontrols = me.nodecontrols || [];
        me.nodecontrols.push('bufferoutput');
        me.nodecontrols.push('bufferinput');
        me.nodecontrols.push('delayTime');

        me.great();
        me.nodeInputs.push(me.createInput('buffer', MEPH.audio.graph.node.Node.AudioBuffer));
        me.nodeInputs.push(me.createInput('delayTime', MEPH.audio.graph.node.Node.Number, { path: 'delayTime.value' }));
        me.nodeOutputs.push(me.createOutput('buffer', MEPH.audio.graph.node.Node.AudioBuffer)); 
    },
    onLoaded: function () {
        var me = this;
        me.great();
        me.title = 'Delay';

        me.delayTimeTitle = 'delay';

    }
});