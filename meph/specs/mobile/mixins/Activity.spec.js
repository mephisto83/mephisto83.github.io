describe("MEPH/mobile/mixins/Activity.spec.js", function () {
    var fakeActivityId = 'fakeActivity';
    var createActivityObject = function () {
        return {
            close: function () { return Promise.resolve().then(function () { return true; }); },
            hide: function () { return Promise.resolve().then(function () { return true; }); },
            show: function () { return Promise.resolve().then(function () { return true; }); },
            open: function () { return Promise.resolve().then(function () { return true; }); }
        };
    }
    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });

    it('an activity can be mixed into an object', function (done) {
        MEPH.requires('MEPH.mobile.mixins.Activity').then(function () {
            var object = createActivityObject();
            MEPH.apply(MEPH.mobile.mixins.Activity.prototype, object);
            expect(object.isActivity).theTruth('Activity mixin was not applied');
        }).catch(function (error) {
            if (error) {
                expect(error).caught();
            }
        }).then(function (x) {
            done();
        });
    });

    it('an activity can be show', function (done) {
        MEPH.requires('MEPH.mobile.mixins.Activity').then(function () {
            var object = createActivityObject();
            MEPH.apply(MEPH.mobile.mixins.Activity.prototype, object);
            return object.initShow().then(function (result) {
                expect(result.success).theTruth('the activity was not shown');
            });
        }).catch(function (error) {
            expect(error).caught();
        }).then(function (x) {
            done();
        });
    });

    it('an activity can hide ', function (done) {
        MEPH.requires('MEPH.mobile.mixins.Activity').then(function () {
            var object = createActivityObject();
            MEPH.apply(MEPH.mobile.mixins.Activity.prototype, object);
            return object.initHide().then(function (result) {
                expect(result.success).theTruth('the activity was not shown');
            });
        }).catch(function (error) {
            expect(error).caught();
        }).then(function (x) {
            done();
        });
    });

    it('an activity can close ', function (done) {
        MEPH.requires('MEPH.mobile.mixins.Activity').then(function () {
            var object = createActivityObject();
            MEPH.apply(MEPH.mobile.mixins.Activity.prototype, object);
            return object.initClose().then(function (result) {
                expect(result.success).theTruth('the activity was not shown');
            });
        }).catch(function (error) {
            expect(error).caught();
        }).then(function (x) {
            done();
        });
    });

    it('adding a child activity  sets its parent', function (done) {
        MEPH.requires('MEPH.mobile.mixins.Activity').then(function () {
            var object = createActivityObject(),
                child = createActivityObject();
            MEPH.apply(MEPH.mobile.mixins.Activity.prototype, object);
            MEPH.apply(MEPH.mobile.mixins.Activity.prototype, child);
            object.addChildDomActivity(child);
            expect(object.getActivities().first() === child).theTruth('the child  was not the one expected');
        }).catch(function (error) {
            expect(error).caught();
        }).then(function (x) {
            done();
        });
    });

    it('can set arguments', function (done) {
        MEPH.requires('MEPH.mobile.mixins.Activity').then(function () {
            var object = createActivityObject();
            MEPH.apply(MEPH.mobile.mixins.Activity.prototype, object);
            object.setActivityArguments({ args: true });
            MEPH.apply(MEPH.mobile.mixins.Activity.prototype, object);
            expect(object.getActivityArguments()).theTruth('the arguments are not set');
            expect(object).theTruth('The list of anscestors was not the corrrect length of 2 ');
        }).catch(function (error) {
            expect(error).caught();
        }).then(function (x) {
            done();
        });
    });

    it('an array of anscestors can be retrieved', function (done) {
        MEPH.requires('MEPH.mobile.mixins.Activity').then(function () {
            var object = createActivityObject(),
                caught, list,
                parent = createActivityObject(),
                child = createActivityObject();
            MEPH.apply(MEPH.mobile.mixins.Activity.prototype, object);
            MEPH.apply(MEPH.mobile.mixins.Activity.prototype, child);
            MEPH.apply(MEPH.mobile.mixins.Activity.prototype, parent);
            object.addChildDomActivity(child);
            parent.addChildDomActivity(object);
            list = child.getDomAnscestors();

            expect(list.length === 2).theTruth('The list of anscestors was not the corrrect length of 2 ');
            expect(list.first() === object).theTruth('the object was not the first anscestor');
            expect(list.nth(2) === parent).theTruth('the parent was not the second anscestor');
        }).catch(function (error) {
            expect(error).caught();
        }).then(function (x) {
            done();
        });
    });

    it('can get the ascenstors between the earliest common and itself', function (done) {
        MEPH.requires('MEPH.mobile.mixins.Activity').then(function () {
            var object = createActivityObject(),
                caught, list,
                parent = createActivityObject(),
                child = createActivityObject();
            MEPH.apply(MEPH.mobile.mixins.Activity.prototype, object);
            MEPH.apply(MEPH.mobile.mixins.Activity.prototype, child);
            MEPH.apply(MEPH.mobile.mixins.Activity.prototype, parent);
            object.addChildDomActivity(child);
            parent.addChildDomActivity(object);
            list = child.getAnscestorsBetween(parent);

            expect(list.length === 1).theTruth('The list of anscestors was not the corrrect length of 1 ');
            expect(list.first() === object).theTruth('the object was not the first anscestor');
            list = parent.getAnscestorsBetween(child);
            expect(list.length === 0).theTruth('The list of anscestors was not the corrrect length of 0 ');

        }).catch(function (error) {
            expect(error).caught();
        }).then(function (x) {
            done();
        });
    });


    it('can get the earliest common anscestor', function (done) {
        MEPH.requires('MEPH.mobile.mixins.Activity').then(function () {
            var object = createActivityObject(),
                caught,
                parent = createActivityObject(),
                child = createActivityObject();
            MEPH.apply(MEPH.mobile.mixins.Activity.prototype, object);
            MEPH.apply(MEPH.mobile.mixins.Activity.prototype, child);
            MEPH.apply(MEPH.mobile.mixins.Activity.prototype, parent);
            object.addChildDomActivity(child);
            parent.addChildDomActivity(object);

            expect(child.getEarliestCommonAnscestor(parent) === parent).theTruth('The wrong anscestor was found, not the parent');
            expect(parent.getEarliestCommonAnscestor(child) === parent).theTruth('The wrong anscestor was found, not the parent');
        }).catch(function (error) {
            expect(error).caught();
        }).then(function (x) {
            done();
        });
    });

    it('if there is no common anscestor it will return null.', function (done) {
        MEPH.requires('MEPH.mobile.mixins.Activity').then(function () {
            var object = createActivityObject(),
                caught,
                parent = createActivityObject(),
                child = createActivityObject(),
                child2 = createActivityObject();
            MEPH.apply(MEPH.mobile.mixins.Activity.prototype, object);
            MEPH.apply(MEPH.mobile.mixins.Activity.prototype, child);
            MEPH.apply(MEPH.mobile.mixins.Activity.prototype, parent);
            MEPH.apply(MEPH.mobile.mixins.Activity.prototype, child2);
            object.addChildDomActivity(child);
            parent.addChildDomActivity(child2);

            expect(child2.getEarliestCommonAnscestor(child) === null).theTruth('The wrong anscestor was found, not the null.');
            expect(child.getEarliestCommonAnscestor(child2) === null).theTruth('The wrong anscestor was found, not the null.');
        }).catch(function (error) {
            expect(error).caught();
        }).then(function (x) {
            done();
        });
    });


    it('a child activity can not be added if it to an activity, if it already has a parent', function (done) {
        MEPH.requires('MEPH.mobile.mixins.Activity').then(function () {
            var object = createActivityObject(),
                caught, errorcaught = false,
                parent = createActivityObject(),
                child = createActivityObject();
            MEPH.apply(MEPH.mobile.mixins.Activity.prototype, object);
            MEPH.apply(MEPH.mobile.mixins.Activity.prototype, child);
            MEPH.apply(MEPH.mobile.mixins.Activity.prototype, parent);
            object.addChildDomActivity(child);
            expect(object.getActivities().first() === child).theTruth('the child  was not the one expected');
            try {
                parent.addChildDomActivity(child);
            }
            catch (error) {
                errorcaught = true;
            }
            finally {
                expect(errorcaught).theTruth('no error was caught');
            }
        }).catch(function (error) {
            expect(error).caught();
        }).then(function (x) {
            done();
        });
    });
    it('an activity can open ', function (done) {
        MEPH.requires('MEPH.mobile.mixins.Activity').then(function () {
            var object = createActivityObject();
            MEPH.apply(MEPH.mobile.mixins.Activity.prototype, object);
            return object.initOpen().then(function (result) {
                expect(result.success).theTruth('the activity was not opened');
            });
        }).catch(function (error) {
            expect(error).caught();
        }).then(function (x) {
            done();
        });
    });

    it('an activity will say if if a child is a dom child ', function (done) {
        MEPH.requires('MEPH.mobile.mixins.Activity').then(function () {
            var object = createActivityObject(),
                result,
                parent = createActivityObject();
            MEPH.apply(MEPH.mobile.mixins.Activity.prototype, object);
            MEPH.apply(MEPH.mobile.mixins.Activity.prototype, parent);
            parent.addChildDomActivity(object);
            var result = parent.isDomChild(object)
            expect(result).theTruth('The object isnt a child.');
        }).catch(function (error) {
            expect(error).caught();
        }).then(function (x) {
            done();
        });;
    });

    it('an activity will have an activity id, guid', function (done) {
        MEPH.requires('MEPH.mobile.mixins.Activity').then(function () {
            var object = createActivityObject(),
                result,
                parent = createActivityObject();
            MEPH.apply(MEPH.mobile.mixins.Activity.prototype, object);
            result = object.getActivityId();
            expect(result).theTruth('The object isnt a child.');
        }).catch(function (error) {
            expect(error).caught();
        }).then(function (x) {
            done();
        });;
    });
});