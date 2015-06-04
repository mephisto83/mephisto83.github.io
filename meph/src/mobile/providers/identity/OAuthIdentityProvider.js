MEPH.define('MEPH.mobile.providers.identity.OAuthIdentityProvider', {
    requires: ['MEPH.util.Style', 'MEPH.mixins.Injections'],
    injections: ['rest', 'storage', 'popup', 'overlayService'],
    mixins: {
        injectable: 'MEPH.mixins.Injections'
    },
    extend: 'MEPH.mobile.providers.identity.IdentityProvider',
    initialize: function () {
        var me = this;


        me.mixins.injectable.init.apply(me);

        me.great();
    },
    applyResponse: function (response, array) {
        var me = this;
        array.foreach(function (item) {
            var add, source = item.source.first(function (x) { return x.provider === me.constructor.key; });
            if (!source) {
                source = {};
                add = true;
            }
            var val = me.filterResponse(response, item.prop);
            source.label = val + '(' + me.constructor.key + ')';
            source.provider = me.constructor.key;/// options.provider && options.provider == 'name' ? obj.type : obj.provider,
            source.type = me.constructor.key,
            source.value = val;
            if (add && val) {
                item.source.push(source);
            }
            MEPH.publish(MEPH.Constants.OAuthPropertyApplied, {
                property: item.prop,
                key: me.constructor.key,
                value: val
            });
        })
    },
    source: function (array) {
        var me = this;
        return (!me.isReady ? me.ready() : Promise.resolve()).then(function () {
            return me.$inj.storage.get(me.storageKeyForSource).then(function (res) {
                if (res) {
                    me.applyResponse(res, array);
                }
            }).catch(function () {
                MEPH.Log('Couldnt get custom storage cache', 9);
            }).then(function () {
                return me.contact().then(function (response) {
                    if (response)
                        me.applyResponse(response, array);
                    if (me.$inj.storage && response)
                        return me.$inj.storage.set(me.storageKeyForSource, response);
                });

            });
        });
    },
    getAuth: function (code) {
        var me = this;
        MEPH.Log(me.args.authPath);
        MEPH.Log('Get authorization  of ' + me.constructor.key, 6)

        return me.$inj.rest.nocache()
            .withCredentials()
            .absolute(me.args.http)
            .clear()
            .addPath(me.args.authPath).post({
                code: me.extractcode(code),
                client_id: me.args.clientId,
                mobile: window.runningInCordova || false,
                provider: me.constructor.key,
                redirect_uri: me.args.redirect_uri,
                grant_type: 'authorization_code'
            })
            .then(function (res) {
                MEPH.Log('getting auth was successful');
                if (res && res.jsonResult) {
                    try {
                        MEPH.Log('<code>' + res.jsonResult + '</code>');
                        return JSON.parse(res.jsonResult);
                    }
                    catch (e) {
                    }
                }
            });
    },
    extractcode: function (code) {
        MEPH.Log('extracting code ');
        var res = code[1].split('&')[0];
        MEPH.Log(res);

        return res;
    },
    deleteCookies: function () {
        var me = this;
        //MEPH.util.Dom.deleteCookie('mvc-connection.ticket');
    },
    online: function () {
        var me = this,
            wasonline = me.isonline || false;
        return Promise.resolve().then(function () {
            if (me.$inj.storage) {
                return me.$inj.storage.get(me.storagekey).then(function (res) {
                    me.credential = res || null;
                    if (me.credential) {
                        return me.contact().then(function (res) {
                            MEPH.Log('getting online status.')
                            MEPH.Log('Got online status of ' + me.constructor.key)
                            me.isonline = res ? true : false;

                        }).catch(function (e) {
                            me.isonline = false;
                            MEPH.Log('Caught an error checking for online status of ' + me.constructor.key)
                            me.credential = null;
                            me.deleteCookies();
                            return me.$inj.storage.set(me.storagekey, null)
                                .catch(function () {
                                    MEPH.Log('There was a problem storing a null for he credentials.');
                                });

                        });
                    }
                }).catch(function () {
                    MEPH.Log('couldnt get something out of storage.')
                });
            }
        }).then(function () {
            if (wasonline !== me.isonline) {
                MEPH.publish(MEPH.Constants.ProviderStatusChange, {
                    provider: me,
                    online: me.isonline || false
                });
            }
            return me.isonline || false;
        }).catch(function () {
            MEPH.Log('An error occurred while checking the online status of : ');
            MEPH.Log(me.constructor.key);
        })
    },
    credentials: function (val) {
        var me = this;

        if (me.credential) {
            me.credential.client_id = me.args.clientId;
        }

        if (val !== undefined) {
            me.credential = val;
            if (!val) {
                me.isonline = false;
            }
            if (me.$inj.storage) {
                me.$inj.storage.set(me.storagekey, me.credential)
                    .catch(function () {
                        MEPH.Log('There was a problem storing a null for he credentials.');
                    });
            }
        }


        return me.credential || null;
    },
    handleRedirection: function () {
        var me = this,
            handle;
        handle = function (url, resolving, failing) {
            MEPH.Log('try handle');
            code = /\?code=(.+)$/.exec(url);
            try {
                code = code || (url.split('&').first(function (t) {
                    return t.indexOf('code=') === 0;
                }) || '').split('code=').last()
            }
            catch (e) {
            }
            var error = /\?error=(.+)$/.exec(url);

            try {
                var temp = url.split('&').first(function (t) {
                    return t.indexOf('error=') === 0;
                })
                if (temp) {
                    error = error ||
                        temp.split('error=').last();
                }
            }
            catch (e) {
            }
            MEPH.Log('check code || error');
            if (code || error) {
                MEPH.Log('has code || error');
                // me.authorizationWindow.close();
                if (code) {
                    MEPH.Log('got the code code.');
                    if (resolving) {
                        MEPH.Log('is resolving');
                        resolving(code);
                    }
                    //resolve(code);
                }
                else {
                    MEPH.Log('error trying to get code.');
                    if (failing) {
                        failing(error);
                    }
                    //fail(error);
                }
                MEPH.Log('resolving the promise')
                return true;
            }
        };
        var url = window.location.search;
        return new Promise(function (r, f) {
            handle(url, r, f)
        }).then(me.authorizeResult.bind(me));
    },
    authorizeResult: function (res) {
        var me = this;
        var code = res;
        return Promise.resolve().then(function () {
            MEPH.Log('attempt to get authroization from home.')
            return me.getAuth(res);
        }).catch(function (errro) {
            MEPH.Log('Couldnt get authroization from home.');
            MEPH.Log('Response text')
            MEPH.Log(errro.responseText);
            me.isonline = false;
            return false;
        }).then(function (res) {
            MEPH.Log('getting contact with credentials.')
            me.credential = res;
            return me.contact().then(function (res) {
                MEPH.Log('got contact information from google.');
                return Promise.resolve().then(function () {
                    if (me.credential) {
                        me.credential.code = me.extractcode(code);
                        me.credential.client_id = me.args.clientId; // me.getClientId(res);
                        if (me.$inj.storage) {
                            return me.$inj.storage.set(me.storagekey, me.credential);
                        }
                    }
                }).catch(function () {
                    MEPH.Log('There was a problem storing the credentials for ' + me.constructor.key, 2);
                }).then(function () {;
                    me.isonline = true;

                    MEPH.Log('ProviderStatusChange');
                    MEPH.publish(MEPH.Constants.ProviderStatusChange, {
                        provider: me,
                        online: true
                    });
                    return true;
                });
            }).catch(function (e) {
                MEPH.Log('There was a problem getting the contact information.')
                MEPH.Log(e);

                return Promise.reject(e);
            })
        });
    },
    getAuthUrl: function () {
        var me = this;
        var rest = me.$inj.rest.clear().addPath(me.oauthpath)
                             .addPath({
                                 client_id: me.args.clientId,
                                 response_type: me.args.response_type,
                                 redirect_uri: me.args.redirect_uri,
                                 scope: me.args.scope,
                                 state: MEPH.GUID()
                             }).absolute();
        return rest.path();
    },
    login: function () {
        var me = this,
            wasonline = me.isonline;
        MEPH.Log('login');
        return me.ready()
            .then(function () {
                return me.online();
            })
            .then(function () {
                if (me.isonline) {
                    if (!wasonline) {
                        MEPH.Log('ProviderStatusChange');
                        MEPH.publish(MEPH.Constants.ProviderStatusChange, {
                            provider: me,
                            online: true
                        });
                    }
                    return me.isonline;
                }
                return Promise.resolve().then(function () {

                    MEPH.Log('ready');
                    if (me.$inj && me.$inj.rest) {
                        var rest = me.$inj.rest.clear().addPath(me.oauthpath)
                                .addPath({
                                    client_id: me.args.clientId,
                                    response_type: me.args.response_type,
                                    redirect_uri: me.args.redirect_uri,
                                    scope: me.args.scope,
                                    state: MEPH.GUID()
                                }).absolute();
                        return new Promise(function (resolve, fail) {
                            var authUrl = rest.path(),
                                code,
                                handle,
                                loadstarthandler = function (e) {
                                    MEPH.Log('window started');
                                    var url = e && e ? e.url : null;
                                    MEPH.Log('window url ' + url);
                                    handle(url, function () {
                                        MEPH.Log('removing the event listener.');
                                        me.authorizationWindow.removeEventListener(loadstarthandler);
                                    });
                                };
                            MEPH.Log(authUrl);
                            handle = function (url, resolving, failing) {
                                MEPH.Log('try handle');
                                code = /\?code=(.+)$/.exec(url);
                                try {
                                    code = code || url.split('&').first(function (t) {
                                        return t.indexOf('code=') === 0;
                                    }).split('code=').last()
                                }
                                catch (e) {
                                }
                                var error = /\?error=(.+)$/.exec(url);

                                try {
                                    url.split('&').first(function (t) {
                                        return t.indexOf('error=') === 0;
                                    }).split('error=').last();
                                }
                                catch (e) {
                                }
                                MEPH.Log('check code || error');
                                if (code || error) {
                                    MEPH.Log('has code || error');
                                    me.authorizationWindow.close();
                                    if (code) {
                                        MEPH.Log('got the code code.');
                                        if (resolving) {
                                            MEPH.Log('is resolving');
                                            resolving();
                                        }
                                        resolve(code);
                                    }
                                    else {
                                        MEPH.Log('error trying to get code.');
                                        if (failing) {
                                            failing();
                                        }
                                        fail(error);
                                    }
                                    MEPH.Log('resolving the promise')
                                    return true;
                                }
                            };

                            if (!window.runningInCordova) {
                                window.location.href = authUrl;
                                //Pick up the location later.
                            }
                            else
                                return Promise.resolve().then(function () {
                                    var authWindow = window.open(authUrl, '_blank', 'location=yes,toolbar=yes');
                                    if (authWindow == null || typeof (authWindow) === 'undefined') {
                                        MEPH.Log("Turn off your pop-up blocker!");
                                        return me.$inj.popup.open(me.constructor.key, authUrl).then(function (res) {
                                            me.authorizationWindow = res;
                                        })
                                    }
                                    else {
                                        MEPH.Log('window has been detected.')
                                        me.authorizationWindow = authWindow;
                                        if (window.runningInCordova) {
                                            me.authorizationWindow.addEventListener('loadstart', loadstarthandler);
                                        }
                                    }
                                }).then(function () {
                                    MEPH.Log('checkin if running in cordova,ok');

                                    /* */
                                    if (!window.runningInCordova) {
                                        var count = 0;
                                        var interval = setInterval(function () {
                                            if (me.authorizationWindow && me.authorizationWindow.location) {
                                                MEPH.Log('checking');
                                                var url = me.authorizationWindow.location.search;
                                                if (handle(url)) {
                                                    try {
                                                        MEPH.Log('closing');
                                                        me.authorizationWindow.close();
                                                        me.authorizationWindow = null;
                                                        clearInterval(interval);
                                                    }
                                                    catch (e) {
                                                        MEPH.Log('an error occured while finishing "handle".')
                                                    }
                                                }
                                            }
                                            count++;

                                            if (count > 50000) {
                                                clearInterval(interval);
                                            }
                                        }, 10);
                                    }
                                });
                            //}
                        }).then(function (res) {
                            MEPH.Log('attempt to get authroization from home.')
                            return me.getAuth(res);
                        }).catch(function (errro) {
                            MEPH.Log('Couldnt get authroization from home.');
                            MEPH.Log('Response text')
                            MEPH.Log(errro.responseText);
                            me.isonline = false;
                            return false;
                        }).then(function (res) {
                            MEPH.Log('getting contact with credentials.')
                            me.credential = res;

                            return me.contact().then(function (res) {
                                MEPH.Log('got contact information from google.');
                                return Promise.resolve().then(function () {
                                    if (me.credential) {
                                        me.credential.code = me.extractcode(code);
                                        me.credential.client_id = me.getClientId(res);
                                        if (me.$inj.storage) {
                                            return me.$inj.storage.set(me.storagekey, me.credential);
                                        }
                                    }
                                }).catch(function () {
                                    MEPH.Log('There was a problem storing the credentials for ' + me.constructor.key, 2);
                                }).then(function () {;
                                    me.isonline = true;

                                    MEPH.Log('ProviderStatusChange');
                                    MEPH.publish(MEPH.Constants.ProviderStatusChange, {
                                        provider: me,
                                        online: true
                                    });
                                    return true;
                                });
                            }).catch(function (e) {
                                MEPH.Log('There was a problem getting the contact information.')
                                MEPH.Log(e);

                                return Promise.reject(e);
                            })
                        });
                    }
                });
            });
    },
    getClientId: function (res) {
        if (!res)
            return null;
        return res.id;
    }
});