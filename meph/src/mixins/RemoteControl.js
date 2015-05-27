/**
 * @class
 * The class instance will listen on the channel for synchronization messages.
 **/
MEPH.define('MEPH.mixins.RemoteControl', {
    requires: ['MEPH.mobile.services.MobileServices'],
    statics: {
        remoteControlFunctions: {
            handleRemoteControlRequestCompletions: function (type, args) {
                var me = this,
                    viewpath = me[MEPH.nonEnumerablePropertyPrefix + '$path'],
                    remoteViews;
                remoteViews = MEPH.getPathValue(viewpath, me);//me.remoteViews.push(obs);
                if (remoteViews) {
                    var i = me.remoteViews.first(function (x) {
                        return x.remoteInstanceId === args.message.remoteInstanceId;
                    });
                    if (i) {
                        i.ready = true;
                    }
                }
            },
            /**
             * Opens a remote view.
             * @param {String} viewid
             * @param {String} remoteInstanceId
             * @param {String} path
             * @param {String} remoteUser
             * @param {String} channel
             ***/
            openRemoteView: function (viewid, remoteInstanceId, path, remoteUser, id, name, channel) {
                var me = this,
                    viewpath = me[MEPH.nonEnumerablePropertyPrefix + '$path'],
                    value;
                return MEPH.MobileServices.get('signalService').then(function (signalService) {
                    if (signalService) {
                        obs = MEPH.util.Observable.observable({
                            remoteInstanceId: remoteInstanceId,
                            viewId: viewid,
                            path: path,
                            ready: false
                        });
                        value = MEPH.getPathValue(viewpath, me);//me.remoteViews.push(obs);
                        if (value && value.push) {
                            value.push(obs);
                        }
                        signalService.sendMessage({
                            type: MEPH.Constants.RemoteControlRequest,
                            viewId: viewid,
                            slave: true,
                            remoteInstanceId: remoteInstanceId,
                            from: id,
                            fromName: name
                        }, remoteUser, channel || MEPH.Constants.ACTIVITY_CONTROLLER_CHANNEL);
                    }
                });
            }
        }
    },
    init: function (path) {
        var me = this,
            i,
            referrerFunctions = MEPH.mixins.RemoteControl.remoteControlFunctions;
        me[MEPH.nonEnumerablePropertyPrefix + '$path'] = path;
        for (i in referrerFunctions) {
            me[i] = referrerFunctions[i].bind(me);
        }
        MEPH.subscribe(MEPH.Constants.RemoteControlRequestComplete, me.handleRemoteControlRequestCompletions.bind(me));
    }
});