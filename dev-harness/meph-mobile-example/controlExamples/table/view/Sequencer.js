MEPH.define('MEPHControls.table.view.Sequencer', {
    alias: 'mephcontrols_sequencer',
    templates: true,
    extend: 'MEPH.mobile.activity.container.Container',
    mixins: ['MEPH.mobile.mixins.Activity'],
    requires: ['MEPH.mobile.activity.view.ActivityView', 'MEPH.table.Sequencer'],
    properties: {
        timeFunc: null,
        laneFunc: null,
        settimeFunc: null,
        lengthFunc: null,
        source: null,
        rowheaderFunc: null,
        leftheadersource: null,
        columnheader: null
    },
    onLoaded: function () {
        var me = this;
        me.name = 'Sequencer';
        me.timeFunc = function () {

            return {
                'function': function (item) {
                    return item.time || 0;
                }
            }
        }
        me.laneFunc = function () {
            return {
                'function': function (item) {
                    return item.lane || 0;
                }
            }
        }
        me.settimeFunc = function () {
            return {
                'function': function (time, item) {
                    return item.time = time;
                }
            }
        }
        me.lengthFunc = function () {
            return {
                'function': function (item) {
                    return item.length || 1;
                }
            }
        }
        me.rowheaderFunc = function () {
            return {
                'function': function (item) {
                    return 'Row ' + item.lane;
                }
            }
        }
        me.columnheaderFunc = function () {
            return {
                'function': function (item) {
                    return 'Column ' + item.time;
                }
            }
        }
        me.source = MEPH.Observable.observable([]);
        me.leftheadersource = MEPH.Observable.observable([]);
        me.columnheader = MEPH.Observable.observable([]);
        var res = [].interpolate(0, 10, function (x) {
            return MEPH.Observable.observable({
                lane: x,
                time: x,
                length: (Math.random() * 3) + 1
            });
        });
        var res2 = [].interpolate(0, 10, function (x) {
            return MEPH.Observable.observable({
                lane: x,
                time: 0,
                length: 1
            });
        });
        var res3 = [].interpolate(0, 10, function (x) {
            return MEPH.Observable.observable({
                lane: 0,
                time: x,
                length: 1
            });
        });
        me.leftheadersource.push.apply(me.leftheadersource, res2);
        me.columnheader.push.apply(me.columnheader, res3);
        me.source.push.apply(me.source, res);
    },
    initialize: function () {
        var me = this;
        me.callParent.apply(me, arguments);
        me.on('load', me.onLoaded.bind(me));
    }
});