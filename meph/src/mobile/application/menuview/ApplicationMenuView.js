/**
 * @class MEPH.mobile.application.menuview.ApplicationMenuView
 * An application menu.
 **/
MEPH.define('MEPH.mobile.application.menuview.ApplicationMenuView', {
    extend: 'MEPH.control.Control',
    requires: ['MEPH.mobile.services.MobileServices',
                'MEPH.mobile.application.menuview.ApplicationMenuCategories'],
    alias: 'applicationmenuview',
    mixins: ['MEPH.mobile.mixins.Activity'],
    templates: true,
    properties: {
        menuData: null
    },
    /**
     * Gets menu data.
     * @returns {Object}
     **/
    getMenuData: function () {
        var me = this;
        return me.menuData || null;
    },
    /**
     * Loads the menu data from a menuProvider.
     **/
    loadMenu: function () {
        var me = this;
        return MEPH.MobileServices.get('menuProvider').then(function (provider) {
            return provider.getMenu();
        }).then(function (views) {
            me.menuData = views;
            return views;
        });
    }
})