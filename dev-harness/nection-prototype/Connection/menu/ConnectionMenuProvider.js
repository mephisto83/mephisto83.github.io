MEPH.define('Connection.menu.ConnectionMenuProvider', {
    requires: ['MEPH.util.Observable',
                'MEPH.Constants',
                'Connection.menu.template.MenuTemplate'],
    mixins: {
        injectable: 'MEPH.mixins.Injections'
    },
    injections: ['userService'],
    properties: {
        appMenu: null
    },
    initialize: function () {
        var me = this;
        MEPH.subscribe(Connection.constant.Constants.ConnectionLogIn, me.onloggedIn.bind(me));
        // MEPH.subscribe(Connection.constant.Constants.LoggedIn, me.onloggedIn.bind(me));
        me.mixins.injectable.init.apply(me);
        me.when.injected.then(function () {
            if (me.$inj.userService.isLoggedIn()) {
                me.onloggedIn();
            }
        })
    },
    onloggedIn: function () {
        var me = this;
        me.loggedIn = true;
        if (me.loadMenu) {
            me.loadMenu();
        }
    },
    getTemplate: function (data) {
        var me = this;
        if (me.ownsData(data)) {
            return 'Connection.menu.template.MenuTemplate';
        }
    },
    getItems: function (data, toplevel) {
        var me = this;
        var res = [{
            connectionmenu: true,
            viewId: 'main',
            name: 'Contacts',
            cls: 'fa fa-users',
            path: 'main/contact'
        }]
        if (!me.loggedIn) {
            res.push({
                connectionmenu: true,
                name: 'Login',
                cls: 'fa fa-key',
                viewId: 'FirstTimePage',
                path: 'login'
            });
        }
        else {
            res.unshift({
                connectionmenu: true,
                viewId: 'Me',
                name: 'My profile',
                cls: 'fa fa-user',
                path: 'main/me'
            })
            res.push({
                connectionmenu: true,
                viewId: 'CreateContact',
                cls: 'fa fa-user-plus',
                path: 'main/create/contact',
                name: 'New Contact'
            }, {
                connectionmenu: true,
                name: 'Accounts',
                viewId: 'Accounts',
                cls: 'fa fa-university',
                path: 'accounts'
            });
        }
        res.foreach(function (x) {
            if (x.cls.indexOf('fa-2x') === -1)
                x.cls += ' fa-2x';
        });
        return res;
    },
    ownsData: function (data) {
        var me = this;
        return data.connectionmenu === true;
    },
    /**
     * Handles an item clicked event.
     * @param {Object} data
     * @param {Boolean} getparentdata, If true, the parents data should be retrieve. If no data exists,
     * then return false;
     */
    itemClicked: function (data, getparentdata) {
        var me = this;

        if (data.viewId) {
            MEPH.publish(MEPH.Constants.OPEN_ACTIVITY, { viewId: data.viewId, path: data.path });
            if (me.appMenu) {
                return me.appMenu.close().then(function () { return true; });
            }
            return true;
        }
        return true;
    }
});