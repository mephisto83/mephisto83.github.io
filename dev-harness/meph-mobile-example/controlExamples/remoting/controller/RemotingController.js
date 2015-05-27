MEPH.define('MEPHControls.remoting.controller.RemotingController', {
    requires: ['MEPH.controller.Controller',
                'MEPH.mobile.services.MobileServices',
                'MEPH.mixins.RemoteControl'],
    extend: 'MEPH.controller.Controller',
    mixins: {
        remoteControl: 'MEPH.mixins.RemoteControl'
    },
    properties: {
        notBound: true,
        listsource: null,
        remoteViews: null,
        userName: 'Anonymous',
        videoEnabled: false,
        dataEnabled: false
    },
    initialize: function () {
        var me = this,
            source = [];
        me.callParent.apply(me, arguments);
        me.on('referencesbound', me.referenceBound.bind(me));
        me.listsource = MEPH.util.Observable.observable(source);
        me.remoteViews = MEPH.util.Observable.observable([]);
        me.mixins.remoteControl.init.apply(me, ['remoteViews']);
    },
    referenceBound: function () {
        var me = this;
        if (me.view && me.notBound) {
            me.notBound = false;
            MEPH.MobileServices.get('remotingController').then(function (remotingController) {
                me.on('change_userName', function () {
                    remotingController.setUserName(me.userName);
                });
                me.remoteController = remotingController;
                remotingController.remotes.foreach(function (x) {
                    me.listsource.push(x);
                });
                remotingController.remotes.on('changed', function (type, changes) {
                    me.listsource.removeWhere(function (x) { return changes.removed.some(function (y) { return y === x; }); });
                    changes.added.foreach(function (x) { return me.listsource.push(x); });
                });
            });
            MEPH.MobileServices.get('sessionManager').then(function (sessionManager) {
                if (sessionManager) {
                    me.on('change_videoEnabled', function () {
                        sessionManager.setUserDataProperty('videoEnabled', me.videoEnabled);
                    });
                    me.on('change_dataEnabled', function () {
                        sessionManager.setUserDataProperty('dataEnabled', me.dataEnabled);
                    });
                }
            });
        }
    },
    openRemote: function () {
        var me = this, obs,
            viewid = 'MEPH011',
            remoteInstanceId = MEPH.GUID();
        if (me.selectedReference && me.remoteController) {
            me.openRemoteView(viewid, remoteInstanceId, '/remoteview/RemoteView', me.selectedReference.remoteUser,
                me.remoteController.getId(), me.remoteController.getUserName());
        }
    },
    setSelectedReference: function (a, b, c, d, e, f, evnt) {
        var me = this,
            selecteddata = evnt.domEvent.data;
        if (me.selectedReference) {
            me.selectedReference.selected = false;
        }
        me.selectedReference = selecteddata;
        me.selectedReference.selected = true;
    },
    goToView: function (a, b, c, d, e, f, evnt) {
        var me = this, data = evnt.domEvent.data;
        if (!data.instance) {
            data.remoteInstance = me.view;
            me.getActivityController().startActivity(data).then(function (result) {
                var activity = result.classInstance;
                data.instance = activity;
            });
        }
        else {
            me.getActivityController().showActivity(data.instance);
        }
    },
    getActivityController: function () {
        var me = this;
        return MEPH.ActivityController;
    },
    transformReady: function (a, b, c, d, e, f, evnt) {
        if (evnt.value) {
            return 'meph-application-menu-categories-item meph-item-ready';
        }
        return 'meph-application-menu-categories-item';
    },
    transformSelected: function (a, b, c, d, e, f, evnt) {
        if (evnt.value) {
            return 'meph-application-menu-categories-item meph-item-selected';
        }
        return 'meph-application-menu-categories-item';
    }
});