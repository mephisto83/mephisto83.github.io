/*
   struct sfGenList
   {
       SFGenerator sfGenOper;
       genAmountType genAmount;
   };
   */
MEPH.define("MEPH.audio.soundfont.chunks.data.operators.Operator", {
    requires: [],
    alternateNames: 'Operator',
    extend: 'MEPH.audio.soundfont.SFObject',
    statics: {
        START_ADDRS_OFFSET: 0,//:int = ;
        END_ADDRS_OFFSET: 1,//:int = ;
        START_LOOP_ADDRS_OFFSET: 2,//:int = ;
        END_LOOP_ADDRS_OFFSET: 3,//:int = ;
        START_ADDRS_COARSE_OFFSET: 4,//;
        MOD_LFO_TO_PITCH: 5,//:int = ;
        VIB_LFO_TO_PITCH: 6,//:int = ;
        MOD_ENV_TO_PITCH: 7,//:int = ;
        INITIAL_FILTER_FC: 8,//:int = ;
        INITIAL_FILTER_Q: 9,//:int = ;
        MOD_LFO_TO_FILTER_FC: 10,//:int = ;
        MOD_ENV_TO_FILTER_FC: 11,//:int = ;
        END_ADDRS_COARSE_OFFSET: 12,//:int = ;
        MOD_LFO_TO_RecordLUME: 13,//:int = ;
        UNUSED_1: 14,//:int = ;
        CHORUS_EFFECTS_SEND: 15,//:int = ;
        REVERB_EFFECTS_SEND: 16,//:int = ;
        PAN: 17,//:int = ;
        UNUSED_2: 18,//:int = ;
        UNUSED_3: 19,//:int = ;
        UNUSED_4: 20,//:int = ;
        DELAY_MOD_LFO: 21,//:int = ;
        FREQ_MOD_LFO: 22,//:int = ;
        DELAY_VIB_LFO: 23,//:int = ;
        FREQ_VIB_LFO: 24,//:int = ;
        DELAY_MOD_ENV: 25,//:int = ;
        ATTACK_MOD_ENV: 26,//:int = ;
        HOLD_MOD_ENV: 27,//:int = ;
        DECAY_MOD_ENV: 28,//:int = ;
        SUSTAIN_MOD_ENV: 29,//:int = ;
        RELEASE_MOD_ENV: 30,//:int = ;
        KEYNUM_TO_MOD_ENV_HOLD: 31,//:int = ;
        KEYNUM_TO_MOD_ENV_DECAY: 32,//:int = ;
        DELAY_RecordL_ENV: 33,//:int = ;
        ATTACK_RecordL_ENV: 34,///:int = ;
        HOLD_RecordL_ENV: 35,//:int = ;
        DECAY_RecordL_ENV: 36,//:int = ;
        SUSTAIN_RecordL_ENV: 37,//:int = ;
        RELEASE_RecordL_ENV: 38,//:int = ;
        KEYNUM_TO_RecordL_ENV_HOLD: 39,//:int = ;
        KEYNUM_TO_RecordL_ENV_DECAY: 40,//;
        INSTRUMENT: 41,//:int = ;
        RESERVED_1: 42,//:int = ;
        KEY_RANGE: 43,//:int = ;
        VEL_RANGE: 44,//:int = ;
        START_LOOP_ADDRS_COARSE_OFFSET: 45,//:int = ;
        KEY_NUM: 46,//:int = ;
        VELOCITY: 47,//:int = ;
        INITIAL_ATTENUATION: 48,//:int = ;
        RESERVED_2: 49,//:int = ;
        END_LOOP_ADDRS_COARSE_OFFSET: 50,//:int = ;
        COARSE_TUNE: 51,//:int = ;
        FINE_TUNE: 52,//:int = ;
        SAMPLE_ID: 53,//:int = ;
        SAMPLE_MODES: 54,//:int = ;
        RESERVED3: 55,//:int = ;
        SCALE_TUNING: 56,//:int = ;
        EXCLUSIVE_CLASS: 57,//:int = ;
        OVERRIDING_ROOT_KEY: 58,//:int = ;
        UNUSED_5: 59,//:int = ;
        END_OPER: 60,///:int = ;

        NAMES: [//:Array =
            "startAddrsOffset", "endAddrsOffset", "startLoopAddrsOffset", "endLoopAddrsOffset",
            "startAddrsCoarseOffset", "modLfoToPitch", "vibLfoToPitch", "modEnvToPitch",
            "initialFilterFc", "initialFilterQ", "modLfoToFilterFc", "modEnvToFilterFc",
            "endAddrsCoarseOffset", "modLfoToVolume", "unused1", "chorusEffectsSend",
            "reverbEffectsSend", "pan", "unused2", "unused3", "unused4", "delayModLFO",
            "freqModLFO", "delayVibLFO", "freqVibLFO", "delayModEnv", "attackModEnv",
            "holdModEnv", "decayModEnv", "sustainModEnv", "releaseModEnv", "keyNumToModEnvHold",
            "keyNumToModEnvDecay", "delayVolEnv", "attackVolEnv", "holdVolEnv", "decayVolEnv",
            "sustainVolEnv", "releaseVolEnv", "keyNumToVolEnvHold", "keyNumToVolEnvDecay",
            "instrumentID", "reserved1", "keyRange", "velRange", "startLoopAddrsCoarseOffset",
            "keyNum", "velocity", "initialAttenuation", "reserved2", "endLoopAddrsCoarseOffset",
            "coarseTune", "fineTune", "sampleID", "sampleMode", "reserved3", "scaleTuning",
            "exclusiveClass", "overridingRootKey", "unused5", "endOper"
        ]
    },
    properties: {
        id: 0,//int;
        amount: 0,//int;
        defaultValue: null,
        //public var name:String;
        description: null,//:String;
    },
    initialize: function (id, amount)//:int   //:int
    {
        this.id = id;
        this.callParent(this.getName());
        this.amount = amount;
        this.nonSerializedProperties.push("isUnusedType");
    },

    getName: function ()//:String
    {
        return Operator.NAMES[this.id];
    },

    getIsUnusedType: function ()//:Boolean
    {
        return false;
    }
});