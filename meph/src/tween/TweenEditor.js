/**
 * @class MEPH.table.SpreadSheet
 * @extends MEPH.control.Control
 * A infinitely scrolling SpreadSheet.
 **/
MEPH.define('MEPH.tween.TweenEditor', {
    alias: 'tweeneditor',
    templates: true,
    requires: ['MEPH.util.Observable', 'MEPH.button.Button', 'MEPH.util.Style', 'MEPH.util.SVG', 'MEPH.util.Dom'],
    extend: 'MEPH.control.Control',
    statics: {
        states: {
            controldragging: 'controldragging',
            dragging: 'dragging'
        },
        tweenTypes: {
            bezier: 'bezier'
        },
        StartControlPoint: 'StartControlPoint',
        EndControlPoint: 'EndControlPoint'
    },
    properties: {
        source: null,
        /**
         * @property {String} mark Marks the tween point with a group id.
         **/
        mark: null,
        target: null,
        /**
         * @property {Number} controlpointoffset 
         * Intial control point offset
         **/
        controlpointoffset: .1,

        /**
         * @property {Number} controlpointstrokewidth
         * Control point stroke width
         **/
        controlpointstrokewidth: 3,
        paths: null,
        state: null,
        controlpoints: null,
        pointradius: 8,
        tweenoverradius: 10,
        linestroke: '#000000',
        linestrokeselected: '#f2f51a',
        controlpointfill: 'transparent',
        controlpointstroke: '#ff0021',
        linestrokewidth: '4px',
        linestrokeoverwidth: '7px',
        $selectedLine: null,
        tweenrad: 8,
        $tweenpoints: null,
        margin: 2,
        $structureElements: null,
        animate: false
    },
    initialize: function () {
        var me = this;
        me.callParent.apply(me, arguments);
        me.source = MEPH.util.Observable.observable([]);
        me.paths = MEPH.util.Observable.observable([]);
        me.controlpoints = MEPH.util.Observable.observable([]);
        me.source.on('changed', me.update.bind(me));
        me.controlpoints.on('changed', me.update.bind(me));
    },
    onLoaded: function () {
        var me = this;
        me.great();
        me.renderer = new MEPH.util.SVG();
        me.renderer.setCanvas(me.svg);
        me.appendEvents();
        me.render();
    },
    appendEvents: function () {
        var me = this;
        me.don('tweendown', me.svg, me.onTweenDown.bind(me));
        me.don('resize', window, me.update.bind(me));
        me.don('mousemove', me.svg, me.onMouseMove.bind(me));
        me.don('mouseup', me.svg, me.onMouseUp.bind(me));
        me.don('tweenup', me.svg, me.onTweenUp.bind(me));
        me.don('tweenmove', me.svg, me.onTweenMove.bind(me));
        me.don('controldown', me.svg, me.onControlDown.bind(me));
        me.don('controlup', me.svg, me.onControlUp.bind(me));
        me.don('controlmove', me.svg, me.onControlMove.bind(me));
    },
    onControlMove: function (evt) {
        var me = this;
        if (me.state === MEPH.tween.TweenEditor.states.controldragging) {
            var tweenspaceposition = me.convertToTweenSpace(evt.position);
            me.setControlPointPosition(me.target, tweenspaceposition);
            me.update();
        }
    },
    onControlUp: function (evt) {
        var me = this;
        if (me.state === MEPH.tween.TweenEditor.states.controldragging) {
            me.state = null;
            me.target = null;
        }
    },
    onControlDown: function (evt) {
        var me = this;
        if (me.state === null) {
            me.state = MEPH.tween.TweenEditor.states.controldragging;
            me.target = evt.controlpoint;
            me.startPosition = me.getControlPointPosition(evt.controlpoint);
        }
    },
    onMouseUp: function (evt) {
        var me = this;
        if (me.state === MEPH.tween.TweenEditor.states.dragging) {
            var pos = MEPH.util.Dom.getEventPositions(evt, me.svg);
            me.svg.dispatchEvent(MEPH.createEvent('tweenup', {
                tweentarget: me.target,
                position: pos
            }));
        }
        else if (me.state === MEPH.tween.TweenEditor.states.controldragging) {
            me.svg.dispatchEvent(MEPH.createEvent('controlup', {
            }));
        }
    },
    onMouseMove: function (evt) {
        var me = this;

        if (me.state === MEPH.tween.TweenEditor.states.dragging) {
            var pos = MEPH.util.Dom.getEventPositions(evt, me.svg);
            me.svg.dispatchEvent(MEPH.createEvent('tweenmove', {
                tweentarget: me.target,
                position: pos
            }));
        }
        else if (me.state === MEPH.tween.TweenEditor.states.controldragging) {
            var pos = MEPH.util.Dom.getEventPositions(evt, me.svg);
            me.svg.dispatchEvent(MEPH.createEvent('controlmove', {
                target: me.target,
                position: pos.first()
            }));
        }
    },
    onTweenUp: function () {
        var me = this;
        if (me.state === MEPH.tween.TweenEditor.states.dragging) {
            me.state = null;
            me.target = null;
        }
    },
    onTweenMove: function (evt) {
        var me = this,
            point,
            pos;

        if (me.state === MEPH.tween.TweenEditor.states.dragging) {
            pos = me.convertToTweenSpace(evt.position.first());
            point = me.getPoint(evt.tweentarget);
            point.x = pos.x;
            point.y = pos.y;
            me.source.fire('changed', { removed: [], added: [] });
        }
    },
    /**
     * Get points position.
     * @param {Object} point
     * @return {Object}
     **/
    getPosition: function (point) {
        var me = this;
        return {
            x: me.getX(point.x),
            y: me.getY(point.y)
        }
    },
    getX: function (t) {
        var me = this, size = Style.size(me.svg);
        return (t * (size.width - me.margin)) + me.margin;
    },
    getY: function (t) {
        var me = this, size = Style.size(me.svg),
            theight = size.height - me.margin;
        return (t * (theight / 2)) + (theight / 2) + me.margin;
    },
    convertToTweenSpace: function (pos) {
        var me = this,
            size = Style.size(me.svg),
            width = size.width - me.margin,
            height = size.height - me.margin;

        return {
            x: (pos.x / width),
            y: ((pos.y / height) * 2) - 1
        }
    },
    getPathPoints: function (mark) {
        var me = this;
        return me.source.where(function (t) { return t.mark === mark; });
    },
    getPoint: function (guid) {
        var me = this,
            point = me.source.first(function (x) {
                return x.guid === guid;
            });
        return point;
    },
    onTweenDown: function (evt) {
        var me = this;
        if (!me.state && evt.tweenpoint) {
            var point = me.getPoint(evt.tweenpoint.options.guid);

            if (!point || point.anchor) {
                return;
            }
            me.target = evt.tweenpoint.options.guid;
            me.state = MEPH.tween.TweenEditor.states.dragging;
            me.startposition = me.getPoint(me.target);
        }
    },
    update: function () {
        var me = this;
        if (me.animate) {
            if (me.animateRequest) {
                cancelAnimationFrame(me.animateRequest);
            }
            me.animateRequest = requestAnimationFrame(function () {
                me.render();
                me.animateRequest = null;
            });
        }
        else {
            me.render();
        }
    },
    updateData: function () {
        var me = this;
        var data = me.paths.select(function (path) {
            var points = me.getOrderedPathPoints(path);
            var xs = points.select(function (x, index) {
                return x.x;
            });
            var ys = points.select(function (x, index) {
                return x.y;
            });
            var segments = points.select(function (p, t) {
                var cpoints = me.getControlPoints(path, t);
                if (cpoints) {
                    var startpos = me.getControlPointPosition(cpoints.point.start);
                    var endpos = me.getControlPointPosition(cpoints.point.end);
                    return {
                        segment: t,
                        startpos: MEPH.clone(startpos),
                        endpos: MEPH.clone(endpos)
                    }
                }
            }).where();
            return {
                path: path,
                x: xs,
                y: ys,
                segments: segments
            }
        });
        me.tween = data;
        if (me.svg) {
            me.svg.dispatchEvent(MEPH.createEvent('dataupdated', { data: data }))
        }
    },
    render: function () {
        var me = this;
        me.renderPaths();
        me.renderControlPoints();
        me.renderTweenPoints();
        me.renderStructureElements();
    },
    selectPoint: function (x, t) {
        return t.point.path === x.path &&
                t.point.segment === x.segment &&
                t.point.type === x.type;

    },
    renderControlPoints: function () {
        var me = this,
            cpoint, unrenderedPoints;
        if (!me.renderedControlPoints) {
            me.renderedControlPoints = [];
        }


        unrenderedPoints = me.controlpoints.where(function (x) {
            return !me.renderedControlPoints.some(me.selectPoint.bind(me, x));
        });

        renderedPoints = me.controlpoints.where(function (x) {
            return me.renderedControlPoints.some(me.selectPoint.bind(me, x));
        });

        renderedPoints.foreach(function (x) {
            var t = me.convertToControlPoint(false, x);
            x.parts.foreach(function (y) {
                var tpart = t.parts.first(function (w) { return w.name === y.options.name; });
                y.options = tpart;
            }).foreach(function (g) {
                if (g.options.shape === MEPH.util.SVG.shapes.line) {
                    me.renderer.drawLine(g.options, g);
                }
                else if (g.options.shape === MEPH.util.SVG.shapes.circle) {
                    me.renderer.drawCircle(g.options, g);
                }
            });
        });

        newpoints = unrenderedPoints.select();

        newpoints.select(me.convertToControlPoint.bind(me, true)).foreach(function (t) {
            var result = me.renderer.draw(t.parts);
            t.point.parts = result;
            return t.point;
        }).foreach(function (x) {
            me.addControlPointEvents(x);
            me.renderedControlPoints.push(x);
        });

        me.renderedControlPoints.removeWhere(function (x) {
            return !me.controlpoints.some(function (t) {
                return me.selectPoint(t, x);
            });
        }).foreach(function (x) {
            x.parts.foreach(function (t) {
                me.renderer.remove(t.shape);
            });
            me.dun(x);
        });

    },
    /**
     * Converts a point in to a point and line representing a control arm.
     * @param {Object} point
     * @param {Boolean} initial
     **/
    convertToControlPoint: function (initial, controlpoint) {
        var me = this,
            target,
            cpoint;

        points = me.getLineSegment(controlpoint.path, controlpoint.segment);
        cpoint = MEPH.tween.TweenEditor.EndControlPoint === controlpoint.type ? points.second() : points.first();
        if (initial) {
            target = me.getInitialControlPointPosition(cpoint);
            controlpoint.position = target;
        }
        else {
            target = controlpoint.position;
        }
        return {
            parts: me.createControlPointInstructions(cpoint, target),
            point: controlpoint
        };
    },
    /**
     * Gets the control points position.
     * @param {Object} controlpoint
     * @return {Object}
     ***/
    getControlPointPosition: function (controlpoint) {
        var me = this;
        if (controlpoint.point)
            return controlpoint.point.position;
        return controlpoint.position;
    },
    /**
     * Sets the control points position.
     * @param {Object} controlpoint
     * @param {Object} position
     ****/
    setControlPointPosition: function (controlpoint, position) {
        controlpoint.point.position = position;
    },
    /**
     * Add control points events.
     **/
    addControlPointEvents: function (cp) {
        var me = this;
        var circle = cp.point.parts.first(function (x) {
            return x.options.shape === 'circle';
        });

        me.don('mousedown', circle.shape, function (shape, circle, evt) {
            me.handleControlPointEvents(shape, circle, 'mousedown');
        }.bind(me, cp, circle.shape), cp);

        //me.don('mouseup', circle.shape, function (shape, circle, evt) {
        //    me.handleControlPointEvents(shape, circle, 'mouseup');
        //}.bind(me, cp, circle.shape), cp);
    },
    handleControlPointEvents: function (cp, shape, evt) {
        var me = this;
        switch (evt) {
            case 'mousedown':
                shape.dispatchEvent(MEPH.createEvent('controldown', {
                    controlpoint: cp,
                    shape: shape
                }));
                break;
        }
    },
    /**
     * Creates control point instructions
     * @param {Object} point  control point
     * @param {Object} target target point
     * @returns {Array}
     **/
    createControlPointInstructions: function (point, target) {
        var me = this;
        var $point = {
            name: 'circle',
            shape: MEPH.util.SVG.shapes.circle,
            x: me.getX(target.x),
            y: me.getY(target.y),
            stroke: me.controlpointstroke,
            fill: me.controlpointfill,
            radius: me.pointradius
        };

        var line = {
            name: 'line',
            shape: MEPH.util.SVG.shapes.line,
            end: me.getPosition(point),
            start: me.getPosition(target),
            stroke: me.controlpointstroke,
            fill: me.controlpointfill,
            strokeWidth: me.controlpointstrokewidth,
            'stroke-dasharray': '5,5'
        };
        return [$point, line];
    },
    /**
     * @private
     * Gets the intial control point position.
     * @param {Object} cpoint
     * @return {Object}
     **/
    getInitialControlPointPosition: function (cpoint) {
        var me = this;
        return {
            x: cpoint.x,
            y: cpoint.y + me.controlpointoffset > 1 ? Math.max(0, cpoint.y - me.controlpointoffset) : cpoint.y + me.controlpointoffset
        }
    },
    /**
     * @private 
     * Renders path to the svg.
     ***/
    renderPaths: function () {
        var me = this,
            points,
            unrenderedPaths,
            renderedPaths,
            lines, lineshapes,
            p1,
            p2;

        if (!me.renderedPaths) {
            me.renderedPaths = {};
        }

        unrenderedPaths = me.paths.where(function (x) { return !me.renderedPaths[x]; });
        renderedPaths = me.paths.where(function (x) { return me.renderedPaths[x]; });

        unrenderedPaths.foreach(function (x) {
            lines = me.getLineInstructions(x);
            me.renderedPaths[x] = {
                lines: me.renderer.draw(lines),
                linetypes: []
            };
            me.renderedPaths[x].lines.foreach(function (t, index) {
                me.addEventsToLine(t, index);
                t.path = x;
            });
        });

        renderedPaths.foreach(function (x) {
            lines = me.getLineInstructions(x);
            lineshapes = me.renderedPaths[x].lines;
            if (lineshapes.length > lines.length) {
                //remove
                var toremove = lineshapes.length - lines.length;
                lineshapes.subset(0, toremove).where(function (x) {
                    me.renderer.remove(x);
                });
                lineshapes.removeWhere(function (x, i) {
                    return i < toremove;
                });

                lineshapes.foreach(function (t, index) {
                    me.renderer.drawLine(lines[index], lineshapes[index]);
                    lineshapes[index].path = x;
                    me.addEventsToLine(lineshapes[index], index)
                });
            }
            else if (lineshapes.length < lines.length) {
                //add
                var toadd = lines.length - lineshapes.length;
                var newlines = me.renderer.draw(lines.subset(0, toadd));
                newlines.foreach(function (tg, index) {
                    me.addEventsToLine(tg, index + lineshapes.length);
                    tg.path = x;
                })

                lineshapes.push.apply(lineshapes, newlines);

                lines.subset(toadd).foreach(function (x, index) {
                    me.renderer.drawLine(x, lineshapes[index]);
                    me.addEventsToLine(lineshapes[index], index)
                });
            }
            else {
                lineshapes.foreach(function (x, index) {
                    me.renderer.drawLine(lines[index], lineshapes[index]);
                    me.addEventsToLine(lineshapes[index], index)
                });
            }
        });
    },
    /**
     * Sets the selected lines type to bezier
     **/
    setSelectedLineToBezier: function () {
        var me = this;
        if (me.$selectedLine) {
            var path = me.getPath(me.$selectedLine.path);

            var lineInfo = path.linetypes.first(function (x) { return x.lineIndex === me.$selectedLine.lineIndex; });
            if (lineInfo) {
                lineInfo.type = MEPH.tween.TweenEditor.tweenTypes.bezier;
            }
            else {
                path.linetypes.push({ type: MEPH.tween.TweenEditor.tweenTypes.bezier, lineIndex: me.$selectedLine.lineIndex });
            }
        }
    },
    /**
     * Gets the lines for a path.
     * @param {String} guid
     * @return {Array}
     **/
    getPathLines: function (guid) {
        var me = this, path = me.getPath(guid);
        if (path) {
            return path.lines || [];
        }
        return [];
    },
    /**
     * Gets the paths by id.
     * @param {String} guid
     * @returns {Object}
     ***/
    getPath: function (guid) {
        var me = this;
        if (me.renderedPaths && me.renderedPaths[guid]) {
            return me.renderedPaths[guid];
        }
        return null;
    },
    /**
     * Adds events to lines.
     **/
    addEventsToLine: function (line, index) {
        var me = this;
        me.dun(line);
        line.lineIndex = index;
        me.don('mouseout', line.shape, function (shape, evt) {
            me.handleLineState(shape, 'mouseout');
        }.bind(me, line), line);
        me.don('mouseover', line.shape, function (shape, evt) {
            me.handleLineState(shape, 'mouseover');
        }.bind(me, line), line);
        me.don('click', line.shape, function (shape, evt) {
            me.handleLineState(shape, 'click');
        }.bind(me, line), line);
        me.handleLineState(line);
    },
    /**
     * Handles lines state
     * @param {Object} shape
     * @param {String} evt
     **/
    handleLineState: function (shape, evt) {
        var me = this;
        switch (evt) {
            case 'click':
                if (me.$selectedLine) {
                    me.$selectedLine.shape.style.stroke = me.linestroke;
                }
                shape.shape.style.stroke = me.linestrokeselected;
                me.$selectedLine = shape;
                break;
            case 'mouseover':
                //shape.shape.style.stroke = me.linestrokeover;
                shape.shape.style.strokeWidth = me.linestrokeoverwidth;
                break;
            case 'mouseout':
                //shape.shape.style.stroke = me.linestroke;
                shape.shape.style.strokeWidth = me.linestrokewidth;
                break;
            default:
                if (shape && shape.shape) {
                    shape.shape.style.stroke = me.linestroke;
                    shape.shape.style.strokeWidth = me.linestrokewidth;
                }
                me.$selectedLine = null;
                break;
        }
    },
    /**
     * @private
     * Gets instructions for line.
     * @param {String} x
     * @return {Array}
     **/
    getLineInstructions: function (x) {
        var me = this,
            points,
            p1, lines,
            controlpoints, p2;

        points = me.getOrderedPathPoints(x);

        lines = points.select(function (p, index) {
            if (index) {
                controlpoints = me.getControlPoints(x, index - 1);
                p2 = me.getPosition(points[index]);
                p1 = me.getPosition(points[index - 1]);
                if (!controlpoints ||
                    !controlpoints.point ||
                    !controlpoints.point.start ||
                    !controlpoints.point.end) {
                    var line = {
                        shape: MEPH.util.SVG.shapes.line,
                        start: p1,
                        strokeWidth: me.linestrokewidth,
                        end: p2
                    };
                    return line;
                }
                else {

                    var bezier = {
                        shape: MEPH.util.SVG.shapes.bezier,
                        start: p1,
                        fill: 'transparent',
                        bezier1: me.getPosition(me.getControlPointPosition(controlpoints.point.start)),
                        bezier2: me.getPosition(me.getControlPointPosition(controlpoints.point.end)),
                        strokeWidth: me.linestrokewidth,
                        end: p2
                    };
                    return bezier;
                }
            }
        }).where(function (t) {
            return t;
        });

        return lines;
    },
    getOrderedPathPoints: function (x) {
        var me = this;
        return me.getPathPoints(x).orderBy(function (y, x) {
            return y.x - x.x;
        });
    },
    /**
     * Renders tween points.
     ***/
    renderTweenPoints: function () {
        var me = this, toshape = function (x) {
            return {
                shape: MEPH.util.SVG.shapes.circle,
                x: me.getX(x.x),
                guid: x.guid,
                y: me.getY(x.y),
                radius: me.pointradius
            }
        };

        if (me.$tweenpoints === null) {
            var select = me.source.select(toshape);
            me.$tweenpoints = me.renderer.draw(select);
        }
        else {
            var newshapes = me.source.select(toshape).where(function (x, index) {
                var r = me.$tweenpoints[index];
                if (r) {
                    var t = me.renderer.drawCircle(x, r);
                    me.dun(r);
                    r.options.guid = t.options.guid;
                    me.addEventsToTweenPoints([r]);
                    return false;
                }
                else {
                    return true;
                }
            });
            if (newshapes.length) {
                var p = me.renderer.draw(newshapes);
                me.$tweenpoints.push.apply(me.$tweenpoints, p);
                me.addEventsToTweenPoints(p);
            }
            else if (me.source.length < me.$tweenpoints) {
                var t = me.$tweenpoints.subset(me.source.length).select(function (x) {
                    me.renderer.remove(x);
                    return x;
                })
                me.$tweenpoints.removeWhere(function (y) {
                    return t.some(function (x) { return x === y; })
                }).foreach(function (removed) {
                    me.dun(removed);
                });
            }
        }
    },
    /**
     * Adds events to tween points
     * @param {Array} array an array of tween points.
     **/
    addEventsToTweenPoints: function (array) {
        var me = this;
        array.foreach(function (x) {
            me.don('mousedown', x.shape, function (shape, evt) {
                var pos = MEPH.util.Dom.getEventPositions(evt, me.svg);
                me.svg.dispatchEvent(MEPH.createEvent('tweendown', { tweenpoint: shape, position: pos }));
            }.bind(me, x), x);
            me.don('mouseout', x.shape, function (shape) {
                shape.shape.setAttribute('r', me.tweenrad);
            }.bind(me, x), x);
            me.don('mouseover', x.shape, function (shape, evt) {
                var pos = MEPH.util.Dom.getEventPositions(evt, me.svg);
                if (!me.state) {
                    me.target = shape.options.guid;
                }
                shape.shape.setAttribute('r', me.tweenoverradius)
                me.svg.dispatchEvent(MEPH.createEvent('tweenover', { tweenpoint: shape, position: pos }));
            }.bind(me, x), x);

        });
    },
    /**
     * Renders the structure of the tween editor.
     ***/
    renderStructureElements: function () {
        var me = this, size = Style.size(me.svg);
        var structure = [{
            name: 'left',
            shape: MEPH.util.SVG.shapes.line,
            start: {
                x: 0 + me.margin,
                y: 0 + me.margin
            },
            end: {
                x: me.margin,
                y: size.height - me.margin
            }
        }, {
            name: 'right',
            shape: MEPH.util.SVG.shapes.line,
            start: {
                x: size.width - me.margin,
                y: me.margin
            },
            end: {
                x: size.width - me.margin,
                y: size.height - me.margin
            }
        }, {
            name: 'top',
            shape: MEPH.util.SVG.shapes.line,
            start: {
                x: me.margin,
                y: me.margin
            },
            end: {
                x: size.width - me.margin,
                y: me.margin
            }
        }, {
            name: 'bottom',
            shape: MEPH.util.SVG.shapes.line,
            start: {
                x: me.margin,
                y: size.height - me.margin
            },
            end: {
                x: size.width - me.margin,
                y: size.height - me.margin
            }
        }]
        if (me.$structureElements === null) {
            me.$structureElements = me.renderer.draw(structure);
        }
        else {
            me.$structureElements.foreach(function (t) {
                var shapeObj = structure.first(function (m) { return m.name === t.options.name; });
                me.renderer.drawLine(shapeObj, t);
            })
        }
    },
    /**
     * Adds a point an a path.
     ***/
    onAddPointAndPath: function () {
        var me = this;
        me.onAddPath();
        me.onAddPoint();
    },
    /**
     * Adds a point to the center of the tween editor.
     **/
    onAddPoint: function () {
        var me = this;
        me.addPoint({ x: .5, y: 0 });
    },
    /**
     * Adds a point the the tween editor.
     * @param {Object} point
     ***/
    addPoint: function (point) {
        var me = this;

        point.x = Math.max(0, Math.min(point.x, 1));
        point.guid = MEPH.GUID();
        point.y = Math.max(-1, Math.min(point.y, 1));
        point.mark = me.mark;
        me.source.push(point);
    },
    /**
     * Add a path from (0,0) to (1,0)
     **/
    onAddPath: function () {
        var me = this;
        me.addPath({ x: 0, y: 0 }, { x: 1, y: 0 })
    },
    /**
     * Adds a path 
     * @param {Object} p1
     * @param {Object} p2
     ***/
    addPath: function (p1, p2) {
        var me = this, guid = MEPH.GUID();
        me.paths.push(guid);
        me.mark = guid;
        p1.anchor = true;
        p2.anchor = true;
        me.addPoint(p1);
        me.addPoint(p2);
    },
    /**
     * Adds a control point to a specific point
     **/
    addControlPoint: function (path, lineSegment, type) {
        var me = this;

        if (!me.controlpoints.some(function (t) { return t.path === path && t.segment === lineSegment && t.type === type; })) {
            me.controlpoints.push({
                path: path,
                segment: lineSegment,
                type: type
            });
        }
    },
    /**
     * Removes a control point.
     * @param {Object} point
     ***/
    removeControlPoint: function (point) {
        var me = this;

        return me.controlpoints.removeWhere(function (t) { return t === point; }).first();
    },
    /**
     * Gets the control points for a path and segment.
     * @param {String} path
     * @param {Number} lineSegment
     * @return {Object}
     **/
    getControlPoints: function (path, lineSegment) {
        var me = this, start, end;
        start = me.controlpoints.first(function (t) {
            return t.path === path && t.segment === lineSegment && t.type === MEPH.tween.TweenEditor.StartControlPoint;
        });
        end = me.controlpoints.first(function (t) {
            return t.path === path && t.segment === lineSegment && t.type === MEPH.tween.TweenEditor.EndControlPoint;
        });
        if (start && start.position && end && end.position) {
            return {
                point: {
                    start: start,
                    end: end
                }
            }
        }
        return null;
    },

    getLineSegment: function (pathguid, segment) {
        var me = this,
            points = me.getOrderedPathPoints(pathguid);

        return points = points.subset(segment, segment + 2);
    },
    /**
     * Add controlls to selected line.
     **/
    addControlsToSelectedLine: function () {
        var me = this,
            selectedline = me.$selectedLine,
            points;

        if (selectedline) {
            me.addControlPoint(selectedline.path, selectedline.lineIndex, MEPH.tween.TweenEditor.StartControlPoint);
            me.addControlPoint(selectedline.path, selectedline.lineIndex, MEPH.tween.TweenEditor.EndControlPoint);
        }
    }
});