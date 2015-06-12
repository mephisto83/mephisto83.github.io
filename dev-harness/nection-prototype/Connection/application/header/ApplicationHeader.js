MEPH.define('Connection.application.header.ApplicationHeader', {
    extend: 'MEPH.mobile.application.header.MobileApplicationHeader',
    templates: true,
    requires: ['Connection.constant.Constants',
        'MEPH.util.Observable',
        'MEPH.util.Style'],
    injections: ['userService', 'connectionMenuProvider', 'notificationService'],
    alias: 'connectionapplicationheader',
    properties: {
        secondarymenusource: null
    },
    initialize: function () {
        var me = this;
        me.great()

        MEPH.subscribe(Connection.constant.Constants.SECONDARY_MENU, me.onOpenSecondaryMenu.bind(me))
    },
    onLoaded: function () {
        var me = this;
        me.applicationmenu.hide();
        me.secondarymenusource = MEPH.util.Observable.observable([]);
        if (me.addContactBtn)
            me.addContactBtn.hide();
        if (document.body.classList.contains('mobile-bottom-menu')) {
            me.applicationmenu.hideMenuButton();
            me.applicationmenu.setAlwaysOpen(true);
            me.applicationmenu.open();
        }
        me.secondarypanel.close();
        me.secondarypanel.onClickOutSideOf([me.headerdom, me.secondarypanel.getFirstElement()], function () {
            me.secondarypanel.close();
        })
        if (me.$inj && me.$inj.userService) {
            if (me.$inj.userService.isLoggedIn()) {
                me.onloggedIn();
            }
        }
        me.showMenu();
    },
    menuItemClicked: function () {
        var me = this;

        var data = me.getDomEventArg(arguments);

        if (data && data.viewId) {
            MEPH.publish(MEPH.Constants.OPEN_ACTIVITY, { viewId: data.viewId, path: data.path });
            me.secondarypanel.close();
        }
        else if (data.logout) {
            MEPH.publish(MEPH.Constants.LOGOUT, {});
            me.secondarypanel.close();
        }
    },
    onOpenSecondaryMenu: function (type, options) {
        var me = this;
        me.secondarymenusource.dump();
        if (me.secondarypanel.isOpen()) {
            me.secondarypanel.close();
        }
        else
            if (options && options.elements && options.elements.length) {
                me.secondarymenusource.push.apply(me.secondarymenusource, options.elements);
                me.secondarypanel.open();
            }
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