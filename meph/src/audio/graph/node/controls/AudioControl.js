/**
 * @class MEPH.control.Control
 * Defines a base class for all controls and views.
 **/
MEPH.define('MEPH.audio.graph.node.controls.AudioControl', {
    requires: ['MEPH.util.Dom'],
    extend: 'MEPH.audio.graph.node.controls.Control',
    properties: {
        dragareawidth: 0,
        dragareaheight: 0,
        dragareax: null,
        dragareay: null,
        $spaceafterconnector: 0,
        controlheight: 30
    },
    initialize: function () {
        var me = this;
        me.great();
    },
    onLoaded: function () {
        var me = this;
        me.great();
    },
    defineTextX: function () {
        var me = this;
        me.great();

        MEPH.util.Observable.defineDependentProperty('dragareatransform', me, ['texttransform', 'left', 'width', 'connectorxmargin', 'radius', 'bufferx'], function () {
            var result;

            if (me.left) {
                result = me.connectorxmargin + (me.radius || 0) + (me.$spaceafterconnector || 0);
            }
            else {
                result = me.width - me.connectorxmargin - me.radius - (me.$spaceafterconnector || 0);
            }
            me.bufferx = 4;

            me.dragareaheight = me.controlheight || (me.radius * 2) || 0;
            me.dragareawidth = (me.width - me.radius - me.$spaceafterconnector) || 0;
            var x = result;
            var y = parseFloat(me.controlheight / 4) || parseFloat(me.radius || 0);
            me.dragareax = x;
            me.dragareay = y || 0;
            result = 'translate(' + (x || 0) + ',' + (y || 0) + ')';
            return result;
        });
    },
    enterValue: function () {
        //var me = this;
        var me = this;
        var element = Dom.createSimpleDataEntry(me, me.dragarea, 'range', function (val) {
            me.value = val;
        }, me.value);

        element.min = me.minvalue || 0;
        element.max = me.maxvalue || 10;
        element.step = me.increment || .01;
    }
})