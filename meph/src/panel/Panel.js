MEPH.define('MEPH.panel.Panel', {
    alias: 'panel',
    templates: true,
    requires: ['MEPH.util.Observable'],
    extend: 'MEPH.control.Control',
    properties: {
        basePanelHeaderCls: 'panel-heading',
        basePanelFooterCls: 'panel-footer',
        basePanelBodyCls: 'panel-body',
        basePanelLeftCls: 'meph-panel-body-left',
        cls: '',
        basePanelRightCls: 'meph-panel-body-right',
        basePanelCls: 'meph-panel',
        injectControls: {
            location: {
                header: 'header',
                left: 'left',
                panelbody: 'panelbody',
                right: 'right',
                panelfooter: 'panelfooter'
            }
        }
    },
    initialize: function () {
        var me = this,
            properties = MEPH.Array(['cls']);

        me.callParent.apply(me, arguments);
        me.defineDependentProperties();

        properties.foreach(function (prop) {
            me.addTransferableAttribute(prop, {
                object: me,
                path: prop
            });
        });

    },
    onLoaded: function () {
        var me = this;
        me.callParent.apply(me, arguments);
        me.dependentProperties.foreach(function (x) {
            me.fire('altered', { path: x, references: [] });
        });
    },
    defineDependentProperties: function () {
        var properties = MEPH.Array(['panelHeaderCls',
                    'panelFooterCls',
                    'panelBodyCls',
                    'panelCls',
                    'panelLeftCls',
                    'panelRightCls']),
            me = this;

        Observable.defineDependentProperty('panelHeaderCls', me, ['basePanelHeaderCls'], function () {
            var result = []
            if (me.basePanelHeaderCls) {
                result.push(me.basePanelHeaderCls);
            }
            return result.join(' ');
        });

        Observable.defineDependentProperty('panelFooterCls', me, ['basePanelFooterCls'], function () {
            var result = []
            if (me.basePanelFooterCls) {
                result.push(me.basePanelFooterCls);
            }
            return result.join(' ');
        });

        Observable.defineDependentProperty('panelBodyCls', me, ['basePanelBodyCls'], function () {
            var result = [];
            if (me.basePanelBodyCls) {
                result.push(me.basePanelBodyCls);
            }
            return result.join(' ');
        });

        Observable.defineDependentProperty('panelLeftCls', me, ['basePanelLeftCls'], function () {
            var result = [];
            if (me.basePanelLeftCls) {
                result.push(me.basePanelLeftCls);
            }
            return result.join(' ');
        });

        Observable.defineDependentProperty('panelRightCls', me, ['basePanelRightCls'], function () {
            var result = [];
            if (me.basePanelRightCls) {
                result.push(me.basePanelRightCls);
            }
            return result.join(' ');
        });

        Observable.defineDependentProperty('panelCls', me, ['basePanelCls', 'cls'], function () {
            var result = [];
            
            if (me.basePanelCls) {
                result.push(me.basePanelCls);
            }

            if (me.cls) {
                result.push(me.cls);
            }

            return result.join(' ');
        });



        me.dependentProperties = me.dependentProperties || [];

        properties.foreach(function (prop) {
            me.dependentProperties.push(prop);
        })
    }
})