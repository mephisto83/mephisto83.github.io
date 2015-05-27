describe("MEPH/service/rtc/Connection.spec.js", function () {

    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });

    it('can create a webrtcconnection.', function (done) {
        MEPH.create('MEPH.service.rtc.Connection').then(function ($class) {
            var servicecaller = new $class();

            expect(servicecaller).theTruth('there should be a service caller instance ');
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });

    it('can set an id for the connection', function (done) {
        MEPH.create('MEPH.service.rtc.Connection').then(function ($class) {
            var connection = new $class({
                partyId: 'newguy', id: 'id'
            });

            expect(connection.id === 'id').theTruth('the connection id was incorrect');
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });
    var webrtcDetectedBrowser = navigator.mozGetUserMedia ? 'firefox' : false,
        peerConnectionConstraints = {
            'optional': [
              { 'DtlsSrtpKeyAgreement': true },
              { 'RtpDataChannels': true }
            ]
        },
        createDefaultConnection = function () {
            var signalprovider = createSignalProvider();
            return new MEPH.service.rtc.Connection({
                id: 'id',
                to: 'to',
                partyId: 'newguy1',
                data: true,
                dataConnectionId: 'dataid',
                signalProvider: signalprovider,
                peerConnectionConfiguration: peerConnectionConfiguration,
                peerConnectionConstraints: peerConnectionConstraints
            });
        },
        localDescription = {
            'sdp': 'v=0\r\no=- 2807601466716631599 2 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\na=group:BUNDLE' +
                ' audio data\r\na=msid-semantic: WMS\r\nm=audio 1 RTP/SAVPF 111 103 104 0 8 106 105 13 126\r\nc=IN' +
                ' IP4 0.0.0.0\r\na=rtcp:1 IN IP4 0.0.0.0\r\na=ice-ufrag:M94M6u9C9QavOo35\r\na=ice-pwd:2p5JpLeL3r5Z14E2hxdzLH1u' +
                '\r\na=ice-options:google-ice\r\na=fingerprint:sha-256 90:6F:89:FF:BC:10:AA:E6:A3:9A:1D:05:0C:EF:D3:AF:ED:34:6B:1' +
                '4:6A:03:B5:BB:15:D2:8F:B8:D2:EA:8A:19\r\na=setup:actpass\r\na=mid:audio\r\na=extmap:1 urn:ietf:params:rtp-hdrext:' +
                'ssrc-audio-level\r\na=recvonly\r\na=rtcp-mux\r\na=crypto:1 AES_CM_128_HMAC_SHA1_80 inline:ei0CXWCdW0H/4fjakJEGlMPsfOg' +
                'QNxVAwfDKznYW\r\na=rtpmap:111 opus/48000/2\r\na=fmtp:111 minptime=10\r\na=rtpmap:103 ISAC/16000\r\na=rtpmap:104 ISAC/' +
                '32000\r\na=rtpmap:0 PCMU/8000\r\na=rtpmap:8 PCMA/8000\r\na=rtpmap:106 CN/32000\r\na=rtpmap:105 CN/16000\r\na=rtpmap:13' +
                ' CN/8000\r\na=rtpmap:126 telephone-event/8000\r\na=maxptime:60\r\nm=application 1 RTP/SAVPF 101\r\nc=IN IP4 0.0.0.0\r\na=' +
                'rtcp:1 IN IP4 0.0.0.0\r\na=ice-ufrag:M94M6u9C9QavOo35\r\na=ice-pwd:2p5JpLeL3r5Z14E2hxdzLH1u\r\na=ice-options:google-ice\r\n' +
                'a=fingerprint:sha-256 90:6F:89:FF:BC:10:AA:E6:A3:9A:1D:05:0C:EF:D3:AF:ED:34:6B:14:6A:03:B5:BB:15:D2:8F:B8:D2' +
                ':EA:8A:19\r\na=setup:actpass\r\na=mid:data\r\na=sendrecv\r\nb=AS:30\r\na=rtcp-mux\r\na=crypto:1 AES_CM_128_HMAC_SHA1_8' +
                '0 inline:ei0CXWCdW0H/4fjakJEGlMPsfOgQNxVAwfDKznYW\r\na=rtpmap:101 google-data/90000\r\na=ssrc:725184016 cname:HXtttMTOAbI' +
                '0/q7d\r\na=ssrc:725184016 msid:dataid dataid\r\na=ssrc:725184016 mslabel:dataid\r\na=ssrc:725184016 label:dataid\r\n',
            'type': 'offer'
        },
        peerConnectionConfiguration = webrtcDetectedBrowser === 'firefox' ? {
            'iceServers': [{ 'url': 'stun:23.21.150.121' }]
        } : {
            'iceServers': [{ 'url': 'stun:stun.l.google.com:19302' }]
        },
        createSignalProvider = function () {
            var listeners = [];
            var messages = [];
            var ng1 = [];
            var ng2 = [];
            return {
                listeners: listeners,
                messages: messages,
                sendMessage: function (message, to, channel) {
                    messages.push({ message: message, to: to, channel: channel });
                    if (to === 'newguy1') {
                        if (listeners.nth(1)) {
                            ng1.foreach(function (message) {
                                listeners.nth(2).callback({ message: message });
                            });
                            ng1.removeWhere(function (x) { return true; });
                            listeners.nth(1).callback({ message: message });
                        }
                        else {
                            ng1.push(message);
                        }
                    }
                    else if (to === 'newguy2') {
                        if (listeners.nth(2)) {
                            ng2.foreach(function (message) {
                                listeners.nth(2).callback({ message: message });
                            });
                            ng2.removeWhere(function (x) { return true; });
                            listeners.nth(2).callback({ message: message });
                        }
                        else {
                            ng2.push(message);
                        }
                    }
                },
                channel: function (channel, callback) {
                    listeners.push({ channel: channel, callback: callback });
                }
            }
        };
    it('can set a signalProvider ', function (done) {
        MEPH.create('MEPH.service.rtc.Connection').then(function ($class) {
            var connection = new $class({
                id: 'id',
                partyId: 'newguy', signalProvider: createSignalProvider()
            });

            expect(connection.signalProvider).theTruth('the connection signalprovider was not set');
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });

    it('can listen on a channel for the signal provider', function (done) {
        MEPH.create('MEPH.service.rtc.Connection').then(function ($class) {
            var connection = new $class({ id: 'id', signalProvider: createSignalProvider() });

            expect(connection.signalProvider).theTruth('the connection signalprovider was not set');
            expect(connection.signalProvider.listeners.length === 1).theTruth('the signal provider was not listening.');
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });

    it('default constraints should be set', function (done) {
        MEPH.create('MEPH.service.rtc.Connection').then(function ($class) {
            var connection = new $class({ id: 'id', signalProvider: createSignalProvider() });

            expect(connection.constraints).toBeTruthy();
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });

    it('create peer connection', function (done) {
        MEPH.create('MEPH.service.rtc.Connection').then(function ($class) {
            var connection = new $class({
                id: 'id',
                partyId: 'newguy',
                dataConnectionId: 'dataid',
                signalProvider: createSignalProvider(),
                peerConnectionConfiguration: peerConnectionConfiguration,
                peerConnectionConstraints: peerConnectionConstraints
            });
            connection.createPeerConnection();
            expect(connection.peerConnection).toBeTruthy();
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });

    it('set datachannel to true ,if desired', function (done) {
        MEPH.create('MEPH.service.rtc.Connection').then(function ($class) {
            var connection = new $class({
                id: 'id',
                data: true,
                partyId: 'newguy',
                dataConnectionId: 'dataid',
                signalProvider: createSignalProvider(),
                peerConnectionConfiguration: peerConnectionConfiguration,
                peerConnectionConstraints: peerConnectionConstraints
            });
            connection.createPeerConnection();
            expect(connection.dataChannel).toBeTruthy();
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });

    it('can create an offer', function (done) {
        MEPH.create('MEPH.service.rtc.Connection').then(function ($class) {
            var connection = new $class({
                id: 'id',
                data: true,
                dataConnectionId: 'dataid',
                signalProvider: createSignalProvider(),
                peerConnectionConfiguration: peerConnectionConfiguration,
                peerConnectionConstraints: peerConnectionConstraints
            });
            connection.createPeerConnection();
            return connection.createOffer().then(function (options) {
                expect(options.connection).toBeTruthy();

                expect(options.description).toBeTruthy();
            });
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });
    it(' can set the prefered opus description on the local description', function (done) {

        //localDescription

        MEPH.create('MEPH.service.rtc.Connection').then(function ($class) {
            var connection = new $class({
                id: 'id',
                data: true,
                partyId: 'newguy',
                dataConnectionId: 'dataid',
                signalProvider: createSignalProvider(),
                peerConnectionConfiguration: peerConnectionConfiguration,
                peerConnectionConstraints: peerConnectionConstraints
            });
            connection.createPeerConnection();
            return connection.setOpusDescription({
                connection: connection.peerConnection,
                description: (localDescription)
            }).then(function (options) {
                expect(options.connection).toBeTruthy();
                expect(options.description).toBeTruthy();
            });
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });

    it(' will send a message through the channel, with the description, id, type', function (done) {
        MEPH.create('MEPH.service.rtc.Connection').then(function ($class) {
            var promise, signalprovider = createSignalProvider(),
                connection = new $class({
                    id: 'id',
                    to: 'to',
                    partyId: 'newguy',
                    data: true,
                    dataConnectionId: 'dataid',
                    signalProvider: signalprovider,
                    peerConnectionConfiguration: peerConnectionConfiguration,
                    peerConnectionConstraints: peerConnectionConstraints
                });
            connection.createPeerConnection();
            connection.connectionType = MEPH.service.rtc.Connection.Answering;
            promise = connection.sendLocalDescription(MEPH.service.rtc.Connection.Calling, {
                connection: connection.peerConnection,
                description: (localDescription)
            }).then(function (message) {
                expect(message.description).toBeTruthy();
                expect(message.type === MEPH.service.rtc.Connection.Answering).theTruth('Didnt receive an answer');
                expect(connection.promises.Answer === null).toBeTruthy();
                expect(message.connectionid = connection.id).toBeTruthy();
            });

            signalprovider.listeners.first().callback({
                to: 'newguy',
                message: {
                    description: true,
                    type: MEPH.service.rtc.Connection.Answering,
                    connectionType: MEPH.service.rtc.Connection.Answering,
                    connectionid: connection.id
                }
            });
            return promise;
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });

    it('if the signal provider isnt expecting an answer it will throw an error', function (done) {
        MEPH.create('MEPH.service.rtc.Connection').then(function ($class) {
            var error, signalprovider = createSignalProvider(),
                connection = new $class({
                    id: 'id',
                    partyId: 'newguy',
                    to: 'to',
                    data: true,
                    dataConnectionId: 'dataid',
                    signalProvider: signalprovider,
                    peerConnectionConfiguration: peerConnectionConfiguration,
                    peerConnectionConstraints: peerConnectionConstraints
                });
            connection.createPeerConnection();
            connection.connectionType = MEPH.service.rtc.Connection.Answering;
            try {
                signalprovider.listeners.first().callback({
                    to: 'newguy',
                    message: {
                        description: true,
                        connectionType: MEPH.service.rtc.Connection.Answering,
                        type: MEPH.service.rtc.Connection.Answering,
                        connectionid: connection.id
                    }
                });
            }
            catch (err) {
                error = err;
            }
            expect(error).toBeTruthy();
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });

    it(' when a connection received a call, it will answer', function (done) {
        MEPH.create('MEPH.service.rtc.Connection').then(function ($class) {
            var error, signalprovider = createSignalProvider(),
                connection = new $class({
                    id: 'id',
                    to: 'to',
                    data: true,
                    dataConnectionId: 'dataid',
                    signalProvider: signalprovider,
                    peerConnectionConfiguration: peerConnectionConfiguration,
                    peerConnectionConstraints: peerConnectionConstraints
                });
            return connection.receiveCall(localDescription).then(function () {
                expect(connection.peerConnection).toBeTruthy();
            });


        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });

    it(' can set the local description ', function (done) {
        MEPH.create('MEPH.service.rtc.Connection').then(function ($class) {
            var error, signalprovider = createSignalProvider(),
                connection = new $class({
                    id: 'id',
                    to: 'to',
                    data: true,
                    dataConnectionId: 'dataid',
                    signalProvider: signalprovider,
                    peerConnectionConfiguration: peerConnectionConfiguration,
                    peerConnectionConstraints: peerConnectionConstraints
                });
            connection.createPeerConnection();
            return connection.createOffer().then(connection.setLocalDescription).then(function () {
                expect(connection.peerConnection).toBeTruthy();
            });


        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            done();
        });
    });

    //it(' a static function to create a remote connection', function (done) {
    //    MEPH.create('MEPH.service.rtc.Connection').then(function ($class) {
    //        var defaultConnection = createDefaultConnection(), signalprovider,
    //            message;
    //        defaultConnection.createPeerConnection();
    //        return defaultConnection.createOffer()
    //            .then(defaultConnection.setLocalDescription)
    //            .then(function (options) {
    //                message = {
    //                    message: options.description,
    //                    connectionid: defaultConnection.id,
    //                    from: 'newguy1',
    //                    type: MEPH.service.rtc.Connection.Calling
    //                };

    //                return MEPH.service.rtc.Connection.ReceiveCall(message, {
    //                    signalProvider: defaultConnection.signalProvider,
    //                    partyId: 'newguy2',
    //                    peerConnectionConfiguration: peerConnectionConfiguration,
    //                    peerConnectionConstraints: peerConnectionConstraints
    //                }).then(function (connection) {
    //                    expect(connection).toBeTruthy();
    //                });
    //            });
    //    }).catch(function (error) {
    //        expect(error).caught();
    //    }).then(function () {
    //        done();
    //    });
    //});

    //it(' complete a call', function (done) {
    //    MEPH.create('MEPH.service.rtc.Connection').then(function ($class) {
    //        var defaultConnection = createDefaultConnection(), signalprovider,
    //            message;
    //        debugger
    //        defaultConnection.createPeerConnection();
    //        return Promise.resolve().then(function () {
    //            return defaultConnection.createOffer()
    //                    .then(defaultConnection.setLocalDescription)
    //        }).then(function (option) {
    //            debugger
    //            var promise = defaultConnection.sendLocalDescription(MEPH.service.rtc.Connection.Calling, option);
    //            message = defaultConnection.signalProvider.messages.first(function (x) { return x.message.from === 'newguy1'; });
    //            return Promise.all([promise.then(function () {
    //                debugger
    //            }), MEPH.service.rtc.Connection.ReceiveCall(message.message, {
    //                partyId: 'newguy2',
    //                signalProvider: defaultConnection.signalProvider,
    //                peerConnectionConfiguration: peerConnectionConfiguration,
    //                peerConnectionConstraints: peerConnectionConstraints
    //            }).then(function (connection) {
    //                debugger
    //                expect(connection).toBeTruthy();
    //            })]);
    //        });
    //    }).catch(function (error) {
    //        expect(error).caught();
    //    }).then(function () {
    //        done();
    //    });
    //});

});