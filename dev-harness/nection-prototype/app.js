var index = location.pathname.indexOf('dev-harness')
var rel = location.pathname.substr(0, index);
var path = rel + 'meph/src';
var mobileexample = 'dev-harness/nection-prototype/';
if (window.singleFileFunction) {

    window.singleFileFunction();
}
var MEPHControlsPath = rel + mobileexample + 'Connection';
mephFrameWork('MEPH', path);
MEPH.ready().then(function () {
    MEPH.setPath(path, 'MEPH');
    MEPH.setPath(MEPHControlsPath, 'Connection');
    //MEPH.setPath(ProvidersPath, 'Providers');
    MEPH.setPath(rel + mobileexample + 'data', 'dataviews');
    MEPH.create('Connection.application.Application').then(function () {
        var app = MEPH.App.mobileApplication({
            product: 'Connection',
            applicationName: 'Connection Mobile',
            applicationSelector: 'mephplatform',
            appPath: rel + mobileexample + '/index.html?',
            homeView: {
                openPath: true,
                viewId: 'main',
                'path': '/connection',
                stayOn: '/staypath'
            },
            ioc: {
                stateService: {
                    
                    'static': true,
                    type: 'Connection.service.StateService',
                    config: {}
                },
                sessionManager: {
                    'static': true,
                    type: 'Connection.session.SessionManager',
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
                deviceContactsProvider: {
                    'static': true,
                    type: 'MEPH.device.Contacts'
                },
                customProvider: {
                    'static': true,
                    type: 'Connection.provider.local.CustomProvider'
                },
                identityProvider: {
                    'static': true,
                    type: 'Connection.provider.IdentityProvider',
                    config: {
                        providers: [{
                            type: 'MEPH.mobile.providers.identity.FacebookProvider',
                            args: {
                                appId: '414352408719933',
                                loginbtn: '#facebooklogin'
                            }
                        },
                        {
                            type: 'MEPH.mobile.providers.identity.GoogleProvider',
                            args: {
                                authPath: 'localhost/api/provider/getcred',
                                clientId: '517106140753-3vmlkec7jhi5s0bmv89tkc8kho1u21e3.apps.googleusercontent.com',
                                clientsecret: 'Kf2BwHPkUh2SPnhoB9Rf9ZxS',
                                origin: '*',
                                apiKey: 'AIzaSyCadw9tvscBUS4g3PTGe7P1i8qNfpLpsZc',
                                redirect_uri: 'http://localhost',
                                response_type: 'code',
                                scope: 'https://www.googleapis.com/auth/plus.login'
                            }
                        },
                        //{
                        //    type: 'MEPH.mobile.providers.identity.GooglePlusProvider',
                        //    args: {
                        //        clientId: '517106140753-3vmlkec7jhi5s0bmv89tkc8kho1u21e3.apps.googleusercontent.com',
                        //        clientsecret: 'Kf2BwHPkUh2SPnhoB9Rf9ZxS',
                        //        script: '<script src="https://apis.google.com/js/client:platform.js" async defer></script>'
                        //    }
                        //},
                        {
                            type: 'MEPH.mobile.providers.identity.LinkedInProvider',
                            args: {
                                //Application Details
                                Company: 'Nection',

                                'Application Name': 'Nection',
                                'API Key': '78fhoxc30y05b7',
                                'Secret Key': 'IPKMnGBTbB8tNY41',
                                'OAuth User Token': 'd728c483-a2b5-4d74-afb9-cbeb6727673b',
                                'OAuth User Secret': '1deb0c26-26f5-48cd-ac16-52237d9542a6'
                            }
                        }
                        ]
                    }
                },
                notificationService: {
                    'static': true,
                    type: 'MEPH.notification.Service',
                    config: {}
                },
                overlayService: {
                    'static': true,
                    type: 'MEPH.overlay.Service',
                    config: {}
                },
                contactService: {
                    'static': true,
                    type: 'Connection.service.ContactService',
                    config: {}
                },
                relationshipService: {
                    'static': true,
                    type: 'Connection.service.RelationshipService',
                    config: {}
                },
                restStorage: {
                    'static': true,
                    type: 'MEPH.util.DefaultRestStorage',
                    config: {}
                },
                storage: {
                    'static': true,
                    type: 'MEPH.util.Storage',
                    config: {}
                },
                contactProvider: {
                    'static': true,
                    type: 'MEPH.identity.ContactProvider',
                    config: {
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
                    'static': true,
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
                        providers: ['connectionMenuProvider']
                    }
                },
                connectionMenuProvider: {
                    'static': true,
                    type: 'Connection.menu.ConnectionMenuProvider',
                    config: {
                    }
                },
                popup: {
                    'static': true,
                    type: 'MEPH.mobile.providers.popup.PopupProvider',
                    config: {

                    }
                },
                relationshipService: {
                    'static': true,
                    type: 'Connection.service.RelationshipService',
                    config: {

                    }
                },
                userService: {
                    'static': true,
                    type: 'Connection.service.UserService',
                    config: {

                    }
                },
                //remoteUserProvider: {
                //    'static': true,
                //    type: 'Providers.remoteUser.RemoteProvider',
                //    config: {
                //    }
                //},
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
                }
            }
        }).ready().then(function (x) {

        }).catch(function (error) {
            MEPH.Log(error);
        });

    });

});
//webrtcDetectedBrowser === 'firefox' ? {
//    'iceServers': [{ 'url': 'stun:23.21.150.121' }]
//} : 