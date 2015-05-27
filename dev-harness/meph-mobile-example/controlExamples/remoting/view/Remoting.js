MEPH.define('MEPHControls.remoting.view.Remoting', {
    alias: 'mephcontrols_remoting',
    templates: true,
    extend: 'MEPH.control.Control',
    mixins: ['MEPH.mobile.mixins.Activity'],
    requires: ['MEPH.mobile.activity.view.ActivityView', 'MEPH.button.IconButton',
                'MEPH.input.Text',
                'MEPH.input.Checkbox',
                'MEPH.list.List'],
    properties: {
        name: null
    },
    onLoaded: function () {
        var me = this;
        me.name = 'Remoting';
    },
    show: function () {
        var me = this,
            view,
            dom;
        dom = me.getDomTemplate();
        view = dom.first();
        return me.viewTransition(view, { remove: me.$removeHomePageCls });
    },
    translate: function () {
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