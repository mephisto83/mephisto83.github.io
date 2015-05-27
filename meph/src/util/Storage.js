/**
 * @class MEPH.util.Storage
 * String
 */
MEPH.define('MEPH.util.Storage', {
    properties: {
    },
    set: function (name, object) {
        var me = this;
        if (window.localStorage) {
            return Promise.resolve().then(function () {
                MEPH.Log('Local storage exists', 9);
                window.localStorage.setItem(name, JSON.stringify(object));
            })
        }
        else {
            MEPH.Log('Local storage doesnt exists', 5);
            return Promise.reject();
        }
    },
    get: function (name) {
        var me = this;
        var res = localStorage.getItem(name);
        return Promise.resolve().then(function () {
            try {
                return JSON.parse(res);
            }
            catch (e) {
                return null;
            }
        });
    }
});