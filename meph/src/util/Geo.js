/**
 * @class MEPH.util.Geo
 * String
 */
MEPH.define('MEPH.util.Geo', {
    properties: {
    },
    get: function () {
        var me = this, geolocation = navigator.geolocation || window.geolocation;
        if (geolocation) {
            return new Promise(function (resolve, fail) {
                MEPH.Log('Geo location exists', 9);
                geolocation.getCurrentPosition(function showPosition(position) {
                    if (!position) {
                        fail(false);
                    }
                    resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    });
                });
            })
        }
        else {
            MEPH.Log('Geo location doesnt exists', 5);
            return Promise.reject();
        }
    }
});