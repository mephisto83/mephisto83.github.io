MEPH.define('Connection.contact.view.EditContact', {
    alias: 'editcontact',
    templates: true,
    extend: 'MEPH.mobile.activity.container.Container',
    mixins: ['MEPH.mobile.mixins.Activity'],
    injections: ['contactService',
        'identityProvider',
        'overlayService',
        'customProvider',
        'stateService'],
    requires: ['MEPH.util.Observable',
                'MEPH.mobile.activity.view.ActivityView',
                'MEPH.input.Dropdown',
                'MEPH.input.Text',
                'Connection.template.ProfileImageSelection',
                'MEPH.list.View',
                'Connection.template.UserAttribute',
                'Connection.template.Card',
                'Connection.constant.Constants',
                'MEPH.input.Radio',
                'MEPH.util.Style'],
    properties: {
        profileimage: null,
        namesource: null,
        nameValue: null,
        nameValueObj: null,
        email1source: null,
        email1Value: null,
        email1ValueObj: null,
        email2source: null,
        email2Value: null,
        email2ValueObj: null,
        addressline1source: null,
        addressline1Value: null,
        addressline1ValueObj: null,

        addressline2source: null,
        addressline2Value: null,
        addressline2ValueObj: null,

        citysource: null,
        cityValue: null,
        cityValueObj: null,

        stateprovincesource: null,
        stateprovinceValue: null,
        stateprovinceValueObj: null,

        zipcodesource: null,
        zipcodeValue: null,
        zipcodeValueObj: null,

        companysource: null,
        companyValue: null,
        companyValueObj: null,


        titlesource: null,
        titleValue: null,
        titleValueObj: null,

        occupationsource: null,
        profileimageValue: null,
        profileimagesource: null,
        headlinesource: null,
        skillssource: null,
        headlineValue: null,
        headlineValueObj: null,
        customheadline: null,
        currentcardid: null,
        customname: null,
        linksource: null,
        linkValueObj: null,
        linkValue: null,
        occupationValueObj: null,
        occupationValue: null,
        skillsValueObj: null,
        skillsValue: null,
        phone1source: null,
        phone1ValueObj: null,
        phone1Value: null,
        phone2source: null,
        phone2ValueObj: null,
        phone2Value: null
    },
    initialize: function () {
        var me = this;
        me.great();
        me.dirtyValues = {};
        me.ready = me.when.injected;
    },
    onLoaded: function () {
        var me = this;
        me.great()
        me.activityview.hideCloseBtn()
        me.when.injected.then(function () {
            return me.initMe();
        });
        me.activityview.hideHeader();
        me.activityview.hideFooter();
        me.on('change_profileimageValue', function (x) {
            me.activityview.currentprofileimage.src = me.profileimageValue;
        });
    },
    afterShow: function () {
        var me = this;
        me.when.injected.then(function () {
            var obj = me.$inj.stateService.get(Connection.constant.Constants.CurrentCard)
            me.initMe({ selectedCardId: obj.selectedCardId });
        });
    },
    afterHide: function () {
        var me = this;
        MEPH.util.Style.hide(me.activityview.selectImage);
        MEPH.util.Style.visible(me.activityview.currentprofileimage);
    },
    valueChanged: function (property, visibility) {
        var me = this;
        if (me.dirtyValues[property] === undefined)
            me.dirtyValues[property] = false;
        else {
            me.dirtyValues[property] = true;
        }
        return visibility
    },
    initMe: function (options) {
        var me = this, identityProvider;
        if (me.$inj && me.$inj.identityProvider && options) {///&& !me.$inited

            //me.$inj.overlayService.open('connection-contact-edit');
            //me.$inj.overlayService.relegate('connection-contact-edit');
            identityProvider = me.$inj.identityProvider;
            var properties = ['email2', 'phone1', 'phone2', 'name', 'email1',
                'company', 'title',
                'addressline1', 'city', 'addressline2', 'stateprovince', 'zipcode',
                'occupation', 'profileimage', 'headline', 'link', 'skills'];
            me.activityview.currentprofileimage.src = null;
            me._pause();
            properties.foreach(function (prop) {
                me[prop + 'source'] = MEPH.util.Observable.observable([]);
                me[prop + 'source'].contactProperty = prop;
                me[prop + 'Value'] = null;
                me[prop + 'ValueObj'] = null;
            });
            var cardid = options.selectedCardId;
            me.currentcardid = cardid;

            var mycontact = me.$inj.stateService.get('mycontact') || null;

            if (mycontact) {
                for (var i in mycontact) {
                    me[i + 'Value'] = mycontact[i];
                }
            }
            me.activityview.currentprofileimage.src = mycontact['profileimage'];
            me.sources = properties.select(function (prop) {
                return me[prop + 'source']
            });


            //me.sources.foreach(function (source) {
            //    source.on('changed', handler);
            //});
            if (me.currentcardid) {
                identityProvider.source(properties.select(function (property) {
                    return {
                        prop: property,
                        source: me[property + 'source']
                    };
                }), me.currentcardid);
            }
            me.$inited = true;

            me.fireAltered(true);
        }
        me.when.injected.then(function () {
            var identityProvider = me.$inj.identityProvider;
            if (identityProvider.autoSelect() === me.currentcardid) {
                identityProvider.autoSelect(false);
                (function () {
                    var appliedprops = [];
                    var tosend = [];
                    var p = Promise.resolve();
                    var send;
                    var throttled = function () {
                        setTimeout(function () {
                            send = true;
                            if (tosend.length) {
                                me.applyProperties(tosend);
                            }
                        }, 4000);
                    }
                    throttled();
                    MEPH.subscribe(MEPH.Constants.OAuthPropertyApplied, function (type, response) {
                        //{ key: me.constructor.key, value: val }
                        if (response.value && appliedprops.indexOf(response.value) === -1) {
                            tosend.push({
                                provider: response.key,
                                card: me.currentcardid,
                                value: response.value,
                                property: response.property
                            });
                            appliedprops.push(response.property);

                        }

                    });
                })();
            }
        });
    },
    visbility: function (res) {
        if (res && res.provider === 'custom') {
            return false;
        }
        return true;
    },
    changeProviderValue: function (source, val) {
        var obj = source.first(function (x) { return x.provider === 'custom'; })
        if (obj) {
            obj.label = val + ' (custom)';
        }

    },
    changeTypeahead: function (property, objValue, value) {
        var me = this,
            provider;


        if (!objValue) {
            provider = 'custom'
        }
        else {
            provider = objValue.provider;
        }
        if (me.$inited)
            return me.applyProperty(provider, property, value);
    },
    applyProperty: function (provider, property, value, override) {
        var me = this;
        return me.ready.then(function () {
            var res = me.$inj.stateService.get(Connection.constant.Constants.CurrentCard);
            me.currentcardid = res.selectedCardId;
            var res = me.$inj.contactService.set(provider, property, value, me.currentcardid).then(function () {
                var obj = me[property + 'source'].first(function (t) {
                    return t.provider === provider || t.provider === 'custom';
                })
                if (!obj) {

                    me[property + 'source'].push({
                        value: value,
                        provider: provider
                    });
                }
                else {
                    if (obj.provider !== 'custom' || override) {
                        obj.value = value;
                    }

                }
                if (override) {
                    me[property + 'Value'] = value;
                }
            });
            if (override) return res;
        })
    },
    applyProperties: function (models) {
        //setsome
        var me = this;
        return me.ready.then(function () {
            var values = models.foreach(function (x) {
                x.card = me.currentcardid;
            }).select(function (x) {

                me[x.property + 'Value'] = x.value;
                return {
                    propertyType: x.property,
                    value: x.value,
                    card: x.card,
                    provider: x.provider
                }
            });
            var res = me.$inj.contactService.setsome(values).then(function () {

            });
        })
    },
    toBackgroundImage: function (val) {
        var me = this;

        return 'url(\'' + val + '\');';
    },
    savechange: function (provider, value, property) {
        var me = this;
        if (provider && value && property) {
            if (provider === 'provider') {
                //provider, headline

                var val = value.value;
                provider = value.type ? value.type : value.provider;
                value = val;
            }
            return me.ready.then(function () {
                me.$inj.contactService.set(provider, property, value, me.currentcardid);
            })
        }
    },
    selectImage: function (data) {
        var me = this;
        if (data) {
            try {
                //data = JSON.parse(typeof data === 'object' ? data.value : data);
                me.selectedImage = data;
                data.selected = true;
                // me.profileimagesource = data.value;
                me.activityview.currentprofileimage.src = data.value;

                return me.ready.then(function () {
                    me.$inj.contactService.set(data.type, 'profileimage', data.value, me.currentcardid).then(function () {

                    });
                })
            }
            catch (e) {
                MEPH.Log(e);
            }
        }
    },
    selectProfileImage: function () {
        var me = this,
            data = me.getDomEventArg(arguments);
        if (data) {
            return me.selectImage(data);
        }
    },
    selectImageFromDevice: function () {
        var me = this;
        MEPH.publish(MEPH.Constants.OPEN_ACTIVITY, {
            viewId: 'ContactImageSelection',
            path: 'contactimage'
        });
    },
    editMe: function () {
        var me = this;
    },
    toImageSource: function (value) {
        if (value) {
            try {
                value = JSON.parse(value);
                if (value) {
                    value = value.value;
                }
            }
            catch (e) {
            }
        }
        return value || 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';
    }

});