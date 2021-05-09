
if (typeof (window) == "undefined") {
    window = self;
}
var document = "undefined";
// because its type is javascript/worker.
self.onmessage = function (e) {

    var data = e.data;
    switch (data.messageType) {
        case 'complete':
            delete (self.soundfontData);
            delete (window);
            break;
        case 'setdata':
            self.soundfontData = data.data.soundfont;
            self.postMessage({ messageType: 'dataset' });
            break;
        case 'init':
            var url = data.url;
            importScripts(url + '/script/utility/ArrayExt.js');
            importScripts(url + '/script/utility/class.js');
            importScripts(url + '/script/utility/file.js');
            importScripts(url + '/script/utility/Riff.js');

            var scripting = new script.utility.class({ relativeLocation: data.url + "/" });
            scripting.app("script.soundfont.app", {
                complete: function () {
                    self.postMessage({ messageType: 'ready' });
                    var app = new window.script.soundfont.app();
                    self.app = app;
                }
            });
            self.postMessage({
                messageType: 'message',
                message: 'msg from worker'
            });
            break;
        case 'getsoundfont':

            self.postMessage({
                messageType: 'message',
                message: 'getting sound font'
            });

            var soundfont = self.app.getSoundFont({ target: { result: self.soundfontData } });

            self.postMessage({
                messageType: 'message',
                message: 'got sound font'
            });

            self.soundFont = soundfont;

            self.postMessage({ messageType: 'gotSoundFont' });
            break;
        case 'getwavuri':

            self.postMessage({
                messageType: 'message',
                message: 'get wave uri'
            });
            var currentNote = data.currentNote;
            var velocity = data.velocity;
            self.postMessage({
                messageType: 'message',
                message: 'got wave uri'
            });
            var sample = self.app.getNoteSample({ file: self.soundFont }, currentNote, velocity);
            if (sample) {
                var wave = self.app.getWave(sample, currentNote);
                self.postMessage({
                    messageType: 'complete',
                    dataUri: wave.dataURI,
                    note: currentNote,
                    velocity: velocity
                });
            }
            delete (wave.dataURI);
            //currentNote, velocity
            break;
    }
};
// Rest of your worker code goes here. 