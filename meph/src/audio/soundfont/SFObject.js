/**
 * SFObject is the base class for all objects in SoundFont Parser. It provides methods to serialize the object to XML,
 * raise errors, and get a string representation of the object.
 */


MEPH.define("MEPH.audio.soundfont.SFObject", {
    requires: [],
    
    statics: {
        NON_SERIALIZABLE_TYPES: ["ByteArray", "SFByteArray"],
        /**
        * Used by the raiseError() method for determining how to respond to raised errors.
         */
        errorReportingMethod: "error"//"trace" // :String
    },
    properties: {
        /**
         * An array of property names to omit from the XML serialization of the object.
         */
        nonSerializedProperties: null,

        /**
         * The name of the object (usually the class name).
         */
        type: undefined,
        propertyNames: undefined
    },//String;
    initialize: function (type) // type:String
    {
        this.type = type;
        this.nonSerializedProperties = ["type", "nonSerializedProperties"];
        this.propertyNames = [];
    },

    getPropertyNames: function ()//:Array
    {
        return this.propertyNames;
    },

    toString: function ()//:String
    {
        return JSON.stringify(this);
    },

    /**
     * Uses flash.utils.describeType to get a list of all public properties (both vars and accessors) of this object,
     * the produces an XML representation of the object.
     */
    toXML: function () // :XML now JSON
    {
        return this.toString();
    },
    /**
     * A method to allow subclasses to define criteria for including or exclusing particular properties from XML
     * serialization.
     */
    includePropertyInSerialization: function (propertyName) // :String :Boolean
    {
        return this[propertyName] != null;
    },

    /**
     * A method to allow subclasses to get a list of property names for this object. Used in XML serialization. Also
     * used in Zone and NoteSample (and their subclasses) to construct the DEFAULTS object.
     */
    getPropertyNames: function (includeAccessors)// :Boolean = true / :Array
    {
        var classInfo = describeType(this); //:XML
        var properties = classInfo.variable;//:XMLList 
        if (includeAccessors) {
            properties.concat(classInfoaccessor.where(function (x) { return (x.access != "writeonly") }));
        }
        var propertyNames = [];//:Array 
        for (var propertyXML in properties) //propertyXML:XML 
        {
            //    if (SFObject.NON_SERIALIZABLE_TYPES.indexOf(propertyXML.@type.toString()) == -1 && this.nonSerializedProperties.
            //        indexOf(propertyXML.@name.toString()) == -1)
            //{
            //    propertyNames.push(propertyXML.@name.toString());
            //}
        }
        return propertyNames;
    },

    /**
     * A simple method for dealing with errors. Allows you to set the method to "trace" or "error."
     */
    raiseError: function (message) // :String //:void
    {
        switch (SFObject.errorReportingMethod) {
            case "trace":
                {
                    console(message);
                    break;
                }
            case "error":
                {
                    throw new Error(message);
                    break;
                }
        }
    }
});