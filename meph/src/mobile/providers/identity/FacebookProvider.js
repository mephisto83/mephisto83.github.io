/**
 * @class MEPH.mobile.providers.identity.FacebookProvider
 * A base class for identity providers.
 */
MEPH.define('MEPH.mobile.providers.identity.FacebookProvider', {
    alternateNames: ['FacebookProvider'],
    extend: 'MEPH.mobile.providers.identity.OAuthIdentityProvider',
    properties: {
    },
    statics: {
        key: 'facebook',
        maxWaitTime: 10000
    },
    properties: {

        storagekey: 'meph-facebook-provider-storage-key',
        oauthpath: 'facebook.com/dialog/oauth'
        //https://www.facebook.com/dialog/oauth?
        // client_id={app-id}
        //&redirect_uri={redirect-uri}
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
                }, FacebookProvider.maxWaitTime);
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
                    else
                        switch (prop) {
                            case 'name':
                                val = response.name;
                                break;
                            case 'firstname':
                                val = response.first_name;
                                break;
                            case 'lastname':
                                val = response.last_name;
                                break;
                            case 'middlename':
                                val = response.middle_name;
                                break;
                            case 'location':
                                val = response.location.name;
                                break;
                            case 'languages':
                                val = response.languages.select(function (x) { return x.name; });
                                break;
                            case 'gender':
                                val = response.gender;
                                break;
                            case 'link':
                                val = response.link;
                                break;
                            case 'profileimage':
                                val = 'https://graph.facebook.com/' + response.id + '/picture'
                                break;
                        }
                return {
                    provider: me,
                    type: FacebookProvider.key,
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
        return (!me.isReady ? me.ready() : Promise.resolve()).then(function () {
            // This sample assumes a client object has been created.
            // To learn more about creating a client, check out the starter:
            //  https://developers.google.com/+/quickstart/javascript
            if (me.cachedResponse) {
                return me.cachedResponse;
            }

            MEPH.Log('contact : ')
            if (!me.credential) {
                return null;
            }
            //https://graph.facebook.com/v2.3/me?access_token=CAACEdEose0cBAJQWV3XImbrs5YblNwV8Uy3PxZBmugY8p3P9KxxXnutfMpGSVUlbpBpfd4E6Wqj1OPEW9gs2AnCMbAbNcU0riJQdORhsI5eEia8GrVE7Foxhi9TJVKMHZBPn8KXezZAfAZCgY9nN4qIgr1Ewi8Oj9DTUr1RJDKOOdq87UN6Ulvtyjp6YQCVMOZB1AdU83BZBEEwjjJ26ayLFtq7GbZCKwcZD&debug=all&fields=id%2Cname&format=json&method=get&pretty=0&suppress_http_code=1
            MEPH.Log('me.credential.access_token: ' + me.credential.access_token)
            //var request = me.api.addPath('/me')

            //    .addPath({
            //        access_token: me.credential.access_token,
            //        fields: 'id,name,cover,devices,email,education,gender,first_name,languages,last_name,link,location,meeting_for,middle_name,name_format,relationship_status,religion,significant_other,sports,website,work,about',
            //        format: 'json'
            //    });
            //// window.facebookapi = me.api;
            MEPH.Log('created the request ')
            var request = me.$inj.rest.addPath('proxy/call').post({
                oauth2_access_token: me.credential.access_token,
                method: 'contact',
                provider: me.constructor.key
            });
            return request.then(function (res) {

                if (res) {
                    me.cachedResponse = JSON.parse(res.jsonResult) || null;
                    return res;
                }
            });;
        })
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
                        val = response.first_name;
                        break;
                    case 'lastname':
                        val = response.last_name;
                        break;
                    case 'middlename':
                        val = response.middle_name;
                        break;
                    case 'location':
                        val = response.location.name;
                        break;
                    case 'languages':
                        val = response.languages.select(function (x) { return x.name; });
                        break;
                    case 'gender':
                        val = response.gender;
                        break;
                    case 'link':
                        val = response.link;
                        break;
                    case 'profileimage':
                        val = 'https://graph.facebook.com/' + response.id + '/picture'
                        break;
                }

        return val;
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
            me.api = me.$inj.rest.clear().addPath('graph.facebook.com/v2.3').absolute();
            return me.online().then(function () {
                return MEPH.mobile.providers.identity.FacebookProvider.key;
            });
        });

        return me.$ready;
    }
});