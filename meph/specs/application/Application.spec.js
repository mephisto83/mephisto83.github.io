﻿describe("MEPH/application/Application.spec.js", function () {

    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });

    it('application will load an application container', function (done) {
        //Arrange
        MEPH.define('MEPHTests.application.Application', {
            extend: 'MEPH.application.Application',
            applicationSelector: 'body'
        }).then(function ($class) {
            //Act
            var result = new $class(),
                dom;
            dom = result.getAppDom();
            //Assert
            expect(dom === document.body);
            MEPH.undefine('MEPHTests.application.Application');

        }).catch(function (err) {
            expect(err).caught();
        }).then(done);
    });

    it('an application will have a activitycontroller', function (done) {
        //Arrange
        MEPH.define('MEPHTests.application.Application', {
            extend: 'MEPH.application.Application',
            applicationSelector: 'body'
        }).then(function ($class) {
            //Act
            var result = new $class();

            //Assert
            expect(result.getActivityController()).theTruth('The application doesnt have an activity controller');
            MEPH.undefine('MEPHTests.application.Application');
        }).catch(function () {
            MEPH.undefine('MEPHTests.application.Application');
            expect(new Error('Couldnt get the activity controller')).caught();
        }).then(done);
    });

    it(' if an application has a homepage it will tell the activity controller to start it', function (done) {
        //Arrange
        MEPH.define('MEPHTests.application.Application', {
            extend: 'MEPH.application.Application',
            applicationSelector: 'body'
        }).then(function ($class) {
            //Act
            var result = new $class(),
                startedConfig;

            result.homeView = { viewId: 'MEPH001' };
            result.activityController = {
                startHome: function (config) { startedConfig = config; }
            }

            return result.startHomePage().then(function () {;
                //Assert
                expect(startedConfig).theTruth('The application didnt start anything.');
                MEPH.undefine('MEPHTests.application.Application');
            });
        }).catch(function () {
            MEPH.undefine('MEPHTests.application.Application');
            expect(new Error('Couldnt get the activity controller')).caught();
        }).then(done);;
    });

    it('applications can create controls', function (done) {
        var dom;
        MEPH.define('MEPHTests.application.Application', {
            extend: 'MEPH.application.Application',
            applicationSelector: '.testapplication'
        }).then(function ($class) {
            //Act
            var application = new $class();
            dom = document.createElement('div');
            dom.classList.add('testapplication');
            document.body.appendChild(dom);

            return application.create('MEPHTests.helper.input.InputHelper')

        }).then(function (results) {
            expect(results).theTruth('nothing was returned, where is the control information');
            if (dom && dom.parentNode) {
                dom.parentNode.removeChild(dom);
            }
            MEPH.undefine('MEPHTests.application.Application');
        }).catch(function () {
            expect(new Error('something went wrong')).caught();
            MEPH.undefine('MEPHTests.application.Application');
            if (dom && dom.parentNode) {
                dom.parentNode.removeChild(dom);
            }
        }).then(done);;
    });

    it('when a control is added to the application an event will be fired', function (done) {
        var dom;
        MEPH.define('MEPHTests.application.Application', {
            extend: 'MEPH.application.Application',
            requires: ['MEPH.control.Control'],
            applicationSelector: '.testapplication'
        }).then(function ($class) {
            //Act
            var application = new $class(),
                instanceadded;
            application.on('instanceadded', function (type, control) {
                instanceadded = control;
            });
            application.addInstance(new MEPH.control.Control());

            expect(instanceadded).theTruth('instance was not added to the application');
            expect(instanceadded instanceof MEPH.control.Control).theTruth('the instance object was not a Control');
            MEPH.undefine('MEPHTests.application.Application');
            if (dom && dom.parentNode) {
                dom.parentNode.removeChild(dom);
            }
        }).catch(function () {
            expect(new Error('something went wrong')).caught();
            MEPH.undefine('MEPHTests.application.Application');

        }).then(done);;
    });

    it('when applications start they will retrieve all the application view objects', function (done) {
        //Arrange
        var div = document.createElement('div');
        div.setAttribute('meph-app', '');
        var input = document.createElement('m_input');
        div.appendChild(input);
        document.body.appendChild(div);
        MEPH.define('MEPHTests.application.Application', {
            extend: 'MEPH.application.Application',
            requires: ['MEPH.input.Input'],
            applicationSelector: '[meph-app]'
        }).then(function ($class) {
            //Act
            var application = new $class();
            return application.start().then(function () {
                //Assert
                expect(application.getAppViewObjects().length === 1).toBeTruthy();
                div.parentNode.removeChild(div);

            });
        }).catch(function (err) {
            expect(err).caught();
        }).then(done);
    });
    it('applications will add ioc configs to the IOC.Container', function (done) {
        //Arrange
        var div = document.createElement('div'),
            called;
        div.setAttribute('meph-app', '');
        document.body.appendChild(div);
        MEPH.define('MEPHTests.application.Application', {
            extend: 'MEPH.application.Application',
            requires: ['MEPH.Constants'],
            applicationSelector: '[meph-app]'
        }).then(function ($class) {
            //Act
            var application = new $class({
                ioc: {
                    service: {
                        type: 'servicetype',
                        config: 'config'
                    }
                }
            });

            return application.start().then(function () {
                //Assert
                called = true;
                var service = MEPH.IOC.getServices().first(function (x) { return x.type === 'servicetype'; });
                expect(service.name).theTruth('The service was not in the IOC');
                MEPH.IOC.unregister('service');
                div.parentNode.removeChild(div);

            });
        }).catch(function (err) {
            expect(err).caught();
        }).then(done);
    });

    it('application if there is a session manager, it will check if it requires a login', function (done) {
        //Arrange
        var div = document.createElement('div'),
            called;
        div.setAttribute('meph-app', '');
        document.body.appendChild(div);
        MEPH.define('MEPHTests.application.TestSessionManager', {
            extend: 'MEPH.application.Application',
            requires: ['MEPH.Constants', 'MEPHTests.session.TestSessionManager'],
            applicationSelector: '[meph-app]'
        }).then(function ($class) {
            //Act

            var application = new $class({
                ioc: {
                    sessionManager: {
                        type: 'MEPHTests.session.TestSessionManager',
                        config: {
                            loginRequired: true,
                            automaticLogin: true
                        }
                    }
                }
            });

            return application.start().then(function () {
                //Assert
                expect(MEPHTests.session.TestSessionManager.loggedin).theTruth('the test session manager should have automatically logged in');
            });
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            MEPH.IOC.clearServices();
            MEPHTests.session.TestSessionManager.loggedin = false;
            MEPH.undefine('MEPHTests.application.TestSessionManager');
            done();
        });
    });

    it('when an application is ready it will fire and app ready event', function (done) {
        //Arrange
        var div = document.createElement('div'),
            called;
        div.setAttribute('meph-app2', '');
        var input = document.createElement('m_input');
        div.appendChild(input);
        document.body.appendChild(div);
        MEPH.define('MEPHTests.application.Application', {
            extend: 'MEPH.application.Application',
            requires: ['MEPH.input.Input', 'MEPH.Constants']
        }).then(function ($class) {
            //Act
            var application = new $class({

                applicationSelector: '[meph-app2]'
            });
            application.on(MEPH.Constants.applicationReady, function () {
                called = true;
            });
            return application.start().then(function () {
                //Assert
                return MEPH.continueWhen(function () {
                    return application.getAppViewObjects().length && called;
                })
                .then(function () {
                    try {
                        expect(application.getAppViewObjects().length === 1).toBeTruthy();
                        expect(called).toBeTruthy();
                    }
                    finally {
                        MEPH.undefine('MEPHTests.application.Application');
                        div.parentNode.removeChild(div);
                    }
                });
            });
        }).catch(function (err) {
            expect(err).caught();
        }).then(done);;
    });
});