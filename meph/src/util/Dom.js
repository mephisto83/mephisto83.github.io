/**
* @class MEPH.util.Dom
* A utility class for the manipulation of the DOM.
*/
MEPH.define('MEPH.util.Dom', {
    requires: ['MEPH.util.Style'],
    statics: {
        commentType: 8,
        textType: 3,
        elementType: 1,
        usermedia: null,
        insertFirst: function (referenceNode, newNode) {
            var node = referenceNode.childNodes[0];
            referenceNode.insertBefore(newNode, node);
        },
        /**
         * Insert newobject before the dom.
         * @param {Object} referenceNode
         * @param {Object} newNode
         */
        insertBefore: function (referenceNode, newNode) {
            referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
        },
        /**
         * Insert newobject after the dom.
         * @param {Object} referenceNode
         * @param {Object} newNode
         */
        insertAfter: function (referenceNode, newNode) {
            referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
        },
        /**
         * Removes a dom object from its tree.
         * @param {Object} domNode
         **/
        removeFromDom: function (domNode) {
            if (domNode.parentNode) {
                domNode.parentNode.removeChild(domNode);
            }
        },

        getUserMedia: function (constraints) {
            var toresolve, tofail, result = new Promise(function (resolve, fail) {
                toresolve = resolve;
                tofail = fail;
            });

            constraints = constraints || {
                audio: true,
                video: true
            };

            if (MEPH.util.Dom.usermedia) {
                toresolve(MEPH.util.Dom.usermedia);
            }
            else {
                // Normalize the various vendor prefixed versions of getUserMedia.
                navigator.getUserMedia = (navigator.getUserMedia ||
                                          navigator.webkitGetUserMedia ||
                                          navigator.mozGetUserMedia ||
                                          navigator.msGetUserMedia);
                if (navigator.getUserMedia) {
                    navigator.getUserMedia(constraints,
                        function (stream) {
                            MEPH.util.Dom.usermedia = stream;
                            toresolve(stream);
                        },
                        function (error) {
                            tofail(error);
                        });
                }
                else {
                    tofail(new Error('Browser does not support user media'));
                }
            }
            return result;
        },
        supportsUserMedia: function () {
            navigator.getUserMedia = (navigator.getUserMedia ||
                                      navigator.webkitGetUserMedia ||
                                      navigator.mozGetUserMedia ||
                                      navigator.msGetUserMedia);
            return navigator.getUserMedia && true;
        },
        /**
         * Dom element is anscenstor a descendent of descendent.
         * @param {Object} ancestor
         * @param {Object} descendant
         * @returns {Boolean}
         **/
        isDomDescendant: function (ancestor, descendant) {
            var result;
            /*jshint bitwise: false*/
            result = ancestor.compareDocumentPosition(descendant) & Node.DOCUMENT_POSITION_CONTAINS;
            /*jshint bitwise: true*/
            return result;
        },
        /**
         * Gets comments from a dom element.
         * @param {Object} element
         **/
        getComments: function (element) {
            var result = [],
                i,
                dom = MEPH.util.Dom
            if (Array.isArray(element)) {
                return MEPH.Array(element).concatFluentReverse(function (x) {
                    return dom.getComments(x);
                });
            }
            if (!element) {
                return result;
            }
            if (MEPH.util.Dom.isComment(element)) {
                result.push(element);
            }
            for (i = 0; i < element.childNodes.length ; i++) {
                result = result.concat(dom.getComments(element.childNodes[i]));
            }
            return result;
        },
        /**
         * Returns true if the dom element is a comment node.
         * @param {Object} element
         * @returns {Boolean}
         */
        isComment: function (element) {
            var dom = MEPH.util.Dom;
            return element.nodeType === dom.commentType;
        },
        isElement: function (element) {
            var dom = MEPH.util.Dom;
            return element.nodeType === dom.elementType;
        },
        deleteCoookie: function (name) {
            document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        },
        /**
         * Gets the window screen size
         * @returns {Object}
         **/
        getWindowSize: function () {
            return { width: window.innerWidth, height: window.innerHeight };
        },
        /**
         * Set the size of the dom object.
         * @param {Object} dom
         * @param {Object} size
         * @param {Number/String} size.height
         * @param {Number/String} size.width
         * @param {Boolean} setatt
         **/
        setSize: function (dom, size, setatt) {
            dom.style.height = parseFloat(size.height || 0) + 'px';
            dom.style.width = parseFloat(size.width || 0) + 'px';
            if (setatt) {
                dom.height = parseFloat(size.height);
                dom.width = parseFloat(size.width);
            }
        },
        /**
         * Parses the inner content of a comment node to JSON.
         * @param {Object} element
         * @returns {Object/Boolean}
         **/
        tryParse: function (element) {
            var dom = MEPH.util.Dom;
            if (dom.isComment(element)) {
                try {
                    return dom.tryParseAttributeJson(element.data);
                }
                catch (e) {
                    return false;
                }
            }
            return false;
        },
        /**
         * Take a relative url and transforms it in to a regular expression to match
         * against others.
         * Matchs agains {{something}} by default.
         * @param {string} url
         **/
        convertUrlToRegex: function (url) {
            var match = '[A-Za-z0-9_]*';
            var regex = new RegExp('({)[A-Za-z0-9_]*(})', 'g');
            //url = url.split('/').join('//');
            var hasTemplate = regex.test(url);
            if (hasTemplate) {
                return url.replace(regex, match);
            }

            return url;
        },
        getCharCode: function (e) {
            var charCode = (typeof e.which == "number") ? e.which : e.keyCode;
            return charCode;
        },
        /**
         * @method getEventSource
         * Gets the event source from an event.
         * @param {Event} evnt
         * @return {Object}
         **/
        getEventSource: function (evnt) {
            return evnt.target || evnt.srcElement;;
        },
        getPosition: function (element) {
            var xPosition = 0;
            var yPosition = 0;

            while (element) {
                xPosition += (element.offsetLeft - element.scrollLeft + element.clientLeft);
                yPosition += (element.offsetTop - element.scrollTop + element.clientTop);
                element = element.offsetParent;
            }
            return { x: xPosition, y: yPosition };
        },
        /**
         * Gets the relative position of a svg to another svg.
         * @param {Object} element
         * @param {Object} parent
         * @param {String} position 
         * @return {Object}
         **/
        getRelativeSvgPosition: function (element, parent, position) {
            var cb = parent.getBoundingClientRect();
            var tb = element.getBoundingClientRect();
            //var pos = t.zone.$node.$data.getAbsElPosition(t.zone.$dom);
            if (position === 'center') {
                var pos = {
                    x: (tb.left + tb.right) / 2 - cb.left,
                    y: (tb.bottom + tb.top) / 2 - cb.top
                };
                return pos;
            }
            var pos = {
                x: tb.left - cb.left,
                y: tb.top - cb.top
            };
            return pos;
        },
        getRelativePosition: function (element, parent) {
            var xPosition = 0;
            var yPosition = 0;

            while (element && element !== parent) {
                xPosition += (element.offsetLeft - element.scrollLeft + element.clientLeft);
                yPosition += (element.offsetTop - element.scrollTop + element.clientTop);
                element = element.offsetParent;
            }
            return { x: xPosition, y: yPosition };
        },
        getEventPositions: function (evt, element) {
            var positions = [];
            if (evt.changedTouches) {
                var pos = MEPH.util.Dom.getPosition(element);
                for (i = evt.changedTouches.length; i--;) {
                    touch = evt.changedTouches[i];
                    positions.push({ x: touch.pageX - pos.x, y: touch.pageY - pos.y, identifier: touch.identifier });
                }
            }
            else {
                positions.push({ x: evt.offsetX || evt.pageX, y: evt.offsetY || evt.pageY });
            }
            return positions;
        },
        getScreenPosition: function (element) {
            var rect = element.getBoundingClientRect();
            rect.x = rect.left;
            rect.y = rect.top;
            return rect;
        },
        isVisible: function (element) {
            var $elem = element;
            var $window = window;
            var ws = MEPH.util.Style.windowSize();
            var docViewTop = MEPH.util.Dom.windowScroll().scrollTop;
            var docViewBottom = docViewTop + ws.height;
            var pos = MEPH.util.Dom.getScreenPosition(element);
            var es = MEPH.util.Style.size(element);
            var elemTop = pos.y;
            var elemBottom = elemTop + es.height;

            return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));

        },
        windowScroll: function () {
            return {
                scrollLeft: parseFloat(window.scrollX || window.pageXOffset),
                scrollTop: parseFloat(window.scrollY || window.pageYOffset)
            }
        },
        getAbsoluteScreenPosition: function (element) {
            var ipos = MEPH.util.Dom.getScreenPosition(element)
            ipos.x += parseFloat(window.scrollX || window.pageXOffset);
            ipos.y += parseFloat(window.scrollY || window.pageYOffset);
            return ipos;
        },
        createCenteredElement: function (type) {
            var sp = {
                top: document.body.clientHeight / 2,
                left: document.body.clientWidth / 2
            };
            var element = document.createElement(type || 'div');
            Style.position(element, 'absolute');
            Style.zIndex(element, 100000);
            Style.top(element, sp.top);
            Style.left(element, sp.left);
            document.body.appendChild(element);

            return element;
        },
        centerElement: function (element) {
            var rect = element.getBoundingClientRect();
            var sp = {
                top: document.body.clientHeight / 2 - (rect.height / 2),
                left: document.body.clientWidth / 2 - (rect.width / 2)
            };
            Style.top(element, sp.top);
            Style.left(element, sp.left);
        },
        createInputElementOverSvg: function (svg, type, element) {

            var sp = MEPH.util.Dom.getScreenPosition(svg);
            element = element || document.createElement(type || 'input');
            if (element.classList && element.classList.add) {
                element.classList.add('dataentry');
                element.classList.add('form-control');
            }
            Style.width(element, sp.width);
            Style.height(element, sp.height);
            Style.position(element, 'absolute');
            Style.zIndex(element, 100000);
            Style.top(element, sp.top);
            Style.left(element, sp.left);
            document.body.appendChild(element);

            return element;
        },
        createInputElementOverSvgWithDisplay: function (svg) {
            var input1 = MEPH.util.Dom.createInputElementOverSvg(svg);
            var sp = Dom.getScreenPosition(svg);
            var input2 = MEPH.util.Dom.createInputElementOverSvg(svg);
            Style.left(input2, sp.left + sp.width);
            Style.width(input2, 80);
            return {
                input: input1,
                value: input2
            }
        },
        addOption: function (name, value, element) {
            var option = document.createElement("option");
            option.text = name;
            option.value = value;
            element.add(option);
        },
        clearSelect: function (select) {
            while (select.length) {
                select.remove(0);
            }
        },
        createSimpleSelectData: function (me, el, setfunc, initval, options) {
            var element = MEPH.util.Dom.createInputElementOverSvg(el, 'select');
            options.unshift('');
            (options || []).select(function (x) {
                return x;
            }).foreach(function (x) {
                var option = document.createElement("option");
                if (typeof x === 'object') {
                    option.text = x.title;
                    option.value = x.value;
                }
                else {
                    option.text = x;
                    option.value = x;
                }
                element.add(option);
            });

            me.don('blur', element, function (x) {
                setfunc(element.value);

                setTimeout(function () {
                    if (element !== document.activeElement) {
                        if (element.parentNode)
                            element.parentNode.removeChild(element);

                        me.dun(element);
                    }
                }, 400)
            }, element);

        },
        createSimpleDataEntry: function (me, el, type, setfunc, initval) {
            var res = Dom.createInputElementOverSvgWithDisplay(el);
            var element = res.input;
            element.type = type || 'range';
            element.classList.add('dataentry')
            element.max = me.maxvalue || 10;
            element.classList.add('form-control');
            res.value.classList.add('form-control');
            element.min = me.minvalue || 0;
            me.don('blur', [res.value, element], function (x) {
                setfunc(element.value);
                setTimeout(function () {
                    if (element !== document.activeElement && res.value !== document.activeElement) {
                        if (element.parentNode)
                            element.parentNode.removeChild(element);

                        if (res.value.parentNode)
                            res.value.parentNode.removeChild(res.value);

                        me.dun(element);
                    }
                }, 400)
            }, element);

            me.don('change', element, function (x) {
                setfunc(element.value);
                res.value.value = element.value;
            }, element);

            me.don('change', res.value, function (x) {
                setfunc(res.value.value);
                element.value = res.value.value;
            }, element);
            if (initval !== undefined && initval !== null) {
                element.value = initval;
                res.value.value = initval;
            }
            return element;
        },
        /**
         * Adds simple data entry to disposable elements
         * @param {Object} me
         * The data context.
         * @param {Array} elements
         **/
        addSimpleDataEntryToElments: function (me, elements, rootel, destroyCallback) {
            var blur = function (elements, close) {
                elements.foreach(function (elset) {
                    elset.setFunc(elset.element.value);
                });
                //setfunc(element.value);
                setTimeout(function () {
                    if (close || !MEPH.util.Dom.isDomDescendant(document.activeElement, rootel)) {
                        if (rootel.parentNode)
                            rootel.parentNode.removeChild(rootel);

                        me.dun(elements);
                        if (destroyCallback) {
                            destroyCallback();
                        }
                    }
                }, 40)
            }.bind(me, elements);
            me.don('blur', elements.select(function (x) { return x.element; }), blur, elements);
            elements.foreach(function (elset) {
                var element = elset.element;
                me.don('change', element, function (x) {
                    elset.setFunc(element.value);
                }, element);
            });
            return blur;
        },
        getScreenEventPositions: function (evt, element) {
            var positions = [];
            if (evt.changedTouches) {
                var pos = element ? MEPH.util.Dom.getPosition(element) : { x: 0, y: 0 };
                for (i = evt.changedTouches.length; i--;) {
                    touch = evt.changedTouches[i];
                    positions.push({ x: touch.pageX - pos.x, y: touch.pageY - pos.y, identifier: touch.identifier });
                }
            }
            else {
                positions.push({ x: evt.screenX || evt.pageX, y: evt.screenY || evt.pageY });
            }
            return positions;
        },
        generateCssSelector: function (dom) {
            var res = [];
            while (dom && dom.parentNode && dom.parentNode !== document.body && dom !== document.body) {
                var cssList = MEPH.util.Array.create(dom.classList).select(function (x) {
                    return '.' + x;
                }).join('');
                var index = MEPH.util.Array.create(dom.parentNode.children).firstIndex(function (x) { return x === dom; })
                res.unshift(dom.nodeName.toLowerCase() + cssList + ':nth-child(' + (index + 1) + ')');
                dom = dom.parentNode
            }
            return res.join(' > ') || 'body';
        },
        getBestOverlap: function (rect, root, best, ignoreFunt) {
            root = root || document.body;
            var Dom = MEPH.util.Dom, bestdom;
            var children = root.childNodes;
            if (ignoreFunt && ignoreFunt(root)) {
                return { best: 0, dom: root }
            }
            var len = children.length;
            var current;
            var bestObj
            for (var i = len; i--;) {
                if (ignoreFunt && ignoreFunt(children[i])) {
                    continue;
                }
                var area = MEPH.util.Style.areaLine(children[i]);
                if (area > 0) {
                    var overlap = Dom.calculateOverlap(children[i], rect);

                    current = ((1 / (area)) * overlap);
                    if (best === undefined || best < current) {
                        best = current;
                        bestdom = children[i];
                    }
                }
                var currentObj = Dom.getBestOverlap(rect, children[i], best, ignoreFunt);
                if (currentObj.best > best) {
                    best = currentObj.best;
                    bestdom = currentObj.dom;
                }
            }
            return {
                best: best,
                dom: bestdom
            }
        },
        calculateOverlap: function (dom, rect) {
            var rec = dom.getBoundingClientRect();
            var maxleft = Math.max(rect.left, rec.left);
            var minright = Math.min(rect.right, rec.right);
            var maxtop = Math.max(rect.top, rec.top);
            var minbottom = Math.min(rect.bottom, rec.bottom);

            var overlayWidth = minright - maxleft;
            var overlayHeight = minbottom - maxtop;
            if (overlayHeight < 0 || overlayWidth < 0) return 0;
            return overlayHeight * overlayWidth;
        },
        findTextPosition: function (text) {
            var item = MEPH.util.Dom.findTextHelper(text, document.body);
            if (item) {
                return item.parentNode.getBoundingClientRect();
            }
            return null;
        },
        findTextNode: function (text) {
            var item = MEPH.util.Dom.findTextHelper(text, document.body);
            if (item) {
                return item.parentNode;
            }
            return null;
        },

        hasText: function (text, node) {
            var hasText = node.innerText.indexOf(text) !== -1;
            return hasText;
        },

        findTextHelper: function (text, root) {
            var nodes = root.childNodes;
            var len = nodes.length;
            for (var i = len  ; i--;) {
                if (nodes[i].nodeType === 1 && MEPH.util.Dom.hasText(text, nodes[i])) {
                    if (nodes[i].childNodes) {
                        var res = MEPH.util.Dom.findTextHelper(text, nodes[i]);
                        if (res === false) {
                            return nodes[i];
                        }
                        return res;
                    }
                    else {
                        return nodes[i]
                    }
                }
                else if (nodes[i].nodeType === 3 && nodes[i].textContent.indexOf(text) !== -1) {
                    return nodes[i];
                }
            }
            return false;
        },
        tryParseAttributeJson: function (str) {
            try {
                return JSON.parse('{' + str + '}');
            }
            catch (e) {
                return false;
            }
        }
    }
}).then(function () {
    return Promise.resolve().then(function () {
        var RTCPeerConnection = null;
        var attachMediaStream = null;
        var reattachMediaStream = null;
        var webrtcDetectedBrowser = null;

        function trace(text) {
        }
        if (MEPH.workerthread) return;

        if (navigator.mozGetUserMedia) {

            webrtcDetectedBrowser = "firefox";
            MEPH.browser = 'firefox';

            window.RTCPeerConnection = mozRTCPeerConnection;
            window.RTCSessionDescription = mozRTCSessionDescription;
            window.RTCIceCandidate = mozRTCIceCandidate;
            navigator.getUserMedia = navigator.mozGetUserMedia;

            window.attachMediaStream = function (element, stream) {
                element.mozSrcObject = stream;
                element.play();
            };

            window.reattachMediaStream = function (to, from) {
                to.mozSrcObject = from.mozSrcObject;
                to.play();
            };

            // Fake get{Video,Audio}Tracks
            MediaStream.prototype.getVideoTracks = function () {
                return [];
            };

            MediaStream.prototype.getAudioTracks = function () {
                return [];
            };
        } else if (navigator.webkitGetUserMedia) {
            webrtcDetectedBrowser = "chrome";
            MEPH.browser = 'chrome';
            window.RTCPeerConnection = webkitRTCPeerConnection;
            navigator.getUserMedia = navigator.webkitGetUserMedia;

            window.attachMediaStream = function (element, stream) {
                element.src = window.URL.createObjectURL(stream);
            };

            window.reattachMediaStream = function (to, from) {
                to.src = from.src;
            };

            // The representation of tracks in a stream is changed in M26
            // Unify them for earlier Chrome versions in the coexisting period
            if (!webkitMediaStream.prototype.getVideoTracks) {
                webkitMediaStream.prototype.getVideoTracks = function () {
                    return this.videoTracks;
                };
                webkitMediaStream.prototype.getAudioTracks = function () {
                    return this.audioTracks;
                };
            }

            // New syntax of getXXXStreams method in M26
            if (!webkitRTCPeerConnection.prototype.getLocalStreams) {
                webkitRTCPeerConnection.prototype.getLocalStreams = function () {
                    return this.localStreams;
                };
                webkitRTCPeerConnection.prototype.getRemoteStreams = function () {
                    return this.remoteStreams;
                };
            }
        }

    })
})