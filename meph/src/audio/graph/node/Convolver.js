/**
 * @class MEPH.control.Control
 * Defines a base class for all controls and views.
 **/
MEPH.define('MEPH.audio.graph.node.Convolver', {
    extend: 'MEPH.audio.graph.node.Node',
    alias: 'convolver',
    templates: true,
    injections: ['audioResources'],
    requires: ['MEPH.audio.graph.node.controls.Control'],
    properties: {
        normalizeinputvalue: null,
        audiobuffersources: null
    },
    initialize: function () {
        var me = this;

        me.nodecontrols = me.nodecontrols || [];
        me.nodecontrols.push('bufferoutput');
        me.nodecontrols.push('bufferinput');
        me.nodecontrols.push('normalize');
        me.nodecontrols.push('convobuffer');
        me.great();
        me.nodeInputs.push(me.createInput('buffer', MEPH.audio.graph.node.Node.AudioBuffer));
        me.nodeInputs.push(me.createInput('normalize', MEPH.audio.graph.node.Node.Boolean));
        me.nodeInputs.push(me.createInput('convobuffer', MEPH.audio.graph.node.Node.String, { path: 'buffer' }));
        me.nodeOutputs.push(me.createOutput('buffer', MEPH.audio.graph.node.Node.AudioBuffer));
    },
    onResourcesUpdated: function () {
        var me = this;
        me.audiobuffersources = me.audiobuffersources || MEPH.util.Observable.observable([]);
        if (me.audiobuffersources)
            me.audiobuffersources.clear();
        if (me.$inj.audioResources) {
            me.audiobuffersources.push.apply(me.audiobuffersources, me.$inj.audioResources.getResources(true));
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
        //me.inputsy = 0;
        me.title = 'Convolver';
        me.great();
    }
});