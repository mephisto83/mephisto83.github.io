MEPH.define('MEPH.synchronization.SyncConflictNegotiator', {
    requires: ['MEPH.synchronization.SyncObject',
                'MEPH.mixins.Observable'],
    mixins: {
        observable: 'MEPH.mixins.Observable',
    },
    statics: {
        conflictTypes: {
            sameParent: 'sameparent'
        },
        states: {
            idle: 'idle',
            conflictAquired: 'conflictAquired',
            conflictAssesmentAndAgreementState: 'conflict assesment and agreement state',
            InActiveNegotiation: 'activeNegotiation',
            WaitingForAcknowledgement: 'WaitingForAcknowledgement',
            conflictFound: 'conflictFound',
            InvalidState: 'InvalidState',
            AckRequest: 'AckRequest',
            RequestConflict: 'RequestConflict',
            RequestAcknowledged: 'RequestAcknowledged',
            CoordinateLeaderShip: 'CoordinateLeaderShip',
            LeaderShipVal: 'LeaderShipVal',
            LeaderShipValuesReceived: 'LeaderShipValuesReceived',
            ConfirmedLeaderShip: 'ConfirmedLeaderShip',
            ConfirmedFollower: 'ConfirmedFollower',
            AckConflictRequest: 'AckConflictRequest',
            WaitingForConflictReports: 'WaitingForConflictReports',
            ConflictsReceived: 'ConflictsReceived',
            ResolveConflict: 'ResolveConflict',
            ConflictResolved: 'ConflictResolved',
            ResolutionSent: 'ResolutionSent',
            WaitingForResolutionAcknowledgements: 'WaitingForResolutionAcknowledgements',
            ResolutionAcknowledgement: 'ResolutionAcknowledgement',
            conflictNegotiationsComplete: 'conflictNegotiationsComplete',
            WaitForIdles: 'WaitForIdles',
            ConflictCompleteAck: 'ConflictCompleteAck'
        }
    },
    properties: {
        manager: null,
        currentRollCall: null,
        receivedReports: null,
        state: 'idle',
        timeToWaitForAcknowledgements: 20000
    },
    initialize: function (options) {
        var me = this;
        me.mixins.observable.init.apply(me);
        //MEPH.Events(me);
        me.receivedReports = [];
        me.currentRollCall = [];
        me.on('change_state', me.stateChanged.bind(me));
    },
    setManager: function (value) {
        var me = this;
        me.manager = value;
        me.manager.on('roll-call-change', me.onRollCallChange.bind(me));
        me.manager.on('conflict-detected', me.onConflictDetected.bind(me));
    },
    stateChanged: function () {
        var me = this;
        switch (me.state) {
            case MEPH.synchronization.SyncConflictNegotiator.states.ConfirmedLeaderShip:
                me.state = MEPH.synchronization.SyncConflictNegotiator.states.WaitingForConflictReports;
                me.requestAllConflictReports();
                break;
            case MEPH.synchronization.SyncConflictNegotiator.states.conflictAquired:
                var conflictreport = me.createConflictReport();
                me.currentReport = conflictreport;
                me.state = MEPH.synchronization.SyncConflictNegotiator.states.conflictAssesmentAndAgreementState;
                break;
            case MEPH.synchronization.SyncConflictNegotiator.states.conflictAssesmentAndAgreementState:
                me.manager.sendConflictMessage({ type: MEPH.synchronization.SyncConflictNegotiator.states.conflictFound });
                me.state = MEPH.synchronization.SyncConflictNegotiator.states.InActiveNegotiation;
                break;
            case MEPH.synchronization.SyncConflictNegotiator.states.CoordinateLeaderShip:
                if (me.manager.causesConflict()) {
                    me.leadership = Math.random();
                }
                else {
                    me.leadership = -1;
                }
                me.manager.sendConflictMessage({
                    type: MEPH.synchronization.SyncConflictNegotiator.states.LeaderShipVal,
                    leadership: me.leadership
                });
                break;
            case MEPH.synchronization.SyncConflictNegotiator.states.LeaderShipValuesReceived:
                me.calculateLeader();
                break;
            case MEPH.synchronization.SyncConflictNegotiator.states.InActiveNegotiation:
                me.waitForManagerAcknowledgements();
                break;
            case MEPH.synchronization.SyncConflictNegotiator.states.ConflictsReceived:
                me.conflictsReceived();
                break;
            case MEPH.synchronization.SyncConflictNegotiator.states.ResolveConflict:
                me.solution = me.resolveConflict();
                me.state = MEPH.synchronization.SyncConflictNegotiator.states.ConflictResolved;
                break;
            case MEPH.synchronization.SyncConflictNegotiator.states.ConflictResolved:
                me.sendResolution(me.solution);
                me.resolutionAcknowledgements = [];
                me.state = MEPH.synchronization.SyncConflictNegotiator.states.WaitingForResolutionAcknowledgements;
                break;
            case MEPH.synchronization.SyncConflictNegotiator.states.WaitingForResolutionAcknowledgements:
                break;
        }
    },
    sendResolution: function (solution) {
        var me = this;
        me.manager.sendConflictMessage({
            solution: solution,
            type: MEPH.synchronization.SyncConflictNegotiator.states.ResolutionSent
        });
    },
    resolveConflict: function () {
        var me = this,
            conflict = me.conflictToResolve,
            resolution = null;
        if (conflict) {
            switch (me.detectConflictType(conflict)) {
                case MEPH.synchronization.SyncConflictNegotiator.conflictTypes.sameParent:
                    resolution = me.resolveSameParentConflict(conflict);
                    break;
                default:
                    throw 'not implemented';
            }
        }
        return resolution;
    },
    resolveSameParentConflict: function (conflict) {
        var me = this,
            evnt;

        evnt = me.manager.getEvents().where(function (x) {
            return x.id === conflict.evntId;
        })
        var intersectingChildEvents = conflict.events.select(function (x) {
            return x.id;
        }).intersection(evnt.first().childEvents, function (x) {
            return x;
        });

        if (intersectingChildEvents.length === conflict.events.length) {
            var chains = intersectingChildEvents.select(function (x) {
                return {
                    chain: me.manager.getEventChain(x),
                    evnt: x
                };
            })
            var eventstoremove = [];
            var chainToKeep = chains.maxSelection(function (x) { return x.length; });
            chains.where(function (x) { return x !== chainToKeep; })
                    .foreach(function (x) {
                        me.manager.removeEvents(x);
                        eventstoremove.push(x.evnt);
                    });
            var last = chainToKeep.chain.last();
            me.manager.evaluateEvent(last);
            return {
                eventsToRemove: eventstoremove,
                chainToKeep: chainToKeep.evnt,
                name: me.reportName(conflict),
                resolutionId: MEPH.GUID(),
                type: MEPH.synchronization.SyncConflictNegotiator.conflictTypes.sameParent
            }
        }
        else {
            me.fire('inconsistent-conflict', { conflict: conflict });
        }
    },
    detectConflictType: function (conflict) {
        var me = this,
            parentevents;
        parentevents = conflict.events.select(function (x) { return x.parentEventId }).unique(function (x) { return x; });
        if (parentevents.length === 1) {
            return MEPH.synchronization.SyncConflictNegotiator.conflictTypes.sameParent;
        }
    },
    conflictsReceived: function () {
        var me = this,
            conflictReports,
            uniqueConflicts,
            conflictsWithPerfectInformation,
            conflicttoresolve;
        conflictReports = me.conflictReports;
        uniqueConflicts = conflictReports.where(function (x) { return x.message.conflicts; })
            .select(function (x) {
                return x.message.conflicts;
            }).concatFluentReverse(function (x) {
                return x;
            }).unique(function (x) {
                return me.reportName(x);
            });

        conflictsWithPerfectInformation = uniqueConflicts.where(function (x) {
            return me.manager.hasEvent(x.evntId) && x.events.all(function (y) {
                return me.manager.hasEvent(y.id);
            });
        });
        conflicttoresolve = conflictsWithPerfectInformation.first();
        me.conflictToResolve = conflicttoresolve;
        me.state = MEPH.synchronization.SyncConflictNegotiator.states.ResolveConflict;
    },
    waitForManagerAcknowledgements: function () {
        var me = this;
        me.clearWaitForManagerAcknowledgements();
        me.acknowledgements = [];
        me.leadershipValues = [];
        me.state = MEPH.synchronization.SyncConflictNegotiator.states.WaitingForAcknowledgement;
        me.waitingNote = setTimeout(function () {

        }, me.timeToWaitForAcknowledgements);
    },
    clearWaitForManagerAcknowledgements: function () {
        var me = this;
        if (me.waitingNote !== undefined) {
            clearTimeout(me.waitingNote);
            me.waitingNote = undefined;
        }
    },
    requestAllConflictReports: function () {
        var me = this;
        me.conflictReports = [];
        me.manager.sendConflictMessage({
            type: MEPH.synchronization.SyncConflictNegotiator.states.RequestConflict
        });
    },
    receive: function (message) {
        var me = this;
        switch (message.message.type) {
            case MEPH.synchronization.SyncConflictNegotiator.states.LeaderShipVal:
                me.handleLeaderShipVal(message);
                break;
            case MEPH.synchronization.SyncConflictNegotiator.states.conflictFound:
                me.handleConflictFound(message);
                break;
            case MEPH.synchronization.SyncConflictNegotiator.states.RequestAcknowledged:
                me.handleRequestAck(message);
                break;
            case MEPH.synchronization.SyncConflictNegotiator.states.AckRequest:
                me.handleAckRequest(message);
                break;
            case MEPH.synchronization.SyncConflictNegotiator.states.RequestConflict:
                me.handleConflictRequest(message);
                break;
            case MEPH.synchronization.SyncConflictNegotiator.states.AckConflictRequest:
                me.handleConflictAcknowledgement(message)
                break;
            case MEPH.synchronization.SyncConflictNegotiator.states.ResolutionSent:
                me.handleConflictResolution(message);
                break;
            case MEPH.synchronization.SyncConflictNegotiator.states.ResolutionAcknowledgement:
                me.handleResolutionAcknowledgement(message);
                break;
            case MEPH.synchronization.SyncConflictNegotiator.states.conflictNegotiationsComplete:
                me.handlConflictNegotiationComplete(message);
                break;
            case MEPH.synchronization.SyncConflictNegotiator.states.ConflictCompleteAck:
                me.handlConflictCompleteAck(message);
                break;
            case 'report':
                me.handleReport(message);
                break;
        }
    },
    handlConflictNegotiationComplete: function (message) {
        var me = this;
        switch (me.state) {
            case MEPH.synchronization.SyncConflictNegotiator.states.ConfirmedFollower:
                me.manager.sendConflictMessage({
                    type: MEPH.synchronization.SyncConflictNegotiator.states.ConflictCompleteAck
                });
                me.state = MEPH.synchronization.SyncConflictNegotiator.states.idle;
                me.fire('conflict-resolved', {});
                break;
        }

    },
    handlConflictCompleteAck: function (message) {
        var me = this,
            managers;
        switch (me.state) {
            case MEPH.synchronization.SyncConflictNegotiator.states.WaitForIdles:
                if (me.completionAcks) {
                    if (!me.completionAcks.contains(function (x) { return x.EventManagerId === message.EventManagerId; })) {
                        me.completionAcks.push(message);

                        managers = me.getManagers().where(function (x) { return x !== me.manager.Id; });
                        var intersects = me.completionAcks.intersection(managers, function (x, y) {
                            return x === y.EventManagerId;
                        }).unique(function (x) { return x; });
                        if (intersects.length === managers.length) {
                            me.state = MEPH.synchronization.SyncConflictNegotiator.states.idle;
                        }
                    }
                }
                break;
        }
    },
    handleResolutionAcknowledgement: function (message) {
        var me = this,
            managers;
        switch (me.state) {
            case MEPH.synchronization.SyncConflictNegotiator.states.WaitingForResolutionAcknowledgements:
                if (me.resolutionAcknowledgements) {
                    if (!me.resolutionAcknowledgements.contains(function (x) {
                        return x.EventManagerId === message.EventManagerId;
                    })) {

                        me.resolutionAcknowledgements.push(message);
                        managers = me.getManagers().where(function (x) { return x !== me.manager.Id; });
                        var intersects = me.resolutionAcknowledgements.intersection(managers, function (x, y) {
                            return x === y.EventManagerId;
                        }).unique(function (x) { return x; });
                        if (intersects.length === managers.length) {
                            me.allResolutionAcknowledgementsReceived();
                        }
                    }
                }
                break;
        }
    },
    allResolutionAcknowledgementsReceived: function () {
        ;
        var me = this;
        me.completionAcks = [];
        me.manager.sendConflictMessage({
            type: MEPH.synchronization.SyncConflictNegotiator.states.conflictNegotiationsComplete
        });
        me.state = MEPH.synchronization.SyncConflictNegotiator.states.WaitForIdles
    },
    handleConflictResolution: function (message) {
        var me = this,
            success = false;
        switch (me.state) {
            case MEPH.synchronization.SyncConflictNegotiator.states.ConfirmedFollower:
                if (message.message.solution) {
                    switch (message.message.solution.type) {
                        case MEPH.synchronization.SyncConflictNegotiator.conflictTypes.sameParent:
                            success = me.applySameParentResolution(message.message.solution);
                            break;
                    }
                }
                me.manager.sendConflictMessage({
                    success: success,
                    solutionId: message.message.solution ? message.message.solution.solutionId : null,
                    type: MEPH.synchronization.SyncConflictNegotiator.states.ResolutionAcknowledgement
                });
                break;
            default:
                throw 'illegal state';
                break;
        }

    },
    applySameParentResolution: function (solution) {
        var me = this;

        var chainToKeep = me.manager.getEvent(solution.chainToKeep);
        var hasall = solution.eventsToRemove.all(function (x) { return me.manager.getEvent(x); });
        if (hasall && chainToKeep) {
            solution.eventsToRemove.concatFluentReverse(function (x) {
                return me.manager.getEventChain(x);
            }).foreach(function (x) {
                me.manager.removeEvent(x);
            });

            var last = me.manager.getEventChain(chainToKeep.id);
            if (!last.childEvents || last.childEvents.length === 0) {
                me.manager.evaluateEvent(last.last());
                return true;
            }
            else {
                //has more conflicts to deal with.
                return false;
            }
        }
        else {
            throw 'missing event';
        }
    },
    handleConflictAcknowledgement: function (message) {
        var me = this,
            managers;
        switch (me.state) {
            case MEPH.synchronization.SyncConflictNegotiator.states.WaitingForConflictReports:
                if (me.conflictReports) {
                    if (!me.conflictReports.contains(function (x) { return x.EventManagerId === message.EventManagerId; })) {
                        me.conflictReports.push(message);
                        managers = me.getManagers().where(function (x) { return x !== me.manager.Id; });
                        var intersects = me.conflictReports.intersection(managers, function (x, y) {
                            return x === y.EventManagerId;
                        }).unique(function (x) { return x; });
                        if (intersects.length === managers.length) {
                            me.conflictReports = [];
                            me.conflictReports.push({
                                message: {
                                    conflicts: me.manager.causesConflict()
                                }
                            });
                            me.state = MEPH.synchronization.SyncConflictNegotiator.states.ConflictsReceived;
                        }
                    }
                }
                break;
            default:
                
                me.manager.sendConflictMessage({
                    cause: 'in wrong state : ' + message.type,
                    type: MEPH.synchronization.SyncConflictNegotiator.states.InvalidState
                });
                break;
        }
    },
    handleLeaderShipVal: function (message) {
        var me = this,
            managers;
        switch (me.state) {
            case MEPH.synchronization.SyncConflictNegotiator.states.WaitingForAcknowledgement:
                me.clearWaitForManagerAcknowledgements();
                me.state = MEPH.synchronization.SyncConflictNegotiator.states.CoordinateLeaderShip;
                //continue 
            case MEPH.synchronization.SyncConflictNegotiator.states.CoordinateLeaderShip:
                if (me.leadershipValues) {
                    if (!me.leadershipValues.contains(function (x) { return x.EventManagerId === message.EventManagerId })) {
                        me.leadershipValues.push({ id: message.EventManagerId, value: message.message.leadership });
                        managers = me.getManagers().where(function (x) { return x !== me.manager.Id; });
                        var intersects = me.leadershipValues.intersection(managers, function (x, y) {
                            return x === y.id;
                        }).unique(function (x) { return x; });;
                        if (intersects.length === managers.length) {
                            me.state = MEPH.synchronization.SyncConflictNegotiator.states.LeaderShipValuesReceived;
                        }
                    }
                }
                break;
            default:
                debugger
                me.manager.sendConflictMessage({
                    cause: 'in wrong state : ' + message.type,
                    type: MEPH.synchronization.SyncConflictNegotiator.states.InvalidState
                });
                break;
        }
    },
    calculateLeader: function () {
        var me = this;
        var max = me.leadershipValues.concat({ me: true, value: me.leadership })
        .maxSelection(function (x, y) {
            return x.value;
        });
        me.leadershipValues = [];
        if (max.me) {
            me.state = MEPH.synchronization.SyncConflictNegotiator.states.ConfirmedLeaderShip;
        }
        else {
            me.state = MEPH.synchronization.SyncConflictNegotiator.states.ConfirmedFollower;
        }
    },
    handleRequestAck: function (message) {
        var me = this;
        switch (me.state) {
            case MEPH.synchronization.SyncConflictNegotiator.states.WaitingForAcknowledgement:
                me.manager.sendConflictMessage({
                    report: me.currentReport,
                    type: MEPH.synchronization.SyncConflictNegotiator.states.AckRequest
                }, message.EventManagerId);
                break;
            case MEPH.synchronization.SyncConflictNegotiator.states.idle:
                me.state = MEPH.synchronization.SyncConflictNegotiator.states.InActiveNegotiation;
                me.manager.sendConflictMessage({
                    report: me.currentReport,
                    type: MEPH.synchronization.SyncConflictNegotiator.states.AckRequest
                }, message.EventManagerId);
                break;
            default:

                me.manager.sendConflictMessage({
                    cause: 'in wrong state : ' + message.type,
                    type: MEPH.synchronization.SyncConflictNegotiator.states.InvalidState
                });
                break;
        }
    },
    handleAckRequest: function (message) {
        var me = this,
            managers;
        switch (me.state) {
            case MEPH.synchronization.SyncConflictNegotiator.states.WaitingForAcknowledgement:
                if (me.waitingNote !== undefined) {
                    if (!me.acknowledgements.contains(function (x) { return x === message.EventManagerId })) {
                        me.acknowledgements.push(message.EventManagerId);
                        managers = me.getManagers().where(function (x) { return x !== me.manager.Id; });
                        var intersects = me.acknowledgements.intersection(managers, function (x, y) {
                            return x === y;
                        }).unique(function (x) { return x; });;
                        if (intersects.length === managers.length) {
                            me.allAcknowledgmentsReceived();
                        }
                    }
                }
                break;
        }
    },
    allAcknowledgmentsReceived: function () {
        var me = this;
        me.waitingNote = undefined;
        me.state = MEPH.synchronization.SyncConflictNegotiator.states.CoordinateLeaderShip;
    },
    handleConflictFound: function (message) {
        var me = this;
        switch (me.state) {
            case MEPH.synchronization.SyncConflictNegotiator.states.WaitingForAcknowledgement:
                me.manager.sendConflictMessage({
                    type: MEPH.synchronization.SyncConflictNegotiator.states.RequestAcknowledged
                });
                break;
            case MEPH.synchronization.SyncConflictNegotiator.states.idle:
                me.state = MEPH.synchronization.SyncConflictNegotiator.states.InActiveNegotiation;
                me.manager.sendConflictMessage({
                    type: MEPH.synchronization.SyncConflictNegotiator.states.RequestAcknowledged
                });
                break;
        }
    },
    handleConflictRequest: function (message) {
        var me = this;

        switch (me.state) {
            case MEPH.synchronization.SyncConflictNegotiator.states.ConfirmedFollower:
                var conflicts = me.manager.causesConflict();
                me.manager.sendConflictMessage({
                    conflicts: conflicts,
                    type: MEPH.synchronization.SyncConflictNegotiator.states.AckConflictRequest
                });
                break;
            default:

                me.manager.sendConflictMessage({
                    cause: 'in wrong state : ' + message.type,
                    type: MEPH.synchronization.SyncConflictNegotiator.states.InvalidState
                });
                break
        }

    },
    handleReport: function (message) {
        var me = this;
        switch (me.state) {
            case MEPH.synchronization.SyncConflictNegotiator.states.idle:
            case MEPH.synchronization.SyncConflictNegotiator.states.conflictAssesmentAndAgreementState:
                me.state = MEPH.synchronization.SyncConflictNegotiator.states.InActiveNegotiation;
                break;
            default:
                throw 'not implemented';
                break;
        }
    },
    reportName: function (conflict) {
        var me = this;
        return conflict.events
                        .orderBy(function (x, y) {
                            return x.id.localeCompare(y.id);
                        }).select(function (x) {
                            return x.id;
                        }).join();
    },
    createConflictReport: function () {
        var me = this;

        var managers = me.currentRollCall.select(function (x) { return x.Id }).concat([(me.getManager().Id)]);
        var conflicts = me.manager.causesConflict();
        var conflict = conflicts.first();
        var report = {
            conflicts: conflicts,
            managers: managers,
            conflictTarget: conflict.evntId,
            type: 'report'
        }
        return report;
    },
    getManagers: function () {
        var me = this;
        var managers = me.currentRollCall.select(function (x) { return x.Id }).concat([(me.getManager().Id)]);
        return managers;
    },
    onConflictDetected: function (type, args) {
        var me = this;
        if (me.state === MEPH.synchronization.SyncConflictNegotiator.states.idle) {
            me.state = MEPH.synchronization.SyncConflictNegotiator.states.conflictAquired;
        }
    },
    onRollCallChange: function (type, args) {
        var me = this;
        me.currentRollCall = me.manager.getEventManagers().select(function (x) { return x; });;
    },
    getManager: function () {
        var me = this;
        return me.manager;
    }
});