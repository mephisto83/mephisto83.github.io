/**
 * @class MEPH.mobile.application.menuview.ApplicationMenuCategories
 * Displays the application menu list by categories.
 **/
MEPH.define('MEPH.mobile.application.menuview.ApplicationMenuCategories', {
    alias: 'applicationmenucategories',
    templates: true,
    extend: 'MEPH.control.Control',
    requires: ['MEPH.mobile.services.MobileServices', 'MEPH.mobile.application.menuview.List'],
    properties: {
        menuCategories: null,
        menuViews: null
    },
    initialize: function () {
        var me = this;
        me.callParent.apply(me, arguments);
        me.on('load', me.loadMenu.bind(me));
    },
    /**
     * Loads the menu data from a menuProvider.
     **/
    loadMenu: function () {
        var me = this;
        return MEPH.MobileServices.get('menuProvider').then(function (provider) {
            return provider.getMenu();
        }).then(function (views) {

            me.menuCategories = MEPH.util.Observable.observable(MEPH.Array(views).foreach(function (x) {

                MEPH.util.Observable.observable(x);
            }));
            //    me.menuCategories.unshift(me.backButtonData());
            me.menuViews = views.select(function (x) { return x; });
            me.pages = [];
            me.pages.push(me.menuCategories.select(function (x) { return x; }));
            return views;
        });
    },
    backButtonData: function () {
        return {
            description: 'Back',
            backbutton: true
        }
    },
    getParent: function (item, tree) {
        var me = this;
        if (tree === item) {
            return null;
        }
        else if (tree.children && MEPH.Array(tree.children).contains(item)) {
            return tree;
        }
        return tree.children.first(function (x) {
            return me.getParent(item, x);
        });
    },
    menuItemClicked: function (value, dom, prop, eventType, instructions, obj, eventargs) {

        var me = this, parent,
            data = eventargs.domEvent.data;
        if (data.itemType === 'launch') {
            MEPH.publish(MEPH.Constants.startView, data);
        }
        else if (data.backbutton) {
            parent = me.pages.pop()
            me.menuCategories.removeWhere(function (x) {
                return true;
            });
            parent = me.pages.last();
            if (me.pages.length > 1) {
                me.menuCategories.unshift(me.backButtonData());
            }
            MEPH.Array(parent).foreach(function (x) {
                me.menuCategories.push(x);
            });
        }
        else if (data.children && data.children.length) {
            me.menuCategories.removeWhere(function (x) {
                return true;
            });
            me.pages.push(data.children);
            me.menuCategories.unshift(me.backButtonData());

            MEPH.Array(data.children).foreach(function (x) {
                me.menuCategories.push(x);
            });

        }
    }
});