/**
 * @class MEPH.audio.music.instrument.piano.Trumpet
 * @extend MEPH.audio.music.instrument.Instrument
 * Defines a base class for instruments.
 **/
MEPH.define('MEPH.audio.music.instrument.trumpet.Trumpet', {
    extend: 'MEPH.audio.music.instrument.Instrument',
    requires: ['MEPH.audio.Sequence',
        'MEPH.graph.Graph',
        'MEPH.audio.music.theory.Notes',
        'MEPH.graph.Node',
        'MEPH.audio.Constants',
        'MEPH.audio.graph.node.AudioBufferSourceNode'],
    createSequence: function () {
        var me = this,
          sequence = new MEPH.audio.Sequence();
        me.resources().foreach(function (x) {
           
        });
        sequence.title = 'Trumpet';
        return sequence;
    },
    getResourcesToLoad: function () {
        var me = this;
        var prefix = 'MEPH.audio.music.instrument.trumpet.Trumpet';
        var files = [{
            file: MEPH.getClassPath(prefix) + '.sf2',
            type: 'audio'
        }];

        return files;
    }
});