/*
    A SoundFont Generator represents a list of operators that modify the properties of an InstrumentZone or a
    PresetZone. These operators are contained in the Instrument Generators subchunk and the Preset Generators subchunk.
    (Note: There is no "InstrumentGeneratorRecord" or "PresetGeneratorRecord" class, only the "GeneratorRecord" class
    which does double duty.)
*/

MEPH.define("MEPH.audio.soundfont.chunks.data.GeneratorRecord", {
    requires: ['MEPH.audio.soundfont.chunks.data.operators.KeyRange',
                'MEPH.audio.soundfont.chunks.data.operators.Operator',
                'MEPH.audio.soundfont.chunks.data.operators.RangeOperator',
                'MEPH.audio.soundfont.chunks.data.operators.SampleID'],
    extend: 'MEPH.audio.soundfont.SFObject',
    statics: {
    },
    properties: {
        operators: null //:Dictionary  = new Dictionary(false);
    },

    initialize: function () {
        this.operators = {};
        this.callParent("Generator");
        this.nonSerializedProperties.push("operators");
    },

    setOperator: function (operator)//:Operator //:void
    {
        this.operators[operator.id] = operator;
    },

    getOperator: function (type)//:int //:Operator
    {
        return (this.operators.hasOwnProperty(type)) ? this.operators[type] : null;
    },

    getSampleID: function ()//:int
    {
        if (this.operators.hasOwnProperty(Operator.SAMPLE_ID)) {
            var operator = this.operators[Operator.SAMPLE_ID];//:Operator 
            return operator.amount;
        }
        return -1;
    },

    getInstrumentID: function ()//:int
    {
        if (this.operators.hasOwnProperty(Operator.INSTRUMENT)) {
            var operator = this.operators[Operator.INSTRUMENT];//:Operator 
            return operator.amount;
        }
        return -1;
    },

    getKeyRange: function ()//:Range
    {
        if (this.operators.hasOwnProperty(Operator.KEY_RANGE)) {
            var operator = this.operators[Operator.KEY_RANGE];//:RangeOperator 
            return operator.values;
        }
        return null;
    },

    getVelocityRange: function ()//:Range
    {
        if (this.operators.hasOwnProperty(Operator.VEL_RANGE)) {
            var operator = this.operators[Operator.VEL_RANGE];//:RangeOperator 
            return operator.values;
        }
        return null;
    }
});
