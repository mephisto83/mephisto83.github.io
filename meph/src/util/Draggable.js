/**
 * @class MEPH.util.Geo
 * String
 */
MEPH.define('MEPH.util.Draggable', {
    requires: ['MEPH.util.Dom',
        'MEPH.util.Style',
        'MEPH.util.Vector',
        'MEPH.mobile.services.MobileServices'
    ],
    properties: {
    },
    statics: {
        draggable: function (dom, handle, options) {
            handle = handle || dom;
            options = options || {}
            if (dom && handle && !dom.isDraggable) {
                dom.isDraggable = true;
                return (function () {
                    var start, following, moved,
                        scrollService,
                        scope = { canDrag: true },
                        startEventPosition;
                    dom.classList.add('meph-draggable');
                    if (!options.bungy) {
                        MEPH.util.Style.absolute(dom);
                    }
                    if (options.preventScroll) {

                        MEPH.MobileServices.get('scrollService').then(function (s) {
                            scrollService = s;
                        })
                    }
                    function clearPosition() {
                        if (following && moved) {
                            if (dom.classList.contains('meph-draggable-bungy'))
                                dom.classList.remove('meph-draggable-bungy');
                            MEPH.util.Style.clearPosition(dom, true);
                        }
                    }
                    ['mousedown', 'touchstart'].foreach(function (evt) {
                        handle.addEventListener(evt, function (e) {
                            if (scope.canDrag) {
                                if (request) {
                                    cancelAnimationFrame(request);
                                    request = null;
                                }
                                if (options.preventScroll) {
                                    scrollService.preventScrolling(true);
                                    scrollService.prevent(options.preventScroll);
                                }
                                request = requestAnimationFrame(function () {
                                    start = MEPH.util.Dom.getPageEventPositions(e, dom).first();
                                    if (options.canReact && !options.canReact(start)) {
                                        return;
                                    }
                                    following = true;
                                    if (!scope.selectOn)
                                        document.body.classList.add('meph-noselect');
                                    if (options.translate) {
                                        startEventPosition = dom.position || { x: 0, y: 0 };
                                    }
                                    else {
                                        startEventPosition = MEPH.util.Dom.getRelativePosition(dom, dom.parentNode || dom.parentElement);
                                    }
                                    if (options.bungy) {
                                        dom.classList.add('meph-draggable-bungy');
                                    }
                                });
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

                                        var pos = MEPH.util.Dom.getPageEventPositions(e, dom).first();
                                        if (options.translate) {
                                            var x = options.restrict !== 'y' ? (pos.x - start.x) + startEventPosition.x : 0;
                                            var y = options.restrict !== 'x' ? (pos.y - start.y) + startEventPosition.y : 0;

                                            MEPH.util.Style.translate(dom, x, y);
                                            if (options.boundTo) {
                                                var moveby = MEPH.util.Dom.boundTo(options.boundTo, dom);
                                                x += moveby.x;
                                                y += moveby.y;
                                                MEPH.util.Style.translate(dom, x, y);
                                            }
                                        }
                                        else {
                                            if (options.restrict) {
                                                if (options.restrict !== 'y')
                                                    MEPH.util.Style.left(dom, (pos.x - start.x) + startEventPosition.x);
                                                if (options.restrict !== 'x')
                                                    MEPH.util.Style.top(dom, (pos.y - start.y) + startEventPosition.y);
                                            }
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

                            if (options.preventScroll) {
                                scrollService.allow(options.preventScroll);
                                scrollService.preventScrolling(false);
                            }
                            requestAnimationFrame(function () {
                                if (following && options.bungy) {
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
                                    if (!scope.selectOn)
                                        document.body.classList.remove('meph-noselect');
                                }

                            });
                        });
                    });
                    ['touchcancel', 'mouseup'].foreach(function (evt) {
                        document.body.addEventListener(evt, function (e) {

                            requestAnimationFrame(function () {
                                if (following && options.bungy) {
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
                                    if (!scope.selectOn)
                                        document.body.classList.remove('meph-noselect');
                                }
                            });
                        });
                    });
                    return scope;
                })();
            }
        }
    }
});