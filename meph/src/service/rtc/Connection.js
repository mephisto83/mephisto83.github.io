/**
 * @class MEPH.service.rtc.Connection
 * Creates a webrtc connection.
 */
MEPH.define('MEPH.service.rtc.Connection', {
    requires: ['MEPH.util.Dom'],
    statics: {
        RtcChannel: 'MEPH.service.rtc.Connection.RTCChannel',
        Answering: 'Answering',
        Calling: 'Calling',
        Candidate: 'candidate',
        Events: {
            StreamAdded: 'streamadded'
        },
        ConnectionType: {
            'default': 'default',
            'all': 'all',
            video: 'video'
        },
        ConnectionSecretary: function (signalProvider, options, callback) {
            signalProvider.channel(MEPH.service.rtc.Connection.RtcChannel, function (channelMessage) {
                try {
                    if (channelMessage && channelMessage.message) {
                        switch (channelMessage.message.type) {
                            case MEPH.service.rtc.Connection.Calling:
                                options.signalProvider = signalProvider;
                                MEPH.service.rtc.Connection.ReceiveCall(channelMessage.message, options).then(function (result) {
                                    callback(result);
                                });
                                break;
                        }
                    }
                }
                catch (error) {
                    MEPH.Log(error);
                }
            });
        },
        /**
         * Create a connection to receive the incoming call.
         */
        ReceiveCall: function (message, options) {
            var promise = Promise.resolve();
            if (!options) {
                throw new Error('Connection:  options are required');
            }
            options.connectionType = message.connectionType;
            options.id = message.connectionid;
            options.to = message.from;
            if (options.connectionType === MEPH.service.rtc.Connection.ConnectionType.video) {
                promise = promise.then(function () {

                    return MEPH.util.Dom.getUserMedia({ video: true, audio: true }).then(function (localstream) {
                        options.options = {
                            stream: localstream
                        }
                    });
                });
            }
            promise = promise.then(function () {
                var connection = new MEPH.service.rtc.Connection(options);
                return connection.receiveCall(message.message)
                    .then(connection.createAnswer.bind(connection))
                    .then(connection.setLocalDescription.bind(connection))
                    .then(connection.sendLocalDescription.bind(connection, MEPH.service.rtc.Connection.Answering))
                    .then(connection.addIceCandidates.bind(connection))
                    .then(function () {
                        return connection;
                    })
                    ['catch'](function (error) {
                        MEPH.Log(error);
                        throw error;
                    });
            });
            return promise;
        }
    },
    properties: {
        peerConnection: null,
        promises: null,
        waitforremotedescription: true,
        streams: null,
        connectionType: null,
        candidates: null,
        localStream: null
    },
    initialize: function (config) {
        config = config || {};
        var me = this;
        me.streams = [];
        MEPH.Events(me);
        MEPH.apply(config, me);
        if (me.signalProvider) {
            me.channelHandler = me.onChannel.bind(me);
            me.signalProvider.channel(MEPH.service.rtc.Connection.RtcChannel, me.channelHandler);
        }
        me.candidates = [];
        me.dataConnectionId = me.dataConnectionId || 'data' + me.id;
        me.setDefaultConstraints();
        me.promises = {};
    },
    /**
     * A connection can receive a call.
     **/
    receiveCall: function (offer) {
        var me = this;
        me.peerConnection = me.createRemotePeerConnection(offer);
        return Promise.resolve().then(function () { return me.peerConnection; });
    },
    /**
     *
     * Creates and answer.
     *
     **/
    createAnswer: function (peerconnection) {
        var me = this, toresolve, tofail, promise = new Promise(function (r, f) {
            toresolve = r,
            tofail = f;
        });
        peerconnection.createAnswer(function (description) {
            toresolve({ connection: peerconnection, description: description });
        }, function () {
            tofail(peerconnection);
        }, me.sdpConstraints);
        return promise;
    },
    makeCall: function () {
        var me = this;
        return me.createOffer()
               .then(me.setLocalDescription.bind(me))
               .then(me.sendLocalDescription.bind(me, MEPH.service.rtc.Connection.Calling))
               .then(me.setRemoteDescription.bind(me))
        .then(me.sendIceCandidates.bind(me));
    },
    addIceCandidates: function () {
        var me = this;

        me.waitforremotedescription = false;
        me.candidates.foreach(function (x) {
            me.peerConnection.addIceCandidate(x);
        });
        me.candidates.removeWhere(function () { return true; });
    },
    close: function () {

    },
    /**
     * Set default constraints of the connections.
     **/
    setDefaultConstraints: function () {
        var me = this;
        MEPH.applyIf({
            mediaConstraints: {
                video: true,
                audio: true
            },
            constraints: {
                'optional': [],
                'mandatory': {
                    'MozDontOfferDataChannel': true
                }
            },
            sdpConstraints: {
                'mandatory': {
                    'OfferToReceiveAudio': true,
                    'OfferToReceiveVideo': true
                }
            }
        }, me)
    },
    /**
     * Creats a peer connection.
     * returns {Promise}
     **/
    createPeerConnection: function (isremote, offer) {
        var me = this,
            pcConfig = me.peerConnectionConfiguration,
            pcConstraints = me.peerConnectionConstraints,
            pc;


        pc = new RTCPeerConnection(pcConfig, pcConstraints);//


        if (isremote) {
            pc.setRemoteDescription(new RTCSessionDescription(offer));
            me.remoteDescriptionSet = true;
        }

        pc.onaddstream = me.handleStreamAdded.bind(me, pc);
        if (me.options && me.options.stream) {
            pc.addStream(me.options.stream);
        }
        pc.onremovestream = me.handleRemoteStreamRemoved.bind(me, pc);
        pc.onsignalingstatechange = me.handleSignalingStateChange.bind(me, pc);

        pc.onicecandidate = me.handleIceCandidate.bind(me, pc);
        if (isremote) {
            pc.ondatachannel = me.handleReceiveChannel.bind(me, pc);
        }
        else {
            pc.onnegotiationneeded = me.handleNegotiaionNeeded.bind(me, pc);
            //SHOULD ONLY BE SET BY CALLER
            if (me.data) {
                me.dataChannel = pc.createDataChannel(me.dataConnectionId, { reliable: false });
                me.dataChannel.onopen = me.handleChannelStateChange.bind(me, pc, "open");
                me.dataChannel.onclose = me.handleChannelStateChange.bind(me, pc, "close");
                me.dataChannel.onmessage = me.handleMessage.bind(me, pc);
            }
        }
        me.peerConnection = pc;
        return pc;
    },
    createRemotePeerConnection: function (offer) {
        var me = this,
            pc;
        pc = me.createPeerConnection(true, offer);
        me.remote = true;
        return pc;
    },
    createOffer: function () {
        var me = this, toresolve, tofail, promise = new Promise(function (r, f) {
            toresolve = r,
            tofail = f;
        });
        me.modifyConstraints(me.constraints);
        me.peerConnection.createOffer(function (description) {
            toresolve({ connection: me.peerConnection, description: description });
        }, null, me.constraints);
        return promise;
    },
    setLocalDescription: function (options) {
        var me = this,
            toresolve,
            tofail,
            promise = new Promise(function (r, f) {
                toresolve = r;
                tofail = f;
            });
        options.connection.setLocalDescription(options.description, function () {
            toresolve(options);
        }, function (e) {
            tofail(e);
        });
        return promise;
    },
    modifyConstraints: function (constraints) {
        // temporary measure to remove Moz* constraints in Chrome
        var me = this;
        if (MEPH.browser === 'chrome') {
            for (var prop in constraints.mandatory) {
                if (prop.indexOf('Moz') !== -1) {
                    delete constraints.mandatory[prop];
                }
            }
        }
        constraints = me.mergeConstraints(constraints, me.sdpConstraints);
    },
    mergeConstraints: function (cons1, cons2) {
        var merged = cons1;
        var me = this;
        for (var name in cons2.mandatory) {
            merged.mandatory[name] = cons2.mandatory[name];
        }
        merged.optional.concat(cons2.optional);
        return merged;
    },
    // Set Opus as the default audio codec if it's present.
    setOpusPreffered: function (sdp) {
        var me = this;
        var sdpLines = sdp.split('\r\n');
        var mLineIndex;
        // Search for m line.
        for (var i = 0; i < sdpLines.length; i++) {
            if (sdpLines[i].search('m=audio') !== -1) {
                mLineIndex = i;
                break;
            }
        }
        if (mLineIndex === null) {
            return sdp;
        }

        // If Opus is available, set it as the default in m line.
        for (i = 0; i < sdpLines.length; i++) {
            if (sdpLines[i].search('opus/48000') !== -1) {
                var opusPayload = me.extractSdp(sdpLines[i], /:(\d+) opus\/48000/i);
                if (opusPayload) {
                    sdpLines[mLineIndex] = me.setDefaultCodec(sdpLines[mLineIndex], opusPayload);
                }
                break;
            }
        }

        // Remove CN in m line and sdp.
        sdpLines = me.removeCN(sdpLines, mLineIndex);

        sdp = sdpLines.join('\r\n');
        return sdp;
    },
    // Strip CN from sdp before CN constraints is ready.
    removeCN: function (sdpLines, mLineIndex) {
        var me = this,
            cnPos,
            payload,
            mLineElements = sdpLines[mLineIndex].split(' ');
        // Scan from end for the convenience of removing an item.
        for (var i = sdpLines.length - 1; i >= 0; i--) {
            payload = me.extractSdp(sdpLines[i], /a=rtpmap:(\d+) CN\/\d+/i);
            if (payload) {
                cnPos = mLineElements.indexOf(payload);
                if (cnPos !== -1) {
                    // Remove CN payload from m line.
                    mLineElements.splice(cnPos, 1);
                }
                // Remove CN line in sdp
                sdpLines.splice(i, 1);
            }
        }
        sdpLines[mLineIndex] = mLineElements.join(' ');
        return sdpLines;
    },
    extractSdp: function (sdpLine, pattern) {
        var result = sdpLine.match(pattern);
        return result && result.length === 2 ? result[1] : null;
    },
    /**
     *
     * Set the selected codec to the first in m line.
     */
    setDefaultCodec: function (mLine, payload) {
        var elements = mLine.split(' ');
        var newLine = [];
        var me = this;
        var index = 0;
        for (var i = 0; i < elements.length; i++) {
            if (index === 3) { // Format of media starts from the fourth.
                newLine[index++] = payload; // Put target payload to the first.
            }
            if (elements[i] !== payload) {
                newLine[index++] = elements[i];
            }
        }
        return newLine.join(' ');
    },
    setOpusDescription: function (options) {
        var me = this;
        return Promise.resolve().then(function () {
            options.description.sdp = me.setOpusPreffered(options.description.sdp);

            return options;
        });
    },
    sendLocalDescription: function (type, option) {
        var toresolve,
            tofail,
            me = this, promise = new Promise(function (r, f) {
                toresolve = r;
                tofail = f;
            }),
            connection = option.connection,
            description = option.description;

        me.promises.Answer = {
            resolve: toresolve,
            fail: tofail
        };

        me.signalProvider.sendMessage({
            message: option.description,
            connectionid: me.id,
            from: me.partyId,
            connectionType: me.connectionType,
            type: type
        },
        me.to,
        MEPH.service.rtc.Connection.RtcChannel);
        if (type === MEPH.service.rtc.Connection.Answering) {
            toresolve();
        }
        return promise;
    },
    addLocalStream: function (stream) {
        var me = this;
        if (me.peerConnection) {
            me.streams.push(stream);
            me.peerConnection.addStream(stream);
        }
    },
    setRemoteDescription: function (message) {
        var me = this;

        me.peerConnection.setRemoteDescription(new RTCSessionDescription(message.message));
        me.remoteDescriptionSet = true;
        me.sendIceCandidates();
    },
    onChannel: function (message) {
        var me = this;

        if (message.to === me.partyId) {
            if (message.message.connectionType === me.connectionType) {
                switch (message.message.type) {
                    case MEPH.service.rtc.Connection.Answering:
                        me.handleCallingMessage(message.message);
                        break;
                    case MEPH.service.rtc.Connection.Candidate:
                        MEPH.Log('Receive candidate message');
                        me.handleIceCandidateMessage(message.message);
                        break;
                }
            }
        }
    },
    handleCallingMessage: function (message) {
        var me = this;
        if (me.promises.Answer) {
            me.promises.Answer.resolve(message);
            me.promises.Answer = null;
        }
        else {
            throw new Error('no corresponing answer');
        }
    },
    handleReceiveChannel: function (peerconnection) {
        var me = this;
        peerconnection.receiveChannel = event.channel;
        peerconnection.receiveChannel.onmessage = me.handleMessage.bind(me, peerconnection);
        peerconnection.receiveChannel.onopen = me.handleChannelStateChange.bind(me, peerconnection, "open");
        peerconnection.receiveChannel.onclose = me.handleChannelStateChange.bind(me, peerconnection, "close");
    },
    handleMessage: function (peerconnection) {
    },
    handleChannelStateChange: function (peerconnection, type) {
    },
    handleStreamAdded: function (peerconnection, evnt) {
        var me = this;
        me.stream = evnt.stream;
        me.fire(MEPH.service.rtc.Connection.Events.StreamAdded, { stream: me.stream });
    },
    handleRemoteStreamRemoved: function (peerconnection) {
        var me = this;
        me.stream = null;
    },
    handleSignalingStateChange: function (peerconnection, evnt) {
        var me = this;
        me.state = evnt.currentTarget.signalingState;
    },
    handleIceCandidateMessage: function (message) {
        var me = this,
            candidate;

        candidate = new RTCIceCandidate({ sdpMLineIndex: message.label, candidate: message.candidate });
        if (me.waitforremotedescription && me.remote) {
            me.candidates.push(candidate);
        }
        else {
            me.peerConnection.addIceCandidate(candidate);
        }
    },
    sendIceCandidates: function () {
        var me = this;
        me.candidateEvents.foreach(function (evnt) {
            if (evnt.candidate) {
                MEPH.Log('Sent candidate message');
                me.signalProvider.sendMessage({
                    type: MEPH.service.rtc.Connection.Candidate,
                    connectionType: me.connectionType,
                    label: evnt.candidate.sdpMLineIndex,
                    id: evnt.candidate.sdpMid,
                    candidate: evnt.candidate.candidate
                },
                me.to,
                MEPH.service.rtc.Connection.RtcChannel);
            }
        });
        me.candidateEvents.removeWhere(function () { return true; });
    },
    handleIceCandidate: function (peerconnection, evnt) {
        var me = this;
        me.candidateEvents = me.candidateEvents || [];
        me.candidateEvents.push(evnt);
        if (me.remoteDescriptionSet) {
            me.sendIceCandidates();
        }
    },
    handleNegotiaionNeeded: function (peerconnection) {
        var me = this;
        if (me.remote) {
            return;
        }
        me.makeCall();
    }
});