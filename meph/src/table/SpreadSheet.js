/**
 * @class MEPH.table.SpreadSheet
 * @extends MEPH.control.Control
 * A infinitely scrolling SpreadSheet.
 **/
MEPH.define('MEPH.table.SpreadSheet', {
    alias: 'spreadsheet',
    templates: true,
    requires: ['MEPH.util.Renderer', 'MEPH.util.Style', 'MEPH.util.Dom', 'MEPH.scrollbar.Scrollbar', 'MEPH.util.SVG'],
    extend: 'MEPH.control.Control',
    statics: {
        states: {
            Selectingleft: 'selectingleft',
            Selectingtop: 'selectingtop',
            Selecting: 'selecting'
        }
    },
    properties: {
        width: 0,
        height: 0,
        vertical: false,
        animatemode: false,
        animFrame: null,
        enablesvg: false,
        columnOffsets: null,
        rowOffsets: null,
        columnheaders: 0,
        endselectonmouseout: false,
        rowheaders: 0,
        state: null,
        columns: null,
        rows: null,
        defaultRowHeight: 50,
        selectedrange: null,
        selectedrangeleft: null,
        selectedrangetop: null,
        defaultColumnWidth: 80,
        defaultHeaderColumnWidth: 80,
        gridlinecolor: "#d6ccf0",
        startColumn: 0,
        vbarposition: null,
        hbarposition: null,
        startRow: 0,
        startTopRow: 0,
        startLeftColumn: 0,
        verticalSize: 0,
        horizontalSize: 0,
        selectedleftheader: null,
        selectedtopheader: null,
        cache: null,
        visibleleftheader: null,
        visibletopheader: null,
        visiblegrid: null
    },
    initialize: function () {
        var me = this;
        me.callParent.apply(me, arguments);
        me.cache = {};

        me.renderer = new MEPH.util.Renderer();
        me.rendererContent = new MEPH.util.Renderer();

        me.leftRenderer = new MEPH.util.Renderer();
        me.leftContentRenderer = new MEPH.util.Renderer();

        me.topRenderer = new MEPH.util.Renderer();
        me.topContentRenderer = new MEPH.util.Renderer();

        me.columnOffsets = null;
        me.rowOffsets = null;
        me.requestActiveSelect = null;
        me.requestActiveCell = null;

        me.on('altered', function (type, args) {
            var rowheaders = parseFloat(me.rowheaders);
            var cols = parseFloat(me.columns);
            var rows = parseFloat(me.rows);
            var colheaders = parseFloat(me.columnheaders);
            if (args.path === 'rowheaders' ||
                args.property === "gridlinecolor" ||
                args.path === 'columnheaders' ||
                args.path === 'columns' ||
                args.path === 'vertical' ||
                args.property === 'enablesvg' ||
                args.property === 'startColumn' ||
                args.property === 'startRow' ||
                args.property === 'vbarposition' ||
                args.property === 'hbarposition' ||
                args.path === 'rows') {
                if (args.property === 'enablesvg') {
                    if (me.enablesvg && !me.svgrenderer) {
                        me.svgrenderer = new MEPH.util.SVG();
                        me.svgrenderer.batchdraw = true;
                        me.svgrenderer.setCanvas(me.canvassvg);
                    }
                }
                if (args.property === 'vbarposition') {
                    me.setStartRow(me.vbarposition);
                }

                if (args.property === 'hbarposition') {
                    me.setStartColumn(me.hbarposition);
                }


                if (!me.columnOffsets && rowheaders && cols) {
                    me.columnOffsets = [].interpolate(0, cols, function (x) {
                        return me.defaultColumnWidth;
                    });
                    me.columnHeaderOffsets = [].interpolate(0, colheaders, function (x) {
                        return me.defaultHeaderColumnWidth;
                    });
                    me.refreshRowColPositions();
                }
                if (!me.rowOffsets && rows && colheaders) {

                    me.rowOffsets = [].interpolate(0, rows, function (x) {
                        return me.defaultRowHeight;
                    })
                    me.rowHeaderOffsets = [].interpolate(0, rowheaders, function (x) {
                        return me.defaultRowHeight;
                    })
                    me.refreshRowColPositions();
                }

                me.update();
            }
        });
    },
    refreshRowColPositions: function () {
        var me = this;

        if (me.columnOffsets) {
            me.columnPositions = me.columnOffsets.subset(0, me.columnOffsets.length).cumsum();


            me.columnHeaderPositions = me.columnHeaderOffsets.subset(0, me.columnHeaderOffsets.length).cumsum();
        }

        if (me.rowOffsets) {
            me.rowPositions = me.rowOffsets.subset(0, me.rowOffsets.length).cumsum();

            me.rowHeaderPositions = me.rowHeaderOffsets.subset(0, me.rowHeaderOffsets.length).cumsum();

        }


    },
    onLoaded: function () {
        var me = this;
        me.callParent.apply(me, arguments);
        me.appendEvents();

        me.rendererContent.setCanvas(me.canvascontent);
        me.leftContentRenderer.setCanvas(me.leftheadercontent);
        me.topContentRenderer.setCanvas(me.topheadercontent);

    },
    appendEvents: function () {
        var me = this;

        me.don('resize', window, me.update.bind(me));
        me.appendCanvasEvents();
        me.appendHeaderEvents();
    },
    appendHeaderEvents: function () {
        var me = this;
        me.don('click', me.topheader, function (evt) {
            me.handleSingleHeaderCellCalculations(me.topheader, evt, 'topheadercellclicked', 'top');
        });
        me.don('click', me.leftheader, function (evt) {
            me.handleSingleHeaderCellCalculations(me.leftheader, evt, 'leftheadercellclicked', 'left');
        });
        me.don('mousemove', me.topheader, function (evt) {
            me.handleSingleHeaderCellCalculations(me.topheader, evt, 'mousemovetopheader', 'top');
        });
        me.don('mousemove', me.leftheader, function (evt) {
            me.handleSingleHeaderCellCalculations(me.leftheader, evt, 'mousemoveleftheader', 'left');
        });
        me.don('mousemovetopheader', me.topheader, function (evt) {
            me.handleMouseMoveHeaderCell(evt, 'top');
        });
        me.don('mousemoveleftheader', me.leftheader, function (evt) {
            me.handleMouseMoveHeaderCell(evt, 'left');
        });



        me.don('mouseover', me.leftheader, me.headerMouseEventHandler.bind(me, 'left', me.leftheader, 'mouseoverheader'));
        me.don('mousemove', me.leftheader, me.headerMouseMoveHandler.bind(me, 'left', me.leftheader));

        me.don('mousemoveselectleft', me.leftheader, me.headerMouseMoveSelectHandler.bind(me, 'left', me.leftheader));

        me.don('mousedown', me.leftheader, me.headerMouseDownHandler.bind(me, 'left', me.leftheader));
        me.don('mouseup', me.leftheader, me.onHeaderMouseupSelecting.bind(me, 'left', me.leftheader));
        if (me.endselectonmouseout)
            me.don('mouseout', me.leftheader, me.onHeaderMouseupSelecting.bind(me, 'left', me.leftheader));



        me.don('mousedown', me.topheader, me.headerMouseDownHandler.bind(me, 'top', me.topheader));

        me.don('mousemove', me.topheader, me.headerMouseMoveHandler.bind(me, 'top', me.topheader));

        me.don('mouseover', me.topheader, me.headerMouseEventHandler.bind(me, 'top', me.topheader, 'mouseoverheader'));

        me.don('mousemoveselecttop', me.topheader, me.headerMouseMoveSelectHandler.bind(me, 'top', me.topheader));

        me.don('mouseup', me.topheader, me.onHeaderMouseupSelecting.bind(me, 'top', me.topheader));
        if (me.endselectonmouseout)
            me.don('mouseout', me.topheader, me.onHeaderMouseupSelecting.bind(me, 'top', me.topheader));
    },
    onHeaderMouseupSelecting: function (offset, header, evt) {
        var me = this;
        if (me.state === MEPH.table.SpreadSheet.states.Selecting + offset) {
            var selectedstartrow = me.getSelectedStartRow(me.selecting);
            me['selectedrange' + offset] = me.selecting;
            if (me['selected' + offset + 'header']) {
                me['selected' + offset + 'header'].clear();
                if (selectedstartrow) {
                    [].interpolate(selectedstartrow.startrow, selectedstartrow.endrow + 1, function (x) {
                        [].interpolate(selectedstartrow.startcolumn, selectedstartrow.endcolumn + 1, function (y) {
                            me['selected' + offset + 'header'].push({
                                row: x,
                                column: y
                            });
                        })
                    });
                }
            }
            me.selecting = null;
            me.state = null;
        }
    },
    headerMouseMoveSelectHandler: function (offset, header, evt) {
        var me = this; var selecting = evt.selecting;
        if (!selecting || !selecting.end || !selecting.start) {
            return null;
        }
        me.handleHeaderMouseMoveCellSelect(offset, evt);
    },

    handleHeaderMouseMoveCellSelect: function (offset, evt) {
        var me = this;
        if (evt.selecting) {
            var info = me.getSelectedStartRow(evt.selecting);
            if (info) {
                var minCellLeftPosition = me.getCellPosition({ row: info.startrow, column: info.startcolumn }, offset);
                var maxCellLeftPosition = me.getCellPosition({ row: info.startrow, column: info.endcolumn + 1 }, offset);

                var minCellTopPosition = me.getCellPosition({ row: info.startrow, column: info.endcolumn }, offset);
                var maxCellTopPosition = me.getCellPosition({ row: info.endrow + 1, column: info.endcolumn }, offset);

                me.setHeaderActiveSelect(minCellLeftPosition.x, maxCellLeftPosition.x, minCellTopPosition.y, maxCellTopPosition.y, offset)
            }
        }
    },
    headerMouseEventHandler: function (offset, header, outevt, evt) {
        var me = this;
        var cells = me.getHeaderCells(evt);
        var pos = MEPH.util.Dom.getEventPositions(evt, header);
        header.dispatchEvent(MEPH.createEvent(outevt + offset, {
            cells: cells,
            position: pos
        }));
    },
    headerMouseMoveHandler: function (offset, header, evt) {
        var me = this;
        if (me.state === MEPH.table.SpreadSheet.states.Selecting + offset) {

            var cells = me.getHeaderCells(evt);
            var cell = cells.first()
            me.selecting.end = cell;
            header.dispatchEvent(MEPH.createEvent('mousemoveselect' + offset, {
                selecting: me.selecting
            }));
        }
    },
    headerMouseDownHandler: function (offset, header, evt) {
        var me = this;
        if (!me.state) {
            var cells = me.getHeaderCells(evt, offset);
            var cell = cells.first()

            me.selecting = {
                start: cell
            };
            document.body.classList.add('noselect');
            me.state = MEPH.table.SpreadSheet.states.Selecting + offset;
            header.dispatchEvent(MEPH.createEvent(offset + 'selectstart', {
                cell: cell
            }));
        }
    },
    appendCanvasEvents: function () {
        var me = this;
        me.don('click', [me.canvassvg, me.canvas], function (evt) {
            me.handleSingleCellCalculations(evt, 'cellclicked');
        });
        //me.don('mousemove', me.canvas, function (evt) {
        //    me.handleSingleCellCalculations(evt, 'mousemovecell');
        //});

        //me.don('mousemove', me.canvas, function (evt) {
        //});
        me.don('keypress', [me.canvassvg, me.canvas], function (evt) {
            me.onKeyPress(evt);
        });

        me.don('keypress', me.leftheader, function (evt) {
            me.onKeyPress(evt);
        });
        if (me.movemoverequest) {
            cancelAnimationFrame(me.movemoverequest)
        }
        me.don('mousemove', [me.canvassvg, me.canvas], function (evt) {
            var t = function () {
                me.handleSingleCellCalculations(evt, ['mouseovercell', 'mousemovecell']);
                if (me.state === MEPH.table.SpreadSheet.states.Selecting) {
                    var cell = me.hovercells ? me.hovercells.first() : me.getCanvasCells(evt).first()
                    me.selecting.end = cell;
                    me.canvas.dispatchEvent(MEPH.createEvent('mousemoveselect', {
                        selecting: me.selecting
                    }));
                }
            }
            if (me.animatemode) {
                me.movemoverequest = requestAnimationFrame(t);
            }
            else {
                t();
            }
        });

        me.don('mousemovecell', me.canvas, function (evt) {
            me.handleMouseMoveCell(evt);
        });

        me.don('mousemoveselect', me.canvas, function (evt) {
            var selecting = evt.selecting;
            if (!selecting || !selecting.end || !selecting.start) {
                return null;
            }
            me.handleMouseMoveCellSelect(evt);
        });

        me.don('mousedown', [me.canvassvg, me.canvas], function (evt) {
            if (me.commands && me.commands.first(function (x) { return x.command === 'select' }))
                return;
            me.select(evt);
        });

        me.don('mouseout', [me.canvassvg, me.canvas], me.onMouseupSelecting.bind(me));
        me.don('mouseup', [me.canvassvg, me.canvas], me.onMouseupSelecting.bind(me));
        var removenoselect = function () {
            document.body.classList.remove('noselect');
        }
        me.don('mouseup', document.body, removenoselect);
        me.don('mouseout', document.body, removenoselect);
    },
    getSelectedStartRow: function (selecting) {
        if (!selecting || !selecting.end || !selecting.start) {
            return null;
        }
        var startrow = Math.min(selecting.end.row, selecting.start.row);
        var endrow = Math.max(selecting.end.row, selecting.start.row);
        var startcolumn = Math.min(selecting.end.column, selecting.start.column);
        var endcolumn = Math.max(selecting.end.column, selecting.start.column);

        return {
            startrow: startrow,
            endrow: endrow,
            startcolumn: startcolumn,
            endcolumn: endcolumn
        }
    },
    onMouseupSelecting: function () {
        var me = this;
        if (me.commands && me.commands.first(function (x) { return x.command === 'select' }))
            return;
        me.endselect();
    },
    handleMouseMoveCell: function (evt) {
        var me = this;
        var minCellLeft = evt.cells.minSelect(function (x) { return x.row; });
        var maxCellLeft = evt.cells.maxSelection(function (x) { return x.row; });

        var minCellTop = evt.cells.minSelect(function (x) { return x.column });
        var maxCellTop = evt.cells.maxSelection(function (x) { return x.column; });

        var minCellLeftPosition = me.getCellPosition(minCellLeft);
        var maxCellLeftPosition = me.getCellPosition({ row: maxCellLeft.row, column: maxCellLeft.column + 1 });

        var minCellTopPosition = me.getCellPosition(minCellTop);
        var maxCellTopPosition = me.getCellPosition({ row: maxCellTop.row + 1, column: maxCellTop.column });

        me.setActiveCell(minCellLeftPosition.x, maxCellLeftPosition.x, minCellTopPosition.y, maxCellTopPosition.y);
    },
    handleMouseMoveHeaderCell: function (evt, header) {
        var me = this;
        var minCellLeft = evt.cells.minSelect(function (x) { return x.row; });
        var maxCellLeft = evt.cells.maxSelection(function (x) { return x.row; });

        var minCellTop = evt.cells.minSelect(function (x) { return x.column });
        var maxCellTop = evt.cells.maxSelection(function (x) { return x.column; });

        var minCellLeftPosition = me.getCellPosition(minCellLeft, header);
        var maxCellLeftPosition = me.getCellPosition({ row: maxCellLeft.row, column: maxCellLeft.column + 1 }, header);

        var minCellTopPosition = me.getCellPosition(minCellTop, header);
        var maxCellTopPosition = me.getCellPosition({ row: maxCellTop.row + 1, column: maxCellTop.column }, header);

        me.setActiveHeaderCell(minCellLeftPosition.x, maxCellLeftPosition.x, minCellTopPosition.y, maxCellTopPosition.y, header)
    },
    updateSelectedMouse: function () {
        var me = this;
        if (me.selectedrange) {
            me.handleMouseMoveCellSelect({ selecting: me.selectedrange });
        }
        if (me.selectedrangeleft) {

            me.handleHeaderMouseMoveCellSelect('left', { selecting: me.selectedrangeleft });
        }
        if (me.selectedrangetop) {
            me.handleHeaderMouseMoveCellSelect('top', { selecting: me.selectedrangetop });
        }
    },
    handleMouseMoveCellSelect: function (evt) {
        var me = this;
        if (evt.selecting) {
            var info = me.getSelectedStartRow(evt.selecting);
            if (info) {
                var minCellLeftPosition = me.getCellPosition({ row: info.startrow, column: info.startcolumn });
                var maxCellLeftPosition = me.getCellPosition({ row: info.startrow, column: info.endcolumn + 1 });

                var minCellTopPosition = me.getCellPosition({ row: info.startrow, column: info.endcolumn });
                var maxCellTopPosition = me.getCellPosition({ row: info.endrow + 1, column: info.endcolumn });

                me.setActiveSelect(minCellLeftPosition.x, maxCellLeftPosition.x, minCellTopPosition.y, maxCellTopPosition.y)
            }
        }
    },
    setHeaderActiveSelect: function (x1, x2, y1, y2, header) {
        var me = this,
            area = {
                x1: x1,
                x2: x2,
                y1: y1,
                y2: y2
            };
        var requestHeaderActiveSelectheader = 'requestHeaderActiveSelectArea' + header;
        if (me[requestHeaderActiveSelectheader] != null || me[requestHeaderActiveSelectheader] != undefined) {
            cancelAnimationFrame(me[requestHeaderActiveSelectheader]);
        }
        var activeareaheader = 'selectarea' + header;
        var activearea = 'selectArea' + header;

        me[requestHeaderActiveSelectheader] = requestAnimationFrame(function () {
            if (me[activeareaheader] && MEPH.equals(me[activeareaheader], area)) {
            }
            else if (arguments.length === 4) {
                me[activearea] = area;

                Style.top(me[activeareaheader], y1 + (header === 'left' ? me.getColumnHeaderHeight() : 0));
                Style.left(me[activeareaheader], x1 + (header === 'left' ? 0 : me.getRowsHeaderWidth()));
                Style.width(me[activeareaheader], x2 - x1);
                Style.height(me[activeareaheader], y2 - y1);
                me[activeareaheader].classList.add('active')
            }
            else {
                me[activeareaheader].classList.remove('active')
            }
            me['requestHeaderActiveSelect' + header] = null;
        }.bind(x1, x2, y1, y2))
    },
    setActiveHeaderCell: function (x1, x2, y1, y2, header) {
        var me = this,
            area = {
                x1: x1,
                x2: x2,
                y1: y1,
                y2: y2
            };
        var requestHeaderActiveSelectheader = 'requestHeaderActiveSelect' + header;
        if (me[requestHeaderActiveSelectheader] != null || me[requestHeaderActiveSelectheader] != undefined) {
            cancelAnimationFrame(me[requestHeaderActiveSelectheader]);
        }
        var activeareaheader = 'activearea' + header;
        var activearea = 'activeArea' + header;

        me[requestHeaderActiveSelectheader] = requestAnimationFrame(function () {
            if (me[activeareaheader] && MEPH.equals(me[activeareaheader], area)) {
            }
            else if (arguments.length === 4) {
                me[activearea] = area;

                Style.top(me[activeareaheader], y1 + (header === 'left' ? me.getColumnHeaderHeight() : 0));
                Style.left(me[activeareaheader], x1 + (header === 'left' ? 0 : me.getRowsHeaderWidth()));
                Style.width(me[activeareaheader], x2 - x1);
                Style.height(me[activeareaheader], y2 - y1);
                me[activeareaheader].classList.add('active')
            }
            else {
                me[activeareaheader].classList.remove('active')
            }
            me['requestHeaderActiveSelect' + header] = null;
        }.bind(x1, x2, y1, y2))
    },
    setActiveSelect: function (x1, x2, y1, y2) {
        var me = this,
            area = {
                x1: x1,
                x2: x2,
                y1: y1,
                y2: y2
            };
        if (me.requestActiveSelect != null) {
            cancelAnimationFrame(me.requestActiveSelect);
        }
        me.requestActiveSelect = requestAnimationFrame(function () {
            if (me.selectArea && MEPH.equals(me.selectArea, area)) {
            }
            else if (arguments.length === 4) {
                me.selectArea = area;

                Style.top(me.selectarea, y1 + me.getColumnHeaderHeight());
                Style.left(me.selectarea, x1 + me.getRowsHeaderWidth());
                Style.width(me.selectarea, x2 - x1);
                Style.height(me.selectarea, y2 - y1);
                me.selectarea.classList.add('active')
            }
            else {
                me.selectarea.classList.remove('active')
            }
            me.requestActiveSelect = null;
        }.bind(x1, x2, y1, y2))
    },
    setActiveCell: function (x1, x2, y1, y2) {
        var me = this, area = {
            x1: x1,
            x2: x2,
            y1: y1,
            y2: y2
        };

        if (me.requestActiveCell) {
            cancelAnimationFrame(me.requestActiveCell);
        }

        me.requestActiveCell = requestAnimationFrame(function () {
            if (me.activeArea && MEPH.equals(me.activeArea, area)) {
            } else if (arguments.length === 4) {
                me.activeArea = area;

                Style.top(me.activearea, y1 + me.getColumnHeaderHeight());
                Style.left(me.activearea, x1 + me.getRowsHeaderWidth());
                Style.width(me.activearea, x2 - x1);
                Style.height(me.activearea, y2 - y1);
                me.activearea.classList.add('active')
            }
            else {
                me.activearea.classList.remove('active')
            }
            me.requestActiveCell = null;
        }.bind(x1, x2, y1, y2))
    },
    handleSingleHeaderCellCalculations: function (canvas, evt, outevnt, offset) {
        var me = this;
        var cells = me.getHeaderCells(evt, offset);
        canvas.dispatchEvent(MEPH.createEvent(outevnt, {
            cells: cells,
            offset: offset
        }));
    },
    handleSingleCellCalculations: function (evt, outevnt) {
        var me = this;
        var cells = me.getCanvasCells(evt);
        me.hovercells = cells || me.hovercells;

        var pos = MEPH.util.Dom.getEventPositions(evt, me.canvas);
        outevnt = Array.isArray(outevnt) ? outevnt : [outevnt];
        pos = pos.first();
        outevnt.foreach(function (outevnt) {
            me.canvas.dispatchEvent(MEPH.createEvent(outevnt, {
                cells: cells,
                position: pos
            }));
        })

    },
    getHeaderCells: function (evt, offsets) {
        var me = this;
        var canvasPos = MEPH.util.Dom.getPosition(offsets === 'left' ? me.leftheader : me.topheader);
        var pos = MEPH.util.Dom.getEventPositions(evt, offsets === 'left' ? me.leftheader : me.topheader);
        var cells = me.calculateHeaderCells(pos, {
            x: 0,// me.getRowsHeaderWidth(),
            y: 0//me.getColumnHeaderHeight()
        }, offsets);
        return cells;
    },
    getCanvasCells: function (evt) {
        var me = this;
        var canvasPos = MEPH.util.Dom.getPosition(me.canvas);
        var pos = MEPH.util.Dom.getEventPositions(evt, me.canvas);
        var cells = me.calculateCells(pos, {
            x: 0,
            y: 0
        });
        return cells;
    },
    getCellPosition: function (cell, offset) {
        var me = this;
        var t = 0;
        var u = 0;
        t = me.getCellRowPosition(cell, offset);

        u = me.getCellColumnPosition(cell, offset);

        return {
            x: u,
            y: t
        }
    },
    getCellColumnPx: function (cell, offset) {
        var me = this;
        return me.getCellColumnPosition({ column: cell.column }, offset);
    },
    getCellColumnPosition: function (cell, offset) {
        var me = this,
            u = 0;
        if (offset == 'left') {
            me.columnHeaderOffsets.subset(me.startLeftColumn, cell.column).first(function (x) {
                u += x;
            });
        }
        else {
            if (me.columnPositions)
                return me.columnPositions[cell.column] - me.columnPositions[me.startColumn];
            me.columnOffsets.subset(me.startColumn, cell.column).first(function (x) {
                u += x;
            });
        }
        return u;
    },
    getCellRowPx: function (cell, offset) {
        var me = this;
        return me.getCellRowPosition({ row: cell.row }, offset);
    },
    getCellRowPosition: function (cell, offset) {
        var me = this;
        var t = 0;
        if (offset == 'top') {
            me.rowHeaderOffsets.subset(me.startTopRow, cell.row).first(function (x) {
                t += x;
            });
        }
        else {
            if (me.rowPositions)
                return me.rowPositions[cell.row] - me.rowPositions[me.startRow];
            me.rowOffsets.subset(me.startRow, cell.row).first(function (x) {
                t += x;
            });
        }
        return t;
    },
    getColumnWidth: function (col) {
        var me = this;
        return me.columnOffsets[col];
    },
    getRowHeight: function (row) {
        var me = this;
        return me.rowOffsets[row];
    },
    getColumnHeaderHeight: function () {
        var me = this;
        me.cache.columnHeaderHeight = me.cache.columnHeaderHeight || me.rowHeaderOffsets.summation(function (x, t) {
            return t += x;
        });
        return me.cache.columnHeaderHeight;
    },
    getRowsHeaderWidth: function () {
        var me = this;
        me.cache.rowHeaderWidth = me.cache.rowHeaderWidth || me.columnHeaderOffsets.summation(function (x, t) {
            return t += x;
        });
        return me.cache.rowHeaderWidth;
    },
    calculateHeaderCells: function (positions, relativePos, offset) {
        var me = this;
        var cells = positions.select(function (pos) {
            return {
                row: me.getRelativeRow(pos.y - relativePos.y, offset),
                column: me.getRelativeColum(pos.x - relativePos.x, offset),
            }
        });
        return cells;
    },
    calculateCells: function (positions, relativePos) {
        var me = this;
        var cells = positions.select(function (pos) {
            return {
                row: me.getRelativeRow(pos.y - relativePos.y),
                column: me.getRelativeColum(pos.x - relativePos.x),
            }
        });
        return cells;
    },
    setStartRow: function (percentage) {
        if (!isNaN(percentage)) {
            var me = this;
            me.startRow = me.setStart(percentage, me.rowOffsets, me.calculateVertical());
        }
    },
    setStart: function (percentage, offsets, vs) {
        if (!isNaN(percentage)) {
            var me = this;
            var voffset = vs * percentage;;
            var t = 0;
            var index = 0;
            offsets.first(function (x, i) {
                t += x;
                index = i;
                return t > voffset;
            });
            return index;
        }
    },
    setStartColumn: function (percentage) {
        if (!isNaN(percentage)) {
            var me = this;
            me.startColumn = me.setStart(percentage, me.columnOffsets, me.calculateHorizontal());
        }
    },
    getRelativeRow: function (relativeX, offset) {
        var me = this,
            startrow = me.startRow,
            offsets = me.rowPositions;
        switch (offset) {
            case 'top':
                offsets = me.rowHeaderPositions;
                break;
        }
        var visi = me.qvisible(relativeX, startrow, offsets, null, me.defaultRowHeight);

        return visi + me.startRow;
    },
    /**
     * Gets the column index, based on the relative distance.
     * @param {Number} relativeY
     * @param {String} offset
     * @return {Number}
     ***/
    getRelativeColum: function (relativeY, offset) {
        var me = this, columnwidth = me.defaultColumnWidth,
           offsets = me.columnPositions;
        switch (offset) {
            case 'left':
                columnwidth = me.defaultHeaderColumnWidth;
                offsets = me.columnHeaderPositions;
                break;
        }
        var visi = me.qvisible(relativeY, me.startColumn, offsets, null, columnwidth);

        return visi + me.startColumn;
    },
    calculateVertical: function () {
        var me = this;
        me.verticalSize = me.verticalSize || me.rowOffsets.summation(function (x, t) { return t += x; });
        return me.verticalSize;
    },
    calculateHorizontal: function () {
        var me = this;
        me.horizontalSize = me.horizontalSize || me.columnOffsets.summation(function (x, t) { return t += x; });
        return me.horizontalSize;
    },
    update: function () {
        var me = this;
        me.render();
        me.updateSelectedMouse();
        me.updateCells();
    },
    updateCells: function () {
        var me = this;
        if (!me.loaded) {
            return;
        }
        if (me.updateCellsAnimFrame !== null && me.updateCellsAnimFrame !== undefined) {
            cancelAnimationFrame(me.updateCellsAnimFrame);
        }
        me.updateCellsAnimFrame = requestAnimationFrame(function () {
            var headerInstructions = me.getTopHeaderInstructions(me.visibletopheader);
            if (headerInstructions) {
                me.topContentRenderer.clear();
                me.topContentRenderer.draw(headerInstructions);
            };
            headerInstructions = me.getLeftHeaderInstructions(me.visibleleftheader);
            if (headerInstructions) {
                me.leftContentRenderer.clear();
                me.leftContentRenderer.draw(headerInstructions);
            }
            headerInstructions = me.getMainContentInstructions(me.visiblegrid);
            if (headerInstructions) {
                if (me.enablesvg) {
                    me.svgrenderer.clear();
                    var res = me.svgrenderer.draw(headerInstructions);
                    res.foreach(function (item) {
                        me.dun(item.shape);
                        me.don('mouseover', item.shape, function (item) {
                            me.dispatchEvent('mouseoveritem', {
                                items: [item.options.relObj], header: null
                            }, me.canvas)
                        }.bind(me, item), item.shape);
                        //me.dispatchEvent('mouseoveritem', {
                        //    items: items, header: header
                        //}, canvas)
                    })
                }
                else {
                    me.rendererContent.clear();
                    me.rendererContent.draw(headerInstructions);
                }
            }
            me.updateCellsAnimFrame = null;
        });
    },
    drawContent: function (singleinstruction) {
        var me = this, headerInstructions;
        headerInstructions = me.getMainContentInstructions(me.visiblegrid) || [];
        if (me.enablesvg) {
            me.svgrenderer.clear();
            var res = me.svgrenderer.draw(headerInstructions);
            res.foreach(function (item) {
                me.dun(item.shape);
                me.don('mouseover', item.shape, function (item) {
                    me.dispatchEvent('mouseoveritem', {
                        items: [item.options.relObj], header: null
                    }, me.canvas)
                }.bind(me, item), item.shape);
            })
        }
        else {
            me.rendererContent.clear();
            me.rendererContent.draw(singleinstruction);
        }
    },
    getTopHeaderInstructions: function (visibleCellData) {
    },
    getLeftHeaderInstructions: function (visibleCellData) {
    },
    getMainContentInstructions: function (visibleCellData) {
    },
    render: function () {
        var me = this;
        if (!me.rowOffsets || !me.columnOffsets)
            return;
        if (me.animFrame !== null) {
            cancelAnimationFrame(me.animFrame);
        }
        me.animFrame = requestAnimationFrame(function () {
            var rows, columns, headers;

            if (!me.rendered) {
                me.renderer.setCanvas(me.canvas);
                me.leftRenderer.setCanvas(me.leftheader);
                me.topRenderer.setCanvas(me.topheader);
            }
            if (!me.body) return;
            me.lastCanvasSize = me.lastCanvasSize || {};
            var canvasheight = me.body.clientHeight;
            var canvaswidth = me.body.clientWidth;
            var leftcanvasWidth = me.getLeftCanvasWidth();
            var topcanvasHeight = me.getTopCanvasHeight();
            canvasheight -= topcanvasHeight;
            canvaswidth -= leftcanvasWidth;
            me.calculateVertical();
            me.calculateHorizontal();

            if (me.lastCanvasSize.height === canvasheight && me.lastCanvasSize.width === canvaswidth) {

            }
            else {

                me.positionCanvas(me.canvas, leftcanvasWidth, topcanvasHeight, canvaswidth, canvasheight);
                me.positionCanvas(me.canvascontent, leftcanvasWidth, topcanvasHeight, canvaswidth, canvasheight);
                me.positionCanvas(me.canvassvg, leftcanvasWidth, topcanvasHeight, canvaswidth, canvasheight);

                me.positionCanvas(me.leftheader, 0, topcanvasHeight, leftcanvasWidth, canvasheight);
                me.positionCanvas(me.leftheadercontent, 0, topcanvasHeight, leftcanvasWidth, canvasheight);

                me.positionCanvas(me.topheader, leftcanvasWidth, 0, canvaswidth, topcanvasHeight);
                me.positionCanvas(me.topheadercontent, leftcanvasWidth, 0, canvaswidth, topcanvasHeight);


                me.renderer.clear();
            }
            //row = me.height;
            //columns = me.width;
            //columnheaders = me.columnheaders;
            //rowheaders = me.rowheaders;
            var canceldraw = me.lastCanvasSize.height === canvasheight && me.lastCanvasSize.width === canvaswidth;
            me.drawGrid(canvasheight, canvaswidth, canceldraw);
            me.drawTopGrid(topcanvasHeight, canvaswidth, canceldraw);
            me.drawLeftGrid(canvasheight, leftcanvasWidth, canceldraw);
            me.lastCanvasSize = {
                height: canvasheight,
                width: canvaswidth
            }
            me.animFrame = null;
        });
    },
    positionCanvas: function (canvas, left, top, width, height) {
        Style.left(canvas, left);
        Style.top(canvas, top);
        Style.width(canvas, width);
        Style.height(canvas, height);
    },
    getLeftCanvasWidth: function () {
        var me = this;
        me.cache.leftcanvaswidth = me.cache.leftcanvaswidth || (me.columnHeaderOffsets ? me.columnHeaderOffsets.summation(function (i, total) {
            return total += i;
        }) : 0);
        return me.cache.leftcanvaswidth;
    },
    getTopCanvasHeight: function () {
        var me = this;
        me.cache.topcanvasheight = me.cache.topcanvasheight || (me.rowHeaderOffsets ? me.rowHeaderOffsets.summation(function (i, total) {
            return total += i;
        }) : 0);
        return me.cache.topcanvasheight;
    },
    drawTopGrid: function (height, width, canceldraw) {
        var me = this;
        me.visibletopheader = me.drawSubGrid(me.topheader, me.rowHeaderOffsets, me.columnOffsets, height, width, me.topRenderer, me.startTopRow, me.startColumn, canceldraw);
    },
    drawLeftGrid: function (height, width, canceldraw) {
        var me = this;
        me.visibleleftheader = me.drawSubGrid(me.leftheader, me.rowOffsets, me.columnHeaderOffsets, height, width, me.leftRenderer, me.startRow, me.startLeftColumn, canceldraw);
    },
    drawGrid: function (height, width, canceldraw) {
        var me = this;
        me.visiblegrid = me.drawSubGrid(me.canvas, me.rowOffsets, me.columnOffsets, height, width, me.renderer, me.startRow, me.startColumn, canceldraw);
    },
    rowDrawInstruction: function (row, width) {
        var me = this;
        return {
            shape: MEPH.util.Renderer.shapes.line,
            end: {
                x: width,
                y: row
            },
            start: {
                x: 0,
                y: row
            },
            strokeStyle: me.gridlinecolor
        }
    },
    columnDrawInstruction: function (col, height) {
        var me = this;
        return {
            shape: MEPH.util.Renderer.shapes.line,
            end: {
                x: col,
                y: height
            },
            start: {
                x: col,
                y: 0
            },
            strokeStyle: me.gridlinecolor
        };
    },
    drawSubGrid: function (canvas, rowOffsets, columnOffsets, height, width, renderer, startRow, startColumn, canceldraw) {
        var me = this;
        var row = 0;
        var rowDrawFunc = function (rowOffset) {
            var res = me.rowDrawInstruction(row, width);
            row += rowOffset;
            return res;
        };
        var col = 0;
        var colDrawFunc = function (columnOffset) {
            var res = me.columnDrawInstruction(col, height);
            col += columnOffset;
            return res;
        };
        var visRows = me.visibleRows(height, startRow)
        var drawInstructions = rowOffsets.subset(startRow, startRow + visRows + 1).select(rowDrawFunc).where();

        if (rowOffsets.length < startRow + visRows && !canceldraw) {
            drawInstructions = drawInstructions.concat([].interpolate(0, startRow + visRows - rowOffsets.length, function (x) {
                return me.defaultRowHeight;
            }).select(rowDrawFunc).where());
        }

        var visCols = me.visibleColumns(width, startColumn);
        if (!canceldraw) {
            drawInstructions = drawInstructions.concat(columnOffsets.subset(startColumn, startColumn + visCols + 1).select(colDrawFunc).where());
        }
        if (columnOffsets.length < startColumn + visCols && !canceldraw) {
            drawInstructions = drawInstructions.concat([].interpolate(0, startColumn + visCols - columnOffsets.length, function (x) {
                return me.defaultColumnWidth;
            }).select(colDrawFunc).where());
        }
        if (!canceldraw) {
            Style.height(canvas, height)
            Style.width(canvas, width);
            renderer.draw(drawInstructions);
        }
        return {
            visibleColumns: visCols,
            visibleRows: visRows,
            row: startRow,
            column: startColumn
        }
    },
    /**
     * Gets the number of visible columns.
     * @param {Number} width
     * @param {Number} start
     ****/
    visibleColumns: function (width, start) {
        var me = this;
        return me.qvisible(width, start, me.columnPositions, null, me.defaultColumnWidth);
    },
    /**
     * Gets the number of visible rows.
     * @param {Number} height
     * @param {Number} start
     ****/
    visibleRows: function (height, start) {
        var me = this;
        return me.qvisible(height, start, me.rowPositions, null, me.defaultRowHeight);
    },
    /**
     * Gets the number of visible parts from a set of offsets.
     * @param {Number} width
     * @param {Number} start
     * @param {Array} offsets
     * @param {Number} defaultWidth
     ***/
    //visible: function (width, start, offsets, defaultWidth) {
    //    var me = this;
    //    var columns = 0;
    //    var total = 0;
    //    var res = offsets.subset(start).first(function (x) {
    //        if (total + x < width) {
    //            columns++;
    //            total += x;
    //            return false;
    //        }
    //        return true;
    //    });

    //    if (total + defaultWidth < width) {
    //        columns += Math.ceil((width - total) / defaultWidth);
    //    }

    //    return columns;
    //},
    qvisible: function (width, start, offsets, end, defaultWidth, count, cstart) {
        var me = this, result;
        count = count || 0;
        cstart = cstart || start;

        end = end || (offsets.length - 1);
        var mid = Math.floor((end - cstart) / 2) + cstart;
        var tempWidth = offsets[mid] - offsets[start];
        if (count > 20) {
            debugger;
        }

        if ((Math.abs(end - cstart) <= 1)) {
            result = mid - start;
        }
        else if (tempWidth > width) {
            result = me.qvisible(width, start, offsets, mid, defaultWidth, count, cstart);
        }
        else {
            result = me.qvisible(width, start, offsets, end, defaultWidth, count, mid);
        }
        return result;
    },
    /**
     * Handles key presses.
     * @param {Object} evt
     **/
    onKeyPress: function (evt) {
        var me = this,
          key = MEPH.util.Dom.getCharCode(evt);
        if (me.commands) {
            var command = me.commands.first(function (x) {
                return x.key.toLowerCase() === String.fromCharCode(key).toLowerCase();
            });
            if (command) {
                switch (command.command) {
                    case 'select':
                        me.state === MEPH.table.SpreadSheet.states.Selecting ? me.endselect() : me.select();
                        break;
                    default:
                        if (command['function']) {
                            command['function'](evt);
                        }
                        break;
                }
            }
        }
    },
    select: function (evt) {
        var me = this;
        if (!me.state) {
            var cell = me.hovercells ? me.hovercells.first() || me.getCanvasCells(evt).first() : me.getCanvasCells(evt).first();
            me.selecting = {
                start: cell
            };
            document.body.classList.add('noselect');
            me.state = MEPH.table.SpreadSheet.states.Selecting;
            me.canvas.dispatchEvent(MEPH.createEvent('selectstart', {
                cell: cell
            }));
        }
    },
    endselect: function () {
        var me = this;
        if (me.state === MEPH.table.SpreadSheet.states.Selecting) {
            var selectedstartrow = me.getSelectedStartRow(me.selecting);
            me.selectedrange = MEPH.clone(me.selecting);
            if (me.selected) {
                me.selected.clear();
                if (selectedstartrow) {
                    [].interpolate(selectedstartrow.startrow, selectedstartrow.endrow + 1, function (x) {
                        [].interpolate(selectedstartrow.startcolumn, selectedstartrow.endcolumn + 1, function (y) {
                            me.selected.push({
                                row: x,
                                column: y
                            });
                        })
                    });
                }
            }
            me.selecting = null;
            me.state = null;
        }
    }
});