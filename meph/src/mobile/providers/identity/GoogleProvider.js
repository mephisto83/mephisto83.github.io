MEPH.define('MEPH.mobile.providers.identity.GoogleProvider', {
    alternateNames: ['GoogleProvider'],
    extend: 'MEPH.mobile.providers.identity.OAuthIdentityProvider',
    statics: {
        key: 'google',
        maxWaitTime: 10000
    },
    initialize: function (args) {
        MEPH.Log('initializing googleprovider');
        var me = this;
        me.args = args;
        MEPH.Log('googleprovider provider promise');
        me.$providerpromise = Promise.resolve();
        MEPH.Log('created googleprovider provider promise');
        me.great();
    },
    properties: {
        storagekey: 'meph-google-provider-storage-key',
        oauthpath: 'accounts.google.com/o/oauth2/auth'
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
                else {
                    var $timeout = setTimeout(function () {
                        resolve(null);
                    }, GoogleProvider.maxWaitTime);
                    me.contact().then(function (response) {
                        resolve(response);
                    });
                }
            }).then(function (response) {
                var val = me.filterResponse(response, prop);
                return {
                    provider: me,
                    type: GoogleProvider.key,
                    response: response,
                    value: val
                };
            });
        });
        return me.$providerpromise;
    },
    filterResponse: function (response, prop) {
        var me = this;
        var val = null;
        if (response) {
            switch (prop) {
                case 'name':
                    val = response.displayName;
                    break;
                case 'firstname':
                    val = response.name.givenName;
                    break;
                case 'lastname':
                    val = response.name.familyName;
                    break;
                case 'gender':
                    val = response.gender;
                    break;
                case 'schools':
                    val = response.organizations.where(function (x) { return x.type === 'school'; });
                    break;
                case 'work':
                    val = response.organizations.where(function (x) { return x.type === 'work'; });
                    break;
                case 'link':
                    val = response.link;
                    break;
                case 'profileimage':
                    if (response.image && response.image.url)
                        val = response.image.url.split('?')[0] + '?sz=150';
                    else if (response.cover && response.cover.source) {
                        val = response.cover.source.split('?')[0] + '?sz=150';
                    }
                    break;
                case 'profileimage-large':
                    if (response.image && response.image.url)
                        val = response.image.url.split('?')[0] + '?sz=150';
                    else if (response.cover && response.cover.source) {
                        val = response.cover.source.split('?')[0] + '?sz=150';
                    }
                    break;
                case 'occupation':
                    val = response.occupation;
                    break;
                case 'skills':
                    val = response.skills;
                    break;
                case 'url':
                    val = response.url;
                    break;
            }
        }
        return val;
    },
    contact: function () {
        var me = this;
        return (!me.isReady ? me.ready() : Promise.resolve()).then(function () {
            // This sample assumes a client object has been created.
            // To learn more about creating a client, check out the starter:
            //  https://developers.google.com/+/quickstart/javascript
            if (me.cachedResponse) {
                return me.cachedResponse;
            }
            //https://www.googleapis.com/?key={YOUR_API_KEY}
            MEPH.Log('contact : ')
            if (!me.credential) {
                return null;
            }
            MEPH.Log('me.credential.access_token: ' + me.credential.access_token)
            var request = me.api.addPath('plus/v1/people/me')
                .header('Authorization', 'Bearer ' + me.credential.access_token)
                .addPath({ key: me.args.apiKey })
            ;
            MEPH.Log('created the request ')

            return request.get().then(function (res) {
                me.cachedResponse = res || null;
                return res;
            });;
        })
    },
    extractcode: function (code) {
        MEPH.Log('extract code : google');
        MEPH.Log(code);
        return code;
    },

    logoff: function () {
        MEPH.Log('not implemented yet: logoff google provider')

        var me = this;
        return Promise.resolve().then(function () {
            return true;
        });
    },
    ready: function () {
        var me = this;
        MEPH.Log('google provider : ready');


        return me.when.injected.then(function () {
            MEPH.Log('setup api, and return key');
            me.isReady = true;
            me.api = me.$inj.rest.clear().addPath('www.googleapis.com').absolute();
            return me.online().then(function () {
                return MEPH.mobile.providers.identity.GoogleProvider.key;
            });
        });
    }
});
MEPH.Log('after define googleprovider')