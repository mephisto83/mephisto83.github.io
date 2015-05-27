MEPH.define('Connection.main.view.create.previewview.PreviewView', {
    alias: 'previewview',
    templates: true,
    requires: ['MEPH.button.IconButton'],
    extend: 'MEPH.mobile.activity.view.ActivityView',
    onLoaded: function () {
        var me = this;
        me.great()
        me.hideCloseBtn()
    }
});