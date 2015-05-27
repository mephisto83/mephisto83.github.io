//MEPH.audio.graph.node.SequenceNode
/**
 * @class MEPH.audio.graph.node.SequenceNode
 * @extend MEPH.audio.graph.node.Node
 **/
MEPH.define('MEPH.audio.graph.node.SequenceNode', {
    extend: 'MEPH.audio.graph.node.Node',
    alias: 'sequencenode',
    templates: true,
    properties: {
        sequenceTitle: '',
        sequences: null
    },
    initialize: function () {
        var me = this;

        me.nodecontrols = me.nodecontrols || [];
        me.nodecontrols.push('bufferinput');
        me.nodecontrols.push('bufferoutput');

        me.sequences = me.sequences || MEPH.util.Observable.observable([]);
        me.great();

        me.nodeInputs.push(me.createInput('buffer', MEPH.audio.graph.node.Node.AudioBuffer));
        me.nodeOutputs.push(me.createOutput('buffer', MEPH.audio.graph.node.Node.AudioBuffer));

    },
    onLoaded: function () {
        var me = this;
        me.great();

        me.sequences = me.sequences || MEPH.util.Observable.observable([]);

        me.title = 'Sequence';
        me.sequenceTitle = 'sequence'

    }
});