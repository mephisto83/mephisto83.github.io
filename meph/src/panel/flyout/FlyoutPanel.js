/**
 * @class MEPH.panel.flyout.FlyoutPanel
 * Creates a panel which can open an close itself.
 **/
MEPH.define('MEPH.panel.flyout.FlyoutPanel', {
    alias: 'flyoutpanel',
    requires: ['MEPH.util.Observable'],
    templates: true,
    extend: 'MEPH.control.Control',
    properties: {
        position: null,
        defaultCls: 'meph-flyout-panel',
        positionLeft: 'meph-flyout-panel-left',
        positionRight: 'meph-flyout-panel-right',
        positionBottom: 'meph-flyout-panel-bottom',
        positionTop: 'meph-flyout-panel-top',
        openLeft: 'meph-flyout-panel-open-left',
        openRight: 'meph-flyout-panel-open-right',
        openTop: 'meph-flyout-panel-open-top',
        openBottom: 'meph-flyout-panel-open-bottom',
        $flyoutPanelPromise: null,
        isClosing: false,
        isOpened: false,
        isOpening: false,
        opened: false,
        cls: '',
        injectControls: {
            location: 'defaultlocation'
        },
        $maxTransitionTime: 2000,
        $flyoutPanelSelector: '[flyoutpanel]'
    },
    initialize: function () {
        var me = this;
        me.$flyoutPanelPromise = Promise.resolve();
        me.callParent.apply(me, arguments);
        me.defineDependentProperties();
        me.addTransferableAttribute('position', {
            object: me,
            path: 'position'
        });
        me.addTransferableAttribute('cls', {
            object: me,
            path: 'cls'
        });
        me.on('change_opened', me.onChangedOpened.bind(me));
    },
    /**
     * @private
     * Defines the dependent properties.
     **/
    defineDependentProperties: function () {
        var me = this;

        Observable.defineDependentProperty('openPanelCls', me, ['position'], function () {
            var result = [];
            switch (me.position) {
                case 'left':
                    result.push(me.openLeft);
                    break;
                case 'right':
                    result.push(me.openRight);
                    break;
                case 'top':
                    result.push(me.openTop);
                    break;
                case 'bottom':
                    result.push(me.openBottom);
                    break;
                default: ''
            }
            return result.join(' ');
        });

        Observable.defineDependentProperty('flyoutPanelCls', me, ['position', 'defaultCls', 'openPanelCls', 'cls'], function () {
            var result = [];
            switch (me.position) {
                case 'left':
                    result.push(me.positionLeft);
                    break;
                case 'right':
                    result.push(me.positionRight);
                    break;
                case 'top':
                    result.push(me.positionTop);
                    break;
                case 'bottom':
                    result.push(me.positionBottom);
                    break;
            }
            result.push(me.defaultCls);
            if ((me.isOpen() || me.opening()) && !me.isClosing) {
                result.push(me.openPanelCls || '');
            }
            if (me.cls) {
                result.push(me.cls);
            }
            return result.join(' ');
        });
    },
    onChangedOpened: function () {
        var me = this;
        if (me.opened) {
            me.open();
        }
        else {
            me.close();
        }
    },
    /**
     * Returns true if the panel is open.
     * @returns {Boolean}
     */
    isOpen: function () {
        var me = this;
        return me.isOpened;
    },
    /**
     * Returns true if the panel is transitioning to open.
     * @returns {Boolean}
     */
    opening: function () {
        var me = this;
        return me.isOpening;
    },
    /**
     * Opens the flyout panel.
     **/
    open: function () {
        var me = this,
            flyoutpanel = me.querySelector(me.$flyoutPanelSelector);
        if (!me.isOpening) {
            me.isOpening = true;

            me.$flyoutPanelPromise = me.$flyoutPanelPromise.then(function () {
                me.isClosing = false;
                return me.viewTransition(flyoutpanel, {
                    add: me.flyoutPanelCls,
                    remove: me.flyoutPanelCls,
                    maxTime: me.$maxTransitionTime
                });
            }).then(function () {
                me.isOpening = false;
                me.isOpened = true;
            });
            return me.$flyoutPanelPromise;
        }
    },
    close: function () {
        var me = this, toremove,
            flyoutpanel = me.querySelector(me.$flyoutPanelSelector);
        if (!me.isClosing) {
            toremove = me.flyoutPanelCls;
            me.isClosing = true;
            me.$flyoutPanelPromise = me.$flyoutPanelPromise.then(function () {
                me.isOpening = false;
                return me.viewTransition(flyoutpanel, {
                    add: me.flyoutPanelCls,
                    remove: toremove,
                    maxTime: me.$maxTransitionTime
                }).then(function () {
                    me.isClosing = false;
                    me.isOpened = false;
                });
            });
            return me.$flyoutPanelPromise;
        }
    }
});