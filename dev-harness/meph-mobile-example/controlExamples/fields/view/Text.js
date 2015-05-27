MEPH.define('MEPHControls.fields.view.Text', {
    alias: 'mephcontrols_text',
    templates: true,
    extend: 'MEPH.control.Control',
    mixins: ['MEPH.mobile.mixins.Activity'],
    requires: ['MEPH.mobile.activity.view.ActivityView',
                'MEPH.input.Text',
                'MEPH.input.Color',
                'MEPH.input.Date',
                'MEPH.input.DateTime',
                'MEPH.input.DateTimeLocal',
                'MEPH.input.Email',
                'MEPH.input.Month',
                'MEPH.input.Number',
                'MEPH.input.Range',
                'MEPH.input.Camera',
                'MEPH.input.Checkbox',
                'MEPH.input.Search',
                'MEPH.input.Telephone',
                'MEPH.input.Image',
                'MEPH.input.Time',
                'MEPH.input.URL',
                'MEPH.input.Week'],
    properties: {
        name: null
    },
    onLoaded: function () {
        var me = this;
        me.name = 'Text Input Field';
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