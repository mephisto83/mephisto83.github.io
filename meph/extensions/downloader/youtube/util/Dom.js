/**
* @class MEPH.util.Dom
* A utility class for the manipulation of the DOM.
*/
Promise.resolve().then(function () {
    var RTCPeerConnection = null;
    var attachMediaStream = null;
    var reattachMediaStream = null;
    var webrtcDetectedBrowser = null;

    function trace(text) {
        console.log((performance.now() / 1000).toFixed(3) + ": " + text);
    }

    if (navigator.mozGetUserMedia) {

        webrtcDetectedBrowser = "firefox";
        MEPH.browser = 'firefox';

        window.RTCPeerConnection = mozRTCPeerConnection;
        window.RTCSessionDescription = mozRTCSessionDescription;
        window.RTCIceCandidate = mozRTCIceCandidate;
        navigator.getUserMedia = navigator.mozGetUserMedia;

        window.attachMediaStream = function (element, stream) {
            console.log("Attaching media stream");
            element.mozSrcObject = stream;
            element.play();
        };

        window.reattachMediaStream = function (to, from) {
            console.log("Reattaching media stream");
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
    } else {
        console.log("Browser does not appear to be WebRTC-capable");
    }

}).then(function () {
    return MEPH.define('MEPH.util.Dom', {
        statics: {
            commentType: 8,
            textType: 3,
            elementType: 1,
            usermedia: null,
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
             * @method getEventSource
             * Gets the event source from an event.
             * @param {Event} evnt
             * @return {Object}
             **/
            getEventSource: function (evnt) {
                return evnt.target || evnt.srcElement;;
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
    })
});