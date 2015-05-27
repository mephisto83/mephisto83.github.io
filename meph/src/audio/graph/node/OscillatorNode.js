/**
 * @class MEPH.audio.graph.node.OscillatorNode
 * @extend MEPH.audio.graph.node.Node
 **/
MEPH.define('MEPH.audio.graph.node.OscillatorNode', {
    extend: 'MEPH.audio.graph.node.Node',
    alias: 'oscillator',
    templates: true,
    properties: {
        detuneTitle: '',
        frequencyTitle: '',
        typefieldTitle: '',
        typesource: null,
        detunevalue: null,
        frequencyvalue: null,
        typeinputvalue: null
    },
    initialize: function () {
        var me = this;

        me.nodecontrols = me.nodecontrols || [];
        me.nodecontrols.push('bufferoutput');
        me.nodecontrols.push('frequency');
        me.nodecontrols.push('detune');
        me.nodecontrols.push('typeinput');

        me.great();

        me.typesource = ['sine', 'square', 'sawtooth', 'triangle', 'custom'];
        me.nodeInputs.push(me.createInput('buffer', MEPH.audio.graph.node.Node.AudioBuffer));
        me.nodeInputs.push(me.createInput('detune', MEPH.audio.graph.node.Node.Number, { path: 'detune.value' }));
        me.nodeInputs.push(me.createInput('frequency', MEPH.audio.graph.node.Node.Number, { path: 'frequency.value' }));
        me.nodeInputs.push(me.createInput('type', MEPH.audio.graph.node.Node.String, {
            values: me.typesource.select()
        }));

        me.nodeOutputs.push(me.createOutput('buffer', MEPH.audio.graph.node.Node.AudioBuffer)); 
    },
    onLoaded: function () {
        var me = this;
        me.great();
        me.typesource = me.typesource.select();
        me.title = 'Oscillator';
        me.typefieldTitle = 'type';
        me.detuneTitle = 'detune';;
        me.frequencyTitle = 'frequency';
    }
});