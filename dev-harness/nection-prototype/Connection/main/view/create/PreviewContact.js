MEPH.define('Connection.main.view.create.PreviewContact', {
    alias: 'preview_contact',
    templates: true,
    extend: 'MEPH.mobile.activity.container.Container',
    mixins: ['MEPH.mobile.mixins.Activity'],
    injections: ['contactService'],
    requires: ['MEPH.input.Camera',
                'MEPH.input.Text',
                'Connection.main.view.create.previewview.PreviewView',
                'MEPH.util.Observable',
                'MEPH.button.IconButton',
        'MEPH.qrcode.Generator'],
    properties: {
        contact: null
    },
    afterShow: function () {
        var me = this;
        var arguments = me.activityArguments;

        if (arguments && arguments.data) {
            me.contact = {
                name: 'User Preview',
                phone: '+17634287335',
                address: '4100 Raspberry Dr.',
                title: ['Expert Design Blogger', 'Realtor', 'Mechanical Engineer', 'Plumber'].random().first(),
                id: arguments.data
            }
        }
    },
    acceptContact: function () {
        var me = this;

        return new Promise(function (r, f) {
            alert('Succesfully added contact');
                MEPH.publish(MEPH.Constants.OPEN_ACTIVITY, {
                    viewId: 'main',
                    path: 'main'
                });
                r(); 
        })
    },
    cancelContact: function () {
        window.history.back();
    },
    onLoaded: function () {
        var me = this;
        me.previewview.hideCloseBtn();
        me.name = 'Contact';
    }
})