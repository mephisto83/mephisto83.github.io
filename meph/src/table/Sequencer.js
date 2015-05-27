/**
 * @class MEPH.table.SpreadSheet
 * @extends MEPH.control.Control
 * A infinitely scrolling Scrollbar.
 **/
MEPH.define('MEPH.table.Sequencer', {
    alias: 'sequencer',
    templates: true,
    extend: 'MEPH.table.SpreadSheet',
    requires: ['MEPH.util.Observable', 'MEPH.util.Style'],
    statics: {
        grabbing: 'grabbing'
    },
    properties: {
        grabkeycode: 'G',
        source: null,
        radius: 2,
        leftHeaderLeftPadding: 3,
        topheadersource: null,
        leftheadersource: null,

        /**
         * @property {Object} grabbeditem
         * The item grabbed.
         **/
        grabbeditem: null,
        timescale: 1,
        /**
         * @property {Object} time
         * This function will take an item from the source, and return the time.
         **/
        time: null,
        /**
         * @property {Object} time
         * This function will take a number and item as an input, and set the time on the item.
         **/
        settime: null,

        /**
         * @property{Object} rowheader
         * This function will take an item, and return the text/or instructions to render.
         */
        rowheader: null,

        /**
         * @property{Object} columnheader
         * This function will take an item, and return the text/or instructions to render.
         */
        columnheader: null,

        /**
         * @property {Object} lane
         * This function will take an item from the source, and return the lane.
         **/
        lane: null,
        /**
         * @property {Object} length
         * This function will take an item from the source, and return the length.
         **/
        length: null
    },
    initialize: function () {
        var me = this;
        me.callParent.apply(me, arguments);

        me.on('altered', function (type, args) {
            if (args.property === 'source') {

                if (args.old) {
                    args.old.un(null, me);
                    if (Array.isArray(args.old)) {
                        args.old.foreach(function (x) {
                            if (MEPH.util.Observable.isObservable(x))
                                x.un(null, me);
                        })
                    }
                }
                me.onSourceUpdated();
            }
        })
    },
    onLoaded: function () {
        var me = this;
        me.great();

        me.don('mouseovercell', me.canvas, function (evt) {
            me.onMouseOverCell(me.canvas, evt);
        });
        me.don('mousemovecell', me.canvas, function (evt) {
            me.onMouseMoveCell(me.canvas, evt);
        });

        me.don('mouseoveritem', me.canvas, function (evt) {
            me.onMouseOverItem(evt);
        });

        me.don('mouseovercelltop', me.topheader, function (evt) {
            me.onMouseOverCell(me.topheader, evt, 'top')
        });
        me.don('mouseovercellleft', me.leftheader, function (evt) {
            me.onMouseOverCell(me.topheader, evt, 'left')
        });
    },
    onSourceUpdated: function () {
        var me = this;
        if (me.source && MEPH.util.Observable.isObservable(me.source)) {
            me.source.on('changed', me.sourceItemChanged.bind(me), me);
            me.source.foreach(function (item) {
                if (MEPH.util.Observable.isObservable(item)) {
                    item.on('changed', me.sourceItemChanged.bind(me), me);
                }
            });
        }
        me.updateCells();
    },
    sourceItemChanged: function (type, args) {
        var me = this;
        me.updateCells();
    },
    drawSingleDataItem: function (itemtodraw) {
        var me = this;
        var singleinstruction = me.getInstructionsFor(itemtodraw);
        if (singleinstruction) {
            me.drawContent(singleinstruction);
        }
    },
    getMainContentInstructions: function (visibleCellData) {
        var me = this;
        var result = me.getItemsInCellSpace(visibleCellData).concatFluent(function (x) {
            return (me.getInstructionsFor(x));
        });
        return result;
    },
    getLeftHeaderInstructions: function (visibleCellData) {
        var me = this;
        var result = me.getItemsInLeftSpace(visibleCellData).concatFluent(function (x) {
            return me.getInstructionsForLeft(x);
        });
        return result;
    },
    getTopHeaderInstructions: function (visibleCellData) {
        var me = this;
        var result = me.getItemsInTopSpace(visibleCellData).concatFluent(function (x) {
            return me.getInstructionsForTop(x);
        });
        return result;
    },
    getItemsInCellSpace: function (cellData) {
        var me = this;
        return me.getItemInSpace(cellData, me.source);
    },
    getItemsInTopSpace: function (cellData) {
        var me = this;
        return me.getItemInSpace(cellData, me.topheadersource, 'top');
    },
    getItemsInLeftSpace: function (cellData) {
        var me = this;
        return me.getItemInSpace(cellData, me.leftheadersource, 'left');
    },
    deleteSelected: function () {
        var me = this;

        if (me.selectedrange && me.selectedrange.end && me.selectedrange.start) {
            var items = me.getItemInSpace({
                row: me.selectedrange.start.row,
                visibleRows: me.selectedrange.end.row - me.selectedrange.start.row,
                column: me.selectedrange.start.column,
                visibleColumns: me.selectedrange.end.column - me.selectedrange.start.column
            }, me.source);
            if (me['delete'] && me['delete']['function'])
                me['delete']['function'](items);
        }
    },
    getItemInSpace: function (cellData, source, header) {
        var result = [],
            time, lane, endtime,
            length,
            calctime,
            me = this;

        if (cellData) {
            if (me.time && me.length && me.lane && typeof (me.time['function']) === 'function' &&
                   typeof (me.length['function']) === 'function' &&
                   typeof (me.lane['function']) === 'function') {
                if (source) {
                    source.where(function (x) {
                        time = me.time['function'](x);
                        length = me.length['function'](x);
                        lane = me.lane['function'](x);
                        calctime = me.getScaled(time);
                        endtime = calctime + me.getScaled(length);

                        var rowfits = cellData.row <= lane && lane <= cellData.visibleRows + cellData.row;
                        var startofcolumns = cellData.column <= calctime && calctime <= cellData.visibleColumns + cellData.column;
                        var endofcolumns = cellData.column <= endtime && endtime <= cellData.visibleColumns + cellData.column;
                        var beginning = (startofcolumns && rowfits);
                        var end = (endofcolumns && rowfits);

                        if ((beginning || end) && !header) {
                            return true;
                        }
                        else if (header === 'left') {
                            return rowfits;
                        }
                        else if (header === 'top') {
                            return startofcolumns;
                        }
                        return false;
                    }).foreach(function (x) {
                        result.push(x);
                    });
                }
            }
        }
        return result;
    },
    /**
     * Gets the scaled value.
     * @param {Number} value
     * @return {Number}
     **/
    getScaled: function (value) {
        var me = this;
        return value / me.timescale;
    }, /**
     * Gets the unscaled value.
     * @param {Number} value
     * @return {Number}
     **/
    unscaleValue: function (value) {
        var me = this;
        return value * me.timescale;
    },

    /**
     * Gets instructions for a sequence item.
     * @param {Object} sequenceItem
     *
     */
    getInstructionsFor: function (sequenceItems) {
        var me = this,
            metrics;
        sequenceItems = Array.isArray(sequenceItems) ? sequenceItems : [sequenceItems];
        return sequenceItems.select(function (sequenceItem) {
            metrics = me.getItemMetrics(sequenceItem);
            metrics.shape = MEPH.util.Renderer.shapes.rectangle;
            metrics.radius = me.radius;
            return metrics;
        })
    },
    getInstructionsForLeft: function (sequenceItem) {
        var me = this,
            metrics;

        metrics = me.getItemMetrics(sequenceItem, 'left');
        var res = me.rowheader && me.rowheader['function'] ? me.rowheader['function'](sequenceItem) : null;
        if (res === null) {
        }
        else if (typeof res === 'string') {
            metrics.font = "12px Arial";
            metrics.textAlign = 'left';
            // metrics.x = me.getCellColumnPx(metrics, 'left')
            metrics.x += me.leftHeaderLeftPadding;
            metrics.y = me.getCellRowPx(metrics, 'left');
            metrics.textBaseline = 'top';
            metrics.shape = MEPH.util.Renderer.shapes.text;
            metrics.text = res;
            return [metrics];
        }
        else {
            console.log('Unhandled: ')
        }
        return [];
    },
    getInstructionsForTop: function (sequenceItem) {
        var me = this,
          metrics;

        metrics = me.getItemMetrics(sequenceItem, 'top');
        var res = me.columnheader && me.columnheader['function'] ? me.columnheader['function'](sequenceItem) : null;
        if (res === null) {
        }
        else if (typeof res === 'string') {
            metrics.font = "12px Arial";
            metrics.textAlign = 'left';
            // metrics.x = me.getCellColumnPx(metrics, 'left')
            metrics.x += me.leftHeaderLeftPadding;
            metrics.y = me.getCellRowPx(metrics, 'top');
            metrics.textBaseline = 'top';
            metrics.shape = MEPH.util.Renderer.shapes.text;
            metrics.text = res;
            return [metrics];
        }
        else {
            console.log('Unhandled: ')
        }
        return [];
    },
    getItemMetrics: function (sequenceItem, offset) {
        var me = this;
        var lane = me.lane['function'](sequenceItem, offset);
        var time = me.time['function'](sequenceItem, offset);
        var length = me.length['function'](sequenceItem);
        var calctime = me.getScaled(time);
        var column = Math.floor(calctime);
        var pos = me.getCellPosition({ row: lane, column: column }, offset);
        var columnWidth = me.getColumnWidth(column);
        var xoffset = (calctime - column) * columnWidth;
        var width = me.getScaled(length) * columnWidth;
        var height = me.getRowHeight(lane);
        return {
            x: pos.x + xoffset,
            y: pos.y,
            width: width,
            fillStyle: me.color && me.color['function'] ? me.color['function'](sequenceItem) : '#ff0000',
            height: height,
            column: column,
            row: lane,
            relObj: sequenceItem
        };
    },
    onMouseOverCell: function (canvas, evt, header) {
        var metrics, func,
            me = this;
        if (!header && me.enablesvg) {
            return;
        }
        var cell = evt.cells.first();

        var items;

        switch (header) {
            case 'left':
                func = me.getItemsInLeftSpace.bind(me);
                break;
            case 'top':
                func = me.getItemsInTopSpace.bind(me);
                break;
            default:
                func = me.getItemsInCellSpace.bind(me);
                break;
        }
        items = func({
            row: cell.row,
            column: cell.column,
            visibleRows: 1,
            visibleColumns: 1
        });
        items = items.where(function (x) {
            metrics = me.getItemMetrics(x);
            return (evt.position.x >= metrics.x && evt.position.x <= metrics.x + metrics.width &&
                evt.position.y >= metrics.y && evt.position.y <= metrics.y + metrics.height)
        });
        me.dispatchEvent('mouseoveritem', {
            items: items, header: header
        }, canvas)
    },
    onMouseMoveCell: function (canvas, evt) {

        var me = this;
        if (me.state === MEPH.table.Sequencer.grabbing) {

            var lane = me.lane['function'](me.grabbeditem);
            var y = Math.min(parseFloat(canvas.clientHeight), Math.max(0, me.getCellRowPx({ row: lane }))) + me.topheader.clientHeight;
            var x = evt.position.x;
            var metrics = me.getItemMetrics(me.grabbeditem);
            me.lastgrabposition = { x: x, y: y };

            me.positionGrabRep({ x: x + (parseFloat(me.leftheader.clientWidth) || 0), y: y, width: metrics.width, height: metrics.height });
        }
    },
    dispatchEvent: function (evnt, args, canvas) {
        var me = this;
        canvas.dispatchEvent(MEPH.createEvent(evnt, args));
    },
    onMouseOverItem: function (evnt) {
        var me = this;
        switch (evnt.header) {
            case 'left':
            case 'top':
                break;
            default:
                me.lastitem = evnt.items.first() || me.lastitem;
                break;
        }
    },
    /**
     *Grabs an item from a sequence, and sets the state to grabbing.
     * @param {Object} item
     */
    grab: function (item) {
        var me = this;
        if (me.settime && typeof (me.settime['function']) === 'function' && !me.state) {
            me.state = MEPH.table.Sequencer.grabbing;
            me.grabbeditem = item;
            if (me.grabrep) {
                Style.show(me.grabrep);
            }
            return true;
        }
        else return false;
    },
    ungrab: function (item) {
        var me = this;
        if (me.grabbeditem === item && me.state === MEPH.table.Sequencer.grabbing) {
            me.grabbeditem = null;
            if (me.grabrep) {
                var position = MEPH.util.Dom.getRelativePosition(me.grabrep, me.canvas);
                var col = me.getRelativeColum(position.x);
                var colpos = me.getCellColumnPosition({ column: col });
                var extrac = (me.lastgrabposition.x - colpos) / me.getColumnWidth(col);
                var time = col + extrac;
                time = Math.max(0, time);
                var unscaledtime = me.unscaleValue(time);
                me.settime['function'](unscaledtime, item);
                Style.hide(me.grabrep);

            }

            me.state = null;
        }
    },
    onKeyPress: function (evt) {
        var me = this,
            key = MEPH.util.Dom.getCharCode(evt);

        if (String.fromCharCode(key).toLowerCase() === me.grabkeycode.toLowerCase()) {
            if (me.lastitem) {
                if (me.state === null) {
                    me.grab(me.lastitem);
                }
                else if (me.state === MEPH.table.Sequencer.grabbing) {
                    me.ungrab(me.grabbeditem);
                }
            }
        }
        else {
            me.great();
        }
    },
    positionGrabRep: function (options) {
        var me = this;
        Style.height(me.grabrep, options.height);
        Style.width(me.grabrep, options.width);
        Style.left(me.grabrep, options.x);;
        Style.top(me.grabrep, options.y);
    }
});