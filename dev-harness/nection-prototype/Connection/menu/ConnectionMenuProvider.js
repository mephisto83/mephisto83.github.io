﻿MEPH.define('Connection.menu.ConnectionMenuProvider', {
    requires: ['MEPH.util.Observable',
                'MEPH.Constants',
                'MEPH.util.Dom',
                'Connection.menu.template.MenuTemplate'],
    mixins: {
        injectable: 'MEPH.mixins.Injections'
    },
    injections: ['userService', 'stateService'],
    properties: {
        appMenu: null,
        messageInfo: null
    },
    initialize: function () {
        var me = this;
        MEPH.subscribe(Connection.constant.Constants.ConnectionLogIn, me.onloggedIn.bind(me));
        MEPH.subscribe(Connection.constant.Constants.UnseenMessages, me.onSceneMessages.bind(me));
        MEPH.subscribe(MEPH.Constants.LOGOUT, me.onLogout.bind(me));
        me.mixins.injectable.init.apply(me);
        me.messageInfo = { has: false, count: 0 };

        MEPH.subscribe(MEPH.Constants.ON_SHOW, function (type, args) {
            if (args.path === 'main/me' ||
                args.path === 'main/create/contact' ||
                args.path === 'contactimage' ||
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
                else if (args.path === 'contactimage') {
                    me.mode = 'contactimage';
                }
                if (me.loadMenu) {
                    me.loadMenu();
                }
            }
            else if (args.viewId) {
                if (me.mode !== args.viewId) {
                    me.mode = args.viewId;

                    if (me.loadMenu) {
                        me.loadMenu();
                    }
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
    onSceneMessages: function (type, options) {
        var me = this;
        if (options && options.messages) {
            me.messageInfo.count = options.messages.length;
            me.messageInfo.has = options.messages.length ? true : false;
        }
    },
    getSecondaryMenuItems: function () {
        var me = this, res = [];
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


        res.push({
            connectionmenu: true,
            name: 'Style',
            viewId: 'styleOptions',
            cls: 'fa fa-diamond',
            path: 'temporary/style/options'
        });

        return res;
    },
    onloggedIn: function () {
        var me = this;
        me.loggedIn = true;
        if (me.loadMenu) {
            me.loadMenu();
        }
    },
    onLogout: function () {
        var me = this;
        me.loggedIn = false;
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
        }

        if (me.mode === 'chat') {
            res.push({
                connectionmenu: true,
                name: 'New Message',
                viewId: 'chatmessage',
                cls: 'fa fa-weixin',
                path: 'chatmessage',
                newchat: true
            });

        }
        else if (me.loggedIn) {
            res.push({
                connectionmenu: true,
                name: 'Chat',
                viewId: 'chat',
                cls: 'fa fa-weixin',
                path: 'chat',
                badge: me.messageInfo
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
            res.unshift({
                connectionmenu: true,
                name: 'Take Picture',
                use: Connection.constant.Constants.TakeContactPicture,
                cls: 'fa fa-picture-o'
            });
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
            name: 'More',
            openSideMenu: true,
            cls: 'fa fa-bars'
        });

        if (me.mode === 'contactimage') {
            res.length = 0;
            var supporstMedia = MEPH.util.Dom.supportsUserMedia();
            res.push({
                connectionmenu: true,
                back: true,
                name: 'Back',
                cls: 'fa fa-reply '
            },
            (supporstMedia ? {
                connectionmenu: true,
                name: 'Camera Mode',
                use: 'cameramode',
                cls: 'fa fa-camera '
            } : null),
            {
                connectionmenu: true,
                name: 'File mode',
                use: 'filemode',
                cls: 'fa fa-picture-o '
            },
            //(fal ? {
            //    connectionmenu: true,
            //    name: 'Take picture',
            //    use: 'takepicture',
            //    cls: 'fa fa-camera '
            //} : null)
            //,
            {
                connectionmenu: true,
                name: 'Ok',
                use: 'savepicture',
                cls: 'fa fa-floppy-o '
            })
        }
        res = res.where();
        res.foreach(function (x) {
            if (x && x.cls.indexOf('fa-2x') === -1)
                x.cls += ' fa-2x';
        });
        return res.where();
    },
    getSecondardMenuItems: function () {
        var me = this,
            res = [];
        if (me.loggedIn) {
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
            if (me.mode !== 'chat') {
                //res.push({
                //    connectionmenu: true,
                //    name: 'Chat',
                //    viewId: 'chat',
                //    cls: 'fa fa-weixin',
                //    path: 'chat'
                //});
            }
            res.push({
                connectionmenu: true,
                name: 'Log out',
                logout: true,
                cls: 'fa fa-sign-out'
            });
        }
        res.push({
            connectionmenu: true,
            name: 'Style',
            viewId: 'styleOptions',
            cls: 'fa fa-diamond',
            path: 'temporary/style/options'
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

        if (data.openSideMenu) {
            MEPH.publish(Connection.constant.Constants.SECONDARY_MENU, {
                elements: me.getSecondardMenuItems()
            });
        }
        if (data.logout) {
            MEPH.publish(MEPH.Constants.LOGOUT, {});
        }
        if (data.newchat) {
            me.$inj.stateService.newConversation();
            setTimeout(function () {
                MEPH.publish(MEPH.Constants.OPEN_ACTIVITY, {
                    viewId: 'editconversationgroup',
                    path: 'editconversationgroup'
                });
            }, 200);
        }
        if (data.use) {
            switch (data.use) {
                case 'cameramode':
                    MEPH.publish(Connection.constant.Constants.UseCamera, {});
                    break;
                case 'filemode':
                    MEPH.publish(Connection.constant.Constants.UsePictureFiles, {});
                    break;
                case 'takepicture':
                    MEPH.publish(Connection.constant.Constants.TakePicture, {});
                    break;
                case 'savepicture':
                    MEPH.publish(Connection.constant.Constants.SavePicture, {});
                    break;
                case Connection.constant.Constants.TakeContactPicture:
                    MEPH.publish(Connection.constant.Constants.TakeContactPicture, {});
                    break;
            }
        }
        if (data.back) {
            window.history.back();
        }
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