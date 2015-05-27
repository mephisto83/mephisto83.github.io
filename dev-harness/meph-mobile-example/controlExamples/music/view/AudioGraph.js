MEPH.define('MEPHControls.music.view.AudioGraph', {
    alias: 'mephcontrols_audiograph',
    templates: true,
    extend: 'MEPH.mobile.activity.container.Container',
    mixins: ['MEPH.mobile.mixins.Activity'],
    requires: ['MEPH.audio.graph.AudioGraph'],
    properties: {
        name: null,
        data: null,
        verticalScroll: 0
    },
    initialize: function () {
        var me = this;
        me.callParent.apply(me, arguments);
        me.on('load', me.onLoaded.bind(me));
    },
    onLoaded: function () {
        var me = this;
        me.name = 'Audio Graph';
    }
});