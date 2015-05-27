MEPH.define('MEPHControls.music.view.AudioResourcesManager', {
    alias: 'mephcontrols_audioresourcesmanager',
    templates: true,
    extend: 'MEPH.mobile.activity.container.Container',
    mixins: ['MEPH.mobile.mixins.Activity'],
    requires: ['MEPH.audio.view.AudioResourceManager'],
    properties: {
    },
    initialize: function () {
        var me = this;
        me.callParent.apply(me, arguments);
        me.on('load', me.onLoaded.bind(me));
    },
    onLoaded: function () {
        var me = this;
        me.name = 'Audio Resources Manager';
    }
});