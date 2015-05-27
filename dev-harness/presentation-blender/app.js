var index = location.pathname.indexOf('dev-harness')
var rel = location.pathname.substr(0, index);
var path = rel + 'meph/src';
var buildpath = rel + 'meph';
var mobileexample = 'dev-harness/presentation-blender/';
var MEPHControlsPath = rel + mobileexample + 'controlExamples';
var ProvidersPath = rel + mobileexample + 'providerExamples';
var BlendPath = rel + mobileexample + 'blend'
mephFrameWork('MEPH', path);
MEPH.ready().then(function () {
    MEPH.setPath(path, 'MEPH');
    MEPH.setPath(buildpath, 'MEPHBuild');
    MEPH.setPath(MEPHControlsPath, 'MEPHControls');
    MEPH.setPath(ProvidersPath, 'Providers');
    MEPH.setPath(BlendPath, 'Blend');
    MEPH.setPath(rel + mobileexample + 'data', 'dataviews');
    MEPH.create('MEPH.mobile.Application').then(function () {
        var app = MEPH.App.mobileApplication({
            product: 'Presenation Blend',
            applicationName: 'Presenation Blend',
            applicationSelector: 'mephplatform',
            appPath: rel + mobileexample + '/MephApplication.html?',
            homeView: {
                viewId: 'BLEND001',
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
    //MEPH.loadScripts(['/signalr/hubs']);

});
//webrtcDetectedBrowser === 'firefox' ? {
//    'iceServers': [{ 'url': 'stun:23.21.150.121' }]
//} : 