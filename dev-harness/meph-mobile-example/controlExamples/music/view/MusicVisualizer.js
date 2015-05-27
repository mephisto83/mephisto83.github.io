MEPH.define('MEPHControls.music.view.MusicVisualizer', {
    alias: 'mephcontrols_visualizer',
    templates: true,
    extend: 'MEPH.mobile.activity.container.Container',
    mixins: ['MEPH.mobile.mixins.Activity'],
    injections: ['audioResources'],
    requires: ['MEPH.mobile.activity.view.ActivityView',
        'MEPH.file.Dropbox',
        'MEPH.audio.Audio',
        'MEPH.list.List',
        'MEPH.util.Dom',
        'MEPH.input.Range',
        'MEPH.audio.view.Visualizer',
        'MEPH.audio.view.VisualSelector'],
    properties: {
        name: null,
        data: null,
        verticalScroll: 0
    },
    scripts: ['MEPHControls.music.view.template.NameChange'],
    observable: {
        filelist: null
    },
    initialize: function () {
        var me = this;
        me.callParent.apply(me, arguments);
        me.on('load', me.onLoaded.bind(me));
    },
    changeName: function (data) {

        var me = this;
        var temp = me.getTemplateEl('MEPHControls.music.view.template.NameChange');
        var nameinput = temp.querySelector('[nameinput]');
        var okbutton = temp.querySelector('[okbutton]');
        var cancelbutton = temp.querySelector('[cancelbutton]');

        nameinput.value = data.name;
        var blur;

        me.don('click', okbutton, function () {
            blur(true);
        }, 'buttons')
        return new Promise(function (r) {
            blur = MEPH.util.Dom.addSimpleDataEntryToElments(me, [{
                element: nameinput, setFunc: function (v) {
                    data.name = v;
                }
            }],
            temp,
            function () {
                me.dun('buttons');
                r(data);
            });
        });
    },
    copySnippet: function (snippet) {
        var me = this;

        return MEPH.audio.Audio.copy(snippet);
    },
    playSnippet: function (snippet) {
        if (snippet) {
            var audio = new MEPH.audio.Audio();
            audio.buffer(snippet.buffer.buffer, { name: 'buffer' }).gain({ name: 'gain', volume: 1 }).complete();
            var snippet = audio.get({ name: 'buffer' });
            snippet.first().node.onended = function () {
                audio.disconnect();
                delete audio;
                delete snippet.first().node;
            }
            snippet.first().node.start();
        }
    },
    onLoaded: function () {
        var me = this;
        me.name = 'Dropbox';
    },
    drawBytes: function (res) {
        var me = this;
        if (!res) {
            return null;
        }
        me.data = res
    }
});