///<reference path="~/extjs/ext-debug.js" />

/**
 * @class
 * The base class for Views used in the mobile application.
 */

/*global MEPH,U4,window*/
MEPH.define('MEPH.mobile.activity.container.Container', {
    extend: 'MEPH.control.Control',
    mixins: ['MEPH.mobile.mixins.Activity'],
    requires: ['MEPH.mobile.activity.view.ActivityView'],
    properties: {
        $removeHomePageCls: 'meph-view-remove'
    },
    initialize: function () {
        var me = this;
        me.callParent.apply(me, arguments);
        me.on('afterload', me.activityLoaded.bind(me));
    },
    /**
     * Shows the container.
     * @returns {Promise}
     */
    show: function () {
        var me = this,
            view,
            dom;
        dom = me.getDomTemplate();
        view = dom.first();
        return me.viewTransition(view, { remove: me.$removeHomePageCls }).then(function (x) {
            me.fire('show', {});
        });;
    },
    /**
     * Hides the container.
     * @returns {Promise}
     */
    hide: function () {
        var me = this,
            view,
            dom = me.getDomTemplate();

        view = dom.first();
        return me.viewTransition(view, { add: me.$removeHomePageCls }).then(function (x) {
            me.fire('hide', {});
        });
    },
    close: function () {
        var me = this;
        return me.hide().then(function () {
            me.destroy();
        });
    },
    open: function () {
        var me = this;
        return me.show();
    }
});