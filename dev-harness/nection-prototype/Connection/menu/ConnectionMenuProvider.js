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

        MEPH.subscribe(MEPH.Constants.ON_SHOW, function (type, args) {
            if (args.path === 'main/me' ||
                args.path === 'main/create/contact' ||
                args.path === 'main/contact/relationship/edit') {
                if (args.path === 'main/contact/relationship/edit') {
                    me.mode = 'relationshipedit';
                }
                if (args.path === 'main/create/contact') {
                    me.mode = 'createcontact';
                }
                else if (args.path === 'main/me') {
                    me.mode = 'edit';
                }
                if (me.loadMenu) {
                    me.loadMenu();
                }
            }
            else if (me.mode) {
                me.mode = null;
                if (me.loadMenu) {
                    me.loadMenu();
                }
            }
        });
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
        if (me.mode === 'edit') {

            res.unshift({
                connectionmenu: true,
                name: 'Edit',
                viewId: 'EditContact',
                cls: 'fa fa-pencil-square-o',
                path: 'main/me/edit'
            });

            res.removeWhere(function (x) {
                return x.viewId === 'Me';
            });
        }
        else if (me.mode === 'createcontact') {
            ///main/create/contact

            res.removeWhere(function (x) {
                return x.viewId === 'CreateContact';
            });
        }
        else if (me.mode === 'relationshipedit') {
            res.unshift({
                connectionmenu: true,
                name: 'Contact',
                viewId: 'Contact',
                cls: 'fa fa-user ',
                path: 'main/contact'
            });

            res.removeWhere(function (x) {
                return ['Me', 'Accounts', 'CreateContact'].some(function (t) { return t === x.viewId; });;
            });
        }
        res.push({
            connectionmenu: true,
            name: 'Style',
            viewId: 'styleOptions',
            cls: 'fa fa-diamond',
            path: 'temporary/style/options'
        });

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