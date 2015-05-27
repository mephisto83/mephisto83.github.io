/**
 * @class MEPH.audio.graph.node.DynamicsCompressorNode
 * @extend MEPH.audio.graph.node.Node
 **/
MEPH.define('MEPH.audio.graph.node.DynamicsCompressorNode', {
    extend: 'MEPH.audio.graph.node.Node',
    alias: 'dynamicscompressor',
    templates: true,
    properties: {
        attackTitle: '',
        kneeTitle: '',
        ratioTitle: '',
        reductionTitle: '',
        releaseTitle: '',
        thresholdTitle: '',
        attackvalue: null,
        kneevalue: null,
        ratiovalue: null,
        reductionvalue: null,
        releasevalue: null,
        thresholdvalue: null
    },
    initialize: function () {
        var me = this;

        me.nodecontrols = me.nodecontrols || [];
        me.nodecontrols.push('bufferoutput');
        me.nodecontrols.push('bufferinput');
        me.nodecontrols.push('attack');
        me.nodecontrols.push('knee');
        me.nodecontrols.push('release');
        me.nodecontrols.push('ratio');
        me.nodecontrols.push('reduction');
        me.nodecontrols.push('threshold');

        me.great();
        me.nodeInputs.push(me.createInput('buffer', MEPH.audio.graph.node.Node.AudioBuffer));
        me.nodeInputs.push(me.createInput('attack', MEPH.audio.graph.node.Node.Number, { path: 'attack.value' }));
        me.nodeInputs.push(me.createInput('knee', MEPH.audio.graph.node.Node.Number, { path: 'knee.value' }));
        me.nodeInputs.push(me.createInput('ratio', MEPH.audio.graph.node.Node.Number, { path: 'ratio.value' })); 
        me.nodeInputs.push(me.createInput('reduction', MEPH.audio.graph.node.Node.Number, { path: 'reduction.value' }));
        me.nodeInputs.push(me.createInput('release', MEPH.audio.graph.node.Node.Number, { path: 'release.value' }));
        me.nodeInputs.push(me.createInput('threshold', MEPH.audio.graph.node.Node.Number, { path: 'threshold.value' }));

        me.nodeOutputs.push(me.createOutput('buffer', MEPH.audio.graph.node.Node.AudioBuffer)); 
    },
    onLoaded: function () {
        var me = this;
        me.title = 'Dynamics Compressor';
        me.attackTitle = 'attack';
        me.kneeTitle = 'knee';
        me.ratioTitle = 'ratio';
        me.reductionTitle = 'reduction';
        me.releaseTitle = 'release';
        me.thresholdTitle = 'threshold';
        me.great();
    }
});