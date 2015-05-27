MEPH.define('MEPHControls.music.view.AudioNodes', {
    alias: 'mephcontrols_audionodes',
    templates: true,
    extend: 'MEPH.mobile.activity.container.Container',
    mixins: ['MEPH.mobile.mixins.Activity'],
    requires: ['MEPH.input.Number',
        'MEPH.audio.graph.node.Node',
        'MEPH.audio.graph.node.Convolver',
        'MEPH.audio.graph.node.BiquadFilter',
        'MEPH.audio.graph.node.AudioBufferSourceNode',
        'MEPH.audio.graph.node.ChannelMergerNode',
        'MEPH.audio.graph.node.ChannelSplitterNode',
        //'MEPH.audio.graph.node.CustomNode',
        'MEPH.audio.graph.node.DelayNode',
        'MEPH.audio.graph.node.DynamicsCompressorNode',
        'MEPH.audio.graph.node.GainNode',
        'MEPH.audio.graph.node.OscillatorNode',
        'MEPH.audio.graph.node.PannerNode',
        'MEPH.audio.graph.node.WaveShaperNode'],
    properties: {
        numberValue: 250,
        cposx: '4px'
    },
    initialize: function () {
        var me = this;
        me.callParent.apply(me, arguments);
        me.on('load', me.onLoaded.bind(me));
    },
    onLoaded: function () {
        var me = this;
        me.name = 'Audio Nodes';
    }
});