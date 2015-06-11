/**
 * @class MEPH.list.List
 * @extends MEPH.control.Control
 *  Example
 *   
 *               <list data-bind='"source": "ct$.listsource"'>
 *                   <template 
 *                       name="u4m_controls_examples_list">
 *                           <div class="meph-application-menu-categories-item-details" >
 *                               <span>Name</span>
 *                               <span data-bind='"innerHTML": "c$.data.name"'></span>
 *                           </div>
 *                   </template>
 *               </list>
 *   
 */
MEPH.define('MEPH.list.View', {
    extend: 'MEPH.list.List',
    requires: ['MEPH.util.Dom', 'MEPH.util.Template'],
    templates: false,
    alias: 'listview',
    properties: {
    },
    initialize: function () {
        var me = this;
        me.callParent.apply(me, arguments);
    },
    /**
     * @private
     * Sets up event handlers.
     **/
    setupEventHandlers: function () {
        var me = this;
        me.on('altered', function (type, options) {

            if (options.path === 'source') {
                me.removeListListeners(options.old);
                me.addListListeners(options.value);
                me.renderList(options.property === 'source');
            }
        }, me);

        //me.on('setinstancetemplate', me.handleInstanceTemplate.bind(me));
        me.$templatesCreated;
        me.templateCreationPromise = new Promise(function (resolve, fail) {
            me.$templatesCreated = resolve;
        });
    },
    onLoaded: function () {
        var me = this;
        me.don('click', me.listelement, function (evt) {
            var listItemEl = me.getListElement(evt);
            if (listItemEl) {
                var index = parseFloat(listItemEl.getAttribute('data-item-index'));
                var element = me.getFirstElement();
                element.dispatchEvent(MEPH.createEvent('itemclick', { data: me.source[index], index: index }));
                me.fire('itemclick', { data: me.source[index], index: index });
            }
        });
        me.great();
    },
    getListElement: function (evt) {
        var me = this, listItemEl, t = evt.srcElement || evt.originalTarget, last;
        while (t && t != me.listelement) {
            last = t;
            t = t.parentNode;
        }
        return last;
    },
    addListListeners: function (obj) {
        var me = this;
        if (obj && Array.isArray(obj) && obj.on) {
            obj.on('changed', me.updateList.bind(me), me);
        }
    },
    /**
     * Remove list listeners.
     * @param {Object} obj
     **/
    removeListListeners: function (obj) {
        var me = this;
        if (obj && Array.isArray(obj) && obj.un) {
            obj.un(null, me);
        }
    },
    /**
     * @private
     * Handles the dom template.
     */
    handleDomTemplate: function () {
    },
    /**
     * @private
     * Item clicked handler
     **/
    itemClicked: function (value, dom, prop, eventType, instructions, obj, eventargs) {
        var me = this,
            result,
            target;

        target = eventargs.domEvent.srcElement || eventargs.domEvent.target;
        result = me.boundSource.first(function (info) {
            return me.getDomElements(info).first(function (node) {
                return node === target || MEPH.util.Dom.isDomDescendant(node, target) || MEPH.util.Dom.isDomDescendant(target, node);
            });
        });
        if (result) {
            me.getListSpace().dispatchEvent(MEPH.createEvent('itemclicked', {
                data: result.dataItem
            }));
        }
    },
    /**
     * @private
     * Handles the set of an instance template, and will scrape for templates.
     */
    handleInstanceTemplate: function () {
        var me = this,
            nodes,
            created = 0,
            promise = Promise.resolve(),
            template = me.getInstanceTemplate();

        MEPH.Array(me.listTemplates).removeWhere(function (x) { return x; })
        nodes = MEPH.Array(template.childNodes).where(function (x) {
            return x.nodeName.toLowerCase() === me.templateNodeName.toLowerCase();
        }).foreach(function (x) {
            created++;
            promise = promise.then(function () {
                return me.generateClassForTemplate(x);
            });
            me.listTemplates.push(x);
        });
        if (created) {
            promise = promise.then(function () {
                me.$templatesCreated();
            });
        }
        return promise
    },
    /**
     * Gets the name space of the node.
     * @param {Object} node
     * @returns {String}
     **/
    getNameSpace: function (node) {
        var me = this,
            namespace,
            name = node.getAttribute('name'),
        namespace = me.namespacePrefix.split('.');
        if (name.split('.').length > 1) {
            return name.split('.');
        }
        namespace.push(name);
        return namespace;

    },
    /**
     * Generate clas for template.
     * @param {String} name
     * @returns {Promise}
     ***/
    generateClassForTemplate: function (node) {
        var me = this, template,
            name = node.getAttribute('name'),
            namespace,
            $class;

        namespace = me.getNameSpace(node);

        $class = MEPH.getDefinedClass(namespace.join('.'));
        template = MEPH.getTemplate(namespace.join('.'));
        if (!template) {
            template = {
                alias: name,
                classifiedName: namespace.join('.'),
                path: namespace.join('.'),
                template: node.innerHTML,
                type: MEPH.templateType
            };
            MEPH.addTemplateInformation(template);
        }
        if (!$class) {
            return MEPH.createClass(namespace.join('.'), MEPH.GUID(), 'MEPH.control.Control', true, {
                initialize: function () {
                    var template = this;
                    Object.defineProperty(template, 'list', {
                        get: function () {
                            return me;
                        },
                        set: function () {
                        }
                    });
                    template.callParent.apply(template, arguments);
                }
            });
        }
        return Promise.resolve().then(function () {
            return $class;
        });
    },
    /**
     * @private
     * Gets information associated with the data item.
     * @param {Object} dataItem
     **/
    getBoundSourceInfo: function (dataItem) {
        var me = this,
            foundItem = me.boundSource.first(function (x) { return x.dataItem === dataItem; });
        return foundItem;
    },
    getBoundSourceIndex: function (dataItem) {
        var me = this,
            source = me.getBoundSourceInfo(dataItem);
        return me.boundSource.indexOf(source);
    },
    /**
     * Gets previous bound source.
     * @param {Object} boundSource
     * @return {Object}
     **/
    getPreviousBoundSource: function (boundSource) {
        var me = this,
            previous,
            currentIndex;

        currentIndex = me.source.indexOf(boundSource.dataItem);
        if (currentIndex === -1 || currentIndex === 0) {
            return null;
        }
        previous = me.source[currentIndex - 1];

        return me.getBoundSourceInfo(previous);
    },

    /**
     * Updates the list.
     * @param {String} type
     * @param {Object} options
     * @param {Array} options.added
     * @param {Array} options.removed
     **/
    updateList: function (type, options) {
        var me = this,
            html,
            nextUpdate;

        var div = document.createElement('div');
        if (options.removed.length) {
            me.clearList();

            html = me.source.select(function (t, index) {
                var res = me.renderItem(t, index);
                div.innerHTML = res.html;
                var ch = div.firstElementChild;
                ch.setAttribute('data-item-index', me.source.length - options.added.length + index)
                // me.listelement.appendChild(ch);
                return div.innerHTML;
            }).join('');

            if (me.listelement) {
                me.listelement.innerHTML = html;
            }
        }
        else {
            //var frag = document.createDocumentFragment();
            //frag.appendChild(div)
            options.added.select(function (t, index) {
                var res = me.renderItem(t);
                div.innerHTML = res.html;
                var ch = div.firstElementChild;
                ch.setAttribute('data-item-index', me.source.length - options.added.length + index)
                me.listelement.appendChild(ch);
            });
        }
        me.onscroll();
    },
    onscroll: function () {
        var me = this,
            scrollTop,
            scrollHeight;
        if (!me.$onscroll) {
            me.$onscroll = MEPH.throttle(function () {

                if (me.shouldRenderItem()) {
                    me.renderSomeMore();
                }

            }, 200);
        }
        me.$onscroll();
    },
    renderLater: function (addedDataItem, shift) {
        var me = this,
            data = {
                func: function (addedDataItem) {
                    return Promise.resolve().then(function () {

                        return me.renderItem(addedDataItem);
                    }).then(function (item) {
                        return me.positionAddDataItem(addedDataItem);
                    });;
                }.bind(me, addedDataItem),
                item: addedDataItem
            };
        if (shift) {
            me.renderLaterMagazine.unshift(data);
        }
        else {
            me.renderLaterMagazine.push(data);
        }
    },
    renderSomeMore: function () {
        var me = this, item, addedDataItem;
        if (me.source && me.source.pump && me.shouldRenderItem()) {
            me.source.pump(me.source.length)
        }
    },
    addSomeMoreBack: function () {
        var me = this,
            addedDataItem,
            toadd,
            item;

        item = me.removedSource.last();

        if (item) {
            me.updatePromise = me.updatePromise.then(function () {
                return new Promise(function (r, f) {
                    item = me.removedSource.shift()

                    if (item && me.shouldRenderSomeBack()) {

                        Promise.resolve().then(function () {
                            return me.renderItem(item.item);
                        }).then(function () {

                            return me.positionAddDataItem(item.item, true);
                        }).then(function () {

                            var info = me.getBoundSourceInfo(item.item);
                            if (info) {
                                toadd = item.height;
                                me.ensureListbuffer();
                                me.changeBufferHeight(-toadd);
                            }
                            else {
                                MEPH.Log('should be an object here.');
                            }
                        }).then(function () {
                            r();
                        });
                    }
                    else {
                        if (item) {
                            me.removedSource.unshift(item);
                        }

                        f('skip');
                    }
                }).then(function () {
                    me.addSomeMoreBack();
                }).catch(function (e) {
                    if (e !== 'skip') {
                        MEPH.Log(e);
                    }
                });
            })
        }
    },
    getInfoHeight: function (x) {
        var toadd = 0;
        x.renderResult.foreach(function (y) {
            toadd += y.templateNode.sum(function (x) { return x.clientHeight; });
        });
        return toadd;
    },
    removeSomeFromBottom: function () {
        var me = this,
            item;

        item = me.boundSource.last(function (x) {
            return x.renderResult;
        });

        if (item) {

            me.updatePromise = me.updatePromise.then(function () {
                return new Promise(function (r, f) {
                    var res = me.boundSource.removeWhere(function (x) {
                        return x === item;
                    });

                    if (res.length && me.shouldRemoveBottomItems()) {
                        me.removeItem(item).then(function (x) {

                            item.dataItem.un(null, me);
                            item.dataItem.dun(null, me);
                            x.renderResult.foreach(function (y) {
                                y.classInstance.destroy();
                            });
                        }).then(function () {
                            me.renderLater(item.dataItem, true);
                            f('skip');
                        });
                    }
                    else {
                        me.boundSource.push(item);
                        r();
                    }
                }).then(function () {
                    me.removeSomeFromBottom();
                }).catch(function (e) {
                    if (e !== 'skip') {
                        MEPH.Log(e);
                    }
                });
            });
        }
    },
    removeSomeMore: function () {
        var me = this,
            item;

        item = me.boundSource.first(function (x) {
            return x.renderResult;
        });

        if (item) {
            me.boundSource.removeWhere(function (x) {
                return x === item;
            });

            me.updatePromise = me.updatePromise.then(function () {
                return new Promise(function (r, f) {
                    if (me.shouldRemoveItem()) {
                        me.removeItem(item).then(function (x) {
                            var toadd = me.getInfoHeight(x);

                            item.dataItem.un(null, me);
                            item.dataItem.dun(null, me);
                            x.renderResult.foreach(function (y) {
                                y.classInstance.destroy();
                            });

                            me.removedSource.unshift({
                                item: item.dataItem,
                                height: toadd
                            });

                            x.renderResult = null;
                            me.ensureListbuffer();
                            me.changeBufferHeight(toadd);

                        }).then(function () {
                            f('skip');
                        });
                    }
                    else {
                        r();
                    }
                }).then(function () {
                    me.removeSomeMore();
                }).catch(function (e) {
                    if (e !== 'skip') {
                        MEPH.Log(e);
                    }
                });
            });
        }

    },
    removeRenderLater: function (item) {
        var me = this;
        return me.renderLaterMagazine.removeWhere(function (x) {
            return x.item === item;
        }).length > 0;
    },

    changeBufferHeight: function (changeby) {
        var me = this;
        var size = MEPH.util.Style.size(me.$list_buffer_item);
        MEPH.util.Style.height(me.$list_buffer_item, size.height + changeby);
    },
    ensureListbuffer: function () {
        var me = this;
        me.$list_buffer_item = me.$list_buffer_item || me.listelement.querySelector('[list-buffer-item]');
        if (!me.$list_buffer_item) {
            me.$list_buffer_item = document.createElement('li');
            me.$list_buffer_item.setAttribute('list-buffer-item', 'list-buffer-item')
            MEPH.util.Style.height(me.$list_buffer_item, 0);
            MEPH.util.Dom.insertFirst(me.listelement, me.$list_buffer_item);
        }
    },
    shouldRenderSomeBack: function () {
        var me = this,
              scrollTop,
              clientHeight,
              scrollHeight;
        if (me.renderondemand === 'true') {
            if (me.listelement) {
                me.ensureListbuffer();
                if (me.listwrapper) {
                    clientHeight = me.listwrapper.clientHeight;
                    scrollHeight = me.listelement.clientHeight - me.ondemandbuffer
                    var bufferheight = me.$list_buffer_item.clientHeight;

                    if (scrollHeight !== 0) {

                        scrollTop = me.listwrapper.scrollTop;
                        if (scrollTop < bufferheight + me.ondemandbuffer) {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    },
    shouldRemoveBottomItems: function () {
        var me = this,
                    scrollTop,
                    clientHeight,
                    scrollHeight;
        if (me.renderondemand === 'true') {
            if (me.listelement) {
                me.ensureListbuffer();
                if (me.$list_buffer_item) {
                    if (me.listwrapper) {
                        clientHeight = me.listwrapper.clientHeight;
                        scrollHeight = me.listelement.clientHeight;
                        var bufferheight = me.$list_buffer_item.clientHeight;

                        if (scrollHeight !== 0) {

                            scrollTop = me.listwrapper.scrollTop;
                            if (scrollHeight - scrollTop - clientHeight > (me.ondemandbuffer * 2)) {
                                return true;
                            }
                        }
                    }
                }
            }
        }

        return false;
    },
    shouldRemoveItem: function () {
        var me = this,
            scrollTop,
            clientHeight,
            scrollHeight;
        if (me.renderondemand === 'true') {
            if (me.listelement) {
                me.ensureListbuffer();
                if (me.$list_buffer_item) {
                    if (me.listwrapper) {
                        clientHeight = me.listwrapper.clientHeight;
                        scrollHeight = me.listelement.clientHeight;
                        var bufferheight = me.$list_buffer_item.clientHeight;

                        if (scrollHeight !== 0) {

                            scrollTop = me.listwrapper.scrollTop;
                            if (scrollTop > clientHeight + bufferheight + (me.ondemandbuffer / 2)) {

                                return true;
                            }
                        }
                    }
                }
            }
        }

        return false;
    },
    shouldRenderItem: function () {
        var me = this,
            scrollTop,
            clientHeight,
            scrollHeight;
        if (me.renderondemand === 'true') {
            if (me.listwrapper) {
                clientHeight = me.listwrapper.clientHeight;
                scrollHeight = me.listelement.clientHeight - me.ondemandbuffer;
                if (clientHeight !== 0 && scrollHeight !== 0) {
                    scrollTop = me.listwrapper.scrollTop;
                    if (scrollTop + clientHeight < scrollHeight) {
                        return false;
                    }
                }
            }
        }

        return true;
    },
    /**
     * Get last dom element.
     * @param {Object} boundSource
     **/
    getLastDomElement: function (boundSource) {
        var me = this;
        return me.getDomElements(boundSource).last();
    },
    /**
     * Gets the dom elements.
     * @param {Object} boundSource
     * @returns {Array}
     **/
    getDomElements: function (boundSource) {
        return boundSource.renderResult.first().templateNode;
    },
    /**
     * Positions the added dataitem in the list dom.
     * @param {Object} addedDataItem
     * @param {Boolean} addtotop
     * @returns {Promise}
     **/
    positionAddDataItem: function (addedDataItem, addtotop) {
        var sourceIndex, me = this,
                       info,
                       previousSource,
                       lastelement,
                       index = me.getBoundSourceIndex(addedDataItem);
        sourceIndex = me.source.indexOf(addedDataItem);
        if (addtotop) {
            info = me.getBoundSourceInfo(addedDataItem);

            me.getDomElements(info).foreach(function (el) {
                MEPH.util.Dom.insertAfter(me.$list_buffer_item, el);
            });

            var itempos = me.boundSource.indexOf(info);
            if (itempos !== -1) {
                me.boundSource.splice(itempos, 1);
            }
            me.boundSource.splice(0, 0, info);
        }
        else if (index !== sourceIndex) {

            info = me.getBoundSourceInfo(addedDataItem);
            previousSource = me.getPreviousBoundSource(info);
            if (previousSource) {
                lastelement = me.getLastDomElement(previousSource);
                me.getDomElements(info).foreach(function (el) {
                    MEPH.util.Dom.insertAfter(lastelement, el);
                    lastelement = el;
                });
                var itempos = me.boundSource.indexOf(info);
                if (itempos !== -1) {
                    me.boundSource.splice(itempos, 1);
                }
                me.boundSource.splice(sourceIndex, 0, info);
            }
        }

        return Promise.resolve().then(function () { return addedDataItem; });
    },
    /**
     * Renders the list.
     * @returns {Promise}
     **/
    renderList: function (clear) {
        var me = this,
            promise;
        me.clearList(clear);
        me.renderingInProgress = false;
        me.render();
        promise = Promise.resolve().then(function () { });
        setTimeout(function () {
            me.fire('render', {
                renderComplete: promise
            });
        });

        return promise;
    },
    /**
     * @private
     * Render the list. Do not execute this directly.
     * @returns {Promise}
     **/
    render: function () {
        var me = this,
            boundSource = me.boundSource.select();

        return me.templateCreationPromise.then(function () {
            var promise = Promise.resolve();
            MEPH.Array(me.source)
                .where(function (t) {
                    return !boundSource.contains(function (x) {
                        return x.dataItem === t;
                    });
                })
                .foreach(function (item) {

                    me.getTemplate(item);
                    promise = promise.then(function () {
                        return me.renderItem(item);
                    });
                });

            MEPH.Array(me.source).where(function (t) {
                return !boundSource.contains(function (x) {
                    return x.dataItem === t;
                });
            }).foreach(function (item) {
                promise = promise.then(function (item) {
                    return me.positionAddDataItem(item);
                });;
            });
            return promise;
        });
    },
    /**
     * Clears the list.
     * @returns {Promise}
     **/
    clearList: function (clear) {
        var me = this;

        if (me.listelement) {
            me.listelement.innerHTML = '';
        }
    },
    /**
     * Removes an item visually.
     * @returns {Promise}
     **/
    removeItem: function (item) {
        var me = this;
        return Promise.resolve().then(function () {
            return item;
        });
    },
    /**
     * Renders an item.
     * @protected
     * @param {Object} dataItem
     * @returns {Promise}
     */
    renderItem: function (dataItem, index) {
        var me = this,
            dataTemplate, namespace,
            listspace;
        listspace = me.getListSpace();
        namespace = me.getDataItemTemplateNamespace(dataItem);

        var template = me.getTemplate(dataItem);
        var html = MEPH.util.Template.bindTemplate(template, dataItem);
        return { html: html, dataItem: dataItem };
        //return me.renderControl(namespace.join('.'), listspace, me).then(function (result) {

        //    me.boundSource.push({ renderResult: html, dataItem: dataItem });
        //    return result;
        //}).then(function (result) {
        //    result.first().classInstance.data = dataItem;
        //    result.first().classInstance.fire('databound');
        //    return result;
        //});
    },
    getDataItemTemplateNamespace: function (dataItem) {
        var me = this,
            namespace,
            dataTemplate;
        dataTemplate = me.getTemplateForDataItem(dataItem);
        if (typeof (dataTemplate) === 'string') {
            namespace = dataTemplate.split('.');
        }
        else {
            namespace = me.getNameSpace(dataTemplate);
        }

        return namespace;
    },
    getTemplate: function (dataItem) {
        var me = this, dom;
        var classifiedName = me.getDataItemTemplateNamespace(dataItem).join('.');
        dom = MEPH.createTemplateNode(classifiedName);
        var temp = MEPH.getTemplate(dom.node.nodeName.toLowerCase());
        if (temp) {
            return temp.template;
        }
        return null;
    },
    clickedItem: function () {
        var me = this;
    },
    /**
     * Gets the template for dataitem.
     * @param {Object} data
     * @returns {Object}
     **/
    getTemplateForDataItem: function (data) {
        var me = this,
            outsideFunction,
            template;
        me.templateSelectionFunctions.first(function (x) {
            outsideFunction = x(data);
            return outsideFunction;
        });
        if (outsideFunction) {
            return outsideFunction;
        }
        template = me.getListTemplates().first(function (x) {
            return x;
        });
        return template;
    },
    appendTemplateSelectionFunction: function (tempSelect) {
        var me = this;
        if (!me.templateSelectionFunctions.some(function (x) { return x === tempSelect; }))
            return me.templateSelectionFunctions.push(tempSelect);
    },
    removeTemplateSelectionFunction: function (tempSelect) {
        var me = this;
        return me.templateSelectionFunctions.removeWhere(function (x) {
            return x === tempSelect;
        });
    },
    /**
     * Gets list space.
     * @returns {Object}
     */
    getListSpace: function () {
        var me = this;
        return me.getDomTemplate().first(function (x) {
            return x.querySelector && x.querySelector(me.listspace);
        }).querySelector(me.listspace);
    },
    /**
     * Gets the list templates.
     * @returns {Array}
     **/
    getListTemplates: function () {
        var me = this;
        return me.listTemplates;
    },
    /**
     * @inheritdoc
     */
    destroy: function () {
        var me = this;


        if (me.boundSource) {

            me.boundSource.foreach(function (item) {
                item.dataItem.un(null, me);
                item.dataItem.dun(null, me);
                item.renderResult.foreach(function (result) {
                    result.classInstance.destroy();
                });
            });
        }
        me.callParent.apply(me, arguments);
    }
});