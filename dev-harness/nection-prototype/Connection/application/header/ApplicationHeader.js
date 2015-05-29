MEPH.define('Connection.application.header.ApplicationHeader', {
    extend: 'MEPH.mobile.application.header.MobileApplicationHeader',
    templates: true,
    requires: ['Connection.constant.Constants', 'MEPH.util.Style'],
    injections: ['userService'],
    alias: 'connectionapplicationheader',
    initialize: function () {
        var me = this;
        me.great()
        MEPH.subscribe(Connection.constant.Constants.ConnectionLogIn, me.onloggedIn.bind(me));
        MEPH.subscribe(Connection.constant.Constants.ConnectionLogOut, me.onloggedOut.bind(me));
    },
    onLoaded: function () {
        var me = this;
        me.applicationmenu.hide();
        if (me.addContactBtn)
            me.addContactBtn.hide();
        if (document.body.classList.contains('mobile-bottom-menu')) {
            me.applicationmenu.hideMenuButton();
            me.applicationmenu.setAlwaysOpen(true);
            me.applicationmenu.open();
        }
        if (me.$inj && me.$inj.userService) {
            if (me.$inj.userService.isLoggedIn()) {
                me.onloggedIn();
            }
        }
        me.showMenu();
    },
    gotoCreateContact: function () {
        MEPH.publish(MEPH.Constants.OPEN_ACTIVITY, { viewId: 'CreateContact', path: 'main/create/contact' });
    },
    onInjectionsCompleted: function () {
        var me = this;
        if (me.$inj && me.$inj.userService) {
            me.$inj.userService.on('statuschanged', function (type, status) {
                if (status) {
                    me.headerdom.classList.add('connection-show');
                }
                else {
                    me.headerdom.classList.remove('connection-show');
                }
            });
            if (me.$inj.userService.isLoggedIn()) {
                me.onloggedIn();
            }
        }
    },
    heartBeat: function () {
        var me = this;
        me.when.injected.then(function () {
            return me.$inj.userService.heart();
        });
    },
    onloggedOut: function () {
        var me = this;
        me.loggedin = false;
        if (me.addContactBtn)
            me.addContactBtn.hide();
        //me.applicationmenu.hide();
        //me.headerdom.classList.remove('connection-show');
    },
    onloggedIn: function () {
        var me = this;
        me.loggedin = true;
        if (me.addContactBtn)
            me.addContactBtn.show();
        //me.applicationmenu.show();
        //me.headerdom.classList.add('connection-show');
    },
    showMenu: function () {
        var me = this;
        me.loggedin = true;
        me.applicationmenu.show();
        me.headerdom.classList.add('connection-show');
    }
});