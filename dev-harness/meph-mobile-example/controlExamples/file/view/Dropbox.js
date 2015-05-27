MEPH.define('MEPHControls.file.view.Dropbox', {
    alias: 'mephcontrols_dropbox',
    templates: true,
    extend: 'MEPH.mobile.activity.container.Container',
    mixins: ['MEPH.mobile.mixins.Activity'],
    requires: ['MEPH.mobile.activity.view.ActivityView', 'MEPH.file.Dropbox', 'MEPH.list.List'],
    properties: {
        name: null,
        files: null
    },
    observable: {
        filelist: null
    },
    initialize: function () {
        var me = this;
        

        me.callParent.apply(me, arguments);
        me.filelist = [];
        me.on('load', me.onLoaded.bind(me));
        window.dropboxpage = me;
    },
    onLoaded: function () {
        var me = this;
        me.name = 'Dropbox';
    }
});