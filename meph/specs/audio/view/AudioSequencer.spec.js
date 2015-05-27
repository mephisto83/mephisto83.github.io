describe("MEPH/audio/view/AudioSequencer.spec.js", 'MEPH.audio.Audio', 'MEPH.audio.Sequence', 'MEPH.audio.view.AudioSequencer', function () {
    var createSequence = function () {
        var sequence = new MEPH.audio.Sequence();
        var track1 = new MEPH.audio.Sequence();
        var audio = new MEPH.audio.Audio({ id: 'audio' });
        track1.add(audio, 1);
        track1.add(audio, 2);
        track1.add(audio, 3);
        sequence.add(track1, 1);
        sequence.add(track1, 4);
        sequence.add(track1, 7);
        sequence.add(track1, 10);
        return sequence;
    }
    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });

    it("can create a AudioSequencer", function () {
        //Arrange

        //Assert
        var audioSequencer = new MEPH.audio.view.AudioSequencer();

        expect(audioSequencer).toBeTruthy();

    });

    it('can render an audiosequencer', function (done) {
        MEPH.render('MEPH.audio.view.AudioSequencer', 'audiosequencer').then(function (r) {
            var results = r.res;
            var app = r.app;

            var dom,
                sequencer = results.first().classInstance;
            ///Assert
            dom = sequencer.getDomTemplate()[0]
            expect(dom).toBeTruthy();
            if (app) {
                app.removeSpace();
            }
        }).catch(function (error) {
            expect(error || new Error('did not render as expected')).caught();
        }).then(function () {
            done();
        })
    });

    it('can render an set a sequencer to the audiosequencer and render', function (done) {
        //Assert
        var audioSequencer = new MEPH.audio.view.AudioSequencer();
        var sequence = createSequence();
        audioSequencer.sequence = sequence;
        expect(audioSequencer).toBeTruthy();
        setTimeout(function () {
            expect(audioSequencer.source).toBeTruthy();
            done();
        }, 100);
    });

    it('the time function is setup on the audiosequencer', function () {
        var audiosequencer = new MEPH.audio.view.AudioSequencer();
        expect(audiosequencer.time.function).toBeTruthy();
    });

    it('the lane function is setup on the audiosequencer ', function () {
        var audiosequencer = new MEPH.audio.view.AudioSequencer();;
        expect(audiosequencer.lane.function).toBeTruthy();
    })

    it('the settimeFunc function is setup on the audiosequencer ', function () {
        var audiosequencer = new MEPH.audio.view.AudioSequencer();
        expect(audiosequencer.settime.function).toBeTruthy();
    });

    it('the lengthFunc function is setup on the audiosequencer', function () {
        var audiosequencer = new MEPH.audio.view.AudioSequencer();
        expect(audiosequencer.length.function).toBeTruthy();
    })

    it('the rowheader function is setup on the audiosequencer ', function () {
        var audiosequencer = new MEPH.audio.view.AudioSequencer();
        expect(audiosequencer.rowheader.function).toBeTruthy();
    })
    it('the columnheader function is setup on the audiosequencer', function () {
        var audiosequencer = new MEPH.audio.view.AudioSequencer();
        expect(audiosequencer.columnheader.function).toBeTruthy();
    })

    it('the leftheadersource is setup on the audiosequencer', function () {
        var audiosequencer = new MEPH.audio.view.AudioSequencer();
        expect(audiosequencer.leftheadersource).toBeTruthy();
    })

    it('the topheadersource is setup on the audiosequencer', function () {
        var audiosequencer = new MEPH.audio.view.AudioSequencer();
        expect(audiosequencer.topheadersource).toBeTruthy();
    })

    it('the rowheaders is setup on the audiosequencer', function () {
        var audiosequencer = new MEPH.audio.view.AudioSequencer();
        expect(audiosequencer.rowheaders).toBeTruthy();
    })


    it('the columnheaders is setup on the audiosequencer', function () {
        var audiosequencer = new MEPH.audio.view.AudioSequencer();
        expect(audiosequencer.columnheaders).toBeTruthy();
    })

    it('the time function can get the time of an item in the sequence', function () {
        var audiosequencer = new MEPH.audio.view.AudioSequencer();
        var sequence = createSequence();
        audiosequencer.sequence = sequence;
        var item = sequence.itemSequences().first();

        var time = audiosequencer.time.function(item);
        expect(time).toBe(1);
    });


    it('the lane function get the lane of an item in the sequence ', function () {
        var audiosequencer = new MEPH.audio.view.AudioSequencer();
        var sequence = createSequence();

        audiosequencer.sequence = sequence;
        var item = sequence.itemSequences().first();

        var item = audiosequencer.lane.function(item);

        expect(item).toBe(0);
    })

    it('the settime function get the lane of an item in the sequence ', function () {
        var audiosequencer = new MEPH.audio.view.AudioSequencer();
        var sequence = createSequence();

        audiosequencer.sequence = sequence;
        var item = sequence.itemSequences().first();

        var item = audiosequencer.settime.function(0, item);

        expect(item.relativeTimeOffset).toBe(0);
    });

    it('can setup a key press variable to execute a command', function (done) {
        MEPH.render('MEPH.audio.view.AudioSequencer', 'audiosequencer').then(function (r) {
            var results = r.res;
            var app = r.app, called;

            var sequencer = results.first().classInstance;
            sequencer.hovercells = [{ column: 0, row: 0 }]
            sequencer.addSequence = function () { called = true; }
            sequencer.setContextMenuOpenKey('t');

            sequencer.dispatchEvent('keypress', { which: 't'.charCodeAt(0) }, sequencer.canvas);

            expect(called).toBeTruthy();

            if (app) {
                app.removeSpace();
            }
        }).catch(function (error) {
            expect(error || new Error('did not render as expected')).caught();
        }).then(function () {
            done();
        });
    });

    it('can save a sequence to the audioresources', function (done) {
        MEPH.render('MEPH.audio.view.AudioSequencer', 'audiosequencer').then(function (r) {
            var results = r.res;
            var app = r.app, called;

            var sequencer = results.first().classInstance;

            sequencer.$inj = {
                audioResources: {
                    addSequence: function () {
                        called = true;
                    }
                }
            }

            sequencer.saveSequence();
            expect(called).toBeTruthy();
            if (app) {
                app.removeSpace();
            }
        }).catch(function (error) {
            expect(error || new Error('did not render as expected')).caught();
        }).then(function () {
            done();
        });
    });

    it('can create a new sequence', function (done) {
        MEPH.render('MEPH.audio.view.AudioSequencer', 'audiosequencer').then(function (r) {
            var results = r.res;
            var app = r.app, called;

            var sequencer = results.first().classInstance;
            var old = sequencer.sequence;

            sequencer.newSequence();
            expect(old !== sequencer.sequence).toBeTruthy();
            expect(sequencer.sequence instanceof MEPH.audio.Sequence).toBeTruthy();

            if (app) {
                app.removeSpace();
            }
        }).catch(function (error) {
            expect(error || new Error('did not render as expected')).caught();
        }).then(function () {
            done();
        });
    });

    it('can create a open sequence', function (done) {
        MEPH.render('MEPH.audio.view.AudioSequencer', 'audiosequencer').then(function (r) {
            var results = r.res;
            var app = r.app, called;

            var sequencer = results.first().classInstance;
            var old = sequencer.sequence;
            sequencer.$inj = {
                audioResources: {
                    getSequenceInstance: function () {
                        return old;
                    }
                }
            }
            sequencer.newSequence();
            sequencer.openSequence(old.id);
            expect(old === sequencer.sequence).toBeTruthy();
            expect(sequencer.sequence instanceof MEPH.audio.Sequence).toBeTruthy();

            if (app) {
                app.removeSpace();
            }
        }).catch(function (error) {
            expect(error || new Error('did not render as expected')).caught();
        }).then(function () {
            done();
        });
    });

});