describe("MEPH/synchronization/SyncConflictNegotiator.spec.js", function () {
    var createSyncGroup, createConflictReport,
        createConflictingEvents, createSyncGroupWithSendControl;
    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });

    it('can create a syncmembrane.', function (done) {
        MEPH.create('MEPH.synchronization.SyncConflictNegotiator').then(function ($class) {
            var negotiator = new $class();
            //Arrange

            //Assert
            expect(negotiator);
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });

    it('sets event manager and listens to roll call.', function (done) {
        MEPH.requires('MEPH.synchronization.SyncMembrane').then(function () {
            return MEPH.create('MEPH.synchronization.SyncConflictNegotiator').then(function ($class) {
                var negotiator = new $class();
                //Arrange 
                var jem1 = new MEPH.synchronization.SyncMembrane();

                //Act
                negotiator.setManager(jem1);

                //Assert
                expect(negotiator.getManager() === jem1);
                expect(negotiator.getManager().eventManagers.hasOn('change'));
            }).catch(function (error) {
                expect(error).caught();
            }).then(function () {
                done();
            });
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
    },

    it('negotiators are notified when event managers come on the seen..', function (done) {
        MEPH.requires('MEPH.synchronization.SyncMembrane').then(function () {
            return MEPH.create('MEPH.synchronization.SyncConflictNegotiator').then(function ($class) {
                //Arrange
                var setup = createSyncGroupWithSendControl();
                var manager1 = setup.managers[0];
                var manager2 = setup.managers[1];
                var negotiator1 = setup.negotiators[0];
                var negotiator2 = setup.negotiators[1];

                //Act
                manager1.heartBeat();
                manager2.heartBeat();

                setup.channel.pump1();
                setup.channel.pump2();

                //Assert
                expect(negotiator1.currentRollCall.length === 1).toBeTruthy();
                expect(negotiator2.currentRollCall.length === 1).toBeTruthy();
            }).catch(function (error) {
                expect(error).caught();
            }).then(function () {
                done();
            });
        });
    });
    it('negotiators are in an idle state when no conflicts are present.', function (done) {
        MEPH.requires('MEPH.synchronization.SyncMembrane').then(function () {
            return MEPH.create('MEPH.synchronization.SyncConflictNegotiator').then(function ($class) {
                var negotiator = new $class();

                //Arrange
                var setup = createSyncGroupWithSendControl();

                //Act
                var nogotiator = setup.negotiators[0];

                //Assert
                expect(nogotiator.state == 'idle').theTruth('the state is not idle');
            }).catch(function (error) {
                expect(error).caught();
            }).then(function () {
                done();
            });
        });
    });

    createConflictingEvents = function (count) {
        var result = [];
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

        return result.interpolate(0, count + 1, function (x) {
            var temp = MEPH.clone(evnt);
            temp.id = MEPH.GUID();
            return temp;
        });
    };

    it('negotiators change state on receiving a conflict report.', function (done) {
        MEPH.requires('MEPH.synchronization.SyncMembrane').then(function () {
            return MEPH.create('MEPH.synchronization.SyncConflictNegotiator').then(function ($class) {
                //Arrange
                var setup = createSyncGroupWithSendControl();
                var evnts = createConflictingEvents(2);
                var manager1 = setup.managers[0];
                var manager2 = setup.managers[1];
                var negotiator1 = setup.negotiators[0];
                var negotiator2 = setup.negotiators[1];
                negotiator1.on('setstate', function (x) {
                    switch (negotiator1.state) {
                        case MEPH.synchronization.SyncConflictNegotiator.states.conflictAquired:
                            wasconflicaquired = true;
                    }
                });
                manager1.heartBeat();
                manager2.heartBeat();
                setup.channel.pump1();
                setup.channel.pump2();
                var wasconflicaquired;
                //Act
                evnts.foreach(function (x) {
                    manager1.monitoredEvents.push(x);
                });

                //Assert
                expect(wasconflicaquired).theTruth('no conflict aquired');;
            }).catch(function (error) {
                expect(error).caught();
            }).then(function () {
                done();
            });
        });
    });
    it('negotiators should create a conflict report when the state becomes conflictAquired.', function (done) {
        MEPH.requires('MEPH.synchronization.SyncMembrane').then(function () {
            return MEPH.create('MEPH.synchronization.SyncConflictNegotiator').then(function ($class) {
                var negotiator = new $class();
                //Arrange
                var setup = createSyncGroupWithSendControl();
                var evnts = createConflictingEvents(2);
                var manager1 = setup.managers[0];
                var manager2 = setup.managers[1];
                var negotiator1 = setup.negotiators[0];
                var negotiator2 = setup.negotiators[1];
                manager1.heartBeat();
                manager2.heartBeat();
                setup.channel.pump1();
                setup.channel.pump2();

                //Act
                evnts.foreach(function (x) {
                    manager1.monitoredEvents.push(x);
                });


                //Assert
                expect(negotiator1.currentReport).theTruth('negotiators report is not truthy.');

            }).catch(function (error) {
                expect(error).caught();
            }).then(function () {
                done();
            });
        });
    });
    it('conflict reports should contain a list of managers that are to start negotiations.', function (done) {
        MEPH.requires('MEPH.synchronization.SyncMembrane').then(function () {
            return MEPH.create('MEPH.synchronization.SyncConflictNegotiator').then(function ($class) {
                //Arrange
                var setup = createSyncGroupWithSendControl();
                var evnts = createConflictingEvents(2);
                var manager1 = setup.managers[0];
                var manager2 = setup.managers[1];
                var negotiator1 = setup.negotiators[0];
                var negotiator2 = setup.negotiators[1];
                manager1.heartBeat();
                manager2.heartBeat();
                setup.channel.pump1();
                setup.channel.pump2();

                //Act
                evnts.foreach(function (x) {
                    manager1.monitoredEvents.push(x);
                });


                //Assert
                expect(negotiator1.currentReport.managers.length === 2).toBeTruthy();
            }).catch(function (error) {
                expect(error).caught();
            }).then(function () {
                done();
            });
        });
    });
    it('conflict reports should contain a list of managers that are to start negotiation.', function (done) {
        MEPH.requires('MEPH.synchronization.SyncMembrane').then(function () {
            return MEPH.create('MEPH.synchronization.SyncConflictNegotiator').then(function ($class) {
                //Arrange
                var setup = createSyncGroupWithSendControl();
                var evnts = createConflictingEvents(2);
                var manager1 = setup.managers[0];
                var manager2 = setup.managers[1];
                var negotiator1 = setup.negotiators[0];
                var negotiator2 = setup.negotiators[1];
                manager1.heartBeat();
                manager2.heartBeat();
                setup.channel.pump1();
                setup.channel.pump2();

                //Act
                evnts.foreach(function (x) {
                    manager1.monitoredEvents.push(x);
                });


                //Assert
                expect(negotiator1.currentReport.managers.length === 2).toBeTruthy();
            }).catch(function (error) {
                expect(error).caught();
            }).then(function () {
                done();
            });
        });
    });
    it('conflict reports should contain a suggested conflict target.', function (done) {
        MEPH.requires('MEPH.synchronization.SyncMembrane').then(function () {
            return MEPH.create('MEPH.synchronization.SyncConflictNegotiator').then(function ($class) {
                //Arrange
                var setup = createSyncGroupWithSendControl();
                var evnts = createConflictingEvents(2);
                var manager1 = setup.managers[0];
                var manager2 = setup.managers[1];
                var negotiator1 = setup.negotiators[0];
                var negotiator2 = setup.negotiators[1];
                manager1.heartBeat();
                manager2.heartBeat();
                setup.channel.pump1();
                setup.channel.pump2();

                //Act
                evnts.foreach(function (x) {
                    manager1.monitoredEvents.push(x);
                });


                //Assert
                expect(negotiator1.currentReport.conflictTarget).toBeTruthy();
            }).catch(function (error) {
                expect(error).caught();
            }).then(function () {
                done();
            });
        });
    });
    it('when a conflict report is made it should go to the wait for reply from conflict assesment and agreement state.', function (done) {
        MEPH.requires('MEPH.synchronization.SyncMembrane').then(function () {
            return MEPH.create('MEPH.synchronization.SyncConflictNegotiator').then(function ($class) {
                //Arrange
                var setup = createSyncGroupWithSendControl();
                var evnts = createConflictingEvents(2);
                var manager1 = setup.managers[0];
                var manager2 = setup.managers[1];
                var negotiator1 = setup.negotiators[0];
                var negotiator2 = setup.negotiators[1];
                manager1.heartBeat();
                manager2.heartBeat();
                setup.channel.pump1();
                setup.channel.pump2();
                var conflictAssesmentAndAgreementState;
                negotiator1.on('setstate', function (x) {
                    switch (negotiator1.state) {
                        case MEPH.synchronization.SyncConflictNegotiator.states.conflictAssesmentAndAgreementState:
                            conflictAssesmentAndAgreementState = true;
                    }
                });
                //Act
                evnts.foreach(function (x) {
                    manager1.monitoredEvents.push(x);
                });


                //Assert
                expect(conflictAssesmentAndAgreementState).toBeTruthy();
            }).catch(function (error) {
                expect(error).caught();
            }).then(function () {
                done();
            });
        });
    });
    createConflictReport = function () {
        var conflictreportmessage = {
            "id": "aec60d63-7f05-477c-87bb-2b3c70ce6049",
            "EventManagerId": "b3e1358c-d536-4c68-87aa-8ebaa4d42f21",
            "type": "conflict",
            "message": {
                type: 'report',
                "conflicts": [{
                    "evntId": "conflictingParent",
                    "events": [{
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
                        "id": "18e84a12-f4c4-494a-880c-c11dfe90fffa",
                        "parentEventId": "conflictingParent"
                    }, {
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
                        "id": "a802fddf-d856-4301-82b0-9a43ab874e58",
                        "parentEventId": "conflictingParent"
                    }]
                }],
                "managers": ["16f9b603-15a3-4368-9c97-4f1818e8bfcc", "b3e1358c-d536-4c68-87aa-8ebaa4d42f21"],
                "conflictTarget": "conflictingParent"
            }
        };
        return conflictreportmessage;
    };
    it('when receiving a conflict report, without knowledge of the all the events in question will return acceptance of ' +
                'all actions to be taken, basically releasing all responsibility for the children of the parent event chain.', function (done) {
                    MEPH.requires('MEPH.synchronization.SyncMembrane').then(function () {
                        return MEPH.create('MEPH.synchronization.SyncConflictNegotiator').then(function ($class) {
                            //Arrange
                            var setup = createSyncGroupWithSendControl();
                            var manager1 = setup.managers[0];
                            var manager2 = setup.managers[1];
                            var negotiator1 = setup.negotiators[0];
                            var negotiator2 = setup.negotiators[1];
                            manager1.heartBeat();
                            manager2.heartBeat();
                            setup.channel.pump1();
                            setup.channel.pump2();
                            var report = createConflictReport();
                            report.EventManagerId = manager2.Id;
                            var statewasInActiveNegotiation;
                            expect(negotiator1.state === 'idle').toBeTruthy();
                            negotiator1.on('setstate', function (x) {
                                switch (negotiator1.state) {
                                    case MEPH.synchronization.SyncConflictNegotiator.states.InActiveNegotiation:
                                        statewasInActiveNegotiation = true;
                                }
                            });
                            //Act
                            negotiator1.receive(report);

                            //Assert
                            expect(statewasInActiveNegotiation).toBeTruthy();
                        }).catch(function (error) {
                            expect(error).caught();
                        }).then(function () {
                            done();
                        });
                    });
                });
    it('get report name from.', function (done) {
        MEPH.requires('MEPH.synchronization.SyncMembrane').then(function () {
            return MEPH.create('MEPH.synchronization.SyncConflictNegotiator').then(function ($class) {

                //Arrange
                var setup = createSyncGroupWithSendControl();
                var manager1 = setup.managers[0];
                var manager2 = setup.managers[1];
                var negotiator1 = setup.negotiators[0];
                var negotiator2 = setup.negotiators[1];
                manager1.heartBeat();
                manager2.heartBeat();
                setup.channel.pump1();
                setup.channel.pump2();
                var report = createConflictReport();
                report.EventManagerId = manager2.Id;

                //Act
                var name = negotiator1.reportName(report.message.conflicts[0]);

                //Assert
                expect(name).toBeTruthy();
            }).catch(function (error) {
                expect(error).caught();
            }).then(function () {
                done();
            });
        });
    });

    it('when receiving an request acknowledgement, and ack is sent back and the state goes to InActiveNegotiation.', function (done) {
        MEPH.requires('MEPH.synchronization.SyncMembrane').then(function () {
            return MEPH.create('MEPH.synchronization.SyncConflictNegotiator').then(function ($class) {
                //Arrange
                var setup = createSyncGroupWithSendControl();
                var manager1 = setup.managers[0];
                var manager2 = setup.managers[1];
                var negotiator1 = setup.negotiators[0];
                var negotiator2 = setup.negotiators[1];
                manager1.heartBeat();
                manager2.heartBeat();
                setup.channel.pump1();
                setup.channel.pump2();
                var report = createConflictReport();
                report.EventManagerId = manager2.Id;

                //Act

                var receivedMessage;
                manager1.sendConflictMessage = function (message) {
                    receivedMessage = message;
                }
                negotiator1.receive({
                    message: {
                        type: MEPH.synchronization.SyncConflictNegotiator.states.RequestAcknowledged
                    }
                });

                //Assert
                expect(receivedMessage).toBeTruthy();
            }).catch(function (error) {
                expect(error).caught();
            }).then(function () {
                done();
            });
        });
    });

    it('when receiving a request ack, and the state is not idle then nothing is sent.', function (done) {
        MEPH.requires('MEPH.synchronization.SyncMembrane').then(function () {
            return MEPH.create('MEPH.synchronization.SyncConflictNegotiator').then(function ($class) {
                //Arrange
                var setup = createSyncGroupWithSendControl();
                var manager1 = setup.managers[0];
                var manager2 = setup.managers[1];
                var negotiator1 = setup.negotiators[0];
                var negotiator2 = setup.negotiators[1];
                manager1.heartBeat();
                manager2.heartBeat();
                setup.channel.pump1();
                setup.channel.pump2();
                var report = createConflictReport();
                report.EventManagerId = manager2.Id;

                //Act
                var receivedMessage;
                negotiator1.state = 'not idle';
                manager1.sendConflictMessage = function (message) {
                    receivedMessage = message;
                }
                negotiator1.receive({
                    message: {
                        type: MEPH.synchronization.SyncConflictNegotiator.states.RequestAcknowledged
                    }
                });

                //Assert
                expect(receivedMessage).toBeTruthy();
                expect(receivedMessage.type === MEPH.synchronization.SyncConflictNegotiator.states.InvalidState).toBeTruthy();
            }).catch(function (error) {
                expect(error).caught();
            }).then(function () {
                done();
            });
        });
    });


    it('If negotiators recieve ackrequest, it will set its state to coordinateleadership.', function (done) {
        MEPH.requires('MEPH.synchronization.SyncMembrane').then(function () {
            return MEPH.create('MEPH.synchronization.SyncConflictNegotiator').then(function ($class) {

                var setup = createSyncGroupWithSendControl();
                var manager1 = setup.managers[0];
                var manager2 = setup.managers[1];
                var negotiator1 = setup.negotiators[0];
                var negotiator2 = setup.negotiators[1];
                var stateCoordinateLeaderShip1;
                negotiator1.on('setstate', function (x) {
                    switch (negotiator1.state) {
                        case MEPH.synchronization.SyncConflictNegotiator.states.WaitingForAcknowledgement:
                            stateCoordinateLeaderShip1 = true;
                    }
                });

                manager1.heartBeat();
                manager2.heartBeat();
                setup.channel.pump1();
                setup.channel.pump2();
                var report = createConflictReport();
                report.EventManagerId = manager2.Id;


                //Act
                negotiator1.waitingNote = true;
                negotiator1.acknowledgements = [manager2.Id];
                negotiator1.state = MEPH.synchronization.SyncConflictNegotiator.states.WaitingForAcknowledgement;
                negotiator1.receive({
                    EventManagerId: manager2.Id,
                    message: {
                        type: MEPH.synchronization.SyncConflictNegotiator.states.AckRequest
                    }
                });

                //Assert
                expect(stateCoordinateLeaderShip1).toBeTruthy();
            }).catch(function (error) {
                expect(error).caught();
            }).then(function () {
                done();
            });
        });
    });


    it('should reach coordinate leadership.', function (done) {
        MEPH.requires('MEPH.synchronization.SyncMembrane').then(function () {
            return MEPH.create('MEPH.synchronization.SyncConflictNegotiator').then(function ($class) {
                //Arrange
                var setup = createSyncGroupWithSendControl();
                var manager1 = setup.managers[0];
                var manager2 = setup.managers[1];

                var negotiator1 = setup.negotiators[0];
                var negotiator2 = setup.negotiators[1];
                var jobject = manager1.createSyncObject();
                var stateCoordinateLeaderShip1;
                var leadershipsReceived1;
                var leadershipsReceived2;
                var conflictsReceived;
                var confirmedLeaderShip;
                var confirmedFollower;
                var conflictResolved;
                var waitingforesolutationAck;
                var stateCoordinateLeaderShip2;
                var result = jobject.createObj({ properties: { property: 'property' } });

                var stateset = function (negotiator, x) {
                    switch (negotiator.state) {
                        case MEPH.synchronization.SyncConflictNegotiator.states.CoordinateLeaderShip:
                            stateCoordinateLeaderShip2 = true;
                            break;
                        case MEPH.synchronization.SyncConflictNegotiator.states.LeaderShipValuesReceived:
                            leadershipsReceived2 = true;
                            break;
                        case MEPH.synchronization.SyncConflictNegotiator.states.ConfirmedLeaderShip:
                            confirmedLeaderShip = true;
                            break;
                        case MEPH.synchronization.SyncConflictNegotiator.states.ConfirmedFollower:
                            confirmedFollower = true;
                            break;
                        case MEPH.synchronization.SyncConflictNegotiator.states.ConflictsReceived:
                            conflictsReceived = true;
                            break;
                        case MEPH.synchronization.SyncConflictNegotiator.states.ConflictResolved:
                            conflictResolved = true;
                            break;
                        case MEPH.synchronization.SyncConflictNegotiator.states.WaitingForResolutionAcknowledgements:
                            waitingforesolutationAck = true;
                            break;
                    }
                }
                negotiator1.on('setstate', stateset.bind(this, negotiator1));
                negotiator2.on('setstate', stateset.bind(this, negotiator2));

                setup.channel.pump1();
                //setup.channel.pump2();
                var object_id = manager2.monitoredEvents[0].objId;
                var object = manager2.getMonitoredObject(object_id);
                //Act
                object.property = "aahs";
                result.property = "afasd";
                manager1.heartBeat();
                manager2.heartBeat();
                object.property = "asdf2";
                setup.channel.pump1();
                setup.channel.pump2();
                object.property = "asdf";
                result.property = "afasd4";
                while (setup.channel.jem1Messages.length || setup.channel.jem2Messages.length) {

                    setup.channel.pump1();
                    setup.channel.pump2();
                }

                //Assert
                expect(stateCoordinateLeaderShip2).toBeTruthy();
                expect(leadershipsReceived2).toBeTruthy();
                expect(confirmedFollower).toBeTruthy();
                expect(confirmedLeaderShip).toBeTruthy();
                expect(conflictsReceived).toBeTruthy();
                expect(conflictResolved).toBeTruthy();
                expect(waitingforesolutationAck).toBeTruthy();
                expect(negotiator1.state === MEPH.synchronization.SyncConflictNegotiator.states.idle).toBeTruthy();
                expect(negotiator2.state === MEPH.synchronization.SyncConflictNegotiator.states.idle).toBeTruthy();

            }).catch(function (error) {
                expect(error).caught();
            }).then(function () {
                done();
            });
        });
    });


    it('when a evnt is not received, it should be requested.', function (done) {
        MEPH.requires('MEPH.synchronization.SyncMembrane').then(function () {
            return MEPH.create('MEPH.synchronization.SyncConflictNegotiator').then(function ($class) {
                //Arrange
                var setup = createSyncGroupWithSendControl();
                var manager1 = setup.managers[0];
                var manager2 = setup.managers[1];
                var jobject = manager1.createSyncObject();
                var result = jobject.createObj({ properties: { property: 'property' } });


                result.property = "afasd";
                manager1.heartBeat();
                manager2.heartBeat();
                var evntmissed;
                manager2.on('missing-event', function () {
                    evntmissed = true;
                });
                result.property = "afasd4";
                result.property = "afasd2";
                var removed;
                setup.channel.jem1Messages.removeWhere(function (x) {
                    if (removed) {
                        return false;
                    }
                    if (x.type == 'events') {
                        removed = true;
                    }

                    return x.type == 'events';
                });

                var left1 = 0,
                    left2 = 0;
                result.property = "afasd5";
                result.property = "afasd6";
                do {
                    left1 = setup.channel.pump1(true);
                    left2 = setup.channel.pump2(true);
                } while (left2 || left1)
                expect(evntmissed).toBeTruthy();

            }).catch(function (error) {
                expect(error).caught();
            }).then(function () {
                done();
            });
        });
    });

    it('events receieved in a random order.', function (done) {
        MEPH.requires('MEPH.synchronization.SyncMembrane').then(function () {
            return MEPH.create('MEPH.synchronization.SyncConflictNegotiator').then(function ($class) {
                //Arrange
                var setup = createSyncGroupWithSendControl();
                var manager1 = setup.managers[0];
                var manager2 = setup.managers[1];
                var jobject = manager1.createSyncObject();
                var result = jobject.createObj({ properties: { property: 'property' } });


                result.property = "afasd";
                manager1.heartBeat();
                manager2.heartBeat();


                [].interpolate(0, 10, function (x) {
                    result.property = 'a' + x;
                });
                var max = 0;
                setup.channel.jem1Messages = setup.channel.jem1Messages.random();
                setup.channel.jem2Messages = setup.channel.jem2Messages.random();

                var left1 = 0,
                    left2 = 0;
                result.property = "afasd5";
                result.property = "afasd6";
                do{
                    left1 = setup.channel.pump1(true);
                    left2 = setup.channel.pump2(true);
                } while (left2 || left1)

                //setup.channel.pump2();
                var object_id = manager2.monitoredEvents[0].objId;
                var object = manager2.getMonitoredObject(object_id);

                expect(result.property === object.property).toBeTruthy();
            }).catch(function (error) {
                expect(error).caught();
            }).then(function () {
                done();
            });
        });
    });

    it('dates are treated like value objects.', function (done) {
        MEPH.requires('MEPH.synchronization.SyncMembrane').then(function () {
            return MEPH.create('MEPH.synchronization.SyncConflictNegotiator').then(function ($class) {
                //Arrange
                var setup = createSyncGroupWithSendControl();
                var manager1 = setup.managers[0];
                var manager2 = setup.managers[1];
                var jobject = manager1.createSyncObject();
                var result = jobject.createObj({ properties: { property: 'property' } });


                result.property = "afasd";
                manager1.heartBeat();
                manager2.heartBeat();
                result.property = (Date.now());
                do {
                    left1 = setup.channel.pump1(true);
                    left2 = setup.channel.pump2(true);
                } while (left2 || left1)

                //setup.channel.pump2();
                var object_id = manager2.monitoredEvents[0].objId;
                var object = manager2.getMonitoredObject(object_id);

                expect(result.property === object.property).toBeTruthy();
            }).catch(function (error) {
                expect(error).caught();
            }).then(function () {
                done();
            });
        });
    });
});