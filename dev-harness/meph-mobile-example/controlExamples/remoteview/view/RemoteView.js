MEPH.define('MEPHControls.remoteview.view.RemoteView', {
    alias: 'remoteview',
    templates: true,
    extend: 'MEPH.mobile.activity.container.Container',
    requires: ['MEPH.mobile.activity.view.ActivityView',
                'MEPH.list.List',
                'MEPH.button.IconButton',
                'MEPH.input.Text',
                'MEPH.button.Button',
                'MEPH.panel.Panel'],
    properties: {
        name: null
    },
    backToRemote: function () {
        var me = this;
        debugger
    },
    onLoaded: function () {
        var me = this;
        me.name = 'Remote View';
    }
});