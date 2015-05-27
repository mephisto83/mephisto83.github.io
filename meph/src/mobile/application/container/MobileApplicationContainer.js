/**
* @class MEPH.mobile.application.container.MobileApplicationContainer
* Mobile application container.
*/
MEPH.define('MEPH.mobile.application.container.MobileApplicationContainer', {
    extend: 'MEPH.control.Control',
    requires: ['MEPH.mobile.application.body.MobileApplicationBody',
                'MEPH.mobile.application.header.MobileApplicationHeader',
                'MEPH.mobile.application.footer.MobileApplicationFooter'],
    templates: true,
    alias: 'mobileapplicationcontainer',
    statics: {
        events: {
            /**
             * @property application_resize
             **/
            resize: 'application_resize'
        }
    },
    properties: {
    },
    getDom: function () {
        var me = this, dom;
        dom = MEPH.Array(me.getDomTemplate()).first();
        return dom;
    },
    destroy: function () {
        var me = this;
        if (!me.isDestroyed()) {
            me.dun();
            me.callParent.apply(me, arguments);
        }
    }
});