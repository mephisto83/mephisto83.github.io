ComposerCompanion.MusicDocument = function (tracks, entrys) {
    tracks = tracks || [];
    entrys = entrys || [];
    this.tracks = tracks.select(function (x, index) {
        return x.export();
    });
    this.entries = entrys.select(function (x, index) {
        return x.export();
    });
}

ComposerCompanion.MusicDocument.prototype = {
    load: function (document) {
        this.entries = document.entries;
        this.tracks = document.tracks;
    },
    getBankEntries: function () {
        return this.entries;
    },
    getTracks: function () {
        return this.tracks;
    },
    setData: function (tracks, entries) {
        tracks = tracks || [];
        entries = entries || [];
        this.tracks = tracks.select(function (x, index) {
            return x.export();
        });
        this.entries = entries.select(function (x, index) {
            return x.export();
        });
    }
};