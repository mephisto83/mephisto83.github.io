/**
 * @class MEPH.audio.graph.node.PannerNode
 * @extend MEPH.audio.graph.node.Node
 **/
MEPH.define('MEPH.audio.graph.node.PannerNode', {
    extend: 'MEPH.audio.graph.node.Node',
    alias: 'panner',
    templates: true,
    properties: {
        coneInnerAngleTitle: '',
        coneOuterAngleTitle: '',
        coneOuterGainTitle: '',
        refDistanceTitle: '',
        rolloffFactorTitle: '',
        panningModelTitle: '',
        distanceModelTypes: null,
        panningModelvalue: null,
        rolloffFactorvalue: null,
        refDistancevalue: null,
        coneOuterGainvalue: null,
        coneOuterAnglevalue: null,
        coneInnerAnglevalue: null
    },
    initialize: function () {
        var me = this;

        me.nodecontrols = me.nodecontrols || [];
        me.nodecontrols.push('bufferoutput');
        me.nodecontrols.push('bufferinput');
        me.nodecontrols.push('coneInnerAngle');
        me.nodecontrols.push('coneOuterAngle');
        me.nodecontrols.push('coneOuterGain');
        me.nodecontrols.push('refDistance');
        me.nodecontrols.push('maxDistance');
        me.nodecontrols.push('rolloffFactor');
        me.nodecontrols.push('panningModel');

        me.great();

        me.nodeInputs.push(me.createInput('buffer', MEPH.audio.graph.node.Node.AudioBuffer));
        me.nodeInputs.push(me.createInput('coneInnerAngle', MEPH.audio.graph.node.Node.Number));
        me.nodeInputs.push(me.createInput('coneOuterAngle', MEPH.audio.graph.node.Node.Number));
        me.nodeInputs.push(me.createInput('coneOuterGain', MEPH.audio.graph.node.Node.Number));
        me.nodeInputs.push(me.createInput('refDistance', MEPH.audio.graph.node.Node.Number));
        me.nodeInputs.push(me.createInput('maxDistance', MEPH.audio.graph.node.Node.Number));
        me.nodeInputs.push(me.createInput('rolloffFactor', MEPH.audio.graph.node.Node.Number));
        me.nodeInputs.push(me.createInput('panningModel', MEPH.audio.graph.node.Node.String, {
            values: ['equalpower', 'HRTF']
        }));

        me.distanceModelTypes = ['linear', 'inverse', 'exponential'];
        me.nodeInputs.push(me.createInput('distanceModel', MEPH.audio.graph.node.Node.String, {
            values: me.distanceModelTypes.select()
        }));


        me.nodeOutputs.push(me.createOutput('buffer', MEPH.audio.graph.node.Node.AudioBuffer));
         
    },
    onLoaded: function () {
        var me = this;
        me.great();

        me.title = 'Panner';
        me.distanceModelTypes = me.distanceModelTypes.select();
        me.coneInnerAngleTitle = 'cone inner angle';
        me.coneOuterAngleTitle = 'cone outer angle';
        me.coneOuterGainTitle = 'cone outer gain';
        me.refDistanceTitle = 'ref distance';
        me.rolloffFactorTitle = 'rolloff factor';
        me.panningModelTitle = 'panning model';
    }
});