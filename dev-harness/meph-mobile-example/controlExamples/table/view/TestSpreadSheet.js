/**
 * @class MEPH.table.SpreadSheet
 * @extends MEPH.control.Control
 * A infinitely scrolling Scrollbar.
 **/
MEPH.define('MEPHControls.table.view.TestSpreadSheet', {
    alias: 'testspreadsheet',
    templates: false,
    extend: 'MEPH.table.SpreadSheet',

    getMainContentInstructions: function (visibleCellData) {
        var me = this;
        var res = [].interpolate(visibleCellData.column, visibleCellData.visibleColumns + visibleCellData.column, function (x) {
            var end = visibleCellData.row + visibleCellData.visibleRows;
            return [].interpolate(visibleCellData.row, end, function (y) {
                var pos = me.getCellPosition({ row: y, column: x });
                var instruction = {
                    font: "12pt Arial",
                    textAlign: 'left',
                    x: pos.x + 3,
                    shape: MEPH.util.Renderer.shapes.text,
                    text: 'x: ' + x + ', y:' + y,
                    y: pos.y + (me.rowOffsets[y] / 2),
                    height: me.rowOffsets[y],
                    width: me.columnOffsets[x],
                    maxWidth: me.columnOffsets[x]
                };
                return instruction;
            });
        }).concatFluent(function (x) { return x; });
        return res;
    },
});