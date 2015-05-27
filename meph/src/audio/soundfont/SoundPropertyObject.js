/**
 * SoundPropertyObject is the base class for Zone and NoteSample. It contains the properties that can be added to a
 * note or a zone by a generator. Another way to look at it is a SoundFontParser sound object consists of a sample
 * waveform and a series of properties that modify it. These properties are contained in the generator subchunks of
 * the data chunk.
 */

MEPH.define("MEPH.audio.soundfont.SoundPropertyObject", {
    requires: [],
    extend: 'MEPH.audio.soundfont.SFObject',
    statics: {
        PROPERTY_NAMES: [],//:Array = ;
        DEFAULTS: {}//:Object = ;
    },
    properties: {

        // Tuning
        coarseTune: 0,//:int = ;
        fineTune: 0,//:int = ;
        scaleTuning: 100,//:int = ;
        // Envelopes
        delayVolEnv: -12000,//:int = ;
        attackVolEnv: -12000,//:int = ;
        holdVolEnv: -12000,//:int = ;
        decayVolEnv: -12000,//:int = ;
        sustainVolEnv: 0,//:int = ;
        releaseVolEnv: -12000,//:int = ;
        delayModEnv: -12000,//:int = ;
        attackModEnv: -12000,//:int = ;
        holdModEnv: -12000,//:int = ;
        decayModEnv: -12000,//:int = ;
        sustainModEnv: 0,//:int = ;
        releaseModEnv: -12000,//:int = ;
        // Keynum envelope modifications
        keyNumToModEnvHold: 0,//:int = ;
        keyNumToModEnvDecay: 0,//:int = ;
        keyNumToVolEnvHold: 0,//:int = ;
        keyNumToVolEnvDecay: 0,//;
        // Modulation envelope relation to pitch and filter
        modEnvToPitch: 0,//:int = ;
        modEnvToFilterFc: 0,//public var ;
        // Low pass filter properties
        initialFilterFc: 13500,//:int = ;
        initialFilterQ: 0,//:int = ;
        // Effects
        pan: 0,//:int = ;
        initialAttenuation: 0,//:int = ;
        chorusEffectsSend: 0,//:int = ;
        reverbEffectsSend: 0,//:int = ;
        // LFOs (Low Frequency Modulators)
        delayModLFO: -12000,//:int = ;
        freqModLFO: 0,//:int = ;
        modLfoToPitch: 0,//:int = ;
        modLfoToFilterFc: 0,//:int = ;
        modLfoToVolume: 0,//:int = ;
        delayVibLFO: -12000,//:int = ;
        freqVibLFO: 0,//:int = ;
        vibLfoToPitch: 0//int = ;

    },
    initialize: function (type)//:String
    {
        this.callParent(type);
        if (SoundPropertyObject.PROPERTY_NAMES.length == 0) {
            this.initStaticConstants(SoundPropertyObject.PROPERTY_NAMES, SoundPropertyObject.DEFAULTS);
        }
    },
    getPropertyNames: function ()//:Array
    {
        return SoundPropertyObject.PROPERTY_NAMES.slice();
    },

    // To keep the size of serialized the representation of SoundPropertyObjects to a minimum, only non-default
    // values are serialized.
    isDefault: function (prop)//:String //:Boolean
    {
        return SoundPropertyObject.PROPERTY_NAMES.indexOf(prop) != -1 && SoundPropertyObject.DEFAULTS[prop] == this[prop];
    },

    // To keep the size of serialized the representation of SoundPropertyObjects to a minimum, only non-default
    // values are serialized.
    includePropertyInSerialization: function (propertyName)//:String //:Boolean
    {
        return !this.isDefault(propertyName) && this.callParent((propertyName));
    },

    // We could manually write out a constant that containes the default values of the propetties of this class.
    // Instead we let the class do it for us based on the initial values of the public properties defined above.
    // Nifty little hack, eh?
    initStaticConstants: function (propertyNames, defaults)//:Array //:Object  //:void
    {
        var props = this.getPropertyNames().concat(this.getPropertyNames(false));
        for (var i = 0 ; i < props.length ; i++)//:String 
        {
            var prop = props[i];
            this.propertyNames.push(prop);
            defaults[prop] = this[prop];
        }
    }
});
