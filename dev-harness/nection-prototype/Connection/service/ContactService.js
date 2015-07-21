MEPH.define('Connection.service.ContactService', {
    requires: [
        'MEPH.util.Geo'
    ],
    mixins: {
        injectable: 'MEPH.mixins.Injections'
    },
    injections: ['rest', 'identityProvider', 'overlayService', 'customProvider'],
    initialize: function () {
        var me = this;
        me.$promise = Promise.resolve();
        me.mixins.injectable.init.apply(me);
        me.ready = new Promise(function (r) {
            me.injectionsResolve = r;
        });
    },
    onInjectionsComplete: function () {
        var me = this;
        me.injectionsResolve();
    },
    setProfileImage: function (image, cardId) {
        var me = this;
        function dataURItoBlob(dataURI) {
            // convert base64/URLEncoded data component to raw binary data held in a string
            var byteString;
            if (dataURI.split(',')[0].indexOf('base64') >= 0)
                byteString = atob(dataURI.split(',')[1]);
            else
                byteString = unescape(dataURI.split(',')[1]);

            // separate out the mime component
            var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

            // write the bytes of the string to a typed array
            var ia = new Uint8Array(byteString.length);
            for (var i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
            }

            return new Blob([ia], { type: mimeString });
        }
        function post(path, params, method) {
            method = method || "post"; // Set method to post by default if not specified.

            // The rest of this code assumes you are not using a library.
            // It can be made less wordy if you use one.
            var form = document.createElement("form");
            form.setAttribute("method", method);
            form.setAttribute("action", path);
            form.setAttribute("enctype", "multipart/form-data");

            for (var key in params) {
                if (params.hasOwnProperty(key)) {
                    var hiddenField = document.createElement("input");
                    hiddenField.setAttribute("type", "hidden");
                    hiddenField.setAttribute("name", key);
                    hiddenField.setAttribute("value", params[key]);

                    form.appendChild(hiddenField);
                }
            }

            document.body.appendChild(form);
            form.submit();
        }
        return me.when.injected.then(function () {
            var data = new FormData();

            data.append('file' + 1, dataURItoBlob(image));
            me.$inj.rest.addPath('blob/post/' + cardId)
                .asBinary()
//                .setHeader('Content-Type', "multipart/form-data;charset=utf-8;boundary=" + data.boundary)

                .post(data);
            // return post(me.$inj.rest.addPath('blob/post/' + cardId).path(), { file0: dataURItoBlob(image) }, 'post');
        });
    },
    set: function (provider, property, value, card) {
        var me = this;
        me.$inj.overlayService.open('contact/me/set');
        me.$inj.overlayService.relegate('contact/me/set');
        return me.when.injected.then(function () {
            return me.$inj.rest.addPath('contact/me/set').post({
                propertyType: property,
                provider: provider,
                value: value,
                card: card
            }).then(function (res) {
                me.$inj.customProvider.set(property, value, card);
            }).catch(function (e) {
                MEPH.Log(e);
            }).then(function () {
                me.$inj.overlayService.close('contact/me/set');
            });
        })
    },
    setsome: function (models) {
        var me = this;
        return me.when.injected.then(function () {
            return me.$inj.rest.addPath('contact/me/setsome').post(models).then(function (res) {
                models.foreach(function (x) {
                    me.$inj.customProvider.set(x.propertyType, x.value, x.card)
                });
            }).catch(function (e) {
                MEPH.Log(e);
            });
        })
    },
    createCard: function (cardname) {
        var me = this;
        return me.when.injected.then(function () {
            return me.$inj.rest.addPath('contact/me/create/card/{newcardname}').post({
                newcardname: cardname
            }).then(function (res) {
                if (res.authorized) {
                    return res.card;
                }
            }).catch(function (e) {
                MEPH.Log(e);
            });
        })
    },
    propertyTypes: function () {

        return [
        {
            "name": "name"
        },
        {
            "name": "firstname"
        },
        {
            "name": "lastname"
        },
        {
            "name": "middlename"
        },
        {
            "name": "location"
        },
        {
            "name": "languages"
        },
        {
            "name": "gender"
        },
        {
            "name": "link"
        },
        {
            "name": "profileimage"
        },
        {
            "name": "schools"
        },
        {
            "name": "work"
        },
        {
            "name": "profileimage-large"
        },
        {
            "name": "occupation"
        },
        {
            "name": "skills"
        },
        {
            "name": "url"
        },
        {
            "name": "headline"
        },
        {
            "name": "email1"
        },
        {
            "name": "email2"
        },
        {
            "name": "email3"
        },
        {
            "name": "phone1"
        },
        {
            "name": "phone2"
        },
        {
            "name": "phone3"
        },
        {
            "name": "addressline1"
        },
        {
            "name": "addressline2"
        },
        {
            "name": "addressline3"
        },
        {
            "name": "city"
        },
        {
            "name": "stateprovince"
        },
        {
            "name": "district"
        },
        {
            "name": "county"
        },
        {
            "name": "zipcode"
        },
        {
            "name": "company"
        },
        {
            "name": "companies"
        },
        {
            "name": "title"
        }
        ];
    },

    me: function (cardid, result) {
        var me = this;
        result = result || {};
        if (result._pause) {
            result._pause();
        }
        me.propertyTypes().foreach(function (t) {
            result[t.name] = result[t.name] || '';
        });
        if (result._start) {
            result._start();
        }

        return me.ready.then(function () {
            me.$inj.customProvider.assignProperties(cardid, result).then(function () {
                //     return me.$inj.overlayService.open('contact/me/card');
            }).then(function () {

                return me.$inj.rest.addPath('contact/me/card/{cardid}').get({ cardid: cardid }).then(function (res) {

                    result._pause();
                    me.propertyTypes().foreach(function (t) {
                        result[t.name] = '';
                    });
                    if (res && res.authorized) {

                        res.attributes.foreach(function (attr) {
                            result[attr.type] = attr.value;
                        });
                        if (result.profileimage) {
                            result.profileimageurl = "url('" + result.profileimage + "')";
                        }
                        return result;
                    }
                    return null;
                }).catch(function (error) {
                    //debugger
                });
            }).then(function (res) {
                //      me.$inj.overlayService.close('contact/me/card');
                result._start();
                result.fireAltered();
                return res;
            });

            return result;
        });
    }
});