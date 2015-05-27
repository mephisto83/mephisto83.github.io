MEPH.define('MEPHControls.iconbutton.view.IconButton', {
    alias: 'mephcontrols_iconbutton',
    templates: true,
    extend: 'MEPH.mobile.activity.container.Container',
    mixins: ['MEPH.mobile.mixins.Activity'],
    requires: ['MEPH.mobile.activity.view.ActivityView', 'MEPH.button.IconButton'],
    properties: {
        name: null
    },
    initialize: function () {
        var me = this;
        me.callParent.apply(me, arguments);
    },
    onLoaded: function () {
        var me = this;
        me.name = 'Icon Buttons';
    }
});