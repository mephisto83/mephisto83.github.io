/**
 * @class MEPH.util.Geo
 * String
 */
MEPH.define('MEPH.util.Stretchable', {
    requires: ['MEPH.util.Dom', 'MEPH.util.Style'],
    properties: {
    },
    statics: {
        stretchable: function (dom, handle) {

            if (dom) {
                if (!handle) {
                    handle = document.createElement('i');
                    handle.classList.add('fa');
                    handle.classList.add('fa-arrows');
                    handle.classList.add('fa-1');
                    handle.classList.add('stretchable-handle');
                    dom.appendChild(handle);
                    dom.classList.add('meph-stretchable');
                    MEPH.util.Style.absolute(handle);
                    function positionHandle() {
                        var domsize = MEPH.util.Style.size(dom);
                        var bbox = handle.getBoundingClientRect();
                        MEPH.util.Style.setPosition(handle, domsize.width - bbox.width, domsize.height - bbox.height);
                    }
                    positionHandle();
                }
                (function () {
                    var start, following,
                        hasStretched,
                        startEventPosition;
                    //MEPH.util.Style.absolute(dom);
                    ['mousedown', 'touchstart'].foreach(function (evt) {
                        handle.addEventListener(evt, function (e) {
                            following = true;
                            document.body.classList.add('meph-noselect');
                            start = MEPH.util.Dom.getScreenEventPositions(e, dom).first();
                            startEventPosition = MEPH.util.Style.size(dom);
                            // startEventPosition = MEPH.util.Dom.getRelativePosition(dom, dom.parentNode || dom.parentElement);
                        });
                    });

                    ['mousemove', 'touchmove', 'mouseout'].foreach(function (evt) {
                        document.body.addEventListener(evt, function (e) {
                            if (following) {
                                var pos = MEPH.util.Dom.getScreenEventPositions(e, dom).first();
                                MEPH.util.Style.width(dom, (pos.x - start.x) + startEventPosition.width);
                                MEPH.util.Style.height(dom, (pos.y - start.y) + startEventPosition.height);
                                positionHandle();
                                hasStretched = true;
                            }
                        });
                    });
                    ['mouseup', 'touchend', 'touchcancel'].foreach(function (evt) {
                        handle.addEventListener(evt, function (e) {
                            following = false;
                            positionHandle();
                            document.body.classList.remove('meph-noselect');
                            if (hasStretched) {
                                dom.dispatchEvent(MEPH.createEvent('stretched', { body: dom }));
                            }
                            hasStretched = false;
                        });
                    });
                    ['touchcancel', 'mouseup'].foreach(function (evt) {
                        document.body.addEventListener(evt, function (e) {
                            following = false;
                            document.body.classList.remove('meph-noselect');
                            if (hasStretched) {
                                dom.dispatchEvent(MEPH.createEvent('stretched', { body: dom }));
                            }
                            hasStretched = false;
                            positionHandle()
                        });
                    });
                })();
            }
        }
    }
});