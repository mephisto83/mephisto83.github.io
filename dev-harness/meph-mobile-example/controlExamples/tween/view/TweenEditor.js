MEPH.define('MEPHControls.tween.view.TweenEditor', {
    alias: 'mephcontrols_tween',
    templates: true,
    extend: 'MEPH.mobile.activity.container.Container',
    mixins: ['MEPH.mobile.mixins.Activity'],
    requires: ['MEPH.mobile.activity.view.ActivityView', 'MEPH.tween.TweenEditor'],
    properties: {
        name: null
    },
    onLoaded: function () {
        var me = this;
        me.name = 'Tween Editor';
    }
});