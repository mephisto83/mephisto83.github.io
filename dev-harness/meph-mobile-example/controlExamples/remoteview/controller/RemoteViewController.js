MEPH.define('MEPHControls.remoteview.controller.RemoteViewController', {
    requires: ['MEPH.controller.Controller'],
    extend: 'MEPH.controller.Controller',

    properties: {
        notBound: true,
        listsource: null,
        userName: 'Anonymous'
    },
    initialize: function () {
        var me = this,
            source = [];
        me.callParent.apply(me, arguments);
    },
    backToRemote: function () {
        var me = this;
        if (me.view.activityArguments.remoteInstance) {
            me.view.getApplication().activityController.showActivity(me.view.activityArguments.remoteInstance);
        }
    }
});