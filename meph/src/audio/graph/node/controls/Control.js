/**
 * @class MEPH.control.Control
 * Defines a base class for all controls and views.
 **/
MEPH.define('MEPH.audio.graph.node.controls.Control', {
    alias: 'nodecontrol',
    templates: true,
    extend: 'MEPH.control.Control',
    properties: {
        fill: null,
        radius: null,
        title: null,
        value: null,
        x: 0,
        y: 0,
        hideconnector: null,
        connectorxmargin: 3,
        fontsize: null,
        stroke: null,
        bufferx: null,
        left: true,
        width: 200,
        fresh: 0,
        margin: 4,
        controlheight: 0
    },
    initialize: function () {
        var me = this;
        me.great();
    },
    onLoaded: function () {
        var me = this;
        me.fontsize = me.fontsize || '12px';
        me.great();
        me.defineTextX();
    },
    /**
     * Defines the header buffer property
     */
    defineTextX: function () {
        var me = this;


        MEPH.util.Observable.defineDependentProperty('controlradius', me, ['hideconnector', 'radius', 'fresh'], function () {
            var result = me.hideconnector ? 0 : parseFloat(me.radius) || 0;

            return result;
        });

        MEPH.util.Observable.defineDependentProperty('height', me, ['fontsize', 'radius', 'controlheight', 'fresh'], function () {
            var result = parseFloat(me.fontsize) || 0;
            var radius = parseFloat(me.radius) || 0

            return Math.max(radius * 2, result, (parseFloat(me.controlheight) || 0)) + me.margin + me.margin;
        });

        MEPH.util.Observable.defineDependentProperty('titlevalue', me, ['title', 'value', 'fresh'], function () {
            var result = (me.title || '') + (me.value !== undefined && me.value !== null ? " : " + me.value : '');
            return result.substring(0, 30);
        });
        MEPH.util.Observable.defineDependentProperty('textx', me, ['left', 'width', 'connectorxmargin', 'radius', 'bufferx', 'fresh'], function () {
            var result;
            if (me.left) {
                result = me.connectorxmargin + (me.radius || 0) + (me.bufferx || 0);
            }
            else {
                result = me.width - me.connectorxmargin - me.radius - (me.bufferx || 0);
            }
            return result;
        });
        MEPH.util.Observable.defineDependentProperty('texttransform', me, ['left', 'width', 'connectorxmargin', 'radius', 'bufferx', 'fresh'], function () {
            var result;
            if (me.left) {
                result = me.connectorxmargin + (me.radius || 0) + (me.bufferx || 0);
            }
            else {
                result = me.width - me.connectorxmargin - me.radius - (me.bufferx || 0);
            }
            var x = result;
            var y = parseFloat(me.height / 2) || parseFloat(me.radius || 0);
            result = 'translate(' + (x || 0) + ',' + (y || 0) + ')';
            return result;
        });



        MEPH.util.Observable.defineDependentProperty('connectortransform', me, ['radius', 'left', 'width', 'connectorxmargin', 'radius', 'bufferx', 'fresh'], function () {
            var result;
            if (me.left) {
                result = 0;
            }
            else {
                result = me.width + (me.radius || 0) / 2;
            }
            var x = result;
            var y = parseFloat(me.height / 2) || parseFloat(me.radius || 0);
            var result = 'translate(' + (x || 0) + ',' + (y || 0) + ')';

            return result;
        });

        MEPH.util.Observable.defineDependentProperty('anchor', me, ['left', 'fresh'], function () {
            var result;
            if (!me.left) {
                result = 'end';
            }
            else {
                result = 'start';
            }
            return result;
        });


    },
    refresh: function () {
        var me = this;
        me.fresh += 1
    }
});