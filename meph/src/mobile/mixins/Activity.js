/**
* @class MEPH.mobile.mixins.Activity
* A mixin for controls to register as Activities.
*/
MEPH.define('MEPH.mobile.mixins.Activity', {
    ParentAlreadySetMessage: 'Activity.js : Child already has a parent',
    isActivity: function () {
        return true;
    },
    getActivityId: function () {
        var me = this;
        me.$activityId = me.$activityId || MEPH.GUID();
        return me.$activityId;
    },
    setPath: function (path) {
        var me = this;
        me.$activityPath = path;
    },
    getPath: function () {
        var me = this;
        return me.$activityPath;
    },
    getActivityPath: function () {
        var me = this;
        return me.$activityPath;
    },
    afterShow: function () {
    },
    afterHide: function () {
    },
    /**
     * Adds an activity to the list of child dom activities.
     * @param {MEPH.mobile.mixins.Activity} activity
     **/
    addChildDomActivity: function (activity) {
        var me = this;
        me.activities = me.activities || [];
        activity.setDomParent(me);
        me.activities.push(activity);
    },
    /**
     * Sets the dom parent.
     * @param {Object} parent;
     */
    setDomParent: function (parent) {
        var me = this;
        if (me.domParent) {
            throw new Error(me.ParentAlreadySetMessage);
        }
        me.domParent = parent;

    },
    /**
     * Sets activity arguments
     * @param {Object} valuel
     **/
    setActivityArguments: function (value) {
        var me = this;
        me.activityArguments = value;
        if (me.fire) {
            me.fire('activity arguments set', { value: value });
        }
    },
    getPath: function () {
        var me = this, args;
        args = me.getActivityArguments();
        if (args) {
            return args.path || '';
        }
        return '';
    },
    /**
     * Gets the activity arguments.
     * @returns {Object}
     */
    getActivityArguments: function () {
        var me = this;
        return me.activityArguments || null;
    },
    getDomParent: function () {
        var me = this;
        return me.domParent || null;
    },
    /**
     * Gets the dom anscestors.
     * @return {Array}
     */
    getDomAnscestors: function () {
        var result = [],
            me = this,
            anscestor = me.getDomParent();
        do {
            if (anscestor) {
                result.push(anscestor);
                anscestor = anscestor.getDomParent();
            }

        }
        while (anscestor);
        return result;
    },
    /**
     * Gets child dom activities.
     * @returns {Array}
     **/
    getActivities: function () {
        var me = this;
        me.activities = me.activities || [];
        return me.activities;
    },
    /**
     * Returns true if the activity is a descendant.
     * @param {MEPH.mobile.mixins.Activity} activity
     * @returns {Boolean}
     */
    isDomChild: function (activity) {
        var me = this,
            foundActivity,
            activities = me.getActivities();
        foundActivity = activities.first(function (act) {
            return act === activity || me.isDomChild(activity);
        });

        return !!foundActivity;
    },
    /**
     * Starts the open process.
     * @param {Object} options
     * @param {Object} options.skipAnscestors
     * @returns {Promise}
     */
    initOpen: function (options) {
        var me = this,
            commonAnscestor, anscestorsToShow,
            anscestorsToOpenPromise = Promise.resolve(),
            activityToBeShownsAnscestors;
        anscestorsToShow = MEPH.Array(me.getDomAnscestors().reverse());

        if (!options || !options.skipAnscestors) {
            anscestorsToShow.foreach(function (anscestor) {
                anscestorsToOpenPromise = anscestorsToOpenPromise.then(function () {
                    return anscestor.initOpen({ skipAnscestors: true });
                });
            });
        }

        return Promise.resolve().then(anscestorsToOpenPromise).then(function () {

            if (me.show) {
                return me.open().then(function () {
                    return { success: true };
                })['catch'](function () {
                    return { success: false, error: new Error('There was a problem opening: Activity.js') };
                });
            }
            return Promise.resolve().then(function () {
                return { success: true };
            });
        });
    },
    /**
     * Starts the show process.
     * @param {Object} options
     * @param {Object} options.skipAnscestors
     * @returns {Promise}
     */
    initShow: function (options) {
        var me = this,
            commonAnscestor, anscestorsToShow,
            anscestorsToShowPromise = Promise.resolve(),
            activityToBeShownsAnscestors;
        anscestorsToShow = me.getDomAnscestors();
        if (!options || !options.skipAnscestors) {
            anscestorsToShow.foreach(function (anscestor) {
                anscestorsToShowPromise = anscestorsToShowPromise.then(function () {
                    return anscestor.initShow({ skipAnscestors: true });
                });
            });
        }
        return Promise.resolve().then(anscestorsToShowPromise).then(function () {

            if (me.show) {
                return me.show().then(function () {
                    return { success: true };
                })['catch'](function () {
                    return { success: false, error: new Error('There was a problem opening: Activity.js') };
                });
            }
            return Promise.resolve().then(function () {
                return { success: true };
            });
        });
    },
    /**
     * Gets the earliest common anscestors
     * @param {MEPH.mobile.mixins.Activity} activity
     **/
    getEarliestCommonAnscestor: function (activity) {
        var commonAnscestors, me = this,
            localAnscestors = MEPH.Array([me].concat(me.getDomAnscestors())),
            activityAnscestors = MEPH.Array([activity].concat(activity.getDomAnscestors()));

        commonAnscestors = activityAnscestors.where(function (x) {
            return localAnscestors.contains(function (y) { return y === x; });
        });

        return commonAnscestors.first();
    },
    /**
     * Gets the anscestors that lie between the me and the activity.
     * @param {MEPH.mobile.mixins.Activity} activity
     * @returns {Array}
     ***/
    getAnscestorsBetween: function (activity) {
        var me = this,
            results = [],
            commonAnscestor = activity.getEarliestCommonAnscestor(me);

        if (commonAnscestor) {
            var index = me.getDomAnscestors().indexOf(commonAnscestor);
            if (index !== -1) {
                results = me.getDomAnscestors().subset(0, index);
            }
        }

        return results;
    },
    /**
    * Starts the hide process.
    * @param {Object} options
    * @param {MEPH.mobile.mixins.Activity} options.activityToBeShown
    * @returns {Promise}
    */
    initHide: function (options) {
        var me = this, commonAnscestor, anscestorsToHide, anscestorsToHidePromise = Promise.resolve(),
            activityToBeShownsAnscestors;
        if (options && options.activityToBeShown && !options.skipAnscestors) {
            anscestorsToHide = me.getAnscestorsBetween(options.activityToBeShown);
            if (anscestorsToHide.length === 0) {
                anscestorsToHide = me.getDomAnscestors();
            }
            anscestorsToHide.foreach(function (anscestor) {
                anscestorsToHidePromise = anscestorsToHidePromise.then(function () {
                    return anscestor.initHide({ skipAnscestors: true });
                });
            });

        }
        return Promise.resolve().then(anscestorsToHidePromise).then(function () {

            if (me.hide) {
                if (options && options.activityToBeShown && options.activityToBeShown.getDomAnscestors().contains(function (x) { return x === me; })) {
                    return Promise.resolve().then(function () {
                        return {
                            success: true
                        }
                    });
                }
                else {
                    return me.hide().then(function () {
                        return { success: true };
                    })['catch'](function () {
                        return { success: false, error: new Error('There was a problem opening: Activity.js') };
                    });
                }
            }
            return Promise.resolve().then(function () {
                return { success: true };
            });
        });
    },

    activityLoaded: function () {
        var me = this, element;

        element = me.getDomTemplate().first(function (x) { return x.nodeType === MEPH.util.Dom.elementType; });
        element.dispatchEvent(MEPH.createEvent('activityload', { activity: me }));
        me.getDomTemplate().foreach(function (dom) {
            me.don('activityload', dom, function (evnt) {
                if (evnt.parentset) {
                    evnt.preventDefault();
                    return false;
                }
                me.addChildDomActivity(evnt.activity);
                evnt.parentset = true
                evnt.preventDefault();
                return false;
            }, me);
            me.don(MEPH.mobile.activity.view.ActivityView.CloseActivity, dom, function (evnt) {
                MEPH.publish(MEPH.Constants.closeView, { activity: me });
            }, me);
        });
    },
    /**
    * Starts the close process.
    * @returns {Promise}
    */
    initClose: function () {
        var me = this,
            promise = Promise.resolve(),
            activities = me.getActivities();

        activities.foreach(function (activity) {
            promise = promise.then(function () {
                return activity.initClose();
            });
        });

        return Promise.resolve().then(promise).then(function () {
            if (me.close) {
                return me.close().then(function (success) {
                    return { success: success };
                });
            }
            return Promise.resolve().then(function () {
                return { success: true };
            })['catch'](function () {
                return { success: false, error: new Error('There was a problem opening: Activity.js') };
            });
        });
    }
});