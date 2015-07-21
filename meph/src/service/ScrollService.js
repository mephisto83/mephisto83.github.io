MEPH.define('MEPH.service.ScrollService', {

    properties: {
        preventing: false
    },
    initialize: function () {
        var me = this;
        me.$window.document.body.addEventListener('scroll', function (e) {
            if (me.preventing) {
                if (e.preventDefault)
                    e.preventDefault();
                if (e.stopPropagation) {
                    e.stopPropagation();
                }
            }
        });
    },
    preventScrolling: function (prevent) {
        var me = this;
        me.preventing = prevent;
    }
});