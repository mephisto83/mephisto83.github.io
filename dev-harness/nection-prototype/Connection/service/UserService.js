MEPH.define('Connection.service.UserService', {
    properties: {
        loggedin: false,
        $promise: null,
        $maxNumberOfRefreshAttempts: 10,
        refreshTokenKey: 'connectino-service-refresh-token',
        userIdKey: 'connection-serivce-userid-key'
    },
    mixins: {
        injectable: 'MEPH.mixins.Injections'
    },
    injections: ['rest', 'identityProvider', 'storage'],
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

                    MEPH.publish(MEPH.Constants.OPEN_ACTIVITY, { viewId: 'accountresolution', path: '/', situation: res });
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
            })
        });
    },
    setHeaders: function (result) {
        var me = this;
        me.$inj.rest.setHeader('mvc-connection.ticket', result.token);
        me.$inj.rest.setHeader('contactId', result.contactId);
        me.setUserId(result.contactId);
        me.$unsuccessfulRefresh = 0;
    },
    scheduleTokenRefresh: function (response) {
        var me = this;
        if (me.$tokenResfresh) {
            return;
        }
        me.$tokenResfresh = setTimeout(function () {
            me.$inj.rest.nocache().addPath('refresh/token').get().then(function (result) {
                me.$tokenResfresh = null;
                if (result.success && result.authorized) {
                    me.setHeaders(result);
                    me.scheduleTokenRefresh(result);
                }
                else {
                    me.$unsuccessfulRefresh = me.$unsuccessfulRefresh || 0;
                    me.$unsuccessfulRefresh++;
                    if (me.$unsuccessfulRefresh < me.$maxNumberOfRefreshAttempts) {
                        me.scheduleTokenRefresh(response);
                    }
                    else {
                        me.getUserId().then(function (userid) {
                            me.getRefreshToken().then(function (refreshtoken) {
                                me.$inj.rest.nocache().addPath('refresh/token').post({
                                    id: userid,
                                    refreshtoken: refreshtoken
                                }).then(function (result) {
                                    if (result.success && result.authorized) {
                                        me.setHeaders(result);
                                        me.scheduleTokenRefresh(result);
                                    }
                                });

                                MEPH.publish(Connection.constant.Constants.ConnectionLost, {});
                            });
                        });
                    }
                }
            })
        }, (response.expiration * .7) || 10000)//
    },
    setRefreshToken: function (token) {
        var me = this;
        me.$refreshToken = token;
        me.when.injected.then(function () {
            me.$inj.storage.set(me.refreshTokenKey, token);
        })
    },
    getRefreshToken: function () {
        var me = this;
        if (me.$refreshToken) {
            return Promise.resolve(me.$refreshToken);
        }
        return me.when.injected.then(function () {
            return me.$inj.storage.get(me.refreshTokenKey);
        })
    },
    setUserId: function (val) {
        var me = this;
        me.$userId = val;
        return me.when.injected.then(function () {
            return me.$inj.storage.set(me.userIdKey, val);
        })
    },
    getUserId: function () {
        var me = this;
        return me.when.injected.then(function () {
            return me.$inj.storage.get(me.userIdKey);
        })
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
                    me.$inj.rest.setHeader('mvc-connection.ticket', res.token);
                    me.$inj.rest.setHeader('contactId', res.contactId);
                    me.setUserId(res.contactId);
                    me.setRefreshToken(res.refreshToken);
                    //Expires 
                    // new Date(Date.now()+res.expiration)
                    me.scheduleTokenRefresh(res);
                    provider.online = res.success;
                    if (provider.online && !me.hasLoggedIn) {
                        MEPH.publish(Connection.constant.Constants.ConnectionLogIn, { provider: provider });
                        MEPH.Log('openning main view');
                        MEPH.publish(MEPH.Constants.OPEN_ACTIVITY, {
                            viewId: 'main',
                            path: '/main'
                        });
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