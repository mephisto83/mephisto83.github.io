MEPH.define('Connection.control.accountbase.AccountBase', {
    extend: 'MEPH.mobile.activity.container.Container',
    mixins: ['MEPH.mobile.mixins.Activity'],
    requires: ['MEPH.util.Observable', 'MEPH.list.List'],
    injections: ['identityProviderService', 'userService'],
    properties: {
        name: null,
        accounts: null,
        $promise: null
    },
    initialize: function () {
        var me = this;
        me.great()
        me.$promise = Promise.resolve();
    },
    onLoaded: function () {
        var me = this;
        me.name = 'Accounts';
        me.great()
        if (me.activityview)
            me.activityview.hideCloseBtn();
        me.$promise = me.$promise.then(function () {
            return me.initAccounts();
        });
    },
    toDisabled: function (data, link, wrapper) {

        if (data.renderBtn && !data.rendered) {

            data.renderBtn(wrapper);
            data.rendered = true;
        }
        if (data && data.login) {
            link.removeAttribute('disabled');
        }
        else {
            link.setAttribute('disabled', 'disabled');
        }
        return null;
    },
    logInWith: function (data, execute) {
        if (execute)
            if (data && data.login) {
                return data.login(true);
            }
    },
    toOnlineBtnClass: function (online) {
        var cls = '';
        if (online) {
            cls += ' btn-hide'
        }
        return cls;
    },
    toOfflineBtnClass: function (online) {
        var cls = '';
        if (!online) {
            cls += ' btn-hide'
        }
        return cls;
    },
    toggleAccountConnection: function (data) {
        var me = this;

        if (data.online) {
            if (me.loaded && me.$inj && me.$inj.identityProviderService) {
                me.when.injected.then(function () {
                    return me.$inj.userService.toggleAccount(data);
                })
            }
        }
        else {
            data.error = 'Please sign into your account to edit its status.';
        }
    },
    toDisplayError: function (cls, data) {
        var hide = '  btn-hide';
        if (data.error) {
            setTimeout(function () {
                data.error = '';
            }, 7000)
            return cls
        }
        else {
            return cls + hide;
        }
    },
    longRunning: function (data, template, execute) {
        if (execute)
            if (data && data.online)
                data.retrieving = true;
    },
    toAccountStatus: function (cls, icon, data) {
        var me = this, hide = '  btn-hide',
            using = data.using,
            retrieving = data.retrieving;
        ;
        if (icon === 'wifi')
            if (icon === 'wifi' && retrieving) {
                return cls;
            }
            else {
                return cls + hide;
            }
        if (using) {
            if (icon === 'false') {
                return cls + hide;
            }
        }
        else if (!using) {
            if (icon === 'true') {
                return cls + hide;
            }

        }
        return cls;
    },
    initAccounts: function () {
        var me = this;
        if (me.loaded && me.$inj && me.$inj.identityProviderService) {
            me.accounts = me.accounts || MEPH.util.Observable.observable([]);
            me.accounts.clear();
            return me.$inj.identityProviderService.getIdentityProviders().then(function (providers) {
                me.accounts.push.apply(me.accounts, providers.select(function (x) {
                    x.using = false;
                    MEPH.util.Observable.observable(x);
                    if (x.online) {
                        me.accountOnline();
                    }
                    return (x);
                }));
            }).then(function () {
                return me.$inj.userService.isAttached(me.accounts);
            }).then(function (res) {

                return res;
            });
        }
        return Promise.resolve();
    },
    accountOnline: function () {
        var me = this;
    },
    onInjectionsComplete: function () {
        var me = this;
        me.$promise = me.$promise.then(function () {
            return me.initAccounts();
        });
    }
});