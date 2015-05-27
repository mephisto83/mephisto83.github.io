/**
 * @class MEPH.audio.sbsms.Slice
 **/
MEPH.define('MEPH.audio.sbsms.Slice', {
    statics: {
    },
    properties: {
        //TrackPoint *bottom;
        bottom: null,
        //TrackPoint *top;
        top: null,
        //int band;
        band: 0,
        ///TimeType time;
        time: null
    },

    //int band, const TimeType &time
    initialize: function (band, time) {
        this.band = band;
        this.time = time;
        this.bottom = null;
        this.top = null;
    },
    //void Slice :: 
    //TrackPoint *tp
    remove: function (tp) {
        var me = this;
        if (tp == me.top) {
            me.top = me.top.pp;
        }
        if (tp == me.bottom) {
            me.bottom = me.bottom.pn;
        }
    }
})