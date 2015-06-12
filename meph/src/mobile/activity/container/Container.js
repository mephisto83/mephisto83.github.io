///<reference path="~/extjs/ext-debug.js" />

/**
 * @class
 * The base class for Views used in the mobile application.
 */

/*global MEPH,U4,window*/
MEPH.define('MEPH.mobile.activity.container.Container', {
    extend: 'MEPH.control.Control',
    mixins: ['MEPH.mobile.mixins.Activity'],
    requires: ['MEPH.mobile.activity.view.ActivityView',
        'MEPH.util.Draggable'],
    properties: {
        $removeHomePageCls: 'meph-view-remove',
        percentageForDrag: 0.7
    },
    initialize: function () {
        var me = this;
        me.callParent.apply(me, arguments);
        me.on('afterload', me.activityLoaded.bind(me));
        me.on('afterload', me.fullscreenMode.bind(me));
    },

    fullscreenMode: function () {
        var me = this,
            stretchMargin = 10,
            percentageForDrag = me.percentageForDrag;
        //If in standalone mode, handle swipes
        me.when.injected.then(function () {
            if (("standalone" in window.navigator) && window.navigator.standalone) {
                var firstel = me.getFirstElement();
                var scope = MEPH.util.Draggable.draggable(firstel, null, {
                    restrict: 'x',
                    translate: true,
                    bungy: true,
                    must: function (start) {
                        return start.x < stretchMargin || start.x > document.body.getBoundingClientRect().width - stretchMargin;
                    }
                });
                MEPH.util.Dom.onSwipe(firstel, function (direction, distance) {
                    var size = MEPH.util.Style.size(document.body);
                    console.info('distance ' + distance);
                    console.info('screen  ' + size.width);
                    console.info('should be at least ' + (size.width * percentageForDrag));
                    if (size.width * percentageForDrag < distance) {
                        MEPH.Log('Swipe ' + direction);
                        if (window.history && window.history.back && window.history.forward) {
                            switch (direction) {
                                case 'left':
                                    window.history.forward();
                                    break;
                                case 'right':
                                    window.history.back();
                                    break;
                            }
                        }
                    }
                }, { horizontal: true, enforceSideStart: true, stretchMargin: stretchMargin },
                null, null, 2000)
            }
        });
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
        MEPH.publish(MEPH.Constants.ON_SHOW, me.activityArguments)
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
        MEPH.publish(MEPH.Constants.ON_HIDE, me.activityArguments)
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