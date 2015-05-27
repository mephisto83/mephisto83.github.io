/**
 * @class MEPH.button.IconButton
 * @extends MEPH.button.Button
 * A button that will display an icon.
 **/
MEPH.define('MEPH.button.IconButton', {
    alias: 'iconbutton',
    templates: true,
    requires: ['MEPH.util.Observable',
                'MEPH.iconfont.enums.Color',
                'MEPH.iconfont.enums.Icon',
                'MEPH.iconfont.enums.Size'],
    extend: 'MEPH.button.Button',
    properties: {
        color: null,
        size: null,
        icon: null,
        positionIcon: null,
        iconPrefix: 'glyphicon glyphicon',
        $colorPrefix: 'meph-color',
        $sizePrefix: 'meph-size',
        $positionPrefix: 'meph-position-',
        defaultIconCls: '',
        defaultCls: null,
        $iconbuttoncls: '[iconbuttoncls]'
    },
    initialize: function () {
        var me = this;
        me.buttonClsProperties = me.buttonClsProperties || [];
        me.buttonClsProperties.push('positionIcon', 'color', 'size');
        me.callParent.apply(me, arguments);
        me.addTransferables();

        me.defineDependentProperties();
        me.on('change_iconButtonCls', me.iconBtnClassChanged.bind(me));
    },
    onLoaded: function () {
        var me = this;
        me.callParent.apply(me, arguments);
        me.defaultCls = 'meph-icon-button';
    },
    handleButtonClsChange: function (x) {
        var me = this;
        switch (x) {
            case 'positionIcon':
                return me.getPosition();
                break;
            case 'color':
                return me.getColor();
            case 'size':
                return me.getSize();
            default:
                return me.callParent.apply(me, arguments);
        }
    },
    /**
     * @private
     * Adds transferable properties.
     **/
    addTransferables: function () {
        var me = this;
        me.addTransferableAttribute('icon', {
            object: me,
            path: 'icon'
        });
        me.addTransferableAttribute('size', {
            object: me,
            path: 'size'
        });
        me.addTransferableAttribute('color', {
            object: me,
            path: 'color'
        });
        me.addTransferableAttribute('positionIcon', {
            object: me,
            path: 'positionIcon'
        });
    },
    iconBtnClassChanged: function () {
        var me = this, iconbtn;
        iconbtn = me.querySelector(me.$iconbuttoncls);
        iconbtn.className = '';
        iconbtn.className = me.iconButtonCls;
    },
    defineDependentProperties: function () {
        var me = this;
        MEPH.util.Observable.defineDependentProperty('iconButtonCls', me, ['icon', 'defaultIconCls', 'color'], function () {
            var result = [];

            if (me.icon) {
                result.push(me.iconPrefix + (Icons[me.icon] ? Icons[me.icon] : me.icon));
            }

            if (me.color) {
                result.push(me.getColor());
            }

            return result.join(' ');
        });
    },
    getColor: function () {
        var me = this;
        return me.$colorPrefix + MEPH.iconfont.Color[me.color];
    },
    getSize: function () {
        var me = this;
        return me.$sizePrefix + MEPH.iconfont.Size[me.size];
    },
    getPosition: function () {
        var me = this;
        return me.$positionPrefix + me.positionIcon;
    }
});