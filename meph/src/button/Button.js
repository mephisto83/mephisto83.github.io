/**
 * @class MEPH.button.Button
 * Buton
 */
MEPH.define('MEPH.button.Button', {
    alias: 'mephbutton',
    requires: ['MEPH.util.Dom'],
    templates: true,
    statics: {
        buttonClickEvent: 'buttonClickEvent'
    },
    properties: {
        injectControls: {
            location: 'insidebutton'
        },
        defaultCls: ''
    },
    extend: 'MEPH.control.Control',
    initialize: function () {
        var me = this;
        me.buttonClsProperties = me.buttonClsProperties || [];
        me.buttonClsProperties.push('defaultCls');
        me.callParent.apply(me, arguments);
        me.addTransferableAttribute('class', {
            selector: 'button'
        });
        me.on('load', me.initializeDomEvents.bind(me));
        me.defineButtonDependentProperties();
    },
    hide: function(){
        var me = this;
        Style.hide(me.button);  
    },
    initializeDomEvents: function () {
        var me = this, button;
        button = me.getButtonDom();
        me.don('click', button, me.fireButtonClicked.bind(me, 'click'));
    },
    defineButtonDependentProperties: function () {
        var me = this;
        MEPH.util.Observable.defineDependentProperty('buttonCls', me, me.buttonClsProperties, function () {
            var result = [];
            me.buttonClsProperties.foreach(function (x) {
                if (me[x] && me.handleButtonClsChange) {
                    result.push(me.handleButtonClsChange(x));
                }
            });
            return result.join(' ');
        });
    },
    handleButtonClsChange: function (x) {
        var me = this;
        return me[x];
    },
    getButtonDom: function () {
        var me = this;
        return me.getDomTemplate().first(function (x) { return x.nodeType === MEPH.util.Dom.elementType; });
    },
    fireButtonClicked: function (type, evnt) {
        var me = this,
            button = me.getButtonDom();
        evnt.stopPropagation();
        button.dispatchEvent(MEPH.createEvent(MEPH.button.Button.buttonClickEvent, { evt: evnt }));
    }
});