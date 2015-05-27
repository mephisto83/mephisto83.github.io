/**
 * @class MEPH.mobile.application.menu.ActivityMenuProvider
 * An activity menu provider.
 */
MEPH.define('MEPH.mobile.application.menu.ActivityMenuProvider', {
    requires: ['MEPH.util.Observable',
        'MEPH.mobile.application.menu.ApplicationMenu',
        'MEPH.Constants'],
    properties: {
        name: 'Activity',
        type: 'activity',
        source: null
    },
    initialize: function (controller) {
        var me = this;
        me.source = MEPH.util.Observable.observable([]);
        MEPH.subscribe(MEPH.Constants.ActivityStarted, me.onActivityStarted.bind(me));
        MEPH.subscribe(MEPH.Constants.ActivityDestroyed, me.onActivityStarted.bind(me));
        me.controller = controller;
        me.onActivityStarted();
    },
    onActivityStarted: function () {
        var me = this;
        me.source.removeWhere(function (x) { return true; });
        if (MEPH.ActivityController || me.controller) {
            (MEPH.ActivityController || me.controller).getActivities().foreach(function (activity) {
                me.source.push(MEPH.util.Observable.observable({
                    name: activity.activity.getPath() || activity.activity.getActivityId(),
                    id: activity.activity.getActivityId(),
                    type: MEPH.mobile.application.menu.ApplicationMenu.activityinstance
                }));
            });
        }
        if (me.updateCallback) {
            me.updateCallback();
        }
    },
    getItems: function (data, toplevel) {
        var me = this;
        if (data === null) {
            return [{
                topmenu: true,
                name: 'Activities'
            }]
        }
        return me.source;
    },
    ownsData: function (data) {
        var me = this;
        return me.source.contains(function (x) { return x === data; });
    },
    /**
     * Handles an item clicked event.
     * @param {Object} data
     * @param {Boolean} getparentdata, If true, the parents data should be retrieve. If no data exists,
     * then return false;
     */
    itemClicked: function (data, getparentdata) {
        var me = this;
        if (getparentdata) {
            return false;
        }
        if (data.topmenu) {
            return me.source;
        }
        return MEPH.ActivityController.showActivity(data.id).then(function () {
            return true;
        });
    }
});