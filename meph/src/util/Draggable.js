/**
 * @class MEPH.util.Geo
 * String
 */
MEPH.define('MEPH.util.Draggable', {
    requires: ['MEPH.util.Dom', 'MEPH.util.Style','MEPH.util.Vector'],
    properties: {
    },
    statics: {
        draggable: function (dom, handle) {
            handle = handle || dom;
            if (dom && handle) {
                (function () {
                    var start, following,moved,
                        startEventPosition;
                    dom.classList.add('meph-draggable');
                    MEPH.util.Style.absolute(dom);
                    ['mousedown', 'touchstart'].foreach(function (evt) {
                        handle.addEventListener(evt, function (e) {
                            following = true;
                            document.body.classList.add('meph-noselect');
                            start = MEPH.util.Dom.getScreenEventPositions(e, dom).first();
                            startEventPosition = MEPH.util.Dom.getRelativePosition(dom, dom.parentNode || dom.parentElement);
                        });
                    });

                    ['mousemove', 'touchmove', 'mouseout'].foreach(function (evt) {
                        document.body.addEventListener(evt, function (e) {
                            if (following) {
                                var pos = MEPH.util.Dom.getScreenEventPositions(e, dom).first();
                                MEPH.util.Style.left(dom, (pos.x - start.x) + startEventPosition.x);
                                MEPH.util.Style.top(dom, (pos.y - start.y) + startEventPosition.y);

                                if (pos.x - start.x || (pos.y - start.y))
                                    moved = true;
                            }
                        });
                    });
                    ['mouseup', 'touchend', 'touchcancel'].foreach(function (evt) {
                        handle.addEventListener(evt, function (e) {
                            if (moved) {
                                handle.dispatchEvent(MEPH.createEvent('dragged', {}));
                            }
                            moved = false;
                            following = false;
                            document.body.classList.remove('meph-noselect');
                        });
                    });
                    ['touchcancel', 'mouseup'].foreach(function (evt) {
                        document.body.addEventListener(evt, function (e) {
                            if (moved) {
                                handle.dispatchEvent(MEPH.createEvent('dragged', {}));
                            }
                            moved = false;
                            following = false;
                            document.body.classList.remove('meph-noselect');
                        });
                    });
                })();
            }
        }
    }
});