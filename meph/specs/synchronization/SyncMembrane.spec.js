describe("MEPH/synchronization/SyncMembrane.spec.js", function () {
    var createSyncGroup,
        createSyncGroupWithSendControl;
    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });

    it('can create a syncmembrane.', function (done) {
        MEPH.create('MEPH.synchronization.SyncMembrane').then(function ($class) {
            var syncmembrane = new $class();
            expect(syncmembrane).theTruth('no syncmembrane was created');
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });

    it('can listen to events from jobjects.', function (done) {
        MEPH.create('MEPH.synchronization.SyncMembrane').then(function ($class) {
            var syncmembrane = new $class();
            //Arrange 
            var jobject = new MEPH.synchronization.SyncObject();
            var result = jobject.createObj();
            result.property = 'prop1';
            result[MEPH.jsync].sweep();

            //Act
            syncmembrane.monitor(result);

            //Assert
            expect(syncmembrane.monitoredObject.length === 1);
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });
    it('event manager has an Id.', function (done) {
        MEPH.create('MEPH.synchronization.SyncMembrane').then(function ($class) {
            //Arrange 
            var syncmembrane = new $class();

            //Act

            //Assert
            expect(syncmembrane.Id).theTruth('syncmembrane has no id');
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });
    it('add listeners to monitored objects.', function (done) {
        MEPH.create('MEPH.synchronization.SyncMembrane').then(function ($class) {
            //Arrange
            var jem = new $class();
            var jobject = new MEPH.synchronization.SyncObject();
            var result = jobject.createObj();
            result.property = 'prop1';
            result[MEPH.jsync].sweep();

            //Act
            jem.monitor(result);
            result.property = 'changed';

            //Assert

            expect(jem.getEvents()).theTruth('no events');
            expect(jem.getEvents().length === 1).theTruth('wrong number of events');
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });
    it('add event dependency.', function (done) {
        MEPH.create('MEPH.synchronization.SyncMembrane').then(function ($class) {
            //Arrange
            var jem = new $class();
            var jobject = new MEPH.synchronization.SyncObject();
            var result = jobject.createObj();
            result.property = 'prop';
            result[MEPH.jsync].sweep();
            jem.monitor(result);
            result.property = "prop1"
            result.property = "prop2"

            //Act
            var events = jem.getEvents();
            var event0 = events[0];
            var event1 = events[1];
            //Assert
            expect(event0.id === event1.parentEventId).theTruth(' the id didnt make the parent id');
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });
    it('jsynceventmanagers send messages through a communications channel.', function (done) {
        MEPH.create('MEPH.synchronization.SyncMembrane').then(function ($class) {
            //Arrange
            var jem = new $class();

            //Act
            var receivemessage;
            jem.channel = function (message) { receivemessage = message; }
            jem.heartBeat();

            //Assert
            expect(receivemessage).theTruth('no heartbeat received');
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });
    it('jsynceventmanagers will communicate their presence to each other.', function (done) {
        MEPH.create('MEPH.synchronization.SyncMembrane').then(function ($class) {
            var jem1 = new $class();
            var jem2 = new $class();

            //Arrange
            var channel = {
                send2: function (message) {
                    jem1.receive(message);
                },
                send1: function (message) {
                    jem2.receive(message);
                }
            };
            //Act
            jem1.channel = channel.send1;
            jem2.channel = channel.send2;

            jem1.heartBeat();

            //Assert
            expect(jem1.eventManagers).toBeTruthy();
            expect(jem1.eventManagers.length === 1).theTruth('incorrect number of eventmanagers');
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });
    it('when a syncmanager is added to the list, it will be contacted with a heartbeat', function (done) {
        MEPH.create('MEPH.synchronization.SyncMembrane').then(function ($class) {
            var jem1 = new $class();
            var jem2 = new $class();
            //Arrange
            var channel = {
                send2: function (message) {
                    jem1.receive(message);
                },
                send1: function (message) {
                    jem2.receive(message);
                }
            };
            //Act
            jem1.channel = channel.send1;
            jem2.channel = channel.send2;

            jem1.heartBeat();

            //Assert
            expect(jem1.eventManagers);
            expect(jem1.eventManagers.length === 1);
            expect(jem2.eventManagers);
            expect(jem2.eventManagers.length === 1);
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });
    it('on manager death, it is removed from eventManagers.', function (done) {
        MEPH.create('MEPH.synchronization.SyncMembrane').then(function ($class) {
            var jem1 = new $class();
            //Arrange
            var id = MEPH.GUID();
            jem1.manageHeartBeats({ EventManagerId: id });

            //Act
            jem1.fire('manager-death', { id: id });

            //Assert
            expect(jem1.eventManagers).toBeTruthy();
            expect(jem1.eventManagers.length === 0).theTruth('there shouldnt be any eventmanagers in the list ');
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });
    it('managers can create sync objects and automatically monitor all create objects.', function (done) {
        MEPH.create('MEPH.synchronization.SyncMembrane').then(function ($class) {
            var manager = new $class();
            //Arrange
            var syncobject = manager.createSyncObject();
            var object = syncobject.createObj();
            //Act

            //Assert
            expect(manager.monitoredEvents.length === 1).theTruth('the number of events is incorrect');
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });
    it('managers can create sync objects and automatically monitor all create objects and see changes.', function (done) {
        MEPH.create('MEPH.synchronization.SyncMembrane').then(function ($class) {
            //Arrange
            var manager = new $class();
            var syncobject = manager.createSyncObject();
            //Act
            var object = syncobject.createObj();
            object.property = 'asdf';
            object[MEPH.jsync].sweep();
            object.property = "property";
            //Assert
            expect(manager.monitoredEvents.length === 2).theTruth('the number of events was incorrect');
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
    it('when managers get events they are sent to all known managers.', function (done) {
        MEPH.create('MEPH.synchronization.SyncMembrane').then(function ($class) {
            //Arrange
            var setup = createSyncGroup();
            var manager1 = setup.managers[0];
            var manager2 = setup.managers[1];
            var jobject = manager1.createSyncObject();
            var result = jobject.createObj();

            //Act

            result.property = 'asdfasd';
            result[MEPH.jsync].sweep();
            result.property = 'asdfa';

            //Assert
            expect(manager2.monitoredEvents.length == 2).theTruth('The monitored events are the incorrect length');

        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });
    it('a lot of events will be sent .', function (done) {
        MEPH.create('MEPH.synchronization.SyncMembrane').then(function ($class) {
            //Arrange
            var setup = createSyncGroup();
            var manager1 = setup.managers[0];
            var manager2 = setup.managers[1];
            var jobject = manager1.createSyncObject();
            var result = jobject.createObj();

            //Act
            result.property = 'asdfasd';
            result[MEPH.jsync].sweep();
            var count = 10;
            [].interpolate(0, count, function (i) {
                result.property = 'asd' + i;
            });
            
            //Assert
            expect(manager2.monitoredEvents.length == (count + 1)).theTruth('didnt get the expected number of events');
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });
    it('events are applied after they are received.', function (done) {
        MEPH.create('MEPH.synchronization.SyncMembrane').then(function ($class) {
            //Arrange
            var setup = createSyncGroup();
            var manager1 = setup.managers[0];
            var manager2 = setup.managers[1];
            var jobject = manager1.createSyncObject();
            var result = jobject.createObj();

            //Act
            result.property = 'asdfasd';
            result[MEPH.jsync].sweep();
            var count = 1;
            result.property = 'asd' + 0;
            var object_id = manager2.monitoredEvents[0].objId;
            var object = manager2.getMonitoredObject(object_id);
            //Assert
            expect(object.property === result.property).theTruth('the property was not equal');
            expect(manager2.monitoredEvents.length == (count + 1)).theTruth(' the number of events was wrong');
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });
    it('when new instances are added they are sent to the second manager.', function (done) {
        MEPH.create('MEPH.synchronization.SyncMembrane').then(function ($class) {
            //Arrange
            var setup = createSyncGroup();
            var manager1 = setup.managers[0];
            var manager2 = setup.managers[1];
            var jobject = manager1.createSyncObject();
            var result = jobject.createObj();

            //Act
            result.property = 'asdfasd';
            result[MEPH.jsync].sweep();
            var count = 1;
            result.property = { obj: 'asd' + 0 };
            var object_id = manager2.monitoredEvents[0].objId;
            var object = manager2.getMonitoredObject(object_id);

            //Assert
            expect(manager2.monitoredEvents.length == ((4 * count))).toBeTruthy();
            expect(manager2.monitoredObject.length == (count + 1)).toBeTruthy();
            expect(manager2.monitoredObject[0].property.obj === manager2.monitoredObject[count].obj).toBeTruthy();
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });
    it('events should go both ways.', function (done) {
        MEPH.create('MEPH.synchronization.SyncMembrane').then(function ($class) {
            //Arrange
            var setup = createSyncGroup();
            var manager1 = setup.managers[0];
            var manager2 = setup.managers[1];
            var jobject = manager1.createSyncObject();
            var result = jobject.createObj();

            //Act
            result.property = 'dafsd';
            result[MEPH.jsync].sweep();
            result.property = { did: 'asdfasd' };
            var count = 20;
            var object_id = manager2.monitoredEvents[0].objId;
            var object = manager2.getMonitoredObject(object_id);

            result.property.did = 'asd';
            object.property.did = 'reassigned';

            //Assert
            expect(object.property.did === result.property.did).toBeTruthy();
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });
    it('events should o both ways and be able to set new objects freely.', function (done) {
        MEPH.create('MEPH.synchronization.SyncMembrane').then(function ($class) {
            //Arrange
            var setup = createSyncGroup();
            var manager1 = setup.managers[0];
            var manager2 = setup.managers[1];
            var jobject = manager1.createSyncObject();
            var result = jobject.createObj();

            //Act
            result.property = 'dafsd';
            result[MEPH.jsync].sweep();
            result.property = { did: 'asdfasd' };
            var count = 20;
            var object_id = manager2.monitoredEvents[0].objId;
            var object = manager2.getMonitoredObject(object_id);

            result.property.did = 'asd';
            expect(result.property.did === object.property.did).toBeTruthy();
            object.property.did = 'reassigned';
            expect(result.property.did === object.property.did).toBeTruthy();
            object.property.did = 'reassig3ned';
            expect(result.property.did === object.property.did).toBeTruthy();
            object.property.did = { OASD: 'reassig3ned' };
            expect(result.property.did.OASD === object.property.did.OASD).toBeTruthy();
            object.property.did.asdf = 'reassig3ned';
            object.property.did[MEPH.jsync].sweep();
            object.property.did.asdf = 'resassig3ned';
            expect(result.property.did.asdf === object.property.did.asdf).toBeTruthy();
            //Assert
            expect(object.property.did.jsyncId() === result.property.did.jsyncId()).toBeTruthy();
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });
    it('should have equal values on creation.', function (done) {
        MEPH.create('MEPH.synchronization.SyncMembrane').then(function ($class) {
            //Arrange
            var setup = createSyncGroup();
            var manager1 = setup.managers[0];
            var manager2 = setup.managers[1];
            //result.property = "prop1";
            //Act
            var jobject = manager1.createSyncObject();
            var result = jobject.createObj({ properties: { property: 'property' } });
            var object_id = manager2.monitoredEvents[0].objId;
            var object = manager2.getMonitoredObject(object_id);
            //Assert
            expect(object.property == result.property).toBeTruthy();
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });

    createSyncGroupWithSendControl = function () {
        var jem1 = new MEPH.synchronization.SyncMembrane();
        var jem2 = new MEPH.synchronization.SyncMembrane();
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
            pump1: function () {
                var message = jem1messages.shift();
                if (message)
                    jem2.receive(message);
            },
            pump2: function () {
                var message = jem2messages.shift();
                if (message)
                    jem1.receive(message);
            }
        }
        jem1.channel = channel.send2;
        jem2.channel = channel.send1;

        return {
            managers: [jem1, jem2],
            channel: channel
        }
    };
    it('should detect conflicts.', function (done) {
        MEPH.create('MEPH.synchronization.SyncMembrane').then(function ($class) {
            //Arrange
            var setup = createSyncGroupWithSendControl();
            var manager1 = setup.managers[0];
            var manager2 = setup.managers[1];
            var jobject = manager1.createSyncObject();
            var result = jobject.createObj({ properties: { property: 'property' } });
            var manager1_conflicts = 0;
            manager1.on('conflict-detected', function () {
                manager1_conflicts++;
            });
            var manager2_conflicts = 0;
            manager2.on('conflict-detected', function () {
                manager2_conflicts++;
            });


            setup.channel.pump1();
            //setup.channel.pump2();
            var object_id = manager2.monitoredEvents[0].objId;
            var object = manager2.getMonitoredObject(object_id);
            //Act
            object.property = "aahs";
            result.property = "afasd";
            object.property = "asdf2";
            setup.channel.pump1();
            setup.channel.pump2();
            object.property = "asdf";
            result.property = "afasd4";
            setup.channel.pump1();
            setup.channel.pump2();

            //Assert
            expect(manager1_conflicts).toBeTruthy();
            expect(manager2_conflicts).toBeTruthy();
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });
    it('simple setup for conflict detection.', function (done) {
        MEPH.create('MEPH.synchronization.SyncMembrane').then(function ($class) {
            //Arrange
            var evnt = {
                "evnt": {
                    "value": {
                        "$_$_$-$$$$$$$$$$id": "1170066d-55ba-4897-9a47-e304b9ef7aff",
                        "property": "afasd4"
                    },
                    "type": "created-object"
                },
                "local": false,
                "executed": true,
                "objId": "1170066d-55ba-4897-9a47-e304b9ef7aff",
                "id": "42589c76-fe87-4d5b-a6b3-ce5a466d4fc8",
                "parentEventId": null
            }
            var evnt2 = MEPH.clone(evnt);
            evnt2.id = MEPH.GUID();
            var manager1_conflicts = 0;
            var jem2 = new MEPH.synchronization.SyncMembrane();


            //Act
            jem2.monitoredEvents.push(evnt);
            jem2.monitoredEvents.push(evnt2);
            manager1_conflicts = jem2.causesConflict();

            //Assert
            expect(manager1_conflicts.length === 1).toBeTruthy();
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });

    it('setting a conflict negotiator.', function (done) {
        MEPH.create('MEPH.synchronization.SyncMembrane').then(function ($class) {
            //Arrange
            var jem = new MEPH.synchronization.SyncMembrane();
            var nego = new MEPH.synchronization.SyncConflictNegotiator();

            //Act
            jem.setNegotiator(nego);

            //Assert
            expect(nego.getManager() === jem).theTruth('they are not equal.');
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });

});