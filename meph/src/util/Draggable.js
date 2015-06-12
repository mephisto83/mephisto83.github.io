/**
 * @class MEPH.util.Geo
 * String
 */
MEPH.define('MEPH.util.Draggable', {
    requires: ['MEPH.util.Dom', 'MEPH.util.Style', 'MEPH.util.Vector'],
    properties: {
    },
    statics: {
        draggable: function (dom, handle, options) {
            handle = handle || dom;
            options = options || {}
            if (dom && handle) {
                return (function () {
                    var start, following, moved,
                        scope = { canDrag: true },
                        startEventPosition;
                    dom.classList.add('meph-draggable');
                    if (!options.bungy) {
                        MEPH.util.Style.absolute(dom);
                    }
                    function clearPosition() {
                        if (following && moved) {
                            dom.classList.remove('meph-draggable-bungy');
                            MEPH.util.Style.clearPosition(dom);
                        }
                    }
                    ['mousedown', 'touchstart'].foreach(function (evt) {
                        handle.addEventListener(evt, function (e) {
                            if (scope.canDrag) {
                                following = true;
                                document.body.classList.add('meph-noselect');
                                start = MEPH.util.Dom.getScreenEventPositions(e, dom).first();
                                startEventPosition = MEPH.util.Dom.getRelativePosition(dom, dom.parentNode || dom.parentElement);

                                if (options.bungy) {
                                    dom.classList.add('meph-draggable-bungy');
                                }
                            }
                        });
                    });
                    var request;
                    ['mousemove', 'touchmove', 'mouseout'].foreach(function (evt) {
                        document.body.addEventListener(evt, function (e) {
                            request = requestAnimationFrame(function () {
                                if (scope.canDrag) {
                                    if (following) {
                                        if (options.must && !options.must(start)) {
                                            return;
                                        }

                                        var pos = MEPH.util.Dom.getScreenEventPositions(e, dom).first();
                                        if (options.translate) {
                                            MEPH.util.Style.translate(dom,
                                           options.restrict !== 'y' ? (pos.x - start.x) + startEventPosition.x : 0,
                                           options.restrict !== 'x' ? (pos.y - start.y) + startEventPosition.y : 0)
                                        }
                                        else {
                                            if (options.restrict !== 'y')
                                                MEPH.util.Style.left(dom, (pos.x - start.x) + startEventPosition.x);
                                            if (options.restrict !== 'x')
                                                MEPH.util.Style.top(dom, (pos.y - start.y) + startEventPosition.y);
                                        }
                                        if (pos.x - start.x || (pos.y - start.y))
                                            moved = true;
                                    }
                                }
                            });
                        });
                    });
                    ['mouseup', 'touchend', 'touchcancel'].foreach(function (evt) {
                        handle.addEventListener(evt, function (e) {

                            if (options.bungy) {
                                clearPosition();
                            }
                            if (request) {
                                cancelAnimationFrame(request);
                                request = null;
                            }
                            if (scope.canDrag) {
                                if (moved) {
                                    handle.dispatchEvent(MEPH.createEvent('dragged', {}));
                                }
                                moved = false;
                                following = false;
                                document.body.classList.remove('meph-noselect');
                            }

                        });
                    });
                    ['touchcancel', 'mouseup'].foreach(function (evt) {
                        document.body.addEventListener(evt, function (e) {

                            if (options.bungy) {
                                clearPosition();
                            }

                            if (request) {
                                cancelAnimationFrame(request);
                                request = null;
                            }
                            if (scope.canDrag) {
                                if (moved) {
                                    handle.dispatchEvent(MEPH.createEvent('dragged', {}));
                                }
                                moved = false;
                                following = false;
                                document.body.classList.remove('meph-noselect');
                            }
                        });
                    });
                    return scope;
                })();
            }
        }
    }
});