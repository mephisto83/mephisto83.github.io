/**
 * @class MEPH.audio.music.instrument.piano.GrandPiano
 * @extend MEPH.audio.music.instrument.Instrument
 * Defines a base class for instruments.
 **/
MEPH.define('MEPH.audio.music.instrument.piano.GrandPiano', {
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
            var resource = MEPH.audio.Audio.GetSourceBuffer().first(function (t) {
                return t.file === x.file;
            });
            var keysequence = new MEPH.audio.Sequence();
            var split = resource.file.split('.');
            var name = resource.file;
            var notegraph = me.createPianoNoteGraph(resource.id, name);
            keysequence.setDefaultGraph(notegraph.id);
            keysequence.midiNote(MEPH.audio.music.theory.Notes.convertToMidi(x.key));
            var prefix = 'MEPH.audio.music.instrument.piano.mp3.';
            prefix = MEPH.getClassPath(prefix)
            keysequence.title = name.split(prefix).last().split('.mp3').first();
            sequence.add(keysequence, 0);
        });
        sequence.title = 'Grand Piano';
        return sequence;
    },
    createPianoNoteGraph: function (id, name) {

        var graph = new MEPH.graph.Graph(),
            node,
            audiobuffer = new MEPH.audio.graph.node.AudioBufferSourceNode();
        
        node = new MEPH.graph.Node();
        node.setId(MEPH.GUID());
        audiobuffer.id = MEPH.GUID();
        audiobuffer.setNodeInputDefaultValue('source', id)
        node.appendData(audiobuffer);
        node.data = audiobuffer;
        graph.addNode(node);
        var result = graph.saveGraph();
        result.id = result.id || MEPH.GUID();
        result.name = name;
        audiobuffer.destroy();
        MEPH.publish(MEPH.audio.Constants.AUDIO_GRAPH_SAVED, result);
        return result;
    },
    getResourcesToLoad: function () {
        var me = this;
        var prefix = 'MEPH.audio.music.instrument.piano.mp3.';
        var files = [].interpolate(0, 8, function (x) {
            return {
                file: MEPH.getClassPath(prefix + 'A' + x) + '.mp3',
                key: 'A' + x,
                type: 'mp3'
            }
        }).concat([].interpolate(1, 8, function (x) {
            return {
                file: MEPH.getClassPath(prefix + 'Ab' + x) + '.mp3',
                key: 'Ab' + x,
                type: 'mp3'
            }
        })).concat([].interpolate(0, 8, function (x) {
            return {
                file: MEPH.getClassPath(prefix + 'B' + x) + '.mp3',
                key: 'B' + x, type: 'mp3'
            }
        })).concat([].interpolate(0, 8, function (x) {
            return {
                file: MEPH.getClassPath(prefix + 'Bb' + x) + '.mp3',
                key: 'Bb' + x,
                type: 'mp3'
            }
        })).concat([].interpolate(1, 9, function (x) {
            return {
                file: MEPH.getClassPath(prefix + 'C' + x) + '.mp3',
                key: 'C' + x,
                type: 'mp3'
            }
        })).concat([].interpolate(1, 8, function (x) {
            return {
                file: MEPH.getClassPath(prefix + 'D' + x) + '.mp3',
                key: 'D' + x, type: 'mp3'
            }
        })).concat([].interpolate(1, 9, function (x) {
            return {
                file: MEPH.getClassPath(prefix + 'Db' + x) + '.mp3',
                key: 'Db' + x, type: 'mp3'
            }
        })).concat([].interpolate(1, 8, function (x) {
            return {
                file: MEPH.getClassPath(prefix + 'E' + x) + '.mp3',
                key: 'E' + x, type: 'mp3'
            }
        })).concat([].interpolate(1, 8, function (x) {
            return {
                file: MEPH.getClassPath(prefix + 'Eb' + x) + '.mp3',
                key: 'Eb' + x, type: 'mp3'
            }
        })).concat([].interpolate(1, 8, function (x) {
            return {
                file: MEPH.getClassPath(prefix + 'F' + x) + '.mp3',
                key: 'F' + x, type: 'mp3'
            }
        })).concat([].interpolate(1, 8, function (x) {
            return {
                file: MEPH.getClassPath(prefix + 'G' + x) + '.mp3',
                key: 'G' + x, type: 'mp3'
            }
        })).concat([].interpolate(1, 8, function (x) {
            return {
                key: 'Gb' + x,
                file: MEPH.getClassPath(prefix + 'Gb' + x) + '.mp3',
                type: 'mp3'
            }
        }));

        return files.orderBy(function (x, y) {
            return MEPH.audio.music.theory.Notes.convertToMidi(x.key) -
                        MEPH.audio.music.theory.Notes.convertToMidi(y.key)
        });;
    }
})