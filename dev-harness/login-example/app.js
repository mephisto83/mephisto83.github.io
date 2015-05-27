var index = location.pathname.indexOf('dev-harness')
var rel = location.pathname.substr(0, index);
var path = rel + 'meph/src';
var buildpath = rel + 'meph';
var mobileexample = 'dev-harness/login-example/';
var MEPHControlsPath = rel + mobileexample + 'controlExamples';
var ProvidersPath = rel + mobileexample + 'providerExamples';
mephFrameWork('MEPH', path);
MEPH.ready().then(function () {
    MEPH.setPath(path, 'MEPH');
    MEPH.setPath(buildpath, 'MEPHBuild');
    MEPH.setPath(MEPHControlsPath, 'Login');
    MEPH.setPath(ProvidersPath, 'Providers');
    MEPH.setPath(rel + mobileexample + 'data', 'dataviews');
    MEPH.create('MEPH.mobile.Application').then(function () {
        var app = MEPH.App.mobileApplication({
            product: 'UNIT4',
            applicationName: 'Agresso Platform Mobile',
            applicationSelector: 'mephplatform',
            appPath: rel + mobileexample + '/MephApplication.html?',
            homeView: {
                viewId: 'MEPH002',
                'path': '/mobile/home'
            },
            ioc: {
                sessionManager: {
                    'static': true,
                    type: 'MEPH.session.SessionManager',
                    config: {
                        loginRequired: false
                    }
                },
                rest: {
                    'static': true,
                    type: 'MEPH.util.Rest',
                    config: {
                        base: 'api'
                    }
                },
                audioResources: {
                    'static': true,
                    type: 'MEPH.audio.AudioResources'
                },
                fileSaver: {
                    'static': true,
                    type: 'MEPH.file.FileSaver'
                },
                recorder: {
                    'static': true,
                    type: 'MEPH.audio.Recorder'
                },
                scheduler: {
                    'static': true,
                    type: 'MEPH.audio.Scheduler',
                    config: {
                        init: true
                    }
                },
                viewProvider: {
                    'static': true,
                    type: 'MEPH.mobile.providers.viewprovider.ViewProvider',
                    config: {
                        viewsResource: {
                            uri: 'Views.json',
                            path: 'dataviews',
                            preload: false
                        },
                        root: 'views'
                    }
                },
                menuProvider: {
                    type: 'MEPH.mobile.providers.menuprovider.MenuProvider',
                    config: {
                        viewsResource: {
                            uri: '/Menu.json',
                            path: 'dataviews',
                            preload: false
                        },
                        root: 'menu'
                    }
                },
                identityProvider: {
                    'static': true,
                    type: 'MEPH.identity.IdentityProvider',
                    config: {
                        providers: [{
                            type: 'MEPH.mobile.providers.identity.GoogleProvider',
                            args: {
                                authPath: 'provider/getcred',
                                clientId: '517106140753-3vmlkec7jhi5s0bmv89tkc8kho1u21e3.apps.googleusercontent.com',
                                clientsecret: 'Kf2BwHPkUh2SPnhoB9Rf9ZxS',
                                origin: '*',
                                apiKey: 'AIzaSyCadw9tvscBUS4g3PTGe7P1i8qNfpLpsZc',
                                redirect_uri: 'http://localhost:62334',
                                response_type: 'code',
                                scope: 'https://www.googleapis.com/auth/plus.login',
                                script: '<script src="https://apis.google.com/js/client:platform.js" async defer></script>'
                            }
                        }]
                    }
                },
                identityProviderService: {
                    'static': true,
                    type: 'Connection.service.IdentityProviderService',
                    config: {
                    }
                },
                applicationMenuProvider: {
                    'static': true,
                    type: 'MEPH.mobile.application.menu.ApplicationMenuProvider',
                    config: {
                        providers: ['activityMenuProvider']
                    }
                },
                activityMenuProvider: {
                    'static': true,
                    type: 'MEPH.mobile.application.menu.ActivityMenuProvider',
                    config: {
                    }
                },
                remotingController: {
                    'static': true,
                    type: 'MEPH.remoting.RemotingController',
                    config: {
                        autoRtc: true,
                        peerConnectionConstraints: {
                            'optional': [
                              { 'DtlsSrtpKeyAgreement': true },
                              { 'RtpDataChannels': true }
                            ]
                        },
                        peerConnectionConfiguration: {
                            'iceServers': [{ 'url': 'stun:stun.l.google.com:19302' }]
                        },
                    }
                },
                signalService: {
                    'static': true,
                    type: 'MEPH.service.SignalRService',
                    config: {
                    }
                }
            }
        }).ready().then(function (x) {

        }).catch(function (error) {
            MEPH.Log(error);
        });

    });
    MEPH.loadScripts(['/signalr/hubs']);

});
//webrtcDetectedBrowser === 'firefox' ? {
//    'iceServers': [{ 'url': 'stun:23.21.150.121' }]
//} : 