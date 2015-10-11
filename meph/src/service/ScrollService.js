MEPH.define('MEPH.service.ScrollService', {

    properties: {
        preventing: false
    },
    initialize: function () {
        var me = this;
        MEPH.Events(me);
        function BlockElasticScroll(event) {
            event.preventDefault();
        }
        me.$window.document.body.addEventListener('touchmove', function (e) {
            me.preventDefault();

        });
        me.$window.document.body.addEventListener('scroll', function (e) {
            me.preventDefault();

        });
    },
    preventDefault: function (e) {
        var me = this;
        if (me.preventing) {
            if (e) {
                if (e.preventDefault)
                    e.preventDefault();
                if (e.stopPropagation) {
                    e.stopPropagation();
                }

                return false;
            }
        }
    },
    prevent: function (dom) {
        var me = this;
        if (dom.addEventListener) {
            if (!me.hasDon(dom))
                me.don('scroll', dom, function (e) {
                    me.preventDefault(e);
                    dom.classList.add('stop-scroll');
                }, dom);
        }
    },
    allow: function (dom) {
        var me = this;
        if (dom.addEventListener) {
            me.dun(dom, 'scroll');
            dom.classList.remove('stop-scroll');
        }
    },
    preventScrolling: function (prevent) {
        var me = this;
        me.preventing = prevent;
    }
});