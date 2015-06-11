/**
 * @class MEPH.control.Control
 * Defines a base class for all controls and views.
 **/
MEPH.define('MEPH.control.Control', {
    requires: ['MEPH.dom.ControlLoader',
                'MEPH.mixins.Referrerable',
                'MEPH.util.Dom',
                'MEPH.mixins.Injections',
                'MEPH.mobile.services.MobileServices',
                'MEPH.util.Observable',
                'MEPH.util.Style',
               'MEPH.mixins.Observable'],
    mixins: {
        observable: 'MEPH.mixins.Observable',
        referrerable: 'MEPH.mixins.Referrerable',
        injectable: 'MEPH.mixins.Injections'
    },
    statics: {
        operations: {
            inject: 'inject'
        },
        connectables: {
            control: 'control',
            view: 'view',
            presenter: 'presenter',
            viewmodel: 'viewmodel',
            model: 'model',
            controller: 'controller',
            html: 'html',
            self: 'self',
            object: 'object',
            subcontrol: 'subcontrol'
        }
    },
    properties: {
        $subscriptions: null,
        $listOfTransferableAttributes: null,
        $domTemplate: null,
        $controls: null,
        loaded: false,
        afterloaded: false,
        $referenceConnections: null,
        application: null,
        instanceTemplate: null,
        $uniqueId: null,
        injectControls: null,
        $window: null,
        $removeHomePageCls: 'meph-view-remove',
        applicationLoaded: false,
        $isDestroyed: false,
        data: null,
        componentCls: null,
        minimizable: false,
        $loadedPromise: null,
        $autoBindProperties: null,
        id: null
    },
    addWhen: function (whenitem) {
        var me = this;
        [whenitem].foreach(function (evt) {
            me.$when = me.$when || {};
            me.when = me.when || {};
            me.when[evt] = new Promise(function (r, s) {
                me.$when[evt] = r;
            });
        });
    },
    initialize: function () {
        var me = this;
        me.$controls = [];
        me.$autoBindProperties = [];
        me.$listOfTransferableAttributes = [];
        me.mixins.referrerable.init.apply(me);
        me.mixins.observable.init.apply(me);
        me.mixins.injectable.init.apply(me);
        me.$referenceConnections = MEPH.Array([{
            type: MEPH.control.Control.connectables.control, obj: me
        }]);
        me.$subscriptions = [];
        me.addWhen('loaded');
        me.addTransferableAttribute('MEPHId', {
            object: me,
            path: 'id'
        });

        me.on('setinstancetemplate', me.handleInstanceTemplate.bind(me));
        me.on('setdomtemplate', me.handleDomTemplate.bind(me));
        me.on('load', me.setLoadProperties.bind(me));
        me.on('afterload', me.setAfterLoadedProperties.bind(me));

        me.on('afterload', function () {
            me.$when.loaded();
        });

        me.on('load', me.initDataBinding.bind(me));
        me.on('load', me.applyTransferableAttribute.bind(me));
        me.on('load', me.onLoaded.bind(me));

        //if (me.injections) {
        //    me.$inj = {};
        //    Promise.all(me.injections.select(function (injection) {
        //        return MEPH.MobileServices.get(injection).then(function (provider) {
        //            me.$inj[injection] = provider;
        //        });
        //    })).then(function () {
        //        me.onInjectionsComplete();
        //    });
        //}
    },
    broadCast: function (arg1, arg2) {
        var me = this;

        MEPH.publish(arg1, arg2);
    },
    getTemplateEl: function (tep) {
        var form = MEPH.getTemplate(tep);
        var el = MEPH.util.Dom.createCenteredElement();
        el.innerHTML = form.template;
        return el;
    },

    /**
     * Gets the properties that will be automatically bound.
     * @returns {Array}
     **/
    getAutoBindProperties: function () {
        //[{ property: 'customAttr', path: 'p$. isValidatable.value', autoProperty: 'invalid' }];
        var me = this;
        return me.$autoBindProperties;
    },
    /**
     * Adds auto property to be bound on the existence of the property.
     * @param {string} property
     * @param {String} autoProperty
     * @param {String} append
     */
    addAutoBindProperty: function (property, autoProperty) {
        var me = this;
        me.getAutoBindProperties().push({
            property: property,
            autoProperty: autoProperty
        });
    },
    getAutoBindPropertyPath: function (path) {
        return path;
    },
    setLoadProperties: function () {
        var me = this;
        me.loaded = true;
    },
    setAfterLoadedProperties: function () {
        var me = this;
        me.afterloaded = true;
    },
    onLoaded: function () { },
    /**
     * Gets list of attributes thta will transfer
     **/
    getListOfTransferableAttributes: function () {
        var me = this;
        return me.$listOfTransferableAttributes;
    },
    /**
     * Adds attributes and configurations.
     * @param {String} attributeName
     * @param {Object} attributeOptions
     * @param {Object} attributeOptions.selector
     **/
    addTransferableAttribute: function (attributeName, attributeOptions) {
        var me = this;
        if (!me.getListOfTransferableAttributes().some(function (x) { return x.name === attributeName; })) {
            me.getListOfTransferableAttributes().push({ name: attributeName, options: attributeOptions });
        }
    },
    subscription: function (id) {
        var me = this;
        me.$subscriptions.push(id);
    },
    /**
     * @private
     * Transfers values to the dom template.
     **/
    applyTransferableAttribute: function () {
        var me = this, isShortCut,
            type;
        MEPH.Array(me.getInstanceTemplate().attributes).select(function (prop) { return prop.name; }).foreach(function (prop) {
            var prefix = MEPH.getDataBindPrefixes().first(function (x) {
                return prop.indexOf(x + MEPH.bindPrefixDelimiter) !== -1;
            });
            if (prefix) {
                prefix += MEPH.bindPrefixDelimiter;
                var path = prop.substring(prefix.length, prop.length);
                me.addTransferableAttribute(path, {
                    object: me,
                    path: path
                });
            }
        })
        me.getListOfTransferableAttributes().foreach(function (transferrableConfig) {
            var value = me.getInstanceTemplate().getAttribute(transferrableConfig.name);

            if (value === null || value === undefined) {
                value = MEPH.getDataBindPrefixes().selectFirst(function (x) {
                    return me.getInstanceTemplate().getAttribute(x + MEPH.bindPrefixDelimiter + transferrableConfig.name);
                });
            }

            if (value !== null) {
                me.getDomTemplate().filter(function (x) {
                    return x.nodeType === Dom.elementType;
                }).forEach(function (dom) {
                    var options = transferrableConfig.options;
                    if (options.selector) {
                        if (dom.parentNode) {
                            MEPH.Array(dom.parentNode.querySelectorAll(options.selector))
                                .where(function (otherdom) {
                                    return otherdom == dom;
                                }).forEach(function (subdom) {
                                    subdom.setAttribute(transferrableConfig.name, value)
                                });
                        }
                        MEPH.Array(dom.querySelectorAll(options.selector)).foreach(function (subdom) {
                            subdom.setAttribute(transferrableConfig.name, value)
                        });
                    }
                    else if (options.object && options.path) {
                        isShortCut = false;
                        if (value) {
                            type = value.split(MEPH.pathDelimiter).first();

                            if (MEPH.getBindPrefixShortCut(type)) {
                                isShortCut = true
                            }
                        }
                        if (!isShortCut) {
                            MEPH.setPathValue(options.object, options.path, value);
                        }
                    }
                });
            }
        });
    },
    /**
     * Sets the unique id.
     * @param {String} id
     **/
    setUniqueId: function (id) {
        var me = this;
        me.$uniqueId = id;
    },
    /**
     * Gets the unique id.
     * @returns {String}
     */
    getUniqueId: function () {
        var me = this;
        return me.$uniqueId;
    },
    /**
     * Adds a sub control to the internal list of controls.
     * @param {MEPH.control.Control} subcontrol
     **/
    addSubControl: function (subcontrol) {
        var me = this;
        me.$controls.push(subcontrol);
    },
    /**
     * Gets the sub cnotrols.
     * @returns {Array}
     **/
    getSubControls: function () {
        var me = this;
        return me.$controls;
    },
    initDataBinding: function () {
        var me = this;
        me.getReferenceConnections()
            .filter(function (x) { return x.creator; })
            .forEach(function (x) {
                if (x.obj[MEPH.isObservablePropertyKey]) {
                    x.obj.fire('altered', { path: '', references: [] });
                }
            });
    },
    initComponent: function () {
    },
    /**
     * Handles the instance template.
     * @returns {Promise}
     **/
    handleInstanceTemplate: function () {
        var promise = Promise.resolve();
        return promise;
    },
    filterEvents: function (template) {
        var srcelement = MEPH.Array(arguments).last().domEvent.srcElement;
        return !!MEPH.util.Dom.isDomDescendant(srcelement, template);
    },
    cancelEvent: function () {
        var evntArgs = MEPH.util.Array.convert(arguments).last();
        evntArgs.domEvent.preventDefault();
        evntArgs.domEvent.cancelBubble = true;
        evntArgs.domEvent.stopPropagation();
        evntArgs.domEvent.cancelled = true;
        return false;
    },
    toPx: function (x) {
        return (x || 0) + 'px';
    },
    handleDomTemplate: function () {
        var me = this,
            nodes, out = {},
            template;

        if (me.injectControls) {
            template = me.getInstanceTemplate();
            if (template) {
                nodes = MEPH.Array(MEPH.Array(template.childNodes).select(function (x) { return x; }).reverse()).foreach(function (x) {
                    var comment = me.getLocationForInjection(me.injectControls, x, out);
                    if (out.childrenOnly) {
                        MEPH.Array(MEPH.Array(x.childNodes).select(function (x) { return x; }).reverse()).foreach(function (child) {
                            Dom.insertBefore(comment, child);
                        });
                    }
                    else {
                        Dom.insertBefore(comment, x);
                    }
                });
            }
        }
    },
    /**
     * @private
     */
    setControlObject: function (controlobject) {
        var me = this;
        me.$controlobject = controlobject;
    },
    /**
     * @private
     */
    getControlObject: function () {
        var me = this;
        return me.$controlobject;
    },
    /**
     * @param {MEPH.control.Control} control
     * @param {Object} dom
     **/
    loadSubControl: function (control, dom) {
        var me = this;
        return me.application.loadSubControls([control.getControlObject()])
    },
    onClickOutSideOf: function (dom, callback) {
        var me = this;
        me.onOutsideOf(['click', 'touchend'], dom, callback);
        //if (callback) {
        //    dom = Array.isArray(dom) ? dom : [dom];
        //    var me = this, Dom = MEPH.util.Dom;
        //    me.don(['click', 'touchend'], me.$window.document.body, function (type, evnt) {
        //        var source = Dom.getEventSource(evnt),
        //            anscestor,
        //            domTemplate = dom;
        //        if (domTemplate) {
        //            anscestor = domTemplate.first(function (x) {
        //                return MEPH.util.Dom.isDomDescendant(source, x) || !MEPH.util.Dom.isDomDescendant(source, me.$window.document.body)
        //            });
        //        }
        //        if (!anscestor) {
        //            callback();
        //        }
        //    }.bind(me, 'click'));
        //}
    },
    onInsideOf: function (events, dom, callback) {
        var me = this;
        me.onOutsideOf(events, dom, callback, true);
    },
    onOutsideOf: function (events, dom, callback, negate) {
        if (events && callback) {
            events = Array.isArray(events) ? events : [events];
            dom = Array.isArray(dom) ? dom : [dom];
            var me = this, Dom = MEPH.util.Dom;
            me.don(events, me.$window.document.body, function (type, evnt) {
                var source = Dom.getEventSource(evnt),
                    anscestor,
                    domTemplate = dom;
                if (domTemplate) {
                    anscestor = domTemplate.first(function (x) {
                        return MEPH.util.Dom.isDomDescendant(source, x) || !MEPH.util.Dom.isDomDescendant(source, me.$window.document.body)
                    });
                }
                if (!anscestor || (negate && anscestor)) {
                    callback();
                }
            }.bind(me, 'click'));
        }
    },
    /**
     * Executes the view transitions.
     * @param {Object} view 
     * @param {Object} options
     * @param {String} options.remove
     * @param {String} options.add
     * @returns {Promise}
     **/
    viewTransition: function (view, options) {
        var me = this;
        return new Promise(function (resolve, fail) {
            var timoutRef,
                animationComplete = function () {
                    if (timoutRef === null) {
                        return;
                    }
                    clearTimeout(timoutRef);
                    timoutRef = null;
                    me.dun(me, 'webkitTransitionEnd');
                    me.dun(me, 'transitionend');
                    resolve();
                };
            me.don('webkitTransitionEnd', view, animationComplete);
            me.don('transitionend', view, animationComplete);
            if (options.maxTime || MEPH.MaxTransitionTime) {
                timoutRef = setTimeout(animationComplete, options.maxTime || MEPH.MaxTransitionTime);
            }
            if (options.remove) {
                MEPH.Array(options.remove.split(' ')).foreach(function (remove) {
                    view.classList.remove(remove);
                });
            }
            if (options.add) {
                var toadd = options.add.split(' ').where().select();
                if (toadd.length)
                    view.classList.add.apply(view.classList, toadd);
            }
        });
    },
    /**
     * Gets teh location for injecfion of the node.
     * @param {Object} injectionInstructions
     * @param {Object} injectionInstructions.location
     * @returns {Object} 
     **/
    getLocationForInjection: function (injectionInstructions, node, out) {
        var me = this,
            name = node.nodeName.toLowerCase(),
            commentName,
            template;

        if (injectionInstructions.location && typeof injectionInstructions.location === 'string') {
            template = me.getDomTemplate();
            comment = me.getCommentByName(template, injectionInstructions.location);
            return comment;
        }
        else if (injectionInstructions.location && typeof injectionInstructions.location === 'object') {
            template = me.getDomTemplate();
            commentName = injectionInstructions.location[name];
            comment = me.getCommentByName(template, commentName);
            if (out) {
                out.childrenOnly = true;
            }
            return comment
        }
        return null;
    },
    /**
     * Sets the dom template instance.
     * @param {Object} dom
     **/
    setDomTemplate: function (dom) {
        var me = this;
        me.$domTemplate = MEPH.Array(dom);
    },
    getDomEventArg: function (args) {
        return MEPH.util.Array.create(args).last().domEvent.data;
    },
    /**
     * Gets the dom template for the instance.
     **/
    getDomTemplate: function () {
        var me = this;
        return me.$domTemplate || [];
    },
    getFirstElement: function () {
        var me = this;
        return me.getDomTemplate().first(function (x) { return x.nodeType === Dom.elementType; });
    },
    toNumber: function (x) {
        if (x)
            return parseFloat(x);
        return x;
    },
    /**
     * Gets the dom elements which meet the selector specification.
     * @param {String} selector
     * @returns {Array}
     **/
    querySelectorAll: function (selector) {
        var me = this;
        return (me.getDomTemplate()).select(function (x) {
            var result = [],
                dom = x;

            if (dom.parentNode) {
                MEPH.Array(dom.parentNode.querySelectorAll(selector)).filter(function (otherdom) {
                    return otherdom === dom;
                }).forEach(function (subdom) {
                    if (subdom) {
                        result.push(subdom);
                    }
                });
            }
            if (x.nodeType === Dom.elementType) {
                MEPH.Array((x.querySelectorAll(selector))).forEach(function (x) {
                    if (x) {
                        result.push(x);
                    }
                });

            }
            return result;
        }).concatFluentReverse(function (x) { return x; });
    },
    hide: function () {
        var me = this;
        me.getDomTemplate().foreach(function (t) {
            if (t) {
                Style.hide(t);
            }
        });
        return Promise.resolve();
    },
    show: function () {
        var me = this;
        me.getDomTemplate().foreach(function (t) {
            if (t) {
                Style.show(t);
            }
        });
        return Promise.resolve();
    },
    /**
     * Gets the dom element which meet the selector specification.
     * @param {String} selector
     * @returns {Object}
     **/
    querySelector: function (selector) {
        var me = this;
        return (me.getDomTemplate() || []).selectFirst(function (x) {
            var temp,
                dom = x;

            if (x.nodeType === Dom.elementType) {
                temp = x.querySelector(selector);
                if (temp) {
                    return temp;
                }
            }
            if (dom.parentNode) {
                return MEPH.Array(dom.parentNode.querySelectorAll(selector)).first(function (otherdom) {
                    return otherdom === dom;
                })
            }
            return null;
        });
    },
    /**
     * Renders a control.
     * @param {String} classifiedName
     * @param {Object} dom
     * @param {MEPH.control.Control} parent
     * @param {Object} attributes
     * @returns {Promise}
     **/
    renderControl: function (classifiedName, dom, parent, attributes, injections) {
        var me = this, template,
            application;

        application = me.getApplication();
        if (application) {
            template = MEPH.createTemplateNode(classifiedName);
            if (template && template.node && attributes) {
                for (var i in attributes) {
                    template.node.setAttribute(i, attributes[i]);
                }
            }
            template.injections = injections || null;
            return application.loadViewObject([template], dom, parent);
        }

        return Promise.resolve().then(function () {
            throw new Error('application is not present');
        });
    },
    /**
     * Returns true if the control has been destroyed.
     **/
    isDestroyed: function () {
        var me = this;
        return me.$isDestroyed;
    },
    /**
     * Destroys the control.
     */
    destroy: function () {
        var me = this, i,
               domTemplaate = me.getDomTemplate();
        if (me.$isDestroyed) {
            return;
        }
        me.fire('beforedestroy', me);
        if (!Array.isArray(domTemplaate)) {
            domTemplaate = ([domTemplaate]);
        }
        MEPH.Array(domTemplaate);
        me.$controls.removeWhere(function (control) {
            control.destroy();
            return true;
        });
        me.$isDestroyed = true;
        domTemplaate.foreach(function (x) {
            if (x && x.parentNode && x.parentNode.removeChild) {
                x.parentNode.removeChild(x);
            }
        });
        me.fire('destroy', me);
        for (i in me) {
            if (MEPH.IsEventable(me[i])) {
                me[i].un(null, me);
            }
        }
        me.$referenceConnections.foreach(function (x) {
            if (MEPH.IsEventable(x)) {
                x.obj.un(null, me);
                x.obj.dun(null, me);
            }
        });

        MEPH.unsubscribe(me.$subscriptions);

        me.un();
        me.dun();
    },

    /**
     * Combines the clsProperties into the new property.
     * @param {String} property
     * @param {Array} clsProperties
     */
    combineClsIntoDepenendProperty: function (property, clsProperties) {
        var me = this;
        MEPH.util.Observable.defineDependentProperty(property, me, clsProperties, function (clsProperties) {
            var result = [];
            MEPH.Array(clsProperties).foreach(function (prop) {
                if (me[prop]) {
                    result.push(me[prop]);
                }
            })
            return result.join(' ');
        }.bind(me, clsProperties));
    },

    getApplication: function () {
        var me = this;
        return me.application;
    },
    /**
     * @private
     * Sets the application of the control
     * @param {MEPH.application.Application} application
     **/
    setApplication: function (application) {
        var me = this;
        me.application = application;
        me.application.on(MEPH.Constants.applicationReady, function () {
            me.applicationLoaded = true;
        });
        //me.fire('altered', { path: 'application', references: [me] });
    },


    /**
     * Gets the template associated with this control.
     **/
    getTemplates: function () {
        var me = this;
        return MEPH.Array(me.templates);
    },
    /**
     * Creates a new instance of the templates array.
     **/
    uniqueTemplates: function () {
        var me = this;
        me.templates = me.templates.select();
    },
    /**
     * Adds a template to the list.
     **/
    addTemplate: function (classifiedName) {
        var me = this;
        me.templates.push(classifiedName);
    },
    getBindableProperties: function () {

    },
    toggleBoolean: function (data, prop) {
        var me = this;
        data[prop] = !!!data[prop];
    },

    /**
     * Generates a dom object from the templates.
     */
    generateDomTemplate: function () {
        var me = this,
            instructions,
            dom;
        //return Promise.resolve().then(function () {
        instructionGroups = me.getOrdereredConstructionInstructions();
        instructionGroups.foreach(function (instructionGroup) {
            if (me.hasInstructions(instructionGroup)) {
                //apply instructions to dom
                MEPH.util.Array.create(instructionGroup.instructions).foreach(function (instruction) {
                    me.applyInstructionGroup(dom, instruction);
                });
            }
            else {
                //set dom to template./
                //Base templates/classes shouldnt have instructions.
                //At least not right now.
                dom = MEPH.dom.ControlLoader.getUnattachedDiv();
                MEPH.util.Array.create(instructionGroup.nodes).foreach(function (node) {
                    dom.appendChild(node);
                });
            }
        });
        return dom;
        //  });
    },
    /**
     * Gets generated template dom.
     * @returns {Promise}
     **/
    getGeneratedTemplateDom: function () {
        //var me = this;
        //return me.generateDomTemplate().then(function (dom) {
        //    return Promise.resolve().then(function () {
        //        return me.getTemplateDom(dom);
        //    });
        //});
        var dom,
            me = this;
        dom = me.generateDomTemplate();
        //.then(function (dom) {
        //    return Promise.resolve().then(function () {
        return me.getTemplateDom(dom);
        //    });
        //});
    },
    /**
     * Generates an attached div.
     * @returns {Object}
     */
    getUnattachedDiv: function () {
        return document.createElement('div');
    },
    /**
     * Gets the dom nodes of the template.
     * @param {Object} templateInfo
     * @param {String} templateInfo.template
     **/
    getTemplateDom: function (domtemplate) {
        var me = this,
    div, nodes;

        div = me.getUnattachedDiv()
        div.appendChild(domtemplate);
        nodes = MEPH.util.Array.convert(domtemplate.childNodes);

        return nodes;
    },
    /**
     * Gets the dom objects to bind.
     */
    getDomObjectsToBind: function (domTemplate) {
        var me = this,
            promise,
            aliases = MEPH.getAllAliases(),
            dataBindPrefixes = MEPH.getDataBindPrefixes();
        promise = Promise.resolve().then(function () {
            return dataBindPrefixes.concatFluentReverse(function (x) {
                return MEPH.util.Array.convert(domTemplate.querySelectorAll('[' + x + ']'));
            }).unique(function (x) {
                return x;
            });
        });
        return promise;
    },
    /**
     * Sets the instance template.
     * @param {Array} nodes;
     **/
    setInstanceTemplate: function (nodes) {
        var me = this;
        me.instanceTemplate = nodes;
    },
    getInstanceTemplate: function () {
        var me = this;
        return me.instanceTemplate || null;
    },
    /**
     * Apply instructions to dom object.
     * @param {Object} dom
     * @param {Object} instructionGroup
     **/
    applyInstructionGroup: function (dom, instruction) {
        var me = this,
            instructionGroup = instruction.startGroupComment
        control = MEPH.control.Control;
        switch (instructionGroup.operation) {
            case control.operations.inject:
                return me.injectDom(dom, instruction.startGroupComment, instruction.domObjects);
            default:
                return false;
        }
    },
    /**
     * Inject dom objects into the dom.
     * @param {Object} dom
     * @param {Object} instructionGroup
     * @param {Array} domObjects
     **/
    injectDom: function (dom, instructionGroup, domObjects) {
        var me = this, Dom = MEPH.util.Dom,
            parsedComment,
            comments;

        MEPH.Array(domObjects);
        //comments = MEPH.util.Array.convert(Dom.getComments(dom));
        //comment = comments.first(function (comment) {
        //    var parsedComment = Dom.tryParse(comment);
        //    if (parsedComment && parsedComment.name === instructionGroup.position) {
        //        return comment;
        //    }
        //    return false;
        //});
        comment = me.getCommentByName(dom, instructionGroup.position);
        if (comment) {
            parsedComment = Dom.tryParse(comment);
            domObjects.foreach(function (domObject) {
                if (instructionGroup.before) {
                    Dom.insertBefore(comment, domObject);
                }
                else {
                    Dom.insertAfter(comment, domObject);
                }
            });
            return true;
        }
        return false;
    },
    getCommentByName: function (dom, name) {
        var me = this, Dom = MEPH.util.Dom,
           parsedComment,
           comments;

        comments = MEPH.util.Array.convert(Dom.getComments(dom));
        comment = comments.first(function (comment) {
            var parsedComment = Dom.tryParse(comment);
            if (parsedComment && parsedComment.name === name) {
                return comment;
            }
            return false;
        });
        return comment;
    },
    /**
     * If a template has instructions, it returns true else false.
     * @param {String} template
     */
    hasInstructions: function (templateGroup) {
        var me = this;
        return templateGroup.instructions.length > 0;
    },
    /**
     * Gets template instructions.
     * @param {String} template
     */
    getTemplateInstructions: function (template) {
        var me = this,
            result = MEPH.util.Array.create(),
            childNodes,
            templateInfo;

        templateInfo = MEPH.getDefinedTemplate(template);
        childNodes = MEPH.dom.ControlLoader.getTemplateDom(templateInfo);

        return {
            instructions: me.getCommentGroups(childNodes),
            nodes: childNodes,
            template: template
        };
    },
    /**
     * Extracts the dom and instructions requir ed to create the final dom element.
     */
    getOrdereredConstructionInstructions: function () {
        var me = this,
            result;
        result = MEPH.util.Array.create(me.getTemplates()).select(me.getTemplateInstructions.bind(me));
        return result;
    },
    /**
     * Gets the dom objects group withing comments.
     * @param {Array} orderedNodes
     **/
    getCommentGroups: function (orderedNodes) {
        var me = this,
            Dom = MEPH.util.Dom,
            result = MEPH.util.Array.create(),
            parsedResult,
            group = null;
        orderedNodes.foreach(function (node, index) {

            if (group === null) {
                group = {
                    domObjects: MEPH.util.Array.create(),
                    start: null,
                    end: null
                };
            }

            if (Dom.isComment(node)) {
                parsedResult = Dom.tryParse(node);
                if (parsedResult && parsedResult.instruction) {
                    if (parsedResult.close) {
                        if (group.start === null) {
                            throw 'Incorrect template format: close without a matching start.';
                        }
                        group.end = true;
                        group.endGroupComment = parsedResult;
                        result.push(group);
                        group = null;
                    }
                    else {
                        if (group.start !== null) {
                            throw 'Incorrect template format: start has already been added';
                        }
                        group.start = true;
                        group.startGroupComment = parsedResult;
                    }
                }
            }
            else if (group === null) {
                //
            }
            else {
                group.domObjects.push(node);
            }
        });
        return result;
    }
});