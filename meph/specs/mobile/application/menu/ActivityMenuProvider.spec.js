describe("MEPH/mobile/application/menu/ActivityMenuProvider.spec.js", 'MEPH.mobile.activity.ActivityController', function () {

    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });

    it('can create an application menu.', function (done) {
        MEPH.create('MEPH.mobile.application.menu.ActivityMenuProvider').then(function ($class) {
            var menu = new $class();

            expect(menu).theTruth('the activity menu was not created.');

        }).catch(function (error) {
            expect(error).caught();
        }).then(function (x) {
            done();
        });
    });


    it('activity menu will return the name to display', function (done) {
        MEPH.create('MEPH.mobile.application.menu.ActivityMenuProvider').then(function ($class) {
            var menu = new $class();

            expect(menu.name === 'Activity').theTruth('the activity menu name was not correct.');

        }).catch(function (error) {
            expect(error).caught();
        }).then(function (x) {
            done();
        });
    });

    it('activity menu provider source is an array which is observable', function (done) {
        MEPH.requires('MEPH.util.Observable').then(function () {
            return MEPH.create('MEPH.mobile.application.menu.ActivityMenuProvider').then(function ($class) {
                var menu = new $class();

                expect(menu.source).toBeTruthy();
                expect(MEPH.util.Observable.isObservable(menu.source)).toBeTruthy();
            })
        }).catch(function (error) {
            expect(error).caught();
        }).then(function (x) {
            done();
        });
    });

    it('activity menu provider type is activity', function (done) {
        MEPH.create('MEPH.mobile.application.menu.ActivityMenuProvider').then(function ($class) {
            var menu = new $class();
            expect(menu.type === 'activity').toBeTruthy();
        }).catch(function (error) {
            expect(error).caught();
        }).then(function (x) {
            done();
        });
    });

    it('when an activity is started , the source is updated', function (done) {
        MEPH.create('MEPH.mobile.application.menu.ActivityMenuProvider').then(function ($class) {
            var c = new MEPH.mobile.activity.ActivityController();
            c.activities.push({
                activity: {
                    getPath: function () {
                        return 'asdf'
                    },
                    getActivityId: function () {
                        return 'asdf'
                    }
                }
            });
            var old = MEPH.ActivityController;
            MEPH.ActivityController = c;
            var menu = new $class(),
                changed;

            menu.controller = c;
            menu.source.on('changed', function () {
                changed = true;
            });
            MEPH.publish(MEPH.Constants.ActivityStarted, {});
            return new Promise(function (r) {
                setTimeout(function () {
                    expect(changed).toBeTruthy()
                    MEPH.ActivityController = old;
                    r();
                }, 100)
            })
        }).catch(function (error) {
            expect(error).caught();
        }).then(function (x) {
            done();
        });

    });

    it('items can be retrieved', function (done) {
        MEPH.create('MEPH.mobile.application.menu.ActivityMenuProvider').then(function ($class) {
            var menu = new $class(),
                changed;
            menu.source.on('changed', function () {
                changed = true;
            });
            MEPH.ActivityController.getActivities = function () {
                return [{
                    activity: {
                        getPath: function () { return 'asdfa'; },
                        getActivityId: function () { return 'asdf'; }
                    }
                }];
            };
            MEPH.publish(MEPH.Constants.ActivityStarted, {});
            expect(menu.getItems().length === 1).toBeTruthy();
            expect(changed).toBeTruthy()
        }).catch(function (error) {
            expect(error).caught();
        }).then(function (x) {
            done();
        });
    });


    it('an item is clicked , and it is handled.', function (done) {
        var oldga, oldsa;
        MEPH.create('MEPH.mobile.application.menu.ActivityMenuProvider').then(function ($class) {
            var menu = new $class(), data = {
                activity: {
                    getPath: function () { return 'asdfa'; },
                    getActivityId: function () { return 'asdf'; }
                }
            };
            changed;
            menu.source.on('changed', function () {
                changed = true;
            });
            oldga = MEPH.ActivityController.getActivities;
            oldsa = MEPH.ActivityController.startActivity;
            MEPH.ActivityController.getActivities = function () {
                return [data];
            };
            MEPH.ActivityController.startActivity = function () {
                return [data];
            };
            MEPH.publish(MEPH.Constants.ActivityStarted, {});
            return menu.itemClicked(data).then(function (r) {
                expect(r).toBeTruthy();
            });
        }).catch(function (error) {
            expect(error).caught();
        }).then(function (x) {
            MEPH.ActivityController.getActivities = oldga;
            MEPH.ActivityController.startActivity = oldsa;
            done();
        });
    });
});