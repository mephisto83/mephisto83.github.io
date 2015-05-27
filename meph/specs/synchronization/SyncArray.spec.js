describe("MEPH/synchronization/SyncArray.spec.js", function () {
    var createSyncGroup,
        createSyncGroupWithSendControl;
    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });

    it('create an object, and assign an array property.', function (done) {
        MEPH.create('MEPH.synchronization.SyncObject').then(function ($class) {
            //Arrange
            var jobject = new $class();

            //Act
            var result = jobject.createObj({
                properties: {
                    prop1: [],
                    prop2: null
                }
            });

            //Assert
            expect(result).toBeTruthy();
            expect(result.prop1).theTruth('prop1 was not an array');
            expect(result.prop2 === null).toBeTruthy();

        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });

    it('create an object with and an array, and be sure it creates a new object with the correct path.', function (done) {
        MEPH.create('MEPH.synchronization.SyncObject').then(function ($class) {
            //Arrange
            var jobject = new $class();
            var result = jobject.createObj({
                properties: {
                    property: []
                }
            });

            //Act
            var altered = 0;
            var created = 0;
            jobject.on('created-object', function () { created++; });
            result.property.on('array_altered', function () { altered++; });
            result.property.push({ value: 'value' });

            //Assert
            expect(created === 1).theTruth('created was not 1');
            expect(altered === 1).theTruth('altered was not 1');
            expect(result.property[0].jsyncId()).theTruth('no sync id');

        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });


    it('adds multiple objects.', function (done) {
        MEPH.create('MEPH.synchronization.SyncObject').then(function ($class) {
            //Arrange
            var jobject = new $class();
            var result = jobject.createObj({
                properties: {
                    property: []
                }
            });
            var altered = 0;
            var created = 0;
            jobject.on('created-object', function () { created++; });
            result.property.on('array_altered', function () {
                altered++;
            });

            //Act
            result.property.push.apply(result.property, [].interpolate(0, 10, function (x) {
                return { x: x };
            }));


            //Assert
            expect(result.property.length).toBeTruthy();
            expect(altered == 1).toBeTruthy();
            expect(created == 10).toBeTruthy();
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });



    it('detects removal of object.', function (done) {
        MEPH.create('MEPH.synchronization.SyncObject').then(function ($class) {
            //Arrange
            var jobject = new $class();
            var altered = 0;
            var result = jobject.createObj({ properties: { property: [] } });
            result.property.push({ value: 'value' });
            result.property.on('array_altered', function () { altered++; });

            //Act
            var value = result.property.pop();
            //Assert
            expect(altered).toBeTruthy();
            expect(value.value === 'value').toBeTruthy();
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });


    it('detects splice removal of object.', function (done) {
        MEPH.create('MEPH.synchronization.SyncObject').then(function ($class) {
            //Arrange
            var jobject = new $class();
            var altered = 0;
            var result = jobject.createObj({ properties: { property: [] } });
            result.property.push({ value: 'value' });
            result.property.on('array_altered', function () { altered++; });

            //Act
            var value = result.property.splice(0, 1);

            //Assert
            expect(altered).toBeTruthy();
            expect(value[0].value === 'value').theTruth('value wasnt right.');

        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });


    it('detect splice , addition of object.', function (done) {
        MEPH.create('MEPH.synchronization.SyncObject').then(function ($class) {
            //Arrange
            var jobject = new $class();
            var altered = 0;
            var result = jobject.createObj({ properties: { property: [] } });
            result.property.push({ value: 'value' });
            result.property.on('array_altered', function () { altered++; });

            //Act
            var value = result.property.splice(1, 0, { value: 2 });

            //Assert
            expect(altered).toBeTruthy();
            expect(result.property[1].value === 2).theTruth('property[1].value was not 2');

        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });



    it('detect splice, addition and removal.', function (done) {
        MEPH.create('MEPH.synchronization.SyncObject').then(function ($class) {
            //Arrange
            var jobject = new $class();
            var altered = 0;
            var result = jobject.createObj({ properties: { property: [] } });
            result.property.push({ value: 'value' });
            result.property.on('array_altered', function () { altered++; });

            //Act
            var value = result.property.splice(0, 1, { value: 2 });

            //Assert
            expect(altered).toBeTruthy();
            expect(result.property[0].value === 2).theTruth('property[1].value was not 2');
            expect(value[0].value === 'value').theTruth('value[0].value was not value');;

        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });


    it('detects unshift.', function (done) {
        MEPH.create('MEPH.synchronization.SyncObject').then(function ($class) {
            //Arrange
            var jobject = new $class();
            var altered = 0;
            var created = 0;
            var result = jobject.createObj({ properties: { property: [] } });
            jobject.on('created-object', function () { created++; });
            result.property.on('array_altered', function () { altered++; });

            //Act
            result.property.unshift.apply(result.property, [].interpolate(0, 4, function (x) { return { x: x } }));

            //Assert
            expect(altered).toBeTruthy();
            expect(created === 4).toBeTruthy();

        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });




    it('dectects shift.', function (done) {
        MEPH.create('MEPH.synchronization.SyncObject').then(function ($class) {
            //Arrange
            var jobject = new $class();
            var altered = 0;
            var created = 0;
            var result = jobject.createObj({ properties: { property: [] } });
            result.property.unshift.apply(result.property, [].interpolate(0, 4, function (x) { return { x: x } }));
            jobject.on('created-object', function () { created++; });
            result.property.on('array_altered', function () { altered++; });

            //Act
            result.property.shift();

            //Assert
            expect(altered === 1).toBeTruthy();
            expect(created === 0).toBeTruthy();
            expect(result.property.length === 3).toBeTruthy();
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });
    it('dectects concat.', function (done) {
        MEPH.create('MEPH.synchronization.SyncObject').then(function ($class) {
            //Arrange
            var jobject = new $class();
            var altered = 0;
            var created = 0;
            var result = jobject.createObj({ properties: { property: [] } });
            result.property.unshift.apply(result.property, [].interpolate(0, 4, function (x) { return { x: x } }));
            jobject.on('created-object', function () { created++; });
            result.on('altered', function () { altered++; });

            //Act
            result.property.concat.apply(result.property, [].interpolate(0, 4, function (x) { return [{ x: x }]; }));

            //Assert
            expect(altered === 0).toBeTruthy();
            expect(created === 4).toBeTruthy();

        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });

    createSyncGroup = function () {
        var jem1 = new MEPH.synchronization.SyncMembrane();
        var jem2 = new MEPH.synchronization.SyncMembrane();
        var channel = {
            send2: function (message) {
                var reult = JSON.stringify(message);
                var finalmessage = JSON.parse(reult);
                jem1.receive(finalmessage);
            },
            send1: function (message) {
                var reult = JSON.stringify(message);
                var finalmessage = JSON.parse(reult);
                jem2.receive(finalmessage);
            }
        };
        //Act
        jem1.channel = channel.send1;
        jem2.channel = channel.send2;

        jem1.heartBeat();
        return {
            managers: [jem1, jem2]
        }
    };

    it('events should go both ways.', function (done) {
        MEPH.requires('MEPH.synchronization.SyncMembrane').then(function () {
            return MEPH.create('MEPH.synchronization.SyncObject').then(function ($class) {
                //Arrange
                var setup = createSyncGroup();
                var manager1 = setup.managers[0];
                var manager2 = setup.managers[1];
                var jobject = manager1.createSyncObject();
                var result = jobject.createObj();

                //Act

                result.property = 'dafsd';
                result[MEPH.jsync].sweep();
                result.property = [];
                var object = manager2.monitoredObject[0];

                //Assert
                expect(Array.isArray(object.property)).toBeTruthy();

            })
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });


    it('add arrays with values.', function (done) {
        MEPH.requires('MEPH.synchronization.SyncMembrane').then(function () {
            return MEPH.create('MEPH.synchronization.SyncObject').then(function ($class) {
                //Arrange
                var setup = createSyncGroup();
                var manager1 = setup.managers[0];
                var manager2 = setup.managers[1];
                var jobject = manager1.createSyncObject();
                var result = jobject.createObj();

                //Act

                result.property = 'dafsd';
                result[MEPH.jsync].sweep();
                result.property = ['a', 'b'];
                var object = manager2.monitoredObject[0];

                //Assert
                expect(Array.isArray(object.property)).toBeTruthy();
                expect((object.property[0] === 'a')).toBeTruthy();
                expect((object.property[1] === 'b')).toBeTruthy();

            })
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });

    it('add arrays with objects.', function (done) {
        MEPH.requires('MEPH.synchronization.SyncMembrane').then(function () {
            return MEPH.create('MEPH.synchronization.SyncObject').then(function ($class) {
                //Arrange
                var setup = createSyncGroup();
                var manager1 = setup.managers[0];
                var manager2 = setup.managers[1];
                var jobject = manager1.createSyncObject();
                var result = jobject.createObj();

                //Act
                result.property = 'dafsd';
                result[MEPH.jsync].sweep();
                result.property = ['a', { value: 'b' }];
                result.property.push({ value: 'c' });
                var object = manager2.monitoredObject[0];

                //Assert
                expect(Array.isArray(object.property)).toBeTruthy();
                expect((object.property[0] === 'a')).toBeTruthy();
                expect((object.property[1].value === 'b')).toBeTruthy();
                expect((object.property[2].value === 'c')).toBeTruthy();

            })
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });


    it('add arrays with objects.', function (done) {
        MEPH.requires('MEPH.synchronization.SyncMembrane').then(function () {
            return MEPH.create('MEPH.synchronization.SyncObject').then(function ($class) { //Arrange
                var setup = createSyncGroup();
                var manager1 = setup.managers[0];
                var manager2 = setup.managers[1];
                var jobject = manager1.createSyncObject();
                var result = jobject.createObj();

                //Act
                result.property = 'dafsd';
                result[MEPH.jsync].sweep();
                result.property = ['a', { value: 'b' }];
                result.property.push({ value: 'c' });
                result.property.pop();
                var object = manager2.monitoredObject[0];

                //Assert
                expect(Array.isArray(object.property)).toBeTruthy();
                expect((object.property[0] === 'a')).toBeTruthy();
                expect((object.property[1].value === 'b')).toBeTruthy();
                expect(object.property.length === 2).toBeTruthy();

            })
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });


    it('pop object from array.', function (done) {
        MEPH.requires('MEPH.synchronization.SyncMembrane').then(function () {
            return MEPH.create('MEPH.synchronization.SyncObject').then(function ($class) {

                var setup = createSyncGroup();
                var manager1 = setup.managers[0];
                var manager2 = setup.managers[1];
                var jobject = manager1.createSyncObject();
                var result = jobject.createObj();

                //Act
                result.property = 'dafsd';
                result[MEPH.jsync].sweep();
                result.property = ['a', { value: 'b' }];
                result.property.push({ value: 'c' });
                result.property.pop();
                var object = manager2.monitoredObject[0];

                //Assert
                expect(Array.isArray(object.property)).toBeTruthy();
                expect((object.property[0] === 'a')).toBeTruthy();
                expect((object.property[1].value === 'b')).toBeTruthy();
                expect(object.property.length === 2).toBeTruthy();

            })
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });

    createSyncGroupWithSendControl = function () {
        var jem1 = new MEPH.synchronization.SyncMembrane();
        var jem2 = new MEPH.synchronization.SyncMembrane();

        var negotiator1 = new MEPH.synchronization.SyncConflictNegotiator();
        var negotiator2 = new MEPH.synchronization.SyncConflictNegotiator();

        jem1.setNegotiator(negotiator1);
        jem2.setNegotiator(negotiator2);

        var jem1messages = [];
        var jem2messages = [];
        var channel = {
            jem1Messages: jem1messages,
            jem2Messages: jem2messages,
            send2: function (message) {
                var reult = JSON.stringify(message);
                var finalmessage = JSON.parse(reult);
                jem1messages.push(finalmessage);
            },
            send1: function (message) {
                var reult = JSON.stringify(message);
                var finalmessage = JSON.parse(reult);
                jem2messages.push(finalmessage);
            },
            pump1: function (random) {
                if (random) {
                    jem1messages = jem1messages.random();
                }
                var message = jem1messages.shift();
                if (message)
                    jem2.receive(message);
                return jem1messages.length;
            },
            pump2: function (random) {
                if (random) {
                    jem2messages = jem2messages.random();
                }
                var message = jem2messages.shift();
                if (message)
                    jem1.receive(message);
                return jem2messages.length;
            }
        }
        jem1.channel = channel.send2;
        jem2.channel = channel.send1;

        return {
            managers: [jem1, jem2],
            negotiators: [negotiator1, negotiator2],
            channel: channel
        }
    };
    it('should handle creating arrays in objects.', function (done) {
        MEPH.requires('MEPH.synchronization.SyncMembrane', 'MEPH.synchronization.SyncConflictNegotiator').then(function () {
            return MEPH.create('MEPH.synchronization.SyncObject').then(function ($class) {
                //Arrange
                var setup = createSyncGroupWithSendControl();
                var manager1 = setup.managers[0];
                var manager2 = setup.managers[1];

                var negotiator1 = setup.negotiators[0];
                var negotiator2 = setup.negotiators[1];
                var jobject = manager1.createSyncObject();
                var result = jobject.createObj({ properties: { property: [] } });


                setup.channel.pump1();
                //setup.channel.pump2();
                //Act
                manager1.heartBeat();
                manager2.heartBeat();
                setup.channel.pump1();
                setup.channel.pump2();
                setup.channel.pump1();
                setup.channel.pump2();
                setup.channel.pump1();
                setup.channel.pump2();
                var object = manager2.monitoredObject[2];

                //Assert
                expect(negotiator1.state === MEPH.synchronization.SyncConflictNegotiator.states.idle).toBeTruthy();
                expect(negotiator2.state === MEPH.synchronization.SyncConflictNegotiator.states.idle).toBeTruthy();

            })
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });
    it('should handle creating arrays in objects.', function (done) {
        MEPH.requires('MEPH.synchronization.SyncMembrane', 'MEPH.synchronization.SyncConflictNegotiator').then(function () {
            return MEPH.create('MEPH.synchronization.SyncObject').then(function ($class) {
                //Arrange
                var setup = createSyncGroupWithSendControl();
                var manager1 = setup.managers[0];
                var manager2 = setup.managers[1];

                var negotiator1 = setup.negotiators[0];
                var negotiator2 = setup.negotiators[1];
                var jobject = manager1.createSyncObject();
                var result = jobject.createObj({ properties: { property: [] } });


                setup.channel.pump1();
                //setup.channel.pump2();
                //Act
                manager1.heartBeat();
                manager2.heartBeat();
                setup.channel.pump1();
                setup.channel.pump2();
                setup.channel.pump1();
                setup.channel.pump2();
                setup.channel.pump1();
                setup.channel.pump2();
                var object = manager2.monitoredObject[1];
                object.property.push("aahs");
                result.property.push("jajsd");
                object.property.push('vava');
                object.property.push('vava3');
                result.property.push('vava432');
                while (setup.channel.jem1Messages.length || setup.channel.jem2Messages.length) {

                    setup.channel.pump1();
                    setup.channel.pump2();
                }
                
                //Assert
                expect(negotiator1.state === MEPH.synchronization.SyncConflictNegotiator.states.idle).toBeTruthy();
                expect(negotiator2.state === MEPH.synchronization.SyncConflictNegotiator.states.idle).toBeTruthy();
                expect(result.property.length === 5).toBeTruthy();
                expect(object.property.length === 5).toBeTruthy();
                expect(result.property.relativeCompliment(object.property).length === 0).toBeTruthy();

            })
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });

    it('value types create index references in a sub array.', function (done) {
        MEPH.requires('MEPH.synchronization.SyncMembrane', 'MEPH.synchronization.SyncConflictNegotiator').then(function () {
            return MEPH.create('MEPH.synchronization.SyncObject').then(function ($class) {
                //Arrange
                var setup = createSyncGroupWithSendControl();
                var manager1 = setup.managers[0];
                var manager2 = setup.managers[1];

                var negotiator1 = setup.negotiators[0];
                var negotiator2 = setup.negotiators[1];
                var jobject = manager1.createSyncObject();
                var result = jobject.createObj({ properties: { property: [] } });

                //Act
                result.property.push('value');

                //Assert
                var valueObjs = result.property[MEPH.jsync].valueObjs();
                expect(valueObjs);
                expect(valueObjs.first().index === 0);
                expect(valueObjs.first().instanceId);

            })
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });

    it('value types will remove themselves when removed.', function (done) {
        MEPH.requires('MEPH.synchronization.SyncMembrane', 'MEPH.synchronization.SyncConflictNegotiator').then(function () {
            return MEPH.create('MEPH.synchronization.SyncObject').then(function ($class) {
                //Arrange
                var setup = createSyncGroupWithSendControl();
                var manager1 = setup.managers[0];
                var manager2 = setup.managers[1];

                var negotiator1 = setup.negotiators[0];
                var negotiator2 = setup.negotiators[1];
                var jobject = manager1.createSyncObject();
                var result = jobject.createObj({ properties: { property: [] } });
                result.property.push('value');

                //Act
                result.property.pop();

                //Assert
                var valueObjs = result.property[MEPH.jsync].valueObjs();
                expect(valueObjs).toBeTruthy();
                expect(valueObjs.length === 0).toBeTruthy();

            })
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });


    it('push a bunch of different types and pop them off.', function (done) {
        MEPH.requires('MEPH.synchronization.SyncMembrane', 'MEPH.synchronization.SyncConflictNegotiator').then(function () {
            return MEPH.create('MEPH.synchronization.SyncObject').then(function ($class) {
                //Arrange
                var setup = createSyncGroupWithSendControl();
                var manager1 = setup.managers[0];
                var manager2 = setup.managers[1];

                var negotiator1 = setup.negotiators[0];
                var negotiator2 = setup.negotiators[1];
                var jobject = manager1.createSyncObject();
                var result = jobject.createObj({ properties: { property: [] } });
                result.property.push('value');
                result.property.push({ a: 'value' });
                result.property.push('value3');
                result.property.push('value4');
                result.property.push('value2');

                //Act
                result.property.pop();
                result.property.pop();
                result.property.pop();
                result.property.pop();
                result.property.pop();

                //Assert
                var valueObjs = result.property[MEPH.jsync].valueObjs();
                expect(valueObjs).toBeTruthy();
                expect(valueObjs.length === 0).toBeTruthy();

            })
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });

    it('events on arrays involving value type need to be handled special' +
                ': values with require their instanceId and value to be sent as an object', function (done) {
                    MEPH.requires('MEPH.synchronization.SyncMembrane', 'MEPH.synchronization.SyncConflictNegotiator').then(function () {
                        return MEPH.create('MEPH.synchronization.SyncObject').then(function ($class) {
                            //Arrange
                            var setup = createSyncGroupWithSendControl();
                            var manager1 = setup.managers[0];
                            var manager2 = setup.managers[1];

                            var negotiator1 = setup.negotiators[0];
                            var negotiator2 = setup.negotiators[1];
                            var jobject = manager1.createSyncObject();
                            var result = jobject.createObj({ properties: { property: [] } });
                            result.property.push('value');
                            result.property.push({ a: 'value' });
                            result.property.push('value3');
                            result.property.push('value4');
                            result.property.push('value2');
                            result.property.pop();
                            result.property.pop();
                            result.property.pop();
                            result.property.pop();
                            result.property.pop();

                            //Act
                            while (setup.channel.jem1Messages.length || setup.channel.jem2Messages.length) {

                                setup.channel.pump1();
                                setup.channel.pump2();
                            }
                            var object = manager2.monitoredObject[1];


                            //Assert
                            var valueObjs = result.property[MEPH.jsync].valueObjs();
                            expect(valueObjs).toBeTruthy();
                            expect(valueObjs.length === 0).toBeTruthy();
                            expect(object[MEPH.jsync].valueObjs().length === 0).toBeTruthy();

                        })
                    }).catch(function (error) {
                        expect(error).caught();
                    }).then(function () {
                        done();
                    });
                });

    it('can unshift values to the array, and update the value reference array', function (done) {
        MEPH.requires('MEPH.synchronization.SyncMembrane', 'MEPH.synchronization.SyncConflictNegotiator').then(function () {
            return MEPH.create('MEPH.synchronization.SyncObject').then(function ($class) {
                //Arrange
                var setup = createSyncGroupWithSendControl();
                var manager1 = setup.managers[0];
                var manager2 = setup.managers[1];

                var negotiator1 = setup.negotiators[0];
                var negotiator2 = setup.negotiators[1];
                var jobject = manager1.createSyncObject();
                var result = jobject.createObj({ properties: { property: [] } });

                //Act
                result.property.unshift('value', 'value2');

                //Assert
                var valueObjs = result.property[MEPH.jsync].valueObjs();
                expect(valueObjs).toBeTruthy();
                expect(valueObjs.length === 2).toBeTruthy();

            })
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });


    it('can shift value from an array, and update the value reference array', function (done) {
        MEPH.requires('MEPH.synchronization.SyncMembrane', 'MEPH.synchronization.SyncConflictNegotiator').then(function () {
            return MEPH.create('MEPH.synchronization.SyncObject').then(function ($class) {
                //Arrange
                var setup = createSyncGroupWithSendControl();
                var manager1 = setup.managers[0];
                var manager2 = setup.managers[1];

                var negotiator1 = setup.negotiators[0];
                var negotiator2 = setup.negotiators[1];
                var jobject = manager1.createSyncObject();
                var result = jobject.createObj({ properties: { property: [] } });
                result.property.unshift('vlue', 'value');

                //Act
                result.property.shift()

                //Assert
                var valueObjs = result.property[MEPH.jsync].valueObjs();
                expect(valueObjs).toBeTruthy();
                expect(valueObjs.length === 1).toBeTruthy();

            })
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });


    it('can shift value from an array, and update the value reference array', function (done) {
        MEPH.requires('MEPH.synchronization.SyncMembrane', 'MEPH.synchronization.SyncConflictNegotiator').then(function () {
            return MEPH.create('MEPH.synchronization.SyncObject').then(function ($class) {
                //Arrange
                var setup = createSyncGroupWithSendControl();
                var manager1 = setup.managers[0];
                var manager2 = setup.managers[1];

                var jobject = manager1.createSyncObject();
                var result = jobject.createObj({ properties: { property: [] } });
                result.property.unshift('vlue', 'value');
                result.property.shift();

                //Act
                while (setup.channel.jem1Messages.length || setup.channel.jem2Messages.length) {

                    setup.channel.pump1();
                    setup.channel.pump2();
                }
                var object = manager2.getMonitoredObject(result.instanceObj());
                //Assert
                var valueObjs = result.property[MEPH.jsync].valueObjs();
                expect(valueObjs).toBeTruthy();
                expect(valueObjs.length === 1).toBeTruthy();
                expect(object.property[0] === 'value').toBeTruthy();

            })
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });

    it('can splice values in an array, and update the value reference array', function (done) {
        MEPH.requires('MEPH.synchronization.SyncMembrane', 'MEPH.synchronization.SyncConflictNegotiator').then(function () {
            return MEPH.create('MEPH.synchronization.SyncObject').then(function ($class) {
                var setup = createSyncGroupWithSendControl();
                var manager1 = setup.managers[0];
                var manager2 = setup.managers[1];

                var jobject = manager1.createSyncObject();
                var result = jobject.createObj({ properties: { property: [] } });
                result.property.push('sdf', 'fa', 'fsd');
                //Act
                result.property.splice(0, 1, 'value', 'value');
                while (setup.channel.jem1Messages.length || setup.channel.jem2Messages.length) {

                    setup.channel.pump1();
                    setup.channel.pump2();
                }
                var object = manager2.getMonitoredObject(result.instanceObj());
                //Assert
                var valueObjs = result.property[MEPH.jsync].valueObjs();
                expect(valueObjs).toBeTruthy();
                expect(valueObjs.length === 4).toBeTruthy();
                expect(object.property.length === 4).toBeTruthy();
                expect(result.property.length === 4).toBeTruthy();
                expect(result.property.relativeCompliment(object.property, function (x) { return x; }).length === 0).toBeTruthy();

            })
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });


    it('reference can splice values in an array, and update the value reference array', function (done) {
        MEPH.requires('MEPH.synchronization.SyncMembrane', 'MEPH.synchronization.SyncConflictNegotiator').then(function () {
            return MEPH.create('MEPH.synchronization.SyncObject').then(function ($class) {
                var setup = createSyncGroupWithSendControl();
                var manager1 = setup.managers[0];
                var manager2 = setup.managers[1];

                var jobject = manager1.createSyncObject();
                var result = jobject.createObj({ properties: { property: [] } });
                result.property.push({ x: 'sdf' }, { x: 'sdf' }, { x: 'sdf' });
                //Act
                result.property.splice(0, 1, { x: 'sdf' }, { x: 'sdf' });
                while (setup.channel.jem1Messages.length || setup.channel.jem2Messages.length) {

                    setup.channel.pump1();
                    setup.channel.pump2();
                }
                var object = manager2.getMonitoredObject(result.instanceObj());
                //Assert
                var valueObjs = result.property[MEPH.jsync].valueObjs();

                expect(object.property.length === 4).toBeTruthy();
                expect(result.property.length === 4).toBeTruthy();
                expect(result.property.select(function (x) {
                    return x.instanceObj();
                }).relativeCompliment(object.property.select(function (x) {
                    return x.instanceObj();
                }))).toBeTruthy();

            })
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });
});