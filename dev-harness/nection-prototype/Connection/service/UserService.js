MEPH.define('Connection.service.UserService', {
    properties: {
        loggedin: false,
        $promise: null,
        refreshTokenKey: 'connectino-service-refresh-token',
        userIdKey: 'connection-serivce-userid-key',
        cards: null
    },
    mixins: {
        injectable: 'MEPH.mixins.Injections'
    },
    injections: [
        'rest',
        'identityProvider',
        'stateService',
        'storage',
        'customProvider',
        'tokenService'
    ],
    initialize: function () {
        var me = this;
        MEPH.Events(me);
        me.mixins.injectable.init.apply(me);
        me.ready = new Promise(function (r) {
            me.injectionsResolve = r;
        }).then(function () {
            return me.$inj.identityProvider.ready();
        });

        MEPH.subscribe(Connection.constant.Constants.LoggedIn, function (type, args) {
            me.loggedin = true;
            me.fire('statuschanged', true);
            me.checkCredentials(args.provider);
        });
        MEPH.subscribe(Connection.constant.Constants.MultipleLogins, function (type, args) {
            me.checkProviderConsistency(args.providers);
        })
        me.hasLoggedIn = false
        me.hasCompletedLogin = new Promise(function (resolve) {
            me.executeAfterLogin = resolve;
        });
        MEPH.subscribe(Connection.constant.Constants.ConnectionLogOut, function () {
            me.hasCompletedLogin = new Promise(function (resolve) {
                me.executeAfterLogin = resolve;
            });
        });
        me.$promise = Promise.resolve();
    },
    onInjectionsComplete: function () {
        var me = this;
        me.injectionsResolve();
    },
    heart: function () {
        var me = this;
        me.ready.then(function () {
            return me.$inj.rest.nocache().addPath('heart/beat').get().then(function () {
                MEPH.Log('heart/beat[get] success')
            }).catch(function (x) {
                MEPH.Log('heart/beat[get] failed')
            })
        }).then(function () {
            return me.$inj.rest.nocache().addPath('heart/beat').post().then(function () {
                MEPH.Log('heart/beat[post] success')
            }).catch(function (x) {
                MEPH.Log('heart/beat[post] failed')
            })
        }).then(function () {
            return me.$inj.rest.nocache().addPath('heart/beat').patch().then(function () {
                MEPH.Log('heart/beat[patch] success')
            }).catch(function (x) {
                MEPH.Log('heart/beat[patch] failed')
            })
        }).then(function () {
            return me.$inj.rest.nocache().addPath('heart/beat').options().then(function () {
                MEPH.Log('heart/beat[options] success')
            }).catch(function (x) {
                MEPH.Log('heart/beat[options] failed')
            })
        }).then(function () {
            return me.$inj.rest.nocache().addPath('heart/beat').head().then(function () {
                MEPH.Log('heart/beat[head] success')
            }).catch(function (x) {
                MEPH.Log('heart/beat[head] failed')
            })
        }).then(function () {
            return me.$inj.rest.nocache().addPath('heart/beat').remove().then(function () {
                MEPH.Log('heart/beat[delete] success')
            }).catch(function (x) {
                MEPH.Log('heart/beat[delete] failed')
            })
        })
    },
    myCards: function (clear) {
        var me = this;
        if (clear) {
            me.cards = null;
        }
        return me.when.injected.then(function () {
            if (me.cards) {
                return me.cards;
            }
            if (me.loggedin)
                return me.$inj.customProvider.retrieveCards().catch(function () {
                    return me.myCards();
                });
            else {
                return me.hasCompletedLogin.then(function () {
                    return me.$inj.customProvider.retrieveCards();
                }).catch(function () {
                    return me.myCards();
                });
            }
        }).then(function (cards) {
            me.cards = cards;
            return me.cards;
        });
    },
    checkProviderConsistency: function (providers) {
        var me = this;
        return me.ready.then(function () {
            var $providers = providers.select(function (provider) {
                var $provider = me.$inj.identityProvider.getProviders().first(function (x) {
                    return x.key.toLowerCase() === provider.name.toLowerCase();
                });
                return $provider;
            });

            return me.$inj.rest.nocache().addPath('consistent/login').post($providers.select(function ($provider) {
                var creds;
                if ($provider && $provider.p && $provider.p.credentials) {
                    creds = $provider.p.credentials()
                    if (creds) {
                        creds.provider = $provider.key.toLowerCase()
                    }
                }
                return creds;
            }).where()
            ).then(function (res) {
                if (res && res.authorized && res.isConsistent) {
                    for (var i in res.attachedProvider) {
                        var firstprovider = res.attachedProvider[i].first();
                        var $provider = providers.first(function (provider) {
                            return firstprovider === provider.name.toLowerCase();
                        });
                        me.checkCredentials($provider);
                        break; accountres
                    }
                }
                else if (res) {
                    //Go to a page to decide which to use or merge.
                    me.when.injected.then(function () {
                        return me.$inj.stateService.set(Connection.constant.Constants.MergeSituation, { situation: res });
                    }).then(function () {
                        MEPH.publish(MEPH.Constants.OPEN_ACTIVITY, { viewId: 'accountresolution', path: '/' });
                    });
                }
            })
            .catch(function (res) {
                debugger
            });
        });

    },
    mergeAccounts: function () {
        var me = this;
        return me.ready.then(function () {
            var $providers = me.$inj.identityProvider.getProviders().where(function ($provider) {
                return $provider.p && $provider.p.credentials && $provider.p.credentials();
            }).select(function ($provider) {
                var t = $provider.p.credentials();
                t.provider = $provider.key;
                return t;
            });

            return me.$inj.rest.nocache().addPath('account/merge').post($providers).then(function (res) {
                if (res.success) {
                    MEPH.publish(MEPH.Constants.OPEN_ACTIVITY, { viewId: 'main', path: '/main' });
                }
                else {
                    debugger
                }
            }).catch(function (error) {
                debugger;
            });
        });
    },
    applyAccountSetup: function (config) {
        var me = this;
        return me.ready.then(function () {
            if (config) {
                var $providers = me.$inj.identityProvider.getProviders().where(function ($provider) {
                    return $provider.p && $provider.p.credentials && $provider.p.credentials();
                }).select(function ($provider) {
                    var t = $provider.p.credentials();
                    t.provider = $provider.key;
                    return t;
                });
                debugger
                config.forEach(function (c) {
                    var contactId = c.contactid;
                    c.source.forEach(function (s) {

                        var $provider = $providers.first(function (x) {
                            if (x.provider === 'google' && s === 'google-plus') {
                                return true;
                            }
                            return x.provider === s;
                        });
                        if ($provider) {
                            $provider.contactId = contactId;
                        }
                    })
                });

                return me.$inj.rest.nocache().addPath('account/apply').post($providers).then(function (res) {
                    debugger
                }).catch(function (error) {
                    debugger;
                });
            }
        });
    },
    /**
     * Checks the users credentials.
     **/
    checkCredentials: function (provider) {
        var me = this;
        MEPH.Log('Check credentials of ' + provider.name);
        //      me.$promise = me.$promise.then(function () {
        return me.ready.then(function () {

            var $provider = me.$inj.identityProvider.getProviders().first(function (x) {
                return x.key.toLowerCase() === provider.name.toLowerCase();
            });

            return me.$inj.rest.nocache().addPath('login/{provider}').post({
                provider: provider.name.toLowerCase()
            }, $provider && $provider.p && $provider.p.credentials ? $provider.p.credentials() : null).then(function (res) {

                MEPH.Log('Got check results');
                if (res && res.authorized) {
                    me.$inj.tokenService.start(res);
                    provider.online = res.success;
                    if (provider.online && !me.hasLoggedIn) {
                        MEPH.publish(Connection.constant.Constants.ConnectionLogIn, { provider: provider });
                        MEPH.Log('openning main view');
                        MEPH.publish(MEPH.Constants.OPEN_ACTIVITY, {
                            viewId: 'main',
                            path: '/main'
                        });
                        me.executeAfterLogin();
                        me.hasLoggedIn = true;
                        return true;
                    }
                }
                else {
                    if ($provider && $provider.p && $provider.p.credentials)
                        $provider.p.credentials(false);
                    provider.online = false;
                }
                return false;
            }).catch(function (error) {
                if ($provider && $provider.p && $provider.p.credentials)
                    $provider.p.credentials(false);
                provider.online = false;
            })
        });
        //return Promise.resolve().then(function () {
        //    if (provider.online && !me.hasLoggedIn) {
        //        MEPH.publish(Connection.constant.Constants.ConnectionLogIn, {});
        //        MEPH.publish(MEPH.Constants.OPEN_ACTIVITY, { viewId: 'main', path: '/main' });
        //        me.hasLoggedIn = true;
        //        return true;
        //    }
        //    return false;
        //});
        //    });
        //  return me.$promise;
    },
    isAttached: function (accounts) {
        var me = this;
        return me.ready.then(function () {
            return new Promise(function (r, f) {
                me.$inj.rest.nocache().addPath('account/get').nocache().get().then(function (res) {
                    if (res && res.success && res.authorized) {
                        accounts.foreach(function (current) {
                            if (res.accounts.first(function (x) { return x.identitySource === current.type; })) {
                                current.retrieving = false
                                current.using = true;
                            }
                            else {
                                current.retrieving = false;
                                current.using = false;
                            }
                        })
                    }

                }).catch(function (e) {
                    MEPH.Log(e);
                });
            });
        });
    },
    toggleAccount: function (current) {
        var me = this;

        return me.ready.then(function () {
            return new Promise(function (r, f) {
                me.$inj.rest.nocache().addPath('account/get').nocache().get().then(function (res) {
                    if (res && res.authorized) {
                        var $provider = me.$inj.identityProvider.getProviders().first(function (x) {
                            return x.key.toLowerCase() === current.type.toLowerCase();
                        });

                        if (res.accounts.first(function (x) { return x.identitySource === current.type; })) {
                            me.$inj.rest.nocache().addPath('account/unattach/{provider}').post({
                                provider: current.name.toLowerCase()
                            }, $provider && $provider.p && $provider.p.credentials ? $provider.p.credentials() : null)
                                .then(function (res) {
                                    if (res.authorized) {
                                        if (res.success) {
                                        }
                                        current.retrieving = false
                                        current.using = !res.success
                                    }
                                });
                        }
                        else {
                            me.$inj.rest.nocache().addPath('account/attach/{provider}').post({
                                provider: current.name.toLowerCase()
                            }, $provider && $provider.p && $provider.p.credentials ? $provider.p.credentials() : null)
                            .then(function (res) {
                                if (res.success && res.authorized) {
                                }
                                current.retrieving = false;
                                current.using = res.success
                            });
                        }
                    }

                });
            });
        });
    },
    isLoggedIn: function () {
        var me = this;
        return me.loggedin;
    }
})