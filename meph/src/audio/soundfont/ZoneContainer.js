/**
 * ZoneContainer is the base class for Preset and Instrument. It defines the common elements of these two classes. The
 * most important of these is the zones array which contains definitions for specified keyRange/velocityRange pairs.
 */


MEPH.define("MEPH.audio.soundfont.ZoneContainer", {
    requires: ['MEPH.audio.soundfont.chunks.data.ZoneRecord',
                'MEPH.audio.soundfont.chunks.data.GeneratorRecord',
                "MEPH.audio.soundfont.Zone",
                'MEPH.audio.soundfont.chunks.data.operators.Operator',
                'MEPH.audio.soundfont.chunks.data.operators.RangeOperator'],
    extend: 'MEPH.audio.soundfont.SFObject',
    statics: {
    },
    properties: {
        /**
         * The lower-level data for this ZoneContainer. It contains the samples, generators and modulators which the
         * buildZones method uses to compile the zones for this container.
         */
        record: null,//:ZoneRecord;
        /**
         * The class which represents an individual zone in this container. (For Preset it is PresetZone. For Instrument
         * it is InstrumentZone.)
         */
        _zoneClass: null,//:Class = Zone;
        /**
         * The "Global Zone" is a concept from the SoundFont specs. It represents the defaults for this particular
         * container.
         */
        _globalZone: null,//:Zone;
        /**
         * An array containing the zones for this container. It is empty until the buildZones populates it.
         */
        _zones: null//Array = [];

    },

    initialize: function (type, record, zoneClass)//:String, //:ZoneRecord, //:Class
    {
        this._zones = [];
        this._zoneClass = Zone;
        this.callParent(type);
        this.nonSerializedProperties.push("record");
        this._zoneClass = zoneClass;
        this.record = record;
    },

    getId: function ()//:int
    {
        return this.record.id;
    },

    getName: function ()//:String
    {
        return this.record.name;
    },

    getIndex: function ()//:int
    {
        return this.record.index;
    },

    /**
     * Finds an zone that can play the specified key and velocity. If it can't find an exact match, it chooses the
     * closest non-match. KeyNum is the first priority and velocity is the tie-breaker.
     */
    getZone: function (keyNum, velocity)//:int //:int // :Zone
    {
        var closestVelDistance = 128;//:int 
        var closestKeyDistance = 128;//:int 
        var closestZone;//:Zone
        for (var i = 0; i < this._zones.length ; i++)//:Zone
        {
            var zone = this._zones[i];
            if (zone.fits(keyNum, velocity)) {
                return zone;
            }
            var keyDistance = Math.abs(keyNum - zone.keyRange.low);//:int 
            keyDistance = Math.min(keyDistance, Math.abs(keyNum - zone.keyRange.high));
            var velDistance = Math.abs(velocity - zone.velRange.low);//:int 
            velDistance = Math.min(velDistance, Math.abs(velocity - zone.velRange.high));
            if (keyDistance < closestKeyDistance) {
                closestKeyDistance = keyDistance;
                closestVelDistance = velDistance;
                closestZone = zone;
            }
            else if (keyDistance == closestKeyDistance) {
                if (velDistance < closestVelDistance) {
                    closestVelDistance = velDistance;
                    closestZone = zone;
                }
            }
        }
        return closestZone;
    },

    /**
     * This method uses the samples, generators and modulators from the ZoneRecord data to populate the zones array.
     */
    buildZones: function (records)//:Array //:void
    {
        if (this.record.generators)
            for (var i = 0 ; i < this.record.generators.length ; i++)//:GeneratorRecord
            {
                var generator = this.record.generators[i];
                this.buildZone(generator, records);
            }
    },

    toXML: function ()//:XML
    {
        //var xml:XML = new XML("<" + type + "/>");
        //xml.@id = this.id;
        //xml.@index = this.index;
        //xml.@name = this.name;
        //var zonesXML:XML = <zones/>;
        //var zones:Array = _zones.slice();
        //if (_globalZone != null)
        //{
        //    zones.unshift(_globalZone);
        //}
        //for each (var zone:Zone in zones)
        //{
        //    zonesXML.appendChild(zone.toXML());
        //}
        //xml.appendChild(zonesXML);
        //return xml;
        return "overridden zonecontainer";
    },

    /**
     * A helper method for creating a zone. Subclasses can override this method to define how zones should be built.
     * It uses the _zoneClass property to know what class to instantiate when creating a zone.
     */
    buildZone: function (generator, records)//:GeneratorRecord //:Array //:Zone
    {
        var zone = new this._zoneClass();//:Zone 
        if (generator.operators) {
            for (var i in generator.operators)//:Operator
            {
                var operator = generator.operators[i];
                if (operator instanceof RangeOperator) {
                    zone[operator.getName()] = operator.getValues();//RangeOperator(
                }
                else if (!operator.getIsUnusedType()) {
                    zone[operator.getName()] = operator.amount;
                }
            }
        }
        return zone;
    }
});