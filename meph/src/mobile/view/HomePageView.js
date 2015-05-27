MEPH.define('MEPH.mobile.view.HomePageView', {
    alias: 'mobile_homepage_view',
    templates: true,
    extend: 'MEPH.control.Control',
    mixins: ['MEPH.mobile.mixins.Activity'],
    requires: ['MEPH.mobile.application.menuview.ApplicationMenuView'],
    properties: {
        $removeHomePageCls: 'meph-remove-home-page'
    },
    show: function () {
        var me = this,
            view,
            dom;
        dom = me.getDomTemplate();
        view = dom.first();
        return me.viewTransition(view, { remove: me.$removeHomePageCls });
    },
    hide: function () {
        var me = this,
            view,
            dom = me.getDomTemplate();
        view = dom.first();
        
        return me.viewTransition(view, { add: me.$removeHomePageCls });
    },
    close: function () {
        var me = this;
    },
    open: function () {
        var me = this;
    }
});