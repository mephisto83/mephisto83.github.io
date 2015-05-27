/**
 * @class MEPH.mobile.application.menu.ApplicationMenu
 * String
 */
MEPH.define('MEPH.mobile.application.menu.ApplicationMenu', {
    alias: 'applicationmenu',
    templates: true,
    extend: 'MEPH.control.Control',
    statics: {
        activity: 'activity',
        activityinstance: 'activityinstance',
        onlineusers: 'onlineusers'
    },
    requires: ['MEPH.panel.flyout.FlyoutPanel',
                'MEPH.button.IconButton',
                'MEPH.mobile.services.MobileServices',
                'MEPH.list.List',
                'MEPH.util.Observable',
                'MEPH.util.Dom'],
    properties: {
        openMenu: false,
        opening: false,
        mode: null,
        $topMenu: null,
        $menuPromise: null,
        opened: false,
        $menuProviders: null,
        menusource: null,
        $applicationMenuPromise: null
    },
    initialize: function () {
        var me = this;
        me.lastDataClicked = null;
        me.callParent.apply(me, arguments);
        me.$applicationMenuPromise = Promise.resolve();
        me.setUpEventListeners();
        me.$menuPromise = Promise.resolve();
        me.on('afterload', me.loadMenu.bind(me));
    },
    /**
     * Gets the menu providers
     * @returns {Promise}
     **/
    getMenuProviders: function () {
        var me = this, promise = Promise.resolve();
        promise = promise.then(function () {
            return MEPH.MobileServices.get('applicationMenuProvider').then(function (provider) {
                return provider.getMenuItemProviders();
            });
        });
        return promise;
    },
    /**
     * Gets the menu item associated with the data. 
     * If data is null, the assumption is that it is requesting top level items.
     * @param {Object} provider
     * @param {Object} data
     **/
    getMenuItems: function (provider, data) {
        return Promise.resolve().then(function (x) {
            return provider.getItems(data, data === null);
        });
    },
    /**
     * Loads the menu.
     * @returns {Promise}
     */
    loadMenu: function () {
        var me = this,
            menusource = [],
            promise = Promise.resolve();
        me.menusource = me.menusource || MEPH.util.Observable.observable([]);
        me.menusource.dump();
        //menusource.push({ name: 'Activities', type: MEPH.mobile.application.menu.ApplicationMenu.activity });
        //menusource.push({ name: 'Online Users', type: MEPH.mobile.application.menu.ApplicationMenu.onlineusers });

        //me.menusource = MEPH.util.Observable.observable([]);
        //menusource.foreach(function (x) {
        //    me.menusource.push(MEPH.util.Observable.observable(x));
        //});
        //MEPH.subscribe(MEPH.Constants.ActivityStarted, me.onActivityStarted.bind(me))
        //me.$topMenu = menusource;
        me.getDataTemplatesHandler = me.getDataTemplates.bind(me);
        if (me.flyoutPanel && me.flyoutPanel.list) {
            me.flyoutPanel.list.appendTemplateSelectionFunction(me.getDataTemplatesHandler);
        }
        return promise.then(function () {
            return me.getMenuProviders();
        }).then(function (providers) {
            me.$menuProviders = providers;
            return Promise.all(providers.select(function (provider) {
                return me.getMenuItems(provider, null).then(function (provider, items) {
                    return {
                        provider: provider,
                        items: items
                    };
                }.bind(me, provider));
            }));
        }).then(function (providersAnItems) {
            me.$providersAndItems = providersAnItems;
            me.menusource.removeWhere(function () { return true; });
            me.$providersAndItems.foreach(function (x) {
                x.provider.updateCallback = me.updateCallBack.bind(me, x.provider);
                x.provider.loadMenu = me.loadMenu.bind(me);
                x.provider.appMenu = me;
                x.items.foreach(function (y) {
                    me.menusource.push(MEPH.util.Observable.observable(y));
                });
            });
        });
    },
    getDataTemplates: function (data) {
        var me = this;
        return me.$providersAndItems.selectFirst(function (x) {
            if (x.provider.getTemplate) {
                return x.provider.getTemplate(data);
            }
            return false;
        }) || false;
    },
    /**
     * When a provider updates its source, it call this function to update the current values for the menu source.
     * @param {Object} provider
     **/
    updateCallBack: function (provider) {
        var me = this;
        if (me.lastDataClicked) {
            if (me.getProviderByData(me.lastDataClicked) === provider) {
                me.retrieveAndApplyMenuSource(provider, me.lastDataClicked);
            }
        }
    },
    /**
     * Gets the provider which the data originates from.
     */
    getProviderByData: function (data) {
        var me = this, providerAndItems;
        providerAndItems = me.$providersAndItems.first(function (x) {
            return x.items.some(function (y) { return y === data; })
            || (x.provider.ownsData ? x.provider.ownsData(data) : false);
        });
        return providerAndItems ? providerAndItems.provider : null;
    },
    onActivityStarted: function () {
        var me = this;
        switch (me.mode) {
            case MEPH.mobile.application.menu.ApplicationMenu.activityinstance:
            case MEPH.mobile.application.menu.ApplicationMenu.activity:
                me.setActivitesAsMenuSource();
                break
        }
    },
    setActivitesAsMenuSource: function () {
        var me = this;
        me.menusource.removeWhere(function (x) { return true; });
        MEPH.ActivityController.getActivities().where(function (activity) {
            return activity.activity.getActivityId() !== null;
        }).foreach(function (activity) {
            me.menusource.push(MEPH.util.Observable.observable({
                name: activity.activity.getPath(),
                id: activity.activity.getActivityId(),
                type: MEPH.mobile.application.menu.ApplicationMenu.activityinstance
            }));
        });
    },

    /**
     * @private
     * Handles menu item clicked.
     * @returns {Promise}
     **/
    menuItemClicked: function (a, b, c, d, e, f, evnt) {

        var me = this,
            provider, clickResult,
            handler,
            promise = Promise.resolve();
        provider = me.getProviderByData(evnt.domEvent.data);
        if (provider) {
            me.lastDataClicked = evnt.domEvent.data;
            me.lastProvider = provider;
            return me.retrieveAndApplyMenuSource(provider, evnt.domEvent.data);
        }
        else if (evnt.domEvent.data.backbutton) {
            return me.retrieveAndApplyMenuSource(me.lastProvider, me.lastDataClicked, true);

        }
        else {
            MEPH.Log(new Error('ApplicationMenu : no provider found with data.'));
        }
    },
    /** 
     * Applies the retrieve values from the provider to the menu source.
     **/
    retrieveAndApplyMenuSource: function (provider, data, getparentdata) {
        var me = this,
            clickResult;
        clickResult = provider.itemClicked(data, getparentdata);
        handler = function handler(clickResult) {
            if (!clickResult) {
                me.$menuPromise = me.$menuPromise.then(function () {
                    return me.loadMenu();
                });
                return me.$menuPromise;
            }
            else if (Array.isArray(clickResult)) {
                me.menusource.removeWhere(function (x) { return true; });
                me.menusource.push({ backbutton: true, name: 'Back' });
                clickResult.foreach(function (x) {
                    me.menusource.push(x);
                });
                return me.$menuPromise;

            }
        }
        if (clickResult instanceof Promise) {
            return clickResult.then(function (result) {
                return handler(result);
            })['catch'](function (error) {
                MEPH.Log(error);
            });;
        }
        else {
            return handler(clickResult);
        }
    },
    /**
     * Sets up event listeners.
     **/
    setUpEventListeners: function () {
        var me = this, Dom = MEPH.util.Dom;
        me.don(['click', 'touchend'], me.$window.document.body, function (type, evnt) {
            var source = Dom.getEventSource(evnt), anscestor, domTemplate = me.getDomTemplate();
            if (domTemplate) {
                anscestor = domTemplate.first(function (x) {
                    return MEPH.util.Dom.isDomDescendant(source, x) || !MEPH.util.Dom.isDomDescendant(source, document.body)
                });
            }
            if (me.opened && !anscestor && !me.opening) {
                me.close();
            }
        }.bind(me, 'click'));
    },
    /**
     * Opens the flyout menu.
     * @returns {Promise}
     */
    open: function () {
        var me = this;
        if (!me.opened) {
            MEPH.Log('open application menu');
            me.opening = true;
            me.$applicationMenuPromise = me.$applicationMenuPromise.then(function () {
                return me.flyoutPanel.open().then(function () {
                    me.opened = true;
                    me.opening = false;
                    MEPH.Log('application menu opened');
                });
            });
        }
        return me.$applicationMenuPromise;
    },
    /**
    * Opens the flyout menu.
    * @returns {Promise}
    */
    close: function () {
        var me = this;

        if (me.opened) {
            MEPH.Log('close application menu');
            me.$applicationMenuPromise = me.$applicationMenuPromise.then(function () {
                return me.flyoutPanel.close().then(function () {
                    me.opened = false;
                    MEPH.Log('application menu closed');
                });
            });
        }
        return me.$applicationMenuPromise;
    },
    /**
     * Returns true if opened.
     */
    isOpen: function () {
        var me = this;
        return me.opened;
    },
    /**
     * Opens the flyout menu.
     */
    openFlyoutMenu: function () {
        var me = this;

        if (!me.opening) {
            MEPH.Log('open application menu');
            me.opening = true;
            me.$applicationMenuPromise = me.open().then(function () {
                me.opening = false;
                MEPH.Log('application menu opened');
            });
        }
    }

});