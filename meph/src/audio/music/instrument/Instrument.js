/**
 * @class MEPH.audio.music.instrument.Instrument
 * Defines a base class for instruments.
 **/
MEPH.define('MEPH.audio.music.instrument.Instrument', {
    requires: ['MEPH.audio.Audio'],
    properties: {
        $audios: null,
        $resources: null
    },
    initialize: function () {
        var me = this;
        me.$resources = [];
        me.$audios = [];
    },
    resources: function () {
        var me = this;
        return me.$resources;
    },
    ready: function (option) {
        var me = this,
            toload = me.getResourcesToLoad();
        return Promise.all(toload.select(function (x) {
            var audio = new MEPH.audio.Audio();
            me.$audios.push(audio);
            me.$resources.push({
                file: x.file,
                type: x.type,
                key: x.key
            });
            return audio.load(x.file, x.type, option);
        })).then(function () {
            return true;
        })['catch'](function (e) {
            MEPH.Log(e);
            return false;
        });
    },
    getResourcesToLoad: function () {
        return [];
    }
})