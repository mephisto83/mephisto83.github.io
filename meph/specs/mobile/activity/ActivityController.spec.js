describe("MEPH/mobile/activity/ActivityController.spec.js", function () {
    var fakeActivityId = 'fakeActivity';
    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });

    var createActivityObject = function () {
        return {
            close: function () {
                this.opened = false;
                return Promise.resolve().then(function () { return true; });
            },
            hide: function () {
                this.state = 'hidden';
                this.hasHidden = true;
                return Promise.resolve().then(function () { return true; });
            },
            show: function () {
                this.state = 'showing';
                return Promise.resolve().then(function () { return true; });
            },
            open: function () {
                this.opened = true;
                return Promise.resolve().then(function () { return true; });
            }
        };
    }
    var createActivityObjectWithAppliedActivityMixin = function () {
        var activity = createActivityObject();
        MEPH.apply(MEPH.mobile.mixins.Activity.prototype, activity);
        return activity;
    }
    var createWindow = function () {
        var myWindow = window.open("", "MsgWindow", "width=200,height=100");
        myWindow.document.write("<p>This window's name is: " + myWindow.name + "</p>");
        return myWindow;
    }
    it('can create a activity controller.', function (done) {
        //Arrange
        MEPH.create('MEPH.mobile.activity.ActivityController').then(function ($class) {
            var activityController = new $class();

            expect(activityController).theTruth('The activity controller was not created.');

        }).catch(function (error) {
            expect(error).caught();
        }).then(function (x) {
            done();
        });
    });

    it(' an activity controller can have a activity container attached', function (done) {
        //Arrange
        MEPH.create('MEPH.mobile.activity.ActivityController').then(function ($class) {
            var activityController = new $class(),
           div = document.createElement('div');

            expect(activityController).theTruth('The activity controller was not created.');

            activityController.setActivityHolder(div);

            expect(activityController.getActivityHolder() === div).theTruth('the div was not found');

        }).catch(function (error) {
            expect(error).caught();
        }).then(function (x) {
            done();
        });
    });

    it(' can start activities ', function (done) {
        //Arrange
        MEPH.requires('MEPH.application.Application', 'MEPH.mobile.providers.viewprovider.ViewProvider', 'MEPH.mobile.activity.ActivityController',
                     'MEPH.mobile.services.MobileServices', 'MEPH.ioc.Container').then(function () {
                         return MEPH.IOC.register({
                             name: MEPH.mobile.activity.ActivityController.viewProvider,
                             type: 'MEPH.mobile.providers.viewprovider.ViewProvider',
                             config: {
                                 viewsResource: {
                                     uri: 'Views.json',
                                     path: 'dataviews',
                                     preload: false
                                 }
                             }
                         }).then(function () {
                             return MEPH.create('MEPH.mobile.activity.ActivityController').then(function ($class) {
                                 var application = new MEPH.application.Application(),
                                     div = document.createElement('div');

                                 var activityController = new $class();
                                 activityController.setApplication(application);
                                 activityController.setActivityHolder(div);
                                 expect(activityController).theTruth('The activity controller was not created.');

                                 return activityController.startActivity({
                                     viewId: fakeActivityId
                                 }).then(function (result) {

                                     expect(activityController.getCurrentActivity()).theTruth('the controller didnt have a current activity');
                                     expect(activityController.getCurrentActivity().getActivityArguments()).theTruth('the current activity didnt have any arguments');

                                     expect(result).theTruth('An activity is expected to be loaded');

                                 });

                             });
                         });
                     }).catch(function (error) {
                         expect(error).caught();
                     }).then(function (x) {
                         done();
                     });
    });

    it(' can start activities, and push to the state ', function (done) {
        //Arrange
        MEPH.requires('MEPH.application.Application', 'MEPH.mobile.providers.viewprovider.ViewProvider', 'MEPH.mobile.activity.ActivityController',
                     'MEPH.mobile.services.MobileServices', 'MEPH.ioc.Container').then(function () {
                         return MEPH.IOC.register({
                             name: MEPH.mobile.activity.ActivityController.viewProvider,
                             type: 'MEPH.mobile.providers.viewprovider.ViewProvider',
                             config: {
                                 viewsResource: {
                                     uri: 'Views.json',
                                     path: 'dataviews',
                                     preload: false
                                 }
                             }
                         }).then(function () {
                             return MEPH.create('MEPH.mobile.activity.ActivityController').then(function ($class) {
                                 var application = new MEPH.application.Application(), $window,
                                     div = document.createElement('div');

                                 var activityController = new $class();
                                 activityController.setApplication(application);
                                 activityController.setActivityHolder(div);
                                 expect(activityController).theTruth('The activity controller was not created.');

                                 $window = createWindow();
                                 Object.defineProperty(activityController, '$window', {
                                     enumerable: false,
                                     writeable: true,
                                     configurable: true,
                                     get: function () {
                                         return $window;
                                     }
                                 });

                                 return activityController.startActivity({
                                     viewId: fakeActivityId,
                                     path: 'path/is/right'
                                 }).then(function (result) {

                                     expect(activityController.getCurrentActivity()).theTruth('the controller didnt have a current activity');
                                     expect(activityController.getCurrentActivity().getActivityArguments()).theTruth('the current activity didnt have any arguments');
                                     expect($window.location.pathname.indexOf('path/is/right') !== -1).theTruth('the path was not as expected');
                                     expect(result).theTruth('An activity is expected to be loaded');
                                     $window.close()
                                 });

                             });
                         });
                     }).catch(function (error) {
                         expect(error).caught();
                     }).then(function (x) {
                         done();
                     });
    });

    it('on popstate event the activity will be show', function (done) {
        //Arrange
        MEPH.requires('MEPH.application.Application', 'MEPH.mobile.providers.viewprovider.ViewProvider', 'MEPH.mobile.activity.ActivityController',
                     'MEPH.mobile.services.MobileServices', 'MEPH.ioc.Container').then(function () {
                         return MEPH.IOC.register({
                             name: MEPH.mobile.activity.ActivityController.viewProvider,
                             type: 'MEPH.mobile.providers.viewprovider.ViewProvider',
                             config: {
                                 viewsResource: {
                                     uri: 'Views.json',
                                     path: 'dataviews',
                                     preload: false
                                 }
                             }
                         }).then(function () {
                             return MEPH.create('MEPH.mobile.activity.ActivityController').then(function ($class) {
                                 var application = new MEPH.application.Application(), $window,
                                     div = document.createElement('div');

                                 var activityController = new $class();
                                 activityController.setApplication(application);
                                 activityController.setActivityHolder(div);
                                 expect(activityController).theTruth('The activity controller was not created.');

                                 $window = createWindow();
                                 Object.defineProperty(activityController, '$window', {
                                     enumerable: false,
                                     writeable: true,
                                     configurable: true,
                                     get: function () {
                                         return $window;
                                     }
                                 });
                                 activityController.listenToStatePop();
                                 return activityController.startActivity({
                                     viewId: fakeActivityId,
                                     path: '/path/is/right'
                                 }).then(function () {
                                     return activityController.startActivity({
                                         viewId: fakeActivityId,
                                         path: '/path/is/next'
                                     });
                                 }).then(function (result) {
                                     $window.history.go(-1);
                                     return activityController.onPopState({
                                         state: {
                                             activityId: activityController.getActivities().first().activity.getActivityId()
                                         }
                                     }).then(function () {
                                         return activityController.getActivities().first().activity.getActivityId();
                                     });
                                 }).then(function (result) {
                                     expect(result === activityController.getCurrentActivity().getActivityId()).theTruth('The wrong activity is showing');
                                     $window.close()
                                 });

                             });
                         });
                     }).catch(function (error) {
                         expect(error).caught();
                     }).then(function (x) {
                         done();
                     });
    });

    it('can get activity instance by id', function (done) {
        //Arrange
        MEPH.requires('MEPH.mobile.mixins.Activity').then(function () {
            return MEPH.create('MEPH.mobile.activity.ActivityController').then(function ($class) {
                var activityController = new $class(),
               activities, ACTIVITY,
               activity = {};
                MEPH.apply(MEPH.mobile.mixins.Activity.prototype, activity);

                //Act
                activityController.addActivity(activity);

                //Assert
                ACTIVITY = activityController.getActivity(activity.getActivityId());
                expect(ACTIVITY === activity).theTruth('the activity was not found');

            }).catch(function (error) {
                expect(new Error('didnt get the activity instance by id.')).caught();

                if (error) {
                    expect(error).caught();
                }
            });
        }).catch(function (error) {
            expect(new Error('Didnt get the required files.')).caught();
        }).then(function (x) {
            done();
        });
    });

    it(' can start activities when a startEvent is published', function (done) {
        //Arrange
        MEPH.requires('MEPH.Constants', 'MEPH.application.Application', 'MEPH.mobile.providers.viewprovider.ViewProvider', 'MEPH.mobile.activity.ActivityController',
                     'MEPH.mobile.services.MobileServices', 'MEPH.ioc.Container').then(function () {
                         return MEPH.IOC.register({
                             name: MEPH.mobile.activity.ActivityController.viewProvider,
                             type: 'MEPH.mobile.providers.viewprovider.ViewProvider',
                             config: {
                                 viewsResource: {
                                     uri: 'Views.json',
                                     path: 'dataviews',
                                     preload: false
                                 }
                             }
                         }).then(function () {
                             MEPH.create('MEPH.mobile.activity.ActivityController').then(function ($class) {
                                 var application = new MEPH.application.Application(),
                                    div = document.createElement('div');

                                 var activityController = new $class();
                                 activityController.setApplication(application);
                                 activityController.setActivityHolder(div);
                                 expect(activityController).theTruth('The activity controller was not created.');
                                 MEPH.publish(MEPH.Constants.startView, { config: true });
                                 activityController.startActivity = function (type, options) {
                                     expect(options.config).theTruth('no options were found when an activity was published');
                                 }
                                 expect(result).theTruth('An activity is expected to be loaded');

                             });
                         });
                     }).catch(function (error) {
                         expect(error).caught();
                     }).then(function (x) {
                         done();
                     });
    });


    it(' the activitycontroller can pushstate on a window', function (done) {
        MEPH.create('MEPH.mobile.activity.ActivityController').then(function ($class) {
            var window, pageName = 'Page Name', currentLoction,
                pagePath = 'path/ap/atp',
                stateObject = { state: true },
               div = document.createElement('div');

            var activityController = new $class();

            expect(activityController).theTruth('The activity controller was not created.');

            window = createWindow();

            activityController.pushState(window, stateObject, pageName, pagePath);

            currentLoction = window.location
            expect(window.location.pathname.indexOf(pagePath) !== -1).theTruth('the path was not ');
            window.close();

        }).catch(function (error) {
            expect(error).caught();
        }).then(function (x) {
            done();
        });
    });

    it(' will get the path from the activity', function (done) {
        MEPH.create('MEPH.mobile.activity.ActivityController').then(function ($class) {
            var activityController,
                path;

            activityController = new $class();
            path = activityController.getPath({
                'viewId': 'fakeActivity',
                'view': 'MEPHTests.helper.activity.HelperActivity',
                'path': 'helperActivity/Somethingelse'
            });
            expect(activityController).theTruth('The activity controller was not created.');

            expect(path === 'helperActivity/Somethingelse').theTruth(' the path was not as expected');

        }).catch(function (error) {
            expect(error).caught();
        }).then(function (x) {
            done();
        });
    });

    it('if there is no path, then null is returned', function (done) {
        MEPH.create('MEPH.mobile.activity.ActivityController').then(function ($class) {
            var activityController,
                path;

            activityController = new $class();
            path = activityController.getPath({
                'viewId': 'fakeActivity',
                'view': 'MEPHTests.helper.activity.HelperActivity'
            });
            expect(activityController).theTruth('The activity controller was not created.');

            expect(path === null).theTruth(' the path was not as expected');

        }).catch(function (error) {
            expect(error).caught();
        }).then(function (x) {
            done();
        });
    });

    it('an activity controller can house activities', function (done) {
        //Arrange
        MEPH.requires('MEPH.mobile.mixins.Activity').then(function () {
            return MEPH.create('MEPH.mobile.activity.ActivityController').then(function ($class) {
                var activityController = new $class(),
               activities,
               activity = {};
                MEPH.apply(MEPH.mobile.mixins.Activity.prototype, activity);

                //Act
                activityController.addActivity(activity);

                //Assert
                activities = activityController.getActivities();
                expect(activities).theTruth('activities were not found');
                expect(activities.length === 1).theTruth('activities were not found');

            }).catch(function () {
                expect(new Error('activity controller class wasnt created.')).caught();
            });
        }).catch(function (error) {
            expect(new Error('Didnt get the required files.')).caught();
        }).then(function (x) {
            done();
        });
    });

    it('can add an activity as a child of an activity', function (done) {
        //Arrange
        MEPH.requires('MEPH.mobile.mixins.Activity').then(function () {
            return MEPH.create('MEPH.mobile.activity.ActivityController').then(function ($class) {
                var activityController = new $class(),
                activities,
                activity2 = {},
                activity = {};
                MEPH.apply(MEPH.mobile.mixins.Activity.prototype, activity);
                MEPH.apply(MEPH.mobile.mixins.Activity.prototype, activity2);
                activityController.addActivity(activity);

                //Act
                activityController.addActivity(activity2, activity);

                //Assert
                activities = activityController.getActivities();
                expect(activities).theTruth('activities were not found');
                expect(activities.length === 2).theTruth('activities were not found');

            }).catch(function () {
                expect(new Error('activity controller class wasnt created.')).caught();
            });
        }).catch(function (error) {
            expect(new Error('Didnt get the required files.')).caught();
        }).then(function (x) {
            done();
        });
    });

    it('when there is no activity, the activityController will show an activity', function (done) {
        //Arrange
        MEPH.requires('MEPH.mobile.mixins.Activity').then(function () {
            return MEPH.create('MEPH.mobile.activity.ActivityController').then(function ($class) {
                var activityController = new $class(),
               activities,
               currentActivity,
               activity = createActivityObject();
                MEPH.apply(MEPH.mobile.mixins.Activity.prototype, activity);
                activityController.addActivity(activity);

                //Act
                return activityController.showActivity(activity).then(function (result) {
                    expect(result.success).theTruth('the activity controller didnt show correctly');
                    currentActivity = activityController.getCurrentActivity();
                    expect(currentActivity === activity).theTruth('the activity was not the currentactivity.');
                });

            }).catch(function () {
                expect(new Error('activity controller class wasnt created.')).caught();
                done();
            });
        }).catch(function (error) {
            expect(new Error('Didnt get the required files.')).caught();
        }).then(function (x) {
            done();
        });
    });
    it('when there is an activity, the the activity contoller will show another , the first will close', function (done) {
        //Arrange
        MEPH.requires('MEPH.mobile.mixins.Activity').then(function () {
            return MEPH.create('MEPH.mobile.activity.ActivityController').then(function ($class) {
                var activityController = new $class(),
                activities,
                currentActivity,
                activity2 = createActivityObject(),
                activity = createActivityObject();
                MEPH.apply(MEPH.mobile.mixins.Activity.prototype, activity);
                MEPH.apply(MEPH.mobile.mixins.Activity.prototype, activity2);
                activityController.addActivity(activity);
                activityController.addActivity(activity2);

                //Act
                return activityController.showActivity(activity).then(function () {
                    return activityController.showActivity(activity2);
                }).then(function (result) {
                    expect(result.success).theTruth('the activity controller didnt show correctly');
                    currentActivity = activityController.getCurrentActivity();
                    expect(activity.state === 'hidden').theTruth('the activity state did not equal hidden');
                    expect(currentActivity === activity2).theTruth('the activity was not the currentactivity.');
                });

                //Assert

            }).catch(function () {
                expect(new Error('activity controller class wasnt created.')).caught();
            });
        }).catch(function (error) {
            expect(new Error('Didnt get the required files.')).caught();
        }).then(function (x) {
            done();
        });

    });

    it('can get the activities to show based off an activity', function (done) {
        //Arrange
        MEPH.requires('MEPH.mobile.mixins.Activity').then(function () {
            return MEPH.create('MEPH.mobile.activity.ActivityController').then(function ($class) {
                var activityController = new $class(),
                activities,
                list,
                currentActivity,
                activity2 = createActivityObject(),
                activity = createActivityObject();
                MEPH.apply(MEPH.mobile.mixins.Activity.prototype, activity);
                MEPH.apply(MEPH.mobile.mixins.Activity.prototype, activity2);
                activityController.addActivity(activity);
                activityController.addActivity(activity2, activity);
                activity.addChildDomActivity(activity2);
                //Act 
                list = activityController.getAncestorActivities(activity2);

                expect(list).theTruth('no list was created.');
                expect(list.first() === activity).theTruth('no list was created.');


                //Assert

            }).catch(function () {
                expect(new Error('activity controller class wasnt created.')).caught();
            });
        }).catch(function (error) {
            expect(new Error('Didnt get the required files.')).caught();
        }).then(function (x) {
            done();
        });
    });


    it('when showing an activity, all the parent activities will show, and the previously shown activity chain will hide', function (done) {
        var called;
        MEPH.requires('MEPH.mobile.mixins.Activity').then(function () {
            return MEPH.create('MEPH.mobile.activity.ActivityController').then(function ($class) {
                var activityController = new $class(),
                    object = createActivityObject(),
                    parent = createActivityObject(),
                    child2 = createActivityObject(),
                    child = createActivityObject();
                MEPH.apply(MEPH.mobile.mixins.Activity.prototype, object);
                MEPH.apply(MEPH.mobile.mixins.Activity.prototype, child);
                MEPH.apply(MEPH.mobile.mixins.Activity.prototype, child2);
                MEPH.apply(MEPH.mobile.mixins.Activity.prototype, parent);
                object.addChildDomActivity(child);
                parent.addChildDomActivity(child2);
                //Act
                return activityController.showActivity(child).then(function () {
                    return activityController.showActivity(child2);
                }).then(function (result) {
                    expect(result.success).theTruth('the activity controller didnt show correctly');
                    currentActivity = activityController.getCurrentActivity();
                    expect(parent.state === 'showing').theTruth('the parent state wasnt showing');
                    expect(object.state === 'hidden').theTruth('the object state wanst hidden');
                    expect(child2.state === 'showing').theTruth('the child2 state wanst showing');
                    expect(child.state === 'hidden').theTruth('the child2 state wanst showing');
                    expect(currentActivity === child2).theTruth('the activity was not the currentactivity.');
                });
            }).catch(function (error) {
                expect(new Error('Didnt get the required files.')).caught();
            }).then(function (x) {
                done();
            });
        });
    });

    it('when showing a child activity, and its sibling activity is open already, the parent will not hide', function (done) {
        var called;
        MEPH.requires('MEPH.mobile.mixins.Activity').then(function () {
            return MEPH.create('MEPH.mobile.activity.ActivityController').then(function ($class) {
                var activityController = new $class(),
                    object = createActivityObject(),
                    parent = createActivityObject(),
                    child2 = createActivityObject(),
                    child = createActivityObject();
                MEPH.apply(MEPH.mobile.mixins.Activity.prototype, object);
                MEPH.apply(MEPH.mobile.mixins.Activity.prototype, child);
                MEPH.apply(MEPH.mobile.mixins.Activity.prototype, child2);
                MEPH.apply(MEPH.mobile.mixins.Activity.prototype, parent);
                object.addChildDomActivity(child);
                parent.addChildDomActivity(child2);
                //Act
                return activityController.showActivity(child).then(function () {
                    return activityController.showActivity(child2);
                }).then(function (result) {

                    currentActivity = activityController.getCurrentActivity();
                    expect(parent.hasHidden === undefined).theTruth('the parent state was set to hidden,');
                });
            }).catch(function (error) {
                expect(new Error('Didnt get the required files.')).caught();
            }).then(function (x) {
                done();
            });
        });
    });

    it('opening an activity will open its parent activities also, from a dom perspective.', function (done) {
        //Arrange
        MEPH.requires('MEPH.mobile.mixins.Activity').then(function () {
            return MEPH.create('MEPH.mobile.activity.ActivityController').then(function ($class) {
                var activityController = new $class(),
               activity = createActivityObjectWithAppliedActivityMixin(),
               parent = createActivityObjectWithAppliedActivityMixin();

                activityController.addActivity(parent);
                activityController.addActivity(activity, parent);
                parent.addChildDomActivity(activity);

                //Act
                return activityController.openActivity(activity).then(function () {
                    //Assert
                    expect(activity.opened).theTruth('the activity was not opened');
                    expect(parent.opened).theTruth('the parent was not opened');
                });
            }).catch(function (error) {
                expect(new Error('Didnt get the required files.')).caught();
            }).then(function (x) {
                done();
            });
        });
    });

    it('closing an activity will close all of the child activities', function (done) {
        //Arrange
        MEPH.requires('MEPH.mobile.mixins.Activity').then(function () {
            return MEPH.create('MEPH.mobile.activity.ActivityController').then(function ($class) {
                var activityController = new $class(),
                activity = createActivityObjectWithAppliedActivityMixin(),
                parent = createActivityObjectWithAppliedActivityMixin();

                activityController.addActivity(parent);
                activityController.addActivity(activity, parent);
                parent.addChildDomActivity(activity);

                //Act
                return activityController.closeActivity(parent).then(function () {
                    //Assert
                    expect(activity.opened === false).theTruth('the activity was not closed');
                    expect(parent.opened === false).theTruth('the parent was not closed');
                });

            });
        }).catch(function (error) {
            expect(new Error('Didnt get the required files.')).caught();
        }).then(function (x) {
            done();
        });
    });

    it('hiding the parent activity will hide the child', function (done) {
        //Arrange
        MEPH.requires('MEPH.mobile.mixins.Activity').then(function () {
            return MEPH.create('MEPH.mobile.activity.ActivityController').then(function ($class) {
                var activityController = new $class(),
                activities,
                currentActivity,
                activity3 = createActivityObject(),
                activity2 = createActivityObject(),
                activity = createActivityObject();
                MEPH.apply(MEPH.mobile.mixins.Activity.prototype, activity);
                MEPH.apply(MEPH.mobile.mixins.Activity.prototype, activity2);
                MEPH.apply(MEPH.mobile.mixins.Activity.prototype, activity3);
                activityController.addActivity(activity);
                activityController.addActivity(activity2, activity);
                activity.addChildDomActivity(activity2);
                activityController.addActivity(activity3);

                //Act
                return activityController.showActivity(activity2).then(function () {
                    return activityController.showActivity(activity3);
                }).then(function (result) {
                    expect(result.success).theTruth('the activity controller didnt show correctly');
                    currentActivity = activityController.getCurrentActivity();
                    expect(activity2.state === 'hidden').theTruth('the activity state did not equal hidden');
                    expect(activity.state === 'hidden').theTruth('the activity state did not equal hidden');
                    expect(currentActivity === activity3).theTruth('the activity was not the currentactivity.');
                });

                //Assert

            }).catch(function () {
                expect(new Error('activity controller class wasnt created.')).caught();
            });
        }).catch(function (error) {
            expect(new Error('Didnt get the required files.')).caught();
        }).then(function (x) {
            done();
        });

    });

    it('activity controller listens on a signalr channel', function (done) {
        var called, old;
        MEPH.requires('MEPH.mobile.services.MobileServices').then(function () {
            return MEPH.define('Fake.Service', {
                start: function () {
                    return Promise.resolve();
                },

                channel: function () {
                    called = true;;
                }
            })
        }).then(function () {

            return MEPH.IOC.register({
                name: 'signalService',
                type: 'Fake.Service',
                config: {}
            });
        }).then(function () {
            return MEPH.create('MEPH.remoting.RemotingController').then(function ($class) {
                var activityController = new $class();

                return activityController.remoting(true).then(function () {
                    expect(called).toBeTruthy();
                });
            });
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            MEPH.undefine('Fake.Service');
            done();
        });
    });


    it('activity controller listens on a signalr channel, will only add once.', function (done) {
        var called = 0, old;
        MEPH.requires('MEPH.mobile.services.MobileServices').then(function () {
            return MEPH.define('Fake.Service', {

                start: function () {
                    return Promise.resolve();
                },
                channel: function (type) {
                    if (MEPH.Constants.ACTIVITY_CONTROLLER_CHANNEL === type) {
                        called++;
                    }
                }
            })
        }).then(function () {

            return MEPH.IOC.register({
                name: 'signalService',
                type: 'Fake.Service',
                start: function () {
                    return Promise.resolve();
                },
                channel: function () {
                },
                config: {}
            });
        }).then(function () {
            return MEPH.create('MEPH.remoting.RemotingController').then(function ($class) {
                var activityController = new $class();

                return activityController.remoting(true).then(function () {
                    activityController.remoting(true).then(function () {
                        expect(called === 1).toBeTruthy();
                    });
                });
            });
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            MEPH.undefine('Fake.Service');
            done();
        });
    });


    it('activity will execute, remote control request handler on remote control request.', function (done) {
        var called, channelcallback, old;
        MEPH.requires('MEPH.mobile.services.MobileServices').then(function () {
            return MEPH.define('Fake.Service', {
                start: function () {
                    return Promise.resolve();
                },
                channel: function (channelid, callback) {
                    if (MEPH.Constants.ACTIVITY_CONTROLLER_CHANNEL === channelid) {
                        channelcallback = callback;
                    }
                },
            })
        }).then(function () {

            return MEPH.IOC.register({
                name: 'signalService',
                type: 'Fake.Service',
                start: function () {
                    return Promise.resolve();
                },
                channel: function () {
                },
                config: {}
            });
        }).then(function () {
            return MEPH.create('MEPH.remoting.RemotingController').then(function ($class) {
                var activityController = new $class();
                activityController.remoteControlRequestHandler = function (request) {
                    called = true;
                };

                return activityController.remoting(true).then(function () {
                    channelcallback({
                        message: {
                            type: MEPH.Constants.RemoteControlRequest,
                            from: 'from',
                            fromName: 'Spike'
                        }
                    });
                    expect(called).toBeTruthy();
                });
            });
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            MEPH.undefine('Fake.Service');
            done();
        });
    });

    it('activity controller by default will open up whatever activity requested.', function (done) {
        var called, channelcallback, oldac;
        MEPH.requires('MEPH.mobile.services.MobileServices',
                        'MEPH.mobile.activity.ActivityController',
                        'MEPH.remoting.RemotingController').then(function () {
                            return MEPH.define('Fake.Service', {
                                start: function () {
                                    return Promise.resolve();
                                },
                                channel: function (channelid, callback) {
                                    if (MEPH.Constants.ACTIVITY_CONTROLLER_CHANNEL === channelid) {
                                        channelcallback = callback;
                                    }
                                },
                            })
                        }).then(function () {

                            return MEPH.IOC.register({
                                name: 'signalService',
                                start: function () {
                                    return Promise.resolve();
                                },
                                channel: function () {
                                },
                                type: 'Fake.Service',
                                config: {}
                            });
                        }).then(function () {
                            return MEPH.create('MEPH.remoting.RemotingController').then(function ($class) {
                                var activityController = new $class();
                                oldac = MEPH.ActivityController;
                                MEPH.ActivityController = {
                                    startActivity: function (request) {
                                        called = true;
                                    }
                                };
                                activityController.remotes.push({ remoteUser: 'from' });
                                return activityController.remoting(true).then(function () {

                                    channelcallback({
                                        message: {
                                            type: MEPH.Constants.RemoteControlRequest,
                                            viewId: 'viewid',
                                            from: 'from',
                                            fromName: 'Spike'
                                        }
                                    });
                                    expect(called).toBeTruthy();
                                });
                            });
                        }).catch(function (error) {
                            expect(error).caught();
                        }).then(function () {
                            MEPH.ActivityController = oldac;
                            MEPH.undefine('Fake.Service');
                            done();
                        });
    });


    it('activity controller will add users to ok like on request.', function (done) {
        var called, channelcallback;
        MEPH.requires('MEPH.mobile.services.MobileServices').then(function () {
            return MEPH.define('Fake.Service', {
                start: function () {
                    return Promise.resolve();
                },
                channel: function (channelid, callback) {
                    if (MEPH.Constants.ACTIVITY_CONTROLLER_CHANNEL === channelid) {
                        channelcallback = callback;
                    }
                }
            })
        }).then(function () {

            return MEPH.IOC.register({
                name: 'signalService',
                type: 'Fake.Service',
                start: function () {
                    return Promise.resolve();
                },
                channel: function () {
                },
                config: {}
            });
        }).then(function () {
            return MEPH.create('MEPH.remoting.RemotingController').then(function ($class) {
                var activityController = new $class();
                activityController.requestControlHandler = function (request) {
                    called = true;
                };
                return activityController.remoting(true).then(function () {
                    if (channelcallback) {
                        channelcallback({
                            message: {
                                type: MEPH.Constants.RequestControllAccess,
                                from: 'from',
                                fromName: 'Spike'
                            }
                        });
                    }
                    expect(called).toBeTruthy();
                });
            });
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            MEPH.undefine('Fake.Service');
            done();
        });
    });


    it('activity controller will add users to list when oked.', function (done) {
        var called, channelcallback;
        MEPH.requires('MEPH.mobile.services.MobileServices').then(function () {
            return MEPH.define('Fake.Service', {

                start: function () {
                    return Promise.resolve();
                },
                channel: function (channelid, callback) {
                    channelcallback = callback;
                }
            })
        }).then(function () {

            return MEPH.IOC.register({
                name: 'signalService',
                type: 'Fake.Service',
                config: {}
            });
        }).then(function () {
            return MEPH.create('MEPH.remoting.RemotingController').then(function ($class) {
                var activityController = new $class();
                activityController.getControlAcknowledgement = function (request) {
                    return Promise.resolve().then(function () { return true; });
                };
                return activityController.remoting(true).then(function () {
                    if (channelcallback) {
                        channelcallback({
                            message: {
                                type: MEPH.Constants.RequestControllAccess,
                                from: 'from',
                                fromName: 'Spike'
                            }
                        });
                    }
                });
            });
        }).catch(function (error) {
            expect(error).caught();
        }).then(function () {
            MEPH.undefine('Fake.Service');
            done();
        });
    });

});