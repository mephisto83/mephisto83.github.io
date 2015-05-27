describe("MEPH/audio/Scheduler.spec.js", 'MEPH.audio.Scheduler', 'MEPH.audio.graph.AudioGraphReader', 'MEPH.audio.Audio', 'MEPH.audio.Sequence', function () {
    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });
    var graph = { "id": "ada081e9-360f-4c39-8b94-f8ca0d5c06c5", "connections": [{ "id": "740813e5-673b-4db3-bff5-78549b6a6ae6", "nodes": ["e28cfcaa-ce0b-44b8-85ca-7418315446ad", "8ad18b2b-ffda-460b-9724-78db54114b2d"], "zones": ["2274edb3-f7ec-4654-b025-ade84eae0ca8", "62fa97c7-5c33-4426-a8b2-a06db42b361f"] }, { "id": "d1849e5c-b836-49cb-bbca-e88e4795ac70", "nodes": ["301704d3-123e-4978-beb5-94e6cc6576a5", "8ad18b2b-ffda-460b-9724-78db54114b2d"], "zones": ["fb2dab09-3cf4-4682-99c0-312799dc7d84", "badb8ae4-241e-4d4e-a82c-51d5266c752c"] }], "nodes": [{ "id": "8ad18b2b-ffda-460b-9724-78db54114b2d", "position": { "x": 315, "y": 69, "z": 0 }, "data": { "id": "3f9a25fa-5b99-4d0d-8d16-743f8a597838", "type": "MEPH.audio.graph.node.ChannelMergerNode", "nodeInputs": [{ "name": "buffer", "title": "buffer", "type": "AudioBuffer", "connector": null, "id": "62fa97c7-5c33-4426-a8b2-a06db42b361f", "options": { "count": 100 }, "output": false, "isOutput": false }, { "name": "buffer2", "title": "buffer2", "type": "AudioBuffer", "connector": null, "id": "badb8ae4-241e-4d4e-a82c-51d5266c752c", "options": null, "output": false, "isOutput": false }, { "name": "buffer3", "title": "buffer3", "type": "AudioBuffer", "connector": null, "id": "b9717c81-ada0-49f6-bc79-4bb624053f68", "options": null, "output": false, "isOutput": false }, { "name": "buffer4", "title": "buffer4", "type": "AudioBuffer", "connector": null, "id": "c13d3b8e-96cb-45f5-bd17-58206a5aac32", "options": null, "output": false, "isOutput": false }], "nodeOutputs": [{ "name": "buffer", "title": "buffer", "type": "AudioBuffer", "connector": null, "id": "1cf52d40-dd19-45ac-a670-662ca3a525e3", "output": true, "isOutput": false }] } }, { "id": "e28cfcaa-ce0b-44b8-85ca-7418315446ad", "position": { "x": 0, "y": 0, "z": 0 }, "data": { "id": "8735496f-bfbd-4d5d-ae19-812925b31abd", "type": "MEPH.audio.graph.node.OscillatorNode", "nodeInputs": [{ "name": "buffer", "title": "buffer", "type": "AudioBuffer", "connector": null, "id": "c76d48e0-2a78-47dd-bb25-da8cd084c442", "options": null, "output": false, "isOutput": false }, { "name": "detune", "title": "detune", "type": "Number", "connector": null, "id": "8c20a3e6-8604-4eec-a873-54db31c2f581", "options": { "path": "detune.value" }, "output": false, "isOutput": false }, { "name": "frequency", "title": "frequency", "type": "Number", "connector": null, "id": "4becae98-c6bb-40ea-8d73-a8db163de684", "options": { "path": "frequency.value" }, "output": false, "isOutput": false, "defaultValue": "535.71" }, { "name": "type", "title": "type", "type": "String", "connector": null, "id": "2365a498-87d8-4105-ba50-e1f419b50dba", "options": { "values": ["sine", "square", "sawtooth", "triangle", "custom"] }, "output": false, "isOutput": false }], "nodeOutputs": [{ "name": "buffer", "title": "buffer", "type": "AudioBuffer", "connector": null, "id": "2274edb3-f7ec-4654-b025-ade84eae0ca8", "output": true, "isOutput": false }] } }, { "id": "301704d3-123e-4978-beb5-94e6cc6576a5", "position": { "x": 0, "y": 222, "z": 0 }, "data": { "id": "132a8faa-a8c6-4140-950c-1c213372ec50", "type": "MEPH.audio.graph.node.OscillatorNode", "nodeInputs": [{ "name": "buffer", "title": "buffer", "type": "AudioBuffer", "connector": null, "id": "6b3ed9a4-ad45-407c-bafc-44b4a07652fa", "options": null, "output": false, "isOutput": false }, { "name": "detune", "title": "detune", "type": "Number", "connector": null, "id": "c45bbcaa-f84b-4e43-8a37-2270aa125bdd", "options": { "path": "detune.value" }, "output": false, "isOutput": false }, { "name": "frequency", "title": "frequency", "type": "Number", "connector": null, "id": "a03404dd-41c9-494b-a6e0-6179b8db7570", "options": { "path": "frequency.value" }, "output": false, "isOutput": false, "defaultValue": "1205.36" }, { "name": "type", "title": "type", "type": "String", "connector": null, "id": "973a13e1-be1f-4db2-891c-bf488be875d3", "options": { "values": ["sine", "square", "sawtooth", "triangle", "custom"] }, "output": false, "isOutput": false }], "nodeOutputs": [{ "name": "buffer", "title": "buffer", "type": "AudioBuffer", "connector": null, "id": "fb2dab09-3cf4-4682-99c0-312799dc7d84", "output": true, "isOutput": false }] } }] };
    var graph2 = { "id": "e7cb0d35-ca97-4e57-8424-84608641b69c", "connections": [{ "id": "21ecc05a-8e2c-4d5b-a7ee-ee1de3611a7d", "nodes": ["373dcee4-a968-47fa-a040-b496e083d8ea", "c4dcf81d-4769-4a67-905b-174ff424d7ad"], "zones": ["c4d120b6-d21c-47bd-969d-c7d80f4560a7", "c55fdc0f-81cc-426b-93e6-fdee29a981eb"] }, { "id": "8e55bef4-3a1e-4b48-b4de-66396e0392f0", "nodes": ["c4dcf81d-4769-4a67-905b-174ff424d7ad", "38d442b4-0324-4667-91df-ba516aec69f9"], "zones": ["e346b3d2-7693-43b1-aa42-6ace286ae4fd", "eb4043b6-71c8-4b89-a970-3df331ce07a3"] }], "nodes": [{ "id": "373dcee4-a968-47fa-a040-b496e083d8ea", "position": { "x": 31, "y": 112, "z": 0 }, "data": { "id": "1513b828-012b-4e64-8d48-2620e6bd097d", "type": "MEPH.audio.graph.node.OscillatorNode", "nodeInputs": [{ "name": "buffer", "title": "buffer", "type": "AudioBuffer", "connector": null, "id": "42ebd31f-aa63-4def-9839-472df395e6de", "options": null, "output": false, "isOutput": false }, { "name": "detune", "title": "detune", "type": "Number", "connector": null, "id": "1c286640-6d18-4b3c-96b7-ba58c829d291", "options": { "path": "detune.value" }, "output": false, "isOutput": false }, { "name": "frequency", "title": "frequency", "type": "Number", "connector": null, "id": "f9004888-b299-4287-9084-607576da143e", "options": { "path": "frequency.value" }, "output": false, "isOutput": false, "defaultValue": "4151.79" }, { "name": "type", "title": "type", "type": "String", "connector": null, "id": "c7597bcf-795d-4e1d-a861-5698ee81bae6", "options": { "values": ["sine", "square", "sawtooth", "triangle", "custom"] }, "output": false, "isOutput": false }], "nodeOutputs": [{ "name": "buffer", "title": "buffer", "type": "AudioBuffer", "connector": null, "id": "c4d120b6-d21c-47bd-969d-c7d80f4560a7", "output": true, "isOutput": false }] } }, { "id": "c4dcf81d-4769-4a67-905b-174ff424d7ad", "position": { "x": 328, "y": 49, "z": 0 }, "data": { "id": "6acbfaed-94a8-47b1-a279-f868df1c929f", "type": "MEPH.audio.graph.node.DynamicsCompressorNode", "nodeInputs": [{ "name": "buffer", "title": "buffer", "type": "AudioBuffer", "connector": null, "id": "c55fdc0f-81cc-426b-93e6-fdee29a981eb", "options": null, "output": false, "isOutput": false }, { "name": "attack", "title": "attack", "type": "Number", "connector": null, "id": "4e34e3ec-4e8d-4f64-82f1-6ef4d8ef1aea", "options": { "path": "attack.value" }, "output": false, "isOutput": false }, { "name": "knee", "title": "knee", "type": "Number", "connector": null, "id": "e17b2e5f-d60d-410c-b37a-d6223cd9f474", "options": { "path": "knee.value" }, "output": false, "isOutput": false }, { "name": "ratio", "title": "ratio", "type": "Number", "connector": null, "id": "c7b1cc74-b673-4896-bae2-f54fefcb3801", "options": { "path": "ratio.value" }, "output": false, "isOutput": false, "defaultValue": "16.79" }, { "name": "reduction", "title": "reduction", "type": "Number", "connector": null, "id": "fa9baae1-6fc5-44a5-be39-7111d667ce5e", "options": { "path": "reduction.value" }, "output": false, "isOutput": false, "defaultValue": "-16.07" }, { "name": "release", "title": "release", "type": "Number", "connector": null, "id": "b3567d4e-6eeb-4572-828c-9388c8156454", "options": { "path": "release.value" }, "output": false, "isOutput": false, "defaultValue": "0.36" }, { "name": "threshold", "title": "threshold", "type": "Number", "connector": null, "id": "24953a91-2972-4cda-a28c-af09dccca5da", "options": { "path": "threshold.value" }, "output": false, "isOutput": false, "defaultValue": "-69.64" }], "nodeOutputs": [{ "name": "buffer", "title": "buffer", "type": "AudioBuffer", "connector": null, "id": "e346b3d2-7693-43b1-aa42-6ace286ae4fd", "output": true, "isOutput": false }] } }, { "id": "38d442b4-0324-4667-91df-ba516aec69f9", "position": { "x": 593, "y": 56, "z": 0 }, "data": { "id": "54e5d4c8-c55c-4a3c-b630-eb1480d51e38", "type": "MEPH.audio.graph.node.BiquadFilter", "nodeInputs": [{ "name": "buffer", "title": "buffer", "type": "AudioBuffer", "connector": null, "id": "eb4043b6-71c8-4b89-a970-3df331ce07a3", "options": null, "output": false, "isOutput": false }, { "name": "q", "title": "q", "type": "Number", "connector": null, "id": "aeadc6d2-cd92-4840-8771-de3f23250753", "options": { "path": "Q.value" }, "output": false, "isOutput": false, "defaultValue": "44.6401" }, { "name": "frequency", "title": "frequency", "type": "Number", "connector": null, "id": "c43a9728-14f0-4c9f-800b-fdfdf8a92388", "options": { "path": "frequency.value" }, "output": false, "isOutput": false, "defaultValue": "133.93" }, { "name": "detune", "title": "detune", "type": "Number", "connector": null, "id": "707c60ee-a56c-4cdb-bd6b-b8f5a6fc17ed", "options": { "path": "detune.value" }, "output": false, "isOutput": false, "defaultValue": "147.32" }, { "name": "gain", "title": "gain", "type": "Number", "connector": null, "id": "f6af8b19-686b-4500-a788-c4d9b19dd51e", "options": { "path": "gain.value" }, "output": false, "isOutput": false, "defaultValue": "-30.71" }, { "name": "type", "title": "type", "type": "String", "connector": null, "id": "3eaaf589-af11-4bc9-8291-7df0f47a357f", "options": { "values": ["lowpass", "highpass", "bandpass", "lowshelf", "highshelf", "peaking", "notch", "allpass"] }, "output": false, "isOutput": false }], "nodeOutputs": [{ "name": "buffer", "title": "buffer", "type": "AudioBuffer", "connector": null, "id": "e242415f-d823-4507-9f8e-68820ebd42a0", "output": true, "isOutput": false }] } }] };

    var createSequence = function () {
        var sequence = new MEPH.audio.Sequence();
        [].interpolate(0, 10, function (i) {
            var s = new MEPH.audio.Sequence();
            var audio = new MEPH.audio.Audio();
            audio.duration(1);
            audio.oscillator({
                frequency: 440,
                detune: 10,
                type: 'sawtooth'
            });
            s.add(audio, i / 2);
            sequence.add(s, i)
        });
        return sequence;
    }
    var createSequence2 = function () {
        var sequence = new MEPH.audio.Sequence();
        [].interpolate(0, 2, function (i) {
            var s = new MEPH.audio.Sequence();
            var audio = new MEPH.audio.Audio();
            audio.duration(1);
            audio.oscillator({
                frequency: 440,
                detune: 10,
                type: 'sawtooth'
            });
            s.add(audio, i * 2);
            sequence.add(s, i)
        });
        return sequence;
    }
    var createSequence3 = function () {
        var sequence = new MEPH.audio.Sequence();
        var a = Math.log(2) / Math.log(12);
        [].interpolate(0, 2, function (i) {
            var s = new MEPH.audio.Sequence();
            var audio = new MEPH.audio.Audio();
            var f = Math.pow(2, (i) / 12) * 440;
            audio.duration(1);
            audio.oscillator({
                frequency: f,
                detune: 10,
                type: 'sawtooth'
            });
            audio.duration(.3);
            s.add(audio, i * 1.1);
            sequence.add(s, i)
        });
        return sequence;
    }
    var createSequence4 = function () {
        var reader = new MEPH.audio.graph.AudioGraphReader();
        var sequence = new MEPH.audio.Sequence();
        var a = Math.log(2) / Math.log(12);
        reader.setGraph(graph);
        [].interpolate(0, 5, function (i) {
            var s = new MEPH.audio.Sequence();
            var audio = reader.createAudio();
            audio.duration(1);

            s.add(audio, i * 1.1);
            sequence.add(s, i)
        });

        return sequence;
    }

    var createSequence5 = function () {
        var reader = new MEPH.audio.graph.AudioGraphReader();
        var sequence = new MEPH.audio.Sequence();
        var a = Math.log(2) / Math.log(12);
        reader.setGraph(graph2);
        [].interpolate(0, 5, function (i) {
            var s = new MEPH.audio.Sequence();
            var audio = reader.createAudio();
            audio.duration(1);
            s.add(audio, i * 1.1);
            sequence.add(s, i)
        });

        return sequence;
    }

    it('can create a Scheduler', function () {
        var scheduler = new MEPH.audio.Scheduler();
        expect(scheduler).toBeTruthy();
    });

    it('can set sequence to schedule', function () {
        var schedule = new MEPH.audio.Scheduler();
        schedule.sequence(createSequence());
        expect(schedule.sequence()).toBeTruthy();
    })
    it('can schedule audio nodes to play', function () {

        var scheduler = new MEPH.audio.Scheduler();
        var sequence = createSequence();
        scheduler.sequence(sequence);
        var toplay = scheduler.getAudio(0, 6);
        expect(scheduler).toBeTruthy();
        expect(toplay).toBeTruthy();
        expect(toplay.length).toBe(5);
    });


    it('can schedule scheduling incrementally ', function (done) {
        var tikked = 0;
        var scheduler = new MEPH.audio.Scheduler();
        scheduler.on('tick', function () {
            tikked++;
            if (tikked > 4) {
                expect(true).toBeTruthy();
                scheduler.stop();
                scheduler.terminate();
                done();
            }
        });
        scheduler.init().then(function () {
            scheduler.start();
        });
    });

    it('can start an oscillator ', function (done) {
        var audio = new MEPH.audio.Audio();
        audio.oscillator({
            frequency: 440,
            detune: 10,
            type: 'sawtooth'
        });
        audio.complete();
        var node = audio.get({ type: 'sawtooth' }).first();
        node.node.start(0);
        setTimeout(function () {
            node.node.stop();
            done();
        }, 1000)
    });


    it('can play a sequence ', function (done) {
        var schedule = new MEPH.audio.Scheduler();
        schedule.sequence(createSequence3());

        schedule.init().then(function () {
            schedule.play()
        }).catch(function (e) {
            schedule.stop();
            schedule.terminate();
            done();
            expect(e).caught();
        });
        schedule.on('complete', function () {
            schedule.stop();
            schedule.terminate();
            done();
        })
    });

    it('can play a sequence double input', function (done) {
        var schedule = new MEPH.audio.Scheduler();
        var sequencer = new MEPH.audio.Sequence();
        sequencer.add(createSequence4(), 0);
        sequencer.add(createSequence3(), 1);
        sequencer.add(createSequence5(), 0);
        schedule.sequence(sequencer);

        schedule.on('complete', function () {
            schedule.stop();
            schedule.terminate();
            done();
        })

        schedule.init().then(function () {
            schedule.play()
        }).catch(function (e) {
            schedule.stop();
            schedule.terminate();
            done();
            expect(e).caught();
        });

    });

    it('can render a sequence', function (done) {
        var schedule = new MEPH.audio.Scheduler();
        var sequencer = new MEPH.audio.Sequence();
        sequencer.add(createSequence4(), 0);
        sequencer.add(createSequence3(), 1);
        sequencer.add(createSequence5(), 0);
        schedule.sequence(sequencer);

        schedule.init().then(function () {
            return schedule.render().then(function (res) {
                expect(res.renderedBuffer).toBeTruthy();
                schedule.terminate();
            })
        }).catch(function (e) {
            schedule.terminate();
            expect(e).caught();
        }).then(done)

    });
});