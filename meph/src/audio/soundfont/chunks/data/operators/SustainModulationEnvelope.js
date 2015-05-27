﻿/* This is the decrease in level, expressed in 0.1% units, to which the Modulation Envelope value ramps during the
 * decay phase. For the Modulation Envelope, the sustain level is properly expressed in percent of full scale. Because
 * the volume envelope sustain level is expressed as an attenuation from full scale, the sustain level is analogously
 * expressed as a decrease from full scale. A value of 0 indicates the sustain level is full level; this implies a zero
 * duration of decay phase regardless of decay time. A positive value indicates a decay to the corresponding level.
 * Values less than zero are to be interpreted as zero; values above 1000 are to be interpreted as 1000. For example, a
 * sustain level which corresponds to an absolute value 40% of peak would be 600. */

MEPH.define("MEPH.audio.soundfont.chunks.data.operators.SustainModulationEnvelope", {
    requires: ['MEPH.audio.soundfont.chunks.data.GeneratorsSubchunk'],
    extend: 'MEPH.audio.soundfont.chunks.data.operators.ValueOperator',
    statics: {
    },
    initialize: function (amount)//:int = 0
    {
        if (amount == null || amount == undefined) {
            amount = 0;
        }
        this.callParent(Operator.SUSTAIN_MOD_ENV, amount);
    }
});
