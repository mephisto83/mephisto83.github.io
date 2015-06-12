/**
* @class MEPH.mobile.activity.ActivityController
* Manages activities within the application.
*/
MEPH.define('MEPH.system.System', {
    requires: ['MEPH.mobile.services.MobileServices'],
    initialize: function (config) {
        var me = this;
        me.config = config;
    },
    getViewCurrentLocationDefinition: function () {
        var me = this,
            pathname = location.pathname,
            ac = MEPH.mobile.activity.ActivityController;
        return MEPH.MobileServices.get(ac.viewProvider).then(function (viewProvider) {

            MEPH.Log('got view Provider');

            return viewProvider.getViews().then(function (views) {
                var view = views.first(function (x) {
                    var exp = MEPH.util.Dom.convertUrlToRegex(x.path);
                    var regex = new RegExp(exp);
                    return regex.test(pathname);
                });
                if (view) {
                    view = MEPH.clone(view);
                    view.path = pathname;
                }
                return view;
            })
        });
    },
    createCookie: function (name, value, days) {
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            var expires = "; expires=" + date.toGMTString();
        }
        else var expires = "";
        document.cookie = name + "=" + value + expires + "; path=/";
    },
    readCookie: function (name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    },

    deleteCookie: function (name) {
        var me = this;
        name = name || (me.config ? me.config.cookie_name : '');
        if (name) {
            me.createCookie(name, "", -1);
        }
    }
});