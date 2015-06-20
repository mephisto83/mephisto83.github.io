MEPH.define('Connection.service.IdentityProviderService', {
    injections: ['identityProvider'],
    properties: {
        providers: null,
        $promise: null
    },
    requires: ['MEPH.mixins.Injections', 'Connection.constant.Constants'],
    mixins: {
        injectable: 'MEPH.mixins.Injections'
    },
    initialize: function () {
        var me = this;
        me.$promise = Promise.resolve();
        me.mixins.injectable.init.apply(me);
        me.providers = [
            { type: 'bridge', name: 'Bridge', $iconclass: 'bridge' },
            { type: 'facebook', name: 'Facebook', $iconclass: 'facebook' },
        { type: 'google', name: 'Google', $iconclass: 'google-plus' },
        //{ type: 'twitter', name: 'Twitter', $iconclass: 'twitter' },
        //{ type: 'paypal', name: 'Paypal' },
        //{ type: 'yahoo', name: 'Yahoo', $iconclass: 'yahoo' },
        { type: 'linkedin', name: 'LinkedIn', $iconclass: 'linkedin' }//,
        //{ type: 'microsoft account', name: 'Microsoft Account', $iconclass: 'microsoft' },
        //{ type: 'salesforce', name: 'Salesforce' },
        //{ type: 'foursquare', name: 'Foursquare', $iconclass: 'foursquare' },
        //{ type: 'amazon', name: 'Amazon' },
        //{ type: 'disqus', name: 'Disqus' },
        //{ type: 'instagram', name: 'Instagram', $iconclass: 'instagram' },
        //{ type: 'github', name: 'Github', $iconclass: 'github' },
        //{ type: 'bitbucket', name: 'Bitbucket', $iconclass: 'bitbucket' },
        //{ type: 'pinterest', name: 'Pinterest', $iconclass: 'pinterest' },
        //{ type: 'mixi', name: 'Mixi' },
        //{ type: 'mydigipass', name: 'MYDIGIPASS' },
        //{ type: 'renren', name: 'Renren' },
        //{ type: 'sinawelbo', name: 'Sin Welbo' },
        //{ type: 'soundcloud', name: 'Soundcloud', $iconclass: 'soundcloud' },
        //{ type: 'tumblr', name: 'Tumblr', $iconclass: 'tumblr' },
        //{ type: 'vk', name: 'VK', $iconclass: 'vk' },
        //{ type: 'xing', name: 'Xing' },
        //{ type: 'tencentweibo', name: 'Tencent Weibo' },
        //{ type: 'qq', name: 'QQ' },
        //{ type: 'aol', name: 'AOL' },
        //{ type: 'blogger', name: 'Blogger' },
        //{ type: 'flickr', name: 'Flickr', $iconclass: 'flickr' },
        //{ type: 'reddit', name: 'Reddit', $iconclass: 'reddit' },
        //{ type: 'livejournal', name: 'LiveJournal' },
        //{ type: 'netlog', name: 'Netlog' },
        //{ type: 'openid', name: 'OpenID', $iconclass: 'openid' },
        //{ type: 'verisign', name: 'Verisign' },
        //{ type: 'wordpress', name: 'WordPress' }
        ]
            .where(function (x) { return x.$iconclass; })
        .select(function (x) {
            var te = x.$iconclass;
            x.online = false;
            x.using = false;
            x.loginAdded = false;
            x.class = '';
            x.btnAttributes = null;
            x.retrieving = false;
            x.error = '';
            x.$iconclass = 'fa fa-' + te;
            x.$btnclass = 'btn btn-block btn-social btn-' + te;
            MEPH.util.Observable.observable(x);
            return x;
        });
        MEPH.subscribe(MEPH.Constants.ProviderStatusChange,
            me.providerStatusChange.bind(me))
    },
    onInjectionsComplete: function () {
        var me = this, identityProvider;
        me.updateProviders();
    },
    providerStatusChange: function (type, args) {
        var me = this;
        var provider = me.providers.first(function (obj) {
            return obj.type === args.provider.constructor.key;;
        });
        provider.online = args.online;
    },
    updateProviders: function () {
        var me = this;
        MEPH.Log('Updating providers');
        if (me.$inj && me.$inj.identityProvider) {
            identityProvider = me.$inj.identityProvider;
            me.$promise = me.$promise.then(function () {
                return identityProvider.ready().then(function () {
                    MEPH.Log('Identity provider ready');
                    var providers = identityProvider.getProviders();
                    return Promise.all(providers.select(function (obj) {
                        var prov = me.providers.first(function (x) { return x.type === obj.key; });
                        if (prov) {
                            if (obj.p.renderBtn) {
                                prov.renderBtn = obj.p.renderBtn.bind(obj.p);
                            }
                            return obj.p.ready().then(function () {
                                prov.online = prov.online || false;
                                prov.login = function (toggle) {
                                    MEPH.Log('Login attempting')
                                    if (!prov.online || !toggle) {
                                        return obj.p.login().then(function (res) {
                                            MEPH.Log('Login attempted');
                                            prov.online = res;
                                            MEPH.Log(obj.key + ' provider online state : ' + res);
                                            if (res)
                                                MEPH.publish(Connection.constant.Constants.LoggedIn, { provider: prov });
                                            return prov;
                                        });;
                                    }
                                    else {
                                        Promise.resolve().then(function () {
                                            return prov;
                                        });
                                    }
                                };
                                prov.loginAdded = true;
                                return {
                                    obj: obj,
                                    provider: prov
                                };
                            }).catch(function (e) {
                                MEPH.Log('couldnt get ' + obj.key);
                                //debugger
                                MEPH.Log(e);
                            });
                        }
                    }).where());

                }).then(function (res) {

                    var currentlyonlineproviders = res.where().where(function (x) {
                        return x.provider.online;
                    });
                    if (currentlyonlineproviders.length === 1) {
                        var provider = currentlyonlineproviders.first().provider;
                        MEPH.publish(provider.online ? Connection.constant.Constants.LoggedIn : Connection.constant.Constants.LoggedOut, {
                            provider: provider
                        });
                    }
                    else if (currentlyonlineproviders.length > 1) {

                        MEPH.publish(Connection.constant.Constants.MultipleLogins, {
                            providers: currentlyonlineproviders.select(function (x) { return x.provider })
                        });
                    }
                    return res;
                });
            });
        }
        return me.$promise;
    },
    getIdentityProviders: function () {
        var me = this;
        return Promise.resolve().then(function () {
            return me.providers.select(function (x) { return x; });
        })
    }
});