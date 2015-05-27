/**
 * @class MEPH.dom.ControlLoader
 * Reads controls from the dom which should be created, and associated with there js objects. 
 **/
MEPH.define('MEPH.dom.ControlLoader', {
    requires: ['MEPH.util.Dom', 'MEPH.bind.Binder'],
    statics: {
        /**
         * @static
         * Gets the dom nodes of the template.
         * @param {Object} templateInfo
         * @param {String} templateInfo.template
         **/
        getTemplateDom: function (templateInfo) {
            var me = this,
                div = me.getUnattachedDiv(),
                nodes;

            div.innerHTML = templateInfo.template;

            nodes = MEPH.util.Array.convert(div.childNodes);
            return nodes;
        },
        /**
         * @static
         * Generates an attached div.
         * @returns {Object}
         */
        getUnattachedDiv: function () {
            return document.createElement('div');
        }
    },
    properties: {
        MEPHUniqueId: 'mephuniqueid',
        MEPHId: 'mephid'
    },
    initialize: function () {
        var me = this;
    },
    /**
     * Generates bound controls
     * @param {Array} packages
     **/
    generateBoundControls: function (packages) {
        var me = this;
        MEPH.Array(packages);
        return packages.select(function (x) {
            return me.generateBoundControl(x);
        });
    },
    /**
     * Generates a bound control
     * @param {Object} controlPackage
     * @param {Object} controlPackage.controlObject
     * @param {Object} controlPackage.templateNode
     * @param {Object} controlPackage.classInstance
     **/
    generateBoundControl: function (controlPackage) {
        var me = this;
        MEPH.Binder.bindObject(controlPackage.classInstance, controlPackage.templateNode);
        MEPH.Binder.bindControlPackage(controlPackage);
        return controlPackage;
    },
    /**
     * Loads the sub controls of the control packages, and merges the results.
     * @param {Array} controlPackages
     * @param {MEPH.application.Application} application
     * @returns {Promise}
     */
    loadSubControls: function (controlPackages, application) {
        var me = this,
            results,
            promises;
        promises = MEPH.Array(controlPackages).select(function (controlPackage) {
            //return Promise.resolve()
            //    .then(me.loadSubControl.bind(me, controlPackage, application))
            //    .then(me.appendResultsToControl.bind(me, controlPackage, application))
            //    .then(me.processSubControls.bind(me, controlPackage, application))
            results = (me.loadSubControl(controlPackage, application));
            results = (me.appendResultsToControl(controlPackage, application, results));
            return (me.processSubControls(controlPackage, application, results));
        });
        //return Promise.all(promises).then(function () {
        var classInstance = controlPackages.classInstance;
        if (classInstance && classInstance.fire) {
            classInstance.fire('subcontrolsloaded');
        }
        return controlPackages;
        //});
    },
    /**
     * @private 
     * Processes the subcontrols 
     * @param {Object} controlPackage
     * @param {MEPH.application.Application} application
     * @param {Array} subcontrolPackages
     **/
    processSubControls: function (controlPackage, application, subcontrolPackages) {
        var me = this,
            promises;
        //promises = MEPH.Array(subcontrolPackages).select(function (subcontrolPackage) {
        //    controlPackage.classInstance.addSubControl(subcontrolPackage.classInstance);
        //    return Promise.resolve().then(me.processSubControl.bind(me, controlPackage, application, subcontrolPackage));
        //});
        promises = MEPH.Array(subcontrolPackages).select(function (subcontrolPackage) {
            controlPackage.classInstance.addSubControl(subcontrolPackage.classInstance);
            return (me.processSubControl(controlPackage, application, subcontrolPackage));
        });
        //return Promise.all(promises);
        return promises;
    },
    /**
     * @private 
     * Processes a subcontrol.
     * @param {Object} controlPackage
     * @param {MEPH.application.Application} application
     * @param {Object} subcontrolPackages
     **/
    processSubControl: function (controlPackage, application, subcontrolPackage) {
        var me = this,
            nodes;
        return (me.loadSubControls([subcontrolPackage], application));//Promise.resolve().then
    },

    /**
     * Append subcontrols to control package
     **/
    appendResultsToControl: function (controlPackage, application, subcontrolPackages) {
        var me = this,
            promises;

        promises = MEPH.Array(subcontrolPackages).select(function (subControlPackage) {
            return (me.appendResultToControl(controlPackage, application, subControlPackage));//Promise.resolve().then;
        });
        //return Promise.all(promises).then(function () {
        return subcontrolPackages;
        //});
    },
    /**
     * Append result to control.
     * @param {Object} controlPackage
     * @param {MEPH.application.Application} application
     * @param {Object} subcontrolPackage
     * @param {Object} subcontrolPackage.controlObject
     * @param {Object} subcontrolPackage.templateNode
     * @param {Object} subcontrolPackage.classInstance
     * @returns {Promise}
     **/
    appendResultToControl: function (controlPackage, application, subcontrolPackage) {
        var me = this,
            found,
            sco,
            subNode;

        if (subcontrolPackage && subcontrolPackage.controlObject && subcontrolPackage.controlObject.node) {
            sco = subcontrolPackage.controlObject;
            subNode = sco.node;
            found = controlPackage.templateNode.where(function (parentNode) {
                if (parentNode.nodeType === MEPH.util.Dom.textType) { return false; }
                return true;
            }).select(function (parentNode) {
                return (parentNode.querySelector(sco.alias +
                    '[' + me.MEPHUniqueId + '="' + subcontrolPackage.classInstance.getUniqueId() + '"]'));

            }).first();

            if (found === null) {
                found = controlPackage.templateNode.first(function (parentNode) {
                    return parentNode.getAttribute(me.MEPHUniqueId) === subcontrolPackage.classInstance.getUniqueId();
                });
            }
            if (found) {
                
                me.manageConnectionBetween(controlPackage, subcontrolPackage, subNode);
                MEPH.Binder.bindControl(controlPackage.classInstance, subcontrolPackage.classInstance, subNode);
                MEPH.Binder.bindDomControl(controlPackage, subcontrolPackage, subNode);
                subcontrolPackage.templateNode.foreach(function (packNode) {
                    MEPH.util.Dom.insertBefore(subNode, packNode);
                });
                MEPH.util.Dom.removeFromDom(subNode);
            }
            else {
                throw 'subnode not found: MEPH.dom.ControlLoader.js'
            }
            //Replacing the subNode with the generated template nodes will permanantly distore the parents template.
            //So everything should be done by now.
        }
        else {
            throw 'cannot append result to control if custom tag node is gone';
        }
        return controlPackage;
    },
    /**
     * Manages the connectiosn between the control and subcontrol.
     * @param {Object} controlPackage
     * @param {Object} subcontrolPackage
     * @param {Object} subNode
     **/
    manageConnectionBetween: function (controlPackage, subcontrolPackage, subNode) {
        var me = this,
            subClassInstance = subcontrolPackage.classInstance,
            classInstance = controlPackage.classInstance,
            attribute;
        subClassInstance.addReferenceConnection(MEPH.control.Control.connectables.subcontrol, classInstance);
        subClassInstance.addReferenceConnection(MEPH.control.Control.connectables.self, subClassInstance);

        if (!subClassInstance.parent) {
            Object.defineProperty(subClassInstance, 'parent', {
                enumerable: false,
                writable: true,
                configurable: true,
                value: classInstance
            });
        }

        attribute = subNode.getAttribute(me.MEPHId);
        if (attribute) {

            Object.defineProperty(classInstance, attribute, {
                enumerable: false,
                writable: false,
                configurable: false,
                value: subClassInstance
            });

            Object.defineProperty(classInstance, MEPH.privatePropertyPrefix + MEPH.privateClassPrefix + attribute, {
                enumerable: false,
                writable: false,
                configurable: false,
                value: subClassInstance
            });

            Object.defineProperty(classInstance, MEPH.privatePropertyPrefix + attribute, {
                enumerable: false,
                writable: false,
                configurable: false,
                value: subcontrolPackage.templateNode
            });
        }
    },

    /**
     * Load the sub controls of a contrl package, and merge the results.
     * @param {Object} controlPackage
     * @param {MEPH.application.Application} application
     * @returns {Promise}
     **/
    loadSubControl: function (controlPackage, application) {
        var me = this,
            loadControlsResult,
            generatedBoundControlsResult,
            templateNode = controlPackage.templateNode,
            nodes;
        nodes = MEPH.Binder.getSubObjects(templateNode, 1).select(function (x) {
            var templateInfo = MEPH.getTemplateByNode(x);
            return {
                node: x,
                alias: templateInfo.alias
            }
        });;
        //return me.loadControls(nodes, controlPackage.classInstance, application)
        //            .then(me.generateBoundControls.bind(me))
        //.then(function (results) {
        //    return me.loadSubControls(results, application);
        //});
        loadControlsResult = me.loadControls(nodes, controlPackage.classInstance, application)
        generatedBoundControlsResult = me.generateBoundControls(loadControlsResult);
        //.then(function (results) {
        return me.loadSubControls(generatedBoundControlsResult, application);
        //});
    },
    /**
     * Loads the controls
     * @param {Array} controlObjects
     * @returns {Promise}
     */
    loadControls: function (controlObjects, parentControl, application) {
        var me = this,
            promises;
        promises = MEPH.util.Array.create(controlObjects).select(function (controlObject) {
            //return Promise.resolve().then(me.loadControl.bind(me, controlObject, parentControl, application));
            return (me.loadControl(controlObject, parentControl, application));
        })

        //return Promise.all(promises).then(function (result) {
        return me.bindObjectReferences(parentControl, application, promises)
        //});
    },
    /**
     * Binds control objects with references
     * @param {Object} parentControl
     * @param {MEPH.application.Application} application
     * @param {Array} controlPackage
     * @returns {Promise}
     */
    bindObjectReferences: function (parentControl, application, controlPackages) {
        var me = this,
            promises;

        promises = MEPH.Array(controlPackages).select(function (controlPackage) {
            //return Promise.resolve().then(me.bindObjectReference.bind(me, parentControl, application, controlPackage))
            //.then(function (result) {
            //    return result;
            //});
            return me.bindObjectReference(parentControl, application, controlPackage);
        });

        //return Promise.all(promises);
        return promises;
    },
    /**
     * Binds control object with references
     * @param {Object} parentControl
     * @param {MEPH.application.Application} application
     * @param {Object} controlPackage
     * @returns {Promise}
     */
    bindObjectReference: function (parentControl, application, controlPackage) {
        var me = this,
            promise = Promise.resolve(),
            parentReferences,
            controlObject = controlPackage.controlObject,
            referencePacks = [], references
        templateNode = controlPackage.templateNode,
        classInstance = controlPackage.classInstance;

        if (controlObject && templateNode && classInstance) {
            parentReferences = parentControl ? parentControl.getReferenceConnections() : [];
            references = me.getObjectReferences(controlObject.node);//.then(function (references) {

            parentReferences.foreach(function (x) {
                classInstance.addReferenceConnectionObj(x);

                if (!referencePacks.some(function (y) { return x.type === y.type; }) && x.type !== 'control' && x.type !== 'subcontrol') {
                    referencePacks.push({ type: x.type, instance: x.obj });
                }
            });
            if (controlObject.node) {

                var instanceReferences = me.getNodeInstanceReferences(controlObject.node);
                if (instanceReferences.length) {
                    references = references || [];
                    instanceReferences.foreach(function (ref) {
                        references.removeWhere(function (x) {
                            return x.type === ref.type;
                        });
                    });
                    instanceReferences.foreach(function (ref) {
                        references.push(ref);
                    });
                }
            }
            if (references) {
                MEPH.Array(references);
                references.foreach(function (x) {
                    classInstance.removeReferenceConnection(x.type);
                });
                references.foreach(function (ref) {
                    var instance = new ref.classDefinition();
                    if (application) {
                        application.addInstance(instance);
                    }
                    if (!referencePacks.some(function (x) { return x.type === ref.type; }) && ref.type !== 'control' && ref.type !== 'subcontrol') {
                        referencePacks.push({ type: ref.type.type, instance: instance });
                    }
                    classInstance.addReferenceConnection(ref.type, instance, true);
                });
            }
            referencePacks.foreach(function (x) {
                referencePacks.foreach(function (y) {

                    if (x.instance.isReferrerable) {
                        x.instance.addReferenceConnection(y.type, y.instance);
                    }
                });
                if (x.instance.fire) {
                    x.instance.fire('referencesbound');
                }
            });

            if (classInstance.fire) {
                classInstance.fire('referencesbound');
            }

            return controlPackage;
            //});
        }
        else {
            throw 'missing argument : ControlLoader.bindObjectReference';
        }
        // return promise;
    },
    /**
     * @private
     * Gets the node instance.
     */
    getNodeInstanceReferences: function (node) {
        var me = this;
        return MEPH.Array(node.attributes).where(function (x) {
            return x.name.startsWith('ref-');
        }).select(function (x) {
            return {
                type: x.name.split('').subset(4).join(''),
                classDefinition: MEPH.getDefinedClass(node.getAttribute(x.name))
            }
        });;
    },
    /**
     * Returns true if the dom object indicates whether or not it will reference an object.
     * @param {Object} dom
     * @returns {Boolean}
     **/
    hasReferences: function (dom) {
        var dataObjectReferenceAttribute = dom.getAttribute(MEPH.dataObjectReferenceAttribute);
        return dataObjectReferenceAttribute !== null && dataObjectReferenceAttribute !== undefined;
    },
    /**
     * Gets the object references from a dom object which is considered a view.
     * @param {Object} dom
     * @returns {Promise}
     */
    getObjectReferences: function (dom) {
        var me = this,
            Dom = MEPH.util.Dom,
            json,
            prefixObj,
            i,
            template,
            classPathOrAlias,
            json,
            promises = [],
            classInformation,
            types,
            $class,
            type,
            key,
            promise = Promise.resolve(),
            dataObjectReferenceAttribute;
        dataObjectReferenceAttribute = dom.getAttribute(MEPH.dataObjectReferenceAttribute);
        if (dataObjectReferenceAttribute) {
            json = Dom.tryParseAttributeJson(dataObjectReferenceAttribute);
            for (i in json) {
                if (json.hasOwnProperty(i)) {
                    prefixObj = MEPH.getBindPrefixShortCut(i);
                    classPathOrAlias = json[i];
                    classInformation = MEPH.getDefinedClassInformation(classPathOrAlias);
                    $class = MEPH.getPathValue(classInformation ? classInformation.classifiedName : classPathOrAlias);
                    key = i;
                    type = MEPH.getBindPrefixShortCut(key);
                    if (type) {
                        type = type.type;
                    }
                    promises.push({
                        key: key,
                        type: type,
                        classDefinition: $class
                    });

                }
            }
            //promise = promise.then(function () {
            return (promises)
            //});
        }
        else {
            json = null;
            // promise = promise.then(function () { return null; });
            return null;
        }

        return promise
    },
    /**
     * Loads a control.
     * @param {Object} controlObject
     * @param {Object} controlObject.node
     * @param {Object} controlObject.alias
     * @param {MEPH.control.Control} parentControl
     */
    loadControl: function (controlObject, parentControl, application) {
        var me = this,
            result,
            templateInfo = MEPH.getDefinedClassInformation(controlObject.alias) || MEPH.getTemplate(controlObject.alias),
            // templateNodes,
            // templateNode,
            templateDom,
            classInstance,
            promise = Promise.resolve(),
            definedClass;

        if (templateInfo) {
            definedClass = MEPH.getDefinedClass(templateInfo.classifiedName);
            //templateNode = me.getTemplateDom(templateInfo);
            if (definedClass) {
                classInstance = new definedClass(controlObject.injections || null);
                classInstance.setUniqueId(MEPH.GUID());

                if (controlObject.view) {
                    classInstance.addReferenceConnection('view', classInstance, true)
                }

                if (application) {
                    classInstance.setApplication(application);
                    application.addControl(classInstance);
                }
                if (classInstance.fire) {
                    classInstance.fire('init');
                }
                controlObject.node.setAttribute(me.MEPHUniqueId, classInstance.getUniqueId());

                if (classInstance.setInstanceTemplate) {
                    classInstance.setInstanceTemplate(controlObject.node);
                    if (classInstance.fire) {
                        classInstance.fire('setinstancetemplate');
                    }
                }

                //promise = classInstance.getGeneratedTemplateDom().then(function (result) {
                templateDom = classInstance.getGeneratedTemplateDom();
                classInstance.setDomTemplate(templateDom);

                if (classInstance.fire) {
                    classInstance.fire('setdomtemplate');
                }

                result = {
                    controlObject: controlObject,
                    templateNode: templateDom,
                    classInstance: classInstance
                };
                classInstance.setControlObject(result);
                return result;
                // });
                //return promise;
            }
            else {
                //generate a class definition is the template specifies nocode
                throw 'unhandled occurence in ControlLoader.js';
            }
        }
        else {
            throw 'Template information not found';
        }
    },
    /**
     * Gets the dom nodes of the template.
     * @param {Object} templateInfo
     * @param {String} templateInfo.template
     **/
    getTemplateDom: function (templateInfo) {
        var me = this,
            div = me.getUnattachedDiv(),
            nodes;

        div.innerHTML = templateInfo.template;

        nodes = MEPH.util.Array.convert(div.childNodes);

        return nodes;
    },
    /**
     * Generates an attached div.
     * @returns {Object}
     */
    getUnattachedDiv: function () {
        return document.createElement('div');
    }
});