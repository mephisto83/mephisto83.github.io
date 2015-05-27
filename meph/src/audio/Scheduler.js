/**
 * @class MEPH.audio.Sequence
 * Defines a base class for an audio sequence.
 **/
MEPH.define('MEPH.audio.Scheduler', {
    requires: ['MEPH.audio.Sequence',
                'MEPH.audio.Audio',
                'MEPH.query.QueryableWorker'],
    properties: {
        $sequence: null,
        $queryWorker: null,
        playWindow: 200,
        interval: 50,
        bpm: 75 / 16 / 60,
        playing: false
    },
    initialize: function (args) {
        var me = this;
        MEPH.Events(me);

        if (args && args.init) {
            me.init();
        }
    },
    get: function (from, duration) {
        var me = this;
        return me.sequence().getScheduledAudio(from, duration);
    },
    getAudio: function (from, duration) {
        var me = this;
        me.orderedSequence = me.sequence().getAudioWithAbsoluteTime();
        return me.orderedSequence.where(function (x) {
            return x.absoluteTime * me.bpm >= from &&
                x.absoluteTime * me.bpm <= (duration * me.bpm + from)
        }).orderBy(function (x, y) {
            return x.absoluteTime - y.absoluteTime;
        });
    },
    /**
     * Renderse the sequence.
     **/
    render: function () {
        var me = this, started;
        if (!me.sequence()) return;
        var sequencetime = (me.sequence().duration() || 0);
        var duration = sequencetime * me.bpm;
        var samplerate = 48000,
            audioduration;
        me.sequence().setMode(true);
        MEPH.audio.Audio.OfflineMode = true;
        MEPH.audio.Audio.OfflineAudioContext = new OfflineAudioContext(2, samplerate * duration, samplerate);
        var audios = me.getAudio(0, sequencetime);

        if (started === undefined) {
            started = 0;
        }
        audios.foreach(function (audio) {
            var time = me.sequence().getAbsoluteTime(audio) * me.bpm;

            audio.getAudio().complete();
            audio.getAudio().play(time + started);
            audioduration = audio.getAudio().duration();
            if (audioduration !== null) {
                audio.getAudio().stop(time + started + (audioduration * me.bpm));
            }
        });
        var toresolve;
        var promise = new Promise(function (x, f) {
            toresolve = x;
        });
        MEPH.audio.Audio.OfflineAudioContext.oncomplete = function (e) {
            toresolve(e);
        }
        MEPH.audio.Audio.OfflineAudioContext.startRendering();
        return promise;
    },
    /**
     * Plays the scheduler.
     ***/
    play: function () {
        var me = this, played = [], started;
        if (!me.sequence()) return;
        MEPH.audio.Audio.OfflineMode = false;
        var lasttime = (me.sequence().duration() || 0) * me.bpm;
        var sequencetime = (me.sequence().duration() || 0);
        var items = me.getAudio(0, sequencetime);
        me.sequence().setMode(false);

        me.on('tick', function () {
            var currentTime = MEPH.audio.Audio.GetContext().currentTime;
            if (started === undefined) {
                started = currentTime;
                lasttime += started;
            }
            var audioduration;
            items = items.where(function (t) { return played.indexOf(t) === -1; })
            items.foreach(function (audio) {
                var time = me.sequence().getAbsoluteTime(audio) * me.bpm;

                audio.getAudio().complete();
                audio.getAudio().play(time + started);
                audioduration = audio.getAudio().duration();
                if (audioduration !== null) {
                    audio.getAudio().stop(time + started + (audioduration * me.bpm));
                }
                played.push(audio);
            });
            if (lasttime < currentTime && me.playing) {
                me.fire('complete', { currentTime: currentTime });

                me.stop();
            }
        }, 'play')
        me.start();
        me.playing = true;
    },
    /**
     * Initializes a scheduler.
     **/
    init: function () {
        var me = this;
        me.$queryWorker = new MEPH.query.QueryableWorker();
        return me.$queryWorker.ready().then(function (q) {
            return q.load('MEPH.audio.AudioTimer')
        });
    },
    start: function () {
        var me = this;
        if (me.playing) return;
        me.$queryWorker.message(function () {
            MEPH.audio.AudioTimer.start(1000);
        }, [], function (message) {
            if (message.data && message.data.tick) {
                me.fire('tick', true);
            }
        })
    },
    stop: function () {
        var me = this;
        if (!me.playing) return;
        me.$queryWorker.message(function () {
            MEPH.audio.AudioTimer.stop();
        }, [], function (message) {
        });

        me.un(null, 'play');
        me.playing = false;
    },
    terminate: function () {
        var me = this;
        me.$queryWorker.terminate();
    },
    sequence: function (s) {
        if (s instanceof MEPH.audio.Sequence) {
            this.$sequence = s;
        }
        return this.$sequence;
    }
});