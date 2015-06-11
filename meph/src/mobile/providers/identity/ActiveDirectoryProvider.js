/**
 * @class MEPH.mobile.providers.identity.ActiveDirectoryProvider
 * A base class for identity providers.
 */
MEPH.define('MEPH.mobile.providers.identity.ActiveDirectoryProvider', {
    alternateNames: ['ActiveDirectoryProvider'],
    extend: 'MEPH.mobile.providers.identity.OAuthIdentityProvider',
    properties: {
        CONSTANTS: null
    },
    initialize: function () {
        var me = this;
        me.great();
        me.REQUEST_TYPE = {
            LOGIN: 'LOGIN',
            RENEW_TOKEN: 'RENEW_TOKEN',
            ID_TOKEN: 'ID_TOKEN',
            UNKNOWN: 'UNKNOWN'
        };
        me.CONSTANTS = {
            ACCESS_TOKEN: 'access_token',
            EXPIRES_IN: 'expires_in',
            ID_TOKEN: 'id_token',
            ERROR_DESCRIPTION: 'error_description',
            SESSION_STATE: 'session_state',
            STORAGE: {
                TOKEN_KEYS: 'adal.token.keys',
                ACCESS_TOKEN_KEY: 'adal.access.token.key',
                EXPIRATION_KEY: 'adal.expiration.key',
                START_PAGE: 'adal.start.page',
                FAILED_RENEW: 'adal.failed.renew',
                STATE_LOGIN: 'adal.state.login',
                STATE_RENEW: 'adal.state.renew',
                STATE_RENEW_RESOURCE: 'adal.state.renew.resource',
                STATE_IDTOKEN: 'adal.state.idtoken',
                NONCE_IDTOKEN: 'adal.nonce.idtoken',
                SESSION_STATE: 'adal.session.state',
                USERNAME: 'adal.username',
                IDTOKEN: 'adal.idtoken',
                ERROR: 'adal.error',
                ERROR_DESCRIPTION: 'adal.error.description',
                LOGIN_REQUEST: 'adal.login.request',
                LOGIN_ERROR: 'adal.login.error'
            },
            RESOURCE_DELIMETER: '|',
            ERR_MESSAGES: {
                NO_TOKEN: 'User is not authorized'
            }
        };
    },
    statics: {
        storageKeyForSource: 'active-directory-storage',
        key: 'activedirectory',
        maxWaitTime: 10000
    },
    properties: {

        storagekey: 'meph-active-directory-provider-storage-key',
        oauthpath: 'login.microsoftonline.com/'
    },
    contacts: function () {
        var me = this;
        if (me.isReady) {
            return new Promise(function (r, f) {
                /* make the API call */
                throw new Error('not implmented. Googleplus');
            })
        }
        return false;
    },
    property: function (prop) {
        var me = this;
        me.$providerpromise = me.$providerpromise.then(function () {
            return new Promise(function (resolve, f) {
                if (me.cachedResponse) {
                    resolve(me.cachedResponse);
                }
                var $timeout = setTimeout(function () {
                    resolve(null);
                }, ActiveDirectoryProvider.maxWaitTime);
                me.contact().then(function (response) {
                    resolve(response);
                }).catch(function () {
                    f('no property was retrieved.')
                });
            }).then(function (response) {
                var val = null;
                if (response)
                    if (response.error) {
                        val = null;
                    }
                return {
                    provider: me,
                    type: ActiveDirectoryProvider.key,
                    response: response,
                    value: val
                };
            });
        }).catch(function () {
            MEPH.Log('failed to retrieve property in facebook provider,  property : ' + prop);
        });
        return me.$providerpromise;
    },
    contact: function () {
        var me = this;
        return me.proxyContact();
    },
    filterResponse: function (response, prop) {
        var me = this,
            val = null;
        if (response)
            if (response.error) {
                val = null;
            }
            else
                switch (prop) {
                    case 'name':
                        val = response.name;
                        break;
                    case 'firstname':
                        val = response.given_name;
                        break;
                    case 'lastname':
                        val = response.family_name;
                        break;
                }

        return val;
    },
    //handleRedirection: function () {
    //    var me = this, hash = window.location.hash;

    //    var requestInfo = this.getRequestInfo(hash);
    //    this._createUser(requestInfo.parameters.id_token);
    //    return Promise.resolve().then(function () {
    //        ///https://graph.windows.net/6732b01c-705e-4903-b357-e21bbdd16355/me?api-version=1.5
    //        if (!requestInfo) {
    //            return null;
    //        }
    //        var rest = me.$inj.rest.clear().addPath('graph.windows.net/6732b01c-705e-4903-b357-e21bbdd16355/me')
    //        .addPath({
    //            'api-version': '1.5'
    //        }).absolute('https').header('Authorization', 'Bearer ' + requestInfo.parameters.id_token);


    //        return rest.get().then(function () {
    //            debugger
    //        }).catch(function () {
    //            debugger
    //        });
    //    });
    //},
    _getHash: function (hash) {
        if (hash.indexOf('#/') > -1) {
            hash = hash.substring(hash.indexOf('#/') + 2);
        } else if (hash.indexOf('#') > -1) {
            hash = hash.substring(1);
        }

        return hash;
    },
    _deserialize: function (query) {
        var match,
            pl = /\+/g,  // Regex for replacing addition symbol with a space
            search = /([^&=]+)=?([^&]*)/g,
            decode = function (s) { return decodeURIComponent(s.replace(pl, ' ')); },
            obj = {};
        match = search.exec(query);
        while (match) {
            obj[decode(match[1])] = decode(match[2]);
            match = search.exec(query);
        }

        return obj;
    },
    _getItem: function (key) {

        if (this.config && this.config.cacheLocation && this.config.cacheLocation === 'localStorage') {

            if (!this._supportsLocalStorage()) {
                MEPH.Log('Local storage is not supported');
                return null;
            }

            return localStorage.getItem(key);
        }

        // Default as session storage
        if (!this._supportsSessionStorage()) {
            MEPH.Log('Session storage is not supported');
            return null;
        }

        return sessionStorage.getItem(key);
    },
    _supportsLocalStorage: function () {
        try {
            return 'localStorage' in window && window['localStorage'];
        } catch (e) {
            return false;
        }
    },
    _supportsSessionStorage: function () {
        try {
            return 'sessionStorage' in window && window['sessionStorage'];
        } catch (e) {
            return false;
        }
    },
    getRequestInfo: function (hash) {
        hash = this._getHash(hash);
        var parameters = this._deserialize(hash);
        var requestInfo = { valid: false, parameters: {}, stateMatch: false, stateResponse: '', requestType: this.REQUEST_TYPE.UNKNOWN };
        if (parameters) {
            requestInfo.parameters = parameters;
            if (parameters.hasOwnProperty(this.CONSTANTS.ERROR_DESCRIPTION) ||
                parameters.hasOwnProperty(this.CONSTANTS.ACCESS_TOKEN) ||
                parameters.hasOwnProperty(this.CONSTANTS.ID_TOKEN)) {

                requestInfo.valid = true;

                // which call
                var stateResponse = '';
                if (parameters.hasOwnProperty('state')) {
                    MEPH.Log('State: ' + parameters.state);
                    stateResponse = parameters.state;
                } else {
                    MEPH.Log('No state returned');
                }

                requestInfo.stateResponse = stateResponse;

                // async calls can fire iframe and login request at the same time if developer does not use the API as expected
                // incoming callback needs to be looked up to find the request type
                switch (stateResponse) {
                    case this._getItem(this.CONSTANTS.STORAGE.STATE_LOGIN):
                        requestInfo.requestType = this.REQUEST_TYPE.LOGIN;
                        requestInfo.stateMatch = true;
                        break;

                    case this._getItem(this.CONSTANTS.STORAGE.STATE_IDTOKEN):
                        requestInfo.requestType = this.REQUEST_TYPE.ID_TOKEN;
                        this._saveItem(this.CONSTANTS.STORAGE.STATE_IDTOKEN, '');
                        requestInfo.stateMatch = true;
                        break;
                }

                // external api requests may have many renewtoken requests for different resource          
                if (!requestInfo.stateMatch &&
                    window.parent &&
                    window.parent.AuthenticationContext &&
                    window.parent.AuthenticationContext()) {
                    var statesInParentContext = window.parent.AuthenticationContext()._renewStates;
                    for (var i = 0; i < statesInParentContext.length; i++) {
                        if (statesInParentContext[i] === requestInfo.stateResponse) {
                            requestInfo.requestType = this.REQUEST_TYPE.RENEW_TOKEN;
                            requestInfo.stateMatch = true;
                            break;
                        }
                    }
                }
            }
        }

        return requestInfo;
    },
    _createUser: function (idToken) {
        var user = null;
        var parsedJson = this._extractIdToken(idToken);
        if (parsedJson && parsedJson.hasOwnProperty('aud')) {

            if (parsedJson.aud.toLowerCase() === this.args.client_id.toLowerCase()) {

                user = {
                    userName: '',
                    profile: parsedJson
                };

                if (parsedJson.hasOwnProperty('upn')) {
                    user.userName = parsedJson.upn;
                } else if (parsedJson.hasOwnProperty('email')) {
                    user.userName = parsedJson.email;
                }
            } else {
                MEPH.Log('IdToken has invalid aud field');
            }

        }

        return user;
    },
    _extractUserName: function (encodedIdToken) {
        // id token will be decoded to get the username
        try {
            var parsed = this._extractIdToken(encodedIdToken);
            if (parsed) {
                if (parsed.hasOwnProperty('upn')) {
                    return parsed.upn;
                } else if (parsed.hasOwnProperty('email')) {
                    return parsed.email;
                }
            }
        } catch (err) {
            MEPH.Log('The returned id_token could not be decoded: ' + err.stack);
        }

        return null;
    },
    _decodeJwt: function (jwtToken) {
        var idTokenPartsRegex = /^([^\.\s]*)\.([^\.\s]+)\.([^\.\s]*)$/;

        var matches = idTokenPartsRegex.exec(jwtToken);
        if (!matches || matches.length < 4) {
            MEPH.Log('The returned id_token is not parseable.');
            return null;
        }

        var crackedToken = {
            header: matches[1],
            JWSPayload: matches[2],
            JWSSig: matches[3]
        };

        return crackedToken;
    },
    _extractIdToken: function (encodedIdToken) {
        // id token will be decoded to get the username
        var decodedToken = this._decodeJwt(encodedIdToken);
        if (!decodedToken) {
            return null;
        }

        try {
            var base64IdToken = decodedToken.JWSPayload;
            var base64Decoded = this._base64DecodeStringUrlSafe(base64IdToken);
            if (!base64Decoded) {
                MEPH.Log('The returned id_token could not be base64 url safe decoded.');
                return null;
            }

            // ECMA script has JSON built-in support
            return JSON.parse(base64Decoded);
        } catch (err) {
            MEPH.Log('The returned id_token could not be decoded: ' + err.stack);
        }

        return null;
    },

    getRestInstance: function () {
        var me = this;
        return me.$inj.rest.clear().addPath(me.oauthpath)
                                .addPath({
                                    client_id: me.args.clientId,
                                    response_type: me.args.response_type,
                                    redirect_uri: me.args.redirect_uri,
                                    scope: me.args.scope,
                                    state: MEPH.GUID()
                                }).absolute();

    },
    _base64DecodeStringUrlSafe: function (base64IdToken) {
        // html5 should support atob function for decoding
        base64IdToken = base64IdToken.replace(/-/g, '+').replace(/_/g, '/');
        if (window.atob) {
            return decodeURIComponent(encodeURIComponent(window.atob(base64IdToken))); // jshint ignore:line
        }

        // TODO add support for this
        MEP.Log('Browser is not supported');
        return null;
    },
    //getRestInstance: function () {
    //    var me = this,
    //             nonce = MEPH.GUID(),
    //             state = MEPH.GUID();

    //    me.$inj.storage.set('nonce', nonce);
    //    me.$inj.storage.set('state', state);
    //    var rest = me.$inj.rest.clear().addPath(me.oauthpath)
    //                         .addPath({
    //                             client_id: me.args.clientId,
    //                             response_type: 'id_token',// me.args.response_type,
    //                             redirect_uri: me.args.redirect_uri,
    //                             scope: me.args.scope,
    //                             nonce: nonce,
    //                             state: MEPH.GUID(),

    //                         }).absolute();
    //    rest.addPath({ 'x-client-SKU': 'Js' });
    //    rest.addPath({ 'x-client-Ver': me._libVersion() });
    //    return rest;

    //},

    _libVersion: function () {
        return '1.0.0';
    },
    _addClientId: function () {
        // x-client-SKU 
        // x-client-Ver 
        return '&x-client-SKU=Js&x-client-Ver=' + this._libVersion();
    },
    getAuthRest: function (res) {
        var me = this;
        if (me.args && me.args.resource) {
            res = res.addPath({ 'api-version': '1.0' })//, prompt: 'login' 
            //return res.addPath({ resource: (me.args.resource) });
        }
        return res;
    },
    ready: function () {
        var me = this;
        MEPH.Log('google provider : ready');

        if (me.$ready) {
            return me.$ready;
        }

        me.$ready = me.when.injected.then(function () {
            MEPH.Log('setup api, and return key');
            me.isReady = true;
            me.constructor.key = me.args.key || me.constructor.key;
            me.constructor.storageKeyForSource = me.args.key ? 'storage-source-for' + me.args.key : me.constructor.storageKeyForSource;
            if (me.$inj.rest) {
                //https://login.microsoftonline.com/6732b01c-705e-4903-b357-e21bbdd16355/oauth2/authorize?api-version=1.0
                me.api = me.$inj.rest.clear()
                    .addPath('login.microsoftonline.com/')
                    .addPath(me.args.tenant)
                    .addPath('oauth2/authorize')
                    .absolute();
                me.oauthpath = me.$inj.rest.clear()
                    .addPath('login.microsoftonline.com/')
                    .addPath(me.args.tenant)
                    .addPath('oauth2/authorize').path();
                return me.online().then(function () {
                    return MEPH.mobile.providers.identity.ActiveDirectoryProvider.key;
                });
            }
        });

        return me.$ready;
    }
});