/**
 * @class
 * Defines a base class for all controls and views.
 **/
MEPH.define('MEPH.bind.Binder', {
    requires: ['MEPH.util.Dom'],
    statics: {
        events: {
            altered: 'altered',
            domevent: 'domevent'
        },
        isOnPath: function (path1, path2) {
            return path1.indexOf(path2) !== -1;
        }
    },
    properties: {
        MEPHId: 'mephid',
        $bindPromise: null
    },
    initialize: function () {
        var me = this;
        me.$bindPromise = Promise.resolve();
    },
    /**
     * Binds instructions from dom to object.
     * @param {Object} object
     * @param {Object} dom
     **/
    bindObject: function (object, dom) {
        var me = this,
            doms, reverseBindingInformation,
            eventBindingInformation = {},
            bindingInformation = {};

        doms = me.getDomObjectsForBinding(dom);
        doms.forEach(function (dom) {
            var mephid = dom.getAttribute(me.MEPHId);
            if (mephid) {
                Object.defineProperty(object, mephid, {
                    enumerable: false,
                    writable: false,
                    configurable: false,
                    value: dom
                });
            }
            bindingInformation = me.parseDomAttributes(dom);
            me.addObjectDomEvent(dom, object);
            me.addEventListeners(bindingInformation, object, dom);
            if (bindingInformation) {
                reverseBindingInformation = me.reverseInstructions(bindingInformation, object, dom);
                me.addEventListeners(reverseBindingInformation, object, object);
            }

            //if (forceControl) {
            //    instruction.path[0] = 'c$';
            //    result[i] = instructions.select(function (x) { return x.path.join(MEPH.pathDelimiter); }).join(MEPH.pipeString);
            //}
            //else {
            //    result[i] = bindingInformation[i];
            //}
        });
    },
    /**
     * Binds the control package
     * @param {Object} controlPackage
     * @param {Object} controlPackage.classInstance
     * @param {Object} controlPackage.controlObject
     * @param {Object} controlPackage.controlObject.node
     */
    bindControlPackage: function (controlPackage) {
        var me = this,
            Binder = MEPH.bind.Binder,
            trimmedInstrutions,
            dom = controlPackage.controlObject.node,
            reverseBindingInformation,
            eventBindingInformation = me.parseDomAttributes(dom, MEPH.getEventDataBindingPrefixes(), MEPH.defaultEventPrefix),
            bindingInformation = me.parseDomAttributes(dom, null, null, controlPackage.classInstance);

        if (bindingInformation && controlPackage.classInstance.isReferrerable) {
            controlPackage.classInstance.getReferenceConnections().forEach(function (reference) {
                if (reference.type !== 'control' && reference.type !== 'subcontrol') {
                    trimmedInstrutions = me.trimInstructions(bindingInformation, reference.type);
                    if (trimmedInstrutions) {
                        me.addPackageListeners(trimmedInstrutions, reference.obj, controlPackage.classInstance);
                        reverseBindingInformation = me.reverseInstructions(trimmedInstrutions, controlPackage.classInstance, reference.obj);
                        if (reverseBindingInformation) {
                            me.addEventListeners(reverseBindingInformation, controlPackage.classInstance, reference.obj);
                        }
                    }
                }
            });
        }
        if (eventBindingInformation) {
            //for (i in eventBindingInformation) {
            //    controlPackage.classInstance.getDomTemplate().where(function (x) {
            //        return x.nodeType === Dom.elementType;
            //    }).forEach(function (dom) {
            //        if (dom.addEventListener) {
            //            dom.addEventListener(i, function (eventType, evnt) {
            //                evnt.stopPropagation();
            //                controlPackage.classInstance.fire(Binder.events.domevent, {
            //                    eventType: eventType,
            //                    domEvent: evnt
            //                });
            //            }.bind(me, i));
            //        }
            //    })
            //}
            // me.addDomEventListeners(eventBindingInformation, controlPackage.classInstance, controlPackage.classInstance);
        }
    },
    /**
     * Trims the instructions to the minimum
     **/
    trimInstructions: function (bindingInformation, type) {
        var me = this,
            instruction,
            result = false,
            i;

        if (!bindingInformation) {
            return false;
        }

        for (i in bindingInformation) {
            if (bindingInformation.hasOwnProperty(i)) {
                instruction = me.parseInstructionString(bindingInformation[i]).first();

                if (instruction.shortCut && type === instruction.shortCut.type) {
                    result = result || {};
                    result[i] = bindingInformation[i];
                }
            }
        }
        return result;
    },
    addPackageListeners: function (bindingInformation, obj, classInstance) {
        var me = this,
            instruction,
            instructions,
            target,
            types,
            Binder = MEPH.bind.Binder,
            altered = Binder.events.altered,
            bi,
            prop,
            connectables = me.getConnectableTypes(obj),
            i;
        if (!bindingInformation) {
            return;
        }
        obj.on(altered, function (eventType, args) {
            var instructionPath;

            for (i in bindingInformation) {
                if (bindingInformation.hasOwnProperty(i)) {
                    bi = bindingInformation[i];
                    instructions = me.parseInstructionString(bi, obj);
                    instruction = instructions.first();

                    if (connectables.some(function (x) {
                        return x === instruction.shortCut.type;
                    })) {
                        target = me.getConnection(classInstance, instruction.shortCut.type, instruction.shortCut.prefix);
                        instructionPath = instruction.path.subset(1).join('.');
                        if (target && Binder.isOnPath(instructionPath, args.path)) {
                            me.executeInstructions(classInstance, instructionPath, altered, instructions, obj, i, false, args);//me, ;
                        }
                    }
                }
            }
        }, obj);
    },
    addObjectDomEvent: function (dom, object) {
        var i,
            me = this,
            Binder = MEPH.bind.Binder,
            eventBindingInformation;

        eventBindingInformation = me.parseDomAttributes(dom, MEPH.getEventDataBindingPrefixes(), MEPH.defaultEventPrefix);
        for (i in eventBindingInformation) {
            dom.addEventListener(i, function (eventType, evnt) {
                object.fire(Binder.events.domevent, {
                    eventType: eventType,
                    domEvent: evnt,
                    dom: dom
                });
            }.bind(me, i));
        }
        me.addDomEventListeners(eventBindingInformation, object, object, dom);
    },
    /**
     * Reverses instructions that do not have pipes.
     * @param {Object} bindingInformation
     * @param {MEPH.control.Control} control
     * @returns {Object}
     */
    reverseInstructions: function (bindingInformation, parentControl, childControl) {
        var me = this,
            i,
            result = {},
            path,
            reference,
            subcontrolPrefix,
            connection,
            referenceType;
        if (!bindingInformation) {
            return false;
        }
        for (i in bindingInformation) {
            if (MEPH.mephHasOwnProperty(bindingInformation, i)) {
                if (bindingInformation[i].indexOf(MEPH.pipeString) === -1) {
                    path = MEPH.Array(bindingInformation[i].trim().split(MEPH.pathDelimiter));
                    referenceType = path.first();

                    if (referenceType) {
                        reference = MEPH.getBindPrefixShortCut(referenceType);
                        if (reference) {
                            connection = parentControl.getConnection(reference.type);
                            subcontrolPrefix = MEPH.getBindPrefixShortCuts().first(function (x) {
                                return x.type === 'self';
                            }).prefix;
                            result[path.subset(1).join(MEPH.pathDelimiter)] = subcontrolPrefix + MEPH.pathDelimiter + i;
                        }
                        //else {
                        //    throw 'MEPH.bind.Binder : no reference type  found with ' + referenceType;
                        //}
                    }
                    else {
                        throw 'MEPH.bind.Binder : no reference type found';
                    }
                }
            }
        }
        return result;
    },
    /**
     * Binds a control to another control using.
     * @param {Object} controlClassInstance
     * @param {Object} subcontrolClassInstance
     * @param {Object} subNode
     */
    bindControl: function (controlClassInstance, subcontrolClassInstance, subNode) {
        var me = this,
            parsedPushInformation,
            eventBindingInformation,
            trimmedInstructions,
            reverseBindingInformation,
            bindingInformation;
        bindingInformation = me.parseDomAttributes(subNode, null, null, subcontrolClassInstance);
        reverseBindingInformation = me.reverseInstructions(bindingInformation, controlClassInstance, subcontrolClassInstance);
        parsedPushInformation = me.parseDomAttributes(subNode, MEPH.getReverseDataBindingPrefixes(), MEPH.defaultReversePrefix);
        MEPH.apply(parsedPushInformation, reverseBindingInformation);
        if (bindingInformation) {
            trimmedInstructions = me.trimInstructions(bindingInformation, 'control');
            me.addEventListeners(trimmedInstructions, controlClassInstance, subcontrolClassInstance);
        }
        if (reverseBindingInformation) {
            me.addEventListeners(reverseBindingInformation, subcontrolClassInstance, controlClassInstance);
        }
    },
    bindDomControl: function (controlPackage, subcontrolPackage, subNode) {
        var me = this,
            i,
            Binder = MEPH.bind.Binder,
            eventBindingInformation;

        eventBindingInformation = me.parseDomAttributes(subNode, MEPH.getEventDataBindingPrefixes(), MEPH.defaultEventPrefix);

        for (i in eventBindingInformation) {
            subcontrolPackage.templateNode.where(function (dom) {
                return dom.nodeType === MEPH.util.Dom.elementType;
            }).forEach(function (dom) {
                dom.addEventListener(i, function (eventType, evnt) {
                    evnt.stopPropagation();
                    if (!evnt.cancelled) {
                        subcontrolPackage.classInstance.fire(Binder.events.domevent, {
                            eventType: eventType,
                            domEvent: evnt,
                            dom: dom
                        });
                    }
                }.bind(me, i));
            });
        }
        me.addDomEventListeners(eventBindingInformation, subcontrolPackage.classInstance, controlPackage.classInstance);
    },
    addDomEventListeners: function (bindingInformation, obj, dom, filterDom) {
        var me = this, i, bi,
            instructions,
            Binder = MEPH.bind.Binder,
            domevent = Binder.events.domevent;
        if (!bindingInformation) {
            return;
        }
        obj.on(domevent, function (bindingInformation, eventType, args) {
            if (!filterDom || args.domEvent.path.some(function (x) { return x === filterDom; }))
                for (i in bindingInformation) {
                    if (args.eventType === i) {
                        if (bindingInformation.hasOwnProperty(i)) {
                            bi = bindingInformation[i];
                            instructions = me.parseInstructionString(bi, obj);
                            me.executeInstructions(dom, null, domevent, instructions, dom, i, true, args);//me, ;
                        }
                    }
                }
        }.bind(me, bindingInformation));
        obj.bindingInformations = obj.bindingInformations || [];
        obj.bindingInformations.push(bindingInformation);
    },
    /**
     * Add event listeners to an object that impements has the MEPH.Events.
     * @param {Object} bindingInformation
     * @param {Object} obj
     * @param {Object} dom
     **/
    addEventListeners: function (bindingInformation, obj, dom) {
        var me = this,
            instruction,
            instructions,
            target,
            types,
            Binder = MEPH.bind.Binder,
            altered = Binder.events.altered,
            bi,
            prop,
            connectables = me.getConnectableTypes(obj),
            i;
        if (!bindingInformation) {
            return;
        }
        var objectsToList = [];
        for (var b in bindingInformation) {
            var instruction = me.parseInstructionString(bindingInformation[b], obj);
            if (instruction) {
                var firstinstruction = instruction.first();
                if (firstinstruction) {
                    var type = firstinstruction.shortCut.type;
                    var ref = obj.getReferenceConnections().first(function (x) { return x.type === type; });
                    if (!ref) {
                        continue;
                    }
                    if (!objectsToList.some(function (x) { return x.type === type; })) {
                        objectsToList.push({ type: type, ref: ref.obj, bindingInformation: {} });
                    }
                    var temp = objectsToList.first(function (x) { return x.type === type; });
                    temp.bindingInformation[b] = bindingInformation[b];
                }
            }
        }
        if (objectsToList.length === 0) {
            objectsToList.push({ ref: obj, bindingInformation: bindingInformation });
        }
        objectsToList.forEach(function (temp) {
            //var obj = temp.ref;
            //var bindingInformation = temp.bindingInformation;
            temp.ref.on(altered, function (bindingInformation, eventType, args) {
                var instructionPath;
                try {
                    for (var i in bindingInformation) {
                        var bi = bindingInformation[i];
                        if (bi) {
                            var instructions = me.parseInstructionString(bi, obj);
                            var instruction = instructions.first();

                            if (connectables.some(function (x) {
                                return x === instruction.shortCut.type;
                            })) {
                                var target = me.getConnection(obj, instruction.shortCut.type, instruction.shortCut.prefix);
                                instructionPath = instruction.path.subset(1).join('.');
                                if (target && Binder.isOnPath(instructionPath, args.path)) {
                                    me.executeInstructions(dom, instructionPath, altered, instructions, obj, i, false, args);//me, ;
                                }
                            }
                        }
                    }
                }
                catch (e) {
                    MEPH.Log(e);
                }
            }.bind(me, temp.bindingInformation), temp.ref);
        })
    },
    /**
     * Gets values of the parameters from the obj
     * @param {Array} parameters
     * @param {Object} obj
     ***/
    getValuesOfParameter: function (parameters, obj) {
        var me = this, results;

        return (parameters || []).select(function (param) {
            var value;
            if (param && param.shortCut && me.getConnection(obj, param.shortCut.type, param.shortCut.prefix)) {
                if (param.shortCut.type === 'subcontrol') {
                    value = MEPH.getPathValue(param.path.subset(1).join('.'), obj);
                }
                else {
                    value = MEPH.getPathValue(param.path.subset(1).join('.'), me.getConnection(obj, param.shortCut.type, param.shortCut.prefix));// obj);
                }
                return value;
            }
            else {
                return param.value;
            }
        });
    },
    /**
     * Executes instrucions and applies the results to the dom object.
     * @param {Object} dom
     * @param {String} prop
     * @param {String} eventType
     * @param {Array} instructions
     * @param {Object} obj
     * @return {Promise}
     **/
    executeInstructions: function (dom, prop, eventType, instructions, obj, propertyPath, ignoreSetProperty, eventargs) {
        var me = this,
            numOfInstructions = instructions ? instructions.length : 0,
            promise;
        promise = me.$bindPromise.then(function () {
            var target,
                value,
                instruction = instructions.first()
            //target = me.getConnection(obj, instruction.shortCut.type);
            if (instruction.shortCut.type === 'subcontrol') {
                value = MEPH.getPathValue(instruction.path.subset(1).join('.'), obj);
            }
            else {
                value = MEPH.getPathValue(instruction.path.subset(1).join('.'), me.getConnection(obj, instruction.shortCut.type, instruction.shortCut.prefix));// obj);
            }
            return value;
        });

        instructions.forEach(function (instruction, index) {
            var target = me.getConnection(obj, instruction.shortCut.type, instruction.shortCut.prefix),
                value;
            promise = promise.then(function (target, index, result) {
                var success,
                    path = instruction.path.subset(1).join('.');
                value = MEPH.getPathValue(path, target);
                if (typeof (value) === 'function') {
                    var paramValues = me.getValuesOfParameter(instruction.params, obj);
                    instructions[' instructions'] = true;
                    instructions[' instructionIndex'] = index;
                    paramValues = paramValues.concat([result, dom, prop, eventType, instructions, obj, eventargs]);
                    return value.apply(target, paramValues);
                }
                else {
                    if (numOfInstructions > 1) {
                        success = MEPH.setPathValue(target, path, result);
                        if (!success) {
                            throw 'Unable to set path : ' + path;
                        }
                    }
                    return result;
                }
                return MEPH.getPathValue(path, target);
            }.bind(me, target, index))
        });
        if (!ignoreSetProperty) {
            promise = promise.then(function (result) {
                me.setValueOnDom(result, dom, propertyPath);
            });
        }
        promise = promise['catch'](function (error) {
            MEPH.Log(error);
            throw error;
        });
        me.$bindPromise = promise;
        return me.$bindPromise;
    },

    /**
     * Sets the value on the dom.
     * @param {Object} value
     * @param {Object} dom
     */
    setValueOnDom: function (value, dom, prop) {
        if (dom) {
            if (MEPH.util.Dom.elementType === dom.nodeType) {
                switch (prop) {
                    case 'type':
                    case 'for':
                    case 'step':
                    case 'max':
                    case 'min':
                        dom.setAttribute(prop, value);
                        break;

                    case 'class':
                        MEPH.util.Array.convert(dom.classList).foreach(function (x) {
                            dom.classList.remove(x);
                        });
                        if (value) {
                            MEPH.Array(value.split(' ')).select(function (x) {
                                return x.trim();
                            }).where(function (x) {
                                return x;
                            }).forEach(function (val) {
                                dom.classList.add(val);
                            });
                        }
                        break;
                    case 'innerHTML':
                        MEPH.setPathValue(dom, prop, value);
                        break;
                    case 'nothing':
                        break;
                    default:
                        var splitProp = prop.split('.');
                        if (splitProp[0] === 'style') {
                            MEPH.setPathValue(dom, prop, value);
                        }
                        else {
                            dom.setAttribute(prop, value);
                        }
                        break;
                }
            }
            else {
                switch (prop) {
                    default:
                        MEPH.setPathValue(dom, prop, value);
                        break;
                }
            }
        }
    },
    getConnection: function (obj, type, prefix) {
        var me = this;
        return obj.getConnection(type, prefix);
    },
    getConnectableTypes: function (obj) {
        var me = this;
        return obj.getConnectableTypes();
    },
    /**
     * Gets custom alias tag elements of the dom a single level down.
     * @param {Object} dom
     * @param {Number} depth
     * @returns {Array}
     **/
    getSubObjects: function (dom, depth) {
        var me = this,
           result = [],
           template;
        if (depth === 0) {
            return result;
        }
        if (dom.length !== undefined &&
            dom.nodeType !== MEPH.util.Dom.textType &&
            dom.nodeType !== MEPH.util.Dom.commentType) {
            result = MEPH.Array(dom).concatFluentReverse(function (d) {
                return MEPH.Array(me.getSubObjects(d, depth));
            });
        }
        else if (dom.nodeType !== MEPH.util.Dom.elementType) {
            return result;
        }
        else {
            template = MEPH.getTemplateByNode(dom);
            if (template) {
                result.push(dom);
                result = result.concat(me.getSubObjects(dom.childNodes, depth - 1));
            }
            else {
                result = result.concat(me.getSubObjects(dom.childNodes, depth));
            }
        }

        return MEPH.Array(result).where(function (x) { return x; });
    },
    /**
     * Gets dom objects from an Array/Dom object that are not custom alias tags
     * @param {Object/Array} dom
     * @returns {Array}
     **/
    getDomObjectsForBinding: function (dom) {
        var me = this,
            result = [],
            template;

        if (dom.length !== undefined && (dom.nodeName ? dom.nodeName.toLowerCase() !== 'select' : true) &&
            dom.nodeType !== MEPH.util.Dom.textType &&
            dom.nodeType !== MEPH.util.Dom.commentType) {
            result = MEPH.Array(dom).concatFluentReverse(function (d) {
                return me.getDomObjectsForBinding(d);
            });
        }
        else if (dom.nodeType !== MEPH.util.Dom.elementType) {
            return result;
        }
        else {
            template = MEPH.getTemplateByNode(dom);
            if (template) {
                return result;
            }
            else {
                result.push(dom);
                result = result.concat(me.getDomObjectsForBinding(dom.childNodes));
            }
        }

        return MEPH.Array(result);
    },
    /**
     * Parses an instruction string.
     * @param {String} instructionString
     **/
    parseInstructionString: function (instructionString, object) {
        var me = this,
            uniqueId, reference,
            subcontrol,
            instructions;
        instructions = (instructionString.split(MEPH.pipeString))
             .select(function (x) {
                 return x.trim();
             })
             .select(function (t) {
                 var x = t.split(MEPH.ParameterDelimiter).trim().first();
                 var parameters = t.split(MEPH.ParameterDelimiter).trim().subset(1);
                 var splitPath = (x.split(MEPH.pathDelimiter)),
                     prefixShortCut,
                     shortCut;
                 shortCut = splitPath.first();
                 subcontrol = MEPH.getBindPrefixShortCuts().first(function (x) {
                     return x.type === 'subcontrol';
                 });

                 if (shortCut.startsWith(subcontrol.prefix)) {
                     uniqueId = shortCut.substr(subcontrol.prefix.length, shortCut.length);
                     shortCut = shortCut.substr(0, subcontrol.prefix.length);
                     splitPath = ([shortCut].concat(splitPath.subset(1)));
                 }
                 prefixShortCut = MEPH.getBindPrefixShortCuts().first(function (x) {
                     return x.prefix === shortCut;
                 });

                 if (object && object.getReferenceConnections) {
                     reference = object.getReferenceConnections().first(function (x) {
                         return x.type === shortCut;
                     });
                     if (reference) {
                         prefixShortCut = reference;
                     }
                 }

                 return {
                     path: splitPath,
                     uniqueId: uniqueId,
                     shortCut: prefixShortCut,
                     params: me.getParameters(t, object)
                 }
             });
        return instructions;
    },
    /**
     * Takes a raw instruction and an object, and will retrieve the parameters.
     * @param {String} rawInstruction
     * @param {Object} object
     **/
    getParameters: function (rawInstruction, object) {
        var me = this, splitPath, uniqueId,
            subcontrol = MEPH.getBindPrefixShortCuts().first(function (x) {
                return x.type === 'subcontrol';
            }),
            results = [],
            parameters = rawInstruction.split(MEPH.ParameterDelimiter).trim().subset(1);

        return parameters.select(function (param) {
            splitPath = param.split(MEPH.pathDelimiter);
            shortCut = splitPath.first();

            if (shortCut.startsWith(subcontrol.prefix)) {
                uniqueId = shortCut.substr(subcontrol.prefix.length, shortCut.length);
                shortCut = shortCut.substr(0, subcontrol.prefix.length);
                splitPath = MEPH.Array([shortCut].concat(splitPath.subset(1)));
            }
            prefixShortCut = MEPH.getBindPrefixShortCuts().first(function (x) {
                return x.prefix === shortCut;
            });

            if (object && object.getReferenceConnections) {
                reference = object.getReferenceConnections().first(function (x) {
                    return x.type === shortCut;
                });
                if (reference) {
                    prefixShortCut = reference;
                }
            }

            return {
                path: splitPath,
                uniqueId: uniqueId,
                shortCut: prefixShortCut,
                value: param
            }

        });
    },
    /**
     * Parses the dom attributes and pulls a object that contains the binding information.
     * @param {Object} dom
     * @returns {Object}
     **/
    parseDomAttributes: function (dom, reverseprefixes, type, instance) {
        var me = this,
            attributes,
            attribute,
            prefixAndProperties,
            prefixes,
            bindingInformation = {};
        prefixes = reverseprefixes || MEPH.getDataBindPrefixes();

        attributes = MEPH.util.Array.convert(dom.attributes || []).select(function (x) { return x.name || x.nodeName; });
        var prefixAndProperties = attributes
            .where(function (x) {
                return x !== (MEPH.defaultDataBindString || x !== MEPH.defaultReversePrefix || x !== MEPH.defaultEventPrefix);
            })
            .select(function (attribute) {
                var propertyName,
                    prefix = prefixes.first(function (x) {
                        return attribute.startsWith(x + MEPH.bindPrefixDelimiter);
                    });
                propertyName = attribute.after(prefix + MEPH.bindPrefixDelimiter);
                return {
                    prefix: prefix,
                    property: propertyName
                }
            });
        if (attributes.some(function (x) { return x === MEPH.defaultDataBindString || x === MEPH.defaultReversePrefix || x !== MEPH.defaultEventPrefix; })) {
            attribute = dom.getAttribute(type || MEPH.defaultDataBindString)

            bindingInformation = attribute ? MEPH.util.Dom.tryParseAttributeJson(attribute) : false;
        }
        if (instance) {
            if (instance.getListOfTransferableAttributes) {
                instance.getListOfTransferableAttributes().where(function (x) {
                    if (x.options && x.options.asValue) {
                        var att = attributes.first(function (t) {
                            var myStr = '';
                            myStr = x.name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
                            return t === myStr;//x.name.toLowerCase();
                        });
                        if (att)
                            instance[x.name] = dom.getAttribute(att);
                    }
                    return attributes.some(function (t) {
                        var myStr = '';
                        myStr = x.name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
                        return t === myStr;//x.name.toLowerCase();
                    });
                }).forEach(function (x) {
                    prefixAndProperties.push({
                        prefix: '',
                        property: x.name
                    });
                });
            }
            if (instance.getAutoBindProperties && instance.getAutoBindPropertyPath) {
                instance.getAutoBindProperties().where(function (x) {
                    return attributes.some(function (t) { return t === x.property.toLowerCase(); });
                }).forEach(function (x) {
                    //return [{ property: 'customAttr', path: ' isValidatable.value', autoProperty: 'invalid' }];
                    dom.setAttribute(x.autoProperty, instance.getAutoBindPropertyPath(x.property, x.autoProperty));
                    prefixAndProperties.push({
                        prefix: '',
                        property: x.autoProperty
                    });
                });
            }
        }
        prefixAndProperties.forEach(function (prefixAndProperty) {
            var attributeName, attribute;
            attributeName = prefixAndProperty.prefix ?
                            (prefixAndProperty.prefix + MEPH.bindPrefixDelimiter + prefixAndProperty.property) :
                            prefixAndProperty.property;
            attribute = dom.getAttribute(attributeName ? attributeName.toLowerCase() : attributeName);
            if (attribute) {
                bindingInformation = bindingInformation || {};
                bindingInformation[prefixAndProperty.property] = attribute;
            }
        });

        if (bindingInformation && Object.keys(bindingInformation).length > 0) {
            return bindingInformation;
        }
        return false;
    }
}).then(function () {
    MEPH.Binder = new MEPH.bind.Binder();
});