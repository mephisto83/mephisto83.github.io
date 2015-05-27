


MEPH.define("MEPH.audio.soundfont.chunks.data.ZonesSubchunk", {
    requires: ['MEPH.audio.soundfont.chunks.data.operators.Operator',
                'MEPH.audio.soundfont.chunks.data.GeneratorRecord',
                'MEPH.audio.soundfont.utils.SFByteArray'],
    extend: 'MEPH.audio.soundfont.chunks.Subchunk',
    statics: {
    },
    initialize: function (type, source, chunkSize, recordSize)//:String    //:SFByteArray   //:uint //:int
    {
        this.callParent(type, source, chunkSize, recordSize);
    },
    getZoneRecord: function (index)//int //:ZoneRecord
    {
        return this.getRecord(index);// as ZoneRecord;
    },

    /* A "bag" is a subchunk that contains an arbitrary number of data records. Each record in the bag contains a
    generator index and a modulator index. The generator index represents the index of the first generator operator
    that belongs to the InstrumentZone or PresetZone associated with the bag record. By navigating through the
    given generators subchunk we construct Generators and Operators, assigning the Operators to the appropriate
    Generator and the Genrators to the appropriate Zone. */
    processGenerators: function (generators, bags)//:GeneratorsSubchunk  //:BagsSubchunk  //:void
    {
        var numBags = bags.getNumRecords();//:int bags[prototype][prototype][Methods].getNumRecords
        var numOperators = generators.getNumRecords();//:int 
        for (var i = 0; i < this.getNumRecords() ; i++)//:int 
        {
            var record = this.getZoneRecord(i);//:ZoneRecord 
            var nextRecord = (i < this.getNumRecords() - 1) ? this.getZoneRecord(i + 1) : null; //:ZoneRecord 
            var generatorStart = record.index;//:int 
            // The index of last generator of the current ZoneRecord is one less than the index of the first
            // generator of the next ZoneRecord -- unless this is the last ZoneRecord. In that case, the index of
            // the last generator is one less than the total number of records contained in the bags subchunk.
            var generatorEnd = (nextRecord != null) ? nextRecord.index : numBags;//:int 
            for (var j = generatorStart; j < generatorEnd; j++)//:int 
            {
                var generator = new GeneratorRecord();//:GeneratorRecord 
                var bag = bags.getBag(j); //:BagRecord 
                var nextBag = (j < numBags - 1) ? bags.getBag(j + 1) : null;//:BagRecord 
                var operatorStart = bag.generatorIndex;//:int 
                var operatorEnd = (nextBag != null) ? nextBag.generatorIndex : numOperators;//:int 
                var numUsedOperators = 0;//:int 
                for (var k = operatorStart; k < operatorEnd; k++)//:int 
                {
                    var operator = generators.getOperator(k);//:Operator 
                    // We ignore any unused operator types
                    if (!operator.getIsUnusedType()) {
                        generator.operators[operator.id] = operator;
                        ++numUsedOperators;
                    }
                }
                // If all the operators for this generator are unused types, we don't want to
                // add it to our preset
                if (numUsedOperators > 0) {
                    record.addGenerator(generator);
                }
            }
        }
    }
});
