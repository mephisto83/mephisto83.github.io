/**
 * @class MEPH.util.DataModel
 * String
 */
MEPH.define('MEPH.util.Rest', {
    mixins: {
        injectable: 'MEPH.mixins.Injections'
    },
    properties: {
        _path: null,
        relative: true,
        ajax: null
    },
    injections: ['restStorage'],

    initialize: function (config) {
        var me = this;
        me.ajax = MEPH.ajaxJSON;
        me._path = [];
        me._header = [];

        me._host = null;
        me._protocol = null;
        if (config) {
            if (config.base) {
                me._path.push(config.base);
            }
            if (config.host) {
                me._host = config.host;
            }
            if (config.protocol) {
                me._protocol = config.protocol
            }
        }
        if (me && me.mixins && me.mixins.injectable) {
            me.mixins.injectable.init.apply(me);
            me.when.injected.then(function () {
                if (window.indexedDB && !window.runningInCordova) {
                    me.storage = me.storage || me.$inj.restStorage;
                }
            });
        }
    },
    copy: function () {
        var me = this,
            rest = new MEPH.util.Rest();
        rest.ajax = me.ajax;
        rest.relative = me.relative;
        rest.credentials = me.credentials;
        rest.absolutePath = me.absolutePath;
        rest._path = me._path.select();
        rest._protocol = me._protocol;
        rest._host = me._host;
        rest.storage = me.storage;
        rest._header = me._header.select();
        return rest;
    },
    addPath: function (part) {
        var me = this,
            copy = me.copy();
        copy._path.push(part);
        return copy;
    },
    withCredentials: function (on) {
        var me = this, copy = me.copy();
        copy.credentials = true;
        if (!on) {
            copy.credentials = false;
        }
        return copy;
    },
    header: function (header, value) {
        var me = this,
            copy = me.copy();
        copy._header.removeWhere(function (x) { return x.header === header; });
        copy._header.push({ header: header, value: value });
        return copy;
    },
    clear: function () {
        var me = this, copy = me.copy();
        copy._path = [];
        copy._host = null;
        copy._protocol = null;
        return copy;
    },
    cache: function (val) {
        var me = this,
            copy = me.copy();
        copy.setCache(val);

    },
    parts: function () {
        var me = this;
        me._path = me._path || [];
        return me._path;
    },
    path: function (data) {
        var me = this,
            result = '';

        result += me.parts().where(function (x) {
            return typeof x !== 'object';
        }).select(function (x) {
            return x.split('/').select(function (t) {
                return me.matchAndReplace(t, data);
            });
        }).concatFluent(function (t) {
            return t;
        }).where().join('/');

        result = '/' + result;
        var query = me.parts().where(function (x) {
            return typeof x === 'object';
        }).select(function (x) {
            var sres = [];
            if (x)
                for (var i in x) {
                    sres.push(i + '=' + x[i]);
                }
            return sres;
        }).concatFluent(function (t) {
            return t;
        }).join('&');
        if (query) {
            result += '?' + encodeURI(query);
        }
        if (me.absolutePath) {
            result = me.absolutePath + ':/' + result;
        }
        else if (me._host) {
            result = (me._protocol || 'http') + '://' + ((me._host + '/' + result).split('/').where().join('/'));
        }
        return result;
    },
    absolute: function (protocol) {
        var me = this, copy = me.copy();
        copy.absolutePath = protocol || 'https';
        return copy;
    },
    matchAndReplace: function (part, obj) {
        if (obj) {
            var regex = new RegExp('({)[A-Za-z0-9_]*(})', 'g');
            var hasTemplate = regex.test(part);

            if (hasTemplate) {
                for (var i in obj) {
                    subregex = new RegExp('({)' + i + '(})', 'g');
                    part = part.replace(subregex, obj[i]);
                }
            }
        }
        return part;
    },
    get: function (data) {
        var me = this,
            completed;

        if (me.storage) {
            return me.cachecall.apply(me, ['GET'].concat(MEPHArray.convert(arguments)));
        }
        return me.call.apply(me, ['GET'].concat(MEPHArray.convert(arguments)));
    },
    cachecall: function (method, data) {
        var me = this, storagepromise, completed;

        MEPH.Log('Cache calling ', 9);
        var path = me.path(data),
              storagepromise = me.storage.get(path, method),
              res = me.call.apply(me, MEPHArray.convert(arguments));
        return {
            then: function (callback) {
                MEPH.Log('then ....', 9);
                storagepromise.then(function (res) {
                    MEPH.Log('storage promise ....', 9);
                    if (completed) {
                        MEPH.Log('storage completed already', 9);
                        throw new Error('');
                    }
                    return res;
                }).then(function (res) {
                    if (callback)
                        return callback(res);
                }).catch(function () {
                    MEPH.Log('failure during the storage promise.')
                });
                return Promise.resolve().then(function () {
                    return res.then(function (res) {
                        completed = true;
                        if (me.storage) {
                            MEPH.Log('setting values in indexdb', 9);
                            return me.storage.set(path, method, res).then(function () {
                                return res;
                            })
                        }
                        return res;
                    }).then(function (res) {
                        return callback(res);
                    });
                })
            }
        };
    },
    nocache: function () {
        var me = this;

        me.storage = null;

        return me;
    },
    post: function () {
        var me = this;

        if (me.storage) {
            MEPH.Log('Making a cache call');
            return me.cachecall.apply(me, ['POST'].concat(MEPHArray.convert(arguments)));
        }

        return me.call.apply(me, ['POST'].concat(MEPHArray.convert(arguments)));
    },
    patch: function () {
        var me = this;

        if (me.storage) {
            return me.cachecall.apply(me, ['PATCH'].concat(MEPHArray.convert(arguments)));
        }
        return me.call.apply(me, ['PATCH'].concat(MEPHArray.convert(arguments)));
    },
    options: function () {
        var me = this;

        if (me.storage) {
            return me.cachecall.apply(me, ['OPTIONS'].concat(MEPHArray.convert(arguments)));
        }
        return me.call.apply(me, ['OPTIONS'].concat(MEPHArray.convert(arguments)));
    },
    head: function () {
        var me = this;

        if (me.storage) {
            return me.cachecall.apply(me, ['HEAD'].concat(MEPHArray.convert(arguments)));
        }
        return me.call.apply(me, ['HEAD'].concat(MEPHArray.convert(arguments)));
    },
    put: function () {
        var me = this;

        if (me.storage) {
            return me.cachecall.apply(me, ['PUT'].concat(MEPHArray.convert(arguments)));
        }
        return me.call.apply(me, ['PUT'].concat(MEPHArray.convert(arguments)));
    },
    remove: function () {
        var me = this;

        if (me.storage) {
            return me.cachecall.apply(me, ['DELETE'].concat(MEPHArray.convert(arguments)));
        }
        return me.call.apply(me, ['DELETE'].concat(MEPHArray.convert(arguments)));
    },
    /**
     * Calls endpoint
     * @param {Object} data
     * @return {Promise}
     **/
    call: function (method, data) {
        var me = this;
        me.out = {};
        var senddata = MEPHArray.convert(arguments).last(function (t) { return typeof t === 'object'; })

        return me.ajax(me.path(data), {
            method: method,
            requestHeaders: me._header.select(),
            data: senddata,
            withCredentials: me.credentials
        }, me.out).then(function (res) {
            if (res.responseJSON) {
                return res.responseJSON;
            }
            return res;
        });
    }
});