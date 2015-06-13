MEPH.define('MEPH.util.Style', {
    alternateNames: 'Style',
    statics: {
        translate: function (dom, x, y) {
            if (dom.style.webkitTransform.toString() !== "translate(" + (x) + "px, " + (y) + "px)") {
                dom.style.webkitTransform = "translate(" + (x) + "px," + (y) + "px)";
                dom.style.transform = "translate(" + (x) + "px," + (y) + "px)";
            }
        },
        hideshow: function (a, b) {
            if (a) {
                Style.show(a);
            }
            if (b) {
                Style.hide(b);
            }
        },
        clearPosition: function (dom, onlytransform) {
            if (dom) {
                requestAnimationFrame(function () {
                    if (!onlytransform) {
                        dom.style.left = '';
                        dom.style.top = '';
                        dom.style.right = '';
                        dom.style.bottom = '';
                    }
                    dom.style.webkitTransform = '';
                    dom.style.transform = '';
                });
            }
        },
        setPosition: function (dom, x, y) {
            Style.left(dom, x);
            Style.top(dom, y);
        },
        setPos: function (dom, pos) {
            Style.setPosition(dom, pos.x, pos.y);
        },
        height: function (dom, height) {
            dom.style.height = parseFloat(height) + 'px';
            dom.height = parseFloat(height);
        },
        ignoreMouse: function (dom) {
            if (dom) {
                dom.style.pointerEvents = 'none';
            }
        },
        listenToMouse: function (dom) {
            if (dom) {
                dom.style.pointerEvents = 'all';
            }
        },
        addClassToggle: function (menuitem, cssclass) {
            (function () {
                var timeout;
                menuitem.addEventListener('mouseover', function () {
                    if (cssclass.over) {
                        menuitem.classList.add(cssclass.over);
                    }
                    if (cssclass.out) {
                        menuitem.classList.remove(cssclass.out);
                    }
                });
                menuitem.addEventListener('mouseout', function () {
                    if (cssclass.over) {
                        menuitem.classList.remove(cssclass.over);
                    }
                    if (cssclass.out) {
                        menuitem.classList.add(cssclass.out);
                    }
                });
            })();
        },
        hide: function (dom) {
            if (dom.style) dom.style.display = 'none';
        },
        show: function (dom) {
            if (dom.style)
                dom.style.display = '';
        },
        clear: function (dom, prop) {
            dom.style.removeProperty(prop);
            dom[prop] = '';
        },
        width: function (dom, width) {
            dom.style.width = parseFloat(width) + 'px';
            dom.width = parseFloat(width);
        },
        top: function (dom, top) {
            dom.style.top = parseFloat(top) + 'px';
        },
        left: function (dom, left) {
            dom.style.left = parseFloat(left) + 'px';
        },
        right: function (dom, right) {
            dom.style.right = parseFloat(right) + 'px';
        },
        getOffset: function (dom, to) {
            var helper = function (_dom) {
                var result = { x: _dom.offsetLeft, y: _dom.offsetTop };
                if (_dom.offsetParent) {
                    var tempresult = helper(_dom.offsetParent);
                    result.x += tempresult.x;
                    result.y += tempresult.y;
                }
                return result;
            }
            return helper(dom);
        },
        backgroundColor: function (dom, color) {
            dom.style.backgroundColor = color;
        },
        strokeWidth: function (dom, width) {
            if (dom) {
                dom.style.borderWidth = parseFloat(width) + 'px';
            }
        },
        borderRadius: function (dom, rad, relative) {

            if (relative) {
                dom.style.borderRadius = rad;
            }
            else {
                dom.style.borderRadius = parseFloat(rad) + 'px';;
            }
        },
        absolute: function (dom) {
            Style.position(dom, 'absolute');
        },
        position: function (dom, position) {
            dom.style.position = position;
        },
        zIndex: function (dom, zIndex) {
            dom.style.zIndex = zIndex;
        },
        cursor: function (dom, type) {
            dom.style.cursor = type;
        },
        windowSize: function () {
            var w = window,
        d = document,
        e = d.documentElement,
        g = d.getElementsByTagName('body')[0],
        x = w.innerWidth || e.clientWidth || g.clientWidth,
        y = w.innerHeight || e.clientHeight || g.clientHeight;
            return {
                width: x,
                height: y
            }
        },
        bodyArea: function () {
            var bsize = document.body.getBoundingClientRect();
            return bsize.width * bsize.height;
        },
        size: function (dom) {
            if (dom.nodeType === 1)
                return dom.getBoundingClientRect();
            return {
                width: dom.clientWidth,
                height: dom.clientHeight
            }
        },
        area: function (dom) {
            var size = MEPH.util.Style.size(dom);
            return parseFloat(size.width) * parseFloat(size.height);
        },
        areaLine: function (dom) {
            var size = MEPH.util.Style.size(dom);
            return parseFloat(size.width) + parseFloat(size.height);
        },
        circleCurve: function (r, x, a, b) {
            //        (x−a)2+(y−b)2=r2
            //          r2 - (x-a)2 = (y-b)2
            //          sqrt(r2 - (x-a)2)+ b = y;
            var result = (Math.pow(r, 2) - Math.pow((x - a), 2))

            return Math.sqrt(Math.abs(result)) + b;
        },
        animate: function (config) {
            var one = false,
                i = config.i;
            if (!config.pausing) {
                //config.dom.style.backgroundPositionX = (-i * config.width) + 'px';
                for (var style in config.animProperties) {

                    for (var styleProp in config.animProperties[style]) {
                        var settingsarray = config.animProperties[style][styleProp];
                        if (!Array.isArray(settingsarray)) {
                            settingsarray = [settingsarray];
                        }
                        settingsarray.foreach(function (settings) {
                            if (i < settings.frameEnd && i >= settings.frameStart) {
                                if (settings.step) {
                                    config.dom[style][styleProp] = ((i - settings.frameStart) * settings.step) + (settings.postFix || '');
                                }
                                else {
                                    var percentage = (i - settings.frameStart) / (settings.frameEnd - settings.frameStart);
                                    config.dom[style][styleProp] = pgx.Vector.Lerp(settings.start, settings.stop, percentage) + (settings.postFix || '');
                                }
                            }
                            else if (settingsarray.length === 1) {
                                config.dom[style][styleProp] = pgx.Vector.Lerp(settings.start, settings.stop, 0) + (settings.postFix || '');
                            }
                        })
                    }
                }
                if (config.direction) {
                    i = (i + 1) % config.count;
                }
                else {
                    i = (i - 1);
                    if (i < 0) {
                        i = config.count - 1;
                    }
                }
                //if (i === 0) {
                config.i = i;
                done = config.callback(i, config)//  node.raise('deathanimationcomplete', {});
                //}
            }
            config.pausing = (config.pausing + 1) % config.pause;
            if (!done) {
                requestAnimationFrame(Style.animate.bind(null, config));
            }
        }
    }
}).then(function () {
    MEPH.addBindPrefixShortCuts('style', 'object', MEPH.util.Style);
});