/**
 * @class MEPH.mobile.providers.identity.LinkedInProvider
 * @extend MEPH.mobile.providers.identity.IdentityProvider
 * A base class for the LinkedIn identity providers.
 */
MEPH.define('MEPH.mobile.providers.identity.LinkedInProvider', {
    extend: 'MEPH.mobile.providers.identity.OAuthIdentityProvider',
    alternateNames: ['LinkedInProvider'],
    properties: {
        isReady: false,
        $providerpromise: null,
        $response: null,
        storagekey: 'meph-linkedid-provider-storage-key',
        oauthpath: 'www.linkedin.com/uas/oauth2/authorization'
    },
    statics: {
        storageKeyForSource: 'meph-linkedin-provider-storage-key-source',
        storagekey: 'meph-linkedid-provider-storage-key',
        maxWaitTime: 10000,
        key: 'linkedin'
    },
    initialize: function (args) {
        var me = this;
        me.args = args;
        me.$providerpromise = Promise.resolve();
        me.great();
    },
    contacts: function () {
        return Promise.resolve().then(function () {
            return [];
        });
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
                    }, LinkedInProvider.maxWaitTime);
                    me.contact().then(function (response) {
                        clearTimeout($timeout);
                        resolve(response);
                    });
                }
            }).then(function (response) {
                var val = me.filterResponse(response, prop);
                if (Array.isArray(val)) {
                    return val.select(function (t) {
                        t.provider = me;
                        t.type = LinkedInProvider.key;
                        t.response = response;
                        return t;
                    })
                }
                else {
                    return {
                        provider: me,
                        type: LinkedInProvider.key,
                        response: response,
                        value: val
                    };
                }
            });
        });
        return me.$providerpromise;
    },
    filterResponse: function (response, prop) {
        var me = this;
        var val = null;
        if (response) {
            switch (prop) {
                case 'headline':
                    val = response.headline;;
                    break;
                case 'name':
                    val = response.firstName + ' ' + response.lastName;
                    break;
                case 'firstname':
                    val = response.firstName;
                    break;
                case 'lastname':
                    val = response.lastName;
                    break;
                case 'gender':
                    break;
                case 'link':
                    break;
                case 'profileimage':
                    val = response.pictureUrl;
                    if (response && response.pictureUrls && response.pictureUrls.values) {
                        val = response.pictureUrls.values.last() || val;
                    }
                    break;
                case 'occupation':
                    if (response.positions) {
                        var job1 = response.positions.values.first();
                        if (job1) {
                            val = job1.title;
                        }
                    }
                    break;
                case 'company':
                    if (response.positions) {
                        var job1 = response.positions.values.first();
                        if (job1 && job1.company) {
                            val = job1.company.name;
                        }
                    }
                    break;
                case 'companies':
                    if (response.positions) {
                        val = response.positions.values.select(function (x) {
                            return {
                                value: x.title + ', ' + x.company.name,
                                title: x.title,
                                company: x.company.name,
                                companyid: x.id,
                                key: LinkedInProvider.key
                            };
                        });
                    }
                    break;
                case 'skills':
                    if (response.skills && response.skills.values)
                        val = response.skills.values.select(function (skill) { return skill.skill.name }).join();
                    if (response.summary) {
                        val = response.summary;
                    }
                    break;
            }
        }
        return val;
    },
    contact: function () {
        var me = this;
        return me.proxyContact();
    },
    getClientId: function (res) {
        if (!res)
            return null;

        return res.id || res.member_id;
    },
    $online: function () {
        //debugger;
        throw new Error('Not implemented');
    },
    ready: function () {
        var me = this;
        MEPH.Log('linkedin provider : ready');

        MEPH.Log('injected = ');
        for (var i in me.when.injected) {
            MEPH.Log('injected[i] : ' + i);
        }

        return me.when.injected.then(function () {
            MEPH.Log('setup api, and return key');
            me.isReady = true;
            me.api = me.$inj.rest.clear().nocache().addPath('api.linkedin.com/v1/').absolute();
            return me.online().then(function () {
                return me.constructor.key;
            });
        });
    }
});