MEPH.define('MEPHControls.scrollbar.view.Scrollbar', {
    alias: 'mephcontrols_scrollbar',
    templates: true,
    extend: 'MEPH.mobile.activity.container.Container',
    mixins: ['MEPH.mobile.mixins.Activity'],
    requires: ['MEPH.mobile.activity.view.ActivityView', 'MEPH.scrollbar.Scrollbar'],
    properties: {
        scrollbarposition: null
    },
    onLoaded: function () {
        var me = this;
        me.name = 'Scrollbar';
    },
    initialize: function () {
        var me = this;
        me.callParent.apply(me, arguments);
        me.on('load', me.onLoaded.bind(me));
    }
});