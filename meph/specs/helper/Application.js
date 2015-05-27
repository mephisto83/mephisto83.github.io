MEPH.define('MEPHTests.helper.Application', {
    extend: 'MEPH.application.Application',
    properties: {
        applicationSelector: 'testapplication',
    },
    createAppSpace: function () {

        var me = this,
            dom = document.createElement('div');

        dom.classList.add(me.applicationSelector);
        document.body.appendChild(dom);
        return dom;

    },
    removeSpace: function () {
        var me = this;
        MEPH.Array(document.querySelectorAll('.' + me.applicationSelector)).foreach(function (dom) {
            if (dom && dom.parentNode) {
                dom.parentNode.removeChild(dom);
            }
        });
    }
})