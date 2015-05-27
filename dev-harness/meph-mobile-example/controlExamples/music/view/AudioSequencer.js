MEPH.define('MEPHControls.music.view.AudioSequencer', {
    alias: 'mephcontrols_audiosequencer',
    templates: true,
    extend: 'MEPH.mobile.activity.container.Container',
    mixins: ['MEPH.mobile.mixins.Activity'],
    requires: ['MEPH.audio.view.AudioSequencer'],
    properties: {
    },
    initialize: function () {
        var me = this;
        me.callParent.apply(me, arguments);
        me.on('load', me.onLoaded.bind(me));
    },
    onLoaded: function () {
        var me = this;
        me.name = 'Audio Sequencer';
    }
});