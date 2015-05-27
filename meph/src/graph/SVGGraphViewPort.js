/**
* @class MEPH.graph.GraphViewPort
*/
MEPH.define('MEPH.graph.SVGGraphViewPort', {
    requires: ['MEPH.math.J3DIVector3',
                'MEPH.graph.ActiveZone',
                'MEPH.util.Style'],
    extend: 'MEPH.graph.GraphViewPort',
    properties: {
        maskDownZIndex: 1
    },
    createZoneDom: function (options, graphnode) {
        return options.dom;
    },

    setup: function (selector, options) {
        var me = this;
        var target = document.querySelector(selector);
        var dock = document.createElement('div');
        var canvas = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
        var newElement = document.createElementNS("http://www.w3.org/2000/svg", 'g'); //Create a path in SVG's namespace
        canvas.appendChild(newElement);
        me.setGCanvas(newElement);
        canvas.style.position = 'absolute';
        canvas.style.zIndex = 3;
        options = options || { height: 400, width: 450 };
        target.appendChild(dock);
        dock.appendChild(canvas);
        me.setCanvas(canvas);
        me.setCanvasSize({ height: options.height, width: options.width });
        me.setDock(dock);
        me.applyMask(dock);
    },
    onClick: function (ee) {
        // handle directly with the mouse click on svg path;
    },
    hoverConnection: function () {
        // handled directly with mouse over on svg path.
    },
    applyMask: function (target) {
        var me = this,
            svg = me.getCanvas();

        svg.addEventListener('mousedown', me.onMaskMouseDown.bind(me));
        svg.addEventListener('mousemove', me.onSVGMaskMouseMove.bind(me));
        me.great();
        //me.$mask.addEventListener('mouseup', me.onMaskMouseUp.bind(me));
        //me.$mask.addEventListener('mouseout', me.onMaskMouseOut.bind(me));
        //me.$mask.addEventListener('dblclick', me.onDblClick.bind(me));
        //me.$mask.addEventListener('click', me.onClick.bind(me));

    },
    onSVGMaskMouseMove: function (ee) {
        var me = this;

        me.calculateMousePosition(ee);
        if (me.getCanvas() === ee.srcElement) {
            if (!(me.isDragging || me.isDraggingNode || me.connectionFlow)) {

                me.fire('mousemove', ee);
            }
            else if (me.connectionFlow) {
                me.fire('viewportconnectionflow', ee);
            }
        }
    },
    onMaskMouseDown: function (ee) {
        if (this.getCanvas() === ee.srcElement) {
            var me = this;
            me.great();
        }
    },
    getGCanvas: function () {
        var me = this;
        return me.gcanvas;
    },

    setGCanvas: function (g) {
        var me = this;
        me.gcanvas = g;
    }
})