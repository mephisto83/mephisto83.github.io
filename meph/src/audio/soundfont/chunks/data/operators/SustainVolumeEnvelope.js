/* This is the decrease in level, expressed in centibels, to which the Volume Envelope value ramps during the decay
 * phase. For the Volume Envelope, the sustain level is best expressed in centibels of attenuation from full scale. A
 * value of 0 indicates the sustain level is full level; this implies a zero duration of decay phase regardless of
 * decay time. A positive value indicates a decay to the corresponding level. Values less than zero are to be
 * interpreted as zero; conventionally 1000 indicates full attenuation. For example, a sustain level which corresponds
 * to an absolute value 12dB below of peak would be 120. */



MEPH.define("MEPH.audio.soundfont.chunks.data.operators.SustainVolumeEnvelope", {
    requires: ['MEPH.audio.soundfont.chunks.data.GeneratorsSubchunk'],
    extend: 'MEPH.audio.soundfont.chunks.data.operators.ValueOperator',
    statics: {
    },
    initialize: function (amount)//:int = 0
    {
        this.callParent(Operator.SUSTAIN_RecordL_ENV, amount);
    }
});
