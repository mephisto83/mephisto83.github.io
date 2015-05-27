


MEPH.define("MEPH.audio.soundfont.chunks.data.operators.OperatorFactory", {
    alternateNames: ['OperatorFactory'],
    requires: ['MEPH.audio.soundfont.chunks.Subchunk',
                'MEPH.audio.soundfont.chunks.data.operators.Operator',
                'MEPH.audio.soundfont.chunks.data.operators.StartAddressOffset',
                'MEPH.audio.soundfont.chunks.data.operators.EndAddressOffset',
                'MEPH.audio.soundfont.chunks.data.operators.StartLoopAddressOffset',
                'MEPH.audio.soundfont.chunks.data.operators.EndLoopAddressOffset',
                'MEPH.audio.soundfont.chunks.data.operators.StartAddressCoarseOffset',
                'MEPH.audio.soundfont.chunks.data.operators.ModulationLFOToPitch',
                'MEPH.audio.soundfont.chunks.data.operators.VibratoLFOToPitch',
                'MEPH.audio.soundfont.chunks.data.operators.ModulationEnvelopeToPitch',
                'MEPH.audio.soundfont.chunks.data.operators.InitialFilterFC',
                'MEPH.audio.soundfont.chunks.data.operators.InitialFilterQ',
                'MEPH.audio.soundfont.chunks.data.operators.ModulationLFOToFilterFC',
                'MEPH.audio.soundfont.chunks.data.operators.ModulationEnvelopeToFilterFC',
                'MEPH.audio.soundfont.chunks.data.operators.EndAddressCoarseOffset',
                'MEPH.audio.soundfont.chunks.data.operators.ModulationLFOToVolume',
                'MEPH.audio.soundfont.chunks.data.operators.ChorusEffectsSend',
                'MEPH.audio.soundfont.chunks.data.operators.ReverbEffectsSend',
                'MEPH.audio.soundfont.chunks.data.operators.Pan',
                'MEPH.audio.soundfont.chunks.data.operators.DelayModulationLFO',
                'MEPH.audio.soundfont.chunks.data.operators.FrequencyModulationLFO',
                'MEPH.audio.soundfont.chunks.data.operators.DelayVibratoLFO',
                'MEPH.audio.soundfont.chunks.data.operators.FrequencyVibratoLFO',
                'MEPH.audio.soundfont.chunks.data.operators.DelayModulationEnvelope',
                'MEPH.audio.soundfont.chunks.data.operators.AttackModulationEnvelope',
                'MEPH.audio.soundfont.chunks.data.operators.HoldModulationEnvelope',
                'MEPH.audio.soundfont.chunks.data.operators.DecayModulationEnvelope',
                'MEPH.audio.soundfont.chunks.data.operators.SustainModulationEnvelope',
                'MEPH.audio.soundfont.chunks.data.operators.ReleaseModulationEnvelope',
                'MEPH.audio.soundfont.chunks.data.operators.KeyNumToModulationEnvelopeHold',
                'MEPH.audio.soundfont.chunks.data.operators.KeyNumToModulationEnvelopeDecay',
                'MEPH.audio.soundfont.chunks.data.operators.DelayVolumeEnvelope',
                'MEPH.audio.soundfont.chunks.data.operators.AttackVolumeEnvelope',
                'MEPH.audio.soundfont.chunks.data.operators.HoldVolumeEnvelope',
                'MEPH.audio.soundfont.chunks.data.operators.DecayVolumeEnvelope',
                'MEPH.audio.soundfont.chunks.data.operators.SustainVolumeEnvelope',
                'MEPH.audio.soundfont.chunks.data.operators.ReleaseVolumeEnvelope',
                'MEPH.audio.soundfont.chunks.data.operators.KeyNumToVolumeEnvelopeHold',
                'MEPH.audio.soundfont.chunks.data.operators.KeyNumToVolumeEnvelopeDecay',
                'MEPH.audio.soundfont.chunks.data.operators.Instrument',
                'MEPH.audio.soundfont.chunks.data.operators.KeyRange',
                'MEPH.audio.soundfont.chunks.data.operators.VelocityRange',
                'MEPH.audio.soundfont.chunks.data.operators.StartLoopAddressCoarseOffset',
                'MEPH.audio.soundfont.chunks.data.operators.KeyNumOverride',
                'MEPH.audio.soundfont.chunks.data.operators.VelocityOverride',
                'MEPH.audio.soundfont.chunks.data.operators.InitialAttenuation',
                'MEPH.audio.soundfont.chunks.data.operators.EndLoopAddressCoarseOffset',
                'MEPH.audio.soundfont.chunks.data.operators.CoarseTune',
                'MEPH.audio.soundfont.chunks.data.operators.FineTune',
                'MEPH.audio.soundfont.chunks.data.operators.SampleID',
                'MEPH.audio.soundfont.chunks.data.operators.SampleModes',
                'MEPH.audio.soundfont.chunks.data.operators.ScaleTuning',
                'MEPH.audio.soundfont.chunks.data.operators.ExclusiveClass',
                'MEPH.audio.soundfont.chunks.data.operators.OverridingRootKey',
                'MEPH.audio.soundfont.chunks.data.operators.UnusedOperator',
                'MEPH.audio.soundfont.utils.SFByteArray',
                'MEPH.audio.soundfont.chunks.data.GeneratorsSubchunk'],

    statics: {
        CLASSES: {},//createClassesDictionary();
        inited: false,
        createClassesDictionary: function ()//:Dictionary
        {
            var classes = OperatorFactory.CLASSES;
            classes[Operator.START_ADDRS_OFFSET] = MEPH.audio.soundfont.chunks.data.operators.StartAddressOffset;
            classes[Operator.END_ADDRS_OFFSET] = MEPH.audio.soundfont.chunks.data.operators.EndAddressOffset;
            classes[Operator.START_LOOP_ADDRS_OFFSET] = MEPH.audio.soundfont.chunks.data.operators.StartLoopAddressOffset;
            classes[Operator.END_LOOP_ADDRS_OFFSET] = MEPH.audio.soundfont.chunks.data.operators.EndLoopAddressOffset;
            classes[Operator.START_ADDRS_COARSE_OFFSET] = MEPH.audio.soundfont.chunks.data.operators.StartAddressCoarseOffset;
            classes[Operator.MOD_LFO_TO_PITCH] = MEPH.audio.soundfont.chunks.data.operators.ModulationLFOToPitch;
            classes[Operator.VIB_LFO_TO_PITCH] = MEPH.audio.soundfont.chunks.data.operators.VibratoLFOToPitch;
            classes[Operator.MOD_ENV_TO_PITCH] = MEPH.audio.soundfont.chunks.data.operators.ModulationEnvelopeToPitch;
            classes[Operator.INITIAL_FILTER_FC] = MEPH.audio.soundfont.chunks.data.operators.InitialFilterFC;
            classes[Operator.INITIAL_FILTER_Q] = MEPH.audio.soundfont.chunks.data.operators.InitialFilterQ;
            classes[Operator.MOD_LFO_TO_FILTER_FC] = MEPH.audio.soundfont.chunks.data.operators.ModulationLFOToFilterFC;
            classes[Operator.MOD_ENV_TO_FILTER_FC] = MEPH.audio.soundfont.chunks.data.operators.ModulationEnvelopeToFilterFC;
            classes[Operator.END_ADDRS_COARSE_OFFSET] = MEPH.audio.soundfont.chunks.data.operators.EndAddressCoarseOffset;
            classes[Operator.MOD_LFO_TO_RecordLUME] = MEPH.audio.soundfont.chunks.data.operators.ModulationLFOToVolume;
            classes[Operator.CHORUS_EFFECTS_SEND] = MEPH.audio.soundfont.chunks.data.operators.ChorusEffectsSend;
            classes[Operator.REVERB_EFFECTS_SEND] = MEPH.audio.soundfont.chunks.data.operators.ReverbEffectsSend;
            classes[Operator.PAN] = MEPH.audio.soundfont.chunks.data.operators.Pan;
            classes[Operator.DELAY_MOD_LFO] = MEPH.audio.soundfont.chunks.data.operators.DelayModulationLFO;
            classes[Operator.FREQ_MOD_LFO] = MEPH.audio.soundfont.chunks.data.operators.FrequencyModulationLFO;
            classes[Operator.DELAY_VIB_LFO] = MEPH.audio.soundfont.chunks.data.operators.DelayVibratoLFO;
            classes[Operator.FREQ_VIB_LFO] = MEPH.audio.soundfont.chunks.data.operators.FrequencyVibratoLFO;
            classes[Operator.DELAY_MOD_ENV] = MEPH.audio.soundfont.chunks.data.operators.DelayModulationEnvelope;
            classes[Operator.ATTACK_MOD_ENV] = MEPH.audio.soundfont.chunks.data.operators.AttackModulationEnvelope;
            classes[Operator.HOLD_MOD_ENV] = MEPH.audio.soundfont.chunks.data.operators.HoldModulationEnvelope;
            classes[Operator.DECAY_MOD_ENV] = MEPH.audio.soundfont.chunks.data.operators.DecayModulationEnvelope;
            classes[Operator.SUSTAIN_MOD_ENV] = MEPH.audio.soundfont.chunks.data.operators.SustainModulationEnvelope;
            classes[Operator.RELEASE_MOD_ENV] = MEPH.audio.soundfont.chunks.data.operators.ReleaseModulationEnvelope;
            classes[Operator.KEYNUM_TO_MOD_ENV_HOLD] = MEPH.audio.soundfont.chunks.data.operators.KeyNumToModulationEnvelopeHold;
            classes[Operator.KEYNUM_TO_MOD_ENV_DECAY] = MEPH.audio.soundfont.chunks.data.operators.KeyNumToModulationEnvelopeDecay;
            classes[Operator.DELAY_RecordL_ENV] = MEPH.audio.soundfont.chunks.data.operators.DelayVolumeEnvelope;
            classes[Operator.ATTACK_RecordL_ENV] = MEPH.audio.soundfont.chunks.data.operators.AttackVolumeEnvelope;
            classes[Operator.HOLD_RecordL_ENV] = MEPH.audio.soundfont.chunks.data.operators.HoldVolumeEnvelope;
            classes[Operator.DECAY_RecordL_ENV] = MEPH.audio.soundfont.chunks.data.operators.DecayVolumeEnvelope;
            classes[Operator.SUSTAIN_RecordL_ENV] = MEPH.audio.soundfont.chunks.data.operators.SustainVolumeEnvelope;
            classes[Operator.RELEASE_RecordL_ENV] = MEPH.audio.soundfont.chunks.data.operators.ReleaseVolumeEnvelope;
            classes[Operator.KEYNUM_TO_RecordL_ENV_HOLD] = MEPH.audio.soundfont.chunks.data.operators.KeyNumToVolumeEnvelopeHold;
            classes[Operator.KEYNUM_TO_RecordL_ENV_DECAY] = MEPH.audio.soundfont.chunks.data.operators.KeyNumToVolumeEnvelopeDecay;
            classes[Operator.INSTRUMENT] = MEPH.audio.soundfont.chunks.data.operators.Instrument;
            classes[Operator.KEY_RANGE] = MEPH.audio.soundfont.chunks.data.operators.KeyRange;
            classes[Operator.VEL_RANGE] = MEPH.audio.soundfont.chunks.data.operators.VelocityRange;
            classes[Operator.START_LOOP_ADDRS_COARSE_OFFSET] = MEPH.audio.soundfont.chunks.data.operators.StartLoopAddressCoarseOffset;
            classes[Operator.KEY_NUM] = MEPH.audio.soundfont.chunks.data.operators.KeyNumOverride;
            classes[Operator.VELOCITY] = MEPH.audio.soundfont.chunks.data.operators.VelocityOverride;
            classes[Operator.INITIAL_ATTENUATION] = MEPH.audio.soundfont.chunks.data.operators.InitialAttenuation;
            classes[Operator.END_LOOP_ADDRS_COARSE_OFFSET] = MEPH.audio.soundfont.chunks.data.operators.EndLoopAddressCoarseOffset;
            classes[Operator.COARSE_TUNE] = MEPH.audio.soundfont.chunks.data.operators.CoarseTune;
            classes[Operator.FINE_TUNE] = MEPH.audio.soundfont.chunks.data.operators.FineTune;
            classes[Operator.SAMPLE_ID] = MEPH.audio.soundfont.chunks.data.operators.SampleID;
            classes[Operator.SAMPLE_MODES] = MEPH.audio.soundfont.chunks.data.operators.SampleModes;
            classes[Operator.SCALE_TUNING] = MEPH.audio.soundfont.chunks.data.operators.ScaleTuning;
            classes[Operator.EXCLUSIVE_CLASS] = MEPH.audio.soundfont.chunks.data.operators.ExclusiveClass;
            classes[Operator.OVERRIDING_ROOT_KEY] = MEPH.audio.soundfont.chunks.data.operators.OverridingRootKey;
            classes[Operator.UNUSED_1] = MEPH.audio.soundfont.chunks.data.operators.UnusedOperator;
            classes[Operator.UNUSED_2] = MEPH.audio.soundfont.chunks.data.operators.UnusedOperator;
            classes[Operator.UNUSED_3] = MEPH.audio.soundfont.chunks.data.operators.UnusedOperator;
            classes[Operator.UNUSED_4] = MEPH.audio.soundfont.chunks.data.operators.UnusedOperator;
            classes[Operator.UNUSED_5] = MEPH.audio.soundfont.chunks.data.operators.UnusedOperator;
            classes[Operator.RESERVED_1] = MEPH.audio.soundfont.chunks.data.operators.UnusedOperator;
            classes[Operator.RESERVED_2] = MEPH.audio.soundfont.chunks.data.operators.UnusedOperator;
            classes[Operator.RESERVED3] = MEPH.audio.soundfont.chunks.data.operators.UnusedOperator;
            classes[Operator.END_OPER] = MEPH.audio.soundfont.chunks.data.operators.UnusedOperator;
            return classes;
        },
        create: function (bytes)//:SFByteArray //:Operator
        {
            var type = bytes.readWord();//:int 
            var generatorClass = this.getClass(type);//:Class 
            var amount;//:*
            switch (type) {
                case Operator.KEY_RANGE:
                case Operator.VEL_RANGE:
                    var low = bytes.readByte();//:int 
                    var high = bytes.readByte();//:int 
                    amount = [low, high];
                    break;
                case Operator.INSTRUMENT:
                case Operator.SAMPLE_ID:
                    amount = bytes.readUnsignedShort();
                    break;
                default:
                    amount = bytes.readShort();
                    break;
            }
            return new generatorClass(amount);
        },

        getClass: function (type)//:int //:Class
        {
            if (!OperatorFactory.inited) {
                OperatorFactory.CLASSES = OperatorFactory.createClassesDictionary();
                OperatorFactory.inited = true;
            }
            if (!OperatorFactory.CLASSES.hasOwnProperty(type)) {
                //throw new Error("Unknown Generator Type: " + type);
                trace("OperatorFactory::getClass: Unknown Generator Type: " + type);
                return UnusedOperator;
            }
            return OperatorFactory.CLASSES[type];
        }
    }
});
