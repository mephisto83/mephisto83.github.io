/**
 * @class MEPH.audio.Sequence
 * Defines a base class for an audio sequence.
 **/
MEPH.define('MEPH.audio.AudioTimer', {
    statics: {
        start: function (interval) {
            console.log("starting");
            if (MEPH.audio.AudioTimer.timerID) {
                clearInterval(MEPH.audio.AudioTimer.timerID);
            }
            MEPH.audio.AudioTimer.timerID = setInterval(function () {
                postMessage({ "tick": true });
            }, interval)
        },
        stop: function () {
            console.log("stopping");
            clearInterval(MEPH.audio.AudioTimer.timerID);
            MEPH.audio.AudioTimer.timerID = null;
            
        },
        interval: function (interval) {
            console.log("setting interval");
            console.log("interval=" + interval);
            if (timerID) {
                clearInterval(MEPH.audio.AudioTimer.timerID);
                MEPH.audio.AudioTimer.timerID = setInterval(function () {
                    postMessage({ "tick": true });
                }, interval)
            }
        }
    }

});