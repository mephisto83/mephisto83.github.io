

MEPH.define("MEPH.audio.soundfont.chunks.data.ZoneRecord", {
    requires: [],
    extend: 'MEPH.audio.soundfont.SFObject',
    statics: {
    },
    properties: {
        id: 0,//int,
        name: "",//:String;
        index: 0,//:int;
        generators: null,//= [ ];
        modulators: null,//:Array = [ ];
    },
    initialize: function (type)//:String
    {
        this.modulators = [];
        this.generators = [];
        this.callParent(type);
        this.nonSerializedProperties.push("generators", "moderators");
    },
    addGenerator: function (generator)//:GeneratorRecord //:void
    {
        this.generators.push(generator);
    },

    addModulatator: function (modulator)//:ModulatorRecord //:void
    {
        this.modulators.push(modulator);
    }
});
