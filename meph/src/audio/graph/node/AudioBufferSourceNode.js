/**
 * @class MEPH.audio.graph.node.AudioBufferSourceNode
 * @extend MEPH.audio.graph.node.Node
 **/
MEPH.define('MEPH.audio.graph.node.AudioBufferSourceNode', {
    extend: 'MEPH.audio.graph.node.Node',
    requires: ['MEPH.audio.Audio', 'MEPH.audio.AudioResources'],
    alias: 'audiobuffersource',
    templates: true,
    injections: ['audioResources'],
    properties: {
        loopTitle: 'Q',
        loopEndTitle: 'loop',
        loopStartTitle: 'detune',
        playbackRateTitle: 'gain',
        sourceTitle: '',
        sourcevalue: null,
        loopvalue: null,
        loopEndvalue: null,
        loopStartvalue: null,
        playbackRatevalue: null,
        audiobuffersources: null
    },
    initialize: function () {
        var me = this;
        me.nodecontrols = me.nodecontrols || [];
        me.nodecontrols.push('bufferoutput');
        me.nodecontrols.push('sourceinput');
        me.nodecontrols.push('loop');
        me.nodecontrols.push('loopEnd');
        me.nodecontrols.push('loopStart');
        me.nodecontrols.push('playbackRate');
        me.great();
        me.nodeInputs.push(me.createInput('source', MEPH.audio.graph.node.Node.String));
        me.nodeInputs.push(me.createInput('loop', MEPH.audio.graph.node.Node.Boolean));
        me.nodeInputs.push(me.createInput('loopEnd', MEPH.audio.graph.node.Node.Number));
        me.nodeInputs.push(me.createInput('loopStart', MEPH.audio.graph.node.Node.Number));
        me.nodeInputs.push(me.createInput('playbackRate', MEPH.audio.graph.node.Node.Number, { path: 'playbackRate.value' }));
        me.nodeOutputs.push(me.createOutput('buffer', MEPH.audio.graph.node.Node.AudioBuffer));
    },
    onResourcesUpdated: function () {
        var me = this;
        me.audiobuffersources = me.audiobuffersources || MEPH.util.Observable.observable([]);
        if (me.audiobuffersources)
            me.audiobuffersources.clear();
        if (me.$inj.audioResources) {
            me.audiobuffersources.push.apply(me.audiobuffersources, me.$inj.audioResources.getResources());
        }
    },
    onInjectionsComplete: function () {
        var me = this;
        me.onResourcesUpdated();
    },
    onLoaded: function () {
        var me = this;
        me.audiobuffersources = MEPH.util.Observable.observable([]);
        me.subscription(MEPH.subscribe(MEPH.audio.AudioResources.RESOURCE_MANAGER_UPDATE, me.onResourcesUpdated.bind(me)));
        me.onResourcesUpdated();
        me.great();
        me.title = 'Audio Buffer Source';
        me.hideConnector = true;
        me.sourceTitle = 'source';
        me.loopTitle = 'loop';
        me.loopEndTitle = 'loop end';
        me.loopStartTitle = 'loop start';
        me.playbackRateTitle = 'playback rate';
    }
});